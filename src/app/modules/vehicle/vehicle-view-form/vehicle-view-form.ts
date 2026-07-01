import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Vehicle} from '../vehicle-view/vehicle-view';

@Component({
  selector: 'app-vehicle-view-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-view-form.html',
  styleUrl: './vehicle-view-form.css',
})
export class VehicleViewForm {
  @Input() vehicle!: Vehicle;
  @Output() close = new EventEmitter<void>();

  closeForm(): void {
    this.close.emit();
  }
}
