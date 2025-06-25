# IQ Test Web Application

Moderní webová aplikace pro IQ testování s pokročilými psychometrickými funkcemi, adaptivní obtížností a anti-cheating systémem.

## 🚀 Funkce

- **Interaktivní IQ test** s 5 sekcemi (logické sekvence, prostorová inteligence, verbální reasoning, pracovní paměť, rychlost zpracování)
- **Časové limity** s vizuálním odpočtem
- **Adaptivní obtížnost** na základě výkonu uživatele
- **Automatické vyhodnocení** s převodem na standardní IQ škálu (100 ± 15)
- **Anti-cheating systém** s behavioral tracking
- **Detailní výsledky** s breakdown podle kategorií

## 🛠️ Technologie

### Frontend
- **React 18+** s TypeScript
- **Redux Toolkit** pro state management
- **Tailwind CSS** + HeadlessUI
- **Framer Motion** pro animace
- **Three.js** pro 3D objekty

### Backend
- **Node.js** + Express
- **PostgreSQL** databáze
- **Redis** cache
- **Prisma ORM**
- **JWT** authentication

### DevOps
- **Docker** containerization
- **GitHub Actions** CI/CD
- **Kubernetes** deployment

## 🏃 Rychlý start

### Požadavky
- Docker & Docker Compose
- Make (pro development commands)
- Git

### Instalace

1. **Klonování repozitáře**
```bash
git clone https://github.com/Swejzi/IQ-test-web.git
cd IQ-test-web
```

2. **Počáteční setup**
```bash
make setup
```

3. **Spuštění development prostředí**
```bash
make start
```

### Přístup k aplikaci

- **Frontend**: http://localhost:3000 ✅ BĚŽÍ
- **Backend API**: http://localhost:3001 ✅ BĚŽÍ
- **Health Check**: http://localhost:3001/health ✅ FUNKČNÍ
- **Databáze**: PostgreSQL s testovacími daty ✅ PŘIPRAVENA
- **Cache**: Redis ✅ FUNKČNÍ

## ✅ Aktuální stav aplikace

**Aplikace je úspěšně spuštěna a plně funkční s pokročilými funkcemi!**

### 🎯 Kompletní funkcionalita:
- ✅ **Interaktivní testování** - 6 typů otázek s vizuálními rozhraními
- ✅ **Behavioral tracking** - Anti-cheating systém sledující chování
- ✅ **Real-time progress** - Živé sledování postupu s časovači
- ✅ **Adaptivní obtížnost** - Otázky se přizpůsobují výkonu
- ✅ **Detailní výsledky** - IQ skóre, percentily, kategoriální analýza
- ✅ **Admin panel** - Správa otázek, uživatelů a statistik

### 🧠 Typy testových otázek:
1. **Logické sekvence** - Číselné a logické postupnosti
2. **Maticové úlohy** - Prostorové vzory a vztahy
3. **Prostorová rotace** - 3D vizualizace a mentální rotace
4. **Verbální analogie** - Vztahy mezi pojmy
5. **Pracovní paměť** - Zapamatování sekvencí
6. **Rychlost zpracování** - Rychlé rozpoznávání symbolů

### 📊 Analýza výsledků:
- **IQ skóre** s percentilním zařazením
- **Kategoriální breakdown** s úspěšností po oblastech
- **Časová analýza** (celkový čas, průměr, medián)
- **Obtížnostní analýza** podle úrovní otázek
- **Validity flags** pro detekci podvádění
- **Doporučení** pro zlepšení

### 🔧 Technické funkce:
- ✅ Kompletní backend API s Express.js + TypeScript
- ✅ React frontend s moderním designem
- ✅ PostgreSQL databáze s Prisma ORM
- ✅ Redis cache pro výkon
- ✅ WebSocket server pro real-time komunikaci
- ✅ Docker containerizace
- ✅ Testovací data (57 otázek, 3 uživatelé, norm groups)
- ✅ JWT autentizace a bezpečnost
- ✅ Responsive design s Tailwind CSS

### 👥 Testovací účty:
- **Admin**: admin@iqtest.com / admin123
- **Testovací uživatel**: test@example.com / test123
- **Anonymní**: možnost testování bez registrace

## 📋 Development Commands

```bash
# Setup a spuštění
make setup          # Počáteční nastavení projektu
make start          # Spuštění dev prostředí
make stop           # Zastavení kontejnerů
make restart        # Restart kontejnerů

# Testování
make test           # Spuštění všech testů
make test-unit      # Unit testy
make test-e2e       # E2E testy
make lint           # Code quality checks

# Databáze
make db-migrate     # Database migrations
make db-seed        # Seed test data
make db-reset       # Reset databáze
make db-studio      # Prisma Studio

# Utility
make logs           # Zobrazit logy
make backup         # Backup databáze
make clean          # Cleanup Docker resources
```

## 📁 Struktura projektu

```
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── middleware/     # Express middleware
│   ├── prisma/             # Database schema & migrations
│   └── tests/              # Backend tests
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   └── services/       # API services
│   └── public/             # Static assets
├── docker-compose.yml      # Development environment
├── Makefile               # Development commands
└── README.md              # This file
```

## 🧪 Testování

### Unit testy
```bash
make test-unit
```

### E2E testy
```bash
make test-e2e
```

### Coverage report
```bash
make test
```

## 🚀 Deployment

### Staging
```bash
make deploy-staging
```

### Production
```bash
make deploy-prod
```

## 🔒 Bezpečnost

- JWT authentication
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection
- CORS configuration

## 📊 Monitoring

- Health checks pro všechny služby
- Performance monitoring
- Error tracking s Sentry
- Metrics collection

## 🤝 Přispívání

1. Fork repozitář
2. Vytvořte feature branch (`git checkout -b feature/amazing-feature`)
3. Commit změny (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otevřete Pull Request

## 📝 Licence

Tento projekt je licencován pod MIT licencí - viz [LICENSE](LICENSE) soubor.

## 👥 Autoři

- **Swejzi** - *Initial work* - [Swejzi](https://github.com/Swejzi)

## 🙏 Poděkování

- Inspirace z profesionálních psychometrických testů
- Open source komunita za skvělé nástroje
