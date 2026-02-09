
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
  User, 
  Phone,
  FilterX,
  ChevronDown,
  X,
  MapPin,
  Tag
} from 'lucide-react';
import { Lead } from '../types';

interface CRMLeadsProps {
  leads: Lead[];
  onConvert: (leadId: string) => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
  onAddLead: (lead: Partial<Lead>) => void;
}

const CRMLeads: React.FC<CRMLeadsProps> = ({ leads, onConvert, onUpdateStatus, onAddLead }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    parentName: '',
    phone: '',
    age: '',
    neighborhood: '',
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
    onAddLead(formData);
    setIsModalOpen(false);
    setFormData({
      name: '', parentName: '', phone: '', age: '', neighborhood: '', 
      origin: 'Outros', categoryInterest: '', trialDate: '', 
      trialTime: '', status: 'new', notes: ''
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Aulas Experimentais</h2>
          <p className="text-slate-500 mt-1 font-medium">Controle de interessados e agendamentos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
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
            placeholder="Nome ou WhatsApp..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <select className="appearance-none bg-slate-50 px-6 py-3 pr-10 rounded-2xl text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>Todas as origens</option>
            <option>Instagram</option>
            <option>Indicação</option>
            <option>Outro</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>

        <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
          <FilterX size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between hover:border-indigo-100 transition-all group">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-800">{lead.name}</h3>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  lead.status === 'new' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-500'
                }`}>
                  {lead.status === 'new' ? 'NOVO' : 'AGENDADO'}
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-slate-500 font-medium text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-300" />
                  <span>{lead.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-300" />
                  <span>{lead.age || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-300" />
                  <span>{lead.trialDate || '--/--/----'}</span>
                </div>
              </div>

              <div className="mt-1 flex gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-500 px-3 py-1 rounded-lg border border-indigo-100">
                  {lead.origin || 'OUTRO'}
                </span>
                {lead.parentName && (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                    Responsável: {lead.parentName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => onUpdateStatus(lead.id, 'attended')}
                className="bg-[#00c67d] hover:bg-[#00b06f] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-50 active:scale-95"
              >
                <CheckCircle2 size={18} /> Compareceu
              </button>
              
              <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Nova Aula Experimental</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nome do Aluno *</label>
                  <input 
                    required
                    type="text"
                    placeholder="Ex: João Silva"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nome do Responsável</label>
                  <input 
                    type="text"
                    placeholder="Pai ou Mãe"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    value={formData.parentName}
                    onChange={e => setFormData({...formData, parentName: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">WhatsApp *</label>
                  <input 
                    required
                    type="text"
                    placeholder="(00) 00000-0000"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Idade</label>
                  <input 
                    type="text"
                    placeholder="Ex: 8 anos"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none"
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Origem *</label>
                  <select 
                    required
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none appearance-none"
                    value={formData.origin}
                    onChange={e => setFormData({...formData, origin: e.target.value})}
                  >
                    <option value="Outros">Outros</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Categoria de Interesse</label>
                  <select 
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none"
                    value={formData.categoryInterest}
                    onChange={e => setFormData({...formData, categoryInterest: e.target.value})}
                  >
                    <option value="">Selecione</option>
                    <option value="Sub-7">Sub-7</option>
                    <option value="Sub-9">Sub-9</option>
                    <option value="Sub-11">Sub-11</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Data da Aula</label>
                  <input 
                    type="date"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none"
                    value={formData.trialDate}
                    onChange={e => setFormData({...formData, trialDate: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Horário</label>
                  <input 
                    type="time"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none"
                    value={formData.trialTime}
                    onChange={e => setFormData({...formData, trialTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-[#8b31ff] text-white font-bold rounded-2xl hover:bg-[#7a28e0] transition-all"
                >
                  Salvar Cadastro
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
