import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/http/api-url.token';
import { PagedResponseDto } from '../../../core/models/paged-response.dto';
import { VehicleDto } from '../models/vehicle.dto';

@Injectable({ providedIn: 'root' })
export class VehicleApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/vehicles`;

  search(search: string): Observable<PagedResponseDto<VehicleDto>> {
    let params = new HttpParams()
      .set('page', 0)
      .set('size', 20)
      .append('sort', 'licensePlate,asc')
      .append('sort', 'id,asc');
    const normalizedSearch = search.trim();
    if (normalizedSearch) {
      params = params.set('search', normalizedSearch);
    }
    return this.http.get<PagedResponseDto<VehicleDto>>(this.url, { params });
  }
}
