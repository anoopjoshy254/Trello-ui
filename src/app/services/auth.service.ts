import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiResponse, JwtResponse } from '../core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = 'http://localhost:5095/api/auth';

  private currentUserSubject = new BehaviorSubject<number | null>(this.getCurrentUserId());

  register(dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/register`, dto);
  }

  login(dto: any): Observable<ApiResponse<JwtResponse>> {
    return this.http.post<ApiResponse<JwtResponse>>(`${this.baseUrl}/login`, dto).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setTokens(response.data);
          this.currentUserSubject.next(response.data.user.id);
        }
      })
    );
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe({
      next: () => this.clearTokensAndRedirect(),
      error: () => this.clearTokensAndRedirect()
    });
  }

  refreshToken(): Observable<ApiResponse<JwtResponse>> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<ApiResponse<JwtResponse>>(`${this.baseUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setTokens(response.data);
        }
      })
    );
  }

  changePassword(dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/change-password`, dto);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getCurrentUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  getCurrentUserRole(): string | null {
    return localStorage.getItem('role');
  }

  private setTokens(data: JwtResponse): void {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userId', data.user.id.toString());
    localStorage.setItem('email', data.user.email);
    localStorage.setItem('role', data.user.role);
    localStorage.setItem('fullName', data.user.fullName);
  }

  private clearTokensAndRedirect(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
