const {spawn, execFile} = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const children = new Set();
let stopping = false;
function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    for (const child of children) {
        if (process.platform === 'win32' && child.pid) execFile('taskkill', ['/PID', String(child.pid), '/T', '/F']);
        else child.kill('SIGTERM');
    }
    process.exitCode = code;
}
function launch(script, args = [], env = process.env) {
    const child = spawn(process.execPath, [path.join(root, script), ...args], {cwd: root, stdio: 'inherit', env});
    children.add(child);
    child.on('error', error => {console.error(error.message); stop(1);});
    child.on('exit', code => {children.delete(child); stop(code ?? 0);});
    return child;
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
async function start() {
    // Refuse an occupied port instead of accidentally loading another application.
    try {
        await fetch('http://localhost:3000', {signal: AbortSignal.timeout(500)});
        throw new Error('Порт 3000 занят. Остановите npm start перед запуском electron:dev.');
    } catch (error) {
        if (error.message.includes('Порт 3000')) throw error;
    }
    launch('node_modules/vite/bin/vite.js');
    const deadline = Date.now() + 30000;
    while (!stopping && Date.now() < deadline) {
        try {
            const response = await fetch('http://localhost:3000/@vite/client', {signal: AbortSignal.timeout(500)});
            if (response.ok) {
                launch('node_modules/electron/cli.js', ['.'], {...process.env, ELECTRON_RENDERER_URL: 'http://localhost:3000'});
                return;
            }
        } catch { /* Vite is still starting. */ }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!stopping) throw new Error('Vite не запустился за 30 секунд.');
}
start().catch(error => {console.error(error.message); stop(1);});
