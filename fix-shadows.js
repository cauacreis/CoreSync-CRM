const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'coresync-web', 'src'));

const replacements = [
    // Replace any leftover white shadows that don't have dark: prefix
    { 
      from: /shadow-\[([0-9px_]+)rgba\(255,255,255,1\)\]/g, 
      to: (match, p1) => {
        // Prevent double replacement if it's already inside a dark:shadow-
        return `shadow-[${p1}rgba(0,0,0,1)] dark:shadow-[${p1}rgba(255,255,255,1)]`;
      }
    },
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // First, temporarily remove the ones we already fixed so we don't double fix
    // Wait, simpler: if the line contains dark:shadow, ignore the replacement on that line?
    // Actually, we can just replace 'shadow-[...rgba(255...)]' that does NOT have 'dark:' right before it.
    
    content = content.replace(/(?<!dark:)shadow-\[([0-9px_]+)rgba\(255,255,255,1\)\]/g, 'shadow-[$1rgba(0,0,0,1)] dark:shadow-[$1rgba(255,255,255,1)]');
    // Also fix any border-white or border-zinc-100 that was missed
    content = content.replace(/(?<!dark:)border-zinc-100/g, 'border-zinc-950 dark:border-zinc-100');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
