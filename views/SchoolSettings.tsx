
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
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
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
    <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight italic uppercase">Configurações Gerais</h2>
          <p className="text-slate-400 text-sm italic font-medium">Gestão administrativa e operacional da sua unidade</p>
        </div>
        {activeTab === 'escola' && (
          <button 
            onClick={() => onUpdateSettings(fees)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Save size={18} /> Salvar Configurações
          </button>
        )}
      </div>

      <div className="flex gap-8 border-b border-slate-100 overflow-x-auto scrollbar-hide">
        {[
          { id: 'escola', label: 'Minha Escola' },
          { id: 'categorias', label: 'Categorias' },
          { id: 'planos', label: 'Planos' },
          { id: 'turmas', label: 'Turmas' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 animate-in fade-in slide-in-from-left-2" />}
          </button>
        ))}
      </div>

      {activeTab === 'escola' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-slate-800">
              <Building2 size={24} className="text-emerald-600" />
              <h3 className="text-xl font-bold italic uppercase tracking-tighter">Minha Unidade</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-500" />
                    <h4 className="font-bold text-slate-700">Taxa de Matrícula</h4>
                  </div>
                  <Switch active={fees.enrollmentFee > 0} onChange={() => setFees({ ...fees, enrollmentFee: fees.enrollmentFee > 0 ? 0 : 50 })} />
                </div>
                <p className="text-xs text-slate-400 italic">Cobrança automática gerada ao matricular novos alunos.</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                  <input 
                    type="number"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold italic"
                    value={fees.enrollmentFee}
                    onChange={e => setFees({...fees, enrollmentFee: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Shirt size={18} className="text-indigo-500" />
                  <h4 className="font-bold text-slate-700">Valor do Uniforme</h4>
                </div>
                <p className="text-xs text-slate-400 italic">Valor base para kits de treinamento (opcional).</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                  <input 
                    type="number"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold italic"
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
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 italic uppercase tracking-tighter">Gerenciar {activeTab}</h3>
            <button 
              onClick={() => {
                setEditingId(null);
                if(activeTab === 'categorias') setIsCategoryModalOpen(true);
                if(activeTab === 'planos') setIsPlanModalOpen(true);
                if(activeTab === 'turmas') setIsTeamModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-100"
            >
              <Plus size={16} /> Nova {activeTab.slice(0, -1)}
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === 'categorias' && config.categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-100 transition-all group shadow-sm">
                <div>
                  <span className="font-bold text-slate-800 uppercase italic">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditOpen('categorias', cat)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16}/></button>
                  <button onClick={() => handleRemoveConfig('school_categories', cat.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}

            {activeTab === 'planos' && config.monthlyPlans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-100 transition-all group shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 uppercase italic">{plan.name}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Ativo</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium italic">
                    R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Vencimento dia {plan.dueDay || 10}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditOpen('planos', plan)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16}/></button>
                  <button onClick={() => handleRemoveConfig('school_monthly_plans', plan.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}

            {activeTab === 'turmas' && config.teams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-100 transition-all group shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 uppercase italic">{team.name}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Ativa</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium italic">
                    {team.schedule || 'Horário não definido'} • {team.category || 'Sem categoria'}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditOpen('turmas', team)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16}/></button>
                  <button onClick={() => handleRemoveConfig('school_teams', team.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 italic uppercase tracking-tighter">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase italic">Nome da Categoria *</label>
                <input placeholder="Ex: Sub-7" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold italic" value={formData.category.name} onChange={e => setFormData({...formData, category: { name: e.target.value }})} />
              </div>
              <button onClick={() => handleAddOrUpdateConfig('school_categories', { name: formData.category.name })} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 uppercase italic tracking-widest">
                {editingId ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 italic uppercase tracking-tighter">{editingId ? 'Editar Plano' : 'Novo Plano'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase italic">Nome do Plano *</label>
                <input placeholder="Ex: Mensal Ouro" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold italic" value={formData.plan.name} onChange={e => setFormData({...formData, plan: {...formData.plan, name: e.target.value}})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase italic">Valor Mensal *</label>
                  <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold italic" value={formData.plan.price} onChange={e => setFormData({...formData, plan: {...formData.plan, price: Number(e.target.value)}})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase italic">Dia de Vencimento *</label>
                  <input type="number" max="28" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold italic" value={formData.plan.dueDay} onChange={e => setFormData({...formData, plan: {...formData.plan, dueDay: Number(e.target.value)}})} />
                </div>
              </div>
              <button onClick={() => handleAddOrUpdateConfig('school_monthly_plans', { name: formData.plan.name, price: formData.plan.price, dueDay: formData.plan.dueDay })} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 uppercase italic tracking-widest">
                {editingId ? 'Salvar Alterações' : 'Criar Plano'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 italic uppercase tracking-tighter">{editingId ? 'Editar Turma' : 'Nova Turma'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase italic">Nome da Turma *</label>
                <input placeholder="Ex: Turma A - Manhã" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold italic" value={formData.team.name} onChange={e => setFormData({...formData, team: {...formData.team, name: e.target.value}})} />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase italic">Horário</label>
                {tempSchedules.map((schedule, idx) => (
                  <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                    <div className="flex-1 relative">
                      <select 
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none font-bold text-sm italic pr-10"
                        value={schedule.day}
                        onChange={(e) => updateScheduleLine(idx, 'day', e.target.value)}
                      >
                        <option value="">Dia</option>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="w-32 relative">
                      <input 
                        type="time" 
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm italic"
                        value={schedule.time}
                        onChange={(e) => updateScheduleLine(idx, 'time', e.target.value)}
                      />
                    </div>
                    {idx === tempSchedules.length - 1 ? (
                      <button 
                        onClick={addScheduleLine}
                        className="p-3.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => removeScheduleLine(idx)}
                        className="p-3.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase italic">Categoria</label>
                  <div className="relative">
                    <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none font-bold italic cursor-pointer focus:ring-2 focus:ring-emerald-500/10" value={formData.team.category} onChange={e => setFormData({...formData, team: {...formData.team, category: e.target.value}})}>
                      <option value="">Selecione...</option>
                      {config.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase italic">Máx. Alunos</label>
                  <input type="number" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold italic" value={formData.team.maxStudents} onChange={e => setFormData({...formData, team: {...formData.team, maxStudents: Number(e.target.value)}})} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <span className="text-sm font-bold text-slate-700 italic">Turma Ativa</span>
                <Switch active={formData.team.active} onChange={() => setFormData({...formData, team: {...formData.team, active: !formData.team.active}})} />
              </div>

              <button onClick={() => handleAddOrUpdateConfig('school_teams', { name: formData.team.name, category: formData.team.category, maxStudents: formData.team.maxStudents, active: formData.team.active })} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 uppercase italic tracking-widest">
                {editingId ? 'Salvar Alterações' : 'Criar Turma'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;
