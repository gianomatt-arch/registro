import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accesso-negato',
  templateUrl: './accesso-negato.component.html',
  styleUrls: ['./accesso-negato.component.css']
})
export class AccessoDenegatoComponent {
  constructor(private router: Router) { }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}
