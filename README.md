# CutOpt

Настольный клиент расчёта раскроя: React + TypeScript + Electron.
Интерфейс организован по Feature-Sliced Design; [описание архитектуры](docs/architecture.md).
Сервер Python расположен в отдельном репозитории `Cutting/` внутри рабочей папки.

## Разработка

```sh
npm ci
npm start
```

React запускается на `http://localhost:3000`. Для реальных расчётов запустите
Python-службу на порту 8000. При необходимости задайте другой адрес через
`REACT_APP_API_URL` в `.env.local` до запуска или сборки клиента.

В отдельном терминале для настольного режима:

```sh
npm run electron:start
```

Команда сначала компилирует `electron/main.ts` в `dist-electron/main.js`.
Если в `public/server/dist/` есть `main.exe` (Windows) или `main` (Linux/macOS),
Electron запускает его дочерним процессом. Альтернативный путь можно задать
переменной `CUTTING_SERVER_PATH`. В режиме разработки при отсутствии исполняемого
файла используется отдельно запущенная служба.

## Проверка и сборка

```sh
npm run typecheck
npm run check:fsd
npm test -- --runInBand
npm run build
```

Результат: `build/` — веб-клиент и статические ресурсы, `dist-electron/` —
основной процесс Electron. Генерируемые файлы не хранятся в Git.

Для Windows соберите Python-сервер по инструкции `Cutting/OPTIMIZER.md`, положите
его в `public/server/dist/main.exe`, затем выполните:

```sh
npm run electron:package:win
```

Сборка дистрибутивов выполняется через `electron-builder` (конфигурация — секция
`build` в `package.json`, запуск — `scripts/electron-package.cjs`):
`electron:package:win` собирает NSIS-установщик, `electron:package:linux` —
AppImage, `electron:package:mac` — dmg. Результат кладётся в `release/` —
файл называется `NK-CutOpt-<версия>.<номер сборки>-<arch>.<ext>`, где номер
сборки — дата и время в формате `ГГГГММДДЧЧММ` (локальное время машины,
на которой собирали). Серверный исполняемый файл должен соответствовать
целевой операционной системе. Приложение упаковано в `asar` с распаковкой
каталога `build/server` — так серверный исполняемый файл остаётся отдельным
файлом, пригодным для запуска дочерним процессом.

`electron:package:win` собирайте на Windows: electron-builder встраивает иконку
и версию в `.exe` через `rcedit`/`signtool`, а с Linux/macOS для этого нужен Wine
(`wine`, не входит в зависимости проекта). `electron:package:linux` и
`electron:package:mac` не требуют Wine и собираются на своей платформе.
История, журнал службы и сохраняемый через меню Electron заказ располагаются
в каталоге `app.getPath('userData')`. Старый файл `public/local_data.json`
поддерживается как источник для первого восстановления заказа.
