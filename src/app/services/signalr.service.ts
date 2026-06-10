import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Task } from '../core/models/api.models';

export interface TaskUpdateEvent {
  action: 'TaskCreated' | 'TaskUpdated' | 'TaskDeleted' | 'TaskMoved';
  task?: Task;
  taskId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;
  
  // Expose an observable for components to listen to task updates
  private taskUpdateSubject = new Subject<TaskUpdateEvent>();
  public taskUpdates$ = this.taskUpdateSubject.asObservable();

  constructor() {}

  public async startConnection(projectId: number): Promise<void> {
    const hubUrl = 'http://4.188.1.67:5000/boardHub';
    
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR connected to hub:', hubUrl);
      
      // Join the specific project board group
      await this.hubConnection.invoke('JoinBoard', projectId.toString());
      console.log(`Joined SignalR group for project: ${projectId}`);
      
      this.registerEvents();
    } catch (err) {
      console.error('Error while starting connection: ' + err);
    }
  }

  public async stopConnection(projectId: number): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.invoke('LeaveBoard', projectId.toString());
        await this.hubConnection.stop();
        console.log(`Left SignalR group for project: ${projectId}`);
      } catch (err) {
        console.error('Error stopping SignalR connection: ' + err);
      }
    }
  }

  private registerEvents(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('TaskCreated', (task: Task) => {
      this.taskUpdateSubject.next({ action: 'TaskCreated', task });
    });

    this.hubConnection.on('TaskUpdated', (task: Task) => {
      this.taskUpdateSubject.next({ action: 'TaskUpdated', task });
    });

    this.hubConnection.on('TaskMoved', (task: Task) => {
      this.taskUpdateSubject.next({ action: 'TaskMoved', task });
    });

    this.hubConnection.on('TaskDeleted', (taskId: number) => {
      this.taskUpdateSubject.next({ action: 'TaskDeleted', taskId });
    });
  }
}
