import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// ============================================================
// Add state hooks for history filter to EntryScreen
// These need to be local to EntryScreen since it renders the history view
// ============================================================

const stateTarget = `    const [entryToEdit, setEntryToEdit] = useState(null);\r\n\r\n    const resetFlow`;

const stateReplacement = `    const [entryToEdit, setEntryToEdit] = useState(null);
    const today = new Date();
    const histYearState = useState(today.getFullYear());
    const histMonthState = useState(today.getMonth());
    const histDayState = useState(today.getDate());  // default to today
    const histAddModeState = useState(false);

    const resetFlow`;

if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, stateReplacement);
    console.log('1. Added history filter state hooks ✓');
} else {
    console.log('WARNING: State target not found');
    // Try without CRLF
    const stateTarget2 = `    const [entryToEdit, setEntryToEdit] = useState(null);\n\n    const resetFlow`;
    if (content.includes(stateTarget2)) {
        content = content.replace(stateTarget2, stateReplacement);
        console.log('1. Added history filter state hooks (LF) ✓');
    } else {
        console.log('ERROR: Could not find state insertion point');
    }
}

// ============================================================
// Replace the EditEntryModal with a full-featured version
// ============================================================
const FULL_EDIT_MODAL = `function EditEntryModal({ entry, onClose, onSave, storeData }) {
    const [category, setCategory] = useState(entry?.category || 'comercial');
    const [action, setAction] = useState(entry?.action || 'venda');
    const [clientType, setClientType] = useState(entry?.clientType || 'cliente');
    const [marketingSource, setMarketingSource] = useState(entry?.marketingSource || null);
    const [saleValue, setSaleValue] = useState(entry?.saleValue ? String(entry.saleValue) : '');
    const [attendant, setAttendant] = useState(entry?.attendant || '');
    const [type, setType] = useState(entry?.type || '');
    const [message, setMessage] = useState(entry?.message || '');
    const [saving, setSaving] = useState(false);

    const staffList = storeData?.staff || [];

    const handleSave = async () => {
        setSaving(true);
        const updateData = { category };
        if (category === 'comercial') {
            updateData.action = action;
            updateData.clientType = clientType;
            updateData.marketingSource = marketingSource;
            updateData.attendant = attendant;
            if (action === 'venda' || action === 'retorno') {
                updateData.saleValue = parseFloat(saleValue.replace(',', '.')) || 0;
            }
        } else if (category === 'servico') {
            updateData.type = type;
        } else if (category === 'whatsapp') {
            updateData.message = message;
        }
        await onSave(entry.id, updateData);
        setSaving(false);
        onClose();
    };

    const mktOptions = ['Nenhum', 'Anúncio/Vídeo', 'Mensagem (Zap)'];
    const actionOptions = [
        { id: 'orcamento', label: 'Orçamento' },
        { id: 'venda', label: 'Venda' },
        { id: 'retorno', label: 'Retorno Orç.' },
    ];
    const serviceOptions = ['pagamento', 'retirada', 'ajuste', 'duvida'];
    const serviceLabels = { pagamento: 'Pagamento', retirada: 'Retirada', ajuste: 'Ajuste', duvida: 'Dúvidas' };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-0" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-stone-200 px-5 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-stone-800 text-lg">Editar Registro</h2>
                        <p className="text-xs text-stone-400">{entry?.date?.toLocaleDateString('pt-BR', {day:'2-digit',month:'long',year:'numeric'})}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5 space-y-5">
                    {/* Tipo de Registro */}
                    <div>
                        <p className="text-xs font-bold text-stone-500 uppercase mb-2">Tipo de Registro</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[['comercial','💰','Comercial'],['servico','🔧','Serviço'],['whatsapp','💬','WhatsApp']].map(([cat, icon, label]) => (
                                <button key={cat} onClick={() => setCategory(cat)}
                                    className={\`p-3 rounded-xl border-2 text-center text-sm font-bold transition-all \${category === cat ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}\`}>
                                    <div className="text-lg mb-1">{icon}</div>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comercial */}
                    {category === 'comercial' && (<>
                        <div>
                            <p className="text-xs font-bold text-stone-500 uppercase mb-2">Ação Realizada</p>
                            <div className="grid grid-cols-3 gap-2">
                                {actionOptions.map(opt => (
                                    <button key={opt.id} onClick={() => setAction(opt.id)}
                                        className={\`p-2 rounded-xl border-2 text-center text-xs font-bold transition-all \${action === opt.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-white text-stone-600'}\`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-stone-500 uppercase mb-2">Atendente</p>
                            <div className="space-y-2">
                                {staffList.map(s => (
                                    <button key={s} onClick={() => setAttendant(s)}
                                        className={\`w-full p-3 rounded-xl border-2 text-sm font-bold text-left transition-all flex items-center gap-3 \${attendant === s ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'}\`}>
                                        <span className={\`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold \${attendant === s ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}\`}>
                                            {s.substring(0,2).toUpperCase()}
                                        </span>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-stone-500 uppercase mb-2">Perfil do Cliente</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[['cliente','Já é Cliente'],['nao_cliente','Não Cliente']].map(([val,label]) => (
                                    <button key={val} onClick={() => setClientType(val)}
                                        className={\`p-3 rounded-xl border-2 text-sm font-bold transition-all \${clientType === val ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'}\`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-stone-500 uppercase mb-2">Origem de Marketing</p>
                            <div className="grid grid-cols-3 gap-2">
                                {mktOptions.map(opt => (
                                    <button key={opt} onClick={() => setMarketingSource(opt === 'Nenhum' ? null : opt)}
                                        className={\`p-2 rounded-xl border-2 text-xs font-bold text-center transition-all \${(marketingSource === opt || (opt === 'Nenhum' && !marketingSource)) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-white text-stone-600'}\`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {(action === 'venda' || action === 'retorno') && (
                            <div>
                                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Valor (R$)</p>
                                <input
                                    type="number"
                                    value={saleValue}
                                    onChange={e => setSaleValue(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full p-3 border-2 border-stone-200 rounded-xl text-stone-800 font-bold text-lg focus:border-orange-400 focus:outline-none"
                                />
                            </div>
                        )}
                    </>)}

                    {/* Serviço Rápido */}
                    {category === 'servico' && (
                        <div>
                            <p className="text-xs font-bold text-stone-500 uppercase mb-2">Tipo de Serviço</p>
                            <div className="grid grid-cols-2 gap-2">
                                {serviceOptions.map(opt => (
                                    <button key={opt} onClick={() => setType(opt)}
                                        className={\`p-4 rounded-xl border-2 text-sm font-bold text-center transition-all \${type === opt ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'}\`}>
                                        {serviceLabels[opt] || opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* WhatsApp */}
                    {category === 'whatsapp' && (
                        <div>
                            <p className="text-xs font-bold text-stone-500 uppercase mb-2">Mensagem / Descrição</p>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Descreva a mensagem ou tipo de contato..."
                                rows={3}
                                className="w-full p-3 border-2 border-stone-200 rounded-xl text-stone-800 focus:border-orange-400 focus:outline-none resize-none"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl text-base shadow-lg hover:bg-orange-600 active:scale-98 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : '✓ Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
}`;

