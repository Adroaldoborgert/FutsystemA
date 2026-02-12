
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
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Lead, SchoolConfig, School } from '../types';

interface CRMLeadsProps {
  leads: Lead[];
  config: SchoolConfig;
  school: School;
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
  school,
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

  // Paginação
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
    notes: '',
    unit: ''
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

  // Reset paginação ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      onUpdateLead(editingLead.id, formData);
    } else {
      onAddLead(formData);
    }
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
        trialTime: '', status: 'new', notes: '', unit: ''
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
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 font-medium italic">Gestão de novos interessados</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#8b31ff] hover:bg-[#7a28e0] text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
        >
          <Plus size={20} /> Nova Experimental
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Users size={20} className="text-slate-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Leads</span>
            <span className="text-2xl font-black text-slate-800 italic">{stats.total}</span>
        </div>
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <CalendarCheck size={20} className="text-indigo-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Agendados</span>
            <span className="text-2xl font-black text-indigo-600 italic">{stats.scheduled}</span>
        </div>
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <CheckCircle2 size={20} className="text-emerald-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Compareceram</span>
            <span className="text-2xl font-black text-emerald-600 italic">{stats.attended}</span>
        </div>
        <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Trophy size={20} className="text-amber-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Matriculados</span>
            <span className="text-2xl font-black text-amber-500 italic">{stats.converted}</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-[1.5rem] shadow-lg flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
            <Target size={20} className="text-indigo-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Conversão</span>
            <span className="text-2xl font-black text-white italic">{stats.conversionRate}%</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou WhatsApp..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/10 italic"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">Todos os Status</option>
          <option value="new">Novos</option>
          <option value="trial_scheduled">Agendados</option>
          <option value="attended">Compareceram</option>
          <option value="converted">Matriculados</option>
        </select>

        <button 
          onClick={() => {setSearchTerm(''); setStatusFilter('all');}}
          className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors"
        >
          <FilterX size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {paginatedLeads.length > 0 ? paginatedLeads.map((lead) => (
          <div key={lead.id} className={`bg-white p-6 rounded-[2rem] shadow-sm border ${lead.status === 'converted' ? 'border-amber-100 bg-amber-50/10' : 'border-slate-50'} flex items-center justify-between hover:border-indigo-100 transition-all group overflow-hidden`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-800 italic uppercase tracking-tighter">{lead.name}</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  lead.status === 'new' ? 'bg-slate-100 text-slate-400' : 
                  lead.status === 'attended' ? 'bg-emerald-600 text-white shadow-sm' : 
                  lead.status === 'trial_scheduled' ? 'bg-indigo-600 text-white shadow-sm' :
                  'bg-amber-500 text-white shadow-sm'
                }`}>
                  {lead.status === 'new' ? 'NOVO' : 
                   lead.status === 'attended' ? 'COMPARECEU' : 
                   lead.status === 'trial_scheduled' ? 'AGENDADO' : 'MATRICULADO'}
                </span>
                {lead.unit && (
                  <span className="text-[9px] font-black text-slate-400 border border-slate-100 px-2 py-0.5 rounded italic">
                    {lead.unit}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-6 text-slate-500 font-medium text-sm italic">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-300" />
                  <span>{lead.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Baby size={16} className="text-slate-300" />
                  <span>{lead.birthDate ? new Date(lead.birthDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-300" />
                  <span>{lead.trialDate ? new Date(lead.trialDate).toLocaleDateString('pt-BR') : '--/--/----'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-300" />
                  <span>{lead.trialTime || '--:--'}</span>
                </div>
              </div>

              <div className="mt-1 flex gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-500 px-3 py-1 rounded-lg border border-indigo-100">
                  {lead.origin || 'OUTRO'}
                </span>
                {lead.categoryInterest && (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-lg border border-amber-100">
                    {lead.categoryInterest}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lead.status === 'new' || lead.status === 'trial_scheduled' ? (
                <button 
                  onClick={() => onUpdateStatus(lead.id, 'attended')}
                  className="bg-[#00c67d] hover:bg-[#00b06f] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-50 active:scale-95 italic"
                >
                  <CheckCircle2 size={18} /> Confirmar Presença
                </button>
              ) : null}

              {lead.status !== 'converted' && (
                <button 
                  onClick={() => onEnrollLead(lead)}
                  className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 italic"
                >
                  <UserPlus size={18} /> Matricular
                </button>
              )}
              
              <button onClick={() => handleOpenModal(lead)} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <Edit2 size={20} />
              </button>
              
              <button onClick={() => onDeleteLead(lead.id)} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium italic">Nenhuma aula experimental encontrada para este filtro.</p>
          </div>
        )}
      </div>

      {/* Barra de Paginação */}
      {totalPages > 1 && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-medium italic">
            Exibindo {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredLeads.length)} de {filteredLeads.length} leads
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 flex justify-between items-center border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 italic uppercase tracking-tighter">{editingLead ? 'Editar Cadastro' : 'Nova Aula Experimental'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nome do Aluno *</label>
                  <input required type="text" placeholder="Digite o nome completo do aluno" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold italic text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">WhatsApp *</label>
                  <input required type="text" placeholder="(00) 00000-0000" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-bold text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Responsável</label>
                  <input type="text" placeholder="Nome do pai, mãe ou tutor" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data de Nascimento</label>
                  <input type="date" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Origem</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none italic font-bold text-sm" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})}>
                    <option value="Outros">Outros</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Categoria Interesse</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={formData.categoryInterest} onChange={e => setFormData({...formData, categoryInterest: e.target.value})}>
                    <option value="">Selecione</option>
                    {config.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                {school.hasMultipleUnits && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Unidade *</label>
                    <div className="relative">
                      <select 
                        required 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none font-bold italic text-sm" 
                        value={formData.unit} 
                        onChange={e => setFormData({...formData, unit: e.target.value})}
                      >
                        <option value="">Selecione a unidade</option>
                        {config.units.filter(u => u.isActive).map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status Inicial</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none italic text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="new">Novo</option>
                    <option value="trial_scheduled">Agendado</option>
                    <option value="attended">Compareceu</option>
                    <option value="converted">Matriculado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data da Aula</label>
                  <input type="date" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={formData.trialDate} onChange={e => setFormData({...formData, trialDate: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Horário</label>
                  <input type="time" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={formData.trialTime} onChange={e => setFormData({...formData, trialTime: e.target.value})} />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all shadow-sm border text-xs">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-[#8b31ff] text-white font-bold rounded-2xl hover:bg-[#7a28e0] transition-all shadow-lg shadow-purple-50 italic text-xs">
                  {editingLead ? 'Atualizar Lead' : 'Salvar Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMLeads;
