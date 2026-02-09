
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, AppState, School, SchoolPlan, Athlete, Lead, PlanDefinition, SchoolConfig, Transaction, WhatsAppInstance } from './types';
import { PLAN_DEFINITIONS, MOCK_SCHOOLS, MOCK_ATHLETES, MOCK_LEADS } from './constants';
import { supabase, isSupabaseConfigured } from './services/supabase';
import Sidebar from './components/Sidebar';
import MasterDashboard from './views/MasterDashboard';
import MasterUnits from './views/MasterUnits';
import MasterPlans from './views/MasterPlans';
import MasterFinance from './views/MasterFinance';
import MasterSettings from './views/MasterSettings';
import SchoolDashboard from './views/SchoolDashboard';
import CRMLeads from './views/CRMLeads';
import Athletes from './views/Athletes';
import SchoolSettings from './views/SchoolSettings';
import SchoolFinance from './views/SchoolFinance';
import WhatsAppIntegration from './views/WhatsAppIntegration';
import SchoolPlans from './views/SchoolPlans';
import { ShieldCheck, Loader2, Mail, Lock, UserPlus, LogIn, Building } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    schools: [],
    athletes: [],
    leads: [],
    transactions: [],
    plans: [],
    impersonatingSchoolId: null,
    schoolConfig: { categories: [], teams: [], monthlyPlans: [] },
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
        // Fluxo de Cadastro de Unidade
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
        // Fluxo de Login
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
      const [schoolsRes, plansRes] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        supabase.from('plans').select('*').order('price')
      ]);

      // Busca Feature Flags globais (opcional - persistência local se a tabela não existir)
      const { data: masterFlags } = await supabase.from('master_configs').select('feature_flags').maybeSingle();

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

      if (activeSchoolId) {
        const [athRes, leadRes, transRes, catRes, teamRes, mPlanRes] = await Promise.all([
          supabase.from('athletes').select('*').eq('school_id', activeSchoolId).order('name'),
          supabase.from('leads').select('*').eq('school_id', activeSchoolId).order('created_at', { ascending: false }),
          supabase.from('transactions').select('*').eq('school_id', activeSchoolId).order('due_date', { ascending: true }),
          supabase.from('school_categories').select('*').eq('school_id', activeSchoolId).order('name'),
          supabase.from('school_teams').select('*').eq('school_id', activeSchoolId).order('name'),
          supabase.from('school_monthly_plans').select('*').eq('school_id', activeSchoolId).order('name')
        ]);

        athletesData = athRes.data || [];
        leadsData = leadRes.data || [];
        transactionsData = transRes.data || [];
        categories = catRes.data || [];
        teams = teamRes.data || [];
        monthlyPlans = mPlanRes.data || [];
      }

      setState(prev => ({
        ...prev,
        featureFlags: masterFlags?.feature_flags || prev.featureFlags,
        plans: mappedPlans.length ? mappedPlans : PLAN_DEFINITIONS,
        schools: (schoolsRes.data || []).map(s => {
          // Busca o limite de alunos baseado na definição do plano no banco de dados
          const planDef = mappedPlans.find(p => p.id === s.plan || p.name === s.plan);
          return {
            ...s,
            plan: s.plan as SchoolPlan,
            studentLimit: planDef ? planDef.studentLimit : (s.student_limit || 10),
            studentCount: s.student_count || 0,
            mrr: Number(s.mrr || 0),
            createdAt: s.created_at
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
          notes: a.notes || ''
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
          reminderSent: l.reminder_sent || false
        })),
        transactions: (transactionsData || []).map(t => ({
          id: t.id,
          athleteId: t.athlete_id,
          athleteName: t.athlete_name,
          amount: Number(t.amount),
          status: t.status,
          dueDate: t.due_date,
          competenceDate: t.competence_date,
          paymentDate: t.payment_date,
          reminderSent: false
        })),
        schoolConfig: {
          categories: categories.map(c => ({ id: c.id, name: c.name })),
          teams: teams.map(t => ({ id: t.id, name: t.name })),
          monthlyPlans: monthlyPlans.map(mp => ({ id: mp.id, name: mp.name, price: Number(mp.price) }))
        }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    if (state.currentUser) fetchData(); 
  }, [state.currentUser?.role, state.currentUser?.schoolId, state.impersonatingSchoolId]);

  const handleUpdateAthlete = async (id: string, updates: Partial<Athlete>) => {
    await supabase.from('athletes').update({
      name: updates.name,
      parent_name: updates.parentName,
      parent_phone: updates.parentPhone,
      birth_date: updates.birthDate,
      category: updates.category,
      team: updates.team,
      plan: updates.plan,
      has_uniform: updates.hasUniform,
      status: updates.status,
      payment_status: updates.paymentStatus
    }).eq('id', id);
    fetchData();
  };

  const handleAddAthlete = async (athlete: Partial<Athlete>) => {
    const sid = state.impersonatingSchoolId || state.currentUser?.schoolId;
    await supabase.from('athletes').insert([{
      school_id: sid,
      name: athlete.name,
      parent_name: athlete.parentName,
      parent_phone: athlete.parentPhone,
      birth_date: athlete.birthDate,
      category: athlete.category,
      team: athlete.team,
      plan: athlete.plan,
      has_uniform: athlete.hasUniform,
      status: athlete.status,
      enrollment_date: athlete.enrollmentDate,
      payment_status: 'pending'
    }]);
    fetchData();
  };

  const handleUpdateLeadStatus = async (id: string, status: Lead['status']) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    fetchData();
  };

  const handleAddLead = async (lead: Partial<Lead>) => {
    const sid = state.impersonatingSchoolId || state.currentUser?.schoolId;
    await supabase.from('leads').insert([{
      school_id: sid,
      name: lead.name,
      phone: lead.phone,
      age: lead.birthDate,
      trial_date: lead.trialDate,
      trial_time: lead.trialTime,
      origin: lead.origin,
      category_interest: lead.categoryInterest,
      status: 'new'
    }]);
    fetchData();
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    await supabase.from('transactions').update({
      status: updates.status,
      payment_date: updates.paymentDate,
      amount: updates.amount,
      due_date: updates.dueDate,
      competence_date: updates.competenceDate,
      athlete_name: updates.athleteName
    }).eq('id', id);
    fetchData();
  };

  const handleAddTransaction = async (trans: Partial<Transaction>) => {
    const sid = state.impersonatingSchoolId || state.currentUser?.schoolId;
    await supabase.from('transactions').insert([{
      school_id: sid,
      athlete_id: trans.athleteId,
      athlete_name: trans.athleteName,
      amount: trans.amount,
      due_date: trans.dueDate,
      competence_date: trans.competenceDate,
      status: trans.status || 'pending',
      payment_date: trans.paymentDate
    }]);
    fetchData();
  };

  const handleUpdateFeatureFlags = async (flags: any) => {
    setState(prev => ({ ...prev, featureFlags: flags }));
    // Persiste no Supabase se houver tabela para master_configs
    try {
      await supabase.from('master_configs').upsert({ id: 1, feature_flags: flags });
    } catch (e) {
      console.warn("Tabela master_configs não encontrada. Configuração aplicada apenas nesta sessão.");
    }
  };

  const handleGenerateBulk = async (month: string, year: string, dueDay: number) => {
    const sid = state.impersonatingSchoolId || state.currentUser?.schoolId;
    if (!sid) return;

    const activeAthletes = state.athletes.filter(a => a.status === 'active');
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const monthIndex = months.indexOf(month.toLowerCase());

    const newTransactions = activeAthletes.map(athlete => {
      const planConfig = state.schoolConfig?.monthlyPlans.find(p => p.name === athlete.plan);
      const amount = planConfig ? planConfig.price : 0;
      const dueDate = new Date(parseInt(year), monthIndex, dueDay).toISOString().split('T')[0];

      return {
        school_id: sid,
        athlete_id: athlete.id,
        athlete_name: athlete.name,
        amount: amount,
        due_date: dueDate,
        competence_date: `${month}/${year}`,
        status: 'pending'
      };
    });

    if (newTransactions.length > 0) {
      await supabase.from('transactions').insert(newTransactions);
      fetchData();
    }
  };

  if (currentPath === 'login') {
    return (
      <div className="fixed inset-0 bg-[#0f172a] z-[100] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-slate-200">
          <div className="bg-white p-4 rounded-3xl inline-block shadow-sm border border-slate-100 mb-6">
            <ShieldCheck size={48} className="text-[#6366f1]" />
          </div>
          <h1 className="text-3xl font-black mb-1 tracking-tighter text-slate-900 italic uppercase">FUTSYSTEM</h1>
          <p className="text-slate-400 mb-8 font-medium uppercase tracking-widest text-[9px]">Multi-tenant ERP & CRM</p>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4 mb-6 text-left">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome da Escola</label>
                <div className="relative">
                  <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Ex: Arena Soccer Academy" 
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Seu E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="email@escola.com" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha de Acesso</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold uppercase italic text-center">{error}</p>}
            
            <button 
              type="submit" 
              disabled={isAuthLoading}
              className="w-full py-4 bg-[#6366f1] text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all transform active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {isAuthLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />)}
              {isSignUp ? 'Criar Minha Escola' : 'Entrar no Sistema'}
            </button>
          </form>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 text-xs font-bold uppercase tracking-widest hover:underline"
          >
            {isSignUp ? 'Já tenho uma conta? Entrar' : 'Não tem conta? Cadastrar Escola'}
          </button>
        </div>
      </div>
    );
  }

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
        {isLoading && ( <div className="fixed top-4 right-8 flex items-center gap-2 text-indigo-600 font-bold bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-xl z-[100] border border-indigo-100"> <Loader2 size={18} className="animate-spin" /> Sincronizando... </div> )}
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {currentPath === 'master-dashboard' && <MasterDashboard schools={state.schools} />}
          {currentPath === 'master-units' && ( <MasterUnits schools={state.schools} plans={state.plans} onImpersonate={(id) => { setState(prev => ({ ...prev, impersonatingSchoolId: id })); setCurrentPath('school-dashboard'); }} onUpdatePlan={async (sid, p) => { await supabase.from('schools').update({ plan: p }).eq('id', sid); fetchData(); }} onResetCredentials={() => {}} onAddSchool={async (s) => { await supabase.from('schools').insert([s]); fetchData(); }} /> )}
          {currentPath === 'master-plans' && ( <MasterPlans plans={state.plans} onUpdatePlanDefinition={async (pid, up) => { await supabase.from('plans').update({ name: up.name, price: up.price, student_limit: up.studentLimit, features: up.features }).eq('id', pid); fetchData(); }} /> )}
          {currentPath === 'master-finance' && <MasterFinance schools={state.schools} />}
          {currentPath === 'master-settings' && <MasterSettings featureFlags={state.featureFlags} onUpdateFlags={handleUpdateFeatureFlags} />}
          
          {currentPath === 'school-dashboard' && <SchoolDashboard athletes={state.athletes} leads={state.leads} />}
          {currentPath === 'athletes' && <Athletes athletes={state.athletes} config={state.schoolConfig!} school={currentSchool} onAddAthlete={handleAddAthlete} onUpdateAthlete={handleUpdateAthlete} onDeleteAthlete={async (id) => { await supabase.from('athletes').delete().eq('id', id); fetchData(); }} />}
          {currentPath === 'leads' && <CRMLeads leads={state.leads} config={state.schoolConfig!} onUpdateStatus={handleUpdateLeadStatus} onAddLead={handleAddLead} onUpdateLead={async (id, up) => { await supabase.from('leads').update(up).eq('id', id); fetchData(); }} onDeleteLead={async (id) => { await supabase.from('leads').delete().eq('id', id); fetchData(); }} onEnrollLead={async (l) => { await supabase.from('leads').update({ status: 'converted' }).eq('id', l.id); handleAddAthlete(l); }} />}
          {currentPath === 'finance' && <SchoolFinance transactions={state.transactions} athletes={state.athletes} whatsappConnected={!!state.whatsappInstance} onUpdateTransaction={handleUpdateTransaction} onDeleteTransaction={async (id) => { await supabase.from('transactions').delete().eq('id', id); fetchData(); }} onAddTransaction={handleAddTransaction} onGenerateBulk={handleGenerateBulk} />}
          {currentPath === 'whatsapp' && <WhatsAppIntegration schoolId={state.currentUser?.schoolId || '1'} school={currentSchool} onStatusChange={(s) => setState(prev => ({...prev, whatsappInstance: s}))} onNavigate={setCurrentPath} />}
          {currentPath === 'school-plans' && <SchoolPlans school={currentSchool} plans={state.plans} onUpgrade={async (p) => { await supabase.from('schools').update({ plan: p }).eq('id', state.currentUser?.schoolId); fetchData(); }} />}
          {currentPath === 'settings' && <SchoolSettings school={currentSchool} config={state.schoolConfig!} onUpdateSettings={async (up) => { const sid = state.impersonatingSchoolId || state.currentUser?.schoolId; if(sid) await supabase.from('schools').update(up).eq('id', sid); fetchData(); }} onRefresh={fetchData} />}
        </div>
      </main>
    </div>
  );
};

export default App;
