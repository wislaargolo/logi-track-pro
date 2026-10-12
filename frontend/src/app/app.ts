import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthStore } from './features/auth/state/auth.store';

interface RouteContext {
  feature?: { label: string; link: string };
  section?: string;
  public?: boolean;
}

function activeRouteContext(snapshot: ActivatedRouteSnapshot): RouteContext {
  let active = snapshot;
  while (active.firstChild) active = active.firstChild;
  return active.data as RouteContext;
}

@Component({
  imports: [NgIcon, RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  readonly authStore = inject(AuthStore);
  private readonly initialRouteContext = activeRouteContext(this.router.routerState.snapshot.root);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  private readonly routeContext = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => activeRouteContext(this.router.routerState.snapshot.root)),
      startWith(this.initialRouteContext),
    ),
    { initialValue: this.initialRouteContext },
  );

  readonly routeFeature = computed(
    () => this.routeContext().feature ?? { label: 'Dashboard', link: '/dashboard' },
  );
  readonly routeSection = computed(() => this.routeContext().section ?? '');
  readonly showShell = computed(() => !this.routeContext().public);

  readonly currentRouteLink = computed(() => this.currentUrl());

  constructor() {
    this.authStore.initialize().pipe(takeUntilDestroyed()).subscribe();
  }

  logout(): void {
    this.authStore.logout();
    void this.router.navigateByUrl('/login');
  }
}
