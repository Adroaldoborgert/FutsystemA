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
  const [fees, setFees] = useState({ enrollmentFee: school.enrollmentFee || 0, uniformPrice: school.uniformPrice || 0 });
  const [formData, setFormData] = useState<any>({ category: { name: '' }, plan: { name: '', price: 0, dueDay: 10 }, team: { name: '', schedule: '', category: '', maxStudents: 20, active: true } });

  const handleAddOrUpdateConfig = async (table: string, data: any) => {
    let payload: any = {};
    if (table === 'school_monthly_plans') payload = { name: data.name, price: Number(data.price), dueDay: Number(data.dueDay) };
    else if (table === 'school_categories') payload = { name: data.name };
    else if (table === 'school_teams') {
      const scheduleString = tempSchedules.filter(s => s.day && s.time).map(s => `${s.day} ${s.time}`).join(', ');
      payload = { name: data.name, category: data.category, schedule: scheduleString, maxStudents: Number(data.maxStudents), active: data.active };
    }

    try {
      if (editingId) await supabase.from(table).update(payload).eq('id', editingId);
      else await supabase.from(table).insert([{ ...payload, school_id: school.id }]);
      onRefresh();
      closeAllModals();
    } catch (err) { alert("Erro ao salvar dados."); }
  };

  const closeAllModals = () => {
    setIsCategoryModalOpen(false); setIsPlanModalOpen(false); setIsTeamModalOpen(false);
    setEditingId(null); setTempSchedules([{ day: '', time: '' }]);
    setFormData({ category: { name: '' }, plan: { name: '', price: 0, dueDay: 10 }, team: { name: '', schedule: '', category: '', maxStudents: 20, active: true } });
  };

  const handleEditOpen = (tab: string, item: any) => {
    setEditingId(item.id);
    if (tab === 'categorias') { setFormData({ ...formData, category: { name: item.name } }); setIsCategoryModalOpen(true); }
    else if (tab === 'planos') { setFormData({ ...formData, plan: { name: item.name, price: item.price, dueDay: item.dueDay || 10 } }); setIsPlanModalOpen(true); }
    else if (tab === 'turmas') {
      setFormData({ ...formData, team: { name: item.name, category: item.category || '', maxStudents: item.maxStudents || 20, active: item.active !== false } });
      if (item.schedule) setTempSchedules(item.schedule.split(', ').map((p: any) => { const [d, t] = p.split(' '); return { day: d || '', time: t || '' }; }));
      setIsTeamModalOpen(true);
    }
  };

  const handleRemoveConfig = async (table: string, id: string) => { if (confirm('Excluir item?')) { await supabase.from(table).delete().eq('id', id); onRefresh(); } };

  const Switch = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
    <button onClick={onChange} className={`w-10 h-5 rounded-[10px] transition-all relative ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-[10px] transition-all ${active ? 'left-5.5' : 'left-0.5'}`} /></button>
  );

  const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold italic uppercase">Configurações</h2>
        {activeTab === 'escola' && <button onClick={() => onUpdateSettings(fees)} className="bg-emerald-600 text-white px-5 py-2 rounded-[10px] font-bold text-xs shadow-lg"><Save size={16} className="inline mr-2" /> Salvar</button>}
      </div>

      <div className="flex gap-6 border-b border-slate-100 overflow-x-auto scrollbar-hide">
        {['escola', 'categorias', 'planos', 'turmas'].map(tab => <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 text-xs font-bold transition-all relative capitalize ${activeTab === tab ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400'}`}>{tab}</button>)}
      </div>

      {activeTab === 'escola' ? (
        <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-sm grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50/50 rounded-[10px] border border-slate-100 space-y-2">
            <h4 className="font-bold text-xs">Matrícula (R$)</h4>
            <input type="number" className="w-full p-1.5 bg-white border border-slate-200 rounded-[10px] text-sm font-bold" value={fees.enrollmentFee} onChange={e => setFees({...fees, enrollmentFee: Number(e.target.value)})} />
          </div>
          <div className="p-4 bg-slate-50/50 rounded-[10px] border border-slate-100 space-y-2">
            <h4 className="font-bold text-xs">Uniforme (R$)</h4>
            <input type="number" className="w-full p-1.5 bg-white border border-slate-200 rounded-[10px] text-sm font-bold" value={fees.uniformPrice} onChange={e => setFees({...fees, uniformPrice: Number(e.target.value)})} />
          </div>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-[10px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center"><h3 className="text-sm font-bold uppercase">{activeTab}</h3><button onClick={() => { setEditingId(null); if(activeTab==='categorias') setIsCategoryModalOpen(true); if(activeTab==='planos') setIsPlanModalOpen(true); if(activeTab==='turmas') setIsTeamModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-1.5 rounded-[10px] text-xs font-bold shadow-md">+ Nova</button></div>
          <div className="space-y-2">
            {(activeTab === 'categorias' ? config.categories : activeTab === 'planos' ? config.monthlyPlans : config.teams).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-[10px] group shadow-sm">
                <span className="font-bold text-slate-800 uppercase italic text-xs">{item.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => handleEditOpen(activeTab, item)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit size={14}/></button><button onClick={() => handleRemoveConfig(activeTab==='categorias'?'school_categories':activeTab==='planos'?'school_monthly_plans':'school_teams', item.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(isCategoryModalOpen || isPlanModalOpen || isTeamModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-md overflow-hidden p-5 space-y-4">
            <h3 className="font-bold uppercase text-sm">Gerenciar {activeTab}</h3>
            {activeTab === 'categorias' && <input placeholder="Nome" className="w-full p-2 bg-slate-50 border rounded-[10px] text-sm" value={formData.category.name} onChange={e => setFormData({...formData, category: {name: e.target.value}})} />}
            {activeTab === 'planos' && <div className="space-y-3"><input placeholder="Nome" className="w-full p-2 bg-slate-50 border rounded-[10px] text-sm" value={formData.plan.name} onChange={e => setFormData({...formData, plan: {...formData.plan, name: e.target.value}})} /><input type="number" placeholder="Preço" className="w-full p-2 bg-slate-50 border rounded-[10px] text-sm" value={formData.plan.price} onChange={e => setFormData({...formData, plan: {...formData.plan, price: Number(e.target.value)}})} /></div>}
            <button onClick={() => handleAddOrUpdateConfig(activeTab==='categorias'?'school_categories':activeTab==='planos'?'school_monthly_plans':'school_teams', activeTab==='categorias'?formData.category:activeTab==='planos'?formData.plan:formData.team)} className="w-full py-3 bg-emerald-600 text-white font-black rounded-[10px] uppercase text-xs">Confirmar</button>
            <button onClick={closeAllModals} className="w-full py-2 text-slate-400 text-xs">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;