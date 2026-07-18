import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VehicleProjection} from '../../../dto/response/VehicleProjection';

@Component({
  selector: 'app-vehicle-view-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-view-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './vehicle-view-form.css',
})
export class VehicleViewForm {
  @Input() vehicle!: VehicleProjection;
  @Output() close = new EventEmitter<void>();

  closeForm(): void {
    this.close.emit();
  }
}
