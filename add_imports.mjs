import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// The file uses CRLF (Windows) line endings
const target = `    List,\r\n    Clock\r\n} from 'lucide-react';`;
const replacement = `    List,\r\n    Clock,\r\n    ChevronRight,\r\n    History\r\n} from 'lucide-react';`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.jsx', content);
    console.log('SUCCESS: Added ChevronRight and History to imports');
    console.log('ChevronRight in file:', content.includes('ChevronRight'));
    console.log('History in file:', content.includes('History'));
} else {
    console.log('Target not found with CRLF. Dumping raw chars around Clock:');
    const idx = content.indexOf('Clock');
    console.log(JSON.stringify(content.substring(idx - 15, idx + 30)));
}
