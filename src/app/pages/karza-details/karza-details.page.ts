import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';

@Component({
  selector: 'app-karza-details',
  templateUrl: './karza-details.page.html',
  styleUrls: ['./karza-details.page.scss'],
})
export class KarzaDetailsPage implements OnInit {
  dldata: boolean = false;
  dlFirstArray: any = [];
  dlDataFetch: any;
  idType: any;
  idNumber: any;
  leadId: any;
  maxdate: any;
  passportForm: FormGroup;
  dlForm: FormGroup;
  dlDataForm: FormGroup;
  leadStatus: any;
  genderList: any = [
    { code: 'M', name: 'Male' },
    { code: 'F', name: 'Female' },
    { code: 'T', name: 'Third Gender' },
  ];
  typeList: any = [
    { code: 'P', name: 'Personal' },
    { code: 'S', name: 'Service' },
    { code: 'D', name: 'Diplomatic' },
  ];
  selectOptions = {
    cssClass: 'remove-ok',
  };
  today: any = new Date();
  mindate: any;
  idExpiry: string;

  panData: any;
  secondKyc: String = 'N';
  submitDisable = false;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public globFunc: GlobalService,
    public formBuilder: FormBuilder,
    public master: RestService,
    public modalCntrl: ModalController,
    public globalData: DataPassingProviderService,
    public network: Network,
    public sqlite: SqliteService,
    public alertCtrl: AlertController,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService
  ) {
    this.idType = this.navParams.get('idType');
    console.log(this.idType);
    this.idNumber = this.navParams.get('idNumber');
    this.leadId = this.navParams.get('leadId');
    this.leadStatus = this.navParams.get('leadStatus');

    this.secondKyc = this.navParams.get('secondKyc');

    if (
      this.idType == 'pan' ||
      this.idType == 'voterid' ||
      this.idType == 'aadhar'
    ) {
      this.panData = JSON.parse(this.navParams.get('data'));
      console.log(
        "JSON.parse(this.navParams.get('pan'))",
        JSON.parse(this.navParams.get('data'))
      );

      if (this.panData) {
        if (this.idType == 'pan') {
          if (this.panData.firstname) {
            this.dlFirstArray.push(this.panData.firstname);
          }
          if (this.panData.lastname) {
            this.dlFirstArray.push(this.panData.lastname);
          }
        }
        //  else if (this.idType == "aadhar") {
        //   let nameArray = this.panData.name.split(" ");
        //   this.dlFirstArray.push(...nameArray)
        // }
        else {
          let nameArray = this.panData.name.split(' ');
          this.dlFirstArray.push(...nameArray);
          //this.dlFirstArray.push(this.panData.name)
        }
        console.log('this.dlFirstArray', this.dlFirstArray);
      }
      this.dlFirstArray = this.dlFirstArray.map((val) => val.toUpperCase());
    }

    this.callmaxdate();

    this.passportForm = this.formBuilder.group({
      name: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      lastName: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      dob: ['', Validators.compose([Validators.required])],
      doe: ['', Validators.compose([Validators.required])],
      gender: ['', Validators.compose([Validators.required])],
      pType: ['', Validators.compose([Validators.required])],
      countryCode: [
        '',
        Validators.compose([
          Validators.maxLength(3),
          Validators.pattern(/^[a-zA-Z]{3}$/),
          Validators.required,
        ]),
      ],
    });

    this.dlForm = this.formBuilder.group({
      dob: ['', Validators.compose([Validators.required])],
      doeLic: ['', Validators.compose([Validators.required])],
    });

    this.dlDataForm = this.formBuilder.group({
      firstname: [''],
      middlename: [''],
      lastname: [''],
    });

    this.setFirstNameValidation();
  }

  ngOnInit() {
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
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad KarzaDetailsPage');
  }

  callmaxdate() {
    let dd = this.today.getDate();
    let mm = this.today.getMonth() + 1; //January is 0!
    let yyyy = this.today.getFullYear();
    let years = this.today.getFullYear() + 20;
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    this.mindate = yyyy + '-' + mm + '-' + dd;
    this.maxdate = years + '-' + mm + '-' + dd;
  }

  passportKarza(value) {
    this.loadingService.globalLodingPresent('Fetching data...');
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Kindly check your internet connection!!!'
      );
    } else {
      let dob =
        value.dob.substring(8, 10) +
        '/' +
        value.dob.substring(5, 7) +
        '/' +
        value.dob.substring(0, 4);
      let doe =
        value.doe.substring(8, 10) +
        '/' +
        value.doe.substring(5, 7) +
        '/' +
        value.doe.substring(0, 4);
      this.idExpiry = doe;
      let body = {
        name: value.name,
        last_name: value.lastName,
        dob: dob,
        doe: doe,
        gender: value.gender[0],
        passport_no: this.idNumber,
        type: value.pType[0],
        country: value.countryCode,
        UniqueID: this.leadId,
      };
      this.master
        .restApiCallAngular('PassportMRZ', body, 'Y')
        .then(
          (result) => {
            if ((<any>result).success) {
              let resData = JSON.parse((<any>result).responseData.passport);
              console.log(resData);
              if (resData.status_code == 101) {
                let res = resData.result;
                let str1 = res.string1;
                let str2 = res.string2;
                let father = str1.substring(
                  str1.indexOf('IND') + 3,
                  str1.indexOf('<<')
                );
                let name = str1.substring(
                  str1.indexOf('<<') + 2,
                  str1.indexOf('<<<<<<')
                );
                name = name.replace('<', ' ');
                let idNumber = str2.substring(0, str2.indexOf('<'));
                let body = {
                  fathername: father,
                  name: name,
                  idNumber: idNumber,
                  dob: value.dob,
                  gender: value.gender[0],
                  type: 'passport',
                };
                this.loadingService.globalLodingDismiss();
                this.globalData.setCustType('N');
                this.sqlite.InsertKarzaData(
                  this.leadId,
                  name,
                  father,
                  value.dob,
                  idNumber,
                  '',
                  '',
                  '',
                  '',
                  '',
                  value.gender[0],
                  'passport',
                  this.idExpiry,
                  this.secondKyc
                );
                this.modalCntrl.dismiss(body);
                // this.navCtrl.push(NewapplicationPage, { passport: body, leadStatus: this.leadStatus, leadId: this.leadId, userType: this.globalData.getborrowerType() });
              } else if (resData.status_code == 102) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Invalid ID number or combination of inputs'
                );
              } else if (resData.status_code == 103) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'No records found for the given ID or combination of inputs'
                );
              } else if (resData.status_code == 104) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Max retries exceeded');
              } else if (resData.status_code == 105) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Missing Consent');
              } else if (resData.status_code == 106) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Multiple Records Exist');
              } else if (resData.status_code == 107) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Not Supported');
              } else if (resData.status_code == 108) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Internal Resource Unavailable'
                );
              } else if (resData.status_code == 109) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Too many records Found');
              } else {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', resData.error);
              }
            } else {
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Something went wrong!!!');
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
                    this.loadingService.globalLodingDismiss();
                    this.navCtrl.navigate(['/JsfhomePage'], {
                      skipLocationChange: true,
                      replaceUrl: true,
                    });
                  },
                },
                {
                  text: 'Yes',
                  handler: () => {
                    this.loadingService.globalLodingDismiss();
                    this.globalData.setCustType('N');
                    this.navCtrl.navigate(['/NewapplicationPage'], {
                      queryParams: {
                        leadStatus: this.leadStatus,
                        leadId: this.leadId,
                        userType: this.globalData.getborrowerType(),
                      },
                      skipLocationChange: true,
                      replaceUrl: true,
                    });
                  },
                },
              ],
            });
            alert.present();
          }
        )
        .catch((err) => {
          console.log(err);
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'No Response From Server!');
        });
    }
  }

  dlKarza(value) {
    this.loadingService.globalLodingPresent('Fetching data...');
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Kindly check your internet connection!!!'
      );
    } else {
      let dob =
        value.dob.substring(8, 10) +
        '-' +
        value.dob.substring(5, 7) +
        '-' +
        value.dob.substring(0, 4);
      let dlExp =
        value.doeLic.substring(8, 10) +
        '/' +
        value.doeLic.substring(5, 7) +
        '/' +
        value.doeLic.substring(0, 4);
      this.idExpiry = dlExp;
      let body = {
        dlNo: this.idNumber,
        dob: dob,
        UniqueID: this.leadId,
      };
      this.master
        .restApiCallAngular('DriverLicenseAuthentication', body, 'Y')
        .then(
          (result) => {
            if ((<any>result).success) {
              let resData = JSON.parse(
                (<any>result).responseData.driverLicense
              );
              if (resData.statusCode == 101) {
                resData = JSON.stringify(resData);
                resData = resData.replace('father/husband', 'fathername');
                resData = JSON.parse(resData);
                let res = resData.result;
                let permAdrs: string = '';
                let pin: string = '';
                let state: string = '';
                let address1: string = '';
                let address2: string = '';
                let adrsType: string = '';
                if (res.address.length > 0) {
                  if (
                    res.address[0].pin != '' &&
                    res.address[0].pin != undefined &&
                    res.address[0].pin != null
                  ) {
                    pin = res.address[0].pin.toString();
                  } else {
                    pin = '';
                  }
                }
                if (res.address.length > 0) {
                  permAdrs = res.address[0].completeAddress;
                  permAdrs = permAdrs.slice(0, permAdrs.length - 6);
                  address1 = permAdrs
                    .substring(0, permAdrs.indexOf(','))
                    .trim();
                  address2 = permAdrs
                    .substring(permAdrs.indexOf(',') + 1)
                    .trim();
                  pin = pin;
                  state = res.address[0].state;
                  adrsType = res.address[0].type;
                }
                this.dlDataFetch = {
                  permAddressLine1: address1,
                  permAddressLine2: address2,
                  permPincode: pin,
                  name: res.name,
                  fathername: res.fathername,
                  idNumber: this.idNumber,
                  dob: res.dob,
                  permState: state,
                  type: 'licence',
                };
                this.loadingService.globalLodingDismiss();
                this.dlDataHandling(this.dlDataFetch);
              } else if (resData.statusCode == 102) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Invalid ID number or combination of inputs'
                );
              } else if (resData.statusCode == 103) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'No records found for the given ID or combination of inputs'
                );
              } else if (resData.statusCode == 104) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Max retries exceeded');
              } else if (resData.statusCode == 105) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Missing Consent');
              } else if (resData.statusCode == 106) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Multiple Records Exist');
              } else if (resData.statusCode == 107) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Not Supported');
              } else if (resData.statusCode == 108) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Internal Resource Unavailable'
                );
              } else if (resData.statusCode == 109) {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Too many records Found');
              } else {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert!', resData.error);
              }
            } else {
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Something went wrong!!!');
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
                    this.loadingService.globalLodingDismiss();
                    this.navCtrl.navigate(['/JsfhomePage'], {
                      skipLocationChange: true,
                      replaceUrl: true,
                    });
                  },
                },
                {
                  text: 'Yes',
                  handler: () => {
                    this.loadingService.globalLodingDismiss();
                    this.globalData.setCustType('N');
                    this.navCtrl.navigate(['/NewapplicationPage'], {
                      queryParams: {
                        leadStatus: this.leadStatus,
                        leadId: this.leadId,
                        userType: this.globalData.getborrowerType(),
                      },
                      skipLocationChange: true,
                      replaceUrl: true,
                    });
                  },
                },
              ],
            });
            alert.present();
          }
        )
        .catch((err) => {
          console.log(err);
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'No Response From Server!');
        });
    }
  }

  setFilteredItems(country) {
    this.passportForm.controls.countryCode.setValue(country.toUpperCase());
  }

  dlDataHandling(data) {
    data.name = data.name.replace('  ', ' ');
    console.log(data.name.split(' '));
    this.dlFirstArray = data.name.split(' ');
    this.dlFirstArray = this.dlFirstArray.map((val) => val.toUpperCase());
    this.setFirstNameValidation();
    this.dldata = true;
  }

  selectFirstName() {
    if (
      this.dlDataForm.controls.firstname.value != '' &&
      this.dlDataForm.controls.firstname.value != undefined &&
      this.dlDataForm.controls.firstname.value != null &&
      this.dlDataForm.controls.lastname.value != '' &&
      this.dlDataForm.controls.lastname.value != undefined &&
      this.dlDataForm.controls.lastname.value != null
    ) {
      if (
        this.dlDataForm.controls.firstname.value ==
        this.dlDataForm.controls.lastname.value
      ) {
        setTimeout(() => {
          this.alertService.showAlert(
            'Alert!',
            'First and Last name should not be same!!!'
          );
          this.dlDataForm.controls.lastname.setValue('');
        }, 400);
      } else if (
        this.dlDataForm.controls.firstname.value ==
        this.dlDataForm.controls.middlename.value
      ) {
        setTimeout(() => {
          this.alertService.showAlert(
            'Alert!',
            'First and Middle name should not be same!!!'
          );
          this.dlDataForm.controls.middlename.setValue('');
        }, 400);
      } else if (
        this.dlDataForm.controls.lastname.value ==
        this.dlDataForm.controls.middlename.value
      ) {
        setTimeout(() => {
          this.alertService.showAlert(
            'Alert!',
            'Middle and Last name should not be same!!!'
          );
          this.dlDataForm.controls.middlename.setValue('');
        }, 400);
      }
    }
  }

  dlDataFormPopulate(value) {
    this.loadingService.globalLodingPresent('Please wait....');
    this.loadingService.globalLodingDismiss();
    if (this.idType == 'pan') {
      this.panData.firstname = value.firstname;
      this.panData.lastname = value.lastname || '';
      this.globalData.setCustType('N');
      this.modalCntrl.dismiss(this.panData);
    } else if (this.idType == 'voterid') {
      this.panData.name = value.firstname;
      this.panData.lastname = value.lastname || '';
      this.globalData.setCustType('N');
      this.modalCntrl.dismiss(this.panData);
    } else if (this.idType == 'aadhar') {
      this.panData.name = value.firstname;
      this.panData.lastname = value.lastname || '';
      this.globalData.setCustType('N');
      this.modalCntrl.dismiss(this.panData);
    } else {
      this.dlDataFetch.firstname = value.firstname;
      this.dlDataFetch.lastname = value.lastname;
      this.dlDataFetch.middlename = value.middlename;
      this.globalData.setCustType('N');
      this.sqlite.InsertKarzaData(
        this.leadId,
        this.dlDataFetch.name,
        this.dlDataFetch.fathername,
        this.dlDataFetch.dob,
        this.dlDataFetch.idNumber,
        this.dlDataFetch.permAddressLine1,
        this.dlDataFetch.permAddressLine2,
        this.dlDataFetch.permState,
        this.dlDataFetch.permPincode,
        this.dlDataFetch.type,
        '',
        'licence',
        this.idExpiry,
        this.secondKyc
      );
      this.modalCntrl.dismiss(this.dlDataFetch);
    }
  }

  setFirstNameValidation() {
    if (this.dlFirstArray.length > 1) {
      this.dlDataForm.controls.middlename.clearValidators();
      this.dlDataForm.controls.middlename.updateValueAndValidity();
      this.dlDataForm.controls.lastname.setValidators(Validators.required);
      this.dlDataForm.controls.lastname.updateValueAndValidity();
      this.dlDataForm.controls.firstname.setValidators(Validators.required);
      this.dlDataForm.controls.firstname.updateValueAndValidity();
    } else if (this.dlFirstArray.length > 2) {
      this.dlDataForm.controls.lastname.setValidators(Validators.required);
      this.dlDataForm.controls.lastname.updateValueAndValidity();
      this.dlDataForm.controls.middlename.setValidators(Validators.required);
      this.dlDataForm.controls.middlename.updateValueAndValidity();
      this.dlDataForm.controls.firstname.setValidators(Validators.required);
      this.dlDataForm.controls.firstname.updateValueAndValidity();
    } else {
      this.dlDataForm.controls.lastname.clearValidators();
      this.dlDataForm.controls.lastname.updateValueAndValidity();
      this.dlDataForm.controls.middlename.clearValidators();
      this.dlDataForm.controls.middlename.updateValueAndValidity();
      this.dlDataForm.controls.firstname.setValidators(Validators.required);
      this.dlDataForm.controls.firstname.updateValueAndValidity();
    }
  }
}
