import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Wrench, 
  CreditCard, 
  HelpCircle, 
  BarChart2, 
  PlusCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Calendar, 
  Eye, 
  Sun, 
  Moon, 
  DollarSign, 
  FileText, 
  Store, 
  TrendingUp, 
  Target, 
  ChevronDown, 
  Filter, 
  AlertCircle, 
  Award, 
  CalendarDays, 
  Zap, 
  UserCheck, 
  UserPlus, 
  Megaphone, 
  Lightbulb, 
  Settings, 
  Trash2, 
  MonitorPlay, 
  MessageCircle, 
  Lock, 
  Unlock, 
  X, 
  Smartphone, 
  Globe, 
  AlertTriangle, 
  Camera, 
  CalendarCheck, 
  MoreHorizontal, 
  MessageSquare,
  Scale, 
  ArrowRightLeft,
  Plus,
  LogOut,
  Shield,
  Key
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  ComposedChart,
  LabelList
} from 'recharts';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  writeBatch, 
  onSnapshot, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';

// ============================================================================
// ÁREA DE CONFIGURAÇÃO FIREBASE (IMPORTANTE PARA FUNCIONAR ONLINE)
// ============================================================================

// Aqui inserimos as chaves fixas para garantir que funcione na Vercel.
// Se criou um banco novo, substitua estes valores pelos novos.
const firebaseConfig = {
  apiKey: "AIzaSyAu25o6sVXnAGIBRaEheBwHdTCM8lkCuxo",
  authDomain: "otica-precisao-app.firebaseapp.com",
  projectId: "otica-precisao-app",
  storageBucket: "otica-precisao-app.firebasestorage.app",
  messagingSenderId: "216643068456",
  appId: "1:216643068456:web:3e98fa915c996e603d4b1d"
};

// ============================================================================
// FIM DA ÁREA DE CONFIGURAÇÃO
// ============================================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'otica-precisao-main-app';

// --- Constantes Iniciais ---
const DEFAULT_CONFIG = {
    managerPassword: '2025',
    stores: {
        TC: {
            id: 'TC',
            name: 'Três Corações',
            staff: ['Ana Laura', 'Elaine', 'Ketlin', 'Eleonora'],
            password: '4572'
        },
        SGS: {
            id: 'SGS',
            name: 'São Gonçalo do Sapucaí',
            staff: ['Vitoria', 'Roberta', 'Fernanda'],
            password: '3748'
        }
    }
};

// --- Paleta de Cores ---
const THEME = {
  primary: 'bg-orange-600',
  primaryDark: 'bg-orange-700',
  primaryLight: 'bg-orange-100',
  secondary: 'bg-red-600',
  accentText: 'text-orange-600',
  bgMain: 'bg-stone-50',
  bgCard: 'bg-white',
  textDark: 'text-stone-800',
  textMedium: 'text-stone-600',
  textLight: 'text-stone-400',
  border: 'border-stone-200'
};

const SERVICE_TYPES = [
  { id: 'pagamento', label: 'Pagamento', icon: CreditCard },
  { id: 'retirada', label: 'Retirada', icon: ShoppingBag },
  { id: 'ajuste', label: 'Ajuste', icon: Wrench },
  { id: 'duvidas', label: 'Dúvidas', icon: HelpCircle }
];

const COMMERCIAL_ACTIONS = [
  { id: 'orcamento', label: 'Orçamento', icon: FileText },
  { id: 'venda', label: 'Venda', icon: DollarSign },
  { id: 'retorno', label: 'Retorno Orç.', icon: Calendar }
];

const WHATSAPP_ACTIONS = [
  { id: 'fotos', label: 'Fotos Armações', icon: Camera },
  { id: 'duvidas_zap', label: 'Tirou Dúvidas', icon: HelpCircle },
  { id: 'receita', label: 'Enviou Receita', icon: FileText },
  { id: 'agendou', label: 'Agendou', icon: CalendarCheck },
  { id: 'outros_zap', label: 'Outros', icon: MoreHorizontal }
];

const CLIENT_TYPES = [
  { id: 'cliente', label: 'Já é Cliente' },
  { id: 'nao_cliente', label: 'Não Cliente' }
];

// --- Componentes UI Auxiliares ---

