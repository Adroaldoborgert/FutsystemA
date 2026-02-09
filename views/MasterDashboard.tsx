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
          <p className="text-slate-500">Visão geral SaaS</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-[10px] border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
          Última atualização: Hoje, 09:41
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{l: 'MRR Total', v: `R$ ${totalMRR.toLocaleString('pt-BR')}`, i: DollarSign, c: 'indigo'}, {l: 'Unidades', v: schools.length, i: Building, c: 'blue'}, {l: 'Total Alunos', v: totalStudents, i: Users, c: 'emerald'}, {l: 'Ticket Médio', v: `R$ ${Math.round(totalMRR / (schools.length || 1))}`, i: DollarSign, c: 'amber'}].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-${s.c}-50 text-${s.c}-600 rounded-[10px]`}><s.i size={24} /></div>
              <div><p className="text-sm font-medium text-slate-500">{s.l}</p><h3 className="text-2xl font-bold text-slate-900">{s.v}</h3></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[10px] border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Crescimento Recorrente</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <Area type="monotone" dataKey="mrr" stroke="#4f46e5" strokeWidth={3} fill="#4f46e5" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;