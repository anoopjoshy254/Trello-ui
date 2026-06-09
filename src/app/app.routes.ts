import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/boards', 
    pathMatch: 'full' 
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./auth/profile/profile').then(m => m.ProfileComponent)
  },
  {
    path: 'accept-invite',
    loadComponent: () => import('./auth/accept-invite/accept-invite').then(m => m.AcceptInviteComponent)
  },
  {
    path: 'boards',
    canActivate: [authGuard],
    loadComponent: () => import('./boards/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'boards/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./boards/board-view/board-view').then(m => m.BoardViewComponent)
  },
  {
    path: 'my-tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./tasks/my-tasks/my-tasks').then(m => m.MyTasksComponent)
  },
  {
    path: 'teams',
    canActivate: [authGuard],
    loadComponent: () => import('./teams/team-list/team-list').then(m => m.TeamListComponent)
  },
  {
    path: 'teams/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./teams/team-detail/team-detail').then(m => m.TeamDetailComponent)
  },
  {
    path: '**',
    redirectTo: '/boards'
  }
];
