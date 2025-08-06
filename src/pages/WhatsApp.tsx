
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import WhatsAppIntegration from '@/components/whatsapp/WhatsAppIntegration';

const WhatsApp = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8">
        <WhatsAppIntegration />
      </div>
    </AppLayout>
  );
};

export default WhatsApp;
