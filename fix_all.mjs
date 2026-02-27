import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');
let changes = [];

// ============================================
// 1. Add missing imports: ChevronRight, History
// ============================================
const importTarget = `    List,\n    Clock\n} from 'lucide-react';`;
const importReplacement = `    List,\n    Clock,\n    ChevronRight,\n    History\n} from 'lucide-react';`;
if (!content.includes('ChevronRight,')) {
    content = content.replace(importTarget, importReplacement);
    changes.push('Added ChevronRight, History to imports');
}

// ============================================
// 2. Replace <Check with <CircleCheck (already imported as CircleCheck)
// ============================================
const beforeCheck = (content.match(/<Check className=/g) || []).length;
content = content.replace(/<Check className=/g, '<CircleCheck className=');
changes.push(`Replaced ${beforeCheck} <Check className= with CircleCheck`);

// ============================================
// 3. Fix "Não Cliente" background - change bg-stone-700 to bg-stone-50
// The nao_cliente button had wrong dark background
// ============================================
content = content.replace(
    `': 'border-stone-200 bg-stone-700 hover:bg-stone-100 hover:border-stone-400'}`,
    `': 'border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-400'}`
);
changes.push('Fixed Nao Cliente button bg from stone-700 to stone-50');

// ============================================
// 4. Ensure entryToEdit state exists in App function
// ============================================
const entryToEditState = `    const [entryToEdit, setEntryToEdit] = useState(null);`;
const appStateMarker = `    const [showSettings, setShowSettings] = useState(false);`;
if (!content.includes(entryToEditState)) {
    content = content.replace(appStateMarker, `${entryToEditState}\n    ${appStateMarker}`);
    changes.push('Added entryToEdit state to App');
}

// ============================================
// 5. Add EditEntryModal render to the App JSX return - near the notification
// This ensures the modal is always overlaid when entryToEdit is set
// ============================================
const notifRender = `            {notification && (`;
const editModalRenderBlock = `            {entryToEdit && (
                <EditEntryModal
                    entry={entryToEdit}
                    onClose={() => setEntryToEdit(null)}
                    onSave={handleUpdateEntry}
                />
            )}

            {notification && (`;
if (!content.includes('{entryToEdit && (')) {
    content = content.replace(notifRender, editModalRenderBlock);
    changes.push('Added EditEntryModal render trigger');
}

// ============================================
// 6. Fix the history step - replace onDelete with handleDeleteEntry (the actual function name in App)
// ============================================
const onDeleteInHistory = /onClick=\{.*onDelete\(entry\.id\).*\}/g;
// Find what function exists in App for delete
const deleteMatch = content.match(/const (handle[A-Za-z]*Delete[A-Za-z]*) = /);
let deleteFunction = 'handleDeleteEntry';
if (deleteMatch) {
    deleteFunction = deleteMatch[1];
    changes.push(`Found delete function: ${deleteFunction}`);
}

// ============================================
// 7. Make EntryScreen receive and pass onDelete and setEntryToEdit props
// ============================================
// The EntryScreen function signature - add the missing props
const entryScreenSig = `function EntryScreen({ storeData, onCommercialEntry, onServiceEntry, onWhatsAppEntry, entries, onDelete, onUpdate }) {`;
const existingSig = content.match(/function EntryScreen\(\{[^}]+\}\)/);
if (existingSig) {
    const sigStr = existingSig[0];
    if (!sigStr.includes('onDelete') || !sigStr.includes('onUpdate') || !sigStr.includes('setEntryToEdit')) {
        const newSig = sigStr.replace(/\}\)$/, ', onDelete, onUpdate, setEntryToEdit })');
        content = content.replace(sigStr, newSig);
        changes.push('Added onDelete, onUpdate, setEntryToEdit to EntryScreen signature');
    }
}

// ============================================
// 8. Update EntryScreen usage to pass the callbacks
// ============================================
const entryScreenUsage = content.match(/<EntryScreen\s[^/]*\/>/s);
if (entryScreenUsage) {
    const usageStr = entryScreenUsage[0];
    if (!usageStr.includes('onDelete=')) {
        const newUsage = usageStr.replace('/>', `\n                        onDelete={handleDeleteEntry}\n                        onUpdate={handleUpdateEntry}\n                        setEntryToEdit={setEntryToEdit}\n                    />`);
        content = content.replace(usageStr, newUsage);
        changes.push('Passed onDelete, onUpdate, setEntryToEdit to EntryScreen');
    }
}

fs.writeFileSync('src/App.jsx', content);
console.log('All changes applied:');
changes.forEach(c => console.log(' -', c));
