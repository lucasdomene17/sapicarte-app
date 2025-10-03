// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) {
          console.warn('⚠️ Usuario no autenticado, redirigiendo al login...');
          this.router.navigate(['/login']);
          return of(false);
        }

        return this.authService.isAuthorized(user).pipe(
          map(isAdmin => {
            console.log('🔎 Evaluando acceso admin...');
            console.log('👤 Usuario logueado:', user.email);
            console.log('📋 Lista admins:', this.authService['allowedEmailsSubject'].value);
            console.log('✅ Es admin?:', isAdmin);

            if (!isAdmin) {
              console.warn('⛔ Usuario autenticado pero no admin, redirigiendo al inicio...');
              this.router.navigate(['/']);
              return false;
            }
            console.log('🎉 Usuario autorizado, acceso concedido');
            return true;
          })
        );
      })
    );
  }
}

