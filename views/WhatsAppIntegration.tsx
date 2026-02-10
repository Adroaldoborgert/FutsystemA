
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MessageCircle, 
  RefreshCw, 
  Smartphone, 
  CheckCircle2, 
  LogOut,
  Zap,
  Loader2,
  Send,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  ZapOff,
  Save,
  Clock,
  AlertTriangle,
  CalendarDays,
  Lock,
  ChevronRight
} from 'lucide-react';
import { whatsappService } from '../services/whatsappService';
import { WhatsAppInstance, School, SchoolPlan } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface WhatsAppIntegrationProps {
  schoolId: string;
  school: School;
  onStatusChange?: (status: WhatsAppInstance | null) => void;
  onNavigate?: (path: string) => void;
}

const WhatsAppIntegration: React.FC<WhatsAppIntegrationProps> = ({ schoolId, school, onStatusChange, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const isFreeOrStarter = school.plan === SchoolPlan.FREE || school.plan === SchoolPlan.STARTER;

  const [rules, setRules] = useState({
    vencimento2dias: true,
    vencimentoNoDia: true,
    cobrancaAtraso: true,
    boasVindas: true,
    confirmacaoPagamento: false,
    trialReminder24h: true
  });

  const [leadReminderMessage, setLeadReminderMessage] = useState('Olá *{lead_name}*, sua aula experimental está agendada para amanhã às *{trial_time}*! Podemos confirmar? ⚽');
  const [expiryReminderMessage, setExpiryReminderMessage] = useState('Olá *{parent_name}*, tudo bem? Passando para lembrar que a mensalidade de *{athlete_name}* vence em 4 dias (dia *{due_date}*). Valor: *R$ {amount}*. ⚽');
  const [overdueReminderMessage, setOverdueReminderMessage] = useState('Olá *{parent_name}*, notamos que a mensalidade de *{athlete_name}* ({competence}) está atrasada. Por favor, regularize assim que possível. ⚽');
  const [leadReminderTime, setLeadReminderTime] = useState(24);
  
  const [isSavingConfigs, setIsSavingConfigs] = useState(false);

  const instanceName = `school_${schoolId}`;
  const pollingInterval = useRef<any>(null);
  const lastEmittedStatus = useRef<string>("");
  const lastEmittedNumber = useRef<string | null>(null);

  const fetchStatus = useCallback(async (manual = false) => {
    if (isFreeOrStarter) return;
    if (manual) setLoading(true);
    try {
      const data = await whatsappService.checkConnection(instanceName);
      setLastCheck(new Date());
      
      const instData = data?.instance || data;
      const rawState = instData?.state || instData?.status || "";
      const apiState = String(rawState).toUpperCase();
      const owner = instData?.owner || instData?.number || null;
      
      const isConnected = apiState === 'CONNECTED' || apiState === 'OPEN' || !!owner;
      const internalStatus = isConnected ? 'connected' : 'open';

      if (internalStatus !== lastEmittedStatus.current || owner !== lastEmittedNumber.current) {
        const newInstance: WhatsAppInstance = {
          instanceName,
          status: internalStatus,
          number: owner
        };
        
        setInstance(newInstance);
        lastEmittedStatus.current = internalStatus;
        lastEmittedNumber.current = owner;
        
        if (onStatusChange) onStatusChange(newInstance);
        
        if (isConnected) {
          setQrCode(null);
          setPolling(false);
        }
      }

      if (isSupabaseConfigured()) {
        const { data: configData } = await supabase.from('whatsapp_configs').select('*').eq('school_id', schoolId).maybeSingle();
        if (configData) {
            if (configData.notification_rules) setRules(configData.notification_rules);
            if (configData.message_templates) {
              if (configData.message_templates.lead_reminder) setLeadReminderMessage(configData.message_templates.lead_reminder);
              if (configData.message_templates.expiry_reminder) setExpiryReminderMessage(configData.message_templates.expiry_reminder);
              if (configData.message_templates.overdue_reminder) setOverdueReminderMessage(configData.message_templates.overdue_reminder);
              if (configData.message_templates.lead_reminder_time) setLeadReminderTime(configData.message_templates.lead_reminder_time);
            }
        }
      }
    } catch (err) {
      // Silencioso
    } finally {
      if (manual) setLoading(false);
    }
  }, [instanceName, onStatusChange, schoolId, isFreeOrStarter]);

  const handleConnect = async () => {
    setLoading(true);
    setQrCode(null);
    try {
      await whatsappService.createInstance(instanceName);
      const qrData = await whatsappService.getQrCode(instanceName);
      if (qrData && qrData.base64) {
        setQrCode(qrData.base64);
        setPolling(true);
      } else {
        await fetchStatus();
      }
    } catch (err) {
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Isso removerá a conexão. Deseja prosseguir?")) return;
    setLoading(true);
    try {
      await whatsappService.logoutInstance(instanceName);
      await whatsappService.deleteInstance(instanceName);
      setInstance(null);
      setQrCode(null);
      setPolling(false);
      lastEmittedStatus.current = "";
      lastEmittedNumber.current = null;
      if (onStatusChange) onStatusChange(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testNumber) return alert("Digite o número");
    setTestLoading(true);
    try {
      await whatsappService.sendText(instanceName, testNumber, "🚀 *FUTSYSTEM:* WhatsApp Validado e Integrado!");
      alert("Enviado com sucesso!");
    } catch (err) {
      alert("Erro ao enviar mensagem de teste.");
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveMessageConfigs = async () => {
    setIsSavingConfigs(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.from('whatsapp_configs').upsert({
          school_id: schoolId,
          instance_name: instanceName,
          notification_rules: rules,
          message_templates: {
            lead_reminder: leadReminderMessage,
            expiry_reminder: expiryReminderMessage,
            overdue_reminder: overdueReminderMessage,
            lead_reminder_time: leadReminderTime
          }
        });
        alert("Configurações salvas com sucesso!");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar configurações.");
    } finally {
      setIsSavingConfigs(false);
    }
  };

  useEffect(() => {
    if (isFreeOrStarter) return;
    fetchStatus();
    const intervalTime = (instance?.status === 'connected') ? 60000 : 5000;
    pollingInterval.current = setInterval(() => fetchStatus(), intervalTime);
    return () => clearInterval(pollingInterval.current);
  }, [instance?.status, fetchStatus, isFreeOrStarter]);

  const toggleRule = (key: keyof typeof rules) => {
    setRules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Switch = ({ active, onClick, disabled = false }: { active: boolean, onClick: () => void, disabled?: boolean }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-11 h-6 flex items-center p-1 cursor-pointer transition-all duration-300 ease-in-out ${
        disabled ? 'opacity-30 cursor-not-allowed bg-slate-200' : active ? 'bg-emerald-600' : 'bg-slate-300'
      }`}
    >
      <div 
        className={`w-4 h-4 bg-white shadow-sm transition-all duration-300 ease-in-out transform ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`} 
      />
    </button>
  );

  // Tela de Bloqueio se for plano Grátis ou Starter
  if (isFreeOrStarter) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[3rem] p-16 shadow-2xl border border-slate-100 max-w-2xl text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <Lock size={48} />
            </div>
            <div className="space-y-4">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800">Recurso Premium</h3>
                <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
                    As automações inteligentes de WhatsApp e lembretes automáticos estão disponíveis apenas nos planos <strong className="text-indigo-600">Professional</strong> e <strong className="text-indigo-600">Enterprise</strong>.
                </p>
            </div>
            <div className="pt-4">
                <button 
                  onClick={() => onNavigate?.('school-plans')}
                  className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black italic uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 mx-auto active:scale-95"
                >
                    Fazer Upgrade Agora <ChevronRight size={20} />
                </button>
            </div>
            <div className="pt-4 flex justify-center gap-8">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <CheckCircle2 size={16} className="text-emerald-500" /> WhatsApp Ilimitado
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <CheckCircle2 size={16} className="text-emerald-500" /> CRM Completo
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-800">WhatsApp & Automação</h2>
          <span className="bg-[#00c67d] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Acesso Total</span>
        </div>
        <button 
          onClick={() => fetchStatus(true)}
          className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Atualizar
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-[#00c67d] rounded-2xl flex items-center justify-center mb-2">
            <MessageSquare size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800">
              {instance?.status === 'connected' ? 'Conectado' : 'Desconectado'}
            </h3>
            <p className="text-slate-500 text-sm max-w-[240px]">
              {instance?.status === 'connected' 
                ? 'Seu aparelho está pronto para enviar notificações automáticas.' 
                : 'Conecte seu WhatsApp para habilitar as automações do sistema.'}
            </p>
          </div>
          <div className="w-full pt-4">
            {instance?.status === 'connected' ? (
              <div className="flex flex-col gap-4 items-center">
                <div className="flex items-center gap-2 bg-emerald-50 text-[#00c67d] px-6 py-3 rounded-2xl border border-emerald-100 w-full justify-center font-bold text-xs uppercase tracking-widest">
                  <CheckCircle size={18} /> Aparelho Ativo
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <LogOut size={14} /> Desvincular WhatsApp
                </button>
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-900 mx-auto w-fit shadow-xl">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Aguardando leitura do QR Code...</p>
              </div>
            ) : (
              <button 
                onClick={handleConnect}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? <RefreshCw size={20} className="animate-spin" /> : <Smartphone size={20} />}
                {loading ? 'Inicializando...' : 'Escanear QR Code'}
              </button>
            )}
          </div>
        </div>

        <div className={`rounded-[2rem] p-10 flex flex-col items-center justify-center text-center space-y-6 transition-all duration-500 ${instance?.status === 'connected' ? 'bg-[#10172a] text-white shadow-2xl' : 'bg-slate-100 text-slate-400 border border-dashed border-slate-200'}`}>
          {instance?.status === 'connected' ? (
            <div className="animate-in fade-in duration-1000">
              <div className="w-16 h-16 bg-[#00c67d] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter italic">Motor de Automação Ativo</h3>
              <p className="text-slate-400 text-sm">Todas as regras e modelos abaixo serão aplicados.</p>
              <div className="mt-8 flex flex-col gap-3 text-left">
                 <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Envio de Teste</p>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="Ex: 5511999990000"
                         className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00c67d] text-white placeholder:text-slate-600"
                         value={testNumber}
                         onChange={e => setTestNumber(e.target.value)}
                       />
                       <button 
                         onClick={handleSendTest}
                         disabled={testLoading}
                         className="p-2 bg-[#00c67d] text-white rounded-xl hover:bg-[#00b06f] transition-all shadow-lg shadow-emerald-500/10"
                       >
                         {testLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <ZapOff size={32} />
              </div>
              <h3 className="text-2xl font-bold italic tracking-tighter">Motor Offline</h3>
              <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Conecte seu WhatsApp para habilitar automações.</p>
            </div>
          )}
        </div>
      </div>

      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="text-amber-500" size={20} fill="currentColor" />
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Regras de Automação</h3>
          </div>
          <button 
            onClick={handleSaveMessageConfigs}
            disabled={isSavingConfigs}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSavingConfigs ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Salvar Configurações
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 italic">Aula Experimental</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Confirmação automática</span>
            </div>
            <Switch active={rules.trialReminder24h} onClick={() => toggleRule('trialReminder24h')} />
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 italic">Cobrança Atraso</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Alerta automático</span>
            </div>
            <Switch active={rules.cobracoaAtraso} onClick={() => toggleRule('cobrancaAtraso')} />
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 italic">Vencimento</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Aviso 4 dias antes</span>
            </div>
            <Switch active={rules.vencimento2dias} onClick={() => toggleRule('vencimento2dias')} />
          </div>
        </div>

        <div className="space-y-8 pt-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-indigo-600">
                    <CalendarDays size={20} />
                    <h4 className="font-bold text-sm uppercase tracking-wider">Template: Aula Experimental</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-2">
                        <textarea 
                          className="w-full p-4 bg-white border border-slate-200 rounded-2xl min-h-[100px] text-sm font-medium outline-none"
                          value={leadReminderMessage}
                          onChange={e => setLeadReminderMessage(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default WhatsAppIntegration;
