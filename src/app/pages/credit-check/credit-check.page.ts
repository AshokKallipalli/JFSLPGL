import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-credit-check',
  templateUrl: './credit-check.page.html',
  styleUrls: ['./credit-check.page.scss'],
})
export class CreditCheckPage implements OnInit {
  refId: any;
  userType: any = 'A';
  id: any;
  appCustId: any;
  applicantDetails: any;
  coapplicantsList: any = [];
  coapplicant: any = [];
  custType: any;
  userInfo: any;
  showCoApp: any = false;
  showFooter: any = false;
  appStatId: any;
  creditChecked = '0';
  submitStat: any;
  userGroup: any;
  requiredScore: any;
  cibilScore: any;
  isAppEligible: any;
  isCoAppEligible = [];
  creditFlowGroup: any;
  naveParamsValue: any;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  constructor(
    public alertCtrl: AlertController,
    public sqliteProvider: SqliteService,
    public sqlsupport: SquliteSupportProviderService,
    public router: Router,
    public global: GlobalService,
    public master: RestService,
    public globalFun: DataPassingProviderService,
    public activatedRoute: ActivatedRoute,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService
  ) {
    this.activatedRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.userInfo = JSON.parse(this.naveParamsValue.submitData);
    this.refId = this.userInfo.refId;
    this.id = this.userInfo.id;
    this.custType = 'Promoter';
    // console.log(this.navParams.snapshot.queryParamMap.get('GrefId'));
    this.getCreditFlowGroup();
  }

  ngOnInit() {
    // this.getAppStatus();
    this.loadAllApplicantDetails();
    // this.loadCoappDetails();
    this.getGroupId();
    // this.checkEligibile();
    // this.getRequiredScore();
  }

  getCreditFlowGroup() {
    this.sqliteProvider
      .getVehicleWorkflowList('Credit Review')
      .then((creditDesc) => {
        this.creditFlowGroup = creditDesc[0];
      });
  }

  checkEligibile() {
    this.sqlsupport.updateEligibilityStatus('eligible', this.appStatId);
    this.alertService.showAlert(
      'Alert',
      'Application is eligible.Proceed further'
    );
    // if (this.isAppEligible && this.isCoAppEligible.every(data => data == true)) {
    //   this.sqlsupport.updateEligibilityStatus('eligible', this.appStatId);
    //   this.global.showAlert('Alert', 'Application is eligible.Proceed further');

    // } else {
    //   if (!this.isAppEligible) {
    //     this.global.showAlert('Alert', 'Applicant score is not eligible.Please forward to credit check');
    //   } else if (!this.isCoAppEligible.every(data => data == true)) {
    //     this.global.showAlert('Alert', 'Co-applicant score is not eligible.Please forward to credit check');
    //   }
    //   this.showFooter = true;
    // }
  }

