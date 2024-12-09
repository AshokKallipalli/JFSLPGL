import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-sourcing',
  templateUrl: './sourcing.component.html',
  styleUrls: ['./sourcing.component.scss'],
})
export class SourcingComponent implements OnInit {
  sourcingData: FormGroup;
  createdUser: any;
  deviceId: any;
  createdDate: any;
  userType: any;
  productType: any;
  profPic: any;
  refId: any;
  id: any;
  sourceid: any;
  busiDescMaster: any = [];
  sourcingChannels: any = [];
  branch_master: any = [];
  state_master: any = [];
  dummy_master: any = [
    { code: '1', Name: 'Dummy 1' },
    { code: '2', Name: 'Dummy 2' },
    { code: '3', Name: 'Dummy 3' },
    { code: '4', Name: 'Dummy 4' },
  ];
  selectOptions = {
    cssClass: 'remove-ok',
  };
  @Output() saveStatus = new EventEmitter();
  @Output() clearvalue = new EventEmitter();
  yesOrNo: any = [
    { code: '1', name: 'YES' },
    { code: '2', name: 'NO' },
  ];
  sourcing = [
    { CODE: '1', NAME: '8855JFS' },
    { CODE: '2', NAME: 'SELF ORIGINATION' },
  ];
  applicantType = [
    { CODE: 'New', NAME: 'New Customer' },
    { CODE: 'Existing', NAME: 'Existing Customer' },
    { CODE: 'jana', NAME: 'Jana Employee' },
  ];
  janaEmpl: any = [
    { code: '1', name: 'YES' },
    { code: '2', name: 'NO' },
  ];
  typeCase: any;
  dateValue: any;
  leadId: any;
  submitDisable: boolean = false;
  formActivater = { disableForm: true };
  pagename = 'Sourcing Details';
  emp: any;
  custType: any;
  naveParamsValue: any;
  isReadOnly: boolean = true;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public device: Device,
    // public viewCtrl: ViewController,
    public loadCtrl: LoadingController,
    public activateRoute: ActivatedRoute,
    // public geolocation: Geolocation,
    public network: Network,
    private globFunc: GlobalService,
    public sqlSupport: SquliteSupportProviderService,
    public alertService: CustomAlertControlService
  ) {
    this.activateRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.createdUser = this.globFunc.basicDec(localStorage.getItem('username'));
    this.deviceId = this.device.uuid;
    this.createdDate = new Date();
    this.dateValue = new Date();
    this.leadId = this.naveParamsValue.leadId;
    this.userType = this.globalData.getborrowerType();
    this.custType = this.globalData.getCustType();
    this.productType = localStorage.getItem('loan');
    this.profPic = this.globalData.getProfileImage();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();

    this.getBusinessDescription();
    this.getSourcingChannel();
    this.getTypeofCase();
    this.getBranchList();
    this.getStateList();
    this.getCibilCheckedDetails();

    this.sourcingData = this.formBuilder.group({
      janaEmployee: ['', Validators.required],
      applicType: ['', Validators.required],
      busiDesc: [''],
      sourChannel: ['', Validators.required],
      sourIdName: [''],
      sourIdName1: [''],
      leadId: ['', Validators.required],
      typeCase: ['', Validators.required],
      balTrans: ['', Validators.required],
      branchName: ['', Validators.required],
      branchState: ['', Validators.required],
      loginBranch: ['', Validators.required],
      applDate: ['', Validators.required],
      roName: ['', Validators.required],
      roCode: ['', Validators.required],
    });

    if (!this.refId) {
      this.getdefaultData();
    } else {
      this.getSourcingData();
    }

    if (this.naveParamsValue.fieldDisable) {
      this.submitDisable = true;
    }

    // this.sourcingData.valueChanges.subscribe(() => {
    //   // console.log(this.QDEIndividualDemoGraphic);
    //   if (this.sourcingData.pristine == false) {
    //     if (this.sourcingData.status === "INVALID") {
    //       this.formActivater.disableForm = true;
    //       this.globFunc.setapplicationDataChangeDetector('modified', this.pagename);
    //     } else {
    //       this.formActivater.disableForm = false;
    //       this.globFunc.setapplicationDataChangeDetector('modified', this.pagename);
    //     }
    //   }
    // })
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

  sourcingSave(value) {
    this.globalData.globalLodingPresent('Please wait...');
    let saveStatus = localStorage.getItem('Basic');
    // this.globalData.getEditSaveStatus().forEach(element => {
    //   if (element == "basicSaved") {
    //     saveStatus = "basicSaved";
    //   }
    // });
    if (saveStatus == 'basicSaved') {
      this.refId = this.globalData.getrefId();
      this.id = this.globalData.getId();
      this.profPic = this.globalData.getProfileImage();
      this.userType = this.globalData.getborrowerType();
      console.log(
        'this.userType -------------> sour ----------- ' + this.userType
      );
      this.sqliteProvider
        .addSourcingDetails(
          this.refId,
          this.id,
          this.userType,
          value,
          this.sourceid
        )
        .then((data) => {
          this.sourceid = data.insertId;
          this.saveStatus.emit('sourcingTick');
          this.formActivater.disableForm = true;
          this.globFunc.setapplicationDataChangeDetector(
            'saved',
            this.pagename
          );
          // this.globalData.setEditSaveStatus("sourcingSaved");
          localStorage.setItem('Sourcing', 'sourcingSaved');
        });
    } else {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Must Save Loan Facilities!');
    }
  }

  async getSourcingData() {
    // let applicantType = await this.sqliteProvider.getApplicantType(this.appLeadId)
    this.sqliteProvider
      .getSourcingDetails(this.refId, this.id)
      .then((data) => {
        if (data.length > 0) {
          this.sourcingData.controls.janaEmployee.setValue(
            data[0].janaEmployee
          );
          this.sourcingData.controls.applicType.setValue(data[0].applicType);
          this.sourcingData.controls.busiDesc.setValue(data[0].busiDesc);
          this.sourcingData.controls.sourChannel.setValue(data[0].sourChannel);
          this.sourChannelChng(data[0].sourChannel, 'chng');
          this.sourcingData.controls.sourIdName.setValue(data[0].sourIdName);
          this.sourcingData.controls.sourIdName1.setValue(data[0].sourIdName1);
          this.sourcingData.controls.leadId.setValue(data[0].leadId);
          this.sourcingData.controls.typeCase.setValue(data[0].typeCase);
          this.sourcingData.controls.balTrans.setValue(data[0].balTrans);
          this.sourcingData.controls.branchName.setValue(data[0].branchName);
          this.sourcingData.controls.branchState.setValue(data[0].branchState);
          this.sourcingData.controls.loginBranch.setValue(data[0].loginBranch);
          this.sourcingData.controls.applDate.setValue(data[0].applDate);
          this.sourcingData.controls.roName.setValue(data[0].roName);
          this.sourcingData.controls.roCode.setValue(data[0].roCode);
          this.refId = data[0].refId;
          this.id = data[0].id;
          this.userType = data[0].userType;
          this.sourceid = data[0].sourceid;

          this.saveStatus.emit('sourcingTick');
          // this.globalData.setEditSaveStatus("sourcingSaved");
          localStorage.setItem('Sourcing', 'sourcingSaved');
        }
      })
      .catch((Error) => {
        console.log(Error);
      });
  }

  getBusinessDescription() {
    this.sqliteProvider
      .getMasterDataUsingType('BusinessDescription')
      .then((data) => {
        this.busiDescMaster = data;
      });
  }
  getSourcingChannel() {
    this.sqliteProvider
      .getMasterDataUsingType('SourcingChannel')
      .then((data) => {
        console.log(data, 'get sourcing channel');
        this.sourcingChannels = data;
        this.sourcing = data;
      });
  }
  getTypeofCase() {
    this.sqliteProvider.getMasterDataUsingType('TypeofCase').then((data) => {
      this.typeCase = data;
    });
  }

  getBranchList() {
    this.sqliteProvider.getOrganisation().then((data) => {
      this.branch_master = data;
      console.log('branch');
    });
  }

  convertdate(str: string) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('-');
  }

  getStateList() {
    this.sqliteProvider.getStateList().then((data) => {
      this.state_master = data;
      console.log('state');
    });
  }

  getCibilCheckedDetails() {
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

  getdefaultData() {
    this.sqliteProvider
      .getOrganisationState(localStorage.getItem('janaCenter'))
      .then((state) => {
        if (state.length > 0) {
          this.sourcingData.controls.loginBranch.setValue(
            localStorage.getItem('janaCenter')
          );
          this.sourcingData.controls.roName.setValue(
            this.globFunc.basicDec(localStorage.getItem('username'))
          );
          this.sourcingData.controls.roCode.setValue(
            this.globFunc.basicDec(localStorage.getItem('username'))
          );
          this.sourcingData.controls.branchName.setValue(
            localStorage.getItem('janaCenter')
          );
          this.sourcingData.controls.branchState.setValue(state[0].OrgState);
          this.sourcingData.controls.applDate.setValue(
            this.convertdate(this.dateValue)
          );
          this.sourcingData.controls.leadId.setValue(this.leadId);
          this.sourcingData.controls.typeCase.setValue('1');
          this.sourcingData.controls.balTrans.setValue('2');
        }
      });
  }

  sourChannelChng(event, type) {
    let value = event.detail ? event.detail.value : event;
    if (type == 'chng') {
      this.sourcingData.controls.sourIdName.setValue('');
      this.sourcingData.controls.sourIdName1.setValue('');
    }
    if (value == '2' || value == '3') {
      this.sourcingData.controls.sourIdName1.clearValidators();
      this.sourcingData.controls.sourIdName1.setValidators(
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z0-9]*'),
          Validators.required,
        ])
      );
      this.sourcingData.controls.sourIdName1.updateValueAndValidity();
      this.sourcingData.controls.sourIdName.clearValidators();
      this.sourcingData.controls.sourIdName.setValue('');
      this.sourcingData.controls.sourIdName.updateValueAndValidity();
    } else if (value == '5' || value == '7' || value == '8') {
      this.sqliteProvider
        .getSourcingIdName(value, localStorage.getItem('orgId'))
        .then((data) => {
          this.sourcingIdNameList = data;
        });
      this.sourcingData.controls.sourIdName.setValidators(Validators.required);
      this.sourcingData.controls.sourIdName1.clearValidators();
      this.sourcingData.controls.sourIdName1.setValue('');
      this.sourcingData.controls.sourIdName1.updateValueAndValidity();
    } else {
      this.sourcingData.controls.sourIdName.clearValidators();
      this.sourcingData.controls.sourIdName.updateValueAndValidity();
      this.sourcingData.controls.sourIdName1.clearValidators();
      this.sourcingData.controls.sourIdName1.updateValueAndValidity();
    }
  }
  sourcingIdNameList: any;

  empSelect(select) {
    console.log(select.detail.value);
    this.emp = select.detail.value;
    this.globFunc.JanaEmpl(this.emp);
    if (this.custType != 'E' && this.emp == '1') {
      this.sourcingData.controls.applicType.setValue('jana');
    } else if (this.custType != 'E' && this.emp == '2') {
      this.sourcingData.controls.applicType.setValue('New');
    } else if (this.custType == 'E' && this.emp == '1') {
      this.sourcingData.controls.applicType.setValue('jana');
    } else if (this.custType == 'E' && this.emp == '2') {
      this.sourcingData.controls.applicType.setValue('Existing');
    }
  }
}
