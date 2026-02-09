
const BASE_URL = 'https://socialfinch-evolution.cloudfy.cloud';
const API_KEY = 'pNbhKQBA3iqvxNnTsuPZvh3j8YXqcDUy';

export const whatsappService = {
  createInstance: async (instanceName: string) => {
    const response = await fetch(`${BASE_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      })
    });
    return response.json();
  },

  getQrCode: async (instanceName: string) => {
    const response = await fetch(`${BASE_URL}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': API_KEY
      }
    });
    return response.json();
  },

  checkConnection: async (instanceName: string) => {
    const response = await fetch(`${BASE_URL}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': API_KEY
      }
    });
    return response.json();
  },

  logoutInstance: async (instanceName: string) => {
    const response = await fetch(`${BASE_URL}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': API_KEY
      }
    });
    return response.json();
  },

  deleteInstance: async (instanceName: string) => {
    const response = await fetch(`${BASE_URL}/instance/delete/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': API_KEY
      }
    });
    return response.json();
  },

  sendText: async (instanceName: string, number: string, text: string) => {
    // Sanitizar número para formato internacional sem caracteres especiais
    const cleanNumber = number.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    
    const response = await fetch(`${BASE_URL}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
      },
      body: JSON.stringify({
        number: formattedNumber,
        text,
        delay: 1200,
        linkPreview: true
      })
    });
    return response.json();
  }
};
