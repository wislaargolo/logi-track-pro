import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/http/api-url.token';
import { PagedResponseDto } from '../../../core/models/paged-response.dto';
import {
  CreateMaintenanceDto,
  MaintenanceDto,
  MaintenanceFilterDto,
  MaintenanceListQuery,
  UpdateMaintenanceDto,
} from '../models/maintenance.models';

const FILTER_KEYS = [
  'search',
  'status',
  'startDateFrom',
  'startDateTo',
  'estimatedCostMin',
  'estimatedCostMax',
] as const satisfies readonly (keyof MaintenanceFilterDto)[];

@Injectable({ providedIn: 'root' })
export class MaintenanceApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/maintenance`;

  create(dto: CreateMaintenanceDto): Observable<MaintenanceDto> {
    return this.http.post<MaintenanceDto>(this.url, dto);
  }

  update(id: number, dto: UpdateMaintenanceDto): Observable<MaintenanceDto> {
    return this.http.put<MaintenanceDto>(`${this.url}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  findById(id: number): Observable<MaintenanceDto> {
    return this.http.get<MaintenanceDto>(`${this.url}/${id}`);
  }

  findAll(query: MaintenanceListQuery): Observable<PagedResponseDto<MaintenanceDto>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    for (const sort of query.sort) {
      params = params.append('sort', sort);
    }
    for (const key of FILTER_KEYS) {
      const value = query.filter[key];
      const normalized = typeof value === 'string' ? value.trim() : value;
      if (normalized !== undefined && normalized !== null && normalized !== '') {
        params = params.set(key, normalized);
      }
    }
    return this.http.get<PagedResponseDto<MaintenanceDto>>(this.url, { params });
  }
}
