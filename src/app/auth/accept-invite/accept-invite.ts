import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';
import { SpinnerComponent } from '../../shared/spinner/spinner';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  template: `
    <div class="accept-invite-container">
      <div class="card">
        <div class="card-header text-center">
          <img src="assets/trello-logo-blue.svg" alt="Trello Logo" class="logo" />
          <h2>Workspace Invitation</h2>
        </div>
        <div class="card-body text-center">
          <app-spinner *ngIf="isLoading" [fullScreen]="false"></app-spinner>
          
          <div *ngIf="!isLoading && error">
            <div class="error-icon"><i class="fa-solid fa-circle-xmark"></i></div>
            <p class="error-message">{{ error }}</p>
            <button class="btn btn-primary" routerLink="/">Go to Home</button>
          </div>

          <div *ngIf="!isLoading && success">
            <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
            <p class="success-message">{{ success }}</p>
            <button class="btn btn-primary" routerLink="/">Go to Workspace</button>
          </div>
          
          <div *ngIf="!isLoading && requiresAuth">
            <p>You need to be logged in to accept this invitation.</p>
            <div class="auth-buttons">
              <button class="btn btn-primary" (click)="goToLogin()">Log In</button>
              <button class="btn btn-secondary" (click)="goToRegister()">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accept-invite-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: var(--trello-surface);
      padding: 20px;
    }
    .card {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 3px;
      box-shadow: 0 4px 12px rgba(9,30,66,0.15);
      padding: 32px 40px;
    }
    .logo { height: 40px; margin-bottom: 24px; }
    .text-center { text-align: center; }
    h2 { font-size: 20px; color: var(--trello-text); margin-bottom: 24px; margin-top: 0; }
    .error-icon { font-size: 48px; color: var(--trello-red); margin-bottom: 16px; }
    .success-icon { font-size: 48px; color: var(--trello-green); margin-bottom: 16px; }
    .error-message, .success-message { font-size: 16px; margin-bottom: 24px; color: var(--trello-text); }
    .auth-buttons { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
    .btn { padding: 10px 16px; font-weight: bold; border: none; border-radius: 3px; cursor: pointer; font-size: 14px; width: 100%; }
    .btn-primary { background-color: var(--trello-blue); color: white; }
    .btn-primary:hover { background-color: var(--trello-blue-dark); }
    .btn-secondary { background-color: rgba(9,30,66,0.04); color: var(--trello-text); }
    .btn-secondary:hover { background-color: rgba(9,30,66,0.08); }
  `]
})
export class AcceptInviteComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  teamService = inject(TeamService);
  authService = inject(AuthService);

  isLoading = true;
  error = '';
  success = '';
  requiresAuth = false;
  token = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.error = 'Invalid invitation link.';
        this.isLoading = false;
        return;
      }

      this.processInvitation();
    });
  }

  processInvitation() {
    if (!this.authService.isLoggedIn()) {
      // Store token in session storage so it can be picked up after login/register
      sessionStorage.setItem('pending_invite_token', this.token);
      this.requiresAuth = true;
      this.isLoading = false;
      return;
    }

    this.teamService.acceptInvite(this.token).subscribe({
      next: (res) => {
        if (res.success) {
          this.success = 'Invitation accepted! You have successfully joined the workspace.';
          sessionStorage.removeItem('pending_invite_token');
        } else {
          this.error = res.message || 'Failed to accept invitation.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to accept invitation. The link may have expired or you are already a member.';
        this.isLoading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
