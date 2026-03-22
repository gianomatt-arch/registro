import { Component, OnInit } from '@angular/core';
import { DatabaseService, Voto, Studente } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-docente-database',
  template: `
    <div class="container">
      <header>
        <h1>📚 Registro Docente</h1>
        <button (click)="logout()" class="logout-btn">Logout</button>
      </header>

      <div class="content">
        <!-- SEZIONE VOTI -->
        <section class="voti-section">
          <h2>📝 Voti Inseriti</h2>
          <div *ngIf="isLoading" class="loading">Caricamento...</div>
          <div *ngIf="!isLoading && voti.length === 0" class="empty">Nessun voto inserito</div>
          
          <table *ngIf="!isLoading && voti.length > 0" class="voti-table">
            <thead>
              <tr>
                <th>Studente</th>
                <th>Materia</th>
                <th>Voto</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let voto of voti">
                <td>{{ voto.nome }} {{ voto.cognome }}</td>
                <td>{{ voto.materia }}</td>
                <td>{{ voto.voto }}</td>
                <td>{{ voto.data_inserimento | date: 'short' }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- SEZIONE INSERISCI VOTO -->
        <section class="form-section">
          <h2>➕ Inserisci Nuovo Voto</h2>
          <form (ngSubmit)="submitVoto()" #votoForm="ngForm">
            <div class="form-group">
              <label>Studente:</label>
              <select name="nome_studente" [(ngModel)]="formData.nome_studente" required>
                <option value="">Seleziona uno studente...</option>
                <option *ngFor="let s of studenti" [value]="s.username">
                  {{ s.nome }} {{ s.cognome }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Materia:</label>
              <input type="text" name="materia" [(ngModel)]="formData.materia" required />
            </div>

            <div class="form-group">
              <label>Voto:</label>
              <input type="number" name="voto" [(ngModel)]="formData.voto" min="1" max="10" step="0.5" required />
            </div>

            <button type="submit" [disabled]="isSubmitting || !votoForm.valid" class="submit-btn">
              {{ isSubmitting ? 'Inserimento...' : 'Inserisci Voto' }}
            </button>
          </form>
          <div *ngIf="successMessage" class="success">✅ {{ successMessage }}</div>
          <div *ngIf="errorMessage" class="error">❌ {{ errorMessage }}</div>
        </section>

        <!-- SEZIONE STUDENTI -->
        <section class="studenti-section">
          <h2>👥 Lista Studenti</h2>
          <div *ngIf="isLoadingStudenti" class="loading">Caricamento studenti...</div>
          <div *ngIf="!isLoadingStudenti && studenti.length === 0" class="empty">Nessuno studente nel sistema</div>
          
          <ul *ngIf="!isLoadingStudenti && studenti.length > 0" class="studenti-list">
            <li *ngFor="let s of studenti">
              <strong>{{ s.nome }} {{ s.cognome }}</strong> ({{ s.username }})
              <p>{{ s.email }}</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }

    h1 {
      font-size: 2em;
      color: #333;
    }

    h2 {
      font-size: 1.5em;
      color: #555;
      margin-top: 30px;
      margin-bottom: 15px;
    }

    section {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .logout-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1em;
    }

    .logout-btn:hover {
      background: #c0392b;
    }

    .voti-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .voti-table th,
    .voti-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    .voti-table th {
      background: #333;
      color: white;
      font-weight: bold;
    }

    form {
      display: grid;
      gap: 15px;
      max-width: 500px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 5px;
      font-weight: bold;
      color: #333;
    }

    input,
    select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1em;
    }

    .submit-btn {
      background: #27ae60;
      color: white;
      padding: 12px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1em;
      font-weight: bold;
    }

    .submit-btn:hover:not(:disabled) {
      background: #229954;
    }

    .submit-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }

    .loading,
    .empty {
      padding: 20px;
      text-align: center;
      color: #777;
    }

    .success {
      background: #d4edda;
      color: #155724;
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
    }

    .error {
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
    }

    .studenti-list {
      list-style: none;
      padding: 0;
    }

    .studenti-list li {
      background: white;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
      border-left: 4px solid #27ae60;
    }

    .studenti-list li p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 0.9em;
    }
  `]
})
export class DocenteDatabaseComponent implements OnInit {
  voti: Voto[] = [];
  studenti: Studente[] = [];
  
  isLoading = false;
  isLoadingStudenti = false;
  isSubmitting = false;
  
  successMessage = '';
  errorMessage = '';
  
  formData = {
    nome_studente: '',
    materia: '',
    voto: 0
  };

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadVoti();
    this.loadStudenti();
  }

  /**
   * Carica tutti i voti inseriti
   */
  loadVoti(): void {
    this.isLoading = true;
    this.dbService.getAllVoti().subscribe({
      next: (data) => {
        this.voti = data;
        console.log('✅ Voti carichi:', data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Errore nel caricamento dei voti:', error);
        this.errorMessage = 'Errore nel caricamento dei voti';
        this.isLoading = false;
      }
    });
  }

  /**
   * Carica la lista degli studenti
   */
  loadStudenti(): void {
    this.isLoadingStudenti = true;
    this.dbService.getAllStudenti().subscribe({
      next: (data) => {
        this.studenti = data;
        console.log('✅ Studenti carichi:', data);
        this.isLoadingStudenti = false;
      },
      error: (error) => {
        console.error('❌ Errore nel caricamento degli studenti:', error);
        this.isLoadingStudenti = false;
      }
    });
  }

  /**
   * Invia un nuovo voto
   */
  submitVoto(): void {
    if (!this.formData.nome_studente || !this.formData.materia || !this.formData.voto) {
      this.errorMessage = 'Compila tutti i campi';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.dbService.insertVoto(this.formData).subscribe({
      next: (response) => {
        console.log('✅ Voto inserito:', response);
        this.successMessage = `Voto inserito con successo (ID: ${response.id})`;
        this.formData = { nome_studente: '', materia: '', voto: 0 };
        this.isSubmitting = false;
        
        // Ricarica i voti
        setTimeout(() => this.loadVoti(), 1000);
      },
      error: (error) => {
        console.error('❌ Errore nell\'inserimento:', error);
        this.errorMessage = error.error?.error || 'Errore nell\'inserimento del voto';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Effettua il logout
   */
  logout(): void {
    this.authService.logout();
  }
}
