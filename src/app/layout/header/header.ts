import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AvatarComponent } from '../../shared/avatar/avatar';
import { NotificationPanelComponent } from '../notification-panel/notification-panel';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent, NotificationPanelComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  isProfileMenuOpen = false;
  isNotificationPanelOpen = false;
  unreadCount = 0;
  fullName = '';

  ngOnInit() {
    this.fullName = localStorage.getItem('fullName') || '';
    if (this.authService.isLoggedIn()) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.notificationService.getNotifications(true).subscribe(res => {
      if (res.success && res.data) {
        this.unreadCount = res.data.length;
      }
    });
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    if (this.isProfileMenuOpen) this.isNotificationPanelOpen = false;
  }

  toggleNotificationPanel() {
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
    if (this.isNotificationPanelOpen) {
      this.isProfileMenuOpen = false;
      this.unreadCount = 0; // Optimistically clear badge
    }
  }

  logout() {
    this.authService.logout();
  }
}
