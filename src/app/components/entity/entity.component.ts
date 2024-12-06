import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  AlertController,
  ModalController,
  NavController,
  NavParams,
} from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss'],
})
export class EntityComponent {
  ind_master: any = [];
  nat_master: any = [];
  cons_master: any = [];
  lmsLeadId: any;
  consdisable: boolean = false;
  LMSDetails: any;
  maxdate: any;
  mindate: any;
  todayDate: any = new Date();
  userType: any;
  applicantUniqueId: any;
  applType: any;
  custType: any;
  leadStatus: any;
  entityData: FormGroup;
  refId: any;
  id: any;
  entId: any;
  profPic: any;
  entiProfPic: any;
  dateOfInc: any;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  cibilCheckStat: any;
  submitStat: any;
  applicationNumber: any;
  applicationStatus: any;
  submitDisable: boolean = false;
  _corpExp: number = 1;
  _corpExpMonths: number;
  months: any = [
    { month: 0, value: 0 },
    { month: 1, value: 1 },
    { month: 2, value: 2 },
    { month: 3, value: 3 },
    { month: 4, value: 4 },
    { month: 5, value: 5 },
    { month: 6, value: 6 },
    { month: 7, value: 7 },
    { month: 8, value: 8 },
    { month: 9, value: 9 },
    { month: 10, value: 10 },
    { month: 11, value: 11 },
  ];

  curAccounts = [
    { code: 'Y', name: 'YES' },
    { code: 'N', name: 'NO' },
  ];

  getEntityData: any;

  @Output() saveStatus = new EventEmitter();

