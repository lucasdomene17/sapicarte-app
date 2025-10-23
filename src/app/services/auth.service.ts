// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, User, authState } from '@angular/fire/auth';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject, filter, map, Observable, of, switchMap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>; 
  private allowedEmailsSubject = new BehaviorSubject<string[] | null>(null);
  allowedEmails$ = this.allowedEmailsSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore, private logger: LoggerService) {
    // escuchar cambios de sesión
    this.user$ = authState(this.auth);

    // cargar lista de admins desde la colección
    this.loadAllowedEmails();

    // manejar resultado de redirect en móviles
    this.handleRedirectResult();
  }

  private async loadAllowedEmails() {
    try {
      const snap = await getDocs(collection(this.firestore, 'adminUsers'));
      const emails = snap.docs.map(doc => doc.data()['email'] as string);
      this.allowedEmailsSubject.next(emails);
      this.logger.log('✅ Emails de admins cargados:', emails);
    } catch (error) {
      this.logger.error('Error al cargar adminUsers:', error);
      this.allowedEmailsSubject.next([]);
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private async handleRedirectResult(): Promise<void> {
    try {
      const result = await getRedirectResult(this.auth);
      if (result) {
        this.logger.log('✅ Login exitoso via redirect');
      }
    } catch (error) {
      this.logger.error('Error al manejar redirect result:', error);
    }
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    
    // En dispositivos móviles usar redirect, en desktop usar popup
    if (this.isMobileDevice()) {
      this.logger.log('📱 Dispositivo móvil detectado, usando redirect');
      await signInWithRedirect(this.auth, provider);
    } else {
      this.logger.log('🖥️ Dispositivo desktop detectado, usando popup');
      await signInWithPopup(this.auth, provider);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  isAuthorized(user: User | null): Observable<boolean> {
    if (!user) return of(false);

    return this.allowedEmails$.pipe(
      // ignorar hasta que la lista de mails no sea null
      filter((emails): emails is string[] => emails !== null),
      map(emails => emails.includes(user.email ?? ''))
    );
  }
}

