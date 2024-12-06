import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PicproofPage } from 'src/app/pages/picproof/picproof.page';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
})
export class BasicComponent implements OnInit {
  @Output() saveStatus = new EventEmitter();
  coAppFlag: any;
  guaFlag: any;
  moratorium: any;
  schemeCode: any;
  Repayments: any;
  vlTenure: any;
  installments: any;
  agent_master: any;
  empIdDisable: boolean = false;
  agentIdDisable: boolean = false;
  lmsLeadId: any;
  _distanceFromBrance: number;
  _longitude: number;
  _latitude: number;
  loanAmountFrom: any;
  loanAmountTo: any;
  interestFrom: any;
  interestTo: any;
  tenureFrom: any;
  tenureTo: any;
  tenure: any;
  appUniqueId: any;
  _selectedCenter: any;
  janaLoanName: any;
  latlong: any;
  ind_master: any;
  org_master: any;
  pdt_master: any[];
  pur_master: any;
  nat_master: any;
  appStatusURL: any;
  cibilCheckStat: any;
  submitStat: any;
  selectedProdect: any;
  janaProduct: any;
  getBasicData: any;
  refId: any;
  id: any;
  basicData: FormGroup;
  panNumber: any;
  userType: any;
  deviceId: any;
  createdDate: any;
  public createdUser: any;
  productType: any;
  loanAmount: any;
  panResult: any;
  refinfo: any;
  profPic: any;
  uniqueId: any;
  sixteenDigId: any;
  selectOptions = {
    cssClass: 'remove-ok',
  };
  submitDisable: boolean = false;
  dateValue: any;
  productClicked: boolean = false;
  LMSDetails: any;
  lmsData: boolean = false;
  yesOrNo: any = [
    { code: '1', name: 'YES' },
    { code: '2', name: 'NO' },
  ];
  segmentList: any = [
    // { code: "1", name: "OPTION 1" },
    // { code: "2", name: "OPTION 2" },
  ];
  vehicle: any = [
    { code: '1', name: 'NEW' },
    { code: '2', name: 'USED' },
  ];
  ElectricType: any = [
    { code: 'Y', name: 'YES' },
    { code: 'N', name: 'NO' },
  ];
  isNewVehicle = false;
  dummy_master: any = [
    { CODE: '2', NAME: 'Vehicle Purchase' },
    { CODE: '1', NAME: 'Vehicle Refinance' },
  ];
  intType: any = [
    { code: '1', name: 'Fixed' },
    { code: '2', name: 'Floating' },
    { code: '3', name: 'Hybrid' },
  ];
  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  dealerNameTemp: any;
  dummy_masterDealer: any;
  GstCharges = {
    GstonProcessingFee: 18,
    GstonSdcTax: 18,
    GstonLegalandAdvanceCharges: 18,
    GstonOtherCharges: 18,
    GstonCollateralInsurence: 18,
    GstonCreditLifeInsurence: 18,
    GstonPddCharges: 18,
    GstonNachCharges: 18,
    VEHICLE: '13',
  };

  loanProduct = [{ prdCode: '960', prdDesc: '960' }];
  idType: any;
  idNumber: any;
  leadId: any;
  scheme_master: any[] = [];
  formActivater = { disableForm: true };
  pagename = 'Basic Details';
  processFeesData: any = [];

