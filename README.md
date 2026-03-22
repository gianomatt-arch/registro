# Registro Elettronico 📚

Un'applicazione web completa per la gestione dei voti scolastici costruita con **Angular**, **Flask** e **Keycloak**.

## 🎯 Caratteristiche Principali

### Ruolo Docente 👨‍🏫
- Inserire nuovi voti per gli studenti (nome studente, materia, voto)
- Visualizzare i voti di tutti gli studenti con dettagli completi
- Gestione centralizzata del registro

### Ruolo Studente 👨‍🎓
- Visualizzare solo i propri voti personali
- Controllare la media dei voti
- Visualizzare il dettaglio delle valutazioni per materia

## 🛠️ Tech Stack

- **Frontend**: Angular 17 con TypeScript
- **Backend**: Flask con PyMySQL
- **Autenticazione**: Keycloak con OAuth2/OIDC
- **Database**: MySQL
- **Container**: Docker & Docker Compose

## 📋 Prerequisiti

- Docker e Docker Compose
- Node.js 18+ (per sviluppo locale senza Docker)
- Python 3.11+ (per sviluppo locale senza Docker)

## 🚀 Guida Rapida

### 1. Clonare il Repository

```bash
cd /workspaces/registro
```

### 2. Avviare i Container

```bash
docker-compose up -d
```

Questo avvierà:
- **Keycloak**: http://localhost:8080
- **PostgreSQL**: per Keycloak (porta 5432)
- **MySQL**: per l'applicazione (porta 3306)
- **Flask Backend**: http://localhost:5000
- **Angular Frontend**: http://localhost:4200

### 3. Configurare Keycloak

```bash
chmod +x setup-keycloak.sh
./setup-keycloak.sh
```

Questo script:
- Crea il realm `registro-realm`
- Configura i client (frontend e backend)
- Crea i ruoli docente e studente
- Crea utenti di test

### 4. Accedere all'Applicazione

Apri http://localhost:4200 nel browser

**Account di Test:**
- **Docente**: `docente1` / `password123`
- **Studente**: `studente1` / `password123`

## 📁 Struttura del Progetto

```
registro/
├── docker-compose.yml          # Configurazione Docker
├── setup-keycloak.sh          # Script di setup Keycloak
├── README.md                  # Questo file
│
├── registroBackend/           # Backend Flask
│   ├── app.py                 # Applicazione principale
│   ├── auth.py                # Logica di autenticazione
│   ├── database.py            # Wrapper MySQL
│   ├── requirements.txt        # Dipendenze Python
│   └── Dockerfile             # Immagine Docker
│
└── registroFrontend/          # Frontend Angular
    ├── src/
    │   ├── app/
    │   │   ├── components/    # Componenti Angular
    │   │   │   ├── login/
    │   │   │   ├── docente/
    │   │   │   ├── studente/
    │   │   │   └── accesso-negato/
    │   │   ├── services/      # Servizi
    │   │   │   ├── auth.service.ts
    │   │   │   └── voti.service.ts
    │   │   ├── guards/        # Route Guards
    │   │   │   └── auth.guard.ts
    │   │   ├── interceptors/  # HTTP Interceptors
    │   │   └── app.module.ts  # Modulo principale
    │   ├── index.html
    │   ├── main.ts
    │   └── styles.css
    ├── package.json
    ├── angular.json
    └── tsconfig.json
```

## 🔐 Sicurezza e Routing

### Route Guards

- **DocenteGuard**: Protegge le route docente
- **StudenteGuard**: Protegge le route studente
- **AuthGuard**: Verifica l'autenticazione generale

### Routing

```
/                    → Login (reindirizza a /login)
/login              → Pagina di login
/docente            → Pannello docente (requiere ruolo docente)
/studente           → Pannello studente (requiere ruolo studente)
/accesso-negato     → Pagina di errore (accesso negato)
```

#### Comportamento di Sicurezza

- Se un utente docente tenta di accedere a `/studente`, viene reindirizzato a `/accesso-negato`
- Se un utente studente tenta di accedere a `/docente`, viene reindirizzato a `/accesso-negato`
- I token assenti reindirizzano a `/login`

