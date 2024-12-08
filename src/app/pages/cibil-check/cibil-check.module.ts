import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CibilCheckPageRoutingModule } from './cibil-check-routing.module';

import { CibilCheckPage } from './cibil-check.page';
import { DirectivesModule } from 'src/modules/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CibilCheckPageRoutingModule,
    DirectivesModule,
  ],
  declarations: [CibilCheckPage],
})
export class CibilCheckPageModule {}
