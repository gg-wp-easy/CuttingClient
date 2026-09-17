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
`build` в `package.json`): `electron:package:win` собирает NSIS-установщик,
`electron:package:linux` — AppImage, `electron:package:mac` — dmg. Результат
кладётся в `dist/`. Серверный исполняемый файл должен соответствовать целевой
операционной системе.
История, журнал службы и сохраняемый через меню Electron заказ располагаются
в каталоге `app.getPath('userData')`. Старый файл `public/local_data.json`
поддерживается как источник для первого восстановления заказа.
