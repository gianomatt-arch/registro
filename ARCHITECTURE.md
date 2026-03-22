# Architettura Registro Elettronico 🏗️

## Panoramica Generale

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                         │
│                  (localhost:4200)                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Angular App     │
                    │ (Port 4200)     │
                    │                 │
                    ├─ Routing        │
                    ├─ Guards         │
                    ├─ Components     │
                    └─────────┬────────┘
                              │ HTTP
                    ┌─────────▼─────────┐
                    │   Flask Backend   │
                    │   (Port 5000)     │
                    │                   │
                    ├─ Auth (Keycloak)  │
                    ├─ API Endpoints    │
                    └────────┬──────────┘
                             │ PyMySQL
        ┌────────────────────┴────────────────────┐
        │                                         │
   ┌────▼─────┐                            ┌─────▼──────┐
   │  MySQL   │                            │  Keycloak  │
   │ (Port    │                            │  (Port     │
   │  3306)   │                            │   8080)    │
   └──────────┘                            │            │
                                      ┌────┴─────────────┐
                                      │  PostgreSQL      │
                                      │  (Port 5432)     │
                                      └──────────────────┘
```

## Componenti Principali

### 1. **Frontend Angular** 🎨
**Ubicazione**: `/registroFrontend`

#### Moduli
- **AppModule**: Modulo radice
- **AppRoutingModule**: Gestisce il routing

#### Componenti
| Componente | Path | Descrizione |
|-----------|------|-------------|
| LoginComponent | /login | Pagina di accesso |
| DocenteComponent | /docente | Pannello docente |
| StudenteComponent | /studente | Pannello studente |
| AccessoDenegatoComponent | /accesso-negato | Pagina errore 403 |

#### Servizi
- **AuthService**: Gestisce autenticazione e utente corrente
- **VotiService**: Comunica con API backend per voti

#### Guard
- **DocenteGuard**: Protegge route docente
- **StudenteGuard**: Protegge route studente

#### Interceptor
- **TokenInterceptor**: Aggiunge token JWT alle richieste HTTP

### 2. **Backend Flask** 🐍
**Ubicazione**: `/registroBackend`

#### Struttura
```
registroBackend/
├── app.py          # Applicazione Flask principale
├── auth.py         # Classe KeycloakAuth + decorators
├── database.py     # Classe DatabaseWrapper
├── requirements.txt
└── Dockerfile
```

#### Moduli

**app.py** - La main app Flask
- Inizializza database e Keycloak
- Definisce tutti i route HTTP
- Gestisce CORS

**auth.py** - Autenticazione e autorizzazione
- `KeycloakAuth`: Verifica e decodifica token JWT
- `@token_required`: Decorator per proteggere endpoint
- `@role_required`: Decorator per verificare ruoli

**database.py** - Wrapper MySQL
- `DatabaseWrapper`: Class per gestire connessioni MySQL
- Usa context manager per chiudere connessioni
- Metodi per CRUD su studenti, docenti, voti

#### Route API

**Pubbliche**
- `GET /health` - Health check

**Autenticate**
- `GET /auth/user` - Ottiene dati utente autenticato

**Docente only**
- `GET /docente/voti` - Tutti i voti
- `POST /docente/voto` - Inserisce nuovo voto
- `GET /docente/studenti` - Lista studenti

**Studente only**
- `GET /studente/voti` - Propri voti
- `GET /studente/profile` - Profilo studente

**Admin/Setup**
- `POST /admin/studenti/sync` - Crea profilo studente
- `POST /admin/docenti/sync` - Crea profilo docente

### 3. **Keycloak** 🔐
**Ubicazione**: Container Docker

#### Struttura Realm
```
registro-realm
├── Roles
│   ├── docente
│   └── studente
├── Clients
│   ├── registro-frontend (public, SPA)
│   └── registro-backend (confidential, service)
└── Users
    ├── docente1
    │   ├── Email: docente1@example.com
    │   ├── Roles: [docente]
    │   └── Password: password123
    └── studente1
        ├── Email: studente1@example.com
        ├── Roles: [studente]
        └── Password: password123
```

#### Token JWT
Quando un utente accede, Keycloak rilascia un JWT con:
```json
{
  "preferred_username": "docente1",
  "email": "docente1@example.com",
  "name": "Mario Rossi",
  "realm_access": {
    "roles": ["docente"]
  },
  "exp": 1234567890
}
```

### 4. **Database MySQL** 💾

#### Schema

**Tabella `studenti`**
```sql
CREATE TABLE studenti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cognome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabella `docenti`**
```sql
CREATE TABLE docenti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cognome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabella `voti`**
```sql
CREATE TABLE voti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_studente INT NOT NULL,
  materia VARCHAR(255) NOT NULL,
  voto DECIMAL(5, 2) NOT NULL,
  data_inserimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_docente INT,
  FOREIGN KEY (id_studente) REFERENCES studenti(id),
  FOREIGN KEY (id_docente) REFERENCES docenti(id)
);
```

## Flusso di Autenticazione 🔄

### 1. **Login**
```
Utente → LoginComponent
    ↓
Genera mock token (dev)
    ↓
Salva token in localStorage
    ↓
Chiama GET /auth/user
    ↓
Flask verifica token
    ↓
Carica user info da token
    ↓
AuthService.currentUser$ = user
    ↓
Router → /docente o /studente
```

### 2. **Richieste Successive**
```
Component → VotiService
    ↓
TokenInterceptor aggiunge Authorization header
    ↓
GET /docente/voti + Bearer {token}
    ↓