  janaid: any;
  naveParamsValue: any;
  signPic: any;
  signImgs: any = [];
  signImglen: number = 0;
  userPrdResponse: any[];
  jana_products: any = [];
  constructor(
    public navCtrl: Router,
    public platform: Platform,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public alertCtrl: AlertController,
    public globalData: DataPassingProviderService,
    public device: Device,
    public loadCtrl: LoadingController,
    public network: Network,
    private globFunc: GlobalService,
    public master: RestService,
    private activateRoute: ActivatedRoute,
    public sqlSupport: SquliteSupportProviderService,
    public alertService: CustomAlertControlService
  ) {
    this.activateRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.getProductScheme();
    this.getAllJanaProducts();
    this.getsegmentType();
    // this.getProductValue(undefined);
    this.getPurposeValue();
    this.getIndustryValue();
    this.getModeofRepayment();
    this.getVlTenure();
    this.getCibilCheckedDetails();
    this.getPeriodInstallments();
    this.getDealerMaster();
    this.getProcessingFees();
    this.dateValue = new Date();
    this.appStatusURL = this.master.apiURL + 'AppStatus';

    this.createdUser = this.globFunc.basicDec(localStorage.getItem('username'));
    this.deviceId = this.device.uuid;
    this.createdDate = new Date();
    this.userType = this.globalData.getborrowerType();
    console.log(this.userType, 'usertype in basic');
    this.productType = localStorage.getItem('loan');
    this.profPic = this.globalData.getProfileImage();

    this.janaid = this.naveParamsValue.janaid;

    if (this.naveParamsValue.aadhar) {
      this.idType = this.naveParamsValue.aadhar;
      this.idNumber = this.naveParamsValue.idNumber;
    } else if (this.naveParamsValue.passport) {
      this.idType = this.naveParamsValue.passport;
    } else if (this.naveParamsValue.licence) {
      this.idType = this.naveParamsValue.licence;
    } else if (this.naveParamsValue.voter) {
      this.idType = this.naveParamsValue.voter;
    } else {
      this.idType = {
        idNumber: 'test',
        type: 'others',
      };
    }
    this.leadId = this.naveParamsValue.leadId;

    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();

    if (this.userType === 'A') {
      this.id = this.globalData.getId();
    } else if (this.userType === 'G') {
      this.globalData.setId('');
      // this.globalData.setEditSaveStatus('basicTick');
      // this.globalData.setEditSaveStatus('basicSaved');
      this.saveStatus.emit('basicTick');
      localStorage.setItem('Basic', 'basicSaved');
    }

    if (this.naveParamsValue.appRefValue) {
      this.refinfo = JSON.parse(this.naveParamsValue.appRefValue);
      this.refId = this.refinfo.refId;
      this.globalData.setrefId(this.refId);
      this.id = this.refinfo.id;
      this.globalData.setId(this.id);
      this.productType = this.refinfo.productType;
      this.globalData.setloanType(this.productType);
    }

    this.basicData = this.formBuilder.group({
      prdSche: ['', Validators.required],
      janaLoan: ['', Validators.required],
      // vehicleType: ['', Validators.required],
      // electricVehicle: ['', Validators.required],
      // dealerName: ['', Validators.required],
      // dealerCode: [''],
      loanAmount: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      interest: ['', Validators.required],
      intRate: ['', Validators.required],
      tenure: [
        '',
        Validators.compose([
          Validators.pattern('^(?!0+$)[0-9]*$'),
          Validators.required,
        ]),
      ],
    });

    if (this.refId === '' || this.refId === undefined || this.refId === null) {
      this.refId = '';
    } else {
      this.getBasicDetails();
    }

    if (this.naveParamsValue.fieldDisable) {
      this.submitDisable = true;
    }

    // this.basicData.get('dealerName').valueChanges.subscribe((value) => {
    //   console.log(value, 'dealerCodeValue');
    //   this.basicData.get('dealerCode').setValue(value);
    // });
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

  ngAfterViewInit() {
    this.platform.ready().then((readySource) => {
      if (readySource === 'cordova') {
        let posOptions = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        };
        //   this.geolocation.getCurrentPosition(posOptions).then((res) => {
        //     // console.log(`latitude ${res.coords.latitude}====longitude ${res.coords.longitude}`)
        //     this._latitude = res.coords.latitude;
        //     this._longitude = res.coords.longitude;
        //     this._distanceFromBrance = this.globFunc.returnDistanceFromLatLong(res.coords.latitude, res.coords.longitude, 12.971599, 77.594566);
        //   }, err => {
        //     this.alertService.showAlert("Alert!", `Check Gps Connection`)
        //   })
      }
    });
  }

