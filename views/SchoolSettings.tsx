
import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Trash2, Edit, DollarSign, Users, Layout, GraduationCap, X, ChevronDown, Building2, Shirt, Clock, MapPin, CheckCircle2, AlertTriangle, Shield, Mail, Lock, Key, User } from 'lucide-react';
import { School, SchoolConfig } from '../types';
import { supabase } from '../services/supabase';

interface SchoolSettingsProps {
  school: School;
  config: SchoolConfig;
  onUpdateSettings: (updates: Partial<School>) => void;
  onRefresh: () => void;
}

const SchoolSettings: React.FC<SchoolSettingsProps> = ({ school, config, onUpdateSettings, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'categorias' | 'planos' | 'turmas' | 'escola' | 'unidades' | 'seguranca'>('escola');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados para o Modal de Confirmação de Exclusão
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ table: string, id: string } | null>(null);

  const [tempSchedules, setTempSchedules] = useState<{ day: string, time: string }[]>([{ day: '', time: '' }]);

  // Estado local para os campos da aba "Escola" e "Segurança"
  const [localSettings, setLocalSettings] = useState({
    name: school.name || '',
    managerName: school.managerName || '',
    email: school.email || '',
    enrollmentFee: school.enrollmentFee || 0,
    uniformPrice: school.uniformPrice || 0,
    hasMultipleUnits: school.hasMultipleUnits || false
  });

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Sincroniza o estado local sempre que a escola (vinda do banco) mudar
  useEffect(() => {
    setLocalSettings({
      name: school.name || '',
      managerName: school.managerName || '',
      email: school.email || '',
      enrollmentFee: school.enrollmentFee || 0,
      uniformPrice: school.uniformPrice || 0,
      hasMultipleUnits: school.hasMultipleUnits || false
    });
  }, [school]);

  const [formData, setFormData] = useState<any>({
    category: { name: '' },
    plan: { name: '', price: 0, dueDay: 10 },
    team: { name: '', schedule: '', category: '', unit: '', maxStudents: 20, active: true },
    unit: { name: '', isActive: true, address: '', phone: '', email: '', manager: '', operating_hours: '' }
  });

  const handleAddOrUpdateConfig = async (table: string, data: any) => {
    let payload: any = {};
    
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
    } else if (table === 'school_units') {
      payload = {
        name: data.name,
        is_active: data.isActive,
        address: data.address,
        phone: data.phone,
        email: data.email,
        manager: data.manager,
        operating_hours: data.operating_hours
      };
    } else if (table === 'school_teams') {
      const scheduleString = tempSchedules
        .filter(s => s.day && s.time)
        .map(s => `${s.day} ${s.time}`)
        .join(', ');
      
      payload = {
        name: data.name,
        category: data.category,
        unit: data.unit,
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
      alert("Erro ao salvar dados. Verifique sua conexão ou permissões.");
    }
  };

  const closeAllModals = () => {
    setIsCategoryModalOpen(false);
    setIsPlanModalOpen(false);
    setIsTeamModalOpen(false);
    setIsUnitModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setEditingId(null);
    setDeleteTarget(null);
    setTempSchedules([{ day: '', time: '' }]);
    setFormData({
      category: { name: '' },
      plan: { name: '', price: 0, dueDay: 10 },
      team: { name: '', schedule: '', category: '', unit: '', maxStudents: 20, active: true },
      unit: { name: '', isActive: true, address: '', phone: '', email: '', manager: '', operating_hours: '' }
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
    } else if (tab === 'unidades') {
      setFormData({ 
        ...formData, 
        unit: { 
          name: item.name, 
          isActive: item.isActive,
          address: item.address || '',
          phone: item.phone || '',
          email: item.email || '',
          manager: item.manager || '',
          operating_hours: item.operating_hours || ''
        } 
      });
      setIsUnitModalOpen(true);
    } else if (tab === 'turmas') {
      setFormData({ ...formData, team: { name: item.name, schedule: item.schedule || '', category: item.category || '', unit: item.unit || '', maxStudents: item.maxStudents || 20, active: item.active !== false } });
      
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

  const handleOpenDeleteConfirm = (table: string, id: string) => {
    setDeleteTarget({ table, id });
    setIsDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from(deleteTarget.table).delete().eq('id', deleteTarget.id);
      if (error) throw error;
      onRefresh();
      closeAllModals();
    } catch (err) {
      console.error(`Erro ao excluir:`, err);
      alert("Erro ao excluir item. Verifique sua conexão.");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) {
      alert("As senhas não coincidem ou estão vazias.");
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.newPassword });
      if (error) throw error;
      alert("Senha atualizada com sucesso!");
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar senha.");
    }
  };

  const Switch = ({ active, onChange }: { active: boolean, onChange: () => void }) => (
    <button 
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`w-11 h-6 flex items-center p-1 cursor-pointer transition-all duration-300 ease-in-out ${
        active ? 'bg-emerald-600' : 'bg-slate-300'
      }`}
    >
      <div 
        className={`w-4 h-4 bg-white shadow-sm transition-all duration-300 ease-in-out transform ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`} 
      />
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

  const tabs = [
    { id: 'escola', label: 'Escola' },
    ...(localSettings.hasMultipleUnits ? [{ id: 'unidades', label: 'Unidades' }] : []),
    { id: 'categorias', label: 'Categorias' },
    { id: 'planos', label: 'Planos' },
    { id: 'turmas', label: 'Turmas' },
    { id: 'seguranca', label: 'Segurança' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight italic uppercase">Configurações</h2>
          <p className="text-slate-400 text-[10px] italic font-medium uppercase tracking-widest">Gestão operacional da unidade</p>
        </div>
        {activeTab === 'escola' && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onUpdateSettings(localSettings);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 text-xs"
          >
            <Save size={16} /> Salvar
          </button>
        )}
      </div>

      <div className="flex gap-6 border-b border-slate-100 overflow-x-auto scrollbar-hide relative no-radius-important">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-1 text-xs font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div 
                className="absolute bottom-0 left-0 w-full h-[2.5px] bg-slate-900 z-10" 
                style={{ borderRadius: '0px', borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px' }} 
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'escola' && (
        <div className="space-y-6">
          {/* DADOS DA UNIDADE */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-800">
              <Building2 size={18} className="text-emerald-600" />
              <h3 className="font-black italic uppercase tracking-tighter text-sm">Dados da Unidade</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Escola</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold text-slate-800 text-sm italic uppercase"
                    value={localSettings.name}
                    onChange={e => setLocalSettings({...localSettings, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Gestor</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold text-slate-800 text-sm italic"
                    value={localSettings.managerName}
                    onChange={e => setLocalSettings({...localSettings, managerName: e.target.value})}
                  />
                </div>
              </div>

              <div className="col-span-full space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Contato Público</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="email"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold text-slate-800 text-sm"
                    value={localSettings.email}
                    onChange={e => setLocalSettings({...localSettings, email: e.target.value})}
                  />
                </div>
                <p className="text-[9px] text-slate-400 italic ml-1">Este e-mail será usado em comunicações automáticas para os pais.</p>
              </div>
            </div>
          </div>

          {/* FINANCEIRO DA UNIDADE */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-800">
              <DollarSign size={18} className="text-emerald-600" />
              <h3 className="font-black italic uppercase tracking-tighter text-sm">Financeiro da Unidade</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500" />
                    <h4 className="font-bold text-slate-700 text-xs uppercase italic">Taxa Matrícula</h4>
                  </div>
                  <Switch active={localSettings.enrollmentFee > 0} onChange={() => setLocalSettings({ ...localSettings, enrollmentFee: localSettings.enrollmentFee > 0 ? 0 : 50 })} />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                  <input 
                    type="number"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold italic text-sm"
                    value={localSettings.enrollmentFee}
                    onChange={e => setLocalSettings({...localSettings, enrollmentFee: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Shirt size={16} className="text-indigo-500" />
                  <h4 className="font-bold text-slate-700 text-xs uppercase italic">Preço Uniforme</h4>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                  <input 
                    type="number"
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold italic text-sm"
                    value={localSettings.uniformPrice}
                    onChange={e => setLocalSettings({...localSettings, uniformPrice: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="col-span-full space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-violet-500" />
                    <h4 className="font-bold text-slate-700 text-xs italic uppercase tracking-widest">Possui mais de uma unidade física</h4>
                  </div>
                  <Switch 
                    active={localSettings.hasMultipleUnits} 
                    onChange={() => {
                      const newVal = !localSettings.hasMultipleUnits;
                      setLocalSettings({ ...localSettings, hasMultipleUnits: newVal });
                    }} 
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">Ative se sua escolinha gerencia múltiplos endereços físicos.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'seguranca' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-2 text-slate-800">
              <Shield size={18} className="text-brand-purple" />
              <h3 className="font-black italic uppercase tracking-tighter text-sm">Segurança da Conta</h3>
            </div>

            {/* E-MAIL DE ACESSO */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">E-mail de Acesso</span>
              </div>
              <p className="text-lg font-black text-slate-800 italic">{school.email}</p>
              <p className="text-[9px] text-slate-400 italic">Este é o seu e-mail de login. Para alterá-lo, contate o suporte FutSystem.</p>
            </div>

            {/* ALTERAR SENHA */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-slate-800">
                <Key size={18} className="text-brand-purple" />
                <h3 className="font-black italic uppercase tracking-tighter text-sm">Alterar Senha</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold text-slate-800 text-sm"
                      value={passwords.newPassword}
                      onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold text-slate-800 text-sm"
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handlePasswordUpdate}
                  className="bg-brand-purple hover:opacity-90 text-white px-8 py-3 rounded-xl font-black italic uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-lg shadow-brand-purple/10 active:scale-95"
                >
                  <Save size={16} /> Atualizar Senha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'escola' && activeTab !== 'seguranca' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 italic uppercase tracking-tighter">Gerenciar {activeTab}</h3>
            <button 
              type="button"
              onClick={() => {
                setEditingId(null);
                if(activeTab === 'categorias') setIsCategoryModalOpen(true);
                if(activeTab === 'planos') setIsPlanModalOpen(true);
                if(activeTab === 'turmas') setIsTeamModalOpen(true);
                if(activeTab === 'unidades') setIsUnitModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <Plus size={14} /> Nova
            </button>
          </div>

          <div className="space-y-2">
            {activeTab === 'unidades' && config.units.map(unit => (
              <div key={unit.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-100 transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 uppercase italic text-xs">{unit.name}</span>
                  {unit.isActive ? (
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter italic">Ativa</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter italic">Inativa</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => handleEditOpen('unidades', unit)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={14}/></button>
                  <button type="button" onClick={() => handleOpenDeleteConfirm('school_units', unit.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}

            {activeTab === 'categorias' && config.categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-100 transition-all group shadow-sm">
                <div>
                  <span className="font-bold text-slate-800 uppercase italic text-xs">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => handleEditOpen('categorias', cat)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={14}/></button>
                  <button type="button" onClick={() => handleOpenDeleteConfirm('school_categories', cat.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
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
                  <button type="button" onClick={() => handleEditOpen('planos', plan)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={14}/></button>
                  <button type="button" onClick={() => handleOpenDeleteConfirm('school_monthly_plans', plan.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
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
                  <button type="button" onClick={() => handleEditOpen('turmas', team)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={14}/></button>
                  <button type="button" onClick={() => handleOpenDeleteConfirm('school_teams', team.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão conforme Imagem de Referência */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[440px] overflow-hidden animate-in zoom-in duration-200 p-10 flex flex-col items-center">
            <div className="mb-10 flex justify-center">
              <div className="w-24 h-24 bg-red-50 rounded-[20px] flex items-center justify-center">
                <AlertTriangle size={48} className="text-red-500" />
              </div>
            </div>
            
            <h3 className="text-[1.8rem] font-black text-brand-mid italic uppercase tracking-tighter mb-4 text-center">CONFIRMAR EXCLUSÃO?</h3>
            <p className="text-slate-500 font-medium text-center mb-10 leading-relaxed max-w-[320px]">
              Deseja realmente excluir este item permanentemente? Esta ação não pode ser desfeita.
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                type="button" 
                onClick={closeAllModals} 
                className="py-4 bg-slate-50 text-slate-500 font-black rounded-[10px] hover:bg-slate-100 transition-all uppercase italic tracking-widest text-[11px]"
              >
                CANCELAR
              </button>
              <button 
                type="button" 
                onClick={executeDelete} 
                className="py-4 bg-[#E5322E] text-white font-black rounded-[10px] hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 uppercase italic tracking-widest text-[11px]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-sm">{editingId ? 'Editar Unidade' : 'Nova Unidade'}</h3>
              <button type="button" onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome da Unidade *</label>
                <input placeholder="Ex: Unidade Centro" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-sm" value={formData.unit.name} onChange={e => setFormData({...formData, unit: { ...formData.unit, name: e.target.value }})} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Endereço</label>
                <input placeholder="Rua, número, bairro, cidade" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-lg outline-none text-sm" value={formData.unit.address} onChange={e => setFormData({...formData, unit: { ...formData.unit, address: e.target.value }})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Telefone</label>
                  <input placeholder="(00) 00000-0000" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-lg outline-none text-sm" value={formData.unit.phone} onChange={e => setFormData({...formData, unit: { ...formData.unit, phone: e.target.value }})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email</label>
                  <input placeholder="email@unidade.com" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-lg outline-none text-sm" value={formData.unit.email} onChange={e => setFormData({...formData, unit: { ...formData.unit, email: e.target.value }})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Responsável</label>
                  <input placeholder="Nome do responsável" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-lg outline-none text-sm" value={formData.unit.manager} onChange={e => setFormData({...formData, unit: { ...formData.unit, manager: e.target.value }})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Horário de Funcionamento</label>
                  <input placeholder="Ex: 08h-20h" className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-lg outline-none text-sm" value={formData.unit.operating_hours} onChange={e => setFormData({...formData, unit: { ...formData.unit, operating_hours: e.target.value }})} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 mt-2">
                <span className="text-sm font-bold text-slate-700">Unidade Ativa</span>
                <Switch active={formData.unit.isActive} onChange={() => setFormData({...formData, unit: { ...formData.unit, isActive: !formData.unit.isActive }})} />
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => handleAddOrUpdateConfig('school_units', formData.unit)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-all text-sm">
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-sm">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button type="button" onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome da Categoria *</label>
                <input placeholder="Ex: Sub-7" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-sm" value={formData.category.name} onChange={e => setFormData({...formData, category: { name: e.target.value }})} />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => handleAddOrUpdateConfig('school_categories', { name: formData.category.name })} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-all text-sm">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-sm">{editingId ? 'Editar Plano' : 'Novo Plano'}</h3>
              <button type="button" onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome do Plano *</label>
                <input placeholder="Ex: Mensal Ouro" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-sm" value={formData.plan.name} onChange={e => setFormData({...formData, plan: {...formData.plan, name: e.target.value}})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Valor *</label>
                  <input type="number" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-sm" value={formData.plan.price} onChange={e => setFormData({...formData, plan: {...formData.plan, price: Number(e.target.value)}})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dia Venc. *</label>
                  <input type="number" max="28" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-sm" value={formData.plan.dueDay} onChange={e => setFormData({...formData, plan: {...formData.plan, dueDay: Number(e.target.value)}})} />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => handleAddOrUpdateConfig('school_monthly_plans', { name: formData.plan.name, price: formData.plan.price, dueDay: formData.plan.dueDay })} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-all text-sm">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-sm">{editingId ? 'Editar Turma' : 'Nova Turma'}</h3>
              <button type="button" onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome da Turma *</label>
                <input placeholder="Ex: Turma A" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-sm" value={formData.team.name} onChange={e => setFormData({...formData, team: {...formData.team, name: e.target.value}})} />
              </div>

              {localSettings.hasMultipleUnits && config.units.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Unidade *</label>
                  <div className="relative">
                    <select 
                      required 
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none appearance-none font-medium cursor-pointer text-sm" 
                      value={formData.team.unit} 
                      onChange={e => setFormData({...formData, team: {...formData.team, unit: e.target.value}})}
                    >
                      <option value="">Selecione uma unidade</option>
                      {config.units.filter(u => u.isActive).map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Horário</label>
                {tempSchedules.map((schedule, idx) => (
                  <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                    <div className="flex-1 relative">
                      <select 
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none appearance-none font-medium text-sm pr-8"
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
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-sm"
                        value={schedule.time}
                        onChange={(e) => updateScheduleLine(idx, 'time', e.target.value)}
                      />
                    </div>
                    {idx === tempSchedules.length - 1 ? (
                      <button type="button" onClick={addScheduleLine} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"><Plus size={16} /></button>
                    ) : (
                      <button type="button" onClick={() => removeScheduleLine(idx)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Categoria</label>
                  <div className="relative">
                    <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none appearance-none font-medium cursor-pointer text-sm" value={formData.team.category} onChange={e => setFormData({...formData, team: {...formData.team, category: e.target.value}})}>
                      <option value="">Sel.</option>
                      {config.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Máx. Alunos</label>
                  <input type="number" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-sm" value={formData.team.maxStudents} onChange={e => setFormData({...formData, team: {...formData.team, maxStudents: Number(e.target.value)}})} />
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 rounded-xl flex items-center justify-between border border-slate-100">
                <span className="text-sm font-bold text-slate-700">Ativa</span>
                <Switch active={formData.team.active} onChange={() => setFormData({...formData, team: {...formData.team, active: !formData.team.active}})} />
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => handleAddOrUpdateConfig('school_teams', { name: formData.team.name, category: formData.team.category, unit: formData.team.unit, maxStudents: formData.team.maxStudents, active: formData.team.active })} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-all text-sm">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;
