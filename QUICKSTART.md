# 🚀 Quick Start - Registro Elettronico

## Avvio in 5 Minuti

### 1️⃣ Avvia i Container
```bash
cd /workspaces/registro
docker-compose up -d
```

### 2️⃣ Attendi e Configura Keycloak
```bash
# Attendi ~30 secondi che Keycloak si avvii
sleep 30

# Configura Keycloak (realm, ruoli, utenti)
chmod +x setup-keycloak.sh
./setup-keycloak.sh
```

### 3️⃣ Installa e Avvia il Frontend (nuovo terminale)
```bash
cd registroFrontend
npm install
npm start

# Apri browser: http://localhost:4200
```

### 4️⃣ Effettua Login
**Docente:**
- Username: `docente1`
- Password: `password123`

**Studente:**
- Username: `studente1`
- Password: `password123`

---

## ✨ Funzionalità Disponibili

### 👨‍🏫 Pannello Docente
```
URL: http://localhost:4200/docente
- Inserisci nuovo voto (studente, materia, voto)
- Visualizza tutti i voti di tutti gli studenti
- Logout
```

### 👨‍🎓 Pannello Studente
```
URL: http://localhost:4200/studente
- Visualizza propri voti personali
- Vedi media voti
- Dettagli per materia e docente
- Logout
```

### 🔒 Sicurezza
- ✓ Docente non può accedere a /studente
- ✓ Studente non può accedere a /docente
- ✓ Accesso negato mostra pagina fun 403
- ✓ Token-based authentication con Keycloak

---

## 📊 API Backend

**Base URL**: http://localhost:5000

### Esempi cURL

```bash
# 1. Health check
curl http://localhost:5000/health

# 2. Ottieni info utente (con token)
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/auth/user

# 3. Docente - Visualizza tutti voti
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/docente/voti

# 4. Docente - Inserisci voto
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"nome_studente":"studente1","materia":"Matematica","voto":8.5}' \
  http://localhost:5000/docente/voto

# 5. Studente - Visualizza propri voti
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/studente/voti
```

---

## 🔧 Troubleshooting

### Keycloak non risponde
```bash
docker-compose logs keycloak
# Attendi che dica "Listening on"
```

### Errore connessione database
```bash
docker-compose restart mysql
sleep 5
```

### Port già occupate
```bash
# Chiudi tutto e riavvia
docker-compose down -v
docker-compose up -d
```

### Cancella localStorage (logout)
```javascript
// Nella console browser
localStorage.clear()
location.reload()
```

---

## 📚 Documentazione

- **README.md** - Panoramica completa
- **ARCHITECTURE.md** - Architettura dettagliata
- **INSTALL.md** - Istruzioni di installazione
- **CHECKLIST.md** - Task e verifiche

---

## 🛑 Arresta l'Applicazione

```bash
# Ferma tutti i container
docker-compose down

# Ferma e rimuovi dati (fresh start next time)
docker-compose down -v
```

---

## 📞 Contatti

**Keycloak Admin Console**: http://localhost:8080
- Username: `admin`
- Password: `admin_password`

**MySQL**: localhost:3306
- User: `registro_user`
- Password: `registro_password`

---

**Happy coding! 🎉**
