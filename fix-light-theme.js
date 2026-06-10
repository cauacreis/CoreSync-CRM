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
    { from: /\bbg-white dark:bg-zinc-950\b/g, to: 'bg-zinc-100 dark:bg-zinc-950' },
    { from: /\bbg-zinc-50 dark:bg-zinc-900\b/g, to: 'bg-white dark:bg-zinc-900' },
    { from: /\bbg-zinc-50 dark:bg-zinc-950\b/g, to: 'bg-zinc-100 dark:bg-zinc-950' },
    { from: /\btext-lime-400\b/g, to: 'text-lime-600 dark:text-lime-400' },
    { from: /\btext-purple-400\b/g, to: 'text-purple-600 dark:text-purple-400' },
    // Fix the accidental purple replacement in DashboardScreen Block 1
    { from: /text-purple-600 dark:text-purple-400">\{formatCurrency\(metrics\.totalPipelineValue\)\}/g, to: 'text-lime-600 dark:text-lime-400">{formatCurrency(metrics.totalPipelineValue)}' },
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
