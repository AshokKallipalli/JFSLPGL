import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { AlertController, ModalController } from '@ionic/angular';
// import { GlobalfunctionsProvider } from 'src-VL_latest-old-ionic3version/src/providers/globalfunctions/globalfunctions';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { KarzaDetailsPage } from '../karza-details/karza-details.page';
import { GlobalService } from 'src/providers/global.service';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';

@Component({
  selector: 'app-choose-customer',
  templateUrl: './choose-customer.page.html',
  styleUrls: ['./choose-customer.page.scss'],
})
export class ChooseCustomerPage implements OnInit {
  public cifDataForm: FormGroup;
  existShow: boolean;
  cifUrl: any;
  promoterURN: any;
  public newshow = false;
  leadStatus: any;
  todayDate: any = new Date();
  minAge: any;
  idProofForm: FormGroup;
  selectOptions = {
    cssClass: 'remove-ok',
  };

  minDobAge: any;
  maxDobAge: any;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  idProofTypes = [
    { code: 'aadhar', name: 'Aadhar' },
    { code: 'pan', name: 'Pan' },
    { code: 'voterid', name: 'Voter ID' },
    { code: 'passport', name: 'Passport' },
    { code: 'drivingLicence', name: 'Driving License' },
  ];
  yesNo = [
    { code: 'Y', name: 'Yes' },
    { code: 'N', name: 'No' },
  ];

  leadId: any;
  idExpiry: any;

  promoterURN_Coapp: any;

  exisAadharCheck: boolean = false;
  exisAadhar: boolean = false;

  textType: any = 'password';

