// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private logger: LoggerService) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) {
          this.logger.warn('⚠️ Usuario no autenticado, redirigiendo al login...');
          this.router.navigate(['/login']);
          return of(false);
        }

        return this.authService.isAuthorized(user).pipe(
          map(isAdmin => {
            this.logger.log('🔎 Evaluando acceso admin...');
            this.logger.log('👤 Usuario logueado:', user.email);
            this.logger.log('📋 Lista admins:', this.authService['allowedEmailsSubject'].value);
            this.logger.log('✅ Es admin?:', isAdmin);

            if (!isAdmin) {
              this.logger.warn('⛔ Usuario autenticado pero no admin, redirigiendo al inicio...');
              this.router.navigate(['/']);
              return false;
            }
            this.logger.log('🎉 Usuario autorizado, acceso concedido');
            return true;
          })
        );
      })
    );
  }
}

