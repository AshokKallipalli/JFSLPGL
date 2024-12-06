import { Component, OnInit } from '@angular/core';

import { SqliteService } from 'src/providers/sqlite.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { JfshomePage } from '../../pages/jfshome/jfshome.page';
import {
  AlertController,
  NavController,
  NavParams,
  ModalController,
} from '@ionic/angular';
import { RestService } from 'src/providers/rest.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KarzaDetailsPage } from 'src/app/pages/karza-details/karza-details.page';
import { FingerprintPage } from 'src/app/pages/fingerprint/fingerprint.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

// import { NewapplicationPage } from './../../pages/newapplication/newapplication';
// import { FingerprintPage } from './../../pages/fingerprint/fingerprint';
// import { KarzaDetailsPage } from '../../pages/karza-details/karza-details';

@Component({
  selector: 'app-second-kyc',
  templateUrl: './second-kyc.component.html',
  styleUrls: ['./second-kyc.component.scss'],
})
export class SecondKycComponent {
  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  idProofForm: FormGroup;
  customerTypeSet: any;
  textType: any = 'password';
  ids: any = [];
  leadId: any;
  naveParamsValue: any;

  todayDate: any = new Date();
  minDobAge: any;
  maxDobAge: any;
  selectOptions = {
    cssClass: 'remove-ok',
  };

  yesNo = [
    { code: 'Y', name: 'Yes' },
    { code: 'N', name: 'No' },
  ];

  constructor(
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private navCtrl: Router,
    public formBuilder: FormBuilder,
    public globalData: DataPassingProviderService,
    public network: Network,
    public master: RestService,
    public sqliteProvider: SqliteService,
    public modalCtrl: ModalController,
    public globalFunc: GlobalService,
    public activateRoute: ActivatedRoute,
    public alertService: CustomAlertControlService
  ) {
    this.ageRestrict();

    this.activateRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    console.log(this.naveParamsValue);
    if (this.naveParamsValue.idType) {
      this.janaId = this.naveParamsValue.idNumber;
    }
    this.ids = [];
    this.leadId = this.naveParamsValue.leadId;
    this.customerTypeSet = this.naveParamsValue.custType;
    this.ekycData = this.naveParamsValue.ekycData
      ? JSON.parse(this.naveParamsValue.ekycData)
      : '';
    this.ids.push(JSON.parse(this.naveParamsValue.data));
    this.idProofForm = this.formBuilder.group({
      idType: [''],
      aadhar: [''],
      pan: [''],
      firstName: [''],
      middleName: [''],
      lastName: [''],
      namePan: [''],
      dobPan: [''],
      voter: [''],
      license: [''],
      passport: [''],
      entityNum: [''],
      bpan: [''],
      aepsStatus: [''],
    });
    // let root = this.viewCtrl.instance.navCtrl._app._appRoot;
    document.addEventListener('click', function (event) {
      let btn = <HTMLLIElement>(
        document.querySelector('.remove-ok .alert-button-group')
      );
      let target = <HTMLElement>event.target;
      if (
        (btn && target.className == 'alert-radio-label') ||
        target.className == 'alert-radio-inner' ||
        target.className == 'alert-radio-icon'
      ) {
        // let view = root._overlayPortal._views[0];
        // let inputs = view.instance.d.inputs;
        // for (let input of inputs) {
        //   if (input.checked) {
        //     view.instance.d.buttons[1].handler([input.value]);
        //     view.dismiss();
        //     break;
        //   }
        // }
      }
    });
    this.checkCustomerTypeData();
    // this.custTypeChng(this.globalData.getCustomerType());
  }

  async closeModal() {
    let alert = await this.alertCtrl.create({
      header: 'Alert!',
      message: 'Data will be lost?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'Yes',
          handler: () => {
            this.sqliteProvider.removeEkycData(this.leadId);
            this.sqliteProvider.removeKarzaData(this.leadId);
            this.navCtrl.navigate(['/JsfhomePage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          },
        },
      ],
    });
    alert.present();
  }

  posidexCheck(value) {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert',
        'Kindly check your internet connection!!!'
      );
    } else {
      console.log(value);
      // this.globalData.globalLodingPresent("Fetching data...");
      // this.globalData.setCustomerType(value.custType);
      // let leadId = Math.floor(Math.random() * 900000000000) + 100000000000;
      if (
        value.aadhar != null &&
        value.aadhar != undefined &&
        value.aadhar != ''
      ) {
        this.globalData.globalLodingDismiss();
        // this.aadharEkyc(value.idType[0], value.aadhar, leadId);
        this.aadharVault(
          value.idType,
          value.aadhar,
          value.aepsStatus,
          this.leadId
        );
      } else if (
        value.pan != null &&
        value.pan != undefined &&
        value.pan != ''
      ) {
        this.panKarza(
          value.idType,
          value.pan,
          this.leadId,
          value.firstName,
          value.middleName,
          value.lastName,
          value.namePan,
          value.dobPan
        );
      } else if (
        value.voter != null &&
        value.voter != undefined &&
        value.voter != ''
      ) {
        this.voterKarza(value.idType, value.voter, this.leadId);
      } else if (
        value.license != null &&
        value.license != undefined &&
        value.license != ''
      ) {
        this.initKarzaAPi(value.idType, value.license, this.leadId);
      } else if (
        value.passport != null &&
        value.passport != undefined &&
        value.passport != ''
      ) {
        this.initKarzaAPi(value.idType, value.passport, this.leadId);
      } else if (
        value.bpan != null &&
        value.bpan != undefined &&
        value.bpan != ''
      ) {
        this.stitchApiCall(value.idType, value.bpan, this.leadId);
      } else {
        this.stitchApiCall(value.idType, value.entityNum, this.leadId);
        // this.initPosidex(value.idType[0], value.entityNum, leadId);
      }
    }