  constructor(
    public globalFunc: GlobalService,
    public router: Router,
    public activeRoute: ActivatedRoute,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public master: RestService,
    public network: Network,
    public modalCtrl: ModalController,
    // public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public sqliteSupport: SquliteSupportProviderService,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService
  ) {
    this.cifDataForm = this.formBuilder.group({
      cifId: ['', Validators.required],
    });

    this.idProofForm = this.formBuilder.group({
      idType: ['', Validators.required],
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
      aepsStatus: [''],
    });
    // this.leadStatus = this.navParams.get('leadStatus');
    this.leadStatus = this.activeRoute.snapshot.queryParamMap.get('leadStatus');
    this.globalData.setrefId(this.globalData.getrefId());
    this.globalData.setId(this.globalData.getId());
    this.getPromoterURN();
    this.ageRestrict();
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

  // getPromoterURN() {
  //   let promoterRefId = this.globalData.getrefId();
  //    let promoterId = this.globalData.getId();
  //   this.sqliteProvider.getPromoterURN(promoterRefId, 'G').then(data => {
  //     if (data.length > 0) {
  //       this.promoterURN = data[0].URNnumber;
  //     }
  //   })
  // }

  getPromoterURN() {
    let promoterRefId = this.globalData.getrefId();
    // let promoterId = this.globalData.getId();

    if (this.globalData.getborrowerType() == 'C') {
      this.sqliteProvider.getPromoterURN(promoterRefId, 'A').then((data) => {
        console.log(data);
        if (data.length > 0) {
          this.promoterURN = data[0].URNnumber;
        }
        this.sqliteProvider.getPromoterURN(promoterRefId, 'G').then((data) => {
          console.log(data);
          if (data.length > 0) {
            this.promoterURN_Coapp = data[0].URNnumber;
          }
        });
      });
    } else if (this.globalData.getborrowerType() == 'G') {
      this.sqliteProvider.getPromoterURN(promoterRefId, 'A').then((data) => {
        console.log(data);
        if (data.length > 0) {
          this.promoterURN = data[0].URNnumber;
        }
        this.sqliteProvider.getPromoterURN(promoterRefId, 'C').then((data) => {
          console.log(data);
          if (data.length > 0) {
            this.promoterURN_Coapp = data[0].URNnumber;
          }
        });
      });
    }
  }

  opennewapp() {
    this.newshow = true;
    // this.globalData.globalLodingPresent("Please wait...");
    // this.navCtrl.pop();
    // this.globalData.setCustType('N');
    // this.globalData.setborrowerType('G');
    // this.loadingService.globalLodingDismiss();
    // this.navCtrl.push(NewapplicationPage, { userType: 'G' });
  }

  extising() {
    let minutes = 1000 * 60;
    let hours = minutes * 60;
    let days = hours * 24;
    let years = days * 365;
    let d = new Date();
    this.leadId = d.getTime();
    console.log(this.leadId);

    this.existShow = true;
  }

  cifData(value) {
    if (
      this.promoterURN == value.cifId ||
      this.promoterURN_Coapp == value.cifId
    ) {
      this.alertService.showAlert(
        'Alert!',
        'Sorry! Applicant Cannot be a Guarantor'
      );
    } else {
      this.loadingService.globalLodingPresent('Please wait...');
      let cifvalues = {
        CustRequest: {
          OrgSelect: localStorage.getItem('janaCenter'), // this.globalData.getJanaCenter(), //org scode
          SearchText: value.cifId, //URN
          CategryType: localStorage.getItem('loan'), //Module
        },
      };
      this.master.restApiCallAngular('ExCustDetails', cifvalues).then(
        (data) => {
          console.log(JSON.stringify(data));
          if ((<any>data).ErrorCode == '000') {
            let exdata = <any>data;
            if (
              (<any>data).RedFlag == 'true' ||
              (<any>data).RedFlag == 'TRUE'
            ) {
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert(
                'Alert!',
                'Given URN is Red Flag, should not be proceed further!!!'
              );
            } else if ((<any>data).Urnno == value.cifId) {
              this.globalData.setURN(value.cifId);
              this.sqliteProvider
                .selectExData(this.globalData.getURN())
                .then((getData) => {
                  this.globalData.setborrowerType('G');
                  this.globalData.setCustType('E');
                  this.loadingService.globalLodingDismiss();
                  if (getData.length == 0) {
                    this.sqliteProvider.saveExistingData(data).then(
                      (_) => {
                        this.aadharExistCheck(exdata, data);
                        // this.navCtrl.pop();
                        // this.navCtrl.push(CifDataPage, { cifData: data, GrefId: this.navParams.get('GrefId'), GId: this.navParams.get('GId'), leadId: this.leadId });
                      },
                      (err) => console.log(err)
                    );
                  } else {
                    this.sqliteProvider.updateExistingData(data).then(
                      (_) => {
                        this.aadharExistCheck(exdata, data);
                        // this.navCtrl.pop();
                        // this.navCtrl.push(CifDataPage, { cifData: data, GrefId: this.navParams.get('GrefId'), GId: this.navParams.get('GId'), leadId: this.leadId });
                      },
                      (err) => console.log(err)
                    );
                  }
                });
            } else {
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Enter Valid URN');
            }
          } else {
            if ((<any>data).AppId == '0') {
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Not a valid URN!');
            } else {
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert('Alert!', (<any>data).ErrorMsg);
            }
          }
        },
        (err) => {
          if (err.name == 'TimeoutError') {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert!', 'No Response from Server!');
          }
        }
      );
    }
  }

  proofTypeChng(event) {
    if (event.detail.value == 'aadhar') {
      this.idProofForm.controls.aadhar.setValidators(
        Validators.compose([
          Validators.maxLength(12),
          Validators.minLength(12),
          Validators.pattern('[0-9]{12}'),
          Validators.required,
        ])
      );
      this.idProofForm.controls.aepsStatus.setValidators(Validators.required);
      this.idProofForm.controls.aadhar.setValue('');
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
    } else if (event.detail.value == 'pan') {
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
          Validators.maxLength(40),
          Validators.pattern('[a-zA-Z. ]*'),
          Validators.required,
        ])
      );
      this.idProofForm.controls.firstName.setValue('');
      this.idProofForm.controls.middleName.setValidators(
        Validators.compose([
          Validators.maxLength(40),
          Validators.pattern('[a-zA-Z. ]*'),
        ])
      );
      this.idProofForm.controls.middleName.setValue('');
      this.idProofForm.controls.lastName.setValidators(
        Validators.compose([
          Validators.maxLength(40),
          Validators.pattern('[a-zA-Z. ]*'),
          Validators.required,
        ])
      );
      this.idProofForm.controls.lastName.setValue('');
      this.idProofForm.controls.namePan.setValidators(
        Validators.compose([
          Validators.maxLength(40),
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
    } else if (event.detail.value == 'voterid') {
      // this.idProofForm.controls.voter.setValidators(Validators.compose([Validators.maxLength(10), Validators.minLength(10), Validators.pattern(/^[a-zA-Z]{3}[0-9]{7}$/), Validators.required]));
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
      this.idProofForm.controls.passport.clearValidators();
      this.idProofForm.controls.passport.setValue('');
      this.idProofForm.controls.license.clearValidators();
      this.idProofForm.controls.license.setValue('');
    } else if (event.detail.value == 'passport') {
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
    } else if (event.detail.value == 'drivingLicence') {
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
    }
  }

  restrictMaxlength(event, len) {
    if (event.detail.value.length > parseInt(len)) {
      let val = event.detail.value.toString().slice(0, -1);
      event.detail.value = val;
    }
  }

  posidexCheck(value) {
    let idValue;
    let refId = this.globalData.getrefId();
    if (
      value.aadhar != '' &&
      value.aadhar != null &&
      value.aadhar != undefined
    ) {
      idValue = value.aadhar;
    } else if (value.pan != '' && value.pan != null && value.pan != undefined) {
      idValue = value.pan;
    } else if (
      value.voter != '' &&
      value.voter != null &&
      value.voter != undefined
    ) {
      idValue = value.voter;
    } else if (
      value.license != '' &&
      value.license != null &&
      value.license != undefined
    ) {
      idValue = value.license;
    } else if (
      value.passport != '' &&
      value.passport != null &&
      value.passport != undefined
    ) {
      idValue = value.passport;
    } else {
      idValue = '';
    }
    this.sqliteProvider
      .getPromoterProofDetailsByProof(refId, idValue)
      .then((data) => {
        if (data.length == 0) {
          if (this.network.type == 'none' || this.network.type == 'unknown') {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert',
              'Kindly check your internet connection!!!'
            );
          } else {
            // this.globalData.globalLodingPresent("Fetching data...");
            let leadId =
              Math.floor(Math.random() * 900000000000) + 100000000000;
            if (
              value.aadhar != null &&
              value.aadhar != undefined &&
              value.aadhar != ''
            ) {
              // this.loadingService.globalLodingDismiss();
              this.aadharVault(
                value.idType,
                value.aadhar,
                value.aepsStatus,
                leadId
              );
            } else if (
              value.pan != null &&
              value.pan != undefined &&
              value.pan != ''
            ) {
              this.initPosidex(
                value.idType,
                value.pan,
                leadId,
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
              this.initPosidex(value.idType, value.voter, leadId);
            } else if (
              value.license != null &&
              value.license != undefined &&
              value.license != ''
            ) {
              this.initPosidex(value.idType, value.license, leadId);
            } else if (
              value.passport != null &&
              value.passport != undefined &&
              value.passport != ''
            ) {
              this.initPosidex(value.idType, value.passport, leadId);
            }
          }
        } else {
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert(
            'Alert',
            'Same ID proof is captured in the same application!!!'
          );
        }
      });
  }

  aadharVault(idType, idNumber, aepsStatus, leadId) {
    this.loadingService.globalLodingPresent('Checking given Aadhar!');
    let body = {
      aadhaar: idNumber,
      aepsStatus: aepsStatus,
    };
    this.master.restApiCallAngular('AadharInsertVoulting', body).then(
      (result) => {
        if (result != undefined && result != null && result != '') {
          if ((<any>result).status === '00') {
            this.sqliteSupport
              .duplicateAadharCheck(
                this.globalData.getrefId(),
                (<any>result).janaId
              )
              .then((data) => {
                if (data.length > 0) {
                  this.loadingService.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Given Aadhar number is already added in this application!'
                  );
                } else {
                  this.loadingService.globalLodingDismiss();
                  this.router.navigate(['/FingerprintPage'], {
                    queryParams: {
                      idType: idType,
                      idNumber: idNumber,
                      aepsStatus: aepsStatus,
                      leadId: leadId,
                      leadStatus: this.leadStatus,
                      janaId: (<any>result).janaId,
                      existAather: this.exisAadharCheck,
                    },
                    skipLocationChange: true,
                    replaceUrl: true,
                  });
                }
              });
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert!', (<any>result).error);
          }
        }
      },
      (err) => {
        if (err.name == 'TimeoutError') {
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert('Alert!', err.message);
        } else {
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'No Response from Server!');
        }
      }
    );
  }

  initPosidex(
    idType,
    idNumber,
    leadId,
    firstName?,
    middleName?,
    lastName?,
    panName?,
    panDob?
  ) {
    this.loadingService.globalLodingPresent('Fetching data...');
    let body = {
      idType: idType,
      idvalue: idNumber,
      leadid: leadId,
      urnNumber: 'LOS' + leadId,
    };
    this.master
      .restApiCallAngular('posidexType1', body)
      .then(
        (result) => {
          if (result != undefined && result != null && result != '') {
            if ((<any>result).errorCode === '000') {
              let res = JSON.parse((<any>result).result);
              let resList = res.customerResponseList[0];
              if (resList.matchCount == '1') {
                this.loadingService.globalLodingDismiss();
                let urn = {
                  cifId: resList.customerList[0].matchURN,
                };
                this.cifData(urn);
              } else {
                this.loadingService.globalLodingDismiss();
                console.log('Karza');
                if (idType == 'voterid') {
                  this.voterKarza(idType, idNumber, leadId);
                } else if (idType == 'pan') {
                  this.panKarza(
                    idType,
                    idNumber,
                    leadId,
                    firstName,
                    middleName,
                    lastName,
                    panName,
                    panDob
                  );
                } else {
                  this.initKarzaAPi(idType, idNumber, leadId);
                }
              }
            } else {
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert('Alert!', (<any>result).errorDesc);
            }
          }
        },
        (err) => {
          if (err.name == 'TimeoutError') {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert!', err.statusText);
          }
        }
      )
      .catch((err) => {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'Something went wrong!!!');
      });
  }

  async initKarzaAPi(idType, idNumber, leadId, body?) {
    const modal = await this.modalCtrl.create({
      component: KarzaDetailsPage,
      componentProps: {
        data: JSON.stringify(body),
        idType: idType,
        idNumber: idNumber,
        leadId: leadId,
        leadStatus: this.leadStatus,
      },
    });
    await modal.onDidDismiss().then((data) => {
      console.log(data, 'data');
      this.loadingService.globalLodingDismiss();
      if (data) {
        if (idType == 'pan') {
          this.globalData.setCustType('N');
          this.loadingService.globalLodingDismiss();
          this.router.navigate(['/NewapplicationPage'], {
            queryParams: {
              voter: data,
              leadStatus: this.leadStatus,
              leadId: leadId,
              userType: this.globalData.getborrowerType(),
            },
            replaceUrl: true,
            skipLocationChange: true,
          });
        } else if (idType == 'voterid') {
          this.globalData.setCustType('N');
          this.loadingService.globalLodingDismiss();
          this.router.navigate(['/NewapplicationPage'], {
            queryParams: {
              voter: data,
              leadStatus: this.leadStatus,
              leadId: leadId,
              userType: this.globalData.getborrowerType(),
            },
            replaceUrl: true,
            skipLocationChange: true,
          });
        } else if (idType == 'drivingLicence') {
          this.globalData.setCustType('N');
          this.loadingService.globalLodingDismiss();
          this.secKyc(idType, idNumber, leadId, body);
        } else if (idType == 'passport') {
          this.globalData.setCustType('N');
          this.loadingService.globalLodingDismiss();
          this.secKyc(idType, idNumber, leadId, body);
        }
      }
    });
    await modal.present();
  }

  dobRestrict() {
    let dd: any = this.todayDate.getDate() - 1;
    let mm: any = this.todayDate.getMonth() + 1; //January is 0!
    let yyyy: any = this.todayDate.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    let mindate = yyyy + '-' + mm + '-' + dd;
    console.log(mindate);
    this.minAge = mindate;
  }

  voterKarza(idType, idNumber, leadId) {
    this.loadingService.globalLodingPresent('Fetching data...');
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Kindly check your internet connection!!!'
      );
    } else {
      let body = {
        epic_no: idNumber,
        UniqueID: leadId,
      };
      this.master.restApiCallAngular('VoterIdAuthentication', body, 'Y').then(
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
              let body = {
                name: name,
                fathername: father,
                dob: res.dob,
                idNumber: idNumber,
                type: 'voterid',
              };
              this.globalData.setCustType('N');
              this.loadingService.globalLodingDismiss();
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
                this.idExpiry || ''
              );
              // this.navCtrl.push(NewapplicationPage, { voter: body, leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
              // this.initKarzaAPi(idType, idNumber, leadId, body);
              this.secKyc(idType, idNumber, leadId, body);
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
          const alert = await this.alertCtrl.create({
            header: 'Alert!',
            message:
              'KYC Verification is failed. Would you like to proceed with Offline Application Processing?',
            buttons: [
              {
                text: 'No',
                role: 'cancel',
                handler: () => {
                  this.loadingService.globalLodingDismiss();
                  this.router.navigate(['/JsfhomePage'], {
                    replaceUrl: true,
                    skipLocationChange: true,
                  });
                },
              },
              {
                text: 'Yes',
                handler: () => {
                  this.loadingService.globalLodingDismiss();
                  this.globalData.setCustType('N');
                  // let navigationExtras: NavigationExtras = {
                  //   queryParams: {
                  //     "customerData": JSON.stringify({
                  //       leadStatus: this.leadStatus,
                  //       leadId: leadId,
                  //       userType: this.globalData.getborrowerType()
                  //     })
                  //   }
                  // };
                  this.router.navigate(['/NewapplicationPage'], {
                    queryParams: {
                      leadStatus: this.leadStatus,
                      leadId: leadId,
                      userType: this.globalData.getborrowerType(),
                    },
                    replaceUrl: true,
                    skipLocationChange: true,
                  });
                },
              },
            ],
          });
          await alert.present();
          // this.loadingService.globalLodingDismiss();
          // this.alertService.showAlert("Alert!", error.statusText);
        }
      );
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
    this.loadingService.globalLodingPresent('Fetching data...');
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.loadingService.globalLodingDismiss();
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
      this.master.restApiCallAngular('panvalidation', body, 'Y').then(
        (result) => {
          if ((<any>result).success) {
            let resData = JSON.parse((<any>result).responseData.panValidation);
            resData = resData.NSDL.Response.details;
            console.log(resData);
            if (resData[0].StatusCode == '1' && resData[0].Panstatus == 'E') {
              let res = resData[0];
              if (res.nameValidation != 'Y') {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Please mention correct name as per PAN!!!'
                );
              } else if (res.DOBValidation != 'Y') {
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Please mention correct DOB as per PAN!!!'
                );
              } else {
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
                this.loadingService.globalLodingDismiss();
                this.sqliteProvider.InsertKarzaData(
                  leadId,
                  panName,
                  '',
                  newPanDOB,
                  idNumber,
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  'pan',
                  this.idExpiry || ''
                );

                this.secKyc(idType, idNumber, leadId, body);
              }
            } else {
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Invalid PAN number');
            }
          } else {
            this.loadingService.globalLodingDismiss();
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
                  this.loadingService.globalLodingDismiss();
                  this.router.navigate(['/JsfhomePage'], {
                    replaceUrl: true,
                    skipLocationChange: true,
                  });
                },
              },
              {
                text: 'Yes',
                handler: () => {
                  this.loadingService.globalLodingDismiss();
                  this.globalData.setCustType('N');

                  this.router.navigate(['/NewapplicationPage'], {
                    queryParams: {
                      leadStatus: this.leadStatus,
                      leadId: leadId,
                      userType: this.globalData.getborrowerType(),
                    },
                    replaceUrl: true,
                    skipLocationChange: true,
                  });
                },
              },
            ],
          });
          await alert.present();
          // this.loadingService.globalLodingDismiss();
          // this.alertService.showAlert("Alert!", error.statusText);
        }
      );
    }
  }

  aadharEkyc(idType, idNumber, leadId) {
    // this.navCtrl.push(FingerprintPage, { idType: idType, idNumber: idNumber, leadId: leadId, leadStatus: this.leadStatus });
  }

  aadharExistCheck(exdata, data) {
    // if (exdata.EKycStatus == "" && exdata.JanaReferenceID == "" && exdata.Aadhar == "") {
    //   // OTP
    //   this.exisAadhar = false;
    //   this.aadharExistbtnCheck();
    // } else {
    //   if (exdata.EKycStatus == 'Y' || exdata.EKycStatus == 'Positive') {
    //     if (exdata.JanaReferenceID == "" && exdata.Aadhar == "") {
    //       // otp
    //       this.exisAadhar = false;
    //       this.aadharExistbtnCheck();
    //     } else {
    //       // page move
    //       this.navCtrl.pop();
    //       this.navCtrl.push(CifDataPage, { cifData: data, GrefId: this.navParams.get('GrefId'), GId: this.navParams.get('GId'), leadId: this.leadId });
    //     }
    //   } else {
    //     // OTP
    //     this.aadharExistbtnCheck();
    //     if (exdata.Aadhar != "") {
    //       this.exisAadhar = true;
    //       this.idProofForm.controls.aadhar.setValue(exdata.Aadhar);
    //       this.idProofForm.controls.aadhar.updateValueAndValidity();
    //     } else {
    //       this.exisAadhar = false;
    //       this.idProofForm.controls.aadhar.setValue("");
    //       this.idProofForm.controls.aadhar.updateValueAndValidity();
    //     }
    //   }
    // }

    if (exdata.JanaReferenceID != '') {
      if (exdata.EKycStatus == '' || exdata.EKycStatus == 'N') {
        this.aadharExistbtnCheck();
        this.exisAadhar = true;
        this.aadhaarVaultRetrieve(exdata.JanaReferenceID);
        // this.idProofForm.controls.aadhar.setValue(exdata.Aadhar);
        // this.idProofForm.controls.aadhar.updateValueAndValidity();
      } else {
        // this.navCtrl.pop();

        this.router.navigate(['/cif-data'], {
          queryParams: {
            cifData: data,
            GrefId: this.activeRoute.snapshot.queryParamMap.get('GrefId'),
            GId: this.activeRoute.snapshot.queryParamMap.get('GId'),
            leadId: this.leadId,
          },
          replaceUrl: true,
          skipLocationChange: true,
        });
      }
    } else {
      //page move
      // this.navCtrl.pop();
      // { cifData: data, GrefId: this.activeRoute.snapshot.params['GrefId'], GId: this.activeRoute.snapshot.params['GId'], leadId: this.leadId }
      // let navigationExtras: NavigationExtras = {
      //   queryParams: {
      //     "customerData": JSON.stringify({
      //       cifData: data,
      //       GrefId: this.activeRoute.snapshot.paramMap.get('GrefId'),
      //       GId: this.activeRoute.snapshot.paramMap.get('GId'),
      //       leadId: this.leadId
      //     })
      //   }
      // };
      this.router.navigate(['/cif-data'], {
        queryParams: {
          cifData: data,
          GrefId: this.activeRoute.snapshot.queryParamMap.get('GrefId'),
          GId: this.activeRoute.snapshot.queryParamMap.get('GId'),
          leadId: this.leadId,
        },
        replaceUrl: true,
        skipLocationChange: true,
      });
    }
  }

  aadhaarVaultRetrieve(value) {
    if (this.network.type === 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert!',
        'Please Check your Data Connection!'
      );
    } else {
      this.loadingService.globalLodingPresent('Getting aadhar number!!!');
      let body = {
        keyValue: value,
      };
      this.master.restApiCallAngular('aadharretrieveService', body).then(
        (data) => {
          if ((<any>data).status == '00') {
            this.loadingService.globalLodingDismiss();
            // this.vaultStatus = 'Y';
            // this.vaultDisable = true;
            // this.aadharBtn = "Retrieve";
            //this.alertService.showAlert("Alert!", "Given aadhar number is " + (<any>data).aadhaar);
            let Aadhar = (<any>data).aadhaar;
            this.idProofForm.controls.aadhar.setValue(Aadhar);
            this.idProofForm.controls.aadhar.updateValueAndValidity();
          } else {
            // this.vaultDisable = true;
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert!', (<any>data).error);
          }
        },
        (err) => {
          if (err.name == 'TimeoutError') {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert!', 'No Response from Server!');
          }
        }
      );
    }
  }

  aadharExistbtnCheck() {
    this.existShow = false;
    this.newshow = true;
    this.exisAadharCheck = true;
    this.idProofForm.controls.idType.setValue('aadhar');
    this.idProofForm.controls.idType.updateValueAndValidity();
    this.alertService.showAlert('Alert', 'Ekyc is not completed');
  }

  viewAadhar() {
    if (this.textType == 'password') {
      this.textType = 'tel';
    } else {
      this.textType = 'password';
    }
  }

  secKyc(idType, idNumber, leadId, body?) {
    this.router.navigate(['/secondKycPage'], {
      queryParams: {
        data: JSON.stringify(body),
        idType: idType,
        idNumber: idNumber,
        leadId: leadId,
        leadStatus: this.leadStatus,
        userType: this.globalData.getborrowerType(),
      },
      replaceUrl: true,
      skipLocationChange: true,
    });
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