  selectOptions = {
    cssClass: 'remove-ok',
  };
  dummy_master: any = [
    { code: '1', Name: 'Rented' },
    { code: '2', Name: 'Leased' },
    { code: '3', Name: 'Owned' },
  ];
  leadId: any;
  idType: any;
  cinMand: boolean = false;
  naveParamsValue: any;

  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public alertCtrl: AlertController,
    public globalData: DataPassingProviderService,
    public globFunc: GlobalService,
    public activateRoute: ActivatedRoute,
    public network: Network,
    public sqlSupport: SquliteSupportProviderService,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService
  ) {
    this.activateRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
    });
    this.calldate();
    this.getCibilCheckedDetails();
    this.getIndustryValue();
    this.getEnterValue();
    this.getConstitutionValue();
    this.userType = this.globalData.getborrowerType();
    this.leadId = this.naveParamsValue.leadId;
    if (this.naveParamsValue.nonIndividual) {
      this.idType = this.naveParamsValue.nonIndividual;
    }
    if (this.userType === 'G') {
      localStorage.setItem('entity', 'entitySaved');
      localStorage.setItem('entity', 'entityTick');
    }

    this.profPic = this.globalData.getProfileImage();
    this.entiProfPic = this.globalData.getEntiProfileImage();

    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();

    if (this.refId === '' || this.refId === undefined || this.refId === null) {
      this.refId = '';
      // alert("save entity data");
    } else {
      this.getEntityDetails();
    }

    this.entityData = this.formBuilder.group({
      enterName: [
        '',
        Validators.compose([
          Validators.maxLength(40),
          Validators.pattern('^[a-zA-Z0-9 ]*'),
          Validators.required,
        ]),
      ],
      constitution: ['', Validators.required],
      cin: [
        '',
        Validators.compose([
          Validators.maxLength(20),
          Validators.pattern('^[a-zA-Z0-9]*'),
          Validators.required,
        ]),
      ],
      regNo: [
        '',
        Validators.compose([
          Validators.maxLength(20),
          Validators.pattern('^[a-zA-Z0-9]*'),
          Validators.required,
        ]),
      ],
      gst: [
        '',
        Validators.compose([
          Validators.maxLength(20),
          Validators.pattern('^[a-zA-Z0-9]*'),
          Validators.required,
        ]),
      ],
      doi: ['', Validators.required],
      busiVintage: ['', Validators.required],
      ownership: ['', Validators.required],
      industry: ['', Validators.required],
      enterprise: ['', Validators.required],
    });
    this.karzaDataFetch();
    if (this.naveParamsValue.fieldDisable) {
      this.submitDisable = true;
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

  entitysave(value) {
    this.loadingService.globalLodingPresent('Please wait...');
    this.profPic = this.globalData.getProfileImage();
    this.entiProfPic = this.globalData.getEntiProfileImage();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    let saveStatus = localStorage.getItem('Sourcing');
    if (this.network.type == 'none') {
      this.leadStatus = 'offline';
    } else {
      this.leadStatus = 'online';
    }
    if (saveStatus == 'sourcingSaved') {
      if (this.entiProfPic) {
        this.applicantUniqueId =
          Math.floor(Math.random() * 900000000000) + 100000000000;
        this.applType = 'a';
        this.custType = this.globalData.getCustType();
        this.sqliteProvider
          .addEntityDetails(
            this.refId,
            this.id,
            value,
            this.profPic,
            this.entiProfPic,
            this.applicantUniqueId,
            this.applType,
            this.custType,
            this.leadStatus,
            this.entId
          )
          .then((data) => {
            if (
              this.entId === '' ||
              this.entId === null ||
              this.entId === undefined
            ) {
              this.entId = data.insertId;
              this.sqliteProvider.updatePassedLMSData('1', this.lmsLeadId);
            }
            this.saveStatus.emit('entityTick');
            localStorage.setItem('entity', 'entitySaved');
          })
          .catch((Error) => {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert!', 'Failed!');
          });
      } else {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert(
          'Alert!',
          'Must Capture the Entity Profile Image!'
        );
      }
    } else {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Must Save Loan Facilities!');
    }
  }

  getEntityDetails() {
    this.sqliteProvider
      .getEntityDetails(this.refId, this.id)
      .then((data) => {
        this.getEntityData = data;
        this.entityData = this.formBuilder.group({
          enterName: [
            this.getEntityData[0].enterName,
            Validators.compose([
              Validators.maxLength(40),
              Validators.pattern('^[a-zA-Z0-9 ]*'),
              Validators.required,
            ]),
          ],
          constitution: [
            this.getEntityData[0].constitution,
            Validators.required,
          ],
          cin: [
            this.getEntityData[0].cin,
            Validators.compose([
              Validators.maxLength(20),
              Validators.pattern('^[a-zA-Z0-9]*'),
              Validators.required,
            ]),
          ],
          regNo: [
            this.getEntityData[0].regNo,
            Validators.compose([
              Validators.maxLength(20),
              Validators.pattern('^[a-zA-Z0-9]*'),
              Validators.required,
            ]),
          ],
          gst: [
            this.getEntityData[0].gst,
            Validators.compose([
              Validators.maxLength(20),
              Validators.pattern('^[a-zA-Z0-9]*'),
              Validators.required,
            ]),
          ],
          doi: [this.getEntityData[0].doi, Validators.required],
          busiVintage: [this.getEntityData[0].busiVintage, Validators.required],
          ownership: [this.getEntityData[0].ownership, Validators.required],
          industry: [this.getEntityData[0].industry, Validators.required],
          enterprise: [this.getEntityData[0].enterprise, Validators.required],
        });
        this.refId = this.getEntityData[0].refId;
        this.id = this.getEntityData[0].id;
        this.entId = this.getEntityData[0].entId;
        this.profPic = this.globalData.setProfileImage(
          this.getEntityData[0].profPic
        );
        this.entiProfPic = this.globalData.setEntiProfileImage(
          this.getEntityData[0].entiProfPic
        );
        this.constitutionChng(this.getEntityData[0].constitution);
        this.saveStatus.emit('entityTick');
        localStorage.setItem('entity', 'entitySaved');
        this.loadingService.globalLodingDismiss();
      })
      .catch((Error) => {
        console.log(Error);
      });
  }

  today(): string {
    let today: string = this.globalData.getToday();
    return today;
  }

  getCibilCheckedDetails() {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      // console.log("get basic: " + JSON.stringify(data));
      if (data.length > 0) {
        if (data[0].cibilCheckStat == '1') {
          this.submitDisable = true;
        } else {
          this.submitDisable = false;
        }
      }
    });
  }

  corpExperianceMonth() {
    let getExpYear = parseInt(this.entityData.controls.yrsCurBusiAddr.value);
    let getExpMonth = this.entityData.controls.monCurBusiAddr.value[0];

    if (getExpYear == this._corpExp && getExpMonth > this._corpExpMonths) {
      this.entityData.controls.monCurBusiAddr.setErrors({
        inCorrect: true,
        errMsg: `Enter Month Value between 0 - ${this._corpExpMonths}`,
      });
    } else if (getExpYear == 0 && getExpMonth == 0) {
      this.entityData.controls.monCurBusiAddr.setErrors({
        inCorrect: true,
        errMsg: `Enter Month Value between 1 - ${this._corpExpMonths}`,
      });
    } else {
      if ((getExpYear == 0 || getExpYear > 0) && getExpMonth) {
        this.entityData.controls.monCurBusiAddr.errors.inCorrect = false;
      }
    }
  }

  calldate() {
    let dd = this.todayDate.getDate();
    let mm = this.todayDate.getMonth() + 1; //January is 0!
    let yyyy = this.todayDate.getFullYear() - 3;
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    let mindate = yyyy + '-' + mm + '-' + dd;
    this.mindate = mindate;
  }

  getIndustryValue() {
    this.sqliteProvider.getMasterDataUsingType('IndustryType').then((data) => {
      this.ind_master = data;
    });
  }

  getEnterValue(event?) {
    this.sqliteProvider
      .getMasterDataUsingType('NatureofBussiness')
      .then((data) => {
        this.nat_master = data;
      });
  }

  getConstitutionValue() {
    this.sqliteProvider.getMasterDataUsingType('Constitution').then((data) => {
      this.cons_master = data;
    });
  }

  karzaDataFetch() {
    if (this.naveParamsValue.nonIndividual) {
      this.entityData.controls.gst.setValue(this.idType.gst);
    }
  }

  toUpperCase(frmGrpName, ctrlName) {
    this[frmGrpName].controls[ctrlName].setValue(
      this[frmGrpName].controls[ctrlName].value.toUpperCase()
    );
  }

  constitutionChng(value) {
    if (value == '4' || value == '5' || value == '8') {
      this.cinMand = true;
      this.entityData.controls.cin.clearValidators();
      this.entityData.controls.cin.setValidators(
        Validators.compose([
          Validators.maxLength(30),
          Validators.minLength(10),
          Validators.pattern('^[a-zA-Z0-9]*'),
          Validators.required,
        ])
      );
      this.entityData.controls.cin.updateValueAndValidity();
    } else {
      this.cinMand = false;
      this.entityData.controls.cin.clearValidators();
      this.entityData.controls.cin.setValidators(
        Validators.compose([
          Validators.maxLength(30),
          Validators.minLength(10),
          Validators.pattern('^[a-zA-Z0-9]*'),
        ])
      );
      this.entityData.controls.cin.updateValueAndValidity();
    }
  }
}
