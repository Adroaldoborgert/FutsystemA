import React, { useState } from 'react';
import { Tags, CheckCircle2, Edit3, Settings2, X, Plus, Trash2 } from 'lucide-react';
import { PlanDefinition } from '../types';

interface MasterPlansProps {
  plans: PlanDefinition[];
  onUpdatePlanDefinition: (planId: string, updates: Partial<PlanDefinition>) => void;
}

const MasterPlans: React.FC<MasterPlansProps> = ({ plans, onUpdatePlanDefinition }) => {
  const [editingPlan, setEditingPlan] = useState<PlanDefinition | null>(null);
  const [newFeature, setNewFeature] = useState('');

  const handleSave = () => {
    if (editingPlan) {
      onUpdatePlanDefinition(editingPlan.id, editingPlan);
      setEditingPlan(null);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && editingPlan) {
      setEditingPlan({ ...editingPlan, features: [...editingPlan.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Planos</h2>
        <button className="bg-slate-800 text-white px-4 py-2 rounded-[10px] font-medium flex items-center gap-2"><Settings2 size={18} /> Config Globais</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
              <div><h3 className="text-xl font-bold text-slate-900">{plan.name}</h3><div className="text-indigo-600 font-extrabold">R$ {plan.price}/mês</div></div>
              <button onClick={() => setEditingPlan(plan)} className="p-2 text-slate-400 rounded-[10px]"><Edit3 size={18} /></button>
            </div>
            <div className="p-6 flex-1"><ul className="space-y-2">{plan.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className="text-emerald-500" /> {f}</li>)}</ul></div>
            <div className="p-6 mt-auto border-t"><button onClick={() => setEditingPlan(plan)} className="w-full py-2 bg-slate-50 rounded-[10px] text-sm font-bold">Editar Plano</button></div>
          </div>
        ))}
      </div>
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-[10px] shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">Editar {editingPlan.id}</h3>
            <input className="w-full p-2 bg-white border rounded-[10px] text-sm" value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} />
            <div className="flex gap-3"><button onClick={() => setEditingPlan(null)} className="flex-1 py-3 bg-slate-100 rounded-[10px] font-bold">Sair</button><button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-[10px] font-bold">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterPlans;