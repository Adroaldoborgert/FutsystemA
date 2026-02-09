import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CreditCard, ArrowDownRight, ArrowUpRight, Wallet, Receipt } from 'lucide-react';
import { School, SchoolPlan } from '../types';

interface MasterFinanceProps {
  schools: School[];
}

const recentTransactions = [
  { id: 'T1', school: 'Arena Soccer', amount: 499, date: '2023-10-15', status: 'pago', type: 'Assinatura Professional' },
  { id: 'T2', school: 'Tênis Club Prime', amount: 199, date: '2023-10-14', status: 'pago', type: 'Assinatura Starter' },
];

const MasterFinance: React.FC<MasterFinanceProps> = ({ schools }) => {
  const totalSaasRevenue = schools.reduce((acc, s) => {
    const prices: Record<string, number> = { 'Grátis': 0, 'Starter': 199, 'Professional': 499, 'Enterprise': 999 };
    return acc + (prices[s.plan] || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Financeiro SaaS</h2>
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-[10px] text-sm flex items-center gap-2"><Receipt size={18} /> Exportar</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{l: 'Receita Assinaturas', v: `R$ ${totalSaasRevenue.toLocaleString('pt-BR')}`, i: Wallet, c: 'emerald'}, {l: 'Churn', v: '1.2%', i: ArrowDownRight, c: 'red'}, {l: 'Pendentes', v: 'R$ 1.840', i: CreditCard, c: 'amber'}].map((t, i) => (
          <div key={i} className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">{t.l}</p>
            <h3 className="text-2xl font-bold text-slate-900">{t.v}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6">Últimos Pagamentos SaaS</h3>
        <div className="space-y-4">
          {recentTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-[10px] border border-slate-50 bg-slate-50/50">
              <span className="text-sm font-bold text-slate-900">{t.school}</span>
              <div className="text-right"><div className="text-sm font-bold">R$ {t.amount}</div><span className="text-[10px] uppercase">{t.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasterFinance;