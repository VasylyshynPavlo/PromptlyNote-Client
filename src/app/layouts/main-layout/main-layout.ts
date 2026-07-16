import {
  Component,
  effect,
  inject,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { OverlayRef } from '@angular/cdk/overlay';
import { BreakpointObserver } from '@angular/cdk/layout';
import { A11yModule } from '@angular/cdk/a11y';
import { filter, map } from 'rxjs';
import { Sidebar } from './components/sidebar/sidebar';
import { UserProfile } from './components/user-profile/user-profile';
import { DrawerService } from '../../core/services/drawer-service';
import { UserService } from '../../core/services/user-service';

const NARROW_SCREEN = '(max-width: 767px)';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, Sidebar, UserProfile, NgTemplateOutlet, A11yModule],
  templateUrl: './main-layout.html',
})
export class MainLayout implements OnDestroy {
  private readonly drawerService = inject(DrawerService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  readonly userService = inject(UserService);

  private readonly sidebarDrawer = viewChild.required<TemplateRef<unknown>>('sidebarDrawer');
  private overlayRef: OverlayRef | null = null;

  readonly sidebarOpen = signal(false);
  readonly isNarrow = toSignal(
    this.breakpointObserver.observe(NARROW_SCREEN).pipe(map((state) => state.matches)),
    { initialValue: this.breakpointObserver.isMatched(NARROW_SCREEN) },
  );

  constructor() {
    effect(() => {
      if (!this.isNarrow()) this.closeSidebar();
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeSidebar());
  }

  toggleSidebar() {
    if (this.sidebarOpen()) {
      this.closeSidebar();
      return;
    }

    this.overlayRef = this.drawerService.open({
      template: this.sidebarDrawer(),
      viewContainerRef: this.viewContainerRef,
      side: 'left',
      close: () => this.closeSidebar(),
    });
    this.sidebarOpen.set(true);
  }

  closeSidebar() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.sidebarOpen.set(false);
  }

  ngOnInit() {
    this.userService.me({
      includeTaskLists: false,
      includeTasks: false,
      includeCategories: false,
      force: false,
    });
  }

  ngOnDestroy(): void {
    this.closeSidebar();
  }
}
