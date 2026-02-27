import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');
const CRLF = '\r\n';

// ============================================================
// 1. Fix "Histórico Completo" button to match "Movimento de Hoje"
// ============================================================
const oldHistoricoButton = `            {/* NOVO BOTÃO: HISTÓRICO COMPLETO */}\r\n                            <button\r\n                                onClick={() => setStep('history')}\r\n                                className={\`w-full bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:bg-blue-100 hover:border-blue-500 transition-all active:scale-95 mt-4\`}\r\n                            >\r\n                                <div className="flex items-center gap-3">\r\n                                    <div className={\`p-2 bg-blue-600 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform\`}>\r\n                                        <History className="w-5 h-5" />\r\n                                    </div>\r\n                                    <div className="text-left">\r\n                                        <h3 className="font-bold text-base text-blue-900 leading-tight">Histórico Completo</h3>\r\n                                        <p className="text-[10px] text-blue-700 font-medium">Todos os registros</p>\r\n                                    </div>\r\n                                </div>\r\n                                <ChevronRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />\r\n                            </button>`;

const newHistoricoButton = `            {/* BOTÃO: HISTÓRICO COMPLETO - mesmo estilo do Movimento de Hoje */}\r\n                            <button\r\n                                onClick={() => setStep('history')}\r\n                                className="w-full bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:bg-orange-100 hover:border-orange-500 transition-all active:scale-95 mt-4"\r\n                            >\r\n                                <div className="flex items-center gap-3">\r\n                                    <div className="p-2 bg-orange-500 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform">\r\n                                        <History className="w-5 h-5" />\r\n                                    </div>\r\n                                    <div className="text-left">\r\n                                        <h3 className="font-bold text-base text-orange-900 leading-tight">Histórico Completo</h3>\r\n                                        <p className="text-[10px] text-orange-700 font-medium">Todos os registros</p>\r\n                                    </div>\r\n                                </div>\r\n                                <Eye className="w-5 h-5 text-orange-400 group-hover:text-orange-600 transition-colors" />\r\n                            </button>`;

