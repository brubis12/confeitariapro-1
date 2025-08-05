import React, { useState } from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Star, 
  Gift, 
  TrendingUp, 
  Plus, 
  Crown,
  Award,
  Heart,
  Zap
} from 'lucide-react';

const Loyalty: React.FC = () => {
  const { canUseFeature } = usePlan();
  const { customers, loading: customersLoading } = useCustomers();
  const { rewards, createReward, loading: rewardsLoading } = useLoyalty();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: '',
    category: 'desconto',
    discount_percentage: '',
    discount_value: ''
  });
  
  const canAccess = canUseFeature('has_loyalty_system');

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Fidelidade</h1>
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
      await createReward({
        name: formData.name,
        description: formData.description,
        points_required: parseInt(formData.points_required),
        category: formData.category as 'desconto' | 'produto' | 'servico',
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
        discount_value: formData.discount_value ? parseFloat(formData.discount_value) : null,
        product_id: null,
        expiration_days: null,
        usage_limit: null
      });

      toast({
        title: "Recompensa criada!",
        description: "Nova recompensa adicionada ao sistema.",
      });

      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        points_required: '',
        category: 'desconto',
        discount_percentage: '',
        discount_value: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a recompensa.",
        variant: "destructive",
      });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ouro':
        return 'bg-yellow-100 text-yellow-800';
      case 'prata':
        return 'bg-gray-100 text-gray-800';
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      case 'diamante':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ouro':
      case 'diamante':
        return <Award className="h-4 w-4" />;
      case 'prata':
        return <Star className="h-4 w-4" />;
      case 'bronze':
        return <Heart className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((sum, customer) => sum + customer.total_points, 0);
  const totalSpent = customers.reduce((sum, customer) => sum + Number(customer.total_spent), 0);

  if (customersLoading || rewardsLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Fidelidade</h1>
          <p className="text-gray-600">Gerencie pontos e recompensas dos seus clientes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Recompensa
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pontos Distribuídos</p>
                <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Recompensas</p>
                <p className="text-2xl font-bold">{rewards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="text-2xl font-bold">R$ {totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form para nova recompensa */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Recompensa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rewardName">Nome da Recompensa</Label>
                  <Input 
                    id="rewardName" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Desconto 10%" 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="points">Pontos Necessários</Label>
                  <Input 
                    id="points" 
                    type="number" 
                    value={formData.points_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, points_required: e.target.value }))}
                    placeholder="100" 
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desconto">Desconto</SelectItem>
                      <SelectItem value="produto">Produto</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.category === 'desconto' && (
                  <div>
                    <Label htmlFor="discount">Desconto (%)</Label>
                    <Input 
                      id="discount" 
                      type="number" 
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                      placeholder="10" 
                      max="100"
                      min="0"
                    />
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input 
                    id="description" 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da recompensa" 
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex space-x-2">
                <Button type="submit">Criar Recompensa</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Fidelizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge className={getTierColor(customer.tier)}>
                        {getTierIcon(customer.tier)}
                        <span className="ml-1 capitalize">{customer.tier}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{customer.total_points} pontos</span>
                    </div>
                  </div>
                </div>
              ))}

              {customers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum cliente encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recompensas */}
        <Card>
          <CardHeader>
            <CardTitle>Recompensas Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{reward.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">{reward.points_required} pontos</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                  <Badge variant="outline" className="capitalize">{reward.category}</Badge>
                </div>
              ))}

              {rewards.length === 0 && (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma recompensa encontrada</p>
                  <Button className="mt-4" onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira recompensa
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Loyalty;
