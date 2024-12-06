import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScoreCardPageRoutingModule } from './score-card-routing.module';

import { ScoreCardPage } from './score-card.page';
import { DirectivesModule } from 'src/modules/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScoreCardPageRoutingModule,
    DirectivesModule,
    ReactiveFormsModule,
  ],
  declarations: [ScoreCardPage],
})
export class ScoreCardPageModule {}