## 🔌 API Backend

### Autenticazione

```http
GET /auth/user
Authorization: Bearer {token}
```

Restituisce i dati dell'utente autenticato.

### Docente

```http
GET /docente/voti
GET /docente/studenti
POST /docente/voto
{
  "nome_studente": "studente1",
  "materia": "Matematica",
  "voto": 8.5
}
```

### Studente

```http
GET /studente/voti
GET /studente/profile
```

## 🏗️ Sviluppo Locale (Senza Docker)

### Backend Flask

```bash
cd registroBackend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### Frontend Angular

```bash
cd registroFrontend
npm install
ng serve
```

## 🔧 Configurazione Keycloak

### Accedi a Keycloak Admin

1. Apri http://localhost:8080
2. Clicca su "Administration Console"
3. Login: `admin` / `admin_password`

### Gestire Utenti

1. Vai a "Realm" → "Users"
2. Clicca "Add user"
3. Compila i dati
4. Nella tab "Role Mapping" aggiungi i ruoli

### Gestire Ruoli

1. Vai a "Realm" → "Roles"
2. Crea/modifica ruoli disponibili

## 🐛 Troubleshooting

### Keycloak non avvia

```bash
# Verifica che le porte non siano occupate
lsof -i :8080  # Keycloak
lsof -i :5432  # PostgreSQL

# Elimina i container e riavvia
docker-compose down -v
docker-compose up -d
```

### Errore di connessione database

```bash
# Verifica che MySQL sia pronto
docker-compose logs mysql

# Attendi qualche secondo e riprova
sleep 10
```

### Token non valido

1. Cancella localStorage: `localStorage.clear()`
2. Esegui di nuovo il login
3. Assicurati che Keycloak sia raggiungibile

## 📦 Variabili d'Ambiente

Se necessario personalizzare, modifica `docker-compose.yml`:

```yaml
environment:
  DB_HOST: mysql
  DB_USER: registro_user
  DB_PASSWORD: registro_password
  DB_NAME: registro_db
  KEYCLOAK_SERVER_URL: http://keycloak:8080
  KEYCLOAK_REALM: registro-realm
```

## 🐳 Comandi Docker Útili

```bash
# Mostra i log di un servizio
docker-compose logs -f flask
docker-compose logs -f keycloak

# Entra in un container
docker-compose exec mysql bash
docker-compose exec flask bash

# Riavvia l'applicazione
docker-compose restart

# Arresta tutto
docker-compose down

# Arresta e rimuovi volumi
docker-compose down -v
```

## 📊 Database Schema

### Tabella `studenti`
```sql
- id (INT, PK)
- username (VARCHAR, UNIQUE)
- nome (VARCHAR)
- cognome (VARCHAR)
- email (VARCHAR)
- created_at (TIMESTAMP)
```

### Tabella `docenti`
```sql
- id (INT, PK)
- username (VARCHAR, UNIQUE)
- nome (VARCHAR)
- cognome (VARCHAR)
- email (VARCHAR)
- created_at (TIMESTAMP)
```

### Tabella `voti`
```sql
- id (INT, PK)
- id_studente (INT, FK)
- materia (VARCHAR)
- voto (DECIMAL)
- data_inserimento (TIMESTAMP)
- id_docente (INT, FK)
```

## 🚀 Deployment

Per il deployment in produzione:

1. **Configura Keycloak**: usa un reverse proxy (nginx) con SSL
2. **Database**: usa un'istanza MySQL gestita (AWS RDS, Azure, ecc.)
3. **Frontend**: distribuisci su cloud storage (S3, Azure Blob)
4. **Backend**: usa un servizio di container (ECS, App Service, Kubernetes)

## 📝 Note Importanti

- Gli account di test sono per demo solamente
- In produzione, integra con Keycloak completo tramite OAuth2/OIDC
- Abilita HTTPS in produzione
- Configura CORS correttamente per il tuo dominio
- Usa variabili d'ambiente per secrets

## 📄 Licenza

MIT License - vedi LICENSE per dettagli

## 👥 Supporto

Per problemi o domande, crea un issue nel repository.

---

**Creato con ❤️ per la gestione moderna dei registri scolastici**
