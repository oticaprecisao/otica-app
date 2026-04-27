import React, { useState, useEffect, useMemo } from 'react';
// CORREÇÃO DE COMPATIBILIDADE:
// Usando nomes "clássicos" do Lucide e apelidando (as) para os nomes usados no código.
// Isso resolve o erro "undefined" se o ambiente estiver rodando uma versão do Lucide anterior à 0.460.
import {
    Users,
    ShoppingBag,
    Wrench,
    CreditCard,
    HelpCircle as CircleHelp,    // Compatibilidade: HelpCircle (antigo) -> CircleHelp
    BarChart2 as ChartBar,       // Compatibilidade: BarChart2 (antigo) -> ChartBar
    PlusCircle as CirclePlus,    // Compatibilidade: PlusCircle (antigo) -> CirclePlus
    CheckCircle as CircleCheck,  // Compatibilidade: CheckCircle (antigo) -> CircleCheck
    ArrowLeft,
    Calendar,
    Eye,
    Sun,
    Moon,
    DollarSign,
    FileText,
    Store,
    TrendingUp,
    TrendingDown,
    Target,
    ChevronDown,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle as CircleAlert,   // Compatibilidade: AlertCircle (antigo) -> CircleAlert
    Award,
    CalendarDays,
    Zap,
    UserCheck,
    UserPlus,
    Megaphone,
    Lightbulb,
    Settings,
    Trash2 as Trash,             // Compatibilidade: Trash2 (antigo) -> Trash
    Monitor as MonitorPlay,      // Compatibilidade: Monitor (universal) -> MonitorPlay
    MessageCircle,
    Lock,
    Unlock as LockOpen,          // Compatibilidade: Unlock (antigo) -> LockOpen
    X,
    Smartphone,
    Globe,
    AlertTriangle as TriangleAlert, // Compatibilidade: AlertTriangle (antigo) -> TriangleAlert
    Camera,
    CalendarCheck,
    MoreHorizontal as Ellipsis,     // Compatibilidade: MoreHorizontal (antigo) -> Ellipsis
    MessageSquare,
    Scale,
    ArrowLeftRight, // Este costuma existir nas duas versões
    Plus,
    LogOut,
    Shield,
    Key,
    Edit as Pencil, // Compatibilidade: Edit (antigo/universal) -> Pencil (garante que funcione)
    List,
    Clock,
    ChevronRight,
    History,
    Save,
    User,
    Check,
    Sparkles
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
    updateDoc,
    doc,
    getDoc,
    setDoc,
    writeBatch,
    onSnapshot,
    query,
    serverTimestamp
} from 'firebase/firestore';

// ============================================================================
// CONFIGURAÇÃO FIREBASE (PRODUÇÃO)
// ============================================================================

let firebaseConfig = {};
let app, auth, db;
let firebaseInitError = null;

try {
    firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("FIREBASE INIT ERROR:", error);
    firebaseInitError = error;
}

const databaseAppId = 'otica-precisao-main-app';
const DATA_COLLECTION_NAME = 'optical_records_final_v11';

// ============================================================================
// FIM DA ÁREA DE CONFIGURAÇÃO
// ============================================================================

