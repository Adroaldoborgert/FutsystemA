import React from 'react';
import { Settings2, Users, CalendarDays, CircleDollarSign, MessageCircle, CreditCard, Settings, Eye, EyeOff } from 'lucide-react';

interface MasterSettingsProps {
  featureFlags: { athletes: boolean; leads: boolean; finance: boolean; whatsapp: boolean; plans: boolean; settings: boolean; };
  onUpdateFlags: (flags: any) => void;
}

const MasterSettings: React.FC<MasterSettingsProps> = ({ featureFlags, onUpdateFlags }) => {
  const toggleFlag = (key: keyof typeof featureFlags) => onUpdateFlags({ ...featureFlags, [key]: !featureFlags[key] });

  const configItems = [
    { key: 'athletes', name: 'Atletas', icon: Users },
    { key: 'leads', name: 'Experimentais', icon: CalendarDays },
    { key: 'finance', name: 'Financeiro', icon: CircleDollarSign },
    { key: 'whatsapp', name: 'WhatsApp', icon: MessageCircle },
    { key: 'plans', name: 'Meu Plano', icon: CreditCard },
    { key: 'settings', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 italic uppercase">
        <Settings2 className="text-indigo-600" /> Configurações Master
      </h2>
      <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden divide-y">
        {configItems.map(item => {
          const isEnabled = featureFlags[item.key as keyof typeof featureFlags];
          return (
            <div key={item.key} className="p-6 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-[10px] ${isEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100'}`}><item.icon size={24} /></div>
                <h4 className="font-bold italic uppercase text-sm">{item.name}</h4>
              </div>
              <button onClick={() => toggleFlag(item.key as keyof typeof featureFlags)} className={`px-6 py-2.5 rounded-[10px] font-bold text-xs uppercase ${isEnabled ? 'bg-emerald-50 text-emerald-600 border' : 'bg-slate-100 text-slate-400 border'}`}>
                {isEnabled ? 'Visível' : 'Oculto'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MasterSettings;