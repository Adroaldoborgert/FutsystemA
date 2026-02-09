import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Trash2, Edit, DollarSign, Users, Layout, GraduationCap, X, ChevronDown, Building2, Shirt, Clock } from 'lucide-react';
import { School, SchoolConfig } from '../types';
import { supabase } from '../services/supabase';

interface SchoolSettingsProps {
  school: School;
  config: SchoolConfig;
  onUpdateSettings: (updates: Partial<School>) => void;
  onRefresh: () => void;
}

const SchoolSettings: React.FC<SchoolSettingsProps> = ({ school, config, onUpdateSettings, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'categorias' | 'planos' | 'turmas' | 'escola'>('escola');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tempSchedules, setTempSchedules] = useState<{ day: string, time: string }[]>([{ day: '', time: '' }]);

  const [fees, setFees] = useState({
    enrollmentFee: school.enrollmentFee || 0,
    uniformPrice: school.uniformPrice || 0
  });

  const [formData, setFormData] = useState<any>({
    category: { name: '' },
    plan: { name: '', price: 0, dueDay: 10 },
    team: { name: '', schedule: '', category: '', maxStudents: 20, active: true }
  });

  const handleAddOrUpdateConfig = async (table: string, data: any) => {
    let payload: any = {};
    
    // Mapeamento corrigido para utilizar camelCase (dueDay) conforme provável estrutura do banco
    if (table === 'school_monthly_plans') {
      payload = {
        name: data.name,
        price: Number(data.price),
        dueDay: Number(data.dueDay)
      };
    } else if (table === 'school_categories') {
      payload = {
        name: data.name
      };
    } else if (table === 'school_teams') {
      const scheduleString = tempSchedules
        .filter(s => s.day && s.time)
        .map(s => `${s.day} ${s.time}`)
        .join(', ');
      
      payload = {
        name: data.name,
        category: data.category,
        schedule: scheduleString,
        maxStudents: Number(data.maxStudents),
        active: data.active
      };
    }

    try {
      if (editingId) {
        const { error } = await supabase.from(table).update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert([{ ...payload, school_id: school.id }]);
        if (error) throw error;
      }
      onRefresh();
      closeAllModals();
    } catch (err) {
      console.error(`Erro ao salvar em ${table}:`, err);
      alert("Erro ao salvar dados. Verifique se as colunas 'dueDay' ou 'maxStudents' existem na tabela.");
    }
  };

  const closeAllModals = () => {
    setIsCategoryModalOpen(false);
    setIsPlanModalOpen(false);
    setIsTeamModalOpen(false);
    setEditingId(null);
    setTempSchedules([{ day: '', time: '' }]);
    setFormData({
      category: { name: '' },
      plan: { name: '', price: 0, dueDay: 10 },
      team: { name: '', schedule: '', category: '', maxStudents: 20, active: true }
    });
  };

  const handleEditOpen = (tab: string, item: any) => {
    setEditingId(item.id);
    if (tab === 'categorias') {
      setFormData({ ...formData, category: { name: item.name } });
      setIsCategoryModalOpen(true);
    } else if (tab === 'planos') {
      setFormData({ ...formData, plan: { name: item.name, price: item.price, dueDay: item.dueDay || 10 } });
      setIsPlanModalOpen(true);
    } else if (tab === 'turmas') {
      setFormData({ ...formData, team: { name: item.name, schedule: item.schedule || '', category: item.category || '', maxStudents: item.maxStudents || 20, active: item.active !== false } });
      
      if (item.schedule) {
        const parts = item.schedule.split(', ');
        const parsed = parts.map((p: string) => {
          const [day, time] = p.split(' ');
          return { day: day || '', time: time || '' };
        });
        setTempSchedules(parsed);
      } else {
        setTempSchedules([{ day: '', time: '' }]);
      }
      
      setIsTeamModalOpen(true);
    }
  };

  const handleRemoveConfig = async (table: string, id: string) => {
    if (confirm('Deseja realmente excluir este item?')) {
      await supabase.from(table).delete().eq('id', id);
      onRefresh();
    }
  };

  const Switch = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-5.5' : 'left-0.5'}`} />
    </button>
  );

  const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  const addScheduleLine = () => setTempSchedules([...tempSchedules, { day: '', time: '' }]);
  const updateScheduleLine = (index: number, field: 'day' | 'time', value: string) => {
    const newList = [...tempSchedules];
    newList[index][field] = value;
    setTempSchedules(newList);
  };
  const removeScheduleLine = (index: number) => {
    if (tempSchedules.length > 1) {
      setTempSchedules(tempSchedules.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight italic uppercase">Configurações</h2>
          <p className="text-slate-400 text-[10px] italic font-medium uppercase tracking-widest">Gestão operacional da unidade</p>
        </div>
        {activeTab === 'escola' && (
          <button 
            onClick={() => onUpdateSettings(fees)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 text-xs"
          >
            <Save size={16} /> Salvar
          </button>
        )}
      </div>

      <div className="flex gap-6 border-b border-slate-100 overflow-x-auto scrollbar-hide">
        {[
          { id: 'escola', label: 'Escola' },
          { id: 'categorias', label: 'Categorias' },
          { id: 'planos', label: 'Planos' },
          { id: 'turmas', label: 'Turmas' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 animate-in fade-in slide-in-from-left-2" />}
          </button>
        ))}
      </div>

      {activeTab === 'escola' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Building2 size={18} className="text-emerald-600" />
              <h3 className="font-bold italic uppercase tracking-tighter text-sm">Minha Unidade</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500" />
                    <h4 className="font-bold text-slate-700 text-xs">Matrícula</h4>
                  </div>
                  <Switch active={fees.enrollmentFee > 0} onChange={() => setFees({ ...fees, enrollmentFee: fees.enrollmentFee > 0 ? 0 : 50 })} />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                  <input 
                    type="number"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold italic text-sm"
                    value={fees.enrollmentFee}
                    onChange={e => setFees({...fees, enrollmentFee: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Shirt size={16} className="text-indigo-500" />
                  <h4 className="font-bold text-slate-700 text-xs">Uniforme</h4>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                  <input 
                    type="number"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold italic text-sm"
                    value={fees.uniformPrice}
                    onChange={e => setFees({...fees, uniformPrice: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'escola' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 italic uppercase tracking-tighter">Gerenciar {activeTab}</h3>
            <button 
              onClick={() => {
                setEditingId(null);
                if(activeTab === 'categorias') setIsCategoryModalOpen(true);
                if(activeTab === 'planos') setIsPlanModalOpen(true);
                if(activeTab === 'turmas') setIsTeamModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <Plus size={14} /> Nova
            </button>
          </div>

          <div className="space-y-2">
            {activeTab === 'categorias' && config.categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-100 transition-all group shadow-sm">
                <div>
                  <span className="font-bold text-slate-800 uppercase italic text-xs">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditOpen('categorias', cat)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={14}/></button>
                  <button onClick={() => handleRemoveConfig('school_categories', cat.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}

            {activeTab === 'planos' && config.monthlyPlans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-100 transition-all group shadow-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 uppercase italic text-xs">{plan.name}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Ativo</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium italic uppercase">
                    R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Venc. dia {plan.dueDay || 10}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditOpen('planos', plan)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={14}/></button>
                  <button onClick={() => handleRemoveConfig('school_monthly_plans', plan.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}

            {activeTab === 'turmas' && config.teams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-100 transition-all group shadow-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 uppercase italic text-xs">{team.name}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Ativa</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium italic uppercase">
                    {team.schedule || 'S/ Horário'} • {team.category || 'S/ Categoria'}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditOpen('turmas', team)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={14}/></button>
                  <button onClick={() => handleRemoveConfig('school_teams', team.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 italic uppercase tracking-tighter text-sm">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">Nome da Categoria *</label>
                <input placeholder="Ex: Sub-7" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold italic text-sm" value={formData.category.name} onChange={e => setFormData({...formData, category: { name: e.target.value }})} />
              </div>
              <button onClick={() => handleAddOrUpdateConfig('school_categories', { name: formData.category.name })} className="w-full py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 uppercase italic tracking-widest text-xs">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 italic uppercase tracking-tighter text-sm">{editingId ? 'Editar Plano' : 'Novo Plano'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">Nome do Plano *</label>
                <input placeholder="Ex: Mensal Ouro" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold italic text-sm" value={formData.plan.name} onChange={e => setFormData({...formData, plan: {...formData.plan, name: e.target.value}})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">Valor *</label>
                  <input type="number" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold italic text-sm" value={formData.plan.price} onChange={e => setFormData({...formData, plan: {...formData.plan, price: Number(e.target.value)}})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">Dia Venc. *</label>
                  <input type="number" max="28" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold italic text-sm" value={formData.plan.dueDay} onChange={e => setFormData({...formData, plan: {...formData.plan, dueDay: Number(e.target.value)}})} />
                </div>
              </div>
              <button onClick={() => handleAddOrUpdateConfig('school_monthly_plans', { name: formData.plan.name, price: formData.plan.price, dueDay: formData.plan.dueDay })} className="w-full py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 uppercase italic tracking-widest text-xs">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 italic uppercase tracking-tighter text-sm">{editingId ? 'Editar Turma' : 'Nova Turma'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">Nome da Turma *</label>
                <input placeholder="Ex: Turma A" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold italic text-sm" value={formData.team.name} onChange={e => setFormData({...formData, team: {...formData.team, name: e.target.value}})} />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">Horário</label>
                {tempSchedules.map((schedule, idx) => (
                  <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                    <div className="flex-1 relative">
                      <select 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none font-bold text-xs italic pr-8"
                        value={schedule.day}
                        onChange={(e) => updateScheduleLine(idx, 'day', e.target.value)}
                      >
                        <option value="">Dia</option>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="w-24 relative">
                      <input 
                        type="time" 
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs italic"
                        value={schedule.time}
                        onChange={(e) => updateScheduleLine(idx, 'time', e.target.value)}
                      />
                    </div>
                    {idx === tempSchedules.length - 1 ? (
                      <button onClick={addScheduleLine} className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors"><Plus size={16} /></button>
                    ) : (
                      <button onClick={() => removeScheduleLine(idx)} className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-600 rounded-xl transition-colors"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">Categoria</label>
                  <div className="relative">
                    <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none font-bold italic cursor-pointer text-xs" value={formData.team.category} onChange={e => setFormData({...formData, team: {...formData.team, category: e.target.value}})}>
                      <option value="">Sel.</option>
                      {config.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase italic tracking-widest">Máx. Alunos</label>
                  <input type="number" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold italic text-sm" value={formData.team.maxStudents} onChange={e => setFormData({...formData, team: {...formData.team, maxStudents: Number(e.target.value)}})} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <span className="text-xs font-bold text-slate-700 italic">Ativa</span>
                <Switch active={formData.team.active} onChange={() => setFormData({...formData, team: {...formData.team, active: !formData.team.active}})} />
              </div>

              <button onClick={() => handleAddOrUpdateConfig('school_teams', { name: formData.team.name, category: formData.team.category, maxStudents: formData.team.maxStudents, active: formData.team.active })} className="w-full py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 uppercase italic tracking-widest text-xs">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;