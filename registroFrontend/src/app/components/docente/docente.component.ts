import { Component, OnInit } from '@angular/core';
import { VotiService, Voto } from '../../services/voti.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-docente',
  templateUrl: './docente.component.html',
  styleUrls: ['./docente.component.css']
})
export class DocenteComponent implements OnInit {
  voti: Voto[] = [];
  studenti: any[] = [];
  showForm = false;
  isLoading = false;
  
  formData = {
    nome_studente: '',
    materia: '',
    voto: 0
  };

  constructor(
    private votiService: VotiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadVoti();
    this.loadStudenti();
  }

  loadVoti(): void {
    this.isLoading = true;
    this.votiService.getAllVoti().subscribe({
      next: (data) => {
        this.voti = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento dei voti:', error);
        this.isLoading = false;
      }
    });
  }

  loadStudenti(): void {
    this.votiService.getStudenti().subscribe({
      next: (data) => {
        this.studenti = data;
      },
      error: (error) => {
        console.error('Errore nel caricamento degli studenti:', error);
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  submitForm(): void {
    if (!this.formData.nome_studente || !this.formData.materia || this.formData.voto === 0) {
      alert('Compila tutti i campi');
      return;
    }

    this.isLoading = true;
    this.votiService.insertVoto(
      this.formData.nome_studente,
      this.formData.materia,
      this.formData.voto
    ).subscribe({
      next: (data) => {
        alert('Voto inserito con successo');
        this.formData = { nome_studente: '', materia: '', voto: 0 };
        this.showForm = false;
        this.loadVoti();
        this.isLoading = false;
      },
      error: (error) => {
        alert('Errore nell\'inserimento del voto');
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
