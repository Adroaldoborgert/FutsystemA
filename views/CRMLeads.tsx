import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  X, 
  FilterX,
  AlertCircle,
  Phone,
  UserPlus,
  Trophy,
  Users,
  CalendarCheck,
  Target,
  Baby,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Lead, SchoolConfig } from '../types';

interface CRMLeadsProps {
  leads: Lead[];
  config: SchoolConfig;
  whatsappConnected?: boolean;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
  onAddLead: (lead: Partial<Lead>) => void;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onDeleteLead: (leadId: string) => void;
  onEnrollLead: (lead: Lead) => void;
  onNotifyLead?: (lead: Lead) => void;
}

const CRMLeads: React.FC<CRMLeadsProps> = ({ 
  leads, 
  config, 
  whatsappConnected = false,
  onUpdateStatus, 
  onAddLead, 
  onUpdateLead, 
  onDeleteLead,
  onEnrollLead,
  onNotifyLead
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Lead['status']>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    parentName: '',
    phone: '',
    birthDate: '',
    origin: 'Outros',
    categoryInterest: '',
    trialDate: '',
    trialTime: '',
    status: 'new',
    notes: ''
  });

  const stats = useMemo(() => ({
    total: leads.length,
    scheduled: leads.filter(l => l.status === 'trial_scheduled').length,
    attended: leads.filter(l => l.status === 'attended').length,
    converted: leads.filter(l => l.status === 'converted').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(0) : 0
  }), [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || (l.phone && l.phone.includes(searchTerm));
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) onUpdateLead(editingLead.id, formData);
    else onAddLead(formData);
    closeModal();
  };

  const handleOpenModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({ ...lead });
    } else {
      setEditingLead(null);
      setFormData({
        name: '', parentName: '', phone: '', birthDate: '',
        origin: 'Outros', categoryInterest: '', trialDate: '', 
        trialTime: '', status: 'new', notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight italic uppercase">Aulas Experimentais</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Gestão de interessados</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#8b31ff] hover:bg-[#7a28e0] text-white px-6 py-3 rounded-[10px] font-bold transition-all flex items-center gap-2 active:scale-95 shadow-lg"><Plus size={20} /> Nova Experimental</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <Users size={20} className="text-slate-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Leads</span>
            <span className="text-2xl font-black text-slate-800 italic">{stats.total}</span>
        </div>
        <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <CalendarCheck size={20} className="text-indigo-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Agendados</span>
            <span className="text-2xl font-black text-indigo-600 italic">{stats.scheduled}</span>
        </div>
        <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <CheckCircle2 size={20} className="text-emerald-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Compareceram</span>
            <span className="text-2xl font-black text-emerald-600 italic">{stats.attended}</span>
        </div>
        <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <Trophy size={20} className="text-amber-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Matriculados</span>
            <span className="text-2xl font-black text-amber-500 italic">{stats.converted}</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-[10px] shadow-lg text-center flex flex-col items-center col-span-2 md:col-span-1">
            <Target size={20} className="text-indigo-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Conversão</span>
            <span className="text-2xl font-black text-white italic">{stats.conversionRate}%</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[10px] shadow-sm border border-slate-100 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Buscar aluno..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-[10px] text-sm focus:ring-2 focus:ring-indigo-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="bg-slate-50 border-none rounded-[10px] px-6 py-3 text-sm font-bold text-slate-600 italic outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="all">Todos os Status</option>
          <option value="new">Novos</option>
          <option value="trial_scheduled">Agendados</option>
          <option value="attended">Compareceram</option>
          <option value="converted">Matriculados</option>
        </select>
        <button onClick={() => {setSearchTerm(''); setStatusFilter('all');}} className="p-3 bg-slate-50 text-slate-400 rounded-[10px] hover:bg-slate-100"><FilterX size={20} /></button>
      </div>

      <div className="space-y-4">
        {paginatedLeads.length > 0 ? paginatedLeads.map((lead) => (
          <div key={lead.id} className={`bg-white p-6 rounded-[10px] shadow-sm border ${lead.status === 'converted' ? 'border-amber-100 bg-amber-50/10' : 'border-slate-50'} flex items-center justify-between hover:border-indigo-100 transition-all`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-800 italic uppercase">{lead.name}</h3>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-[10px] ${lead.status === 'new' ? 'bg-slate-100 text-slate-400' : lead.status === 'attended' ? 'bg-emerald-600 text-white' : lead.status === 'trial_scheduled' ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'}`}>
                  {lead.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-6 text-slate-500 font-medium text-sm italic">
                <div className="flex items-center gap-2"><Phone size={16} /><span>{lead.phone || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><Calendar size={16} /><span>{lead.trialDate || '--/--/----'}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(lead.status === 'new' || lead.status === 'trial_scheduled') && <button onClick={() => onUpdateStatus(lead.id, 'attended')} className="bg-[#00c67d] text-white px-6 py-3 rounded-[10px] font-bold flex items-center gap-2 active:scale-95 italic shadow-lg"><CheckCircle2 size={18} /> Presença</button>}
              {lead.status !== 'converted' && <button onClick={() => onEnrollLead(lead)} className="bg-slate-900 text-white px-6 py-3 rounded-[10px] font-bold flex items-center gap-2 active:scale-95 italic shadow-lg"><UserPlus size={18} /> Matricular</button>}
              <button onClick={() => handleOpenModal(lead)} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-[10px] hover:text-indigo-600 transition-colors"><Edit2 size={20} /></button>
              <button onClick={() => onDeleteLead(lead.id)} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-[10px] hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
            </div>
          </div>
        )) : <div className="text-center py-20 bg-white rounded-[10px] border border-slate-100"><AlertCircle size={48} className="mx-auto text-slate-100 mb-4" /><p className="text-slate-400 italic">Nenhuma experimental encontrada.</p></div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-5 flex justify-between items-center border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 italic uppercase">Lead Experimental</h3>
              <button onClick={closeModal} className="text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="Nome do Aluno" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="text" placeholder="WhatsApp" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input type="text" placeholder="Responsável" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                <input type="date" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})}>
                    <option value="Outros">Outros</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Indicação">Indicação</option>
                </select>
                <input type="date" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[10px] text-sm" value={formData.trialDate} onChange={e => setFormData({...formData, trialDate: e.target.value})} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-[10px]">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-[#8b31ff] text-white font-bold rounded-[10px] shadow-lg">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMLeads;