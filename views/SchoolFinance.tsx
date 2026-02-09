import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  MessageCircle, 
  Edit2, 
  Trash2, 
  Calendar,
  Filter,
  X,
  AlertCircle,
  Clock,
  ChevronDown,
  RefreshCw,
  Zap,
  BellRing,
  CreditCard,
  History,
  ChevronLeft,
  ChevronRight,
  Tags
} from 'lucide-react';
import { Transaction, Athlete, School } from '../types';

interface SchoolFinanceProps {
  transactions: Transaction[];
  athletes: Athlete[];
  school: School;
  whatsappConnected?: boolean;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: (trans: Partial<Transaction>) => void;
  onGenerateBulk?: (month: string, year: string, dueDay: number) => void;
  onRemoveBulk?: (month: string, year: string) => void;
  onNotifyBulk?: (targets: Transaction[]) => void;
  onNotifyUpcoming?: (targets: Transaction[]) => void;
}

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const YEARS = [2024, 2025, 2026, 2027];

const SchoolFinance: React.FC<SchoolFinanceProps> = ({ 
  transactions, 
  athletes, 
  school,
  whatsappConnected = false,
  onUpdateTransaction, 
  onDeleteTransaction,
  onAddTransaction,
  onGenerateBulk,
  onRemoveBulk,
  onNotifyBulk,
  onNotifyUpcoming
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'recurrent'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  const [launchType, setLaunchType] = useState('Mensalidade');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [bulkMonth, setBulkMonth] = useState(MONTHS[new Date().getMonth()]);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear().toString());
  const [bulkDueDay, setBulkDueDay] = useState(10);

  const [compMonth, setCompMonth] = useState(MONTHS[new Date().getMonth()]);
  const [compYear, setCompYear] = useState(new Date().getFullYear().toString());

  const [formData, setFormData] = useState<Partial<Transaction>>({
    athleteId: '',
    athleteName: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    competenceDate: `${MONTHS[new Date().getMonth()]}/${new Date().getFullYear()}`,
    status: 'pending',
    description: 'Mensalidade',
    paymentDate: ''
  });

  useEffect(() => {
    if (editingTransaction) {
      const parts = editingTransaction.competenceDate?.split('/') || [];
      const [m, y] = parts;
      if (m) setCompMonth(m);
      if (y) setCompYear(y);
      setLaunchType(editingTransaction.description || 'Mensalidade');
      setFormData({ ...editingTransaction });
    } else {
      const defaultMonth = MONTHS[new Date().getMonth()];
      const defaultYear = new Date().getFullYear().toString();
      setCompMonth(defaultMonth);
      setCompYear(defaultYear);
      setLaunchType('Mensalidade');
      setFormData({
        athleteId: '',
        athleteName: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        competenceDate: `${defaultMonth}/${defaultYear}`,
        status: 'pending',
        description: 'Mensalidade',
        paymentDate: ''
      });
    }
  }, [editingTransaction, isModalOpen]);

  useEffect(() => {
    if (!editingTransaction && isModalOpen) {
      if (launchType === 'Matrícula') setFormData(prev => ({ ...prev, amount: school.enrollmentFee || 0, description: 'Matrícula', competenceDate: 'Matrícula' }));
      else if (launchType === 'Uniforme') setFormData(prev => ({ ...prev, amount: school.uniformPrice || 0, description: 'Uniforme', competenceDate: 'Uniforme' }));
      else if (launchType === 'Mensalidade') setFormData(prev => ({ ...prev, amount: prev.amount, description: 'Mensalidade', competenceDate: `${compMonth}/${compYear}` }));
    }
  }, [launchType, school.enrollmentFee, school.uniformPrice]);

  const processedTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return transactions.map(t => (t.status === 'pending' && t.dueDate < todayStr) ? { ...t, status: 'overdue' as const } : t);
  }, [transactions]);

  const overdueTargets = useMemo(() => processedTransactions.filter(t => t.status === 'overdue'), [processedTransactions]);

  const totals = useMemo(() => ({
      total: processedTransactions.reduce((acc, t) => acc + t.amount, 0),
      received: processedTransactions.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0),
      toReceive: processedTransactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0),
      overdue: processedTransactions.filter(t => t.status === 'overdue').reduce((acc, t) => acc + t.amount, 0)
  }), [processedTransactions]);

  const filteredTransactions = useMemo(() => {
    return processedTransactions.filter(t => {
      const matchesSearch = t.athleteName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || (statusFilter === 'Pago' && t.status === 'paid') || (statusFilter === 'Em Aberto' && t.status === 'pending') || (statusFilter === 'Atrasado' && t.status === 'overdue');
      return matchesSearch && matchesStatus;
    });
  }, [processedTransactions, searchTerm, statusFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleQuickPay = (id: string) => onUpdateTransaction(id, { status: 'paid', paymentDate: new Date().toISOString().split('T')[0] });

  const handleNotifyOverdue = () => {
    if (!whatsappConnected) return alert("Conecte o WhatsApp!");
    if (overdueTargets.length === 0) return alert("Nada em atraso.");
    if (confirm(`Enviar cobrança para ${overdueTargets.length} atletas?`)) onNotifyBulk?.(overdueTargets);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) onUpdateTransaction(editingTransaction.id, { ...formData, paymentDate: (formData.status === 'paid' && !formData.paymentDate) ? new Date().toISOString().split('T')[0] : formData.paymentDate });
    else onAddTransaction(formData);
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight italic uppercase">Financeiro</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Gestão de cobranças</p>
        </div>
        <div className="flex gap-3">
            <button onClick={handleNotifyOverdue} className={`px-6 py-3 rounded-[10px] font-bold transition-all flex items-center gap-2 shadow-sm border ${whatsappConnected && overdueTargets.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-300 opacity-50'}`}><BellRing size={20} /> Cobrar</button>
            <button onClick={() => setIsBulkModalOpen(true)} className="bg-emerald-500 text-white px-6 py-3 rounded-[10px] font-bold shadow-lg shadow-emerald-100 italic active:scale-95"><Zap size={20} /> Gerar Mês</button>
            <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-[10px] font-bold shadow-lg shadow-indigo-100 italic active:scale-95"><Plus size={20} /> Novo</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{l: 'Total', v: totals.total, i: DollarSign, c: 'sky'}, {l: 'Recebido', v: totals.received, i: CheckCircle2, c: 'emerald'}, {l: 'A Receber', v: totals.toReceive, i: Clock, c: 'indigo'}, {l: 'Atrasado', v: totals.overdue, i: AlertCircle, c: 'red'}].map((t, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[10px] border border-slate-100 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.l}</p>
            <h3 className={`text-2xl font-black italic ${t.c === 'red' ? 'text-red-600' : 'text-slate-800'}`}>R$ {t.v.toLocaleString('pt-BR')}</h3>
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-${t.c}-50 rounded-[10px] flex items-center justify-center text-${t.c}-500`}><t.i size={24} /></div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {['list', 'recurrent'].map(t => <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2 border rounded-[10px] text-sm font-bold transition-all ${activeTab === t ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'border-transparent text-slate-400'}`}>{t === 'list' ? 'Lançamentos' : 'Recorrente'}</button>)}
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white p-8 rounded-[10px] border border-slate-50 shadow-sm space-y-4">
          <div className="flex gap-4 mb-4">
            <input type="text" placeholder="Filtrar aluno..." className="flex-1 p-2 bg-slate-50 rounded-[10px] text-sm outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <select className="p-2 bg-slate-50 rounded-[10px] text-sm italic" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>Todos</option><option>Pago</option><option>Em Aberto</option><option>Atrasado</option></select>
          </div>
          {paginatedTransactions.map(trans => (
            <div key={trans.id} className="flex items-center justify-between p-4 bg-white border-b border-slate-50 group">
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-800 uppercase italic text-lg">{trans.athleteName}</span>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 italic">
                        <span>Comp: {trans.competenceDate}</span>
                        <span>Venc: {trans.dueDate}</span>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-xl font-black text-slate-800 italic">R$ {trans.amount.toLocaleString('pt-BR')}</div>
                    <div className="flex gap-2">
                        {trans.status !== 'paid' && <button onClick={() => handleQuickPay(trans.id)} className="p-2 text-emerald-500 rounded-[10px] active:scale-90"><CheckCircle2 size={22} /></button>}
                        <button onClick={() => { setEditingTransaction(trans); setIsModalOpen(true); }} className="p-2 text-slate-400 rounded-[10px] active:scale-90"><Edit2 size={20} /></button>
                        <button onClick={() => { setTransactionToDelete(trans); setIsDeleteConfirmOpen(true); }} className="p-2 text-red-400 rounded-[10px] active:scale-90"><Trash2 size={20} /></button>
                    </div>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[10px] border border-slate-100 shadow-sm space-y-6 text-center">
            <RefreshCw size={48} className="mx-auto text-indigo-600 animate-spin-slow mb-4" />
            <h4 className="font-bold italic uppercase tracking-tighter">Gestão Recorrente</h4>
            <button onClick={() => setIsBulkModalOpen(true)} className="bg-indigo-600 text-white px-10 py-4 rounded-[10px] font-black italic uppercase shadow-lg">Parametrizar Geração</button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black italic uppercase">{editingTransaction ? 'Editar' : 'Novo'} Lançamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {['Mensalidade', 'Matrícula', 'Uniforme'].map(t => <button key={t} type="button" onClick={() => setLaunchType(t)} className={`py-1.5 rounded-[10px] text-[9px] font-black uppercase transition-all border ${launchType === t ? 'bg-violet-700 text-white' : 'bg-white text-slate-400 border-slate-100'}`}>{t}</button>)}
              </div>
              <select required disabled={!!editingTransaction} className="w-full p-2 bg-slate-50 border rounded-[10px] font-bold italic text-sm" value={formData.athleteId} onChange={e => { const ath = athletes.find(a => a.id === e.target.value); setFormData({...formData, athleteId: e.target.value, athleteName: ath?.name || ''}); }}>
                <option value="">Selecionar Aluno...</option>
                {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" placeholder="Valor R$" className="w-full p-2 bg-slate-50 border rounded-[10px] font-black text-sm text-indigo-600" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                <input required type="date" className="w-full p-2 bg-slate-50 border rounded-[10px] font-bold text-sm" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className={`w-full p-2 border rounded-[10px] font-black italic uppercase text-xs ${formData.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50'}`} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}><option value="pending">Pendente</option><option value="paid">Pago</option></select>
                {formData.status === 'paid' && <input type="date" className="w-full p-2 bg-emerald-50 rounded-[10px] text-sm" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} />}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold bg-slate-50 rounded-[10px] text-xs">Cancelar</button>
                <button type="submit" className="flex-2 py-3 bg-violet-700 text-white font-black rounded-[10px] text-xs shadow-lg">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 p-4">
              <div className="bg-white rounded-[10px] shadow-2xl p-8 text-center space-y-4 max-w-sm border-4 border-red-50">
                  <h3 className="text-2xl font-black italic uppercase">Excluir?</h3>
                  <p className="text-slate-500 text-sm italic">Apagar cobrança de {transactionToDelete?.athleteName}?</p>
                  <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-[10px] text-xs">Não</button>
                      <button onClick={() => { if(transactionToDelete) onDeleteTransaction(transactionToDelete.id); setIsDeleteConfirmOpen(false); }} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-[10px] text-xs shadow-lg">Sim, Excluir</button>
                  </div>
              </div>
          </div>
      )}

      {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
              <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-xl overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><h3 className="text-xl font-black italic uppercase">Parametrizar Geração</h3><button onClick={() => setIsBulkModalOpen(false)}><X size={20} /></button></div>
                  <div className="p-8 space-y-5 text-left">
                      <div className="grid grid-cols-2 gap-4">
                          <select className="p-2 bg-slate-50 border rounded-[10px] text-sm" value={bulkMonth} onChange={e => setBulkMonth(e.target.value)}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                          <input type="number" min="1" max="28" placeholder="Dia Venc." className="p-2 bg-slate-50 border rounded-[10px] text-sm font-black" value={bulkDueDay} onChange={e => setBulkDueDay(Number(e.target.value))} />
                      </div>
                      <button onClick={() => { onGenerateBulk?.(bulkMonth, bulkYear, bulkDueDay); setIsBulkModalOpen(false); }} className="w-full py-4 bg-emerald-600 text-white font-black rounded-[10px] active:scale-95 shadow-lg italic uppercase text-xs">Disparar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SchoolFinance;