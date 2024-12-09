import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController, NavParams } from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { SqliteService } from 'src/providers/sqlite.service';

@Component({
  selector: 'app-vehicle-valuation',
  templateUrl: './vehicle-valuation.page.html',
  styleUrls: ['./vehicle-valuation.page.scss'],
})
export class VehicleValuationPage {
  vehicleValuationDetails: FormGroup;
  videoFile: any;
  proofImglen: any = 0;
  proofImgs = [];
  refId: any;
  id: any;
  vId: any;

  constructor(
    public navCtrl: NavController,
    // public media: MediaCapture,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public router: Router,
    public alertService: CustomAlertControlService // public globalData: DataPassingProvider
  ) {
    this.formDetails();
    this.getVehicleValutionFormValues();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.refId = 1;
    this.id = 1;
  }

  formDetails() {
    this.vehicleValuationDetails = this.formBuilder.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      vechicleAge: ['', Validators.required],
      kmDriven: ['', Validators.required],
      obvValue: ['', Validators.required],
      valuationAmount: ['', Validators.required],
      sanctionAmount: ['', Validators.required],
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VehicleValuationPage');
  }

  homePage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  getVehicleValutionFormValues() {
    if (!!this.refId) {
      try {
        const exceptCol = ['refId', 'id', 'vId', 'obvCheck', 'inspectionVideo'];
        this.sqliteProvider
          .getVehicleValuationDetails(this.refId, this.id)
          .then((data) => {
            console.log(data);
            this.vId = data[0].field;
            this.videoFile = data[0].inspectionVideo;
            let dataKeys = Object.keys(data[0]);
            for (let i = 0; i <= dataKeys.length - 1; i++) {
              if (exceptCol.indexOf(dataKeys[i]) == -1) {
                this.vehicleValuationDetails.controls[dataKeys[i]].setValue(
                  data[0][dataKeys[i]]
                );
              }
            }
          });
      } catch (error) {
        console.log(error);
      }
    }
  }

  vehicleValuationSave(formValue) {
    console.log(formValue);
    this.globalData.globalLodingPresent('Please wait...');
    console.log(formValue);
    if (
      this.videoFile === '' ||
      this.videoFile === undefined ||
      this.videoFile === null
    ) {
      this.alertService.showAlert('Alert!', 'Please Add Inspection Video');
      this.globalData.globalLodingDismiss();
    } else {
      let obvValue = '98';
      this.sqliteProvider
        .insertVehicleValuationDetails(
          this.refId,
          this.id,
          formValue,
          this.vId,
          obvValue,
          this.videoFile
        )
        .then((data) => {
          console.log(data);
          if (this.vId === '' || this.vId === undefined || this.vId === null) {
            this.vId = data.insertId;
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert',
              'Vehicle Valuation Values Added Successfully.'
            );
          } else {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert',
              'Vehicle Valuation Values Updated Successfully.'
            );
          }
        })
        .catch((err) => {
          console.log(err);
          this.globalData.globalLodingDismiss();
        });
    }
  }

  obvCheck() {
    console.log('fj');
    this.alertService.showAlert('Alert', 'OBV Check.', 'OBV Value = 98');
  }

  captureVideo() {
    if (
      this.videoFile === '' ||
      this.videoFile === undefined ||
      this.videoFile === null
    ) {
      // this.media.captureVideo({ duration: 10 }).then(data => {
      //   console.log(data);
      //   this.videoFile = data[0].fullPath;
      // })
    } else {
      this.alertService.showVideoAlert(this.videoFile);
    }
  }
}
