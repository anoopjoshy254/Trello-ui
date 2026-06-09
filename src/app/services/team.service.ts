import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Team, TeamMember } from '../core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5271/api/teams';

  createTeam(dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, dto);
  }

  getTeams(): Observable<ApiResponse<Team[]>> {
    return this.http.get<ApiResponse<Team[]>>(this.baseUrl);
  }

  getTeamById(id: number): Observable<ApiResponse<Team>> {
    return this.http.get<ApiResponse<Team>>(`${this.baseUrl}/${id}`);
  }

  updateTeam(id: number, dto: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, dto);
  }

  deleteTeam(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }

  getTeamMembers(id: number): Observable<ApiResponse<TeamMember[]>> {
    return this.http.get<ApiResponse<TeamMember[]>>(`${this.baseUrl}/${id}/members`);
  }

  addTeamMember(id: number, dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/members`, dto);
  }

  removeTeamMember(id: number, userId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}/members/${userId}`);
  }

  inviteUser(id: number, email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/invite`, { email });
  }

  acceptInvite(token: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/accept-invite`, { token });
  }
}
