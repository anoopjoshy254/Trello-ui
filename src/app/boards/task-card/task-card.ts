import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../core/models/api.models';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrls: ['./task-card.css']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() cardClick = new EventEmitter<Task>();

  onClick() {
    this.cardClick.emit(this.task);
  }

  getPriorityIcon(priority: string): string {
    switch(priority.toLowerCase()) {
      case 'high': return 'fa-angles-up text-danger';
      case 'medium': return 'fa-angle-up text-warning';
      case 'low': return 'fa-angle-down text-info';
      default: return 'fa-minus text-muted';
    }
  }

  get hasAttachments(): boolean {
    return !!(this.task.attachments && this.task.attachments.length > 0);
  }

  get hasComments(): boolean {
    return !!(this.task.comments && this.task.comments.length > 0);
  }
}
