
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Edit, Trash2, Lock, Eye, Calendar, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Sale, SaleItem } from '@/types/database';
import { SaleDetailsModal } from './SaleDetailsModal';
import { SaleCard } from './SaleCard';
import { supabase } from '@/integrations/supabase/client';

interface SalesListProps {
  allowedSales: Sale[];
  blockedSales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  onCreateSale: () => void;
}

export const SalesList: React.FC<SalesListProps> = ({
  allowedSales,
  blockedSales,
  onEdit,
  onDelete,
  onCreateSale
}) => {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Separar vendas de hoje das vendas dos dias anteriores
  const today = new Date().toISOString().split('T')[0];
  
  const todayAllowedSales = allowedSales.filter(sale => 
    sale.sale_date.startsWith(today)
  );
  const pastAllowedSales = allowedSales.filter(sale => 
    !sale.sale_date.startsWith(today)
  );

  const todayBlockedSales = blockedSales.filter(sale => 
    sale.sale_date.startsWith(today)
  );
  const pastBlockedSales = blockedSales.filter(sale => 
    !sale.sale_date.startsWith(today)
  );

  const handleDeleteClick = (sale: Sale) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      onDelete(sale);
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedSale(null);
  };

  if (allowedSales.length === 0 && blockedSales.length === 0) {
    return (
      <>
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma venda encontrada"
          description="Comece registrando sua primeira venda para acompanhar seu negócio"
          actionLabel="Registrar Venda"
          onAction={onCreateSale}
        />
        <SaleDetailsModal
          sale={selectedSale}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      {/* Vendas de Hoje */}
      {(todayAllowedSales.length > 0 || todayBlockedSales.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Vendas de Hoje</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {todayAllowedSales.length + todayBlockedSales.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayAllowedSales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
            {todayBlockedSales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={handleViewDetails}
                isBlocked={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vendas dos Dias Anteriores */}
      {(pastAllowedSales.length > 0 || pastBlockedSales.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">Vendas dos Dias Anteriores</h2>
            <Badge variant="outline" className="text-gray-600 border-gray-300">
              {pastAllowedSales.length + pastBlockedSales.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastAllowedSales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
            {pastBlockedSales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={handleViewDetails}
                isBlocked={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sale Details Modal */}
      <SaleDetailsModal
        sale={selectedSale}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
};
