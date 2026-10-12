import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/http/api-url.token';
import { LoginRequestDto, LoginResponseDto, UserDto } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/auth`;

  login(request: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.url}/login`, request);
  }

  me(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.url}/me`);
  }
}
