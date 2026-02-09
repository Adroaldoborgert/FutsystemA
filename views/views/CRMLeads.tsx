
import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  Edit2, 
  Trash2, 
  X, 
  ChevronDown,
  FilterX,
  AlertCircle,
  Phone
} from 'lucide-react';
import { Lead, SchoolConfig } from '../../types';

interface CRMLeadsProps {
  leads: Lead[];
  config: SchoolConfig;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
  onAddLead: (lead: Partial<Lead>) => void;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onDeleteLead: (leadId: string) => void;
}

const CRMLeads: React.FC<CRMLeadsProps> = ({ leads, config, onUpdateStatus, onAddLead, onUpdateLead, onDeleteLead }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Fix: Replace 'age' with 'birthDate' and remove 'neighborhood' as they are not in Lead interface
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

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.phone && l.phone.includes(searchTerm))
  );

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
      setFormData(lead);
    } else {
      setEditingLead(null);
      // Fix: Replace 'age' with 'birthDate' and remove 'neighborhood' as they are not in Lead interface
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

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${name}, tudo bem? Sou da escolinha e gostaria de confirmar sua aula experimental!`);
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight italic">Aulas Experimentais</h2>
          <p className="text-slate-500 mt-1 font-medium">Acompanhe seu funil de conversão e agendamentos</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#8b31ff] hover:bg-[#7a28e0] text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
        >
          <Plus size={20} /> Nova Experimental
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou WhatsApp..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
          <FilterX size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between hover:border-indigo-100 transition-all group relative overflow-hidden">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-800">{lead.name}</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  lead.status === 'new' ? 'bg-slate-100 text-slate-400' : 
                  lead.status === 'attended' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-500'
                }`}>
                  {lead.status === 'new' ? 'NOVO' : lead.status === 'attended' ? 'COMPARECEU' : 'AGENDADO'}
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-slate-500 font-medium text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-300" />
                  <span>{lead.phone || 'N/A'}</span>
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
              {lead.status !== 'attended' && (
                <button 
                  onClick={() => onUpdateStatus(lead.id, 'attended')}
                  className="bg-[#00c67d] hover:bg-[#00b06f] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-50 active:scale-95"
                >
                  <CheckCircle2 size={18} /> Compareceu
                </button>
              )}
              
              <button 
                onClick={() => handleWhatsApp(lead.phone, lead.name)}
                className="p-3 bg-white border border-slate-100 text-[#25D366] rounded-2xl hover:bg-emerald-50 transition-colors"
              >
                <MessageCircle size={20} />
              </button>
              
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
            <p className="text-slate-400 font-medium">Nenhum registro encontrado.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{editingLead ? 'Editar Experimental' : 'Nova Aula Experimental'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tighter text-[10px]">Nome do Aluno *</label>
                  <input required type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tighter text-[10px]">WhatsApp *</label>
                  <input required type="text" placeholder="(00) 00000-0000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tighter text-[10px]">Origem</label>
                  <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})}>
                    <option value="Outros">Outros</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tighter text-[10px]">Categoria</label>
                  <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none" value={formData.categoryInterest} onChange={e => setFormData({...formData, categoryInterest: e.target.value})}>
                    <option value="">Selecione</option>
                    {config.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tighter text-[10px]">Data da Aula</label>
                  <input type="date" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.trialDate} onChange={e => setFormData({...formData, trialDate: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tighter text-[10px]">Horário</label>
                  <input type="time" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.trialTime} onChange={e => setFormData({...formData, trialTime: e.target.value})} />
                </div>
              </div>
              <div className="pt-2 flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-[#8b31ff] text-white font-bold rounded-2xl hover:bg-[#7a28e0] transition-all">Salvar Experimental</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMLeads;