    // if (this.globalData.getCustomerType() == '1') {
    //   if (idType == 'PAN CARD') {
    //     //this.initPosidex('pan', this.proofData.controls.promoIDRef.value, leadId);
    //     this.panKarza(idType, this.proofData.controls.promoIDRef.value, leadId);
    //   } else if (idType == 'VOTER ID') {
    //     //this.initPosidex('voterid', this.proofData.controls.promoIDRef.value, leadId);
    //     this.voterKarza(idType, this.proofData.controls.promoIDRef.value, leadId);
    //   } else if (idType == 'Driving License'.toUpperCase()) {
    //     if (this.proofData.controls.promoexpiry.value) {
    //       // this.initPosidex('drivingLicence', this.proofData.controls.promoIDRef.value, leadId);
    //       this.initKarzaAPi('drivingLicence', this.proofData.controls.promoIDRef.value, leadId);
    //     } else {
    //       setTimeout(() => {
    //         this.alertService.showAlert("Alert!", "enter expiry date!");
    //       }, 400);
    //     }
    //   } else if (idType == 'PASSPORT') {
    //     // this.initPosidex('passport', this.proofData.controls.promoIDRef.value, leadId);
    //     this.initKarzaAPi('passport', this.proofData.controls.promoIDRef.value, leadId);
    //   } else if (idType == 'AADHAR CARD') {
    //     if (this.vaultStatus == 'Y') {
    //       this.aadhaarVaultRetrieve('', true, leadId);
    //       // this.initAadhar('aadhar', this.proofData.controls.promoIDRef.value, leadId);
    //     } else {
    //       setTimeout(() => {
    //         this.alertService.showAlert("Alert!", "Please complete aadhar vault process!!!");
    //       }, 400);
    //     }
    //   }
    // } else {
    //   this.stitchApiCall(idType, this.proofData.controls.promoIDRef.value, leadId);
    // }
  }

  async initKarzaAPi(idType, idNumber, leadId, body?, ekycData?) {
    // let modal = this.modalCtrl.create('KarzaDetailsPage', { data: JSON.stringify(body), idType: idType, idNumber: idNumber, leadId: leadId, leadStatus: this.leadStatus,userType: this.globalData.getborrowerType()  });
    // modal.present();
    const modal = await this.modalCtrl.create({
      component: KarzaDetailsPage,
      componentProps: {
        data: JSON.stringify(body),
        idType: idType,
        idNumber: idNumber,
        leadId: leadId,
        leadStatus: 'online',
        userType: this.globalData.getborrowerType(),
      },
      cssClass: '',
    });

    modal.onDidDismiss().then((data) => {
      console.log(data, data.data, 'data');
      this.globalData.globalLodingDismiss();
      if (data.data) {
        if (idType == 'pan') {
          this.globalData.setCustType('N');
          this.globalFunc.globalLodingDismiss();
          this.globalData.globalLodingDismiss();
          this.navCtrl.navigate(['/NewapplicationPage'], {
            queryParams: {
              pan: JSON.stringify(data.data),
              leadStatus: 'online',
              leadId: leadId,
              userType: this.globalData.getborrowerType(),
            },
            skipLocationChange: true,
            replaceUrl: true,
          });
        } else if (idType == 'voterid') {
          this.globalData.setCustType('N');
          this.globalFunc.globalLodingDismiss();
          this.globalData.globalLodingDismiss();
          this.navCtrl.navigate(['/NewapplicationPage'], {
            queryParams: {
              voter: JSON.stringify(data.data),
              leadStatus: 'online',
              leadId: leadId,
              userType: this.globalData.getborrowerType(),
            },
            skipLocationChange: true,
            replaceUrl: true,
          });
        } else if (idType == 'drivingLicence') {
          this.globalData.setCustType('N');
          this.ids.push(data.data);
          this.globalFunc.globalLodingDismiss();
          console.log(this.globalData._loading);
          this.globalData._loading.dismissAll();
          this.globalData.globalLodingDismissAll();
          this.globalData._loading.dismissAll();
          // this.navCtrl.navigate(['/NewapplicationPage'], {queryParams:{licence: data, leadStatus: 'online', leadId: leadId, userType: this.globalData.getborrowerType() }});
        } else if (idType == 'passport') {
          this.globalData.setCustType('N');
          this.ids.push(data.data);
          this.globalFunc.globalLodingDismiss();
          this.globalData._loading.dismissAll();
          this.globalData.globalLodingDismissAll();
          this.globalData._loading.dismissAll();

          // this.navCtrl.navigate(['/NewapplicationPage'], {queryParams:{passport: data, leadStatus: 'online', leadId: leadId, userType: this.globalData.getborrowerType() }});
        } else if (idType == 'aadhar') {
          this.globalData.setCustType('N');
          this.globalFunc.globalLodingDismiss();
          this.globalData.globalLodingDismiss();
          this.navCtrl.navigate(['/NewapplicationPage'], {
            queryParams: {
              leadStatus: 'online',
              leadId: this.leadId,
              userType: this.globalData.getborrowerType(),
              ekycData: JSON.stringify(ekycData),
              janaid: this.janaId,
              aadharName: JSON.stringify(data.data),
              ekyc: 'OTP',
            },
            skipLocationChange: true,
            replaceUrl: true,
          });
          // this.navCtrl.navigate(['/NewapplicationPage'], {queryParams:{ pan: data, leadStatus: 'online', leadId: leadId, userType: this.globalData.getborrowerType() }});
        }
      }
    });
    modal.present();
  }

  stitchApiCall(idType, idNumber, leadId) {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Kindly check your internet connection!!!'
      );
    } else {
      let body = {
        id: idNumber,
      };
      this.master.restApiCallAngular('StitchApi', body).then(
        (result: any) => {
          if (result.errorCode == '000') {
            let res = JSON.parse(result.Reposne);
            let gst;
            let gstNo;
            let obj;
            let cin = '';
            let tan = '';

            if (res.result) {
              if (!(Object.keys(res.result).length === 0)) {
                if (res.result.statutoryRegistration.gst) {
                  gst = res.result.statutoryRegistration.gst;
                  if (gst.length > 0) {
                    gstNo = gst[gst.length - 1].gstin;
                    obj = gst[gst.length - 1];
                  } else {
                    gstNo = '';
                    obj = {
                      legalName: res.result.management.current[0].name,
                      pan: res.result.management.current[0].pans[0],
                      email: res.result.management.current[0].email,
                      pin: res.result.management.current[0].pin,
                      contact: '',
                    };
                  }
                } else {
                  gstNo = '';
                  obj = {
                    legalName: res.result.management.current[0].name,
                    pan: res.result.management.current[0].pans[0],
                    email: res.result.management.current[0].email,
                    pin: res.result.management.current[0].pin,
                    contact: '',
                  };
                }
                // event == 'gst' || event == 'tan' || event == 'cin'
                if (idType == 'gst') {
                  gstNo = idNumber;
                } else if (idType == 'cin') {
                  cin = idNumber;
                } else if (idType == 'tan') {
                  tan = idNumber;
                }

                if (res.statusCode == 101) {
                  let body = {
                    leadId: leadId,
                    entityName:
                      res.result.profile.tradeName ||
                      res.result.profile[0].tradeName,
                    entityId: res.result.profile.entityId,
                    proName: obj.legalName,
                    idType: idType,
                    gst: gstNo,
                    cin: cin,
                    tan: tan,
                    pan: obj.pan,
                    proEmail: obj.email,
                    proPin: obj.pin,
                    contact: obj.contact,
                  };
                  this.globalData.globalLodingDismiss();
                  this.globalData.setCustType('N');
                  this.sqliteProvider.InsertEntityKarzaData(body);
                  // this.navCtrl.push(NewapplicationPage, { nonIndividual: body, leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
                } else if (res.statusCode == 102) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Invalid ID number or combination of inputs'
                  );
                } else if (res.statusCode == 103) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'No records found for the given ID or combination of inputs'
                  );
                } else if (res.statusCode == 104) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Max retries exceeded');
                } else if (res.statusCode == 105) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Missing Consent');
                } else if (res.statusCode == 106) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Multiple Records Exist'
                  );
                } else if (res.statusCode == 107) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Not Supported');
                } else if (res.statusCode == 108) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Internal Resource Unavailable'
                  );
                } else if (res.statusCode == 109) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Too many records Found'
                  );
                } else {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', res.statusMessage);
                }
              } else {
                if (res.statusCode == 102) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Invalid ID number or combination of inputs'
                  );
                } else if (res.statusCode == 103) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'No records found for the given ID or combination of inputs'
                  );
                } else if (res.statusCode == 104) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Max retries exceeded');
                } else if (res.statusCode == 105) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Missing Consent');
                } else if (res.statusCode == 106) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Multiple Records Exist'
                  );
                } else if (res.statusCode == 107) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Not Supported');
                } else if (res.statusCode == 108) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Internal Resource Unavailable'
                  );
                } else if (res.statusCode == 109) {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Too many records Found'
                  );
                } else {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', res.statusMessage);
                }
              }
            } else {
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert!', res.error);
            }
          } else {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert('Alert!', result.errorStatus);
          }
        },
        async (err) => {
          const alert = await this.alertCtrl.create({
            header: 'Alert!',
            message:
              'KYC Verification is failed. Would you like to proceed with Offline Application Processing?',
            buttons: [
              {
                text: 'No',
                role: 'cancel',
                handler: () => {
                  this.globalData.globalLodingDismiss();
                  // this.navCtrl.push(JsfhomePage);
                },
              },
              {
                text: 'Yes',
                handler: () => {
                  this.globalData.globalLodingDismiss();
                  this.globalData.setCustType('N');
                  // this.navCtrl.push(NewapplicationPage, { leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
                },
              },
            ],
          });
          alert.present();

          // this.globalData.globalLodingDismiss();
          // this.alertService.showAlert("Alert!", error.statusText);
        }
      );
    }
  }
  janaId;
  aadharVault(idType, idNumber, aepsStatus, leadId) {
    // this.navCtrl.push(FingerprintPage, { idType: idType, idNumber: idNumber, leadId: leadId, leadStatus: this.leadStatus });
    let body = {
      aadhaar: idNumber,
      aepsStatus: aepsStatus[0],
    };
    this.master.restApiCallAngular('AadharInsertVoulting', body).then(
      (result) => {
        if (result != undefined && result != null && result != '') {
          if ((<any>result).status === '00') {
            this.janaId = (<any>result).janaId;
            // this.navCtrl.push(FingerprintPage, { idType: idType, idNumber: idNumber, leadId: leadId, leadStatus: this.leadStatus, janaId: (<any>result).janaId, existAather: this.exisAadharCheck });
            this.initAadhar(idType, idNumber, leadId, aepsStatus[0]);
            // let leadId = Math.floor(Math.random() * 900000000000) + 100000000000;
            // this.globalData.setCustType('N');
            // this.navCtrl.push(NewapplicationPage, { newApplication: "N", leadStatus: this.leadStatus, aadhar: "aadhaar", leadId: leadId, idNumber: idNumber, userType: this.globalData.getborrowerType() });
          } else {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert('Alert!', (<any>result).error);
          }
        }
      },
      (err) => {
        this.globalData.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'Something went wrong!!!');
      }
    );
  }

  async initAadhar(idType, idNumber, leadId, aepsStatus, body?) {
    // let modal = this.modalCtrl.create('KarzaDetailsPage', { data: JSON.stringify(body), idType: idType, idNumber: idNumber, leadId: leadId, leadStatus: this.leadStatus,userType: this.globalData.getborrowerType()  });
    // modal.present();
    // let modal = this.modalCtrl.create(KarzaDetailsPage, { data: JSON.stringify(body), idType: idType, idNumber: idNumber, leadId: leadId, leadStatus: 'online', userType: this.globalData.getborrowerType() });
    // let modal = this.modalCtrl.create(FingerprintPage, { idType: idType, idNumber: idNumber, leadId: leadId, leadStatus: 'online', janaId: this.janaId, second: true, ekyc: 'OTP' })

    const modal = await this.modalCtrl.create({
      component: FingerprintPage,
      componentProps: {
        idType: idType,
        idNumber: idNumber,
        aepsStatus: aepsStatus,
        leadId: leadId,
        leadStatus: 'online',
        second: true,
        janaId: this.janaId,
        existAather: false,
      },
    });

    modal.onDidDismiss().then((data) => {
      console.log(data, 'data');
      this.globalData.globalLodingDismiss();
      if (data) {
        if (idType == 'aadhar') {
          this.globalData.setCustType('N');
          this.ekycData = data.data.ekycData;
          this.ids.push(data.data.body);
          this.globalData.globalLodingDismiss();
          // this.validated = true;
          // this.globalFunc.secKycAdd({ id: 'aadhar', val: data });
          // this.navCtrl.push(NewapplicationPage, { licence: data, leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
        } else if (idType == 'passport') {
          this.globalData.setCustType('N');
          this.globalData.globalLodingDismiss();
          // this.validated = true;
          // this.navCtrl.push(NewapplicationPage, { passport: data, leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
        }
      }
    });
    return await modal.present();
  }

  newshow = false;
  addSecond() {
    this.newshow = true;
  }
  idProofTypes = [];
  custTypeChng(value) {
    if (value == '1') {
      this.idProofForm.controls.idType.setValue('');
      this.idProofForm.controls.idType.setValidators(Validators.required);
      this.idProofForm.controls.entityNum.setValue('');
      this.idProofForm.controls.entityNum.clearValidators();
      this.idProofForm.controls.entityNum.updateValueAndValidity();
      this.idProofTypes = [
        { code: 'aadhar', name: 'Aadhar' },
        { code: 'pan', name: 'Pan' },
        { code: 'voterid', name: 'Voter ID' },
        { code: 'passport', name: 'Passport' },
        { code: 'drivingLicence', name: 'Driving License' },
      ];

      this.idProofTypes.splice(
        this.idProofTypes.findIndex((val) => val.code == this.ids[0].type),
        1
      );
    } else {
      this.idProofTypes = [
        { code: 'gst', name: 'GSTIN' },
        { code: 'tan', name: 'TAN' },
        { code: 'cin', name: 'CIN' },
        { code: 'bpan', name: 'PAN' },
      ];
      this.idProofForm.controls.idType.setValue('');
      this.idProofForm.controls.idType.setValidators(Validators.required);
      this.idProofForm.controls.idType.updateValueAndValidity();
      this.idProofForm.controls.aadhar.setValue('');
      this.idProofForm.controls.aadhar.clearValidators();
      this.idProofForm.controls.aadhar.updateValueAndValidity();
      this.idProofForm.controls.pan.setValue('');
      this.idProofForm.controls.pan.clearValidators();
      this.idProofForm.controls.pan.updateValueAndValidity();
      this.idProofForm.controls.voter.setValue('');
      this.idProofForm.controls.voter.clearValidators();
      this.idProofForm.controls.voter.updateValueAndValidity();
      this.idProofForm.controls.license.setValue('');
      this.idProofForm.controls.license.clearValidators();
      this.idProofForm.controls.license.updateValueAndValidity();
      this.idProofForm.controls.passport.setValue('');
      this.idProofForm.controls.passport.clearValidators();
      this.idProofForm.controls.passport.updateValueAndValidity();
      this.idProofForm.controls.entityNum.setValue('');
      this.idProofForm.controls.entityNum.setValidators(
        Validators.compose([
          Validators.maxLength(20),
          Validators.minLength(10),
          Validators.pattern('[A-Za-z0-9]*'),
          Validators.required,
        ])
      );
    }
  }

  restrictMaxlength(event, len) {
    if (event.detail.value.length > parseInt(len)) {
      let val = event.detail.value.toString().slice(0, -1);
      event.detail.value = val;
    }
  }

  // toUpperCase(frmGrpName, ctrlName) {
  //   this[frmGrpName].controls[ctrlName].setValue(this[frmGrpName].controls[ctrlName].value.toUpperCase());
  // }

  proofTypeChng(event) {
    const selectedIdType = event.detail.value;
    if (selectedIdType == 'aadhar') {
      this.idProofForm.controls.aadhar.setValidators(
        Validators.compose([
          Validators.maxLength(12),
          Validators.minLength(12),
          Validators.pattern('[0-9]{12}'),
          Validators.required,
        ])
      );
      this.idProofForm.controls.aadhar.setValue('');
      this.idProofForm.controls.aepsStatus.setValidators(Validators.required);
      this.idProofForm.controls.aepsStatus.setValue('');
      this.idProofForm.controls.pan.clearValidators();
      this.idProofForm.controls.pan.setValue('');
      this.idProofForm.controls.firstName.clearValidators();
      this.idProofForm.controls.firstName.setValue('');
      this.idProofForm.controls.middleName.clearValidators();
      this.idProofForm.controls.middleName.setValue('');
      this.idProofForm.controls.lastName.clearValidators();
      this.idProofForm.controls.lastName.setValue('');
      this.idProofForm.controls.namePan.clearValidators();
      this.idProofForm.controls.namePan.setValue('');
      this.idProofForm.controls.dobPan.clearValidators();
      this.idProofForm.controls.dobPan.setValue('');
      this.idProofForm.controls.voter.clearValidators();
      this.idProofForm.controls.voter.setValue('');
      this.idProofForm.controls.passport.clearValidators();
      this.idProofForm.controls.passport.setValue('');
      this.idProofForm.controls.license.clearValidators();
      this.idProofForm.controls.license.setValue('');
      this.idProofForm.controls.entityNum.clearValidators();
      this.idProofForm.controls.entityNum.setValue('');
      this.idProofForm.controls.bpan.clearValidators();
      this.idProofForm.controls.bpan.setValue('');
    } else if (selectedIdType == 'pan') {
      this.idProofForm.controls.pan.setValidators(
        Validators.compose([
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
          Validators.required,
        ])
      );
      this.idProofForm.controls.pan.setValue('');
      this.idProofForm.controls.firstName.setValidators(
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z. ]*'),
          Validators.required,
        ])
      );
      this.idProofForm.controls.firstName.setValue('');
      this.idProofForm.controls.middleName.setValidators(
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z. ]*'),
        ])
      );
      this.idProofForm.controls.middleName.setValue('');
      this.idProofForm.controls.lastName.setValidators(
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z. ]*'),
          Validators.required,
        ])
      );
      this.idProofForm.controls.lastName.setValue('');
      this.idProofForm.controls.namePan.setValidators(
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z. ]*'),
          Validators.required,
        ])
      );
      this.idProofForm.controls.namePan.setValue('');
      this.idProofForm.controls.dobPan.setValidators(
        Validators.compose([Validators.required])
      );
      this.idProofForm.controls.dobPan.setValue('');
      this.idProofForm.controls.aadhar.clearValidators();
      this.idProofForm.controls.aadhar.setValue('');
      this.idProofForm.controls.aepsStatus.clearValidators();
      this.idProofForm.controls.aepsStatus.setValue('');
      this.idProofForm.controls.voter.clearValidators();
      this.idProofForm.controls.voter.setValue('');
      this.idProofForm.controls.passport.clearValidators();
      this.idProofForm.controls.passport.setValue('');
      this.idProofForm.controls.license.clearValidators();
      this.idProofForm.controls.license.setValue('');
      this.idProofForm.controls.entityNum.clearValidators();
      this.idProofForm.controls.entityNum.setValue('');
      this.idProofForm.controls.bpan.clearValidators();
      this.idProofForm.controls.bpan.setValue('');
    } else if (selectedIdType == 'voterid') {
      this.idProofForm.controls.voter.setValidators(
        Validators.compose([
          Validators.maxLength(16),
          Validators.minLength(10),
          Validators.required,
        ])
      );
      this.idProofForm.controls.voter.setValue('');
      this.idProofForm.controls.aadhar.clearValidators();
      this.idProofForm.controls.aadhar.setValue('');
      this.idProofForm.controls.aepsStatus.clearValidators();
      this.idProofForm.controls.aepsStatus.setValue('');
      this.idProofForm.controls.pan.clearValidators();
      this.idProofForm.controls.pan.setValue('');
      this.idProofForm.controls.passport.clearValidators();
      this.idProofForm.controls.passport.setValue('');
      this.idProofForm.controls.license.clearValidators();
      this.idProofForm.controls.license.setValue('');
      this.idProofForm.controls.entityNum.clearValidators();
      this.idProofForm.controls.entityNum.setValue('');
      this.idProofForm.controls.bpan.clearValidators();
      this.idProofForm.controls.bpan.setValue('');
    } else if (selectedIdType == 'passport') {
      this.idProofForm.controls.passport.setValidators(
        Validators.compose([
          Validators.maxLength(8),
          Validators.minLength(8),
          Validators.pattern(/^[a-zA-Z]{1}[0-9]{7}$/),
          Validators.required,
        ])
      );
      this.idProofForm.controls.passport.setValue('');
      this.idProofForm.controls.aadhar.clearValidators();
      this.idProofForm.controls.aadhar.setValue('');
      this.idProofForm.controls.aepsStatus.clearValidators();
      this.idProofForm.controls.aepsStatus.setValue('');
      this.idProofForm.controls.pan.clearValidators();
      this.idProofForm.controls.pan.setValue('');
      this.idProofForm.controls.firstName.clearValidators();
      this.idProofForm.controls.firstName.setValue('');
      this.idProofForm.controls.middleName.clearValidators();
      this.idProofForm.controls.middleName.setValue('');
      this.idProofForm.controls.lastName.clearValidators();
      this.idProofForm.controls.lastName.setValue('');
      this.idProofForm.controls.namePan.clearValidators();
      this.idProofForm.controls.namePan.setValue('');
      this.idProofForm.controls.dobPan.clearValidators();
      this.idProofForm.controls.dobPan.setValue('');
      this.idProofForm.controls.voter.clearValidators();
      this.idProofForm.controls.voter.setValue('');
      this.idProofForm.controls.license.clearValidators();
      this.idProofForm.controls.license.setValue('');
      this.idProofForm.controls.entityNum.clearValidators();
      this.idProofForm.controls.entityNum.setValue('');
      this.idProofForm.controls.bpan.clearValidators();
      this.idProofForm.controls.bpan.setValue('');
    } else if (selectedIdType == 'drivingLicence') {
      this.idProofForm.controls.license.setValidators(
        Validators.compose([
          Validators.maxLength(20),
          Validators.minLength(10),
          Validators.pattern('[a-zA-Z0-9/]*'),
          Validators.required,
        ])
      );
      this.idProofForm.controls.license.setValue('');
      this.idProofForm.controls.aadhar.clearValidators();
      this.idProofForm.controls.aadhar.setValue('');
      this.idProofForm.controls.aepsStatus.clearValidators();
      this.idProofForm.controls.aepsStatus.setValue('');
      this.idProofForm.controls.pan.clearValidators();
      this.idProofForm.controls.pan.setValue('');
      this.idProofForm.controls.firstName.clearValidators();
      this.idProofForm.controls.firstName.setValue('');
      this.idProofForm.controls.middleName.clearValidators();
      this.idProofForm.controls.middleName.setValue('');
      this.idProofForm.controls.lastName.clearValidators();
      this.idProofForm.controls.lastName.setValue('');
      this.idProofForm.controls.namePan.clearValidators();
      this.idProofForm.controls.namePan.setValue('');
      this.idProofForm.controls.dobPan.clearValidators();
      this.idProofForm.controls.dobPan.setValue('');
      this.idProofForm.controls.voter.clearValidators();
      this.idProofForm.controls.voter.setValue('');
      this.idProofForm.controls.passport.clearValidators();
      this.idProofForm.controls.passport.setValue('');
      this.idProofForm.controls.entityNum.clearValidators();
      this.idProofForm.controls.entityNum.setValue('');
      this.idProofForm.controls.bpan.clearValidators();
      this.idProofForm.controls.bpan.setValue('');
    } else if (
      selectedIdType == 'gst' ||
      selectedIdType == 'tan' ||
      selectedIdType == 'cin'
    ) {
      this.idProofForm.controls.entityNum.setValidators(
        Validators.compose([
          Validators.maxLength(30),
          Validators.minLength(10),
          Validators.pattern('[a-zA-Z0-9]*'),
          Validators.required,
        ])
      );
      this.idProofForm.controls.entityNum.setValue('');
      this.idProofForm.controls.aadhar.clearValidators();
      this.idProofForm.controls.aadhar.setValue('');
      this.idProofForm.controls.aepsStatus.clearValidators();
      this.idProofForm.controls.aepsStatus.setValue('');
      this.idProofForm.controls.pan.clearValidators();
      this.idProofForm.controls.pan.setValue('');
      this.idProofForm.controls.firstName.clearValidators();
      this.idProofForm.controls.firstName.setValue('');
      this.idProofForm.controls.middleName.clearValidators();
      this.idProofForm.controls.middleName.setValue('');
      this.idProofForm.controls.lastName.clearValidators();
      this.idProofForm.controls.lastName.setValue('');
      this.idProofForm.controls.namePan.clearValidators();
      this.idProofForm.controls.namePan.setValue('');
      this.idProofForm.controls.dobPan.clearValidators();
      this.idProofForm.controls.dobPan.setValue('');
      this.idProofForm.controls.voter.clearValidators();
      this.idProofForm.controls.voter.setValue('');
      this.idProofForm.controls.passport.clearValidators();
      this.idProofForm.controls.passport.setValue('');
      this.idProofForm.controls.license.clearValidators();
      this.idProofForm.controls.license.setValue('');
      this.idProofForm.controls.bpan.clearValidators();
      this.idProofForm.controls.bpan.setValue('');
    } else if (selectedIdType == 'bpan') {
      this.idProofForm.controls.bpan.setValidators(
        Validators.compose([
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
          Validators.required,
        ])
      );
      this.idProofForm.controls.bpan.setValue('');
      this.idProofForm.controls.aadhar.clearValidators();
      this.idProofForm.controls.aadhar.setValue('');
      this.idProofForm.controls.aepsStatus.clearValidators();
      this.idProofForm.controls.aepsStatus.setValue('');
      this.idProofForm.controls.voter.clearValidators();
      this.idProofForm.controls.voter.setValue('');
      this.idProofForm.controls.passport.clearValidators();
      this.idProofForm.controls.passport.setValue('');
      this.idProofForm.controls.license.clearValidators();
      this.idProofForm.controls.license.setValue('');
      this.idProofForm.controls.entityNum.clearValidators();
      this.idProofForm.controls.entityNum.setValue('');
      this.idProofForm.controls.pan.clearValidators();
      this.idProofForm.controls.pan.setValue('');
      this.idProofForm.controls.firstName.clearValidators();
      this.idProofForm.controls.firstName.setValue('');
      this.idProofForm.controls.middleName.clearValidators();
      this.idProofForm.controls.middleName.setValue('');
      this.idProofForm.controls.lastName.clearValidators();
      this.idProofForm.controls.lastName.setValue('');
      this.idProofForm.controls.namePan.clearValidators();
      this.idProofForm.controls.namePan.setValue('');
      this.idProofForm.controls.dobPan.clearValidators();
      this.idProofForm.controls.dobPan.setValue('');
    }
  }

  voterKarza(idType, idNumber, leadId) {
    this.globalData.globalLodingPresent('Fetching data...');
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Kindly check your internet connection!!!'
      );
    } else {
      let body = {
        epic_no: idNumber,
        UniqueID: leadId,
      };
      this.master
        .restApiCallAngular('VoterIdAuthentication', body, 'Y')
        .then(
          (result) => {
            if ((<any>result).success) {
              let resData = JSON.parse((<any>result).responseData.VoterId);
              console.log(resData);
              if (resData.status_code == 101) {
                let res = resData.result;
                let name = res.name
                  .replace(/[&\/\\#,+()$~%.'"-:*?<>{}]/g, '')
                  .trim();
                let father = res.rln_name
                  .replace(/[&\/\\#,+()$~%.'"-:*?<>{}]/g, '')
                  .trim();
                // this.validated = true
                let body = {
                  name: name,
                  fathername: father,
                  dob: res.dob,
                  idNumber: idNumber,
                  type: 'voterid',
                };
                this.globalData.setCustType('N');
                this.globalData.globalLodingDismiss();
                this.sqliteProvider.InsertKarzaData(
                  leadId,
                  res.name,
                  father,
                  res.dob,
                  idNumber,
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  'voterid',
                  '',
                  'Y'
                );
                this.ids.push(body);
                // this.globalData.globalLodingDismissAll();
                // this.navCtrl.push(NewapplicationPage, { voter: body, leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
                // this.initKarzaAPi(idType, idNumber, leadId, body);
              } else if (resData.status_code == 102) {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Invalid ID number or combination of inputs'
                );
              } else if (resData.status_code == 103) {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'No records found for the given ID or combination of inputs'
                );
              } else if (resData.status_code == 104) {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Max retries exceeded');
              } else if (resData.status_code == 105) {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Missing Consent');
              } else if (resData.status_code == 106) {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Multiple Records Exist');
              } else if (resData.status_code == 107) {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Not Supported');
              } else if (resData.status_code == 108) {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Internal Resource Unavailable'
                );
              } else if (resData.status_code == 109) {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Too many records Found');
              } else if (resData.status_code == 222) {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  resData.error ? resData.error : 'Response is Empty'
                );
              } else {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', resData.error);
              }
            } else {
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Something went wrong!!!');
            }
          },
          async (error) => {
            const alert = await this.alertCtrl.create({
              header: 'Alert!',
              message:
                'KYC Verification is failed. Would you like to proceed with Offline Application Processing?',
              buttons: [
                {
                  text: 'No',
                  role: 'cancel',
                  handler: () => {
                    this.globalData.globalLodingDismiss();
                    // this.navCtrl.push(JsfhomePage);
                  },
                },
                {
                  text: 'Yes',
                  handler: () => {
                    this.globalData.globalLodingDismiss();
                    this.globalData.setCustType('N');
                    // this.navCtrl.push(NewapplicationPage, { leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
                  },
                },
              ],
            });
            alert.present();
          }
        )
        .catch((err) => {
          console.log(err);
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'No Response From Server!');
        });
    }
  }

  panKarza(
    idType,
    idNumber,
    leadId,
    firstName,
    middleName,
    lastName,
    panName,
    panDob
  ) {
    let newPanDOB =
      panDob.substring(8, 10) +
      '/' +
      panDob.substring(5, 7) +
      '/' +
      panDob.substring(0, 4);
    this.globalData.globalLodingPresent('Fetching data...');
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Kindly check your internet connection!!!'
      );
    } else {
      let body = {
        pan: idNumber,
        uniqueID: leadId,
        name: panName,
        dob: newPanDOB,
      };
      this.master
        .restApiCallAngular('panvalidation', body, 'Y')
        .then(
          (result) => {
            if ((<any>result).success) {
              let resData = JSON.parse(
                (<any>result).responseData.panValidation
              );
              resData = resData.NSDL.Response.details;
              console.log(resData);
              let res = resData[0];
              if (resData[0].StatusCode == '1' && resData[0].Panstatus == 'E') {
                if (res.nameValidation != 'Y') {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Please mention correct name as per PAN!!!'
                  );
                } else if (res.DOBValidation != 'Y') {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Please mention correct DOB as per PAN!!!'
                  );
                } else {
                  // this.validated = true
                  // let res = resData[0];
                  // let name = res.nameOnCard.replace(/[&\/\\#,+()$~%.'"-:*?<>{}]/g, '').trim();
                  // let firstname = res.firstName.replace(/[&\/\\#,+()$~%.'"-:*?<>{}]/g, '').trim();
                  // let lastname = res.lastName.replace(/[&\/\\#,+()$~%.'"-:*?<>{}]/g, '').trim();
                  // let middlename = res.middleName.replace(/[&\/\\#,+()$~%.'"-:*?<>{}]/g, '').trim();
                  let body = {
                    name: panName,
                    firstname: firstName,
                    lastname: lastName,
                    middlename: middleName,
                    idNumber: idNumber,
                    type: 'pan',
                    panDOB: newPanDOB,
                    panValidation: 'Y',
                    nameValidation: res.nameValidation,
                    DOBValidation: res.DOBValidation,
                    seedingStatus: res.seedingStatus,
                  };
                  this.globalData.setCustType('N');
                  this.globalData.globalLodingDismiss();
                  this.sqliteProvider.InsertKarzaData(
                    leadId,
                    name,
                    '',
                    res.dob,
                    idNumber,
                    '',
                    '',
                    '',
                    '',
                    '',
                    '',
                    'pan',
                    '',
                    'Y'
                  );
                  this.ids.push(body);
                  this.globalData.globalLodingDismiss();
                  // this.initKarzaAPi(idType, idNumber, leadId, body);
                  // this.navCtrl.push(NewapplicationPage, { pan: body, leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
                }
              } else {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Invalid PAN number');
              }
            } else {
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert(
                'Alert!',
                (<any>result).responseData.errorDesc
              );
            }
          },
          async (error) => {
            let alert = await this.alertCtrl.create({
              header: 'Alert!',
              message:
                'KYC Verification is failed. Would you like to proceed with Offline Application Processing?',
              buttons: [
                {
                  text: 'No',
                  role: 'cancel',
                  handler: () => {
                    this.globalData.globalLodingDismiss();
                    // this.navCtrl.push(JsfhomePage);
                  },
                },
                {
                  text: 'Yes',
                  handler: () => {
                    this.globalData.globalLodingDismiss();
                    this.globalData.setCustType('N');
                    // this.navCtrl.push(NewapplicationPage, { leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
                  },
                },
              ],
            });
            alert.present();
          }
        )
        .catch((err) => {
          console.log(err);
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'No Response From Server!');
        });
    }
  }
  ekycData;
  selectedId;
  isSelected = false;

  onSelect(id, index) {
    console.log(id, index);
    if (this.ids.length > 1) {
      this.selectedId = index;
      this.isSelected = true;
    }
  }

  proceed() {
    if (this.ids.length > 1) {
      let isEkyc = this.ids.find((val) => val.type == 'aadhar');
      if (this.selectedId == 0 || this.selectedId == 1) {
        if (
          this.ids[this.selectedId].type == 'pan' ||
          this.ids[this.selectedId].type == 'voterid'
        ) {
          this.initKarzaAPi(
            this.ids[this.selectedId].type,
            this.ids[this.selectedId].idNumber,
            this.leadId,
            this.ids[this.selectedId]
          );
        } else if (this.ids[this.selectedId].type == 'aadhar') {
          this.initKarzaAPi(
            this.ids[this.selectedId].type,
            this.ids[this.selectedId].idNumber,
            this.leadId,
            this.ids[this.selectedId],
            this.ekycData
          );
        } else if (
          this.ids[this.selectedId].type == 'drivingLicence' ||
          this.ids[this.selectedId].type == 'licence'
        ) {
          console.log(this.ids[this.selectedId]);
          this.navCtrl.navigate(['/NewapplicationPage'], {
            queryParams: {
              licence: JSON.stringify(this.ids[this.selectedId]),
              leadStatus: 'online',
              leadId: this.leadId,
              userType: this.globalData.getborrowerType(),
            },
            skipLocationChange: true,
            replaceUrl: true,
          });
        } else if (this.ids[this.selectedId].type == 'passport') {
          this.navCtrl.navigate(['/NewapplicationPage'], {
            queryParams: {
              passport: this.ids[this.selectedId],
              leadStatus: 'online',
              leadId: this.leadId,
              userType: this.globalData.getborrowerType(),
            },
            skipLocationChange: true,
            replaceUrl: true,
          });
        }
      } else {
        this.alertService.showAlert('Alert!', 'Choose a KYC to proceed.');
      }
    }
  }

  checkCustomerTypeData() {
    let customerType = this.globalData.getCustomerType();
    if (customerType) {
      this.custTypeChng(customerType);
    } else {
      this.globalData.setCustomerType(this.customerTypeSet);
      localStorage.setItem('CustType', this.customerTypeSet);
      this.custTypeChng(this.globalData.getCustomerType());
    }
  }

  viewAadhar() {
    debugger;
    if (this.textType == 'password') {
      this.textType = 'tel';
    } else {
      this.textType = 'password';
    }
  }

  ageRestrict() {
    try {
      let dd = this.todayDate.getDate();
      let mm = this.todayDate.getMonth() + 1; //January is 0!
      let yyyy = this.todayDate.getFullYear() - 18;
      let years = this.todayDate.getFullYear() - 65;
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      let mindate = yyyy + '-' + mm + '-' + dd;
      let maxdate = years + '-' + mm + '-' + dd;
      this.minDobAge = mindate;
      this.maxDobAge = maxdate;
    } catch (error) {
      console.log(error);
    }
  }
}
