
/**
 * SERVIÇO DE INTEGRAÇÃO STRIPE - REDIRECIONAMENTO DIRETO
 */

const STRIPE_PUBLIC_KEY = 'pk_test_51SyIdR4ZLpWFXjcA8VPLln2JXNRfLN8aEQqVG8c2eowp4KMvnq9Gpmix51v9HFLPYEXkA4f8VmYcU0a7OaLv1q9R00Ve4xb15n';

// Mapeamento com os PRICE IDs reais fornecidos
export const STRIPE_PLANS: Record<string, string> = {
  'Grátis': 'price_1SyIj24ZLpWFXjcAodyr9T4K',
  'Starter': 'price_1SyIjd4ZLpWFXjcAw4L8WMGM',
  'Professional': 'price_1SzPYg4ZLpWFXjcAqHmnmJBd',
  'Enterprise': 'price_1SzPYg4ZLpWFXjcAqHmnmJBd' // Placeholder usando o pro caso não tenha enterprise
};

export const stripeService = {
  redirectToCheckout: async (planName: string, schoolId: string, schoolEmail: string) => {
    const priceId = STRIPE_PLANS[planName];
    
    if (!priceId) {
      alert("ID do plano não encontrado.");
      return;
    }

    if (planName === 'Grátis') {
      alert("Plano gratuito ativado com sucesso!");
      return;
    }

    try {
      // Inicializa o Stripe no cliente
      const stripe = (window as any).Stripe(STRIPE_PUBLIC_KEY);
      
      if (!stripe) {
        throw new Error("Stripe.js não carregado. Verifique sua conexão.");
      }

      console.log(`Redirecionando para checkout: ${planName} (${priceId})`);

      // Redirecionamento direto via Client-only Integration
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        successUrl: `${window.location.origin}/settings?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/settings?payment=cancel`,
        customerEmail: schoolEmail,
        clientReferenceId: schoolId, // Identificador da escola para seu controle
      });

      if (error) {
        throw error;
      }

    } catch (error: any) {
      console.error("Erro no Stripe Checkout:", error);
      
      // Se falhar por ser uma conta nova sem Client-side enabled, mostra instrução clara
      if (error.message?.includes("client-side")) {
        alert("Erro: Você precisa ativar 'Client-side Checkout' no painel da Stripe (Settings > Checkout settings).");
      } else {
        alert(`Erro ao iniciar pagamento: ${error.message}`);
      }
    }
  }
};