// --- Constantes Iniciais ---
const DEFAULT_CONFIG = {
    managerPassword: null, // Bloqueado, depende do Firebase
    stores: {
        TC: {
            id: 'TC',
            name: 'Três Corações',
            staff: [
                { name: 'Ana Laura', active: true },
                { name: 'Elaine', active: true },
                { name: 'Ketlin', active: true },
                { name: 'Eleonora', active: false },
                { name: 'Paulo Habel', active: true }
            ],
            password: null // Bloqueado, depende do Firebase
        },
        SGS: {
            id: 'SGS',
            name: 'São Gonçalo do Sapucaí',
            staff: [
                { name: 'Vitoria', active: true },
                { name: 'Roberta', active: true },
                { name: 'Fernanda', active: true },
                { name: 'Kawane', active: true }
            ],
            password: null // Bloqueado, depende do Firebase
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
    { id: 'duvidas', label: 'Dúvidas', icon: CircleHelp }
];

const COMMERCIAL_ACTIONS = [
    { id: 'orcamento', label: 'Orçamento', icon: FileText },
    { id: 'venda', label: 'Venda', icon: DollarSign },
    { id: 'retorno', label: 'Retorno Orç.', icon: Calendar }
];

const WHATSAPP_ACTIONS = [
    { id: 'fotos', label: 'Fotos Armações', icon: Camera },
    { id: 'duvidas_zap', label: 'Tirou Dúvidas', icon: CircleHelp },
    { id: 'receita', label: 'Enviou Receita', icon: FileText },
    { id: 'agendou', label: 'Agendou', icon: CalendarCheck },
    { id: 'outros_zap', label: 'Outros', icon: Ellipsis }
];

const CLIENT_TYPES = [
    { id: 'cliente', label: 'Já é Cliente' },
    { id: 'nao_cliente', label: 'Não Cliente' }
];

// --- Mock Data Generator Helper ---
const generateMockData = async (storeConfig) => {
    const batch = writeBatch(db);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const randomDate = () => {
        const day = Math.floor(Math.random() * today.getDate()) + 1;
        return new Date(currentYear, currentMonth, day, Math.floor(Math.random() * 10) + 9, 0, 0);
    };

    const actions = ['venda', 'orcamento', 'orcamento', 'venda', 'retorno'];
    const marketingSources = [null, null, 'anuncio', 'mensagem', null];
    const clientTypes = ['cliente', 'cliente', 'nao_cliente'];

    let count = 0;

    for (const storeKey of ['TC', 'SGS']) {
        const staffList = storeConfig.stores[storeKey].staff.filter(s => s.active).map(s => s.name);

        for (let i = 0; i < 40; i++) {
            const date = randomDate();
            const action = random(actions);
            // LÓGICA DE VENDA: Venda OU Retorno conta como venda $$$
            const isSale = action === 'venda' || action === 'retorno';

            const entry = {
                category: 'comercial',
                action: action,
                attendant: random(staffList),
                clientType: random(clientTypes),
                marketingSource: random(marketingSources),
                period: date.getHours() < 12 ? 'manha' : 'tarde',
                store: storeKey,
                createdAt: date,
                dateString: date.toLocaleDateString('pt-BR'),
                userId: 'mock-user',
                saleValue: isSale ? Math.floor(Math.random() * 800) + 150 : 0
            };

            const ref = doc(collection(db, 'artifacts', databaseAppId, 'public', 'data', DATA_COLLECTION_NAME));
            batch.set(ref, entry);
            count++;
        }

        for (let i = 0; i < 15; i++) {
            const date = randomDate();
            const entry = {
                category: 'servico',
                type: random(SERVICE_TYPES.map(s => s.id)),
                period: date.getHours() < 12 ? 'manha' : 'tarde',
                store: storeKey,
                createdAt: date,
                dateString: date.toLocaleDateString('pt-BR'),
                userId: 'mock-user'
            };
            const ref = doc(collection(db, 'artifacts', databaseAppId, 'public', 'data', DATA_COLLECTION_NAME));
            batch.set(ref, entry);
            count++;
        }

        for (let i = 0; i < 20; i++) {
            const date = randomDate();
            const entry = {
                category: 'whatsapp',
                type: random(WHATSAPP_ACTIONS.map(a => a.id)),
                period: date.getHours() < 12 ? 'manha' : 'tarde',
                marketingSource: 'mensagem',
                store: storeKey,
                createdAt: date,
                dateString: date.toLocaleDateString('pt-BR'),
                userId: 'mock-user'
            };
            const ref = doc(collection(db, 'artifacts', databaseAppId, 'public', 'data', DATA_COLLECTION_NAME));
            batch.set(ref, entry);
            count++;
        }
    }

    await batch.commit();
    return count;
};

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
        marketing: `border-2 border-stone-100 bg-stone-700 hover:border-stone-300 hover:bg-stone-100`,
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
    const icon = notification.type === 'error' ? <CircleAlert className="w-5 h-5 text-white" /> : <CircleCheck className="w-5 h-5 text-white" />;

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

// COMPONENTE NOVO: Modal de Edição Completa
function EditEntryModal({ entry, onClose, onSave, storeData, isNew = false }) {
    const [category, setCategory] = useState(entry?.category || 'comercial');
    const [action, setAction] = useState(entry?.action || 'venda');
    const [clientType, setClientType] = useState(entry?.clientType || 'cliente');
    const [marketingSource, setMarketingSource] = useState(entry?.marketingSource || null);
    const [saleValue, setSaleValue] = useState(entry?.saleValue ? String(entry.saleValue) : '');
    const [attendant, setAttendant] = useState(entry?.attendant || '');
    const [type, setType] = useState(entry?.type || (category === 'whatsapp' ? 'duvidas_zap' : ''));
    const [message, setMessage] = useState(entry?.message || '');
    const [saving, setSaving] = useState(false);

    const staffList = storeData?.staff.filter(s => s.active).map(s => s.name) || [];

    const handleSave = async () => {
        setSaving(true);
        const updateData = { category };
        if (category === 'comercial') {
            updateData.action = action;
            updateData.clientType = clientType;
            updateData.marketingSource = marketingSource;
            updateData.attendant = attendant;
            if (action === 'venda' || action === 'retorno') {
                updateData.saleValue = parseFloat(String(saleValue).replace(',', '.')) || 0;
            } else {
                updateData.saleValue = 0;
            }
        } else if (category === 'servico') {
            updateData.type = type;
        } else if (category === 'whatsapp') {
            updateData.type = type;
            updateData.message = message;
            updateData.marketingSource = 'mensagem'; // Defaults for whatsapp
        }
        await onSave(entry?.id, updateData);
        setSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-stone-50 w-full max-w-md sm:max-w-2xl rounded-2xl max-h-[95vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="shrink-0 bg-white border-b border-stone-200 px-4 py-3 flex justify-between items-center z-10 rounded-t-2xl text-center shadow-sm">
                    <div className="flex-1">
                        <h2 className="font-extrabold text-stone-800 text-base">{isNew ? 'Novo Registro' : 'Editar Registro'}</h2>
                        <p className="text-[10px] text-stone-500 font-bold uppercase">{entry?.date?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-3 overflow-y-auto sm:overflow-y-visible">
                    <div className="sm:grid sm:grid-cols-2 sm:gap-4 space-y-3 sm:space-y-0">
                        {/* Categoria - Full Width */}
                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-stone-200 sm:col-span-2">
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Tipo de Registro</p>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[['comercial', DollarSign, 'Comercial'], ['servico', Wrench, 'Serviço'], ['whatsapp', MessageCircle, 'WhatsApp']].map(([cat, Icon, label]) => (
                                    <button key={cat} onClick={() => setCategory(cat)}
                                        className={`py-1.5 rounded-lg border-2 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${category === cat ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-300'}`}>
                                        <Icon className={`w-3.5 h-3.5 ${category === cat ? 'text-orange-600' : 'text-stone-400'}`} />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COMERCIAL */}
                        {category === 'comercial' && (
                            <>
                                <div className="space-y-3">
                                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-stone-200 h-full">
                                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Ação Realizada</p>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {COMMERCIAL_ACTIONS.map(opt => (
                                                <button key={opt.id} onClick={() => setAction(opt.id)}
                                                    className={`py-1.5 rounded-lg border-2 text-center text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${action === opt.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-300'}`}>
                                                    <opt.icon className="w-3.5 h-3.5" />
                                                    <span className="truncate">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {staffList.length > 0 && (
                                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-stone-200">
                                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Atendente</p>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {staffList.map(s => (
                                                    <button key={s} onClick={() => setAttendant(s)}
                                                        className={`py-1 px-1.5 rounded-lg border-2 text-[10px] font-bold text-center transition-all flex flex-col items-center gap-1 ${attendant === s ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-stone-300'}`}>
                                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black shrink-0 ${attendant === s ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                                                            {s.substring(0, 2).toUpperCase()}
                                                        </span>
                                                        <span className="truncate w-full">{s.split(' ')[0]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-stone-200">
                                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Perfil do Cliente</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {CLIENT_TYPES.map((t) => (
                                            <button key={t.id} onClick={() => setClientType(t.id)}
                                                className={`py-2 px-3 rounded-lg border-2 flex items-center justify-center gap-1.5 transition-all shadow-sm ${clientType === t.id ? 'border-orange-300 bg-orange-50 text-orange-800' : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-50'}`}>
                                                {t.id === 'cliente' ? <UserCheck className={`w-4 h-4 ${clientType === t.id ? 'text-orange-600' : 'text-stone-400'}`} /> : <UserPlus className={`w-4 h-4 ${clientType === t.id ? 'text-orange-600' : 'text-stone-400'}`} />}
                                                <span className="text-xs font-bold tracking-tight">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-2.5 rounded-xl shadow-sm border border-blue-100">
                                    <p className="text-[9px] font-bold text-blue-900 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
                                        <Megaphone className="w-3 h-3 text-blue-700" /> Origem (Marketing)
                                    </p>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <button onClick={() => setMarketingSource(null)}
                                            className={`py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${!marketingSource ? 'bg-stone-600 text-white border-stone-600' : 'bg-white text-stone-500 border-stone-200'}`}>
                                            Nenhum
                                        </button>
                                        <button onClick={() => setMarketingSource('anuncio')}
                                            className={`py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all flex items-center justify-center gap-1 ${marketingSource === 'anuncio' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'}`}>
                                            <MonitorPlay className="w-3.5 h-3.5" /> Anúncio
                                        </button>
                                        <button onClick={() => setMarketingSource('mensagem')}
                                            className={`py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all flex items-center justify-center gap-1 ${marketingSource === 'mensagem' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-200'}`}>
                                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                        </button>
                                    </div>
                                </div>

                                {(marketingSource && (action === 'venda' || action === 'retorno')) && (
                                    <div className="animate-in fade-in slide-in-from-top-2 sm:col-span-2">
                                        <label className="text-[10px] font-bold text-blue-800 mb-1 block ml-1">Valor da Venda (R$)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-blue-400" />
                                            <input type="number" value={saleValue} onChange={e => setSaleValue(e.target.value)} placeholder="0,00"
                                                className="w-full pl-9 pr-3 py-1.5 border-2 border-blue-200 rounded-lg text-stone-800 font-bold text-base focus:border-blue-500 focus:outline-none" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SERVIÇO RÁPIDO */}
                        {category === 'servico' && (
                            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-stone-200 animate-in fade-in slide-in-from-bottom-2 duration-300 sm:col-span-2">
                                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Tipo de Serviço</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                    {SERVICE_TYPES.map(opt => (
                                        <button key={opt.id} onClick={() => setType(opt.id)}
                                            className={`py-2 px-1 rounded-lg border-2 text-[10px] font-bold text-center transition-all flex items-center justify-center gap-1.5 ${type === opt.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-stone-300'}`}>
                                            <opt.icon className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* WHATSAPP */}
                        {category === 'whatsapp' && (
                            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-stone-200 animate-in fade-in slide-in-from-bottom-2 duration-300 sm:col-span-2">
                                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Tipo de Contato</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                                    {WHATSAPP_ACTIONS.map(opt => (
                                        <button key={opt.id} onClick={() => setType(opt.id)}
                                            className={`py-1.5 px-1 rounded-lg border-2 text-[9px] font-bold text-center transition-all flex items-center justify-center gap-1 ${type === opt.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-stone-300'}`}>
                                            <opt.icon className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Notas ou observações (opcional)..."
                                    rows={2}
                                    className="w-full p-2 border-2 border-stone-100 bg-stone-50 rounded-lg text-stone-800 text-xs focus:border-stone-300 focus:bg-white focus:outline-none resize-none"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-2.5 bg-orange-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-orange-500/20 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-600/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 mt-1 shrink-0 sm:col-span-2"
                        >
                            {saving ? 'Salvando...' : <><Save className="w-3.5 h-3.5" /> Salvar Alterações</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}




function SettingsModal({ config, onClose, onUpdateConfig, onClearToday, currentStore }) {
    const [activeTab, setActiveTab] = useState('staff');
    const [newStaffName, setNewStaffName] = useState("");
    const [confirmDeleteStaff, setConfirmDeleteStaff] = useState(null);
    const [confirmClearToday, setConfirmClearToday] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [managerPass, setManagerPass] = useState(config.managerPassword);
    const [tcPass, setTcPass] = useState(config.stores.TC.password);
    const [sgsPass, setSgsPass] = useState(config.stores.SGS.password);

    const store = config.stores[currentStore];

    const handleAddStaff = () => {
        if (newStaffName.trim()) {
            const updatedStaff = [...store.staff, { name: newStaffName.trim(), active: true }];
            const updatedStore = { ...store, staff: updatedStaff };
            const newConfig = { ...config, stores: { ...config.stores, [currentStore]: updatedStore } };
            onUpdateConfig(newConfig);
            setNewStaffName("");
        }
    };

    const handleToggleStaffActive = (nameToToggle) => {
        const updatedStaff = store.staff.map(s =>
            s.name === nameToToggle ? { ...s, active: !s.active } : s
        );
        const updatedStore = { ...store, staff: updatedStaff };
        const newConfig = { ...config, stores: { ...config.stores, [currentStore]: updatedStore } };
        onUpdateConfig(newConfig);
    };

    const confirmRemoveStaff = (nameToRemove) => {
        const updatedStaff = store.staff.filter(s => s.name !== nameToRemove);
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

    const handleGenerateData = async () => {
        const confirmed = window.confirm("ATENÇÃO: Isso vai gerar dados fictícios no banco de dados ATUAL. Use apenas se estiver testando em um ambiente seguro. Deseja continuar?");
        if (!confirmed) return;

        setIsGenerating(true);
        try {
            const count = await generateMockData(config);
            alert(`${count} registros fictícios gerados para este mês!`);
            onClose();
        } catch (error) {
            console.error("Error generating data:", error);
            alert("Erro ao gerar dados.");
        } finally {
            setIsGenerating(false);
        }
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
                                {store.staff.map(s => (
                                    <div key={s.name} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg border border-stone-100">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleToggleStaffActive(s.name)}
                                                className={`w-9 h-5 rounded-full relative transition-colors duration-200 outline-none ${s.active ? 'bg-green-500' : 'bg-stone-300'}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${s.active ? 'translate-x-[1.125rem]' : 'translate-x-0.5'}`} />
                                            </button>
                                            <span className={`font-bold text-sm ${s.active ? 'text-stone-700' : 'text-stone-400'}`}>{s.name}</span>
                                        </div>
                                        {confirmDeleteStaff === s.name ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => confirmRemoveStaff(s.name)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Sim</button>
                                                <button onClick={() => setConfirmDeleteStaff(null)} className="text-xs bg-stone-300 text-stone-700 px-2 py-1 rounded">Não</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmDeleteStaff(s.name)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-5">

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

// --- Sub-Componente: Tooltip Customizado ---
const CustomEfficiencyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-stone-200 shadow-xl rounded-lg z-50">
                <p className="font-bold text-stone-800 text-xs mb-1">{label} ({data.store})</p>
                <div className="space-y-1">
                    <p className="text-[10px] text-orange-700 font-bold">
                        Cliente: {data.rateCli}% <span className="font-normal text-stone-500">({data.vendaCli} vds / {data.valCli ? data.valCli.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0'})</span>
                    </p>
                    <p className="text-[10px] text-stone-600 font-bold">
                        Novo: {data.rateNew}% <span className="font-normal text-stone-500">({data.vendaNew} vds / {data.valNew ? data.valNew.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0'})</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

// --- Componentes de Dados ---

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


// --- Tela de Tendências Comparativas ---
function TrendsScreen({ data, storeConfig }) {
    const yearlyData = useMemo(() => {
        const months = {};

        data.forEach(item => {
            const d = item.date;
            if (!d || typeof d.getFullYear !== 'function') return;
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            if (!months[key]) {
                months[key] = {
                    key,
                    name: `${d.toLocaleString('pt-BR', { month: 'short' })}/${d.getFullYear().toString().substr(2)}`,
                    TC_vendas: 0, TC_orcamentos: 0, TC_novosClientes: 0, TC_atendimentos: 0, TC_servicos: 0, TC_volumeTotal: 0, TC_retornos_only: 0,
                    SGS_vendas: 0, SGS_orcamentos: 0, SGS_novosClientes: 0, SGS_atendimentos: 0, SGS_servicos: 0, SGS_volumeTotal: 0, SGS_retornos_only: 0,
                    TC_daysWithSales: new Set(),
                    SGS_daysWithSales: new Set()
                };
            }

            if (item.category === 'comercial') {
                const storePrefix = item.store === 'TC' ? 'TC_' : 'SGS_';
                months[key][storePrefix + 'atendimentos']++;

                // Vendas e Orçamentos
                if (item.action === 'venda' || item.action === 'retorno') {
                    months[key][storePrefix + 'vendas']++;
                    months[key][storePrefix + 'daysWithSales'].add(d.getDate());
                }
                if (item.action === 'orcamento') months[key][storePrefix + 'orcamentos']++;
                if (item.action === 'retorno') months[key][storePrefix + 'retornos_only']++;

                // Novos clientes: vendas ou retornos com clientType === 'nao_cliente'
                if ((item.action === 'venda' || item.action === 'retorno') && item.clientType === 'nao_cliente') {
                    months[key][storePrefix + 'novosClientes']++;
                }
            } else if (item.category === 'servico') {
                const storePrefix = item.store === 'TC' ? 'TC_' : 'SGS_';
                months[key][storePrefix + 'servicos']++;
            }

            // Volume Total (Interações globais)
            const globalPrefix = item.store === 'TC' ? 'TC_' : 'SGS_';
            months[key][globalPrefix + 'volumeTotal']++;
        });

        return Object.values(months)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(m => ({
                ...m,
                TC_media_vendas: m.TC_daysWithSales.size > 0 ? Number((m.TC_vendas / m.TC_daysWithSales.size).toFixed(1)) : 0,
                SGS_media_vendas: m.SGS_daysWithSales.size > 0 ? Number((m.SGS_vendas / m.SGS_daysWithSales.size).toFixed(1)) : 0,
                TC_taxa: m.TC_vendas + m.TC_orcamentos > 0 ? Math.round((m.TC_vendas / (m.TC_vendas + m.TC_orcamentos)) * 100) : 0,
                SGS_taxa: m.SGS_vendas + m.SGS_orcamentos > 0 ? Math.round((m.SGS_vendas / (m.SGS_vendas + m.SGS_orcamentos)) * 100) : 0,
                TC_eficiencia: m.TC_atendimentos > 0 ? Math.round((m.TC_vendas / m.TC_atendimentos) * 100) : 0,
                SGS_eficiencia: m.SGS_atendimentos > 0 ? Math.round((m.SGS_vendas / m.SGS_atendimentos) * 100) : 0,
                TC_convTotal: (m.TC_atendimentos + m.TC_servicos) > 0 ? Math.round((m.TC_vendas / (m.TC_atendimentos + m.TC_servicos)) * 100) : 0,
                SGS_convTotal: (m.SGS_atendimentos + m.SGS_servicos) > 0 ? Math.round((m.SGS_vendas / (m.SGS_atendimentos + m.SGS_servicos)) * 100) : 0,
                TC_convOrc: m.TC_orcamentos > 0 ? Math.round((m.TC_retornos_only / m.TC_orcamentos) * 100) : 0,
                SGS_convOrc: m.SGS_orcamentos > 0 ? Math.round((m.SGS_retornos_only / m.SGS_orcamentos) * 100) : 0,
                TC_vendasCli: m.TC_vendas - m.TC_novosClientes,
                SGS_vendasCli: m.SGS_vendas - m.SGS_novosClientes,
                TC_vendasCliPerc: m.TC_vendas > 0 ? Math.round(((m.TC_vendas - m.TC_novosClientes) / m.TC_vendas) * 100) : 0,
                TC_novosClientesPerc: m.TC_vendas > 0 ? Math.round((m.TC_novosClientes / m.TC_vendas) * 100) : 0,
                SGS_vendasCliPerc: m.SGS_vendas > 0 ? Math.round(((m.SGS_vendas - m.SGS_novosClientes) / m.SGS_vendas) * 100) : 0,
                SGS_novosClientesPerc: m.SGS_vendas > 0 ? Math.round((m.SGS_novosClientes / m.SGS_vendas) * 100) : 0
            }));
    }, [data]);

    const peakAnalysis = useMemo(() => {
        const daysOfWeek = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
        const stats = {
            TC: {
                weekday: Array(7).fill(0),
                salesWeekday: Array(7).fill(0),
                manha: 0, tarde: 0,
                weeks: {}
            },
            SGS: {
                weekday: Array(7).fill(0),
                salesWeekday: Array(7).fill(0),
                manha: 0, tarde: 0,
                weeks: {}
            }
        };

        data.forEach(item => {
            if (!item.date) return;
            const store = item.store === 'TC' ? 'TC' : 'SGS';
            const dayNum = item.date.getDate();

            // Weekday
            const dayIdx = item.date.getDay();
            if (dayIdx === 0) return; // Skip Sunday
            stats[store].weekday[dayIdx - 1]++;

            // Vendas por dia da semana
            if (item.category === 'comercial' && (item.action === 'venda' || item.action === 'retorno')) {
                stats[store].salesWeekday[dayIdx - 1]++;
            }

            // Period (manha/tarde)
            const period = item.period || (item.date.getHours() < 12 ? 'manha' : 'tarde');
            if (period === 'manha') stats[store].manha++;
            else stats[store].tarde++;

            // Weekly
            const weekKey = `${item.date.getFullYear()}-W${Math.ceil((item.date.getDate() + new Date(item.date.getFullYear(), item.date.getMonth(), 1).getDay()) / 7)}`;
            stats[store].weeks[weekKey] = (stats[store].weeks[weekKey] || 0) + 1;

            // Day of Month Volume
            if (!stats[store].dayOfMonth) stats[store].dayOfMonth = {};
            stats[store].dayOfMonth[dayNum] = (stats[store].dayOfMonth[dayNum] || 0) + 1;

            // Vendas por dia do mês (Tendência Histórica)
            if (!stats[store].salesDayOfMonth) stats[store].salesDayOfMonth = {};
            if (item.category === 'comercial' && (item.action === 'venda' || item.action === 'retorno')) {
                stats[store].salesDayOfMonth[dayNum] = (stats[store].salesDayOfMonth[dayNum] || 0) + 1;
            }
        });

        const getPeakDay = (store) => {
            const max = Math.max(...stats[store].weekday);
            const min = Math.min(...stats[store].weekday.filter(v => v > 0) || [0]);
            return {
                peak: daysOfWeek[stats[store].weekday.indexOf(max)],
                quiet: daysOfWeek[stats[store].weekday.indexOf(min)]
            };
        };

        const getPeakWeek = (store) => {
            const weeks = Object.entries(stats[store].weeks);
            if (weeks.length === 0) return { peakWeek: '-', quietWeek: '-' };
            weeks.sort((a, b) => b[1] - a[1]);
            return {
                peakWeek: weeks[0][0].split('-W')[1] + "ª Semana",
                quietWeek: weeks[weeks.length - 1][0].split('-W')[1] + "ª Semana"
            };
        };

        const getVolumeDay = (store) => {
            const days = Object.entries(stats[store].dayOfMonth || {});
            if (days.length === 0) return { peakVolDay: '-', quietVolDay: '-' };
            days.sort((a, b) => b[1] - a[1]);
            return {
                peakVolDay: `Dia ${days[0][0]}`,
                quietVolDay: `Dia ${days[days.length - 1][0]}`
            };
        };

        const getPeakSalesDay = (store) => {
            const flow = stats[store].weekday;
            const sales = stats[store].salesWeekday;
            
            // Calcula eficiência por dia
            const efficiencies = flow.map((f, idx) => f > 0 ? (sales[idx] / f) : 0);
            
            const maxEff = Math.max(...efficiencies);
            // Filtra dias com fluxo para pegar a menor eficiência real
            const validEfficiencies = efficiencies.filter((eff, idx) => flow[idx] > 0);
            const minEff = validEfficiencies.length > 0 ? Math.min(...validEfficiencies) : 0;

            return {
                peakSalesDay: daysOfWeek[efficiencies.indexOf(maxEff)],
                quietSalesDay: daysOfWeek[efficiencies.indexOf(minEff)]
            };
        };

        const formatWeekdayData = () => {
            return daysOfWeek.map((label, idx) => ({
                name: label,
                TC: stats.TC.weekday[idx],
                TC_salesPerc: stats.TC.weekday[idx] > 0 ? Math.round((stats.TC.salesWeekday[idx] / stats.TC.weekday[idx]) * 100) : 0,
                SGS: stats.SGS.weekday[idx],
                SGS_salesPerc: stats.SGS.weekday[idx] > 0 ? Math.round((stats.SGS.salesWeekday[idx] / stats.SGS.weekday[idx]) * 100) : 0
            }));
        };

        const salesTrendData = Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            return {
                day,
                TC: stats.TC.salesDayOfMonth?.[day] || 0,
                SGS: stats.SGS.salesDayOfMonth?.[day] || 0
            };
        });

        return {
            weekdayData: formatWeekdayData(),
            TC: {
                ...getPeakDay('TC'),
                ...getPeakWeek('TC'),
                ...getVolumeDay('TC'),
                ...getPeakSalesDay('TC'),
                manhaPerc: stats.TC.manha + stats.TC.tarde > 0 ? Math.round((stats.TC.manha / (stats.TC.manha + stats.TC.tarde)) * 100) : 0,
                tardePerc: stats.TC.manha + stats.TC.tarde > 0 ? Math.round((stats.TC.tarde / (stats.TC.manha + stats.TC.tarde)) * 100) : 0,
            },
            SGS: {
                ...getPeakDay('SGS'),
                ...getPeakWeek('SGS'),
                ...getVolumeDay('SGS'),
                ...getPeakSalesDay('SGS'),
                manhaPerc: stats.SGS.manha + stats.SGS.tarde > 0 ? Math.round((stats.SGS.manha / (stats.SGS.manha + stats.SGS.tarde)) * 100) : 0,
                tardePerc: stats.SGS.manha + stats.SGS.tarde > 0 ? Math.round((stats.SGS.tarde / (stats.SGS.manha + stats.SGS.tarde)) * 100) : 0,
            },
            salesTrendData,
            maxSalesTrendTC: Math.max(...salesTrendData.map(d => d.TC), 0),
            maxSalesTrendSGS: Math.max(...salesTrendData.map(d => d.SGS), 0)
        };
    }, [data]);

    if (yearlyData.length < 2) {
        return (
            <div className="p-6 text-center text-stone-500 mt-20">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Dados insuficientes para gerar tendências comparativas.</p>
                <p className="text-sm">São necessários dados de pelo menos dois meses diferentes.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 mb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-orange-600" /> Tendências
                    </h2>
                    <span className="text-[10px] sm:text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full uppercase self-start sm:self-auto">
                        Análise Comparativa • TC vs SGS
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                {/* Legenda Geral */}
                <div className="flex justify-center gap-6 bg-white p-3 rounded-xl shadow-sm border border-stone-100 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#16a34a]"></div>
                        <span className="text-sm font-bold text-stone-700">TC</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
                        <span className="text-sm font-bold text-stone-700">SGS</span>
                    </div>
                </div>

                {/* Grafico 1 */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Evolução de Vendas</h4>
                    </div>
                    <div className="px-1 py-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyData} margin={{ top: 25, right: 0, left: -15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10 }} />

                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Line type="monotone" dataKey="TC_vendas" name="TC" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                                    <LabelList 
                                        dataKey="TC_vendas" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.SGS_vendas || 0;
                                            const isHigher = value >= otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#16a34a" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                                <Line type="monotone" dataKey="SGS_vendas" name="SGS" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                                    <LabelList 
                                        dataKey="SGS_vendas" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.TC_vendas || 0;
                                            const isHigher = value > otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafico 2 - Media Vendas */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Média de Vendas por Dia</h4>
                    </div>
                    <div className="px-1 py-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyData} margin={{ top: 25, right: 0, left: -15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10 }} />

                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Line type="monotone" dataKey="TC_media_vendas" name="TC" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                                    <LabelList 
                                        dataKey="TC_media_vendas" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.SGS_media_vendas || 0;
                                            const isHigher = value >= otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#16a34a" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                                <Line type="monotone" dataKey="SGS_media_vendas" name="SGS" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                                    <LabelList 
                                        dataKey="SGS_media_vendas" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.TC_media_vendas || 0;
                                            const isHigher = value > otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                {/* Grafico 3 */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Novos Clientes por Mês</h4>
                        <p className="text-[10px] text-stone-400 mt-1">Vendas concluídas com clientes que chegaram pela 1ª vez</p>
                    </div>
                    <div className="px-1 py-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyData} margin={{ top: 35, right: 0, left: -10, bottom: 5 }} barCategoryGap="35%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />

                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Bar dataKey="TC_novosClientes" name="TC" fill="#16a34a" stackId="a" radius={[0, 0, 0, 0]} barSize={12}>
                                    <LabelList dataKey="TC_novosClientes" position="top" style={{ fill: '#16a34a', fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                                <Bar dataKey="SGS_novosClientes" name="SGS" fill="#dc2626" stackId="b" radius={[4, 4, 0, 0]} barSize={12}>
                                    <LabelList dataKey="SGS_novosClientes" position="top" style={{ fill: '#dc2626', fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafico 4: % de Novos Clientes */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">% de Novos Clientes</h4>
                        <p className="text-[10px] text-stone-400 mt-1">Percentual de novos clientes sobre o total de vendas</p>
                    </div>
                    <div className="px-1 py-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyData} margin={{ top: 25, right: 0, left: -15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />

                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Line type="monotone" dataKey="TC_novosClientesPerc" name="TC" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                                    <LabelList 
                                        dataKey="TC_novosClientesPerc" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.SGS_novosClientesPerc || 0;
                                            const isHigher = value >= otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#16a34a" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}%
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                                <Line type="monotone" dataKey="SGS_novosClientesPerc" name="SGS" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                                    <LabelList 
                                        dataKey="SGS_novosClientesPerc" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.TC_novosClientesPerc || 0;
                                            const isHigher = value > otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}%
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                {/* Novos Gráficos Solicitados */}


                {/* Grafico 5: Picos de Movimento (Volume Total) - AGORA FLUXO TOTAL DE PESSOAS */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Fluxo Total de Pessoas</h4>
                        <p className="text-[10px] text-stone-400 mt-1">Pessoas que passaram na ótica este mês</p>
                    </div>
                    <div className="px-1 py-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={yearlyData} margin={{ top: 25, right: 0, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorTC" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSGS" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10 }} />

                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Area type="monotone" dataKey="TC_volumeTotal" name="TC" stroke="#16a34a" fillOpacity={1} fill="url(#colorTC)">
                                    <LabelList 
                                        dataKey="TC_volumeTotal" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.SGS_volumeTotal || 0;
                                            const isHigher = value >= otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#16a34a" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}
                                                </text>
                                            );
                                        }}
                                    />
                                </Area>
                                <Area type="monotone" dataKey="SGS_volumeTotal" name="SGS" stroke="#dc2626" fillOpacity={1} fill="url(#colorSGS)">
                                    <LabelList 
                                        dataKey="SGS_volumeTotal" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.TC_volumeTotal || 0;
                                            const isHigher = value > otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}
                                                </text>
                                            );
                                        }}
                                    />
                                </Area>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafico 6: Conversão de Vendas (Eficiência) */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Conversão de Vendas (Eficiência)</h4>
                        <p className="text-[10px] text-stone-400 mt-1">Vendas / Total de Atendimentos</p>
                    </div>
                    <div className="px-1 py-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyData} margin={{ top: 25, right: 0, left: -15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />

                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Line type="monotone" dataKey="TC_eficiencia" name="TC" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }}>
                                    <LabelList 
                                        dataKey="TC_eficiencia" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.SGS_eficiencia || 0;
                                            const isHigher = value >= otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#16a34a" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}%
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                                <Line type="monotone" dataKey="SGS_eficiencia" name="SGS" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }}>
                                    <LabelList 
                                        dataKey="SGS_eficiencia" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.TC_eficiencia || 0;
                                            const isHigher = value > otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}%
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafico NOVO: Conversão Total */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Conversão Total</h4>
                        <p className="text-[10px] text-stone-400 mt-1">Vendas / Total de Entradas (Comercial + Serviço)</p>
                    </div>
                    <div className="px-1 py-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyData} margin={{ top: 25, right: 0, left: -15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />

                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Line type="monotone" dataKey="TC_convTotal" name="TC" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }}>
                                    <LabelList 
                                        dataKey="TC_convTotal" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.SGS_convTotal || 0;
                                            const isHigher = value >= otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#16a34a" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}%
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                                <Line type="monotone" dataKey="SGS_convTotal" name="SGS" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }}>
                                    <LabelList 
                                        dataKey="SGS_convTotal" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.TC_convTotal || 0;
                                            const isHigher = value > otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}%
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafico 7: Conversão de Orçamentos (Retorno) */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Conversão de Orçamentos (Retorno)</h4>
                        <p className="text-[10px] text-stone-400 mt-1">Retornos / Total de Orçamentos</p>
                    </div>
                    <div className="px-1 py-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyData} margin={{ top: 25, right: 0, left: -15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />

                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Line type="monotone" dataKey="TC_convOrc" name="TC" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }}>
                                    <LabelList 
                                        dataKey="TC_convOrc" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.SGS_convOrc || 0;
                                            const isHigher = value >= otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#16a34a" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}%
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                                <Line type="monotone" dataKey="SGS_convOrc" name="SGS" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }}>
                                    <LabelList 
                                        dataKey="SGS_convOrc" 
                                        content={(props) => {
                                            const { x, y, value, index } = props;
                                            const otherVal = yearlyData[index]?.TC_convOrc || 0;
                                            const isHigher = value > otherVal;
                                            return (
                                                <text x={x} y={y} dy={isHigher ? -12 : 22} fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                    {value}%
                                                </text>
                                            );
                                        }}
                                    />
                                </Line>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico NOVO: Tendência de Vendas por Dia do Mês */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Movimento de vendas ao longo do mês</h4>
                        <p className="text-[10px] text-stone-400 mt-1">Tendência histórica de vendas por dia do mês (acumulado)</p>
                    </div>
                    <div className="px-1 py-4 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={peakAnalysis.salesTrendData} 
                                margin={{ top: 10, right: 0, left: 0, bottom: 45 }}
                                barGap={0}
                                barCategoryGap="70%"
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis 
                                    dataKey="day" 
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    tick={(props) => {
                                        const { x, y, payload } = props;
                                        const dayData = peakAnalysis.salesTrendData.find(d => d.day === payload.value);
                                        const isPeakTC = dayData?.TC === peakAnalysis.maxSalesTrendTC && peakAnalysis.maxSalesTrendTC > 0;
                                        const isPeakSGS = dayData?.SGS === peakAnalysis.maxSalesTrendSGS && peakAnalysis.maxSalesTrendSGS > 0;
                                        
                                        return (
                                            <g transform={`translate(${x},${y})`}>
                                                {/* Dia do Mês */}
                                                <text x={0} y={0} dy={14} textAnchor="middle" fill="#78716c" fontSize={7} fontWeight="bold">{payload.value}</text>
                                                
                                                {/* Vendas TC com destaque se for pico */}
                                                <g transform="translate(0, 22)">
                                                    {isPeakTC && (
                                                        <rect x={-7} y={-5} width={14} height={9} fill="#16a34a" rx={1} />
                                                    )}
                                                    <text x={0} y={1.5} textAnchor="middle" fill={isPeakTC ? "white" : "#16a34a"} fontSize={7} fontWeight="900">
                                                        {dayData?.TC ?? 0}
                                                    </text>
                                                </g>

                                                {/* Vendas SGS com destaque se for pico */}
                                                <g transform="translate(0, 34)">
                                                    {isPeakSGS && (
                                                        <rect x={-7} y={-5} width={14} height={9} fill="#dc2626" rx={1} />
                                                    )}
                                                    <text x={0} y={1.5} textAnchor="middle" fill={isPeakSGS ? "white" : "#dc2626"} fontSize={7} fontWeight="900">
                                                        {dayData?.SGS ?? 0}
                                                    </text>
                                                </g>
                                            </g>
                                        );
                                    }}
                                />
                                <YAxis tick={{ fontSize: 9 }} hide />
                                <Bar dataKey="TC" name="TC" fill="#16a34a" radius={0} barSize={3} isAnimationActive={false} />
                                <Bar dataKey="SGS" name="SGS" fill="#dc2626" radius={0} barSize={3} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafico 8: Origem das Vendas (cliente x nao cliente) */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Origem das Vendas (Cliente x Novo)</h4>
                        <p className="text-[10px] text-stone-400 mt-1">Comparativo de vendas para clientes antigos vs novos</p>
                    </div>
                    <div className="px-1 py-4 h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyData} margin={{ top: 45, right: 0, left: -10, bottom: 5 }} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} padding={{ left: 10, right: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />

                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                {/* TC Stack */}
                                <Bar dataKey="TC_vendasCli" name="TC (Cliente)" fill="#16a34a" stackId="tc" barSize={30}>
                                    <LabelList dataKey="TC_vendasCliPerc" position="center" formatter={(v) => v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                                </Bar>
                                <Bar dataKey="TC_novosClientes" name="TC (Novo)" fill="#4ade80" stackId="tc" barSize={30}>
                                    <LabelList dataKey="TC_novosClientesPerc" position="top" formatter={(v) => v > 0 ? `${v}%` : ''} style={{ fill: '#16a34a', fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                                {/* SGS Stack */}
                                <Bar dataKey="SGS_vendasCli" name="SGS (Cliente)" fill="#dc2626" stackId="sgs" barSize={30}>
                                    <LabelList dataKey="SGS_vendasCliPerc" position="center" formatter={(v) => v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                                </Bar>
                                <Bar dataKey="SGS_novosClientes" name="SGS (Novo)" fill="#f87171" stackId="sgs" barSize={30}>
                                    <LabelList dataKey="SGS_novosClientesPerc" position="top" formatter={(v) => v > 0 ? `${v}%` : ''} style={{ fill: '#dc2626', fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- SEÇÃO DE PICOS: ORGANIZADA EM LINHAS --- */}
                <div className="pt-8 border-t border-stone-100">
                    <h3 className="text-xl font-black text-stone-800 uppercase pl-3 border-l-4 border-orange-500 mb-8 flex items-center gap-3">
                        <Clock className="w-6 h-6 text-orange-500" /> Picos de Movimento
                    </h3>

                    <div className="flex flex-col gap-8">
                        {/* Linha 1: Gráfico de Dia da Semana (Largura Total) */}
                        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                            <div className="p-5 border-b border-stone-100 bg-stone-50/30">
                                <h4 className="font-bold text-stone-700 text-sm uppercase">Fluxo por Dia da Semana e Eficiência em Vendas</h4>
                            </div>
                            <div className="px-1 py-6 h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={peakAnalysis.weekdayData} margin={{ top: 20, right: 0, left: 0, bottom: 95 }} barGap={0} barCategoryGap="70%">
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                const dayData = peakAnalysis.weekdayData.find(d => d.name === payload.value);
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text x={0} y={0} dy={16} textAnchor="middle" fill="#44403c" fontSize={10} fontWeight="bold">{payload.value}</text>
                                                        
                                                        {/* Fluxo */}
                                                        <text x={0} y={0} dy={32} textAnchor="middle" fill="#16a34a" fontSize={11} fontWeight="900">{dayData?.TC}</text>
                                                        <text x={0} y={0} dy={46} textAnchor="middle" fill="#dc2626" fontSize={11} fontWeight="900">{dayData?.SGS}</text>
                                                        
                                                        {/* Separador ou Espaço */}
                                                        <text x={0} y={0} dy={58} textAnchor="middle" fill="#e7e5e4" fontSize={8} fontWeight="bold">———</text>

                                                        {/* Porcentagens de Venda */}
                                                        <text x={0} y={0} dy={72} textAnchor="middle" fill="#166534" fontSize={10} fontWeight="black">{dayData?.TC_salesPerc}%</text>
                                                        <text x={0} y={0} dy={86} textAnchor="middle" fill="#991b1b" fontSize={10} fontWeight="black">{dayData?.SGS_salesPerc}%</text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <YAxis tick={{ fontSize: 9 }} hide />

                                        <Bar dataKey="TC" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={12} />
                                        <Bar dataKey="SGS" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Linha 2: Métricas Consolidadas (Card Único Comparativo) */}
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 flex flex-col gap-4">
                            {/* Header do Card Compacto */}
                            <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                                <h4 className="font-bold text-stone-700 text-[10px] uppercase tracking-wider">Picos: <span className="text-green-600">TC</span> / <span className="text-red-600">SGS</span></h4>
                                <TrendingUp className="w-4 h-4 text-stone-300" />
                            </div>

                            {/* Grid de Métricas Compactas */}
                            <div className="grid grid-cols-1 gap-3">
                                {/* Manhã vs Tarde */}
                                <div className="p-3 bg-stone-50/50 rounded-2xl border border-stone-100 flex flex-col gap-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <Clock className="w-3 h-3 text-stone-400" />
                                        <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest text-center">Concentração por Período (Manhã / Tarde)</p>
                                    </div>
                                    <div className="flex justify-around items-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] font-black text-green-600 uppercase mb-1">TC</span>
                                            <div className="flex gap-1">
                                                <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-black">{peakAnalysis.TC.manhaPerc}%</span>
                                                <span className="text-stone-300">/</span>
                                                <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded font-black">{peakAnalysis.TC.tardePerc}%</span>
                                            </div>
                                        </div>
                                        <div className="w-[1px] h-8 bg-stone-200"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] font-black text-red-600 uppercase mb-1">SGS</span>
                                            <div className="flex gap-1">
                                                <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-black">{peakAnalysis.SGS.manhaPerc}%</span>
                                                <span className="text-stone-300">/</span>
                                                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black">{peakAnalysis.SGS.tardePerc}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Demais Métricas em Linha Única */}
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="p-3 bg-stone-50/50 rounded-xl border border-stone-100 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-orange-500" />
                                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Dia de Pico</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-green-700">{peakAnalysis.TC.peak}</span>
                                            <span className="text-stone-300 font-light">/</span>
                                            <span className="text-xs font-black text-red-700">{peakAnalysis.SGS.peak}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-stone-50/50 rounded-xl border border-stone-100 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-orange-500" />
                                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Semana de Pico</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-green-700">{peakAnalysis.TC.peakWeek.split(' ')[0]}</span>
                                            <span className="text-stone-300 font-light">/</span>
                                            <span className="text-xs font-black text-red-700">{peakAnalysis.SGS.peakWeek.split(' ')[0]}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-stone-50/50 rounded-xl border border-stone-100 flex justify-between items-center opacity-75">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-3 h-3 text-orange-400" />
                                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Semana mais vazia</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-green-600/70">{peakAnalysis.TC.quietWeek.split(' ')[0]}</span>
                                            <span className="text-stone-300 font-light">/</span>
                                            <span className="text-xs font-bold text-red-600/70">{peakAnalysis.SGS.quietWeek.split(' ')[0]}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-stone-50/50 rounded-xl border border-stone-100 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Dia (Mais Vendas)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-green-700">{peakAnalysis.TC.peakVolDay}</span>
                                            <span className="text-stone-300 font-light">/</span>
                                            <span className="text-xs font-black text-red-700">{peakAnalysis.SGS.peakVolDay}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-stone-50/50 rounded-xl border border-stone-100 flex justify-between items-center opacity-75">
                                        <div className="flex items-center gap-2">
                                            <ArrowDownRight className="w-3 h-3 text-red-400" />
                                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Dia (Menos Vendas)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-green-600/70">{peakAnalysis.TC.quietVolDay}</span>
                                            <span className="text-stone-300 font-light">/</span>
                                            <span className="text-xs font-bold text-red-600/70">{peakAnalysis.SGS.quietVolDay}</span>
                                        </div>
                                    </div>

                                    {/* NOVAS MÉTRICAS DE DIA DA SEMANA DE VENDAS */}
                                    <div className="p-3 bg-stone-50/50 rounded-xl border border-stone-100 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                            <span className="text-[8px] font-bold text-stone-400 uppercase tracking-tight">Dia da Semana com mais vendas</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-green-700">{peakAnalysis.TC.peakSalesDay}</span>
                                            <span className="text-stone-300 font-light">/</span>
                                            <span className="text-xs font-black text-red-700">{peakAnalysis.SGS.peakSalesDay}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-stone-50/50 rounded-xl border border-stone-100 flex justify-between items-center opacity-75">
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="w-3 h-3 text-red-500" />
                                            <span className="text-[8px] font-bold text-stone-400 uppercase tracking-tight">Dia da semana com menos vendas</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-green-600/70">{peakAnalysis.TC.quietSalesDay}</span>
                                            <span className="text-stone-300 font-light">/</span>
                                            <span className="text-xs font-bold text-red-600/70">{peakAnalysis.SGS.quietSalesDay}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Telas de Lançamento e Dashboard ---

// ... (LoginScreen e EntryScreen sem alteração de lógica, apenas reutilização)

function LoginScreen({ config, onLogin, isConfigLoaded }) {
    const [selectedStore, setSelectedStore] = useState('TC');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (!isConfigLoaded) return;

        const storePass = config.stores[selectedStore].password;
        const managerPass = config.managerPassword;

        // Se a senha do banco for nula, o sistema barra qualquer senha temporariamente
        if (!storePass || !managerPass) {
            setError('Chaves bloqueadas ou carregando...');
            setTimeout(() => setError(''), 2000);
            return;
        }

        if (password === storePass) {
            onLogin(selectedStore, false);
        } else if (password === managerPass) {
            onLogin(selectedStore, true);
        } else {
            setError('Senha incorreta');
            setPassword('');
            setTimeout(() => setError(''), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-orange-600 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-orange-500 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-orange-700 rounded-full opacity-50 blur-3xl"></div>

            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600 shadow-inner">
                        <Eye className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight">Ótica Precisão</h1>
                    <p className="text-stone-500 text-sm font-medium">App de Gestão</p>
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
                        disabled={!isConfigLoaded}
                        className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all ${isConfigLoaded ? 'bg-orange-600 shadow-orange-200 hover:bg-orange-700' : 'bg-stone-300 shadow-none cursor-not-allowed hidden'}`}
                    >
                        {isConfigLoaded ? 'Entrar' : 'Aguarde...'}
                    </button>
                    {!isConfigLoaded && (
                        <div className="w-full flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-stone-300">Ótica Precisão</p>
                </div>
            </div>
        </div>
    );
}

function EntryScreen({ storeData, onSave, entries, onDelete, onUpdate }) {
    const [step, setStep] = useState('menu');
    const [tempData, setTempData] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [marketingSource, setMarketingSource] = useState(null);
    const [saleValue, setSaleValue] = useState('');
    const [entryToEdit, setEntryToEdit] = useState(null);
    const _today = new Date();
    const [histYear, setHistYear] = useState(_today.getFullYear());
    const [histMonth, setHistMonth] = useState(_today.getMonth());
    const [histDay, setHistDay] = useState(_today.getDate());
    const [histAddMode, setHistAddMode] = useState(false);

    const resetFlow = () => {
        setStep('menu');
        setTempData({});
        setMarketingSource(null);
        setSaleValue('');
    };

    const handleBack = () => {
        if (step === 'commercial_client') {
            setStep('commercial_action');
        } else if (step === 'commercial_action') {
            setStep('commercial_attendant');
        } else if (step === 'commercial_attendant') {
            resetFlow();
        } else {
            resetFlow();
        }
    };

    // --- LOGIC FOR DAILY LOG ---
    const todayEntries = useMemo(() => {
        if (!entries) return [];
        const today = new Date();
        return entries.filter(e => {
            const d = e.date;
            return d.getDate() === today.getDate() &&
                d.getMonth() === today.getMonth() &&
                d.getFullYear() === today.getFullYear();
        }).sort((a, b) => b.date - a.date);
    }, [entries]);

    // Função chamada ao clicar no lápis, abre o modal
    const handleEditClick = (entry) => {
        setEntryToEdit(entry);
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
                        <CircleCheck className="w-12 h-12 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-xl text-stone-800 text-center">{successMsg}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            {/* RENDERIZA O MODAL SE TIVER ITEM SELECIONADO */}
            {entryToEdit && (
                <EditEntryModal
                    entry={entryToEdit}
                    onClose={() => setEntryToEdit(null)}
                    onSave={onUpdate}
                    storeData={storeData}
                />
            )}

            {/* MODAL DE ADIÇÃO PARA O HISTÓRICO */}
            {histAddMode && (
                <EditEntryModal
                    entry={{ date: new Date(histYear, histMonth, histDay, new Date().getHours(), new Date().getMinutes()) }}
                    isNew={true}
                    onClose={() => setHistAddMode(false)}
                    onSave={async (_, updateData) => {
                        const h = new Date().getHours();
                        const m = new Date().getMinutes();
                        const targetDate = new Date(histYear, histMonth, histDay, h, m);
                        const period = h < 12 ? 'manha' : 'tarde';
                        await onSave({
                            ...updateData,
                            date: targetDate,
                            period
                        });
                        setHistAddMode(false);
                    }}
                    storeData={storeData}
                />
            )}

            {step !== 'menu' && (
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-stone-800 tracking-tight">
                            {step === 'whatsapp_menu' ? 'Controle WhatsApp' :
                                step === 'daily_log' ? 'Movimento de Hoje' : 'Comercial'}
                        </h2>
                        <p className="text-sm text-stone-500">
                            {step === 'daily_log' ? 'Conferência e Ajustes' : 'Registro de dados'}
                        </p>
                    </div>
                    <button onClick={handleBack} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-full hover:bg-red-100 uppercase tracking-wide transition-colors">Voltar</button>
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
                                    <CirclePlus className="w-6 h-6 text-green-700" />
                                </div>
                            </button>

                            {/* NOVO BOTÃO: MOVIMENTO DE HOJE (LOG) */}
                            <button
                                onClick={() => setStep('daily_log')}
                                className={`w-full bg-orange-50 border-2 border-orange-200 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:bg-orange-100 hover:border-orange-500 transition-all active:scale-95`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                        <List className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-lg text-orange-900">Movimento de Hoje</h3>
                                        <p className="text-xs text-orange-700 font-medium">Conferir lançamentos do dia</p>
                                    </div>
                                </div>
                                <div className="bg-white/50 p-2 rounded-full">
                                    <Eye className="w-6 h-6 text-orange-700" />
                                </div>
                            </button>

                            {/* BOTÃO: HISTÓRICO COMPLETO */}
                            <button
                                onClick={() => setStep('history')}
                                className="w-full bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:bg-orange-100 hover:border-orange-500 transition-all active:scale-95 mt-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-base text-orange-900 leading-tight">Histórico Completo</h3>
                                        <p className="text-[10px] text-orange-700 font-medium">Todos os registros</p>
                                    </div>
                                </div>
                                <Eye className="w-5 h-5 text-orange-400 group-hover:text-orange-600 transition-colors" />
                            </button>
                        </div>
                    </section>
                </>
            )}


            {/* TELA DE HISTÓRICO COMPLETO COM CALENDÁRIO */}
            {step === 'history' && (() => {
                const fullMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                const monthEntries = entries.filter(e => {
                    const d = e.date;
                    return d.getFullYear() === histYear && d.getMonth() === histMonth;
                });
                const daysWithEntries = [...new Set(monthEntries.map(e => e.date.getDate()))].sort((a, b) => a - b);
                const dayEntries = monthEntries.filter(e => e.date.getDate() === histDay).sort((a, b) => b.date - a.date);
                const daysInMonth = new Date(histYear, histMonth + 1, 0).getDate();
                const firstDayOfWeek = new Date(histYear, histMonth, 1).getDay();
                const todayDate = new Date();

                return (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 pb-20">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-stone-800 text-lg">Histórico</h2>
                                <p className="text-xs text-stone-500">Selecione mês e dia</p>
                            </div>
                            <button onClick={() => { setStep('menu'); setHistDay(todayDate.getDate()); setHistMonth(todayDate.getMonth()); setHistYear(todayDate.getFullYear()); }} className="text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg font-bold hover:bg-stone-200">← Voltar</button>
                        </div>

                        {/* Calendário */}
                        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <button onClick={() => { if (histMonth === 0) { setHistMonth(11); setHistYear(h => h - 1); } else setHistMonth(h => h - 1); }} className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl font-bold text-lg">‹</button>
                                <span className="font-bold text-stone-800">{fullMonths[histMonth]} {histYear}</span>
                                <button onClick={() => { if (histMonth === 11) { setHistMonth(0); setHistYear(h => h + 1); } else setHistMonth(h => h + 1); }} className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl font-bold text-lg">›</button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                    <div key={i} className="text-center text-[9px] font-bold text-stone-400">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={'e' + i} />)}
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                    const hasDot = daysWithEntries.includes(day);
                                    const isToday = day === todayDate.getDate() && histMonth === todayDate.getMonth() && histYear === todayDate.getFullYear();
                                    const isSel = day === histDay;
                                    return (
                                        <button key={day} onClick={() => setHistDay(day)}
                                            className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all ${isSel ? 'bg-orange-500 text-white shadow-md scale-105' : isToday ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'text-stone-700 hover:bg-stone-100'}`}>
                                            {day}
                                            {hasDot && <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-orange-400'}`}></span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Lista do dia selecionado */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-stone-700 text-sm">{histDay} de {fullMonths[histMonth]}</h3>
                                <button
                                    onClick={() => setHistAddMode(true)}
                                    className="flex items-center gap-1.5 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
                                >
                                    + Adicionar
                                </button>
                            </div>

                            {dayEntries.length === 0 ? (
                                <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center">
                                    <p className="text-stone-400 text-sm italic">Nenhum registro neste dia</p>
                                    <button onClick={() => setHistAddMode(true)} className="mt-3 text-xs text-orange-600 font-bold underline">Adicionar agora →</button>
                                </div>
                            ) : (
                                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-stone-100">
                                    {dayEntries.map(entry => (
                                        <div key={entry.id} className="p-3 flex justify-between items-start hover:bg-stone-50 transition-colors">
                                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 flex items-center gap-1 ${entry.category === 'comercial' ? (entry.action === 'venda' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700') : entry.category === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                                                        {entry.category === 'comercial' ? (
                                                            entry.action === 'venda' ? <DollarSign className="w-2.5 h-2.5" /> :
                                                                entry.action === 'orcamento' ? <FileText className="w-2.5 h-2.5" /> :
                                                                    entry.action === 'retorno' ? <Calendar className="w-2.5 h-2.5" /> : null
                                                        ) : entry.category === 'whatsapp' ? <MessageCircle className="w-2.5 h-2.5" /> : <Wrench className="w-2.5 h-2.5" />}
                                                        {entry.category === 'comercial' ? (entry.action || 'Comercial') : entry.category === 'whatsapp' ? 'WhatsApp' : (entry.type || 'Serviço')}
                                                    </span>
                                                    <span className="text-[10px] text-stone-400">{entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {entry.saleValue > 0 && (
                                                        <span className="text-xs font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                            R$ {typeof entry.saleValue === 'number' ? entry.saleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : entry.saleValue}
                                                        </span>
                                                    )}
                                                </div>
                                                {entry.attendant && <span className="text-xs text-stone-500 flex items-center gap-1"><User className="w-3 h-3" /> {entry.attendant}</span>}
                                                {entry.clientType && (
                                                    <span className="text-xs text-stone-500 capitalize flex items-center gap-1">
                                                        {entry.clientType === 'cliente' ? <Check className="w-3 h-3 text-green-500" /> : <Sparkles className="w-3 h-3 text-blue-500" />}
                                                        {entry.clientType === 'cliente' ? 'Já Cliente' : 'Novo Cliente'}
                                                    </span>
                                                )}
                                                {entry.marketingSource && <span className="text-xs text-stone-500 flex items-center gap-1"><Megaphone className="w-3 h-3 text-blue-400" /> {entry.marketingSource}</span>}
                                                {entry.message && <span className="text-xs text-stone-500 truncate flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {entry.message}</span>}
                                            </div>
                                            <div className="flex items-center gap-1 ml-2 shrink-0">
                                                <button onClick={() => setEntryToEdit(entry)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => onDelete(entry.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* TELA DE LOG DIÁRIO */}
            {step === 'daily_log' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-20">

                    {/* Seção Comercial por Atendente */}
                    <div>
                        <h3 className="text-sm font-bold text-stone-500 uppercase mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Atendimentos Comerciais
                        </h3>

                        {storeData.staff.map(s => {
                            const attendantName = typeof s === 'string' ? s : s.name;
                            const staffEntries = todayEntries.filter(e => e.category === 'comercial' && e.attendant === attendantName);
                            if (staffEntries.length === 0) return null;

                            return (
                                <div key={attendantName} className="mb-4 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-stone-50 p-3 border-b border-stone-200 flex justify-between items-center">
                                        <span className="font-bold text-stone-700">{attendantName}</span>
                                        <span className="text-xs bg-stone-200 px-2 py-1 rounded-full font-bold text-stone-600">{staffEntries.length} itens</span>
                                    </div>
                                    <div className="divide-y divide-stone-100">
                                        {staffEntries.map(entry => (
                                            <div key={entry.id} className="p-3 flex justify-between items-center hover:bg-stone-50 transition-colors">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold px-1.5 rounded uppercase flex items-center gap- recruiting ${entry.action === 'venda' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                            {entry.action === 'venda' ? <DollarSign className="w-3 h-3 mr-1" /> :
                                                                entry.action === 'orcamento' ? <FileText className="w-3 h-3 mr-1" /> :
                                                                    entry.action === 'retorno' ? <Calendar className="w-3 h-3 mr-1" /> : null}
                                                            {entry.action}
                                                        </span>
                                                        <span className="text-xs text-stone-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {(entry.action === 'venda' || entry.action === 'retorno') && (
                                                        <span className="text-sm font-bold text-stone-800 mt-1">
                                                            {entry.saleValue ? entry.saleValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                                                        </span>
                                                    )}
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {entry.clientType && <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">{entry.clientType === 'cliente' ? 'Já Cliente' : 'Novo Cli.'}</span>}
                                                        {entry.marketingSource && <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase">{entry.marketingSource}</span>}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Botão de Edição Completa */}
                                                    <button
                                                        onClick={() => handleEditClick(entry)}
                                                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                        title="Editar Detalhes"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => onDelete(entry.id)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Excluir Registro"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {todayEntries.filter(e => e.category === 'comercial').length === 0 && (
                            <p className="text-center text-sm text-stone-400 py-4 italic">Nenhum atendimento comercial hoje.</p>
                        )}
                    </div>

                    {/* Seção Outros (Serviços e WhatsApp) */}
                    <div>
                        <h3 className="text-sm font-bold text-stone-500 uppercase mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Serviços & WhatsApp (Geral)
                        </h3>

                        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm divide-y divide-stone-100">
                            {todayEntries.filter(e => e.category !== 'comercial').map(entry => (
                                <div key={entry.id} className="p-3 flex justify-between items-center hover:bg-stone-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${entry.category === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                                            {entry.category === 'whatsapp' ? <MessageCircle className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-stone-700 capitalize">
                                                {entry.type ? entry.type.replace('_', ' ') : 'Serviço'}
                                            </span>
                                            <span className="text-xs text-stone-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditClick(entry)}
                                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Editar Detalhes"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(entry.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Excluir Registro"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {todayEntries.filter(e => e.category !== 'comercial').length === 0 && (
                                <p className="text-center text-sm text-stone-400 py-4 italic">Nenhum serviço ou mensagem hoje.</p>
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* TELA DE OPÇÕES DO WHATSAPP */}
            {step === 'whatsapp_menu' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
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
                                <CircleCheck className="w-5 h-5 opacity-50" />
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {step === 'commercial_attendant' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <p className="text-lg font-bold text-stone-700">Atendente:</p>
                    <div className="grid grid-cols-1 gap-4">
                        {storeData.staff.filter(s => s.active).map((s) => (
                            <Button
                                key={s.name}
                                variant="secondary"
                                className="justify-start text-xl py-6 px-6 border-l-8 border-l-transparent hover:border-l-orange-600 hover:bg-orange-50 transition-all shadow-sm"
                                onClick={() => { setTempData({ ...tempData, attendant: s.name }); setStep('commercial_action'); }}
                            >
                                <div className={`w-12 h-12 rounded-full ${THEME.primaryLight} flex items-center justify-center text-lg font-black ${THEME.accentText} mr-4 shadow-inner`}>
                                    {s.name.substring(0, 2).toUpperCase()}
                                </div>
                                {s.name}
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
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${THEME.primaryLight}`}>
                            {(() => {
                                const action = COMMERCIAL_ACTIONS.find(a => a.id === tempData.action);
                                const ActionIcon = action?.icon || FileText;
                                return <ActionIcon className={`w-6 h-6 ${THEME.accentText}`} />;
                            })()}
                        </div>
                        <h2 className="text-2xl font-black text-stone-800 uppercase tracking-tight">
                            {COMMERCIAL_ACTIONS.find(a => a.id === tempData.action)?.label || 'Lançamento'}
                        </h2>
                    </div>

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
                                <MessageCircle className="w-4 h-4" /> WhatsApp
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
                        <p className="text-base font-bold text-stone-700 mb-3">Perfil do Cliente:</p>
                        <div className="grid grid-cols-2 gap-3">
                            {CLIENT_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => handleCommercialFlow({ ...tempData, clientType: type.id })}
                                    className="py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:border-orange-400"
                                >
                                    {type.id === 'cliente' ? <UserCheck className="w-5 h-5 text-orange-600" /> : <UserPlus className="w-5 h-5 text-orange-600" />}
                                    <span className="text-sm font-bold tracking-tight">{type.label}</span>
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

        // Inicializa atendentes para hoje: mostra se ativo OU se tiver dado hoje
        storeData.staff.forEach(s => {
            const name = typeof s === 'string' ? s : s.name;
            const isActive = typeof s === 'string' ? true : s.active;
            const hasData = todayData.some(e => e.attendant === name);

            if (isActive || hasData) {
                stats.attendantBreakdown[name] = { atendimentos: 0, vendas: 0, orcamentos: 0, retornos: 0 };
            }
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

                // AJUSTE GLOBAL: Retorno conta como venda hoje
                if (entry.action === 'venda' || entry.action === 'retorno') {
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
                    // AJUSTE GLOBAL: Retorno conta como venda no breakdown
                    if (entry.action === 'venda' || entry.action === 'retorno') stats.attendantBreakdown[entry.attendant].vendas++;
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
            weekdayCounts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
            dateCounts: {},
            dateSales: {},
            weekCounts: {}
        };

        storeData.staff.forEach(s => {
            const name = typeof s === 'string' ? s : s.name;
            const isActive = typeof s === 'string' ? true : s.active;
            const hasData = filteredData.some(e => e.attendant === name);

            if (isActive || hasData) {
                metrics.attendantStats[name] = {
                    orcCli: 0, orcNew: 0,
                    vendaCli: 0, vendaNew: 0,
                    retornoCli: 0, retornoNew: 0,
                    totalGeralAtendente: 0
                };
            }
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

            if (entry.category === 'comercial' && (entry.action === 'venda' || entry.action === 'retorno')) {
                metrics.dateSales[dayOfMonth] = (metrics.dateSales[dayOfMonth] || 0) + 1;
            }

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

                    // AJUSTE GLOBAL: Retorno conta como venda para totais mensais
                    if (entry.action === 'venda' || entry.action === 'retorno') {
                        metrics.totalVendas++;
                        if (entry.clientType === 'cliente') { metrics.vendaCliente++; staff.vendaCli++; }
                        else { metrics.vendaNaoCliente++; staff.vendaNew++; }
                    }

                    // IMPORTANTE: Manter contagem independente de orçamentos e retornos
                    if (entry.action === 'orcamento') {
                        metrics.totalOrcamentos++;
                        if (entry.clientType === 'cliente') { metrics.orcamentoCliente++; staff.orcCli++; }
                        else { metrics.orcamentoNaoCliente++; staff.orcNew++; }
                    }

                    if (entry.action === 'retorno') {
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

    // --- DADOS SEMANA ATUAL (Novo Requisito) ---
    const currentWeekChartData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDay = today.getDay();

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const counts = {
            0: { movement: 0, sales: 0 },
            1: { movement: 0, sales: 0 },
            2: { movement: 0, sales: 0 },
            3: { movement: 0, sales: 0 },
            4: { movement: 0, sales: 0 },
            5: { movement: 0, sales: 0 },
            6: { movement: 0, sales: 0 }
        };

        data.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= startOfWeek && entryDate <= endOfWeek) {
                const day = entryDate.getDay();
                counts[day].movement++;
                if (entry.category === 'comercial' && (entry.action === 'venda' || entry.action === 'retorno')) {
                    counts[day].sales++;
                }
            }
        });

        const daysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        return Object.entries(counts).map(([day, data]) => ({
            name: daysMap[day],
            movement: data.movement,
            sales: data.sales
        }));
    }, [data]); // Depende de 'data' completa, não filtrada

    const COLORS_PIE = ['#f97316', '#fbbf24', '#ef4444', '#78716c'];
    const COLORS_COM = ['#ea580c', '#fbbf24', '#22c55e'];

    // Formatador auxiliar para data da semana
    const formatWeekKey = (key) => {
        if (!key) return '-';
        const [y, m, d] = key.split('-');
        return `Semana de ${d}/${m}`;
    }

    // 1. Serviços Balcão
    const serviceData = Object.entries(stats.serviceBreakdown).map(([key, value]) => ({
        name: SERVICE_TYPES.find(t => t.id === key)?.label || key,
        value,
        percent: ((value / stats.totalServicos) * 100).toFixed(0),
        todayCount: todayStats.serviceBreakdown[key] || 0
    })).sort((a, b) => b.value - a.value);

    // 2. Serviços Comerciais
    const commercialData = Object.entries(stats.commercialBreakdown).map(([key, value]) => ({
        name: COMMERCIAL_ACTIONS.find(t => t.id === key)?.label || key,
        value,
        percent: ((value / stats.totalComercial) * 100).toFixed(0),
        todayCount: todayStats.commercialBreakdown[key] || 0
    })).sort((a, b) => b.value - a.value);

    // Dados do WhatsApp para o Gráfico
    const whatsappData = Object.entries(stats.whatsappBreakdown).map(([key, value]) => ({
        name: WHATSAPP_ACTIONS.find(w => w.id === key)?.label || key,
        value: value,
        percent: stats.totalWhatsapp > 0 ? ((value / stats.totalWhatsapp) * 100).toFixed(0) : 0,
        todayCount: todayStats.whatsappBreakdown[key] || 0
    })).sort((a, b) => b.value - a.value);

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
    }).sort((a, b) => b.monthTotal - a.monthTotal);

    // 4. Conversão Vendas DETALHADA
    const conversionList = Object.entries(stats.attendantStats).map(([name, s]) => {
        const totalSales = s.vendaCli + s.vendaNew;

        // ALTERAÇÃO: Cálculo de Eficiência Real (% de Conversão)
        // Fórmula: (Total de Vendas / Total de Atendimentos Comerciais) * 100
        const totalInteractions = s.totalGeralAtendente; // Inclui Venda, Orçamento, Retorno
        const generalConversion = totalInteractions > 0 ? Math.round((totalSales / totalInteractions) * 100) : 0;

        // 2. & 3. Share das vendas (Cliente vs Não Cliente)
        const shareCli = totalSales > 0 ? Math.round((s.vendaCli / totalSales) * 100) : 0;
        const shareNew = totalSales > 0 ? Math.round((s.vendaNew / totalSales) * 100) : 0;

        return {
            name: name.split(' ')[0],
            generalConversion,
            shareCli,
            shareNew
        }
    }).sort((a, b) => b.generalConversion - a.generalConversion);

    // NOVO: Tabela Detalhes Orçamento
    const budgetDetailsList = Object.entries(stats.attendantStats).map(([name, s]) => {
        const totalOrc = s.orcCli + s.orcNew;
        return {
            name: name.split(' ')[0],
            totalOrc,
            orcCli: s.orcCli,
            orcNew: s.orcNew
        }
    }).sort((a, b) => b.totalOrc - a.totalOrc);

    // 6. Retornos vs Orçamentos
    const returnAnalysisData = [
        {
            name: 'Total Mês',
            Orçamentos: stats.totalOrcamentos,
            Retornos: stats.totalRetornos,
            Taxa: stats.totalOrcamentos > 0 ? Math.round((stats.totalRetornos / stats.totalOrcamentos) * 100) : 0
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
            Taxa: todayStats.orcamentos > 0 ? Math.round((todayStats.retornos / todayStats.orcamentos) * 100) : 0
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
    }).sort((a, b) => b.Orçamentos - a.Orçamentos);

    const salesCompositionData = [
        { name: 'Venda Cliente', value: stats.vendaCliente, fill: '#166534' },
        { name: 'Venda Não Cliente', value: stats.vendaNaoCliente, fill: '#fb923c' },
    ];

    const weekDayData = Object.entries(stats.weekdayCounts).map(([day, count]) => ({
        name: daysMap[day].substring(0, 3),
        value: count
    }));

    const weekData = Object.entries(stats.weekCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, count]) => {
            const [y, m, d] = key.split('-');
            return {
                name: `${d}/${m}`,
                value: count
            };
        });

    const attendantFunnelList = storeData.staff
        .map(s => {
            const name = typeof s === 'string' ? s : s.name;
            const monthStats = stats.attendantStats[name] || { totalGeralAtendente: 0, orcCli: 0, orcNew: 0, vendaCli: 0, vendaNew: 0 };
            const todayStatsAtt = todayStats.attendantBreakdown[name] || { atendimentos: 0, orcamentos: 0, vendas: 0 };
            return {
                name: name.split(' ')[0],
                fullName: name,
                active: typeof s === 'string' ? true : s.active,
                month: {
                    atend: monthStats.totalGeralAtendente,
                    orc: monthStats.orcCli + monthStats.orcNew,
                    venda: monthStats.vendaCli + monthStats.vendaNew
                },
                today: todayStatsAtt
            };
        })
        .filter(item => {
            // Regra: Mostra se estiver ativo OU se tiver algum dado no mês
            return item.active || item.month.atend > 0;
        });

    const totalHoje = todayStats.servicos + todayStats.atendimentos;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-6">
            {/* Header e Filtro */}
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 mb-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-orange-600" /> Análise {storeData.name}
                    </h2>
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full uppercase whitespace-nowrap">
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
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_PIE[index % COLORS_PIE.length] }}></div>
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
                                    <span className="text-lg font-black text-orange-600">{todayStats.atendimentos}</span>
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
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_COM[index % COLORS_COM.length] }}></div>
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
                        <Card className="p-4">
                            <div className="flex gap-4 items-center">
                                <div className="h-40 w-1/3">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={salesCompositionData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">
                                                {salesCompositionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />)}
                                            </Pie>

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
                                        <div className="text-center font-bold text-stone-800">{stats.totalVendas > 0 ? Math.round((stats.vendaCliente / stats.totalVendas) * 100) : 0}%</div>
                                        <div className="text-center font-bold text-orange-600 bg-orange-50 rounded">{todayStats.vendaCliente}</div>
                                    </div>
                                    <div className="grid grid-cols-5 text-xs items-center pb-1">
                                        <div className="col-span-2 text-stone-600 font-bold">Não Cliente</div>
                                        <div className="text-center">{stats.vendaNaoCliente}</div>
                                        <div className="text-center font-bold text-stone-800">{stats.totalVendas > 0 ? Math.round((stats.vendaNaoCliente / stats.totalVendas) * 100) : 0}%</div>
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
                            <div className="grid grid-cols-4 text-[9px] font-bold text-stone-400 border-b border-stone-100 pb-2 mb-2 text-center">
                                <div className="text-left">Atendente</div>
                                <div>% Conv. Total</div>
                                <div>% Cli</div>
                                <div>% Novo</div>
                            </div>
                            <div className="space-y-2">
                                {conversionList.map((staff) => (
                                    <div key={staff.name} className="grid grid-cols-4 text-xs items-center text-center border-b border-stone-50 pb-1">
                                        <div className="text-left font-bold text-stone-700">{staff.name}</div>
                                        <div className="font-black text-stone-800 bg-stone-100 rounded py-1">{staff.generalConversion}%</div>
                                        <div className="font-bold text-orange-700 bg-orange-50 rounded py-1">{staff.shareCli}%</div>
                                        <div className="font-bold text-blue-600 bg-blue-50 rounded py-1">{staff.shareNew}%</div>
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
                                        <ComposedChart data={returnAnalysisData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />

                                            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                            <Bar dataKey="Orçamentos" fill="#a8a29e" barSize={20} radius={[4, 4, 0, 0]}>
                                                <LabelList dataKey="Orçamentos" position="top" style={{ fill: '#78716c', fontSize: '9px', fontWeight: 'bold' }} />
                                            </Bar>
                                            <Bar dataKey="Retornos" fill="#16a34a" barSize={20} radius={[4, 4, 0, 0]}>
                                                <LabelList dataKey="Retornos" position="top" style={{ fill: '#166534', fontSize: '9px', fontWeight: 'bold' }} />
                                            </Bar>
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-around mt-2 text-xs font-bold text-stone-600 bg-white p-2 rounded-lg border border-stone-100 shadow-sm">
                                    <span>Taxa Mês: <span className="text-orange-600 text-sm">{returnAnalysisData[0].Taxa}%</span></span>
                                    <span>Taxa Hoje: <span className="text-orange-600 text-sm">{returnAnalysisData[2].Taxa}%</span></span>
                                </div>
                            </div>

                            {/* NOVA TABELA: DETALHES DE ORÇAMENTOS POR ATENDENTE */}
                            <div className="mt-6">
                                <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Detalhes de Orçamentos por Atendente</p>
                                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                                    <div className="grid grid-cols-4 text-[9px] font-bold text-stone-500 bg-stone-50 p-2 text-center border-b border-stone-100">
                                        <div className="text-left">Atendente</div>
                                        <div>Total</div>
                                        <div>Cliente</div>
                                        <div>Não Cli.</div>
                                    </div>
                                    {budgetDetailsList.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-4 text-xs p-2 items-center text-center border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                                            <div className="text-left font-bold text-stone-700">{item.name}</div>
                                            <div className="font-black text-stone-800">{item.totalOrc}</div>
                                            <div className="text-orange-700 font-medium bg-orange-50/50 rounded px-1">{item.orcCli}</div>
                                            <div className="text-stone-600 font-medium bg-stone-100/50 rounded px-1">{item.orcNew}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Eficiência por Equipe (Conversão)</p>
                                <div className="h-64 bg-white rounded-xl border border-stone-200 p-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={attendantReturnChartData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e7e5e4" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#44403c' }} axisLine={false} tickLine={false} />

                                            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />

                                            <Bar dataKey="Orçamentos" fill="#d6d3d1" barSize={12} radius={[0, 4, 4, 0]}>
                                                <LabelList dataKey="Orçamentos" position="right" style={{ fill: '#78716c', fontSize: '9px' }} />
                                            </Bar>

                                            <Bar dataKey="Retornos" fill="#f97316" barSize={12} radius={[0, 4, 4, 0]}>
                                                <LabelList dataKey="Retornos" position="right" style={{ fill: '#166534', fontSize: '9px', fontWeight: 'bold' }} />
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
                                        <span className="text-sm font-black text-stone-800">R$ {stats.marketingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-blue-200 bg-blue-100/50 rounded-lg p-3">
                                        <h5 className="text-xs font-bold text-blue-900 uppercase mb-3 flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4" /> Mensagens WhatsApp
                                        </h5>

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
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-stone-800">Dia {stats.busiestDate[0]}</span>
                                        <span className="text-[10px] text-stone-500">{stats.busiestDate[1]} atendimentos</span>
                                        <span className="text-[10px] font-bold text-green-700">{stats.dateSales[stats.busiestDate[0]] || 0} vendas</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-red-500 uppercase">Data + Vazia</p>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-stone-800">Dia {stats.quietestDate[0]}</span>
                                        <span className="text-[10px] text-stone-500">{stats.quietestDate[1]} atendimentos</span>
                                        <span className="text-[10px] font-bold text-red-700">{stats.dateSales[stats.quietestDate[0]] || 0} vendas</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 border-t border-stone-200 pt-4">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Sun className="w-4 h-4 text-orange-500" />
                                        <span className="text-xs font-bold text-stone-700 uppercase">Manhã</span>
                                    </div>
                                    <div className="text-xs text-stone-600">
                                        <span className="font-bold">{stats.morningCount}</span> <span className="text-[10px]">({stats.totalAtendimentosGeral > 0 ? Math.round((stats.morningCount / stats.totalAtendimentosGeral) * 100) : 0}%)</span>
                                    </div>
                                    <div className="text-[10px] text-stone-400 mt-1">
                                        Hoje: <span className="font-bold text-orange-600">{todayStats.morningCount}</span> ({todayStats.atendimentos > 0 ? Math.round((todayStats.morningCount / (todayStats.morningCount + todayStats.afternoonCount)) * 100) : 0}%)
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Moon className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-bold text-stone-700 uppercase">Tarde</span>
                                    </div>
                                    <div className="text-xs text-stone-600">
                                        <span className="font-bold">{stats.afternoonCount}</span> <span className="text-[10px]">({stats.totalAtendimentosGeral > 0 ? Math.round((stats.afternoonCount / stats.totalAtendimentosGeral) * 100) : 0}%)</span>
                                    </div>
                                    <div className="text-[10px] text-stone-400 mt-1">
                                        Hoje: <span className="font-bold text-blue-600">{todayStats.afternoonCount}</span> ({todayStats.atendimentos > 0 ? Math.round((todayStats.afternoonCount / (todayStats.morningCount + todayStats.afternoonCount)) * 100) : 0}%)
                                    </div>
                                </div>
                            </div>

                            {/* GRÁFICO DE BARRAS: DIAS DA SEMANA */}
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">Movimento Semana Atual (Tempo Real)</p>
                                <div className="h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={currentWeekChartData} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                            <Bar dataKey="movement" fill="#78716c" radius={[4, 4, 0, 0]}>
                                                <LabelList dataKey="movement" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#44403c' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* NOVO GRÁFICO: VENDAS SEMANA ATUAL */}
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-red-500 uppercase mb-2">Vendas Semana Atual (Tempo Real)</p>
                                <div className="h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={currentWeekChartData} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                            <Bar dataKey="sales" fill="#ef4444" radius={[4, 4, 0, 0]}>
                                                <LabelList dataKey="sales" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#991b1b' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* GRÁFICO DE BARRAS: SEMANAS */}
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">Por Semana do Mês</p>
                                <div className="h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weekData} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                            <Bar dataKey="value" fill="#fb923c" radius={[4, 4, 0, 0]}>
                                                <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#166534' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>

                        {/* NOVO QUADRO: FLUXO TOTAL DE PESSOAS (Substitui "Total de atendimentos mês") */}
                        <Card className="p-5 border border-stone-200">
                            <h4 className="font-extrabold text-stone-800 text-lg uppercase leading-none">Fluxo Total de Pessoas</h4>
                            <p className="text-xs text-stone-400 font-medium mb-4">Pessoas que passaram na ótica este mês</p>

                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <span className="text-5xl font-black text-stone-800 tracking-tighter block">{stats.totalServicos + stats.totalComercial}</span>
                                    <span className="text-xs font-bold text-stone-500 uppercase">Mês Atual</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-orange-600 tracking-tighter block">{totalHoje}</span>
                                    <span className="text-xs font-bold text-orange-400 uppercase flex items-center justify-end gap-1"><Zap className="w-3 h-3" /> Hoje</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Bloco Serviços Rápidos */}
                                <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-100">
                                        <Wrench className="w-4 h-4 text-stone-600" />
                                        <h5 className="font-bold text-stone-700 text-sm uppercase">Serviços Rápidos</h5>
                                    </div>
                                    <div className="grid grid-cols-3 text-center divide-x divide-stone-200">
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Total Mês</p>
                                            <p className="text-lg font-black text-stone-800">{stats.totalServicos}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Hoje</p>
                                            <p className="text-lg font-black text-stone-800">{todayStats.servicos}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Média/Dia</p>
                                            <p className="text-lg font-black text-stone-800">{stats.mediaDiariaServicos}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bloco Serviços Comerciais */}
                                <div className="border border-orange-200 rounded-xl p-3 bg-orange-50/30">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-orange-100">
                                        <Users className="w-4 h-4 text-orange-600" />
                                        <h5 className="font-bold text-orange-800 text-sm uppercase">Serviços Comerciais</h5>
                                    </div>
                                    <div className="grid grid-cols-3 text-center divide-x divide-orange-100">
                                        <div>
                                            <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Total Mês</p>
                                            <p className="text-lg font-black text-orange-700">{stats.totalComercial}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Hoje</p>
                                            <p className="text-lg font-black text-orange-700">{todayStats.atendimentos}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Média/Dia</p>
                                            <p className="text-lg font-black text-orange-700">{stats.mediaDiariaTotal}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <InsightsPanel stats={stats} />

                </div>
            )}
        </div>
    );
}

// ... (Rest of the code: ComparisonScreen, App Main Component, etc.)
// ... (Including ComparisonScreen and App component as defined in the previous complete version)

function ComparisonScreen({ data }) {
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

    const dailyCompData = useMemo(() => {
        if (!selectedMonth) return [];
        const [year, month] = selectedMonth.split('-').map(Number);
        const now = new Date();
        const isCurrentMonth = now.getFullYear() === year && now.getMonth() === (month - 1);
        const lastDay = isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate();

        const daily = Array.from({ length: lastDay }, (_, i) => ({
            day: i + 1,
            TC_sales: 0,
            SGS_sales: 0,
            TC_returns: 0,
            SGS_returns: 0,
            total_sales: 0,
            total_returns: 0
        }));

        data.forEach(item => {
            const d = item.date;
            if (!d || typeof d.getFullYear !== 'function') return;
            if (d.getFullYear() === year && (d.getMonth() + 1) === month) {
                const day = d.getDate();
                if (day <= lastDay) {
                    const store = item.store;
                    if (item.category === 'comercial') {
                        if (item.action === 'venda' || item.action === 'retorno') {
                            daily[day - 1][`${store}_sales`]++;
                            daily[day - 1].total_sales++;
                        }
                        if (item.action === 'retorno') {
                            daily[day - 1][`${store}_returns`]++;
                            daily[day - 1].total_returns++;
                        }
                    }
                }
            }
        });

        return daily;
    }, [data, selectedMonth]);

    const dailyMetrics = useMemo(() => {
        if (dailyCompData.length === 0) return null;

        const getStoreMetrics = (store) => {
            const salesKey = `${store}_sales`;
            const returnsKey = `${store}_returns`;

            const salesSorted = [...dailyCompData].sort((a, b) => b[salesKey] - a[salesKey]);
            const salesMinSorted = [...dailyCompData].sort((a, b) => a[salesKey] - b[salesKey]);

            const returnsSorted = [...dailyCompData].sort((a, b) => b[returnsKey] - a[returnsKey]);
            const returnsMinSorted = [...dailyCompData].sort((a, b) => a[returnsKey] - b[returnsKey]);

            return {
                maxSalesDay: salesSorted[0][salesKey] > 0 ? salesSorted[0].day : '-',
                maxSalesVal: salesSorted[0][salesKey],
                minSalesDay: salesMinSorted[0].day,
                minSalesVal: salesMinSorted[0][salesKey],
                maxReturnsDay: returnsSorted[0][returnsKey] > 0 ? returnsSorted[0].day : '-',
                maxReturnsVal: returnsSorted[0][returnsKey],
                minReturnsDay: returnsMinSorted[0].day,
                minReturnsVal: returnsMinSorted[0][returnsKey],
            };
        };

        return {
            TC: getStoreMetrics('TC'),
            SGS: getStoreMetrics('SGS')
        };
    }, [dailyCompData]);

    const dailyCompDataSales = useMemo(() => dailyCompData.filter(d => d.total_sales > 0), [dailyCompData]);
    const dailyCompDataReturns = useMemo(() => dailyCompData.filter(d => d.total_returns > 0), [dailyCompData]);

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

    const compStats = useMemo(() => {
        if (!selectedMonth) return null;
        const [year, month] = selectedMonth.split('-').map(Number);

        const monthData = data.filter(item => {
            const d = item.date;
            return d.getFullYear() === year && (d.getMonth() + 1) === month;
        });

        const metrics = {
            TC: {
                vendas: 0, orcamentos: 0, retornos: 0, servicos: 0, atendimentos: 0, messages: 0, msgSales: 0,
                cliSales: 0, newSales: 0,
                orcCli: 0, orcNew: 0, retCli: 0, retNew: 0,
                atendimentosCli: 0, atendimentosNew: 0,
                staff: {}
            },
            SGS: {
                vendas: 0, orcamentos: 0, retornos: 0, servicos: 0, atendimentos: 0, messages: 0, msgSales: 0,
                cliSales: 0, newSales: 0,
                orcCli: 0, orcNew: 0, retCli: 0, retNew: 0,
                atendimentosCli: 0, atendimentosNew: 0,
                staff: {}
            }
        };

        monthData.forEach(entry => {
            const store = entry.store;
            if (!metrics[store]) return;

            if (entry.category === 'servico') metrics[store].servicos++;
            if (entry.category === 'whatsapp') metrics[store].messages++;

            if (entry.category === 'comercial') {
                metrics[store].atendimentos++;
                if (entry.clientType === 'cliente') metrics[store].atendimentosCli++;
                else metrics[store].atendimentosNew++;

                if (entry.marketingSource === 'mensagem') metrics[store].msgSales++;

                // AJUSTE: Venda inclui Retorno
                if (entry.action === 'venda' || entry.action === 'retorno') {
                    metrics[store].vendas++;
                    if (entry.clientType === 'cliente') metrics[store].cliSales++;
                    else metrics[store].newSales++;
                }

                if (entry.action === 'orcamento') {
                    metrics[store].orcamentos++;
                    if (entry.clientType === 'cliente') metrics[store].orcCli++;
                    else metrics[store].orcNew++;
                }

                if (entry.action === 'retorno') {
                    metrics[store].retornos++;
                    if (entry.clientType === 'cliente') metrics[store].retCli++;
                    else metrics[store].retNew++;
                }

                if (entry.attendant) {
                    if (!metrics[store].staff[entry.attendant]) {
                        metrics[store].staff[entry.attendant] = {
                            vendaCli: 0, vendaNew: 0,
                            orcCli: 0, orcNew: 0,
                            valCli: 0, valNew: 0,
                            totalAtendimentos: 0
                        };
                    }
                    const staff = metrics[store].staff[entry.attendant];

                    staff.totalAtendimentos++;

                    // AJUSTE: Venda inclui Retorno para atendente também
                    if (entry.action === 'venda' || entry.action === 'retorno') {
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

    const salesCompData = [
        {
            name: 'Venda Cliente',
            TC: compStats.TC.vendas > 0 ? Math.round((compStats.TC.cliSales / compStats.TC.vendas) * 100) : 0,
            SGS: compStats.SGS.vendas > 0 ? Math.round((compStats.SGS.cliSales / compStats.SGS.vendas) * 100) : 0
        },
        {
            name: 'Venda Ñ Cliente',
            TC: compStats.TC.vendas > 0 ? Math.round((compStats.TC.newSales / compStats.TC.vendas) * 100) : 0,
            SGS: compStats.SGS.vendas > 0 ? Math.round((compStats.SGS.newSales / compStats.SGS.vendas) * 100) : 0
        }
    ];

    const salesByTypeCompData = [
        { name: 'Venda Cliente', TC: compStats.TC.cliSales, SGS: compStats.SGS.cliSales },
        { name: 'Venda Ñ Cliente', TC: compStats.TC.newSales, SGS: compStats.SGS.newSales }
    ];

    // AJUSTE: Gráfico de Perfil de Retornos (Share)
    const budgetProfileData = [
        {
            name: 'Conv. Cliente',
            TC: (compStats.TC.retCli + compStats.TC.retNew) > 0 ? Math.round((compStats.TC.retCli / (compStats.TC.retCli + compStats.TC.retNew)) * 100) : 0,
            SGS: (compStats.SGS.retCli + compStats.SGS.retNew) > 0 ? Math.round((compStats.SGS.retCli / (compStats.SGS.retCli + compStats.SGS.retNew)) * 100) : 0
        },
        {
            name: 'Conv. Novo',
            TC: (compStats.TC.retCli + compStats.TC.retNew) > 0 ? Math.round((compStats.TC.retNew / (compStats.TC.retCli + compStats.TC.retNew)) * 100) : 0,
            SGS: (compStats.SGS.retCli + compStats.SGS.retNew) > 0 ? Math.round((compStats.SGS.retNew / (compStats.SGS.retCli + compStats.SGS.retNew)) * 100) : 0
        }
    ];

    const quoteCompData = [
        { name: 'Orçamentos', TC: compStats.TC.orcamentos, SGS: compStats.SGS.orcamentos },
        { name: 'Retornos', TC: compStats.TC.retornos, SGS: compStats.SGS.retornos }
    ];

    const serviceCompData = [
        { name: 'Serviços Rápidos', TC: compStats.TC.servicos, SGS: compStats.SGS.servicos },
        { name: 'Comercial', TC: compStats.TC.atendimentos, SGS: compStats.SGS.atendimentos }
    ];

    const msgData = [
        { name: 'Msgs Enviadas', TC: compStats.TC.messages, SGS: compStats.SGS.messages },
        { name: 'Vendas via Msg', TC: compStats.TC.msgSales, SGS: compStats.SGS.msgSales }
    ];

    const allStaff = [];
    ['TC', 'SGS'].forEach(store => {
        Object.entries(compStats[store].staff).forEach(([name, s]) => {
            const totalSales = s.vendaCli + s.vendaNew;
            const totalInteractions = s.totalAtendimentos;

            // ALTERAÇÃO AQUI: Eficiência Real (Vendas / Atendimentos)
            const conversionEfficiency = totalInteractions > 0 ? Math.round((totalSales / totalInteractions) * 100) : 0;

            const rateCli = totalSales > 0 ? Math.round((s.vendaCli / totalSales) * 100) : 0;
            const rateNew = totalSales > 0 ? (100 - rateCli) : 0;

            allStaff.push({
                name,
                store,
                vendas: totalSales,
                atendimentos: totalInteractions,
                conversion: conversionEfficiency,
                rateCli,
                rateNew,
                valCli: s.valCli,
                valNew: s.valNew
            });
        });
    });

    const topStaffTC = allStaff.filter(s => s.store === 'TC').sort((a, b) => b.conversion - a.conversion);
    const topStaffSGS = allStaff.filter(s => s.store === 'SGS').sort((a, b) => b.conversion - a.conversion);

    const staffEfficiency = [...allStaff].sort((a, b) => b.conversion - a.conversion);

    const CustomEfficiencyTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-stone-200 shadow-xl rounded-lg z-50">
                    <p className="font-bold text-stone-800 text-xs mb-1">{label} ({data.store})</p>
                    <div className="space-y-1">
                        <p className="text-[10px] text-orange-700 font-bold">
                            Cliente: {data.rateCli}% <span className="font-normal text-stone-500">({data.vendaCli} vds / {data.valCli.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</span>
                        </p>
                        <p className="text-[10px] text-stone-600 font-bold">
                            Novo: {data.rateNew}% <span className="font-normal text-stone-500">({data.vendaNew} vds / {data.valNew.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</span>
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
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 mb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
                        <Scale className="w-6 h-6 text-orange-600" /> Comparativo Lojas
                    </h2>
                    <span className="text-[10px] sm:text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full uppercase self-start sm:self-auto">
                        Benchmarking TC vs SGS
                    </span>
                </div>

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

            {/* 1. Volume de Vendas (Novo) - Agora no Topo */}
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-stone-700 text-sm uppercase">Volume de Vendas</h4>
                    <div className="flex gap-4 text-[11px] font-black">
                        <span className="text-green-600 flex items-center gap-1.5"><div className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></div> TC</span>
                        <span className="text-red-600 flex items-center gap-1.5"><div className="w-3 h-3 bg-red-600 rounded-full shadow-sm"></div> SGS</span>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesByTypeCompData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                            <Bar dataKey="TC" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={24}>
                                <LabelList dataKey="TC" position="right" style={{ fill: '#166534', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#dc2626" radius={[0, 4, 4, 0]} barSize={24}>
                                <LabelList dataKey="SGS" position="right" style={{ fill: '#991b1b', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Análise de Diferença */}
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 gap-2">
                    {salesByTypeCompData.map(item => {
                        const tc = item.TC;
                        const sgs = item.SGS;
                        let diffText = "";
                        let colorClass = "";

                        if (sgs > 0) {
                            const diff = Math.round(((tc - sgs) / sgs) * 100);
                            if (diff > 0) {
                                diffText = `TC vendeu ${diff}% mais que SGS`;
                                colorClass = "text-green-600";
                            } else if (diff < 0) {
                                diffText = `SGS vendeu ${Math.abs(diff)}% mais que TC`;
                                colorClass = "text-red-600";
                            } else {
                                diffText = "Vendas idênticas entre as lojas";
                                colorClass = "text-stone-500";
                            }
                        } else if (tc > 0) {
                            diffText = "TC detém 100% das vendas";
                            colorClass = "text-green-600";
                        }

                        return (
                            <div key={item.name} className="flex justify-between items-center bg-stone-50 p-2 rounded-lg border border-stone-100">
                                <span className="text-[10px] font-bold text-stone-500 uppercase">{item.name}</span>
                                <span className={`text-[10px] font-black ${colorClass}`}>{diffText}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Resumo Total: Vendas */}
                <div className="mt-2 flex justify-between items-center bg-stone-100/50 p-2 rounded-lg border border-stone-200">
                    <span className="text-[10px] font-black text-stone-700 uppercase italic">Vendas Totais</span>
                    {(() => {
                        const tc = compStats.TC.vendas;
                        const sgs = compStats.SGS.vendas;
                        if (sgs > 0 && tc > 0) {
                            const diff = tc > sgs ? Math.round(((tc - sgs) / sgs) * 100) : Math.round(((sgs - tc) / tc) * 100);
                            const color = tc > sgs ? "text-green-600" : sgs > tc ? "text-red-600" : "text-stone-500";
                            const msg = tc > sgs ? `TC vendeu ${diff}% mais que SGS` : sgs > tc ? `SGS vendeu ${diff}% mais que TC` : "Mesmo volume total";
                            
                            return (
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[10px] font-extrabold text-stone-700 leading-tight">[TC: {tc} | SGS: {sgs}]</span>
                                    <span className={`text-[10px] font-black ${color} leading-tight`}>{msg}</span>
                                </div>
                            );
                        } else if (tc > 0) {
                            return (
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[10px] font-extrabold text-stone-700 leading-tight">[TC: {tc} | SGS: {sgs}]</span>
                                    <span className="text-[10px] font-black text-green-600 leading-tight">TC detém 100% das vendas</span>
                                </div>
                            );
                        } else if (sgs > 0) {
                            return (
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[10px] font-extrabold text-stone-700 leading-tight">[TC: 0 | SGS: {sgs}]</span>
                                    <span className="text-[10px] font-black text-red-600 leading-tight">SGS detém 100% das vendas</span>
                                </div>
                            );
                        }
                    })()}
                </div>

                {/* Métricas de Conversão */}
                <div className="mt-6 pt-4 border-t-2 border-dashed border-stone-200">
                    <h5 className="text-[11px] font-black text-stone-700 uppercase mb-4 flex items-center gap-2">
                        Eficiência de Conversão (%)
                    </h5>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-green-600 uppercase border-b border-green-100 pb-1">Loja TC</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-stone-500 font-bold uppercase">Total (Geral)</span>
                                <span className="text-sm font-black text-stone-800">{compStats.TC.atendimentos > 0 ? Math.round((compStats.TC.vendas / compStats.TC.atendimentos) * 100) : 0}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-stone-500 font-bold uppercase">Clientes Antigos</span>
                                <span className="text-sm font-black text-green-700">{compStats.TC.atendimentosCli > 0 ? Math.round((compStats.TC.cliSales / compStats.TC.atendimentosCli) * 100) : 0}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-stone-500 font-bold uppercase">Novos Clientes</span>
                                <span className="text-sm font-black text-stone-700">{compStats.TC.atendimentosNew > 0 ? Math.round((compStats.TC.newSales / compStats.TC.atendimentosNew) * 100) : 0}%</span>
                            </div>
                        </div>

                        <div className="space-y-3 border-l border-stone-100 pl-4">
                            <p className="text-[10px] font-bold text-red-600 uppercase border-b border-red-100 pb-1">Loja SGS</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-stone-500 font-bold uppercase">Total (Geral)</span>
                                <span className="text-sm font-black text-stone-800">{compStats.SGS.atendimentos > 0 ? Math.round((compStats.SGS.vendas / compStats.SGS.atendimentos) * 100) : 0}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-stone-500 font-bold uppercase">Clientes Antigos</span>
                                <span className="text-sm font-black text-red-700">{compStats.SGS.atendimentosCli > 0 ? Math.round((compStats.SGS.cliSales / compStats.SGS.atendimentosCli) * 100) : 0}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-stone-500 font-bold uppercase">Novos Clientes</span>
                                <span className="text-sm font-black text-stone-700">{compStats.SGS.atendimentosNew > 0 ? Math.round((compStats.SGS.newSales / compStats.SGS.atendimentosNew) * 100) : 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 5. Volume de Atendimento (Restaurado) */}
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-stone-700 text-sm uppercase">Volume de Atendimento</h4>
                    <div className="flex gap-4 text-[11px] font-black">
                        <span className="text-green-600 flex items-center gap-1.5"><div className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></div> TC</span>
                        <span className="text-red-600 flex items-center gap-1.5"><div className="w-3 h-3 bg-red-600 rounded-full shadow-sm"></div> SGS</span>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={serviceCompData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                            <Bar dataKey="TC" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={24}>
                                <LabelList dataKey="TC" position="right" style={{ fill: '#166534', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#dc2626" radius={[0, 4, 4, 0]} barSize={24}>
                                <LabelList dataKey="SGS" position="right" style={{ fill: '#991b1b', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 gap-2">
                    {serviceCompData.map(item => {
                        const tc = item.TC;
                        const sgs = item.SGS;
                        let diffText = "";
                        let colorClass = "";

                        if (sgs > 0 && tc > 0) {
                            if (tc > sgs) {
                                const diff = Math.round(((tc - sgs) / sgs) * 100);
                                diffText = `TC tem ${diff}% mais movimento que SGS`;
                                colorClass = "text-green-600";
                            } else if (sgs > tc) {
                                const diff = Math.round(((sgs - tc) / tc) * 100);
                                diffText = `SGS tem ${Math.abs(diff)}% mais movimento que TC`;
                                colorClass = "text-red-600";
                            } else {
                                diffText = "As lojas têm o mesmo movimento";
                                colorClass = "text-stone-500";
                            }
                        } else if (tc > 0) {
                            diffText = "TC tem 100% do movimento";
                            colorClass = "text-green-600";
                        } else if (sgs > 0) {
                            diffText = "SGS tem 100% do movimento";
                            colorClass = "text-red-600";
                        }

                        return (
                            <div key={item.name} className="flex justify-between items-center bg-stone-50 p-2 rounded-lg border border-stone-100">
                                <span className="text-[10px] font-bold text-stone-500 uppercase">{item.name}</span>
                                <span className={`text-[10px] font-black ${colorClass}`}>{diffText}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Resumo Total: Movimento */}
                <div className="mt-2 flex justify-between items-center bg-stone-100/50 p-2 rounded-lg border border-stone-200">
                    <span className="text-[10px] font-black text-stone-700 uppercase italic">Movimento Total</span>
                    {(() => {
                        const tc = compStats.TC.atendimentos + compStats.TC.servicos;
                        const sgs = compStats.SGS.atendimentos + compStats.SGS.servicos;
                        
                        if (tc > 0 && sgs > 0) {
                            const diff = tc > sgs ? Math.round(((tc - sgs) / sgs) * 100) : Math.round(((sgs - tc) / tc) * 100);
                            const color = tc > sgs ? "text-green-600" : sgs > tc ? "text-red-600" : "text-stone-500";
                            const msg = tc > sgs ? `TC tem ${diff}% mais que SGS` : sgs > tc ? `SGS tem ${diff}% mais que TC` : "Mesmo volume total";

                            return (
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[10px] font-extrabold text-stone-700 leading-tight">[TC: {tc} | SGS: {sgs}]</span>
                                    <span className={`text-[10px] font-black ${color} leading-tight`}>{msg}</span>
                                </div>
                            );
                        } else if (tc > 0) {
                            return (
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[10px] font-extrabold text-stone-700 leading-tight">[TC: {tc} | SGS: 0]</span>
                                    <span className="text-[10px] font-black text-green-600 leading-tight">TC detém 100% do total</span>
                                </div>
                            );
                        } else if (sgs > 0) {
                            return (
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[10px] font-extrabold text-stone-700 leading-tight">[TC: 0 | SGS: {sgs}]</span>
                                    <span className="text-[10px] font-black text-red-600 leading-tight">SGS detém 100% do total</span>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </Card>

            {/* NOVOS GRÁFICOS: QUANDO AS VENDAS ACONTECEM */}
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-stone-700 text-sm uppercase">Quando as vendas acontecem</h4>
                    <div className="flex gap-4 text-[11px] font-black">
                        <span className="text-green-600 flex items-center gap-1.5"><div className="w-2 h-2 bg-green-600 rounded-full shadow-sm"></div> TC</span>
                        <span className="text-red-600 flex items-center gap-1.5"><div className="w-2 h-2 bg-red-600 rounded-full shadow-sm"></div> SGS</span>
                    </div>
                </div>
                <div className="h-48 -mx-3">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyCompDataSales} margin={{ top: 25, right: 0, left: -25, bottom: 50 }} barGap={0} barCategoryGap="85%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                interval={0} 
                                tick={(props) => {
                                    const { x, y, payload } = props;
                                    const dayData = dailyCompDataSales.find(d => d.day === payload.value);
                                    return (
                                        <g transform={`translate(${x},${y})`}>
                                            <text x={0} y={0} dy={16} textAnchor="middle" fill="#44403c" fontSize={8} fontWeight="bold">{payload.value}</text>
                                            <text x={0} y={0} dy={28} textAnchor="middle" fill="#16a34a" fontSize={9} fontWeight="900">{dayData?.TC_sales || ''}</text>
                                            <text x={0} y={0} dy={40} textAnchor="middle" fill="#dc2626" fontSize={9} fontWeight="900">{dayData?.SGS_sales || ''}</text>
                                        </g>
                                    );
                                }}
                            />
                            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                            <Bar dataKey="TC_sales" name="TC" fill="#16a34a" radius={[1, 1, 0, 0]} barSize={4} />
                            <Bar dataKey="SGS_sales" name="SGS" fill="#dc2626" radius={[1, 1, 0, 0]} barSize={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {dailyMetrics && (
                    <div className="mt-4 flex flex-col gap-3">
                        {/* TC Metrics */}
                        <div className="grid grid-cols-2 gap-2 p-2 bg-green-50/50 rounded-xl border border-green-100">
                            <div className="flex flex-col">
                                <p className="text-[8px] font-black text-green-600 uppercase tracking-wider">dia c/ mais vendas</p>
                                <p className="text-xs font-black text-green-800">Dia {dailyMetrics.TC.maxSalesDay} <span className="text-[10px] font-bold opacity-60">({dailyMetrics.TC.maxSalesVal} vds)</span></p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-wider">dia c/ menos vendas</p>
                                <p className="text-xs font-black text-stone-600">Dia {dailyMetrics.TC.minSalesDay} <span className="text-[10px] font-bold opacity-60">({dailyMetrics.TC.minSalesVal} vds)</span></p>
                            </div>
                        </div>
                        {/* SGS Metrics */}
                        <div className="grid grid-cols-2 gap-2 p-2 bg-red-50/50 rounded-xl border border-red-100">
                            <div className="flex flex-col">
                                <p className="text-[8px] font-black text-red-600 uppercase tracking-wider">dia c/ mais vendas</p>
                                <p className="text-xs font-black text-red-800">Dia {dailyMetrics.SGS.maxSalesDay} <span className="text-[10px] font-bold opacity-60">({dailyMetrics.SGS.maxSalesVal} vds)</span></p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-wider">dia c/ menos vendas</p>
                                <p className="text-xs font-black text-stone-600">Dia {dailyMetrics.SGS.minSalesDay} <span className="text-[10px] font-bold opacity-60">({dailyMetrics.SGS.minSalesVal} vds)</span></p>
                            </div>
                        </div>
                    </div>
                )}

                {/* TABELA DE VENDAS DIA A DIA */}
                <div className="mt-4 border-t border-stone-100 pt-3 overflow-x-auto">
                    <h5 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Detalhamento Diário</h5>
                    <table className="w-fit text-left border-collapse mx-auto">
                        <thead>
                            <tr className="border-b border-stone-100">
                                <th className="py-1 pr-4 pl-2 text-[10px] font-black text-stone-500 uppercase tracking-tight">Data</th>
                                <th className="py-1 px-1.5 text-[10px] font-black text-green-600 uppercase tracking-tight text-center">TC</th>
                                <th className="py-1 px-1.5 text-[10px] font-black text-red-600 uppercase tracking-tight text-center">SGS</th>
                                <th className="py-1 px-1.5 text-[10px] font-black text-stone-700 uppercase tracking-tight text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {dailyCompDataSales.map((row) => {
                                const [year, month] = selectedMonth.split('-').map(Number);
                                const dateObj = new Date(year, month - 1, row.day);
                                const weekday = dateObj.toLocaleString('pt-BR', { weekday: 'short' }).replace('.', '');
                                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                                return (
                                    <tr key={row.day} className={`hover:bg-stone-50 transition-colors ${isWeekend ? 'bg-green-50/20' : ''}`}>
                                        <td className="py-1 pr-4 pl-2 text-[11px] font-bold text-stone-600 border-r border-stone-50">
                                            <span className="font-black text-stone-400 mr-1">{row.day}</span>
                                            <span className="text-[9px] uppercase opacity-70">({weekday})</span>
                                        </td>
                                        <td className="py-1 px-1.5 text-xs font-bold text-green-600 text-center">
                                            {row.TC_sales > 0 ? (
                                                <span className="inline-block bg-green-50 px-1.5 py-0 rounded-md border border-green-100 min-w-[20px]">{row.TC_sales}</span>
                                            ) : (
                                                <span className="opacity-20">-</span>
                                            )}
                                        </td>
                                        <td className="py-1 px-1.5 text-xs font-bold text-red-600 text-center">
                                            {row.SGS_sales > 0 ? (
                                                <span className="inline-block bg-red-50 px-1.5 py-0 rounded-md border border-red-100 min-w-[20px]">{row.SGS_sales}</span>
                                            ) : (
                                                <span className="opacity-20">-</span>
                                            )}
                                        </td>
                                        <td className="py-1 px-1.5 text-xs font-black text-stone-700 text-center">
                                            <span className="inline-block bg-stone-100 px-1.5 py-0 rounded-md border border-stone-200 min-w-[20px]">{row.total_sales}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="border-t-2 border-stone-100">
                            <tr className="bg-stone-50/50">
                                <td className="py-2 pr-4 pl-2 text-[9px] font-black text-stone-700 uppercase italic border-r border-stone-50">Totais</td>
                                <td className="py-2 px-1.5 text-[13px] font-black text-green-600 text-center">
                                    {dailyCompDataSales.reduce((acc, row) => acc + row.TC_sales, 0)}
                                </td>
                                <td className="py-2 px-1.5 text-[13px] font-black text-red-600 text-center">
                                    {dailyCompDataSales.reduce((acc, row) => acc + row.SGS_sales, 0)}
                                </td>
                                <td className="py-2 px-1.5 text-[13px] font-black text-stone-800 text-center">
                                    {dailyCompDataSales.reduce((acc, row) => acc + row.total_sales, 0)}
                                </td>
                            </tr>
                            <tr className="bg-stone-50/80 border-t border-stone-100">
                                <td className="py-1.5 pr-4 pl-2 text-[8px] font-bold text-stone-500 uppercase italic border-r border-stone-50">Média/Dia</td>
                                <td className="py-1.5 px-1.5 text-[10px] font-bold text-green-600/80 text-center">
                                    {(() => {
                                        const total = dailyCompDataSales.reduce((acc, row) => acc + row.TC_sales, 0);
                                        const days = dailyCompDataSales.filter(row => row.TC_sales > 0).length;
                                        return days > 0 ? (total / days).toFixed(1).replace('.', ',') : '-';
                                    })()}
                                </td>
                                <td className="py-1.5 px-1.5 text-[10px] font-bold text-red-600/80 text-center">
                                    {(() => {
                                        const total = dailyCompDataSales.reduce((acc, row) => acc + row.SGS_sales, 0);
                                        const days = dailyCompDataSales.filter(row => row.SGS_sales > 0).length;
                                        return days > 0 ? (total / days).toFixed(1).replace('.', ',') : '-';
                                    })()}
                                </td>
                                <td className="py-1.5 px-1.5 text-[10px] font-bold text-stone-600 text-center">
                                    {(() => {
                                        const total = dailyCompDataSales.reduce((acc, row) => acc + row.total_sales, 0);
                                        const days = dailyCompDataSales.filter(row => row.total_sales > 0).length;
                                        return days > 0 ? (total / days).toFixed(1).replace('.', ',') : '-';
                                    })()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>

            {/* NOVOS GRÁFICOS: QUANDO OS ORÇAMENTOS RETORNAM */}
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-stone-700 text-sm uppercase">Quando os orçamentos retornam</h4>
                    <div className="flex gap-4 text-[11px] font-black">
                        <span className="text-green-600 flex items-center gap-1.5"><div className="w-2 h-2 bg-green-600 rounded-full shadow-sm"></div> TC</span>
                        <span className="text-red-600 flex items-center gap-1.5"><div className="w-2 h-2 bg-red-600 rounded-full shadow-sm"></div> SGS</span>
                    </div>
                </div>
                <div className="h-48 -mx-3">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyCompDataReturns} margin={{ top: 25, right: 0, left: -25, bottom: 50 }} barGap={0} barCategoryGap="85%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                interval={0} 
                                tick={(props) => {
                                    const { x, y, payload } = props;
                                    const dayData = dailyCompDataReturns.find(d => d.day === payload.value);
                                    return (
                                        <g transform={`translate(${x},${y})`}>
                                            <text x={0} y={0} dy={16} textAnchor="middle" fill="#44403c" fontSize={8} fontWeight="bold">{payload.value}</text>
                                            <text x={0} y={0} dy={28} textAnchor="middle" fill="#16a34a" fontSize={9} fontWeight="900">{dayData?.TC_returns || ''}</text>
                                            <text x={0} y={0} dy={40} textAnchor="middle" fill="#dc2626" fontSize={9} fontWeight="900">{dayData?.SGS_returns || ''}</text>
                                        </g>
                                    );
                                }}
                            />
                            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                            <Bar dataKey="TC_returns" name="TC" fill="#16a34a" radius={[1, 1, 0, 0]} barSize={4} />
                            <Bar dataKey="SGS_returns" name="SGS" fill="#dc2626" radius={[1, 1, 0, 0]} barSize={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {dailyMetrics && (
                    <div className="mt-4 flex flex-col gap-3">
                        {/* TC Metrics */}
                        <div className="grid grid-cols-2 gap-2 p-2 bg-green-50/50 rounded-xl border border-green-100">
                            <div className="flex flex-col">
                                <p className="text-[8px] font-black text-green-600 uppercase tracking-wider">dia c/ mais retornos</p>
                                <p className="text-xs font-black text-green-800">Dia {dailyMetrics.TC.maxReturnsDay} <span className="text-[10px] font-bold opacity-60">({dailyMetrics.TC.maxReturnsVal} ret)</span></p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-wider">dia c/ menos retornos</p>
                                <p className="text-xs font-black text-stone-600">Dia {dailyMetrics.TC.minReturnsDay} <span className="text-[10px] font-bold opacity-60">({dailyMetrics.TC.minReturnsVal} ret)</span></p>
                            </div>
                        </div>
                        {/* SGS Metrics */}
                        <div className="grid grid-cols-2 gap-2 p-2 bg-red-50/50 rounded-xl border border-red-100">
                            <div className="flex flex-col">
                                <p className="text-[8px] font-black text-red-600 uppercase tracking-wider">dia c/ mais retornos</p>
                                <p className="text-xs font-black text-red-800">Dia {dailyMetrics.SGS.maxReturnsDay} <span className="text-[10px] font-bold opacity-60">({dailyMetrics.SGS.maxReturnsVal} ret)</span></p>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-wider">dia c/ menos retornos</p>
                                <p className="text-xs font-black text-stone-600">Dia {dailyMetrics.SGS.minReturnsDay} <span className="text-[10px] font-bold opacity-60">({dailyMetrics.SGS.minReturnsVal} ret)</span></p>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
            {/* 2. Perfil de Vendas (%) */}
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-stone-700 text-sm uppercase">Perfil de Vendas (%)</h4>
                    <div className="flex gap-4 text-[11px] font-black">
                        <span className="text-green-600 flex items-center gap-1.5"><div className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></div> TC</span>
                        <span className="text-red-600 flex items-center gap-1.5"><div className="w-3 h-3 bg-red-600 rounded-full shadow-sm"></div> SGS</span>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesCompData} margin={{ top: 30, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />

                            <Bar dataKey="TC" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40}>
                                <LabelList dataKey="TC" position="top" formatter={(v) => `${v}%`} style={{ fill: '#166534', fontSize: '11px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={40}>
                                <LabelList dataKey="SGS" position="top" formatter={(v) => `${v}%`} style={{ fill: '#991b1b', fontSize: '11px', fontWeight: 'bold' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 3. Perfil de Retornos (%) */}
            <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-stone-700 text-sm uppercase">Perfil de Retornos (%)</h4>
                    <div className="flex gap-4 text-[11px] font-black">
                        <span className="text-green-600 flex items-center gap-1.5"><div className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></div> TC</span>
                        <span className="text-red-600 flex items-center gap-1.5"><div className="w-3 h-3 bg-red-600 rounded-full shadow-sm"></div> SGS</span>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={budgetProfileData} margin={{ top: 30, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />

                            <Bar dataKey="TC" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40}>
                                <LabelList dataKey="TC" position="top" formatter={(v) => `${v}%`} style={{ fill: '#166534', fontSize: '11px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={40}>
                                <LabelList dataKey="SGS" position="top" formatter={(v) => `${v}%`} style={{ fill: '#991b1b', fontSize: '11px', fontWeight: 'bold' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 4. Orçamentos & Retornos */}
            <Card className="p-4">
                <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase">Orçamentos & Retornos</h4>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={quoteCompData} margin={{ top: 30, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                            <YAxis tick={{ fontSize: 10 }} />

                            <Bar dataKey="TC" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={30}>
                                <LabelList dataKey="TC" position="top" style={{ fill: '#166534', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={30}>
                                <LabelList dataKey="SGS" position="top" style={{ fill: '#991b1b', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-around text-xs border-t border-stone-100 pt-2">
                    <div className="text-center">
                        <span className="block font-bold text-stone-500">Taxa Retorno TC</span>
                        <span className="text-lg font-black text-green-600">
                            {compStats.TC.orcamentos > 0 ? Math.round((compStats.TC.retornos / compStats.TC.orcamentos) * 100) : 0}%
                        </span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-stone-500">Taxa Retorno SGS</span>
                        <span className="text-lg font-black text-red-600">
                            {compStats.SGS.orcamentos > 0 ? Math.round((compStats.SGS.retornos / compStats.SGS.orcamentos) * 100) : 0}%
                        </span>
                    </div>
                </div>
            </Card>

            <Card className="p-4 bg-green-50/50 border-green-100">
                <h4 className="font-bold text-green-800 text-sm mb-4 uppercase flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Marketing (WhatsApp)
                </h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={msgData} margin={{ top: 30, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                            <YAxis tick={{ fontSize: 10 }} />

                            <Bar dataKey="TC" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={30}>
                                <LabelList dataKey="TC" position="top" style={{ fill: '#14532d', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="SGS" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={30}>
                                <LabelList dataKey="SGS" position="top" style={{ fill: '#991b1b', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-4 bg-stone-50 border-stone-200">
                <h4 className="font-bold text-stone-700 text-sm mb-4 uppercase flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-600" /> Eficiência por Perfil (Conversão %)
                </h4>
                <p className="text-[10px] text-stone-500 mb-2">Compara a conversão de Clientes Antigos vs. Novos Clientes por atendente.</p>

                <div className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={staffEfficiency} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={110} 
                                tick={(props) => {
                                    const { x, y, payload } = props;
                                    const item = staffEfficiency.find(s => s.name === payload.value);
                                    return (
                                        <g transform={`translate(${x},${y})`}>
                                            <text x={-10} y={0} dy={-4} textAnchor="end" fill="#44403c" fontSize={11} fontWeight="bold">{payload.value}</text>
                                            <text x={-10} y={0} dy={10} textAnchor="end" fill="#ea580c" fontSize={9} fontWeight="900">{item?.conversion}% total</text>
                                        </g>
                                    );
                                }}
                            />

                            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                             <Bar name="Cliente (%)" dataKey="rateCli" fill="#ea580c" radius={[0, 4, 4, 0]} barSize={15}>
                                <LabelList dataKey="rateCli" position="right" formatter={(v) => `${v}%`} style={{ fill: '#c2410c', fontSize: '10px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar name="Novo (%)" dataKey="rateNew" fill="#78716c" radius={[0, 4, 4, 0]} barSize={15}>
                                <LabelList dataKey="rateNew" position="right" formatter={(v) => `${v}%`} style={{ fill: '#44403c', fontSize: '10px' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>


            <Card className="p-4">
                <h4 className="font-bold text-stone-700 text-sm mb-6 uppercase flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" /> Top Atendentes por Loja
                </h4>

                <div className="space-y-8">
                    {/* Loja TC */}
                    <div>
                        <h5 className="text-sm font-black text-green-600 uppercase mb-3 px-2 border-l-4 border-green-500">Três Corações (TC)</h5>
                        <div className="space-y-2">
                            <div className="grid grid-cols-6 text-[9px] font-bold text-stone-400 border-b border-stone-100 pb-2 text-center">
                                <div className="text-left col-span-2">Nome</div>
                                <div>Vendas</div>
                                <div>C.Total</div>
                                <div>% Cli</div>
                                <div>% Novo</div>
                            </div>
                            {topStaffTC.map((s, i) => (
                                <div key={`TC-${s.name}`} className="grid grid-cols-6 items-center py-3 border-b border-stone-50 text-xs text-center">
                                    <div className="text-left col-span-2 font-bold text-stone-700">{i + 1}. {s.name}</div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-black text-stone-800 text-sm">{s.vendas}</span>
                                        <span className="text-[9px] text-stone-400 font-medium">de {s.atendimentos} atd</span>
                                    </div>
                                    <div><span className={`font-bold px-2 py-1 rounded ${s.conversion >= 30 ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>{s.conversion}%</span></div>
                                    <div className="font-medium text-green-700">{s.rateCli}%</div>
                                    <div className="font-medium text-stone-500">{s.rateNew}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Loja SGS */}
                    <div>
                        <h5 className="text-sm font-black text-red-600 uppercase mb-3 px-2 border-l-4 border-red-500">São Gonçalo (SGS)</h5>
                        <div className="space-y-2">
                            <div className="grid grid-cols-6 text-[9px] font-bold text-stone-400 border-b border-stone-100 pb-2 text-center">
                                <div className="text-left col-span-2">Nome</div>
                                <div>Vendas</div>
                                <div>C.Total</div>
                                <div>% Cli</div>
                                <div>% Novo</div>
                            </div>
                            {topStaffSGS.map((s, i) => (
                                <div key={`SGS-${s.name}`} className="grid grid-cols-6 items-center py-3 border-b border-stone-50 text-xs text-center">
                                    <div className="text-left col-span-2 font-bold text-stone-700">{i + 1}. {s.name}</div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-black text-stone-800 text-sm">{s.vendas}</span>
                                        <span className="text-[9px] text-stone-400 font-medium">de {s.atendimentos} atd</span>
                                    </div>
                                    <div><span className={`font-bold px-2 py-1 rounded ${s.conversion >= 30 ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>{s.conversion}%</span></div>
                                    <div className="font-medium text-red-700">{s.rateCli}%</div>
                                    <div className="font-medium text-stone-500">{s.rateNew}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div >
    );
}
// ... (App Main Component) ...

export default function App() {
    const [storeConfig, setStoreConfig] = useState(DEFAULT_CONFIG);
    const [configLoaded, setConfigLoaded] = useState(false);
    const [user, setUser] = useState(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [currentStore, setCurrentStore] = useState(null);

    const [view, setView] = useState('entry');
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [pendingStore, setPendingStore] = useState(null);

    const fetchConfig = async () => {
        try {
            const configDoc = await getDoc(doc(db, 'artifacts', databaseAppId, 'public', 'data', 'app_settings', 'config'));
            if (configDoc.exists()) {
                const remoteData = configDoc.data();

                // TEMPORARY FIX: Restore missing passwords
                let needsUpdate = false;
                if (!remoteData.managerPassword) { remoteData.managerPassword = '2025'; needsUpdate = true; }
                if (remoteData.stores && remoteData.stores.TC && !remoteData.stores.TC.password) { remoteData.stores.TC.password = '4572'; needsUpdate = true; }
                if (remoteData.stores && remoteData.stores.SGS && !remoteData.stores.SGS.password) { remoteData.stores.SGS.password = '3748'; needsUpdate = true; }
                if (needsUpdate) {
                    await setDoc(doc(db, 'artifacts', databaseAppId, 'public', 'data', 'app_settings', 'config'), remoteData);
                }

                const merged = { ...remoteData };
                if (!merged.stores) merged.stores = {};

                Object.keys(DEFAULT_CONFIG.stores).forEach(sId => {
                    if (merged.stores[sId]) {
                        // Migração: Converter staff de string[] para {name, active}[]
                        let remoteStaff = merged.stores[sId].staff || [];
                        remoteStaff = remoteStaff.map(s => typeof s === 'string' ? { name: s, active: true } : s);
                        
                        const defaultStaff = DEFAULT_CONFIG.stores[sId].staff;
                        
                        // Merge staff: mantém todos os remotos (convertidos) e adiciona novos do default se não existirem
                        const existingNames = new Set(remoteStaff.map(s => s.name));
                        const missingFromDefault = defaultStaff.filter(s => !existingNames.has(s.name));
                        
                        merged.stores[sId].staff = [...remoteStaff, ...missingFromDefault];
                    } else {
                        merged.stores[sId] = { ...DEFAULT_CONFIG.stores[sId] };
                    }
                });
                setStoreConfig(merged);
            } else {
                const savedConfig = localStorage.getItem('optical_store_config_v2');
                if (savedConfig) {
                    const parsed = JSON.parse(savedConfig);
                    setStoreConfig(parsed);
                    // Seed Firestore with local config if it's the first time
                    await setDoc(doc(db, 'artifacts', databaseAppId, 'public', 'data', 'app_settings', 'config'), parsed);
                }
            }
        } catch (error) {
            console.error("Error fetching config:", error);
        } finally {
            setConfigLoaded(true);
        }
    };

    useEffect(() => {
        if (user) {
            fetchConfig();
        }
    }, [user]);

    const handleUpdateConfig = async (newConfig) => {
        setStoreConfig(newConfig);
        localStorage.setItem('optical_store_config_v2', JSON.stringify(newConfig));
        try {
            await setDoc(doc(db, 'artifacts', databaseAppId, 'public', 'data', 'app_settings', 'config'), newConfig);
        } catch (error) {
            console.error("Error updating remote config:", error);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
                    await signInWithCustomToken(auth, window.__initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                try {
                    await signInAnonymously(auth);
                } catch (anonError) {
                    console.error("Auth error:", anonError);
                }
            }
        };
        initAuth();
        return onAuthStateChanged(auth, setUser);
    }, []);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'artifacts', databaseAppId, 'public', 'data', 'optical_records_final_v11')
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
            const dataToSave = { ...entryData };
            const customDate = dataToSave.date;
            if (customDate) delete dataToSave.date; // Remove the temporary Date object from the root

            await addDoc(collection(db, 'artifacts', databaseAppId, 'public', 'data', 'optical_records_final_v11'), {
                ...dataToSave,
                store: currentStore,
                createdAt: customDate ? customDate : serverTimestamp(),
                userId: user.uid,
                dateString: customDate ? customDate.toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')
            });
            return true;
        } catch (error) {
            console.error("Error adding document: ", error);
            return false;
        }
    };

    const handleDeleteEntry = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            try {
                await deleteDoc(doc(db, 'artifacts', databaseAppId, 'public', 'data', DATA_COLLECTION_NAME, id));
            } catch (error) {
                console.error("Erro ao excluir:", error);
                alert("Erro ao excluir registro.");
            }
        }
    };

    const handleUpdateEntry = async (id, newData) => {
        try {
            await updateDoc(doc(db, 'artifacts', databaseAppId, 'public', 'data', DATA_COLLECTION_NAME, id), newData);
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao atualizar registro.");
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
                const ref = doc(db, 'artifacts', databaseAppId, 'public', 'data', 'optical_records_final_v11', entry.id);
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
            if (action === 'trends') setView('trends');
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
        if (pendingAction === 'trends') setView('trends');
        if (pendingAction === 'settings') setShowSettings(true);
        if (pendingAction === 'storeChange') setCurrentStore(pendingStore);

        setPendingAction(null);
        setPendingStore(null);
    };

    if (firebaseInitError) {
        return (
            <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
                <h2>Falha Crítica na Inicialização</h2>
                <p>O aplicativo não pôde conectar ao Firebase.</p>
                <pre style={{ background: '#fee', padding: '10px', borderRadius: '5px', whiteSpace: 'pre-wrap' }}>
                    {firebaseInitError.toString()}
                </pre>
                <p>Verifique se as variáveis de ambiente (VITE_FIREBASE_...) estão definidas corretamente na Vercel.</p>
                <pre>
                    API KEY: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Presente' : 'Faltando'}
                </pre>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginScreen config={storeConfig} onLogin={handleLogin} isConfigLoaded={configLoaded} />;
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
                            {isManager ? <LockOpen className="w-3 h-3 text-green-300" /> : <Lock className="w-3 h-3 text-orange-200" />}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLogout}
                            className="bg-orange-800/50 p-1.5 rounded-xl text-white border border-orange-400/30 hover:bg-orange-700 transition-colors"
                            title="Sair / Trocar Loja"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>

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
                        entries={filteredEntries} // Passando dados filtrados para o Log
                        onDelete={handleDeleteEntry} // Passando função de deletar
                        onUpdate={handleUpdateEntry} // Passando função de editar
                    />
                ) : view === 'dashboard' ? (
                    <DashboardScreen
                        data={filteredEntries}
                        storeData={storeConfig.stores[currentStore]}
                    />
                ) : view === 'comparison' ? (
                    <ComparisonScreen data={entries} />
                ) : (
                    <TrendsScreen data={entries} storeConfig={storeConfig} />
                )}
            </main>

            <div className={`fixed bottom-0 left-0 right-0 ${THEME.bgCard} border-t ${THEME.border} px-4 py-3 flex justify-around z-30 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)]`}>
                <button
                    onClick={() => setView('entry')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 ${view === 'entry' ? THEME.accentText : THEME.textLight}`}
                >
                    <CirclePlus className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Novo</span>
                </button>

                <button
                    onClick={() => requestAccess('dashboard')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 ${view === 'dashboard' ? THEME.accentText : THEME.textLight}`}
                >
                    {isManager ? <ChartBar className="w-6 h-6" /> : <Lock className="w-6 h-6 opacity-60" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isManager ? "Relatórios" : "Restrito"}
                    </span>
                </button>

                <button
                    onClick={() => requestAccess('comparison')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 ${view === 'comparison' ? THEME.accentText : THEME.textLight}`}
                >
                    {isManager ? <Scale className="w-6 h-6" /> : <Lock className="w-6 h-6 opacity-60" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isManager ? "Comparar" : "Restrito"}
                    </span>
                </button>

                <button
                    onClick={() => requestAccess('trends')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 ${view === 'trends' ? THEME.accentText : THEME.textLight}`}
                >
                    {isManager ? <TrendingUp className="w-6 h-6" /> : <Lock className="w-6 h-6 opacity-60" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isManager ? "Tendências" : "Restrito"}
                    </span>
                </button>
            </div>
        </div>
    );
}
