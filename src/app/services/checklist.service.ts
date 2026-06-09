import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Checklist, ChecklistItem } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class ChecklistService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5271/api/checklists';

  getChecklists(taskId: number): Observable<ApiResponse<Checklist[]>> {
    const params = new HttpParams().set('taskId', taskId.toString());
    return this.http.get<ApiResponse<Checklist[]>>(this.baseUrl, { params });
  }

  createChecklist(dto: { title: string; taskId: number }): Observable<ApiResponse<Checklist>> {
    return this.http.post<ApiResponse<Checklist>>(this.baseUrl, dto);
  }

  deleteChecklist(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }

  addItem(dto: { content: string; checklistId: number; position: number }): Observable<ApiResponse<ChecklistItem>> {
    return this.http.post<ApiResponse<ChecklistItem>>(`${this.baseUrl}/items`, dto);
  }

  updateItem(id: number, dto: { content?: string; isCompleted?: boolean; position?: number }): Observable<ApiResponse<ChecklistItem>> {
    return this.http.put<ApiResponse<ChecklistItem>>(`${this.baseUrl}/items/${id}`, dto);
  }

  deleteItem(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/items/${id}`);
  }
}
