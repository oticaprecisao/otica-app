import { readFileSync, writeFileSync } from 'fs';

const file = 'src/App.jsx';
let content = readFileSync(file, 'utf8');

// 1. ADD SETDOC IMPORT
const importMarker = `  doc, 
  writeBatch, 
  onSnapshot, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';`;
const importNew = `  doc, 
  writeBatch, 
  onSnapshot, 
  query, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';`;
content = content.replace(importMarker, importNew);

// 2. YEARLY DATA FIX (SORT AND NOVOS CLIENTES)
const yearlyOld = `            if (item.category === 'comercial') {
                months[key].total++;
                // AJUSTE GLOBAL: Retorno conta como venda para gráficos anuais
                if (item.action === 'venda' || item.action === 'retorno') months[key].vendas++;
                if (item.action === 'orcamento') months[key].orcamentos++;
            }
        });

        return Object.values(months)
            .sort((a, b) => {
                const [ma, ya] = a.name.split('/');
                const [mb, yb] = b.name.split('/');
                return new Date(20 + ya, "janfebmaraprmayjunjulaugsepoctnovdec".indexOf(ma.toLowerCase()) / 3) - new Date(20 + yb, "janfebmaraprmayjunjulaugsepoctnovdec".indexOf(mb.toLowerCase()) / 3);
            })`;

const yearlyNew = `            if (item.category === 'comercial') {
                months[key].total++;
                // AJUSTE GLOBAL: Retorno conta como venda para gráficos anuais
                if (item.action === 'venda' || item.action === 'retorno') months[key].vendas++;
                if (item.action === 'orcamento') months[key].orcamentos++;
                // Novos clientes
                if ((item.action === 'venda' || item.action === 'retorno') && item.clientType === 'nao_cliente') months[key].novosClientes++;
            }
        });

        return Object.values(months)
            .sort((a, b) => a.key.localeCompare(b.key))`;

if (content.includes(yearlyOld.substring(100, 200))) {
    content = content.replace(yearlyOld, yearlyNew);
    // Also inject the `months[key] = { ... novosClientes: 0}`
    const initOld = `months[key] = { key, name: \`\${d.toLocaleString('pt-BR', { month: 'short' })}/\${d.getFullYear().toString().substr(2)}\`, vendas: 0, orcamentos: 0, total: 0 };`;
    const initNew = `months[key] = { key, name: \`\${d.toLocaleString('pt-BR', { month: 'short' })}/\${d.getFullYear().toString().substr(2)}\`, vendas: 0, orcamentos: 0, total: 0, novosClientes: 0 };`;
    content = content.replace(initOld, initNew);
}


// 3. HOJE COUNT FIX
const hojeOld = `<span className="text-lg font-black text-orange-600">{todayStats.vendas + todayStats.orcamentos + todayStats.retornos}</span>`;
const hojeNew = `<span className="text-lg font-black text-orange-600">{todayStats.atendimentos}</span>`;
content = content.replace(hojeOld, hojeNew);

// 4. FIRESTORE SYNC FOR STORECONFIG
const syncOld = `    useEffect(() => {
        const savedConfig = localStorage.getItem('optical_store_config_v2');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                setStoreConfig(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Erro ao carregar config:", e);
            }
        }
    }, []);

    // Função para atualizar e salvar configurações
    const handleUpdateConfig = (newConfig) => {
        setStoreConfig(newConfig);
        localStorage.setItem('optical_store_config_v2', JSON.stringify(newConfig));
    };`;

const syncNew = `    useEffect(() => {
        const db = getFirestore();
        const configRef = doc(db, 'system_configs', 'store_config_v2');
        
        const unsubscribe = onSnapshot(configRef, (docSnap) => {
            if (docSnap.exists()) {
                setStoreConfig(prev => ({ ...prev, ...docSnap.data() }));
            } else {
                setDoc(configRef, storeConfig);
            }
        });

        return () => unsubscribe();
    }, []);

    // Função para atualizar e salvar configurações
    const handleUpdateConfig = async (newConfig) => {
        setStoreConfig(newConfig);
        const db = getFirestore();
        try {
            await setDoc(doc(db, 'system_configs', 'store_config_v2'), newConfig);
        } catch (e) {
            console.error('Erro ao salvar config no Firestore:', e);
        }
    };`;
content = content.replace(syncOld, syncNew);

// 4.1 Remove the test tools
const toolsRegex = /\{\/\* --- FERRAMENTAS DE TESTE ---\*\/\}[\s\S]*?<div className="bg-stone-50 p-4 rounded-xl space-y-3">[\s\S]*?Zerar Dados de Hoje<\/button>\s*<\/div>\s*<\/div>/;
content = content.replace(toolsRegex, "");

writeFileSync(file, content, 'utf8');
console.log('Recovery Complete.');
