import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

const marker = `export default function App() {`;

const modal = `// COMPONENTE NOVO: Modal de Edição Completa
function EditEntryModal({ entry, onClose, onSave }) {
    const [clientType, setClientType] = useState(entry.clientType || 'cliente');
    const [marketingSource, setMarketingSource] = useState(entry.marketingSource || null);
    const [saleValue, setSaleValue] = useState(entry.saleValue || 0);

    const handleSave = () => {
        const updatedData = {
            clientType,
            marketingSource,
            saleValue: parseFloat(saleValue) || 0
        };
        onSave(entry.id, updatedData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Pencil className="w-5 h-5" /> Editar Registro
                    </h3>
                    <button onClick={onClose}><X className="w-5 h-5 opacity-80 hover:opacity-100" /></button>
                </div>
                
                <div className="p-5 space-y-5">
                    {/* 1. Tipo de Cliente */}
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Tipo de Cliente</label>
                        <div className="flex bg-stone-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setClientType('cliente')}
                                className={\`flex-1 py-2 rounded-md text-sm font-bold transition-all \${clientType === 'cliente' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}\`}
                            >
                                Já é Cliente
                            </button>
                            <button 
                                onClick={() => setClientType('nao_cliente')}
                                className={\`flex-1 py-2 rounded-md text-sm font-bold transition-all \${clientType === 'nao_cliente' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}\`}
                            >
                                Não Cliente
                            </button>
                        </div>
                    </div>

                    {/* 2. Origem Marketing */}
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Origem (Marketing)</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                onClick={() => setMarketingSource(null)}
                                className={\`py-2 rounded-lg text-xs font-bold border transition-all \${!marketingSource ? 'bg-stone-600 text-white border-stone-600' : 'bg-white text-stone-500 border-stone-200'}\`}
                            >
                                Nenhum
                            </button>
                            <button 
                                onClick={() => setMarketingSource('anuncio')}
                                className={\`py-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 \${marketingSource === 'anuncio' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200'}\`}
                            >
                                <MonitorPlay className="w-4 h-4" /> Anúncio
                            </button>
                            <button 
                                onClick={() => setMarketingSource('mensagem')}
                                className={\`py-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 \${marketingSource === 'mensagem' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-200'}\`}
                            >
                                <MessageCircle className="w-4 h-4" /> Zap
                            </button>
                        </div>
                    </div>

                    {/* 3. Valor (Condicional ou Sempre visível se for Venda) */}
                    {(entry.action === 'venda' || entry.action === 'retorno') && (
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Valor da Venda (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                                <input 
                                    type="number" 
                                    value={saleValue}
                                    onChange={(e) => setSaleValue(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl font-bold text-lg text-stone-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    <Button onClick={handleSave} className="w-full py-6 text-lg font-bold shadow-lg">
                        <Check className="w-5 h-5 mr-2" /> Salvar Alterações
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function App() {`;

// Replace
if (!content.includes('function EditEntryModal')) {
    content = content.replace(marker, modal);
    fs.writeFileSync('src/App.jsx', content);
    console.log("Success EditEntryModal injection");
} else {
    console.log("EditEntryModal already exists");
}
