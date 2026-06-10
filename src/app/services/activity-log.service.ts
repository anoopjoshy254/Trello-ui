import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ActivityLog } from '../core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private http = inject(HttpClient);
  private baseUrl = 'http://4.188.1.67:5000/api/activitylogs';

  getTaskLogs(taskId: number): Observable<ApiResponse<ActivityLog[]>> {
    return this.http.get<ApiResponse<ActivityLog[]>>(`${this.baseUrl}/task/${taskId}`);
  }
}
