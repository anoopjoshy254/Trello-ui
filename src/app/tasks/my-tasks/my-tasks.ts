import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { TaskDetailComponent } from '../../boards/task-detail/task-detail';
import { TaskService } from '../../services/task.service';
import { Task } from '../../core/models/api.models';
import { SpinnerComponent } from '../../shared/spinner/spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, TaskDetailComponent, SpinnerComponent],
  templateUrl: './my-tasks.html',
  styleUrls: ['./my-tasks.css']
})
export class MyTasksComponent implements OnInit {
  taskService = inject(TaskService);
  
  tasks: Task[] = [];
  isLoading = true;
  isSidebarCollapsed = false;
  currentDate = new Date();

  // Task detail modal state
  selectedTaskId: number | null = null;
  isTaskDetailOpen = false;

  authService = inject(AuthService);
  currentUserId: number | null = null;

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.taskService.getMyAssignedTasks(1, 100).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tasks = res.data.items;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openTaskDetails(taskId: number) {
    this.selectedTaskId = taskId;
    this.isTaskDetailOpen = true;
  }

  closeTaskDetails() {
    this.isTaskDetailOpen = false;
    this.selectedTaskId = null;
  }

  onTaskUpdated(updatedTask: Task) {
    this.loadTasks();
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter(t => this.isMyAssignmentCompleted(t)).length;
  }

  get progressPercentage(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.completedTasks / this.totalTasks) * 100);
  }

  isMyAssignmentCompleted(task: Task): boolean {
    if (!this.currentUserId || !task.assignees) return false;
    const assignment = task.assignees.find(a => a.userId === this.currentUserId);
    return assignment ? !!assignment.isCompleted : false;
  }

  toggleTaskCompletion(task: Task, event: Event) {
    event.stopPropagation();
    if (!this.currentUserId) return;
    
    const isCompleted = !this.isMyAssignmentCompleted(task);
    
    this.taskService.toggleAssignmentCompletion(task.id, isCompleted).subscribe({
      next: (res) => {
        if (res.success) {
          if (task.assignees) {
            const assignment = task.assignees.find(a => a.userId === this.currentUserId);
            if (assignment) {
              assignment.isCompleted = isCompleted;
            }
          }
        }
      }
    });
  }
}
