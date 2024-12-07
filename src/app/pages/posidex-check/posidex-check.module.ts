import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PosidexCheckPageRoutingModule } from './posidex-check-routing.module';

import { PosidexCheckPage } from './posidex-check.page';
import { DirectivesModule } from 'src/modules/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PosidexCheckPageRoutingModule,
    ReactiveFormsModule,
    DirectivesModule,
  ],
  declarations: [PosidexCheckPage],
})
export class PosidexCheckPageModule {}
