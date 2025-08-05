
import React, { useState } from 'react';
import { Sale } from '@/types/database';
import { SaleForm } from '@/components/sales/SaleForm';
import { SalesHeader } from '@/components/sales/SalesHeader';
import { SalesList } from '@/components/sales/SalesList';
import DiscreetPlanInfo from '@/components/common/DiscreetPlanInfo';
import { useSales } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';

export const Sales: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const { toast } = useToast();

  const {
    products,
    recipes,
    loading,
    searchTerm,
    setSearchTerm,
    filteredAllowedSales,
    filteredBlockedSales,
    todaySalesCount,
    createSale,
    updateSale,
    deleteSale
  } = useSales();

  const handleCreateSale = () => {
    console.log('Creating new sale');
    setEditingSale(null);  // Ensure we're in "create" mode
    setIsFormOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    // Check if sale is in the blocked list
    const isBlocked = filteredBlockedSales.some(s => s.id === sale.id);
    
    if (isBlocked) {
      toast({
        title: "Venda bloqueada",
        description: "Esta venda está bloqueada pelo seu plano atual. Faça upgrade para acessar.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Editing sale:', sale);
    setEditingSale(sale);  // Set the sale to be edited
    setIsFormOpen(true);   // Open the same form
  };

  const handleDeleteSale = async (sale: Sale) => {
    // Check if sale is in the blocked list
    const isBlocked = filteredBlockedSales.some(s => s.id === sale.id);
    
    if (isBlocked) {
      toast({
        title: "Venda bloqueada",
        description: "Esta venda está bloqueada pelo seu plano atual. Faça upgrade para acessar.",
        variant: "destructive"
      });
      return;
    }

    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      await deleteSale(sale.id);
    }
  };

  const handleSaleSubmit = async (saleData: Partial<Sale>, items: any[] = []) => {
    console.log('Submitting sale:', { editingSale, saleData, items });
    
    let success = false;
    
    if (editingSale && editingSale.id) {
      // Update existing sale
      console.log('Updating existing sale with ID:', editingSale.id);
      success = await updateSale(editingSale.id, saleData, items);
    } else {
      // Create new sale
      console.log('Creating new sale');
      success = await createSale(saleData, items);
    }

    if (success) {
      console.log('Sale operation successful, closing form');
      setIsFormOpen(false);
      setEditingSale(null);
    } else {
      console.log('Sale operation failed');
    }
  };

  const handleCloseForm = () => {
    console.log('Closing form');
    setIsFormOpen(false);
    setEditingSale(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SalesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateSale={handleCreateSale}
      />

      {/* Discreet Plan Info */}
      <DiscreetPlanInfo type="sales" currentCount={todaySalesCount} />

      {/* Sales List */}
      <SalesList
        allowedSales={filteredAllowedSales}
        blockedSales={filteredBlockedSales}
        onEdit={handleEditSale}
        onDelete={handleDeleteSale}
        onCreateSale={handleCreateSale}
      />

      {/* Sale Form Modal - Same form for both create and edit */}
      {isFormOpen && (
        <SaleForm
          sale={editingSale}  // null for create, sale object for edit
          products={products}
          recipes={recipes}
          onSubmit={handleSaleSubmit}  // Same submit handler for both
          onClose={handleCloseForm}    // Same close handler for both
        />
      )}
    </div>
  );
};
