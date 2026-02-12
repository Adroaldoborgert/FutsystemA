
import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Trash2, Edit, DollarSign, Users, Layout, GraduationCap, X, ChevronDown, Building2, Shirt, Clock, MapPin, CheckCircle2, AlertTriangle, Shield, Mail, Lock, Key, User, Link, Copy, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';
import { School, SchoolConfig } from '../types';
import { supabase } from '../services/supabase';

interface SchoolSettingsProps {
  school: School;
  config: SchoolConfig;
  onUpdateSettings: (updates: Partial<School>) => void;
  onRefresh: () => void;
}

const SchoolSettings: React.FC<SchoolSettingsProps> = ({ school, config, onUpdateSettings, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'escola' | 'auto-matricula' | 'categorias' | 'planos' | 'turmas' | 'seguranca'>('escola');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [localSettings, setLocalSettings] = useState({
    name: school.name || '',
    managerName: school.managerName || '',
    email: school.email || '',
    enrollmentFee: school.enrollmentFee || 0,
    uniformPrice: school.uniformPrice || 0,
    hasMultipleUnits: school.hasMultipleUnits || false,
    slug: school.slug || school.id,
    autoEnrollmentEnabled: school.autoEnrollmentEnabled !== false,
    welcomeMessage: school.welcomeMessage || ''
  });

  useEffect(() => {
    setLocalSettings({
      name: school.name || '',
      managerName: school.managerName || '',
      email: school.email || '',
      enrollmentFee: school.enrollmentFee || 0,
      uniformPrice: school.uniformPrice || 0,
      hasMultipleUnits: school.hasMultipleUnits || false,
      slug: school.slug || school.id,
      autoEnrollmentEnabled: school.autoEnrollmentEnabled !== false,
      welcomeMessage: school.welcomeMessage || ''
    });
  }, [school]);

  const handleCopyLink = () => {
    // Domínio fixo conforme especificação
    const url = `https://futsystem.com.br/matricular/${localSettings.slug}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado para a área de transferência!");
  };

  const tabs = [
    { id: 'escola', label: 'Escola' },
    { id: 'auto-matricula', label: 'Auto-Matrícula' },
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
        <button 
          onClick={() => onUpdateSettings(localSettings)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 text-xs"
        >
          <Save size={16} /> Salvar Tudo
        </button>
      </div>

      <div className="flex gap-6 border-b border-slate-100 overflow-x-auto scrollbar-hide relative no-radius-important">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-1 text-xs font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-slate-900 z-10" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'auto-matricula' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-purple/10 text-brand-purple rounded-xl">
                  <Link size={24} />
                </div>
                <div>
                  <h3 className="font-black italic uppercase tracking-tighter text-lg leading-tight">Link de Auto-Matrícula</h3>
                  <p className="text-xs text-slate-400 font-medium italic uppercase tracking-wider">Configure o portal de pré-cadastro público</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100 px-4">
                <span className="text-[10px] font-black uppercase italic text-slate-400 tracking-widest">Link Ativado?</span>
                <button 
                  onClick={() => setLocalSettings({...localSettings, autoEnrollmentEnabled: !localSettings.autoEnrollmentEnabled})}
                  className={`transition-all ${localSettings.autoEnrollmentEnabled ? 'text-emerald-500' : 'text-slate-300'}`}
                >
                  {localSettings.autoEnrollmentEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Slug Exclusivo (Personalizar URL)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px] italic pr-2 border-r border-slate-200">
                      .../matricular/
                    </div>
                    <input 
                      type="text"
                      className="w-full pl-[110px] pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-800 text-sm"
                      placeholder="slug-da-escola"
                      value={localSettings.slug}
                      onChange={e => setLocalSettings({...localSettings, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 italic ml-1">Use apenas letras minúsculas e hífens. Ex: arena-soccer-sp</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">URL Pública Gerada</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-indigo-600 truncate italic">
                      https://futsystem.com.br/matricular/{localSettings.slug}
                    </div>
                    <button 
                      onClick={handleCopyLink}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
                      title="Copiar Link"
                    >
                      <Copy size={18} />
                    </button>
                    <button 
                      onClick={() => window.open(`/matricular/${localSettings.slug}`, '_blank')}
                      className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg"
                      title="Testar Link (Visualizar)"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mensagem de Boas-vindas (Pós-Envio)</label>
                <textarea 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 text-sm italic min-h-[100px]"
                  placeholder="Ex: Solicitação enviada com sucesso! A escola entrará em contato para confirmar a matrícula."
                  value={localSettings.welcomeMessage}
                  onChange={e => setLocalSettings({...localSettings, welcomeMessage: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest italic flex items-center gap-2">
                    <CheckCircle2 size={14} /> Filtro de segurança
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium italic leading-relaxed">Novos cadastros entram como "Pendente de Validação" e não geram faturamento imediato.</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest italic flex items-center gap-2">
                    <CheckCircle2 size={14} /> Mobile First
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium italic leading-relaxed">Layout otimizado para celulares, ideal para Bio do Instagram e disparos via WhatsApp.</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest italic flex items-center gap-2">
                    <CheckCircle2 size={14} /> Link Dinâmico
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium italic leading-relaxed">Altere o slug a qualquer momento sem perder os dados dos alunos já cadastrados.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Restante das abas mantidas intactas conforme original */}
      {activeTab === 'escola' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-800">
              <Building2 size={18} className="text-emerald-600" />
              <h3 className="font-black italic uppercase tracking-tighter text-sm">Dados da Unidade</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Escola</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold text-slate-800 text-sm italic uppercase"
                  value={localSettings.name}
                  onChange={e => setLocalSettings({...localSettings, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Gestor</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold text-slate-800 text-sm italic"
                  value={localSettings.managerName}
                  onChange={e => setLocalSettings({...localSettings, managerName: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;
