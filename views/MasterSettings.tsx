
import React from 'react';
import { 
  Settings2, 
  Users, 
  CalendarDays, 
  CircleDollarSign, 
  MessageCircle, 
  CreditCard, 
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

interface MasterSettingsProps {
  featureFlags: {
    athletes: boolean;
    leads: boolean;
    finance: boolean;
    whatsapp: boolean;
    plans: boolean;
    settings: boolean;
  };
  onUpdateFlags: (flags: any) => void;
}

const MasterSettings: React.FC<MasterSettingsProps> = ({ featureFlags, onUpdateFlags }) => {
  const toggleFlag = (key: keyof typeof featureFlags) => {
    onUpdateFlags({
      ...featureFlags,
      [key]: !featureFlags[key]
    });
  };

  const configItems = [
    { key: 'athletes', name: 'Módulo: Atletas', icon: Users, description: 'Gerenciamento completo de alunos e matrículas' },
    { key: 'leads', name: 'Módulo: Aulas Experimentais', icon: CalendarDays, description: 'CRM de interessados e agendamento de testes' },
    { key: 'finance', name: 'Módulo: Financeiro', icon: CircleDollarSign, description: 'Controle de mensalidades, cobranças e fluxo de caixa' },
    { key: 'whatsapp', name: 'Módulo: WhatsApp', icon: MessageCircle, description: 'Integração e disparos de automação via WA' },
    { key: 'plans', name: 'Módulo: Meu Plano', icon: CreditCard, description: 'Visualização e upgrade de planos da unidade' },
    { key: 'settings', name: 'Módulo: Configurações', icon: Settings, description: 'Ajustes técnicos e de taxas da unidade' },
  ];

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 italic uppercase tracking-tighter">
          <Settings2 className="text-indigo-600" />
          Configurações Master
        </h2>
        <p className="text-slate-500">Controle quais abas e módulos estão visíveis para todas as unidades (SaaS)</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="font-bold text-slate-700 italic uppercase text-xs tracking-widest">Visibilidade de Módulos (FeatureFlags)</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {configItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = featureFlags[item.key as keyof typeof featureFlags];
            
            return (
              <div key={item.key} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 italic uppercase text-sm tracking-tighter">{item.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.description}</p>
                  </div>
                </div>

                <button 
                  onClick={() => toggleFlag(item.key as keyof typeof featureFlags)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    isEnabled 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60'
                  }`}
                >
                  {isEnabled ? (
                    <>
                      <Eye size={16} /> Visível
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} /> Oculto
                    </>
                  )}
                  <div className={`w-11 h-6 flex items-center p-1 cursor-pointer transition-all duration-300 ease-in-out ml-2 ${
                    isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white shadow-sm transition-all duration-300 ease-in-out transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
        <h4 className="font-bold text-amber-800 text-sm mb-1 uppercase tracking-tighter italic">💡 Nota Administrativa</h4>
        <p className="text-xs text-amber-700 font-medium leading-relaxed italic">
          As alterações feitas aqui afetam em tempo real o menu lateral de todas as unidades logadas. 
          Módulos marcados como "Oculto" não aparecerão para os Gestores de Escolinha, sendo ideal para fases de teste ou manutenção.
        </p>
      </div>
    </div>
  );
};

export default MasterSettings;
