import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditLogsPageRoutingModule } from './audit-logs-routing.module';

import { AuditLogsPage } from './audit-logs.page';
import { SharedModule } from 'src/modules/sharedModule/sharedModule';
import { DirectivesModule } from 'src/modules/directives/directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuditLogsPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    DirectivesModule
  ],
  declarations: [AuditLogsPage]
})
export class AuditLogsPageModule {}