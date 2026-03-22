import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  
  testAccounts = [
    { username: 'docente1', password: 'password123', role: 'Docente' },
    { username: 'studente1', password: 'password123', role: 'Studente' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Se già autenticato, reindirizza al dashboard
    const user = this.authService.getCurrentUser();
    if (user) {
      this.redirectByRole(user);
    }
  }

  loginWithTestAccount(username: string, password: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Simula il login con Keycloak
    // In produzione utilizzerai keycloak-angular per il vero flusso OAuth
    const token = this.generateMockToken(username);
    console.log('🔑 Token generato:', token);
    localStorage.setItem('access_token', token);
    console.log('✅ Token salvato in localStorage');
    console.log('📝 localStorage.access_token:', localStorage.getItem('access_token'));

    // Sincronizza il profilo dal backend
    console.log('📤 Richiesta GET a /auth/user...');
    this.authService.getUser().subscribe({
      next: (user) => {
        console.log('✅ Profilo ricevuto dal backend:', user);
        this.isLoading = false;
        this.redirectByRole(user);
      },
      error: (error) => {
        console.error('❌ Errore autenticazione:', error);
        console.error('  Status:', error.status);
        console.error('  Message:', error.message);
        console.error('  Response:', error.error);
        this.isLoading = false;
        this.errorMessage = 'Errore nell\'autenticazione';
      }
    });
  }

  private generateMockToken(username: string): string {
    // Genera un token JWT di test (non valido per la produzione)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      preferred_username: username,
      email: `${username}@example.com`,
      name: username,
      realm_access: {
        roles: username.includes('docente') ? ['docente'] : ['studente']
      },
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const signature = 'mock_signature';
    return `${header}.${payload}.${signature}`;
  }

  private redirectByRole(user: any): void {
    if (user.roles.includes('docente')) {
      this.router.navigate(['/docente']);
    } else if (user.roles.includes('studente')) {
      this.router.navigate(['/studente']);
    } else {
      this.router.navigate(['/accesso-negato']);
    }
  }
}
