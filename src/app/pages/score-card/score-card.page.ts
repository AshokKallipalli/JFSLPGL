import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import * as d3 from 'd3';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';

@Component({
  selector: 'app-score-card',
  templateUrl: './score-card.page.html',
  styleUrls: ['./score-card.page.scss'],
})
export class ScoreCardPage implements OnInit {
  refId: any;
  id: any;
  userType: any;
  userInfo: any;
  custType: any;
  leadId: any;
  scoreValue: any = 78;
  showMeter = false;
  gaugemap: any = {};
  fieldInspecFlowGroup: any;
  postSanctionFlowGroup: any;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  sanctionedAmt: number = 0;
  emi: number = 0;
  eligibleAmt: any;
  personalData: any;

  hiMarkScore: any;
  scoreCardAfterPS: any;

  pddchargeslist: any;
  processFeesData: any = [];

  existVehicleType: any;
  houseOwned: any;
  commonHimarkvalue: number;
  commonLoanAmount: number;

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
  autoApprovalMsg: any;
  reRun: any = 'N';
  pdt_master = [];
  today: any = new Date();
  //currentDate: string;
  approveDate: string;
  reSubmitDone: number;
  reSubmitA: any = 0;
  fiFlage: string;
  naveParamsValue: any;
  scheme: string;
  // scoreResponse: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public globalData: DataPassingProviderService,
    public sqlsupport: SquliteSupportProviderService,
    public modalCtrl: ModalController,
    public sqliteProvider: SqliteService,
    public globFunc: GlobalService,
    public master: RestService,
    public sqlSupport: SquliteSupportProviderService,
    public router: Router,
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
    this.userType = this.globalData.getborrowerType();
    this.userInfo = JSON.parse(this.naveParamsValue.submitData);
    this.refId = this.userInfo.refId;
    this.id = this.userInfo.id;
    this.custType = 'Promoter';
    // console.log(this.navParams.get('GrefId'));
    this.getDetails();
    this.getAppStatus();
    this.getfieldInspecFlowGroup();
    this.getProcessingFees();
    this.getPersonalInfo();
    this.getProductValue();
    this.getVehicleWorkflow();
  }
  ngOnInit() {
    this.getDetails();
    this.loadAllApplicantDetails();
    this.meterLoader();
    // this.counterScore();
  }
  checked = 'N';
  ScoreData = {
    propNo: '',
    productId: '',
    custId: '',
  };
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

  async getDetails() {
    await this.sqliteProvider
      .getScoreCard(this.refId)
      .then((data) => {
        if (data.length > 0) {
          this.scoreId = data[0].scoreId;
          this.checked = data[0].checked;
          if (data[0].manualApp == 'Y') {
            this.showManualUser = true;
          } else if (data[0].STPFLAG == 'N') {
            // this.isAutoApprovalFlag = false;
            console.log('STPflag enable');
          }
          //else {
          // if (data[0].STPFLAG == 'N') {
          //   this.isAutoApprovalFlag = false;
          // } else {
          //   if (this.reqLoanAmount >= 150000) {

          //   }else if (this.hiMarkScore == 0) {
          //     this.isAutoApprovalFlag = false;
          //   }else {
          //     this.isAutoApprovalFlag = true;
          //   }
          // }
          this.questionRes = JSON.parse(data[0].answers || {});
        }
      })
      .catch((err) => err);
    this.sqliteProvider
      .getBasicDetails(this.refId, this.id)
      .then(async (data) => {
        console.log(data, 'basic details');
        this.ScoreData.productId = data[0].janaLoan;
        this.scheme = await this.getJanaProductCode(data[0].janaLoan);
        this.sqliteProvider
          .getSubmitStatusDetails(this.refId)
          .then((data) => {
            console.log(data, 'submit status');
            this.ScoreData.propNo = data[0].applicationNumber;
            this.ScoreData.custId = data[0].LpCustid;
            this.leadId = data[0].SfosLeadId;
            this.autoAppStat = data[0].autoApproval; //change
            this.postSanctionStat = data[0].postSanction;

            let sanAmtValue = data[0].sanctionedAmt.toString().split('.');
            if (sanAmtValue[1] <= '49') {
              this.sanctionedAmt = Math.floor(data[0].sanctionedAmt);
            } else {
              this.sanctionedAmt = Math.ceil(data[0].sanctionedAmt);
            }

            let emiValue = data[0].emi.toString().split('.');
            if (emiValue[1] <= '49') {
              this.emi = Math.floor(data[0].emi);
            } else {
              this.emi = Math.ceil(data[0].emi);
            }

            let eliValue = data[0].eligibleAmt.toString().split('.');
            if (eliValue[1] <= '49') {
              this.eligibleAmt = Math.floor(data[0].eligibleAmt);
            } else {
              this.eligibleAmt = Math.ceil(data[0].eligibleAmt);
            }

            // this.sanctionedAmt = data[0].sanctionedAmt;
            // this.emi = data[0].emi;
            // this.eligibleAmt = data[0].eligibleAmt;
          })
          .catch((err) => err);
        // this.vehicleDetails.get("dealerName").setValue(data[0].dealerName);
        // this.vehicleDetails.get("dealerCode").setValue(data[0].dealerCode);
        // this.dealerNameTemp = this.dummy_masterDealer.find(val => val.dealerCode == data[0].dealerName);
      })
      .catch((err) => err);
    this.sqliteProvider
      .getVehicleScoreMaster()
      .then((data) => {
        console.log(data, 'score master');
        this.scoreCardMaster = data;
      })
      .catch((err) => err);
  }
  autoAppStat = '0';
  postSanctionStat = '0';
  scoreCardMaster: any = [];
  ionViewDidLoad() {
    console.log('ionViewDidLoad ScoreCardPage');
    this.sqliteProvider.getSubmitStatusDetails(this.refId).then((data) => {
      this.hiMarkScore = data[0].himarkScore;
      console.log(this.hiMarkScore);
    });
    this.globFunc.reRunScoreCard.subscribe((data) => {
      // this.reRun = data
      console.log('reRun in service ', data);
    });
  }
  questionRes: any = {};

  objectKeys(obj) {
    return Object.keys(obj);
  }
  isAutoApprovalFlag: boolean;
  reSubmit: boolean;
  showManualUser = false;
  disableManualApprvalBtn = false;
  selectedUserForManual: any;
  manualUserList: any = [];

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
  onUserChange(value) {
    this.selectedUserForManual = this.manualUserList.find(
      (data) => data.UserGroup == value
    );
  }
  ManualApprovalCall() {
    this.loadingService.globalLodingPresent(
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
          this.loadingService.globalLodingDismiss();
          this.disableManualApprvalBtn = true;
          // this.undoProposalServiceCall();
          this.sqlSupport.updateManualApprovalForSubmit(
            this.applicantDetails[0].applicationNumber
          );
          this.sqlSupport
            .updateManualApproval(
              this.applicantDetails[0].applicationNumber,
              'Y'
            )
            .then((data) => {
              // this.sqlSupport.deletePSMDetails(this.refId,this.id).then(data=>{
              this.router.navigate(['/ExistApplicationsPage'], {
                skipLocationChange: true,
                replaceUrl: true,
              });
              // })
            });
        } else {
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert('Alert', fieldInvesRes.ErrorDesc);
        }
      })
      .catch((err) => err);
  }
  checkScoreCard() {
    this.loadingService.globalLodingPresent('Please wait...');
    let dd = this.today.getDate();
    let mm = this.today.getMonth() + 1; //January is 0!
    let yyyy = this.today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    let nowDate = yyyy + '-' + mm + '-' + dd;
    // this.currentDate = nowDate
    // if (this.applicantDetails[0].dbDate >= this.currentDate) {
    this.master.restApiCallAngular('scorecard', this.ScoreData).then((res) => {
      let scoreResponse = <any>res;
      // this.scoreResponse = scoreResponse
      if (scoreResponse.errorCode === '000') {
        if (this.existVehicleType == '2') {
          if (scoreResponse.SRFLAG == 'N' && scoreResponse.STPFLAG == 'Y') {
            if (
              +scoreResponse.HimarkScore >= this.commonHimarkvalue &&
              +this.reqLoanAmount < this.commonLoanAmount &&
              this.houseOwned == '1'
            ) {
              this.loadingService.globalLodingDismiss();
              this.showManualUser = true;
            } else {
              this.fiFlageEnble(scoreResponse);
            }
          } else if (scoreResponse.SRFLAG == 'Y') {
            this.loadingService.globalLodingDismiss();
            this.srFlageEnable();
          } else if (scoreResponse.FIFLAG == 'Y') {
            this.fiFlageEnble(scoreResponse);
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert', scoreResponse.errorDesc);
          }
        } else {
          if (scoreResponse.SRFLAG == 'N') {
            let chargesFormatValue = scoreResponse.eligbleAmout
              .toString()
              .split('.');
            if (chargesFormatValue[1] <= '49') {
              this.eligibleAmt = Math.floor(scoreResponse.eligbleAmout);
            } else {
              this.eligibleAmt = Math.ceil(scoreResponse.eligbleAmout);
            }

            this.sqlSupport.updateEligibleAmout(
              this.eligibleAmt,
              this.applicantDetails[0].applicationNumber
            );

            if (scoreResponse.NTCFLAG == 'Y') {
              // NTC
              if (this.reqLoanAmount < 100000) {
                if (scoreResponse.STPFLAG == 'Y') {
                  // Auto Aproval
                  this.autoApprovalFlageEnable(scoreResponse);
                } else if (scoreResponse.FIFLAG == 'Y') {
                  // go to FI
                  if (scoreResponse.FIENTRY == 'N') {
                    this.fiFlageEnble(scoreResponse);
                  } else {
                    this.autoApprovalFlageEnable(scoreResponse);
                  }
                }
              } else if (this.reqLoanAmount > 150000) {
                if (
                  scoreResponse.STPFLAG == 'Y' ||
                  scoreResponse.FIFLAG == 'Y'
                ) {
                  // go to FI
                  if (scoreResponse.FIENTRY == 'N') {
                    this.fiFlageEnble(scoreResponse);
                  } else {
                    this.autoApprovalFlageEnable(scoreResponse);
                  }
                }
              } else {
                //  >1L to <=1.5L
                if (
                  scoreResponse.STPFLAG == 'Y' ||
                  scoreResponse.FIFLAG == 'Y'
                ) {
                  // go to FI
                  if (scoreResponse.FIENTRY == 'N') {
                    this.fiFlageEnble(scoreResponse);
                  } else {
                    this.autoApprovalFlageEnable(scoreResponse);
                  }
                }
              }
            } else {
              // ETC
              if (this.reqLoanAmount < 100000) {
                if (scoreResponse.STPFLAG == 'Y') {
                  // Auto Aproval
                  this.autoApprovalFlageEnable(scoreResponse);
                } else if (scoreResponse.FIFLAG == 'Y') {
                  // go to FI
                  if (scoreResponse.FIENTRY == 'N') {
                    this.fiFlageEnble(scoreResponse);
                  } else {
                    this.autoApprovalFlageEnable(scoreResponse);
                  }
                }
              } else if (
                this.reqLoanAmount > 150000 &&
                this.scheme !== '1052'
              ) {
                if (
                  scoreResponse.STPFLAG == 'Y' ||
                  scoreResponse.FIFLAG == 'Y'
                ) {
                  // go to FI
                  if (scoreResponse.FIENTRY == 'N') {
                    this.fiFlageEnble(scoreResponse);
                  } else {
                    this.autoApprovalFlageEnable(scoreResponse);
                  }
                }
              } else if (this.reqLoanAmount > 200000 && this.scheme == '1052') {
                if (
                  scoreResponse.STPFLAG == 'Y' ||
                  scoreResponse.FIFLAG == 'Y'
                ) {
                  // go to FI
                  if (scoreResponse.FIENTRY == 'N') {
                    this.fiFlageEnble(scoreResponse);
                  } else {
                    this.autoApprovalFlageEnable(scoreResponse);
                  }
                }
              } else {
                //  >1L to <=1.5L
                if (scoreResponse.STPFLAG == 'Y') {
                  // Auto Aproval
                  this.autoApprovalFlageEnable(scoreResponse);
                } else if (scoreResponse.FIFLAG == 'Y') {
                  // go to FI
                  if (scoreResponse.FIENTRY == 'N') {
                    this.fiFlageEnble(scoreResponse);
                  } else {
                    this.autoApprovalFlageEnable(scoreResponse);
                  }
                }
              }
            }
          } else if (scoreResponse.SRFLAG == 'Y') {
            this.loadingService.globalLodingDismiss();
            this.srFlageEnable();
          }
        }
      } else {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert', scoreResponse.errorDesc);
      }
    });
  }

  reSubmitForautoApproval() {
    if (this.reqLoanAmount <= 150000) {
      this.autoApproval();
      this.reSubmitDone = 1;
      this.router.navigate(['/PostSanctionPage'], {
        queryParams: { viewData: this.userInfo },
        skipLocationChange: true,
        replaceUrl: true,
      });
    } else {
      console.log('Loan amt grater 1.5L');
    }
  }

  autoApprovalFlageEnable(scoreResponse: any) {
    this.checked = 'Y';
    if (this.scoreId == undefined || null) {
      this.sqliteProvider
        .addScoreCard(
          this.refId,
          'Y',
          scoreResponse.lookalikeScore || '',
          scoreResponse.ltvScore || '0',
          JSON.stringify(this.questionRes),
          scoreResponse.AutoApprovalFlag,
          scoreResponse.FIFLAG,
          scoreResponse.SRFLAG,
          scoreResponse.STPFLAG,
          scoreResponse.NTCFLAG
        )
        .then((data) => {
          this.scoreId = data['insertId'];
          this.getDetails();
        });
    } else {
      this.sqliteProvider
        .updateScoreCardinPostsanction('Y', this.refId, this.scoreId)
        .then((data) => {
          this.sqlSupport.updatePostSanctionAfterRerun(this.refId, this.id);
          this.getDetails();
        });
    }

    this.isAutoApprovalFlag = true;
    this.loadingService.globalLodingDismiss();
    this.alertService.showAlert('Your Score', 'is Eligible');
  }

  fiFlageEnble(scoreResponse: any) {
    this.checked = 'Y';
    this.fiFlage = 'Y';
    if (this.scoreId == undefined || null) {
      this.sqliteProvider
        .addScoreCard(
          this.refId,
          'Y',
          scoreResponse.lookalikeScore || '',
          scoreResponse.ltvScore || '0',
          JSON.stringify(this.questionRes),
          scoreResponse.AutoApprovalFlag,
          scoreResponse.FIFLAG,
          scoreResponse.SRFLAG,
          scoreResponse.STPFLAG,
          scoreResponse.NTCFLAG
        )
        .then((data) => {
          this.scoreId = data['insertId'];
          this.getDetails();
        });
    } else {
      this.sqliteProvider
        .updateScoreCardinPostsanction('Y', this.refId, this.scoreId)
        .then((data) => {
          this.sqlSupport.updatePostSanctionAfterRerun(this.refId, this.id);
          this.getDetails();
        });
    }
    this.isAutoApprovalFlag = false;
    this.loadingService.globalLodingDismiss();
    this.alertService.showAlert('Your Request', 'Move to Field Investigation');
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
                this.loadingService.globalLodingDismiss();
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
          this.loadingService.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      )
      .catch((err) => err);
  }

  fieldInvestigation() {
    this.loadingService.globalLodingPresent('Please wait...');
    let body = {
      userId: this.applicantDetails[0].createdUser,
      PropNo: this.applicantDetails[0].applicationNumber,
      // "nextFlowPoint": "109183",//109183uat 109191local
      nextFlowPoint: this.fieldInspecFlowGroup.flowPoint, //109183uat 109191local
      // "GroupId": "1556680"//1556680uat 1556675local
      GroupId: this.fieldInspecFlowGroup.UserGroup, //1556680uat 1556675local
    };

    this.master
      .restApiCallAngular('mobileWorkflow', body)
      .then(
        (res) => {
          let fieldInsRes = <any>res;
          if (fieldInsRes.ErrorCode === '000') {
            // this.sqlsupport.updateFieldInvestigationStatus(this.applicantDetails[0].applicationNumber, 'Y').then(data => {
            //   this.loadingService.globalLodingDismiss();
            //   this.navCtrl.push(ExistApplicationsPage)
            // })
            this.sqliteProvider
              .updateFIstatus(this.applicantDetails[0].applicationNumber, 'Y')
              .then((data) => {
                this.loadingService.globalLodingDismiss();
                this.router.navigate(['/ExistApplicationsPage'], {
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              });
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert', fieldInsRes.ErrorDesc);
          }
        },
        (err) => {
          this.loadingService.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      )
      .catch((err) => err);
  }

  scoreId: any;
  autoApproval() {
    this.loadingService.globalLodingPresent('Submitting for auto approval...');
    // setTimeout(() => {
    //   this.loadingService.globalLodingDismiss();

    //   this.alertService.showAlert('Alert', 'Network Error')
    // }, 2000);
    let data = {
      propNo: this.ScoreData.propNo,
      custId: this.ScoreData.custId,
      leadId: this.leadId,
      verifiedFlag: 'Y',
      userId: this.applicantDetails[0].createdUser, // "VLCRES1", // Automatic
      businessName: 'retail',
    };

    console.log(data);
    this.master.restApiCallAngular('autoapproval', data).then((res) => {
      let appData = <any>res;
      if (appData.errorCode === '000') {
        // sanction, emi
        let dd = this.today.getDate();
        let mm = this.today.getMonth() + 1; //January is 0!
        let yyyy = this.today.getFullYear();
        if (dd < 10) {
          dd = '0' + dd;
        }
        if (mm < 10) {
          mm = '0' + mm;
        }
        let approved = yyyy + '-' + mm + '-' + dd;
        this.approveDate = approved;
        console.log(this.approveDate);

        let chargesFormatValue = appData.sanctionAmt.toString().split('.');
        if (chargesFormatValue[1] <= '49') {
          this.sanctionedAmt = Math.floor(appData.sanctionAmt);
        } else {
          this.sanctionedAmt = Math.ceil(appData.sanctionAmt);
        }

        // let emiValue = appData.emi.toString().split(".");
        // if (emiValue[1] <= "49") {
        //   this.emi = Math.floor(appData.emi);
        // } else {
        //   this.emi = Math.ceil(appData.emi);
        // }
        // this.getEmiCalculation(this.sanctionedAmt).then(data=> {
        //   if(data) {
        this.applicantDetails[0].loanAmount = this.sanctionedAmt;
        this.getPddCharges(this.applicantDetails[0].janaLoan);
        // this.sanctionedAmt = Math.ceil(appData.sanctionAmt);
        // this.emi = appData.emi;
        this.autoApprovalMsg = appData;
        // this.isAutoApprovalFlag = false;

        // }
        // })
      } else {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert(
          'Alert',
          appData.errorDesc ? appData.errorDesc : appData.status
        );
      }
    });

    //psl
    // let body = {
    //   "PropNo": this.applicantDetails[0].applicationNumber,
    //   "userId": this.applicantDetails[0].createdUser,
    //   "flowType": "PS"
    // }
  }

  applicantDetails: any = [];
  reqLoanAmount;
  loadAllApplicantDetails() {
    this.sqliteProvider
      .getApplicantDataAfterSubmit(this.refId)
      .then(async (data) => {
        if (data.length > 0) {
          this.applicantDetails = [];
          this.applicantDetails = data;
          // if(this.reqLoanAmount == undefined || null){
          this.reqLoanAmount = data[0].loanAmount;
          this.reqLoanAmount = data[0].loanAmount;
          this.existVehicleType = data[0].vehicleType;
          this.houseOwned = data[0].resciStatus;
          this.scheme = await this.getJanaProductCode(data[0].janaLoan);
          if (this.scheme == '1060') {
            this.commonHimarkvalue = 650;
            this.commonLoanAmount = 75000;
          }
          // }
          this.sqliteProvider
            .getApplicantDataforPostSanction(this.userInfo.refId)
            .then((appdata) => {
              if (appdata.length > 0) {
                this.applicantDetails[0].onroadPrice = appdata[0].onroadPrice;
              }
            });

          // this.appStatId = data[0].statId;
          // this.id = data[0].id;
          // this.cibilScore = data[0].cibilScore;
          // this.showFooter = true;
          // this.getAppStatus();
          // this.getRequiredScore();
          // this.checkEligibile();
        } else {
          this.applicantDetails = [];
        }
        // this.id = data[0].id;
        // this.appCustId = data[0].LpCustid;
      })
      .catch((e) => {
        console.log('er' + e);
        this.applicantDetails = [];
      });
  }

  postSubmission() {
    this.loadingService.globalLodingPresent('Please wait...');
    // let body = {
    //   "PropNo": this.ScoreData.propNo,
    //   "userId": "VLCRES1",
    //   "flowType": "PS"
    // }
    let body = {
      userId: this.applicantDetails[0].createdUser,
      PropNo: this.applicantDetails[0].applicationNumber,
      // "nextFlowPoint": "109187",//109187uat 109198local
      nextFlowPoint: this.postSanctionFlowGroup.flowPoint, //109187uat 109198local
      // "GroupId": "1556687"//1556687uat 1556680local
      GroupId: this.postSanctionFlowGroup.UserGroup, //1556687uat 1556680local
    };
    this.master.restApiCallAngular('mobileWorkflow', body).then((res) => {
      let postSanctionRes = <any>res;
      if (postSanctionRes.ErrorCode === '000') {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert', postSanctionRes.ErrorDesc);
        this.sqlsupport
          .updatePostSanction(this.appStatId)
          .then((data) => {
            this.getDetails();
            this.router.navigate(['/ExistApplicationsPage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          })
          .catch((err) => err);
      } else {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert', postSanctionRes.ErrorDesc);
      }
    });
  }

  submitStat: any;
  appStatId: any;
  getAppStatus() {
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      // this.appCibilCheckStat = data[0].cibilCheckStat;
      this.submitStat = data[0].submitStat;
      this.appStatId = data[0].statId;
      // this.appCibilColor = data[0].cibilColor;
      // this.appCibilScore = data[0].cibilScore;
      // this.appHimarkCheckStat = data[0].himarkCheckStat;
    });
  }

  homePage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  meterLoader() {
    var self = this;
    var gauge = function (container, configuration) {
      var config = {
        size: 710,
        clipWidth: 200,
        clipHeight: 110,
        ringInset: 20,
        ringWidth: 20,

        pointerWidth: 10,
        pointerTailLength: 5,
        pointerHeadLengthPercent: 0.9,

        minValue: 0,
        maxValue: 10,

        minAngle: -90,
        maxAngle: 90,

        transitionMs: 750,

        majorTicks: 5,
        labelFormat: d3.format('d'),
        labelInset: 10,

        // arcColorFn: d3.scale.quantize().domain([0, 0.2, 0.4, 0.6, 0.8, 1]).range(['orange','red','green','blue', 'purple', 'pink'])

        arcColorFn: d3.interpolateHsl(d3.rgb('#80ba80'), d3.rgb('green')),
      };
      var range = undefined;
      var r = undefined;
      var pointerHeadLength = undefined;
      var value = 0;

      var svg = undefined;
      var arc = undefined;
      var scale = undefined;
      var ticks = undefined;
      var tickData = undefined;
      var pointer = undefined;

      var donut = d3.pie();

      function deg2rad(deg) {
        return (deg * Math.PI) / 180;
      }

      function newAngle(d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + ratio * range;
        return newAngle;
      }

      function configure(configuration) {
        var prop = undefined;
        for (prop in configuration) {
          config[prop] = configuration[prop];
        }

        range = config.maxAngle - config.minAngle;
        r = config.size / 2;
        pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

        // a linear scale this.gaugemap maps domain values to a percent from 0..1
        scale = d3
          .scaleLinear()
          .range([0, 1])
          .domain([config.minValue, config.maxValue]);

        ticks = scale.ticks(config.majorTicks);
        tickData = d3.range(config.majorTicks).map(function () {
          return 1 / config.majorTicks;
        });

        arc = d3
          .arc()
          .innerRadius(r - config.ringWidth - config.ringInset)
          .outerRadius(r - config.ringInset)
          .startAngle(function (d, i) {
            var ratio = d * i;
            return deg2rad(config.minAngle + ratio * range);
          })
          .endAngle(function (d, i) {
            var ratio = d * (i + 1);
            return deg2rad(config.minAngle + ratio * range);
          });
      }
      self.gaugemap.configure = configure;

      function centerTranslation() {
        return 'translate(' + r + ',' + r + ')';
      }

      function isRendered() {
        return svg !== undefined;
      }
      self.gaugemap.isRendered = isRendered;

      function render(newValue) {
        svg = d3
          .select(container)
          .append('svg:svg')
          .attr('class', 'gauge')
          .attr('width', config.clipWidth)
          .attr('height', config.clipHeight);

        var centerTx = centerTranslation();

        var arcs = svg
          .append('g')
          .attr('class', 'arc')
          .attr('transform', centerTx);

        var colors = [
          'rgb(224, 11, 11)',
          'rgb(224, 90, 11)',
          'rgb(255,165,0)',
          'rgb(91,141,0)',
          'rgb(0,100,0)',
        ];
        arcs
          .selectAll('path')
          .data(tickData)
          .enter()
          .append('path')
          .attr('fill', function (d, i) {
            return colors[i];
          })
          .attr('d', arc);

        // var lg = svg.append('g').attr('class', 'label').attr('transform', centerTx);
        // lg.selectAll('text').data(ticks).enter().append('text').attr('transform', function (d) {
        //     var ratio = scale(d);
        //     var newAngle = config.minAngle + (ratio * range);
        //     return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
        //   })
        //   .text(config.labelFormat);

        var lineData = [
          [config.pointerWidth / 2, 0],
          [0, -pointerHeadLength],
          [-(config.pointerWidth / 2), 0],
          [0, config.pointerTailLength],
          [config.pointerWidth / 2, 0],
        ];
        var pointerLine = d3.line().curve(d3.curveLinear);
        var pg = svg
          .append('g')
          .data([lineData])
          .attr('class', 'pointer')
          .attr('transform', centerTx);
        pointer = pg
          .append('path')
          .attr('d', pointerLine /*function(d) { return pointerLine(d) +'Z';}*/)
          .attr('transform', 'rotate(' + config.minAngle + ')');

        update(newValue === undefined ? 0 : newValue);
      }
      self.gaugemap.render = render;
      function update(newValue, newConfiguration?) {
        if (newConfiguration !== undefined) {
          configure(newConfiguration);
        }
        var ratio = scale(newValue);
        var newAngle = config.minAngle + ratio * range;
        pointer
          .transition()
          .duration(config.transitionMs)
          .ease(d3.easeElastic)
          .attr('transform', 'rotate(' + newAngle + ')');
      }
      self.gaugemap.update = update;

      configure(configuration);

      return self.gaugemap;
    };

    var powerGauge = gauge('#power-gauge', {
      size: 200,
      clipWidth: 200,
      clipHeight: 170,
      ringWidth: 80,
      maxValue: 100,
      transitionMs: 4000,
    });
    powerGauge.render(this.scoreValue);
  }

  counterScore() {
    console.log(this.scoreValue, 'score');
    console.log(typeof this.scoreValue, 'type');
    var i = this.scoreValue,
      j = 1;
    // var myinterval = setInterval(function () {
    //   document.getElementById("displayDiv").innerHTML = "" + j;
    //   if (j <= i - 1) {
    //     j++;
    //   }
    //   else {
    //     clearInterval(myinterval);
    //   }
    // }, 15);
  }

  getEmiCalculation(sanctionedAmt) {
    return new Promise((resolve, reject) => {
      this.sqliteProvider.getBasicDetails(this.refId, this.id).then((data) => {
        let preEmi = 0;
        if (data.length > 0) {
          if (data[0].preEmiDB == '1') {
            sanctionedAmt = +sanctionedAmt + +data[0].insPremium;
          } else {
            sanctionedAmt = +sanctionedAmt + +data[0].insPremium + preEmi;
          }
          if (
            data[0].tenure !== '' &&
            data[0].intRate !== '' &&
            sanctionedAmt
          ) {
            var Rate = +data[0].intRate / (12 * 100);
            //console.log("Rate  :"+Rate);
            var denominator = Math.pow(Rate + 1, +data[0].tenure) - 1;
            // console.log("denominator  :"+denominator);
            var Numerator = Rate * Math.pow(Rate + 1, +data[0].tenure);
            //console.log("Numerator  :"+Numerator);
            // var EMI = (Numerator / denominator) * (+this.basicData.get('loanAmount').value);
            var EMI = (Numerator / denominator) * +sanctionedAmt;
            //console.log("EMI  :"+EMI);

            let emiAmt;
            let EMIValue = EMI.toString().split('.');
            if (EMIValue[1] <= '49') {
              emiAmt = Math.floor(EMI);
            } else {
              emiAmt = Math.ceil(EMI);
            }
            this.emi = emiAmt;
            this.applicantDetails[0].emi = emiAmt;
            resolve(true);
            // this.basicData.get('emi').setValue(emiAmt);
            // this.basicData.get('emi').updateValueAndValidity();
          } else {
            this.emi = 0;
            this.applicantDetails[0].emi = 0;
            resolve(true);
            // this.basicData.get('emi').setValue(0);
            // this.basicData.get('emi').setValue("");
            // this.basicData.get('emi').updateValueAndValidity();
          }
        }
      });
    });
  }

  getPersonalInfo() {
    this.sqlsupport
      .getPrimaryApplicantName(this.refId, this.id)
      .then((data) => {
        this.personalData = data;
      });
  }

  async getPddCharges(prdCode) {
    try {
      let data = await this.sqlsupport.getProductValuesScheme(prdCode);
      this.pddchargeslist = data;
      // .then(data => {
      //   this.pddchargeslist = data;
      // })
      this.pddChargesCalc();
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  pddChargesCalc() {
    try {
      let loanAmt = +this.applicantDetails[0].loanAmount;
      let pddcharges = this.pddchargeslist.filter(
        (data) => +data.AmtFromRange < +loanAmt && +loanAmt < +data.AmtToRange
      );
      if (pddcharges.length > 0) {
        this.applicantDetails[0].pddCharges = pddcharges[0].PddCharges;
      } else {
        this.applicantDetails[0].pddCharges = 0;
      }
      this.getGstPddCharges();
      this.calcProcessFess();
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  getGstPddCharges() {
    try {
      let pddVal = this.applicantDetails[0].pddCharges;
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
        this.applicantDetails[0].gstonPddCharges = charges;
      } else {
        this.applicantDetails[0].gstonPddCharges = 0;
      }
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  getProcessingFees() {
    this.sqliteProvider.getProcessingFees().then((data) => {
      this.processFeesData = data;
    });
  }

  calcProcessFess() {
    try {
      let subProduct = this.applicantDetails[0].janaLoan;
      let loanAmt = +this.applicantDetails[0].loanAmount;
      // let subProduct = this.getBasicData[0].janaLoan.value;
      // let loanAmt = +this.getBasicData[0].loanAmount.value;
      if (loanAmt) {
        // let processAmtCheck = this.applicantDetails[0].processingFee;
        // if (!processAmtCheck) {
        let processFeesAmt = this.processFeesData.filter(
          (data) => data.prodId == subProduct
        );
        if (processFeesAmt.length > 0) {
          let proceesPercentage =
            loanAmt * (processFeesAmt[0].proPercentage / 100);
          if (+proceesPercentage <= +processFeesAmt[0].minProcessingFee) {
            this.applicantDetails[0].processingFee =
              +processFeesAmt[0].minProcessingFee;
          } else if (
            +proceesPercentage >= +processFeesAmt[0].maxProcessingFee
          ) {
            this.applicantDetails[0].processingFee =
              +processFeesAmt[0].maxProcessingFee;
          } else {
            this.applicantDetails[0].processingFee =
              +proceesPercentage.toFixed(2);
          }
          this.gstCallForPF();
          // } else {
          //   this.globalData.presentToastMiddle('Processing fees values not configured!');
          // }
        }
        this.loanAmtRoadPriceCheck();
      }
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  gstCallForPF() {
    try {
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
        this.applicantDetails[0].gstonPf = charges;
      } else {
        this.applicantDetails[0].gstonPf = 0;
      }
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  loanAmtRoadPriceCheck() {
    try {
      let onroad = +this.applicantDetails[0].onroadPrice;
      let loanAmt = +this.applicantDetails[0].loanAmount;
      if (onroad) {
        // if (onroad <= loanAmt) {
        //   this.basicData.controls.loanAmount.setValue('');
        //   this.basicData.controls.loanAmount.updateValueAndValidity();
        // } else {
        let marginCost = onroad - loanAmt;
        this.applicantDetails[0].margin = marginCost;
        // }
      }
      this.preEmiCalculation();
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  preEmiCalculation() {
    try {
      //  =IF(DAY(C2)>15, C4*(C26/365)*(EOMONTH(C2,0)-C2+5), 0) - Formula
      // C4 - Loan Amount
      // C26 - Interest Rate

      let loan = +this.applicantDetails[0].loanAmount;
      let intRate = +this.applicantDetails[0].intRate;
      let preEmiDate = this.applicantDetails[0].dbDate;
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
          // let preEmiValue = preEmi.toString().split(".");
          // if (preEmiValue[1] <= "49") {
          //   preEmiAmt = Math.floor(preEmi);
          // } else {
          //   preEmiAmt = Math.ceil(preEmi);
          // }
          this.applicantDetails[0].preEmi = 0;
        } else {
          this.applicantDetails[0].preEmi = 0;
        }
      } else {
        this.applicantDetails[0].preEmi = 0;
      }
      // this.basicData.controls.preEmi.updateValueAndValidity();
      this.lpiCalculation();
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  lpiCalculation() {
    try {
      let event = this.applicantDetails[0].tenure;
      let personDate = new Date(this.personalData[0].dob).getFullYear();
      let todayDate = new Date().getFullYear();
      let age = todayDate - personDate;
      let loanProduct;
      let loanfilterProduct;
      this.sqlsupport.getLoanProtectInsurance().then((data) => {
        if (data.length > 0) {
          loanfilterProduct = data.filter(
            (data) =>
              +data.lpifromtenure <= +event && +data.lpitotenure >= +event
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
            let loanamt = +this.applicantDetails[0].loanAmount;
            let preAmt = (loanamt * +loanProduct[0].lpimultiplier) / 1000;

            let lpiAmt;
            let chargesFormatValue = preAmt.toString().split('.');
            if (chargesFormatValue[1] <= '49') {
              lpiAmt = Math.floor(preAmt);
            } else {
              lpiAmt = Math.ceil(preAmt);
            }
            this.applicantDetails[0].insPremium = lpiAmt;
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

        this.insuranceLPICheck();
      });
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  insuranceLPICheck() {
    try {
      this.preEmiIncudeCheck(this.applicantDetails[0].preEmiDB);
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  preEmiIncudeCheck(event) {
    try {
      if (event == '1') {
        this.preEmiYesCalculation();
      } else if (event == '2') {
        this.preEmiNoCalculation();
      }
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  preEmiYesCalculation() {
    try {
      let loanAmt = +this.applicantDetails[0].loanAmount;
      let LPIAmt = +this.applicantDetails[0].insPremium;
      let advanceEmi = +this.applicantDetails[0].advanceEmi;
      let totalLoanAmt = loanAmt + LPIAmt - advanceEmi;
      if (totalLoanAmt) {
        this.applicantDetails[0].totalloanAmount = totalLoanAmt;
        this.emiCalculation();
      }
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  preEmiNoCalculation() {
    try {
      let loanAmt = +this.applicantDetails[0].loanAmount;
      let LPIAmt = +this.applicantDetails[0].insPremium;
      let advanceEmi = +this.applicantDetails[0].advanceEmi;
      let totalLoanAmt = loanAmt + LPIAmt - advanceEmi;
      if (totalLoanAmt) {
        this.applicantDetails[0].totalloanAmount = totalLoanAmt;
        this.emiCalculation();
      }
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  emiCalculation() {
    try {
      this.sqliteProvider.getBasicDetails(this.refId, this.id).then((data) => {
        let preEmi = 0;
        if (data.length > 0) {
          let sanctionedAmt;
          if (data[0].preEmiDB == '1') {
            sanctionedAmt =
              +this.applicantDetails[0].loanAmount +
              +this.applicantDetails[0].insPremium;
          } else {
            sanctionedAmt =
              +this.applicantDetails[0].loanAmount +
              +this.applicantDetails[0].insPremium +
              preEmi;
          }
          if (
            data[0].tenure !== '' &&
            data[0].intRate !== '' &&
            sanctionedAmt
          ) {
            var Rate = +data[0].intRate / (12 * 100);
            //console.log("Rate  :"+Rate);
            var denominator = Math.pow(Rate + 1, +data[0].tenure) - 1;
            // console.log("denominator  :"+denominator);
            var Numerator = Rate * Math.pow(Rate + 1, +data[0].tenure);
            //console.log("Numerator  :"+Numerator);
            // var EMI = (Numerator / denominator) * (+this.basicData.get('loanAmount').value);
            var EMI = (Numerator / denominator) * +sanctionedAmt;
            //console.log("EMI  :"+EMI);

            let emiAmt;
            let EMIValue = EMI.toString().split('.');
            if (EMIValue[1] <= '49') {
              emiAmt = Math.floor(EMI);
            } else {
              emiAmt = Math.ceil(EMI);
            }
            this.emi = emiAmt;
            this.applicantDetails[0].emi = emiAmt;
            // this.basicData.get('emi').setValue(emiAmt);
            // this.basicData.get('emi').updateValueAndValidity();
          } else {
            this.emi = 0;
            this.applicantDetails[0].emi = 0;
            // this.basicData.get('emi').setValue(0);
            // this.basicData.get('emi').setValue("");
            // this.basicData.get('emi').updateValueAndValidity();
          }
        }
        this.downPaymentCalc();
      });
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  downPaymentCalc() {
    try {
      // if(this.basicData.controls.preEmiDB.value == "") {
      //   this.alertService.showAlert('Alert!', 'PRE Emi included in DP');
      // } else {
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
      let advanceEmi = +this.applicantDetails[0].advanceEmi;
      let preEmi = 0;

      let marginCost = +this.applicantDetails[0].margin;

      let loanAmt = +this.applicantDetails[0].loanAmount;

      let charges;
      if (this.applicantDetails[0].preEmiDB == '1') {
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
          coBorHealthIns +
          preEmi;
      } else if (this.applicantDetails[0].preEmiDB == '2') {
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

      let chargesFormatValue = charges.toString().split('.');
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
      let dbAmt = loanAmt - processingFee - gstonPf - charges - advanceEmi;

      if (marginCost) {
        // let downPayment =  marginCost + processingFee + gstonPf + stampDuty + gstonSdc + nachCharges + gstonNach + pddCharges + gstonPddCharges + otherCharges + gstonOtherCharges + borHealthIns + coBorHealthIns+insPremium;
        // let downPayment = marginCost + charges;
        let downPayment =
          marginCost + processingFee + gstonPf + charges + advanceEmi;
        // this.vehicleDetails.controls.downpayment.setValue(Math.round(downPayment));
        this.applicantDetails[0].downpayment = downPayment;
        this.applicantDetails[0].totalDownPay = downPayment;
        this.applicantDetails[0].dbAmount = dbAmt;
      }
      // }
      this.loanFacilitiesServiceCall();
      console.log('app details', this.applicantDetails);
    } catch (error) {
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', JSON.stringify(error));
    }
  }

  loanFacilitiesServiceCall() {
    // this.globalData.globalLodingPresent('Please wait...');
    let body = {
      PropNo: this.applicantDetails[0].applicationNumber,
      UserID: this.applicantDetails[0].createdUser,
      LoanDetails: {
        ProductId: this.applicantDetails[0].janaLoan,
        LoanType: this.getLoanType(this.applicantDetails[0].janaLoan),
        // "LoanAmnt":this.applicantDetails[0].loanAmount,
        LoanAmnt: this.applicantDetails[0].loanAmount,
        IntType: this.applicantDetails[0].interest,
        LoanPurpose: this.applicantDetails[0].purpose,
        Tenor: this.applicantDetails[0].tenure,
        Installments: this.applicantDetails[0].installment,
        // "RecomLoanamt":this.applicantDetails[0].loanAmount,
        RecomLoanamt: this.applicantDetails[0].loanAmount,
        PeriodOfInstal: this.applicantDetails[0].installment,
        Refinance: this.applicantDetails[0].refinance,
        HolidayPeriod: this.applicantDetails[0].holiday,
        ModeofPayment: this.applicantDetails[0].repayMode,
        prdMainCat: this.applicantDetails[0].prdSche,
        prdSubCat: this.applicantDetails[0].janaLoan,
        IntRate: this.applicantDetails[0].intRate,
        Totaldownpay: this.applicantDetails[0].totalDownPay,
        Insurancepremium: this.applicantDetails[0].insPremium,
        DBAmount: this.applicantDetails[0].dbAmount,
        Vehicletype: this.applicantDetails[0].vehicleType,
        ElectricVehicle: this.applicantDetails[0].electricVehicle,
        MarginMoney: this.applicantDetails[0].margin,
        NachCharges: this.applicantDetails[0].nachCharges,
        PddCharges: this.applicantDetails[0].pddCharges,
        AdvanceEmiAmt: this.applicantDetails[0].advanceEmi,
        AdvInstallment: this.applicantDetails[0].advavceInst,
        SegmentType: this.applicantDetails[0].segmentType, // this.applicantDetails[0].segmentType
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

        DBdate: this.convertdate(this.applicantDetails[0].dbDate),
        PreEmiDB: this.applicantDetails[0].preEmiDB,
        TotalLoanAmt: this.applicantDetails[0].totalloanAmount,
      },
    };
    console.log('LoanDetails details', body);
    this.master
      .restApiCallAngular('LoanDetails', body)
      .then(
        (res) => {
          let loanFacilityRes = <any>res;
          if (loanFacilityRes.ErrorCode === '000') {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert',
              this.autoApprovalMsg.errorDesc
                ? this.autoApprovalMsg.errorDesc
                : this.autoApprovalMsg.status
            );
            // this.sqlSupport.updateSanctionedAmount(Math.ceil(appData.sanctionAmt),Math.ceil(appData.emi),this.applicantDetails[0].applicationNumber);
            this.sqlSupport.updateSanctionedAmount(
              this.sanctionedAmt,
              this.emi,
              this.applicantDetails[0].applicationNumber
            );
            this.sqlsupport
              .updateAutoApproval(this.appStatId)
              .then((data) => {
                this.getDetails();
              })
              .catch((err) => err);
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert', loanFacilityRes.ErrorDesc);
          }
        },
        (err) => {
          this.loadingService.globalLodingDismiss();
          if (err) {
            this.alertService.showAlert('Alert', err.message);
          } else {
            this.alertService.showAlert('Alert', 'No Response from Server!');
          }
        }
      )
      .catch((err) => err);
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

  convertdate(str: string) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('/');
  }

  getJanaProductCode(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    return selectedLoanName.prdSchemeCode;
  }
}
