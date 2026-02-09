
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
      setEditingPlan({
        ...editingPlan,
        features: [...editingPlan.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (idx: number) => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: editingPlan.features.filter((_, i) => i !== idx)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Planos</h2>
          <p className="text-slate-500">Configure os níveis de serviço e precificação do SaaS</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Settings2 size={18} /> Configurações Globais
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-indigo-600">
                  <Tags size={24} />
                </div>
                <button 
                  onClick={() => setEditingPlan(plan)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-extrabold text-indigo-600">R$ {plan.price}</span>
                <span className="text-sm text-slate-500 font-medium">/mês</span>
              </div>
            </div>
            
            <div className="p-6 flex-1">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recursos Incluídos</div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Limite de <strong>{plan.studentLimit === 10000 ? 'Ilimitados' : plan.studentLimit}</strong> alunos
                </li>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 pt-0 mt-auto">
              <button 
                onClick={() => setEditingPlan(plan)}
                className="w-full py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold rounded-xl border border-slate-200 hover:border-indigo-200 transition-all text-sm"
              >
                Editar Definições
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição de Plano */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Editar Plano: {editingPlan.id}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome de Exibição</label>
                  <input 
                    type="text"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={editingPlan.name}
                    onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Mensal (R$)</label>
                  <input 
                    type="number"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={editingPlan.price}
                    onChange={e => setEditingPlan({...editingPlan, price: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Limite de Alunos</label>
                <input 
                  type="number"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={editingPlan.studentLimit}
                  onChange={e => setEditingPlan({...editingPlan, studentLimit: Number(e.target.value)})}
                />
                <p className="text-[10px] text-slate-400 mt-1">Dica: Use 10000 para representar alunos ilimitados.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Funcionalidades</label>
                <div className="space-y-2 mb-4">
                  {editingPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                      <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                        {feat}
                      </div>
                      <button 
                        onClick={() => removeFeature(idx)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Adicionar nova funcionalidade..."
                    className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    value={newFeature}
                    onChange={e => setNewFeature(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addFeature()}
                  />
                  <button 
                    onClick={addFeature}
                    className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setEditingPlan(null)}
                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
        <div className="flex gap-4 items-start">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <Settings2 size={24} />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900">Configuração de Upgrade Automático</h4>
            <p className="text-sm text-indigo-700/80 mt-1 max-w-2xl">
              Quando uma escola atinge 95% do limite de alunos, o sistema dispara automaticamente uma notificação de upgrade.
              Você pode configurar aqui se o upgrade deve ser bloqueante ou se permite excesso mediante taxa extra.
            </p>
            <button className="mt-4 text-sm font-bold text-indigo-600 hover:underline">Configurar regras de negócio →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterPlans;
