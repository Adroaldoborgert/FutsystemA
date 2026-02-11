
import React, { useState } from 'react';
import { 
  Search, 
  UserCog, 
  ArrowUpDown, 
  LogIn, 
  ShieldCheck,
  Plus,
  X,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { School, SchoolPlan, PlanDefinition } from '../types';

interface MasterUnitsProps {
  schools: School[];
  plans: PlanDefinition[];
  onImpersonate: (schoolId: string) => void;
  onUpdatePlan: (schoolId: string, plan: SchoolPlan) => void;
  onResetCredentials: (schoolId: string) => void;
  onAddSchool: (school: Partial<School>) => void;
  onDeleteSchool: (schoolId: string) => void;
}

const MasterUnits: React.FC<MasterUnitsProps> = ({ 
  schools, 
  plans,
  onImpersonate, 
  onUpdatePlan, 
  onResetCredentials,
  onAddSchool,
  onDeleteSchool
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<{schoolId: string, open: boolean}>({schoolId: '', open: false});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<{id: string, name: string} | null>(null);
  
  const [newSchool, setNewSchool] = useState({
    name: '',
    managerName: '',
    email: '',
    password: '',
    plan: SchoolPlan.FREE
  });

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSchool(newSchool);
    setIsModalOpen(false);
    setNewSchool({ name: '', managerName: '', email: '', password: '', plan: SchoolPlan.FREE });
  };

  const confirmDelete = () => {
    if (schoolToDelete) {
      onDeleteSchool(schoolToDelete.id);
      setIsDeleteModalOpen(false);
      setSchoolToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Unidades</h2>
          <p className="text-slate-500">Administre planos, acessos e suporte técnico das escolas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Cadastrar Nova Unidade
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por escola, gestor ou e-mail..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unidade / Gestor</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plano Atual</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Alunos</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredSchools.map((school) => (
              <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{school.name}</div>
                  <div className="text-sm text-slate-600 font-medium">Gestor: {school.managerName}</div>
                  <div className="text-xs text-slate-400">{school.email}</div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => setIsPlanModalOpen({ schoolId: school.id, open: true })}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all hover:ring-2 hover:ring-offset-2 ${
                      school.plan === SchoolPlan.ENTERPRISE ? 'bg-purple-100 text-purple-700 hover:ring-purple-300' :
                      school.plan === SchoolPlan.PROFESSIONAL ? 'bg-blue-100 text-blue-700 hover:ring-blue-300' :
                      school.plan === SchoolPlan.FREE ? 'bg-slate-100 text-slate-500 hover:ring-slate-300' :
                      'bg-indigo-100 text-indigo-700 hover:ring-indigo-300'
                    }`}
                  >
                    {school.plan} <ArrowUpDown size={12} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 font-medium">{school.studentCount} / {school.studentLimit}</div>
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((school.studentCount / (school.studentLimit || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      title="Alterar Credenciais"
                      onClick={() => onResetCredentials(school.id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <UserCog size={18} />
                    </button>
                    <button 
                      title="Acesso Direto (Login As)"
                      onClick={() => onImpersonate(school.id)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <LogIn size={18} />
                    </button>
                    <button 
                      title="Excluir Unidade"
                      onClick={() => {
                        setSchoolToDelete({ id: school.id, name: school.name });
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Cadastro de Unidade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Cadastrar Nova Unidade</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome da Escola</label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: Arena Soccer Academy"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={newSchool.name}
                  onChange={e => setNewSchool({...newSchool, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome do Gestor</label>
                <input 
                  required
                  type="text"
                  placeholder="Nome completo do responsável"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={newSchool.managerName}
                  onChange={e => setNewSchool({...newSchool, managerName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">E-mail de Acesso</label>
                  <input 
                    required
                    type="email"
                    placeholder="gestor@escola.com"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={newSchool.email}
                    onChange={e => setNewSchool({...newSchool, email: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Senha Provisória</label>
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Defina uma senha"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={newSchool.password}
                    onChange={e => setNewSchool({...newSchool, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plano de Assinatura</label>
                <select 
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={newSchool.plan}
                  onChange={e => setNewSchool({...newSchool, plan: e.target.value as SchoolPlan})}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.price === 0 ? 'Grátis' : `R$ ${p.price}/mês`}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upgrade/Downgrade de Plano */}
      {isPlanModalOpen.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Alterar Plano da Unidade</h3>
                <p className="text-xs text-slate-500">Isso afetará imediatamente o limite de alunos e MRR</p>
              </div>
              <button onClick={() => setIsPlanModalOpen({schoolId: '', open: false})} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 gap-3">
              {plans.map(p => {
                const school = schools.find(s => s.id === isPlanModalOpen.schoolId);
                const isActive = school?.plan === p.id;
                return (
                  <button 
                    key={p.id}
                    disabled={isActive}
                    onClick={() => {
                      onUpdatePlan(isPlanModalOpen.schoolId, p.id);
                      setIsPlanModalOpen({schoolId: '', open: false});
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      isActive 
                        ? 'border-indigo-600 bg-indigo-50 cursor-default' 
                        : 'border-slate-100 hover:border-indigo-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500">Até {p.studentLimit === 10000 ? 'Ilimitados' : p.studentLimit} alunos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-600">{p.price === 0 ? 'Grátis' : `R$ ${p.price}`}</div>
                      {p.price > 0 && <div className="text-[10px] text-slate-400">por mês</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[440px] overflow-hidden animate-in zoom-in duration-200 p-10 flex flex-col items-center">
            <div className="mb-10 flex justify-center">
              <div className="w-24 h-24 bg-red-50 rounded-[20px] flex items-center justify-center">
                <AlertTriangle size={48} className="text-red-500" />
              </div>
            </div>
            
            <h3 className="text-[1.8rem] font-black text-brand-mid italic uppercase tracking-tighter mb-4 text-center">CONFIRMAR EXCLUSÃO?</h3>
            <p className="text-slate-500 font-medium text-center mb-10 leading-relaxed max-w-[320px]">
              Deseja realmente excluir a unidade <strong className="text-slate-800">{schoolToDelete?.name}</strong> permanentemente? Esta ação removerá todos os atletas e dados vinculados.
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                type="button" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSchoolToDelete(null);
                }} 
                className="py-4 bg-slate-50 text-slate-500 font-black rounded-[10px] hover:bg-slate-100 transition-all uppercase italic tracking-widest text-[11px]"
              >
                CANCELAR
              </button>
              <button 
                type="button" 
                onClick={confirmDelete} 
                className="py-4 bg-[#E5322E] text-white font-black rounded-[10px] hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 uppercase italic tracking-widest text-[11px]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterUnits;
