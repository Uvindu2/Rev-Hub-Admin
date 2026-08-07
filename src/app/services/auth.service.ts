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

  login(username: string, password: string) {

    return this.http.post<any>(
      `${this.loginUrl}`,
      {
        username,
        password
      }
    ).pipe(

      tap(response => {

        sessionStorage.setItem(
          'token',
          response.token
        );


        sessionStorage.setItem(
          'user',
          JSON.stringify(response)
        );

      })

    );

  }

  logout(){

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

  }

  getToken(): string | null {
    return localStorage.getItem('revhub_access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
