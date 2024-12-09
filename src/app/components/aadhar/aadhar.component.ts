import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// import { SQLitePorter } from '@awesome-cordova-plugins/sqlite-porter/ngx';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { FingerprintPage } from 'src/app/pages/fingerprint/fingerprint.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';

@Component({
  selector: 'app-aadhar',
  templateUrl: './aadhar.component.html',
  styleUrls: ['./aadhar.component.scss'],
})
export class AadharComponent {
  aadharData: FormGroup;
  aadhaarVID: any;
  userType: any;
  aadharNum: any;
  vidNum: any;

  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public globalFun: GlobalService,
    public alertService: CustomAlertControlService
  ) {
    this.aadhaarVID = 'Aadhaar';
    this.userType = this.globalData.getborrowerType();

    this.aadharData = this.formBuilder.group({
      aadharNum: [
        '',
        Validators.compose([
          Validators.maxLength(12),
          Validators.pattern('[0-9]*'),
        ]),
      ],
      vidNum: [
        '',
        Validators.compose([
          Validators.maxLength(12),
          Validators.pattern('[0-9]*'),
        ]),
      ],
    });
  }

  AadhaarVID() {
    if (this.aadhaarVID === 'Aadhaar') {
      this.aadhaarVID = 'Aadhaar';
    } else if (this.aadhaarVID === 'VID') {
      this.aadhaarVID = 'VID';
    }
    console.log('aadhaarVID: ' + this.aadhaarVID);
  }

  fingerprintpage(value) {
    if (this.aadharNum === undefined) {
      this.alertService.showAlert('Alert!', 'Enter Aadhar number.');
    } else {
      localStorage.setItem('aadhar', this.aadharNum);
      this.navCtrl.navigate(['FingerprintPage'], {
        queryParams: { fuser: this.userType, aadharNum: this.aadharNum },
        skipLocationChange: true,
        replaceUrl: true,
      });
    }
    // alert("f: " + this.userType);this.navCtrl.push(FingerprintPage, { fuser: this.userType });
  }
}
