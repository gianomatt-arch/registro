# 📊 Guida al Database - Registro Elettronico

## ✅ Database Collegati

Il backend è già collegato a **MySQL** con le seguenti tabelle:

### Tabelle Disponibili

```sql
-- Studenti
CREATE TABLE studenti (
  id INT PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  nome VARCHAR(255),
  cognome VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP
)

-- Docenti  
CREATE TABLE docenti (
  id INT PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  nome VARCHAR(255),
  cognome VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP
)

-- Voti
CREATE TABLE voti (
  id INT PRIMARY KEY,
  id_studente INT (FK studenti),
  materia VARCHAR(255),
  voto DECIMAL(5,2),
  data_inserimento TIMESTAMP,
  id_docente INT (FK docenti)
)
```

## 🔌 Endpoint Disponibili

### Per Docenti

```http
GET /docente/studenti
→ Lista di tutti gli studenti

GET /docente/voti
→ Lista di tutti i voti inseriti

POST /docente/voto
Body: {"nome_studente": "studente1", "materia": "Matematica", "voto": 8.5}
→ Inserisce un nuovo voto
```

### Per Studenti

```http
GET /studente/voti
→ I propri voti

GET /studente/profile
→ Il proprio profilo
```

### Per Admin

```http
POST /admin/studenti/sync
→ Sincronizza gli studenti da Keycloak

POST /admin/docenti/sync
→ Sincronizza i docenti da Keycloak
```

## 🚀 Come Usare nel Frontend

### 1. Importa il DatabaseService

```typescript
import { DatabaseService } from 'src/app/services/database.service';

constructor(private dbService: DatabaseService) {}
```

### 2. Carica i Voti

```typescript
loadVoti(): void {
  this.dbService.getAllVoti().subscribe({
    next: (voti: Voto[]) => {
      console.log('Voti caricati:', voti);
      this.voti = voti;
    },
    error: (error) => {
      console.error('Errore:', error);
    }
  });
}
```

### 3. Inserisci un Voto

```typescript
submitVoto(nome_studente: string, materia: string, voto: number): void {
  this.dbService.insertVoto({
    nome_studente,
    materia,
    voto
  }).subscribe({
    next: (response) => {
      console.log('Voto inserito:', response);
      // Ricarica i voti
      this.loadVoti();
    },
    error: (error) => {
      console.error('Errore inserimento:', error);
    }
  });
}
```

### 4. Carica Studenti

```typescript
loadStudenti(): void {
  this.dbService.getAllStudenti().subscribe({
    next: (studenti: Studente[]) => {
      console.log('Studenti:', studenti);
      this.studenti = studenti;
    }
  });
}
```

## 📱 Integrazione nel Componente

Vedi il file di esempio: `./docente-database.component.example.ts`

Questo file contiene un componente completo che mostra:
- ✅ Come caricare i voti
- ✅ Come inserire nuovi voti
- ✅ Come visualizzare gli studenti
- ✅ Come gestire errori e loading states

## 🧪 Test via Curl

```bash
# Test: ottenere tutti gli studenti
curl -X GET "http://localhost:5000/docente/studenti" \
  -H "Authorization: Bearer <YOUR_TOKEN>"

# Test: inserire un voto
curl -X POST "http://localhost:5000/docente/voto" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_studente": "studente1",
    "materia": "Matematica",
    "voto": 8.5
  }'
```

## 🔑 Variabili di Ambiente (Backend)

File: `.env` o `docker-compose.yml`

```env
MYSQL_HOST=localhost
MYSQL_USER=registro_user
MYSQL_PASSWORD=password123
MYSQL_DATABASE=registro_db
```

## 📝 Note Importanti

1. **Token Richiesto**: Tutti gli endpoint richiedono un header `Authorization: Bearer <token>`
2. **Proxy**: Il frontend usa il proxy del dev server per accedere al backend
3. **Ruoli**: Ogni endpoint controlla i ruoli utente (docente/studente)
4. **CORS**: Il backend ha CORS abilitato per localhost:4200

## 🔄 Flusso Completo

```
Frontend (Angular)
    ↓
Richiesta HTTP (es. GET /docente/studenti)
    ↓
Dev Server Proxy (porta 4200)
    ↓
Backend Flask (porta 5000)
    ↓
Database MySQL (porta 3306)
    ↓
Risposta JSON → Frontend
```

## ✨ Prossimi Passi

1. **Visualizzare i dati**: Aggiorna i componenti Docente e Studente per usare DatabaseService
2. **Inserire dati**: Crea form per inserire voti
3. **Validazione**: Aggiungi validazione frontend e backend
4. **Notifiche**: Aggiungi toast/snackbar per feedback utente
5. **Sincronizzazione**: Aggiungi bottone per sincronizzare utenti da Keycloak
