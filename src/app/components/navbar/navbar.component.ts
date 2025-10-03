import { Component, AfterViewInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements AfterViewInit {

  user: User | null = null;
  isAuthorized = false;

  // Declara una propiedad para controlar la visibilidad del menú
  public menuOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe(u => {
      this.user = u;
      this.authService.isAuthorized(u).subscribe(isAuth => {
        this.isAuthorized = isAuth;
      });
    });
  }

  ngAfterViewInit() {
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


  goToLogin() {
    console.log("Redirigiendo al login...");
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}