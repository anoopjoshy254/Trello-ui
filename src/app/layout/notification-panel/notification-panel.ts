import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../core/models/api.models';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-panel.html',
  styleUrls: ['./notification-panel.css']
})
export class NotificationPanelComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  notificationService = inject(NotificationService);
  notifications: Notification[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.notificationService.getNotifications(false).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.notifications = res.data;
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe(() => {
      const notif = this.notifications.find(n => n.id === id);
      if (notif) notif.isRead = true;
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }
}
