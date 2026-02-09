import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Clock, Zap, ShieldCheck, Loader2, FileText, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { School, PlanDefinition, SchoolPlan } from '../types';

interface SchoolPlansProps {
  school: School; plans: PlanDefinition[]; onUpgrade: (planId: SchoolPlan) => void;
}

const SchoolPlans: React.FC<SchoolPlansProps> = ({ school, plans, onUpgrade }) => {
  const currentPlanDef = plans.find(p => p.id === school.plan || p.name === school.plan);
  const nextBilling = new Date(); nextBilling.setMonth(nextBilling.getMonth() + 1);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <h2 className="text-3xl font-bold italic uppercase">Minha Assinatura</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-[10px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <ShieldCheck size={32} className="text-indigo-600" />
            <h3 className="text-4xl font-black italic uppercase">{currentPlanDef?.name || school.plan}</h3>
          </div>
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div><p className="text-slate-400 text-[10px] font-black uppercase">Renovação</p><p className="text-xl font-bold italic">{nextBilling.toLocaleDateString('pt-BR')}</p></div>
            <div><p className="text-slate-400 text-[10px] font-black uppercase">Valor</p><p className="text-xl font-bold italic text-emerald-400">R$ {currentPlanDef?.price || 0}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] border p-8 shadow-sm space-y-6">
            <h4 className="font-bold uppercase text-xs">Faturamento</h4>
            <div className="p-4 bg-slate-50 rounded-[10px] border text-sm font-bold italic truncate">{school.email}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans.map(p => (
            <div key={p.id} className="p-8 bg-white rounded-[10px] border flex flex-col">
                <h4 className="font-black italic uppercase text-lg">{p.name}</h4>
                <div className="text-2xl font-black text-indigo-600 mb-6">R$ {p.price}</div>
                <button onClick={() => onUpgrade(p.id as SchoolPlan)} disabled={p.id === school.plan} className={`w-full py-4 rounded-[10px] font-black uppercase text-[10px] ${p.id === school.plan ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-600 text-white shadow-lg'}`}>{p.id === school.plan ? 'Plano Atual' : 'Upgrade'}</button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolPlans;