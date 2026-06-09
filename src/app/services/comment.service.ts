import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Comment } from '../core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5271/api/comments';

  createComment(dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, dto);
  }

  getCommentsByTask(taskId: number): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`${this.baseUrl}/task/${taskId}`);
  }

  updateComment(id: number, dto: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, dto);
  }

  deleteComment(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }
}
