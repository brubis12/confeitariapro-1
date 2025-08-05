
import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cake } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Cake className="h-8 w-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-900">ConfeiFlow</h1>
          </div>
          <p className="text-gray-600">
            Sistema completo de gestão para confeitarias
          </p>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="p-0 h-auto font-normal"
              >
                {isLogin ? "Criar conta gratuita" : "Fazer login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
