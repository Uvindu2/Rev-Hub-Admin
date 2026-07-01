import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NotificationToastComponent} from './shared/components/notification-toast/notification-toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationToastComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'My App';
}
