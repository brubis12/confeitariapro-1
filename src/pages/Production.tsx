
import React, { useState } from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { useProduction } from '@/hooks/useProduction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Factory, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Users,
  Crown
} from 'lucide-react';

const Production: React.FC = () => {
  const { canUseFeature } = usePlan();
  const { productionOrders, loading, createProductionOrder, updateStatus } = useProduction();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    custom_product_name: '',
    quantity: '',
    start_date: '',
    expected_end_date: '',
    responsible: '',
    priority: 'media',
    notes: ''
  });
  
  const canAccess = canUseFeature('has_production_center');

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Centro de Produção</h1>
          <p className="text-gray-600 mb-6">
            Este recurso está disponível apenas para usuários Premium.
          </p>
          <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600">
            <Crown className="h-4 w-4 mr-2" />
            Fazer Upgrade
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProductionOrder({
        product_id: null,
        recipe_id: null,
        custom_product_name: formData.custom_product_name,
        quantity: parseInt(formData.quantity),
        status: 'agendado',
        priority: formData.priority as 'baixa' | 'media' | 'alta',
        responsible: formData.responsible,
        start_date: formData.start_date,
        expected_end_date: formData.expected_end_date,
        actual_end_date: null,
        notes: formData.notes
      });

      toast({
        title: "Ordem criada!",
        description: "Ordem de produção criada com sucesso.",
      });

      setShowForm(false);
      setFormData({
        custom_product_name: '',
        quantity: '',
        start_date: '',
        expected_end_date: '',
        responsible: '',
        priority: 'media',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a ordem de produção.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'agendado':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return <Clock className="h-4 w-4" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      case 'agendado':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Produção</h1>
          <p className="text-gray-600">Gerencie ordens de produção e acompanhe o progresso</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      {/* Form para nova ordem */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Ordem de Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product">Produto</Label>
                  <Input 
                    id="product" 
                    value={formData.custom_product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_product_name: e.target.value }))}
                    placeholder="Nome do produto" 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="0" 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input 
                    id="startDate" 
                    type="datetime-local" 
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">Data Prevista</Label>
                  <Input 
                    id="endDate" 
                    type="datetime-local" 
                    value={formData.expected_end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_end_date: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="responsible">Responsável</Label>
                  <Input 
                    id="responsible" 
                    value={formData.responsible}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                    placeholder="Nome do responsável" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes" 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações adicionais..." 
                />
              </div>
              
              <div className="mt-6 flex space-x-2">
                <Button type="submit">Criar Ordem</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de ordens */}
      <div className="grid grid-cols-1 gap-4">
        {productionOrders.map((production) => (
          <Card key={production.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Factory className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-lg">{production.custom_product_name}</h3>
                    <Badge className={getStatusColor(production.status)}>
                      {getStatusIcon(production.status)}
                      <span className="ml-1 capitalize">{production.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Quantidade:</span> {production.quantity} unidades
                    </div>
                    <div>
                      <span className="font-medium">Início:</span> {new Date(production.start_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Previsão:</span> {new Date(production.expected_end_date).toLocaleDateString()}
                    </div>
                    {production.responsible && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="font-medium">Responsável:</span> {production.responsible}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {production.status !== 'concluido' && production.status !== 'cancelado' && (
                    <Select 
                      value={production.status} 
                      onValueChange={(value) => updateStatus(production.id, value as any)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {productionOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Factory className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma ordem de produção encontrada</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira ordem
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Production;
