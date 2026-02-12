
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
import PublicEnrollment from './views/PublicEnrollment';
import { Shield, Loader2, Mail, Lock, UserPlus, LogIn, Building, ArrowRight, Menu, X } from 'lucide-react';

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const App: React.FC = () => {
  // Lógica de detecção imediata de rota para evitar flickers/bloqueios
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path.startsWith('/matricular/')) {
      return 'public-enrollment';
    }
    return 'login';
  };

  const getInitialSlug = () => {
    const path = window.location.pathname;
    if (path.startsWith('/matricular/')) {
      return path.split('/')[2] || null;
    }
    return null;
  };

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

  const [currentPath, setCurrentPath] = useState<string>(getInitialRoute());
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [publicEnrollmentSlug, setPublicEnrollmentSlug] = useState<string | null>(getInitialSlug());

  const logoUrl = "https://lh3.googleusercontent.com/d/1UT57Wn4oFAqPMfj-8_3tZ5HzXIgr-to2";

  useEffect(() => {
    // Sincroniza o estado caso o usuário use botões de voltar/avançar do navegador
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/matricular/')) {
        const slug = path.split('/')[2];
        if (slug) {
          setPublicEnrollmentSlug(slug);
          setCurrentPath('public-enrollment');
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserSession(session);
      } else {
        setState(prev => ({ ...prev, currentUser: null }));
        // Só redireciona para login se NÃO estiver em uma rota pública
        if (!window.location.pathname.startsWith('/matricular/')) {
            setCurrentPath('login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handleLocationChange);
    };
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
        
        // Se estivermos na rota de matrícula, NÃO redirecionamos para o dashboard
        if (!window.location.pathname.startsWith('/matricular/')) {
          setCurrentPath(profile.role === UserRole.MASTER ? 'master-dashboard' : 'school-dashboard');
        }
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
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
        alert("Cadastro realizado! Verifique seu e-mail.");
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
            managerName: s.manager_name || '',
            plan: s.plan as SchoolPlan,
            studentLimit: planDef ? planDef.studentLimit : (s.student_limit || 10),
            studentCount: s.student_count || 0,
            mrr: Number(s.mrr || 0),
            createdAt: s.created_at,
            enrollmentFee: s.enrollment_fee || 0,
            uniformPrice: s.uniform_price || 0,
            hasMultipleUnits: s.is_multi_unit || false,
            slug: s.slug || s.id,
            autoEnrollmentEnabled: s.auto_enrollment_enabled !== false,
            welcomeMessage: s.welcome_message || ''
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
          unit: a.unit || '',
          studentCpf: a.student_cpf || '',
          parentCpf: a.parent_cpf || '',
          parentAddress: a.parent_address || '',
          registrationOrigin: a.registration_origin || 'manual'
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
        unit: athlete.unit,
        student_cpf: athlete.studentCpf,
        parent_cpf: athlete.parentCpf,
        parent_address: athlete.parentAddress,
        registration_origin: 'manual'
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
        unit: updates.unit,
        student_cpf: updates.studentCpf,
        parent_cpf: updates.parentCpf,
        parent_address: updates.parentAddress
      }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao atualizar atleta:", err);
    }
  };

  const handleAddTransaction = async (transaction: Partial<Transaction>) => {
    const schoolId = state.impersonatingSchoolId || state.currentUser?.schoolId;
    if (!schoolId) return;
    try {
      const { error } = await supabase.from('transactions').insert([{
        school_id: schoolId,
        athlete_id: transaction.athleteId,
        athlete_name: transaction.athleteName,
        amount: transaction.amount,
        status: transaction.status,
        due_date: transaction.dueDate,
        competence_date: transaction.competenceDate,
        description: transaction.description,
        payment_date: transaction.paymentDate
      }]);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao adicionar transação:", err);
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { error } = await supabase.from('transactions').update({
        athlete_id: updates.athleteId,
        athlete_name: updates.athleteName,
        amount: updates.amount,
        status: updates.status,
        due_date: updates.dueDate,
        competence_date: updates.competenceDate,
        description: updates.description,
        payment_date: updates.paymentDate
      }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Erro ao atualizar transação:", err);
    }
  };

  useEffect(() => { 
    if (state.currentUser) fetchData();
  }, [state.currentUser?.role, state.currentUser?.schoolId, state.impersonatingSchoolId]);

  const currentSchool = state.schools.find(s => s.id === (state.impersonatingSchoolId || state.currentUser?.schoolId)) || (state.schools.length > 0 ? state.schools[0] : null);

  // Renderização da Rota Pública - PRIORIDADE MÁXIMA
  if (currentPath === 'public-enrollment' && publicEnrollmentSlug) {
    return <PublicEnrollment slug={publicEnrollmentSlug} />;
  }

  if (currentPath === 'login') {
    return (
      <div className="fixed inset-0 bg-brand-deep z-[100] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[10px] shadow-2xl w-full max-w-[440px] text-center border border-slate-100 flex flex-col items-center">
          <div className="mb-8 flex justify-center">
            <img src={logoUrl} alt="FutSystem Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-[2.2rem] font-black leading-tight text-brand-purple italic uppercase tracking-tighter mb-1">FUTSYSTEM</h1>
          <p className="text-slate-400 mb-10 font-black uppercase tracking-widest text-[10px]">Gestão Esportiva Professional</p>
          <form onSubmit={handleAuthSubmit} className="space-y-5 w-full text-left">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Unidade</label>
                <div className="relative">
                  <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Ex: Arena Fut Academy" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold transition-all text-sm" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" placeholder="admin@futsystem.com" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold transition-all text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" placeholder="••••••••" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold transition-all text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold uppercase italic text-center py-1">{error}</p>}
            <button type="submit" disabled={isAuthLoading} className="w-full py-4 bg-brand-purple text-white font-black rounded-2xl hover:opacity-90 transition-all transform active:scale-95 shadow-xl shadow-brand-purple/10 flex items-center justify-center gap-3 uppercase tracking-widest italic text-xs mt-4">
              {isAuthLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? <UserPlus size={18} /> : <ArrowRight size={18} />)}
              {isSignUp ? 'Cadastrar Unidade' : 'Acessar FutSystem'}
            </button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="mt-10 text-brand-purple text-[10px] font-black uppercase tracking-widest hover:underline italic">
            {isSignUp ? 'Já tenho uma conta? Entrar' : 'Novo por aqui? Cadastre sua escola'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar role={state.currentUser?.role || UserRole.SCHOOL_MANAGER} currentPath={currentPath} onNavigate={(path) => { setCurrentPath(path); setIsSidebarOpen(false); }} onLogout={handleLogout} featureFlags={state.featureFlags} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
           <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
           <span className="font-black text-brand-purple uppercase italic text-sm">FutSystem</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <main className={`md:ml-64 p-4 md:p-8 relative min-h-screen transition-all duration-300 ${isSidebarOpen ? 'blur-sm md:blur-none pointer-events-none md:pointer-events-auto' : ''}`}>
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
           {isLoading && <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-purple" size={40} /></div>}
           
           {!isLoading && currentPath === 'master-dashboard' && <MasterDashboard schools={state.schools} />}
           {!isLoading && currentPath === 'master-units' && ( <MasterUnits schools={state.schools} plans={state.plans} onImpersonate={(id) => { setState(prev => ({ ...prev, impersonatingSchoolId: id })); setCurrentPath('school-dashboard'); }} onUpdatePlan={async (sid, p) => { await supabase.from('schools').update({ plan: p }).eq('id', sid); fetchData(); }} onResetCredentials={() => {}} onAddSchool={async (s) => { await supabase.from('schools').insert([s]); fetchData(); }} onDeleteSchool={async (id) => { await supabase.from('schools').delete().eq('id', id); fetchData(); }} /> )}
           
           {!isLoading && currentPath === 'school-dashboard' && currentSchool && <SchoolDashboardV2 athletes={state.athletes} leads={state.leads} transactions={state.transactions} school={currentSchool} onNavigate={setCurrentPath} />}
           {!isLoading && currentPath === 'athletes' && currentSchool && <Athletes athletes={state.athletes} config={state.schoolConfig!} school={currentSchool} onAddAthlete={handleAddAthlete} onUpdateAthlete={handleUpdateAthlete} onDeleteAthlete={async (id) => { await supabase.from('athletes').delete().eq('id', id); fetchData(); }} />}
           {!isLoading && currentPath === 'leads' && currentSchool && <CRMLeads leads={state.leads} config={state.schoolConfig!} school={currentSchool} onAddLead={async (l) => { const schoolId = state.impersonatingSchoolId || state.currentUser?.schoolId; await supabase.from('leads').insert([{...l, school_id: schoolId}]); fetchData(); }} onUpdateStatus={async (id, s) => { await supabase.from('leads').update({ status: s }).eq('id', id); fetchData(); }} onUpdateLead={async (id, up) => { await supabase.from('leads').update(up).eq('id', id); fetchData(); }} onDeleteLead={async (id) => { await supabase.from('leads').delete().eq('id', id); fetchData(); }} onEnrollLead={async (l) => { await supabase.from('leads').update({ status: 'converted' }).eq('id', l.id); handleAddAthlete({ name: l.name, parentPhone: l.phone, status: 'active' }); }} />}
           {!isLoading && currentPath === 'settings' && currentSchool && <SchoolSettings school={currentSchool} config={state.schoolConfig!} onUpdateSettings={async (up) => { const sid = state.impersonatingSchoolId || state.currentUser?.schoolId; if(sid) { 
             const payload: any = { 
               name: up.name, 
               manager_name: up.managerName, 
               email: up.email, 
               enrollment_fee: up.enrollmentFee, 
               uniform_price: up.uniformPrice, 
               is_multi_unit: up.hasMultipleUnits,
               slug: up.slug,
               auto_enrollment_enabled: up.autoEnrollmentEnabled,
               welcome_message: up.welcomeMessage
             };
             await supabase.from('schools').update(payload).eq('id', sid); 
           } fetchData(); }} onRefresh={fetchData} />}
           {!isLoading && currentPath === 'finance' && currentSchool && <SchoolFinance transactions={state.transactions} athletes={state.athletes} school={currentSchool} onUpdateTransaction={handleUpdateTransaction} onDeleteTransaction={async (id) => { await supabase.from('transactions').delete().eq('id', id); fetchData(); }} onAddTransaction={handleAddTransaction} />}
           {!isLoading && currentPath === 'school-plans' && currentSchool && <SchoolPlans school={currentSchool} plans={state.plans} onUpgrade={async (p) => { await supabase.from('schools').update({ plan: p }).eq('id', state.currentUser?.schoolId); fetchData(); }} />}
           {!isLoading && currentPath === 'whatsapp' && currentSchool && <WhatsAppIntegration schoolId={state.currentUser?.schoolId || '1'} school={currentSchool} onStatusChange={(s) => setState(prev => ({...prev, whatsappInstance: s}))} onNavigate={setCurrentPath} />}
        </div>
      </main>
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
