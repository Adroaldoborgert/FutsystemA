
export enum UserRole {
  MASTER = 'MASTER',
  SCHOOL_MANAGER = 'SCHOOL_MANAGER'
}

export enum SchoolPlan {
  FREE = 'Grátis',
  STARTER = 'Starter',
  PROFESSIONAL = 'Professional',
  ENTERPRISE = 'Enterprise'
}

export interface PlanDefinition {
  id: SchoolPlan;
  name: string;
  price: number;
  studentLimit: number;
  features: string[];
}

export interface School {
  id: string;
  name: string;
  managerName: string;
  email: string;
  plan: SchoolPlan;
  studentCount: number;
  studentLimit: number;
  mrr: number;
  status: 'active' | 'inactive';
  createdAt: string;
  password?: string;
  enrollmentFee?: number;
  uniformPrice?: number;
  hasMultipleUnits?: boolean;
  slug?: string;
  autoEnrollmentEnabled?: boolean;
  welcomeMessage?: string;
}

export interface Unit {
  id: string;
  name: string;
  isActive: boolean;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  operating_hours?: string;
}

export interface SchoolConfig {
  categories: { id: string; name: string }[];
  units: Unit[];
  teams: { 
    id: string; 
    name: string; 
    schedule?: string; 
    category?: string; 
    unit?: string;
    maxStudents?: number; 
    active?: boolean; 
  }[];
  monthlyPlans: { id: string; name: string; price: number; dueDay?: number }[];
}

export interface Athlete {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string;
  birthDate: string;
  category: string;
  team: string;
  plan: string;
  hasUniform: boolean;
  status: 'active' | 'inactive' | 'pendente_validacao';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  lastPayment: string;
  enrollmentDate: string;
  notes?: string;
  unit?: string;
  studentCpf?: string;
  parentCpf?: string;
  parentAddress?: string;
  registrationOrigin?: 'manual' | 'auto_matricula';
}

export interface Transaction {
  id: string;
  athleteId: string;
  athleteName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  competenceDate: string;
  description?: string;
  paymentDate?: string;
  reminderSent?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  parentName: string;
  phone: string;
  birthDate?: string;
  trialDate?: string;
  trialTime?: string;
  origin?: string;
  categoryInterest: string;
  status: 'new' | 'trial_scheduled' | 'attended' | 'converted';
  notes: string;
  reminderSent?: boolean;
  unit?: string;
}

export interface WhatsAppInstance {
  instanceName: string;
  status: 'open' | 'connecting' | 'connected' | 'closed';
  owner?: string;
  number?: string;
  profilePictureUrl?: string;
  messageTemplates?: any;
  notificationRules?: any;
}

export interface AppState {
  currentUser: {
    id: string;
    role: UserRole;
    schoolId?: string;
  } | null;
  schools: School[];
  athletes: Athlete[];
  leads: Lead[];
  transactions: Transaction[];
  plans: PlanDefinition[];
  impersonatingSchoolId: string | null;
  schoolConfig?: SchoolConfig;
  whatsappInstance: WhatsAppInstance | null;
  featureFlags: {
    athletes: boolean;
    leads: boolean;
    finance: boolean;
    whatsapp: boolean;
    plans: boolean;
    settings: boolean;
  };
}
