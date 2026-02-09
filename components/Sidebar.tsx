
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CircleDollarSign, 
  Settings, 
  LogOut, 
  Building2,
  Tags,
  BarChart3,
  MessageCircle,
  CalendarDays,
  CreditCard,
  Settings2,
  Shield
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  featureFlags?: {
    athletes: boolean;
    leads: boolean;
    finance: boolean;
    whatsapp: boolean;
    plans: boolean;
    settings: boolean;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ role, currentPath, onNavigate, onLogout, featureFlags }) => {
  const masterLinks = [
    { name: 'Controle MRR', path: 'master-dashboard', icon: LayoutDashboard },
    { name: 'Gestão de Unidades', path: 'master-units', icon: Building2 },
    { name: 'Gestão de Planos', path: 'master-plans', icon: Tags },
    { name: 'Financeiro SaaS', path: 'master-finance', icon: BarChart3 },
    { name: 'Configurações Master', path: 'master-settings', icon: Settings2 },
  ];

  const allSchoolLinks = [
    { name: 'Dashboard', path: 'school-dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { name: 'Atletas', path: 'athletes', icon: Users, key: 'athletes' },
    { name: 'Aulas Experimentais', path: 'leads', icon: CalendarDays, key: 'leads' },
    { name: 'Financeiro', path: 'finance', icon: CircleDollarSign, key: 'finance' },
    { name: 'WhatsApp', path: 'whatsapp', icon: MessageCircle, key: 'whatsapp' },
    { name: 'Meu Plano', path: 'school-plans', icon: CreditCard, key: 'plans' },
    { name: 'Configurações', path: 'settings', icon: Settings, key: 'settings' },
  ];

  const schoolLinks = role === UserRole.SCHOOL_MANAGER && featureFlags 
    ? allSchoolLinks.filter(link => {
        if (link.key === 'dashboard') return true;
        return featureFlags[link.key as keyof typeof featureFlags] !== false;
      })
    : allSchoolLinks;

  const links = role === UserRole.MASTER ? masterLinks : schoolLinks;
  const logoUrl = "https://drive.google.com/uc?export=view&id=1Yeb0tiyspiJUn-icr1aDjKZv5hI9HiAc";

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center">
            <img src={logoUrl} alt="FutSystem Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-black text-brand-purple italic uppercase tracking-tighter">
          FutSystem
        </h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {links.map((link) => {
          const Icon = (link as any).icon;
          const isActive = currentPath === link.path;
          const isWhatsApp = link.path === 'whatsapp';

          return (
            <button
              key={link.path}
              onClick={() => onNavigate(link.path)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-brand-purple text-white shadow-xl shadow-brand-purple/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-brand-purple'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isWhatsApp && !isActive ? 'text-[#00c67d]' : ''} />
                {link.name}
              </div>
              {isWhatsApp && isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#00c67d] animate-pulse" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut size={18} />
          Sair do FutSystem
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
