import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import * as moment from 'moment';
import { RemarksComponent } from 'src/app/components/remarks/remarks.component';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { NomineeAfterPsPage } from '../nominee-after-ps/nominee-after-ps.page';
import { PicproofPage } from '../picproof/picproof.page';
import { ServiceAfterPsPage } from '../service-after-ps/service-after-ps.page';
import { SignAnnexImgsPage } from '../sign-annex-imgs/sign-annex-imgs.page';
import { OnRoadPriceService } from 'src/providers/on-road-price.service';
import { ORPApiStrings } from 'src/utility/AppConstants';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-post-sanction',
  templateUrl: './post-sanction.page.html',
  styleUrls: ['./post-sanction.page.scss'],
})
export class PostSanctionPage implements OnInit {
  postsanction: FormGroup;
  accountCreation: FormGroup;
  pslForm: FormGroup;
  pslBusForm: FormGroup;
  vehicleBrands: any = [];
  modelMaster: any = [];
  variantMaster: any = [];
  vlTenure: any = [];
  yearList = [];
  documents = [
    { docDescription: 'Post sanction Document', docId: 1, imgs: [] },
    { docDescription: 'Dealer Quotation', docId: 2, imgs: [] },
    { docDescription: 'Down Payment Receipt', docId: 3, imgs: [] },
  ];
  post_other_docs = [];
  segmentsList: any = [
    // { code: "1", name: "OPTION 1" },
    // { code: "2", name: "OPTION 2" },
  ];
  yesOrNo: any = [
    { code: '1', name: 'Yes' },
    { code: '2', name: 'No' },
  ];

  ownerList: any = [
    { code: '1', name: '1' },
    { code: '2', name: '2' },
    { code: '3', name: '3' },
    { code: '4', name: '4' },
  ];

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  selectOptions = {
    cssClass: 'remove-ok',
  };
  applicantDetails: any;

  userInfo: any;
  vehicleBrand: any;
  PropNo: any;
  segmentType: any;
  custType: any = 'sanctionForm';
  casaType: any = 'nachDetails';

  refId: any;
  id: any;
  sanctionModify: any;
  postSanId: any;
  disableDoc = false;
  creditFlowGroup: any;

  fowardCheck: boolean = false;
  casaData: any;
  casaDetails: any;

  cbsButtonEnable: boolean = false;
  cbsCustomerEnable: boolean = false;
  cbsAccountEnable: boolean = false;
  instaKitEnable: boolean = false;

  postSanctionCheck: boolean = false;

  LoanAmountModified: boolean = false;
  ModelModified: boolean = false;
  DownPaymentModified: boolean = false;
  segmentModified: boolean = false;
  TenureModified: boolean = false;
  BrandNameModified: boolean = false;
  VariantModified: boolean = false;
  LoanAmtHigherThanSancAmt: boolean = false;
  dbDateModified: boolean = false;
  editAccCreation: boolean = true;
  nomineeTick: boolean = false;
  servicesTick: boolean = false;
  accCreationEdit: boolean = false;

  //used
  ccModified: boolean = false;
  rcNoModified: boolean = false;
  engineNoModified: boolean = false;
  chassisNoModified: boolean = false;
  yearOfManModified: boolean = false;
  registrationDateModified: boolean = false;
  vehicleAgeModified: boolean = false;
  hypothecationModified: boolean = false;
  noofOwnerModified: boolean = false;
  kmDrivenModified: boolean = false;
  dealerQuotationModified: boolean = false;
  obvModified: boolean = false;
  assetPriceModified: boolean = false;
  assetAgeModified: boolean = false;

  savedEligibleLoanAmount: number;
  savedSanctionLoanAmount: number;
  savedModel: any;
  savedDownPayment: any;
  savedTenure: any;
  savedBrandName: any;
  savedVariant: any;
  savedDbDate: any;
  savedAdvanceEmi: any;
  savedCC: any;
  savedRcNo: any;
  savedEngineNo: any;
  savedChassisNo: any;
  savedYearOfMan: any;
  savedRegistrationDate: any;
  savedVehicleAge: any;
  savedHypothecation: any;
  savedNoofOwner: any;
  savedKmDriven: any;
  savedDealerQuotation: any;
  savedObv: any;
  savedAssetPrice: any;
  savedAssetAge: any;

  savedLoanAmtDescForSan: any;
  savedLoanAmountDesc: any;
  savedModelDesc: any;
  savedDownPaymentDesc: any;
  savedTenureDesc: any;
  savedBrandNameDesc: any;
  savedVariantDesc: any;

  valuesModified = 'N';
  undoPropsal: any;
  postSancModified: any;
  submitDisable: boolean = false;
  showManualUser = false;
  showFieldInvestigation = false;
  showAutoApproval = false;
  manualUserList: any = [];
  fieldInspecFlowGroup: any;
  postSanctionFlowGroup: any;
  selectedUserForManual: any;

  psmFlowState: any;
  flowStatus: any;
  autoApprovalFlag: any;
  FieldInvFlag: any;
  FientryFlag: any;
  scoreCardRerun: any;

  disableAutoApprovalBtn = false;
  disableFISubmitBtn = false;
  disableManualApprvalBtn = false;
  cbsButtonServiceCheck: boolean = false;
  psmSubmitted: boolean = false;
  disableEditBtn: boolean = true;
  onRoadPriceChanged: boolean = false;
  orpEmpty: boolean = true;
  enableEditAccStage: number = 0;

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
  pdt_master = [];
  instakitStatus: boolean = false;
  savedInstaKitNumber: any;
  dummy_master: any = [
    { CODE: '1', NAME: 'Vehicle Refinance' },
    { CODE: '2', NAME: 'Vehicle Purchase' },
    { CODE: '3', NAME: 'Agriculture' },
    { CODE: '4', NAME: 'Business' },
  ];

  yesOrNo_master: any = [
    { CODE: 'Y', NAME: 'YES' },
    { CODE: 'N', NAME: 'NO' },
  ];

  pddchargeslist: any;

  onroadPrice: any;
  onroadPrices: any;
  prevOnroadPrice: any;

  loanAmountFrom: any;
  loanAmountTo: any;

  today: any = new Date();
  mindate: any;
  maxdate: string;
  scoreId: any;
  editAccCreationTab: boolean = false;
  casaId: any;
  casaValue: any;
  editCasaSaved: any = 0;
  nomAvail: any;
  guaAvail: any;
  casaSubmitData: any;
  nominee_Data: any[];
  service_data: any[];
  annex_imgs: any[];
  sign_imgs: any;
  other_docs: any = [];
  applicationNo: any;
  casaStage: any;

  pslImg = [];
  pslImglen = 0;
  downPayment: any;
  dbAmt: any;
  // missingAmount: { advanceEmi: any; processingFee: any; };
  processingFeeinPs: number;
  currentORP: any;
  newOnRoadPrice: any;
  naveParamsValue: any;

  newFinalRoadPrice: any;
  dealerNameTemp: any;
  dummy_masterDealer = [];
  savedDealerName: any;
  DealerNameModified: boolean = false;

  vehicleType: any;
  todayDate: any = new Date();
  minRegDate: string;
  maxRegDate: string;
  vehicleAgeMaster: any = [];
  assetRoadPrice: any;

  savedCCDesc: string;
  savedRcNoDesc: string;
  savedEngineNoDesc: string;
  savedChasisNoDesc: string;
  savedYearOfManDesc: string;
  savedRegistrationDesc: string;
  savedVehicleAgeDesc: string;
  savedHypothecationDesc: string;
  savedNoOfOwnerDesc: string;
  savedkmDrivenDesc: string;
  savedDealerQuotationDesc: string;
  savedObvDesc: string;
  savedAssetPriceDesc: string;
  savedAssetAgeDesc: string;
  disableModify: boolean = false;
  tenureFrom: any;
  tenureTo: any;
  makeApiList: any = [];
  modelApiList: any = [];
  varientApiList: any = [];
  usedRangeApiList: any = [];
  ORPApi: boolean = true;
  rcVerify: boolean = false;
  brandNameApi: string;
  presentCity: any;
  obvApiListData: any = ['Excellent', 'Fair', 'Good', 'Very Good'];
  obvApiList = [];
  finalAssetApi: string;
  vehicleCatogeryList: any = [];
  vehicleEVList: any = ['electric-scooter', 'electric-bike'];
  vehicleNonEVList: any = ['motorcycle', 'scooter'];
  apiORPPrice: number;
  obvEditable: boolean = false;
  RCFetchDetailsDisable: boolean = true;
  maxYearOnly = new Date().getFullYear();
  minYearOnly = new Date().getFullYear() - 9;
  schemeCodeVal: any;
  manualORPLimit: number = 999999;
  constructor(
    public navCtrl: NavController,
    // public viewCtrl: ViewController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public master: RestService,
    public globalData: DataPassingProviderService,
    public modalCtrl: ModalController,
    // public base64: Base64,
    public sqlSupport: SquliteSupportProviderService,
    public globFunc: GlobalService,
    public router: Router,
    public orpApi: OnRoadPriceService,
    public activatedRoute: ActivatedRoute,
    public alertService: CustomAlertControlService
  ) {
    this.activatedRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.userInfo = JSON.parse(this.naveParamsValue.viewData);
    this.refId = this.userInfo.refId;
    this.id = this.userInfo.id;
    this.currentORP = '';
    this.yearList = this.globalData.getYearList();
    this.getProductValue();
    this.getVehicleBrandMaster();
    this.getPermAddressInfo();
    this.getSavedCasaDetails();
    this.loadAllApplicantDetails();
    this.getProcessingFees();
    this.getEditedCasaInPS();
    this.postsanction = this.formBuilder.group({
      loanAmount: [
        '',
        Validators.compose([Validators.pattern('[0-9]*'), Validators.required]),
      ],
      tenure: ['', Validators.required],
      dealerName: ['', Validators.required],
      vehicleCatogery: ['', Validators.required],
      brandName: ['', Validators.required],
      model: ['', Validators.required],
      variant: ['', Validators.required],
      cc: [''], //used
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
      dealerQuotation: [''], //used
      obv: [''], //used
      assetPrice: [''], //used
      assetAge: [''], //used
      advanceEmi: ['', Validators.required],
      onroadPrice: [''], //new
      marginCost: ['', Validators.required],
      downpayment: ['', Validators.required],
      segment: ['', Validators.required],
      dbDate: ['', Validators.required],
      totalloanAmount: [''],
      apiFlag: ['N', Validators.required],
    });

    this.pslForm = this.formBuilder.group({
      psl: ['', Validators.required],
      loanPurpose: ['', Validators.required],
      agriProofType: ['', Validators.required],
      landHolding: ['', Validators.required],
      farmerType: ['', Validators.required],
      actType: ['', Validators.required],
      agriPurpose: ['', Validators.required],
    });

    this.pslBusForm = this.formBuilder.group({
      loanPurpose: ['', Validators.required],
      agriProofType: ['', Validators.required],
      landHolding: ['', Validators.required],
      farmerType: ['', Validators.required],
      actType: ['', Validators.required],
      udyamCNo: ['', Validators.required],
      udyamRegNo: ['', Validators.required],
      udyamClass: ['', Validators.required],
      majorAct: ['', Validators.required],
      udyamInvest: ['', Validators.required],
      udyamTurnOver: ['', Validators.required],
      servUnit: ['', Validators.required],
    });

    this.accountCreation = this.formBuilder.group({
      customerId: [''],
      instaKitNumber: [
        '',
        Validators.compose([
          Validators.maxLength(12),
          Validators.minLength(12),
        ]),
      ],
      accountNo: [''],
    });
    this.getVlTenure();
    this.getAgriProof();
    this.getAgriformertype();
    this.getAgriactivitytype();
    this.getAgriPurpose();
    this.getMajorActivity();
    this.getServiceUnits();
    this.getClassUdyam();
    this.getPurposeofLoanVL();
    this.getDealerMaster();
    this.getsegmentType();
    // this.getApplicantDataforPostSanction();
    // this.getPostSanctionModifications();
    this.getProofImg();
    this.getVehicleAge();
    this.getCreditFlowGroup();
    this.getVehicleWorkflow();
    this.getfieldInspecFlowGroup();

    this.calldate();
    this.calcendDate();
    this.sqliteProvider.getScoreCard(this.refId).then((data) => {
      if (data.length > 0) {
        this.scoreId = data[0].scoreId;
      }
    });
  }
  onClick() {
    console.log(this.custType);
    if (this.purpose == '3' || this.purpose == '4') {
      this.sqliteProvider
        .getPSLDetails(this.refId, this.id)
        .then((val) => {
          console.log(val);
          if (val.length < 1) {
            this.custType = 'psl';
            this.alertService.showAlert(
              'Alert!',
              `Please complete PSL Details`
            );
          }
        })
        .catch((err) => err);
    }
  }

  loadListOfMaster(vehicle) {
    if (vehicle == 'N') {
      this.getApplicantDataforPostSanction();
      this.getPostSanctionModifications();
    } else {
      this.getApplicantDataforPostSanction();
      this.getPostSanctionModifications();
    }
  }

  nachOnClick() {
    console.log(this.psmSubmitted);
    if (this.psmSubmitted) {
    }
  }

  ngOnInit() {
    // let root = this.viewCtrl.instance.navCtrl._app._appRoot;
    document.addEventListener('click', function (event) {
      let btn = <HTMLLIElement>(
        document.querySelector('.remove-ok .alert-button-group')
      );
      let target = <HTMLElement>event.target;
      // if (btn && target.className == 'alert-radio-label' || target.className == 'alert-radio-inner' || target.className == 'alert-radio-icon') {
      //   let view = root._overlayPortal._views[0];
      //   let inputs = view.instance.d.inputs;
      //   for (let input of inputs) {
      //     if (input.checked) {
      //       view.instance.d.buttons[1].handler([input.value]);
      //       view.dismiss();
      //       break;
      //     }
      //   }
      // }
    });
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
    this.maxdate = this.maxdate = moment(this.mindate)
      .add(30, 'days')
      .format('YYYY-MM-DD');
  }

  async getModelbasedOnBrand(value?) {
    let brand = this.postsanction.controls.brandName.value;
    if (value) {
      this.postsanction.controls.model.setValue('');
      this.postsanction.controls.model.updateValueAndValidity();
      this.modelMaster = await this.sqliteProvider.getModelBasedonBrand(brand);
    } else {
      this.modelMaster = await this.sqliteProvider.getModelBasedonBrand(brand);
    }
  }

  async getVariantbasedOnModel(value?) {
    let model = this.postsanction.get('model').value;
    if (model) {
      if (value) {
        this.postsanction.controls.variant.setValue('');
        this.postsanction.controls.variant.updateValueAndValidity();
        this.variantMaster = await this.sqliteProvider.getVariantBasedonModel(
          model
        );
      } else {
        this.variantMaster = await this.sqliteProvider.getVariantBasedonModel(
          model
        );
      }
    }
  }

