import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user: User | null = null;
  isAuthorized = false;

  constructor(private authService: AuthService, private router: Router, private logger: LoggerService) {
    this.authService.user$.subscribe(u => {
      this.user = u;
      this.authService.isAuthorized(u).subscribe(isAuth => {
        this.isAuthorized = isAuth;
      });

    });
  }

  login() {
    this.authService.loginWithGoogle().catch(err => {
      this.logger.error('Error al iniciar sesión con Google:', err);
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }
}

