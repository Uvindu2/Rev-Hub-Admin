import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VehicleResponseProjection} from '../../../dto/response/VehicleResponseProjection';

@Component({
  selector: 'app-vehicle-view-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-view-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './vehicle-view-form.css',
})
export class VehicleViewForm {
  @Input() vehicle!: VehicleResponseProjection;
  @Output() close = new EventEmitter<void>();

  closeForm(): void {
    this.close.emit();
  }
}
