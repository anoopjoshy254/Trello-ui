import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Label } from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class LabelService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5095/api/labels';

  getLabels(projectId: number): Observable<ApiResponse<Label[]>> {
    const params = new HttpParams().set('projectId', projectId.toString());
    return this.http.get<ApiResponse<Label[]>>(this.baseUrl, { params });
  }

  createLabel(dto: { name: string; color: string; projectId: number }): Observable<ApiResponse<Label>> {
    return this.http.post<ApiResponse<Label>>(this.baseUrl, dto);
  }

  updateLabel(id: number, dto: { name: string; color: string; projectId: number }): Observable<ApiResponse<Label>> {
    return this.http.put<ApiResponse<Label>>(`${this.baseUrl}/${id}`, dto);
  }

  deleteLabel(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }

  applyLabel(labelId: number, taskId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${labelId}/tasks/${taskId}`, {});
  }

  removeLabel(labelId: number, taskId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${labelId}/tasks/${taskId}`);
  }
}
