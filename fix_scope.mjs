import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// ============================================
// 1. Remove the misplaced EditEntryModal block from INSIDE the App component
//    (it was placed there by fix_all.mjs, but entryToEdit is scoped to EntryScreen)
// ============================================
// The block looks like:
// {entryToEdit && (
//     <EditEntryModal
//         entry={entryToEdit}
//         onClose={() => setEntryToEdit(null)}
//         onSave={handleUpdateEntry}
//     />
// )}
const modalBlockPattern = /\s*\{entryToEdit && \(\s*<EditEntryModal\s+entry=\{entryToEdit\}[^}]+onClose=\{[^}]+\}[^}]+onSave=\{handleUpdateEntry\}\s+\/>\s*\)\}/s;
if (modalBlockPattern.test(content)) {
    content = content.replace(modalBlockPattern, '');
    console.log('Removed misplaced EditEntryModal from App render');
} else {
    console.log('EditEntryModal block in App not found by pattern - trying line search');
}

// ============================================
// 2. Remove the setEntryToEdit prop from the EntryScreen usage in App
//    (since setEntryToEdit is now local to EntryScreen, not App)
// ============================================
content = content.replace(/\s*setEntryToEdit=\{setEntryToEdit\}\s*(?=\/>)/g, '\n                    ');
console.log('Cleaned up setEntryToEdit prop from EntryScreen usage');

// ============================================
// 3. Verify remaining entryToEdit references
// ============================================
const matches = content.match(/entryToEdit/g) || [];
console.log(`entryToEdit references remaining: ${matches.length}`);

// Show them with context
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('entryToEdit')) {
        console.log(`  Line ${i + 1}: ${line.trim().substring(0, 80)}`);
    }
});

fs.writeFileSync('src/App.jsx', content);
console.log('Done!');
