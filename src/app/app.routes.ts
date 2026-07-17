import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home)
      },
      {
        path: 'lists/:id',
        loadComponent: () =>
          import('./features/list-details/list-details').then((m) => m.ListDetails)
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/search').then((m) => m.Search)
      },
      {
        path: 'categories/:id',
        loadComponent: () =>
          import('./features/category-details/category-details').then((m) => m.CategoryDetails)
      }
    ]
  },

  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth').then((m) => m.Auth)
  }
];
