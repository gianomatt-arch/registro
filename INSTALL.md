# Guida di installazione e setup

## Prerequisiti

- Docker
- Docker Compose
- Git

## Step 1: Avvia i servizi

```bash
docker-compose up -d
```

Questo avvierà:
- Keycloak (http://localhost:8080)
- PostgreSQL (database Keycloak)
- MySQL (database applicazione)
- Flask backend (http://localhost:5000)

## Step 2: Attendi che Keycloak sia pronto

Keycloak impiega alcuni secondi per avviarsi. Puoi verificare con:

```bash
docker-compose logs keycloak
```

Quando vedi "Listening on" sei pronto a procedere.

## Step 3: Esegui lo script di setup

```bash
chmod +x setup-keycloak.sh
./setup-keycloak.sh
```

Questo crea:
- Realm: `registro-realm`
- Ruoli: `docente`, `studente`
- Client: `registro-frontend`, `registro-backend`
- Utenti di test: `docente1`, `studente1`

## Step 4: Avvia il Frontend (in una nuova finestra terminal)

```bash
cd registroFrontend
npm install
npm start
```

Accedi a http://localhost:4200

## Step 5: Login di Test

Usa uno degli account di test:

**Docente**
- Username: `docente1`
- Password: `password123`

**Studente**
- Username: `studente1`
- Password: `password123`

## Troubleshooting

### Errore di connessione

Se ricevi errori di connessione al primo accesso, attendi 30 secondi e riprova.

### Keycloak admin

Se hai bisogno di accedere ad admin:
- URL: http://localhost:8080
- Username: `admin`
- Password: `admin_password`

### Logs

Per debuggare, controlla i logs dei servizi:

```bash
docker-compose logs -f flask
docker-compose logs -f keycloak
docker-compose logs -f mysql
```

## Variabili d'Ambiente

Il file `.env` può essere creato per customizzare:

```bash
# Backend
DB_HOST=localhost
DB_USER=registro_user
DB_PASSWORD=registro_password
DB_NAME=registro_db

# Keycloak
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=registro-realm
KEYCLOAK_CLIENT_ID=registro-backend
```

---

Buon lavoro! 🎉
