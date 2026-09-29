# ЕртегіLand — Render арқылы жариялау

## 1. GitHub репозиторийі

https://github.com/new бетінде `ertegiland` атты репозиторий жасаңыз (Private таңдауға болады). `release/ErtegiLand-Render.zip` архивін ашып, ішіндегі файлдар мен бумаларды репозиторийге жүктеңіз. ZIP файлының өзін жүктемеңіз. `package.json` және `render.yaml` репозиторийдің түбірінде болуы керек.

Жергілікті `.env` файлын GitHub-қа жүктемеңіз. Дайын архивте API кілті, `.env`, node_modules және dist жоқ.

## 2. Render

https://dashboard.render.com бетінде тіркеліңіз. **New → Web Service** таңдап, GitHub репозиторийіне рұқсат беріңіз.

| Баптау | Мәні |
| --- | --- |
| Name | ertegiland немесе бос атау |
| Language | Node |
| Branch | main |
| Root Directory | бос қалдырыңыз |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |
| Instance Type | **Free** |
| Health Check Path | `/healthz` |

Environment бөліміне:

| Атауы | Мәні |
| --- | --- |
| `OPENAI_API_KEY` | өз OpenAI API кілтіңіз |
| `OPENAI_MODEL` | `gpt-4.1-mini` |
| `OPENAI_IMAGE_MODEL` | `gpt-image-1` |
| `ENABLE_IMAGE_GENERATION` | `true` (сурет генерациясын қосу) |
| `NODE_VERSION` | `22.16.0` |
| `NODE_ENV` | `production` |

**Create Web Service** басыңыз. Deploy `Live` болғанда Render көрсеткен `https://...onrender.com` сілтемесімен сайт ашылады. Компьютеріңіз қосулы тұруы қажет емес. Нақты адрес жарияланғаннан кейін ғана белгілі болады.

Баламасы: **New → Blueprint** арқылы репозиторийді таңдаңыз. `render.yaml` тегін Web Service баптауларын автоматты орнатады; API кілтін жеке енгізесіз.

Егер толық Flutter репозиторийін жүктесеңіз, қолмен Web Service құруда Root Directory мәнін `web-platform` етіп қойыңыз. Дайын архивке бұл қажет емес.

## Жергілікті іске қосу

Кілт автоматты түрде браузер кодынан `.env` файлына көшірілген. Кілтті енді `src/config/openai.ts` ішіне жазбаңыз.

```powershell
npm install
npm run build
npm start
```

http://127.0.0.1:3001. Сервер Render берген PORT портын және 0.0.0.0 адресін пайдаланады. `/api/ai/*` сұраныстары осы серверде өңделеді; фронтенд кілтті алмайды. Кілт жоқта демо режимі жұмыс істейді. Әзірлеу үшін `npm run dev` қолданылады.

## Тексеру

```powershell
npm test
npm run test:e2e
npm run build
```

Браузер тесттері 5174 портында жиналған сайт пен API-ді бірге тексереді. Тест кезінде OPENAI_API_KEY бос болады; ақылы сұраныс жіберілмейді.

## Тегін жоспардың шектеулері

Render Free 15 минут әрекетсіздіктен кейін ұйқыға кетеді. Келесі ашылу шамамен бір минут алуы мүмкін. OpenAI API шығыны хостингтен бөлек есептеледі. Кітаптар браузердің localStorage ішінде сақталады: басқа телефонда өздігінен пайда болмайды. API сұранысының минуттық шектеуі бір сервер процесінің жадында сақталады; бұл аккаунттағы төлем лимитін алмастырмайды.

Ресми құжаттар: https://render.com/docs/free және https://render.com/docs/deploy-node-express-app
