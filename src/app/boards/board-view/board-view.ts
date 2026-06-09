import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { SignalrService, TaskUpdateEvent } from '../../services/signalr.service';
import { Project, Task } from '../../core/models/api.models';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../../layout/header/header';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { TaskCardComponent } from '../task-card/task-card';
import { TaskDetailComponent } from '../task-detail/task-detail';
import { SpinnerComponent } from '../../shared/spinner/spinner';

interface BoardColumn {
  title: string;
  id: string; // Used for drop lists
  tasks: Task[];
}

@Component({
  selector: 'app-board-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DragDropModule,
    HeaderComponent,
    SidebarComponent,
    TaskCardComponent,
    TaskDetailComponent,
    SpinnerComponent
  ],
  templateUrl: './board-view.html',
  styleUrls: ['./board-view.css']
})
export class BoardViewComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  projectService = inject(ProjectService);
  taskService = inject(TaskService);
  signalrService = inject(SignalrService);

  private signalrSub?: Subscription;

  projectId!: number;
  project: Project | null = null;
  isLoading = true;
  isSidebarCollapsed = true; // Auto-collapse on board view

  columns: BoardColumn[] = [];

  // New list form
  isAddingList = false;
  newListTitle = '';

  // New task forms
  addingTaskToCol: string | null = null;
  newTaskTitle = '';

  // Task detail modal
  selectedTaskId: number | null = null;
  isTaskDetailOpen = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = parseInt(id, 10);
        this.loadProject();
        this.loadTasks();

        // Connect to SignalR
        this.signalrService.startConnection(this.projectId);
        this.signalrSub = this.signalrService.taskUpdates$.subscribe(event => {
          this.handleTaskUpdate(event);
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.projectId) {
      this.signalrService.stopConnection(this.projectId);
    }
    if (this.signalrSub) {
      this.signalrSub.unsubscribe();
    }
  }

  loadProject() {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.project = res.data;
          this.initColumns(res.data.columns || ['Todo', 'InProgress', 'Review', 'Done']);
        }
      }
    });
  }

  initColumns(columnIds: string[]) {
    // Preserve tasks if we're just reloading columns
    const existingTasksMap = new Map<string, Task[]>();
    this.columns.forEach(c => existingTasksMap.set(c.id, c.tasks));

    this.columns = columnIds.map(id => ({
      // Simple camelCase to Space logic for display, or just use ID as title
      title: id.replace(/([A-Z])/g, ' $1').trim(),
      id: id,
      tasks: existingTasksMap.get(id) || []
    }));
  }

  loadTasks(isBackground = false) {
    if (!isBackground) {
      this.isLoading = true;
    }
    this.taskService.getTasksByProject(this.projectId, { page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.items) {
          try {
            this.distributeTasks(res.data.items);
          } catch (e) {
            console.error('Error distributing tasks:', e);
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  distributeTasks(tasks: Task[]) {
    // Clear existing
    this.columns.forEach(c => c.tasks = []);
    
    // Sort tasks by position before adding
    tasks.sort((a, b) => (a.position || 0) - (b.position || 0));

    tasks.forEach(task => {
      let col = this.columns.find(c => c.id === task.status);
      if (!col) {
        // If task has a status not in current columns, add it to the first column
        col = this.columns[0];
      }
      if (col) {
        col.tasks.push(task);
      }
    });
  }

  // --- Add New List ---
  openAddList() {
    this.isAddingList = true;
    this.newListTitle = '';
  }

  cancelAddList() {
    this.isAddingList = false;
    this.newListTitle = '';
  }

  saveNewList() {
    if (!this.newListTitle.trim() || !this.project) return;
    
    // Convert to a simple ID string (remove spaces)
    const newId = this.newListTitle.trim().replace(/\s+/g, '');
    if (this.columns.some(c => c.id === newId)) {
      alert("A list with this name already exists.");
      return;
    }

    const currentColumns = this.columns.map(c => c.id);
    const updatedColumns = [...currentColumns, newId];

    this.projectService.updateColumns(this.projectId, updatedColumns).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.project = res.data;
          this.initColumns(res.data.columns);
          this.isAddingList = false;
        }
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const movedTask = event.container.data[event.currentIndex];
      // Update position on backend
      this.taskService.updateTaskStatus(movedTask.id, movedTask.status, event.currentIndex).subscribe();
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update backend status and position
      const movedTask = event.container.data[event.currentIndex];
      const newStatus = event.container.id;
      movedTask.status = newStatus;

      this.taskService.updateTaskStatus(movedTask.id, newStatus, event.currentIndex).subscribe();
    }
  }

  get connectedDropListsIds(): string[] {
    return this.columns.map(c => c.id);
  }

  openAddTask(colId: string) {
    this.addingTaskToCol = colId;
    this.newTaskTitle = '';
    // Focus logic would go here via ViewChild
  }

  cancelAddTask() {
    this.addingTaskToCol = null;
    this.newTaskTitle = '';
  }

  saveNewTask(colId: string) {
    if (!this.newTaskTitle.trim()) return;

    const dto = {
      title: this.newTaskTitle,
      status: colId,
      priority: 'Medium',
      projectId: this.projectId
    };

    this.taskService.createTask(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadTasks(true);
          this.addingTaskToCol = null;
        }
      }
    });
  }

  openTaskDetails(task: Task) {
    this.selectedTaskId = task.id;
    this.isTaskDetailOpen = true;
  }

  closeTaskDetails() {
    this.isTaskDetailOpen = false;
    this.selectedTaskId = null;
  }

  onTaskUpdated(updatedTask: Task) {
    // Called when the modal fires update
    this.loadTasks(true);
  }

  taskDetailRefreshTrigger = 0;

  handleTaskUpdate(event: TaskUpdateEvent) {
    // For simplicity, we just reload the board on any event to ensure correct state.
    // In a massive app, you would manually patch the specific task array.
    console.log('Received SignalR event:', event);
    this.loadTasks(true);
    const updatedTaskId = event.task?.id || event.taskId;
    if (this.isTaskDetailOpen && this.selectedTaskId === updatedTaskId) {
      this.taskDetailRefreshTrigger = new Date().getTime();
    }
  }
}
