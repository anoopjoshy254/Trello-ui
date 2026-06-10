import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Notification } from '../core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = 'http://4.188.1.67:5000/api/notifications';

  getNotifications(unreadOnly: boolean = false): Observable<ApiResponse<Notification[]>> {
    const params = new HttpParams().set('unreadOnly', unreadOnly.toString());
    return this.http.get<ApiResponse<Notification[]>>(this.baseUrl, { params });
  }

  markAsRead(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/read-all`, {});
  }

  deleteNotification(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
  }
}
