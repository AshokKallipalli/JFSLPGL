import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
})
export class AddressComponent implements OnInit {
  custType: any;
  lmsLeadId: any;
  refinfo: any;
  LMSDetails: any;
  addressType: any = 'Permanent';
  busiSameCheck: boolean = false;
  entiSameCheck: boolean = false;
  defaultTrue: boolean = true;

  permSameCheck: boolean = false;
  permantDisable: boolean = false;
  applicantDisable: boolean = false;
  appSameCheck: boolean = false;
  businessDisable: boolean = false;
  useSecondAdd: boolean = false;
  isSecondAdd = false;
  stateCode: any;
  stateName: any;
  stateName1: any;
  stateCode1: any;
  stateCode2: any;
  presentCity: any;
  permanentCity: any;
  businessCity: any;
  yrsCurResi: any;
  // busi_yrsCurBusi: any;
  // busi_yrsCurCity: any;
  cityName: any;
  rstateName: any;
  resiStatus: any;
  busiStatus: any;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  permanentAdrsData: FormGroup;
  presentAdrsData: FormGroup;
  businessAdrsData: FormGroup;

  refId: any;
  id: any;
  leadId: any;
  PERMID: any;
  PRESID: any;
  BUSID: any;
  ENTID: any;
  presentAdrs: any;
  BusinessAdrs: any;
  getPersmanentData: any;
  getEntityData: any;

  master_states: any;
  master_cities: any;
  //ShowTicks
  PermanentTick: boolean = false;
  PresentTick: boolean = false;
  BusinessTick: boolean = false;
  fieldDisable: boolean = false;
  submitDisable: boolean = false;
  perstate: any;
  aadharData: any;
  address1: any;
  district: any;
  pc: any;
  state: any;
  address2: any;
  city: any;
  village: any;
  userType: any;

  selectOptions = {
    cssClass: 'remove-ok',
  };
  dummy_master: any = [
    { code: '1', Name: 'Dummy 1' },
    { code: '2', Name: 'Dummy 2' },
    { code: '3', Name: 'Dummy 3' },
    { code: '4', Name: 'Dummy 4' },
  ];
  // permAdrsList: any = [
  //   { "CODE": "1", "NAME": "Aadhaar" },
  //   { "CODE": "2", "NAME": "Passport" },
  //   { "CODE": "3", "NAME": "Voter Id" },
  //   { "CODE": "4", "NAME": "Driving License" },
  //   { "CODE": "5", "NAME": "Others" },
  // ];
  permAdrsList: any = [];
  // notPermAdrsList: any = [
  //   { "CODE": "1", "NAME": "Utility bills" },
  //   { "CODE": "2", "NAME": "Property Tax Receipt" },
  //   { "CODE": "3", "NAME": "Allotment Letter issued by Govt" }
  //   // { "CODE": "3", "NAME": "Allotment Letter issued by Govt" }
  // ];
  notPermAdrsList: any = [];
  // residenceType: any = [
  //   { "CODE": "1", "NAME": "Own" },
  //   { "CODE": "2", "NAME": "Rented" },
  //   { "CODE": "3", "NAME": "Parental" },
  //   { "CODE": "4", "NAME": "Relative" }
  // ];
  karzaData: any;

  @Output() saveStatus = new EventEmitter();
  formActivater = { disableForm: true, disableForm1: true };
  pagename = 'Permanent Address Details';
  pagename1 = 'Present Address Details';

  getEkycData: any;
  addressoneDisable: boolean = false;
  addresstwoDisable: boolean = false;
  ekycDisable: boolean = false;
  ekycStateDisable: boolean = false;
  getAllStateMaster: any = [];
  perStateDisable: boolean = false;
  perCityDisable: boolean = false;
  // addressoneDisable: boolean = false;
  // addresstwoDisable: boolean = false;
  adrType: any = [];

