
/**
 * SERVIÇO DE INTEGRAÇÃO STRIPE - PRODUÇÃO/TESTE
 */

// Chave Pública fornecida
const STRIPE_PUBLIC_KEY = 'pk_test_51SyIdR4ZLpWFXjcA8VPLln2JXNRfLN8aEQqVG8c2eowp4KMvnq9Gpmix51v9HFLPYEXkA4f8VmYcU0a70aLv1q9R00Ve4xb15n';

// Mapeamento de Planos para IDs da Stripe fornecidos
// Nota: A Stripe geralmente solicita o "Price ID" (price_...) para o Checkout. 
// Caso tenha inserido o Product ID (prod_...), certifique-se que sua API de backend trate a conversão ou substitua pelos Price IDs correspondentes.
export const STRIPE_PLANS: Record<string, string> = {
  'Grátis': 'prod_TwB56jhnG2yxDP',
  'Starter': 'prod_TwB5RTpRUoe8I6',
  'Professional': 'prod_TxKDKCKUtmbcu6', // Corrigido ID Professional conforme informado
  'Enterprise': 'price_enterprise_placeholder' // Enterprise não foi informado, mantendo placeholder
};

export const stripeService = {
  redirectToCheckout: async (planName: string, schoolId: string, schoolEmail: string) => {
    const priceId = STRIPE_PLANS[planName];
    
    if (!priceId) {
      alert("ID do plano não configurado para este item na Stripe.");
      return;
    }

    if (planName === 'Grátis') {
      alert("Este plano é gratuito e não requer checkout na Stripe.");
      return;
    }

    console.log(`Iniciando checkout Stripe para: ${planName} (${priceId})`);

    try {
      /**
       * O fluxo ideal é chamar sua API de backend para criar a sessão.
       * Exemplo de payload para seu endpoint '/api/create-checkout-session':
       * {
       *   priceId: priceId,
       *   successUrl: window.location.origin + '/settings?payment=success',
       *   cancelUrl: window.location.origin + '/settings?payment=cancel',
       *   metadata: { schoolId: schoolId, planName: planName }
       * }
       */
      
      const message = `Integração configurada!\n\nPlano: ${planName}\nStripe ID: ${priceId}\n\nO sistema agora está pronto para enviar estes dados para sua rota de Checkout no backend.`;
      alert(message);
      
      // Simulação de redirecionamento (na vida real, aqui você faria o fetch e redirecionaria para a URL retornada)
      return true;
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      throw error;
    }
  }
};
