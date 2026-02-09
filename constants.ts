
import { School, SchoolPlan, Athlete, Lead, PlanDefinition } from './types';

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: SchoolPlan.FREE,
    name: 'Grátis',
    price: 0,
    studentLimit: 10,
    features: ['Gestão de Alunos', 'Suporte Comunidade']
  },
  {
    id: SchoolPlan.STARTER,
    name: 'Starter',
    price: 199,
    studentLimit: 50,
    features: ['Gestão de Alunos', 'Financeiro Básico', 'Suporte Email']
  },
  {
    id: SchoolPlan.PROFESSIONAL,
    name: 'Professional',
    price: 499,
    studentLimit: 200,
    features: ['Gestão de Alunos', 'CRM Leads', 'Financeiro Completo', 'WhatsApp Automação']
  },
  {
    id: SchoolPlan.ENTERPRISE,
    name: 'Enterprise',
    price: 999,
    studentLimit: 10000,
    features: ['Ilimitado', 'Multiclube', 'API de Integração', 'Suporte 24/7']
  }
];

export const MOCK_SCHOOLS: School[] = [
  { id: '1', name: 'Arena Soccer Academy', managerName: 'Ricardo Oliveira', email: 'arena@academy.com', plan: SchoolPlan.PROFESSIONAL, studentCount: 145, studentLimit: 200, mrr: 15400, status: 'active', createdAt: '2023-01-10' },
  { id: '2', name: 'Tênis Club Prime', managerName: 'Ana Paula Costa', email: 'contato@tenisprime.com', plan: SchoolPlan.STARTER, studentCount: 42, studentLimit: 50, mrr: 8200, status: 'active', createdAt: '2023-05-15' },
  { id: '3', name: 'Basketball Pro São Paulo', managerName: 'Marcos Vinicius', email: 'gestao@bbpro.com', plan: SchoolPlan.ENTERPRISE, studentCount: 310, studentLimit: 10000, mrr: 28500, status: 'active', createdAt: '2022-11-20' },
];

export const MOCK_ATHLETES: Athlete[] = [
  { id: 'a1', name: 'João Silva', parentName: 'Carlos Silva', parentPhone: '(11) 99988-7766', birthDate: '2014-05-12', category: 'Sub-9', team: 'Turma A', plan: 'Mensal', hasUniform: true, status: 'active', paymentStatus: 'paid', lastPayment: '2023-10-01', enrollmentDate: '2023-01-15' },
  { id: 'a2', name: 'Maria Souza', parentName: 'Julia Souza', parentPhone: '(11) 98877-6655', birthDate: '2012-08-20', category: 'Sub-11', team: 'Turma B', plan: 'Trimestral', hasUniform: false, status: 'active', paymentStatus: 'pending', lastPayment: '2023-09-01', enrollmentDate: '2023-03-20' },
  { id: 'a3', name: 'Pedro Santos', parentName: 'Renato Santos', parentPhone: '(11) 97766-5544', birthDate: '2016-01-10', category: 'Sub-7', team: 'Turma C', plan: 'Mensal', hasUniform: true, status: 'inactive', paymentStatus: 'overdue', lastPayment: '2023-08-15', enrollmentDate: '2022-11-10' },
];

export const MOCK_LEADS: Lead[] = [
  { 
    id: 'l1', 
    name: 'afdroaldo', 
    parentName: 'Carlos Sr.', 
    phone: '51998474dd', 
    birthDate: '2014-05-12',
    trialDate: '05/02/2026',
    trialTime: '18:30',
    origin: 'OUTRO',
    categoryInterest: 'Sub-7', 
    status: 'new', 
    notes: 'Interessado em aulas de terça e quinta.' 
  },
  { 
    id: 'l2', 
    name: 'Gabriel Ferreira', 
    parentName: 'Julia Ferreira', 
    phone: '(11) 97766-5544', 
    birthDate: '2016-08-20',
    trialDate: '08/02/2026',
    trialTime: '15:00',
    origin: 'INSTAGRAM',
    categoryInterest: 'Sub-11', 
    status: 'trial_scheduled', 
    notes: 'Agendado para sábado às 10h.' 
  }
];
