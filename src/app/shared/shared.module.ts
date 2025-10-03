import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FechaBonitaPipe } from './pipes/fecha-bonita.pipe';

@NgModule({
  declarations: [FechaBonitaPipe],
  imports: [CommonModule],
  exports: [FechaBonitaPipe] // 👈 así lo usás en toda la app
})
export class SharedModule {}
