import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Guard e Servizi
import { DocenteGuard, StudenteGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { DatabaseService } from './services/database.service';
import { VotiService } from './services/voti.service';

// Componenti
import { LoginComponent } from './components/login/login.component';
import { DocenteComponent } from './components/docente/docente.component';
import { StudenteComponent } from './components/studente/studente.component';
import { AccessoDenegatoComponent } from './components/accesso-negato/accesso-negato.component';

// Interceptor per aggiungere il token alle richieste
import { TokenInterceptor } from './interceptors/token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DocenteComponent,
    StudenteComponent,
    AccessoDenegatoComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    AuthService,
    DatabaseService,
    VotiService,
    DocenteGuard,
    StudenteGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
