import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentViewPageRoutingModule } from './document-view-routing.module';

import { DocumentViewPage } from './document-view.page';
import { SharedModule } from 'src/modules/sharedModule/sharedModule';
import { DirectivesModule } from 'src/modules/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentViewPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    DirectivesModule
  ],
  declarations: [DocumentViewPage]
})
export class DocumentViewPageModule {}