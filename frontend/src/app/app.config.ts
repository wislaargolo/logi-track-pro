import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  lucideClipboardList,
  lucideLayoutDashboard,
  lucidePlus,
  lucideSearch,
  lucideSlidersHorizontal,
  lucideX,
} from '@ng-icons/lucide';

import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { apiErrorInterceptor } from './core/http/api-error.interceptor';
import { authSessionInterceptor } from './core/http/auth-session.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withNoXsrfProtection(),
      withInterceptors([apiErrorInterceptor, authSessionInterceptor]),
    ),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideIcons({
      lucideClipboardList,
      lucideLayoutDashboard,
      lucidePlus,
      lucideSearch,
      lucideSlidersHorizontal,
      lucideX,
    }),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' },
    },
  ],
};
