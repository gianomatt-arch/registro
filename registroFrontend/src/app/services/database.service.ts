import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Studente {
  id: number;
  username: string;
  nome: string;
  cognome: string;
  email: string;
  created_at: string;
}

export interface Voto {
  id: number;
  id_studente: number;
  materia: string;
  voto: number;
  data_inserimento: string;
  id_docente: number;
  nome: string;
  cognome: string;
  docente_nome: string;
  docente_cognome: string;
}

export interface VotoInput {
  nome_studente: string;
  materia: string;
  voto: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private apiUrl = ''; // URL relativo (proxy intercetterà)

  constructor(private http: HttpClient) { }

  // ==================== DOCENTE ====================

  /**
   * Docente: ottiene tutti i voti
   */
  getAllVoti(): Observable<Voto[]> {
    console.log('📚 Richiesta: GET /docente/voti');
    return this.http.get<Voto[]>(`${this.apiUrl}/docente/voti`);
  }

  /**
   * Docente: inserisce un nuovo voto
   */
  insertVoto(data: VotoInput): Observable<any> {
    console.log('📝 Richiesta: POST /docente/voto', data);
    return this.http.post(`${this.apiUrl}/docente/voto`, data);
  }

  /**
   * Docente: ottiene tutti gli studenti
   */
  getAllStudenti(): Observable<Studente[]> {
    console.log('👥 Richiesta: GET /docente/studenti');
    return this.http.get<Studente[]>(`${this.apiUrl}/docente/studenti`);
  }

  // ==================== STUDENTE ====================

  /**
   * Studente: ottiene i propri voti
   */
  getMyVoti(): Observable<Voto[]> {
    console.log('⭐ Richiesta: GET /studente/voti');
    return this.http.get<Voto[]>(`${this.apiUrl}/studente/voti`);
  }

  /**
   * Studente: ottiene il proprio profilo
   */
  getMyProfile(): Observable<Studente> {
    console.log('👤 Richiesta: GET /studente/profile');
    return this.http.get<Studente>(`${this.apiUrl}/studente/profile`);
  }

  // ==================== ADMIN ====================

  /**
   * Admin: sincronizza gli studenti
   */
  syncStudenti(): Observable<any> {
    console.log('🔄 Richiesta: POST /admin/studenti/sync');
    return this.http.post(`${this.apiUrl}/admin/studenti/sync`, {});
  }

  /**
   * Admin: sincronizza i docenti
   */
  syncDocenti(): Observable<any> {
    console.log('🔄 Richiesta: POST /admin/docenti/sync');
    return this.http.post(`${this.apiUrl}/admin/docenti/sync`, {});
  }
}
