import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Fix the duplicate parameter issue in EntryScreen signature
// Replace any malformed signature that has onDelete/onUpdate twice
const brokenSig = /function EntryScreen\(\{[^}]+onDelete,[^}]+onDelete,[^}]+\}\)/s;
const match = content.match(brokenSig);
if (match) {
    const cleanSig = `function EntryScreen({ storeData, onSave, entries, onDelete, onUpdate, setEntryToEdit })`;
    content = content.replace(brokenSig, cleanSig);
    console.log('Fixed duplicate params in EntryScreen signature');
} else {
    // Try a different approach - just find and replace the line directly
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('function EntryScreen(') && lines[i].includes('onDelete')) {
            const original = lines[i];
            lines[i] = `function EntryScreen({ storeData, onSave, entries, onDelete, onUpdate, setEntryToEdit }) {`;
            console.log(`Fixed line ${i + 1}: ${original.trim().substring(0, 80)}`);
            break;
        }
    }
    content = lines.join('\n');
}

// Also remove the conflicting local setEntryToEdit state inside EntryScreen
// (find the line that declares it as a local useState and comment it out)
const brokenLocalState = /const \[entryToEdit, setEntryToEdit\] = useState\(null\);.*?abrir modal/s;
if (brokenLocalState.test(content)) {
    content = content.replace(
        /const \[entryToEdit, setEntryToEdit\] = useState\(null\);.*?abrir modal/s,
        '// entryToEdit state is managed by the parent App component'
    );
    console.log('Removed conflicting local setEntryToEdit state');
}

// Check if _setEntryToEdit got created from a previous run, clean it up too
content = content.replace(
    'const [entryToEdit, _setEntryToEdit] = useState(null); // Estado local (não usado diretamente)',
    '// entryToEdit state managed by parent'
);

fs.writeFileSync('src/App.jsx', content);
console.log('Done!');
