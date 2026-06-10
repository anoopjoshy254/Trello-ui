import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Attachment } from '../core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://4.188.1.67:5000/api/attachments';

  uploadAttachment(taskId: number, file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('taskId', taskId.toString());
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/upload`, formData);
  }

  getAttachmentById(id: number): Observable<ApiResponse<Attachment>> {
    return this.http.get<ApiResponse<Attachment>>(`${this.baseUrl}/${id}`);
  }

  getAttachmentsByTask(taskId: number): Observable<ApiResponse<Attachment[]>> {
    return this.http.get<ApiResponse<Attachment[]>>(`${this.baseUrl}/task/${taskId}`);
  }

  downloadAttachment(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { responseType: 'blob' });
  }

  deleteAttachment(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }
}
