import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, NavParams } from '@ionic/angular';
import * as moment from 'moment';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-lms',
  templateUrl: './lms.page.html',
  styleUrls: ['./lms.page.scss'],
})
export class LmsPage {
  username: any;
  branchCode: any;
  lmsDetails = [];
  lmsid: any;
  leadStatus: any;
  org_master: any[];

  constructor(
    public navCtrl: NavController,
    public navParams: ActivatedRoute,
    public sqliteProvider: SqliteService,
    public master: RestService,
    public globalData: DataPassingProviderService,
    public router: Router,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService
  ) {
    this.username = this.navParams.snapshot.queryParamMap.get('user');
    this.branchCode = this.navParams.snapshot.queryParamMap.get('branch');
    // this.getLMSData();
    this.sqliteProvider.getOrganisation().then((data) => {
      this.org_master = data;
    });
  }

  checkLMS(event) {
    this.loadingService.globalLodingPresent('Please wait...');
    let lmsData = {
      User_id: this.username,
      Branch_code: this.branchCode,
    };
    let dateTime = new Date();
    let curDateTime = moment(dateTime).format('YYYY-MM-DD HH:mm:ss');
    this.sqliteProvider.addAuditTrail(
      curDateTime,
      'LMS',
      'LMS applications',
      lmsData
    );
    this.master.restApiCallAngular('MobLMSlead', lmsData).then(
      (data) => {
        if ((<any>data).errorStatus == 'Success') {
          if ((<any>data).errorDesc == 'No Data found!!!') {
            this.loadingService.globalLodingDismiss();
            event.detail.complete();
            this.alertService.showAlert('Alert!', (<any>data).errorDesc);
          } else {
            event.detail.complete();
            this.lmsDetails = (<any>data).LeadDetails;
            for (var i = 0; i < this.lmsDetails.length; i++) {
              this.compareLeads(this.lmsDetails[i]);
            }
            this.loadingService.globalLodingDismiss();
          }
        } else {
          this.alertService.showAlert('Alert!', (<any>data).errorDesc);
          this.loadingService.globalLodingDismiss();
        }
      },
      (err) => {
        event.detail.complete();
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'No Response from Server!');
      }
    );
  }

  getLMSDetails() {
    let lmsData = {
      User_id: this.username,
      Branch_code: this.branchCode,
    };
    let dateTime = new Date();
    let curDateTime = moment(dateTime).format('YYYY-MM-DD HH:mm:ss');
    this.sqliteProvider.addAuditTrail(
      curDateTime,
      'LMS',
      'LMS applications',
      lmsData
    );
    this.master.restApiCallAngular('MobLMSlead', lmsData).then(
      (data) => {
        console.log(data);
        if ((<any>data).errorStatus == 'Success') {
          if ((<any>data).errorDesc == 'No Data found!!!') {
            this.alertService.showAlert('Alert!', (<any>data).errorDesc);
          } else {
            this.lmsDetails = (<any>data).LeadDetails;
            for (var i = 0; i < this.lmsDetails.length; i++) {
              this.compareLeads(this.lmsDetails[i]);
            }
          }
        }
        this.loadingService.globalLodingDismiss();
      },
      (err) => {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'No Response from Server!');
      }
    );
  }
  getBranch(branch) {
    let branches = this.org_master.find((f) => {
      return f.OrgBranchCode === branch;
    });
    return branches.OrgName;
  }
  getLMSData() {
    this.sqliteProvider.get_LMS_Data().then(
      (data) => {
        console.log(data);
        if (data.length == 0) {
          this.getLMSDetails();
        } else {
          this.lmsDetails = data;
        }
      },
      (err) => {
        console.log('erre: ' + err);
      }
    );
  }

  passdetails(value) {
    this.loadingService.globalLodingPresent('Please wait...');
    this.globalData.setloanType('L');
    this.router.navigate(['/NewapplicationPage'], {
      queryParams: { lmsData: value, usertype: 'A' },
      skipLocationChange: true,
      replaceUrl: true,
    });
    this.loadingService.globalLodingDismiss();
  }

  compareLeads(value) {
    console.log(value.Lead_id);
    this.sqliteProvider.getLMSDetails(value.Lead_id).then((getLms) => {
      if (getLms.length == 0) {
        this.sqliteProvider.insertLMSData(value).then(
          (data) => {
            this.lmsid = data.insertId;
            this.getLMSData();
            console.log('LMS data inserted!');
          },
          (err) => {
            console.log('err: ' + err);
          }
        );
      } else {
        if (getLms[0].Lead_id != value.Lead_id) {
          this.sqliteProvider.insertLMSData(value).then(
            (data) => {
              this.lmsid = data.insertId;
              this.getLMSData();
              console.log('LMS data inserted!');
            },
            (err) => {
              console.log('err: ' + err);
            }
          );
        } else {
          this.sqliteProvider.updateLMSData(value.Lead_id).then(
            (up) => {
              this.getLMSData();
              console.log('LMS data updated!');
            },
            (err) => {
              console.log('err: ' + err);
            }
          );
        }
      }
    });
  }
}
