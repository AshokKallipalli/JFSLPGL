import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { NavController, NavParams } from '@ionic/angular';
import * as moment from 'moment';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.page.html',
  styleUrls: ['./audit-logs.page.scss'],
})
export class AuditLogsPage implements OnInit {
  auditLogData = [];
  today: any = new Date();
  startmaxdate: any;
  startmindate: any;
  packageName: any;
  endmaxdate: any;
  endmindate: any;
  auditLog: FormGroup;
  deviceId: any;
  auditReq = [];
  logReqData: any;
  logFileName: string;
  versionDetails: string;
  submitDisable: boolean = false;
  dobDisable: boolean = false;
  // typeOfLogList = [{ CODE: 1, NAME: 'Audit Log' }, { CODE: 2, NAME: 'Error Log' },];
  typeOfLogList = [{ CODE: 1, NAME: 'Audit Log' }];
  selectOptions = {
    cssClass: 'remove-ok',
  };

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };
  auditlogarray = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public master: RestService,
    public globalData: DataPassingProviderService,
    public network: Network,
    // public file: File,
    // public viewCtrl: ViewController,
    private appVersion: AppVersion,
    private globFunc: GlobalService,
    public sqlSupport: SquliteSupportProviderService,
    public alertService: CustomAlertControlService
  ) {
    this.auditLog = this.formBuilder.group({
      typeOfLog: ['', Validators.compose([Validators.required])],
      startDate: ['', Validators.compose([Validators.required])],
      endDate: ['', Validators.compose([Validators.required])],
    });
    this.callmaxdate();
    this.logFileName =
      'JFS_VL_Audit_Logs_' +
      this.globFunc.basicDec(localStorage.getItem('username')) +
      '.txt';
    this.appVersion.getVersionNumber().then((version) => {
      this.versionDetails = version;
    });
  }

  async ngOnInit() {
    this.packageName = await this.globFunc.getPackageName();
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
      }
    });
  }

  async auditgen(value) {
    let auditLog = [],
      errorLog = [];
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert('Alert!', 'Enable internet connection!');
    } else {
      this.globalData.globalLodingPresent('Please wait...');
      if (value.typeOfLog == 1) {
        auditLog = await this.sqliteProvider.getAuditTrailbydate(value);
      } else {
        errorLog = await this.sqlSupport.getErrorLogsFromDB(value);
      }
      if (value.typeOfLog == 1 && auditLog.length > 0) {
        this.auditlogarray = [];
        this.auditLogData = auditLog;
        // this.logFileName = "JFS_VL_Audit_Logs_" + this.globFunc.basicDec(localStorage.getItem('username')) + ".txt";
        this.deviceId = auditLog[0].deviceID;
        this.frameRequest();
      } else if (value.typeOfLog == 2 && errorLog.length > 0) {
        this.auditlogarray = [];
        this.auditLogData = errorLog;
        // this.logFileName = "JFS_VL_Error_Logs_" + this.globFunc.basicDec(localStorage.getItem('username')) + ".txt";
        this.deviceId = errorLog[0].deviceID;
        this.frameRequest();
      } else {
        this.globalData.globalLodingDismiss();
        this.alertService.showAlert('Alert', 'No records found!');
      }
    }
  }

  frameRequest() {
    for (var i = 0; i < this.auditLogData.length; i++) {
      let details = {
        username: this.auditLogData[i].username,
        Timestamp: this.auditLogData[i].Timestamp,
        service: this.auditLogData[i].service
          ? this.auditLogData[i].service
          : '',
        action: this.auditLogData[i].action
          ? this.auditLogData[i].action
          : this.auditLogData[i].pageName,
        value: this.auditLogData[i].value
          ? this.auditLogData[i].value
          : this.auditLogData[i].errorDesc,
      };
      this.auditReq.push(details);
      if (i == this.auditLogData.length - 1) {
        this.generateLogs(0);
        // // this.auditLogCall(this.auditReq);
        // this.createlogfile().then(data => {
        //   this.globalData.globalLodingDismiss();
        // })
      }
    }
  }

  auditLogCall(value) {
    this.logReqData = {
      audit_log: {
        deviceID: this.deviceId,
        audit_details: value,
      },
    };
    this.master.restApiCallAngular('UpdateAuditLog', this.logReqData).then(
      (data) => {
        if ((<any>data).ErrorStatus == 'Success') {
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Success', 'Log sent successfully');
          this.navCtrl.pop();
        } else if ((<any>data).ErrorStatus == 'Failure') {
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Failed', 'Log sent Failed');
        }
      },
      (err) => {
        this.globalData.globalLodingDismiss();
        console.log('err: ' + JSON.stringify(err));
        this.alertService.showAlert('Alert!', 'No response from the server!');
      }
    );
  }

  callmaxdate() {
    let dd = this.today.getDate();
    let mm = this.today.getMonth() + 1; //January is 0!
    let yyyy = this.today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    let maxdate = yyyy + '-' + mm + '-' + dd;
    this.startmaxdate = maxdate;
    this.startmindate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  }

  calcendDate() {
    this.endmindate = this.auditLog.controls.startDate.value;
    let check = moment(this.startmaxdate).diff(this.endmindate, 'days');
    if (check >= 7) {
      this.endmaxdate = moment(this.endmindate)
        .add(7, 'days')
        .format('YYYY-MM-DD');
    } else {
      this.endmaxdate = this.startmaxdate;
    }
    this.auditLog.get('endDate').setValue('');
    this.auditLog.get('endDate').updateValueAndValidity();
  }

  // async createlogfile() {
  //   // try {
  //     this.globalData.globalLodingPresent('Please Wait...')
  //     await Filesystem.readdir({
  //       path: `AUDITLOGS/${this.logFileName}`,
  //       directory: Directory.External
  //     }).then(async () => {
  //       // console.log("file avaliable");
  //       await Filesystem.deleteFile({
  //         path: `AUDITLOGS/${this.logFileName}`,
  //         directory: Directory.External
  //       }).then(() => {
  //         console.log("file removed");
  //         this.createlogfile();
  //       }).catch((err) => {
  //         console.log("remove file:" + err);
  //       });
  //     }).catch(async (err) => {
  //       //console.log("file:" + err);
  //       console.log("file not avaliable");
  //       await Filesystem.mkdir({
  //         path: `AUDITLOGS/${this.logFileName}`,
  //         directory: Directory.External,
  //         recursive: true,
  //       }).then(() => {
  //         console.log("file Created.");
  //         this.generateLogs(0);
  //       })
  //     });
  //   // } catch (error) {
  //   //   this.globalData.globalLodingDismiss();
  //   //   console.log(error);
  //   // }

  // }

  // async generateLogs(ilen) {
  //   let logs = "";
  //   if (ilen == 0) {
  //     logs = "App version Data:" + this.versionDetails + new Date() + ",deviceID:" + this.auditLogData[ilen].deviceID + ",Username:" + this.auditLogData[ilen].username + ",Timestamp:" + this.auditLogData[ilen].Timestamp + ",Service:" + this.auditLogData[ilen].service + ",Action:" + this.auditLogData[ilen].action + ",Value:" + this.auditLogData[ilen].value + ".\r\n\r\n";
  //   }
  //   else {
  //     logs = "deviceID:" + this.auditLogData[ilen].deviceID + ",Username:" + this.auditLogData[ilen].username + ",Timestamp:" + this.auditLogData[ilen].Timestamp + ",Service:" + this.auditLogData[ilen].service + ",Action:" + this.auditLogData[ilen].action + ",Value:" + this.auditLogData[ilen].value + ".\r\n\r\n";
  //   }
  //   const file = await Filesystem.writeFile({
  //     path: `AUDITLOGS/${this.logFileName}`,
  //     data: logs,
  //     directory: Directory.External,

  //   }).then(data => {
  //     if (ilen != this.auditLogData.length - 1) {
  //       ilen = ilen + 1;
  //       this.generateLogs(ilen);
  //     }
  //     else {
  //       this.globalData.globalLodingDismiss();
  //       this.alertService.showAlert("Alert!", `Audit Logs Generated Successfully at location ${file + "AUDITLOGS/" + this.logFileName}`);
  //     }
  //   })
  //   this.globalData.globalLodingDismiss();
  // }

  /**
   * @method createLogFile
   * @description Function helps to create a auditLogs and save into the folder.
   * @author HariHaraSuddhan S
   */

  async createLogFile(logData) {
    try {
      console.log('logData', logData);
      const contents = await Filesystem.readFile({
        path: `file:///data/user/0/${this.packageName}/files/AUDITLOGS/${this.logFileName}`,
      });
      if (contents) {
        await Filesystem.deleteFile({
          path: `file:///data/user/0/${this.packageName}/files/AUDITLOGS/${this.logFileName}`,
        }).then((data) => {
          this.createLogFile(logData);
        });
      }
      console.log('contents', contents);
    } catch (error) {
      let names = logData;
      let fileName = `AUDITLOGS/${this.logFileName}`;
      let nameString = names.toLocaleString();
      const writetheFile = await Filesystem.writeFile({
        path: fileName,
        data: nameString,
        directory: Directory.External,
        encoding: Encoding.UTF8,
        recursive: true,
      });
      this.globalData.globalLodingDismiss();
      console.log('writeLogFile', writetheFile);
      this.alertService.showAlert('Alert', 'Logs Generated Successfully');
      // return writetheFile
    }
  }

  /**
   * @method generateLogs
   * @description Function helps to generate a auditLogs get from SQLite DB.
   * @author HariHaraSuddhan S
   */

  generateLogs(ilen) {
    try {
      let logs = '';
      if (ilen == 0) {
        logs =
          'App version Data:' +
          this.versionDetails +
          new Date() +
          ',deviceID:' +
          this.auditLogData[ilen].deviceID +
          ',Username:' +
          this.auditLogData[ilen].username +
          ',Timestamp:' +
          this.auditLogData[ilen].Timestamp +
          ',Service:' +
          this.auditLogData[ilen].service +
          ',Action:' +
          this.auditLogData[ilen].action +
          ',Value:' +
          this.auditLogData[ilen].value +
          '.\r\n\r\n';
      } else {
        logs =
          'deviceID:' +
          this.auditLogData[ilen].deviceID +
          ',Username:' +
          this.auditLogData[ilen].username +
          ',Timestamp:' +
          this.auditLogData[ilen].Timestamp +
          ',Service:' +
          this.auditLogData[ilen].service +
          ',Action:' +
          this.auditLogData[ilen].action +
          ',Value:' +
          this.auditLogData[ilen].value +
          '.\r\n\r\n';
      }
      this.auditlogarray.push(logs);
      // this.file.writeFile(this.file.externalApplicationStorageDirectory + 'AUDITLOGS/', this.logFileName, logs, { replace: false, append: true }).then(async data => {
      if (ilen != this.auditLogData.length - 1) {
        ilen = ilen + 1;
        this.generateLogs(ilen);
      } else {
        this.globalData.globalLodingDismiss();
        this.createLogFile(this.auditlogarray);
        // this.global.presentAlert("Alert!", `Audit Logs Generated Successfully at location ${this.file.externalApplicationStorageDirectory + "AUDITLOGS/" + this.logFileName}`);
      }
    } catch (error) {
      // this.errorHandling.errorLog(error, "AuditLogComponent-generateLogs")
      this.globalData.globalLodingDismiss();
    }
  }
}
