import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResult, Task } from '../core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = 'http://4.188.1.67:5000/api/tasks';

  createTask(dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, dto);
  }

  getTasksByProject(projectId: number, filters?: { status?: string, priority?: string, page?: number, pageSize?: number }): Observable<ApiResponse<PagedResult<Task>>> {
    let params = new HttpParams().set('projectId', projectId.toString());
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }

    return this.http.get<ApiResponse<PagedResult<Task>>>(this.baseUrl, { params });
  }

  getMyAssignedTasks(page?: number, pageSize?: number): Observable<ApiResponse<PagedResult<Task>>> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (pageSize) params = params.set('pageSize', pageSize.toString());
    
    return this.http.get<ApiResponse<PagedResult<Task>>>(`${this.baseUrl}/my-tasks`, { params });
  }

  getTaskById(id: number): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.baseUrl}/${id}`);
  }

  updateTask(id: number, dto: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, dto);
  }

  deleteTask(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }

  assignUser(id: number, userId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}/assign`, { userId });
  }

  unassignUser(id: number, userId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}/assign/${userId}`);
  }

  updateTaskStatus(id: number, status: string, position?: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}/status`, { status, position });
  }

  toggleAssignmentCompletion(id: number, isCompleted: boolean): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}/assignments/complete`, { isCompleted });
  }
}
