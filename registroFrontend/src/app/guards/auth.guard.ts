import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.authService.getCurrentUser();

    if (!user) {
      // Se non autenticato, reindirizza a login
      this.router.navigate(['/login']);
      return false;
    }

    // Se il route richiede un ruolo specifico
    if (route.data['role']) {
      if (!this.authService.hasRole(route.data['role'])) {
        this.router.navigate(['/accesso-negato']);
        return false;
      }
    }

    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DocenteGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    if (this.authService.isDocente()) {
      return true;
    }
    this.router.navigate(['/accesso-negato']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class StudenteGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    if (this.authService.isStudente()) {
      return true;
    }
    this.router.navigate(['/accesso-negato']);
    return false;
  }
}
