import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DocenteComponent } from './components/docente/docente.component';
import { StudenteComponent } from './components/studente/studente.component';
import { AccessoDenegatoComponent } from './components/accesso-negato/accesso-negato.component';
import { DocenteGuard, StudenteGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'docente', 
    component: DocenteComponent,
    canActivate: [DocenteGuard]
  },
  { 
    path: 'studente', 
    component: StudenteComponent,
    canActivate: [StudenteGuard]
  },
  { path: 'accesso-negato', component: AccessoDenegatoComponent },
  { path: '**', redirectTo: '/accesso-negato' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