if (content.includes('NOVO BOTÃO: HISTÓRICO COMPLETO')) {
    content = content.replace(oldHistoricoButton, newHistoricoButton);
    console.log('1. Fixed Histórico Completo button style ✓');
} else {
    // Fallback: find and replace just the button className
    content = content.replace(
        /className=\{`w-full bg-blue-50 border-2 border-blue-200[^`]+`\}/,
        `className="w-full bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:bg-orange-100 hover:border-orange-500 transition-all active:scale-95 mt-4"`
    );
    content = content.replace('bg-blue-600 rounded-lg text-white', 'bg-orange-500 rounded-lg text-white');
    content = content.replace('text-blue-900 leading-tight">Histórico Completo<', 'text-orange-900 leading-tight">Histórico Completo<');
    content = content.replace('text-orange-700 font-medium">Todos os registros<', 'text-orange-700 font-medium">Todos os registros<');
    content = content.replace('text-blue-400 group-hover:text-blue-600', 'text-orange-400 group-hover:text-orange-600');
    console.log('1. Fixed Histórico Completo button style (fallback) ✓');
}

// ============================================================
// 2. Fix "Não Cliente" button - ensure bg is stone-50 not stone-700
// ============================================================
content = content.replace(
    /bg-stone-700 text-stone-300/g,
    'bg-stone-100 text-stone-500'
);
content = content.replace(
    /': 'border-stone-200 bg-stone-700/g,
    "': 'border-stone-200 bg-stone-50"
);
console.log('2. Fixed Não Cliente button color ✓');

// ============================================================
// 3. Replace the entire history 'step === history' block with
//    a new date-filtered version with month/day picker and add button
// ============================================================
const oldHistoryBlock = content.match(/\{\/\* TELA DE HISTÓRICO COMPLETO \*\/\}\r?\n.*?step === 'history'.*?\)\}/s);

const newHistoryBlock = `{/* TELA DE HISTÓRICO COMPLETO COM FILTRO DE DATA */}
            {step === 'history' && (() => {
                // Data selecionada começa hoje
                const today = new Date();
                const [histYear, setHistYear] = histYearState;
                const [histMonth, setHistMonth] = histMonthState;
                const [histDay, setHistDay] = histDayState;
                const [histAddMode, setHistAddMode] = histAddModeState;

                const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
                const fullMonths = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

                // Filtrar pelos entries do mês selecionado
                const monthEntries = entries.filter(e => {
                    const d = e.date;
                    return d.getFullYear() === histYear && d.getMonth() === histMonth;
                });

                // Dias únicos que têm registros
                const daysWithEntries = [...new Set(monthEntries.map(e => e.date.getDate()))].sort((a,b) => a-b);

                // Entradas do dia selecionado
                const dayEntries = histDay !== null
                    ? monthEntries.filter(e => e.date.getDate() === histDay)
                    : [];

                return (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 pb-20">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-stone-800 text-lg">Histórico</h2>
                                <p className="text-xs text-stone-500">Selecione mês e dia</p>
                            </div>
                            <button onClick={() => { setStep('menu'); setHistDay(null); }} className="text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg font-bold">← Voltar</button>
                        </div>

                        {/* Seletor de Mês e Ano */}
                        <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <button onClick={() => {
                                    if (histMonth === 0) { setHistMonth(11); setHistYear(histYear - 1); }
                                    else setHistMonth(histMonth - 1);
                                    setHistDay(null);
                                }} className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg">‹</button>
                                <span className="font-bold text-stone-800">{fullMonths[histMonth]} {histYear}</span>
                                <button onClick={() => {
                                    if (histMonth === 11) { setHistMonth(0); setHistYear(histYear + 1); }
                                    else setHistMonth(histMonth + 1);
                                    setHistDay(null);
                                }} className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg">›</button>
                            </div>

                            {/* Grade de dias */}
                            <div className="grid grid-cols-7 gap-1">
                                {['D','S','T','Q','Q','S','S'].map((d,i) => (
                                    <div key={i} className="text-center text-[9px] font-bold text-stone-400 pb-1">{d}</div>
                                ))}
                                {/* Offset do primeiro dia do mês */}
                                {Array.from({ length: new Date(histYear, histMonth, 1).getDay() }).map((_, i) => (
                                    <div key={`offset-${ i } `} />
                                ))}
                                {/* Dias do mês */}
                                {Array.from({ length: new Date(histYear, histMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                                    const hasEntries = daysWithEntries.includes(day);
                                    const isToday = day === today.getDate() && histMonth === today.getMonth() && histYear === today.getFullYear();
                                    const isSelected = day === histDay;
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setHistDay(isSelected ? null : day)}
                                            className={\`relative w-full aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-bold transition-all
                                                \${isSelected ? 'bg-orange-500 text-white shadow-md' : isToday ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'text-stone-700 hover:bg-stone-100'}
                                            \`}
                                        >
                                            {day}
                                            {hasEntries && !isSelected && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-orange-400"></span>}
                                            {hasEntries && isSelected && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white"></span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Lista do dia selecionado */}
                        {histDay !== null && (
                            <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-stone-700 text-sm">{histDay} de {fullMonths[histMonth]}</h3>
                                    <button
                                        onClick={() => setHistAddMode(true)}
                                        className="flex items-center gap-1.5 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
                                    >
                                        <span>+</span> Adicionar
                                    </button>
                                </div>

                                {dayEntries.length === 0 ? (
                                    <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
                                        <p className="text-stone-400 text-sm">Nenhum registro neste dia</p>
                                        <button onClick={() => setHistAddMode(true)} className="mt-3 text-xs text-orange-600 font-bold underline">Adicionar agora →</button>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm divide-y divide-stone-100">
                                        {dayEntries.map(entry => (
                                            <div key={entry.id} className="p-3 flex justify-between items-start hover:bg-stone-50 transition-colors">
                                                <div className="flex flex-col gap-0.5 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={\`text-[10px] font-bold px-1.5 rounded uppercase \${entry.category === 'comercial' ? (entry.action === 'venda' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700') : entry.category === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}\`}>
                                                            {entry.category === 'comercial' ? entry.action : entry.category === 'whatsapp' ? 'Zap' : entry.category}
                                                        </span>
                                                        <span className="text-[10px] text-stone-400 font-bold">
                                                            {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {entry.saleValue > 0 && (
                                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                                                                R$ {typeof entry.saleValue === 'number' ? entry.saleValue.toLocaleString('pt-BR', {minimumFractionDigits:2}) : entry.saleValue}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-bold text-stone-700 capitalize">
                                                        {entry.category === 'comercial' ? entry.clientType?.replace('_', ' ') || 'Cliente' : (entry.type ? entry.type.replace('_', ' ') : 'Serviço')}
                                                    </span>
                                                    <div className="text-xs text-stone-500 flex gap-2 flex-wrap">
                                                        {entry.attendant && <span>👤 {entry.attendant}</span>}
                                                        {entry.marketingSource && <span>📣 {entry.marketingSource}</span>}
                                                        {entry.message && <span>💬 {entry.message}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
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
                        )}

                        {histDay === null && (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                                <p className="text-orange-700 text-sm font-medium">Selecione um dia no calendário para ver os registros</p>
                                <p className="text-orange-500 text-xs mt-1">Os dias com registros têm um ponto laranja</p>
                            </div>
                        )}
                    </div>
                );
            })()}`;

// Find and replace the old history block
const histBlock = /\{\/\* TELA DE HISTÓRIA COMPLETO \*\/\}[\s\S]*?\)\s*\}\s*\n.*?\)\s*\}\s*\)/;
// Target just the step === 'history' JSX block
const histBlockStart = content.indexOf("{/* TELA DE HISTÓRICO COMPLETO */}");
const histBlockEnd_marker = content.indexOf("{/* TELA DE LOG DIÁRIO */}", histBlockStart);

if (histBlockStart >= 0 && histBlockEnd_marker >= 0) {
    const before = content.substring(0, histBlockStart);
    const after = content.substring(histBlockEnd_marker);
    content = before + newHistoryBlock + '\r\n\r\n            ' + after;
    console.log('3. Replaced history screen block ✓');
} else {
    console.log('ERROR: Could not find history block markers. histBlockStart:', histBlockStart, 'histBlockEnd:', histBlockEnd_marker);
}

fs.writeFileSync('src/App.jsx', content);
console.log('Part 1 written. Now run rebuild_history_2.mjs for state and modal.');
