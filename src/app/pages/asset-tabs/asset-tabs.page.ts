import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { ScoreCardRunPage } from '../score-card-run/score-card-run.page';
import { ScoreModalPage } from '../score-modal/score-modal.page';
import { RestService } from 'src/providers/rest.service';
import { OnRoadPriceService } from 'src/providers/on-road-price.service';
import { ORPApiStrings } from 'src/utility/AppConstants';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-asset-tabs',
  templateUrl: './asset-tabs.page.html',
  styleUrls: ['./asset-tabs.page.scss'],
})
export class AssetTabsPage implements OnInit {
  nachBName: any;
  today: any = new Date();
  todayDate: any = new Date();
  maxdate: any;
  mindate: any;
  minInsDate: any;
  maxInsDate: any;
  refId: any;
  id: any;
  userType: any;
  vehicleId: any;
  vehicleType: any = 'A';
  vehicleDetails: FormGroup;
  vehicleBrands: any[] = [];
  hospicashIns: any[] = [];
  masterPurposeofLoanVL: any = [];
  submitDisable: boolean = false;
  master_states: any[] = [];
  edu_master: any[] = [];
  emp_master: any[] = [];
  modelMaster: any = [];
  variantMaster: any = [];
  priceMaster: any = [];
  vehicleBrand: any;
  masterPromoCode: any = [];
  disableDealer: boolean = false;
  advanceEmiNo: boolean = false;
  selectOptions = {
    cssClass: 'remove-ok',
  };
  dealerNameTemp: any;
  dealerMaster = [];
  dummy_masterNominee = [];
  dummy_masterGender: any = [
    { code: 'M', name: 'Male' },
    { code: 'F', name: 'Female' },
    { code: 'O', name: 'Third Gender' },
  ];
  schemeMaster: any = [];
  vehicleAgeMaster: any = [];
  ownerList: any = [
    { code: '1', name: '1' },
    { code: '2', name: '2' },
    { code: '3', name: '3' },
    { code: '4', name: '4' },
  ];
  payment: boolean;
  yesOrNo: any = [
    { code: '1', name: 'YES' },
    { code: '2', name: 'NO' },
  ];
  yesOrNoList: any = [];
  basicData: FormGroup;
  processFeesData: any = [];
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
  getBasicData: any;
  segmentList: any = [];
  scheme_master: any = [];
  pdt_master: any;
  vehicle: any = [
    { code: '1', name: 'NEW' },
    { code: '2', name: 'USED' },
  ];
  vlTenure: any;
  productClicked: boolean = false;
  loanAmountFrom: any;
  loanAmountTo: any;
  interestFrom: any;
  interestTo: any;
  tenureFrom: any;
  tenureTo: any;
  tenure: any;
  schemeCode: any;
  moratorium: any;
  loanAmount: any;
  janaLoanName: any;
  guaFlag: any;
  installments: any;
  Repayments: any;
  isNewVehicle = false;
  ElectricType: any = [
    { code: 'Y', name: 'YES' },
    { code: 'N', name: 'NO' },
  ];
  dummyHospicCash: any = [
    { CODE: '1', NAME: '0' },
    { CODE: '2', NAME: '299' },
    { CODE: '3', NAME: '599' },
  ];
  userVal: any;
  personalData: any;
  coAppFlag: any;

  minRegDate: string;
  maxRegDate: string;
  showMand: boolean = false;

