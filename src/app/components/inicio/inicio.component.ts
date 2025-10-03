import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {
  showDebug = true; // Cambiar a false cuando termines
  screenWidth = 0;
  screenHeight = 0;
  constructor(private router: Router) {
    document.body.setAttribute('data-width', window.innerWidth + 'px');
  }
  ngOnInit() {
/*     this.updateScreenSize();
    window.addEventListener('resize', () => this.updateScreenSize()); */
  }

  irAReservas() {
    this.router.navigate(['/reservas']);
  }
/*   updateScreenSize() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  } */
}
