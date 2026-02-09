
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { CreditCard, ArrowDownRight, ArrowUpRight, Wallet, Receipt } from 'lucide-react';
import { School, SchoolPlan } from '../types';

interface MasterFinanceProps {
  schools: School[];
}

const recentTransactions = [
  { id: 'T1', school: 'Arena Soccer', amount: 499, date: '2023-10-15', status: 'pago', type: 'Assinatura Professional' },
  { id: 'T2', school: 'Tênis Club Prime', amount: 199, date: '2023-10-14', status: 'pago', type: 'Assinatura Starter' },
  { id: 'T3', school: 'Basketball Pro', amount: 999, date: '2023-10-14', status: 'pendente', type: 'Assinatura Enterprise' },
  { id: 'T4', school: 'Arena Soccer', amount: 150, date: '2023-10-10', status: 'pago', type: 'Taxa Excesso Alunos' },
];

const MasterFinance: React.FC<MasterFinanceProps> = ({ schools }) => {
  const totalSaasRevenue = schools.reduce((acc, s) => {
    // Simulando receita de assinatura baseada no plano
    const prices: Record<string, number> = { 'Grátis': 0, 'Starter': 199, 'Professional': 499, 'Enterprise': 999 };
    return acc + (prices[s.plan] || 0);
  }, 0);

  const data = [
    { name: 'Grátis', value: schools.filter(s => s.plan === SchoolPlan.FREE).length * 0 },
    { name: 'Starter', value: schools.filter(s => s.plan === SchoolPlan.STARTER).length * 199 },
    { name: 'Professional', value: schools.filter(s => s.plan === SchoolPlan.PROFESSIONAL).length * 499 },
    { name: 'Enterprise', value: schools.filter(s => s.plan === SchoolPlan.ENTERPRISE).length * 999 },
  ];

  const COLORS = ['#94a3b8', '#6366f1', '#4f46e5', '#3730a3'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financeiro SaaS</h2>
          <p className="text-slate-500">Controle de faturamento das assinaturas da plataforma</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Receipt size={18} /> Exportar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Receita de Assinaturas</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">R$ {totalSaasRevenue.toLocaleString('pt-BR')}</h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <ArrowUpRight size={14} /> +8.4% este mês
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Taxa de Churn</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">1.2%</h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-red-600 font-bold">
            <ArrowUpRight size={14} /> +0.2% vs set/23
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Faturas Pendentes</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">R$ 1.840</h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            5 escolas com pagamento em atraso
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Receita por Categoria de Plano</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Últimos Pagamentos SaaS</h3>
          <div className="space-y-4">
            {recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/50">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{t.school}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-tight">{t.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">R$ {t.amount}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Ver Todo Histórico
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterFinance;
