import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'qa_token';
  private readonly USER_KEY = 'qa_user';

  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  private currentUser$ = new BehaviorSubject<LoginResponse | null>(this.getStoredUser());

  isLoggedIn$ = this.loggedIn$.asObservable();
  user$ = this.currentUser$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /** RQ-MOD01-01: Login */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl + '/auth/login', credentials).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res));
        this.loggedIn$.next(true);
        this.currentUser$.next(res);
      })
    );
  }

  /** RQ-MOD01-01: Logout */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.loggedIn$.next(false);
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  /** RQ-MOD01-07: Refresh token */
  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl + '/auth/refresh', {}).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res));
        this.currentUser$.next(res);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUser$.value;
  }

  /** Verificar si el usuario tiene al menos uno de los roles indicados */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    const userRoles = Array.from(user.roles).map(r => r.replace('ROLE_', '').toUpperCase());
    if (userRoles.includes('ADMINISTRADOR')) return true;
    const cleanRequiredRoles = roles.map(r => r.replace('ROLE_', '').toUpperCase());
    return userRoles.some(r => cleanRequiredRoles.includes(r));
  }

  private getStoredUser(): LoginResponse | null {
    const data = localStorage.getItem(this.USER_KEY);
    if (!data) return null;
    try { return JSON.parse(data); }
    catch { return null; }
  }
}