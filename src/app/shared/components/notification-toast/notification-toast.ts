import {Component, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotificationService, NotificationState} from '../../../services/notificationService';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./notification-toast.css']
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  toast: NotificationState | null = null;
  private sub!: Subscription;
  private timeoutId: any;

  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.sub = this.notificationService.notification$.subscribe(state => {
      this.toast = state;

      if (this.timeoutId) clearTimeout(this.timeoutId);

      if (state) {
        // Auto-dismiss after duration if buttons aren't clicked
        this.timeoutId = setTimeout(() => {
          this.dismissToast();
        }, state.duration || 3500);
      }
    });
  }

  // Manual dismiss function linked to OK and Close buttons
  dismissToast(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.toast = null;
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
