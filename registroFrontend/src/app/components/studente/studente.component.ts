import { Component, OnInit } from '@angular/core';
import { VotiService, Voto } from '../../services/voti.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-studente',
  templateUrl: './studente.component.html',
  styleUrls: ['./studente.component.css']
})
export class StudenteComponent implements OnInit {
  voti: Voto[] = [];
  profile: any = null;
  isLoading = false;

  constructor(
    private votiService: VotiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
    this.loadVoti();
  }

  loadProfile(): void {
    this.votiService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
      },
      error: (error) => {
        console.error('Errore nel caricamento del profilo:', error);
      }
    });
  }

  loadVoti(): void {
    this.isLoading = true;
    this.votiService.getMyVoti().subscribe({
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

  getMedia(): number {
    if (this.voti.length === 0) return 0;
    const sum = this.voti.reduce((acc, v) => acc + v.voto, 0);
    return Math.round((sum / this.voti.length) * 100) / 100;
  }

  logout(): void {
    this.authService.logout();
  }
}
