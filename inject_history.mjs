import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

const marker = '{/* TELA DE LOG DIÁRIO */}';

const historyBlock = `
            {/* TELA DE HISTÓRICO COMPLETO */}
            {step === 'history' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-20">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                        <p className="text-sm font-bold text-blue-900">
                            Todos os Registros
                        </p>
                        <p className="text-xs text-blue-700 mt-1">Toque no ícone do Lápis para editar clientes ou valores.</p>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-stone-100">
                            {entries.map(entry => (
                                <div key={entry.id} className="p-3 flex justify-between items-center hover:bg-stone-50 transition-colors">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={\`text-[10px] font-bold px-1.5 rounded uppercase \${entry.category === 'comercial' ? (entry.action === 'venda' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700') : entry.category === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}\`}>
                                                {entry.category === 'comercial' ? entry.action : entry.category === 'whatsapp' ? 'Zap' : entry.category}
                                            </span>
                                            <span className="text-[10px] text-stone-400 font-bold">
                                                {entry.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })} às {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-sm font-bold text-stone-700 capitalize">
                                                {entry.category === 'comercial' ? entry.clientType?.replace('_', ' ') || 'Cliente' : (entry.type ? entry.type.replace('_', ' ') : 'Serviço')}
                                            </span>
                                            {entry.saleValue > 0 && (
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                                                    R$ {entry.saleValue}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-stone-500 mt-0.5 gap-2 flex">
                                            {entry.attendant && <span><Users className="w-3 h-3 inline" /> {entry.attendant}</span>}
                                            {entry.marketingSource && <span><Megaphone className="w-3 h-3 inline" /> {entry.marketingSource}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setEntryToEdit(entry)}
                                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(entry.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {entries.length === 0 && (
                                <p className="text-center text-sm text-stone-400 py-4 italic">Nenhum registro encontrado no sistema.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TELA DE LOG DIÁRIO */}`;

if (!content.includes("{/* TELA DE HISTÓRICO COMPLETO */}")) {
    content = content.replace(marker, historyBlock);
    fs.writeFileSync('src/App.jsx', content);
    console.log("Success History view injection");
} else {
    console.log("History view already exists");
}
