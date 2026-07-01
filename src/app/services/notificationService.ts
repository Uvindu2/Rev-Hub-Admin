import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationState {
  message: string;
  type: 'success' | 'error';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationSubject = new Subject<NotificationState | null>();
  // Components will subscribe to this stream to listen for toast requests
  notification$ = this.notificationSubject.asObservable();

  show(message: string, type: 'success' | 'error' = 'success', duration: number = 3500): void {
    this.notificationSubject.next({ message, type, duration });
  }

  clear(): void {
    this.notificationSubject.next(null);
  }
}