// Find and replace the existing EditEntryModal function
const editModalStart = content.indexOf('function EditEntryModal(');
if (editModalStart >= 0) {
    // Find the end of the function - look for 'function ' after it
    const nextFuncIdx = content.indexOf('\nfunction ', editModalStart + 1);
    if (nextFuncIdx >= 0) {
        const before = content.substring(0, editModalStart);
        const after = content.substring(nextFuncIdx);
        content = before + FULL_EDIT_MODAL + '\r\n\r\n' + after;
        console.log('2. Replaced EditEntryModal with full version ✓');
    } else {
        console.log('ERROR: Could not find end of EditEntryModal function');
    }
} else {
    // EditEntryModal doesn't exist yet - inject it before the App export
    const appExportIdx = content.indexOf('export default function App()');
    if (appExportIdx >= 0) {
        content = content.substring(0, appExportIdx) + FULL_EDIT_MODAL + '\r\n\r\n' + content.substring(appExportIdx);
        console.log('2. Injected new EditEntryModal ✓');
    }
}

// ============================================================
// Fix EditEntryModal usage - pass storeData prop
// ============================================================
content = content.replace(
    /<EditEntryModal\s+entry=\{entryToEdit\}\s+onClose=\{[^}]+\}\s+onSave=\{[^}]+\}\s+\/>/,
    `<EditEntryModal
                    entry={entryToEdit}
                    onClose={() => setEntryToEdit(null)}
                    onSave={onUpdate}
                    storeData={storeData}
                />`
);
console.log('3. Updated EditEntryModal usage to pass storeData ✓');

fs.writeFileSync('src/App.jsx', content);
console.log('Done! Run: npm run build to verify');