  ekyc: any;
  secKycSub: Subscription;
  naveParamsValue: any;
  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    // public events: Events,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public alertCtrl: AlertController,
    public activateRoute: ActivatedRoute,
    public globalData: DataPassingProviderService,
    // public viewCtrl: ViewController,
    public sqlSupport: SquliteSupportProviderService,
    public globFunc: GlobalService,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService
  ) {
    this.activateRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.userType = this.globalData.getborrowerType();
    this.karzaData = this.naveParamsValue.licence;
    this.getEkycData = this.naveParamsValue.ekycData
      ? JSON.parse(this.naveParamsValue.ekycData)
      : '';

    this.ekyc = this.naveParamsValue.ekyc;

    this.getStateValue();
    this.getCityValue(undefined);
    this.getAddressType();
    this.getAddressAsPerKyc();
    this.getOtherDocuments();
    this.getCibilCheckedDetails();
    this.getyrsCurCity();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.custType = this.globalData.getCustType();
    this.leadId = localStorage.getItem('leadId');
    if (this.refId === '' || this.refId === undefined || this.refId === null) {
      this.refId = '';
    } else {
      this.karzaAdrsDataFetch();
      this.getPresentDetails();
      this.getPermanentDetails();
      this.getBusinessDetails();
    }
    this.getLeadId();
    // this.updateExCusData();

    this.presentAdrsData = this.formBuilder.group({
      pres_presmAdrsKYC: ['', Validators.required],
      pres_manualEntry: [''],
      pres_type: ['2', Validators.required],
      // pres_plots: ["", Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9.,/#& ]*'), Validators.required])],
      pres_plots: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
          Validators.required,
        ]),
      ],
      // pres_locality: ["", Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9.,/#& ]*'), Validators.required])],
      pres_locality: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
          Validators.required,
        ]),
      ],
      pres_line3: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
        ]),
      ],
      pres_states: ['', Validators.required],
      pres_cities: ['', Validators.required],
      pres_district: ['', Validators.required],
      pres_pincode: [
        '',
        Validators.compose([
          Validators.pattern('[0-9]{6}'),
          Validators.required,
        ]),
      ],
      pres_countries: ['India', Validators.required],
      pres_landmark: [
        '',
        Validators.compose([
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.required,
        ]),
      ], // Validators.pattern('[a-zA-z0-9 ]*')
      //pres_resType: ["", Validators.required],
      pres_yrsCurCity: [
        '',
        Validators.compose([
          Validators.maxLength(2),
          Validators.pattern('[0-9]*'),
          Validators.required,
        ]),
      ],
    });

    this.permanentAdrsData = this.formBuilder.group({
      perm_permAdrsKYC: ['', Validators.required],
      perm_manualEntry: [''],
      perm_type: ['1', Validators.required],
      // perm_plots: ["", Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9.,/#& ]*'), Validators.required])],
      perm_plots: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
          Validators.required,
        ]),
      ],
      // perm_locality: ["", Validators.compose([Validators.maxLength(100), Validators.pattern('[a-zA-Z0-9.,/#& ]*'), Validators.required])],
      perm_locality: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
          Validators.required,
        ]),
      ],
      perm_line3: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
        ]),
      ],
      perm_states: ['', Validators.required],
      perm_cities: ['', Validators.required],
      perm_district: ['', Validators.required],
      perm_pincode: [
        '',
        Validators.compose([
          Validators.pattern('[0-9]{6}'),
          Validators.required,
        ]),
      ],
      perm_countries: ['India', Validators.required],
      perm_landmark: [
        '',
        Validators.compose([
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.required,
        ]),
      ], // Validators.pattern('[a-zA-z0-9 ]*')
      //resType: ["", Validators.required],
      perm_yrsCurCity: [
        '',
        Validators.compose([
          Validators.maxLength(2),
          Validators.pattern('[0-9]*'),
          Validators.required,
        ]),
      ],
    });

    this.businessAdrsData = this.formBuilder.group({
      busi_type: ['5', Validators.required],
      //busi_AdrsKYC: ["", Validators.required],
      //busi_manualEntry: [""],
      busi_plots: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
          Validators.required,
        ]),
      ], // Validators.pattern('[a-zA-Z0-9.,/#& ]*'),
      busi_locality: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
          Validators.required,
        ]),
      ], // Validators.pattern('[a-zA-Z0-9.,/#& ]*'),
      busi_line3: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
        ]),
      ],
      busi_states: ['', Validators.required],
      busi_cities: ['', Validators.required],
      busi_district: ['', Validators.required],
      busi_pincode: [
        '',
        Validators.compose([
          Validators.pattern('[0-9]{6}'),
          Validators.required,
        ]),
      ],
      busi_countries: ['India', Validators.required],
      busi_landmark: [
        '',
        Validators.compose([
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
          Validators.required,
        ]),
      ],
      busi_yrsCurCity: [
        '',
        Validators.compose([
          Validators.maxLength(2),
          Validators.pattern('[0-9]*'),
          Validators.required,
        ]),
      ],
    });

    this.updateExCusData();
    this.karzaDataFetch('');
    this.EkycDataFetch('');
    this.twoKycAddressCheck();
    if (this.naveParamsValue.appRefValue) {
      this.refinfo = JSON.parse(this.naveParamsValue.appRefValue);
      if (this.refinfo.lmsLeadId != '') {
        this.lmsLeadId = this.refinfo.lmsLeadId;
        this.getaddresslmsData();
      }
    }

    if (this.naveParamsValue.fieldDisable) {
      this.fieldDisable = true;
      this.submitDisable = true;
      this.permantDisable = true;
      this.businessDisable = true;
      this.applicantDisable = true;
      this.perStateDisable = true;
      this.perCityDisable = true;
    }

    this.secKycSub = this.globFunc.secKycAddress.subscribe((data) => {
      this.twoKycAddressCheck();
      console.log(data, '2nd kyc address');
      console.log(this.permanentAdrsData);
      if (data.id == 'dl') {
        if (
          !this.permanentAdrsData.value.perm_plots &&
          !this.permanentAdrsData.value.perm_locality
        ) {
          this.karzaData = data.val;
          this.karzaDataFetch('1');
        }
      } else if (data.id == 'aadhar') {
        if (
          !this.permanentAdrsData.value.perm_plots &&
          !this.permanentAdrsData.value.perm_locality
        ) {
          this.getEkycData = data.val;
          this.ekyc = 'OTP';
          this.EkycDataFetch('1');
        }
      }
    });

    /*    this.permanentAdrsData.valueChanges.subscribe(() => {
          // console.log(this.QDEIndividualDemoGraphic);
          if (this.permanentAdrsData.pristine == false) {
            if (this.permanentAdrsData.status === "INVALID") {
              this.formActivater.disableForm = true;
              this.globFunc.setapplicationDataChangeDetector('modified', this.pagename);
            } else {
              this.formActivater.disableForm = false;
              this.globFunc.setapplicationDataChangeDetector('modified', this.pagename);
            }
          }
        })
    
        this.presentAdrsData.valueChanges.subscribe(() => {
          // console.log(this.QDEIndividualDemoGraphic);
          if (this.presentAdrsData.pristine == false) {
            if (this.presentAdrsData.status === "INVALID") {
              this.formActivater.disableForm1 = true;
              this.globFunc.setapplicationDataChangeDetector('modified', this.pagename1);
            } else {
              this.formActivater.disableForm1 = false;
              this.globFunc.setapplicationDataChangeDetector('modified', this.pagename1);
            }
          }
        })*/
  }

  twoKycAddressCheck() {
    if (this.leadId) {
      this.sqliteProvider
        .getEKYCDetails(this.leadId)
        .then((ekycData) => {
          if (ekycData.length > 0) {
            this.sqliteProvider
              .getGivenKarzaDetailsByLeadid(this.leadId)
              .then((data) => {
                if (data.length && data[0].idType == 'licence') {
                  if (data[0].address1) {
                    this.isSecondAdd = true;
                  }
                }
              })
              .catch((err) => err);
          }
        })
        .catch((err) => err);
    } else {
      this.sqliteProvider
        .getSourcingDetails(this.refId, this.id)
        .then((data) => {
          console.log(data);
          this.leadId = data[0].leadId;
          this.sqliteProvider
            .getEKYCDetails(this.leadId)
            .then((ekycData) => {
              if (ekycData.length > 0) {
                this.sqliteProvider
                  .getGivenKarzaDetailsByLeadid(this.leadId)
                  .then((data) => {
                    if (data.length && data[0].idType == 'licence') {
                      if (data[0].address1) {
                        this.isSecondAdd = true;
                      }
                    }
                  })
                  .catch((err) => err);
              }
            })
            .catch((err) => err);
        })
        .catch((err) => err);
    }
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

  ionViewDidEnter() {
    // this.getStateValue();
    this.getCityValue(undefined);
    console.log('address did enter');
  }

  async secondAddress(value) {
    let event = value.detail;
    console.log(event);
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    let basic = await this.sqliteProvider.getBasicDetails(this.refId, this.id);
    let ekyc = (await this.sqliteProvider.getEKYCDetails(this.leadId)) || '';

    if (event.checked) {
      if (basic[0].vaultStatus == 'Y') {
        let karza = await this.sqliteProvider.getGivenKarzaDetailsByLeadid(
          this.leadId
        );
        console.log(karza, this.permanentAdrsData, basic);
        this.permanentAdrsData = this.formBuilder.group({
          perm_type: ['1', Validators.required],
          perm_permAdrsKYC: ['', Validators.required],
          perm_manualEntry: [''],
          perm_plots: [
            '',
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          perm_locality: [
            '',
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          perm_line3: [
            '',
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
            ]),
          ],
          perm_states: ['', Validators.required],
          perm_cities: ['', Validators.required],
          perm_district: ['', Validators.required],
          perm_pincode: [
            '',
            Validators.compose([
              Validators.pattern('[0-9]{6}'),
              Validators.required,
            ]),
          ],
          perm_countries: ['India', Validators.required],
          perm_landmark: [
            '',
            Validators.compose([
              Validators.maxLength(50),
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.required,
            ]),
          ], // Validators.pattern('[a-zA-z0-9 ]*')
          perm_yrsCurCity: [
            '',
            Validators.compose([
              Validators.maxLength(2),
              Validators.pattern('[0-9]*'),
              Validators.required,
            ]),
          ],
        });
        this.perStateDisable = false;
        this.perCityDisable = false;
        this.applicantDisable = false;

        let data = {
          permAddressLine1: this.globFunc.basicDec(karza[0].address1),
          permAddressLine2: this.globFunc.basicDec(karza[0].address2),
          permPincode: this.globFunc.basicDec(karza[0].pincode),
          type: 'licence',
        };

        this.karzaData = data;
        this.karzaDataFetch('1');
        console.log(this.permanentAdrsData);
      } else {
        console.log(ekyc, this.permanentAdrsData, basic);
        this.permanentAdrsData = this.formBuilder.group({
          perm_type: ['1', Validators.required],
          perm_permAdrsKYC: ['', Validators.required],
          perm_manualEntry: [''],
          perm_plots: [
            '',
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          perm_locality: [
            '',
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          perm_line3: [
            '',
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
            ]),
          ],
          perm_states: ['', Validators.required],
          perm_cities: ['', Validators.required],
          perm_district: ['', Validators.required],
          perm_pincode: [
            '',
            Validators.compose([
              Validators.pattern('[0-9]{6}'),
              Validators.required,
            ]),
          ],
          perm_countries: ['India', Validators.required],
          perm_landmark: [
            '',
            Validators.compose([
              Validators.maxLength(50),
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.required,
            ]),
          ], // Validators.pattern('[a-zA-z0-9 ]*')
          perm_yrsCurCity: [
            '',
            Validators.compose([
              Validators.maxLength(2),
              Validators.pattern('[0-9]*'),
              Validators.required,
            ]),
          ],
        });
        this.applicantDisable = false;

        let address = JSON.parse(ekyc[0].Ekycaddress);
        let data = {
          co: '',
          country: address.country,
          dist: address.dist,
          dob: '',
          gender: '',
          house: address.house,
          lm: address.lm,
          loc: address.loc,
          name: '',
          pc: address.pc,
          state: address.state,
          street: address.street,
          vtc: address.vtc,
        };
        this.getEkycData = data;
        this.ekyc = 'OTP';
        this.EkycDataFetch('1');
      }
    } else {
      this.permanentAdrsData = this.formBuilder.group({
        perm_type: ['1', Validators.required],
        perm_permAdrsKYC: ['', Validators.required],
        perm_manualEntry: [''],
        perm_plots: [
          '',
          Validators.compose([
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.maxLength(40),
            Validators.minLength(3),
            Validators.required,
          ]),
        ],
        perm_locality: [
          '',
          Validators.compose([
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.maxLength(40),
            Validators.minLength(3),
            Validators.required,
          ]),
        ],
        perm_line3: [
          '',
          Validators.compose([
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.maxLength(40),
            Validators.minLength(3),
          ]),
        ],
        perm_states: ['', Validators.required],
        perm_cities: ['', Validators.required],
        perm_district: ['', Validators.required],
        perm_pincode: [
          '',
          Validators.compose([
            Validators.pattern('[0-9]{6}'),
            Validators.required,
          ]),
        ],
        perm_countries: ['India', Validators.required],
        perm_landmark: [
          '',
          Validators.compose([
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.required,
          ]),
        ], // Validators.pattern('[a-zA-z0-9 ]*')
        perm_yrsCurCity: [
          '',
          Validators.compose([
            Validators.maxLength(2),
            Validators.pattern('[0-9]*'),
            Validators.required,
          ]),
        ],
      });
      this.applicantDisable = false;

      if (basic[0].vaultStatus == 'Y') {
        let address = JSON.parse(ekyc[0].Ekycaddress);
        let data = {
          co: '',
          country: address.country,
          dist: address.dist,
          dob: '',
          gender: '',
          house: address.house,
          lm: address.lm,
          loc: address.loc,
          name: '',
          pc: address.pc,
          state: address.state,
          street: address.street,
          vtc: address.vtc,
        };
        this.getEkycData = data;
        this.ekyc = 'OTP';
        this.EkycDataFetch('1');
      } else {
        let karza = await this.sqliteProvider.getGivenKarzaDetailsByLeadid(
          this.leadId
        );
        console.log(karza, this.permanentAdrsData, basic);
        this.permanentAdrsData = this.formBuilder.group({
          perm_type: ['1', Validators.required],
          perm_permAdrsKYC: ['', Validators.required],
          perm_manualEntry: [''],
          perm_plots: [
            '',
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          perm_locality: [
            '',
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          perm_line3: [
            '',
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
            ]),
          ],
          perm_states: ['', Validators.required],
          perm_cities: ['', Validators.required],
          perm_district: ['', Validators.required],
          perm_pincode: [
            '',
            Validators.compose([
              Validators.pattern('[0-9]{6}'),
              Validators.required,
            ]),
          ],
          perm_countries: ['India', Validators.required],
          perm_landmark: [
            '',
            Validators.compose([
              Validators.maxLength(50),
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.required,
            ]),
          ], // Validators.pattern('[a-zA-z0-9 ]*')
          perm_yrsCurCity: [
            '',
            Validators.compose([
              Validators.maxLength(2),
              Validators.pattern('[0-9]*'),
              Validators.required,
            ]),
          ],
        });
        this.perStateDisable = false;
        this.perCityDisable = false;
        this.applicantDisable = false;

        let data = {
          permAddressLine1: this.globFunc.basicDec(karza[0].address1),
          permAddressLine2: this.globFunc.basicDec(karza[0].address2),
          permPincode: this.globFunc.basicDec(karza[0].pincode),
          type: 'licence',
        };

        this.karzaData = data;
        this.karzaDataFetch('1');
        console.log(this.permanentAdrsData);
      }
    }
    console.log('secondadd func end');
  }

  presentAddressSave(value) {
    this.loadingService.globalLodingPresent('Please wait...');
    let saveStatus = localStorage.getItem('Permanent');
    // this.globalData.getEditSaveStatus().forEach(element => {
    //   if (element == "PermanentAddSaved") {
    //     saveStatus = "PermanentAddSaved";
    //   }
    // });
    if (saveStatus == 'PermanentAddSaved') {
      this.refId = this.globalData.getrefId();
      this.id = this.globalData.getId();
      this.sqliteProvider
        .insertPresentAddress(
          this.refId,
          this.id,
          this.permSameCheck,
          value,
          this.userType,
          this.PRESID
        )
        .then((data) => {
          if (
            this.PRESID === '' ||
            this.PRESID === null ||
            this.PRESID === undefined
          ) {
            this.PRESID = data.insertId;
            this.loadingService.globalLodingDismiss();
            if (this.userType === 'A') {
              this.alertService.showAlert(
                'Alert!',
                'Applicant Present Address Details Added Successfully'
              );
              this.formActivater.disableForm1 = true;
              this.globFunc.setapplicationDataChangeDetector(
                'saved',
                this.pagename1
              );
            } else {
              this.alertService.showAlert(
                'Alert!',
                'Co-Applicant Present Address Details Added Successfully'
              );
              this.formActivater.disableForm1 = true;
              this.globFunc.setapplicationDataChangeDetector(
                'saved',
                this.pagename1
              );
            }
          } else {
            this.loadingService.globalLodingDismiss();
            if (this.userType === 'A') {
              this.alertService.showAlert(
                'Alert!',
                'Applicant Present Address Details Updated Successfully'
              );
              this.formActivater.disableForm1 = true;
              this.globFunc.setapplicationDataChangeDetector(
                'saved',
                this.pagename1
              );
            } else {
              this.alertService.showAlert(
                'Alert!',
                'Co-Applicant Present Address Details Updated Successfully'
              );
              this.formActivater.disableForm1 = true;
              this.globFunc.setapplicationDataChangeDetector(
                'saved',
                this.pagename1
              );
            }
          }
          // this.globalData.setEditSaveStatus("presentAddSaved");
          localStorage.setItem('Present', 'presentAddSaved');

          this.PresentTick = true;
          if (this.PresentTick && this.PermanentTick && this.BusinessTick) {
            this.saveStatus.emit('addressTick');
            // this.globalData.setEditSaveStatus("addressSaved");
            // console.log(this.globalData.getEditSaveStatus()); this.events.publish("save", JSON.stringify(this.globalData.getEditSaveStatus()));
          }
        })
        .catch((Error) => {
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'Failed!');
        });
    } else {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Must Save Permanent Address Details!'
      );
    }
  }

  getPresentDetails() {
    this.sqliteProvider
      .getPresentAddress(this.refId, this.id)
      .then((data) => {
        this.presentAdrs = data;
        this.presentAdrsData = this.formBuilder.group({
          pres_type: ['2', Validators.required],
          pres_presmAdrsKYC: [
            this.presentAdrs[0].pres_presmAdrsKYC,
            Validators.required,
          ],
          pres_manualEntry: [this.presentAdrs[0].pres_manualEntry],
          pres_plots: [
            this.globFunc.basicDec(this.presentAdrs[0].pres_plots),
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          pres_locality: [
            this.globFunc.basicDec(this.presentAdrs[0].pres_locality),
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          pres_line3: [
            this.globFunc.basicDec(this.presentAdrs[0].pres_line3),
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
            ]),
          ],
          pres_states: [
            this.globFunc.basicDec(this.presentAdrs[0].pres_states),
            Validators.required,
          ],
          pres_cities: [
            this.globFunc.basicDec(this.presentAdrs[0].pres_cities),
            Validators.required,
          ],
          pres_district: [
            this.globFunc.basicDec(this.presentAdrs[0].pres_district),
            Validators.required,
          ],
          pres_pincode: [
            this.globFunc.basicDec(this.presentAdrs[0].pres_pincode),
            Validators.compose([
              Validators.pattern('[0-9]{6}'),
              Validators.required,
            ]),
          ],
          pres_countries: [
            this.presentAdrs[0].pres_countries,
            Validators.required,
          ],
          pres_landmark: [
            this.presentAdrs[0].pres_landmark,
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.required,
            ]),
          ], // Validators.pattern('[a-zA-z0-9 ]*')
          //pres_resType: [this.presentAdrs[0].pres_resType, Validators.compose([Validators.required])],
          pres_yrsCurCity: [
            this.presentAdrs[0].pres_yrsCurCity,
            Validators.compose([
              Validators.maxLength(2),
              Validators.pattern('[0-9]*'),
              Validators.required,
            ]),
          ],
        });
        this.refId = this.presentAdrs[0].refId;
        this.id = this.presentAdrs[0].id;
        this.PRESID = this.presentAdrs[0].PRESID;
        this.getCityValue('preState');
        this.PresentTick = true;
        // this.globalData.setEditSaveStatus("presentAddSaved");
        localStorage.setItem('Present', 'presentAddSaved');

        if (data[0].permSameCheck == 'true') {
          this.permSameCheck = true;
          this.permantDisable = true;
        } else {
          this.permSameCheck = false;
          this.permantDisable = false;
        }
        // this.getPresentaddressproof();
        if (this.PresentTick && this.PermanentTick && this.BusinessTick) {
          this.saveStatus.emit('addressTick');
          // this.globalData.setEditSaveStatus("addressSaved");
          // console.log(this.globalData.getEditSaveStatus()); this.events.publish("save", JSON.stringify(this.globalData.getEditSaveStatus()));
        }
      })
      .catch((Error) => {
        // console.log(Error);
      });
  }

  businessAdrsSave(value) {
    this.loadingService.globalLodingPresent('Please wait...');
    //let saveStatus = localStorage.getItem('Permanent');
    // if (saveStatus == "PermanentAddSaved") {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.sqliteProvider
      .insertBusinessAddress(
        this.refId,
        this.id,
        this.permSameCheck,
        value,
        this.userType,
        this.BUSID
      )
      .then((data) => {
        if (
          this.BUSID === '' ||
          this.BUSID === null ||
          this.BUSID === undefined
        ) {
          this.BUSID = data.insertId;
          this.loadingService.globalLodingDismiss();
          if (this.userType === 'A') {
            this.alertService.showAlert(
              'Alert!',
              'Applicant Business Address Details Added Successfully'
            );
          } else if (this.userType === 'C') {
            this.alertService.showAlert(
              'Alert!',
              'Co-Applicant Business Address Details Added Successfully'
            );
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Guarantor Business Address Details Added Successfully'
            );
          }
        } else {
          this.loadingService.globalLodingDismiss();
          if (this.userType === 'A') {
            this.alertService.showAlert(
              'Alert!',
              'Applicant Business Address Details Updated Successfully'
            );
          } else if (this.userType === 'C') {
            this.alertService.showAlert(
              'Alert!',
              'Co-Applicant Business Address Details Updated Successfully'
            );
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Guarantor Business Address Details Updated Successfully'
            );
          }
        }
        localStorage.setItem('Business', 'businessAddSaved');
        this.BusinessTick = true;
        if (this.PresentTick && this.PermanentTick && this.BusinessTick) {
          this.saveStatus.emit('addressTick');
          // this.events.publish('lead', "proof");
          this.globalData.leadEvent.next('proof');
        }
      })
      .catch((Error) => {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'Failed!');
      });
    // } else {
    //   this.loadingService.globalLodingDismiss();
    //   this.alertService.showAlert("Alert!", "Must Save Permanent Address Details!");
    // }
  }

  getBusinessDetails() {
    this.sqliteProvider
      .getBusinessAddress(this.refId, this.id)
      .then((data) => {
        this.BusinessAdrs = data;
        this.businessAdrsData = this.formBuilder.group({
          busi_type: [this.BusinessAdrs[0].busi_type, Validators.required],
          //busi_AdrsKYC: [this.BusinessAdrs[0].busi_AdrsKYC, Validators.required],
          //busi_manualEntry: [this.BusinessAdrs[0].busi_manualEntry],
          busi_plots: [
            this.BusinessAdrs[0].busi_plots,
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ], // Validators.pattern('[a-zA-Z0-9.,/#& ]*'),
          busi_locality: [
            this.BusinessAdrs[0].busi_locality,
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ], // Validators.pattern('[a-zA-Z0-9.,/#& ]*'),
          busi_line3: [
            this.BusinessAdrs[0].busi_line3,
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
            ]),
          ],
          busi_states: [
            JSON.parse(this.BusinessAdrs[0].busi_states),
            Validators.required,
          ],
          busi_cities: [
            JSON.parse(this.BusinessAdrs[0].busi_cities),
            Validators.required,
          ],
          busi_district: [
            JSON.parse(this.BusinessAdrs[0].busi_district),
            Validators.required,
          ],
          busi_pincode: [
            this.BusinessAdrs[0].busi_pincode,
            Validators.compose([
              Validators.pattern('[0-9]{6}'),
              Validators.required,
            ]),
          ],
          busi_countries: [
            this.BusinessAdrs[0].busi_countries,
            Validators.required,
          ],
          busi_landmark: [
            this.BusinessAdrs[0].busi_landmark,
            Validators.compose([
              Validators.maxLength(50),
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.required,
            ]),
          ],
          busi_yrsCurCity: [
            this.BusinessAdrs[0].busi_yrsCurCity,
            Validators.compose([
              Validators.maxLength(2),
              Validators.pattern('[0-9]*'),
              Validators.required,
            ]),
          ],
        });
        this.refId = this.BusinessAdrs[0].refId;
        this.id = this.BusinessAdrs[0].id;
        this.BUSID = this.BusinessAdrs[0].BUSID;

        this.getCityValue('busState');
        this.BusinessTick = true;
        // this.globalData.setEditSaveStatus("presentAddSaved");
        localStorage.setItem('Business', 'businessAddSaved');

        // if (data[0].permSameCheck == 'true') {
        //   this.permSameCheck = true;
        //   this.permantDisable = true;
        //   this.businessDisable = true;
        // } else {
        //   this.permSameCheck = false;
        //   this.permantDisable = false;
        //   this.businessDisable = false;
        // }
        // this.getPresentaddressproof();
        if (this.PresentTick && this.PermanentTick && this.BusinessTick) {
          this.saveStatus.emit('addressTick');
          // this.globalData.setEditSaveStatus("addressSaved");
          // console.log(this.globalData.getEditSaveStatus()); this.events.publish("save", JSON.stringify(this.globalData.getEditSaveStatus()));
        }
      })
      .catch((Error) => {
        // console.log(Error);
      });
  }

  getLeadId() {
    this.sqliteProvider.getSourcingDetails(this.refId, this.id).then((data) => {
      console.log(data);
      if (data.length > 0) {
        this.leadId = data[0].leadId;
      }
    });
  }

  permanentAdrsSave(value) {
    this.loadingService.globalLodingPresent('Please wait...');
    // let saveStatus = localStorage.getItem('Personal');

    // if (saveStatus == "personalSaved") {
    let saveStatus = localStorage.getItem('Proof');
    if (saveStatus == 'proofSaved') {
      this.refId = this.globalData.getrefId();
      this.id = this.globalData.getId();
      this.sqliteProvider
        .insertPermanentAddress(
          this.refId,
          this.id,
          this.appSameCheck,
          value,
          this.userType,
          this.PERMID
        )
        .then((data) => {
          if (
            this.PERMID === '' ||
            this.PERMID === null ||
            this.PERMID === undefined
          ) {
            this.PERMID = data.insertId;
            this.loadingService.globalLodingDismiss();
            if (this.userType === 'A') {
              this.alertService.showAlert(
                'Alert!',
                'Applicant Permanent Address Details Added Successfully'
              );
              this.formActivater.disableForm = true;
              this.globFunc.setapplicationDataChangeDetector(
                'saved',
                this.pagename
              );
            } else {
              this.alertService.showAlert(
                'Alert!',
                'Co-Applicant Permanent Address Details Added Successfully'
              );
              this.formActivater.disableForm = true;
              this.globFunc.setapplicationDataChangeDetector(
                'saved',
                this.pagename
              );
            }
          } else {
            this.loadingService.globalLodingDismiss();
            if (this.userType === 'A') {
              this.alertService.showAlert(
                'Alert!',
                'Applicant Permanent Address Details Updated Successfully'
              );
              this.formActivater.disableForm = true;
              this.globFunc.setapplicationDataChangeDetector(
                'saved',
                this.pagename
              );
            } else {
              this.alertService.showAlert(
                'Alert!',
                'Co-Applicant Permanent Address Details Updated Successfully'
              );
              this.formActivater.disableForm = true;
              this.globFunc.setapplicationDataChangeDetector(
                'saved',
                this.pagename
              );
            }
          }
          // this.globalData.setEditSaveStatus("PermanentAddSaved");
          localStorage.setItem('Permanent', 'PermanentAddSaved');
          this.PermanentTick = true;
          if (this.PresentTick && this.PermanentTick && this.BusinessTick) {
            this.saveStatus.emit('addressTick');
            // this.globalData.setEditSaveStatus("addressSaved");
            // console.log(this.globalData.getEditSaveStatus()); this.events.publish("save", JSON.stringify(this.globalData.getEditSaveStatus()));
          }
        })
        .catch((Error) => {
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'Failed!');
        });
    } else {
      this.loadingService.globalLodingDismiss();
      if (this.userType == 'A') {
        this.alertService.showAlert('Alert!', 'Must Save Applicant Details!');
      } else {
        this.alertService.showAlert(
          'Alert!',
          'Must Save Co-Applicant Details!'
        );
      }
    }
  }

  getPermanentDetails() {
    this.sqliteProvider
      .getPermanentAddress(this.refId, this.id)
      .then((data) => {
        if (data.length > 0) {
          this.getPersmanentData = data;
          this.permanentAdrsData = this.formBuilder.group({
            perm_type: ['1', Validators.required],
            perm_permAdrsKYC: [
              this.getPersmanentData[0].perm_permAdrsKYC,
              Validators.required,
            ],
            perm_manualEntry: [this.getPersmanentData[0].perm_manualEntry],
            perm_plots: [
              this.globFunc.basicDec(this.getPersmanentData[0].perm_plots),
              Validators.compose([
                Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
                Validators.maxLength(40),
                Validators.minLength(3),
                Validators.required,
              ]),
            ],
            perm_locality: [
              this.globFunc.basicDec(this.getPersmanentData[0].perm_locality),
              Validators.compose([
                Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
                Validators.maxLength(40),
                Validators.minLength(3),
                Validators.required,
              ]),
            ],
            perm_line3: [
              this.globFunc.basicDec(this.getPersmanentData[0].perm_line3),
              Validators.compose([
                Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
                Validators.maxLength(40),
                Validators.minLength(3),
              ]),
            ],
            perm_states: [
              this.globFunc.basicDec(this.getPersmanentData[0].perm_states),
              Validators.required,
            ],
            perm_cities: [
              this.globFunc.basicDec(this.getPersmanentData[0].perm_cities),
              Validators.required,
            ],
            perm_district: [
              this.globFunc.basicDec(this.getPersmanentData[0].perm_district),
              Validators.required,
            ],
            perm_pincode: [
              this.globFunc.basicDec(this.getPersmanentData[0].perm_pincode),
              Validators.compose([
                Validators.pattern('[0-9]{6}'),
                Validators.required,
              ]),
            ],
            perm_countries: [
              this.getPersmanentData[0].perm_countries,
              Validators.required,
            ],
            perm_landmark: [
              this.getPersmanentData[0].perm_landmark,
              Validators.compose([
                Validators.maxLength(50),
                Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
                Validators.required,
              ]),
            ], // Validators.pattern('[a-zA-z0-9 ]*')
            //resType: [this.getPersmanentData[0].resType, Validators.required],
            perm_yrsCurCity: [
              this.getPersmanentData[0].perm_yrsCurCity,
              Validators.compose([
                Validators.maxLength(2),
                Validators.pattern('[0-9]*'),
                Validators.required,
              ]),
            ],
          });
          this.refId = this.getPersmanentData[0].refId;
          this.id = this.getPersmanentData[0].id;
          this.PERMID = this.getPersmanentData[0].PERMID;
          this.getCityValue('perState');
          if (data[0].appSameCheck == 'true') {
            this.appSameCheck = true;
            this.applicantDisable = true;
          } else {
            this.appSameCheck = false;
            this.applicantDisable = false;
          }
          this.getaddressproof('permanent');

          let leadId = localStorage.getItem('leadId');
          this.sqlSupport.getEKYCDetails(leadId).then((ekyc) => {
            if (ekyc.length > 0) {
              this.ekycDisable = true;
              this.addressoneDisable = true;
              this.addresstwoDisable = true;
              this.perStateDisable = true;
              this.perCityDisable = true;
            } else {
              if (!this.naveParamsValue.fieldDisable) {
                this.ekycDisable = false;
                this.addressoneDisable = false;
                this.addresstwoDisable = false;
                this.perStateDisable = false;
                this.perCityDisable = false;
              }
            }
          });
          // this.globalData.setEditSaveStatus("PermanentAddSaved");
          localStorage.setItem('Permanent', 'PermanentAddSaved');
          this.PermanentTick = true;
          // if (this.PresentTick && this.PermanentTick) {
          if (this.PresentTick && this.PermanentTick && this.BusinessTick) {
            this.saveStatus.emit('addressTick');
            // this.globalData.setEditSaveStatus("addressSaved");
            // console.log(this.globalData.getEditSaveStatus()); this.events.publish("save", JSON.stringify(this.globalData.getEditSaveStatus()));
          }
        } else {
          this.updateExCusData();
        }
      })
      .catch((Error) => {
        // console.log(Error);
      });
  }

  getCibilCheckedDetails() {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        if (data[0].cibilCheckStat == '1') {
          this.submitDisable = true;
          this.permantDisable = true;
          this.businessDisable = true;
          this.applicantDisable = true;
        } else {
          this.submitDisable = false;
          this.permantDisable = false;
          this.businessDisable = false;
          this.applicantDisable = false;
        }
      }
    });
  }

  getaddresslmsData() {
    this.sqliteProvider.getPassedLMSDetails(this.lmsLeadId).then((data) => {
      if (data.length > 0) {
        this.LMSDetails = data[0];
        this.presentAdrsData = this.formBuilder.group({
          resiStatus: ['', Validators.required],
          yrsCurResi: [
            '',
            Validators.compose([
              Validators.pattern('[0-9]*'),
              Validators.required,
            ]),
          ],
          yrsCurCity: [
            '',
            Validators.compose([
              Validators.pattern('[0-9]*'),
              Validators.required,
            ]),
          ],
          address1: [
            this.LMSDetails.Door_No,
            Validators.compose([
              Validators.maxLength(35),
              Validators.pattern('[a-zA-Z0-9.,/#& ]*'),
              Validators.required,
            ]),
          ],
          address2: [
            this.LMSDetails.Street_Name,
            Validators.compose([
              Validators.maxLength(35),
              Validators.pattern('[a-zA-Z0-9.,/#& ]*'),
              Validators.required,
            ]),
          ],
          cities: ['', Validators.required],
          states: ['', Validators.required],
          pincode: [
            this.LMSDetails.Pincode,
            Validators.compose([
              Validators.pattern('[0-9]{6}'),
              Validators.required,
            ]),
          ],
          countries: [''],
        });
      }
    });
  }

  dataPermchanged(e: any) {
    if (e.detail.checked === true) {
      this.sqliteProvider
        .getPermanentAddress(this.refId, this.id)
        .then((data) => {
          this.presentAdrsData = this.formBuilder.group({
            pres_type: ['2', Validators.required],
            pres_presmAdrsKYC: [data[0].perm_permAdrsKYC, Validators.required],
            pres_manualEntry: [data[0].perm_manualEntry],
            pres_plots: [
              this.globFunc.basicDec(data[0].perm_plots),
              Validators.compose([
                Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
                Validators.maxLength(40),
                Validators.minLength(3),
                Validators.required,
              ]),
            ],
            pres_locality: [
              this.globFunc.basicDec(data[0].perm_locality),
              Validators.compose([
                Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
                Validators.maxLength(40),
                Validators.minLength(3),
                Validators.required,
              ]),
            ],
            pres_line3: [
              this.globFunc.basicDec(data[0].perm_line3),
              Validators.compose([
                Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
                Validators.maxLength(40),
                Validators.minLength(3),
              ]),
            ],
            pres_states: [
              this.globFunc.basicDec(data[0].perm_states),
              Validators.required,
            ],
            pres_cities: [
              this.globFunc.basicDec(data[0].perm_cities),
              Validators.required,
            ],
            pres_district: [
              this.globFunc.basicDec(data[0].perm_district),
              Validators.required,
            ],
            pres_pincode: [
              this.globFunc.basicDec(data[0].perm_pincode),
              Validators.compose([
                Validators.pattern('[0-9]{6}'),
                Validators.required,
              ]),
            ],
            pres_countries: [data[0].perm_countries, Validators.required],
            pres_landmark: [
              data[0].perm_landmark,
              Validators.compose([
                Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
                Validators.required,
              ]),
            ], // Validators.pattern('[a-zA-z0-9 ]*')
            // pres_resType: [data[0].resType, Validators.compose([Validators.required])],
            pres_yrsCurCity: [
              data[0].perm_yrsCurCity,
              Validators.compose([
                Validators.maxLength(2),
                Validators.pattern('[0-9]*'),
                Validators.required,
              ]),
            ],
          });
          this.getCityValue('preState');
          this.permantDisable = true;
        });
      console.log(this.presentAdrsData, 'aaaaa');
    } else {
      this.presentAdrsData = this.formBuilder.group({
        pres_type: ['2', Validators.required],
        pres_presmAdrsKYC: ['', Validators.required],
        pres_manualEntry: [''],
        pres_plots: [
          '',
          Validators.compose([
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.maxLength(40),
            Validators.minLength(3),
            Validators.required,
          ]),
        ],
        pres_locality: [
          '',
          Validators.compose([
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.maxLength(40),
            Validators.minLength(3),
            Validators.required,
          ]),
        ],
        pres_line3: [
          '',
          Validators.compose([
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.maxLength(40),
            Validators.minLength(3),
          ]),
        ],
        pres_states: ['', Validators.required],
        pres_cities: ['', Validators.required],
        pres_district: ['', Validators.required],
        pres_pincode: [
          '',
          Validators.compose([
            Validators.pattern('[0-9]{6}'),
            Validators.required,
          ]),
        ],
        pres_countries: ['India', Validators.required],
        pres_landmark: [
          '',
          Validators.compose([
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.required,
          ]),
        ], // Validators.pattern('[a-zA-z0-9 ]*')
        //pres_resType: ["", Validators.compose([Validators.required])],
        pres_yrsCurCity: [
          '',
          Validators.compose([
            Validators.maxLength(2),
            Validators.pattern('[0-9]*'),
            Validators.required,
          ]),
        ],
      });
      this.permantDisable = false;
    }
  }

  dataAppchanged(e: any) {
    if (e.detail.checked === true) {
      this.sqlSupport.getPermanentAppDetails(this.refId).then((data) => {
        this.permanentAdrsData = this.formBuilder.group({
          perm_type: ['1', Validators.required],
          perm_permAdrsKYC: [data[0].perm_permAdrsKYC, Validators.required],
          perm_manualEntry: [data[0].perm_manualEntry],
          perm_plots: [
            this.globFunc.basicDec(data[0].perm_plots),
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          perm_locality: [
            this.globFunc.basicDec(data[0].perm_locality),
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
              Validators.required,
            ]),
          ],
          perm_line3: [
            this.globFunc.basicDec(data[0].perm_line3),
            Validators.compose([
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.maxLength(40),
              Validators.minLength(3),
            ]),
          ],
          perm_states: [
            this.globFunc.basicDec(data[0].perm_states),
            Validators.required,
          ],
          perm_cities: [
            this.globFunc.basicDec(data[0].perm_cities),
            Validators.required,
          ],
          perm_district: [
            this.globFunc.basicDec(data[0].perm_district),
            Validators.required,
          ],
          perm_pincode: [
            this.globFunc.basicDec(data[0].perm_pincode),
            Validators.compose([
              Validators.pattern('[0-9]{6}'),
              Validators.required,
            ]),
          ],
          perm_countries: [data[0].perm_countries, Validators.required],
          perm_landmark: [
            data[0].perm_landmark,
            Validators.compose([
              Validators.maxLength(50),
              Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
              Validators.required,
            ]),
          ], // Validators.pattern('[a-zA-z0-9 ]*')
          //resType: [data[0].resType, Validators.required],
          perm_yrsCurCity: [
            data[0].perm_yrsCurCity,
            Validators.compose([
              Validators.maxLength(2),
              Validators.pattern('[0-9]*'),
              Validators.required,
            ]),
          ],
        });
        this.applicantDisable = true;
      });
    } else {
      this.permanentAdrsData = this.formBuilder.group({
        perm_type: ['1', Validators.required],
        perm_permAdrsKYC: ['', Validators.required],
        perm_manualEntry: [''],
        perm_plots: [
          '',
          Validators.compose([
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.maxLength(40),
            Validators.minLength(3),
            Validators.required,
          ]),
        ],
        perm_locality: [
          '',
          Validators.compose([
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.maxLength(40),
            Validators.minLength(3),
            Validators.required,
          ]),
        ],
        perm_line3: [
          '',
          Validators.compose([
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.maxLength(40),
            Validators.minLength(3),
          ]),
        ],
        perm_states: ['', Validators.required],
        perm_cities: ['', Validators.required],
        perm_district: ['', Validators.required],
        perm_pincode: [
          '',
          Validators.compose([
            Validators.pattern('[0-9]{6}'),
            Validators.required,
          ]),
        ],
        perm_countries: ['India', Validators.required],
        perm_landmark: [
          '',
          Validators.compose([
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>#\/]*$/),
            Validators.required,
          ]),
        ], // Validators.pattern('[a-zA-z0-9 ]*')
        perm_yrsCurCity: [
          '',
          Validators.compose([
            Validators.maxLength(2),
            Validators.pattern('[0-9]*'),
            Validators.required,
          ]),
        ],
      });
      this.applicantDisable = false;
    }
  }

  updateExCusData() {
    if (this.custType == 'E') {
      let urn = this.globalData.getURN();
      this.sqliteProvider.selectExData(urn).then((data) => {
        this.presentAdrsData.controls.pres_plots.setValue(
          this.globFunc.basicDec(data[0].pre_Area)
        );
        this.presentAdrsData.controls.pres_locality.setValue(
          this.globFunc.basicDec(data[0].pre_Village)
        );
        this.presentAdrsData.controls.pres_cities.setValue(
          this.getExistCityValue(this.globFunc.basicDec(data[0].pre_City))
            ? this.getExistCityValue(this.globFunc.basicDec(data[0].pre_City))
                .cityCode
            : ''
        );
        this.presentAdrsData.controls.pres_states.setValue(
          this.getExistStateValue(this.globFunc.basicDec(data[0].pre_State))
            ? this.getExistStateValue(this.globFunc.basicDec(data[0].pre_State))
                .stateCode
            : ''
        );
        this.presentAdrsData.controls.pres_pincode.setValue(
          this.globFunc.basicDec(data[0].pre_pincode)
        );
        this.permanentAdrsData.controls.perm_plots.setValue(
          this.globFunc.basicDec(data[0].per_Doorno) +
            ' ' +
            this.globFunc.basicDec(data[0].per_StreetName) +
            ' ' +
            this.globFunc.basicDec(data[0].Per_Cross)
        );
        this.permanentAdrsData.controls.perm_locality.setValue(
          this.globFunc.basicDec(data[0].per_Area) ||
            '' + ' ' + this.globFunc.basicDec(data[0].per_Village)
        );
        this.permanentAdrsData.controls.perm_cities.setValue(
          this.getExistCityValue(this.globFunc.basicDec(data[0].per_City))
            ? this.getExistCityValue(this.globFunc.basicDec(data[0].per_City))
                .cityCode
            : ''
        );
        this.permanentAdrsData.controls.perm_states.setValue(
          this.getExistStateValue(this.globFunc.basicDec(data[0].per_State))
            ? this.getExistStateValue(this.globFunc.basicDec(data[0].per_State))
                .stateCode
            : ''
        );
        this.permanentAdrsData.controls.perm_pincode.setValue(
          this.globFunc.basicDec(data[0].per_pincode)
        );
        this.permanentAdrsData.controls.perm_landmark.setValue(
          data[0].per_landmark
        );
        this.getCityValue('perState');
        this.getCityValue('preState');
        // this.presentAdrsData.controls.address1.setValue(data[0].pre_Doorno + " " + data[0].pre_StreetName);
        // this.presentAdrsData.controls.address2.setValue(data[0].pre_Area + " " + data[0].pre_Village);
        // this.presentAdrsData.controls.cities.setValue(data[0].pre_City);
        // this.presentAdrsData.controls.states.setValue(data[0].pre_State);
        // this.presentAdrsData.controls.pincode.setValue(data[0].pre_pincode);
        // this.permanentAdrsData.controls.per_address1.setValue(data[0].per_Doorno + " " + data[0].per_StreetName);
        // this.permanentAdrsData.controls.per_address2.setValue(data[0].per_Area + " " + data[0].per_Village);
        // this.permanentAdrsData.controls.per_cities.setValue(data[0].per_City);
        // this.permanentAdrsData.controls.per_states.setValue(data[0].per_State);
        // this.permanentAdrsData.controls.per_pincode.setValue(data[0].per_pincode);
        // this.state = data[0].pre_State;
        // this.perstate = data[0].per_State;
      });
    }
  }

  karzaDataFetch(data) {
    if (data || this.naveParamsValue.licence) {
      this.karzaData.permAddressLine1 = this.karzaData.permAddressLine1
        .split(' ')
        .filter((val) => val)
        .join(' ');
      this.karzaData.permAddressLine2 = this.karzaData.permAddressLine2
        .split(' ')
        .filter((val) => val)
        .join(' ');
      if (this.karzaData.permAddressLine1.length > 40) {
        this.permanentAdrsData.controls.perm_permAdrsKYC.setValue('4');
        let combineAdd =
          this.karzaData.permAddressLine1 +
          ' ' +
          this.karzaData.permAddressLine2;
        let add1 = combineAdd.substring(0, 40);
        this.permanentAdrsData.controls.perm_plots.setValue(add1);
        this.addressoneDisable = true;
        let add2 = combineAdd.substring(40, 80);
        this.permanentAdrsData.controls.perm_locality.setValue(add2);
        this.addresstwoDisable = true;
        this.permanentAdrsData.controls.perm_pincode.setValue(
          this.karzaData.permPincode
        );
        if (combineAdd.substring(80).length) {
          let add3 = combineAdd.substring(80);
          this.permanentAdrsData.controls.perm_landmark.setValue(add3);
          this.landMarkDisable = true;
        }
        // let arrayAdd = combineAdd.split(" ")
        // let add1 = arrayAdd.slice(0, Math.ceil(arrayAdd.length / 2)).join(" ");
        // let add2 = arrayAdd.slice(Math.ceil(arrayAdd.length / 2)).join(" ");
      } else if (this.karzaData.permAddressLine2.length > 40) {
        this.permanentAdrsData.controls.perm_permAdrsKYC.setValue('4');
        let combineAdd =
          this.karzaData.permAddressLine1 +
          ' ' +
          this.karzaData.permAddressLine2;
        let add1 = combineAdd.substring(0, 40);
        this.permanentAdrsData.controls.perm_plots.setValue(add1);
        this.addressoneDisable = true;
        let add2 = combineAdd.substring(40, 80);
        this.permanentAdrsData.controls.perm_locality.setValue(add2);
        this.addresstwoDisable = true;
        this.permanentAdrsData.controls.perm_pincode.setValue(
          this.karzaData.permPincode
        );
        if (combineAdd.substring(80).length) {
          let add3 = combineAdd.substring(80);
          this.permanentAdrsData.controls.perm_landmark.setValue(add3);
          this.landMarkDisable = true;
        }
      } else {
        this.permanentAdrsData.controls.perm_permAdrsKYC.setValue('4');
        this.permanentAdrsData.controls.perm_plots.setValue(
          this.karzaData.permAddressLine1
        );
        this.permanentAdrsData.controls.perm_locality.setValue(
          this.karzaData.permAddressLine2
        );
        this.permanentAdrsData.controls.perm_pincode.setValue(
          this.karzaData.permPincode
        );
      }
    }
  }

  addressSplit(str) {
    if (str[0] == ' ') {
      str = str.trim();
    }
    let first = str.substring(0, 40).lastIndexOf(' ');
    let line1;
    if (first < 0) {
      line1 = str.substring(0);
    } else {
      line1 = str.substring(0, first);
    }
    return line1;
  }
  landMarkDisable = false;
  EkycDataFetch(sec) {
    if (sec || this.naveParamsValue.ekycData) {
      let EkycData;
      if (this.ekyc == 'OTP') {
        if (sec) {
          EkycData = this.getEkycData;
        } else {
          EkycData = this.getEkycData;
        }
      } else {
        EkycData = this.getEkycData.KycRes.UidData.Poa;
      }
      // let EkycData = this.getEkycData;
      this.permanentAdrsData.controls.perm_permAdrsKYC.setValue('1');
      let address1 =
        (EkycData.house ? EkycData.house : '') +
        (EkycData.street ? ', ' + EkycData.street : '');
      address1 = address1.replace(/[~!#$%^&*=|?+@]/g, '');
      address1 = address1.trim();
      let address2 =
        (EkycData.lm ? EkycData.lm + ', ' : '') +
        (EkycData.loc ? EkycData.loc + ', ' : '') +
        (EkycData.vtc ? EkycData.vtc : '');
      address2 = address2.replace(/[~!#$%^&*=|?+@]/g, '');
      // address2 = address2.replace(/[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>\/]/g, "");
      address2 = address2.trim();
      let address = address1 + ' ' + address2;
      let line1 = this.addressSplit(address);
      this.addressoneDisable = true;
      this.permanentAdrsData.controls.perm_plots.setValue(line1);
      let line2 = this.addressSplit(address.substring(line1.length + 1));
      if (line2.length < 3) {
        line2 = ' ' + line2 + ',';
      }
      this.permanentAdrsData.controls.perm_locality.setValue(line2);
      this.addresstwoDisable = true;
      if (address.substring(line1.length + line2.length + 1).length) {
        let line3 = this.addressSplit(
          address.substring(line1.length + line2.length + 1)
        );
        this.permanentAdrsData.controls.perm_line3.setValue(line3);
        // this.addresstwoDisable = true;
        // this.permanentAdrsData.controls.perm_locality.setValue(line2);
        // let line3 = this.addressSplit(line2) || '';
        if (address.substring(line1.length + line2.length + line3.length)) {
          console.log(line3, 'line3');
          let landmark = address.substring(
            line1.length + line2.length + line3.length
          );
          this.permanentAdrsData.controls.perm_landmark.setValue(landmark);
        } else {
          this.permanentAdrsData.controls.perm_landmark.setValue('');
        }
      } else {
        this.addresstwoDisable = true;
        // this.permanentAdrsData.controls.perm_line3.setValue(address.substring(line2.length + 1) || " ");
        this.permanentAdrsData.controls.perm_line3.setValue('');
      }

      let landMark;
      let pincode = EkycData.pc ? EkycData.pc : '';
      // if (address1) {
      //   this.addressoneDisable = true;
      //   this.permanentAdrsData.controls.perm_plots.setValue(address1);
      // } else {
      //   this.addressoneDisable = false;
      // }
      // if (address1.length >= 200 || address1.length < 3) {
      //   this.addressoneDisable = false;
      // }
      // if (address2) {
      //   this.addresstwoDisable = true;
      //   this.permanentAdrsData.controls.perm_locality.setValue(address2);
      // } else {
      //   this.addresstwoDisable = false;
      // }
      // if (address2.length >= 200 || address2.length < 3) {
      //   // this.addresstwoDisable = false;
      //   if (address2.length >= 200) {
      //     address2 = (EkycData.loc ? (EkycData.loc + ', ') : "") + (EkycData.vtc ? EkycData.vtc : "");
      //     address2 = address2.replace(/[~!#$%^&*=|?+@]/g, "");
      //     address2 = address2.trim();
      //     landMark = (EkycData.lm ? (EkycData.lm + ', ') : "");
      //     landMark = landMark.replace(/[~!#$%^&*=|?+@]/g, "");
      //     landMark = landMark.trim();
      //     this.permanentAdrsData.controls.perm_locality.setValue(address2);
      //     this.addresstwoDisable = true;
      //     this.permanentAdrsData.controls.perm_landmark.setValue(landMark);
      //     if (this.permanentAdrsData.controls.perm_landmark.value) {
      //       // this.landMarkDisable = true;
      //     }
      //   }
      // }

      this.permanentAdrsData.controls.perm_pincode.setValue(pincode);
      this.ekycDisable = true;

      let _state = EkycData.state.toUpperCase();
      let _city = EkycData.dist.toUpperCase();

      this.sqliteProvider.getAllCityValues().then((getData) => {
        if (getData) {
          this.getAllStateMaster = getData;

          let getState = this.getAllStateMaster.find(
            (data) =>
              data.stateName.toUpperCase() === _state &&
              data.cityName.toUpperCase() === _city
          );
          let getStateSix = this.getAllStateMaster.find(
            (data) =>
              data.stateName.toUpperCase().substring(0, 6) ===
                _state.substring(0, 6) &&
              data.cityName.toUpperCase().substring(0, 6) ===
                _city.substring(0, 6)
          );
          let getStateFive = this.getAllStateMaster.find(
            (data) =>
              data.stateName.toUpperCase().substring(0, 5) ===
                _state.substring(0, 5) &&
              data.cityName.toUpperCase().substring(0, 5) ===
                _city.substring(0, 5)
          );
          let getStateFour = this.getAllStateMaster.find(
            (data) =>
              data.stateName.toUpperCase().substring(0, 4) ===
                _state.substring(0, 4) &&
              data.cityName.toUpperCase().substring(0, 4) ===
                _city.substring(0, 4)
          );
          let getStateThree = this.getAllStateMaster.find(
            (data) =>
              data.stateName.toUpperCase().substring(0, 3) ===
                _state.substring(0, 3) &&
              data.cityName.toUpperCase().substring(0, 3) ===
                _city.substring(0, 3)
          );

          console.log('getState', getState);
          console.log('getStateSix', getStateSix);
          console.log('getStateFive', getStateFive);
          console.log('getStateFour', getStateFour);
          console.log('getStateThree', getStateThree);
          if (getState) {
            this.permanentAdrsData.controls.perm_states.setValue(
              getState.stateCode
            );
            this.permanentAdrsData.controls.perm_cities.setValue(
              getState.cityCode
            );
            this.permanentAdrsData.controls.perm_district.setValue(
              getState.cityCode
            );
            this.perStateDisable = true;
            this.perCityDisable = true;
          } else if (getStateSix) {
            this.permanentAdrsData.controls.perm_states.setValue(
              getStateSix.stateCode
            );
            this.permanentAdrsData.controls.perm_cities.setValue(
              getStateSix.cityCode
            );
            this.permanentAdrsData.controls.perm_district.setValue(
              getStateSix.cityCode
            );
            this.perStateDisable = true;
            this.perCityDisable = true;
          } else if (getStateFive) {
            this.permanentAdrsData.controls.perm_states.setValue(
              getStateFive.stateCode
            );
            this.permanentAdrsData.controls.perm_cities.setValue(
              getStateFive.cityCode
            );
            this.permanentAdrsData.controls.perm_district.setValue(
              getStateFive.cityCode
            );
            this.perStateDisable = true;
            this.perCityDisable = true;
          } else if (getStateFour) {
            this.permanentAdrsData.controls.perm_states.setValue(
              getStateFour.stateCode
            );
            this.permanentAdrsData.controls.perm_cities.setValue(
              getStateFour.cityCode
            );
            this.permanentAdrsData.controls.perm_district.setValue(
              getStateFour.cityCode
            );
            this.perStateDisable = true;
            this.perCityDisable = true;
          } else if (getStateThree) {
            this.permanentAdrsData.controls.perm_states.setValue(
              getStateThree.stateCode
            );
            this.permanentAdrsData.controls.perm_cities.setValue(
              getStateThree.cityCode
            );
            this.permanentAdrsData.controls.perm_district.setValue(
              getStateThree.cityCode
            );
            this.perStateDisable = true;
            this.perCityDisable = true;
          } else {
            this.permanentAdrsData.controls.perm_states.setValue('');
            this.permanentAdrsData.controls.perm_cities.setValue('');
            this.permanentAdrsData.controls.perm_district.setValue('');
            this.perStateDisable = false;
            this.perCityDisable = false;
          }
        }
      });
    } else {
      this.sqliteProvider
        .getPermanentAddress(this.refId, this.id)
        .then((data) => {
          if (data.length == 0) {
            let leadId = localStorage.getItem('leadId');
            this.sqlSupport.getEKYCDetails(leadId).then((ekyc) => {
              if (ekyc.length > 0) {
                let EkycData = JSON.parse(ekyc[0].Ekycaddress);
                this.permanentAdrsData.controls.perm_permAdrsKYC.setValue('1');
                let address1 =
                  (EkycData.house ? EkycData.house : '') +
                  (EkycData.street ? ', ' + EkycData.street : '');
                let address2 =
                  (EkycData.lm ? EkycData.lm + ', ' : '') +
                  (EkycData.loc ? EkycData.loc + ', ' : '') +
                  (EkycData.vtc ? EkycData.vtc : '');
                let pincode = EkycData.pc ? EkycData.pc : '';
                let landMark;
                let address = address1 + ' ' + address2;
                let line1 = this.addressSplit(address);
                this.addressoneDisable = true;
                this.permanentAdrsData.controls.perm_plots.setValue(line1);
                let line2 = this.addressSplit(
                  address.substring(line1.length + 1)
                );
                if (line2.length < 3) {
                  line2 = ' ' + line2 + ', ';
                }
                this.permanentAdrsData.controls.perm_locality.setValue(line2);
                this.addresstwoDisable = true;
                if (address.substring(line1.length + line2.length + 1).length) {
                  let line3 = this.addressSplit(
                    address.substring(line1.length + line2.length + 1)
                  );
                  this.permanentAdrsData.controls.perm_line3.setValue(line3);
                  // this.addresstwoDisable = true;
                  // this.permanentAdrsData.controls.perm_locality.setValue(line2);
                  // let line3 = this.addressSplit(line2) || '';
                  if (
                    address.substring(
                      line1.length + line2.length + line3.length
                    )
                  ) {
                    console.log(line3, 'line3');
                    let landmark = address.substring(
                      line1.length + line2.length + line3.length
                    );
                    this.permanentAdrsData.controls.perm_landmark.setValue(
                      landmark
                    );
                  } else {
                    this.permanentAdrsData.controls.perm_landmark.setValue('');
                  }
                } else {
                  this.addresstwoDisable = true;
                  // this.permanentAdrsData.controls.perm_line3.setValue(address.substring(line2.length + 1) || " ");
                  this.permanentAdrsData.controls.perm_line3.setValue('');
                }
                // if (address1) {
                //   this.addressoneDisable = true;
                //   this.permanentAdrsData.controls.perm_plots.setValue(address1);
                // } else {
                //   this.addressoneDisable = false;
                // }
                // if (address1.length >= 40) {
                //   this.addressoneDisable = false;
                // }
                // if (address2) {
                //   this.addresstwoDisable = true;
                //   this.permanentAdrsData.controls.perm_locality.setValue(address2);
                // } else {
                //   this.addresstwoDisable = false;
                // }
                // if (address2.length >= 40) {
                //   this.addresstwoDisable = false;
                //   if (address2.length >= 40) {
                //     address2 = (EkycData.loc ? (EkycData.loc + ', ') : "") + (EkycData.vtc ? EkycData.vtc : "");
                //     // address2 = address2.replace(/[~!#$%^&*=|?+@]/g, "");
                //     // address2 = address2.trim();
                //     landMark = (EkycData.lm ? (EkycData.lm + ', ') : "");
                //     // landMark = landMark.replace(/[~!#$%^&*=|?+@]/g, "");
                //     // landMark = landMark.trim();
                //     this.permanentAdrsData.controls.perm_landmark.setValue(landMark);
                //     if (this.permanentAdrsData.controls.perm_landmark.value) {
                //       // this.landMarkDisable = true;
                //     }
                //   }
                // }

                this.permanentAdrsData.controls.perm_pincode.setValue(pincode);
                this.ekycDisable = true;

                let _state = EkycData.state.toUpperCase();
                let _city = EkycData.dist.toUpperCase();

                this.sqliteProvider.getAllCityValues().then((getData) => {
                  if (getData) {
                    this.getAllStateMaster = getData;

                    let getState = this.getAllStateMaster.find(
                      (data) =>
                        data.stateName.toUpperCase() === _state &&
                        data.cityName.toUpperCase() === _city
                    );
                    let getStateSix = this.getAllStateMaster.find(
                      (data) =>
                        data.stateName.toUpperCase().substring(0, 6) ===
                          _state.substring(0, 6) &&
                        data.cityName.toUpperCase().substring(0, 6) ===
                          _city.substring(0, 6)
                    );
                    let getStateFive = this.getAllStateMaster.find(
                      (data) =>
                        data.stateName.toUpperCase().substring(0, 5) ===
                          _state.substring(0, 5) &&
                        data.cityName.toUpperCase().substring(0, 5) ===
                          _city.substring(0, 5)
                    );
                    let getStateFour = this.getAllStateMaster.find(
                      (data) =>
                        data.stateName.toUpperCase().substring(0, 4) ===
                          _state.substring(0, 4) &&
                        data.cityName.toUpperCase().substring(0, 4) ===
                          _city.substring(0, 4)
                    );
                    let getStateThree = this.getAllStateMaster.find(
                      (data) =>
                        data.stateName.toUpperCase().substring(0, 3) ===
                          _state.substring(0, 3) &&
                        data.cityName.toUpperCase().substring(0, 3) ===
                          _city.substring(0, 3)
                    );

                    console.log('getState', getState);
                    console.log('getStateSix', getStateSix);
                    console.log('getStateFive', getStateFive);
                    console.log('getStateFour', getStateFour);
                    console.log('getStateThree', getStateThree);
                    if (getState) {
                      this.permanentAdrsData.controls.perm_states.setValue(
                        getState.stateCode
                      );
                      this.permanentAdrsData.controls.perm_cities.setValue(
                        getState.cityCode
                      );
                      this.permanentAdrsData.controls.perm_district.setValue(
                        getState.cityCode
                      );
                      this.perStateDisable = true;
                      this.perCityDisable = true;
                    } else if (getStateSix) {
                      this.permanentAdrsData.controls.perm_states.setValue(
                        getStateSix.stateCode
                      );
                      this.permanentAdrsData.controls.perm_cities.setValue(
                        getStateSix.cityCode
                      );
                      this.permanentAdrsData.controls.perm_district.setValue(
                        getStateSix.cityCode
                      );
                      this.perStateDisable = true;
                      this.perCityDisable = true;
                    } else if (getStateFive) {
                      this.permanentAdrsData.controls.perm_states.setValue(
                        getStateFive.stateCode
                      );
                      this.permanentAdrsData.controls.perm_cities.setValue(
                        getStateFive.cityCode
                      );
                      this.permanentAdrsData.controls.perm_district.setValue(
                        getStateFive.cityCode
                      );
                      this.perStateDisable = true;
                      this.perCityDisable = true;
                    } else if (getStateFour) {
                      this.permanentAdrsData.controls.perm_states.setValue(
                        getStateFour.stateCode
                      );
                      this.permanentAdrsData.controls.perm_cities.setValue(
                        getStateFour.cityCode
                      );
                      this.permanentAdrsData.controls.perm_district.setValue(
                        getStateFour.cityCode
                      );
                      this.perStateDisable = true;
                      this.perCityDisable = true;
                    } else if (getStateThree) {
                      this.permanentAdrsData.controls.perm_states.setValue(
                        getStateThree.stateCode
                      );
                      this.permanentAdrsData.controls.perm_cities.setValue(
                        getStateThree.cityCode
                      );
                      this.permanentAdrsData.controls.perm_district.setValue(
                        getStateThree.cityCode
                      );
                      this.perStateDisable = true;
                      this.perCityDisable = true;
                    } else {
                      this.permanentAdrsData.controls.perm_states.setValue('');
                      this.permanentAdrsData.controls.perm_cities.setValue('');
                      this.permanentAdrsData.controls.perm_district.setValue(
                        ''
                      );
                      this.perStateDisable = false;
                      this.perCityDisable = false;
                    }
                  }
                });
              }
            });
          }
        });
    }
  }

  karzaAdrsDataFetch() {
    let leadId = localStorage.getItem('leadId');
    this.sqliteProvider.getKarzaData(leadId, 'licence').then((data) => {
      if (data.length > 0) {
        if (data[0].idType == 'licence') {
          this.permanentAdrsData.controls.perm_plots.setValue(
            this.globFunc.basicDec(data[0].address1)
          );
          this.permanentAdrsData.controls.perm_locality.setValue(
            this.globFunc.basicDec(data[0].address2)
          );
          this.permanentAdrsData.controls.perm_pincode.setValue(
            this.globFunc.basicDec(data[0].pincode)
          );
        }
      }
    });
  }

  getStateValue() {
    this.sqliteProvider.getStateList().then((data) => {
      this.master_states = data;
    });
  }

  // getresType() {
  //   this.sqliteProvider.getMasterDataUsingType('resType').then(data => {
  //     this.residenceType = data;
  //   })
  // }

  yrsCurCity: any;
  getyrsCurCity() {
    this.sqliteProvider
      .getMasterDataUsingType('Noofyearsresidence')
      .then((data) => {
        this.yrsCurCity = data;
      });
  }

  getCityValue(state) {
    switch (state) {
      case 'perState':
        let per = this.permanentAdrsData.controls.perm_states.value;
        this.sqliteProvider.getSelectedCity(per).then((data) => {
          this.permanentCity = data;
        });
        break;
      case 'preState':
        let statecodePresent = this.presentAdrsData.controls.pres_states.value;
        this.sqliteProvider.getSelectedCity(statecodePresent).then((data) => {
          this.presentCity = data;
        });
        break;
      case 'busState':
        let bus = this.businessAdrsData.controls.busi_states.value;
        this.sqliteProvider.getSelectedCity(bus).then((data) => {
          this.businessCity = data;
        });
        break;
      default:
        this.sqliteProvider.getAllCityValues().then((data) => {
          this.permanentCity = data;
          this.presentCity = data;
          this.businessCity = data;
        });
    }
  }

  getaddressproof(value) {
    if (value == 'present') {
      if (this.presentAdrsData.controls.pres_presmAdrsKYC.value == '5') {
        this.presentAdrsData.controls.pres_manualEntry.setValidators(
          Validators.required
        );
        this.presentAdrsData.controls.pres_manualEntry.updateValueAndValidity();
      } else {
        this.presentAdrsData.controls.pres_manualEntry.clearValidators();
        this.presentAdrsData.controls.pres_manualEntry.updateValueAndValidity();
      }
    } else {
      if (this.permanentAdrsData.controls.perm_permAdrsKYC.value == '5') {
        this.permanentAdrsData.controls.perm_manualEntry.setValidators(
          Validators.required
        );
      } else {
        this.permanentAdrsData.controls.perm_manualEntry.clearValidators();
        this.permanentAdrsData.controls.perm_manualEntry.updateValueAndValidity();
      }
    }
  }

  pincodeValidation(value) {
    if (value == 'perm') {
      if (this.permanentAdrsData.controls.perm_pincode.value.length == 6) {
        let str = this.permanentAdrsData.controls.perm_pincode.value;
        str = str.split('');
        if (
          str[0] == str[1] &&
          str[0] == str[2] &&
          str[0] == str[3] &&
          str[0] == str[4] &&
          str[0] == str[5]
        ) {
          this.permanentAdrsData.controls.perm_pincode.setValue('');
          this.alertService.showAlert('Alert!', 'Given pincode is not valid!');
        }
      }
    } else if (value == 'pres') {
      if (this.presentAdrsData.controls.pres_pincode.value.length == 6) {
        let str = this.presentAdrsData.controls.pres_pincode.value;
        str = str.split('');
        if (
          str[0] == str[1] &&
          str[0] == str[2] &&
          str[0] == str[3] &&
          str[0] == str[4] &&
          str[0] == str[5]
        ) {
          this.presentAdrsData.controls.pres_pincode.setValue('');
          this.alertService.showAlert('Alert!', 'Given pincode is not valid!');
        }
      }
    }
  }

  getExistStateValue(value: string) {
    let stateName = this.master_states.find((f) => {
      return f.stateName === value;
    });
    return stateName;
  }
  getExistCityValue(value: string) {
    let cityName = this.presentCity.find((f) => {
      return f.cityName === value;
    });
    return cityName;
  }

  getAddressType() {
    this.sqliteProvider.getMasterDataUsingType('AddressType').then((data) => {
      this.adrType = data;
      // this.permanentAdrsData.controls.perm_type.setValue('1');
      // this.presentAdrsData.controls.pres_type.setValue('2');
      // this.businessAdrsData.controls.busi_type.setValue('5');
    });
  }
  getAddressAsPerKyc() {
    this.sqliteProvider
      .getMasterDataUsingType('AddressAsPerKyc')
      .then((data) => {
        this.permAdrsList = data;
        console.log('AddressAsPerKyc', data);
      });
  }
  getOtherDocuments() {
    this.sqliteProvider
      .getMasterDataUsingType('OtherDocuments')
      .then((data) => {
        this.notPermAdrsList = data;
        console.log('OtherDocuments', data);
      });
  }

  ngOnDestroy() {
    if (this.secKycSub) {
      this.secKycSub.unsubscribe();
    }
  }
}
