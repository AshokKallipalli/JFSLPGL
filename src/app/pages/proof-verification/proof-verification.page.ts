import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  AlertController,
  ModalController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { KarzaDetailsPage } from '../karza-details/karza-details.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-proof-verification',
  templateUrl: './proof-verification.page.html',
  styleUrls: ['./proof-verification.page.scss'],
})
export class ProofVerificationPage {
  customerType: string = '';
  showKycForm: boolean = false;
  kycType: string = '';
  idValue: string = '';

  @ViewChild('dropDownList') el: ElementRef;
  @ViewChild('dropDownList1') el1: ElementRef;
  @ViewChild('dropDownList2') el2: ElementRef;
  @ViewChild('dropDownList3') el3: ElementRef;
  toggle: boolean = false;
  public newshow = false;
  public existShow = false;
  public notRequiredFun = false;
  todayDate: any = new Date();
  minAge: any;
  userType: any;
  productType: any;
  leadStatus: any;
  cifUrl: any;
  leadId: any;
  public cifDataForm: FormGroup;
  idProofForm: FormGroup;
  selectOptions = {
    cssClass: 'remove-ok',
  };

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  idProofTypes: any = [];
  custTypes: any;
  idExpiry: any;

  exisAadharCheck: boolean = false;
  exisAadhar: boolean = false;

  minDobAge: any;
  maxDobAge: any;
  yesNo = [
    { code: 'Y', name: 'Yes' },
    { code: 'N', name: 'No' },
  ];

  textType: any = 'password';

  constructor(
    public platform: Platform,
    public formBuilder: FormBuilder,
    public globalData: DataPassingProviderService,
    public sqliteProvider: SqliteService,
    public master: RestService,
    public sqlSupport: SquliteSupportProviderService,
    public modalCtrl: ModalController,
    public network: Network,
    public alertCtrl: AlertController,
    public globFunc: GlobalService,
    public navParams: ActivatedRoute,
    public router: Router,
    public alertService: CustomAlertControlService
  ) {
    this.leadStatus = this.navParams.snapshot.queryParamMap.get('leadStatus');
    console.log(this.leadStatus);
    this.userType = this.globalData.getborrowerType();
    this.dobRestrict();
    this.getCustomerTypes();
    this.ageRestrict();
    this.cifDataForm = this.formBuilder.group({
      cifId: [
        '',
        Validators.compose([Validators.minLength(16), Validators.required]),
      ],
    });

    this.idProofForm = this.formBuilder.group({
      custType: ['', Validators.required],
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
  }

  ngOnInit() {}
  ngOnDestroy(): void {}
  onCustomerTypeChange() {
    // Reset KYC form if the customer type changes
    this.showKycForm = this.customerType === 'new';
  }
  ekycdismiss: Subscription;
  ionViewCanLeave() {}

  ionViewWillLeave() {}

  array: number[] = [];

  cifData(value) {
    this.globFunc.globalLodingPresent('Please wait...');
    let cifvalues = {
      CustRequest: {
        OrgSelect: localStorage.getItem('janaCenter'),
        SearchText: value.cifId,
        CategryType: localStorage.getItem('loan'),
      },
    };
    this.master.restApiCallAngular('ExCustDetails', cifvalues).then(
      (data) => {
        if ((<any>data).ErrorCode == '000') {
          let exdata = <any>data;
          if ((<any>data).RedFlag == 'true' || (<any>data).RedFlag == 'TRUE') {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Given URN is Red Flag, should not be proceed further!!!'
            );
          } else {
            this.globalData.setURN(value.cifId);
            this.sqliteProvider
              .selectExData(this.globalData.getURN())
              .then((getData) => {
                this.globalData.setborrowerType('A');
                this.globalData.setCustType('E');
                this.globFunc.globalLodingDismiss();
                if (getData.length == 0) {
                  this.sqliteProvider.saveExistingData(data).then(
                    (_) => {
                      this.aadharExistCheck(exdata, data);
                    },
                    (err) => console.log(err)
                  );
                } else {
                  this.sqliteProvider.updateExistingData(data).then(
                    (_) => {
                      this.aadharExistCheck(exdata, data);
                    },
                    (err) => console.log(err)
                  );
                }
              });
          }
        } else {
          if ((<any>data).AppId == '0') {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert!', 'Not a valid URN!');
          } else {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert!', (<any>data).ErrorMsg);
          }
        }
      },
      (err) => {
        if (err.name == 'TimeoutError') {
          this.globFunc.globalLodingDismiss();
          this.alertService.showAlert('Alert!', err.message);
        } else {
          this.globFunc.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'No Response from Server!');
        }
      }
    );
  }

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