  getOrgName(value: string) {
    let selectedOrgName = this.org_master.find((f) => {
      return f.orgscode === value;
    });
    return selectedOrgName;
  }

  setFilteredItems(panNumber) {
    this.panNumber = panNumber.toUpperCase();
    this.panResult = undefined;
  }

  async basicsave(value) {
    console.log(value, 'basicsave');
    this.globalData.globalLodingPresent('Please wait...');
    this.profPic = this.globalData.getProfileImage();
    this.loanAmount = parseInt(this.basicData.get('loanAmount').value);
    if (value.janaLoan.length == 1) {
      value.janaLoan = value.janaLoan[0];
      this.janaLoanName = this.getJanaLoanName(value.janaLoan);
    } else {
      this.janaLoanName = this.getJanaLoanName(value.janaLoan);
    }
    // let tenure = this.basicData.get('tenure').value
    // let tenureval = this.vlTenure.filter(data => data.CODE == tenure);
    if (this.loanAmount < this.loanAmountFrom) {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'You must enter the minimum loan amount of ' + this.loanAmountFrom
      );
    } else if (this.loanAmount > this.loanAmountTo) {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'You are Eligible maximum loan amount of ' + this.loanAmountTo
      );
    } else {
      if (this.naveParamsValue.ekycData) {
        value.janaRefId = this.janaid;
        value.vaultStatus = 'Y';
      }
      let isEkyc = await this.sqliteProvider.getEKYCDetails(this.leadId);
      if (isEkyc.length > 0) {
        value.janaRefId = isEkyc[0].janaid;
        value.vaultStatus = 'Y';
      }
      if (this.profPic) {
        if (this.signImgs.length > 0) {
          this.signPic = this.signImgs[0].imgpath;
          if (
            this.refId === '' ||
            this.refId === undefined ||
            this.refId === null
          ) {
            this.appUniqueId = Math.floor(Math.random() * 90000000) + 10000000;
            this.globalData.setUniqueId(this.appUniqueId);
            let rootData = [
              this.createdDate,
              this.deviceId,
              this.createdUser,
              'mlos' + this.appUniqueId,
            ];
            this.sqliteProvider.rootDetails(rootData).then((data) => {
              let aaaId = 'mlos' + new Date().getFullYear() + '0000';
              let idStr = '' + data.insertId;
              this.sixteenDigId =
                aaaId.substring(0, aaaId.length - idStr.length) + data.insertId;
              this.refId = data.insertId;
              this.globalData.setrefId(this.refId);
              if (this.idType == 'aadhaar') {
                this.sqliteProvider.insertIdproofData(
                  this.idNumber,
                  this.idType,
                  this.leadId
                );
              } else {
                this.sqliteProvider.insertIdproofData(
                  this.idType.idNumber,
                  this.idType.type,
                  this.leadId
                );
              }
              this.sqliteProvider
                .addBasicDetails(
                  this.refId,
                  value,
                  this.loanAmountFrom,
                  this.loanAmountTo,
                  this.guaFlag,
                  this.userType,
                  this.productType,
                  this.profPic,
                  this.lmsLeadId,
                  this.signPic
                )
                .then((data) => {
                  this.id = data.insertId;
                  this.globalData.setborrowerType(this.userType);
                  this.globalData.setId(this.id);
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert(
                    'Alert!',
                    'Loan Facilities Added Successfully'
                  );
                  this.formActivater.disableForm = true;
                  this.globFunc.setapplicationDataChangeDetector(
                    'saved',
                    this.pagename
                  );
                  this.saveStatus.emit('basicTick');
                  // this.globalData.setEditSaveStatus('basicSaved');
                  localStorage.setItem('Basic', 'basicSaved');
                  this.globalData.setPDT('');
                })
                .catch((Error) => {
                  this.globalData.globalLodingDismiss();
                  this.alertService.showAlert('Alert!', 'Failed!');
                });
            });
          } else {
            this.sqliteProvider
              .updateBasicDetails(
                this.refId,
                value,
                this.loanAmountFrom,
                this.loanAmountTo,
                this.guaFlag,
                this.userType,
                this.productType,
                this.profPic,
                this.lmsLeadId,
                this.signPic,
                this.id
              )
              .then((data) => {
                this.saveStatus.emit('basicTick');
                // this.globalData.setEditSaveStatus('basicSaved');
                localStorage.setItem('Basic', 'basicSaved');
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Loan Facilities Updated Successfully'
                );
                this.globFunc.setapplicationDataChangeDetector(
                  'saved',
                  this.pagename
                );
                this.formActivater.disableForm = true;
                this.globalData.setPDT('');
              })
              .catch((Error) => {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', 'Failed!');
              });
          }
        } else {
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert(
            'Alert!',
            'Must Capture the Signatre Image!'
          );
        }
      } else {
        this.globalData.globalLodingDismiss();
        this.alertService.showAlert(
          'Alert!',
          'Must Capture the Applicant Profile Image!'
        );
      }
    }
  }

  getBasicDetails() {
    this.globalData.globalLodingPresent('Fetching Data...!');
    this.sqliteProvider
      .getBasicDetails(this.refId, this.id)
      .then((data) => {
        this.getBasicData = data;
        this.basicData.controls.prdSche.setValue(this.getBasicData[0].prdSche);
        this.basicData.controls.janaLoan.setValue(
          this.getBasicData[0].janaLoan
        );
        this.basicData.controls.loanAmount.setValue(
          this.getBasicData[0].loanAmount
        );
        this.getProductValue(this.getBasicData[0].prdSche);
        // filter based on orgCode
        this.refId = this.getBasicData[0].refId;
        this.id = this.getBasicData[0].id;
        this.userType = this.getBasicData[0].userType;
        this.profPic = this.globalData.setProfileImage(
          this.getBasicData[0].profPic
        );
        this.signImgs = [];
        let signObj = { imgpath: this.getBasicData[0].signPic };
        this.signImgs.push(signObj);
        this.signImglen = this.signImgs.length;
        this.saveStatus.emit('basicTick');
        localStorage.setItem('Basic', 'basicSaved');
      })
      .catch((Error) => {
        console.log(Error);
      });
  }

  getOrganisationValue() {
    this.sqliteProvider.getOrganisation().then((data) => {
      this.org_master = data;
      if (
        this.refId === '' ||
        this.refId === undefined ||
        this.refId === null
      ) {
        this.basicData
          .get('janaCenter')
          .setValue(this.getOrgName(localStorage.getItem('janaCenter')));
      }
    });
  }

  async getProductValue(value) {
    await this.sqliteProvider
      .getOrganisationState(localStorage.getItem('janaCenter'))
      .then((orgCode) => {
        if (orgCode.length > 0) {
          if (value) {
            if (this.userPrdResponse && this.userPrdResponse.length > 0) {
              let sepcSubCode = this.userPrdResponse.filter(
                (data) => data.main == value
              );
              if (sepcSubCode && sepcSubCode.length > 0) {
                this.pdt_master = [];
                sepcSubCode.forEach(async (subCode) => {
                  await this.sqlSupport
                    .getProductBasedOnSchemeSpec(
                      orgCode[0].OrgID,
                      value,
                      subCode.sub
                    )
                    .then((data) => {
                      this.pdt_master.push(...data);
                      this.productChange(undefined);
                    });
                });
              } else {
                this.sqlSupport
                  .getProductBasedOnScheme(orgCode[0].OrgID, value)
                  .then((data) => {
                    console.log('data product', data);
                    this.pdt_master = [];
                    this.pdt_master = data;
                    this.productChange(undefined);
                  });
              }
            } else {
              this.sqlSupport
                .getProductBasedOnScheme(orgCode[0].OrgID, value)
                .then((data) => {
                  console.log('data product', data);
                  this.pdt_master = [];
                  this.pdt_master = data;
                  this.productChange(undefined);
                });
            }
          } else {
            this.sqliteProvider.getAllProductValues().then((data) => {
              this.pdt_master = [];
              this.pdt_master = data;
              this.productChange(undefined);
            });
          }
        } else {
          this.alertService.showAlert(
            'Alert!',
            `Product not configured for this branch user!`
          );
        }
      });
  }

  schemeChng(value, type) {
    if (type == 'chng') {
      this.basicData.controls.janaLoan.setValue('');
      this.basicData.controls.janaLoan.updateValueAndValidity();
      this.basicData.controls.interest.setValue('');
      this.basicData.controls.interest.updateValueAndValidity();
      this.basicData.controls.intRate.setValue('');
      this.basicData.controls.intRate.updateValueAndValidity();
      this.basicData.controls.tenure.setValue('');
      this.basicData.controls.tenure.updateValueAndValidity();
      this.basicData.controls.loanAmount.setValue('');
      this.basicData.controls.loanAmount.updateValueAndValidity();
    }
    // let janaScheme = this.getJanaSchemeCode(value.detail.value);
    // if (janaScheme == '1060') {
    //   this.basicData.controls.vehicleType.setValue('2');
    //   this.basicData.get('electricVehicle').setValue('');
    //   this.basicData.get('electricVehicle').clearValidators();
    //   this.basicData.get('electricVehicle').updateValueAndValidity();
    // } else {
    //   this.basicData.controls.vehicleType.setValue('1');
    // }
    this.getProductValue(value.detail.value);
    this.vehicleTypeChng();
  }

  productChange(change) {
    if (change == 'prdChange') {
      this.productClicked = true;
    }
    if (this.pdt_master) {
      this.pdt_master.forEach((element) => {
        if (element.prdCode == this.basicData.controls.janaLoan.value) {
          this.loanAmountFrom = element.prdamtFromRange;
          this.loanAmountFrom = parseInt(this.loanAmountFrom);
          this.loanAmountTo = element.prdamtToRange;
          this.loanAmountTo = parseInt(this.loanAmountTo);
          this.interestFrom = element.prdbaserate;
          this.interestTo = element.prdinterest;
          this.tenureFrom = element.prdTenorFrom;
          this.tenureFrom = parseInt(this.tenureFrom);
          this.tenureTo = element.prdTenorTo;
          this.tenureTo = parseInt(this.tenureTo);
          this.schemeCode = element.prdSchemeCode;
          this.moratorium = element.prdMoratoriumMax;
          this.coAppFlag = 'N'; //element.prdCoappFlag;
          this.guaFlag = 'N'; //element.prdGuaFlag;
          localStorage.setItem(
            'product',
            this.basicData.controls.janaLoan.value
          );
          this.globalData.eventValue.next(
            this.basicData.controls.janaLoan.value
          );
          // this.eventValue.publish("product", "product", 'value');
          // this.getIntRate(this.basicData.controls.interest.value);
        }
        // if (element.prdSchemeCode == '1060') {
        //   this.basicData.controls.vehicleType.setValue('2');
        //   this.basicData.get('electricVehicle').setValue('');
        //   this.basicData.get('electricVehicle').clearValidators();
        //   this.basicData.get('electricVehicle').updateValueAndValidity();
        // } else {
        //   this.basicData.controls.vehicleType.setValue('1');
        // }
      });
    } else {
      console.log('sub category empty');
    }
  }

  latLongFunction() {
    let loading = this.loadCtrl.create({
      // content: 'Please wait...'
    });
    // loading.present();
    this.getJanaCenterName(this.basicData.controls.janaCenter.value.orgscode);
    if (this._selectedCenter) {
      let _janaLatitude = this._selectedCenter.latitudebrnch;
      let _janaLongitude = this._selectedCenter.longitudebrnch;
      let posOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };
      // this.geolocation.getCurrentPosition(posOptions).then((res) => {
      //   this._latitude = res.coords.latitude;
      //   this._longitude = res.coords.latitude;
      //   this._distanceFromBrance = this.globFunc.returnDistanceFromLatLong(res.coords.latitude, res.coords.longitude, _janaLatitude, _janaLongitude);
      //   if (this._distanceFromBrance > 5) {
      //     loading.dismiss();
      //     this.alertService.showAlert("Alert!", `Jana center is Out of Boundary!`);
      //   } else {
      //     loading.dismiss();
      //   }
      // }, err => {
      //   loading.dismiss();
      //   this.alertService.showAlert("Alert!", `Check Gps Connection`)
      // })
    }
  }

  today(): string {
    let today: string = this.globalData.getToday();
    return today;
  }

  convertdate(str: string) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('-');
  }

  getJanaCenterName(value: string) {
    let selectedOrgName = this.org_master.find((f) => {
      return f.orgscode === value;
    });
    this._selectedCenter = selectedOrgName;
    return selectedOrgName.orgname;
  }

  getJanaLoanName(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    return selectedLoanName.prdDesc;
  }

  getCibilCheckedDetails() {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        if (data[0].cibilCheckStat == '1') {
          this.submitDisable = true;
        } else {
          this.submitDisable = false;
        }
      }
    });
  }

  agentChange(value) {
    if (value == 'e') {
      this.basicData
        .get('janaEmpId')
        .setValidators(
          Validators.compose([
            Validators.maxLength(12),
            Validators.pattern('[0-9]*'),
            Validators.required,
          ])
        );
      this.basicData.get('janaEmpId').updateValueAndValidity();
      this.empIdDisable = true;
    } else {
      this.basicData.get('janaEmpId').clearValidators();
      this.basicData.get('janaEmpId').setValue('');
      this.empIdDisable = false;
    }
    if (value == 'a') {
      this.basicData
        .get('janaAgentName')
        .setValidators(Validators.compose([Validators.required]));
      this.basicData.get('janaAgentName').updateValueAndValidity();
      this.agentIdDisable = true;
    } else {
      this.basicData.get('janaAgentName').clearValidators();
      this.basicData.get('janaAgentName').setValue('');
      this.agentIdDisable = false;
    }
  }

  getProductCodeValue(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdname === value;
    });
    return selectedLoanName.prdcode;
  }

  getJanaSchemeCode(value: string) {
    let selectedLoanName = this.jana_products.find((f) => {
      return f.prdSchemeId === value;
    });
    return selectedLoanName.prdSchemeCode;
  }

  getPurposeValue() {
    this.sqliteProvider.getMasterDataUsingType('PurposeOfLoan').then((data) => {
      console.log(data, 'get purpose');
      this.pur_master = data;
    });
  }

  getIndustryValue() {
    this.sqliteProvider.getMasterDataUsingType('IndustryType').then((data) => {
      this.ind_master = data;
    });
  }

  getModeofRepayment() {
    this.sqliteProvider
      .getMasterDataUsingType('ModeofRepayment')
      .then((data) => {
        this.Repayments = data;
      });
  }

  getVlTenure() {
    this.sqliteProvider.getMasterDataUsingType('VLTenure').then((data) => {
      this.vlTenure = data;
    });
  }

  getDealerMaster() {
    this.sqliteProvider
      .getDealerMasterData(localStorage.getItem('janaCenter'))
      .then((data) => {
        this.dummy_masterDealer = data;
      });
  }
  getProcessingFees() {
    this.sqliteProvider.getProcessingFees().then((data) => {
      this.processFeesData = data;
    });
  }

  getPeriodInstallments() {
    this.sqliteProvider
      .getMasterDataUsingType('PeriodicityInstalment')
      .then((data) => {
        this.installments = data;
      });
  }

  async getProductScheme() {
    await this.sqliteProvider
      .getMasterDataUsingType('ProductScheme')
      .then(async (data) => {
        if (JSON.parse(localStorage.getItem('userPrdSubCode')).length > 0) {
          await this.master
            .getProdCodeByLoginGroup(
              JSON.parse(localStorage.getItem('userPrdSubCode'))
            )
            .then(async (userPrd: any[]) => {
              this.userPrdResponse = userPrd;
              if (this.userPrdResponse.length > 0) {
                let scheme_master = data;
                for (var i = 0; i < scheme_master.length; i++) {
                  if (
                    this.userPrdResponse.some(
                      (data) => data.main === scheme_master[i].CODE
                    )
                  ) {
                    this.scheme_master.push(scheme_master[i]);
                  }
                  if (
                    i == scheme_master.length - 1 &&
                    this.getBasicData[0].prdSche
                  ) {
                    await this.getProductValue(this.getBasicData[0].prdSche);
                  }
                }
              } else {
                this.scheme_master = data;
              }
            });
        } else {
          this.scheme_master = data;
        }
      });
  }

  getsegmentType() {
    this.sqliteProvider.getMasterDataUsingType('SegmentType').then((data) => {
      this.segmentList = data;
    });
  }

  getAllJanaProducts() {
    this.sqliteProvider.getAllProductValues().then((data) => {
      this.jana_products = data;
    });
  }

  getIntRate(val) {
    let prd = this.basicData.controls.janaLoan.value;
    let intType = val[0];
    if (
      prd != '' &&
      prd != null &&
      prd != undefined &&
      intType != '' &&
      intType != null &&
      intType != undefined
    ) {
      this.sqliteProvider.getInterestRate(prd, intType).then((data) => {
        if (data.length > 0) {
          this.basicData.controls.intRate.setValue(data[0].Mclr);
        } else {
          this.basicData.controls.intRate.setValue('');
          this.basicData.controls.interest.setValue('');
          this.basicData.controls.interest.updateValueAndValidity();

          this.globalData.presentToastMiddle(
            'Interest type is not available for the selected product!!!'
          );
        }
      });
    }
  }

  vehicleTypeChng() {
    if (this.basicData.controls.vehicleType.value == '1') {
      this.isNewVehicle = true;
      this.basicData.get('electricVehicle').setValue('');
      this.basicData.get('electricVehicle').setValidators(Validators.required);
    } else {
      this.isNewVehicle = false;
      this.basicData.get('electricVehicle').setValue('');
      this.basicData.get('electricVehicle').clearValidators();
      this.basicData.get('electricVehicle').updateValueAndValidity();
    }
  }

  getGstStampDuty() {
    let stampVal = this.basicData.controls.stampDuty.value;
    if (stampVal != '' && stampVal != undefined && stampVal != null) {
      let gstVal = this.GstCharges.GstonSdcTax;
      let StampCharges = stampVal * (gstVal / 100);
      this.basicData.controls.gstonSdc.setValue(StampCharges.toFixed(2));
    } else {
      this.basicData.controls.gstonSdc.setValue('');
      this.globalData.presentToastMiddle(
        'Please Insert the Stamp Duty Charges'
      );
    }
  }

  getGstNachCharges() {
    let nachVal = this.basicData.controls.nachCharges.value;
    if (nachVal != '' && nachVal != undefined && nachVal != null) {
      let gstVal = this.GstCharges.GstonNachCharges;
      let NachCharges = nachVal * (gstVal / 100);
      this.basicData.controls.gstonNach.setValue(NachCharges.toFixed(2));
    } else {
      this.basicData.controls.gstonNach.setValue('');
      this.globalData.presentToastMiddle('Please Insert the Nach Charges');
    }
  }
  gstCallForPF() {
    let processFee = this.basicData.controls.processingFee.value;
    if (processFee != '' && processFee != undefined && processFee != null) {
      let gstVal = this.GstCharges.GstonProcessingFee;
      let processingFeeCharges = +processFee * (+gstVal / 100);
      this.basicData.controls.gstonPf.setValue(processingFeeCharges.toFixed(2));
      this.basicData.controls.gstonPf.updateValueAndValidity();
    } else {
      this.basicData.controls.gstonPf.setValue('');
      this.basicData.controls.gstonPf.updateValueAndValidity();
      this.globalData.presentToastMiddle('Please Insert the Process Fees');
    }
  }

  getGstPddCharges() {
    let pddVal = this.basicData.controls.pddCharges.value;
    if (pddVal != '' && pddVal != undefined && pddVal != null) {
      let gstVal = this.GstCharges.GstonPddCharges;
      let PddCharges = pddVal * (gstVal / 100);
      this.basicData.controls.gstonPddCharges.setValue(PddCharges.toFixed(2));
    } else {
      this.basicData.controls.gstonPddCharges.setValue('');
      this.globalData.presentToastMiddle('Please Insert the Pdd Charges');
    }
  }

  getGstOtherCharges() {
    let otherVal = this.basicData.controls.otherCharges.value;
    if (otherVal != '' && otherVal != undefined && otherVal != null) {
      let gstVal = this.GstCharges.GstonOtherCharges;
      let OtherCharges = otherVal * (gstVal / 100);
      this.basicData.controls.gstonOtherCharges.setValue(
        OtherCharges.toFixed(2)
      );
    } else {
      this.basicData.controls.gstonOtherCharges.setValue('');
      this.globalData.presentToastMiddle('Please Insert the Other Charges');
    }
  }

  productCheck() {
    if (
      this.basicData.controls.prdSche.value == '' ||
      this.basicData.controls.prdSche.value == undefined ||
      this.basicData.controls.prdSche.value == null
    ) {
      this.alertService.showAlert('Alert!', `Please select Loan Main Product!`);
    }
  }

  calcProcessFess() {
    let subProduct = this.basicData.controls.janaLoan.value;
    let loanAmt = +this.basicData.controls.loanAmount.value;
    let processFeesAmt = this.processFeesData.filter(
      (data) => data.prodId == subProduct
    );
    let proceesPercentage = loanAmt * (processFeesAmt[0].proPercentage / 100);
    if (+proceesPercentage <= +processFeesAmt[0].minProcessingFee) {
      // this.basicData.controls.processingFee.setValue(+processFeesAmt[0].minProcessingFee);
      // this.basicData.controls.processingFee.updateValueAndValidity();
    } else if (+proceesPercentage >= +processFeesAmt[0].maxProcessingFee) {
      // this.basicData.controls.processingFee.setValue(+processFeesAmt[0].maxProcessingFee);
      // this.basicData.controls.processingFee.updateValueAndValidity();
    } else {
      // this.basicData.controls.processingFee.setValue(+proceesPercentage.toFixed(2));
      // this.basicData.controls.processingFee.updateValueAndValidity();
    }
  }

  /**
   * @method signatureImg
   * @description Function use to capture Signature image of the customer.
   * @author HariHaraSuddhan S
   */

  async signatureImg(value) {
    if (value == 'sign') {
      const modal = await this.modalCtrl.create({
        component: PicproofPage,
        componentProps: {
          signpics: this.signImgs,
          submitstatus: this.submitDisable,
        },
      });
      await modal.present();
      await modal.onDidDismiss().then((response: any) => {
        this.signImgs = [];
        this.signImgs = response.data;
        this.signImglen = response.data.length;
      });
    }
  }

  checkTenureProduct() {
    try {
      if (
        parseInt(this.basicData.get('tenure').value) < this.tenureFrom ||
        parseInt(this.basicData.get('tenure').value) > this.tenureTo
      ) {
        this.basicData.get('tenure').setValue('');
        this.basicData.get('tenure').updateValueAndValidity();
        this.alertService.showAlert(
          'Alert!',
          `Please Enter Tenure period between ${this.tenureFrom} - ${this.tenureTo}`
        );
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'BasicComponent-checkTenureProduct'
      );
    }
  }
}
