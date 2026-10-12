import { ParamMap, Params } from '@angular/router';
import { MaintenanceFilterDto, MaintenanceListQuery } from '../models/maintenance.models';

export const SORT_FIELDS = [
  'startDate',
  'expectedEndDate',
  'serviceType',
  'estimatedCost',
  'status',
  'id',
] as const;

export const PAGE_SIZES = [5, 10, 20, 50, 100];

export function queryFromParams(params: ParamMap): MaintenanceListQuery {
  const requestedSize = Number(params.get('size') ?? 20);
  const size = PAGE_SIZES.includes(requestedSize) ? requestedSize : 20;
  const requestedPage = Number(params.get('page') ?? 0);
  const page = Number.isInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0;
  const [requestedField, requestedDirection] = (params.get('sort') ?? 'startDate,asc').split(',');
  const field = SORT_FIELDS.find((candidate) => candidate === requestedField) ?? 'startDate';
  const direction = requestedDirection === 'desc' ? 'desc' : 'asc';
  const sort = field === 'id' ? [`id,${direction}`] : [`${field},${direction}`, `id,${direction}`];
  const filter: MaintenanceFilterDto = {};

  for (const key of ['search', 'status', 'startDateFrom', 'startDateTo'] as const) {
    const value = params.get(key)?.trim();
    if (value) filter[key] = value;
  }

  for (const key of ['estimatedCostMin', 'estimatedCostMax'] as const) {
    const raw = params.get(key);
    if (raw !== null && raw.trim() !== '' && Number.isFinite(Number(raw)))
      filter[key] = Number(raw);
  }

  return { page, size, sort, filter };
}

export function queryToParams(query: MaintenanceListQuery): Params {
  return { page: query.page, size: query.size, sort: [...query.sort], ...query.filter };
}
