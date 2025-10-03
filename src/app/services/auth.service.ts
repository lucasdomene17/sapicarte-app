// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, User, authState } from '@angular/fire/auth';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject, filter, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>; 
  private allowedEmailsSubject = new BehaviorSubject<string[] | null>(null);
  allowedEmails$ = this.allowedEmailsSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    // escuchar cambios de sesión
    this.user$ = authState(this.auth);

    // cargar lista de admins desde la colección
    this.loadAllowedEmails();
  }

  private async loadAllowedEmails() {
    try {
      const snap = await getDocs(collection(this.firestore, 'adminUsers'));
      const emails = snap.docs.map(doc => doc.data()['email'] as string);
      this.allowedEmailsSubject.next(emails);
      console.log('✅ Emails de admins cargados:', emails);
    } catch (error) {
      console.error('Error al cargar adminUsers:', error);
      this.allowedEmailsSubject.next([]);
    }
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
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

