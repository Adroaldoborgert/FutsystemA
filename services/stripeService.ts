
/**
 * SERVIÇO DE INTEGRAÇÃO STRIPE - ATUALIZADO COM PRICE IDs REAIS
 */

const STRIPE_PUBLIC_KEY = 'pk_test_51SyIdR4ZLpWFXjcA8VPLln2JXNRfLN8aEQqVG8c2eowp4KMvnq9Gpmix51v9HFLPYEXkA4f8VmYcU0a70aLv1q9R00Ve4xb15n';

// Mapeamento com os PRICE IDs reais fornecidos pelo usuário
export const STRIPE_PLANS: Record<string, string> = {
  'Grátis': 'price_1SyIj24ZLpWFXjcAodyr9T4K',
  'Starter': 'price_1SyIjd4ZLpWFXjcAw4L8WMGM',
  'Professional': 'price_1SzPYg4ZLpWFXjcAqHmnmJBd',
  'Enterprise': 'price_1SzPYg4ZLpWFXjcAqHmnmJBd' // Placeholder usando o pro
};

export const stripeService = {
  redirectToCheckout: async (planName: string, schoolId: string, schoolEmail: string) => {
    const priceId = STRIPE_PLANS[planName];
    
    if (!priceId) {
      alert("ID do plano não encontrado.");
      return;
    }

    if (planName === 'Grátis') {
      alert("Você selecionou o plano Grátis!");
      return;
    }

    try {
      // Inicializa o Stripe no cliente
      const stripe = (window as any).Stripe(STRIPE_PUBLIC_KEY);
      
      if (!stripe) {
        throw new Error("Stripe.js não pôde ser carregado. Verifique o console.");
      }

      console.log(`Iniciando Checkout para: ${planName} com o preço ${priceId}`);

      // Redirecionamento direto via Client-only Integration
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/settings?payment=success`,
        cancelUrl: `${window.location.origin}/settings?payment=cancel`,
        customerEmail: schoolEmail,
        clientReferenceId: schoolId,
      });

      if (error) {
        throw error;
      }

    } catch (error: any) {
      console.error("Erro no Stripe Checkout:", error);
      
      // Se o erro for especificamente a falta de ativação no painel
      if (error.message?.includes("client-only")) {
        alert(
          "ERRO DE CONFIGURAÇÃO NA STRIPE:\n\n" +
          "Para o botão funcionar, você DEVE ativar o 'Client-side Checkout' no seu painel da Stripe.\n\n" +
          "1. Vá em: Dashboard > Settings > Checkout and Payment Links\n" +
          "2. Ative o botão: 'Client-side Checkout'\n" +
          "3. Salve as alterações."
        );
        window.open("https://dashboard.stripe.com/account/checkout/settings", "_blank");
      } else {
        alert(`Erro ao processar pagamento: ${error.message}`);
      }
    }
  }
};
