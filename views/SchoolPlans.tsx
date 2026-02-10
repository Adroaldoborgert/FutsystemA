
import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ShieldCheck,
  Loader2,
  FileText,
  AlertCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { School, PlanDefinition, SchoolPlan } from '../types';
import { stripeService } from '../services/stripeService';

interface SchoolPlansProps {
  school: School;
  plans: PlanDefinition[];
  onUpgrade: (planId: SchoolPlan) => void;
}

const SchoolPlans: React.FC<SchoolPlansProps> = ({ school, plans, onUpgrade }) => {
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  const currentPlanDef = plans.find(p => 
    p.id === school.plan || 
    p.name === school.plan || 
    p.name?.toLowerCase() === school.plan?.toLowerCase()
  );
  
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  const displayPrice = currentPlanDef?.price || 0;
  const displayLimit = currentPlanDef?.studentLimit || school.studentLimit || 10;

  const handleUpgrade = async (plan: PlanDefinition) => {
    setIsUpgrading(plan.name);
    try {
      // Chama o serviço do Stripe
      await stripeService.redirectToCheckout(plan.name, school.id, school.email);
      
      // Nota: Em um fluxo real, o upgrade no banco acontece via Webhook da Stripe.
      // O onUpgrade(plan.id) aqui é apenas para demonstração local.
      // onUpgrade(plan.id as SchoolPlan);
      
    } catch (err) {
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsUpgrading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight italic uppercase">Minha Assinatura</h2>
        <p className="text-slate-500 font-medium italic mt-1">Gerencie seu plano e limites da plataforma via Stripe</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status do Plano Atual */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={120} fill="currentColor" /></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">Plano Ativo</p>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter">
                {currentPlanDef?.name || school.plan}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <Clock size={12} /> Próxima Renovação
              </p>
              <p className="text-xl font-bold italic">{nextBilling.toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <CreditCard size={12} /> Valor Mensal
              </p>
              <p className="text-xl font-bold italic text-emerald-400">
                R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="mt-10 bg-white/5 rounded-3xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Consumo de Alunos</p>
              <span className="text-xs font-black text-indigo-400 italic">
                {school.studentCount} / {displayLimit >= 10000 ? 'Ilimitados' : displayLimit}
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full shadow-lg transition-all duration-1000"
                style={{ width: `${Math.min((school.studentCount / (displayLimit || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Resumo Financeiro Curto */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col space-y-6">
            <div className="flex items-center gap-2 text-indigo-600">
                <FileText size={20} />
                <h4 className="font-bold uppercase text-xs tracking-wider">Dados de Cobrança</h4>
            </div>
            
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">E-mail Financeiro</p>
                    <p className="text-sm font-bold text-slate-800 italic truncate">{school.email}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Método de Pagamento</p>
                    <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-slate-400" />
                        <p className="text-sm font-bold text-slate-800 italic uppercase">Via Stripe</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-auto">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                    <AlertCircle size={20} className="text-amber-600 shrink-0" />
                    <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic">
                        Os pagamentos são processados de forma segura pela Stripe. Você poderá gerenciar seu cartão no checkout.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 italic uppercase tracking-tighter">Planos Disponíveis</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
            <TrendingUp size={14} /> Pagamento Seguro via Stripe
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
          {plans.map((p) => {
            const isCurrent = p.id === school.plan || p.name === school.plan;
            const loadingThis = isUpgrading === p.name;
            
            return (
              <div key={p.id} className={`p-8 bg-white flex flex-col ${isCurrent ? 'ring-4 ring-indigo-600/10 z-10' : ''}`}>
                <div className="mb-6">
                  <h4 className="font-black text-slate-800 italic uppercase tracking-tighter text-lg">{p.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-indigo-600 italic">R$ {p.price}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/mês</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-xs font-bold text-slate-600 italic">
                    <CheckCircle2 size={14} className="text-emerald-500" /> 
                    {p.studentLimit >= 10000 ? 'Ilimitado' : p.studentLimit} alunos
                  </li>
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-600 italic">
                      <CheckCircle2 size={14} className="text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>

                <button 
                  disabled={isCurrent || p.price < displayPrice || !!isUpgrading}
                  onClick={() => handleUpgrade(p)}
                  className={`w-full py-4 rounded-xl font-black italic uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isCurrent 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' 
                      : p.price < displayPrice
                        ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95'
                  }`}
                >
                  {loadingThis ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                  {isCurrent ? 'Plano Atual' : p.price < displayPrice ? 'Indisponível' : 'Assinar Agora'}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SchoolPlans;
