import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  username: string;
  email: string;
  name: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '';  // URL relativo (proxy intercetterà le richieste a /auth)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUser(): Observable<User> {
    console.log(`📡 AuthService.getUser() - URL: ${this.apiUrl}/auth/user`);
    return this.http.get<User>(`${this.apiUrl}/auth/user`).pipe(
      tap(user => {
        console.log('✅ Risposta ricevuta dal backend:', user);
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.includes(role) : false;
  }

  isDocente(): boolean {
    return this.hasRole('docente');
  }

  isStudente(): boolean {
    return this.hasRole('studente');
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    console.log('🔐 Logout effettuato, reindirizzamento a /login');
    this.router.navigate(['/login']);
  }
}
