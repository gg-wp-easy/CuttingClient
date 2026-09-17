const {build, Platform, archFromString} = require('electron-builder');

function buildNumber() {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
}

const targets = {win: Platform.WINDOWS, linux: Platform.LINUX, mac: Platform.MAC};
const [platformName, archName] = process.argv.slice(2);
const target = targets[platformName];
if (!target) {
    console.error('Использование: node scripts/electron-package.cjs <win|linux|mac> [arch]');
    process.exit(1);
}

// electron-builder подставляет BUILD_NUMBER в ${buildVersion} (версия + номер сборки).
process.env.BUILD_NUMBER = buildNumber();

build({targets: target.createTarget(undefined, archName ? archFromString(archName) : undefined)})
    .then(files => {
        console.log(`Собрано (номер сборки ${process.env.BUILD_NUMBER}):`);
        for (const file of files) console.log(` - ${file}`);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
