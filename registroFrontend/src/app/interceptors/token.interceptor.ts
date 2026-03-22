import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Aggiunge il token alle richieste HTTP
    const token = localStorage.getItem('access_token');
    
    console.log(`🔍 Interceptor - URL: ${request.url}`);
    console.log(`🔑 Token disponibile: ${token ? 'SÌ' : 'NO'}`);
    
    if (token && !request.url.includes('keycloak')) {
      console.log(`✅ Token aggiunto all'header Authorization`);
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else if (!token) {
      console.log(`⚠️  Token NON disponibile in localStorage`);
    }

    return next.handle(request);
  }
}
