import React, { useState } from 'react';
import { Search, UserCog, ArrowUpDown, LogIn, ShieldCheck, Plus, X, Eye, EyeOff } from 'lucide-react';
import { School, SchoolPlan, PlanDefinition } from '../types';

interface MasterUnitsProps {
  schools: School[];
  plans: PlanDefinition[];
  onImpersonate: (schoolId: string) => void;
  onUpdatePlan: (schoolId: string, plan: SchoolPlan) => void;
  onResetCredentials: (schoolId: string) => void;
  onAddSchool: (school: Partial<School>) => void;
}

const MasterUnits: React.FC<MasterUnitsProps> = ({ schools, plans, onImpersonate, onUpdatePlan, onResetCredentials, onAddSchool }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<{schoolId: string, open: boolean}>({schoolId: '', open: false});
  const [newSchool, setNewSchool] = useState({ name: '', managerName: '', email: '', password: '', plan: SchoolPlan.FREE });

  const filteredSchools = schools.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.managerName.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSchool(newSchool);
    setIsModalOpen(false);
    setNewSchool({ name: '', managerName: '', email: '', password: '', plan: SchoolPlan.FREE });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Unidades</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-[10px] font-medium transition-colors flex items-center gap-2"><Plus size={20} /> Nova Unidade</button>
      </div>

      <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-[10px] text-sm outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b"><tr><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Unidade / Gestor</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-200">{filteredSchools.map(school => (
            <tr key={school.id} className="hover:bg-slate-50"><td className="px-6 py-4"><div className="font-semibold text-slate-900">{school.name}</div><div className="text-xs text-slate-400">{school.email}</div></td><td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => onResetCredentials(school.id)} className="p-2 text-slate-400 rounded-[10px]"><UserCog size={18} /></button><button onClick={() => onImpersonate(school.id)} className="p-2 text-emerald-600 rounded-[10px]"><LogIn size={18} /></button></div></td></tr>
          ))}</tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-[10px] shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Cadastrar Unidade</h3><button onClick={() => setIsModalOpen(false)}><X size={20} /></button></div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Nome Escola" className="w-full p-2 bg-white border rounded-[10px] text-sm" value={newSchool.name} onChange={e => setNewSchool({...newSchool, name: e.target.value})} />
              <input required placeholder="Email" className="w-full p-2 bg-white border rounded-[10px] text-sm" value={newSchool.email} onChange={e => setNewSchool({...newSchool, email: e.target.value})} />
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-[10px] font-bold">Confirmar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterUnits;