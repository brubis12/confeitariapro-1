
import React from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SalesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateSale: () => void;
}

export const SalesHeader: React.FC<SalesHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onCreateSale
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">
            Registre e acompanhe suas vendas diárias
          </p>
        </div>
        <Button onClick={onCreateSale} className="bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por cliente, produto, data ou forma de pagamento..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </>
  );
};
