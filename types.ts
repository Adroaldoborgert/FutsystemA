
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
}

export interface SchoolConfig {
  categories: { id: string; name: string }[];
  teams: { id: string; name: string }[];
  monthlyPlans: { id: string; name: string; price: number }[];
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
  status: 'active' | 'inactive';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  lastPayment: string;
  enrollmentDate: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  athleteId: string;
  athleteName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  competenceDate: string;
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
