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
    { from: /\bbg-zinc-950\b/g, to: 'bg-white dark:bg-zinc-950' },
    { from: /\bbg-zinc-900\b/g, to: 'bg-zinc-50 dark:bg-zinc-900' },
    { from: /\bbg-zinc-800\b/g, to: 'bg-zinc-200 dark:bg-zinc-800' },
    { from: /\bborder-zinc-100\b/g, to: 'border-zinc-950 dark:border-zinc-100' },
    { from: /\bborder-zinc-800\b/g, to: 'border-zinc-950 dark:border-zinc-800' },
    { from: /\bborder-t-4 border-zinc-800\b/g, to: 'border-t-4 border-zinc-950 dark:border-zinc-800' },
    { from: /\btext-white\b/g, to: 'text-zinc-950 dark:text-white' },
    { from: /\btext-zinc-100\b/g, to: 'text-zinc-950 dark:text-zinc-100' },
    { from: /\btext-zinc-400\b/g, to: 'text-zinc-600 dark:text-zinc-400' },
    { from: /\bshadow-\[([0-9px_]+)rgba\(255,255,255,1\)\]\b/g, to: 'shadow-[$1rgba(0,0,0,1)] dark:shadow-[$1rgba(255,255,255,1)]' },
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Only apply if it doesn't already have dark: variants to avoid double applying
    // Actually, simple regex might double apply if we run it twice, but we run it once.
    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
