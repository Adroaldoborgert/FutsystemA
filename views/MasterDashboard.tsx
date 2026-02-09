import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { TrendingUp, Users, Building, DollarSign } from 'lucide-react';
import { School } from '../types';

interface MasterDashboardProps {
  schools: School[];
}

const data = [
  { month: 'Jan', mrr: 45000 },
  { month: 'Fev', mrr: 52000 },
  { month: 'Mar', mrr: 48000 },
  { month: 'Abr', mrr: 61000 },
  { month: 'Mai', mrr: 75000 },
  { month: 'Jun', mrr: 89000 },
];

const MasterDashboard: React.FC<MasterDashboardProps> = ({ schools }) => {
  const totalMRR = schools.reduce((acc, s) => acc + s.mrr, 0);
  const totalStudents = schools.reduce((acc, s) => acc + s.studentCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Controle de MRR Global</h2>
          <p className="text-slate-500">Visão geral financeira do ecossistema SaaS</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-[10px] border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
          Última atualização: Hoje, 09:41
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-[10px]">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">MRR Total</p>
              <h3 className="text-2xl font-bold text-slate-900">R$ {totalMRR.toLocaleString('pt-BR')}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-emerald-600 text-xs font-semibold">
            <TrendingUp size={14} className="mr-1" />
            +12% vs mês anterior
          </div>
        </div>

        <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-[10px]">
              <Building size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Unidades</p>
              <h3 className="text-2xl font-bold text-slate-900">{schools.length}</h3>
            </div>
          </div>
          <div className="mt-4 text-slate-400 text-xs">
            2 pendentes de onboarding
          </div>
        </div>

        <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-[10px]">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Alunos</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalStudents}</h3>
            </div>
          </div>
          <div className="mt-4 text-slate-400 text-xs">
            Média de {Math.round(totalStudents / schools.length)} por escola
          </div>
        </div>

        <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-[10px]">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Ticket Médio</p>
              <h3 className="text-2xl font-bold text-slate-900">R$ {Math.round(totalMRR / schools.length).toLocaleString('pt-BR')}</h3>
            </div>
          </div>
          <div className="mt-4 text-slate-400 text-xs">
            Por unidade cadastrada
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Crescimento de Receita Recorrente (MRR)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `R$${value/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'MRR']}
              />
              <Area type="monotone" dataKey="mrr" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;