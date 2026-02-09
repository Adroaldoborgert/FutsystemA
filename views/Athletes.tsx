import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  ChevronDown,
  Phone,
  User as UserIcon,
  TrendingUp,
  FilterX,
  BarChart3,
  UserCheck,
  UserMinus,
  Lock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Athlete, SchoolConfig, School } from '../types';

interface AthletesProps {
  athletes: Athlete[];
  config: SchoolConfig;
  school: School;
  onAddAthlete: (athlete: Partial<Athlete>) => void;
  onUpdateAthlete: (athleteId: string, updates: Partial<Athlete>) => void;
  onDeleteAthlete: (athleteId: string) => void;
}

const Athletes: React.FC<AthletesProps> = ({ athletes, config, school, onAddAthlete, onUpdateAthlete, onDeleteAthlete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const activeCount = useMemo(() => athletes.filter(a => a.status === 'active').length, [athletes]);
  const limitValue = school.studentLimit;
  const isLimitReached = activeCount >= limitValue;

  const [formData, setFormData] = useState<Partial<Athlete>>({
    name: '',
    parentName: '',
    parentPhone: '',
    birthDate: '',
    category: '',
    team: '',
    plan: '',
    hasUniform: false,
    status: 'active',
    enrollmentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const active = activeCount;
    const inactive = athletes.filter(a => a.status === 'inactive').length;
    const gainedThisMonth = athletes.filter(a => {
      const d = new Date(a.enrollmentDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const evolution = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthLabel = d.toLocaleString('pt-BR', { month: 'short' });
      const count = athletes.filter(a => {
        const enrollDate = new Date(a.enrollmentDate);
        return enrollDate <= d;
      }).length;
      return { month: monthLabel, total: count };
    });

    return { active, inactive, gainedThisMonth, evolution, total: athletes.length };
  }, [athletes, activeCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAthlete) {
      onUpdateAthlete(editingAthlete.id, formData);
    } else {
      if (isLimitReached) {
        alert(`Bloqueio de Plano: Você já atingiu o limite de ${limitValue} alunos ativos. Por favor, faça o upgrade ou desative atletas antigos.`);
        return;
      }
      onAddAthlete(formData);
    }
    closeModal();
  };

  const handleOpenModal = (athlete?: Athlete) => {
    if (!athlete && isLimitReached) return;
    
    if (athlete) {
      setEditingAthlete(athlete);
      setFormData({ ...athlete });
    } else {
      setEditingAthlete(null);
      setFormData({
        name: '', parentName: '', parentPhone: '', birthDate: '',
        category: '', team: '', plan: '', hasUniform: false,
        status: 'active', enrollmentDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAthlete(null);
  };

  const filteredAthletes = useMemo(() => {
    return athletes.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || (a.parentPhone && a.parentPhone.includes(searchTerm));
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesTeam = teamFilter === 'all' || a.team === teamFilter;
      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [athletes, searchTerm, statusFilter, teamFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, teamFilter]);

  const totalPages = Math.ceil(filteredAthletes.length / itemsPerPage);
  const paginatedAthletes = filteredAthletes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight italic uppercase">Gestão de Atletas</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Base completa e análise de crescimento</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          disabled={isLimitReached}
          className={`${isLimitReached ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 active:scale-95'} px-6 py-3 rounded-[10px] font-bold transition-all flex items-center gap-2 italic uppercase tracking-widest`}
        >
          {isLimitReached ? <Lock size={20} /> : <Plus size={20} />} 
          {isLimitReached ? 'Limite do Plano Atingido' : 'Nova Matrícula'}
        </button>
      </div>

      {isLimitReached && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[10px] flex items-center gap-5 text-red-700 animate-in slide-in-from-top-4 shadow-sm">
            <div className="bg-red-600 text-white p-3 rounded-[10px] shadow-lg">
                <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
                <h4 className="font-black uppercase italic tracking-tighter text-lg">Unidade Bloqueada para Matrículas</h4>
                <p className="text-sm font-medium">Sua unidade atingiu o teto de <strong>{limitValue} atletas ativos</strong>.</p>
            </div>
            <button className="bg-red-600 text-white px-6 py-3 rounded-[10px] font-black italic uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-md active:scale-95">Ver Planos</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <Users size={20} className="text-indigo-400 mb-2" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Geral</span>
              <span className="text-2xl font-black text-slate-800 italic">{stats.total}</span>
          </div>
          <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
              <UserCheck size={20} className="text-emerald-400 mb-2" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ativos (No Limite)</span>
              <span className={`text-2xl font-black italic ${isLimitReached ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>{stats.active} / {limitValue}</span>
          </div>
          <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <UserMinus size={20} className="text-slate-300 mb-2" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inativos</span>
              <span className="text-2xl font-black text-slate-400 italic">{stats.inactive}</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-[10px] shadow-lg flex flex-col items-center justify-center text-center">
              <TrendingUp size={20} className="text-indigo-400 mb-2" />
              <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Ganhos Mês</span>
              <span className="text-2xl font-black text-white italic">+{stats.gainedThisMonth}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[10px] border border-slate-100 shadow-sm h-full min-h-[140px]">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1 mb-2 px-2"><BarChart3 size={12} /> Evolução 6 Meses</span>
          <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.evolution}>
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[10px] shadow-sm border border-slate-100 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Buscar por nome ou WhatsApp..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all italic" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-50 border-none rounded-[10px] px-6 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/10 italic appearance-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">Status: Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <select className="bg-slate-50 border-none rounded-[10px] px-6 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/10 italic appearance-none cursor-pointer" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="all">Turma: Todas</option>
            {config.teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <button onClick={() => {setSearchTerm(''); setStatusFilter('all'); setTeamFilter('all');}} className="p-3 bg-slate-50 text-slate-400 rounded-[10px] hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"><FilterX size={18} /></button>
        </div>
      </div>
      
      <div className="bg-white rounded-[10px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Atleta / Responsável</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Turma / Categoria</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Financeiro</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Status</th>
              <th className="px-8 py-5 text-right italic">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedAthletes.length > 0 ? paginatedAthletes.map((athlete) => (
              <tr key={athlete.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5"><div className="font-bold text-slate-800 uppercase italic tracking-tighter text-lg">{athlete.name}</div><div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium"><UserIcon size={12} className="text-slate-300" /> {athlete.parentName}</div></td>
                <td className="px-6 py-5"><div className="flex flex-col gap-1"><span className="inline-flex items-center w-fit px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-[10px] border border-indigo-100 tracking-tighter italic">{athlete.category || 'SEM CAT.'}</span><span className="text-xs text-slate-500 font-bold italic uppercase tracking-tighter">{athlete.team || 'SEM TURMA'}</span></div></td>
                <td className="px-6 py-5"><div className="flex flex-col gap-1"><span className={`text-[10px] font-black uppercase tracking-tighter italic ${athlete.paymentStatus === 'paid' ? 'text-emerald-500' : athlete.paymentStatus === 'overdue' ? 'text-red-500' : 'text-amber-500'}`}>{athlete.paymentStatus === 'paid' ? '● Em dia' : athlete.paymentStatus === 'overdue' ? '● Atrasado' : '● Pendente'}</span><span className="text-xs text-slate-400 font-medium italic">{athlete.plan}</span></div></td>
                <td className="px-6 py-5 text-center"><span className={`text-[10px] font-black uppercase px-3 py-1 rounded-[10px] italic tracking-tighter ${athlete.status === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>{athlete.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
                <td className="px-8 py-5 text-right"><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleOpenModal(athlete)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-[10px] transition-all active:scale-90"><Edit3 size={18}/></button><button onClick={() => onDeleteAthlete(athlete.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-all active:scale-90"><Trash2 size={18}/></button></div></td>
              </tr>
            )) : <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic"><Users size={48} className="mx-auto text-slate-100 mb-2" /><p className="font-medium">Nenhum atleta encontrado.</p></td></tr>}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium italic">Exibindo {((currentPage - 1) * itemsPerPage) + 1} de {filteredAthletes.length} atletas</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 text-slate-400"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 text-slate-400"><ChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[4px] p-4">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">{editingAthlete ? 'Editar Cadastro' : 'Nova Matrícula'}</h3>
              <button onClick={closeModal} className="text-slate-400 p-2"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="Nome do Aluno" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] font-bold text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="date" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] font-bold text-sm" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                <input type="text" placeholder="Responsável" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                <input required type="text" placeholder="WhatsApp" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm font-bold" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Categoria...</option>
                  {config.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})}>
                  <option value="">Turma...</option>
                  {config.teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                  <option value="">Plano...</option>
                  {config.monthlyPlans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <input required type="date" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm font-bold" value={formData.enrollmentDate} onChange={e => setFormData({...formData, enrollmentDate: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black rounded-[10px] uppercase italic text-xs active:scale-95 shadow-lg">Confirmar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Athletes;