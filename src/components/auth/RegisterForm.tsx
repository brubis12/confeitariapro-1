
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User, Chrome, Phone } from 'lucide-react';
import { toast } from 'sonner';

export const RegisterForm: React.FC = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone: string) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!fullName.trim()) {
      toast.error('Nome completo é obrigatório');
      return;
    }

    if (!phone.trim()) {
      toast.error('Número de telefone é obrigatório');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('Número de telefone deve ter entre 10 e 11 dígitos');
      return;
    }

    if (!email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Email deve ter um formato válido');
      return;
    }

    if (!password.trim()) {
      toast.error('Senha é obrigatória');
      return;
    }

    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName, phone);
      toast.success('Conta criada com sucesso! Verifique seu email.');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      // Tratamento específico de erros
      if (error.message?.includes('User already registered')) {
        toast.error('Este email já está cadastrado. Tente fazer login.');
      } else if (error.message?.includes('Email rate limit exceeded')) {
        toast.error('Muitas tentativas de cadastro. Tente novamente em alguns minutos.');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Email inválido. Verifique o formato do email.');
      } else if (error.message?.includes('Password')) {
        toast.error('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else if (error.message?.includes('phone')) {
        toast.error('Este telefone já está cadastrado no sistema.');
      } else {
        toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!phone.trim()) {
      toast.error('Número de telefone é obrigatório para cadastro com Google');
      return;
    }

    if (!validatePhone(phone)) {
      toast.error('Número de telefone deve ter entre 10 e 11 dígitos');
      return;
    }

    setLoading(true);
    try {
      await signInWithGoogle(phone);
      toast.success('Redirecionando para o Google...');
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      if (error.message?.includes('phone')) {
        toast.error('Este telefone já está cadastrado no sistema.');
      } else {
        toast.error(error.message || 'Erro ao fazer login com Google. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    // Remove all non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    
    // Apply mask based on length
    if (cleanValue.length <= 2) {
      return cleanValue;
    } else if (cleanValue.length <= 6) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
    } else if (cleanValue.length <= 10) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 6)}-${cleanValue.slice(6)}`;
    } else {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <Card className="w-full max-w-md bg-background border-0 shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-foreground">
          Criar conta
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Comece sua jornada com o sistema de gestão
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">Nome completo *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="fullName" 
                type="text" 
                placeholder="Seu nome completo" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                className="pl-10 bg-background border-input text-foreground" 
                required 
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">Telefone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="phone" 
                type="tel" 
                placeholder="(11) 99999-9999" 
                value={phone} 
                onChange={handlePhoneChange} 
                className="pl-10 bg-background border-input text-foreground" 
                required 
                disabled={loading}
                maxLength={15}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="pl-10 bg-background border-input text-foreground" 
                required 
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Senha *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="pl-10 bg-background border-input text-foreground" 
                required 
                minLength={6} 
                disabled={loading}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              ou continue com
            </span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full border-border hover:bg-accent" 
          onClick={handleGoogleSignIn} 
          disabled={loading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          {loading ? 'Processando...' : 'Google'}
        </Button>
      </CardContent>
    </Card>
  );
};
