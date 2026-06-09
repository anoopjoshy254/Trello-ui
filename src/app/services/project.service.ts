import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Project } from '../core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5095/api/projects';

  createProject(dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, dto);
  }

  getMyProjects(): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(this.baseUrl);
  }

  getProjectById(id: number): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.baseUrl}/${id}`);
  }

  updateProject(id: number, dto: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, dto);
  }

  deleteProject(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }

  updateColumns(id: number, columns: string[]): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.baseUrl}/${id}/columns`, { columns });
  }
}
