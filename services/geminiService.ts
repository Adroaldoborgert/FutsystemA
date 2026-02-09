
import { GoogleGenAI } from "@google/genai";
import { Athlete, Lead } from "../types";

export const getManagerInsights = async (athletes: Athlete[], leads: Lead[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const totalAthletes = athletes.length;
  // Fix: Property 'bind' does not exist on type 'Athlete[]'. Corrected to use .length directly.
  const overdueCount = athletes.filter(a => a.paymentStatus === 'overdue').length;
  const pendingCount = athletes.filter(a => a.paymentStatus === 'pending').length;
  const leadCount = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;

  const prompt = `
    Analise os seguintes dados da minha escola de esportes e forneça 3 insights estratégicos curtos (máximo 2 frases cada) em Português:
    - Total de Atletas: ${totalAthletes}
    - Atletas Inadimplentes (Overdue): ${overdueCount}
    - Atletas com Pagamento Pendente: ${pendingCount}
    - Total de Leads no CRM: ${leadCount}
    - Leads Convertidos: ${convertedLeads}
    
    Foque em: Redução de inadimplência e Conversão de leads. 
    Responda em formato de texto simples, com cada insight começando com um emoji relacionado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "💡 Dica: Mantenha seus leads sempre atualizados para melhorar sua taxa de conversão!";
  }
};