  restrictMaxlength(event, len) {
    if (event.detail.value.length > parseInt(len)) {
      let val = event.detail.value.toString().slice(0, -1);
      event.detail.value = val;
    }
  }

  posidexCheck(value) {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert',
        'Kindly check your internet connection!!!'
      );
    } else {
      this.globFunc.globalLodingPresent('Fetching data...');
      this.globalData.setCustomerType(value.custType);
      let leadId = Math.floor(Math.random() * 900000000000) + 100000000000;
      this.globalData.setLeadId(leadId);
      if (
        value.aadhar != null &&
        value.aadhar != undefined &&
        value.aadhar != ''
      ) {
        this.aadharVault(value.idType, value.aadhar, value.aepsStatus, leadId);
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
      } else if (
        value.bpan != null &&
        value.bpan != undefined &&
        value.bpan != ''
      ) {
        this.stitchApiCall(value.idType, value.bpan, leadId);
      } else {
        this.stitchApiCall(value.idType, value.entityNum, leadId);
      }
    }
  }

  aadharVault(idType, idNumber, aepsStatus, leadId) {
    let body = {
      aadhaar: idNumber,
      aepsStatus: aepsStatus[0],
    };
    this.master.restApiCallAngular('AadharInsertVoulting', body).then(
      (result) => {
        if (result != undefined && result != null && result != '') {
          if ((<any>result).status === '00') {
            this.globFunc.globalLodingDismiss();
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
          } else {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert!', (<any>result).error);
          }
        }
      },
      (err) => {
        this.globFunc.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'Something went wrong!!!');
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
    debugger;
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
          console.log(result, 'init posidex');
          if (result != undefined && result != null && result != '') {
            if ((<any>result).errorCode === '000') {
              let res = JSON.parse((<any>result).result);
              let resList = res.customerResponseList[0];
              if (resList.matchCount == '1') {
                this.globFunc.globalLodingDismiss();
                let urn = {
                  cifId: resList.customerList[0].matchURN,
                };
                this.cifData(urn);
              } else {
                this.globFunc.globalLodingDismiss();
                if (this.globalData.getCustomerType() == '1') {
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
                } else {
                  this.stitchApiCall(idType, idNumber, leadId);
                }
              }
            } else {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert!', (<any>result).errorDesc);
            }
          }
        },
        (err) => {
          if (err.name == 'TimeoutError') {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert!', err.statusText);
          }
        }
      )
      .catch((err) => {
        this.globFunc.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'Something went wrong!!!');
      });
  }

  async initKarzaAPi(idType, idNumber, leadId, body?) {
    debugger;
    const modal = await this.modalCtrl.create({
      component: KarzaDetailsPage,
      componentProps: {
        data: JSON.stringify(body),
        idType: idType,
        idNumber: idNumber,
        leadId: leadId,
        leadStatus: this.leadStatus,
        userType: this.globalData.getborrowerType(),
      },
      cssClass: '',
      showBackdrop: true,
      animated: true,
    });
    modal.onDidDismiss().then((data) => {
      console.log(data, 'data');
      this.globFunc.globalLodingDismiss();
      if (data.data) {
        if (idType == 'pan') {
          this.globalData.setCustType('N');
          this.globFunc.globalLodingDismiss();
          this.router.navigate(['/NewapplicationPage'], {
            queryParams: {
              pan: data.data,
              leadStatus: this.leadStatus,
              leadId: leadId,
              userType: this.globalData.getborrowerType(),
            },
            replaceUrl: true,
            skipLocationChange: true,
          });
        } else if (idType == 'voterid') {
          this.globalData.setCustType('N');
          this.globFunc.globalLodingDismiss();
          this.router.navigate(['/NewapplicationPage'], {
            queryParams: {
              voter: data.data,
              leadStatus: this.leadStatus,
              leadId: leadId,
              userType: this.globalData.getborrowerType(),
            },
            replaceUrl: true,
            skipLocationChange: true,
          });
        } else if (idType == 'drivingLicence') {
          this.globalData.setCustType('N');
          this.globFunc.globalLodingDismiss();
          this.secKyc(idType, idNumber, leadId, data.data);
        } else if (idType == 'passport') {
          this.globalData.setCustType('N');
          this.globFunc.globalLodingDismiss();
          this.secKyc(idType, idNumber, leadId, data.data);
        }
      }
    });
    modal.present();
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
    this.globFunc.globalLodingPresent('Fetching data...');
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.globFunc.globalLodingDismiss();
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
              this.globFunc.globalLodingDismiss();
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
              this.secKyc(idType, idNumber, leadId, body);
            } else if (resData.status_code == 102) {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert(
                'Alert!',
                'Invalid ID number or combination of inputs'
              );
            } else if (resData.status_code == 103) {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert(
                'Alert!',
                'No records found for the given ID or combination of inputs'
              );
            } else if (resData.status_code == 104) {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Max retries exceeded');
            } else if (resData.status_code == 105) {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Missing Consent');
            } else if (resData.status_code == 106) {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Multiple Records Exist');
            } else if (resData.status_code == 107) {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Not Supported');
            } else if (resData.status_code == 108) {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert(
                'Alert!',
                'Internal Resource Unavailable'
              );
            } else if (resData.status_code == 109) {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Too many records Found');
            } else {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert!', resData.error);
            }
          } else {
            this.globFunc.globalLodingDismiss();
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
                  this.globFunc.globalLodingDismiss();
                  this.router.navigate(['/JsfhomePage'], {
                    replaceUrl: true,
                    skipLocationChange: true,
                  });
                },
              },
              {
                text: 'Yes',
                handler: () => {
                  this.globFunc.globalLodingDismiss();
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
          alert.present();
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
    this.globFunc.globalLodingPresent('Fetching data...');
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.globFunc.globalLodingDismiss();
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
            let res = resData[0];
            if (res.StatusCode == '1' && res.Panstatus == 'E') {
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
                this.globFunc.globalLodingDismiss();
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
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'Invalid PAN number');
            }
          } else {
            this.globFunc.globalLodingDismiss();
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
                  this.globFunc.globalLodingDismiss();
                  this.router.navigate(['/JsfhomePage'], {
                    replaceUrl: true,
                    skipLocationChange: true,
                  });
                },
              },
              {
                text: 'Yes',
                handler: () => {
                  this.globFunc.globalLodingDismiss();
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
          alert.present();
        }
      );
    }
  }

  getCustomerTypes() {
    this.sqliteProvider.getMasterDataUsingType('CustomerType').then((data) => {
      if (data.length > 0) {
        this.custTypes = data.filter(
          (data) => data.NAME.toLowerCase() == 'Individual'.toLowerCase()
        );
        this.idProofForm.get('custType').setValue(this.custTypes[0].CODE);
        this.custTypeChng(this.custTypes[0].CODE);
      }
    });
  }

  custTypeChng(value) {
    let type = value.detail ? value.detail.value : value;
    if (type == '1') {
      this.idProofForm.controls['idType'].setValue('');
      this.idProofForm.controls['idType'].setValidators(Validators.required);
      this.idProofForm.controls['entityNum'].setValue('');
      this.idProofForm.controls['entityNum'].clearValidators();
      this.idProofForm.controls['entityNum'].updateValueAndValidity();
      this.idProofTypes = [
        { code: 'aadhar', name: 'Aadhar' },
        { code: 'pan', name: 'Pan' },
        { code: 'voterid', name: 'Voter ID' },
        { code: 'passport', name: 'Passport' },
        { code: 'drivingLicence', name: 'Driving License' },
      ];
    } else {
      this.idProofTypes = [
        { code: 'gst', name: 'GSTIN' },
        { code: 'tan', name: 'TAN' },
        { code: 'cin', name: 'CIN' },
        { code: 'bpan', name: 'PAN' },
      ];
      this.idProofForm.controls['idType'].setValue('');
      this.idProofForm.controls['idType'].setValidators(Validators.required);
      this.idProofForm.controls['idType'].updateValueAndValidity();
      this.idProofForm.controls['aadhar'].setValue('');
      this.idProofForm.controls['aadhar'].clearValidators();
      this.idProofForm.controls['aadhar'].updateValueAndValidity();
      this.idProofForm.controls['pan'].setValue('');
      this.idProofForm.controls['pan'].clearValidators();
      this.idProofForm.controls['pan'].updateValueAndValidity();
      this.idProofForm.controls['voter'].setValue('');
      this.idProofForm.controls['voter'].clearValidators();
      this.idProofForm.controls['voter'].updateValueAndValidity();
      this.idProofForm.controls['license'].setValue('');
      this.idProofForm.controls['license'].clearValidators();
      this.idProofForm.controls['license'].updateValueAndValidity();
      this.idProofForm.controls['passport'].setValue('');
      this.idProofForm.controls['passport'].clearValidators();
      this.idProofForm.controls['passport'].updateValueAndValidity();
      this.idProofForm.controls['entityNum'].setValue('');
      this.idProofForm.controls['entityNum'].setValidators(
        Validators.compose([
          Validators.maxLength(20),
          Validators.minLength(10),
          Validators.pattern('[A-Za-z0-9]*'),
          Validators.required,
        ])
      );
    }
  }

  stitchApiCall(idType, idNumber, leadId) {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.globFunc.globalLodingDismiss();
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
                  this.globFunc.globalLodingDismiss();
                  this.globalData.setCustType('N');
                  this.sqliteProvider.InsertEntityKarzaData(body);
                  // this.navCtrl.push(NewapplicationPage, { nonIndividual: body, leadStatus: this.leadStatus, leadId: leadId, userType: this.globFunc.getborrowerType() });
                } else if (res.statusCode == 102) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Invalid ID number or combination of inputs'
                  );
                } else if (res.statusCode == 103) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'No records found for the given ID or combination of inputs'
                  );
                } else if (res.statusCode == 104) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Max retries exceeded');
                } else if (res.statusCode == 105) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Missing Consent');
                } else if (res.statusCode == 106) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Multiple Records Exist'
                  );
                } else if (res.statusCode == 107) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Not Supported');
                } else if (res.statusCode == 108) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Internal Resource Unavailable'
                  );
                } else if (res.statusCode == 109) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Too many records Found'
                  );
                } else {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', res.statusMessage);
                }
              } else {
                if (res.statusCode == 102) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Invalid ID number or combination of inputs'
                  );
                } else if (res.statusCode == 103) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'No records found for the given ID or combination of inputs'
                  );
                } else if (res.statusCode == 104) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Max retries exceeded');
                } else if (res.statusCode == 105) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Missing Consent');
                } else if (res.statusCode == 106) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Multiple Records Exist'
                  );
                } else if (res.statusCode == 107) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Not Supported');
                } else if (res.statusCode == 108) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Internal Resource Unavailable'
                  );
                } else if (res.statusCode == 109) {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Too many records Found'
                  );
                } else {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', res.statusMessage);
                }
              }
            } else {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert!', res.error);
            }
          } else {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert!', result.errorStatus);
          }
        },
        async (err) => {
          let alert = await this.alertCtrl.create({
            // title: 'Alert!',
            message:
              'KYC Verification is failed. Would you like to proceed with Offline Application Processing?',
            buttons: [
              {
                text: 'No',
                role: 'cancel',
                handler: () => {
                  this.globFunc.globalLodingDismiss();
                  this.router.navigate(['/JsfhomePage'], {
                    replaceUrl: true,
                    skipLocationChange: true,
                  });
                },
              },
              {
                text: 'Yes',
                handler: () => {
                  this.globFunc.globalLodingDismiss();
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
          alert.present();
        }
      );
    }
  }

  aadharExistCheck(exdata, data) {
    if (exdata.JanaReferenceID != '') {
      if (exdata.EKycStatus == '' || exdata.EKycStatus == 'N') {
        this.aadharExistbtnCheck();
        this.exisAadhar = true;
        this.aadhaarVaultRetrieve(exdata.JanaReferenceID);
      } else {
        this.router.navigate(['/CifDataPage'], {
          queryParams: {
            cifData: JSON.stringify(data),
            GrefId: this.navParams.snapshot.queryParamMap.get('GrefId'),
            GId: this.navParams.snapshot.queryParamMap.get('GId'),
            leadId: this.leadId,
          },
          replaceUrl: true,
          skipLocationChange: true,
        });
      }
    } else {
      this.router.navigate(['/CifDataPage'], {
        queryParams: {
          cifData: JSON.stringify(data),
          GrefId: this.navParams.snapshot.queryParamMap.get('GrefId'),
          GId: this.navParams.snapshot.queryParamMap.get('GId'),
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
      this.globFunc.globalLodingPresent('Getting aadhar number!!!');
      let body = {
        keyValue: value,
      };
      this.master.restApiCallAngular('aadharretrieveService', body).then(
        (data) => {
          if ((<any>data).status == '00') {
            this.globFunc.globalLodingDismiss();
            let Aadhar = (<any>data).aadhaar;
            this.idProofForm.controls['aadhar'].setValue(Aadhar);
            this.idProofForm.controls['aadhar'].updateValueAndValidity();
          } else {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert!', (<any>data).error);
          }
        },
        (err) => {
          if (err.name == 'TimeoutError') {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.globFunc.globalLodingDismiss();
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
    this.idProofForm.controls['idType'].setValue('aadhar');
    this.idProofForm.controls['idType'].updateValueAndValidity();
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
        custType: this.globalData.getCustomerType(),
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

  pageClose() {
    this.router.navigate(['/ExistingPage'], {
      queryParams: { username: localStorage.getItem('username') },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }
}
