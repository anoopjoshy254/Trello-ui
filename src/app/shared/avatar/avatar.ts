import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.html',
  styleUrls: ['./avatar.css']
})
export class AvatarComponent implements OnChanges {
  @Input() src?: string | null;
  @Input() fullName?: string | null;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  initials: string = '';

  ngOnChanges() {
    if (!this.src && this.fullName) {
      this.initials = this.getInitials(this.fullName);
    }
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
