import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, RefreshCw, Smartphone, CheckCircle2, LogOut, Zap, Loader2, Send, ShieldCheck, CheckCircle, MessageSquare, ZapOff, Save, Clock, AlertTriangle, CalendarDays, Lock, ChevronRight } from 'lucide-react';
import { whatsappService } from '../services/whatsappService';
import { WhatsAppInstance, School, SchoolPlan } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface WhatsAppIntegrationProps {
  schoolId: string; school: School; onStatusChange?: (status: WhatsAppInstance | null) => void; onNavigate?: (path: string) => void;
}

const WhatsAppIntegration: React.FC<WhatsAppIntegrationProps> = ({ schoolId, school, onStatusChange, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [testNumber, setTestNumber] = useState('');
  const [rules, setRules] = useState({ trialReminder24h: true, cobrancaAtraso: true, vencimento2dias: true });

  const isFreeOrStarter = school.plan === SchoolPlan.FREE || school.plan === SchoolPlan.STARTER;
  const instanceName = `school_${schoolId}`;

  const fetchStatus = useCallback(async () => {
    if (isFreeOrStarter) return;
    try {
      const data = await whatsappService.checkConnection(instanceName);
      const isConnected = String(data?.instance?.state || data?.state).toUpperCase() === 'CONNECTED';
      const inst = { instanceName, status: isConnected ? 'connected' as const : 'open' as const };
      setInstance(inst);
      if (onStatusChange) onStatusChange(inst);
    } catch (err) {}
  }, [instanceName, onStatusChange, isFreeOrStarter]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  if (isFreeOrStarter) return (
    <div className="min-h-[80vh] flex items-center justify-center p-8 animate-in zoom-in duration-500">
      <div className="bg-white rounded-[10px] p-16 shadow-2xl border max-w-2xl text-center space-y-8">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[10px] flex items-center justify-center mx-auto"><Lock size={48} /></div>
          <h3 className="text-4xl font-black italic uppercase">Recurso Premium</h3>
          <button onClick={() => onNavigate?.('school-plans')} className="bg-indigo-600 text-white px-10 py-5 rounded-[10px] font-black italic uppercase shadow-xl">Fazer Upgrade</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[10px] border p-10 flex flex-col items-center text-center space-y-6">
          <MessageSquare size={32} className="text-[#00c67d]" />
          <h3 className="text-2xl font-bold">{instance?.status === 'connected' ? 'Conectado' : 'Desconectado'}</h3>
          {instance?.status !== 'connected' && <button onClick={async () => { setLoading(true); await whatsappService.createInstance(instanceName); const qr = await whatsappService.getQrCode(instanceName); if(qr?.base64) setQrCode(qr.base64); setLoading(false); }} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-[10px] shadow-lg">Conectar WhatsApp</button>}
          {qrCode && <div className="bg-white p-4 border rounded-[10px] shadow-xl"><img src={qrCode} alt="QR" className="w-48 h-48" /></div>}
        </div>
        <div className={`rounded-[10px] p-10 flex flex-col items-center justify-center text-center space-y-6 ${instance?.status === 'connected' ? 'bg-[#10172a] text-white' : 'bg-slate-100 text-slate-400 border border-dashed'}`}>
          <h3 className="text-2xl font-bold italic">Motor de Automação</h3>
          {instance?.status === 'connected' ? <CheckCircle size={32} className="text-[#00c67d]" /> : <ZapOff size={32} />}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppIntegration;