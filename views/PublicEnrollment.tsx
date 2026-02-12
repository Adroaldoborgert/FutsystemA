
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Loader2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface PublicEnrollmentProps {
  slug: string;
}

const PublicEnrollment: React.FC<PublicEnrollmentProps> = ({ slug }) => {
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentName: '',
    studentBirth: '',
    studentCpf: '',
    parentName: '',
    parentPhone: '',
    parentCpf: '',
    parentAddress: ''
  });

  useEffect(() => {
    async function loadSchool() {
      try {
        setLoading(true);
        // Filtro OR robusto no Supabase
        const { data, error: err } = await supabase
          .from('schools')
          .select('*')
          .or(`slug.eq."${slug}",id.eq."${slug}"`)
          .maybeSingle();

        if (err) throw err;

        if (!data) {
          setError("Escola não encontrada. Verifique o link enviado.");
        } else if (data.auto_enrollment_enabled === false) {
          setError("As matrículas online estão desativadas para esta unidade.");
        } else {
          setSchool(data);
          setError(null);
        }
      } catch (e) {
        console.error("Erro ao carregar escola:", e);
        setError("Erro ao carregar dados da escola. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadSchool();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
    setSubmitting(true);

    try {
      const { error: insertErr } = await supabase.from('athletes').insert([{
        school_id: school.id,
        name: formData.studentName,
        birth_date: formData.studentBirth || null,
        student_cpf: formData.studentCpf,
        parent_name: formData.parentName,
        parent_phone: formData.parentPhone,
        parent_cpf: formData.parentCpf,
        parent_address: formData.parentAddress,
        status: 'pendente_validacao',
        registration_origin: 'auto_matricula',
        enrollment_date: new Date().toISOString().split('T')[0]
      }]);

      if (insertErr) throw insertErr;
      setSuccess(true);
    } catch (err: any) {
      console.error("Erro ao enviar:", err);
      alert("Erro ao enviar solicitação: " + (err.message || "Tente novamente."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-brand-purple" size={40} />
        <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">Carregando formulário...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-[20px] shadow-xl text-center max-w-md w-full border border-slate-100">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800 uppercase italic mb-2">Ops!</h2>
          <p className="text-slate-400 text-sm font-medium mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="text-brand-purple font-black uppercase text-[10px] tracking-widest hover:underline italic">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-[20px] shadow-2xl text-center max-w-md w-full border border-slate-100 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic mb-4">Solicitação Enviada!</h2>
          <p className="text-slate-500 font-medium italic mb-8">
            {school.welcome_message || "Solicitação enviada com sucesso! A escola entrará em contato para confirmar a matrícula."}
          </p>
          <div className="pt-6 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">FutSystem Security</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-8">
        <header className="text-center space-y-4">
          <img src="https://lh3.googleusercontent.com/d/1UT57Wn4oFAqPMfj-8_3tZ5HzXIgr-to2" className="h-16 mx-auto object-contain" alt="FutSystem" />
          <div>
            <h1 className="text-2xl font-black text-brand-purple uppercase italic tracking-tighter leading-none">{school.name}</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Portal de Pré-Matrícula Online</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-[20px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User size={20} /></div>
                <h3 className="font-black text-slate-800 uppercase italic text-sm tracking-tighter">Dados do Aluno</h3>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo *</label>
                  <input required type="text" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold text-sm" placeholder="Nome do atleta" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento *</label>
                    <input required type="date" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold text-sm" value={formData.studentBirth} onChange={e => setFormData({...formData, studentBirth: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF do Aluno (Opcional)</label>
                    <input type="text" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold text-sm" placeholder="000.000.000-00" value={formData.studentCpf} onChange={e => setFormData({...formData, studentCpf: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-lg"><ShieldCheck size={20} /></div>
                <h3 className="font-black text-slate-800 uppercase italic text-sm tracking-tighter">Dados do Responsável</h3>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Responsável *</label>
                  <input required type="text" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold text-sm" placeholder="Pai, mãe ou tutor" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input required type="text" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold text-sm" placeholder="(00) 00000-0000" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF Responsável</label>
                    <input type="text" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold text-sm" placeholder="000.000.000-00" value={formData.parentCpf} onChange={e => setFormData({...formData, parentCpf: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço (Opcional)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="text" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-purple/10 font-bold text-sm" placeholder="Rua, número, bairro" value={formData.parentAddress} onChange={e => setFormData({...formData, parentAddress: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-100">
            <button type="submit" disabled={submitting} className="w-full py-4 bg-brand-purple text-white font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 uppercase italic tracking-widest text-xs shadow-xl shadow-brand-purple/20 active:scale-95">
              {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
              Enviar Solicitação de Matrícula
            </button>
          </div>
        </form>
        <footer className="text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Gestão Profissional by FutSystem SaaS</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicEnrollment;
