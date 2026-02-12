
import React, { useState, useEffect } from 'react';
import { UserRole, AppState, School, SchoolPlan, Athlete, Lead, PlanDefinition, SchoolConfig, Transaction, WhatsAppInstance } from './types';
import { PLAN_DEFINITIONS } from './constants';
import { supabase, isSupabaseConfigured } from './services/supabase';
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
import { Loader2, Mail, Lock, UserPlus, Building, ArrowRight, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  // Lógica de detecção de rota pública - Suporta caminhos limpos e fallback
  const detectPublicRoute = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // Detecta /matricular/slug ou #/matricular/slug
    if (path.startsWith('/matricular/')) {
      return { path: 'public-enrollment', slug: path.split('/')[2] };
    }
    if (hash.startsWith('#/matricular/')) {
      return { path: 'public-enrollment', slug: hash.split('/')[2] };
    }
    return { path: 'login', slug: null };
  };

  const initialRoute = detectPublicRoute();

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
    featureFlags: { athletes: true, leads: true, finance: true, whatsapp: true, plans: true, settings: true }
  });

  const [currentPath, setCurrentPath] = useState<string>(initialRoute.path);
  const [publicEnrollmentSlug, setPublicEnrollmentSlug] = useState<string | null>(initialRoute.slug);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const logoUrl = "https://lh3.googleusercontent.com/d/1UT57Wn4oFAqPMfj-8_3tZ5HzXIgr-to2";

  useEffect(() => {
    // Listener para mudanças de URL (botões voltar/avançar)
    const handleLocationChange = () => {
      const route = detectPublicRoute();
      setCurrentPath(route.path);
      setPublicEnrollmentSlug(route.slug);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserSession(session);
      } else {
        setState(prev => ({ ...prev, currentUser: null }));
        const route = detectPublicRoute();
        if (route.path !== 'public-enrollment') {
          setCurrentPath('login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
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
          currentUser: { id: session.user.id, role: profile.role as UserRole, schoolId: profile.school_id }
        }));
        
        const route = detectPublicRoute();
        if (route.path !== 'public-enrollment') {
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
          .insert([{ name: schoolName, email: email, plan: SchoolPlan.FREE, status: 'active' }])
          .select().single();
        if (schoolErr) throw schoolErr;
        const { error: signUpErr } = await supabase.auth.signUp({
          email, password, options: { data: { school_id: school.id, role: UserRole.SCHOOL_MANAGER } }
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
        athletes: athletesData.map(a => ({ ...a, name: a.name, registrationOrigin: a.registration_origin || 'manual' })),
        leads: (leadsData || []).map(l => ({ ...l, id: l.id })),
        transactions: (transactionsData || []).map(t => ({ ...t, id: t.id })),
        schoolConfig: {
          categories: categories.map(c => ({ id: c.id, name: c.name })),
          units: units.map(u => ({ id: u.id, name: u.name, isActive: u.is_active !== false })),
          teams: teams.map(t => ({ ...t, id: t.id })),
          monthlyPlans: monthlyPlans.map(mp => ({ ...mp, id: mp.id }))
        }
      }));
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (state.currentUser) fetchData(); }, [state.currentUser?.role, state.currentUser?.schoolId, state.impersonatingSchoolId]);

  const currentSchool = state.schools.find(s => s.id === (state.impersonatingSchoolId || state.currentUser?.schoolId)) || (state.schools.length > 0 ? state.schools[0] : null);

  // PRIORIDADE MÁXIMA: Rota de Auto-Matrícula
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
          <p className="text-slate-400 mb-10 font-black uppercase tracking-widest text-[10px]">Gestão Esportiva Profissional</p>
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
           {!isLoading && currentPath === 'athletes' && currentSchool && <Athletes athletes={state.athletes} config={state.schoolConfig!} school={currentSchool} onAddAthlete={() => fetchData()} onUpdateAthlete={() => fetchData()} onDeleteAthlete={() => fetchData()} />}
           {!isLoading && currentPath === 'leads' && currentSchool && <CRMLeads leads={state.leads} config={state.schoolConfig!} school={currentSchool} onUpdateStatus={() => fetchData()} onAddLead={() => fetchData()} onUpdateLead={() => fetchData()} onDeleteLead={() => fetchData()} onEnrollLead={() => fetchData()} />}
           {!isLoading && currentPath === 'settings' && currentSchool && <SchoolSettings school={currentSchool} config={state.schoolConfig!} onUpdateSettings={async (up) => { const sid = currentSchool.id; await supabase.from('schools').update({ name: up.name, manager_name: up.managerName, email: up.email, enrollment_fee: up.enrollmentFee, uniform_price: up.uniformPrice, is_multi_unit: up.hasMultipleUnits, slug: up.slug, auto_enrollment_enabled: up.autoEnrollmentEnabled, welcome_message: up.welcomeMessage }).eq('id', sid); fetchData(); }} onRefresh={fetchData} />}
           {!isLoading && currentPath === 'finance' && currentSchool && <SchoolFinance transactions={state.transactions} athletes={state.athletes} school={currentSchool} onUpdateTransaction={() => fetchData()} onDeleteTransaction={() => fetchData()} onAddTransaction={() => fetchData()} />}
           {!isLoading && currentPath === 'school-plans' && currentSchool && <SchoolPlans school={currentSchool} plans={state.plans} onUpgrade={async (p) => { await supabase.from('schools').update({ plan: p }).eq('id', currentSchool.id); fetchData(); }} />}
           {!isLoading && currentPath === 'whatsapp' && currentSchool && <WhatsAppIntegration schoolId={currentSchool.id} school={currentSchool} onNavigate={setCurrentPath} />}
        </div>
      </main>
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