  getGroupId() {
    this.sqlsupport
      .getGroupIdBasedOnUser(
        this.global.basicDec(localStorage.getItem('username'))
      )
      .then((data) => {
        if (data.length > 0) {
          this.userGroup = JSON.parse(data[0].userGroups);
        }
      });
  }
  getRequiredScore() {
    this.sqlsupport
      .getRequiredScoreBasedOnPrd(localStorage.getItem('product'))
      .then((data) => {
        this.requiredScore = data[0].prdCibilScore;
        if (this.userType == 'A') {
          if (
            this.requiredScore == '' ||
            this.requiredScore == null ||
            this.requiredScore == undefined
          ) {
            this.alertService.showAlert('Alert', 'The Product Score is Empty');
          } else {
            if (+this.cibilScore >= +this.requiredScore) {
              this.isAppEligible = true;
            } else {
              this.isAppEligible = false;
            }
          }
        }
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreditCheckPage');
  }

  ionViewWillEnter() {
    // this.loadCoappDetails();
  }

  async showScore() {
    const alert = await this.alertCtrl.create({
      header: 'CIBIL REQUIRED SCORE',
      cssClass: 'alertHeader',
      message: `<img src="../../../assets/imgs/credit1.jpg"><br> <center><strong>750</strong></center>`,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            console.log('working');
          },
        },
      ],
    });
    alert.present();
  }
  getAppStatus() {
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      // this.appCibilCheckStat = data[0].cibilCheckStat;
      // this.submitStat = data[0].submitStat;
      // this.appStatId = data[0].statId;
      this.creditChecked = data[0].creditCheck;
      // this.appCibilColor = data[0].cibilColor;
      // this.appCibilScore = data[0].cibilScore;
      // this.appHimarkCheckStat = data[0].himarkCheckStat;
    });
    // this.sqliteProvider.getSubmitStatusDetails(this.refId).then(data => {
    //   console.log(data, 'submit status');
    //   // this.ScoreData.propNo = data[0].applicationNumber;
    //   // this.ScoreData.custId = data[0].LpCustid;
    //   // this.leadId = data[0].hiMarkMemberID;//change;
    //   // this.autoAppStat = data[0].autoApproval;
    //   // this.postSanctionStat = data[0].postSanction;
    //   this.creditChecked = data[0].creditCheck;
    // }).catch(err => err);
  }

  // appStatId = "0";

  loadAllApplicantDetails() {
    this.sqliteProvider
      .getApplicantDataAfterSubmit(this.refId)
      .then((data) => {
        if (data.length > 0) {
          this.applicantDetails = [];
          this.applicantDetails = data;
          this.appStatId = data[0].statId;
          this.id = data[0].id;
          // this.cibilScore = data[0].cibilScore;
          this.cibilScore = data[0].himarkScore;
          // this.showFooter = true;
          this.getAppStatus();
          this.getRequiredScore();
          // this.checkEligibile();
        } else {
          this.applicantDetails = [];
        }
        // this.id = data[0].id;
        // this.appCustId = data[0].LpCustid;
      })
      .then((data) => {
        this.loadCoappDetails();
      })
      .catch((e) => {
        console.log('er' + e);
        this.applicantDetails = [];
      });
  }

  loadCoappDetails() {
    this.sqliteProvider
      .getCoApplicantDataAfterSubmit(this.refId)
      .then((res) => {
        console.log(res);
        if (res.length > 0) {
          this.coapplicantsList = [];
          this.coapplicantsList = res;
          for (let i = 0; i < res.length; i++) {
            // if (res[i].cibilScore >= this.requiredScore) {
            if (res[i].himarkScore >= this.requiredScore) {
              // (+this.cibilScore >= +this.requiredScore) || (+this.cibilScore < 0 && +this.cibilScore > -6)
              this.isCoAppEligible[i] = true;
            } else {
              this.isCoAppEligible[i] = false;
            }
          }
          // this.isCoAppEligible=[];
          // this.isCoAppEligible.push('false'.repeat(res.length));
          console.log(this.coapplicantsList, 'coapplicants');
          // this.id = res[0].id;
        }
      })
      .then((data) => {
        this.checkEligibile();
      });
  }

  forwardToWeb() {
    this.loadingService.globalLodingPresent('Please wait...');
    // let body = {
    //   "PropNo": this.applicantDetails[0].applicationNumber,
    //   "userId": this.applicantDetails[0].createdUser,
    //   "flowType": "CR"
    // }
    let body = {
      userId: this.applicantDetails[0].createdUser,
      PropNo: this.applicantDetails[0].applicationNumber,
      // "nextFlowPoint": "109182",//109182uAT,109190local
      nextFlowPoint: this.creditFlowGroup.flowPoint, //109182uAT,109190local
      // "GroupId": "1556680"//1556680uat 1556671local
      GroupId: this.creditFlowGroup.UserGroup, //1556680uat 1556671local
    };
    this.master.restApiCallAngular('mobileWorkflow', body).then((res) => {
      let creditCheck = <any>res;
      if (creditCheck.ErrorCode === '000') {
        this.loadingService.globalLodingDismiss();
        this.sqlsupport.updateWorkFlowStatus(
          this.applicantDetails[0].applicationNumber
        );
        // this.navCtrl.push(ExistApplicationsPage, { submitData: this.userInfo });
        // this.sqlsupport.updateCreditCheck(this.appStatId);
        localStorage.setItem(this.refId, 'true');
        this.getAppStatus();
        this.alertService.showAlert('Alert', 'Successfully Forwarded');
        // this.globalFun.showAlert('Alert', creditCheck.ErrorDesc).then(data => {
        //   this.proceedNextPage();
        // });
      } else {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert', creditCheck.ErrorDesc);
      }
    });
  }

  proceedNextPage() {
    this.alertService
      .proccedOk('Alert', 'Application forwarded to web for credit check')
      .then((data) => {
        if (data == 'yes') {
          this.router.navigate(['/ExistApplicationsPage'], {
            queryParams: { submitData: this.userInfo },
            skipLocationChange: true,
            replaceUrl: true,
          });
        }
      });
    // if (this.userType == 'C') {
    //   this.globalFun.proccedOk("Alert", "Proceed to score card").then(data => {
    //     if (data == "yes") {
    //       this.navCtrl.push(ScoreCardPage, { submitData: this.userInfo });
    //     }
    //   });
    // }
  }

  tabChanges() {
    if (this.custType === 'Promoter') {
      this.userType = 'A';
      // this.getAppStatus();
    } else {
      this.userType = 'C';
      // this.creditChecked = "0";
      // this.showFooter = false;
      this.showCoApp = false;
    }
  }

  onCoAppChange(ev) {
    let id = ev.detail.value;
    this.sqliteProvider.getCoApplicantBasedOnId(this.refId, id).then((data) => {
      if (data.length > 0) {
        this.coapplicant = data;
        this.showCoApp = true;
        // this.showFooter = true;
        this.id = data[0].id;
        // this.appStatId = data[0].statId;
        this.cibilScore = data[0].himarkScore;
        // this.getAppStatus();
        // this.getRequiredScore();
        // if(this.cibilScore<this.requiredScore){
        //   this.isCoAppEligible.push(false);
        // }else{
        //   this.isCoAppEligible.push(true);
        // }

        // this.coAppCustId = data[0].LpCustid;
      } else {
        this.coapplicant = [];
      }
      // this.selectedItem = "";

      // this.loadAllPosidexDetails();
    });
  }

  homePage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  getColor(score) {
    if (+score > 500 && +score < 750) {
      return '#f14a0d';
    } else if (+score < 500) {
      return 'red';
    } else if (+score > 750) {
      return 'green';
    }
  }
}
