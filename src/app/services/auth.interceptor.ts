import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import {environment} from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = `${environment.apiUrl}/api/login`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<any>(this.loginUrl, { username, password }).pipe(
      tap(response => {
        if (response && response.token) {
          // MUST match sessionStorage in interceptor
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('user', JSON.stringify(response));
        }
      })
    );
  }

  isLoggedIn(): boolean {
    // MUST match sessionStorage
    return !!sessionStorage.getItem('token');
  }

  logout(): void {
    sessionStorage.clear();
  }
}