const Card = ({ children, className = '' }) => (
  <div className={`${THEME.bgCard} rounded-xl shadow-sm border ${THEME.border} overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-4 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: `${THEME.primary} text-white hover:${THEME.primaryDark} shadow-md shadow-orange-200`,
    secondary: `${THEME.bgCard} ${THEME.textDark} border ${THEME.border} hover:bg-stone-50`,
    outline: `border-2 border-orange-600 ${THEME.accentText} hover:bg-orange-50`,
    danger: `bg-red-50 text-red-600 border border-red-200 hover:bg-red-100`,
    marketing: `border-2 border-stone-100 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100`,
    whatsapp: `bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200`
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

function NotificationToast({ notification, onClose }) {
    if (!notification) return null;

    const bg = notification.type === 'error' ? 'bg-red-500' : 'bg-green-600';
    const icon = notification.type === 'error' ? <AlertCircle className="w-5 h-5 text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />;

    return (
        <div className={`fixed top-4 left-4 right-4 z-50 flex items-center justify-center pointer-events-none animate-in slide-in-from-top-2 fade-in duration-300`}>
            <div className={`${bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm w-full pointer-events-auto`}>
                {icon}
                <span className="font-bold text-sm flex-1">{notification.message}</span>
                <button onClick={onClose}><X className="w-4 h-4 text-white/80" /></button>
            </div>
        </div>
    );
}

// --- Componentes Secundários ---

function PinModal({ onClose, onSuccess, managerPin }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleVerify = () => {
        if (pin === managerPin) {
            onSuccess();
            onClose();
        } else {
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-stone-800 font-extrabold text-xl">Acesso Gestor</h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-stone-400" /></button>
                </div>
                
                <div className="flex flex-col gap-4">
                    <div className="bg-stone-100 p-4 rounded-2xl flex items-center justify-center mb-2">
                        <Lock className={`w-12 h-12 ${error ? 'text-red-500' : 'text-stone-400'}`} />
                    </div>
                    
                    {error && <p className="text-center text-red-500 text-sm font-bold animate-pulse">Senha incorreta</p>}

                    <input 
                        type="password" 
                        inputMode="numeric"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full text-center text-3xl font-black tracking-widest py-3 border-b-2 border-stone-200 focus:border-orange-500 outline-none text-stone-800 bg-transparent"
                        placeholder="••••"
                        maxLength={8}
                        autoFocus
                    />

                    <Button onClick={handleVerify} className="w-full mt-2">
                        Acessar Painel
                    </Button>
                </div>
            </div>
        </div>
    );
}

function SettingsModal({ config, onClose, onUpdateConfig, onClearToday, currentStore }) {
    const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'security'
    const [newStaffName, setNewStaffName] = useState("");
    const [confirmDeleteStaff, setConfirmDeleteStaff] = useState(null); 
    const [confirmClearToday, setConfirmClearToday] = useState(false); 

    // Security States
    const [managerPass, setManagerPass] = useState(config.managerPassword);
    const [tcPass, setTcPass] = useState(config.stores.TC.password);
    const [sgsPass, setSgsPass] = useState(config.stores.SGS.password);

    const store = config.stores[currentStore];

    const handleAddStaff = () => {
        if (newStaffName.trim()) {
            const updatedStore = { ...store, staff: [...store.staff, newStaffName.trim()] };
            const newConfig = { ...config, stores: { ...config.stores, [currentStore]: updatedStore } };
            onUpdateConfig(newConfig);
            setNewStaffName("");
        }
    };

    const confirmRemoveStaff = (nameToRemove) => {
        const updatedStaff = store.staff.filter(name => name !== nameToRemove);
        const updatedStore = { ...store, staff: updatedStaff };
        const newConfig = { ...config, stores: { ...config.stores, [currentStore]: updatedStore } };
        onUpdateConfig(newConfig);
        setConfirmDeleteStaff(null);
    };

    const handleSaveSecurity = () => {
        const newConfig = {
            ...config,
            managerPassword: managerPass,
            stores: {
                TC: { ...config.stores.TC, password: tcPass },
                SGS: { ...config.stores.SGS, password: sgsPass }
            }
        };
        onUpdateConfig(newConfig);
        alert("Senhas atualizadas com sucesso!");
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-orange-600 p-4 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Settings className="w-5 h-5" /> Configurações
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-stone-200">
                    <button 
                        onClick={() => setActiveTab('staff')}
                        className={`flex-1 py-3 text-sm font-bold ${activeTab === 'staff' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-stone-400'}`}
                    >
                        Equipe {store.name}
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-3 text-sm font-bold ${activeTab === 'security' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-stone-400'}`}
                    >
                        Senhas e Acesso
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    {activeTab === 'staff' && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newStaffName}
                                    onChange={(e) => setNewStaffName(e.target.value)}
                                    placeholder="Nome..."
                                    className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                                <button 
                                    onClick={handleAddStaff}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xl hover:bg-orange-700 flex items-center justify-center"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {store.staff.map(name => (
                                    <div key={name} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg border border-stone-100">
                                        <span className="font-medium text-stone-700">{name}</span>
                                        {confirmDeleteStaff === name ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => confirmRemoveStaff(name)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Sim</button>
                                                <button onClick={() => setConfirmDeleteStaff(null)} className="text-xs bg-stone-300 text-stone-700 px-2 py-1 rounded">Não</button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setConfirmDeleteStaff(name)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="pt-4 border-t border-stone-200 mt-4">
                                <h4 className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Zona de Testes
                                </h4>
                                {!confirmClearToday ? (
                                    <button 
                                        onClick={() => setConfirmClearToday(true)}
                                        className="w-full py-3 rounded-lg bg-red-50 text-red-600 border border-red-200 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Zerar Dados de Hoje
                                    </button>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                                        <p className="text-xs font-bold text-red-800 mb-3">Tem certeza? Isso apaga tudo de hoje ({new Date().toLocaleDateString()}).</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { onClearToday(); setConfirmClearToday(false); }}
                                                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700"
                                            >
                                                Sim, Zerar
                                            </button>
                                            <button 
                                                onClick={() => setConfirmClearToday(false)}
                                                className="flex-1 bg-white text-stone-600 border border-stone-300 py-2 rounded-lg text-xs font-bold hover:bg-stone-50"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-5">
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-2">
                                <p className="text-xs text-yellow-800 flex gap-2">
                                    <Shield className="w-4 h-4 flex-shrink-0" />
                                    Defina senhas seguras para cada loja e para o acesso geral.
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Senha Geral (Gestor)</label>
                                <div className="flex items-center gap-2 border border-stone-300 rounded-lg px-3 py-2 bg-stone-50">
                                    <Key className="w-4 h-4 text-stone-400" />
                                    <input 
                                        type="text" 
                                        value={managerPass} 
                                        onChange={(e) => setManagerPass(e.target.value)}
                                        className="bg-transparent outline-none w-full text-stone-800 font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-stone-100">
                                <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Senha Loja TC</label>
                                <input 
                                    type="text" 
                                    value={tcPass} 
                                    onChange={(e) => setTcPass(e.target.value)}
                                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-mono font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Senha Loja SGS</label>
                                <input 
                                    type="text" 
                                    value={sgsPass} 
                                    onChange={(e) => setSgsPass(e.target.value)}
                                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-mono font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>

                            <Button onClick={handleSaveSecurity} className="w-full mt-4">
                                Salvar Novas Senhas
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Sub-Componente: Tooltip Customizado (Definido antes do uso) ---
const CustomEfficiencyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-stone-200 shadow-xl rounded-lg z-50">
                <p className="font-bold text-stone-800 text-xs mb-1">{label} ({data.store})</p>
                <div className="space-y-1">
                    <p className="text-[10px] text-orange-700 font-bold">
                        Cliente: {data.rateCli}% <span className="font-normal text-stone-500">({data.vendaCli} vds / {data.valCli.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})</span>
                    </p>
                    <p className="text-[10px] text-stone-600 font-bold">
                        Novo: {data.rateNew}% <span className="font-normal text-stone-500">({data.vendaNew} vds / {data.valNew.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

// --- Componentes de Dados (Definidos antes do uso) ---

function InsightsPanel({ stats }) {
    const insights = useMemo(() => {
        const tips = [];
        
        if (stats.totalVendas > 0) {
            const clientRatio = stats.vendaCliente / stats.totalVendas;
            if (clientRatio > 0.7) {
                tips.push({
                    icon: Users,
                    color: "text-orange-800",
                    bg: "bg-orange-100",
                    title: "Fidelização Alta!",
                    text: "Mais de 70% das vendas são para clientes antigos. Excelente retenção! Tente pedir indicações."
                });
            } else if (clientRatio < 0.3) {
                tips.push({
                    icon: UserPlus,
                    color: "text-green-600",
                    bg: "bg-green-50",
                    title: "Atração Forte",
                    text: "Muitos clientes novos comprando! Certifique-se de cadastrá-los bem para futuro contato."
                });
            }
        }

        return tips;
    }, [stats]);

    if (insights.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-black text-stone-800 uppercase pl-2 border-l-4 border-purple-500">Insights do Especialista</h3>
            <div className="grid grid-cols-1 gap-3">
                {insights.map((tip, idx) => (
                    <div key={idx} className={`${THEME.bgCard} p-4 rounded-xl border border-stone-100 shadow-sm flex gap-4 items-start`}>
                        <div className={`${tip.bg} p-3 rounded-full flex-shrink-0`}>
                            <tip.icon className={`w-6 h-6 ${tip.color}`} />
                        </div>
                        <div>
                            <h4 className={`font-bold text-sm ${tip.color}`}>{tip.title}</h4>
                            <p className="text-xs text-stone-600 mt-1 leading-relaxed">{tip.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function YearlyAnalysis({ data }) {
    const yearlyData = useMemo(() => {
        const months = {};
        
        data.forEach(item => {
            const d = item.date;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[key]) {
                months[key] = { name: `${d.toLocaleString('pt-BR', { month: 'short' })}/${d.getFullYear().toString().substr(2)}`, vendas: 0, orcamentos: 0, total: 0 };
            }
            
            if (item.category === 'comercial') {
                months[key].total++;
                if (item.action === 'venda') months[key].vendas++;
                if (item.action === 'orcamento') months[key].orcamentos++;
            }
        });

        return Object.values(months)
            .sort((a, b) => {
                const [ma, ya] = a.name.split('/');
                const [mb, yb] = b.name.split('/');
                return new Date(20 + ya, "janfebmaraprmayjunjulaugsepoctnovdec".indexOf(ma.toLowerCase())/3) - new Date(20 + yb, "janfebmaraprmayjunjulaugsepoctnovdec".indexOf(mb.toLowerCase())/3);
            })
            .map(m => ({
                ...m,
                taxa: m.vendas + m.orcamentos > 0 ? Math.round((m.vendas / (m.vendas + m.orcamentos)) * 100) : 0
            }));
    }, [data]);

    if (yearlyData.length < 2) return null;

    return (
        <div className="space-y-4 pt-6 border-t-2 border-stone-200">
            <h3 className="text-lg font-black text-stone-800 uppercase pl-2 border-l-4 border-blue-500">Tendências Anuais</h3>
            
            <Card className="p-4">
                <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Evolução de Vendas</h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={yearlyData}>
                            <defs>
                                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize:10}} />
                            <Tooltip />
                            <Area type="monotone" dataKey="vendas" stroke="#ea580c" fillOpacity={1} fill="url(#colorVendas)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-4">
                <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Tendência de Conversão (%)</h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={yearlyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize:10}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="taxa" stroke="#16a34a" strokeWidth={3} dot={{r:4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}

// --- Tela de Login (LoginScreen) ---

function LoginScreen({ config, onLogin }) {
    const [selectedStore, setSelectedStore] = useState('TC');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        const storePass = config.stores[selectedStore].password;
        const managerPass = config.managerPassword;

        if (password === storePass) {
            onLogin(selectedStore, false); // Logged as staff
        } else if (password === managerPass) {
            onLogin(selectedStore, true); // Logged as manager (Master Key)
        } else {
            setError('Senha incorreta');
            setPassword('');
            setTimeout(() => setError(''), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-orange-600 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-orange-500 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-orange-700 rounded-full opacity-50 blur-3xl"></div>

            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600 shadow-inner">
                        <Eye className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight">Bem-vindo</h1>
                    <p className="text-stone-500 text-sm font-medium">App de Gestão Ótica</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-1">Selecione sua Unidade</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                            <select 
                                value={selectedStore} 
                                onChange={(e) => setSelectedStore(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-stone-200 rounded-xl font-bold text-stone-700 appearance-none focus:border-orange-500 outline-none transition-colors bg-white"
                            >
                                <option value="TC">Três Corações (TC)</option>
                                <option value="SGS">São Gonçalo (SGS)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-stone-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-1">Senha de Acesso</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••"
                                className="w-full pl-10 pr-4 py-3 border-2 border-stone-200 rounded-xl font-bold text-stone-800 focus:border-orange-500 outline-none transition-colors placeholder:text-stone-300"
                                inputMode="numeric"
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs font-bold mt-2 text-center animate-pulse">{error}</p>}
                    </div>

                    <button 
                        onClick={handleLogin}
                        className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-95 transition-all"
                    >
                        Entrar
                    </button>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-stone-300">Ótica Precisão</p>
                </div>
            </div>
        </div>
    );
}

// --- Telas de Lançamento e Dashboard ---

function EntryScreen({ storeData, onSave }) {
  const [step, setStep] = useState('menu');
  const [tempData, setTempData] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [marketingSource, setMarketingSource] = useState(null);
  const [saleValue, setSaleValue] = useState('');

  const resetFlow = () => {
    setStep('menu');
    setTempData({});
    setMarketingSource(null);
    setSaleValue('');
  };

  const handleServiceClick = async (serviceId) => {
    const hours = new Date().getHours();
    const period = hours < 12 ? 'manha' : 'tarde';
    const success = await onSave({ category: 'servico', type: serviceId, period: period });
    if (success) showSuccess('Serviço registrado!');
  };

  const handleWhatsappClick = async (actionId) => {
    const hours = new Date().getHours();
    const period = hours < 12 ? 'manha' : 'tarde';
    const success = await onSave({ 
        category: 'whatsapp', 
        type: actionId, 
        period: period,
        marketingSource: 'mensagem' 
    });
    if (success) showSuccess('Mensagem registrada!');
    if (step === 'whatsapp_menu') setStep('menu');
  };

  const handleCommercialFlow = async (finalData) => {
    const hours = new Date().getHours();
    const period = hours < 12 ? 'manha' : 'tarde';
    const success = await onSave({ 
      category: 'comercial', 
      ...finalData, 
      period: period,
      marketingSource: marketingSource, 
      saleValue: saleValue ? parseFloat(saleValue) : 0 
    });
    if (success) { showSuccess('Atendimento gravado!'); resetFlow(); }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  if (successMsg) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-stone-900/40 z-50 backdrop-blur-sm px-4">
        <div className={`${THEME.bgCard} p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300`}>
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-orange-600" />
          </div>
          <h3 className="font-bold text-xl text-stone-800 text-center">{successMsg}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
      {step !== 'menu' && (
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
                <h2 className="text-2xl font-extrabold text-stone-800 tracking-tight">
                {step === 'whatsapp_menu' ? 'Controle WhatsApp' : 'Comercial'}
                </h2>
                <p className="text-sm text-stone-500">Registro de dados</p>
            </div>
            <button onClick={resetFlow} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-full hover:bg-red-100 uppercase tracking-wide transition-colors">Cancelar</button>
        </div>
      )}

      {step === 'menu' && (
        <>
          <section>
            <h3 className={`text-sm font-bold ${THEME.textMedium} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                <Wrench className="w-4 h-4" /> Serviços Rápidos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className={`${THEME.bgCard} p-6 rounded-2xl border-2 ${THEME.border} flex flex-col items-center gap-3 transition-all active:scale-95 hover:border-orange-400 hover:shadow-md group`}
                >
                  <div className={`p-3 rounded-full ${THEME.primaryLight} group-hover:bg-orange-200 transition-colors`}>
                    <service.icon className={`w-8 h-8 ${THEME.accentText}`} />
                  </div>
                  <span className={`font-bold text-base ${THEME.textDark}`}>{service.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
           <h3 className={`text-sm font-bold ${THEME.textMedium} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                <Users className="w-4 h-4" /> Comercial
            </h3>
            <div className="space-y-4">
                {/* Botão Vendas & Orçamentos */}
                <button
                onClick={() => setStep('commercial_attendant')}
                className={`w-full ${THEME.bgCard} border-2 border-orange-600/30 p-6 rounded-2xl shadow-sm flex items-center justify-between group hover:bg-orange-50 hover:border-orange-600 transition-all active:scale-95 relative overflow-hidden`}
                >
                <div className={`absolute inset-0 bg-gradient-to-r from-orange-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className={`w-16 h-16 ${THEME.primary} rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-6 transition-transform`}>
                    <DollarSign className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                    <h3 className={`font-extrabold text-xl ${THEME.textDark}`}>Vendas & Orçamentos</h3>
                    <p className={`text-sm ${THEME.textMedium} font-medium mt-1`}>Toque para iniciar</p>
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-full ${THEME.primaryLight} flex items-center justify-center group-hover:bg-orange-200 transition-colors z-10`}>
                    <ArrowLeft className={`w-6 h-6 ${THEME.accentText} rotate-180`} />
                </div>
                </button>

                {/* NOVO BOTÃO: Controle WhatsApp */}
                <button
                onClick={() => setStep('whatsapp_menu')}
                className={`w-full bg-green-50 border-2 border-green-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:bg-green-100 hover:border-green-500 transition-all active:scale-95`}
                >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-lg text-green-900">Controle WhatsApp</h3>
                        <p className="text-xs text-green-700 font-medium">Registrar mensagens do dia</p>
                    </div>
                </div>
                <div className="bg-white/50 p-2 rounded-full">
                    <PlusCircle className="w-6 h-6 text-green-700" />
                </div>
                </button>
            </div>
          </section>
        </>
      )}

      {/* TELA DE OPÇÕES DO WHATSAPP */}
      {step === 'whatsapp_menu' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-green-50 p-4 rounded-2xl border border-green-200 mb-4">
                <p className="text-sm text-green-800 text-center font-medium">
                    Selecione o motivo do contato via WhatsApp. <br/>Isso será contabilizado no Marketing.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {WHATSAPP_ACTIONS.map((action) => (
                    <Button 
                        key={action.id}
                        variant="whatsapp"
                        className="justify-between text-lg py-5 px-6"
                        onClick={() => handleWhatsappClick(action.id)}
                    >
                        <div className="flex items-center gap-4">
                            <action.icon className="w-6 h-6" />
                            {action.label}
                        </div>
                        <CheckCircle2 className="w-5 h-5 opacity-50" />
                    </Button>
                ))}
            </div>
        </div>
      )}

      {step === 'commercial_attendant' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <p className="text-lg font-bold text-stone-700">Atendente:</p>
          <div className="grid grid-cols-1 gap-4">
            {storeData.staff.map((name) => (
              <Button 
                key={name} 
                variant="secondary" 
                className="justify-start text-xl py-6 px-6 border-l-8 border-l-transparent hover:border-l-orange-600 hover:bg-orange-50 transition-all shadow-sm"
                onClick={() => { setTempData({ ...tempData, attendant: name }); setStep('commercial_action'); }}
              >
                <div className={`w-12 h-12 rounded-full ${THEME.primaryLight} flex items-center justify-center text-lg font-black ${THEME.accentText} mr-4 shadow-inner`}>
                  {name.substring(0,2).toUpperCase()}
                </div>
                {name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 'commercial_action' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <p className="text-lg font-bold text-stone-700">Ação Realizada:</p>
          <div className="grid grid-cols-1 gap-4">
            {COMMERCIAL_ACTIONS.map((action) => (
              <Button 
                key={action.id} 
                variant="secondary" 
                className="justify-between text-xl py-6 px-6 group hover:border-orange-400 hover:bg-orange-50 shadow-sm"
                onClick={() => { setTempData({ ...tempData, action: action.id }); setStep('commercial_client'); }}
              >
                <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-lg bg-stone-100 group-hover:bg-orange-200 transition-colors`}>
                     <action.icon className={`w-7 h-7 ${THEME.textMedium} group-hover:text-orange-700`} />
                   </div>
                   {action.label}
                </div>
                <ArrowLeft className={`w-6 h-6 ${THEME.textLight} group-hover:text-orange-500 rotate-180 transition-colors`} />
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 'commercial_client' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          
          <div className={`${THEME.bgCard} p-5 rounded-2xl border-2 border-blue-100 bg-blue-50 flex flex-col gap-4 shadow-sm`}>
             <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full"><Megaphone className="w-6 h-6 text-blue-700" /></div>
                <div>
                    <h4 className="text-base font-bold text-stone-800 leading-tight">Origem do Cliente (Marketing)</h4>
                    <p className="text-sm text-stone-500 font-medium">Como o cliente chegou até aqui?</p>
                </div>
             </div>
             
             <div className="grid grid-cols-3 gap-2">
                 <button 
                    onClick={() => setMarketingSource(null)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${!marketingSource ? 'bg-stone-600 text-white border-stone-600' : 'bg-white text-stone-500 border-stone-300'}`}
                 >
                    Nenhum
                 </button>
                 <button 
                    onClick={() => setMarketingSource('anuncio')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${marketingSource === 'anuncio' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'}`}
                 >
                    <MonitorPlay className="w-4 h-4" /> Anúncio/Vídeo
                 </button>
                 <button 
                    onClick={() => setMarketingSource('mensagem')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${marketingSource === 'mensagem' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-200'}`}
                 >
                    <MessageCircle className="w-4 h-4" /> Mensagem (Zap)
                 </button>
             </div>

             {(marketingSource && (tempData.action === 'venda' || tempData.action === 'retorno')) && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-blue-800 mb-1 block ml-1">Valor da Venda (R$)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-5 h-5 text-blue-400" />
                        <input 
                            type="number" 
                            placeholder="0,00"
                            value={saleValue}
                            onChange={(e) => setSaleValue(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-0 font-bold text-lg text-stone-800 outline-none"
                        />
                    </div>
                </div>
             )}
          </div>

          <div>
            <p className="text-lg font-bold text-stone-700 mb-4">Perfil do Cliente:</p>
            <div className="grid grid-cols-2 gap-4">
              {CLIENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    handleCommercialFlow({ 
                        ...tempData, 
                        clientType: type.id 
                    });
                  }}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 shadow-sm
                    ${type.id === 'cliente' 
                        ? 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:border-orange-400' 
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:border-stone-400'}`}
                >
                   {type.id === 'cliente' ? <UserCheck className="w-10 h-10 text-orange-600" /> : <UserPlus className="w-10 h-10 text-stone-500" />}
                  <span className="text-lg font-bold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardScreen({ data, storeData }) {
  const availableMonths = useMemo(() => {
    const monthSet = new Set();
    data.forEach(item => {
      const d = item.date;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(key);
    });
    return Array.from(monthSet).sort().reverse();
  }, [data]);

  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    } else if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
       setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const filteredData = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    return data.filter(item => {
      const d = item.date;
      return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });
  }, [data, selectedMonth]);

  // --- DADOS DE HOJE (Calculados) ---
  const todayStats = useMemo(() => {
    const today = new Date();
    const todayData = data.filter(entry => {
        const d = entry.date;
        return d.getDate() === today.getDate() && 
               d.getMonth() === today.getMonth() && 
               d.getFullYear() === today.getFullYear();
    });

    let stats = {
        vendas: 0, orcamentos: 0, retornos: 0, servicos: 0, atendimentos: 0, marketingHits: 0,
        vendaCliente: 0, vendaNaoCliente: 0,
        orcamentoCliente: 0, orcamentoNaoCliente: 0,
        retornoCliente: 0, retornoNaoCliente: 0,
        commercialBreakdown: {}, serviceBreakdown: {},
        attendantBreakdown: {},
        morningCount: 0, afternoonCount: 0,
        marketingAdCount: 0, marketingMsgCount: 0, marketingRevenue: 0,
        
        // WhatsApp Stats
        whatsappCount: 0,
        whatsappBreakdown: {}
    };

    // Inicializa atendentes para hoje
    storeData.staff.forEach(name => {
        stats.attendantBreakdown[name] = { atendimentos: 0, vendas: 0, orcamentos: 0, retornos: 0 };
    });

    todayData.forEach(entry => {
        if (entry.period === 'manha') stats.morningCount++;
        if (entry.period === 'tarde') stats.afternoonCount++;

        // NOVO: Contagem WhatsApp
        if (entry.category === 'whatsapp') {
            stats.whatsappCount++;
            stats.marketingHits++; // Conta como hit
            stats.whatsappBreakdown[entry.type] = (stats.whatsappBreakdown[entry.type] || 0) + 1;
        }

        if (entry.category === 'servico') {
            stats.servicos++;
            stats.serviceBreakdown[entry.type] = (stats.serviceBreakdown[entry.type] || 0) + 1;
        }
        if (entry.category === 'comercial') {
            stats.atendimentos++;
            
            // *** CORREÇÃO: Toda interação de marketing conta como hit ***
            if (entry.marketingSource || entry.marketingImpact) stats.marketingHits++;

            if (entry.marketingSource === 'anuncio') stats.marketingAdCount++;
            if (entry.marketingSource === 'mensagem') stats.marketingMsgCount++;
            if (entry.saleValue) stats.marketingRevenue += parseFloat(entry.saleValue);

            stats.commercialBreakdown[entry.action] = (stats.commercialBreakdown[entry.action] || 0) + 1;
            
            if (entry.action === 'venda') {
                stats.vendas++;
                if (entry.clientType === 'cliente') stats.vendaCliente++;
                else stats.vendaNaoCliente++;
            }
            if (entry.action === 'orcamento') {
                stats.orcamentos++;
                if (entry.clientType === 'cliente') stats.orcamentoCliente++;
                else stats.orcamentoNaoCliente++;
            }
            if (entry.action === 'retorno') {
                stats.retornos++;
                if (entry.clientType === 'cliente') stats.retornoCliente++;
                else stats.retornoNaoCliente++;
            }

            if (entry.attendant && stats.attendantBreakdown[entry.attendant]) {
                stats.attendantBreakdown[entry.attendant].atendimentos++;
                if (entry.action === 'venda') stats.attendantBreakdown[entry.attendant].vendas++;
                if (entry.action === 'orcamento') stats.attendantBreakdown[entry.attendant].orcamentos++;
                if (entry.action === 'retorno') stats.attendantBreakdown[entry.attendant].retornos++;
            }
        }
    });
    return stats;
  }, [data, storeData]);

  const formatMonthLabel = (key) => {
    if (!key) return '';
    const [year, month] = key.split('-');
    const date = new Date(year, month - 1);
    const monthName = date.toLocaleString('pt-BR', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  // --- Processamento de Estatísticas MÊS (STATS) ---
  const stats = useMemo(() => {
    const uniqueDays = new Set(filteredData.map(d => d.dateString)).size || 1;
    
    // Funcao auxiliar para pegar o DOMINGO da semana dessa data
    const getStartOfWeek = (d) => {
        const date = new Date(d);
        const day = date.getDay(); // 0 (Dom) - 6 (Sab)
        const diff = date.getDate() - day; // Ajusta para o Domingo
        return new Date(date.setDate(diff));
    };

    let metrics = {
      totalAtendimentosGeral: filteredData.length,
      totalServicos: 0,
      totalComercial: 0,
      serviceBreakdown: {},
      commercialBreakdown: {},
      
      orcamentoCliente: 0, orcamentoNaoCliente: 0, totalOrcamentos: 0,
      vendaCliente: 0, vendaNaoCliente: 0, totalVendas: 0,
      retornoCliente: 0, retornoNaoCliente: 0, totalRetornos: 0,
      
      marketingAdCount: 0,
      marketingMsgCount: 0,
      marketingRevenue: 0,
      marketingHits: 0,
      
      // WhatsApp Mensal
      totalWhatsapp: 0,
      whatsappBreakdown: {},
      mediaDiariaWhatsapp: 0,

      morningCount: 0, afternoonCount: 0,
      
      attendantStats: {},
      uniqueDays,
      weekdayCounts: {0:0,1:0,2:0,3:0,4:0,5:0,6:0},
      dateCounts: {}, 
      weekCounts: {} 
    };

    storeData.staff.forEach(name => {
      metrics.attendantStats[name] = { 
        orcCli: 0, orcNew: 0, 
        vendaCli: 0, vendaNew: 0, 
        retornoCli: 0, retornoNew: 0, 
        totalGeralAtendente: 0 
      };
    });

    filteredData.forEach(entry => {
      const date = entry.date;
      const dayOfWeek = date.getDay();
      const dayOfMonth = date.getDate();
      
      // --- LOGICA DE SEMANA AJUSTADA (DATA) ---
      const weekStart = getStartOfWeek(date);
      // Chave para ordenacao: YYYY-MM-DD
      const weekKey = weekStart.toISOString().split('T')[0]; 
      
      metrics.weekdayCounts[dayOfWeek]++;
      metrics.weekCounts[weekKey] = (metrics.weekCounts[weekKey] || 0) + 1;
      metrics.dateCounts[dayOfMonth] = (metrics.dateCounts[dayOfMonth] || 0) + 1;

      if (entry.period === 'manha') metrics.morningCount++;
      if (entry.period === 'tarde') metrics.afternoonCount++;

      // NOVO: Contagem WhatsApp Mensal
      if (entry.category === 'whatsapp') {
          metrics.totalWhatsapp++;
          metrics.marketingHits++; // Conta como hit
          metrics.whatsappBreakdown[entry.type] = (metrics.whatsappBreakdown[entry.type] || 0) + 1;
      }

      if (entry.category === 'servico') {
        metrics.totalServicos++;
        metrics.serviceBreakdown[entry.type] = (metrics.serviceBreakdown[entry.type] || 0) + 1;
      }
      
      if (entry.category === 'comercial') {
        metrics.totalComercial++;
        metrics.commercialBreakdown[entry.action] = (metrics.commercialBreakdown[entry.action] || 0) + 1;
        
        // Marketing Stats
        if (entry.marketingSource === 'anuncio') metrics.marketingAdCount++;
        if (entry.marketingSource === 'mensagem') metrics.marketingMsgCount++;
        if (entry.saleValue) metrics.marketingRevenue += parseFloat(entry.saleValue);
        if (entry.marketingSource || entry.marketingImpact) metrics.marketingHits++; 

        if (entry.attendant && metrics.attendantStats[entry.attendant]) {
          const staff = metrics.attendantStats[entry.attendant];
          staff.totalGeralAtendente++;

          if (entry.action === 'venda') {
              metrics.totalVendas++;
              if (entry.clientType === 'cliente') { metrics.vendaCliente++; staff.vendaCli++; } 
              else { metrics.vendaNaoCliente++; staff.vendaNew++; }
          } else if (entry.action === 'orcamento') {
              metrics.totalOrcamentos++;
              if (entry.clientType === 'cliente') { metrics.orcamentoCliente++; staff.orcCli++; } 
              else { metrics.orcamentoNaoCliente++; staff.orcNew++; }
          } else if (entry.action === 'retorno') {
              metrics.totalRetornos++;
               if (entry.clientType === 'cliente') { metrics.retornoCliente++; staff.retornoCli++; }
               else { metrics.retornoNaoCliente++; staff.retornoNew++; }
          }
        }
      }
    });

    metrics.mediaDiariaWhatsapp = (metrics.totalWhatsapp / uniqueDays).toFixed(1);
    metrics.mediaDiariaVendas = (metrics.totalVendas / uniqueDays).toFixed(1);
    metrics.mediaDiariaTotal = (metrics.totalComercial / uniqueDays).toFixed(1);
    metrics.mediaDiariaServicos = (metrics.totalServicos / uniqueDays).toFixed(1);
    metrics.mediaDiariaAtendimentos = (metrics.totalAtendimentosGeral / uniqueDays).toFixed(1);

    const daysArr = Object.entries(metrics.weekdayCounts).filter(x => x[1] > 0);
    const weeksArr = Object.entries(metrics.weekCounts);
    const datesArr = Object.entries(metrics.dateCounts); 
    
    metrics.busiestDay = daysArr.length ? daysArr.reduce((a, b) => a[1] > b[1] ? a : b) : [0, 0];
    metrics.quietestDay = daysArr.length ? daysArr.reduce((a, b) => a[1] < b[1] ? a : b) : [0, 0];
    metrics.busiestWeek = weeksArr.length ? weeksArr.reduce((a, b) => a[1] > b[1] ? a : b) : [0, 0];
    metrics.quietestWeek = weeksArr.length ? weeksArr.reduce((a, b) => a[1] < b[1] ? a : b) : [0, 0];
    metrics.busiestDate = datesArr.length ? datesArr.reduce((a, b) => a[1] > b[1] ? a : b) : [0, 0];
    metrics.quietestDate = datesArr.length ? datesArr.reduce((a, b) => a[1] < b[1] ? a : b) : [0, 0];

    return metrics;
  }, [filteredData, storeData]);

  const daysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const COLORS_PIE = ['#f97316', '#fbbf24', '#ef4444', '#78716c'];
  const COLORS_COM = ['#ea580c', '#fbbf24', '#22c55e']; 

  // Formatador auxiliar para data da semana
  const formatWeekKey = (key) => {
      if(!key) return '-';
      const [y, m, d] = key.split('-');
      return `Semana de ${d}/${m}`;
  }

  // 1. Serviços Balcão
  const serviceData = Object.entries(stats.serviceBreakdown).map(([key, value]) => ({
    name: SERVICE_TYPES.find(t => t.id === key)?.label || key,
    value,
    percent: ((value / stats.totalServicos) * 100).toFixed(0),
    todayCount: todayStats.serviceBreakdown[key] || 0
  })).sort((a,b) => b.value - a.value);

  // 2. Serviços Comerciais
  const commercialData = Object.entries(stats.commercialBreakdown).map(([key, value]) => ({
    name: COMMERCIAL_ACTIONS.find(t => t.id === key)?.label || key,
    value,
    percent: ((value / stats.totalComercial) * 100).toFixed(0),
    todayCount: todayStats.commercialBreakdown[key] || 0
  })).sort((a,b) => b.value - a.value);

  // Dados do WhatsApp para o Gráfico
  const whatsappData = Object.entries(stats.whatsappBreakdown).map(([key, value]) => ({
      name: WHATSAPP_ACTIONS.find(w => w.id === key)?.label || key,
      value: value,
      percent: stats.totalWhatsapp > 0 ? ((value / stats.totalWhatsapp) * 100).toFixed(0) : 0,
      todayCount: todayStats.whatsappBreakdown[key] || 0
  })).sort((a,b) => b.value - a.value);

  // 3. Share Vendas
  const salesShareList = Object.entries(stats.attendantStats).map(([name, s]) => {
      const totalSales = s.vendaCli + s.vendaNew;
      const todayAtt = todayStats.attendantBreakdown[name];
      const todaySales = todayAtt ? todayAtt.vendas : 0;
      return {
          name: name.split(' ')[0],
          monthTotal: totalSales,
          monthPercent: stats.totalVendas > 0 ? ((totalSales / stats.totalVendas) * 100).toFixed(0) : 0,
          monthAvg: (totalSales / stats.uniqueDays).toFixed(1),
          todayTotal: todaySales,
          todayPercent: todayStats.vendas > 0 ? ((todaySales / todayStats.vendas) * 100).toFixed(0) : 0
      }
  }).sort((a,b) => b.monthTotal - a.monthTotal);

  // 4. Conversão Vendas DETALHADA
  const conversionList = Object.entries(stats.attendantStats).map(([name, s]) => {
      const totalOppCli = s.vendaCli + s.orcCli;
      const totalOppNew = s.vendaNew + s.orcNew;
      
      return {
          name: name.split(' ')[0],
          cliRate: totalOppCli > 0 ? Math.round((s.vendaCli / totalOppCli) * 100) : 0,
          newRate: totalOppNew > 0 ? Math.round((s.vendaNew / totalOppNew) * 100) : 0,
          totalRate: (totalOppCli + totalOppNew) > 0 ? Math.round(((s.vendaCli + s.vendaNew) / (totalOppCli + totalOppNew)) * 100) : 0
      }
  }).sort((a,b) => b.totalRate - a.totalRate);

  // 5. Taxa de Retorno DETALHADA
  const returnRateList = Object.entries(stats.attendantStats).map(([name, s]) => {
      const totalOrcCli = s.orcCli;
      const totalOrcNew = s.orcNew;
      
      return {
          name: name.split(' ')[0],
          cliRate: totalOrcCli > 0 ? Math.round((s.retornoCli / totalOrcCli) * 100) : 0,
          cliCount: s.retornoCli,
          newRate: totalOrcNew > 0 ? Math.round((s.retornoNew / totalOrcNew) * 100) : 0,
          newCount: s.retornoNew,
          totalRate: (totalOrcCli + totalOrcNew) > 0 ? Math.round(((s.retornoCli + s.retornoNew) / (totalOrcCli + totalOrcNew)) * 100) : 0
      }
  }).sort((a,b) => b.totalRate - a.totalRate);

  // 6. Retornos vs Orçamentos
  const returnVsQuoteData = [
    { name: 'Mês', Orcamentos: stats.totalOrcamentos, Retornos: stats.totalRetornos },
    { name: 'Hoje', Orcamentos: todayStats.orcamentos, Retornos: todayStats.retornos }
  ];

  const monthReturnRate = stats.totalOrcamentos > 0 ? Math.round((stats.totalRetornos / stats.totalOrcamentos) * 100) : 0;
  const todayReturnRate = todayStats.orcamentos > 0 ? Math.round((todayStats.retornos / todayStats.orcamentos) * 100) : 0;

  const salesCompositionData = [
    { name: 'Venda Cliente', value: stats.vendaCliente, fill: '#c2410c' },
    { name: 'Venda Não Cliente', value: stats.vendaNaoCliente, fill: '#fb923c' },
  ];

  const weekDayData = Object.entries(stats.weekdayCounts).map(([day, count]) => ({
      name: daysMap[day].substring(0,3), 
      value: count
  }));

  const weekData = Object.entries(stats.weekCounts)
    .sort((a, b) => a[0].localeCompare(b[0])) // Ordena pela chave de data
    .map(([key, count]) => {
        const [y, m, d] = key.split('-');
        return {
            name: `${d}/${m}`, // Exibe apenas DD/MM
            value: count
        };
    });

  const attendantFunnelList = Object.keys(storeData.staff).map(idx => storeData.staff[idx]).map(name => {
      const monthStats = stats.attendantStats[name] || { totalGeralAtendente: 0, orcCli:0, orcNew:0, vendaCli:0, vendaNew:0 };
      const todayStatsAtt = todayStats.attendantBreakdown[name] || { atendimentos: 0, orcamentos: 0, vendas: 0 };
      return {
          name: name.split(' ')[0],
          month: {
              atend: monthStats.totalGeralAtendente,
              orc: monthStats.orcCli + monthStats.orcNew,
              venda: monthStats.vendaCli + monthStats.vendaNew
          },
          today: todayStatsAtt
      };
  });

  const returnAnalysisData = [
    {
        name: 'Total Mês',
        Orçamentos: stats.totalOrcamentos,
        Retornos: stats.totalRetornos,
        Taxa: stats.totalOrcamentos > 0 ? Math.round((stats.totalRetornos / stats.totalOrcamentos)*100) : 0
    },
    {
        name: 'Média/Dia',
        Orçamentos: parseFloat((stats.totalOrcamentos / stats.uniqueDays).toFixed(1)),
        Retornos: parseFloat((stats.totalRetornos / stats.uniqueDays).toFixed(1)),
        Taxa: 0 
    },
    {
        name: 'Hoje',
        Orçamentos: todayStats.orcamentos,
        Retornos: todayStats.retornos,
        Taxa: todayStats.orcamentos > 0 ? Math.round((todayStats.retornos / todayStats.orcamentos)*100) : 0
    }
  ];

  const attendantReturnChartData = Object.entries(stats.attendantStats).map(([name, s]) => {
    const totalOrc = s.orcCli + s.orcNew;
    const totalRet = s.retornoCli + s.retornoNew;
    return {
        name: name.split(' ')[0],
        Orçamentos: totalOrc,
        Retornos: totalRet,
        Taxa: totalOrc > 0 ? Math.round((totalRet / totalOrc) * 100) : 0
    };
  }).sort((a,b) => b.Orçamentos - a.Orçamentos);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-6">
      {/* Header e Filtro */}
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-600" /> Análise {storeData.name}
             </h2>
             <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full uppercase">
                {stats.uniqueDays} dias úteis
             </span>
          </div>
          <div className="relative">
             <Filter className="absolute left-3 top-3.5 h-5 w-5 text-stone-400" />
             <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={availableMonths.length === 0}
                className="block w-full pl-10 pr-10 py-3 text-sm font-bold border-2 border-orange-200 rounded-xl bg-white text-stone-800 shadow-sm focus:ring-orange-500"
             >
                {availableMonths.length === 0 ? <option>Sem dados</option> : availableMonths.map(m => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
             </select>
             <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-stone-400" />
          </div>
      </div>

      {availableMonths.length === 0 ? (
        <div className="text-center py-20"><p className="text-sm text-stone-400">Nenhum registro encontrado</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
            
            {/* 1. VENDAS TOTAIS (KEY METRIC) */}
            <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><DollarSign className="w-32 h-32" /></div>
                <h4 className="text-orange-100 text-sm font-bold uppercase mb-2">Vendas Totais</h4>
                <div className="relative z-10 mb-4">
                    <h3 className="text-5xl font-extrabold">{stats.totalVendas}</h3>
                    <span className="text-lg font-bold text-orange-200">unidades vendidas</span>
                </div>
                <div className="mt-2 pt-2 border-t border-white/20 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] text-orange-100 uppercase">Média Diária</p>
                        <p className="text-sm font-bold">{stats.mediaDiariaVendas} / dia</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end text-yellow-300">
                            <Zap className="w-3 h-3" /> <span className="text-[10px] uppercase font-bold">Hoje</span>
                        </div>
                        <p className="text-xl font-black">{todayStats.vendas}</p>
                    </div>
                </div>
            </Card>

            {/* 2. SERVIÇOS (BALCÃO E COMERCIAL) */}
            <div className="space-y-4 pt-4 border-t-2 border-stone-200">
                <h3 className="text-lg font-black text-stone-800 uppercase pl-2 border-l-4 border-stone-400">Operacional</h3>

                <Card className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Serviços de Balcão</h4>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-stone-400 block">HOJE</span>
                            <span className="text-lg font-black text-stone-800">{todayStats.servicos}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-36 w-1/3">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={serviceData} cx="50%" cy="50%" innerRadius={20} outerRadius={40} dataKey="value" paddingAngle={2}>
                                            {serviceData.map((e, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-2/3 flex flex-col justify-center space-y-2">
                            <div className="grid grid-cols-5 text-[9px] font-bold text-stone-400 border-b border-stone-100 pb-1">
                                <div className="col-span-2">Tipo</div>
                                <div className="text-center">Mês(%)</div>
                                <div className="text-center">Mês</div>
                                <div className="text-center">Hoje</div>
                            </div>
                            {serviceData.map((item, index) => (
                                <div key={item.name} className="grid grid-cols-5 text-xs items-center pb-1 border-b border-stone-50">
                                    <div className="col-span-2 flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS_PIE[index % COLORS_PIE.length]}}></div>
                                        <span className="text-stone-600 font-medium truncate">{item.name}</span>
                                    </div>
                                    <span className="text-center font-bold text-stone-800">{item.percent}%</span>
                                    <span className="text-center text-[10px] text-stone-400">{item.value}</span>
                                    <span className="text-center font-bold text-orange-600 bg-orange-50 rounded">{item.todayCount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 flex justify-around items-center bg-stone-50 p-2 rounded">
                        <span className="text-[10px] text-stone-500 font-bold uppercase">Total Mês: {stats.totalServicos}</span>
                        <span className="text-[10px] text-stone-500 font-bold uppercase">Média: {stats.mediaDiariaServicos}/dia</span>
                    </div>
                </Card>

                <Card className="p-4 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Serviços Comerciais</h4>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-orange-400 block">HOJE</span>
                            <span className="text-lg font-black text-orange-600">{todayStats.vendas + todayStats.orcamentos + todayStats.retornos}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-36 w-1/3">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={commercialData} cx="50%" cy="50%" innerRadius={20} outerRadius={40} dataKey="value" paddingAngle={2}>
                                            {commercialData.map((e, i) => <Cell key={i} fill={COLORS_COM[i % COLORS_COM.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-2/3 flex flex-col justify-center space-y-2">
                            <div className="grid grid-cols-5 text-[9px] font-bold text-stone-400 border-b border-stone-100 pb-1">
                                <div className="col-span-2">Tipo</div>
                                <div className="text-center">Mês(%)</div>
                                <div className="text-center">Mês</div>
                                <div className="text-center">Hoje</div>
                            </div>
                            {commercialData.map((item, index) => (
                                <div key={item.name} className="grid grid-cols-5 text-xs items-center pb-1 border-b border-stone-50">
                                    <div className="col-span-2 flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS_COM[index % COLORS_COM.length]}}></div>
                                        <span className="text-stone-600 font-medium truncate">{item.name}</span>
                                    </div>
                                    <span className="text-center font-bold text-stone-800">{item.percent}%</span>
                                    <span className="text-center text-[10px] text-stone-400">{item.value}</span>
                                    <span className="text-center font-bold text-orange-600 bg-orange-50 rounded">{item.todayCount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 flex justify-around items-center bg-orange-50 p-2 rounded">
                        <span className="text-[10px] text-orange-600 font-bold uppercase">Total Mês: {stats.totalComercial}</span>
                        <span className="text-[10px] text-orange-600 font-bold uppercase">Média: {stats.mediaDiariaTotal}/dia</span>
                    </div>
                </Card>
            </div>

            {/* 3. RAIO-X DE VENDAS */}
            <div className="space-y-4 pt-4 border-t-2 border-orange-100">
                <h3 className="text-lg font-black text-stone-800 uppercase pl-2 border-l-4 border-orange-600">Raio-X de Vendas</h3>

                <Card className="p-4">
                    <div className="flex gap-4 items-center">
                        <div className="h-40 w-1/3">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={salesCompositionData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">
                                            {salesCompositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="w-2/3">
                            <h4 className="font-bold text-stone-700 text-sm uppercase tracking-wider mb-3">Origem das Vendas</h4>
                            <div className="grid grid-cols-5 text-[9px] font-bold text-stone-400 border-b border-stone-100 pb-1 mb-1">
                                <div className="col-span-2">Tipo</div>
                                <div className="text-center">Mês</div>
                                <div className="text-center">%</div>
                                <div className="text-center">Hoje</div>
                            </div>
                            <div className="grid grid-cols-5 text-xs items-center pb-1 border-b border-stone-50 mb-1">
                                <div className="col-span-2 text-stone-600 font-bold">Cliente</div>
                                <div className="text-center">{stats.vendaCliente}</div>
                                <div className="text-center font-bold text-stone-800">{stats.totalVendas > 0 ? Math.round((stats.vendaCliente/stats.totalVendas)*100) : 0}%</div>
                                <div className="text-center font-bold text-orange-600 bg-orange-50 rounded">{todayStats.vendaCliente}</div>
                            </div>
                            <div className="grid grid-cols-5 text-xs items-center pb-1">
                                <div className="col-span-2 text-stone-600 font-bold">Não Cliente</div>
                                <div className="text-center">{stats.vendaNaoCliente}</div>
                                <div className="text-center font-bold text-stone-800">{stats.totalVendas > 0 ? Math.round((stats.vendaNaoCliente/stats.totalVendas)*100) : 0}%</div>
                                <div className="text-center font-bold text-orange-600 bg-orange-50 rounded">{todayStats.vendaNaoCliente}</div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Share de Vendas (Ranking)</h4>
                    <div className="grid grid-cols-5 text-[9px] font-bold text-stone-400 border-b border-stone-100 pb-2 mb-2 text-center">
                        <div className="col-span-2 text-left">Atendente</div>
                        <div>Mês (%)</div>
                        <div>Média/Dia</div>
                        <div>Hoje</div>
                    </div>
                    <div className="space-y-2">
                        {salesShareList.map((staff) => (
                            <div key={staff.name} className="grid grid-cols-5 text-xs items-center text-center border-b border-stone-50 pb-1">
                                <div className="col-span-2 text-left font-bold text-stone-700">{staff.name}</div>
                                <div>
                                    <span className="block font-bold text-stone-800">{staff.monthTotal}</span>
                                    <span className="text-[9px] text-stone-400">({staff.monthPercent}%)</span>
                                </div>
                                <div className="text-stone-500 font-medium">{staff.monthAvg}</div>
                                <div className="font-bold text-orange-600 bg-orange-50 rounded">{staff.todayTotal}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-4">
                    <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Conversão de Vendas (Eficiência)</h4>
                    <div className="grid grid-cols-3 text-[9px] font-bold text-stone-400 border-b border-stone-100 pb-2 mb-2 text-center">
                        <div className="text-left">Atendente</div>
                        <div>% Cliente</div>
                        <div>% Não Cliente</div>
                    </div>
                    <div className="space-y-2">
                        {conversionList.map((staff) => (
                            <div key={staff.name} className="grid grid-cols-3 text-xs items-center text-center border-b border-stone-50 pb-1">
                                <div className="text-left font-bold text-stone-700">{staff.name}</div>
                                <div className="font-bold text-orange-700 bg-orange-50 rounded py-1">{staff.cliRate}%</div>
                                <div className="font-bold text-stone-600 bg-stone-100 rounded py-1">{staff.newRate}%</div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-4">
                    <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Funil por Atendente (Mês vs Hoje)</h4>
                    <div className="overflow-x-auto">
                        <div className="min-w-[300px]">
                            <div className="grid grid-cols-4 text-[9px] font-bold text-stone-500 uppercase mb-2 text-center border-b border-stone-200 pb-2">
                                <div className="text-left">Nome</div>
                                <div>Atend.</div>
                                <div>Orç.</div>
                                <div>Venda</div>
                            </div>
                            {attendantFunnelList.map((staff, idx) => (
                                <div key={idx} className="grid grid-cols-4 text-xs items-center text-center py-2 border-b border-stone-100 last:border-0">
                                    <div className="text-left font-bold text-stone-800">{staff.name}</div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-stone-800">{staff.month.atend}</span>
                                        <span className="text-[9px] text-orange-500 bg-orange-50 rounded px-1">{staff.today.atendimentos}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-stone-800">{staff.month.orc}</span>
                                        <span className="text-[9px] text-orange-500 bg-orange-50 rounded px-1">{staff.today.orcamentos}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-stone-800">{staff.month.venda}</span>
                                        <span className="text-[9px] text-green-600 bg-green-50 rounded px-1 font-bold">{staff.today.vendas}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                        <span className="text-[9px] text-stone-400 uppercase">Legenda: Preto = Mês / Colorido = Hoje</span>
                    </div>
                </Card>

                <Card className="p-4 bg-stone-50 border-stone-200">
                    <h4 className="font-bold text-stone-700 text-sm uppercase mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Conversão de Orçamentos (Retorno)
                    </h4>
                    
                    <div className="mb-6">
                        <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Visão Geral da Loja</p>
                        <div className="h-48 bg-white rounded-xl border border-stone-200 p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={returnAnalysisData} margin={{top: 20, right: 10, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                                    <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{fontSize: '12px', borderRadius: '8px', border: '1px solid #e7e5e4'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                                    <Bar dataKey="Orçamentos" fill="#a8a29e" barSize={20} radius={[4,4,0,0]}>
                                        <LabelList dataKey="Orçamentos" position="top" style={{ fill: '#78716c', fontSize: '9px', fontWeight: 'bold' }} />
                                    </Bar>
                                    <Bar dataKey="Retornos" fill="#ea580c" barSize={20} radius={[4,4,0,0]}>
                                        <LabelList dataKey="Retornos" position="top" style={{ fill: '#c2410c', fontSize: '9px', fontWeight: 'bold' }} />
                                    </Bar>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-around mt-2 text-xs font-bold text-stone-600 bg-white p-2 rounded-lg border border-stone-100 shadow-sm">
                            <span>Taxa Mês: <span className="text-orange-600 text-sm">{returnAnalysisData[0].Taxa}%</span></span>
                            <span>Taxa Hoje: <span className="text-orange-600 text-sm">{returnAnalysisData[2].Taxa}%</span></span>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Eficiência por Equipe (Conversão)</p>
                        <div className="h-64 bg-white rounded-xl border border-stone-200 p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendantReturnChartData} layout="vertical" margin={{top: 5, right: 30, left: 0, bottom: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e7e5e4" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 10, fontWeight: 'bold', fill: '#44403c'}} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#f5f5f4'}} contentStyle={{fontSize: '12px', borderRadius: '8px'}} />
                                    <Legend iconSize={8} wrapperStyle={{fontSize: '10px'}} />
                                    
                                    <Bar dataKey="Orçamentos" fill="#d6d3d1" barSize={12} radius={[0,4,4,0]}>
                                        <LabelList dataKey="Orçamentos" position="right" style={{ fill: '#78716c', fontSize: '9px' }} />
                                    </Bar>
                                    
                                    <Bar dataKey="Retornos" fill="#f97316" barSize={12} radius={[0,4,4,0]}>
                                        <LabelList dataKey="Retornos" position="right" style={{ fill: '#c2410c', fontSize: '9px', fontWeight: 'bold' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {attendantReturnChartData.map(att => (
                                <div key={att.name} className="flex justify-between items-center bg-white p-2 rounded border border-stone-100">
                                    <span className="text-[10px] font-bold text-stone-600">{att.name}</span>
                                    <span className={`text-xs font-black ${att.Taxa >= 30 ? 'text-green-600' : 'text-stone-400'}`}>
                                        {att.Taxa}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3 mb-4">
                        <Megaphone className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <div className="w-full">
                            <h4 className="font-bold text-blue-900 text-sm uppercase">Análise de Marketing</h4>
                            <div className="flex justify-between items-end mt-2">
                                <div>
                                    <p className="text-[10px] text-blue-700 uppercase">Impacto Mensal</p>
                                    <h3 className="text-2xl font-black text-blue-800">{stats.marketingHits} <span className="text-xs font-medium">pessoas</span></h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-blue-700 uppercase">Hoje</p>
                                    <h3 className="text-xl font-black text-blue-600">{todayStats.marketingHits}</h3>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-blue-200">
                                <span className="text-[10px] font-bold text-blue-800 uppercase">Receita Gerada:</span>
                                <span className="text-sm font-black text-stone-800">R$ {stats.marketingRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                            </div>

                            {/* NOVO: DETALHAMENTO DE WHATSAPP */}
                            <div className="mt-4 pt-3 border-t border-blue-200 bg-blue-100/50 rounded-lg p-3">
                                <h5 className="text-xs font-bold text-blue-900 uppercase mb-3 flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" /> Mensagens WhatsApp
                                </h5>
                                
                                {/* New Summary Grid */}
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    <div className="bg-white p-2 rounded border border-blue-100 text-center">
                                        <span className="text-[9px] text-blue-400 uppercase font-bold block">Hoje</span>
                                        <span className="text-lg font-black text-blue-600">{todayStats.whatsappCount}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-blue-100 text-center">
                                        <span className="text-[9px] text-blue-400 uppercase font-bold block">Mês</span>
                                        <span className="text-lg font-black text-blue-800">{stats.totalWhatsapp}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-blue-100 text-center">
                                        <span className="text-[9px] text-blue-400 uppercase font-bold block">Média/Dia</span>
                                        <span className="text-lg font-black text-blue-800">{stats.mediaDiariaWhatsapp}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {whatsappData.length === 0 ? (
                                        <p className="text-[10px] text-blue-400 italic">Nenhuma mensagem registrada.</p>
                                    ) : (
                                        whatsappData.map((item) => (
                                            <div key={item.name} className="flex justify-between items-center text-xs">
                                                <span className="text-blue-800 truncate pr-2">{item.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-blue-600">{item.value} <span className="text-blue-400 font-normal">({item.percent}%)</span></span>
                                                    {item.todayCount > 0 && <span className="px-1.5 py-0.5 bg-green-500 text-white rounded-full text-[9px] font-bold">+{item.todayCount}</span>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* 5. MOVIMENTO (Fluxo) */}
            <div className="space-y-4 pt-4 border-t-2 border-stone-200">
                <h3 className="text-lg font-black text-stone-800 uppercase pl-2 border-l-4 border-stone-400">Movimento</h3>
                
                <Card className="p-4 bg-stone-50 border-stone-300">
                    <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Picos de Movimento</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-green-600 uppercase">Dia + Movimentado</p>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-stone-800">{daysMap[stats.busiestDay[0]]}</span>
                                <span className="text-[10px] text-stone-500">{stats.busiestDay[1]} atendimentos</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-red-500 uppercase">Dia + Vazio</p>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-stone-800">{daysMap[stats.quietestDay[0]]}</span>
                                <span className="text-[10px] text-stone-500">{stats.quietestDay[1]} atendimentos</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-green-600 uppercase">Semana + Cheia</p>
                            <span className="text-sm font-bold text-stone-800">{formatWeekKey(stats.busiestWeek[0])}</span>
                            <span className="block text-[10px] text-stone-500">{stats.busiestWeek[1]} atendimentos</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-red-500 uppercase">Semana + Vazia</p>
                            <span className="text-sm font-bold text-stone-800">{formatWeekKey(stats.quietestWeek[0])}</span>
                            <span className="block text-[10px] text-stone-500">{stats.quietestWeek[1]} atendimentos</span>
                        </div>
                        {/* NOVOS CAMPOS: Dia do Mês */}
                        <div>
                            <p className="text-[10px] font-bold text-green-600 uppercase">Data + Cheia</p>
                            <span className="text-sm font-bold text-stone-800">Dia {stats.busiestDate[0]}</span>
                            <span className="block text-[10px] text-stone-500">{stats.busiestDate[1]} atendimentos</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-red-500 uppercase">Data + Vazia</p>
                            <span className="text-sm font-bold text-stone-800">Dia {stats.quietestDate[0]}</span>
                            <span className="block text-[10px] text-stone-500">{stats.quietestDate[1]} atendimentos</span>
                        </div>
                    </div>
                    
                    {/* Periodos Manhã Tarde */}
                    <div className="grid grid-cols-2 gap-4 mb-4 border-t border-stone-200 pt-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Sun className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-bold text-stone-700 uppercase">Manhã</span>
                            </div>
                            <div className="text-xs text-stone-600">
                                <span className="font-bold">{stats.morningCount}</span> <span className="text-[10px]">({stats.totalAtendimentosGeral > 0 ? Math.round((stats.morningCount/stats.totalAtendimentosGeral)*100) : 0}%)</span>
                            </div>
                            <div className="text-[10px] text-stone-400 mt-1">
                                Hoje: <span className="font-bold text-orange-600">{todayStats.morningCount}</span> ({todayStats.atendimentos > 0 ? Math.round((todayStats.morningCount/(todayStats.morningCount + todayStats.afternoonCount))*100) : 0}%)
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Moon className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-stone-700 uppercase">Tarde</span>
                            </div>
                            <div className="text-xs text-stone-600">
                                <span className="font-bold">{stats.afternoonCount}</span> <span className="text-[10px]">({stats.totalAtendimentosGeral > 0 ? Math.round((stats.afternoonCount/stats.totalAtendimentosGeral)*100) : 0}%)</span>
                            </div>
                            <div className="text-[10px] text-stone-400 mt-1">
                                Hoje: <span className="font-bold text-blue-600">{todayStats.afternoonCount}</span> ({todayStats.atendimentos > 0 ? Math.round((todayStats.afternoonCount/(todayStats.morningCount + todayStats.afternoonCount))*100) : 0}%)
                            </div>
                        </div>
                    </div>

                    {/* GRÁFICO DE BARRAS: DIAS DA SEMANA */}
                    <div className="mb-4">
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">Por Dia da Semana</p>
                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weekDayData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fontSize:10}} />
                                    <Tooltip cursor={{fill: '#f5f5f4'}} />
                                    <Bar dataKey="value" fill="#78716c" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* GRÁFICO DE BARRAS: SEMANAS */}
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">Por Semana do Mês</p>
                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weekData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fontSize:10}} />
                                    <Tooltip cursor={{fill: '#f5f5f4'}} />
                                    <Bar dataKey="value" fill="#fb923c" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Total de atendimentos mês</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg border border-stone-200">
                            <p className="text-[9px] font-bold uppercase text-stone-500">Total Mês</p>
                            <h3 className="text-2xl font-black text-stone-800">{stats.totalAtendimentosGeral}</h3>
                            <p className="text-[10px] text-stone-400">Média: {stats.mediaDiariaAtendimentos}/dia</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <div className="flex justify-between items-center">
                                <p className="text-[9px] font-bold uppercase text-orange-600">Hoje</p>
                                <Zap className="w-3 h-3 text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-black text-orange-600">{todayStats.atendimentos}</h3>
                            <p className="text-[10px] text-orange-400">Total Geral</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-stone-50 p-2 rounded space-y-1">
                            <span className="font-bold text-stone-600 block border-b border-stone-200 pb-1 mb-1">Balcão</span>
                            <div className="flex justify-between">
                                <span className="text-stone-500">Total:</span>
                                <span className="font-bold text-stone-800">{stats.totalServicos}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-stone-500">Média:</span>
                                <span className="font-bold text-stone-800">{stats.mediaDiariaServicos}</span>
                            </div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded space-y-1">
                            <span className="font-bold text-orange-700 block border-b border-orange-200 pb-1 mb-1">Comercial</span>
                            <div className="flex justify-between">
                                <span className="text-orange-600">Total:</span>
                                <span className="font-bold text-orange-800">{stats.totalComercial}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-orange-600">Média:</span>
                                <span className="font-bold text-orange-800">{stats.mediaDiariaTotal}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <InsightsPanel stats={stats} />
            <YearlyAnalysis data={data} />

        </div>
      )}
    </div>
  );
}

// --- Nova Tela: Comparativo (ComparisonScreen) ---

function ComparisonScreen({ data }) {
    // --- Lógica de Filtro de Mês ---
    const availableMonths = useMemo(() => {
        const monthSet = new Set();
        data.forEach(item => {
            const d = item.date;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthSet.add(key);
        });
        return Array.from(monthSet).sort().reverse();
    }, [data]);

    const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || '');

    useEffect(() => {
        if (availableMonths.length > 0 && !selectedMonth) {
            setSelectedMonth(availableMonths[0]);
        }
    }, [availableMonths, selectedMonth]);

    const formatMonthLabel = (key) => {
        if (!key) return '';
        const [year, month] = key.split('-');
        const date = new Date(year, month - 1);
        const monthName = date.toLocaleString('pt-BR', { month: 'long' });
        return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
    };

    // --- Processamento dos Dados Comparativos ---
    const compStats = useMemo(() => {
        if (!selectedMonth) return null;
        const [year, month] = selectedMonth.split('-').map(Number);
        
        // Filtra pelo mês selecionado
        const monthData = data.filter(item => {
            const d = item.date;
            return d.getFullYear() === year && (d.getMonth() + 1) === month;
        });

        // Estrutura Base
        const metrics = {
            TC: { vendas: 0, orcamentos: 0, retornos: 0, servicos: 0, atendimentos: 0, messages: 0, msgSales: 0, cliSales:0, newSales:0, staff: {} },
            SGS: { vendas: 0, orcamentos: 0, retornos: 0, servicos: 0, atendimentos: 0, messages: 0, msgSales: 0, cliSales:0, newSales:0, staff: {} }
        };

        // Popula Métricas
        monthData.forEach(entry => {
            const store = entry.store;
            if (!metrics[store]) return;

            if (entry.category === 'servico') metrics[store].servicos++;
            if (entry.category === 'whatsapp') metrics[store].messages++;
            
            if (entry.category === 'comercial') {
                metrics[store].atendimentos++;
                if (entry.marketingSource === 'mensagem') metrics[store].msgSales++; 

                if (entry.action === 'venda') {
                    metrics[store].vendas++;
                    if (entry.clientType === 'cliente') metrics[store].cliSales++;
                    else metrics[store].newSales++;
                }
                if (entry.action === 'orcamento') metrics[store].orcamentos++;
                if (entry.action === 'retorno') metrics[store].retornos++;

                // Dados Detalhados por Atendente
                if (entry.attendant) {
                    if (!metrics[store].staff[entry.attendant]) {
                        metrics[store].staff[entry.attendant] = { 
                            vendaCli: 0, vendaNew: 0, 
                            orcCli: 0, orcNew: 0,
                            valCli: 0, valNew: 0 
                        };
                    }
                    const staff = metrics[store].staff[entry.attendant];
                    
                    if (entry.action === 'venda') {
                        if (entry.clientType === 'cliente') {
                            staff.vendaCli++;
                            staff.valCli += (parseFloat(entry.saleValue) || 0);
                        } else {
                            staff.vendaNew++;
                            staff.valNew += (parseFloat(entry.saleValue) || 0);
                        }
                    }
                    if (entry.action === 'orcamento') {
                        if (entry.clientType === 'cliente') staff.orcCli++;
                        else staff.orcNew++;
                    }
                }
            }
        });

        return metrics;
    }, [data, selectedMonth]);

    if (!compStats) return <div className="p-8 text-center text-stone-400">Sem dados suficientes para comparação.</div>;

    // --- Dados para Gráficos ---

    // 1. Vendas Totais & Tipo
    const salesCompData = [
        { name: 'Venda Cliente', TC: compStats.TC.cliSales, SGS: compStats.SGS.cliSales },
        { name: 'Venda Ñ Cliente', TC: compStats.TC.newSales, SGS: compStats.SGS.newSales },
        { name: 'Total', TC: compStats.TC.vendas, SGS: compStats.SGS.vendas }
    ];

    // 2. Orçamentos x Retornos
    const quoteCompData = [
        { name: 'Orçamentos', TC: compStats.TC.orcamentos, SGS: compStats.SGS.orcamentos },
        { name: 'Retornos', TC: compStats.TC.retornos, SGS: compStats.SGS.retornos }
    ];

    // 3. Volume Serviços
    const serviceCompData = [
        { name: 'Serviços Rápidos', TC: compStats.TC.servicos, SGS: compStats.SGS.servicos },
        { name: 'Comercial', TC: compStats.TC.atendimentos, SGS: compStats.SGS.atendimentos }
    ];

    // 4. Mensagens
    const msgData = [
        { name: 'Msgs Enviadas', TC: compStats.TC.messages, SGS: compStats.SGS.messages },
        { name: 'Vendas via Msg', TC: compStats.TC.msgSales, SGS: compStats.SGS.msgSales }
    ];

    // 5. Ranking Atendentes (Unificado)
    const allStaff = [];
    ['TC', 'SGS'].forEach(store => {
        Object.entries(compStats[store].staff).forEach(([name, s]) => {
            const totalSales = s.vendaCli + s.vendaNew;
            const totalOrc = s.orcCli + s.orcNew;
            
            // Taxas de Conversão Específicas
            const rateCli = (s.vendaCli + s.orcCli) > 0 ? Math.round((s.vendaCli / (s.vendaCli + s.orcCli)) * 100) : 0;
            const rateNew = (s.vendaNew + s.orcNew) > 0 ? Math.round((s.vendaNew / (s.vendaNew + s.orcNew)) * 100) : 0;

            allStaff.push({ 
                name, 
                store, 
                vendas: totalSales, 
                orcamentos: totalOrc,
                conversion: totalOrc > 0 ? Math.round((totalSales/totalOrc)*100) : 0,
                // Dados detalhados
                rateCli,
                rateNew,
                valCli: s.valCli,
                valNew: s.valNew
            });
        });
    });
    
    // Ordenar para o Ranking Geral
    const topStaff = [...allStaff].sort((a,b) => b.vendas - a.vendas).slice(0, 10);
    
    // Ordenar para o Gráfico de Eficiência (por nome para agrupar)
    const staffEfficiency = [...allStaff].sort((a,b) => b.vendas - a.vendas); 

    // Custom Tooltip for Efficiency Chart
    const CustomEfficiencyTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-stone-200 shadow-xl rounded-lg z-50">
                    <p className="font-bold text-stone-800 text-xs mb-1">{label} ({data.store})</p>
                    <div className="space-y-1">
                        <p className="text-[10px] text-orange-700 font-bold">
                            Cliente: {data.rateCli}% <span className="font-normal text-stone-500">({data.vendaCli} vds / {data.valCli.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})</span>
                        </p>
                        <p className="text-[10px] text-stone-600 font-bold">
                            Novo: {data.rateNew}% <span className="font-normal text-stone-500">({data.vendaNew} vds / {data.valNew.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10">
            {/* Header Comparativo */}
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-xl shadow-lg text-white">
                        <Scale className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-stone-800 leading-tight">Comparativo Lojas</h2>
                        <p className="text-xs font-medium text-stone-500">Benchmarking TC vs SGS</p>
                    </div>
                </div>
                
                {/* Seletor Mês */}
                <div className="relative">
                    <Filter className="absolute left-3 top-3.5 h-5 w-5 text-stone-400" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 text-sm font-bold border-2 border-orange-100 rounded-xl bg-white text-stone-800 shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    >
                        {availableMonths.map(m => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-stone-400" />
                </div>
            </div>

            {/* 1. Vendas Comparadas */}
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-stone-700 text-sm uppercase">Vendas: Clientes vs Novos</h4>
                    <div className="flex gap-3 text-[10px] font-bold">
                        <span className="text-orange-600 flex items-center gap-1"><div className="w-2 h-2 bg-orange-600 rounded-full"></div> TC</span>
                        <span className="text-red-600 flex items-center gap-1"><div className="w-2 h-2 bg-red-600 rounded-full"></div> SGS</span>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesCompData} margin={{top: 20, right: 5, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <YAxis tick={{fontSize: 10}} />
                            <Tooltip cursor={{fill: '#f5f5f4'}} contentStyle={{fontSize: '12px', borderRadius: '8px'}}/>
                            <Bar dataKey="TC" fill="#ea580c" radius={[4,4,0,0]} barSize={30}>
                                <LabelList dataKey="TC" position="top" style={{ fill: '#c2410c', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#dc2626" radius={[4,4,0,0]} barSize={30}>
                                <LabelList dataKey="SGS" position="top" style={{ fill: '#991b1b', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 2. Orçamentos e Retornos */}
            <Card className="p-4">
                <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Orçamentos & Retornos</h4>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={quoteCompData} margin={{top: 20, right: 5, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <YAxis tick={{fontSize: 10}} />
                            <Tooltip cursor={{fill: '#f5f5f4'}} />
                            <Bar dataKey="TC" fill="#ea580c" radius={[4,4,0,0]} barSize={30}>
                                <LabelList dataKey="TC" position="top" style={{ fill: '#c2410c', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#dc2626" radius={[4,4,0,0]} barSize={30}>
                                <LabelList dataKey="SGS" position="top" style={{ fill: '#991b1b', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-around text-xs border-t border-stone-100 pt-2">
                    <div className="text-center">
                        <span className="block font-bold text-stone-500">Taxa Retorno TC</span>
                        <span className="text-lg font-black text-orange-600">
                            {compStats.TC.orcamentos > 0 ? Math.round((compStats.TC.retornos/compStats.TC.orcamentos)*100) : 0}%
                        </span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-stone-500">Taxa Retorno SGS</span>
                        <span className="text-lg font-black text-red-600">
                            {compStats.SGS.orcamentos > 0 ? Math.round((compStats.SGS.retornos/compStats.SGS.orcamentos)*100) : 0}%
                        </span>
                    </div>
                </div>
            </Card>

            {/* 3. Volume de Serviços */}
            <Card className="p-4">
                <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Volume de Atendimento</h4>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={serviceCompData} layout="vertical" margin={{top: 0, right: 30, left: 10, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <Tooltip cursor={{fill: '#f5f5f4'}} />
                            <Legend iconSize={8} />
                            <Bar dataKey="TC" fill="#fb923c" radius={[0,4,4,0]} barSize={20}>
                                <LabelList dataKey="TC" position="right" style={{ fill: '#c2410c', fontSize: '10px' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#f87171" radius={[0,4,4,0]} barSize={20}>
                                <LabelList dataKey="SGS" position="right" style={{ fill: '#991b1b', fontSize: '10px' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 4. Mensagens e Conversão (Verde) */}
            <Card className="p-4 bg-green-50/50 border-green-100">
                <h4 className="font-bold text-green-800 text-sm mb-4 uppercase flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Marketing (WhatsApp)
                </h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={msgData} margin={{top: 20, right: 5, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <YAxis tick={{fontSize: 10}} />
                            <Tooltip />
                            <Bar dataKey="TC" fill="#16a34a" radius={[4,4,0,0]} barSize={30}>
                                <LabelList dataKey="TC" position="top" style={{ fill: '#14532d', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#4ade80" radius={[4,4,0,0]} barSize={30}>
                                <LabelList dataKey="SGS" position="top" style={{ fill: '#14532d', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 5. Eficiência por Perfil de Cliente (Atendentes) */}
            <Card className="p-4 bg-stone-50 border-stone-200">
                <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-600" /> Eficiência por Perfil (Conversão %)
                </h4>
                <p className="text-[10px] text-stone-500 mb-2">Compara a conversão de Clientes Antigos vs. Novos Clientes por atendente.</p>
                
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={staffEfficiency} layout="vertical" margin={{top: 0, right: 15, left: 0, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <Tooltip content={<CustomEfficiencyTooltip />} cursor={{fill: '#f5f5f4'}} />
                            <Legend iconSize={8} wrapperStyle={{fontSize:'10px'}} />
                            <Bar name="Cliente (%)" dataKey="rateCli" fill="#ea580c" radius={[0,4,4,0]} barSize={12}>
                                <LabelList dataKey="rateCli" position="right" formatter={(v) => `${v}%`} style={{ fill: '#9a3412', fontSize: '9px', fontWeight:'bold' }} />
                            </Bar>
                            <Bar name="Novo (%)" dataKey="rateNew" fill="#78716c" radius={[0,4,4,0]} barSize={12}>
                                <LabelList dataKey="rateNew" position="right" formatter={(v) => `${v}%`} style={{ fill: '#44403c', fontSize: '9px' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 6. Ranking Top Atendentes */}
            <Card className="p-4">
                <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" /> Top Atendentes
                </h4>
                <div className="space-y-2">
                    <div className="grid grid-cols-6 text-[9px] font-bold text-stone-400 border-b border-stone-100 pb-2">
                        <div className="col-span-2">Nome</div>
                        <div className="text-center">Vendas</div>
                        <div className="text-center">Conv.</div>
                        <div className="col-span-2 text-right">R$ Total</div>
                    </div>
                    {topStaff.map((s, i) => (
                        <div key={`${s.store}-${s.name}`} className="grid grid-cols-6 items-center py-2 border-b border-stone-50 text-xs">
                            <div className="col-span-2">
                                <span className="font-bold text-stone-700 block">{i+1}. {s.name}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${s.store === 'TC' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                    {s.store}
                                </span>
                            </div>
                            <div className="text-center font-bold text-stone-800">{s.vendas}</div>
                            <div className="text-center font-bold text-stone-500">{s.conversion}%</div>
                            <div className="col-span-2 text-right font-black text-green-600">
                                R$ {(s.valCli + s.valNew).toLocaleString('pt-BR', {compactDisplay: 'short', notation: 'compact'})}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// --- App Main Component ---

export default function App() {
  const [storeConfig, setStoreConfig] = useState(DEFAULT_CONFIG);
  const [user, setUser] = useState(null);
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [currentStore, setCurrentStore] = useState(null); // 'TC' or 'SGS'

  const [view, setView] = useState('entry'); 
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); 
  const [showSettings, setShowSettings] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); 
  const [pendingStore, setPendingStore] = useState(null);

  // Load Config from LocalStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('optical_store_config_v2');
    if (savedConfig) {
        setStoreConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Save Config to LocalStorage
  const handleUpdateConfig = (newConfig) => {
      setStoreConfig(newConfig);
      localStorage.setItem('optical_store_config_v2', JSON.stringify(newConfig));
  };

  // Firebase Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Load Entries
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'optical_records_final_v11')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
      }));
      data.sort((a, b) => b.date - a.date);
      setEntries(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = (storeId, isManagerLogin) => {
      setCurrentStore(storeId);
      setIsAuthenticated(true);
      setIsManager(isManagerLogin);
      setView('entry');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setIsManager(false);
      setCurrentStore(null);
  };

  const handleAddEntry = async (entryData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'optical_records_final_v11'), {
        ...entryData,
        store: currentStore,
        createdAt: serverTimestamp(),
        userId: user.uid,
        dateString: new Date().toLocaleDateString('pt-BR')
      });
      return true;
    } catch (error) {
      console.error("Error adding document: ", error);
      return false;
    }
  };

  const handleClearToday = async () => {
    const today = new Date();
    const entriesToDelete = entries.filter(entry => {
        const entryDate = entry.date; 
        return entry.store === currentStore && 
               entryDate.getDate() === today.getDate() &&
               entryDate.getMonth() === today.getMonth() &&
               entryDate.getFullYear() === today.getFullYear();
    });

    if (entriesToDelete.length === 0) {
        setShowSettings(false); 
        return;
    }

    try {
        const batch = writeBatch(db);
        entriesToDelete.forEach(entry => {
            const ref = doc(db, 'artifacts', appId, 'public', 'data', 'optical_records_final_v11', entry.id);
            batch.delete(ref);
        });
        await batch.commit();
        setShowSettings(false);
    } catch (error) {
        console.error("Erro ao limpar dados:", error);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => e.store === currentStore);
  }, [entries, currentStore]);

  const requestAccess = (action, payload = null) => {
    if (isManager) {
        if (action === 'dashboard') setView('dashboard');
        if (action === 'comparison') setView('comparison');
        if (action === 'settings') setShowSettings(true);
        if (action === 'storeChange') setCurrentStore(payload);
    } else {
        setPendingAction(action);
        setPendingStore(payload);
        setShowPinModal(true);
    }
  };

  const handlePinSuccess = () => {
    setIsManager(true);
    if (pendingAction === 'dashboard') setView('dashboard');
    if (pendingAction === 'comparison') setView('comparison');
    if (pendingAction === 'settings') setShowSettings(true);
    if (pendingAction === 'storeChange') setCurrentStore(pendingStore);
    
    setPendingAction(null);
    setPendingStore(null);
  };

  if (!isAuthenticated) {
      return <LoginScreen config={storeConfig} onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen ${THEME.bgMain} font-sans ${THEME.textDark} pb-24`}>
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />

      <header className={`${THEME.primary} shadow-lg sticky top-0 z-30`}>
        <div className="max-w-md mx-auto px-3 py-3 flex justify-between items-center">
          <div>
            <h1 className="font-extrabold text-lg leading-tight text-white tracking-wide">ÓTICA PRECISÃO</h1>
            <p className="text-[10px] text-orange-100 font-medium tracking-wider opacity-90 flex items-center gap-1">
              {storeConfig.stores[currentStore].name}
              {isManager ? <Unlock className="w-3 h-3 text-green-300"/> : <Lock className="w-3 h-3 text-orange-200"/>}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
             {/* Logout Button */}
             <button 
                onClick={handleLogout}
                className="bg-orange-800/50 p-1.5 rounded-xl text-white border border-orange-400/30 hover:bg-orange-700 transition-colors"
                title="Sair / Trocar Loja"
            >
                <LogOut className="w-4 h-4" />
            </button>

            {/* Manager Settings */}
            <button 
                onClick={() => requestAccess('settings')}
                className="bg-orange-800/50 p-1.5 rounded-xl text-white border border-orange-400/30 hover:bg-orange-700 transition-colors"
            >
                {isManager ? <Settings className="w-4 h-4" /> : <Lock className="w-4 h-4 opacity-70" />}
            </button>
          </div>
        </div>
      </header>

      {showPinModal && (
          <PinModal 
            onClose={() => setShowPinModal(false)} 
            onSuccess={handlePinSuccess}
            managerPin={storeConfig.managerPassword}
          />
      )}

      {showSettings && (
        <SettingsModal 
            config={storeConfig} 
            currentStore={currentStore}
            onClose={() => setShowSettings(false)}
            onUpdateConfig={handleUpdateConfig}
            onClearToday={handleClearToday}
        />
      )}

      <main className="max-w-md mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-orange-600"></div>
          </div>
        ) : view === 'entry' ? (
          <EntryScreen 
            storeData={storeConfig.stores[currentStore]} 
            onSave={handleAddEntry} 
          />
        ) : view === 'dashboard' ? (
          <DashboardScreen 
            data={filteredEntries} 
            storeData={storeConfig.stores[currentStore]}
          />
        ) : (
          <ComparisonScreen data={entries} />
        )}
      </main>

      <div className={`fixed bottom-0 left-0 right-0 ${THEME.bgCard} border-t ${THEME.border} px-4 py-3 flex justify-around z-30 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)]`}>
        <button 
          onClick={() => setView('entry')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 ${view === 'entry' ? THEME.accentText : THEME.textLight}`}
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Novo</span>
        </button>
        
        <button 
          onClick={() => requestAccess('dashboard')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 ${view === 'dashboard' ? THEME.accentText : THEME.textLight}`}
        >
          {isManager ? <BarChart2 className="w-6 h-6" /> : <Lock className="w-6 h-6 opacity-60" />}
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {isManager ? "Relatórios" : "Restrito"}
          </span>
        </button>

        {/* Botão Comparativo */}
        <button 
          onClick={() => requestAccess('comparison')}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 ${view === 'comparison' ? 'text-orange-600' : THEME.textLight}`}
        >
          {isManager ? <Scale className="w-6 h-6" /> : <Lock className="w-6 h-6 opacity-60" />}
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Comparar
          </span>
        </button>
      </div>
    </div>
  );
}