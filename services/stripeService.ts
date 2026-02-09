
/**
 * SERVIÇO DE INTEGRAÇÃO STRIPE
 * 
 * Chave Pública: pk_test_51SyIdR4ZLpWFXjcA8VPL1n2JXNRfLN8aEQqVG8c2eowp4KMvnq9Gpmix51v9HFLPYEXkA4f8VmYcU0a70aLv1q9R00Ve4xb15n
 * 
 * NOTA DE SEGURANÇA: A Chave Secreta (sk_test...) deve ser usada APENAS no backend 
 * (ex: Supabase Edge Functions) para criar a Checkout Session.
 */

const STRIPE_PUBLIC_KEY = 'pk_test_51SyIdR4ZLpWFXjcA8VPL1n2JXNRfLN8aEQqVG8c2eowp4KMvnq9Gpmix51v9HFLPYEXkA4f8VmYcU0a70aLv1q9R00Ve4xb15n';

export const stripeService = {
  /**
   * Redireciona para o Checkout do Stripe
   * @param planId ID do plano no Stripe (Price ID)
   * @param schoolId ID da escola para vincular o pagamento via Webhook
   */
  redirectToCheckout: async (planId: string, schoolId: string) => {
    // @ts-ignore - Stripe é carregado via script no index.html
    const stripe = window.Stripe ? window.Stripe(STRIPE_PUBLIC_KEY) : null;

    if (!stripe) {
      throw new Error("Stripe.js não foi carregado corretamente.");
    }

    /**
     * EM PRODUÇÃO:
     * Você deve chamar uma API sua que cria a sessão no Stripe usando a SECRET KEY.
     * Exemplo:
     * const response = await fetch('/api/create-checkout-session', {
     *   method: 'POST',
     *   body: JSON.stringify({ priceId: planId, schoolId })
     * });
     * const session = await response.json();
     * return stripe.redirectToCheckout({ sessionId: session.id });
     */

    // Simulação do fluxo para demonstração com as chaves reais
    console.log(`Iniciando checkout para o plano: ${planId} da escola: ${schoolId}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  },

  /**
   * Abre o Portal do Cliente Stripe para gerenciar assinaturas e cartões
   */
  openCustomerPortal: async (customerId: string) => {
    console.log("Redirecionando para Billing Portal do Stripe...");
    // Em produção, isso redirecionaria para uma URL gerada no backend
    alert("Redirecionando para o Portal de Faturamento Stripe...");
  }
};
