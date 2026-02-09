
import React, { useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  ChevronRight,
  GraduationCap,
  CalendarCheck
} from 'lucide-react';
import { Athlete, Lead, Transaction, School } from '../types';

interface SchoolDashboardV2Props {
  athletes: Athlete[];
  leads: Lead[];
  transactions: Transaction[];
  school: School;
  onNavigate?: (path: string) => void;
}

const SchoolDashboardV2: React.FC<SchoolDashboardV2Props> = ({ athletes, leads, transactions, school, onNavigate }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // KPIs
  const activeAthletesCount = useMemo(() => athletes.filter(a => a.status === 'active').length, [athletes]);
  
  const experimentalsToday = useMemo(() => 
    leads.filter(l => l.trialDate === todayStr || (l.trialDate && l.trialDate.includes(new Date().toLocaleDateString('pt-BR')))), 
  [leads, todayStr]);

  const financeStats = useMemo(() => {
    const monthTransactions = transactions.filter(t => {
      const [m, y] = t.competenceDate.split('/');
      const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return monthNames[new Date().getMonth()] === m?.toLowerCase() && currentYear.toString() === y;
    });

    const paid = monthTransactions.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
    const total = monthTransactions.reduce((acc, t) => acc + t.amount, 0);
    
    const overdueCount = transactions.filter(t => t.status === 'overdue').length;
    const overdueTotal = transactions.filter(t => t.status === 'overdue').reduce((acc, t) => acc + t.amount, 0);

    return { paid, total, overdueCount, overdueTotal };
  }, [transactions, currentYear]);

  const recentEnrollments = useMemo(() => 
    [...athletes]
      .filter(a => a.status === 'active')
      .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
      .slice(0, 5),
  [athletes]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-400 text-sm font-medium capitalize">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate?.('leads')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Plus size={18} /> Nova Experimental
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Experimentais Hoje */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Experimentais Hoje</p>
            <h3 className="text-3xl font-black text-slate-800">{experimentalsToday.length}</h3>
          </div>
          <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500">
            <Calendar size={24} />
          </div>
        </div>

        {/* Alunos Ativos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alunos Ativos</p>
            <h3 className="text-3xl font-black text-slate-800">{activeAthletesCount}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <GraduationCap size={24} />
          </div>
        </div>

        {/* Faturamento */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Faturamento do Mês</p>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black text-slate-800">R$ {financeStats.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              <span className="text-[10px] text-slate-400 font-bold">de R$ {financeStats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Inadimplência */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inadimplência</p>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black text-red-500">{financeStats.overdueCount}</h3>
              <span className="text-[10px] text-slate-400 font-bold">R$ {financeStats.overdueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Main Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Experimentais de Hoje */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Experimentais de Hoje</h4>
            <button onClick={() => onNavigate?.('leads')} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              Ver todas <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {experimentalsToday.length > 0 ? (
              <div className="space-y-4">
                {experimentalsToday.map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.categoryInterest} • {lead.trialTime || 'Horário não definido'}</p>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                      Confirmar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-slate-400 text-sm italic">Nenhuma experimental agendada para hoje</p>
                <button 
                  onClick={() => onNavigate?.('leads')}
                  className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1 mx-auto"
                >
                  Agendar nova experimental
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Matrículas Recentes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Matrículas Recentes</h4>
            <button onClick={() => onNavigate?.('athletes')} className="text-xs font-bold text-slate-500 hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-6 flex-1 space-y-3">
            {recentEnrollments.map(athlete => (
              <div key={athlete.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                    {athlete.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{athlete.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium uppercase">{athlete.category} • {athlete.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400">{new Date(athlete.enrollmentDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboardV2;
