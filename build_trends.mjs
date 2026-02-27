import { readFileSync, writeFileSync } from 'fs';

const file = 'src/App.jsx';
let content = readFileSync(file, 'utf8');

// 1. Inserir a nova aba Tendências na navegação
const navMarker = `                <button
                    onClick={() => requestAccess('comparison')}
                    className={\`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 \${view === 'comparison' ? 'text-orange-600' : THEME.textLight}\`}
                >
                    {isManager ? <Scale className="w-6 h-6" /> : <Lock className="w-6 h-6 opacity-60" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        Comparar
                    </span>
                </button>
            </div>`;

const newNav = `                <button
                    onClick={() => requestAccess('comparison')}
                    className={\`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 \${view === 'comparison' ? 'text-orange-600' : THEME.textLight}\`}
                >
                    {isManager ? <Scale className="w-6 h-6" /> : <Lock className="w-6 h-6 opacity-60" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        Comparar
                    </span>
                </button>

                <button
                    onClick={() => requestAccess('trends')}
                    className={\`flex flex-col items-center gap-1.5 p-2 rounded-xl w-full transition-all active:scale-95 \${view === 'trends' ? 'text-orange-600' : THEME.textLight}\`}
                >
                    {isManager ? <TrendingUp className="w-6 h-6" /> : <Lock className="w-6 h-6 opacity-60" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        Tendências
                    </span>
                </button>
            </div>`;

// 2. Inserir TrendsScreen no App render
const appRenderMarker = `                ) : view === 'dashboard' ? (
                    <DashboardScreen
                        data={filteredEntries}
                        storeData={storeConfig.stores[currentStore]}
                    />
                ) : (
                    <ComparisonScreen data={entries} />
                )}`;

const newAppRender = `                ) : view === 'dashboard' ? (
                    <DashboardScreen
                        data={filteredEntries}
                        storeData={storeConfig.stores[currentStore]}
                    />
                ) : view === 'trends' ? (
                    <TrendsScreen data={entries} storeConfig={storeConfig} />
                ) : (
                    <ComparisonScreen data={entries} />
                )}`;

// 3. Remover "Tendências Anuais" do DashboardScreen
const trendsSectionRegex = /<div className="space-y-4 pt-6 border-t-2 border-stone-200">[\s\S]*?<h3 className="text-lg font-black text-stone-800 uppercase pl-2 border-l-4 border-blue-500">Tendências Anuais<\/h3>[\s\S]*?<\/BarChart>\s*<\/ResponsiveContainer>\s*<\/div>\s*<\/Card>\s*<\/div>/;

// 4. Remover \`yearlyData\` computation from DashboardScreen
const yearlyDataRegex = /const yearlyData = useMemo\(\(\) => \{[\s\S]*?taxa.*?\}\)\);\s*\}, \[data\]\);\s*if \(yearlyData\.length < 2\) return null;/;

// 5. Inserir o novo Componente TrendsScreen
const newComponentMarker = `// --- Telas de Lançamento e Dashboard ---`;

const trendsScreenComponent = `// --- Tela de Tendências Comparativas ---
function TrendsScreen({ data, storeConfig }) {
    const yearlyData = useMemo(() => {
        const months = {};

        data.forEach(item => {
            const d = item.date;
            if (!d || typeof d.getFullYear !== 'function') return;
            const key = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}\`;

            if (!months[key]) {
                months[key] = {
                    key,
                    name: \`\${d.toLocaleString('pt-BR', { month: 'short' })}/\${d.getFullYear().toString().substr(2)}\`,
                    TC_vendas: 0, TC_orcamentos: 0, TC_novosClientes: 0,
                    SGS_vendas: 0, SGS_orcamentos: 0, SGS_novosClientes: 0
                };
            }

            if (item.category === 'comercial') {
                const storePrefix = item.store === 'TC' ? 'TC_' : 'SGS_';
                
                // Vendas e Orçamentos
                if (item.action === 'venda' || item.action === 'retorno') months[key][storePrefix + 'vendas']++;
                if (item.action === 'orcamento') months[key][storePrefix + 'orcamentos']++;
                
                // Novos clientes: vendas ou retornos com clientType === 'nao_cliente'
                if ((item.action === 'venda' || item.action === 'retorno') && item.clientType === 'nao_cliente') {
                    months[key][storePrefix + 'novosClientes']++;
                }
            }
        });

        return Object.values(months)
            .sort((a, b) => a.key.localeCompare(b.key))
            .map(m => ({
                ...m,
                TC_taxa: m.TC_vendas + m.TC_orcamentos > 0 ? Math.round((m.TC_vendas / (m.TC_vendas + m.TC_orcamentos)) * 100) : 0,
                SGS_taxa: m.SGS_vendas + m.SGS_orcamentos > 0 ? Math.round((m.SGS_vendas / (m.SGS_vendas + m.SGS_orcamentos)) * 100) : 0
            }));
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
        <div className="pb-32 max-w-lg mx-auto bg-stone-50 min-h-screen">
            {/* Header */}
            <div className={\`p-6 \${THEME.bgGradient} text-white rounded-b-3xl shadow-lg relative overflow-hidden mb-6\`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">Tendências</h1>
                    </div>
                    <p className="text-sm font-medium text-white/90">Comparativo Anual - TC vs SGS</p>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {/* Legenda Geral */}
                <div className="flex justify-center gap-6 bg-white p-3 rounded-xl shadow-sm border border-stone-100 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ea580c]"></div>
                        <span className="text-sm font-bold text-stone-700">TC</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                        <span className="text-sm font-bold text-stone-700">SGS</span>
                    </div>
                </div>

                {/* Grafico 1 */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Evolução de Vendas</h4>
                    </div>
                    <div className="p-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Line type="monotone" dataKey="TC_vendas" name="TC" stroke="#ea580c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="SGS_vendas" name="SGS" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grafico 2 */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                        <h4 className="font-bold text-stone-700 text-sm uppercase">Tendência de Conversão (%)</h4>
                    </div>
                    <div className="p-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                                <Tooltip formatter={(v) => [\`\${v}%\`, 'Conversão']} />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Line type="monotone" dataKey="TC_taxa" name="TC" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="SGS_taxa" name="SGS" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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
                    <div className="p-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                                <Bar dataKey="TC_novosClientes" name="TC" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={16} />
                                <Bar dataKey="SGS_novosClientes" name="SGS" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Telas de Lançamento e Dashboard ---`;


if (!content.includes(newNav)) content = content.replace(navMarker, newNav);
if (!content.includes("view === 'trends'")) content = content.replace(appRenderMarker, newAppRender);
if (!content.includes("TrendsScreen({")) content = content.replace(newComponentMarker, trendsScreenComponent);
content = content.replace(trendsSectionRegex, "");
content = content.replace(yearlyDataRegex, "");

// Também precisamos adicionar 'trends' aos views permitidos no main App
const reqAccessMarker = `    const requestAccess = (targetView) => {
        if (targetView === 'dashboard' || targetView === 'comparison') {`;
const reqAccessNew = `    const requestAccess = (targetView) => {
        if (targetView === 'dashboard' || targetView === 'comparison' || targetView === 'trends') {`;

content = content.replace(reqAccessMarker, reqAccessNew);

if (!content.includes("Não foi possível renderizar a tela")) {
    console.log("Replacing success.");
}
writeFileSync(file, content, 'utf8');

