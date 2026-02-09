
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
  /* Fix: Adicionado onNotifyUpcoming à interface para corresponder ao uso em App.tsx */
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
  
  // Tipo de lançamento selecionado no modal
  const [launchType, setLaunchType] = useState('Mensalidade');

  // Paginação
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

  // Lógica de auto-preenchimento ao mudar o tipo de lançamento
  useEffect(() => {
    if (!editingTransaction && isModalOpen) {
      if (launchType === 'Matrícula') {
        setFormData(prev => ({ 
          ...prev, 
          amount: school.enrollmentFee || 0, 
          description: 'Matrícula',
          competenceDate: 'Matrícula' 
        }));
      } else if (launchType === 'Uniforme') {
        setFormData(prev => ({ 
          ...prev, 
          amount: school.uniformPrice || 0, 
          description: 'Uniforme',
          competenceDate: 'Uniforme' 
        }));
      } else if (launchType === 'Mensalidade') {
        // Se voltar para mensalidade, tenta pegar o valor do plano do atleta se ele já estiver selecionado
        let amount = 0;
        if (formData.athleteId) {
          const athlete = athletes.find(a => a.id === formData.athleteId);
          // O valor viria da config de planos, mas mantemos 0 ou o anterior por segurança
        }
        setFormData(prev => ({ 
          ...prev, 
          amount: amount || prev.amount, 
          description: 'Mensalidade',
          competenceDate: `${compMonth}/${compYear}` 
        }));
      } else {
        setFormData(prev => ({ ...prev, description: 'Outros' }));
      }
    }
  }, [launchType, school.enrollmentFee, school.uniformPrice]);

  useEffect(() => {
    if (launchType === 'Mensalidade') {
      setFormData(prev => ({
        ...prev,
        competenceDate: `${compMonth}/${compYear}`
      }));
    }
  }, [compMonth, compYear, launchType]);

  const processedTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return transactions.map(t => {
      // Se estiver pendente e o vencimento for menor que hoje, trata como atrasado
      if (t.status === 'pending' && t.dueDate < todayStr) {
        return { ...t, status: 'overdue' as const };
      }
      return t;
    });
  }, [transactions]);

  const overdueTargets = useMemo(() => {
    return processedTransactions.filter(t => t.status === 'overdue');
  }, [processedTransactions]);

  const totals = useMemo(() => {
    return {
      total: processedTransactions.reduce((acc, t) => acc + t.amount, 0),
      received: processedTransactions.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0),
      toReceive: processedTransactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0),
      overdue: processedTransactions.filter(t => t.status === 'overdue').reduce((acc, t) => acc + t.amount, 0)
    };
  }, [processedTransactions]);

  const filteredTransactions = useMemo(() => {
    return processedTransactions.filter(t => {
      const matchesSearch = t.athleteName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || 
        (statusFilter === 'Pago' && t.status === 'paid') ||
        (statusFilter === 'Em Aberto' && t.status === 'pending') ||
        (statusFilter === 'Atrasado' && t.status === 'overdue');
      return matchesSearch && matchesStatus;
    });
  }, [processedTransactions, searchTerm, statusFilter]);

  // Reset paginação ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleQuickPay = (id: string) => {
    onUpdateTransaction(id, { status: 'paid', paymentDate: new Date().toISOString().split('T')[0] });
  };

  const handleNotifyOverdue = () => {
    if (!whatsappConnected) {
      alert("Conecte o WhatsApp na aba de integração primeiro!");
      return;
    }
    if (overdueTargets.length === 0) {
      alert("Não há atletas com mensalidades em atraso para notificar.");
      return;
    }
    if (confirm(`Deseja enviar lembrete de cobrança para ${overdueTargets.length} atletas em atraso?`)) {
      onNotifyBulk?.(overdueTargets);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      const finalData = { ...formData };
      if (finalData.status === 'paid' && !finalData.paymentDate) {
        finalData.paymentDate = new Date().toISOString().split('T')[0];
      }
      onUpdateTransaction(editingTransaction.id, finalData);
    } else {
      onAddTransaction(formData);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight italic uppercase">Financeiro</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Edição de cobranças e controle de caixa</p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={handleNotifyOverdue}
              disabled={!whatsappConnected || overdueTargets.length === 0}
              className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95 border ${
                whatsappConnected && overdueTargets.length > 0 
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                : 'bg-slate-50 border-slate-100 text-slate-300 opacity-50 cursor-not-allowed'
              }`}
            >
              <BellRing size={20} /> Notificar Inadimplentes
            </button>
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 italic"
            >
              <Zap size={20} /> Gerar Mensalidades
            </button>
            <button 
              onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 italic"
            >
              <Plus size={20} /> Novo Lançamento
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Faturamento Total</p>
          <h3 className="text-2xl font-black text-slate-800 italic">R$ {totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500">
            <DollarSign size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recebido</p>
          <h3 className="text-2xl font-black text-slate-800 italic">R$ {totals.received.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">A Receber</p>
          <h3 className="text-2xl font-black text-slate-800 italic">R$ {totals.toReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inadimplência</p>
          <h3 className="text-2xl font-black text-slate-800 italic text-red-600">R$ {totals.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
            onClick={() => setActiveTab('list')}
            className={`px-6 py-2 border rounded-full text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
            Lançamentos
        </button>
        <button 
            onClick={() => setActiveTab('recurrent')}
            className={`px-6 py-2 border rounded-full text-sm font-bold transition-all ${activeTab === 'recurrent' ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
            Gestão Recorrente
        </button>
      </div>

      {activeTab === 'list' ? (
        <>
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                    type="text"
                    placeholder="Buscar por aluno..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <div className="relative">
                <select 
                    className="appearance-none px-8 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 outline-none pr-10 italic"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option>Todos</option>
                    <option>Pago</option>
                    <option>Em Aberto</option>
                    <option>Atrasado</option>
                </select>
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm space-y-4">
                <h4 className="text-xl font-bold text-slate-800 mb-6 italic uppercase tracking-tighter">Histórico Financeiro</h4>
                {paginatedTransactions.length > 0 ? paginatedTransactions.map((trans) => (
                <div key={trans.id} className="flex items-center justify-between p-4 bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors group rounded-xl">
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800 uppercase italic tracking-tighter text-lg">{trans.athleteName}</span>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        trans.status === 'paid' ? 'bg-emerald-600 text-white shadow-sm' : 
                        trans.status === 'overdue' ? 'bg-red-500 text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm'
                        }`}>
                        {trans.status === 'paid' ? 'Pago' : trans.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{trans.description || 'Lançamento'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium italic">
                        <span className="flex items-center gap-1"><History size={12}/> Comp: {trans.competenceDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar size={12}/> Venc: {new Date(trans.dueDate).toLocaleDateString('pt-BR')}</span>
                        {trans.paymentDate && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Pago em: {new Date(trans.paymentDate).toLocaleDateString('pt-BR')}</span>
                          </>
                        )}
                    </div>
                    </div>
                    <div className="flex items-center gap-8">
                    <div className="text-xl font-black text-slate-800 italic">R$ {trans.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div className="flex items-center gap-2">
                        {trans.status !== 'paid' && (
                        <>
                            <button onClick={() => handleQuickPay(trans.id)} title="Baixa Rápida" className="p-2 text-emerald-500 hover:bg-emerald-100/50 rounded-xl transition-all active:scale-90">
                                <CheckCircle2 size={22} />
                            </button>
                        </>
                        )}
                        <button onClick={() => { setEditingTransaction(trans); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90">
                            <Edit2 size={20} />
                        </button>
                        <button onClick={() => { setTransactionToDelete(trans); setIsDeleteConfirmOpen(true); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90">
                            <Trash2 size={20} />
                        </button>
                    </div>
                    </div>
                </div>
                )) : (
                <div className="text-center py-20 italic text-slate-400 flex flex-col items-center gap-3">
                   <CreditCard size={48} className="text-slate-100" />
                   Nenhum lançamento encontrado.
                </div>
                )}

                {/* Barra de Paginação */}
                {totalPages > 1 && (
                  <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium italic">
                      Exibindo {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} lançamentos
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      <div className="flex items-center gap-1 px-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                              currentPage === i + 1 
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
            </div>
        </>
      ) : (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <div className="bg-white p-3 rounded-2xl text-indigo-600 shadow-sm">
                      <RefreshCw size={24} className="animate-spin-slow" />
                  </div>
                  <div>
                      <h4 className="font-bold text-indigo-900 italic uppercase tracking-tighter">Motor de Gerenciamento Recorrente</h4>
                      <p className="text-sm text-indigo-700/80 font-medium">Automatize a geração de cobranças mensais para todos os atletas ativos.</p>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                      <h5 className="font-black text-slate-800 italic uppercase text-[10px] tracking-widest">Geração em Massa</h5>
                      <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                          <div className="flex justify-between items-center text-sm font-bold italic">
                              <span className="text-slate-500 uppercase tracking-widest text-[9px]">Competência Alvo</span>
                              <span className="text-indigo-600 uppercase">{bulkMonth} / {bulkYear}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold italic">
                              <span className="text-slate-500 uppercase tracking-widest text-[9px]">Alunos a Processar</span>
                              <span className="text-slate-800">{athletes.filter(a => a.status === 'active').length}</span>
                          </div>
                          <button 
                            onClick={() => setIsBulkModalOpen(true)}
                            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 italic uppercase tracking-widest"
                          >
                            Configurar Geração
                          </button>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <h5 className="font-black text-slate-800 italic uppercase text-[10px] tracking-widest">Últimas Emissões</h5>
                      <div className="space-y-2">
                          {MONTHS.slice(new Date().getMonth() - 2, new Date().getMonth() + 1).map(m => (
                              <div key={m} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-colors">
                                  <span className="text-sm font-black text-slate-600 uppercase italic tracking-tighter">{m}/{new Date().getFullYear()}</span>
                                  {transactions.some(t => t.competenceDate === `${m}/${new Date().getFullYear()}`) ? (
                                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter border border-emerald-100">Processado</span>
                                  ) : (
                                    <span className="text-[9px] font-black text-slate-300 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-tighter">Disponível</span>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Modais */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 pb-4 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">
                  {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
                </h3>
                <p className="text-xs text-slate-500 font-medium italic">Gerencie mensalidades, matrículas e kits</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
              {/* Seleção de Tipo de Lançamento */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Tipo de Lançamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Mensalidade', 'Matrícula', 'Uniforme'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setLaunchType(type)}
                      className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        launchType === type 
                          ? 'bg-violet-700 text-white border-violet-700 shadow-md' 
                          : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Aluno Responsável</label>
                <div className="relative">
                  <select 
                    required 
                    disabled={!!editingTransaction}
                    className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none font-bold italic ${editingTransaction ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500/10'}`} 
                    value={formData.athleteId} 
                    onChange={e => { 
                      const ath = athletes.find(a => a.id === e.target.value); 
                      setFormData({...formData, athleteId: e.target.value, athleteName: ath?.name || ''});
                    }}
                  >
                    <option value="">Selecione um aluno...</option>
                    {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  {!editingTransaction && <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Valor (R$)</label>
                  <input required type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black italic text-indigo-600 focus:ring-2 focus:ring-indigo-500/10" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Data de Vencimento</label>
                  <input required type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold italic text-slate-600 focus:ring-2 focus:ring-indigo-500/10" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>

              {launchType === 'Mensalidade' ? (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Mês Competência</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none italic font-bold text-slate-600" value={compMonth} onChange={e => setCompMonth(e.target.value)}>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Ano Competência</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none italic font-black text-slate-600" value={compYear} onChange={e => setCompYear(e.target.value)}>
                        {YEARS.map(y => <option key={y} value={y.toString()}>{y}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Descrição do Lançamento</label>
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                    <Tags size={18} className="text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-800 italic">{launchType}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status</label>
                  <select 
                    className={`w-full p-4 border rounded-2xl outline-none font-black italic uppercase tracking-tighter focus:ring-2 focus:ring-indigo-500/10 ${
                      formData.status === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                      formData.status === 'overdue' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-600'
                    }`}
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Atrasado</option>
                  </select>
                </div>
                {formData.status === 'paid' && (
                  <div className="space-y-1.5 animate-in slide-in-from-right-2 duration-300">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Data do Pagamento</label>
                    <input 
                      required 
                      type="date" 
                      className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-2xl outline-none font-bold italic text-emerald-700" 
                      value={formData.paymentDate || new Date().toISOString().split('T')[0]} 
                      onChange={e => setFormData({...formData, paymentDate: e.target.value})} 
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all shadow-sm border border-slate-100 italic">Cancelar</button>
                <button type="submit" className="flex-2 py-4 bg-violet-700 text-white font-black rounded-2xl hover:bg-violet-800 transition-all shadow-xl shadow-violet-100 italic uppercase tracking-widest active:scale-95">
                  {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-md overflow-hidden animate-in fade-in zoom-in duration-200 border-4 border-red-100">
                  <div className="p-10 text-center space-y-6">
                      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                          <Trash2 size={48} />
                      </div>
                      <div>
                          <h3 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Apagar Registro?</h3>
                          <p className="text-slate-500 mt-2 font-medium italic">
                              Você está prestes a remover permanentemente a cobrança de <strong className="text-slate-700">{transactionToDelete?.athleteName}</strong>. Esta ação não pode ser desfeita.
                          </p>
                      </div>
                      <div className="flex gap-3 pt-2">
                          <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all shadow-sm italic">Abortar</button>
                          <button onClick={() => { if(transactionToDelete) onDeleteTransaction(transactionToDelete.id); setIsDeleteConfirmOpen(false); }} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 italic uppercase tracking-widest">Sim, Excluir</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div>
                          <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Parametrizar Geração</h3>
                          <p className="text-xs text-slate-500 font-medium italic">Define os padrões para os novos lançamentos automáticos.</p>
                      </div>
                      <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-full">
                          <X size={24} />
                      </button>
                  </div>
                  <div className="p-10 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Competência Fiscal</label>
                              <div className="flex gap-2">
                                  <select className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none italic font-bold text-slate-600" value={bulkMonth} onChange={e => setBulkMonth(e.target.value)}>
                                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                  </select>
                                  <select className="w-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none italic font-black text-slate-600" value={bulkYear} onChange={e => setBulkYear(e.target.value)}>
                                      {YEARS.map(y => <option key={y} value={y.toString()}>{y}</option>)}
                                  </select>
                              </div>
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Dia de Vencimento Padrão</label>
                              <input type="number" min="1" max="28" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black italic text-indigo-600 focus:ring-2 focus:ring-indigo-500/10" value={bulkDueDay} onChange={e => setBulkDueDay(Number(e.target.value))} />
                          </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                          <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 italic">Voltar</button>
                          <button 
                            onClick={() => { onGenerateBulk?.(bulkMonth, bulkYear, bulkDueDay); setIsBulkModalOpen(false); }} 
                            className="flex-2 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50 active:scale-95 italic uppercase tracking-widest"
                          >
                            Disparar Processamento
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SchoolFinance;