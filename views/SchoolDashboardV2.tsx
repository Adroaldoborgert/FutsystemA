
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
      const parts = t.competenceDate?.split('/') || [];
      const [m, y] = parts;
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
          <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Painel FutSystem</h2>
          <p className="text-slate-400 text-sm font-bold capitalize mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate?.('leads')}
            className="bg-brand-purple hover:opacity-90 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase italic tracking-widest transition-all shadow-lg shadow-brand-purple/10 active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> Nova Experimental
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experimentais Hoje</p>
            <h3 className="text-4xl font-black text-slate-800 italic">{experimentalsToday.length}</h3>
          </div>
          <div className="w-14 h-14 bg-sky-50 rounded-3xl flex items-center justify-center text-sky-500 shadow-inner">
            <Calendar size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alunos Ativos</p>
            <h3 className="text-4xl font-black text-slate-800 italic">{activeAthletesCount}</h3>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 shadow-inner">
            <GraduationCap size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faturamento Mês</p>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black text-slate-800 italic">R$ {financeStats.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              <span className="text-[9px] text-slate-400 font-black uppercase italic">de R$ {financeStats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-brand-purple/5 rounded-3xl flex items-center justify-center text-brand-purple shadow-inner">
            <DollarSign size={28} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inadimplência</p>
            <div className="flex flex-col">
              <h3 className="text-2xl font-black text-red-500 italic">{financeStats.overdueCount}</h3>
              <span className="text-[9px] text-slate-400 font-black uppercase italic">R$ {financeStats.overdueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 shadow-inner">
            <AlertTriangle size={28} />
          </div>
        </div>
      </div>

      {/* Main Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h4 className="font-black text-slate-800 italic uppercase tracking-tighter">Experimentais de Hoje</h4>
            <button onClick={() => onNavigate?.('leads')} className="text-xs font-black text-brand-purple hover:underline flex items-center gap-1 uppercase tracking-widest">
              Ver todas <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-center">
            {experimentalsToday.length > 0 ? (
              <div className="space-y-4">
                {experimentalsToday.map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-black text-slate-800 italic uppercase text-sm">{lead.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lead.categoryInterest} • {lead.trialTime || 'Não definido'}</p>
                    </div>
                    <button className="text-[10px] font-black text-brand-purple bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 uppercase tracking-widest italic hover:bg-slate-50 transition-colors">
                      Confirmar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-slate-400 text-sm font-bold italic">Nenhum agendamento para hoje</p>
                <button 
                  onClick={() => onNavigate?.('leads')}
                  className="text-brand-purple font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-1 mx-auto italic"
                >
                  Agendar nova experimental
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h4 className="font-black text-slate-800 italic uppercase tracking-tighter">Matrículas Recentes</h4>
            <button onClick={() => onNavigate?.('athletes')} className="text-xs font-black text-slate-400 hover:text-brand-purple hover:underline flex items-center gap-1 uppercase tracking-widest">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-8 flex-1 space-y-4">
            {recentEnrollments.map(athlete => (
              <div key={athlete.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all hover:border-brand-purple/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-purple/5 rounded-xl flex items-center justify-center text-brand-purple font-black italic shadow-inner">
                    {athlete.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 italic text-sm uppercase">{athlete.name}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{athlete.category} • {athlete.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{new Date(athlete.enrollmentDate).toLocaleDateString('pt-BR')}</p>
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
