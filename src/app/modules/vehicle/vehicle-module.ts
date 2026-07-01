import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {VehicleEditFormComponent} from './vehicle-edit-form/vehicle-edit-form'; // Assuming your form uses ngModel

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    VehicleEditFormComponent
  ],
  exports: [
    VehicleEditFormComponent // 👈 2. EXPORT IT so your standalone component can see it
  ]
})
export class VehicleModule {}
