import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Voto {
  id: number;
  id_studente: number;
  materia: string;
  voto: number;
  data_inserimento: string;
  nome: string;
  cognome: string;
  docente_nome?: string;
  docente_cognome?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VotiService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  // Docente
  getAllVoti(): Observable<Voto[]> {
    return this.http.get<Voto[]>(`${this.apiUrl}/docente/voti`);
  }

  insertVoto(nomeStudente: string, materia: string, voto: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/docente/voto`, {
      nome_studente: nomeStudente,
      materia,
      voto
    });
  }

  getStudenti(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/docente/studenti`);
  }

  // Studente
  getMyVoti(): Observable<Voto[]> {
    return this.http.get<Voto[]>(`${this.apiUrl}/studente/voti`);
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/studente/profile`);
  }
}