  downPaymentCalc() {
    this.sqliteProvider.getApplicantDataAfterSubmit(this.refId).then((data) => {
      if (data.length > 0) {
        // this.applicantDetails = [];
        // this.applicantDetails = data;

        // this.applicantDetails[0].advanceEmi = this.applicantDetails[0].advanceEmi ? this.applicantDetails[0].advanceEmi : this.missingAmount.advanceEmi
        // let processingFeeInPS = this.applicantDetails[0].processingFee ? this.applicantDetails[0].processingFee : this.missingAmount.processingFee
        // this.applicantDetails[0].processingFee = this.processingFeeinPs ? this.processingFeeinPs : processingFeeInPS

        let processingFee = +this.applicantDetails[0].processingFee;
        let gstonPf = +this.applicantDetails[0].gstonPf;
        let stampDuty = +this.applicantDetails[0].stampDuty;
        let gstonSdc = +this.applicantDetails[0].gstonSdc;

        let nachCharges = +this.applicantDetails[0].nachCharges;
        let gstonNach = +this.applicantDetails[0].gstonNach;
        let pddCharges = +this.applicantDetails[0].pddCharges;
        let gstonPddCharges = +this.applicantDetails[0].gstonPddCharges;
        let otherCharges = +this.applicantDetails[0].otherCharges;
        let gstonOtherCharges = +this.applicantDetails[0].gstonOtherCharges;
        let borHealthIns = +this.applicantDetails[0].borHealthIns;
        let coBorHealthIns = +this.applicantDetails[0].coBorHealthIns;
        let insPremium = +this.applicantDetails[0].insPremium;

        let marginCost = +this.postsanction.controls.marginCost.value;

        let loanAmt = +this.postsanction.controls.loanAmount.value;

        let advanceEmi = +this.applicantDetails[0].advanceEmi;
        // let advanceEmi = +this.postsanction.controls.advanceEmi.value;

        let charges;
        if (this.applicantDetails[0].preEmiDB == '1') {
          // charges = processingFee + gstonPf + stampDuty + gstonSdc + nachCharges + gstonNach + pddCharges + gstonPddCharges + otherCharges + gstonOtherCharges + borHealthIns + coBorHealthIns + insPremium + preEmi;
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
        } else if (this.applicantDetails[0].preEmiDB == '2') {
          // charges = processingFee + gstonPf + stampDuty + gstonSdc + nachCharges + gstonNach + pddCharges + gstonPddCharges + otherCharges + gstonOtherCharges + borHealthIns + coBorHealthIns + insPremium;
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

        if (charges) {
          let chargesFormatValue = charges.toFixed(2).toString().split('.');
          if (chargesFormatValue[1] <= '49') {
            charges = Math.floor(charges);
          } else {
            charges = Math.ceil(charges);
          }
        }
        let marginCostFormat = marginCost.toString().split('.');
        if (marginCostFormat[1] <= '49') {
          marginCost = Math.floor(marginCost);
        } else {
          marginCost = Math.ceil(marginCost);
        }
        // loanAmt = loanAmt + insPremium; // need to double cnfrm with VL - BA
        let dbAmt = loanAmt - processingFee - gstonPf - charges - advanceEmi;
        let dbAmtFormat = dbAmt.toString().split('.');
        if (dbAmtFormat[1] <= '49') {
          dbAmt = Math.floor(dbAmt);
        } else {
          dbAmt = Math.ceil(dbAmt);
        }
        this.dbAmt = dbAmt;
        if (marginCost) {
          let downPayment =
            marginCost + processingFee + gstonPf + charges + advanceEmi;
          let downPaymentFormat = downPayment.toString().split('.');
          if (downPaymentFormat[1] <= '49') {
            downPayment = Math.floor(downPayment);
          } else {
            downPayment = Math.ceil(downPayment);
          }
          this.applicantDetails[0].dbAmount = dbAmt;
          this.downPayment = downPayment;
          this.applicantDetails[0].totalDownPay = downPayment;
          this.postsanction.controls.downpayment.setValue(downPayment);
          this.postsanction.controls.downpayment.updateValueAndValidity();
        }
      }
    });
  }

  async getPriceBasedOnVariant(flag?, value?) {
    if (flag == 'Y') {
      if (value) {
        this.loanAmtRoadPriceCheck(value, '', this.assetRoadPrice);
      } else {
        this.loanAmtRoadPriceCheck(value);
      }
    } else {
      if (flag != 'variant' && flag != undefined) {
        if (this.vehicleType == 'N') {
          this.loanAmtRoadPriceCheck(this.onroadPrices);
        } else {
          this.loanAmtRoadPriceCheck('', '', this.assetRoadPrice);
        }
      } else {
        this.loanAmtRoadPriceCheck(value);
      }
    }
    this.getPddCharges(this.applicantDetails[0].janaLoan).then((data) => {
      //this.pddChargesCalc();
      this.calcProcessFess();
      this.lpiCalculation();
    });
  }

  loanAmtRoadPriceCheck(onRoadprice?, flage?, assetAmount?) {
    let loanAmt = +this.postsanction.controls.loanAmount.value;
    let assetPriceCost = +this.postsanction.controls.assetPrice.value;
    let assetAmt = +assetAmount ? +assetAmount : +assetPriceCost;
    onRoadprice = this.vehicleType == 'N' ? onRoadprice : assetPriceCost;
    this.postsanction.controls.onroadPrice.setValue(onRoadprice);
    this.postsanction.controls.onroadPrice.updateValueAndValidity();
    this.currentORP = onRoadprice;
    this.newOnRoadPrice = onRoadprice;
    this.newFinalRoadPrice = assetPriceCost;
    if (flage == 'Y' && (onRoadprice || assetAmt)) {
      if (this.vehicleType == 'N') {
        if (+onRoadprice <= loanAmt) {
          this.alertService.showAlert(
            'Alert!',
            `Loan Amount should be lesser than On Road Price Amount(Rs. ${onRoadprice})`
          );
          this.postsanction.controls.loanAmount.setValue('');
          this.postsanction.controls.loanAmount.updateValueAndValidity();
        } else {
          let marginCost = +onRoadprice - loanAmt;
          this.applicantDetails[0].margin = marginCost;
          // this.onroadPrices = marginCost;
          this.postsanction.controls.marginCost.setValue(marginCost);
          this.postsanction.controls.marginCost.updateValueAndValidity();
          this.sqlSupport.updateORPinPostSanction(
            onRoadprice,
            this.refId,
            this.id
          );
          this.downPaymentCalc();
        }
      } else {
        if (+assetAmt <= loanAmt) {
          this.alertService.showAlert(
            'Alert!',
            `Loan Amount should be lesser than Final Asset Price(Rs. ${assetAmt})`
          );
          this.postsanction.controls.loanAmount.setValue('');
          this.postsanction.controls.loanAmount.updateValueAndValidity();
        } else {
          let marginCost = +assetAmt - loanAmt;
          this.applicantDetails[0].margin = marginCost;
          // this.onroadPrices = marginCost;
          this.postsanction.controls.marginCost.setValue(marginCost);
          this.postsanction.controls.marginCost.updateValueAndValidity();
          this.sqlSupport.updateAssetPricePostSanction(
            assetAmt,
            this.refId,
            this.id
          );
          this.downPaymentCalc();
        }
      }
    } else {
      if (this.vehicleType == 'N') {
        if (+onRoadprice <= loanAmt) {
          this.alertService.showAlert(
            'Alert!',
            `Loan Amount should be lesser than On Road Price Amount(Rs. ${onRoadprice})`
          );
          this.postsanction.controls.loanAmount.setValue('');
          this.postsanction.controls.loanAmount.updateValueAndValidity();
        } else {
          let marginCost = +onRoadprice - loanAmt;
          this.applicantDetails[0].margin = marginCost;
          // this.onroadPrices = marginCost;
          this.postsanction.controls.marginCost.setValue(marginCost);
          this.postsanction.controls.marginCost.updateValueAndValidity();
        }
      } else {
        if (assetAmt) {
          if (assetAmt <= loanAmt) {
            this.alertService.showAlert(
              'Alert!',
              `Final Asset Price should be lesser than On Road Price Amount(Rs. ${onRoadprice})`
            );
            this.postsanction.controls.loanAmount.setValue('');
            this.postsanction.controls.loanAmount.updateValueAndValidity();
          } else {
            let marginCost = +assetAmt - loanAmt;
            this.applicantDetails[0].margin = marginCost;
            this.assetRoadPrice = marginCost;
            this.postsanction.controls.marginCost.setValue(marginCost);
            this.postsanction.controls.marginCost.updateValueAndValidity();
          }
        }
      }
    }
  }

  getDealerMaster() {
    this.sqliteProvider
      .getDealerMasterData(localStorage.getItem('janaCenter'))
      .then((data) => {
        this.dummy_masterDealer = data;
      });
  }

  getsegmentType() {
    this.sqliteProvider.getMasterDataUsingType('SegmentType').then((data) => {
      this.segmentsList = data;
    });
  }

  getVehicleBrandMaster(): void {
    this.sqliteProvider.getVehicleBrandMaster().then((data) => {
      this.vehicleBrands = data;
    });
  }

  getVlTenure() {
    this.sqliteProvider.getMasterDataUsingType('VLTenure').then((data) => {
      this.vlTenure = data.sort((a, b) => a.NAME - b.NAME);
    });
  }

  getVehicleAge() {
    this.sqliteProvider.getMasterDataUsingType('VehicleAge').then((data) => {
      this.vehicleAgeMaster = data;
    });
  }

  masterAgriProof;
  masterAgriformertype;
  masterAgriactivitytype;
  masterAgriPurpose;
  masterMajorActivity;
  masterServiceUnits;
  masterClassUdyam;
  masterPurposeofLoanVL;

  getAgriProof() {
    this.sqliteProvider.getMasterDataUsingType('AgriProof').then((data) => {
      this.masterAgriProof = data;
    });
  }
  getAgriformertype() {
    this.sqliteProvider
      .getMasterDataUsingType('Agriformertype')
      .then((data) => {
        this.masterAgriformertype = data;
      });
  }

  getAgriactivitytype() {
    this.sqliteProvider
      .getMasterDataUsingType('Agriactivitytype')
      .then((data) => {
        this.masterAgriactivitytype = data;
      });
  }

  getAgriPurpose() {
    this.sqliteProvider.getMasterDataUsingType('AgriPurpose').then((data) => {
      this.masterAgriPurpose = data;
    });
  }

  getMajorActivity() {
    this.sqliteProvider.getMasterDataUsingType('MajorActivity').then((data) => {
      this.masterMajorActivity = data;
    });
  }

  getServiceUnits() {
    this.sqliteProvider.getMasterDataUsingType('ServiceUnits').then((data) => {
      this.masterServiceUnits = data;
    });
  }

  getClassUdyam() {
    this.sqliteProvider.getMasterDataUsingType('ClassUdyam').then((data) => {
      this.masterClassUdyam = data;
    });
  }

  getPurposeofLoanVL() {
    this.sqliteProvider
      .getMasterDataUsingType('PurposeOfLoanVL')
      .then((data) => {
        this.masterPurposeofLoanVL = data;
      });
  }

  getProductValue() {
    this.sqliteProvider.getAllProductList().then((data) => {
      this.pdt_master = data;
    });
  }

  getLoanType(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    return selectedLoanName.prdNature;
  }

  getPostSanctionModifications(isFromScorecardRerun?: boolean) {
    this.sqlSupport.getPostSanctionDetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        this.postSanctionCheck = true;
        this.sanctionModify = data[0].modified;
        this.postSanId = data[0].postSanId;
        if (data[0].lsoFlag == 'Y') {
          this.sanctionModify = '2';
          this.disableModify = true;
        } else {
          this.disableModify = false;
        }
        if (
          !(
            this.sanctionModify &&
            this.postSancModified != 'Y' &&
            !this.psmSubmitted
          )
        ) {
          if (+this.applicantDetails[0].eligibleAmt >= +data[0].loanAmount) {
            this.lessThaneligible = true;
          }
        }
        this.autoApprovalFlag =
          this.lessThaneligible == true ? 'Y' : data[0].autoApprovalFlag;
        this.FieldInvFlag = data[0].FIFLAG; //edge
        this.FientryFlag = data[0].FIENTRY; // new line added
        this.scoreCardRerun = data[0].scoreCardRerun;
        this.disableAutoApprovalBtn =
          data[0].autoApprovalStatus == 'Y' ? true : false;
        this.disableFISubmitBtn = data[0].FieldInvStatus == 'Y' ? true : false;
        this.disableManualApprvalBtn =
          data[0].ManualApprovalStatus == 'Y' ? true : false;
        this.psmSubmitted = data[0].psmSubmitted == 'Y' ? true : false;
        this.psmFlowState = data[0].psmFlowState;
        //   if(isFromScorecardRerun){
        //     // running logic to show autoApprovalFI and manual approvalBtn if getPostsanction method from scorecardrerun method
        //   if (data[0].ManualApprovalFlag == "Y") {
        //     this.showAutoApproval = this.showFieldInvestigation = false;
        //     this.showManualUser = true;
        //   }
        //   if (data[0].FIFLAG == 'Y' && data[0].FIENTRY == 'Y') {
        //     this.showAutoApproval = this.showFieldInvestigation = false;
        //     this.showManualUser = true;
        //   }
        //   if (data[0].psmFlowState == 'scoreCard') {
        //     if (this.autoApprovalFlag == 'N' && this.FieldInvFlag == 'Y' && data[0].FIENTRY == 'N') {
        //       this.showAutoApproval = this.showManualUser = false;
        //       this.showFieldInvestigation = true;
        //       // this.submitDisable = true;
        //     }else{
        //       this.showFieldInvestigation = false;
        //     }
        //   }
        //   if (this.autoApprovalFlag == 'Y') {
        //     this.showAutoApproval = true;
        //   } else { this.showAutoApproval = false; }
        // }
        // this.sqliteProvider.getApplicantDataforPostSanction(this.userInfo.refId).then(val => {
        //   if (val.length > 0) {
        //     if (+val[0].sanctionedAmt >= 100000 && +val[0].sanctionedAmt < 150000) {
        //       if (data[0].NTCFLAG == 'N' && this.autoApprovalFlag == 'Y') {
        //         this.showAutoApproval = true;
        //       } else {
        //         if (val[0].FIENTRY == 'Y') {
        //           this.showManualUser = true;
        //         } else {
        //           this.showAutoApproval = false;
        //           if (!this.lessThaneligible == true && val[0].FIENTRY == 'N') this.showFieldInvestigation = true;
        //           else this.showAutoApproval = true;
        //         }
        //       }
        //     }else if(+val[0].sanctionedAmt >= 150000){
        //       if (val[0].FIENTRY == 'Y') {
        //         this.showManualUser = true;
        //       }
        //     }
        //   }
        // }).catch(err => err);
      }
    });
  }

  editPostSanction() {
    if (this.autoApprovalFlag == 'Y' && this.disableAutoApprovalBtn) {
      this.alertService
        .confirmationAlert('Alert', `On editing,should re run the scorecard!`)
        .then((data) => {
          if (data) {
            this.submitDisable = false;
            this.disableEditBtn = true;
            this.showAutoApproval = false;
            this.sqlSupport
              .updataStatus('scoreCardRerun', this.refId, this.id)
              .then((data) => {
                this.sqlSupport
                  .updataStatus('autoApprovalFlag', this.refId, this.id)
                  .then((data) => {
                    this.sqlSupport
                      .updataStatus('autoApprovalStatus', this.refId, this.id)
                      .then((data) => {
                        this.sqlSupport
                          .updateSanctionModifiedState(
                            this.applicantDetails[0].applicationNumber
                          )
                          .then((data) => {
                            this.getPostSanctionModifications();
                            this.loadAllApplicantDetails();
                            this.getApplicantDataforPostSanction();
                          });
                      });
                  });
              });
          }
        });
    }
  }

  getSavedCasaDetails() {
    this.sqlSupport.getCASADetails(this.refId, this.id).then((data) => {
      this.casaData = data[0].janaAcc;
      this.casaDetails = data[0];
    });
  }

  getEditedCasaInPS() {
    this.sqlSupport.getCASADetails(this.refId, this.id).then((data) => {
      this.casaValue = data[0];
      this.editCasaSaved = this.casaValue.editCasaSaved;
      this.casaStage = this.casaValue.casaStage;
      if (this.casaValue != '') {
        if (
          (this.casaValue.editedInPS == 'Y' && this.casaValue.janaAcc == 'Y') ||
          (this.casaValue.janaAcc == 'Y' && this.casaValue.editedInPS == 'N')
        ) {
          this.editAccCreation = true;
          this.accCreationEdit = true;
          this.editAccCreationTab = true;
          this.nomineeTick = true;
          this.servicesTick = true;
          // } else if (this.casaValue.janaAcc == 'Y' && this.casaValue.editedInPS == 'N') {
          //   this.editAccCreation = true;
          //   this.accCreationEdit = true;
          //   this.editAccCreationTab = true;
          //   this.nomineeTick = false;
          //   this.servicesTick = false;
        } else {
          this.editAccCreation = true;
          this.accCreationEdit = true;
        }
      }
    });
  }

  getVehicleWorkflow() {
    this.sqliteProvider
      .getVehicleApproval('Recommendation & Approval')
      .then((manualUsers) => {
        let newManualUserList = manualUsers;
        this.manualUserList = newManualUserList.filter(
          (val) => val.UserGroupName !== 'BH'
        );
      });
  }

  getfieldInspecFlowGroup() {
    this.sqliteProvider
      .getVehicleWorkflowList('Field Investigation')
      .then((flowDesc) => {
        this.fieldInspecFlowGroup = flowDesc[0];
      })
      .then((data) => {
        this.sqliteProvider
          .getVehicleWorkflowList('Post sanction Activities')
          .then((postDesc) => {
            this.postSanctionFlowGroup = postDesc[0];
          });
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PostSanctionPage');
  }
  PSL = false;
  purpose;
  loadAllApplicantDetails() {
    this.sqliteProvider
      .getApplicantDataAfterSubmit(this.refId)
      .then((data) => {
        if (data.length > 0) {
          this.applicantDetails = [];
          this.applicantDetails = data;
          this.applicationNo = data[0].applicationNumber;
          this.postSancModified = data[0].postSancModified;
          this.vehicleType = data[0].vehicleType == 1 ? 'N' : 'U';
          this.getJanaProductCode(data[0].janaLoan);
          this.usedFieldValidation(this.vehicleType);
          this.loadListOfMaster(this.vehicleType);
          // this.applicantDetails[0].advanceEmi = this.applicantDetails[0].advanceEmi ? this.applicantDetails[0].advanceEmi : this.missingAmount.advanceEmi
          // this.applicantDetails[0].processingFee = this.applicantDetails[0].processingFee ? this.applicantDetails[0].processingFee : this.missingAmount.processingFee
          if (data[0].postSancDocUpload == 'Y') {
            this.fowardCheck = true;
          }
          if (data[0].disbursementCheck == 'Y') {
            this.fowardCheck = false;
          }
          if (data[0].postSancModified == 'Y' && !this.psmSubmitted) {
            this.submitDisable = true;
            this.disableEditBtn = false;
          }

          if (data[0].purpose == '3' || data[0].purpose == '4') {
            this.purpose = data[0].purpose;
            this.pslForm.controls.loanPurpose.setValue(this.purpose);
            this.pslBusForm.controls.loanPurpose.setValue(this.purpose);
            this.PSL = true;
          }

          //getPSL
          this.sqliteProvider
            .getPSLDetails(this.refId, this.id)
            .then((pslData) => {
              console.log(pslData);
              this.pslId = pslData[0].pslId;
              if (pslData.length > 0) {
                this.getPslImgs();
                if (data[0].purpose == '3') {
                  this.pslForm.controls.psl.setValue(pslData[0].psl);
                  this.pslForm.controls.agriProofType.setValue(
                    pslData[0].agriProofType
                  );
                  this.pslForm.controls.landHolding.setValue(
                    pslData[0].landHolding
                  );
                  this.pslForm.controls.farmerType.setValue(
                    pslData[0].farmerType
                  );
                  this.pslForm.controls.actType.setValue(pslData[0].actType);
                  this.pslForm.controls.agriPurpose.setValue(
                    pslData[0].agriPurpose
                  );
                } else if (data[0].purpose == '4') {
                  this.pslBusForm.controls.agriProofType.setValue(
                    pslData[0].agriProofType
                  );
                  this.pslBusForm.controls.landHolding.setValue(
                    pslData[0].landHolding
                  );
                  this.pslBusForm.controls.farmerType.setValue(
                    pslData[0].farmerType
                  );
                  this.pslBusForm.controls.actType.setValue(pslData[0].actType);
                  this.pslBusForm.controls.servUnit.setValue(
                    pslData[0].agriPurpose
                  );
                  this.pslBusForm.controls.udyamCNo.setValue(
                    pslData[0].udyamCNo
                  );
                  this.pslBusForm.controls.udyamRegNo.setValue(
                    pslData[0].udyamRegNo
                  );
                  this.pslBusForm.controls.udyamClass.setValue(
                    pslData[0].udyamClass
                  );
                  this.pslBusForm.controls.majorAct.setValue(
                    pslData[0].majorAct
                  );
                  this.pslBusForm.controls.udyamInvest.setValue(
                    pslData[0].udyamInvest
                  );
                  this.pslBusForm.controls.udyamTurnOver.setValue(
                    pslData[0].udyamTurnOver
                  );
                }
              }
            })
            .catch((err) => err);
        } else {
          this.applicantDetails = [];
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.applicantDetails = [];
      });

    this.sqlSupport
      .getCBSDetails(this.refId, this.id)
      .then((data) => {
        if (data.length > 0) {
          this.accountCreation.controls.customerId.setValue(data[0].customerId);
          this.accountCreation.controls.accountNo.setValue(data[0].accountNo);
          this.accountCreation.controls.instaKitNumber.setValue(
            data[0].instaKitNumber
          );
          this.savedInstaKitNumber = data[0].instaKitNumber;

          if (data[0].cbsButtonEnable == 'Y') {
            this.cbsButtonEnable = true;
          }
          if (data[0].cbsCustomerEnable == 'Y') {
            this.cbsCustomerEnable = true;
          }
          if (data[0].cbsAccountEnable == 'Y') {
            this.cbsAccountEnable = true;
          }
          if (data[0].instakitStatus == 'Y') {
            this.instakitStatus = true;
          }
        }
      })
      .catch((e) => {
        console.log('er' + e);
      });
  }

  usedFieldValidation(vehicleType) {
    if (vehicleType == 'N') {
      this.postsanction
        .get('onroadPrice')
        .setValidators(
          Validators.compose([
            Validators.pattern('[0-9]*'),
            Validators.required,
          ])
        );
      this.postsanction.get('onroadPrice').updateValueAndValidity();

      this.postsanction.get('cc').clearValidators();
      this.postsanction.get('rcNo').clearValidators();
      this.postsanction.get('engineNo').clearValidators();
      this.postsanction.get('chassisNo').clearValidators();
      this.postsanction.get('yearOfMan').clearValidators();
      this.postsanction.get('registrationDate').clearValidators();
      this.postsanction.get('vehicleAge').clearValidators();
      this.postsanction.get('hypothecation').clearValidators();
      this.postsanction.get('noofOwner').clearValidators();
      this.postsanction.get('kmDriven').clearValidators();
      this.postsanction.get('dealerQuotation').clearValidators();
      this.postsanction.get('obv').clearValidators();
      this.postsanction.get('assetPrice').clearValidators();
      this.postsanction.get('assetAge').clearValidators();

      this.postsanction.get('cc').updateValueAndValidity();
      this.postsanction.get('rcNo').updateValueAndValidity();
      this.postsanction.get('engineNo').updateValueAndValidity();
      this.postsanction.get('chassisNo').updateValueAndValidity();
      this.postsanction.get('yearOfMan').updateValueAndValidity();
      this.postsanction.get('registrationDate').updateValueAndValidity();
      this.postsanction.get('vehicleAge').updateValueAndValidity();
      this.postsanction.get('hypothecation').updateValueAndValidity();
      this.postsanction.get('noofOwner').updateValueAndValidity();
      this.postsanction.get('kmDriven').updateValueAndValidity();
      this.postsanction.get('dealerQuotation').updateValueAndValidity();
      this.postsanction.get('obv').updateValueAndValidity();
      this.postsanction.get('assetPrice').updateValueAndValidity();
      this.postsanction.get('assetAge').updateValueAndValidity();
    } else {
      this.postsanction
        .get('cc')
        .setValidators([
          Validators.compose([
            Validators.pattern('[0-9]*'),
            Validators.required,
          ]),
        ]);
      this.postsanction
        .get('rcNo')
        .setValidators(
          Validators.compose([
            Validators.minLength(7),
            Validators.maxLength(11),
            Validators.pattern('[a-zA-z0-9]*'),
            Validators.required,
          ])
        );
      this.postsanction
        .get('engineNo')
        .setValidators(
          Validators.compose([
            Validators.minLength(10),
            Validators.maxLength(14),
            Validators.pattern('[a-zA-z0-9]*'),
            Validators.required,
          ])
        );
      this.postsanction
        .get('chassisNo')
        .setValidators(
          Validators.compose([
            Validators.minLength(10),
            Validators.maxLength(25),
            Validators.pattern('[a-zA-z0-9]*'),
            Validators.required,
          ])
        );
      this.postsanction
        .get('yearOfMan')
        .setValidators(
          Validators.compose([
            Validators.minLength(4),
            Validators.maxLength(4),
            Validators.pattern('[0-9]*'),
            Validators.required,
          ])
        );
      this.postsanction
        .get('registrationDate')
        .setValidators(Validators.required);
      this.postsanction.get('vehicleAge').setValidators(Validators.required);
      this.postsanction.get('hypothecation').setValidators(Validators.required);
      this.postsanction.get('noofOwner').setValidators(Validators.required);
      this.postsanction
        .get('kmDriven')
        .setValidators(
          Validators.compose([
            Validators.pattern('[0-9]*'),
            Validators.required,
          ])
        );
      this.postsanction
        .get('dealerQuotation')
        .setValidators(
          Validators.compose([
            Validators.pattern('[0-9]*'),
            Validators.required,
          ])
        );
      this.postsanction
        .get('obv')
        .setValidators(
          Validators.compose([
            Validators.pattern('[0-9]*'),
            Validators.required,
          ])
        );
      this.postsanction
        .get('assetPrice')
        .setValidators(
          Validators.compose([
            Validators.pattern('[0-9]*'),
            Validators.required,
          ])
        );
      this.postsanction.get('assetAge').setValidators(Validators.required);

      this.postsanction.get('cc').updateValueAndValidity();
      this.postsanction.get('rcNo').updateValueAndValidity();
      this.postsanction.get('engineNo').updateValueAndValidity();
      this.postsanction.get('chassisNo').updateValueAndValidity();
      this.postsanction.get('yearOfMan').updateValueAndValidity();
      this.postsanction.get('registrationDate').updateValueAndValidity();
      this.postsanction.get('vehicleAge').updateValueAndValidity();
      this.postsanction.get('hypothecation').updateValueAndValidity();
      this.postsanction.get('noofOwner').updateValueAndValidity();
      this.postsanction.get('kmDriven').updateValueAndValidity();
      this.postsanction.get('dealerQuotation').updateValueAndValidity();
      this.postsanction.get('obv').updateValueAndValidity();
      this.postsanction.get('assetPrice').updateValueAndValidity();
      this.postsanction.get('assetAge').updateValueAndValidity();

      this.postsanction.get('onroadPrice').clearValidators();
      this.postsanction.get('onroadPrice').updateValueAndValidity();
    }
  }

  getCreditFlowGroup() {
    this.sqliteProvider
      .getVehicleWorkflowList('Disbursement Activities')
      .then((creditDesc) => {
        this.creditFlowGroup = creditDesc[0];
      });
  }

  getApplicantDataforPostSanction() {
    this.sqlSupport
      .getPostSanctionDetails(this.refId, this.id)
      .then((postSanction) => {
        if (postSanction.length > 0) {
          this.globalData.globalLodingDismiss();
          this.sqliteProvider
            .getApplicantDataforPostSanction(this.userInfo.refId)
            .then((data) => {
              if (data.length > 0) {
                this.globalData.globalLodingDismiss();
                this.getProductValueLoanAmt(data[0].prdSche);
                this.onroadPrices = data[0].onroadPrice;
                this.assetRoadPrice = data[0].assetPrice;
                let onroadPrice = data[0];
                if (data[0].lsoFlag == 'Y') {
                  this.sanctionModify = '2';
                  this.disableModify = true;
                } else {
                  this.disableModify = false;
                }
                this.globalData.globalLodingPresent('Please wait...');
                setTimeout(() => {
                  this.globalData.globalLodingDismiss();
                }, 2000);
                this.postSanId = postSanction[0].postSanId;
                if (
                  postSanction[0].groupInboxFlag == 'Y' ||
                  postSanction[0].modified == '1'
                ) {
                  this.PropNo = postSanction[0].applicationNumber;
                  this.segmentType = postSanction[0].segment;
                  this.valuesModified = postSanction[0].valuesModified;
                  this.undoPropsal = postSanction[0].undoProposal;
                  this.savedTenure = postSanction[0].tenure;
                  this.savedModel = postSanction[0].model;
                  this.savedDownPayment = +postSanction[0].downpayment;
                  this.savedVariant = postSanction[0].variant;
                  this.savedDbDate = postSanction[0].dbDate;
                  this.savedAdvanceEmi = postSanction[0].advanceEmi
                    ? postSanction[0].advanceEmi
                    : data[0].advanceEmi;
                  //used
                  this.savedCC = postSanction[0].cc;
                  this.savedRcNo = postSanction[0].rcNo;
                  this.savedEngineNo = postSanction[0].engineNo;
                  this.savedChassisNo = postSanction[0].chassisNo;
                  this.savedYearOfMan = postSanction[0].yearOfMan;
                  this.savedRegistrationDate = postSanction[0].registrationDate;
                  this.savedVehicleAge = postSanction[0].vehicleAge;
                  this.savedHypothecation = postSanction[0].hypothecation;
                  this.savedNoofOwner = postSanction[0].noofOwner;
                  this.savedKmDriven = postSanction[0].kmDriven;
                  this.savedDealerQuotation = postSanction[0].dealerQuotation;
                  this.savedObv = postSanction[0].obv;
                  this.savedAssetPrice = postSanction[0].assetPrice;
                  this.savedAssetAge = postSanction[0].assetAge;

                  if (postSanction[0].groupInboxFlag == 'Y') {
                    if (
                      this.globalData.checkIsJson(postSanction[0].dealerName)
                    ) {
                      if (
                        typeof JSON.parse(postSanction[0].dealerName) ===
                        'object'
                      ) {
                        this.dealerNameTemp = this.dummy_masterDealer.find(
                          (val) => val.dealerCode == postSanction[0].dealerName
                        );
                      } else {
                        this.dealerNameTemp = this.dummy_masterDealer.find(
                          (val) => val.dealerCode == postSanction[0].dealerName
                        );
                      }
                    } else {
                      this.dealerNameTemp = this.dummy_masterDealer.find(
                        (val) => val.dealerCode == postSanction[0].dealerName
                      );
                    }
                  } else {
                    this.dealerNameTemp = this.dummy_masterDealer.find(
                      (val) => val.dealerCode == postSanction[0].dealerName
                    );
                  }
                  this.savedDealerName = this.dealerNameTemp.dealerCode;
                  if (
                    !this.dealerNameTemp.dealerName
                      .toLowerCase()
                      .includes('beepKart pvt ltd'.toLowerCase()) ||
                    !this.dealerNameTemp.dealerName
                      .toLowerCase()
                      .includes('drivex mobility private limited'.toLowerCase())
                  ) {
                    this.obvEditable = true;
                  }
                  this.savedBrandName = postSanction[0].brandName;
                  this.postsanction
                    .get('dealerName')
                    .setValue(this.dealerNameTemp.dealerCode);
                  this.postsanction
                    .get('vehicleCatogery')
                    .setValue(postSanction[0].vehicleCatogery);
                  this.postsanction
                    .get('brandName')
                    .setValue(postSanction[0].brandName);
                  // this.getModelbasedOnBrand();
                  this.postsanction
                    .get('loanAmount')
                    .setValue(postSanction[0].loanAmount);
                  this.postsanction
                    .get('tenure')
                    .setValue(postSanction[0].tenure);
                  this.postsanction
                    .get('model')
                    .setValue(postSanction[0].model);
                  // this.getVariantbasedOnModel();
                  this.postsanction
                    .get('variant')
                    .setValue(postSanction[0].variant);
                  this.getPriceBasedOnVariant('Y', this.onroadPrices);
                  this.postsanction
                    .get('segment')
                    .setValue(postSanction[0].segment);
                  this.postsanction
                    .get('totalloanAmount')
                    .setValue(postSanction[0].totalloanAmount);
                  this.postsanction
                    .get('advanceEmi')
                    .setValue(this.savedAdvanceEmi);
                  this.postsanction
                    .get('dbDate')
                    .setValue(postSanction[0].dbDate);
                  // this.postsanction.get('onroadPrice').setValue(postSanction[0].onroadPrice);
                  this.postsanction
                    .get('onroadPrice')
                    .setValue(this.onroadPrices);
                  // this.postsanction.get('onroadPrice').setValue(this.vehicleType == 'N' ? postSanction[0].onroadPrice : postSanction[0].assetPrice);

                  //used
                  this.postsanction.get('cc').setValue(postSanction[0].cc);
                  this.postsanction.get('rcNo').setValue(postSanction[0].rcNo);
                  this.postsanction
                    .get('engineNo')
                    .setValue(postSanction[0].engineNo);
                  this.postsanction
                    .get('chassisNo')
                    .setValue(postSanction[0].chassisNo);
                  this.postsanction
                    .get('nameAsPerRC')
                    .setValue(postSanction[0].nameAsPerRC);
                  this.postsanction
                    .get('yearOfMan')
                    .setValue(postSanction[0].yearOfMan);
                  this.orpAuthFetch('variant', postSanction[0].brandName);
                  this.postsanction
                    .get('variant')
                    .setValue(postSanction[0].variant);
                  this.postsanction
                    .get('registrationDate')
                    .setValue(postSanction[0].registrationDate);
                  this.postsanction
                    .get('vehicleAge')
                    .setValue(postSanction[0].vehicleAge);
                  this.postsanction
                    .get('hypothecation')
                    .setValue(postSanction[0].hypothecation);
                  this.postsanction
                    .get('noofOwner')
                    .setValue(postSanction[0].noofOwner);
                  this.postsanction
                    .get('kmDriven')
                    .setValue(postSanction[0].kmDriven);
                  this.postsanction
                    .get('dealerQuotation')
                    .setValue(postSanction[0].dealerQuotation);
                  this.postsanction.get('obv').setValue(postSanction[0].obv);
                  this.postsanction
                    .get('assetPrice')
                    .setValue(postSanction[0].assetPrice);
                  this.postsanction
                    .get('assetAge')
                    .setValue(postSanction[0].assetAge);
                  this.vehicleType !== 'N' ? this.finalAssetPrice() : '';
                  this.orpAuthFetch('category');
                  this.postsanction
                    .get('dealerQuotation')
                    .setValue(postSanction[0].dealerQuotation);
                } else {
                  this.getApplicantDataforPost();
                }
              } else {
                this.globalData.globalLodingDismiss();
              }
            });
        } else {
          this.globalData.globalLodingDismiss();
          this.getApplicantDataforPost();
        }
      })
      .then((data) => {
        this.globalData.globalLodingDismiss();
        this.getSanctionandEligibleAmount();
      });
  }

  getSanctionandEligibleAmount() {
    this.sqliteProvider
      .getApplicantDataforPostSanction(this.userInfo.refId)
      .then((submitData) => {
        this.savedEligibleLoanAmount = +submitData[0].eligibleAmt;
        this.savedSanctionLoanAmount = +submitData[0].sanctionedAmt;
      });
  }

  getApplicantDataforPost() {
    this.sqliteProvider
      .getApplicantDataforPostSanction(this.userInfo.refId)
      .then((data) => {
        if (data.length > 0) {
          this.PropNo = data[0].applicationNumber;
          this.segmentType = data[0].segmentType;
          this.savedEligibleLoanAmount = +data[0].eligibleAmt;
          this.savedSanctionLoanAmount = +data[0].sanctionedAmt;
          this.savedTenure = data[0].tenure;
          this.savedModel = data[0].model;
          this.savedDownPayment = +data[0].downpayment;
          this.savedVariant = data[0].variant;
          this.savedDbDate = data[0].dbDate;
          this.savedAdvanceEmi = data[0].advanceEmi;
          //used
          this.savedCC = data[0].cc;
          this.savedRcNo = data[0].rcNo;
          this.savedEngineNo = data[0].engineNo;
          this.savedChassisNo = data[0].chassisNo;
          this.savedYearOfMan = data[0].yearOfMan;
          this.savedRegistrationDate = data[0].registrationDate;
          this.savedVehicleAge = data[0].vehicleAge;
          this.savedHypothecation = data[0].hypothecation;
          this.savedNoofOwner = data[0].noofOwner;
          this.savedKmDriven = data[0].kmDriven;
          this.savedDealerQuotation = data[0].dealerQuotation;
          this.savedObv = data[0].obv;
          this.savedAssetPrice = data[0].assetPrice;
          this.savedAssetAge = data[0].assetAge;

          this.dealerNameTemp = this.dummy_masterDealer.find(
            (val) => val.dealerCode == data[0].dealerName
          );
          // this.vehicleBrand = this.vehicleBrands.find(val => val.optionValue == data[0].brandName);
          this.getProductValueLoanAmt(data[0].prdSche);
          // this.getModelbasedOnBrand();
          if (
            !this.dealerNameTemp.dealerName
              .toLowerCase()
              .includes('beepKart pvt ltd'.toLowerCase()) ||
            !this.dealerNameTemp.dealerName
              .toLowerCase()
              .includes('drivex mobility private limited'.toLowerCase())
          ) {
            this.obvEditable = true;
          }
          this.postsanction.get('loanAmount').setValue(data[0].sanctionedAmt);
          this.postsanction.get('tenure').setValue(data[0].tenure);
          this.postsanction
            .get('dealerName')
            .setValue(this.dealerNameTemp.dealerCode);
          this.postsanction
            .get('vehicleCatogery')
            .setValue(data[0].vehicleCatogery);
          this.postsanction.get('brandName').setValue(data[0].brandName);
          this.postsanction.get('model').setValue(data[0].model);
          // this.getVariantbasedOnModel();
          this.postsanction.get('variant').setValue(data[0].variant);
          this.getPriceBasedOnVariant('Y', data[0].onroadPrice);
          this.onroadPrices = data[0].onroadPrice;
          this.assetRoadPrice = data[0].assetPrice;
          this.postsanction.get('segment').setValue(data[0].segmentType);
          this.savedDealerName = this.dealerNameTemp.dealerCode;
          this.savedBrandName = data[0].brandName;
          this.prevOnroadPrice = data[0].onroadPrice;
          this.postsanction.get('advanceEmi').setValue(data[0].advanceEmi);
          this.postsanction.get('dbDate').setValue(data[0].dbDate);
          this.postsanction.get('onroadPrice').setValue(data[0].onroadPrice);
          // this.postsanction.get('onroadPrice').setValue(this.vehicleType == 'N' ? data[0].onroadPrice : data[0].assetPrice);

          //used
          this.postsanction.get('cc').setValue(data[0].cc);
          this.postsanction.get('rcNo').setValue(data[0].rcNo);
          this.postsanction.get('engineNo').setValue(data[0].engineNo);
          this.postsanction.get('chassisNo').setValue(data[0].chassisNo);
          this.postsanction.get('nameAsPerRC').setValue(data[0].nameAsPerRC);
          this.postsanction.get('yearOfMan').setValue(data[0].yearOfMan);
          this.orpAuthFetch('variant', data[0].brandName);
          this.postsanction.get('variant').setValue(data[0].variant);
          this.postsanction
            .get('registrationDate')
            .setValue(data[0].registrationDate);
          this.postsanction.get('vehicleAge').setValue(data[0].vehicleAge);
          this.postsanction
            .get('hypothecation')
            .setValue(data[0].hypothecation);
          this.postsanction.get('noofOwner').setValue(data[0].noofOwner);
          this.postsanction.get('kmDriven').setValue(data[0].kmDriven);
          this.postsanction
            .get('dealerQuotation')
            .setValue(data[0].dealerQuotation);
          this.postsanction.get('obv').setValue(data[0].obv);
          this.postsanction.get('assetPrice').setValue(data[0].assetPrice);
          this.postsanction.get('assetAge').setValue(data[0].assetAge);
          this.vehicleType !== 'N' ? this.finalAssetPrice() : '';
          this.calculateVehicleAge();
          this.preEmiIncudeCheck(data[0]);
          this.orpAuthFetch('category');
          this.postsanction
            .get('dealerQuotation')
            .setValue(data[0].dealerQuotation);
        }
      });
  }

  setDbDateValue(event) {
    if (event.detail.value == '2') {
      let dd = this.todayDate.getDate();
      let mm = this.todayDate.getMonth() + 1; //January is 0!
      let yyyy = this.todayDate.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      let todaydateVal = yyyy + '-' + mm + '-' + dd;
      this.postsanction.controls.dbDate.setValue(todaydateVal);
    }
  }

  lessThaneligible: any;
  postsanctionSave(value) {
    this.changesStatusCheck();
    // if (this.postsanction.controls.dbDate.value >= this.mindate) {
    if (
      this.sanctionModify == 2 ||
      (this.sanctionModify == 1 &&
        +this.postsanction.get('loanAmount').value <=
          this.savedSanctionLoanAmount) ||
      this.postsanction.controls.dbDate.value >= this.mindate
    ) {
      if (
        (!this.ModelModified &&
          !this.DealerNameModified &&
          !this.BrandNameModified &&
          !this.VariantModified &&
          !this.segmentModified &&
          !this.ccModified &&
          !this.rcNoModified &&
          !this.engineNoModified &&
          !this.chassisNoModified &&
          !this.yearOfManModified &&
          !this.registrationDateModified &&
          !this.vehicleAgeModified &&
          !this.hypothecationModified &&
          !this.noofOwnerModified &&
          !this.kmDrivenModified &&
          !this.dealerQuotationModified &&
          !this.obvModified &&
          !this.assetPriceModified &&
          !this.assetAgeModified) ||
        this.postsanction.controls.dbDate.value >= this.mindate
      ) {
        if (
          +this.postsanction.controls.loanAmount.value < this.loanAmountFrom
        ) {
          this.alertService.showAlert(
            'Alert!',
            'You must enter the minimum loan amount of ' + this.loanAmountFrom
          );
        } else {
          let segmentFlag = 'N';
          if (this.sanctionModify == 1) {
            this.postsanction.controls.onroadPrice.setValue(
              value.onroadPrice ? value.onroadPrice : this.newOnRoadPrice
            );
            this.postsanction.controls.onroadPrice.updateValueAndValidity();
            if (this.postsanction.valid) {
              if (
                +this.postsanction.get('loanAmount').value >
                  this.savedEligibleLoanAmount ||
                (+this.postsanction.get('loanAmount').value !=
                  this.savedSanctionLoanAmount &&
                  +this.postsanction.get('loanAmount').value <=
                    this.savedEligibleLoanAmount)
              ) {
                if (
                  +this.postsanction.get('loanAmount').value <=
                  this.savedEligibleLoanAmount
                ) {
                  let loanAmount = +this.postsanction.get('loanAmount').value;
                  this.sqliteProvider.updateBasicDetailsinPostSanction(
                    loanAmount,
                    this.refId,
                    this.id
                  );
                  this.lessThaneligible = true;
                } else {
                  let loanAmount = +this.postsanction.get('loanAmount').value;
                  this.sqliteProvider.updateBasicDetailsinPostSanction(
                    loanAmount,
                    this.refId,
                    this.id
                  );
                  // this.lessThaneligible = false;
                }
                this.LoanAmountModified = true;
                this.savedLoanAmountDesc = 'Loan Amount,';
              } else {
                this.LoanAmountModified = false;
                this.savedLoanAmountDesc = '';
              }
              if (this.postsanction.get('tenure').value != this.savedTenure) {
                this.TenureModified = true;
                this.savedTenureDesc = 'Tenure,';
              } else {
                this.TenureModified = false;
                this.savedTenureDesc = '';
              }
              if (
                this.globalData.convertToString(
                  this.postsanction.get('brandName').value
                ) != this.savedBrandName
              ) {
                this.BrandNameModified = true;
                this.savedBrandNameDesc = 'Brand Name,';
              } else {
                this.BrandNameModified = false;
                this.savedBrandNameDesc = '';
              }
              if (
                this.globalData.convertToString(
                  this.postsanction.get('model').value
                ) != this.savedModel
              ) {
                this.ModelModified = true;
                this.savedModelDesc = 'Model,';
              } else {
                this.ModelModified = false;
                this.savedModelDesc = '';
              }
              if (
                this.globalData.convertToString(
                  this.postsanction.get('variant').value
                ) != this.savedVariant
              ) {
                this.VariantModified = true;
                this.savedVariantDesc = 'Variant,';
              } else {
                this.VariantModified = false;
                this.savedVariantDesc = '';
              }
              if (
                +this.postsanction.get('downpayment').value !=
                this.savedDownPayment
              ) {
                this.DownPaymentModified = true;
                this.savedDownPaymentDesc = 'Down Payment,';
              } else {
                this.DownPaymentModified = false;
                this.savedDownPaymentDesc = '';
              }
              if (this.postsanction.get('segment').value != this.segmentType) {
                this.segmentModified = true;
              } else {
                this.segmentModified = false;
              }
              if (this.postsanction.get('dbDate').value != this.savedDbDate) {
                this.dbDateModified = true;
              } else {
                this.dbDateModified = false;
              }
              if (
                this.postsanction.get('dealerName').value !=
                this.savedDealerName
              ) {
                this.DealerNameModified = true;
              } else {
                this.DealerNameModified = false;
              }

              //used
              if (this.postsanction.get('cc').value != this.savedCC) {
                this.ccModified = true;
                this.savedCCDesc = 'CC,';
              } else {
                this.ccModified = false;
                this.savedCCDesc = '';
              }
              if (this.postsanction.get('rcNo').value != this.savedRcNo) {
                this.rcNoModified = true;
                this.savedRcNoDesc = 'RcNo,';
              } else {
                this.rcNoModified = false;
                this.savedRcNoDesc = '';
              }
              if (
                this.postsanction.get('engineNo').value != this.savedEngineNo
              ) {
                this.engineNoModified = true;
                this.savedEngineNoDesc = 'EngineNo,';
              } else {
                this.engineNoModified = false;
                this.savedEngineNoDesc = '';
              }
              if (
                this.postsanction.get('chassisNo').value != this.savedChassisNo
              ) {
                this.chassisNoModified = true;
                this.savedChasisNoDesc = 'ChassisNo,';
              } else {
                this.chassisNoModified = false;
                this.savedChasisNoDesc = '';
              }
              if (
                this.postsanction.get('yearOfMan').value != this.savedYearOfMan
              ) {
                this.yearOfManModified = true;
                this.savedYearOfManDesc = 'YearOfManufacture,';
              } else {
                this.yearOfManModified = false;
                this.savedYearOfManDesc = '';
              }
              if (
                this.postsanction.get('registrationDate').value !=
                this.savedRegistrationDate
              ) {
                this.registrationDateModified = true;
                this.savedRegistrationDesc = 'RegistrationDate,';
              } else {
                this.registrationDateModified = false;
                this.savedRegistrationDesc = '';
              }
              if (
                this.postsanction.get('vehicleAge').value !=
                this.savedVehicleAge
              ) {
                this.vehicleAgeModified = true;
                this.savedVehicleAgeDesc = 'VehicleAge,';
              } else {
                this.vehicleAgeModified = false;
                this.savedVehicleAgeDesc = '';
              }
              if (
                this.postsanction.get('hypothecation').value !=
                this.savedHypothecation
              ) {
                this.hypothecationModified = true;
                this.savedHypothecationDesc = 'Hypothecation,';
              } else {
                this.hypothecationModified = false;
                this.savedHypothecationDesc = '';
              }
              if (
                this.postsanction.get('noofOwner').value != this.savedNoofOwner
              ) {
                this.noofOwnerModified = true;
                this.savedNoOfOwnerDesc = 'NoOfOwner,';
              } else {
                this.noofOwnerModified = false;
                this.savedNoOfOwnerDesc = '';
              }
              if (
                this.postsanction.get('kmDriven').value != this.savedKmDriven
              ) {
                this.kmDrivenModified = true;
                this.savedkmDrivenDesc = 'kmDriven,';
              } else {
                this.kmDrivenModified = false;
                this.savedkmDrivenDesc = '';
              }
              if (
                this.postsanction.get('dealerQuotation').value !=
                this.savedDealerQuotation
              ) {
                this.dealerQuotationModified = true;
                this.savedDealerQuotationDesc = 'DealerQuotation,';
              } else {
                this.dealerQuotationModified = false;
                this.savedDealerQuotationDesc = '';
              }
              if (this.postsanction.get('obv').value != this.savedObv) {
                this.obvModified = true;
                this.savedObvDesc = 'Obv,';
              } else {
                this.obvModified = false;
                this.savedObvDesc = '';
              }
              if (
                this.postsanction.get('assetPrice').value !=
                this.savedAssetPrice
              ) {
                this.assetPriceModified = true;
                this.savedAssetPriceDesc = 'AssetPrice,';
              } else {
                this.assetPriceModified = false;
                this.savedAssetPriceDesc = '';
              }
              if (
                this.postsanction.get('assetAge').value != this.savedAssetAge
              ) {
                this.assetAgeModified = true;
                this.savedAssetAgeDesc = 'AssetAge,';
              } else {
                this.assetAgeModified = false;
                this.savedAssetAgeDesc = '';
              }

              if (
                this.LoanAmountModified ||
                this.ModelModified ||
                this.BrandNameModified ||
                this.VariantModified ||
                this.ccModified ||
                this.rcNoModified ||
                this.engineNoModified ||
                this.chassisNoModified ||
                this.yearOfManModified ||
                this.registrationDateModified ||
                this.vehicleAgeModified ||
                this.hypothecationModified ||
                this.noofOwnerModified ||
                this.kmDrivenModified ||
                this.dealerQuotationModified ||
                this.obvModified ||
                this.assetPriceModified ||
                this.assetAgeModified
              ) {
                let messages =
                  this.savedLoanAmountDesc +
                  '' +
                  this.savedBrandNameDesc +
                  '' +
                  this.savedModelDesc +
                  '' +
                  this.savedVariantDesc +
                  '' +
                  this.savedCCDesc +
                  '' +
                  this.savedRcNoDesc +
                  '' +
                  this.savedEngineNoDesc +
                  '' +
                  this.savedChasisNoDesc +
                  '' +
                  this.savedYearOfManDesc +
                  '' +
                  this.savedRegistrationDesc +
                  '' +
                  this.savedVehicleAgeDesc +
                  '' +
                  this.savedHypothecationDesc +
                  '' +
                  this.savedNoOfOwnerDesc +
                  '' +
                  this.savedkmDrivenDesc +
                  '' +
                  this.savedDealerQuotationDesc +
                  '' +
                  this.savedObvDesc +
                  '' +
                  this.savedAssetPriceDesc +
                  '' +
                  this.savedAssetAgeDesc;
                if (this.lessThaneligible == true) {
                  this.valuesModified = 'Y';
                  this.loanFacilitiesServiceCall(value);
                } else {
                  this.alertService
                    .confirmationAlert(
                      'Alert',
                      `${messages} value(s) modified,Would you like to proceed?. If Yes, should re run the score card?`
                    )
                    .then((data) => {
                      if (data) {
                        this.valuesModified = 'Y';
                        this.loanFacilitiesServiceCall(value);
                      } else {
                        this.valuesModified = 'N';
                        this.getApplicantDataforPostSanction();
                      }
                    });
                }
              } else {
                this.valuesModified = 'N';
                this.loanFacilitiesServiceCall(value);
              }
            } else {
              this.alertService.showAlert(
                'Alert!',
                'Please fill all mandatory fields!'
              );
            }
          } else {
            this.postSanctionCheck = true;
            this.alertService.showAlert(
              'Alert!',
              'Post sanction modification successful!'
            );
            this.sqlSupport
              .insertPostSanctionDetails(
                this.refId,
                this.id,
                value,
                this.PropNo,
                this.sanctionModify,
                segmentFlag,
                this.valuesModified,
                this.valuesModified == 'Y' ? 'Y' : 'N',
                this.psmSubmitted ? 'Y' : 'N',
                this.postSanId
              )
              .then((data) => {
                this.getApplicantDataforPostSanction();
              });
          }
        }
      } else {
        this.alertService.showAlert(
          'Alert!',
          'The DB Date should be greater than the system date so kindly change the DB Date'
        );
      }
    } else {
      this.alertService.showAlert(
        'Alert!',
        'The DB Date should be greater than the system date so kindly change the DB Date'
      );
    }
  }

  retry = 0;
  psmnotChanged = false;

  postSanctionServiceCall(value) {
    let segmentFlag = 'N';
    if (
      this.valuesModified == 'Y' ||
      this.segmentModified ||
      this.TenureModified ||
      this.dbDateModified ||
      this.DealerNameModified
    ) {
      this.globalData.globalLodingPresent('Please wait...');
      if (this.segmentType == value.segment) {
        segmentFlag = 'N';
      } else {
        segmentFlag = 'Y';
      }
      let body = {
        PropNo: this.PropNo,
        ...((this.LoanAmountModified || this.LoanAmtHigherThanSancAmt) && {
          lpsdSaleRecAmtNewVal: value.loanAmount,
        }),
        ...(this.TenureModified && { lpsdTenorNewVal: value.tenure }),
        ...(this.BrandNameModified && {
          lpsdCategory: value.vehicleCatogery.toString(),
        }),
        ...(this.BrandNameModified && {
          lpsdVehicleModelNewVal: value.brandName.toString(),
        }),
        ...(this.ModelModified && { lpsdModelDetail: value.model.toString() }),
        ...(this.VariantModified && {
          lpsdModelVariant: value.variant.toString(),
        }),
        ...(this.DownPaymentModified && {
          lpsdDownPmtNewVal: value.downpayment,
        }),
        ...(this.segmentModified && { lpsdSegmentTypeNewVal: value.segment }),
        ...(this.DealerNameModified && { lpsdDealerNewVal: value.dealerName }),
        lpsdUpmodifyCheck: segmentFlag,
        lpsdApiFlag: value.apiFlag,
      };
      console.log(body, 'post sanction');
      this.master.restApiCallAngular('postsancmodification', body).then(
        (res) => {
          let sanctionRes = <any>res;
          if (sanctionRes.ErrorCode == '000') {
            this.postSanctionCheck = true;
            if (this.valuesModified == 'Y') {
              this.psmSubmitted = false;
            } else {
              this.psmSubmitted = true;
            }
            this.disableEditBtn = false;
            value.dbDate = this.postsanction.get('dbDate').value;
            value.preEmiDB = this.applicantDetails[0].preEmiDB;
            value.totalloanAmount =
              this.postsanction.get('totalloanAmount').value;

            this.sqlSupport.insertPostSanctionDetails(
              this.refId,
              this.id,
              value,
              this.PropNo,
              this.sanctionModify,
              segmentFlag,
              this.valuesModified,
              this.valuesModified == 'Y' ? 'Y' : 'N',
              this.psmSubmitted ? 'Y' : 'N',
              this.postSanId
            );
            this.sqlSupport.updatePostSanctionStatus(this.PropNo);
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Post sanction modification successful!.Proceed further.'
            );
            // this.submitDisable = true;
            this.getPostSanctionModifications();
            this.loadAllApplicantDetails();
            this.getApplicantDataforPostSanction();
          } else {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert('Alert', sanctionRes.ErrorDesc);
          }
        },
        (err) => {
          this.globalData.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      );
    } else {
      this.postSanctionCheck = true;
      this.alertService.showAlert('Alert!', 'No values modified.');
    }
  }

  async undoProposalServiceCall(flag) {
    // manual
    if (this.undoPropsal == 'Y') {
      if (flag == 'manual') {
        this.ManualApprovalCall();
      } else {
        this.fieldInvestigationCall();
      }
    } else {
      let popover = await this.modalCtrl.create({
        component: RemarksComponent,
        componentProps: {
          data: this.PropNo,
          showBackdrop: true,
          enableBackdropDismiss: true,
          cssClass: 'modalCss',
        },
      });
      popover.onDidDismiss().then((remarks) => {
        if (remarks) {
          this.globalData.globalLodingPresent('Please wait...');
          let body = {
            propNo: this.PropNo,
            UserID: this.applicantDetails[0].createdUser,
            undoRemark: remarks.data,
          };
          this.master.restApiCallAngular('UndoProposal', body).then(
            (res) => {
              let undoPropRes = <any>res;
              if (undoPropRes.ErrorCode == '000') {
                if (flag == 'manual') {
                  this.ManualApprovalCall();
                } else {
                  this.fieldInvestigationCall();
                }
                this.globalData.globalLodingDismiss();
                this.sqlSupport.updateUndoProposal(this.refId, this.id);
                // this.alertService.showAlert("Alert!", undoPropRes.ErrorDesc);
              } else {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert', undoPropRes.ErrorDesc);
              }
            },
            (err) => {
              this.globalData.globalLodingDismiss();
              if (err.name == 'TimeoutError') {
                this.alertService.showAlert('Alert!', err.message);
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  'No response from server!'
                );
              }
            }
          );
        }
      });
      return await popover.present();
    }
  }

  scoreCardReRun() {
    this.globalData.globalLodingPresent('Please wait...');
    let body = {
      propNo: this.applicantDetails[0].applicationNumber,
      productId: this.applicantDetails[0].janaLoan,
      custId: this.applicantDetails[0].LpCustid,
    };
    this.master.restApiCallAngular('scorecard', body).then(
      (res) => {
        // if (this.missingAmount !== undefined) {
        //   this.sqlSupport.updateMissingValuesInPS(this.missingAmount, this.refId, this.id);
        // }
        let scoreResponse = <any>res;
        if (scoreResponse.errorCode == '000') {
          if (this.vehicleType !== 'N') {
            if (scoreResponse.SRFLAG == 'N') {
              PostSanctionPage.prototype.scoreCardReRun;
              this.sqlSupport.updateEligibleAmout(
                '',
                this.applicantDetails[0].applicationNumber
              );
              this.sqlSupport.updatePostSanctionRerunFlags(
                scoreResponse.STPFLAG,
                scoreResponse.FIFLAG,
                'scoreCard',
                this.refId,
                this.id,
                scoreResponse.STPFLAG,
                scoreResponse.SRFLAG,
                scoreResponse.NTCFLAG,
                scoreResponse.FIENTRY
              );
              this.globalData.globalLodingDismiss();
              this.getPostSanctionModifications(true);
              this.getSanctionandEligibleAmount();
              scoreResponse.NTCFLAG == 'N'
                ? this.postSanctionWFBLForETC(scoreResponse, 3)
                : this.postSanctionWFBLForNTC(scoreResponse, 3);
            } else if (scoreResponse.SRFLAG == 'Y') {
              this.globalData.globalLodingDismiss();
              this.srFlageEnable();
            } else {
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert', scoreResponse.errorDesc);
            }
          } else {
            if (scoreResponse.SRFLAG == 'N') {
              PostSanctionPage.prototype.scoreCardReRun;
              this.sqlSupport.updateEligibleAmout(
                '',
                this.applicantDetails[0].applicationNumber
              );
              this.sqlSupport.updatePostSanctionRerunFlags(
                scoreResponse.STPFLAG,
                scoreResponse.FIFLAG,
                'scoreCard',
                this.refId,
                this.id,
                scoreResponse.STPFLAG,
                scoreResponse.SRFLAG,
                scoreResponse.NTCFLAG,
                scoreResponse.FIENTRY
              );
              this.globalData.globalLodingDismiss();
              this.getPostSanctionModifications(true);
              this.getSanctionandEligibleAmount();
              if (+this.postsanction.controls.loanAmount.value < 100000) {
                scoreResponse.NTCFLAG == 'N'
                  ? this.postSanctionWFBLForETC(scoreResponse, 1)
                  : this.postSanctionWFBLForNTC(scoreResponse, 1);
              } else {
                if (+this.postsanction.controls.loanAmount.value >= 150000) {
                  scoreResponse.NTCFLAG == 'N'
                    ? this.postSanctionWFBLForETC(scoreResponse, 3)
                    : this.postSanctionWFBLForNTC(scoreResponse, 3);
                } else {
                  //100000 to 149000
                  scoreResponse.NTCFLAG == 'N'
                    ? this.postSanctionWFBLForETC(scoreResponse, 2)
                    : this.postSanctionWFBLForNTC(scoreResponse, 2);
                }
              }
            } else if (scoreResponse.SRFLAG == 'Y') {
              this.globalData.globalLodingDismiss();
              this.srFlageEnable();
            } else {
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert', scoreResponse.errorDesc);
            }
          }
        } else {
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Alert', scoreResponse.errorDesc);
        }
      },
      (err) => {
        this.globalData.globalLodingDismiss();
        if (err.name == 'TimeoutError') {
          this.alertService.showAlert('Alert!', err.message);
        } else {
          this.alertService.showAlert('Alert!', 'No response from server!');
        }
      }
    );
  }

  srFlageEnable() {
    let data = {
      propNo: this.applicantDetails[0].applicationNumber,
      UserID: this.applicantDetails[0].createdUser,
      rejectionRemark: 'Rejected',
    };
    this.master
      .restApiCallAngular('proposalRejection', data)
      .then(
        (res) => {
          let rejectRes = <any>res;
          if (rejectRes.ErrorCode === '000') {
            this.sqlSupport
              .updateApplicationStatus('SR', this.refId)
              .then((data) => {
                this.globFunc.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert',
                  'This Proposal has been Rejected'
                );
                this.router.navigate(['/ExistApplicationsPage'], {
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              });
          }
        },
        (err) => {
          this.globFunc.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      )
      .catch((err) => console.log(err));
  }

  onUserChange(event) {
    let value = event.detail.value;
    this.selectedUserForManual = this.manualUserList.find(
      (data) => data.UserGroup == value
    );
  }

  ManualApprovalCall() {
    this.globFunc.globalLodingPresent(
      'Submitting for manual approval Please wait...'
    );
    let body = {
      userId: this.applicantDetails[0].createdUser,
      PropNo: this.applicantDetails[0].applicationNumber,
      nextFlowPoint: this.selectedUserForManual.flowPoint,
      GroupId: this.selectedUserForManual.UserGroup,
    };

    this.master
      .restApiCallAngular('mobileWorkflow', body)
      .then((res) => {
        let fieldInvesRes = <any>res;
        if (fieldInvesRes.ErrorCode === '000') {
          this.globFunc.globalLodingDismiss();
          this.disableManualApprvalBtn = true;
          this.sqlSupport.updateScorecardRerunStatus(
            'ManualApprovalStatus',
            this.refId,
            this.id
          );
          this.sqlSupport
            .updateManualApproval(
              this.applicantDetails[0].applicationNumber,
              'Y'
            )
            .then((data) => {
              this.router.navigate(['/ExistApplicationsPage'], {
                skipLocationChange: true,
                replaceUrl: true,
              });
            });
        } else {
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Alert', fieldInvesRes.ErrorDesc);
        }
      })
      .catch((err) => err);
  }

  fieldInvestigationCall() {
    this.globFunc.globalLodingPresent('Submitting for FI Please wait...');
    let body = {
      userId: this.applicantDetails[0].createdUser,
      PropNo: this.applicantDetails[0].applicationNumber,
      nextFlowPoint: this.fieldInspecFlowGroup.flowPoint,
      GroupId: this.fieldInspecFlowGroup.UserGroup,
    };

    this.master
      .restApiCallAngular('mobileWorkflow', body)
      .then(
        (res) => {
          let fieldInsRes = <any>res;
          if (fieldInsRes.ErrorCode === '000') {
            this.disableFISubmitBtn = true;
            this.sqlSupport.updateScorecardRerunStatus(
              'FieldInvStatus',
              this.refId,
              this.id
            );
            this.sqliteProvider
              .updateFIstatus(this.applicantDetails[0].applicationNumber, 'Y')
              .then((data) => {
                this.globFunc.globalLodingDismiss();
                this.router.navigate(['/ExistApplicationsPage'], {
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              });
          } else {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert('Alert', fieldInsRes.ErrorDesc);
          }
        },
        (err) => {
          this.globalData.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      )
      .catch((err) => err);
  }

  autoApprovalserviceCall() {
    this.globalData.globalLodingPresent('Submitting for auto approval...');
    let data = {
      propNo: this.applicantDetails[0].applicationNumber,
      custId: this.applicantDetails[0].LpCustid,
      leadId: this.applicantDetails[0].SfosLeadId,
      verifiedFlag: 'Y',
      userId: this.applicantDetails[0].createdUser, // Automatic
      businessName: 'retail',
    };
    this.master.restApiCallAngular('autoapproval', data).then(
      (res) => {
        let appData = <any>res;
        if (appData.errorCode === '000') {
          this.globalData.globalLodingDismiss();
          let sanctionAmt;
          let sanValue = appData.sanctionAmt.toString().split('.');
          if (sanValue[1] <= '49') {
            sanctionAmt = Math.floor(appData.sanctionAmt);
          } else {
            sanctionAmt = Math.ceil(appData.sanctionAmt);
          }

          let emiAmt;
          let emiAmtValue = appData.emi.toString().split('.');
          if (emiAmtValue[1] <= '49') {
            emiAmt = Math.floor(appData.emi);
          } else {
            emiAmt = Math.ceil(appData.emi);
          }

          if (+this.postsanction.get('loanAmount').value > sanctionAmt) {
            this.alertService.showAlert(
              'Alert',
              'Your Requested Loan Amount is Greater then Sanction Amount, So The LoanAmount calculation was based on the Sanctioned LoanAmount.'
            );
          }
          this.sqliteProvider
            .getApplicantDataforPostSanction(this.userInfo.refId)
            .then((data) => {
              this.postsanction.get('loanAmount').setValue(sanctionAmt);
              this.postsanction.get('loanAmount').updateValueAndValidity();
              this.insuranceLPICheck();
              this.getPriceBasedOnVariant('Y', data[0].onroadPrice);
              this.lpiCalculation();
              this.EMICalculation();
              this.downPaymentCalc();

              this.globalData.globalLodingPresent('loading..');
              setTimeout(() => {
                let body = {
                  PropNo: this.applicantDetails[0].applicationNumber,
                  UserID: this.applicantDetails[0].createdUser,
                  LoanDetails: {
                    ProductId: this.applicantDetails[0].janaLoan,
                    LoanType: this.getLoanType(
                      this.applicantDetails[0].janaLoan
                    ),
                    // "LoanAmnt":this.applicantDetails[0].loanAmount,
                    LoanAmnt: this.postsanction.get('loanAmount').value,
                    IntType: this.applicantDetails[0].interest,
                    LoanPurpose: this.applicantDetails[0].purpose,
                    Tenor: this.postsanction.get('tenure').value,
                    Installments: this.applicantDetails[0].installment,
                    // "RecomLoanamt":this.applicantDetails[0].loanAmount,
                    RecomLoanamt: this.postsanction.get('loanAmount').value,
                    PeriodOfInstal: this.applicantDetails[0].installment,
                    Refinance: this.applicantDetails[0].refinance,
                    HolidayPeriod: this.applicantDetails[0].holiday,
                    ModeofPayment: this.applicantDetails[0].repayMode,
                    prdMainCat: this.applicantDetails[0].prdSche,
                    prdSubCat: this.applicantDetails[0].janaLoan,
                    IntRate: this.applicantDetails[0].intRate,
                    Totaldownpay: this.postsanction.get('downpayment').value,
                    Insurancepremium: this.applicantDetails[0].insPremium,
                    DBAmount: this.applicantDetails[0].dbAmount,
                    Vehicletype: this.applicantDetails[0].vehicleType,
                    ElectricVehicle: this.applicantDetails[0].electricVehicle,
                    MarginMoney: this.postsanction.get('marginCost').value,
                    NachCharges: this.applicantDetails[0].nachCharges,
                    PddCharges: this.applicantDetails[0].pddCharges,
                    AdvanceEmiAmt: this.applicantDetails[0].advanceEmi,
                    AdvInstallment: this.applicantDetails[0].advavceInst,
                    SegmentType: this.postsanction.get('segment').value,
                    ProcessingFee: this.applicantDetails[0].processingFee,
                    GstPf: this.applicantDetails[0].gstonPf,
                    StampDuty: this.applicantDetails[0].stampDuty,
                    GstSdc: this.applicantDetails[0].gstonSdc,
                    GstNach: this.applicantDetails[0].gstonNach,
                    GstPdd: this.applicantDetails[0].gstonPddCharges,
                    DocCharges: this.applicantDetails[0].otherCharges,
                    GstotherCharges: this.applicantDetails[0].gstonOtherCharges,
                    EmiAmt: this.applicantDetails[0].emi,
                    BorrhealthIns: this.applicantDetails[0].borHealthIns,
                    CoborrhealthIns: this.applicantDetails[0].coBorHealthIns,
                    Preemi: '0',
                    Emimode: this.applicantDetails[0].emiMode,

                    DBdate: this.convertdate(
                      this.postsanction.get('dbDate').value
                    ),
                    PreEmiDB: this.applicantDetails[0].preEmiDB,
                    TotalLoanAmt:
                      this.postsanction.get('totalloanAmount').value,
                    onroadPrice: this.postsanction.get('onroadPrice').value,
                    //used
                    CC: this.postsanction.get('cc').value
                      ? this.postsanction.get('cc').value
                      : '',
                    UsedRcno: this.postsanction.get('rcNo').value
                      ? this.postsanction.get('rcNo').value
                      : '',
                    UsedEngineno: this.postsanction.get('engineNo').value
                      ? this.postsanction.get('engineNo').value
                      : '',
                    UsedChassisno: this.postsanction.get('chassisNo').value
                      ? this.postsanction.get('chassisNo').value
                      : '',
                    UsedYrsofmanufacture: this.postsanction.get('yearOfMan')
                      .value
                      ? this.postsanction.get('yearOfMan').value
                      : '',
                    UsedRegistrationdate: this.postsanction.get(
                      'registrationDate'
                    ).value
                      ? this.convertdate(
                          this.postsanction.get('registrationDate').value
                        )
                      : '',
                    UsedVehicleAge: this.postsanction.get('vehicleAge').value
                      ? this.postsanction.get('vehicleAge').value
                      : '',
                    UsedHypothecationstatus: this.postsanction.get(
                      'hypothecation'
                    ).value
                      ? this.postsanction.get('hypothecation').value
                      : '',
                    UsedNumberofowner: this.postsanction.get('noofOwner').value
                      ? this.postsanction.get('noofOwner').value
                      : '',
                    UsedKmdriven: this.postsanction.get('kmDriven').value
                      ? this.postsanction.get('kmDriven').value
                      : '',
                    UsedDealerquotation: this.postsanction.get(
                      'dealerQuotation'
                    ).value
                      ? this.postsanction.get('dealerQuotation').value
                      : '',
                    UsedOBV: this.postsanction.get('obv').value
                      ? this.postsanction.get('obv').value
                      : '',
                    UsedFinalassetprice: this.postsanction.get('assetPrice')
                      .value
                      ? this.postsanction.get('assetPrice').value
                      : '',
                    UsedAssetageatmaturity: this.postsanction.get('assetAge')
                      .value
                      ? this.postsanction.get('assetAge').value
                      : '',
                  },
                };
                this.master
                  .restApiCallAngular('LoanDetails', body)
                  .then(
                    (res) => {
                      // this.missingAmount = undefined;
                      // this.missingAmount = {
                      //   'advanceEmi': body.LoanDetails.AdvanceEmiAmt,
                      //   'processingFee': body.LoanDetails.ProcessingFee
                      // }
                      let loanFacilityRes = <any>res;
                      if (loanFacilityRes.ErrorCode === '000') {
                        this.globalData.globalLodingDismiss();
                        // this.alertService.showAlert('Alert',body.LoanDetails.AdvanceEmiAmt)
                        this.sqlSupport.upDateLoanFacilites(
                          body.LoanDetails,
                          this.refId,
                          this.id
                        );
                        this.sqlSupport.updateLoanAmountInPostSanction(
                          sanctionAmt,
                          this.refId,
                          this.id
                        );
                        this.sqliteProvider.updateBasicDetailsinPostSanction(
                          sanctionAmt,
                          this.refId,
                          this.id
                        );
                        this.sqlSupport.updateSanctionedAmount(
                          sanctionAmt,
                          this.applicantDetails[0].emi,
                          this.applicantDetails[0].applicationNumber
                        );
                        this.getApplicantDataforPostSanction();
                        this.sqlSupport.updateScorecardRerunStatus(
                          'autoApprovalStatus',
                          this.refId,
                          this.id
                        );
                        this.disableAutoApprovalBtn = true;
                        // if (this.missingAmount !== undefined) {
                        //   this.sqlSupport.updateMissingValuesInPS(this.missingAmount, this.refId, this.id)
                        // }
                        this.alertService.showAlert(
                          'Alert!',
                          appData.errorDesc ? appData.errorDesc : appData.status
                        );
                      } else {
                        this.alertService.showAlert(
                          'Alert',
                          loanFacilityRes.ErrorDesc
                        );
                      }
                    },
                    (err) => {
                      if (err) {
                        this.alertService.showAlert('Alert', err.message);
                      } else {
                        this.alertService.showAlert(
                          'Alert',
                          'No Response from Server!'
                        );
                      }
                    }
                  )
                  .catch((err) => err);
              }, 1000);
            });
        } else {
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Alert!', appData.errorDesc);
        }
      },
      (err) => {
        if (err) {
          this.alertService.showAlert('Alert', err.message);
        } else {
          this.alertService.showAlert('Alert', 'No Response from Server!');
        }
        this.globalData.globalLodingDismiss();
      }
    );
  }

  homepage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  async viewIdProof(doc, imgs) {
    let modal = await this.modalCtrl.create({
      component: PicproofPage,
      componentProps: {
        proofpics: imgs,
        disableDoc: this.disableDoc,
        postSancDoc: true,
      },
    });
    modal.onDidDismiss().then((data: any) => {
      let imgData = data.data;
      if (imgData && imgData.length > 0) {
        this.documents.filter((imgdoc) => {
          if (imgdoc.docId == doc.docId) {
            imgdoc.imgs = imgData;
          }
        });
        this.updateimg(doc.docId, imgData);
      } else {
        this.updateimg(doc.docId, imgData);
      }
      console.log(imgData, 'post dos');
    });
    modal.present();
  }

  updateimg(upid, imgData) {
    for (let i = 0; i < imgData.length; i++) {
      this.sqliteProvider
        .addPostSanctionImages(
          this.refId,
          this.id,
          imgData[i].imgpath,
          upid,
          imgData[i].postSanImgId
        )
        .then((data) => {
          if (i == imgData.length - 1) {
            this.getProofImg();
          }
        })
        .catch((Error) => {
          console.log('Failed!' + Error);
          this.alertService.showAlert('Alert!', 'Document Insert Failed!');
        });
    }
  }

  getProofImg() {
    for (let i = 0; i < this.documents.length; i++) {
      this.sqliteProvider
        .getPostSanctionImages(this.documents[i].docId, this.refId, this.id)
        .then((imgData) => {
          if (0 < imgData.length) {
            this.documents[i].imgs = [];
            this.documents.filter((imgdoc) => {
              if (imgdoc.docId == this.documents[i].docId) {
                for (let j = 0; j < imgData.length; j++) {
                  imgdoc.imgs.push(imgData[j]);
                }
              }
            });
            console.log(this.documents, 'this.documents');
          }
        })
        .catch((Error) => {
          console.log(Error);
        });
    }
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

  onSearch() {
    this.globalData.globalLodingPresent('Please wait...');
    setTimeout(() => {
      this.globalData.globalLodingDismiss();
    }, 3000);
  }

  async showPslPic() {
    let emodal = await this.modalCtrl.create({
      component: SignAnnexImgsPage,
      componentProps: { psl: this.pslImg, submitstatus: false },
    });
    emodal.onDidDismiss().then((data: any) => {
      console.log(data, 'psl img dismiss');
      this.pslImg = [];
      this.pslImg = data.data;
      this.pslImglen = data.length;
    });
    emodal.present();
  }

  loanCheckCBS() {
    if (!this.cbsButtonEnable) {
      this.alertService.showAlert(
        'Alert',
        'Please complete CBS Customer Creation'
      );
    } else if (!this.cbsCustomerEnable) {
      this.alertService.showAlert(
        'Alert',
        'Please complete CBS Customer Creation'
      );
    } else if (
      this.casaData == 'Y' &&
      !this.cbsAccountEnable &&
      this.casaValue.editedInPS != 'Y'
    ) {
      this.alertService.showAlert('Alert', 'Please complete Account Creation');
    } else if (
      this.casaData == 'Y' &&
      !this.instakitStatus &&
      this.casaValue.editedInPS != 'Y'
    ) {
      this.alertService.showAlert('Alert', 'Please complete Instakit Creation');
    } else {
      this.globFunc.globalLodingPresent('Please wait...');
      let body = {
        userId: this.applicantDetails[0].createdUser,
        PropNo: this.applicantDetails[0].applicationNumber,
        nextFlowPoint: this.creditFlowGroup.flowPoint, //109182uAT,109190local
        // "GroupId": "1556680"//1556680uat 1556671local
        GroupId: this.creditFlowGroup.UserGroup, //1556680uat 1556671local
      };
      this.master.restApiCallAngular('mobileWorkflow', body).then((res) => {
        let creditCheck = <any>res;
        if (creditCheck.ErrorCode === '000') {
          this.fowardCheck = false;
          this.sqlSupport.updateDisbursement(
            this.applicantDetails[0].applicationNumber
          );
          this.globFunc.globalLodingDismiss();
          this.enableEditAccStage = 0;
          this.alertService.showAlert('Alert', 'Successfully Forwarded');
          this.router.navigate(['/ExistApplicationsPage'], {
            skipLocationChange: true,
            replaceUrl: true,
          });
        } else {
          this.globFunc.globalLodingDismiss();
          this.alertService.showAlert('Alert', creditCheck.ErrorDesc);
        }
      });
    }
  }

  getProcessingFees() {
    this.sqliteProvider.getProcessingFees().then((data) => {
      this.processFeesData = data;
    });
  }

  calcProcessFess() {
    let subProduct = this.applicantDetails[0].janaLoan;
    let loanAmt = +this.postsanction.controls.loanAmount.value;
    if (loanAmt) {
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
          this.applicantDetails[0].processingFee =
            +processFeesAmt[0].minProcessingFee;
        } else if (+proceesPercentage >= +processFeesAmt[0].maxProcessingFee) {
          let charges;
          let chargesFormatValue = processFeesAmt[0].maxProcessingFee
            .toString()
            .split('.');
          if (chargesFormatValue[1] <= '49') {
            charges = Math.floor(+processFeesAmt[0].maxProcessingFee);
          } else {
            charges = Math.ceil(+processFeesAmt[0].maxProcessingFee);
          }
          this.applicantDetails[0].processingFee =
            +processFeesAmt[0].maxProcessingFee;
        } else {
          let charges;
          let chargesFormatValue = proceesPercentage.toString().split('.');
          if (chargesFormatValue[1] <= '49') {
            charges = Math.floor(+proceesPercentage);
          } else {
            charges = Math.ceil(+proceesPercentage);
          }
          this.applicantDetails[0].processingFee = +proceesPercentage;
          this.processingFeeinPs = +proceesPercentage;
        }
      } else {
        this.globalData.presentToastMiddle(
          'Processing fees values not configured!'
        );
      }
      this.gstCallForPF();
    }
  }

  gstCallForPF() {
    let processFee = this.applicantDetails[0].processingFee;
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
      this.applicantDetails[0].gstonPf = processingFeeCharges.toFixed(2);
    } else {
      if (processFee == 0) {
        this.applicantDetails[0].gstonPf = '0';
      } else {
        this.applicantDetails[0].gstonPf = '';
      }
    }
  }

  preEmiCalculation() {
    let loan = +this.postsanction.controls.loanAmount.value;
    let intRate = +this.applicantDetails[0].intRate;
    let preEmiDate = this.postsanction.controls.dbDate.value;

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
        // let preEmi = loan * ((intRate / 100) / 365) * (lastDay - currentDay);
        // let preEmiAmt;
        // let chargesFormatValue = preEmi.toString().split(".");
        // if (chargesFormatValue[1] <= "49") {
        //   preEmiAmt = Math.floor(preEmi);
        // } else {
        //   preEmiAmt = Math.ceil(preEmi);
        // }
        // this.applicantDetails[0].preEmi = 0;
      } else {
        // this.applicantDetails[0].preEmi = 0;
      }
    } else {
      // this.applicantDetails[0].preEmi = 0;
    }
    this.downPaymentCalc();
  }

  preEmiIncudeCheck(data) {
    if (data.preEmiDB == '1') {
      this.preEmiYesCalculation();
    } else if (data.preEmiDB == '2') {
      this.preEmiNoCalculation();
    }
  }

  preEmiYesCalculation() {
    let loanAmt = +this.postsanction.controls.loanAmount.value;
    let LPIAmt = +this.applicantDetails[0].insPremium;
    let advanceEmi = +this.applicantDetails[0].advanceEmi;
    // let advanceEmi = +this.postsanction.controls.advanceEmi.value;
    let totalLoanAmt = loanAmt + LPIAmt - advanceEmi;
    if (totalLoanAmt) {
      this.postsanction.controls.totalloanAmount.setValue(totalLoanAmt);
      this.postsanction.controls.totalloanAmount.updateValueAndValidity();
    }
  }

  preEmiNoCalculation() {
    let loanAmt = +this.postsanction.controls.loanAmount.value;
    let LPIAmt = +this.applicantDetails[0].insPremium;
    let advanceEmi = +this.applicantDetails[0].advanceEmi;
    let totalLoanAmt = loanAmt + LPIAmt - advanceEmi;
    if (totalLoanAmt) {
      this.postsanction.controls.totalloanAmount.setValue(totalLoanAmt);
      this.postsanction.controls.totalloanAmount.updateValueAndValidity();
    }
  }

  convertdate(str: string) {
    if (str.split('/')[0].length != 4) str = str.split('/').reverse().join('/');
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('/');
  }

  lpiCalculation() {
    let event = this.postsanction.controls.tenure.value;
    let personDate = new Date(this.applicantDetails[0].dob).getFullYear();
    let todayDate = new Date().getFullYear();
    let age = todayDate - personDate;
    let loanProduct;
    let loanfilterProduct;
    this.sqlSupport.getLoanProtectInsurance().then((data) => {
      loanfilterProduct = data.filter(
        (data) => +data.lpifromtenure <= +event && +data.lpitotenure >= +event
      );
      if (loanfilterProduct.length > 1) {
        loanProduct = loanfilterProduct.filter(
          (loanfilter) =>
            +loanfilter.lpifromage <= +age && +age <= +loanfilter.lpitoage
        );
      } else {
        loanProduct = loanfilterProduct;
      }
      let loanamt = +this.postsanction.get('loanAmount').value;
      let preAmt = (loanamt * +loanProduct[0].lpimultiplier) / 1000;

      let lpiAmt;
      let chargesFormatValue = preAmt.toString().split('.');
      if (chargesFormatValue[1] <= '49') {
        lpiAmt = Math.floor(preAmt);
      } else {
        lpiAmt = Math.ceil(preAmt);
      }
      this.applicantDetails[0].insPremium = lpiAmt;
      this.insuranceLPICheck();
      this.preEmiCalculation();
      this.EMICalculation();
    });
  }

  insuranceLPICheck() {
    this.preEmiIncudeCheck(this.applicantDetails[0]);
    // this.loanAmtRoadPriceCheck(this.onroadPrice);
  }

  calculateMarginCost() {
    let maronRoadprice = +this.postsanction.get('onroadPrice').value
      ? +this.postsanction.get('onroadPrice').value
      : +this.newOnRoadPrice;
    let finalRoadprice = +this.postsanction.get('assetPrice').value
      ? +this.postsanction.get('assetPrice').value
      : +this.newFinalRoadPrice;
    let marLoanAmt = +this.postsanction.controls.loanAmount.value;
    if (this.vehicleType == 'N') {
      if (+maronRoadprice <= marLoanAmt) {
        this.alertService.showAlert(
          'Alert!',
          `Loan Amount should be lesser than On Road Price Amount(Rs. ${maronRoadprice})`
        );
        this.postsanction.controls.loanAmount.setValue('');
        this.postsanction.controls.loanAmount.updateValueAndValidity();
      } else {
        let calcMarginCost = +maronRoadprice - marLoanAmt;
        this.applicantDetails[0].margin = calcMarginCost;
        // this.onroadPrices = calcMarginCost;
        this.postsanction.controls.marginCost.setValue(calcMarginCost);
        this.postsanction.controls.marginCost.updateValueAndValidity();
      }
    } else {
      if (+finalRoadprice <= marLoanAmt) {
        this.alertService.showAlert(
          'Alert!',
          `Loan Amount should be lesser than Final Asset Price(Rs. ${finalRoadprice})`
        );
        this.postsanction.controls.loanAmount.setValue('');
        this.postsanction.controls.loanAmount.updateValueAndValidity();
      } else {
        let calcMarginCost = +finalRoadprice - marLoanAmt;
        this.applicantDetails[0].margin = calcMarginCost;
        // this.onroadPrices = calcMarginCost;
        this.postsanction.controls.marginCost.setValue(calcMarginCost);
        this.postsanction.controls.marginCost.updateValueAndValidity();
      }
    }
  }

  clearOnRoadPrice() {
    this.postsanction.controls.loanAmount.setValue('');
    this.postsanction.controls.loanAmount.updateValueAndValidity();
  }

  EMICalculation() {
    if (
      this.postsanction.get('tenure').value !== '' &&
      this.applicantDetails[0].intRate !== '' &&
      this.postsanction.get('totalloanAmount').value !== '' &&
      this.postsanction.get('totalloanAmount').value != null
    ) {
      var Rate = +this.applicantDetails[0].intRate / (12 * 100);
      var denominator =
        Math.pow(Rate + 1, +this.postsanction.get('tenure').value) - 1;
      var Numerator =
        Rate * Math.pow(Rate + 1, +this.postsanction.get('tenure').value);
      var EMI =
        (Numerator / denominator) *
        +this.postsanction.get('totalloanAmount').value;
      let emiAmt;
      let EMIValue = EMI.toString().split('.');
      if (EMIValue[1] <= '49') {
        emiAmt = Math.floor(EMI);
      } else {
        emiAmt = Math.ceil(EMI);
      }
      this.applicantDetails[0].emi = emiAmt;
    } else {
      this.applicantDetails[0].emi = 0;
    }
  }

  uploadPslImg() {
    for (let i = 0; i < this.pslImg.length; i++) {
      this.sqlSupport
        .addPslImages(this.refId, this.id, this.pslImg[i].imgpath, this.pslId)
        .then((data) => {})
        .catch((Error) => {
          console.log('Failed!' + Error);
          this.alertService.showAlert('Alert!', 'Failed!');
        });
    }
  }

  updatePslImg(pslId) {
    this.sqlSupport
      .removePslImages(pslId)
      .then((data) => {
        for (let i = 0; i < this.pslImg.length; i++) {
          this.sqlSupport
            .addPslImages(this.refId, this.id, this.pslImg[i].imgpath, pslId)
            .then((data) => {})
            .catch((Error) => {
              console.log('Failed!' + Error);
              this.alertService.showAlert('Alert!', 'Failed!');
            });
        }
      })
      .catch((Error) => {
        console.log('Failed!' + Error);
        this.alertService.showAlert('Alert!', 'Failed!');
      });
  }

  getPslImgs() {
    this.sqlSupport.getPslImages(this.pslId).then((data) => {
      if (data.length > 0) {
        this.pslImglen = data.length;
        this.pslImg = data;
      } else {
        this.pslImglen = 0;
        this.pslImg = [];
      }
    });
  }

  pslId;
  pslBusSubmitDisable = false;
  pslSubmitDisable = false;
  pslImgArr = [];

  async getPddCharges(prdCode) {
    let data = await this.sqlSupport.getProductValuesScheme(prdCode);
    this.pddchargeslist = data;
  }

  pddChargesCalc() {
    let loanAmt = +this.postsanction.controls.loanAmount.value;
    let pddcharges = this.pddchargeslist.filter(
      (data) => +data.AmtFromRange < +loanAmt && +loanAmt < +data.AmtToRange
    );
    if (pddcharges.length > 0) {
      this.applicantDetails[0].pddCharges = pddcharges[0].PddCharges;
    } else {
      //this.alertService.showAlert("Alert!", `Loan Amount value is ${loanAmt}`);
      this.applicantDetails[0].pddCharges = 0;
    }
  }

  getProductValueLoanAmt(value) {
    if (value) {
      this.sqliteProvider.getProductValuesScheme(value).then((data) => {
        this.pdt_master = [];
        this.pdt_master = data;
        this.productChange(undefined);
      });
    } else {
      this.sqliteProvider.getAllProductValues().then((data) => {
        this.pdt_master = [];
        this.pdt_master = data;
        this.productChange(undefined);
      });
    }
  }

  productChange(change) {
    this.pdt_master.forEach((element) => {
      if (element.prdCode == this.applicantDetails[0].janaLoan) {
        this.loanAmountFrom = element.prdamtFromRange;
        this.loanAmountFrom = parseInt(this.loanAmountFrom);
        this.loanAmountTo = element.prdamtToRange;
        this.loanAmountTo = parseInt(this.loanAmountTo);
        this.tenureFrom = element.prdTenorFrom;
        this.tenureFrom = parseInt(this.tenureFrom);
        this.tenureTo = element.prdTenorTo;
        this.tenureTo = parseInt(this.tenureTo);
      }
    });
  }

  /* Postsanction WFBL For ETC based on ScoreCard res and FIEntry */
  // case 3 > 1.5L
  // case 2 >1L to <1.5L
  // case 1 <1L
  postSanctionWFBLForETC(scoreResponse: any, loanAmountOption: number) {
    let scrRsp = scoreResponse.STPFLAG;
    switch (loanAmountOption) {
      case 1:
        console.log(`postSanctionWFBLForETC ${loanAmountOption}`);
        break;
      case 2:
        console.log(`postSanctionWFBLForETC ${loanAmountOption}`);
        break;
      case 3:
        scrRsp = 'N';
        break;
    }
    if (scrRsp == 'Y') {
      //STP
      this.alertService.showAlert('Alert!', 'Please submit for auto approval!');
      this.showFieldInvestigation = this.showManualUser = false;
      this.showAutoApproval = true;
    } else {
      //FI
      if (scoreResponse.FIENTRY == 'Y') {
        //FIEntry
        this.sqlSupport.updatePostSanctionManualApprovalFlag(
          'Y',
          this.refId,
          this.id
        );
        this.showAutoApproval = this.showFieldInvestigation = false;
        this.showManualUser = true;
      } else {
        this.alertService.showAlert('Alert!', 'Please submit for FI!');
        this.showAutoApproval = this.showManualUser = false;
        // if (this.missingAmount !== undefined) {
        //   this.sqlSupport.updateMissingValuesInPS(this.missingAmount, this.refId, this.id)
        // }
        this.showFieldInvestigation = true;
      }
    }
  }

  /* Postsanction WFBL For NTC based on ScoreCard res and FIEntry */
  postSanctionWFBLForNTC(scoreResponse: any, loanAmountOption: number) {
    let scrRsp = scoreResponse.STPFLAG;
    switch (loanAmountOption) {
      case 1:
        console.log(`postSanctionWFBLForETC ${loanAmountOption}`);
        break;
      case 2:
        scrRsp = 'N';
        break;
      case 3:
        scrRsp = 'N';
        break;
    }
    if (scrRsp == 'Y') {
      //STP
      this.alertService.showAlert('Alert!', 'Please submit for auto approval!');
      this.showFieldInvestigation = this.showManualUser = false;
      this.showAutoApproval = true;
    } else {
      //FI
      if (scoreResponse.FIENTRY == 'Y') {
        //FIEntry
        this.sqlSupport.updatePostSanctionManualApprovalFlag(
          'Y',
          this.refId,
          this.id
        );
        this.showAutoApproval = this.showFieldInvestigation = false;
        this.showManualUser = true;
      } else {
        this.alertService.showAlert('Alert!', 'Please submit for FI!');
        this.showAutoApproval = this.showManualUser = false;
        // if (this.missingAmount !== undefined) {
        //   this.sqlSupport.updateMissingValuesInPS(this.missingAmount, this.refId, this.id)
        // }
        this.showFieldInvestigation = true;
      }
    }
  }

  // this.applicantDetails Forwarding postsanction data to web after score card
  loanFacilitiesServiceCall(value) {
    if (
      this.valuesModified == 'Y' ||
      this.TenureModified ||
      this.segmentModified ||
      this.dbDateModified ||
      this.ccModified ||
      this.rcNoModified ||
      this.engineNoModified ||
      this.chassisNoModified ||
      this.yearOfManModified ||
      this.registrationDateModified ||
      this.vehicleAgeModified ||
      this.hypothecationModified ||
      this.noofOwnerModified ||
      this.kmDrivenModified ||
      this.dealerQuotationModified ||
      this.obvModified ||
      this.assetPriceModified ||
      this.assetAgeModified
    ) {
      this.globalData.globalLodingPresent('Please wait...');
      let body = {
        PropNo: this.applicantDetails[0].applicationNumber,
        UserID: this.applicantDetails[0].createdUser,
        LoanDetails: {
          ProductId: this.applicantDetails[0].janaLoan,
          LoanType: this.getLoanType(this.applicantDetails[0].janaLoan),
          // "LoanAmnt":this.applicantDetails[0].loanAmount,
          LoanAmnt: this.postsanction.get('loanAmount').value,
          IntType: this.applicantDetails[0].interest,
          LoanPurpose: this.applicantDetails[0].purpose,
          Tenor: this.postsanction.get('tenure').value,
          Installments: this.applicantDetails[0].installment,
          // "RecomLoanamt":this.applicantDetails[0].loanAmount,
          RecomLoanamt: this.postsanction.get('loanAmount').value,
          PeriodOfInstal: this.applicantDetails[0].installment,
          Refinance: this.applicantDetails[0].refinance,
          HolidayPeriod: this.applicantDetails[0].holiday,
          ModeofPayment: this.applicantDetails[0].repayMode,
          prdMainCat: this.applicantDetails[0].prdSche,
          prdSubCat: this.applicantDetails[0].janaLoan,
          IntRate: this.applicantDetails[0].intRate,
          Totaldownpay: this.postsanction.get('downpayment').value,
          Insurancepremium: this.applicantDetails[0].insPremium,
          DBAmount: this.applicantDetails[0].dbAmount,
          Vehicletype: this.applicantDetails[0].vehicleType,
          ElectricVehicle: this.applicantDetails[0].electricVehicle,
          MarginMoney: this.postsanction.get('marginCost').value,
          NachCharges: this.applicantDetails[0].nachCharges,
          PddCharges: this.applicantDetails[0].pddCharges,
          AdvanceEmiAmt: this.applicantDetails[0].advanceEmi,
          AdvInstallment: this.applicantDetails[0].advavceInst,
          SegmentType: this.postsanction.get('segment').value,
          ProcessingFee: this.applicantDetails[0].processingFee,
          GstPf: this.applicantDetails[0].gstonPf,
          StampDuty: this.applicantDetails[0].stampDuty,
          GstSdc: this.applicantDetails[0].gstonSdc,
          GstNach: this.applicantDetails[0].gstonNach,
          GstPdd: this.applicantDetails[0].gstonPddCharges,
          DocCharges: this.applicantDetails[0].otherCharges,
          GstotherCharges: this.applicantDetails[0].gstonOtherCharges,
          EmiAmt: this.applicantDetails[0].emi,
          BorrhealthIns: this.applicantDetails[0].borHealthIns,
          CoborrhealthIns: this.applicantDetails[0].coBorHealthIns,
          Preemi: '0',
          Emimode: this.applicantDetails[0].emiMode,

          DBdate: this.convertdate(this.postsanction.get('dbDate').value),
          PreEmiDB: this.applicantDetails[0].preEmiDB,
          TotalLoanAmt: this.postsanction.get('totalloanAmount').value,
          onroadPrice: this.postsanction.get('onroadPrice').value,
          //used
          CC: this.postsanction.get('cc').value
            ? this.postsanction.get('cc').value
            : '',
          UsedRcno: this.postsanction.get('rcNo').value
            ? this.postsanction.get('rcNo').value
            : '',
          UsedEngineno: this.postsanction.get('engineNo').value
            ? this.postsanction.get('engineNo').value
            : '',
          UsedChassisno: this.postsanction.get('chassisNo').value
            ? this.postsanction.get('chassisNo').value
            : '',
          UsedYrsofmanufacture: this.postsanction.get('yearOfMan').value
            ? this.postsanction.get('yearOfMan').value
            : '',
          UsedRegistrationdate: this.postsanction.get('registrationDate').value
            ? this.convertdate(this.postsanction.get('registrationDate').value)
            : '',
          UsedVehicleAge: this.postsanction.get('vehicleAge').value
            ? this.postsanction.get('vehicleAge').value
            : '',
          UsedHypothecationstatus: this.postsanction.get('hypothecation').value
            ? this.postsanction.get('hypothecation').value
            : '',
          UsedNumberofowner: this.postsanction.get('noofOwner').value
            ? this.postsanction.get('noofOwner').value
            : '',
          UsedKmdriven: this.postsanction.get('kmDriven').value
            ? this.postsanction.get('kmDriven').value
            : '',
          UsedDealerquotation: this.postsanction.get('dealerQuotation').value
            ? this.postsanction.get('dealerQuotation').value
            : '',
          UsedOBV: this.postsanction.get('obv').value
            ? this.postsanction.get('obv').value
            : '',
          UsedFinalassetprice: this.postsanction.get('assetPrice').value
            ? this.postsanction.get('assetPrice').value
            : '',
          UsedAssetageatmaturity: this.postsanction.get('assetAge').value
            ? this.postsanction.get('assetAge').value
            : '',
        },
      };
      this.master
        .restApiCallAngular('LoanDetails', body)
        .then(
          (res) => {
            // this.missingAmount = undefined;
            // this.missingAmount = {
            //   'advanceEmi': body.LoanDetails.AdvanceEmiAmt,
            //   'processingFee': body.LoanDetails.ProcessingFee
            // }
            let loanFacilityRes = <any>res;
            if (loanFacilityRes.ErrorCode === '000') {
              this.globalData.globalLodingDismiss();
              this.sqlSupport.upDateLoanFacilites(
                body.LoanDetails,
                this.refId,
                this.id
              );
              this.sqlSupport.updateORPinPostSanction(
                this.postsanction.get('onroadPrice').value,
                this.refId,
                this.id
              );
              this.sqlSupport.updateAssetPricePostSanction(
                this.postsanction.get('assetPrice').value,
                this.refId,
                this.id
              );
              // this.alertService.showAlert('Alert',body.LoanDetails.AdvanceEmiAmt)
              this.postSanctionServiceCall(value);
            } else {
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert', loanFacilityRes.ErrorDesc);
            }
          },
          (err) => {
            this.globFunc.globalLodingDismiss();
            if (err) {
              this.alertService.showAlert('Alert', err.message);
              this.modalCtrl.dismiss();
            } else {
              this.alertService.showAlert('Alert', 'No Response from Server!');
            }
          }
        )
        .catch((err) => err);
    } else {
      this.postSanctionServiceCall(value);
    }
  }

  /*
    Casa related Code
  */

  casaDetailsCheck() {
    this.sqliteProvider
      .getSubmitDetails(this.userInfo.refId, this.userInfo.id)
      .then((submitlead) => {
        if (submitlead[0].NACH != '1' && submitlead[0].nachDoc != 'Y') {
          this.casaType = 'nachDetails';
          this.alertService.showAlert('Alert!', `Please complete NACH Details`);
        }
      });
  }

  cbsCustomerCreation() {
    if (
      this.editCasaSaved == 2 ||
      this.casaData == 'N' ||
      (this.casaData == 'Y' &&
        this.accCreationEdit == true &&
        this.editAccCreation == true)
    ) {
      this.accCreationEdit = true;
      this.editAccCreation = true;
      this.globalData.globalLodingPresent('please wait...');
      let body = {
        propNo: this.PropNo,
        reqType: 'customerCreation',
      };
      this.master.restApiCallAngular('CasaCBSService', body).then(
        (res) => {
          let cbsCustomerRes = <any>res;
          if (cbsCustomerRes.ErrorCode == '000') {
            this.enableEditAccStage = 0;
            this.cbsCustomerEnable = true;
            this.cbsAccountEnable = false;
            this.globalData.globalLodingDismiss();
            this.sqlSupport.updateCBSstatus(
              this.refId,
              this.id,
              cbsCustomerRes.cbsCustId,
              this.PropNo,
              'customerId',
              'cbsCustomerEnable'
            );
            this.sqlSupport.updateCBSAfterCBS(this.refId, this.id, this.PropNo);

            this.alertService.showAlert('Alert!', cbsCustomerRes.ErrorDesc);
            this.accountCreation
              .get('customerId')
              .setValue(cbsCustomerRes.cbsCustId);
            this.accountCreation.get('customerId').updateValueAndValidity();
          } else {
            this.cbsCustomerEnable = false;
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert('Alert', cbsCustomerRes.ErrorDesc);
          }
        },
        (err) => {
          this.globalData.globalLodingDismiss();
          this.cbsCustomerEnable = false;
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      );
    } else {
      if (this.editCasaSaved == 1) {
        this.alertService.showAlert(
          'Alert',
          'Please Complete the Service Request Details!'
        );
      } else {
        this.alertService.showAlert(
          'Alert',
          'Please Complete the Nominee and Service Request Details!'
        );
      }
    }
  }

  casaAccountCreation() {
    this.globalData.globalLodingPresent('please wait...');
    let body = {
      propNo: this.PropNo,
      reqType: 'CasaCreation',
    };

    this.master.restApiCallAngular('CasaCBSService', body).then(
      (res) => {
        let cbsCustomerRes = <any>res;
        if (cbsCustomerRes.ErrorCode == '000') {
          this.cbsAccountEnable = true;
          this.globalData.globalLodingDismiss();
          this.sqlSupport.updateCBSstatus(
            this.refId,
            this.id,
            cbsCustomerRes.cbsAccountNumber,
            this.PropNo,
            'accountNo',
            'cbsAccountEnable'
          );

          this.alertService.showAlert('Alert', cbsCustomerRes.ErrorDesc);
          this.accountCreation
            .get('accountNo')
            .setValue(cbsCustomerRes.cbsAccountNumber);
          this.accountCreation.get('accountNo').updateValueAndValidity();
        } else {
          this.cbsAccountEnable = false;
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Alert', cbsCustomerRes.ErrorDesc);
        }
      },
      (err) => {
        this.globalData.globalLodingDismiss();
        this.cbsAccountEnable = false;
        if (err.name == 'TimeoutError') {
          this.alertService.showAlert('Alert!', err.message);
        } else {
          this.alertService.showAlert('Alert!', 'No response from server!');
        }
      }
    );
  }

  instakitCreation() {
    let instaKitValue = this.accountCreation.controls.instaKitNumber.value;
    if (instaKitValue == this.savedInstaKitNumber) {
      this.alertService.showAlert(
        'Alert!',
        'This number already used for instakit creation!'
      );
    } else {
      if (
        instaKitValue != null &&
        instaKitValue != '' &&
        instaKitValue != undefined &&
        instaKitValue.length == 12
      ) {
        this.globalData.globalLodingPresent('please wait...');
        let body = {
          propNo: this.PropNo,
          instakitNumber: instaKitValue,
        };
        this.master.restApiCallAngular('instakitUpdate', body).then(
          (res) => {
            let inskitRes = <any>res;
            if (inskitRes.ErrorCode == '000') {
              this.savedInstaKitNumber = instaKitValue;
              this.instakitStatus = true;
              this.instaKitEnable = true;
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert', inskitRes.ErrorDesc);
              this.sqlSupport.updateCBSstatus(
                this.refId,
                this.id,
                instaKitValue,
                this.PropNo,
                'instaKitNumber',
                'instakitStatus'
              );
            } else {
              this.instaKitEnable = false;
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert', inskitRes.ErrorDesc);
            }
          },
          (err) => {
            this.globalData.globalLodingDismiss();
            this.instaKitEnable = false;
            if (err.name == 'TimeoutError') {
              this.alertService.showAlert('Alert!', err.message);
            } else {
              this.alertService.showAlert('Alert!', 'No response from server!');
            }
          }
        );
      } else {
        this.alertService.showAlert(
          'Alert!',
          'Please enter valid Instakit Number'
        );
      }
    }
  }

  getCBSButtonEnable() {
    console.log(this.psmSubmitted);
    console.log(
      this.sanctionModify == '1' &&
        this.postSancModified == 'Y' &&
        this.showAutoApproval &&
        this.disableAutoApprovalBtn
    );
    if (
      !this.psmSubmitted &&
      !(
        this.sanctionModify == '1' &&
        this.postSancModified == 'Y' &&
        this.showAutoApproval &&
        this.disableAutoApprovalBtn
      )
    ) {
      if (this.sanctionModify != '2') {
        this.alertService.showAlert(
          'Alert!',
          `Please complete Post Sanction Modification Details`
        );
        this.custType = '';
        this.custType = 'sanctionForm';
        return;
      }
    }
    if (!this.cbsButtonEnable) {
      this.globalData.globalLodingPresent('please wait...');
      let body = {
        propNo: this.PropNo,
      };

      this.master.restApiCallAngular('getCasaApiDetails', body).then(
        (res) => {
          let cbsButtonData = <any>res;
          if (cbsButtonData.ErrorCode == '000') {
            this.cbsCustomerEnable =
              cbsButtonData.cbsCustomerFlag == 'enable' ? false : true;
            this.cbsAccountEnable =
              cbsButtonData.cbsAccountFlag == 'enable' ? false : true;
            this.instaKitEnable =
              !this.cbsCustomerEnable &&
              !this.cbsAccountEnable &&
              0 < +cbsButtonData.cbsAccountNumber;

            this.cbsButtonEnable = true;
            this.cbsButtonServiceCheck = false;
            this.accountCreation.controls.customerId.setValue(
              cbsButtonData.cbsCustId
            );
            this.accountCreation.controls.customerId.updateValueAndValidity();
            this.accountCreation.controls.accountNo.setValue(
              cbsButtonData.cbsAccountNumber
            );
            this.accountCreation.controls.accountNo.updateValueAndValidity();
            this.sqlSupport.insertCBSstatus(
              this.refId,
              this.id,
              cbsButtonData.cbsCustId,
              cbsButtonData.cbsAccountNumber,
              this.PropNo,
              this.cbsCustomerEnable,
              this.cbsAccountEnable,
              this.instaKitEnable,
              this.cbsButtonEnable
            );

            this.globalData.globalLodingDismiss();
          } else {
            this.cbsButtonEnable = false;
            this.cbsButtonServiceCheck = true;
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert('Alert', cbsButtonData.ErrorDesc);
          }
        },
        (err) => {
          this.globalData.globalLodingDismiss();
          this.cbsButtonEnable = false;
          this.cbsButtonServiceCheck = true;
          this.cbsCustomerEnable = true;
          this.cbsAccountEnable = true;
          this.instaKitEnable = true;
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      );
    }
  }

  /*
    PSL Agri and Buss Related Logic
  */

  async pslDocBase64() {
    let randomNum;
    for (let i = 0; i < this.pslImg.length; i++) {
      // this.base64.encodeFile(this.pslImg[i].imgpath).then(async base64File => {
      //   let pslImageFile = base64File.replace(/\n/g, '');
      let pslImageFile = this.pslImg[i].imgpath;
      let pslImgData = {
        DocName: 'PSL',
        DocDesc: this.PropNo + '_psl' + randomNum + 'jpg',
        DocFile: pslImageFile,
      };
      await this.pslImgArr.push(pslImgData);
      if (i == this.pslImg.length - 1) {
        this.pslDocUpload();
      }
      // }).catch(err => err)
    }
  }
  pslDocUpload() {
    if (this.pslImgArr.length > 0) {
      let docs_upload = {
        OtherDoc: {
          DocAppno: this.PropNo,
          OtherDocs: this.pslImgArr,
        },
      };
      this.master
        .restApiCallAngular('UploadDocs', docs_upload)
        .then((res) => {
          this.globFunc.globalLodingDismiss();
          let pslRes = <any>res;
          if (pslRes.errorCode == '00') {
            this.alertService.showAlert('Alert', 'PSL Submitted Successfully');
          }
        })
        .catch((err) => err);
    }
  }

  pslAgriSave(value) {
    console.log(value, 'psl agrisave');

    if (this.pslImg.length > 0) {
      this.globFunc.globalLodingPresent('Please Wait..');
      let body = {
        PropNo: this.applicantDetails[0].applicationNumber,
        Agriproof: value.agriProofType,
        FarmerType: value.farmerType,
        ActivityType: value.actType,
        LandHolding: value.landHolding,
        UdyamCertNum: '',
        UdyamRegNum: '',
        ClassiUdyam: '',
        MajorAct: '',
        InvsmtPlntmechUdyam: '',
        TurnoverUdyam: '',
        AgriPurpose: value.agriPurpose,
        ServiceUnit: '',
        AgriYesorNo: value.psl !== undefined ? value.psl[0] : '',
      };
      console.log(`AgriSave ${JSON.stringify(body)}`);
      this.master
        .restApiCallAngular('pslDetailsVL', body)
        .then((res) => {
          console.log(res);
          let response = <any>res;
          if (response.ErrorCode === '000') {
            this.sqliteProvider
              .addPSLDetails(this.refId, this.id, value, this.pslId)
              .then((data) => {
                if (this.pslId) {
                  this.pslSubmitDisable = true;
                  this.updatePslImg(this.pslId);
                } else {
                  this.pslId = data.insertId;
                  this.pslSubmitDisable = true;
                  this.uploadPslImg();
                }
                this.pslDocBase64();
              });
          } else {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert', response.ErrorDesc);
          }
        })
        .catch((err) => err);
    } else {
      this.alertService.showAlert('Alert', 'Please Add Certificate image');
    }
  }

  pslBusSave(value) {
    console.log(value, 'psl bussave');
    if (this.pslImg.length > 0) {
      this.globFunc.globalLodingPresent('Please Wait..');
      let body = {
        PropNo: this.applicantDetails[0].applicationNumber,
        Agriproof: value.agriProofType,
        FarmerType: value.farmerType,
        ActivityType: value.actType,
        LandHolding: value.landHolding,
        UdyamCertNum: value.udyamCNo,
        UdyamRegNum: value.udyamRegNo,
        ClassiUdyam: value.udyamClass,
        MajorAct: value.majorAct,
        InvsmtPlntmechUdyam: value.udyamInvest,
        TurnoverUdyam: value.udyamTurnOver,
        AgriPurpose: '',
        ServiceUnit: value.servUnit,
        AgriYesorNo: value.psl !== undefined ? value.psl[0] : '',
      };
      this.master
        .restApiCallAngular('pslDetailsVL', body)
        .then((res) => {
          console.log(res);
          let response = <any>res;
          if (response.ErrorCode === '000') {
            this.sqliteProvider
              .addPSLDetails(this.refId, this.id, value, this.pslId)
              .then((data) => {
                if (this.pslId) {
                  this.pslBusSubmitDisable = true;
                  this.updatePslImg(this.pslId);
                } else {
                  this.pslId = data.insertId;
                  this.pslBusSubmitDisable = true;
                  this.uploadPslImg();
                }
                this.pslDocBase64();
              });
          } else {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert', response.ErrorDesc);
          }
        })
        .catch((err) => err);
    } else {
      this.alertService.showAlert('Alert', 'Please Add Certificate image');
    }
  }

  /*
    PostSanction Document Submit buss logic
    new check has been added for CBS Customer Creation.
  */

  submitPostSanction() {
    let randomNum;
    this.post_other_docs = [];
    this.sqlSupport.getCASADetails(this.refId, this.id).then(async (data) => {
      let casaValue = data[0];
      if (casaValue.editedInPS == 'Y') {
        let customerIdValue = this.accountCreation.controls.customerId.value;
        if (customerIdValue && customerIdValue != '0') {
          // new condition
          this.getNomineeDetails()
            .then((data) => {
              this.getServiceDetails(casaValue)
                .then(async (data) => {
                  if (this.documents.every((data) => data.imgs.length > 0)) {
                    for (let i = 0; i < this.documents.length; i++) {
                      for (let j = 0; j < this.documents[i].imgs.length; j++) {
                        if (this.documents[i].imgs[j].uploaded == 'N') {
                          let filetype;
                          // data:image/*;charset=utf-8;base64
                          let postSancImgs: string =
                            this.documents[i].imgs[j]['imgpath'];
                          if (
                            postSancImgs.includes('jpeg') ||
                            postSancImgs.includes('data:image/*')
                          )
                            filetype = 'jpg';
                          else {
                            postSancImgs = `data:image/*;charset=utf-8;base64,${postSancImgs}`;
                            filetype = 'pdf';
                          }
                          randomNum = Math.floor(Math.random() * 900) + 100;
                          //  = this.documents[i].imgs[j]['imgpath'].substring(this.documents[i].imgs[j]['imgpath'].lastIndexOf("."))
                          let postSancData = {
                            DocName: 'POSTDOC',
                            DocDesc: `${this.PropNo}_postSanction${randomNum}.${filetype}`,
                            DocFile: postSancImgs,
                          };
                          await this.post_other_docs.push(postSancData);
                          if (
                            j == this.documents[i].imgs.length - 1 &&
                            i == this.documents.length - 1
                          ) {
                            this.editedCasaSave(false);
                          }
                          // }, (err) => {
                          //   console.log(err);
                          // });
                        } else {
                          if (
                            j == this.documents[i].imgs.length - 1 &&
                            i == this.documents.length - 1
                          ) {
                            this.editedCasaSave(false);
                          }
                        }
                      }
                    }
                  } else {
                    this.alertService.showAlert(
                      'Alert!',
                      'Please add documents!'
                    );
                  }
                })
                .catch((err) => {
                  console.log(err, 'ServiceDetails');
                });
            })
            .catch((err) => {
              console.log(err, 'NomineeDetails');
            });
        } else {
          this.alertService.showAlert(
            'Alert!',
            'Please Complete CBS Customer Creation!'
          );
        }
      } else {
        if (this.documents.every((data) => data.imgs.length > 0)) {
          for (let i = 0; i < this.documents.length; i++) {
            for (let j = 0; j < this.documents[i].imgs.length; j++) {
              if (this.documents[i].imgs[j].uploaded == 'N') {
                let filetype;
                let postSancImgs = this.documents[i].imgs[j]['imgpath'];
                if (
                  postSancImgs.includes('jpeg') ||
                  postSancImgs.includes('data:image/*')
                )
                  filetype = 'jpg';
                else {
                  postSancImgs = `data:image/*;charset=utf-8;base64,${postSancImgs}`;
                  filetype = 'pdf';
                }
                randomNum = Math.floor(Math.random() * 900) + 100;
                let postSancData = {
                  DocName: 'POSTDOC',
                  DocDesc: `${this.PropNo}_postSanction${randomNum}.${filetype}`,
                  DocFile: postSancImgs,
                };
                await this.post_other_docs.push(postSancData);
                if (
                  j == this.documents[i].imgs.length - 1 &&
                  i == this.documents.length - 1
                ) {
                  this.serviceCallForSubmission();
                }
                // }, (err) => {
                //   console.log(err);
                // });
              } else {
                if (
                  j == this.documents[i].imgs.length - 1 &&
                  i == this.documents.length - 1
                ) {
                  this.serviceCallForSubmission();
                }
              }
            }
          }
        } else {
          this.alertService.showAlert('Alert!', 'Please add documents!');
        }
      }
    });
  }

  serviceCallForSubmission() {
    this.globFunc.globalLodingPresent('Please Wait...');
    if (this.post_other_docs.length > 0) {
      let docs_upload = {
        OtherDoc: {
          DocAppno: this.PropNo,
          OtherDocs: this.post_other_docs,
        },
      };
      this.master.restApiCallAngular('UploadDocs', docs_upload).then(
        (res) => {
          let sanctionRes = <any>res;
          if (sanctionRes.errorCode == '00') {
            this.fowardCheck = true;
            for (let i = 0; i < this.documents.length; i++) {
              for (let j = 0; j < this.documents[i].imgs.length; j++) {
                this.sqlSupport
                  .updatePostSancDocUploadStatus(this.documents[i].imgs[j])
                  .then((data) => {
                    if (
                      j == this.documents[i].imgs.length - 1 &&
                      i == this.documents.length - 1
                    ) {
                      this.getProofImg();
                    }
                  });
              }
            }

            this.sqlSupport.updatePostSanctionDocument(this.refId, this.id);
            this.post_other_docs = [];
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Documents uploaded successfully!'
            );
          } else {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert',
              sanctionRes.errorDesc || sanctionRes.errorMsg
            );
          }
        },
        (err) => {
          this.globalData.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      );
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'All documents already uploaded!');
    }
    // this.globFunc.globalLodingDismiss();
  }

  forwardToWeb() {
    if (this.postSanctionCheck) {
      if (this.sanctionModify == '1') {
        if (this.psmSubmitted) {
          this.loanCheckCBS();
        } else {
          if (
            this.scoreCardRerun == 'Y' &&
            this.psmFlowState != 'scoreCard' &&
            this.FientryFlag == 'N'
          ) {
            this.alertService.showAlert(
              'Alert',
              `Please complete score card rerun in ScoreCard Page!`
            );
            // this.sqliteProvider.updateScoreCardinPostsanction('R',this.refId,this.scoreId);
            // this.globalData.proccedOk("Alert", `Please complete score card rerun in ScoreCard Page!`).then(data => {
            //   if (data == "yes") {
            //     this.navCtrl.push(ScoreCardPage , {submitData : this.userInfo})
            //   }
            // });
          } else if (
            this.autoApprovalFlag == 'Y' &&
            !this.disableAutoApprovalBtn
          ) {
            this.alertService.showAlert(
              'Alert',
              `Please complete Auto Approval in post sanction modification!`
            );
          } else if (
            this.autoApprovalFlag == 'N' &&
            this.FieldInvFlag == 'N' &&
            this.showFieldInvestigation &&
            !this.disableFISubmitBtn
          ) {
            this.alertService.showAlert(
              'Alert',
              `Please complete FI in post sanction modification!`
            );
          } else if (
            this.autoApprovalFlag == 'N' &&
            this.FieldInvFlag == 'Y' &&
            !this.disableManualApprvalBtn
          ) {
            this.alertService.showAlert(
              'Alert',
              `Please complete Manual Approval in post sanction modification!`
            );
          } else {
            this.loanCheckCBS();
          }
        }
      } else {
        this.loanCheckCBS();
      }
    } else {
      this.alertService.showAlert(
        'Alert',
        'Please complete Post Sanction Modification'
      );
    }
  }

  changesStatusCheck() {
    if (
      this.globalData.convertToString(
        this.postsanction.get('brandName').value
      ) != this.savedBrandName
    ) {
      this.BrandNameModified = true;
      this.savedBrandNameDesc = 'Brand Name,';
    } else {
      this.BrandNameModified = false;
      this.savedBrandNameDesc = '';
    }
    if (+this.postsanction.get('model').value != this.savedModel) {
      this.ModelModified = true;
      this.savedModelDesc = 'Model,';
    } else {
      this.ModelModified = false;
      this.savedModelDesc = '';
    }
    if (this.postsanction.get('variant').value != this.savedVariant) {
      this.VariantModified = true;
      this.savedVariantDesc = 'Variant,';
    } else {
      this.VariantModified = false;
      this.savedVariantDesc = '';
    }
    if (this.postsanction.get('segment').value != this.segmentType) {
      this.segmentModified = true;
    } else {
      this.segmentModified = false;
    }
    if (this.postsanction.get('dealerName').value != this.savedDealerName) {
      this.DealerNameModified = true;
    } else {
      this.DealerNameModified = false;
    }
    //Used
    if (this.postsanction.get('cc').value != this.savedCC) {
      this.ccModified = true;
      this.savedCCDesc = 'CC,';
    } else {
      this.ccModified = false;
      this.savedCCDesc = '';
    }
    if (this.postsanction.get('rcNo').value != this.savedRcNo) {
      this.rcNoModified = true;
      this.savedRcNoDesc = 'RcNo,';
    } else {
      this.rcNoModified = false;
      this.savedRcNoDesc = '';
    }
    if (this.postsanction.get('engineNo').value != this.savedEngineNo) {
      this.engineNoModified = true;
      this.savedEngineNoDesc = 'EngineNo,';
    } else {
      this.engineNoModified = false;
      this.savedEngineNoDesc = '';
    }
    if (this.postsanction.get('chassisNo').value != this.savedChassisNo) {
      this.chassisNoModified = true;
      this.savedChasisNoDesc = 'ChassisNo,';
    } else {
      this.chassisNoModified = false;
      this.savedChasisNoDesc = '';
    }
    if (this.postsanction.get('yearOfMan').value != this.savedYearOfMan) {
      this.yearOfManModified = true;
      this.savedYearOfManDesc = 'YearOfManufacture,';
    } else {
      this.yearOfManModified = false;
      this.savedYearOfManDesc = '';
    }
    if (
      this.postsanction.get('registrationDate').value !=
      this.savedRegistrationDate
    ) {
      this.registrationDateModified = true;
      this.savedRegistrationDesc = 'RegistrationDate,';
    } else {
      this.registrationDateModified = false;
      this.savedRegistrationDesc = '';
    }
    if (this.postsanction.get('vehicleAge').value != this.savedVehicleAge) {
      this.vehicleAgeModified = true;
      this.savedVehicleAgeDesc = 'VehicleAge,';
    } else {
      this.vehicleAgeModified = false;
      this.savedVehicleAgeDesc = '';
    }
    if (
      this.postsanction.get('hypothecation').value != this.savedHypothecation
    ) {
      this.hypothecationModified = true;
      this.savedHypothecationDesc = 'Hypothecation,';
    } else {
      this.hypothecationModified = false;
      this.savedHypothecationDesc = '';
    }
    if (this.postsanction.get('noofOwner').value != this.savedNoofOwner) {
      this.noofOwnerModified = true;
      this.savedNoOfOwnerDesc = 'NoOfOwner,';
    } else {
      this.noofOwnerModified = false;
      this.savedNoOfOwnerDesc = '';
    }
    if (this.postsanction.get('kmDriven').value != this.savedKmDriven) {
      this.kmDrivenModified = true;
      this.savedkmDrivenDesc = 'kmDriven,';
    } else {
      this.kmDrivenModified = false;
      this.savedkmDrivenDesc = '';
    }
    if (
      this.postsanction.get('dealerQuotation').value !=
      this.savedDealerQuotation
    ) {
      this.dealerQuotationModified = true;
      this.savedDealerQuotationDesc = 'DealerQuotation,';
    } else {
      this.dealerQuotationModified = false;
      this.savedDealerQuotationDesc = '';
    }
    if (this.postsanction.get('obv').value != this.savedObv) {
      this.obvModified = true;
      this.savedObvDesc = 'Obv,';
    } else {
      this.obvModified = false;
      this.savedObvDesc = '';
    }
    if (this.postsanction.get('assetPrice').value != this.savedAssetPrice) {
      this.assetPriceModified = true;
      this.savedAssetPriceDesc = 'AssetPrice,';
    } else {
      this.assetPriceModified = false;
      this.savedAssetPriceDesc = '';
    }
    if (this.postsanction.get('assetAge').value != this.savedAssetAge) {
      this.assetAgeModified = true;
      this.savedAssetAgeDesc = 'AssetAge,';
    } else {
      this.assetAgeModified = false;
      this.savedAssetAgeDesc = '';
    }
  }

  // New CR For CASA Account Creation on PostSanction Page.

  getJanaAccDetails(event) {
    // if (this.casaStage == '1' && this.casaData == 'Y' && value == 'Y' && this.editAccCreation == true) {
    //   this.editAccCreationTab = false
    // } else {
    let value = event.detail.value;
    if (value == 'N' && this.enableEditAccStage == 1) {
      this.alertService
        .confirmationAlert(
          'Alert',
          'Your CASA Account will be delete. Do you want to Proceed with No?'
        )
        .then((data) => {
          if (data) {
            this.sqlSupport
              .updateCasaNoinPS(this.refId, this.id)
              .then((data) => {
                this.editAccCreationTab = false;
                this.editAccCreation = true;
                this.enableEditAccStage = 0;
                this.editedCasaSave(true);
              });
          }
        });
    } else {
      this.editAccCreationTab = value == 'Y' ? true : false;
    }
    // }
  }

  enableEditAcc() {
    this.editAccCreation = false;
    this.enableEditAccStage = 1;
  }

  async accCreationTab(value, option) {
    let data = {
      refId: this.refId,
      id: this.id,
    };
    if (value == 'Nominee') {
      if (this.casaValue.editedInPS == 'Y') {
        let nominee = await this.modalCtrl.create({
          component: NomineeAfterPsPage,
          componentProps: { PostSanctionData: data },
        });
        nominee.present();
        nominee.onDidDismiss().then((data) => {
          this.nomineeTick = true;
        });
      } else {
        this.sqlSupport
          .getNomineeDetails(this.refId, this.id)
          .then(async (val) => {
            let nomineeValues = [];
            nomineeValues = val;
            let nominee = await this.modalCtrl.create({
              component: NomineeAfterPsPage,
              componentProps: { PostSanctionData: data },
            });
            nominee.present();
            nominee.onDidDismiss().then((data) => {
              console.log('data - nominee', data);
              this.editCasaSaved = option;
              if (data != undefined) {
                this.casaType = 'casaDetails';
                this.nomineeTick = true;
                this.accCreationEdit = true;
                this.alertService.showAlert(
                  'Alert',
                  'Nominee saved Successfully. Proceed Services Requested details'
                );
              } else if (
                nomineeValues.length > 0 ||
                this.casaDetails.nomAvail == 'N'
              ) {
                this.nomineeTick = true;
                this.accCreationEdit = true;
              } else {
                this.alertService.showAlert(
                  'Alert',
                  'Please Fill nominee details, and then proceed further.'
                );
                this.casaType = 'casaDetails';
                this.nomineeTick = false;
              }
            });
          });
      }
    } else {
      if (this.casaValue.editedInPS == 'Y') {
        let nominee = await this.modalCtrl.create({
          component: ServiceAfterPsPage,
          componentProps: { PostSanctionData: data },
        });
        nominee.present();
        nominee.onDidDismiss().then((data) => {
          this.servicesTick = true;
        });
      } else {
        if (this.nomineeTick == true) {
          this.sqlSupport
            .getServDetails(this.refId, this.id)
            .then(async (val) => {
              let servDetails = [];
              servDetails = val;
              let nominee = await this.modalCtrl.create({
                component: ServiceAfterPsPage,
                componentProps: { PostSanctionData: data },
              });
              nominee.present();
              nominee.onDidDismiss().then((data) => {
                if (data != undefined) {
                  this.editCasaSaved = option;
                  this.saveCasaAccDetails().then((data) => {
                    console.log('data - nominee', data);
                    this.casaType = 'casaDetails';
                    this.servicesTick = true;
                    this.alertService.showAlert(
                      'Alert',
                      'Service request saved Successfully.'
                    );
                  });
                } else if (servDetails.length > 0) {
                  this.servicesTick = true;
                } else {
                  this.alertService.showAlert(
                    'Alert',
                    'Please Fill Service request, and then proceed further.'
                  );
                  this.casaType = 'casaDetails';
                  this.servicesTick = false;
                }
              });
            });
        } else {
          this.alertService.showAlert(
            'Alert',
            'Please Complete and Save the Nominee details!'
          );
        }
      }
    }
  }

  saveCasaAccDetails() {
    return new Promise((resolve, reject) => {
      this.sqlSupport
        .updateCasaOnPS(this.refId, this.id)
        .then((data) => {
          if (
            this.casaId == null ||
            this.casaId == '' ||
            this.casaId == undefined
          ) {
            this.casaId = data.insertId;
            resolve(this.casaId);
            this.alertService.showAlert(
              'Alert!',
              'Current/Savings Account details saved!'
            );
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Current/Savings Account details updated!'
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  getNomineeDetails() {
    return new Promise((resolve, reject) => {
      this.sqlSupport
        .getNomineeDetails(this.refId, this.id)
        .then((data) => {
          if (data.length > 0) {
            this.nominee_Data = data;
            resolve(data);
          } else {
            this.alertService.showAlert('Alert!', 'Nominee details not found');
          }
        })
        .catch((e) => {
          console.log('er' + e);
        });
    });
  }

  getServiceDetails(value) {
    return new Promise((resolve, reject) => {
      if (value.janaAcc == 'Y') {
        this.sqlSupport
          .getServDetails(this.refId, this.id)
          .then((data) => {
            if (data.length > 0) {
              this.service_data = data;
              resolve(data);
            } else {
              this.alertService.showAlert(
                'Alert!',
                'Nominee details not found'
              );
            }
          })
          .catch((e) => {
            console.log('er' + e);
          });
      } else {
        this.alertService.showAlert(
          'Alert',
          'ServiceDetails Not saved Properly!'
        );
      }
    });
  }

  editedCasaSave(noInPs) {
    return new Promise((resolve, reject) => {
      try {
        this.sqlSupport.getCASADetails(this.refId, this.id).then((data) => {
          let casaValues = data[0];
          if (casaValues) {
            if (casaValues.nomAvail == 'Y') {
              this.nomAvail = '1';
            } else {
              this.nomAvail = '2';
            }
            if (casaValues.guaAvail == 'Y') {
              this.guaAvail = '1';
            } else {
              this.guaAvail = '2';
            }
            if (casaValues.nomAvail == 'Y' && !noInPs) {
              this.casaSubmitData = {
                appNo: this.applicantDetails[0].applicationNumber,
                selJanaAcc: casaValues.janaAcc,
                nomineeAvail: this.nomAvail,
                guaranterNomiee: this.guaAvail,
                Leadid: this.nominee_Data ? this.nominee_Data[0].leadId : '',
                nomineeDetails: {
                  nomieeTitle: this.nominee_Data
                    ? this.nominee_Data[0].nomTitle.toUpperCase()
                    : '',
                  nomieeName: this.nominee_Data
                    ? this.nominee_Data[0].nominame
                    : '',
                  nomieedob: this.nominee_Data
                    ? this.nominee_Data[0].nomdob.substring(8, 10) +
                      '/' +
                      this.nominee_Data[0].nomdob.substring(5, 7) +
                      '/' +
                      this.nominee_Data[0].nomdob.substring(0, 4)
                    : '',
                  nomineeguardianname: this.nominee_Data
                    ? this.nominee_Data[0].guaname
                    : '',
                  nomieeage: this.nominee_Data
                    ? this.nominee_Data[0].nomiage
                    : '',
                  nomieerel: this.nominee_Data
                    ? this.nominee_Data[0].nomrelation
                    : '',
                  nomieeadd1: this.nominee_Data
                    ? this.nominee_Data[0].nomi_address1
                    : '',
                  nomieeadd2: this.nominee_Data
                    ? this.nominee_Data[0].nomi_address2
                    : '',
                  nomieeadd3: this.nominee_Data
                    ? this.nominee_Data[0].nomi_address3
                    : '',
                  nomieecity: this.nominee_Data
                    ? this.nominee_Data[0].nomicities
                    : '',
                  nomieestate: this.nominee_Data
                    ? this.nominee_Data[0].nomistates
                    : '',
                  nomieepin: this.nominee_Data
                    ? this.nominee_Data[0].nomipincode
                    : '',
                  nomieecontry: 'INDIA',
                  nomieecontno: this.nominee_Data
                    ? this.nominee_Data[0].nomiCNum
                    : '',
                  guardianDetails: {
                    guardianTitle: this.nominee_Data
                      ? this.nominee_Data[0].guaTitle
                      : '',
                    guardianName: this.nominee_Data
                      ? this.nominee_Data[0].guaname
                      : '',
                    reltoNominee: this.nominee_Data
                      ? this.nominee_Data[0].guarelation
                      : '',
                    guardianContNo: this.nominee_Data
                      ? this.nominee_Data[0].guaCNum
                      : '',
                    guardianAddressLine1: this.nominee_Data
                      ? this.nominee_Data[0].gua_address1
                      : '',
                    guardianAddressLine2: this.nominee_Data
                      ? this.nominee_Data[0].gua_address2
                      : '',
                    guardianCity: this.nominee_Data
                      ? this.nominee_Data[0].guacities
                      : '',
                    guardianState: this.nominee_Data
                      ? this.nominee_Data[0].guastates
                      : '',
                    guardianPincode: this.nominee_Data
                      ? this.nominee_Data[0].guapincode
                      : '',
                    guardianCountry: 'INDIA',
                  },
                },
                serviceRequested: {
                  modeofop: this.service_data
                    ? this.service_data[0].modeofoper
                    : '',
                  operinstruction: this.service_data
                    ? this.service_data[0].operaInst
                    : '',
                  custid: '',
                  instakitno: this.accountCreation.get('instaKitNumber').value
                    ? this.accountCreation.get('instaKitNumber').value
                    : '',
                  accountType: this.service_data
                    ? this.service_data[0].acType
                    : '',
                },
              };
            } else if (noInPs) {
              this.casaSubmitData = {
                appNo: this.applicantDetails[0].applicationNumber,
                selJanaAcc: 'N',
                nomineeAvail: '2',
                guaranterNomiee: '2',
                nomineeDetails: {
                  nomieeTitle: '',
                  nomieeName: '',
                  nomieedob: '',
                  nomineeguardianname: '',
                  nomieeage: '',
                  nomieerel: '',
                  nomieeadd1: '',
                  nomieeadd2: '',
                  nomieeadd3: '',
                  nomieecity: '',
                  nomieestate: '',
                  nomieepin: '',
                  nomieecontry: '',
                  nomieecontno: '',
                  guardianDetails: {
                    guardianTitle: '',
                    guardianName: '',
                    reltoNominee: '',
                    guardianContNo: '',
                    guardianAddressLine1: '',
                    guardianAddressLine2: '',
                    guardianCity: '',
                    guardianState: '',
                    guardianPincode: '',
                    guardianCountry: '',
                  },
                },
                serviceRequested: {
                  modeofop: this.service_data
                    ? this.service_data[0].modeofoper
                    : '',
                  operinstruction: this.service_data
                    ? this.service_data[0].operaInst
                    : '',
                  custid: '',
                  instakitno: this.accountCreation.get('instaKitNumber').value
                    ? this.accountCreation.get('instaKitNumber').value
                    : '',
                  accountType: this.service_data
                    ? this.service_data[0].acType
                    : '',
                },
              };
            } else {
              this.casaSubmitData = {
                appNo: this.applicantDetails[0].applicationNumber,
                selJanaAcc: casaValues.janaAcc,
                nomineeAvail: this.nomAvail,
                guaranterNomiee: this.guaAvail,
                nomineeDetails: {
                  nomieeTitle: '',
                  nomieeName: '',
                  nomieedob: '',
                  nomineeguardianname: '',
                  nomieeage: '',
                  nomieerel: '',
                  nomieeadd1: '',
                  nomieeadd2: '',
                  nomieeadd3: '',
                  nomieecity: '',
                  nomieestate: '',
                  nomieepin: '',
                  nomieecontry: '',
                  nomieecontno: '',
                  guardianDetails: {
                    guardianTitle: '',
                    guardianName: '',
                    reltoNominee: '',
                    guardianContNo: '',
                    guardianAddressLine1: '',
                    guardianAddressLine2: '',
                    guardianCity: '',
                    guardianState: '',
                    guardianPincode: '',
                    guardianCountry: '',
                  },
                },
                serviceRequested: {
                  modeofop: this.service_data
                    ? this.service_data[0].modeofoper
                    : '',
                  operinstruction: this.service_data
                    ? this.service_data[0].operaInst
                    : '',
                  custid: '',
                  instakitno: this.accountCreation.get('instaKitNumber').value
                    ? this.accountCreation.get('instaKitNumber').value
                    : '',
                  accountType: this.service_data
                    ? this.service_data[0].acType
                    : '',
                },
              };
            }
            console.log(JSON.stringify(this.casaSubmitData), 'CurrentAccDet');
            this.master
              .restApiCallAngular('CurrentAccDet', this.casaSubmitData)
              .then(
                (data) => {
                  if ((<any>data).ErrorCode == '000') {
                    if (!noInPs) {
                      this.getAnnexImgs(this.service_data[0].serId).then(
                        (data) => {
                          this.getServiceImgs(this.service_data[0].serId);
                          resolve(data);
                        }
                      );
                    } else {
                      this.alertService.showAlert(
                        'Alert',
                        'CASA Submitted Successfully'
                      );
                    }
                  } else {
                    if ((<any>data).ErrorDesc) {
                      this.globalData.globalLodingDismissAll();
                      this.alertService.showAlert(
                        'Alert',
                        (<any>data).ErrorDesc
                      );
                    } else {
                      this.globalData.globalLodingDismissAll();
                      this.alertService.showAlert(
                        'Alert!',
                        'Application CA/SA Details submission Failed!'
                      );
                    }
                  }
                },
                (err) => {
                  this.globalData.globalLodingDismissAll();
                  if (err.name == 'TimeoutError') {
                    this.alertService.showAlert('Alert!', err.message);
                  } else {
                    this.alertService.showAlert(
                      'Alert!',
                      'No response from server!'
                    );
                  }
                }
              );
          }
        });
      } catch (error) {
        console.log(error.message);
        this.alertService.showAlert('Alert!', error.message);
        this.sqliteProvider.addAuditTrail(
          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          'casaInit',
          'casaInit',
          JSON.stringify(error)
        );
      }
    });
  }

  getAnnexImgs(serId) {
    return new Promise((resolve, reject) => {
      this.sqlSupport
        .getAnnexure(serId)
        .then((annex) => {
          if (annex.length > 0) {
            this.annex_imgs = [];
            for (let i = 0; i < annex.length; i++) {
              // this.base64.encodeFile(annex[i].imgpath).then((base64File: string) => {
              let temp_annex = {
                // "annexureImg": base64File.replace(/\n/g, ''),
                annexureImg: annex[i].imgpath,
                annexureImgName:
                  this.applicantDetails[0].applicationNumber +
                  '_ANN_' +
                  i +
                  '.jpg',
              };
              this.annex_imgs.push(temp_annex);

              let annexData = {
                DocName: 'ANNEX',
                DocDesc:
                  this.applicantDetails[0].applicationNumber +
                  '_ANN_' +
                  i +
                  '.jpg',
                // "DocFile": base64File.replace(/\n/g, ''),
                DocFile: annex[i].imgpath,
              };
              this.other_docs.push(annexData);
              resolve(this.other_docs);
              if (i == this.annex_imgs.length - 1) {
                console.log(this.other_docs, 'annex images');
              }
              // }, (err) => {
              //   console.log(err);
              // });
            }
          }
        })
        .catch((e) => {
          console.log('er' + e);
        });
    });
  }

  getServiceImgs(serId) {
    return new Promise((resolve, reject) => {
      this.sqlSupport
        .getSignImages(serId)
        .then((sign) => {
          if (sign.length > 0) {
            // this.base64.encodeFile(sign[0].imgpath).then((base64File: string) => {
            //   this.sign_imgs = base64File.replace(/\n/g, '');
            this.sign_imgs = sign[0].imgpath;
            let signData = {
              DocName: 'SIGN',
              DocDesc: this.applicantDetails[0].applicationNumber + '_sign.jpg',
              DocFile: this.sign_imgs,
            };
            this.other_docs.push(signData);
            resolve(this.other_docs);
            console.log(this.other_docs, 'service images');
            this.editedCasaDocUpload();
            // }, (err) => {
            //   console.log(err);
            // });
          }
        })
        .catch((e) => {
          console.log('er' + e);
        });
    });
  }

  editedCasaDocUpload() {
    return new Promise((resolve, reject) => {
      if (this.other_docs.length > 0) {
        let docs_upload = {
          OtherDoc: {
            DocAppno: this.applicantDetails[0].applicationNumber,
            OtherDocs: this.other_docs,
          },
        };
        this.master
          .restApiCallAngular('UploadDocs', docs_upload)
          .then((res) => {
            this.globFunc.globalLodingDismiss();
            let editedCasaDoc = <any>res;
            if (editedCasaDoc.errorCode == '00') {
              this.serviceCallForSubmission();
              this.other_docs = [];
              resolve(res);
            }
          })
          .catch((err) => err);
      }
    });
  }

  advanceEMIAdded(event) {
    let advanceEMI = event.detail.value;
    // if(this.applicantDetails[0].advanceEmi !== advanceEMI){
    if (
      advanceEMI.length > 0 &&
      advanceEMI !== this.applicantDetails[0].advanceEmi
    ) {
      this.applicantDetails[0].advanceEmi = event.detail.value;
      this.downPaymentCalc();
      this.preEmiNoCalculation();
    } else if (advanceEMI == '') {
      this.alertService.showAlert('Alert', 'Advance EMI should not be Empty!');
    }
    // }
  }

  editPostSanctionAfterSubmit() {
    this.submitDisable = false;
    this.disableEditBtn = true;
  }

  calculateRegDate() {
    let yearValue = +this.postsanction.controls.yearOfMan.value;
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
    this.postsanction.controls.obv.setValue('');
    this.postsanction.controls.obv.updateValueAndValidity();
    this.postsanction.controls.assetPrice.setValue('');
    this.postsanction.controls.assetPrice.updateValueAndValidity();
  }

  finalAssetPrice() {
    let dealerValue = +this.postsanction.controls.dealerQuotation.value;
    if (dealerValue) {
      let obvValue = +this.postsanction.controls.obv.value;
      if (obvValue) {
        let finalValue = Math.min(dealerValue, obvValue);
        this.postsanction.controls.assetPrice.setValue(finalValue);
        this.postsanction.controls.assetPrice.updateValueAndValidity();
        this.loanAmtRoadPriceCheck();
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

  calculateVehicleAge() {
    let regDate = this.postsanction.get('registrationDate').value;
    let calcRegDate = new Date(regDate).getFullYear();
    let currentYear = this.today.getFullYear();
    let calcAge = currentYear - calcRegDate;
    let tenureMonth = +this.postsanction.get('tenure').value;
    let totalAge = calcAge * 12 + tenureMonth;
    console.log(totalAge);
    this.postsanction.controls.assetAge.setValue(totalAge);
    this.postsanction.controls.assetAge.updateValueAndValidity();
  }

  clearSegment() {
    this.postsanction.controls.segment.setValue('');
  }

  tenureValidation() {
    let tenureValue = this.postsanction.get('tenure').value;
    let tenureval = this.vlTenure.filter((data) => data.CODE == tenureValue);
    if (
      +tenureval[0].NAME < this.tenureFrom ||
      +tenureval[0].NAME > this.tenureTo
    ) {
      this.postsanction.controls.tenure.setValue('');
      this.postsanction.controls.tenure.updateValueAndValidity();
      this.alertService.showAlert(
        'Alert!',
        `Please Select Tenure period between ${this.tenureFrom} - ${this.tenureTo}`
      );
    }
  }

  getPermAddressInfo() {
    // this.sqlSupport.getPermanentAppDetails(this.refId).then(async data => {
    //   let permAddressData = data;
    //   let per = this.globFunc.basicDec(permAddressData[0].perm_states);
    //   await this.sqliteProvider.getSelectedCity(per).then(data => {
    //     let permCity = data;
    //     this.permCity = permCity.filter(data => data.cityCode == this.globFunc.basicDec(permAddressData[0].perm_cities));
    //   });
    // })
    this.sqliteProvider
      .getPresentAddress(this.refId, this.id)
      .then(async (data) => {
        let presAddressData = data;
        let pres = this.globFunc.basicDec(presAddressData[0].pres_states);
        await this.sqliteProvider.getSelectedCity(pres).then((data) => {
          let presCity = data;
          this.presentCity = presCity.filter(
            (data) =>
              data.cityCode ==
              this.globFunc.basicDec(presAddressData[0].pres_cities)
          );
        });
      });
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
      this.sqlSupport.addAuditTrail(
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
  async orpAuthFetch(type, brandName?: string) {
    let vehicleType = ORPApiStrings;
    let value: string;
    let year: string =
      this.vehicleType == 'N'
        ? this.today.getFullYear()
        : this.postsanction.get('yearOfMan').value;
    switch (type) {
      case vehicleType.category:
        value = this.globalData.convertToString(
          this.postsanction.get('vehicleCatogery').value
        );
        await this.orpApi
          .frameRequestORPNew('category', value)
          .then((response) => {
            this.makeApiList = response;
          });
        break;
      case vehicleType.model:
        value = this.globalData.convertToString(
          this.postsanction.get('brandName').value
        );
        await this.orpApi
          .frameRequestORPNew('model', value)
          .then((response) => {
            this.modelApiList = response;
          });
        break;
      case vehicleType.variant:
        value = this.globalData.convertToString(
          this.postsanction.get('model').value
        );
        brandName = brandName ? brandName : '';
        await this.orpApi
          .frameRequestORPNew('variant', value, year, brandName)
          .then((response) => {
            this.varientApiList = response;
          });
        break;
      case vehicleType.ORP:
        if (this.vehicleType == 'N') {
          value = this.globalData.convertToString(
            this.postsanction.get('variant').value
          );
          await this.orpApi
            .frameRequestORPNew(
              'ORP',
              value,
              year,
              '',
              this.presentCity[0].cityName
            )
            .then((response: any) => {
              if (response.onroad_price) {
                this.apiORPPrice =
                  +response.onroad_price.split(',').join('') +
                  +response.onroad_price.split(',').join('') *
                    (+localStorage.getItem('ORPPer') / 100);
                this.postsanction.get('apiFlag').setValue('Y');
                console.log(
                  `Actual Amt is ${+response.onroad_price
                    .split(',')
                    .join('')}, added ${+localStorage.getItem('ORPPer')}% is ${
                    this.apiORPPrice
                  }`
                );
                // this.checkORPActualVal();
                this.orpApiPriceCheck();
              } else {
                this.orpEmpty = false;
              }
            });
        } else {
          let body = {
            make: this.globalData.convertToString(
              this.postsanction.get('brandName').value
            ),
            model: this.globalData.convertToString(
              this.postsanction.get('model').value
            ),
            year: this.globalData.convertToString(
              this.postsanction.get('yearOfMan').value
            ),
            trim: this.globalData.convertToString(
              this.postsanction.get('variant').value
            ),
            kms_driven: this.globalData.convertToString(
              this.postsanction.get('kmDriven').value
            ),
            city: this.presentCity[0].cityName,
            noOfOwners: this.globalData.convertToString(
              this.postsanction.get('noofOwner').value
            ),
          };
          await this.orpApi.frameRequestORPUsed(body).then(async (response) => {
            if (response) {
              response = response.Good.range_from
                ? (response.Good.range_from + response.Good.range_to) / 2
                : 0;
              this.postsanction.get('apiFlag').setValue('Y');
              this.obvEditable = await this.setDealerValue(
                this.postsanction.value.dealerName,
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
    this.globFunc.globalLodingDismiss();
  }

  async setDealerValue(dealerCode: any, findName?: string) {
    const dealer = await this.dummy_masterDealer.find(
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
        this.postsanction.get('dealerName').setValue(dealer.dealerCode);
        this.postsanction.get('dealerName').updateValueAndValidity();
      }
    }
  }

  /**
   * @method obvChange
   * @description Function helps to change the diabled status of OBV based on the value .
   * @author HariHaraSuddhan S
   */
  obvChange(value: number) {
    try {
      this.postsanction.get('obv').setValue(value);
      this.postsanction.get('obv').updateValueAndValidity();
      this.obvEditable = value <= 0 ? false : true;
      this.obvEditable
        ? this.postsanction.controls.dealerQuotation.setValue('')
        : '';
      !this.obvEditable ? this.postsanction.controls.obv.setValue('') : '';
    } catch (error) {
      console.log(error, 'AssetTabsPag obvChange');
    }
  }

  /**
   * @method fetchDetailsFromRC
   * @description Function helps to fetch details of RC from Droom API .
   * @author HariHaraSuddhan S
   */
  async fetchDetailsFromRC() {
    try {
      this.globFunc.globalLodingPresent('Please Wait..');
      this.postsanction.get('obv').reset();
      this.postsanction.get('kmDriven').reset();
      await this.orpApi
        .getRCDetails(this.postsanction.get('rcNo').value)
        .then((data: any) => {
          this.globFunc.globalLodingDismiss();
          console.log('getRCDetails', data);
          if (data) {
            if (!data.blacklisted) {
              this.postsanction
                .get('engineNo')
                .setValue(data.engine_number ? data.engine_number : 'NA');
              this.postsanction
                .get('chassisNo')
                .setValue(data.chassis_number ? data.chassis_number : 'NA');
              this.postsanction
                .get('registrationDate')
                .setValue(
                  data.registration_date
                    ? this.globalData.formatDateString(data.registration_date)
                    : 'NA'
                );
              this.postsanction
                .get('hypothecation')
                .setValue(
                  data.financing_authority ? data.financing_authority : 'No'
                );
              this.postsanction
                .get('noofOwner')
                .setValue(data.owner_serial_number);
              this.postsanction
                .get('nameAsPerRC')
                .setValue(data.vehicle_model ? data.vehicle_model : 'NA');
              // this.postsanction.get('insExpDate').setValue(data.insurance_upto ? this.globalData.formatDateString(data.insurance_upto) : 'NA');
              // this.postsanction.get('insCompany').setValue(data.insurance_company ? data.insurance_company : 'NA');
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
      this.sqlSupport.addAuditTrail(
        new Date().getTime(),
        'fetchDetailsFromRC',
        '',
        error
      );
      this.RCFetchDetailsDisable = false;
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
        +this.postsanction.get('onroadPrice').value > this.apiORPPrice &&
        this.apiORPPrice !== 0
      ) {
        this.postsanction.get('onroadPrice').setValue('');
        this.postsanction.updateValueAndValidity();
        this.alertService.showAlert(
          'Alert',
          'Please mention the Correct OnRoad Price'
        );
      }
    } else if (
      +this.postsanction.get('onroadPrice').value > this.manualORPLimit
    ) {
      this.postsanction.get('onroadPrice').setValue('');
      this.postsanction.updateValueAndValidity();
      this.alertService.showAlert('Alert', 'Please mention ORP less then 10L');
    }
  }

  /**
   * @method reSetRCDetails
   * @description Function helps to reset the values if Values not found from API .
   * @author HariHaraSuddhan S
   */
  reSetRCDetails() {
    this.postsanction.get('engineNo').setValue('');
    this.postsanction.get('chassisNo').setValue('');
    this.postsanction.get('registrationDate').setValue('');
    this.postsanction.get('hypothecation').setValue('');
    this.postsanction.get('noofOwner').setValue('');
    this.postsanction.get('nameAsPerRC').setValue('');
    this.postsanction.get('insExpDate').setValue('');
    this.postsanction.get('insCompany').setValue('');
  }

  /**
   * @method orpApiValueChangeFieldReset
   * @description Function helps to reset the form value if user made any changes in vehicle details .
   * @author HariHaraSuddhan S
   */

  orpApiValueChangeFieldReset(type: string) {
    switch (type) {
      case 'catogery':
        this.postsanction.get('brandName').reset();
        this.postsanction.get('model').reset();
        this.postsanction.get('variant').reset();
        if (this.vehicleType == 'N') {
          this.postsanction.get('onroadPrice').reset();
        } else {
          this.postsanction.get('kmDriven').reset();
          this.postsanction.get('yearOfMan').reset();
        }
        break;
      case 'make':
        this.postsanction.get('model').reset();
        this.postsanction.get('variant').reset();
        if (this.vehicleType == 'N') {
          this.postsanction.get('onroadPrice').reset();
        } else {
          this.postsanction.get('kmDriven').reset();
          this.postsanction.get('yearOfMan').reset();
        }
        break;
      case 'model':
        this.postsanction.get('variant').reset();
        this.postsanction.get('onroadPrice').reset();
        break;
      case 'variant':
        this.vehicleType == 'N'
          ? this.postsanction.get('onroadPrice').reset()
          : this.postsanction.get('kmDriven').reset();
        break;
    }
  }
}
