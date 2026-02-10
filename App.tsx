
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, AppState, School, SchoolPlan, Athlete, Lead, PlanDefinition, SchoolConfig, Transaction, WhatsAppInstance } from './types';
import { PLAN_DEFINITIONS, MOCK_SCHOOLS, MOCK_ATHLETES, MOCK_LEADS } from './constants';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { whatsappService } from './services/whatsappService';
import Sidebar from './components/Sidebar';
import MasterDashboard from './views/MasterDashboard';
import MasterUnits from './views/MasterUnits';
import MasterPlans from './views/MasterPlans';
import MasterFinance from './views/MasterFinance';
import MasterSettings from './views/MasterSettings';
import SchoolDashboardV2 from './views/SchoolDashboardV2';
import CRMLeads from './views/CRMLeads';
import Athletes from './views/Athletes';
import SchoolSettings from './views/SchoolSettings';
import SchoolFinance from './views/SchoolFinance';
import WhatsAppIntegration from './views/WhatsAppIntegration';
import SchoolPlans from './views/SchoolPlans';
import { Shield, Loader2, Mail, Lock, UserPlus, LogIn, Building, ArrowRight } from 'lucide-react';

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    schools: [],
    athletes: [],
    leads: [],
    transactions: [],
    plans: [],
    impersonatingSchoolId: null,
    schoolConfig: { categories: [], teams: [], monthlyPlans: [], units: [] },
    whatsappInstance: null,
    featureFlags: {
      athletes: true,
      leads: true,
      finance: true,
      whatsapp: true,
      plans: true,
      settings: true
    }
  });

  const [currentPath, setCurrentPath] = useState<string>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const logoUrl = "https://lh3.googleusercontent.com/d/1UT57Wn4oFAqPMfj-8_3tZ5HzXIgr-to2";

  const currentSchool = state.schools.find(s => s.id === (state.impersonatingSchoolId || state.currentUser?.schoolId)) || state.schools[0];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserSession(session);
      } else {
        setState(prev => ({ ...prev, currentUser: null }));
        setCurrentPath('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (session: any) => {
    setIsAuthLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setState(prev => ({
          ...prev,
          currentUser: {
            id: session.user.id,
            role: profile.role as UserRole,
            schoolId: profile.school_id
          }
        }));
        setCurrentPath(profile.role === UserRole.MASTER ? 'master-dashboard' : 'school-dashboard');
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setError("Erro ao carregar seu perfil. Tente novamente.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthLoading(true);

    try {
      if (isSignUp) {
        const { data: school, error: schoolErr } = await supabase
          .from('schools')
          .insert([{ 
            name: schoolName, 
            email: email, 
            plan: SchoolPlan.FREE, 
            status: 'active' 
          }])
          .select()
          .single();

        if (schoolErr) throw schoolErr;

        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              school_id: school.id,
              role: UserRole.SCHOOL_MANAGER 
            }
          }
        });
        if (signUpErr) throw signUpErr;
        alert("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
        setIsSignUp(false);
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
      }
    } catch (err: any) {
      setError(err.message || "Erro na autenticação.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setState(prev => ({ ...prev, currentUser: null, impersonatingSchoolId: null }));
    setCurrentPath('login');
  };

  const fetchData = async () => {
    if (!isSupabaseConfigured() || !state.currentUser) return;
    setIsLoading(true);
    const activeSchoolId = state.impersonatingSchoolId || state.currentUser?.schoolId;

    try {
      const { data: masterFlags } = await supabase.from('master_configs').select('feature_flags').eq('id', 1).maybeSingle();

      const [schoolsRes, plansRes] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        supabase.from('plans').select('*').order('price')
      ]);

      const mappedPlans: PlanDefinition[] = (plansRes.data || []).map(p => ({
        id: p.id as SchoolPlan,
        name: p.name,
        price: Number(p.price),
        studentLimit: p.student_limit,
        features: p.features || []
      }));

      let athletesData = [];
      let leadsData = [];
      let transactionsData = [];
      let categories = [];
      let teams = [];
      let monthlyPlans = [];
      let units = [];

      if (activeSchoolId) {
        const [athRes, leadRes, transRes, catRes, teamRes, mPlanRes, unitRes] = await Promise.all([
          supabase.from('athletes').select('*').eq('school_id', activeSchoolId).order('name'),
          supabase.from('leads').select('*').eq('school_id', activeSchoolId).order('created_at', { ascending: false }),
          supabase.from('transactions').select('*').eq('school_id', activeSchoolId).order('due_date', { ascending: true }),
          supabase.from('school_categories').select('*').eq('school_id', activeSchoolId).order('name'),
          supabase.from('school_teams').select('*').eq('school_id', activeSchoolId).order('name'),
          supabase.from('school_monthly_plans').select('*').eq('school_id', activeSchoolId).order('name'),
          supabase.from('school_units').select('*').eq('school_id', activeSchoolId).order('name')
        ]);

        athletesData = athRes.data || [];
        leadsData = leadRes.data || [];
        transactionsData = transRes.data || [];
        categories = catRes.data || [];
        teams = teamRes.data || [];
        monthlyPlans = mPlanRes.data || [];
        units = unitRes.data || [];
      }

      setState(prev => ({
        ...prev,
        featureFlags: masterFlags?.feature_flags || prev.featureFlags,
        plans: mappedPlans.length ? mappedPlans : PLAN_DEFINITIONS,
        schools: (schoolsRes.data || []).map(s => {
          const planDef = mappedPlans.find(p => p.id === s.plan || p.name === s.plan);
          return {
            ...s,
            plan: s.plan as SchoolPlan,
            studentLimit: planDef ? planDef.studentLimit : (s.student_limit || 10),
            studentCount: s.student_count || 0,
            mrr: Number(s.mrr || 0),
            createdAt: s.created_at,
            enrollmentFee: s.enrollment_fee || 0,
            uniformPrice: s.uniform_price || 0,
            hasMultipleUnits: s.is_multi_unit || false,
            managerName: s.manager_name || ''
          };
        }),
        athletes: athletesData.map(a => ({
          id: a.id,
          name: a.name,
          parentName: a.parent_name,
          parentPhone: a.parent_phone,
          birthDate: a.birth_date,
          category: a.category,
          team: a.team,
          plan: a.plan,
          hasUniform: a.has_uniform,
          status: a.status,
          paymentStatus: a.payment_status || 'pending',
          lastPayment: a.last_payment || '',
          enrollmentDate: a.enrollment_date,
          notes: a.notes || '',
          unit: a.unit || ''
        })),
        leads: (leadsData || []).map(l => ({
          id: l.id,
          name: l.name,
          parentName: l.parent_name || '',
          phone: l.phone || '',
          birthDate: l.age || '',
          trialDate: l.trial_date || '',
          trialTime: l.trial_time || '',
          origin: l.origin || 'Outros',
          categoryInterest: l.category_interest || '',
          status: l.status || 'new',
          notes: l.notes || '',
          reminderSent: l.reminder_sent || false,
          unit: l.unit || ''
        })),
        transactions: (transactionsData || []).map(t => ({
          id: t.id,
          athleteId: t.athlete_id,
          athleteName: t.athlete_name,
          amount: Number(t.amount),
          status: t.status,
          dueDate: t.due_date,
          competenceDate: t.competence_date || '',
          description: t.description || '',
          paymentDate: t.payment_date,
          reminderSent: false
        })),
        schoolConfig: {
          categories: categories.map(c => ({ id: c.id, name: c.name })),
          units: units.map(u => ({ id: u.id, name: u.name, isActive: u.is_active !== false })),
          teams: teams.map(t => ({ 
            id: t.id, 
            name: t.name, 
            schedule: t.schedule, 
            category: t.category, 
            unit: t.unit,
            maxStudents: t.max_students, 
            active: t.active 
          })),
          monthlyPlans: monthlyPlans.map(mp => ({ 
            id: mp.id, 
            name: mp.name, 
            price: Number(mp.price),
            dueDay: mp.dueDay || 10
          }))
        }
      }));
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFeatureFlags = async (flags: any) => {
    try {
      const { error } = await supabase.from('master_configs').update({ feature_flags: flags }).eq('id', 1);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao atualizar feature flags:", err);
    }
  };

  const handleAddAthlete = async (athlete: Partial<Athlete>) => {
    const schoolId = state.impersonatingSchoolId || state.currentUser?.schoolId;
    if (!schoolId) return;
    try {
      const { error } = await supabase.from('athletes').insert([{
        school_id: schoolId,
        name: athlete.name,
        parent_name: athlete.parentName,
        parent_phone: athlete.parentPhone,
        birth_date: athlete.birthDate || null,
        category: athlete.category,
        team: athlete.team,
        plan: athlete.plan,
        has_uniform: athlete.hasUniform,
        status: athlete.status || 'active',
        enrollment_date: athlete.enrollmentDate || new Date().toISOString().split('T')[0],
        notes: athlete.notes,
        unit: athlete.unit
      }]);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao adicionar atleta:", err);
    }
  };

  const handleUpdateAthlete = async (id: string, updates: Partial<Athlete>) => {
    try {
      const { error } = await supabase.from('athletes').update({
        name: updates.name,
        parent_name: updates.parentName,
        parent_phone: updates.parentPhone,
        birth_date: updates.birthDate || null,
        category: updates.category,
        team: updates.team,
        plan: updates.plan,
        has_uniform: updates.hasUniform,
        status: updates.status,
        enrollment_date: updates.enrollmentDate,
        notes: updates.notes,
        unit: updates.unit
      }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao atualizar atleta:", err);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: Lead['status']) => {
    try {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao atualizar status do lead:", err);
    }
  };

  const handleAddLead = async (lead: Partial<Lead>) => {
    const schoolId = state.impersonatingSchoolId || state.currentUser?.schoolId;
    if (!schoolId) return;
    try {
      const { error } = await supabase.from('leads').insert([{
        school_id: schoolId,
        name: lead.name,
        parent_name: lead.parentName,
        phone: lead.phone,
        age: lead.birthDate === '' ? null : lead.birthDate,
        trial_date: lead.trialDate === '' ? null : lead.trialDate,
        trial_time: lead.trialTime === '' ? null : lead.trialTime,
        origin: lead.origin,
        category_interest: lead.categoryInterest,
        status: lead.status || 'new',
        notes: lead.notes,
        unit: lead.unit
      }]);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao adicionar lead:", err);
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { error } = await supabase.from('transactions').update({
        status: updates.status,
        amount: updates.amount,
        due_date: updates.dueDate,
        payment_date: updates.paymentDate === '' ? null : updates.paymentDate,
        competence_date: updates.competenceDate,
        description: updates.description
      }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao atualizar transação:", err);
    }
  };

  const handleAddTransaction = async (trans: Partial<Transaction>) => {
    const schoolId = state.impersonatingSchoolId || state.currentUser?.schoolId;
    if (!schoolId) return;
    try {
      const { error } = await supabase.from('transactions').insert([{
        school_id: schoolId,
        athlete_id: trans.athleteId,
        athlete_name: trans.athleteName,
        amount: trans.amount,
        status: trans.status || 'pending',
        due_date: trans.dueDate,
        competence_date: trans.competenceDate,
        description: trans.description,
        payment_date: trans.paymentDate === '' ? null : trans.paymentDate
      }]);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao adicionar transação:", err);
    }
  };

  const handleGenerateBulk = async (month: string, year: string, dueDay: number) => {
    const schoolId = state.impersonatingSchoolId || state.currentUser?.schoolId;
    if (!schoolId) return;
    
    const activeAthletes = state.athletes.filter(a => a.status === 'active');
    const competence = `${month}/${year}`;
    
    const monthIndex = MONTHS.indexOf(month.toLowerCase());
    const dueDate = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${dueDay.toString().padStart(2, '0')}`;
    
    const newTransactions = activeAthletes.map(athlete => {
        const plan = state.schoolConfig?.monthlyPlans.find(p => p.name === athlete.plan);
        const amount = plan ? plan.price : 0;
        
        return {
            school_id: schoolId,
            athlete_id: athlete.id,
            athlete_name: athlete.name,
            amount: amount,
            status: 'pending',
            due_date: dueDate,
            competence_date: competence,
            description: 'Mensalidade'
        };
    });

    if (newTransactions.length === 0) {
        alert("Nenhum atleta ativo encontrado para gerar cobranças.");
        return;
    }

    try {
        const { error } = await supabase.from('transactions').insert(newTransactions);
        if (error) throw error;
        alert(`${newTransactions.length} mensalidades geradas com sucesso!`);
        fetchData();
    } catch (err) {
        console.error("Erro ao gerar mensalidades em massa:", err);
        alert("Erro ao gerar mensalidades.");
    }
  };

  const handleAutoTrialReminders = async () => {
    const schoolId = state.impersonatingSchoolId || state.currentUser?.schoolId;
    if (!schoolId || !state.whatsappInstance || state.whatsappInstance.status !== 'connected') return;

    const { data: config } = await supabase.from('whatsapp_configs').select('notification_rules').eq('school_id', schoolId).single();
    if (!config?.notification_rules?.trialReminder) return;

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const leadsToNotify = state.leads.filter(l => 
      l.status === 'trial_scheduled' && 
      l.trial_date === tomorrowStr && 
      !l.reminderSent
    );

    if (leadsToNotify.length > 0) {
      await handleNotifyWhatsApp('trial', leadsToNotify);
      for (const lead of leadsToNotify) {
        await supabase.from('leads').update({ reminder_sent: true }).eq('id', lead.id);
      }
      fetchData(); 
    }
  };

  useEffect(() => { 
    if (state.currentUser) {
      fetchData().then(() => {
         handleAutoTrialReminders();
      });
    }
  }, [state.currentUser?.role, state.currentUser?.schoolId, state.impersonatingSchoolId, state.whatsappInstance?.status]);

  const handleNotifyWhatsApp = async (type: 'overdue' | 'expiry5days' | 'trial', targets: any[]) => {
    const schoolId = state.impersonatingSchoolId || state.currentUser?.schoolId;
    if (!schoolId) return;

    const instanceName = `school_${schoolId}`;
    const { data: config } = await supabase.from('whatsapp_configs').select('message_templates').eq('school_id', schoolId).single();
    const template = config?.message_templates?.[type];

    if (!template) {
      alert("Template de mensagem não configurado na aba WhatsApp.");
      return;
    }

    for (const target of targets) {
      let message = template;
      if (type === 'trial') {
        message = message.replace('{lead_name}', target.name).replace('{trial_date}', new Date(target.trial_date).toLocaleDateString('pt-BR')).replace('{trial_time}', target.trial_time || '');
      } else {
        const athlete = state.athletes.find(a => a.id === target.athleteId);
        message = message.replace('{athlete_name}', target.athleteName)
                         .replace('{parent_name}', athlete?.parentName || 'Responsável')
                         .replace('{due_date}', new Date(target.dueDate).toLocaleDateString('pt-BR'))
                         .replace('{amount}', target.amount.toFixed(2))
                         .replace('{competence}', target.competenceDate);
      }
      
      const phone = type === 'trial' ? target.phone : state.athletes.find(a => a.id === target.athleteId)?.parentPhone;
      if (phone) {
        await whatsappService.sendText(instanceName, phone, message);
      }
    }
    if (type !== 'trial' || targets.length > 1) {
        alert(`Disparos de ${type} concluídos para ${targets.length} contatos.`);
    }
  };

  if (currentPath === 'login') {
    return (
      <div className="fixed inset-0 bg-brand-deep z-[100] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[10px] shadow-2xl w-full max-w-[440px] text-center border border-slate-100 flex flex-col items-center">
          <div className="mb-8 flex justify-center">
            <img src={logoUrl} alt="FutSystem Logo" className="w-20 h-20 object-contain" />
          </div>
          
          <h1 className="text-[2.2rem] font-black leading-tight text-brand-purple italic uppercase tracking-tighter mb-1">FUTSYSTEM</h1>
          <p className="text-slate-400 mb-10 font-black uppercase tracking-widest text-[10px]">Gestão Esportiva Profissional</p>
          
          <form onSubmit={handleAuthSubmit} className="space-y-5 w-full text-left">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Unidade</label>
                <div className="relative">
                  <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Ex: Arena Fut Academy" 
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold transition-all text-sm"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="admin@futsystem.com" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold uppercase italic text-center py-1">{error}</p>}
            
            <button 
              type="submit" 
              disabled={isAuthLoading}
              className="w-full py-4 bg-brand-purple text-white font-black rounded-2xl hover:opacity-90 transition-all transform active:scale-95 shadow-xl shadow-brand-purple/10 flex items-center justify-center gap-3 uppercase tracking-widest italic text-xs mt-4"
            >
              {isAuthLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? <UserPlus size={18} /> : <ArrowRight size={18} />)}
              {isSignUp ? 'Cadastrar Unidade' : 'Acessar FutSystem'}
            </button>
          </form>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-10 text-brand-purple text-[10px] font-black uppercase tracking-widest hover:underline italic"
          >
            {isSignUp ? 'Já tenho uma conta? Entrar' : 'Novo por aqui? Cadastre sua escola'}
          </button>
        </div>
      </div>
    );
  }

  const isSchoolView = !currentPath.startsWith('master-');
  const isDataMissing = isSchoolView && !currentSchool && state.currentUser?.role === UserRole.SCHOOL_MANAGER;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar 
        role={state.currentUser?.role || UserRole.SCHOOL_MANAGER} 
        currentPath={currentPath} 
        onNavigate={setCurrentPath} 
        onLogout={handleLogout} 
        featureFlags={state.featureFlags}
      />
      <main className="ml-64 p-8 relative min-h-screen">
        {(isLoading || isAuthLoading) && ( 
          <div className="fixed top-4 right-8 flex items-center gap-2 text-brand-purple font-bold bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-xl z-[100] border border-brand-purple/10"> 
            <Loader2 size={18} className="animate-spin" /> {isAuthLoading ? 'Autenticando...' : 'Sincronizando...'} 
          </div> 
        )}
        
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isDataMissing ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-bold uppercase italic tracking-widest text-xs text-brand-purple">Acessando dados FutSystem...</p>
            </div>
          ) : (
            <>
              {currentPath === 'master-dashboard' && <MasterDashboard schools={state.schools} />}
              {currentPath === 'master-units' && ( <MasterUnits schools={state.schools} plans={state.plans} onImpersonate={(id) => { setState(prev => ({ ...prev, impersonatingSchoolId: id })); setCurrentPath('school-dashboard'); }} onUpdatePlan={async (sid, p) => { await supabase.from('schools').update({ plan: p }).eq('id', sid); fetchData(); }} onResetCredentials={() => {}} onAddSchool={async (s) => { await supabase.from('schools').insert([s]); fetchData(); }} /> )}
              {currentPath === 'master-plans' && ( <MasterPlans plans={state.plans} onUpdatePlanDefinition={async (pid, up) => { await supabase.from('plans').update({ name: up.name, price: up.price, student_limit: up.studentLimit, features: up.features }).eq('id', pid); fetchData(); }} /> )}
              {currentPath === 'master-finance' && <MasterFinance schools={state.schools} />}
              {currentPath === 'master-settings' && <MasterSettings featureFlags={state.featureFlags} onUpdateFlags={handleUpdateFeatureFlags} />}
              
              {currentPath === 'school-dashboard' && currentSchool && (
                <SchoolDashboardV2 
                  athletes={state.athletes} 
                  leads={state.leads} 
                  transactions={state.transactions}
                  school={currentSchool} 
                  onNavigate={setCurrentPath}
                />
              )}
              {currentPath === 'athletes' && currentSchool && <Athletes athletes={state.athletes} config={state.schoolConfig!} school={currentSchool} onAddAthlete={handleAddAthlete} onUpdateAthlete={handleUpdateAthlete} onDeleteAthlete={async (id) => { await supabase.from('athletes').delete().eq('id', id); fetchData(); }} />}
              {currentPath === 'leads' && <CRMLeads leads={state.leads} config={state.schoolConfig!} school={currentSchool} whatsappConnected={!!state.whatsappInstance} onUpdateStatus={handleUpdateLeadStatus} onAddLead={handleAddLead} onUpdateLead={async (id, up) => { 
                await supabase.from('leads').update({
                  name: up.name,
                  parent_name: up.parentName,
                  phone: up.phone,
                  age: up.birthDate === '' ? null : up.birthDate,
                  trial_date: up.trialDate === '' ? null : up.trialDate,
                  trial_time: up.trialTime === '' ? null : up.trialTime,
                  origin: up.origin,
                  category_interest: up.categoryInterest,
                  status: up.status,
                  notes: up.notes,
                  unit: up.unit
                }).eq('id', id); 
                fetchData(); 
              }} onDeleteLead={async (id) => { await supabase.from('leads').delete().eq('id', id); fetchData(); }} onEnrollLead={async (l) => { 
                await supabase.from('leads').update({ status: 'converted' }).eq('id', l.id); 
                const athleteData: Partial<Athlete> = {
                  name: l.name,
                  parentName: l.parentName || '',
                  parentPhone: l.phone || '',
                  birthDate: l.birthDate || '',
                  category: l.categoryInterest,
                  status: 'active',
                  enrollmentDate: new Date().toISOString().split('T')[0],
                  unit: l.unit
                };
                handleAddAthlete(athleteData); 
              }} onNotifyLead={(lead) => handleNotifyWhatsApp('trial', [lead])} />}
              {currentPath === 'finance' && <SchoolFinance transactions={state.transactions} athletes={state.athletes} school={currentSchool} whatsappConnected={!!state.whatsappInstance} onUpdateTransaction={handleUpdateTransaction} onDeleteTransaction={async (id) => { await supabase.from('transactions').delete().eq('id', id); fetchData(); }} onAddTransaction={handleAddTransaction} onGenerateBulk={handleGenerateBulk} onNotifyBulk={(targets) => handleNotifyWhatsApp('overdue', targets)} onNotifyUpcoming={(targets) => handleNotifyWhatsApp('expiry5days', targets)} />}
              {currentPath === 'whatsapp' && currentSchool && <WhatsAppIntegration schoolId={state.currentUser?.schoolId || '1'} school={currentSchool} onStatusChange={(s) => setState(prev => ({...prev, whatsappInstance: s}))} onNavigate={setCurrentPath} />}
              {currentPath === 'school-plans' && currentSchool && <SchoolPlans school={currentSchool} plans={state.plans} onUpgrade={async (p) => { await supabase.from('schools').update({ plan: p }).eq('id', state.currentUser?.schoolId); fetchData(); }} />}
              {currentPath === 'settings' && currentSchool && <SchoolSettings school={currentSchool} config={state.schoolConfig!} onUpdateSettings={async (up) => { 
                const sid = state.impersonatingSchoolId || state.currentUser?.schoolId; 
                if(sid) {
                  const dbUpdates: any = {};
                  if (up.name !== undefined) dbUpdates.name = up.name;
                  if (up.managerName !== undefined) dbUpdates.manager_name = up.managerName;
                  if (up.email !== undefined) dbUpdates.email = up.email;
                  if (up.enrollmentFee !== undefined) dbUpdates.enrollment_fee = up.enrollmentFee;
                  if (up.uniformPrice !== undefined) dbUpdates.uniform_price = up.uniformPrice;
                  if (up.hasMultipleUnits !== undefined) dbUpdates.is_multi_unit = up.hasMultipleUnits;
                  if (Object.keys(dbUpdates).length > 0) {
                    await supabase.from('schools').update(dbUpdates).eq('id', sid);
                  }
                }
                fetchData(); 
              }} onRefresh={fetchData} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