Flask verifica token (token_required)
    ↓
Flask verifica ruolo (role_required)
    ↓
Restituisce dati
```

## Routing e Guard 🛡️

### Routing Map
```
/                  → redirect /login
/login             → LoginComponent (always)
/docente           → DocenteComponent (DocenteGuard)
/studente          → StudenteComponent (StudenteGuard)
/accesso-negato    → AccessoDenegatoComponent (always)
/**                → redirect /accesso-negato
```

### Guard Logic

**DocenteGuard**
```
user.roles.includes('docente') ?
  ✓ allow
  ✗ redirect /accesso-negato
```

**StudenteGuard**
```
user.roles.includes('studente') ?
  ✓ allow
  ✗ redirect /accesso-negato
```

## Flusso Docente: Inserire Voto

```
┌──────────────────────────────────────┐
│ DocenteComponent Form                │
│ - Seleziona studente dropdown        │
│ - Inserisce materia                  │
│ - Inserisce voto                     │
│ - Click "Salva Voto"                 │
└────────────┬─────────────────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ VotiService            │
    │ insertVoto(...)        │
    │ POST /docente/voto     │
    └────────────┬───────────┘
                 │
        ┌────────▼────────────┐
        │ HTTP + Token         │
        │ → Flask Backend      │
        └────────┬─────────────┘
                 │
        ┌────────▼──────────────────┐
        │ Flask: POST /docente/voto  │
        │ 1. token_required          │
        │ 2. role_required('docente')│
        │ 3. Cerca studente          │
        │ 4. INSERT voto             │
        │ 5. Commit MySQL            │
        │ 6. Response 201            │
        └────────┬───────────────────┘
                 │
        ┌────────▼──────────────────┐
        │ MySQL: INSERT voti         │
        │ - id_studente              │
        │ - materia                  │
        │ - voto                     │
        │ - id_docente               │
        │ - data_inserimento         │
        └────────┬───────────────────┘
                 │
        ┌────────▼──────────────────┐
        │ Response HTTP 201          │
        │ ← Flask                    │
        └────────┬───────────────────┘
                 │
        ┌────────▼──────────────────┐
        │ DocenteComponent           │
        │ loadVoti()                 │
        │ Refresh lista              │
        └────────────────────────────┘
```

## Flusso Studente: Visualizzare Voti

```
┌──────────────────────────┐
│ StudenteComponent        │
│ ngOnInit() → loadVoti()  │
└─────────┬────────────────┘
          │
    ┌─────▼──────────────────┐
    │ VotiService            │
    │ getMyVoti()            │
    │ GET /studente/voti     │
    └─────┬──────────────────┘
          │
    ┌─────▼──────────────────┐
    │ HTTP + Token           │
    │ → Flask Backend        │
    └─────┬──────────────────┘
          │
    ┌─────▼─────────────────────┐
    │ Flask: GET /studente/voti  │
    │ 1. token_required          │
    │ 2. role_required('studente')
    │ 3. Cerca studente per user │
    │ 4. SELECT voti             │
    │ 5. Response con voti       │
    └─────┬─────────────────────┘
          │
    ┌─────▼──────────────────┐
    │ MySQL: SELECT voti      │
    │ WHERE id_studente = ?   │
    │ ORDER BY data DESC      │
    └─────┬──────────────────┘
          │
    ┌─────▼──────────────────┐
    │ Response JSON array     │
    │ ← Flask                │
    └─────┬──────────────────┘
          │
    ┌─────▼──────────────────┐
    │ StudenteComponent       │
    │ Visualizza tabella      │
    │ Calcola media           │
    │ Mostra statistiche      │
    └──────────────────────────┘
```

## Sicurezza 🔒

### Token JWT
- Decodificato lato client per leggere ruoli
- Verificato lato server prima di eseguire azioni
- Scade automaticamente (1 ora di default)

### Protezione Endpoint
```python
@app.route('/docente/voti')
@token_required  # Verifica token presente e valido
@role_required('docente')  # Verifica ruolo
def get_all_voti():
    # Codice endpoint
```

### CORS
- Frontend su localhost:4200
- Backend su localhost:5000
- Flask ha CORS abilitato per localhost

### Isolamento Dati
- Studente vede solo propri voti (filtered in query)
- Docente vede tutti i voti
- Backend verifica ruoli prima di restituire dati

## Variabili d'Ambiente 📝

Definite in `docker-compose.yml`:
```yaml
# Database
DB_HOST=mysql
DB_USER=registro_user
DB_PASSWORD=registro_password
DB_NAME=registro_db

# Keycloak
KEYCLOAK_SERVER_URL=http://keycloak:8080
KEYCLOAK_REALM=registro-realm
KEYCLOAK_CLIENT_ID=registro-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Keycloak Admin
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin_password
```

## Setup Iniziale 🚀

1. **Docker Compose up**: Avvia tutti i servizi
2. **setup-keycloak.sh**: Configura Keycloak con realm, ruoli, client
3. **Flask init_database()**: Crea tabelle MySQL
4. **Angular ng serve**: Avvia dev server

## Estensioni Future 🔮

- Aggiungere middleware e JWT refresh tokens
- Integrare real login Keycloak OAuth2
- Aggiungere test unitari (Jasmine/Karma)
- Implementare pagination per liste voti
- Aggiungere export PDF/Excel
- Notifiche email per voti inseriti
- Dashboard con grafici
- Storico modifiche voti

---

**Architettura robusta e scalabile per un sistema di gestione voti scolastico** ✨
