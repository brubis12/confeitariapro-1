import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  User, 
  Crown, 
  Bell, 
  Shield, 
  Save,
  LogOut
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { currentPlan, upgradeToBasic, upgradeToPremium } = usePlan();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    notifications: true,
    email_reports: false,
    dark_mode: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiration = (dateString: string | null) => {
    if (!dateString) return null;
    const expirationDate = new Date(dateString);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePlanUpgrade = async (plan: 'basic' | 'premium') => {
    try {
      if (plan === 'basic') {
        await upgradeToBasic();
      } else {
        await upgradeToPremium();
      }
      
      toast({
        title: "Plano atualizado!",
        description: `Seu plano foi atualizado para ${plan === 'basic' ? 'Básico' : 'Premium'}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        full_name: formData.full_name,
      });
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout.",
        variant: "destructive",
      });
    }
  };

  const daysUntilExpiration = getDaysUntilExpiration(profile?.subscription_expires_at || null);
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie suas configurações de conta e preferências</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Digite seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={user?.email || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Plano Atual</Label>
              <div className="mt-2">
                <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'} className="capitalize">
                  {currentPlan === 'free' ? 'Gratuito' : 
                   currentPlan === 'basic' ? 'Básico' : 'Premium'}
                </Badge>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isLoading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>

        {/* Plan Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Plano e Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-between mb-2">
                <p>Plano atual: <strong className="capitalize">
                  {currentPlan === 'free' ? 'Gratuito' : 
                   currentPlan === 'basic' ? 'Básico' : 'Premium'}
                </strong></p>
                <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'} className="capitalize">
                  {currentPlan === 'free' ? 'Gratuito' : 
                   currentPlan === 'basic' ? 'Básico' : 'Premium'}
                </Badge>
              </div>

              {/* Subscription Status */}
              {currentPlan !== 'free' && profile?.subscription_expires_at && (
                <div className={`p-3 rounded-lg mb-4 ${
                  isExpiringSoon ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Crown className={`h-4 w-4 ${isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`} />
                    <div>
                      <p className="font-medium text-sm">
                        {isExpiringSoon ? 'Assinatura expira em breve' : 'Assinatura ativa'}
                      </p>
                      <p className="text-xs">
                        {daysUntilExpiration !== null && daysUntilExpiration > 0 ? (
                          `Renova em ${daysUntilExpiration} dia${daysUntilExpiration === 1 ? '' : 's'} (${formatExpirationDate(profile?.subscription_expires_at)})`
                        ) : (
                          `Expirou em ${formatExpirationDate(profile?.subscription_expires_at)}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Recursos do seu plano:</h4>
                <ul className="text-sm space-y-1">
                  {currentPlan === 'free' && (
                    <>
                      <li>• 1 receita</li>
                      <li>• 1 produto</li>
                      <li>• 1 venda por dia</li>
                      <li>• 50 itens no estoque</li>
                    </>
                  )}
                  {currentPlan === 'basic' && (
                    <>
                      <li>• 20 receitas</li>
                      <li>• 20 produtos</li>
                      <li>• 20 vendas por dia</li>
                      <li>• Estoque ilimitado</li>
                      <li>• Relatórios avançados</li>
                    </>
                  )}
                  {currentPlan === 'premium' && (
                    <>
                      <li>• Receitas ilimitadas</li>
                      <li>• Produtos ilimitados</li>
                      <li>• Vendas ilimitadas</li>
                      <li>• Estoque ilimitado</li>
                      <li>• Relatórios avançados</li>
                      <li>• Centro de produção</li>
                      <li>• Sistema de fidelidade</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Plan upgrade buttons */}
            <div className="space-y-2">
              {currentPlan === 'free' && (
                <>
                  <Button 
                    onClick={() => handlePlanUpgrade('basic')}
                    className="w-full"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade para Básico - R$ 29/mês
                  </Button>
                  <Button 
                    onClick={() => handlePlanUpgrade('premium')}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade para Premium - R$ 79/mês
                  </Button>
                </>
              )}

              {currentPlan === 'basic' && (
                <Button 
                  onClick={() => handlePlanUpgrade('premium')}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade para Premium - R$ 79/mês
                </Button>
              )}

              {(isExpiringSoon || (daysUntilExpiration !== null && daysUntilExpiration <= 0)) && (
                <Button 
                  onClick={() => handlePlanUpgrade(currentPlan === 'basic' ? 'basic' : 'premium')}
                  variant="outline"
                  className="w-full"
                >
                  Renovar Assinatura
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações push</p>
                <p className="text-sm text-gray-600">Receba notificações sobre vendas e estoque</p>
              </div>
              <Switch 
                checked={formData.notifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Relatórios por email</p>
                <p className="text-sm text-gray-600">Receba relatórios semanais por email</p>
              </div>
              <Switch 
                checked={formData.email_reports}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_reports: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Sua conta está protegida com autenticação segura.</p>
              <p className="mt-2">Para alterar sua senha, use o sistema de recuperação de senha.</p>
            </div>
            <Button variant="outline" className="w-full">
              Alterar Senha
            </Button>
            <Button variant="destructive" onClick={handleSignOut} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
