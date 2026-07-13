import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_BASE_URL } from '../constant/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = API_BASE_URL+'/api/login';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.loginUrl, { username, password }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('revhub_access_token', res.token);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('revhub_access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('revhub_access_token');
  }
}