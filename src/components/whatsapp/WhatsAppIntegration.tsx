
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Bot, Smartphone, Settings, Send, CheckCircle } from 'lucide-react';

const WhatsAppIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testMessage, setTestMessage] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleTestMessage = async () => {
    if (!testMessage.trim() || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-bot', {
        body: {
          message: testMessage,
          userId: user.id,
          phoneNumber: phoneNumber || '5511999999999'
        }
      });

      if (error) throw error;

      setBotResponse(data.message);
      toast({
        title: "Teste realizado com sucesso!",
        description: "A Ana respondeu à sua mensagem.",
      });
    } catch (error) {
      console.error('Erro ao testar bot:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar o bot. Verifique a configuração.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Bot className="h-5 w-5" />,
      title: "Secretária Inteligente",
      description: "Ana responde perguntas sobre vendas, estoque e clientes automaticamente"
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "Relatórios Instantâneos",
      description: "Receba relatórios de vendas, estoque e financeiro via WhatsApp"
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "Gestão Mobile",
      description: "Gerencie seu negócio direto do WhatsApp, onde quer que esteja"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Alertas Proativos",
      description: "Receba alertas sobre estoque baixo, metas e oportunidades"
    }
  ];

  const exampleCommands = [
    "Como foram as vendas hoje?",
    "O que está faltando no estoque?",
    "Quais são os produtos mais vendidos?",
    "Mostre o relatório financeiro da semana",
    "Liste os clientes aniversariantes do mês",
    "Como está a produção hoje?",
    "Calcule a margem de lucro dos bolos"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Secretária Virtual Ana</h1>
        <p className="text-muted-foreground">
          Sua assistente inteligente para gestão completa via WhatsApp
        </p>
      </div>

      {/* Status da Integração */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6" />
                Status da Ana
              </CardTitle>
              <CardDescription>
                Sua secretária virtual está pronta para ajudar
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Ativa
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 rounded-lg border bg-muted/30">
                <div className="flex justify-center mb-2 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teste da Ana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Testar a Ana
          </CardTitle>
          <CardDescription>
            Teste a funcionalidade da sua secretária virtual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Número de Teste (opcional)</Label>
              <Input
                id="phone"
                placeholder="Ex: 5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="message">Mensagem para a Ana</Label>
            <Textarea
              id="message"
              placeholder="Digite sua pergunta ou comando..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="min-h-20"
            />
          </div>

          <Button 
            onClick={handleTestMessage} 
            disabled={!testMessage.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Enviando...' : 'Testar Ana'}
          </Button>

          {botResponse && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <Label className="text-sm font-semibold">Resposta da Ana:</Label>
              <div className="mt-2 whitespace-pre-wrap text-sm">{botResponse}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comandos de Exemplo */}
      <Card>
        <CardHeader>
          <CardTitle>Comandos que a Ana entende</CardTitle>
          <CardDescription>
            Exemplos do que você pode perguntar para sua secretária virtual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {exampleCommands.map((command, index) => (
              <div
                key={index}
                className="p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setTestMessage(command)}
              >
                <p className="text-sm">{command}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar a Ana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Configure seu WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Adicione o webhook do bot em sua conta WhatsApp Business
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Envie comandos</h3>
              <p className="text-sm text-muted-foreground">
                Digite perguntas naturais sobre vendas, estoque ou clientes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Receba relatórios</h3>
              <p className="text-sm text-muted-foreground">
                Ana responde com dados precisos e insights valiosos
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">URL do Webhook:</h4>
            <code className="text-sm bg-blue-100 px-2 py-1 rounded">
              https://zugpzdlgjvrhtlnbweqc.supabase.co/functions/v1/whatsapp-bot
            </code>
            <p className="text-sm text-blue-700 mt-2">
              Use esta URL para configurar o webhook em sua conta WhatsApp Business API
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppIntegration;