  username: any;
  savedLoanAmt: any;
  minRate: any;
  maxRate: any;
  loanAmtcheck: boolean = false;
  assetAmtcheck: boolean = false;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  pddchargeslist: any = [];
  showprocessingFee: any;
  showgstonPf: any;
  maxdateDB: string;
  downPayment: any;
  dbAmt: number;
  OrgsState: any;
  stampDutyValue = [];
  stamp: any = [];
  defaultDisable: boolean = true;
  savedEmiAmount: number = 0;
  makeApiList: any = [];
  modelApiList: any = [];
  varientApiList: any = [];
  ORPApi: boolean = true;
  brandNameApi: string;
  permCity: any;
  presentCity: any;
  obvApiListData: any = ['Excellent', 'Fair', 'Good', 'Very Good'];
  vehicleCatogeryList: any = [];
  vehicleEVList: any = ['electric-scooter', 'electric-bike'];
  vehicleNonEVList: any = ['motorcycle', 'scooter'];
  apiORPPrice: number = 0;
  obvApiList = [];
  finalAssetApi: string;
  rcDtails: any;
  rcVerify: boolean = false;
  obvEditable: boolean = false;
  RCFetchDetailsDisable: boolean = true;
  orpEmpty: boolean = true;
  yearList = [];
  schemeCodeVal: any;
  userPrdResponse: any[];
  manualORPLimit: number = 999999;
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public globalData: DataPassingProviderService,
    public sqlsupport: SquliteSupportProviderService,
    public modalCtrl: ModalController,
    public sqliteProvider: SqliteService,
    public globalFunction: GlobalService,
    public master: RestService,
    public orpApi: OnRoadPriceService,
    public network: Network,
    public alertService: CustomAlertControlService
  ) {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.userType = this.globalData.getborrowerType();
    this.yearList = this.globalData.getYearList();
    this.getPersonalInfo();
    this.getProductValueForVechile();
    this.getPermAddressInfo();
    this.getVehicleBrandMaster();
    this.getHospicashIns();
    this.getPurposeofLoanVL();
    this.getPromoCode();
    this.calcendDate();
    this.vehicleDetails = this.formBuilder.group({
      vehicleCatogery: ['', Validators.required],
      brandName: ['', Validators.required],
      model: ['', Validators.required],
      variant: ['', Validators.required],
      cc: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      rcNo: [''], //used
      engineNo: [''], //used
      chassisNo: [''], //used
      nameAsPerRC: [''], //used
      yearOfMan: [''], //used
      registrationDate: [''], //used
      vehicleAge: [''], //used
      hypothecation: [''], //used
      noofOwner: [''], //used
      kmDriven: [''], //used
      onroadPrice: [''],
      dealerQuotation: [''], //used
      obv: [''], //used
      assetPrice: [''], //used
      scheme: ['', Validators.required],
      promoCode: ['', Validators.required],
      dealerType: [''],
      dealerIFSCcode: ['', Validators.required],
      dealerBank: ['', Validators.required],
      dealerCurAcc: ['', Validators.required],
      dealerBranch: ['', Validators.required],
      dealerAddress: ['', Validators.required],
      insuranceCover: [''],
      insPolicyNo: [''],
      insCompany: [''],
      insDate: [''],
      insExpDate: [''],
      insValue: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      dealerName: ['', Validators.required],
      dealerCode: [''],
      nomName: [
        '',
        Validators.compose([
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      nomRel: ['', Validators.required],
      nomDOB: ['', Validators.required],
      nomGender: ['', Validators.required],
      apiFlag: ['N', Validators.required],
    });
    this.getVehicleType().then(() => {
      if (this.vehicleType == 'N') {
        this.vehicleDetails
          .get('onroadPrice')
          .setValidators(
            Validators.compose([
              Validators.pattern('[0-9]*'),
              Validators.required,
            ])
          );
        this.vehicleDetails.get('onroadPrice').updateValueAndValidity();

        this.vehicleDetails.get('rcNo').clearValidators();
        this.vehicleDetails.get('engineNo').clearValidators();
        this.vehicleDetails.get('chassisNo').clearValidators();
        this.vehicleDetails.get('nameAsPerRC').clearValidators();
        this.vehicleDetails.get('yearOfMan').clearValidators();
        this.vehicleDetails.get('registrationDate').clearValidators();
        this.vehicleDetails.get('vehicleAge').clearValidators();
        this.vehicleDetails.get('hypothecation').clearValidators();
        this.vehicleDetails.get('noofOwner').clearValidators();
        this.vehicleDetails.get('kmDriven').clearValidators();
        this.vehicleDetails.get('dealerQuotation').clearValidators();
        this.vehicleDetails.get('obv').clearValidators();
        this.vehicleDetails.get('assetPrice').clearValidators();
        this.basicData.get('assetAge').clearValidators();

        this.vehicleDetails.get('rcNo').updateValueAndValidity();
        this.vehicleDetails.get('engineNo').updateValueAndValidity();
        this.vehicleDetails.get('chassisNo').updateValueAndValidity();
        this.vehicleDetails.get('nameAsPerRC').updateValueAndValidity();
        this.vehicleDetails.get('yearOfMan').updateValueAndValidity();
        this.vehicleDetails.get('registrationDate').updateValueAndValidity();
        this.vehicleDetails.get('vehicleAge').updateValueAndValidity();
        this.vehicleDetails.get('hypothecation').updateValueAndValidity();
        this.vehicleDetails.get('noofOwner').updateValueAndValidity();
        this.vehicleDetails.get('kmDriven').updateValueAndValidity();
        this.vehicleDetails.get('dealerQuotation').updateValueAndValidity();
        this.vehicleDetails.get('obv').updateValueAndValidity();
        this.vehicleDetails.get('assetPrice').updateValueAndValidity();
        this.basicData.get('assetAge').clearValidators();
      } else {
        this.vehicleDetails
          .get('rcNo')
          .setValidators(
            Validators.compose([
              Validators.minLength(7),
              Validators.maxLength(11),
              Validators.pattern('[a-zA-z0-9]*'),
              Validators.required,
            ])
          );
        this.vehicleDetails
          .get('engineNo')
          .setValidators(
            Validators.compose([
              Validators.minLength(10),
              Validators.maxLength(14),
              Validators.pattern('[a-zA-z0-9]*'),
              Validators.required,
            ])
          );
        this.vehicleDetails
          .get('chassisNo')
          .setValidators(
            Validators.compose([
              Validators.minLength(10),
              Validators.maxLength(25),
              Validators.pattern('[a-zA-z0-9]*'),
              Validators.required,
            ])
          );
        this.vehicleDetails
          .get('nameAsPerRC')
          .setValidators(Validators.required);
        this.vehicleDetails
          .get('yearOfMan')
          .setValidators(
            Validators.compose([
              Validators.minLength(4),
              Validators.maxLength(4),
              Validators.pattern('[0-9]*'),
              Validators.required,
            ])
          );
        this.vehicleDetails
          .get('registrationDate')
          .setValidators(Validators.required);
        this.vehicleDetails
          .get('vehicleAge')
          .setValidators(Validators.required);
        this.vehicleDetails
          .get('hypothecation')
          .setValidators(Validators.required);
        this.vehicleDetails.get('noofOwner').setValidators(Validators.required);
        this.vehicleDetails
          .get('kmDriven')
          .setValidators(
            Validators.compose([
              Validators.pattern('[0-9]*'),
              Validators.required,
            ])
          );
        this.vehicleDetails
          .get('dealerQuotation')
          .setValidators(
            Validators.compose([
              Validators.pattern('[0-9]*'),
              Validators.required,
            ])
          );
        this.vehicleDetails.get('obv').setValidators(Validators.required);
        this.vehicleDetails
          .get('assetPrice')
          .setValidators(
            Validators.compose([
              Validators.pattern('[0-9]*'),
              Validators.required,
            ])
          );
        this.basicData.get('assetAge').setValidators(Validators.required);

        this.vehicleDetails.get('rcNo').updateValueAndValidity();
        this.vehicleDetails.get('engineNo').updateValueAndValidity();
        this.vehicleDetails.get('chassisNo').updateValueAndValidity();
        this.vehicleDetails
          .get('nameAsPerRC')
          .setValidators(Validators.required);
        this.vehicleDetails.get('yearOfMan').updateValueAndValidity();
        this.vehicleDetails.get('registrationDate').updateValueAndValidity();
        this.vehicleDetails.get('vehicleAge').updateValueAndValidity();
        this.vehicleDetails.get('hypothecation').updateValueAndValidity();
        this.vehicleDetails.get('noofOwner').updateValueAndValidity();
        this.vehicleDetails.get('kmDriven').updateValueAndValidity();
        this.vehicleDetails.get('dealerQuotation').updateValueAndValidity();
        this.vehicleDetails.get('obv').updateValueAndValidity();
        this.vehicleDetails.get('assetPrice').updateValueAndValidity();
        this.basicData.get('assetAge').updateValueAndValidity();

        this.vehicleDetails.get('onroadPrice').clearValidators();
        this.vehicleDetails.get('onroadPrice').updateValueAndValidity();
      }
    });
    if (this.route.snapshot.queryParamMap.get('fieldDisable')) {
      this.submitDisable = true;
    }
    this.getDealerMaster();
    this.getVehicleDetails();

    this.vehicleDetails
      .get('vehicleCatogery')
      .valueChanges.subscribe(async (value) => {
        this.orpAuthFetch('category');
      });
    this.vehicleDetails
      .get('brandName')
      .valueChanges.subscribe(async (value) => {
        console.log(value, 'brand');
        // this.orpAuthFetch('model');
        // this.modelMaster = await this.sqliteProvider.getModelBasedonBrand((value) ? value.optionValue : "25");
      });

    this.vehicleDetails.get('model').valueChanges.subscribe(async (value) => {
      console.log(value, 'model');
      console.log(this.modelMaster);
      // this.vehicleDetails.controls.variant.reset();
      // this.orpAuthFetch('variant');
      // this.variantMaster = await this.sqliteProvider.getVariantBasedonModel(value);
    });

    this.vehicleDetails.get('variant').valueChanges.subscribe(async (value) => {
      console.log(value, 'variant');
      console.log(this.variantMaster);
      // this.vehicleDetails.controls.onroadPrice.reset();
      // this.vehicleType == 'N' ? this.orpAuthFetch('ORP') : '';
      // this.priceMaster = await this.sqliteProvider.getPriceBasedonVariant(value);
      // let saved = await this.sqliteProvider.getVehicleDetails(this.refId, this.id);
      // console.log(saved, 'saved');
      // if (saved.length !== 0 && (saved[0].hasOwnProperty('onroadPrice') && saved[0].onroadPrice)) {
      //   console.log('onroad not empty', saved[0].variant, value);
      //   if (value && saved[0].variant != value) {
      //     console.log('saved variant != current variant', saved[0].variant, value);
      //     this.vehicleDetails.get("onroadPrice").setValue(this.priceMaster.length > 0 ? this.priceMaster[0].onRoadPrice : "");
      //     this.vehicleDetails.get("onroadPrice").updateValueAndValidity();
      //   }
      // }
      // else {
      //   this.vehicleDetails.get("onroadPrice").setValue(this.priceMaster.length > 0 ? this.priceMaster[0].onRoadPrice : "");
      //   this.vehicleDetails.get("onroadPrice").updateValueAndValidity();
      // }

      if (this.vehicleDetails.get('onroadPrice').value) {
        this.loanAmtRoadPriceCheck();
      }
    });

    // this.vehicleDetails.get("obv").valueChanges.subscribe(async value => {
    //   this.obvChange();
    // });

    this.vehicleDetails.get('dealerName').valueChanges.subscribe((value) => {
      console.log(value, 'dealer');
      if (value) {
        const dealer = this.dealerMaster.find((val) => val.dealerCode == value);
        this.vehicleDetails
          .get('dealerType')
          .setValue(dealer ? dealer.dealerType : '');
        this.vehicleDetails
          .get('dealerIFSCcode')
          .setValue(dealer ? dealer.dealerIfsc : '');
        this.vehicleDetails
          .get('dealerBank')
          .setValue(dealer ? dealer.dealerBankName : '');
        this.vehicleDetails
          .get('dealerCurAcc')
          .setValue(dealer ? dealer.dealerCurAcc : '');
        this.vehicleDetails
          .get('dealerBranch')
          .setValue(dealer ? dealer.dealerBranch : '');
        this.vehicleDetails
          .get('dealerAddress')
          .setValue(dealer ? dealer.address : '');
      }
    });
    this.getVehiclescheme();
    this.calldate();
    this.callmaxdate();
    this.getToday();
    this.getProcessingFees();
    this.getsegmentType();
    this.getProductScheme();
    this.getVlTenure();
    this.getPeriodInstallments();
    this.getModeofRepayment();
    this.getYesOrNoList();
    this.getVehicleAge();

    this.basicData = this.formBuilder.group({
      prdSche: ['', Validators.required],
      janaLoan: ['', Validators.required],
      vehicleType: ['', Validators.required],
      electricVehicle: ['', Validators.required],
      dealerName: ['', Validators.required],
      dealerCode: [''],
      loanAmount: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      tenure: ['', Validators.required],
      assetAge: [''],
      interest: ['', Validators.required],
      intRate: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      purpose: ['', Validators.required],
      installment: ['', Validators.required],
      refinance: ['', Validators.required],
      holiday: [
        '',
        Validators.compose([
          Validators.pattern('[0-9]*'),
          Validators.maxLength(2),
          Validators.required,
        ]),
      ],
      repayMode: ['', Validators.required],
      advavceInst: ['', Validators.required],
      margin: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      processingFee: ['', Validators.required],
      gstonPf: ['', Validators.required],
      stampDuty: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      gstonSdc: ['', Validators.required],
      nachCharges: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      gstonNach: ['', Validators.required],
      pddCharges: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      gstonPddCharges: ['', Validators.required],
      otherCharges: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      gstonOtherCharges: [''],
      borHealthIns: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      coBorHealthIns: ['', Validators.compose([Validators.pattern('[0-9]*')])],
      insPremium: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      preEmi: ['0', Validators.compose([Validators.pattern('[0-9]*')])],
      advanceEmi: ['', Validators.compose([Validators.required])],
      segmentType: ['', Validators.required],
      emi: [
        '',
        Validators.compose([
          Validators.pattern('^(?!0+$)[0-9]*$'),
          Validators.required,
        ]),
      ],
      emiMode: ['', Validators.required],
      totalDownPay: ['', Validators.compose([Validators.required])],
      dbAmount: ['', Validators.compose([Validators.required])],
      totalloanAmount: [''],
      dbDate: ['', Validators.required],
      preEmiDB: ['2', Validators.required],
      insLPI: ['', Validators.compose([Validators.pattern('[0-9]*')])],
    });

    this.getBasicDetails();
  }

  calldate() {
    let dd = this.today.getDate();
    let mm = this.today.getMonth() + 1; //January is 0!
    let yyyy = this.today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    let mindate = yyyy + '-' + mm + '-' + dd;
    this.mindate = mindate;
  }

  calcendDate() {
    this.maxdateDB = this.maxdateDB = moment(this.mindate)
      .add(30, 'days')
      .format('YYYY-MM-DD');
  }

  callmaxdate() {
    let dd = this.today.getDate();
    let mm = this.today.getMonth() + 1; //January is 0!
    let yyyy = this.today.getFullYear() + 20;
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    let maxdate = yyyy + '-' + mm + '-' + dd;
    this.maxdate = maxdate;
  }

  getToday() {
    let dd = this.todayDate.getDate();
    let mm = this.todayDate.getMonth() + 1; //January is 0!
    let yyyy = this.todayDate.getFullYear() - 21;
    let yyyyy = this.todayDate.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    let mindate = yyyy + '-' + mm + '-' + dd;
    let maxdate = yyyyy + '-' + mm + '-' + dd;
    this.minInsDate = mindate;
    this.maxInsDate = maxdate;
    console.log(this.minInsDate, 'mindata');
    console.log(this.maxInsDate, 'maxdata');
  }
  getVehicleBrandMaster(): void {
    this.sqliteProvider.getVehicleBrandMaster().then((data) => {
      this.vehicleBrands = data;
    });
  }

  getHospicashIns(): void {
    this.sqliteProvider.getMasterDataUsingType('HospicashIns').then((data) => {
      this.hospicashIns = data.length > 0 ? data : this.dummyHospicCash;
    });
  }

  getPurposeofLoanVL() {
    this.sqliteProvider
      .getMasterDataUsingType('PurposeOfLoanVL')
      .then((data) => {
        this.masterPurposeofLoanVL = data;
      });
  }

  scoreCardData = {
    age: '',
    assetCategory: '',
    qualification: '',
    assetCost: '',
    stateGroup: '',
    empType: '',
    residingYears: '',
    totalExp: '',
    sourcing: '',
    advance: '',
    downPayment: '',
    monthlyIncome: '',
    residenseType: '',
  };

  animationOption = {
    loop: false,
    prerender: false,
    autoplay: true,
    autoloadSegments: true,
    path: 'assets/success.json',
  };
  handleAnimation(e) {
    console.log(e, 'lottie');
  }

  async getStateValue() {
    let data = await this.sqliteProvider.getStateList();
    this.master_states = data;
  }
  async getEducationValue() {
    let data = await this.sqliteProvider.getMasterDataUsingType('Education');
    this.edu_master = data;
    console.log(this.edu_master, 'education');
  }
  async getEmploymentValue() {
    let data = await this.sqliteProvider.getMasterDataUsingType(
      'EmploymentStatus'
    );
    this.emp_master = data;
    console.log(this.emp_master, 'employment');
  }
  async getVehiclescheme() {
    let data = await this.sqliteProvider.getMasterDataUsingType(
      'Vehiclescheme'
    );
    this.schemeMaster = data;
  }
  async getRelationShip() {
    let data = await this.sqliteProvider.getMasterDataUsingType('RelationShip');
    this.dummy_masterNominee = data;
  }

  async ngOnInit() {
    // let root = this.viewCtrl.instance.navCtrl._app._appRoot;
    this.assetViewDidLoad();
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
  async assetViewDidLoad() {
    await this.getEmploymentValue();
    await this.getStateValue();
    await this.getEducationValue();
    await this.getRelationShip();
    this.globalFunction.publishPageNavigation({
      title: 'Vehicle Details',
      component: AssetTabsPage,
    });
    let data = await this.sqliteProvider.getAllDetails('online', '8855JFS');
    console.log(data, 'all details');
    let index = data.findIndex(
      (val) => val.refId == this.refId && val.id == this.id
    );
    console.log(data[index], 'by ref and id');
    let vehAddData = await this.sqliteProvider.getVehicleAndAddress(
      this.refId,
      this.id
    );
    console.log(vehAddData, 'vehicle and add');
  }

  getPersonalInfo() {
    this.sqlsupport
      .getPrimaryApplicantName(this.refId, this.id)
      .then((data) => {
        this.personalData = data;
        this.coAppFlag = data[0].coAppFlag;
        console.log('this.coAppFlag', this.coAppFlag);
      });
  }
  getProductValueForVechile() {
    this.sqliteProvider.getAllProductList().then((data) => {
      this.pdt_master = data;
    });
  }

  getJanaProductCode(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    this.schemeCodeVal = selectedLoanName.prdSchemeCode;
    this.schemeCodeVal == '997'
      ? (this.vehicleCatogeryList = this.vehicleEVList)
      : (this.vehicleCatogeryList = this.vehicleNonEVList);
  }

  getPermAddressInfo() {
    this.sqliteProvider
      .getPresentAddress(this.refId, this.id)
      .then(async (data) => {
        let presAddressData = data;
        let pres = this.globalFunction.basicDec(presAddressData[0].pres_states);
        await this.sqliteProvider.getSelectedCity(pres).then((data) => {
          let presCity = data;
          this.presentCity = presCity.filter(
            (data) =>
              data.cityCode ==
              this.globalFunction.basicDec(presAddressData[0].pres_cities)
          );
        });
      });
  }

  async scoreCardModal() {
    // console.log(this.scoreCardData, 'score data');
    // let modal = this.modalCtrl.create(ScoreModalPage, this.scoreCardData, { showBackdrop: true, enableBackdropDismiss: false });
    // modal.onDidDismiss(data => {
    //   console.log(data, 'scoreModal ondismiss data');
    //   if (data.hasOwnProperty('downPayment')) {
    //     let modal1 = this.modalCtrl.create(ScoreCardRunPage, data, { showBackdrop: true, enableBackdropDismiss: false });
    //     modal1.present();
    //     modal1.onDidDismiss(data => { console.log(data, 'scorecardrun ondismiss data'); })
    //   } else {
    //     this.alertService.showAlert('Alert!', 'No Data')
    //   }
    // });
    // modal.present();
    const modal = await this.modalCtrl.create({
      component: ScoreModalPage,
      componentProps: {
        scoreCardData: this.scoreCardData,
      },
      showBackdrop: true,
      backdropDismiss: false,
    });
    await modal.onDidDismiss().then(async (modalData) => {
      if (modalData.hasOwnProperty('downPayment')) {
        const modal2 = await this.modalCtrl.create({
          component: ScoreCardRunPage,
          componentProps: {
            scoreData: modalData,
          },
          showBackdrop: true,
          backdropDismiss: false,
        });
        await modal2.present();
        modal2.onDidDismiss().then((data) => {
          console.log(data, 'scorecardrun ondismiss data');
        });
      } else {
        this.alertService.showAlert('Alert!', 'No Data');
      }
    });
    await modal.present();
  }

  getProcessingFees() {
    this.sqliteProvider.getProcessingFees().then((data) => {
      this.processFeesData = data;
    });
  }

  proceedNextPage() {
    this.alertService
      .proccedOk('Alert', 'Proceed to Reference page')
      .then((data) => {
        if (data == 'yes') {
          this.globalData.setborrowerType(this.userType);
          this.globalData.setrefId(this.refId);
          this.globalData.setId(this.id);
          this.router.navigate(['/ReferenceDetailsPage'], {
            skipLocationChange: true,
            replaceUrl: true,
          });
        }
      });
  }

  vehicleDetailsSave(value) {
    console.log(value, 'vehicle details submit');
    this.globalData.globalLodingPresent('Please wait...');
    this.loanAmount = parseInt(this.basicData.get('loanAmount').value);
    let assetAgeValue = this.basicData.get('assetAge').value;
    if (this.basicData.value.janaLoan.length == 1) {
      this.basicData.value.janaLoan = this.basicData.value.janaLoan[0];
      this.janaLoanName = this.getJanaLoanName(this.basicData.value.janaLoan);
    } else {
      this.janaLoanName = this.getJanaLoanName(this.basicData.value.janaLoan);
    }
    let tenure = this.basicData.get('tenure').value;
    let tenureval = this.vlTenure.filter((data) => data.CODE == tenure);
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
    } else if (
      +tenureval[0].NAME < this.tenureFrom ||
      +tenureval[0].NAME > this.tenureTo
    ) {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        `Please Select Tenure period between ${this.tenureFrom} - ${this.tenureTo}`
      );
    } else if (
      parseInt(this.basicData.get('holiday').value) > this.moratorium
    ) {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        `Holiday period should not be more than ${this.moratorium} months!`
      );
    } else {
      this.basicData.controls.dealerCode.value == ''
        ? this.basicData.controls.dealerName.value
        : this.basicData.controls.dealerCode.value;
      this.sqlsupport
        .updateCibilBasicDetails(
          this.refId,
          this.basicData.value,
          this.loanAmountFrom,
          this.loanAmountTo,
          this.userType,
          this.id
        )
        .then((data) => {
          this.globalData.globalLodingDismiss();
        })
        .catch((Error) => {
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'Failed!');
        });

      if (this.vehicleId) {
        this.sqliteProvider
          .updateVehicleDetails(
            this.refId,
            this.id,
            this.vehicleId,
            value,
            assetAgeValue
          )
          .then((data) => {
            console.log(data, 'update vehicle details');
            this.globalData.globalLodingDismiss();
            this.alertService
              .showAlert('Alert!', 'Vehicle Details Updated Successfully')
              .then((data) => {
                this.proceedNextPage();
              });
          });
      } else {
        this.sqliteProvider
          .addVehicleDetails(this.refId, this.id, value, assetAgeValue)
          .then((data) => {
            this.vehicleId = data['insertId'];
            this.globalData.globalLodingDismiss();
            this.alertService
              .showAlert('Alert!', 'Vehicle Details Added Successfully')
              .then((data) => {
                this.proceedNextPage();
              });
          })
          .catch((err) => err);
      }
    }
  }

  getDealerMaster() {
    this.sqliteProvider
      .getDealerMasterData(localStorage.getItem('janaCenter'))
      .then((data) => {
        this.dealerMaster = data;
      });
  }

  async setDealerValue(dealerCode: any, findName?: string) {
    const dealer = await this.dealerMaster.find(
      (val) => val.dealerCode == dealerCode
    );
    if (dealer) {
      if (findName == 'Y') {
        if (
          dealer.dealerName
            .toLowerCase()
            .includes('beepKart pvt ltd'.toLowerCase()) ||
          dealer.dealerName
            .toLowerCase()
            .includes('drivex mobility private limited'.toLowerCase())
        ) {
          return false;
        } else {
          return true;
        }
      } else {
        this.vehicleDetails.get('dealerName').setValue(dealer.dealerCode);
        this.vehicleDetails.get('dealerName').updateValueAndValidity();
      }
    }
  }

  async getVehicleDetails() {
    this.sqliteProvider
      .getBasicDetails(this.refId, this.id)
      .then(async (data) => {
        console.log(data, 'basic details');
        let dealerName = this.dealerMaster.find(
          (val) => val.dealerCode == data[0].dealerName
        );
        this.vehicleDetails
          .get('dealerName')
          .setValue(dealerName.dealerCode || '');
        this.obvEditable = await this.setDealerValue(
          dealerName.dealerCode,
          'Y'
        );
      })
      .catch((err) => err);

    this.sqliteProvider
      .getVehicleDetails(this.refId, this.id)
      .then(async (data) => {
        console.log(data, 'getvehicle details');
        if (data.length > 0) {
          this.refId = data[0].refId;
          this.id = data[0].id;
          this.vehicleId = data[0].vehicleId;
          this.apiORPPrice = data[0].onroadPrice;
          if (this.vehicleType == 'N') {
            this.vehicleDetails
              .get('vehicleCatogery')
              .setValue(data[0].vehicleCatogery);
            this.vehicleDetails.get('brandName').setValue(data[0].brandName);
            this.vehicleDetails.get('model').setValue(data[0].model);
            this.vehicleDetails.get('variant').setValue(data[0].variant);
            this.vehicleDetails.get('cc').setValue(data[0].cc);
            this.vehicleDetails
              .get('onroadPrice')
              .setValue(data[0].onroadPrice);
            this.vehicleDetails.get('dealerType').setValue(data[0].dealerType);
            this.vehicleDetails
              .get('dealerIFSCcode')
              .setValue(data[0].dealerIFSCcode);
            this.vehicleDetails.get('dealerBank').setValue(data[0].dealerBank);
            this.vehicleDetails
              .get('dealerCurAcc')
              .setValue(data[0].dealerCurAcc);
            this.vehicleDetails
              .get('dealerBranch')
              .setValue(data[0].dealerBranch);
            this.vehicleDetails
              .get('dealerAddress')
              .setValue(data[0].dealerAddress);
            this.vehicleDetails
              .get('insuranceCover')
              .setValue(data[0].insuranceCover);
            this.vehicleDetails
              .get('insPolicyNo')
              .setValue(data[0].insPolicyNo);
            this.vehicleDetails.get('insCompany').setValue(data[0].insCompany);
            this.vehicleDetails.get('insDate').setValue(data[0].insDate);
            this.vehicleDetails.get('insExpDate').setValue(data[0].insExpDate);
            this.vehicleDetails.get('insValue').setValue(data[0].insValue);
            this.vehicleDetails.get('scheme').setValue(data[0].scheme);
            this.vehicleDetails.get('promoCode').setValue(data[0].promoCode);
            this.vehicleDetails.get('nomName').setValue(data[0].nomName);
            this.vehicleDetails.get('nomRel').setValue(data[0].nomRel);
            this.vehicleDetails.get('nomDOB').setValue(data[0].nomDOB);
            this.vehicleDetails.get('nomGender').setValue(data[0].nomGender);
          } else {
            this.vehicleDetails
              .get('vehicleCatogery')
              .setValue(data[0].vehicleCatogery);
            this.vehicleDetails.get('brandName').setValue(data[0].brandName);
            this.vehicleDetails.get('model').setValue(data[0].model);
            this.vehicleDetails.get('cc').setValue(data[0].cc);
            this.vehicleDetails.get('rcNo').setValue(data[0].rcNo);
            this.vehicleDetails.get('engineNo').setValue(data[0].engineNo);
            this.vehicleDetails.get('chassisNo').setValue(data[0].chassisNo);
            this.vehicleDetails
              .get('nameAsPerRC')
              .setValue(data[0].nameAsPerRC);
            this.vehicleDetails.get('yearOfMan').setValue(data[0].yearOfMan);
            // this.orpAuthFetch('variant', data[0].yearOfMan)
            this.vehicleDetails.get('variant').setValue(data[0].variant);
            this.vehicleDetails
              .get('registrationDate')
              .setValue(data[0].registrationDate);
            this.vehicleDetails.get('vehicleAge').setValue(data[0].vehicleAge);
            this.vehicleDetails
              .get('hypothecation')
              .setValue(data[0].hypothecation);
            this.vehicleDetails.get('noofOwner').setValue(data[0].noofOwner);
            this.vehicleDetails.get('kmDriven').setValue(data[0].kmDriven);
            this.vehicleDetails
              .get('dealerQuotation')
              .setValue(data[0].dealerQuotation);
            this.vehicleDetails.get('obv').setValue(data[0].obv);
            this.vehicleDetails.get('assetPrice').setValue(data[0].assetPrice);
            this.vehicleDetails.get('onroadPrice').setValue(data[0].assetPrice);
            this.vehicleDetails.get('dealerType').setValue(data[0].dealerType);
            this.vehicleDetails
              .get('dealerIFSCcode')
              .setValue(data[0].dealerIFSCcode);
            this.vehicleDetails.get('dealerBank').setValue(data[0].dealerBank);
            this.vehicleDetails
              .get('dealerBranch')
              .setValue(data[0].dealerBranch);
            this.vehicleDetails
              .get('dealerAddress')
              .setValue(data[0].dealerAddress);
            this.vehicleDetails
              .get('insuranceCover')
              .setValue(data[0].insuranceCover);
            this.vehicleDetails
              .get('insPolicyNo')
              .setValue(data[0].insPolicyNo);
            this.vehicleDetails.get('insCompany').setValue(data[0].insCompany);
            this.vehicleDetails.get('insDate').setValue(data[0].insDate);
            this.vehicleDetails.get('insExpDate').setValue(data[0].insExpDate);
            this.vehicleDetails.get('insValue').setValue(data[0].insValue);
            this.vehicleDetails.get('scheme').setValue(data[0].scheme);
            this.vehicleDetails.get('promoCode').setValue(data[0].promoCode);
            this.vehicleDetails.get('nomName').setValue(data[0].nomName);
            this.vehicleDetails.get('nomRel').setValue(data[0].nomRel);
            this.vehicleDetails.get('nomDOB').setValue(data[0].nomDOB);
            this.vehicleDetails.get('nomGender').setValue(data[0].nomGender);
          }
        }
      })
      .catch((err) => err);
  }
  onSearch() {
    this.globalFunction.globalLodingPresent('Please wait...');
    setTimeout(() => {
      this.globalFunction.globalLodingDismiss();
    }, 3000);
  }

  async getVehicleType() {
    let data = await this.sqliteProvider.getBasicDetails(this.refId, this.id);
    if (data.length > 0) {
      this.vehicleType = data[0].vehicleType == 1 ? 'N' : 'U';
      this.getJanaProductCode(data[0].janaLoan);
    }
  }

  // onBrandChange(event) {
  //   console.log(event, "event");
  //   let makeId = event.value ? event.value.optionValue : event;
  //   this.sqliteProvider.getModelBasedonBrand(makeId).then(data => {
  //     this.modelMaster = data;
  //   })
  // }

  toUpperCase(frmGrpName, ctrlName) {
    this[frmGrpName].controls[ctrlName].setValue(
      this[frmGrpName].controls[ctrlName].value.toUpperCase()
    );
  }

  cashPayment() {
    if (
      +this.vehicleDetails.controls.onroadPrice.value <=
      +this.vehicleDetails.controls.downpayment.value
    ) {
      this.alertService.showAlert(
        'Alert!',
        'The Down Payment should be less than On Road Price/Vehicle cost'
      );
      this.vehicleDetails.controls.downpayment.setValue('');
    }
  }

  getPromoCode() {
    this.sqliteProvider.getMasterDataUsingType('PromoCode').then((data) => {
      this.masterPromoCode = data;
    });
  }

  async getBasicDetails() {
    try {
      this.globalData.globalLodingPresent('Fetching Data...!');
      this.sqliteProvider
        .getBasicDetails(this.refId, this.id)
        .then(async (data) => {
          this.getBasicData = data;

          if (this.getBasicData.length > 0) {
            if (this.getBasicData[0].vehicleType == '1') {
              this.isNewVehicle = true;
              this.basicData
                .get('electricVehicle')
                .setValidators(Validators.required);
              this.basicData.get('electricVehicle').updateValueAndValidity();
            } else {
              this.isNewVehicle = false;
              this.basicData.get('electricVehicle').clearValidators();
              this.basicData.get('electricVehicle').updateValueAndValidity();
            }
            this.savedLoanAmt = +this.getBasicData[0].loanAmount;
            await this.getProductValue(this.getBasicData[0].prdSche);
            this.basicData.controls.prdSche.setValue(
              this.getBasicData[0].prdSche || ''
            );
            this.basicData.controls.janaLoan.setValue(
              this.getBasicData[0].janaLoan || ''
            );
            await this.getPddCharges(this.basicData.controls.janaLoan.value);
            this.basicData.controls.loanAmount.setValue(
              this.getBasicData[0].loanAmount || ''
            );
            this.basicData.controls.dealerName.setValue(
              this.getBasicData[0].dealerName || ''
            );
            this.basicData.controls.tenure.setValue(
              this.getBasicData[0].tenure || ''
            );
            this.basicData.controls.assetAge.setValue(
              this.getBasicData[0].assetAge || ''
            );
            this.basicData.controls.interest.setValue(
              this.getBasicData[0].interest || ''
            );
            this.basicData.controls.intRate.setValue(
              this.getBasicData[0].intRate || ''
            );
            this.basicData.controls.purpose.setValue(
              this.getBasicData[0].purpose || ''
            );
            this.basicData.controls.installment.setValue('2');
            this.basicData.controls.refinance.setValue('2');
            this.basicData.controls.holiday.setValue(0);
            this.basicData.controls.repayMode.setValue(
              this.getBasicData[0].repayMode || ''
            );
            this.basicData.controls.advavceInst.setValue(
              this.getBasicData[0].advavceInst || ''
            );
            this.basicData.controls.vehicleType.setValue(
              this.getBasicData[0].vehicleType || ''
            );
            this.basicData.controls.electricVehicle.setValue(
              this.getBasicData[0].electricVehicle || ''
            );
            this.basicData.controls.margin.setValue(
              this.getBasicData[0].margin || ''
            );
            this.basicData.controls.stampDuty.setValue(
              this.getBasicData[0].stampDuty || ''
            );
            this.basicData.controls.gstonSdc.setValue(
              this.getBasicData[0].gstonSdc || ''
            );
            this.basicData.controls.nachCharges.setValue(
              this.getBasicData[0].nachCharges || ''
            );
            this.basicData.controls.gstonNach.setValue(
              this.getBasicData[0].gstonNach || ''
            );
            this.basicData.controls.pddCharges.setValue(
              this.getBasicData[0].pddCharges || ''
            );
            this.basicData.controls.gstonPddCharges.setValue(
              this.getBasicData[0].gstonPddCharges || ''
            );
            this.basicData.controls.otherCharges.setValue(
              this.getBasicData[0].otherCharges || ''
            );
            this.basicData.controls.gstonOtherCharges.setValue(0);
            this.basicData.controls.borHealthIns.setValue(
              this.getBasicData[0].borHealthIns || ''
            );
            this.basicData.controls.coBorHealthIns.setValue(
              this.getBasicData[0].coBorHealthIns || ''
            );
            this.basicData.controls.insPremium.setValue(
              this.getBasicData[0].insPremium || ''
            );
            this.basicData.controls.preEmi.setValue(0);
            this.basicData.controls.advanceEmi.setValue(
              this.getBasicData[0].advanceEmi || ''
            );
            this.basicData.controls.segmentType.setValue(
              this.getBasicData[0].segmentType || ''
            );
            this.basicData.controls.emi.setValue(
              this.getBasicData[0].emi || ''
            );
            this.basicData.controls.emiMode.setValue(
              this.getBasicData[0].emiMode || ''
            );
            this.basicData.controls.totalDownPay.setValue(
              this.getBasicData[0].totalDownPay || ''
            );
            this.basicData.controls.dbAmount.setValue(
              this.getBasicData[0].dbAmount || ''
            );
            this.basicData.controls.dbDate.setValue(
              this.getBasicData[0].dbDate || ''
            );
            this.basicData.controls.preEmiDB.setValue(
              this.getBasicData[0].preEmiDB
                ? this.getBasicData[0].preEmiDB
                : '2'
            );
            this.basicData.controls.totalloanAmount.setValue(
              this.getBasicData[0].totalloanAmount || ''
            );
            this.getPddCharges(this.basicData.controls.janaLoan.value).then(
              async (data) => {
                await this.pddChargesCalc();
                await this.calcProcessFess();
                await this.gstCallForPF();
                await this.getGstPddCharges();
                await this.stampdutyCharges();
              }
            );
          }
          this.globalData.globalLodingDismiss();
        })
        .catch((Error) => {
          console.log(Error);
          this.globalData.globalLodingDismiss();
        });
    } catch (error) {
      console.log(error, 'getBasicDetails');
    }
  }

  getsegmentType() {
    this.sqliteProvider.getMasterDataUsingType('SegmentType').then((data) => {
      this.segmentList = data;
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

  getVlTenure() {
    this.sqliteProvider.getMasterDataUsingType('VLTenure').then((data) => {
      this.vlTenure = data.sort((a, b) => a.NAME - b.NAME);
    });
  }

  async getProductValue(value) {
    await this.sqliteProvider
      .getOrganisationState(localStorage.getItem('janaCenter'))
      .then((orgCode) => {
        if (orgCode.length > 0) {
          this.OrgsState = orgCode[0].OrgState;
          if (value) {
            if (this.userPrdResponse && this.userPrdResponse.length > 0) {
              let sepcSubCode = this.userPrdResponse.filter(
                (data) => data.main == value
              );
              if (sepcSubCode && sepcSubCode.length > 0) {
                this.pdt_master = [];
                sepcSubCode.forEach(async (subCode) => {
                  await this.sqlsupport
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
                this.sqlsupport
                  .getProductBasedOnScheme(orgCode[0].OrgID, value)
                  .then((data) => {
                    console.log('data product', data);
                    this.pdt_master = [];
                    this.pdt_master = data;
                    this.productChange(undefined);
                  });
              }
            } else {
              this.sqlsupport
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

  getGstStampDuty() {
    let stampVal = this.basicData.controls.stampDuty.value;
    if (stampVal != '' && stampVal != undefined && stampVal != null) {
      let gstVal = this.GstCharges.GstonSdcTax;
      let StampCharges = stampVal * (gstVal / 100);

      let charges;
      let chargesFormatValue = StampCharges.toString().split('.');
      if (chargesFormatValue[1] <= '49') {
        charges = Math.floor(StampCharges);
      } else {
        charges = Math.ceil(StampCharges);
      }
      this.basicData.controls.gstonSdc.setValue(charges);
      this.basicData.controls.gstonSdc.updateValueAndValidity();
    } else {
      if (stampVal == 0) {
        this.basicData.controls.gstonSdc.setValue('0');
      } else {
        this.basicData.controls.gstonSdc.setValue('');
        this.globalData.presentToastMiddle(
          'Please Insert the Stamp Duty Charges'
        );
      }
    }
  }

  getGstNachCharges() {
    let nachVal = this.basicData.controls.nachCharges.value;
    if (nachVal != '' && nachVal != undefined && nachVal != null) {
      let gstVal = this.GstCharges.GstonNachCharges;
      let NachCharges = nachVal * (gstVal / 100);

      let charges;
      let chargesFormatValue = NachCharges.toString().split('.');
      if (chargesFormatValue[1] <= '49') {
        charges = Math.floor(NachCharges);
      } else {
        charges = Math.ceil(NachCharges);
      }
      this.basicData.controls.gstonNach.setValue(charges);
      this.basicData.controls.gstonNach.updateValueAndValidity();
    } else {
      if (nachVal == 0) {
        this.basicData.controls.gstonNach.setValue('0');
      } else {
        this.basicData.controls.gstonNach.setValue('');
        this.globalData.presentToastMiddle('Please Insert the Nach Charges');
      }
    }
  }
  gstCallForPF() {
    let processFee = this.basicData.controls.processingFee.value;
    if (processFee != '' && processFee != undefined && processFee != null) {
      let gstVal = this.GstCharges.GstonProcessingFee;
      let processingFeeCharges = +processFee * (+gstVal / 100);

      let charges;
      let chargesFormatValue = processingFeeCharges.toString().split('.');
      if (chargesFormatValue[1] <= '49') {
        charges = Math.floor(processingFeeCharges);
      } else {
        charges = Math.ceil(processingFeeCharges);
      }
      this.showgstonPf = charges;
      // this.showgstonPf = +(processingFeeCharges.toString().split(".")[0])
      // this.basicData.controls.gstonPf.setValue(processingFeeCharges.toFixed(2));
      this.basicData.controls.gstonPf.setValue(charges);
      this.basicData.controls.gstonPf.updateValueAndValidity();
    } else {
      if (processFee == 0) {
        this.basicData.controls.gstonPf.setValue('0');
        this.basicData.controls.gstonPf.updateValueAndValidity();
        this.showgstonPf = 0;
      } else {
        this.basicData.controls.gstonPf.setValue('');
        this.basicData.controls.gstonPf.updateValueAndValidity();
      }
    }
  }

  getGstPddCharges() {
    let pddVal = this.basicData.controls.pddCharges.value;
    if (pddVal != '' && pddVal != undefined && pddVal != null) {
      let gstVal = this.GstCharges.GstonPddCharges;
      let PddCharges = pddVal * (gstVal / 100);

      let charges;
      let chargesFormatValue = PddCharges.toString().split('.');
      if (chargesFormatValue[1] <= '49') {
        charges = Math.floor(PddCharges);
      } else {
        charges = Math.ceil(PddCharges);
      }
      this.basicData.controls.gstonPddCharges.setValue(charges);
      this.basicData.controls.gstonPddCharges.updateValueAndValidity();
    } else {
      if (pddVal == 0) {
        this.basicData.controls.gstonPddCharges.setValue('0');
      } else {
        this.basicData.controls.gstonPddCharges.setValue('');
      }
    }
  }

  getGstOtherCharges() {
    let otherVal = this.basicData.controls.otherCharges.value;
    if (otherVal != '' && otherVal != undefined && otherVal != null) {
      let gstVal = this.GstCharges.GstonOtherCharges;
      let OtherCharges = otherVal * (gstVal / 100);
      let charges;
      let chargesFormatValue = OtherCharges.toString().split('.');
      if (chargesFormatValue[1] <= '49') {
        charges = Math.floor(OtherCharges);
      } else {
        charges = Math.ceil(OtherCharges);
      }
      this.basicData.controls.gstonOtherCharges.setValue(0);
      this.basicData.controls.gstonOtherCharges.updateValueAndValidity();
    } else {
      if (otherVal == 0) {
        this.basicData.controls.gstonOtherCharges.setValue('0');
      } else {
        this.basicData.controls.gstonOtherCharges.setValue('');
        this.globalData.presentToastMiddle('Please Insert the Other Charges');
      }
    }
  }

  calcProcessFess() {
    let subProduct = this.basicData.controls.janaLoan.value;
    let loanAmt = +this.basicData.controls.loanAmount.value;
    if (loanAmt) {
      let processAmtCheck = this.basicData.controls.processingFee.value;
      if (this.productClicked) {
        processAmtCheck = '';
      }
      if (!processAmtCheck || loanAmt != this.savedLoanAmt) {
        let processFeesAmt = this.processFeesData.filter(
          (data) => data.prodId == subProduct
        );
        if (processFeesAmt.length > 0) {
          let proceesPercentage =
            loanAmt * (processFeesAmt[0].proPercentage / 100);
          if (+proceesPercentage <= +processFeesAmt[0].minProcessingFee) {
            let charges;
            let chargesFormatValue = processFeesAmt[0].minProcessingFee
              .toString()
              .split('.');
            if (chargesFormatValue[1] <= '49') {
              charges = Math.floor(+processFeesAmt[0].minProcessingFee);
            } else {
              charges = Math.ceil(+processFeesAmt[0].minProcessingFee);
            }
            this.showprocessingFee = charges;
            // this.showprocessingFee = +(processFeesAmt[0].minProcessingFee.toString().split(".")[0]);
            this.basicData.controls.processingFee.setValue(
              +processFeesAmt[0].minProcessingFee
            );
            this.basicData.controls.processingFee.updateValueAndValidity();
          } else if (
            +proceesPercentage >= +processFeesAmt[0].maxProcessingFee
          ) {
            let charges;
            let chargesFormatValue = processFeesAmt[0].maxProcessingFee
              .toString()
              .split('.');
            if (chargesFormatValue[1] <= '49') {
              charges = Math.floor(+processFeesAmt[0].maxProcessingFee);
            } else {
              charges = Math.ceil(+processFeesAmt[0].maxProcessingFee);
            }
            this.showprocessingFee = charges;
            // this.showprocessingFee = +(processFeesAmt[0].maxProcessingFee.toString().split(".")[0]);
            this.basicData.controls.processingFee.setValue(
              +processFeesAmt[0].maxProcessingFee
            );
            this.basicData.controls.processingFee.updateValueAndValidity();
            // let charges;
            // let chargesFormatValue = processFeesAmt[0].maxProcessingFee.toString().split(".");
            // if (chargesFormatValue[1] <= "49") {
            //   charges = Math.floor(+processFeesAmt[0].maxProcessingFee);
            // } else {
            //   charges = Math.ceil(+processFeesAmt[0].maxProcessingFee);
            // }
            // this.basicData.controls.processingFee.setValue(charges);
            // this.basicData.controls.processingFee.updateValueAndValidity();
          } else {
            let charges;
            let chargesFormatValue = proceesPercentage.toString().split('.');
            if (chargesFormatValue[1] <= '49') {
              charges = Math.floor(+proceesPercentage);
            } else {
              charges = Math.ceil(+proceesPercentage);
            }
            this.showprocessingFee = charges;
            // this.showprocessingFee = +(proceesPercentage.toString().split(".")[0]);
            this.basicData.controls.processingFee.setValue(
              +proceesPercentage.toFixed(2)
            );
            this.basicData.controls.processingFee.updateValueAndValidity();
            // let charges;
            // let chargesFormatValue = proceesPercentage.toString().split(".");
            // if (chargesFormatValue[1] <= "49") {
            //   charges = Math.floor(+proceesPercentage);
            // } else {
            //   charges = Math.ceil(+proceesPercentage);
            // }
            // this.basicData.controls.processingFee.setValue(charges);
            // this.basicData.controls.processingFee.updateValueAndValidity();
          }
          this.savedLoanAmt = loanAmt;
        } else {
          this.globalData.presentToastMiddle(
            'Processing fees values not configured!'
          );
        }
      }
      this.loanAmtRoadPriceCheck();
      this.preEmiCalculation();
    }
  }

  schemeChng(event, type) {
    if (type == 'chng') {
      this.basicData.controls.janaLoan.setValue('');
      this.basicData.controls.janaLoan.updateValueAndValidity();
      this.basicData.controls.vehicleType.setValue('');
      this.basicData.controls.vehicleType.updateValueAndValidity();
      this.basicData.controls.electricVehicle.setValue('');
      this.basicData.controls.electricVehicle.updateValueAndValidity();
      this.basicData.controls.dealerName.setValue('');
      this.basicData.controls.dealerName.updateValueAndValidity();
      this.basicData.controls.loanAmount.setValue('');
      this.basicData.controls.loanAmount.updateValueAndValidity();
      this.basicData.controls.tenure.setValue('');
      this.basicData.controls.tenure.updateValueAndValidity();
      this.basicData.controls.assetAge.setValue('');
      this.basicData.controls.assetAge.updateValueAndValidity();
      this.basicData.controls.interest.setValue('');
      this.basicData.controls.interest.updateValueAndValidity();
      this.basicData.controls.intRate.setValue('');
      this.basicData.controls.intRate.updateValueAndValidity();
      this.basicData.controls.purpose.setValue('');
      this.basicData.controls.purpose.updateValueAndValidity();
      this.basicData.controls.installment.setValue('');
      this.basicData.controls.installment.updateValueAndValidity();
      this.basicData.controls.refinance.setValue('');
      this.basicData.controls.refinance.updateValueAndValidity();
      this.basicData.controls.holiday.setValue('');
      this.basicData.controls.holiday.updateValueAndValidity();
      this.basicData.controls.repayMode.setValue('');
      this.basicData.controls.repayMode.updateValueAndValidity();
      this.basicData.controls.advavceInst.setValue('');
      this.basicData.controls.advavceInst.updateValueAndValidity();
      this.basicData.controls.margin.setValue('');
      this.basicData.controls.margin.updateValueAndValidity();
      this.basicData.controls.processingFee.setValue('');
      this.basicData.controls.processingFee.updateValueAndValidity();
      this.basicData.controls.gstonPf.setValue('');
      this.basicData.controls.gstonPf.updateValueAndValidity();
      this.basicData.controls.stampDuty.setValue('');
      this.basicData.controls.stampDuty.updateValueAndValidity();
      this.basicData.controls.gstonSdc.setValue('');
      this.basicData.controls.gstonSdc.updateValueAndValidity();
      this.basicData.controls.nachCharges.setValue('');
      this.basicData.controls.nachCharges.updateValueAndValidity();
      this.basicData.controls.gstonNach.setValue('');
      this.basicData.controls.gstonNach.updateValueAndValidity();
      this.basicData.controls.pddCharges.setValue('');
      this.basicData.controls.pddCharges.updateValueAndValidity();
      this.basicData.controls.gstonPddCharges.setValue('');
      this.basicData.controls.gstonPddCharges.updateValueAndValidity();
      this.basicData.controls.otherCharges.setValue('');
      this.basicData.controls.otherCharges.updateValueAndValidity();
      this.basicData.controls.gstonOtherCharges.setValue('');
      this.basicData.controls.gstonOtherCharges.updateValueAndValidity();
      this.basicData.controls.borHealthIns.setValue('');
      this.basicData.controls.borHealthIns.updateValueAndValidity();
      this.basicData.controls.coBorHealthIns.setValue('');
      this.basicData.controls.coBorHealthIns.updateValueAndValidity();
      this.basicData.controls.insPremium.setValue('');
      this.basicData.controls.insPremium.updateValueAndValidity();
      this.basicData.controls.preEmi.setValue(0);
      this.basicData.controls.preEmi.updateValueAndValidity();
      this.basicData.controls.advanceEmi.setValue('');
      this.basicData.controls.advanceEmi.updateValueAndValidity();
      this.basicData.controls.segmentType.setValue('');
      this.basicData.controls.segmentType.updateValueAndValidity();
      this.basicData.controls.emi.setValue('');
      this.basicData.controls.emi.updateValueAndValidity();
      this.basicData.controls.emiMode.setValue('');
      this.basicData.controls.emiMode.updateValueAndValidity();
      this.basicData.controls.totalDownPay.setValue('');
      this.basicData.controls.totalDownPay.updateValueAndValidity();
      this.basicData.controls.dbAmount.setValue('');
      this.basicData.controls.dbAmount.updateValueAndValidity();
    }
    this.getProductValue(event.detail.value);
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

  productChange(change) {
    if (change == 'prdChange') {
      this.productClicked = true;
    }
    if (this.pdt_master.length > 0) {
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
          // this.coAppFlag = "N";//element.prdCoappFlag;
          this.guaFlag = 'N'; //element.prdGuaFlag;
          // localStorage.setItem('product', this.basicData.controls.janaLoan.value);
          // this.events.publish("product", "product", 'value');
          // this.getIntRate(this.basicData.controls.interest.value);
          this.getPddCharges(this.basicData.controls.janaLoan.value);
        }
        if (element.prdSchemeCode == '1060') {
          this.basicData.controls.vehicleType.setValue('2');
          this.basicData.get('electricVehicle').setValue('');
          this.basicData.get('electricVehicle').clearValidators();
          this.basicData.get('electricVehicle').updateValueAndValidity();
        } else {
          this.basicData.controls.vehicleType.setValue('1');
        }
      });
    }
  }

  getIntRate(ev) {
    let val = ev.detail ? ev.detail.value : ev;
    let prd = this.basicData.controls.janaLoan.value;
    if (val != '' && val != null && val != undefined) {
      let intType = val[0];
      if (
        prd != '' &&
        prd != null &&
        prd != undefined &&
        intType != '' &&
        intType != null &&
        intType != undefined
      ) {
        this.sqliteProvider.getInterestRate(prd, intType).then(async (data) => {
          let saved = await this.sqliteProvider.getBasicDetails(
            this.refId,
            this.id
          );
          console.log(saved[0].intRate, 'saved intRate');
          if (data.length > 0) {
            if (saved[0].intRate && saved[0].intRate != 'NaN') {
              this.basicData.controls.intRate.setValue(+saved[0].intRate || '');
            } else {
              this.basicData.controls.intRate.setValue(+data[0].Mclr || '');
            }
            this.minRate = +data[0].Mclr;
            this.maxRate = 100;
            this.EMICalculation();
            this.basicData
              .get('intRate')
              .setValidators(
                Validators.compose([
                  Validators.required,
                  Validators.min(+data[0].Mclr),
                  Validators.max(100),
                ])
              );
            this.basicData.get('intRate').updateValueAndValidity();
            this.preEmiCalculation();
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
  }

  getJanaLoanName(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    return selectedLoanName.prdDesc;
  }

  getPeriodInstallments() {
    this.sqliteProvider
      .getMasterDataUsingType('PeriodicityInstalment')
      .then((data) => {
        this.installments = data;
      });
  }
  getModeofRepayment() {
    this.sqliteProvider
      .getMasterDataUsingType('ModeofRepayment')
      .then((data) => {
        this.Repayments = data;
      });
  }

  getYesOrNoList() {
    this.sqliteProvider.getMasterDataUsingType('YesNo').then((data) => {
      this.yesOrNoList = data;
    });
  }

  getVehicleAge() {
    this.sqliteProvider.getMasterDataUsingType('VehicleAge').then((data) => {
      this.vehicleAgeMaster = data;
    });
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

  onScrolling() {
    document
      .getElementsByClassName('itemcard')[0]
      .classList.remove('stockyhead1');
    document
      .getElementsByClassName('itemcard')[1]
      .classList.remove('stockyhead2');
    document
      .getElementsByClassName('itemcard')[2]
      .classList.remove('stockyhead3');
    document
      .getElementsByClassName('itemcard')[3]
      .classList.remove('stockyhead4');
    document
      .getElementsByClassName('itemcard')[4]
      .classList.remove('stockyhead5');

    if (
      76 >
      document.getElementsByClassName('itemcard')[0].getBoundingClientRect().top
    ) {
      document
        .getElementsByClassName('itemcard')[0]
        .classList.add('stockyhead1');
    }
    if (
      124 >
      document.getElementsByClassName('itemcard')[1].getBoundingClientRect().top
    ) {
      document
        .getElementsByClassName('itemcard')[1]
        .classList.add('stockyhead2');
    }
    if (
      124 >
      document.getElementsByClassName('itemcard')[2].getBoundingClientRect().top
    ) {
      document
        .getElementsByClassName('itemcard')[2]
        .classList.add('stockyhead3');
    }
    if (
      124 >
      document.getElementsByClassName('itemcard')[3].getBoundingClientRect().top
    ) {
      document
        .getElementsByClassName('itemcard')[3]
        .classList.add('stockyhead4');
    }
    if (
      124 >
      document.getElementsByClassName('itemcard')[4].getBoundingClientRect().top
    ) {
      document
        .getElementsByClassName('itemcard')[4]
        .classList.add('stockyhead5');
    }
  }

  loanAmtRoadPriceCheck() {
    let onroad = +this.vehicleDetails.controls.onroadPrice.value;
    let assetAmt = +this.vehicleDetails.controls.assetPrice.value;
    let loanAmt = +this.basicData.controls.loanAmount.value;

    if (this.vehicleType == 'N') {
      if (onroad) {
        if (onroad <= loanAmt) {
          this.loanAmtcheck = true;
          // this.alertService.showAlert("Alert!", `Loan Amount should be lesser than On Road Price Amount`);
          // this.globalFunction.globalAlert("Alert!", `Loan Amount should be lesser than On Road Price Amount`);
          this.basicData.controls.loanAmount.setValue('');
          this.basicData.controls.loanAmount.updateValueAndValidity();
        } else {
          this.loanAmtcheck = false;
          let marginCost = onroad - loanAmt;
          this.basicData.controls.margin.setValue(marginCost);
          this.basicData.controls.margin.updateValueAndValidity();
        }
      }
    } else {
      if (assetAmt) {
        if (assetAmt <= loanAmt) {
          this.assetAmtcheck = true;
          this.basicData.controls.loanAmount.setValue('');
          this.basicData.controls.loanAmount.updateValueAndValidity();
        } else {
          this.assetAmtcheck = false;
          let marginCost = assetAmt - loanAmt;
          this.basicData.controls.margin.setValue(marginCost);
          this.basicData.controls.margin.updateValueAndValidity();
        }
      }
    }
  }

  downPaymentCalc() {
    // if(this.basicData.controls.preEmiDB.value == "") {
    //   this.alertService.showAlert('Alert!', 'PRE Emi included in DP');
    // } else {
    let processingFee = +this.basicData.controls.processingFee.value;
    let gstonPf = +this.basicData.controls.gstonPf.value;
    let stampDuty = +this.basicData.controls.stampDuty.value;
    let gstonSdc = +this.basicData.controls.gstonSdc.value;
    let nachCharges = +this.basicData.controls.nachCharges.value;
    let gstonNach = +this.basicData.controls.gstonNach.value;
    let pddCharges = +this.basicData.controls.pddCharges.value;
    let gstonPddCharges = +this.basicData.controls.gstonPddCharges.value;
    let otherCharges = +this.basicData.controls.otherCharges.value;
    let gstonOtherCharges = 0; //+this.basicData.controls.gstonOtherCharges.value;

    let borHealthIns = +this.basicData.controls.borHealthIns.value;
    let coBorHealthIns = +this.basicData.controls.coBorHealthIns.value;
    let insPremium = +this.basicData.controls.insPremium.value;
    let marginCost = +this.basicData.controls.margin.value;
    let loanAmt = +this.basicData.controls.loanAmount.value;
    let advEmi = +this.basicData.controls.advanceEmi.value;
    let charges;
    if (this.basicData.controls.preEmiDB.value == '1') {
      // charges = processingFee + gstonPf + stampDuty + gstonSdc + nachCharges + gstonNach + pddCharges + gstonPddCharges + otherCharges + gstonOtherCharges + borHealthIns + coBorHealthIns + preEmi;
      charges =
        stampDuty +
        gstonSdc +
        nachCharges +
        gstonNach +
        pddCharges +
        gstonPddCharges +
        otherCharges +
        gstonOtherCharges +
        borHealthIns +
        coBorHealthIns;
    } else if (this.basicData.controls.preEmiDB.value == '2') {
      charges =
        stampDuty +
        gstonSdc +
        nachCharges +
        gstonNach +
        pddCharges +
        gstonPddCharges +
        otherCharges +
        gstonOtherCharges +
        borHealthIns +
        coBorHealthIns;
    }
    let chargesFormatValue = charges.toFixed(2).toString().split('.');
    if (chargesFormatValue[1] <= '49') {
      charges = Math.floor(charges);
    } else {
      charges = Math.ceil(charges);
    }

    let marginCostFormat = marginCost.toString().split('.');
    if (marginCostFormat[1] <= '49') {
      marginCost = Math.floor(marginCost);
    } else {
      marginCost = Math.ceil(marginCost);
    }

    // let dbAmt = loanAmt - charges;
    // loanAmt = loanAmt + insPremium;
    let dbAmt = loanAmt - processingFee - gstonPf - charges - advEmi;
    let dbAmtFormat = dbAmt.toString().split('.');
    if (dbAmtFormat[1] <= '49') {
      dbAmt = Math.floor(dbAmt);
    } else {
      dbAmt = Math.ceil(dbAmt);
    }
    this.dbAmt = dbAmt;
    if (marginCost) {
      // let downPayment =  marginCost + processingFee + gstonPf + stampDuty + gstonSdc + nachCharges + gstonNach + pddCharges + gstonPddCharges + otherCharges + gstonOtherCharges + borHealthIns + coBorHealthIns+insPremium;
      // let downPayment = marginCost + charges;
      let downPayment = marginCost + processingFee + gstonPf + charges + advEmi;
      let downPaymentFormat = downPayment.toString().split('.');
      if (downPaymentFormat[1] <= '49') {
        downPayment = Math.floor(downPayment);
      } else {
        downPayment = Math.ceil(downPayment);
      }
      this.downPayment = downPayment;
      // this.basicData.controls.totalDownPay.setValue(Math.ceil(downPayment));
      this.basicData.controls.totalDownPay.setValue(downPayment);
      this.basicData.controls.totalDownPay.updateValueAndValidity();

      // this.basicData.controls.dbAmount.setValue(Math.ceil(dbAmt));
      // this.basicData.controls.dbAmount.updateValueAndValidity();
      this.basicData.controls.dbAmount.setValue(dbAmt);
      this.basicData.controls.dbAmount.updateValueAndValidity();
    }
    // }
  }

  preEmiCalculation() {
    let loan = +this.basicData.controls.loanAmount.value;
    let intRate = +this.basicData.controls.intRate.value;
    let preEmiDate = this.basicData.controls.dbDate.value;

    if (loan && intRate) {
      let fulldate = new Date(preEmiDate);
      let date = new Date(preEmiDate).getDate();
      let lastDay = new Date(
        fulldate.getFullYear(),
        fulldate.getMonth() + 1,
        0
      ).getDate();
      let currentDay = date - 5;
      if (+date > 15) {
        this.basicData.controls.preEmi.setValue(0);
        this.basicData.controls.preEmi.updateValueAndValidity();
        this.basicData.controls.preEmi.updateValueAndValidity();
      } else {
        this.basicData.controls.preEmi.setValue(0);
        this.basicData.controls.preEmi.updateValueAndValidity();
      }
    } else {
      this.basicData.controls.preEmi.setValue(0);
      this.basicData.controls.preEmi.updateValueAndValidity();
    }
  }

  EMICalculation() {
    if (
      this.basicData.get('tenure').value !== '' &&
      this.basicData.get('intRate').value !== '' &&
      this.basicData.get('totalloanAmount').value !== '' &&
      this.basicData.get('totalloanAmount').value != null
    ) {
      var Rate = +this.basicData.get('intRate').value / (12 * 100);
      var denominator =
        Math.pow(Rate + 1, +this.basicData.get('tenure').value) - 1;
      var Numerator =
        Rate * Math.pow(Rate + 1, +this.basicData.get('tenure').value);
      var EMI =
        (Numerator / denominator) *
        +this.basicData.get('totalloanAmount').value;

      let emiAmt;
      let EMIValue = EMI.toString().split('.');
      if (EMIValue[1] <= '49') {
        emiAmt = Math.floor(EMI);
      } else {
        emiAmt = Math.ceil(EMI);
      }
      this.basicData.get('emi').setValue(emiAmt);
      this.basicData.get('emi').updateValueAndValidity();
    } else {
      this.basicData.get('emi').setValue('');
      this.basicData.get('emi').updateValueAndValidity();
    }
    this.preEmiCalculation();
    this.calculateVehicleAge();
  }

  preEmiIncudeCheck(event) {
    let value = event.detail ? event.detail.value : event;
    if (value == '1') {
      this.preEmiYesCalculation();
    } else if (value == '2') {
      this.preEmiNoCalculation();
    }
  }

  preEmiYesCalculation() {
    let loanAmt = +this.basicData.controls.loanAmount.value;
    let LPIAmt = +this.basicData.controls.insPremium.value;
    let advanceEmi = +this.basicData.controls.advanceEmi.value;
    let totalLoanAmt = loanAmt + LPIAmt - advanceEmi;
    if (totalLoanAmt) {
      this.basicData.controls.totalloanAmount.setValue(totalLoanAmt);
      this.basicData.controls.totalloanAmount.updateValueAndValidity();
      this.EMICalculation();
      this.downPaymentCalc();
    }
  }

  preEmiNoCalculation() {
    let loanAmt = +this.basicData.controls.loanAmount.value;
    let LPIAmt = +this.basicData.controls.insPremium.value;
    let advanceEmi = +this.basicData.controls.advanceEmi.value;
    let totalLoanAmt = loanAmt + LPIAmt - advanceEmi;
    if (totalLoanAmt) {
      this.basicData.controls.totalloanAmount.setValue(totalLoanAmt);
      this.basicData.controls.totalloanAmount.updateValueAndValidity();
      this.EMICalculation();
      this.downPaymentCalc();
    }
  }

  insuranceLPICheck() {
    this.preEmiIncudeCheck(this.basicData.controls.preEmiDB.value);
  }
  lpiAmt;
  lpiCalculation() {
    console.log(this.personalData, 'this.personalData');
    let event = this.basicData.controls.tenure.value;
    let personDate = new Date(this.personalData[0].dob).getFullYear();
    let todayDate = new Date().getFullYear();
    let age = todayDate - personDate;
    let loanProduct;
    let loanfilterProduct;
    this.sqlsupport.getLoanProtectInsurance().then((data) => {
      if (data.length > 0) {
        loanfilterProduct = data.filter(
          (data) => +data.lpifromtenure <= +event && +data.lpitotenure >= +event
        );
        if (loanfilterProduct.length > 0) {
          if (loanfilterProduct.length > 1) {
            loanProduct = loanfilterProduct.filter(
              (loanfilter) =>
                +loanfilter.lpifromage <= +age && +age <= +loanfilter.lpitoage
            );
          } else {
            loanProduct = loanfilterProduct;
          }
          let loanamt = +this.basicData.get('loanAmount').value;
          let preAmt = (loanamt * +loanProduct[0].lpimultiplier) / 1000;

          let lpiAmt;
          let chargesFormatValue = preAmt.toString().split('.');
          if (chargesFormatValue[1] <= '49') {
            lpiAmt = Math.floor(preAmt);
          } else {
            lpiAmt = Math.ceil(preAmt);
          }
          this.lpiAmt = lpiAmt;
          this.basicData.controls.insPremium.setValue(lpiAmt);
          this.basicData.controls.insPremium.updateValueAndValidity();
          this.lpiCheck();
        } else {
          this.globalData.presentToastMiddle(
            'LPI Insuarnce values are not configured for this tenor!'
          );
        }
      } else {
        this.globalData.presentToastMiddle(
          'LPI Insuarnce values are not configured for this tenor!'
        );
      }
      this.pddChargesCalc();
      this.calcProcessFess();
      this.insuranceLPICheck();
      this.EMICalculation();
    });
  }
  lpiCheck() {
    if (
      +this.basicData.controls.insPremium.value == this.lpiAmt ||
      +this.basicData.controls.insPremium.value == 0
    ) {
      if (+this.basicData.controls.insPremium.value == this.lpiAmt) {
        this.basicData.controls.otherCharges.setValue(0);
      } else {
        this.basicData.controls.otherCharges.setValue(this.lpiAmt);
      }
    } else {
      this.basicData.controls.insPremium.setValue(this.lpiAmt);
      this.basicData.controls.insPremium.updateValueAndValidity();
      this.alertService.showAlert(
        'Alert!',
        'Enter either 0 or calculated lpi amount ' + this.lpiAmt + '.'
      );
    }
  }

  async getPddCharges(prdCode) {
    let data = await this.sqlsupport.getProductValuesScheme(prdCode);
    this.pddchargeslist = data;
    this.pddChargesCalc();
  }

  pddChargesCalc() {
    if (this.pddchargeslist.length > 0) {
      let loanAmt = +this.basicData.controls.loanAmount.value;
      let pddcharges = this.pddchargeslist.filter(
        (data) => +data.AmtFromRange < +loanAmt && +loanAmt < +data.AmtToRange
      );
      if (pddcharges.length > 0) {
        this.basicData.controls.pddCharges.setValue(pddcharges[0].PddCharges);
        this.basicData.controls.pddCharges.updateValueAndValidity();
      } else {
        this.basicData.controls.pddCharges.setValue('');
        this.basicData.controls.pddCharges.updateValueAndValidity();
      }
    }
  }

  advanceEMIAdded() {
    let advValue = this.basicData.controls.advanceEmi.value;
    if (advValue) {
      let totalDP = +this.downPayment + +advValue;
      let dbAmt = +this.dbAmt - +advValue;
      this.basicData.controls.totalDownPay.setValue(totalDP);
      this.basicData.controls.totalDownPay.updateValueAndValidity();
      this.basicData.controls.dbAmount.setValue(dbAmt);
      this.basicData.controls.dbAmount.updateValueAndValidity();
      this.preEmiYesCalculation();
    } else {
      this.alertService.showAlert(
        'Alert',
        'Advance EMI Should be grater then Zero or else Zero.'
      );
      this.basicData.controls.totalDownPay.setValue(this.downPayment);
      this.basicData.controls.totalDownPay.updateValueAndValidity();
      this.basicData.controls.dbAmount.setValue(this.dbAmt);
      this.basicData.controls.dbAmount.updateValueAndValidity();
    }
  }

  stampdutyCharges() {
    this.sqlsupport.getStampetails().then((data) => {
      this.stamp = data;
      if (this.stamp.length > 0) {
        this.stampDutyValue = this.stamp.filter((val) => {
          return this.OrgsState == val.state;
        });
        this.basicData.controls['stampDuty'].setValue(
          this.stampDutyValue[0].applicablestampduty
        );
        console.log(this.stampDutyValue);
      }
    });
  }

  calculateRegDate() {
    let yearValue = +this.vehicleDetails.controls.yearOfMan.value;
    if (yearValue) {
      let calYear = this.todayDate.getFullYear() - yearValue;
      let dd = this.todayDate.getDate();
      let mm = this.todayDate.getMonth() + 1; //January is 0!
      let yyyy = this.todayDate.getFullYear() - calYear;
      let YYYY = this.todayDate.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      let mindate = yyyy + '-' + mm + '-' + dd;
      this.minRegDate = mindate;
      let maxDate = YYYY + '-' + mm + '-' + dd;
      this.maxRegDate = maxDate;
    }
  }

  dealerValueChange() {
    this.vehicleDetails.controls.obv.setValue('');
    this.vehicleDetails.controls.obv.updateValueAndValidity();
    this.vehicleDetails.controls.assetPrice.setValue('');
    this.vehicleDetails.controls.assetPrice.updateValueAndValidity();
  }

  finalAssetPrice() {
    let dealerValue = +this.vehicleDetails.controls.dealerQuotation.value;
    if (dealerValue) {
      let obvValue = +this.vehicleDetails.controls.obv.value;
      if (obvValue) {
        let finalValue = Math.min(dealerValue, obvValue);
        if (finalValue <= 10000) {
          this.alertService.showAlert(
            'Alert',
            'Final asset price should not be less then 10K!'
          );
        } else {
          this.vehicleDetails.controls.assetPrice.setValue(finalValue);
          this.vehicleDetails.controls.assetPrice.updateValueAndValidity();
          this.loanAmtRoadPriceCheck();
        }
      } else {
        this.alertService.showAlert('Alert', 'Please Enter OBV Value.');
      }
    } else {
      this.alertService.showAlert(
        'Alert',
        'Please Enter Dealer quotation value.'
      );
    }
  }

  InsCoverChange(event) {
    if (event.detail.value == 'Y') {
      this.showMand = true;
      this.vehicleDetails
        .get('insPolicyNo')
        .setValidators(
          Validators.compose([
            Validators.pattern('[a-zA-z0-9]*'),
            Validators.required,
          ])
        );
      this.vehicleDetails.get('insPolicyNo').updateValueAndValidity();
      this.vehicleDetails
        .get('insCompany')
        .setValidators(
          Validators.compose([
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ])
        );
      this.vehicleDetails.get('insCompany').updateValueAndValidity();
      this.vehicleDetails.get('insDate').setValidators(Validators.required);
      this.vehicleDetails.get('insDate').updateValueAndValidity();
      this.vehicleDetails.get('insExpDate').setValidators(Validators.required);
      this.vehicleDetails.get('insExpDate').updateValueAndValidity();
      this.vehicleDetails.get('insValue').setValidators(Validators.required);
      this.vehicleDetails.get('insValue').updateValueAndValidity();
    } else {
      this.showMand = false;
      this.vehicleDetails.get('insPolicyNo').clearValidators();
      this.vehicleDetails.get('insPolicyNo').updateValueAndValidity();
      this.vehicleDetails.get('insCompany').clearValidators();
      this.vehicleDetails.get('insCompany').updateValueAndValidity();
      this.vehicleDetails.get('insDate').clearValidators();
      this.vehicleDetails.get('insDate').updateValueAndValidity();
      this.vehicleDetails.get('insExpDate').clearValidators();
      this.vehicleDetails.get('insExpDate').updateValueAndValidity();
      this.vehicleDetails.get('insValue').clearValidators();
      this.vehicleDetails.get('insValue').updateValueAndValidity();
    }
  }

  calculateVehicleAge() {
    let regDate = this.vehicleDetails.get('registrationDate').value;
    let calcRegDate = new Date(regDate).getFullYear();
    let currentYear = this.today.getFullYear();
    let calcAge = currentYear - calcRegDate;
    let tenureMonth = +this.basicData.get('tenure').value;
    let totalAge = calcAge * 12 + tenureMonth;
    console.log(totalAge);
    this.basicData.controls.assetAge.setValue(totalAge);
    this.basicData.controls.assetAge.updateValueAndValidity();
  }

  /**
   * @method genORPToken
   * @description Function helps to generate the AccessToken to get data from Droom API.
   * @author HariHaraSuddhan S
   */
  async genORPToken() {
    try {
      await this.orpApi.getAccessTokenCall().then((data) => {
        if (data) this.orpAuthFetch('category');
        else {
          this.makeApiList = [];
          this.modelApiList = [];
          this.varientApiList = [];
        }
      });
    } catch (error) {
      this.sqlsupport.addAuditTrail(
        new Date().getTime(),
        'genORPToken',
        '',
        error
      );
    }
  }

  /**
   * @method orpAuthFetch
   * @description Function helps to get the Vehicle Category,Model,variant,ORP details From the droom API.
   * @author HariHaraSuddhan S
   */
  async orpAuthFetch(type: string, DBYear?: string) {
    let vehicleType = ORPApiStrings;
    let value: string;
    let year: string =
      this.vehicleType == 'N'
        ? this.today.getFullYear()
        : +this.vehicleDetails.get('yearOfMan').value;
    year = year ? year : DBYear;
    switch (type) {
      case vehicleType.category:
        value = this.globalData.convertToString(
          this.vehicleDetails.get('vehicleCatogery').value
        );
        this.orpApiValueChangeFieldReset(vehicleType.category);
        await this.orpApi
          .frameRequestORPNew(vehicleType.category, value)
          .then((response) => {
            this.makeApiList = response;
          });
        break;
      case vehicleType.model:
        value = this.globalData.convertToString(
          this.vehicleDetails.get('brandName').value
        );
        this.orpApiValueChangeFieldReset('make');
        await this.orpApi
          .frameRequestORPNew(vehicleType.model, value)
          .then((response) => {
            this.modelApiList = response;
          });
        break;
      case vehicleType.variant:
        value = this.globalData.convertToString(
          this.vehicleDetails.get('model').value
        );
        this.orpApiValueChangeFieldReset(vehicleType.model);
        await this.orpApi
          .frameRequestORPNew(vehicleType.variant, value, year)
          .then((response) => {
            this.varientApiList = response;
          });
        break;
      case vehicleType.ORP:
        if (this.vehicleType == 'N') {
          value = this.globalData.convertToString(
            this.vehicleDetails.get('variant').value
          );
          this.orpApiValueChangeFieldReset(vehicleType.variant);
          await this.orpApi
            .frameRequestORPNew(
              vehicleType.ORP,
              value,
              year,
              '',
              this.presentCity[0].cityName
            )
            .then((response: any) => {
              // this.vehicleDetails.get("onroadPrice").setValue(+response.onroad_price.split(',').join(''));
              // this.vehicleDetails.get("onroadPrice").updateValueAndValidity();
              if (response.onroad_price) {
                this.apiORPPrice =
                  +response.onroad_price.split(',').join('') +
                  +response.onroad_price.split(',').join('') *
                    (+localStorage.getItem('ORPPer') / 100);
                this.vehicleDetails.get('apiFlag').setValue('Y');
                console.log(
                  `Actual Amt is ${+response.onroad_price
                    .split(',')
                    .join('')}, added ${+localStorage.getItem('ORPPer')}% is ${
                    this.apiORPPrice
                  }`
                );
              } else {
                this.orpEmpty = false;
              }
            });
        } else {
          let body = {
            make: this.globalData.convertToString(
              this.vehicleDetails.get('brandName').value
            ),
            model: this.globalData.convertToString(
              this.vehicleDetails.get('model').value
            ),
            year: this.globalData.convertToString(
              this.vehicleDetails.get('yearOfMan').value
            ),
            trim: this.globalData.convertToString(
              this.vehicleDetails.get('variant').value
            ),
            kms_driven: this.globalData.convertToString(
              this.vehicleDetails.get('kmDriven').value
            ),
            city: this.presentCity[0].cityName,
            noOfOwners: this.globalData.convertToString(
              this.vehicleDetails.get('noofOwner').value
            ),
          };
          await this.orpApi.frameRequestORPUsed(body).then(async (response) => {
            if (response) {
              response = response.Good.range_from
                ? (response.Good.range_from + response.Good.range_to) / 2
                : 0;
              this.vehicleDetails.get('apiFlag').setValue('Y');
              this.obvEditable = await this.setDealerValue(
                this.basicData.value.dealerName,
                'Y'
              );
              this.obvEditable ? this.obvChange(response) : '';
            } else {
              this.obvChange(0);
            }
          });
        }
        break;
    }
    this.globalFunction.globalLodingDismiss();
  }

  /**
   * @method obvChange
   * @description Function helps to change the diabled status of OBV based on the value .
   * @author HariHaraSuddhan S
   */

  obvChange(value: number) {
    try {
      this.vehicleDetails.get('obv').setValue(value);
      this.vehicleDetails.get('obv').updateValueAndValidity();
      this.obvEditable = value <= 0 ? false : true;
      this.obvEditable
        ? this.vehicleDetails.controls.dealerQuotation.setValue('')
        : '';
      !this.obvEditable ? this.vehicleDetails.controls.obv.setValue('') : '';
    } catch (error) {
      console.log(error, 'AssetTabsPag obvChange');
    }
  }

  /**
   * @method orpApiPriceCheck
   * @description Function helps to check the input value of ORP will not greater than API ORP Value .
   * @author HariHaraSuddhan S
   */
  orpApiPriceCheck() {
    if (this.orpEmpty) {
      if (
        +this.vehicleDetails.get('onroadPrice').value > this.apiORPPrice &&
        this.apiORPPrice !== 0
      ) {
        this.vehicleDetails.get('onroadPrice').setValue('');
        this.vehicleDetails.updateValueAndValidity();
        this.alertService.showAlert(
          'Alert',
          'Please mention the Correct OnRoad Price'
        );
      }
    } else if (
      +this.vehicleDetails.get('onroadPrice').value > this.manualORPLimit
    ) {
      this.vehicleDetails.get('onroadPrice').setValue('');
      this.vehicleDetails.updateValueAndValidity();
      this.alertService.showAlert('Alert', 'Please mention ORP less then 10L');
    }
  }

  /**
   * @method orpApiValueChangeFieldReset
   * @description Function helps to reset the form value if user made any changes in vehicle details .
   * @author HariHaraSuddhan S
   */

  orpApiValueChangeFieldReset(type: string) {
    switch (type) {
      case 'catogery':
        this.vehicleDetails.get('brandName').reset();
        this.vehicleDetails.get('model').reset();
        this.vehicleDetails.get('variant').reset();
        if (this.vehicleType == 'N') {
          this.vehicleDetails.get('onroadPrice').reset();
        } else {
          this.vehicleDetails.get('kmDriven').reset();
          this.vehicleDetails.get('yearOfMan').reset();
        }
        break;
      case 'make':
        this.vehicleDetails.get('model').reset();
        this.vehicleDetails.get('variant').reset();
        if (this.vehicleType == 'N') {
          this.vehicleDetails.get('onroadPrice').reset();
        } else {
          this.vehicleDetails.get('kmDriven').reset();
          this.vehicleDetails.get('yearOfMan').reset();
        }
        break;
      case 'model':
        this.vehicleDetails.get('variant').reset();
        this.vehicleDetails.get('onroadPrice').reset();
        break;
      case 'variant':
        this.vehicleType == 'N'
          ? this.vehicleDetails.get('onroadPrice').reset()
          : this.vehicleDetails.get('kmDriven').reset();
        break;
    }
  }

  /**
   * @method fetchDetailsFromRC
   * @description Function helps to fetch details of RC from Droom API .
   * @author HariHaraSuddhan S
   */
  async fetchDetailsFromRC() {
    try {
      this.globalFunction.globalLodingPresent('Please Wait..');
      this.vehicleDetails.get('obv').reset();
      this.vehicleDetails.get('kmDriven').reset();
      await this.orpApi
        .getRCDetails(this.vehicleDetails.get('rcNo').value)
        .then((data: any) => {
          this.globalFunction.globalLodingDismiss();
          console.log('getRCDetails', data);
          if (data) {
            if (!data.blacklisted) {
              this.vehicleDetails
                .get('engineNo')
                .setValue(data.engine_number ? data.engine_number : 'NA');
              this.vehicleDetails
                .get('chassisNo')
                .setValue(data.chassis_number ? data.chassis_number : 'NA');
              this.vehicleDetails
                .get('registrationDate')
                .setValue(
                  data.registration_date
                    ? this.globalData.formatDateString(data.registration_date)
                    : 'NA'
                );
              this.vehicleDetails
                .get('hypothecation')
                .setValue(
                  data.financing_authority ? data.financing_authority : 'No'
                );
              this.vehicleDetails
                .get('noofOwner')
                .setValue(data.owner_serial_number);
              this.vehicleDetails
                .get('nameAsPerRC')
                .setValue(data.vehicle_model ? data.vehicle_model : 'NA');
              this.vehicleDetails
                .get('insExpDate')
                .setValue(
                  data.insurance_upto
                    ? this.globalData.formatDateString(data.insurance_upto)
                    : 'NA'
                );
              this.vehicleDetails
                .get('insCompany')
                .setValue(
                  data.insurance_company ? data.insurance_company : 'NA'
                );
              this.RCFetchDetailsDisable = true;
            } else {
              this.alertService.showAlert(
                'Alert',
                'Given RC Number is Black Listed!'
              );
              this.reSetRCDetails();
              this.RCFetchDetailsDisable = false;
            }
          } else {
            this.alertService.showAlert('Alert', 'Details not found!');
            this.reSetRCDetails();
            this.RCFetchDetailsDisable = false;
          }
        });
    } catch (error) {
      this.sqlsupport.addAuditTrail(
        new Date().getTime(),
        'fetchDetailsFromRC',
        '',
        error
      );
      this.RCFetchDetailsDisable = false;
    }
  }

  /**
   * @method reSetRCDetails
   * @description Function helps to reset the values if Values not found from API .
   * @author HariHaraSuddhan S
   */
  reSetRCDetails() {
    this.vehicleDetails.get('engineNo').setValue('');
    this.vehicleDetails.get('chassisNo').setValue('');
    this.vehicleDetails.get('registrationDate').setValue('');
    this.vehicleDetails.get('hypothecation').setValue('');
    this.vehicleDetails.get('noofOwner').setValue('');
    this.vehicleDetails.get('nameAsPerRC').setValue('');
    this.vehicleDetails.get('insExpDate').setValue('');
    this.vehicleDetails.get('insCompany').setValue('');
  }

  /**
   * @method advanceEmiReq
   * @description Function helps to disabled the advanceEmi Field if user choose No.
   * @author HariHaraSuddhan S
   */
  advanceEmiReq(ev: any) {
    let value: string = ev.detail.value;
    if (value == '2') {
      this.basicData.get('advanceEmi').setValue('0');
      this.basicData.get('advanceEmi').updateValueAndValidity();
      this.advanceEmiNo = true;
    } else {
      this.basicData.get('advanceEmi').setValue('');
      this.basicData.get('advanceEmi').updateValueAndValidity();
      this.advanceEmiNo = false;
    }
  }

  roundOffQuantity() {
    let processingFee = this.basicData.controls.processingFee.value;
    let valueString: string = processingFee.toString().split('.');
    let roudOffValue: Number;
    if (valueString[1] <= '49') {
      roudOffValue = Math.floor(processingFee);
    } else {
      roudOffValue = Math.ceil(processingFee);
    }
    this.basicData.controls.processingFee.setValue(roudOffValue);
    this.basicData.controls.processingFee.updateValueAndValidity();
  }

  dealerNameChanged(event) {
    let value = event.value;
    this.vehicleDetails.controls.dealerName.setValue(value);
    this.vehicleDetails.controls.dealerName.updateValueAndValidity();
    this.vehicleDetails.controls.kmDriven.setValue('');
    this.vehicleDetails.controls.kmDriven.updateValueAndValidity();
  }
}
