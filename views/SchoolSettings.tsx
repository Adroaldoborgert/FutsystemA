
import React, { useState } from 'react';
import { Settings, Save, Plus, Trash2, DollarSign, Users, Layout, GraduationCap } from 'lucide-react';
import { School, SchoolConfig } from '../types';
import { supabase } from '../services/supabase';

interface SchoolSettingsProps {
  school: School;
  config: SchoolConfig;
  onUpdateSettings: (updates: Partial<School>) => void;
  onRefresh: () => void;
}

const SchoolSettings: React.FC<SchoolSettingsProps> = ({ school, config, onUpdateSettings, onRefresh }) => {
  const [fees, setFees] = useState({
    enrollmentFee: school.enrollmentFee || 0,
    uniformPrice: school.uniformPrice || 0
  });

  const [newItems, setNewItems] = useState({ category: '', team: '', planName: '', planPrice: 0 });

  const handleAddConfig = async (table: string, data: any) => {
    await supabase.from(table).insert([{ ...data, school_id: school.id }]);
    onRefresh();
    setNewItems({ ...newItems, category: '', team: '', planName: '', planPrice: 0 });
  };

  const handleRemoveConfig = async (table: string, id: string) => {
    await supabase.from(table).delete().eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configurações da Unidade</h2>
          <p className="text-slate-500">Personalize taxas, turmas e planos de pagamento para seus alunos</p>
        </div>
        <button 
          onClick={() => onUpdateSettings(fees)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Save size={20} /> Salvar Alterações Globais
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taxas Financeiras */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <DollarSign size={20} />
            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">Taxas e Preços</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor da Matrícula (R$)</label>
              <input 
                type="number"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={fees.enrollmentFee}
                onChange={e => setFees({...fees, enrollmentFee: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Valor do Kit Uniforme (R$)</label>
              <input 
                type="number"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={fees.uniformPrice}
                onChange={e => setFees({...fees, uniformPrice: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>

        {/* Planos de Mensalidade */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-emerald-600">
            <Layout size={20} />
            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">Planos de Alunos</h3>
          </div>
          <div className="space-y-3 mb-4">
            {config.monthlyPlans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">{plan.name} - R$ {plan.price}</span>
                <button onClick={() => handleRemoveConfig('school_monthly_plans', plan.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              placeholder="Nome (Ex: Mensal)" 
              className="flex-1 p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none"
              value={newItems.planName}
              onChange={e => setNewItems({...newItems, planName: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="R$" 
              className="w-24 p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none"
              value={newItems.planPrice}
              onChange={e => setNewItems({...newItems, planPrice: Number(e.target.value)})}
            />
            <button onClick={() => handleAddConfig('school_monthly_plans', { name: newItems.planName, price: newItems.planPrice })} className="p-2 bg-indigo-600 text-white rounded-lg"><Plus size={20}/></button>
          </div>
        </div>

        {/* Categorias */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-amber-600">
            <GraduationCap size={20} />
            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">Categorias (Faixa Etária)</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {config.categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-100 text-sm font-bold">
                {cat.name}
                <button onClick={() => handleRemoveConfig('school_categories', cat.id)}><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              placeholder="Nova categoria (Ex: Sub-13)" 
              className="flex-1 p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none"
              value={newItems.category}
              onChange={e => setNewItems({...newItems, category: e.target.value})}
            />
            <button onClick={() => handleAddConfig('school_categories', { name: newItems.category })} className="p-2 bg-amber-600 text-white rounded-lg"><Plus size={20}/></button>
          </div>
        </div>

        {/* Turmas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-blue-600">
            <Users size={20} />
            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">Turmas e Horários</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {config.teams.map(team => (
              <div key={team.id} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 text-sm font-bold">
                {team.name}
                <button onClick={() => handleRemoveConfig('school_teams', team.id)}><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              placeholder="Nova turma (Ex: Terça 15h)" 
              className="flex-1 p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none"
              value={newItems.team}
              onChange={e => setNewItems({...newItems, team: e.target.value})}
            />
            <button onClick={() => handleAddConfig('school_teams', { name: newItems.team })} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={20}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolSettings;
