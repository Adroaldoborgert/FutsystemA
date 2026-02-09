
import React from 'react';
import { 
  Users, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Athlete, Lead } from '../types';

interface SchoolDashboardProps {
  athletes: Athlete[];
  leads: Lead[];
}

const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ athletes, leads }) => {
  const overdueAthletes = athletes.filter(a => a.paymentStatus === 'overdue');
  const activeAthletes = athletes.filter(a => a.status === 'active');
  const newLeads = leads.filter(l => l.status === 'new');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel do Gestor</h2>
          <p className="text-slate-500">Bem-vindo de volta! Aqui está o resumo da sua escola.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors">Nova Matrícula</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Users size={64} className="text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">Atletas Ativos</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{activeAthletes.length}</h3>
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp size={14} /> +3 novos esta semana
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle size={64} className="text-amber-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">Inadimplência</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{overdueAthletes.length}</h3>
          <p className="text-xs text-slate-400 mt-2">
            Aguardando pagamento vencido
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Target size={64} className="text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">Novos Leads</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{newLeads.length}</h3>
          <p className="text-xs text-indigo-600 mt-2 font-medium cursor-pointer flex items-center gap-1">
            Ver funil de vendas <ChevronRight size={14} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
            Alunos com Mensalidade Atrasada
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ação Recomendada</span>
          </h4>
          <div className="space-y-3">
            {overdueAthletes.length > 0 ? overdueAthletes.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.category}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                  Cobrar WhatsApp
                </button>
              </div>
            )) : (
              <p className="text-sm text-slate-400 italic text-center py-4">Nenhuma inadimplência pendente.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4">Metas de Conversão</h4>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Conversão de Leads (Meta: 30%)</span>
                <span className="font-bold text-slate-900">22%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[22%] h-full bg-emerald-500 rounded-full transition-all duration-1000"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Retenção de Alunos (Meta: 95%)</span>
                <span className="font-bold text-slate-900">89%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[89%] h-full bg-blue-500 rounded-full transition-all duration-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
