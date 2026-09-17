const fs = require('node:fs');
const path = require('node:path');
const {parse} = require('@babel/parser');
const root = path.resolve('src');
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];
const errors = [];
function walk(directory) {
    return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(file) : /\.(tsx?|jsx?)$/.test(file) ? [file] : [];
    });
}
function location(file) {
    const [layer, slice] = path.relative(root, file).split(path.sep);
    return {layer, slice: layer === 'app' || layer === 'shared' ? layer : slice};
}
function check(file, specifier) {
    if (!specifier.startsWith('.') && !layers.includes(specifier.split('/')[0])) return;
    const target = specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : path.resolve(root, specifier);
    const from = location(file), to = location(target);
    const fromIndex = layers.indexOf(from.layer), toIndex = layers.indexOf(to.layer);
    if (toIndex < 0) return;
    const error = message => errors.push(`${path.relative(root, file)} → ${specifier}: ${message}`);
    if (fromIndex < 0) {
        if (to.layer !== 'app') error('entry point must import app only');
        return;
    }
    if (toIndex < fromIndex) error('import from an upper layer');
    if (toIndex === fromIndex && from.slice !== to.slice) error('cross-import between sibling slices');
    const sameSlice = from.layer === to.layer && from.slice === to.slice;
    if (!sameSlice) {
        const parts = path.relative(root, target).split(path.sep);
        if (parts.length > 2 && !(parts.length === 3 && /^index(?:\.ts)?$/.test(parts[2]))) error('use the public API of the slice/segment');
        if (parts.length === 2 && !fs.existsSync(path.join(target, 'index.ts'))) error('missing public API index.ts');
    }
}
for (const file of walk(root)) {
    if (/\.jsx?$/.test(file)) {errors.push(`${file}: JavaScript in the TypeScript application`); continue;}
    const source = parse(fs.readFileSync(file, 'utf8'), {sourceType: 'module', plugins: ['typescript', 'jsx']});
    function visit(node) {
        if (!node || typeof node !== 'object') return;
        if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration', 'ImportExpression'].includes(node.type)
            && node.source?.type === 'StringLiteral') check(file, node.source.value);
        if (node.type === 'CallExpression' && (node.callee?.type === 'Import' || node.callee?.name === 'require')
            && node.arguments?.[0]?.type === 'StringLiteral') check(file, node.arguments[0].value);
        for (const [key, value] of Object.entries(node)) {
            if (['loc', 'comments', 'tokens'].includes(key)) continue;
            if (Array.isArray(value)) value.forEach(visit);
            else if (value && typeof value === 'object') visit(value);
        }
    }
    visit(source);

}
if (errors.length) {console.error(errors.join('\n')); process.exitCode = 1;}
else console.log('FSD: layer boundaries and public APIs verified.');
