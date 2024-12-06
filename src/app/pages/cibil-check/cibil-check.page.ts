import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  LoadingController,
  ModalController,
  NavController,
  NavParams,
} from '@ionic/angular';
import { VerifyOtpComponent } from 'src/app/components/verify-otp/verify-otp.component';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-cibil-check',
  templateUrl: './cibil-check.page.html',
  styleUrls: ['./cibil-check.page.scss'],
})
export class CibilCheckPage {
  coAppFlag: any;
  guaFlag: any;
  appLeadId: any;
  docs_master: any = [];
  docFinalReq: any = [];
  allKarzaData: any = [];
  submitData: any;
  scheme: any;
  pdt_master: any;
  CoappCibilDocs: any = [];
  GuaCibilDocs: any = [];
  AppCibilDocs: any = [];
  Guhimarkshow: any;
  himarkshow: any;
  gupassvalue: any;
  coapppassvalue: any;
  passvalue: any;
  guMandatory: any;
  coapplicantMandatory: any;
  applicantMandatory: any;
  userInfo: any;
  panNum: any;
  items: any;
  cibilCheckStat: any = 0;
  himarkCheckStat: any = 0;
  submitStat: any = 0;
  cibilGuaCheckStat: any = 0;
  himarkGuaCheckStat: any = 0;
  subId: any;
  custType: any;
  applicationNumber = 0;
  applicationStatus: any;

  cibilResult: any;
  GcibilScore: any;
  AcibilScore: any;
  RcibilScore: any;
  GcibilGuaScore: any;
  AcibilGuaScore: any;
  RcibilGuaScore: any;
  cibilShowResult: any;

  himarkScore: any;
  guhimarkScore: any;
  guaLen: any;
  coappLen: any;

  green: any;
  amber: any;
  red: any;
  guagreen: any;
  guaamber: any;
  guared: any;
  username: any;
  unique_id: any;
  addressData: any;
  refId: any;
  id: any;
  urlCheck: any;
  statId: any;
  GstatId: any;
  himarkResult: any;

  cibilCheckUrl: any;
  himarkUrl: any;

  guarantors: any;

  master_states: any;
  master_cities: any;
  docLength;
  uatLocalStat: boolean;
  coapplicants: any;
  proceedCoAppStatus = false;

  appJanaRefId: string = '';
  coappJanaRefId: string = '';
  guaJanaRefId: string = '';
  naveParamsValue: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HTTP,
    public globalData: DataPassingProviderService,
    public loadCtrl: LoadingController,
    public sqliteProvider: SqliteService,
    public globFunc: GlobalService,
    public network: Network,
    public master: RestService,
    public sqlSupport: SquliteSupportProviderService,
    public modalCtrl: ModalController,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public alertService: CustomAlertControlService
  ) {
    this.activatedRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.getProductValue();
    this.getKarzaDetails();
    this.getDocumentValue();
    this.urlCheck = this.globalData.urlEndPointStat;
    this.cibilCheckUrl = this.globalData.urlEndPoint + 'Cibil';
    this.himarkUrl = this.globalData.urlEndPoint + 'CBhimark';
    this.uatLocalStat = this.globalData.urlEndPointStat;

    this.cibilShowResult = false;
    this.userInfo = JSON.parse(this.naveParamsValue.viewData);
    this.username = this.globFunc.basicDec(localStorage.getItem('username'));
    this.panNum = this.userInfo.panNum;
    this.green = false;
    this.amber = false;
    this.red = false;
    this.unique_id = this.globalData.getUniqueId();

    this.refId = this.userInfo.refId;
    this.id = this.userInfo.id;
    this.custType = 'Promoter';

    this.loadGuaranDetails();
    // this.loadCoappDetails();
    this.loadAllApplicantDetails();
    this.getCityValue();
    this.getStateValue();
  }

  ionViewWillEnter() {
    this.getCibilCheckStatus();
    this.loadGuaranDetails();
    this.loadCoappDetails();
    // this.globFunc.statusbarValues();
  }

  homepage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  loadAllApplicantDetails() {
    this.sqliteProvider
      .getSubmitDataDetailsCibil(this.userInfo.refId)
      .then((data) => {
        this.items = [];
        this.items = data;
        this.coAppFlag = this.items[0].coAppFlag;
        this.guaFlag = this.items[0].guaFlag;
        this.scheme = this.getJanaProductCode(this.items[0].janaLoan);
        this.getApplicantDocs();
        this.getAppCibilCheckStatus();
        this.GetHimarkDocuments();
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  loadGuaranDetails() {
    this.sqliteProvider.getGuaranDetails(this.userInfo.refId).then((res) => {
      this.guarantors = [];
      this.guarantors = res;
      this.getGuaCibilCheckStatus();
      this.GetGuaHimarkDocs();
      if (this.guarantors.length == 0) {
        this.guaLen = false;
      } else {
        this.guaLen = true;
      }
    });
  }

  loadCoappDetails() {
    this.sqliteProvider.getCoappDetails(this.userInfo.refId).then((res) => {
      this.coapplicants = [];
      this.coapplicants = res;
      this.getCoappCibilCheckStatus(true);
      this.GetCoappHimarkDocs();
      if (this.coapplicants.length == 0) {
        this.coappLen = false;
      } else {
        this.coappLen = true;
      }
    });
  }

  getCibilCheckStatus() {
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      this.cibilCheckStat = data[0].cibilCheckStat;
      this.himarkCheckStat = data[0].himarkCheckStat;
      this.statId = data[0].statId;
      if (this.cibilCheckStat === '1') {
        if (data[0].cibilColor === 'Green') {
          this.green = true;
          this.GcibilScore = data[0].cibilScore;
        } else if (data[0].cibilColor === 'Amber') {
          this.amber = true;
          this.AcibilScore = data[0].cibilScore;
        } else if (data[0].cibilColor === 'Red') {
          this.red = true;
          this.RcibilScore = data[0].cibilScore;
        }
      }
      if (this.himarkCheckStat == '1') {
        this.himarkScore = data[0].himarkScore;
        this.himarkshow = true;
      }
      if (this.cibilCheckStat === '1' && this.himarkCheckStat == '1') {
        this.proceedNextPage(true);
      }
    });

    // this.proceedNextPage(true);
  }

  proceedNextPage(value) {
    if (value) {
      this.sqliteProvider.getCoappDetails(this.refId).then((coapp) => {
        if (coapp.length > 0) {
          if (this.coAppFlag == 'Y' && this.proceedCoAppStatus) {
            this.alertService
              .proccedOk('Alert', 'Proceed to Document details')
              .then((data) => {
                if (data == 'yes') {
                  this.router.navigate(['/DocumentUploadPage'], {
                    queryParams: { viewData: JSON.stringify(this.userInfo) },
                    skipLocationChange: true,
                    replaceUrl: true,
                  });
                }
              });
          }
        } else {
          this.alertService
            .proccedOk('Alert', 'Proceed to Document details')
            .then((data) => {
              if (data == 'yes') {
                this.router.navigate(['/DocumentUploadPage'], {
                  queryParams: { viewData: JSON.stringify(this.userInfo) },
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              }
            });
        }
      });
    }
    // if (this.coAppFlag == 'Y' && this.custType == 'CoApplicant' && this.proceedCoAppStatus) {
    //   this.globalData.proccedOk("Alert", "Proceed to Document details").then(data => {
    //     if (data == "yes") {
    //       this.globalData.setborrowerType('A');
    //       this.globalData.setrefId(this.refId);
    //       this.globalData.setId(this.id);
    //       this.globalData.setCoAppFlag(this.coAppFlag);
    //       this.globalData.setGuaFlag(this.guaFlag);
    //       this.navCtrl.push(DocumentUploadPage,{ viewData: this.userInfo });
    //     }
    //   });
    // }
    // } else if (this.coAppFlag == 'Y' && this.coapplicants.length <= 0) {
    //   this.globalData.proccedOk("Alert", "Proceed to Co-applicant details").then(data => {
    //     if (data == "yes") {
    //       this.globalData.setgId("");
    //       this.globalData.setrefId(this.refId);
    //       this.globalData.setId(this.id);
    //       this.navCtrl.push(ViewDetailsPage, { userVal: this.userInfo });
    //     }
    //   });
    // }
    // }
    //  else {
    //   this.globalData.proccedOk("Alert", "Proceed to CASA details").then(data => {
    //     if (data == "yes") {
    //       this.globalData.setborrowerType('A');
    //       this.globalData.setrefId(this.refId);
    //       this.globalData.setId(this.id);
    //       this.globalData.setCoAppFlag(this.coAppFlag);
    //       this.globalData.setGuaFlag(this.guaFlag);
    //       this.navCtrl.push(TabsPage);
    //     }
    //   });
    // }
  }

  getGuaCibilCheckStatus() {
    for (let i = 0; i < this.guarantors.length; i++) {
      this.sqliteProvider
        .getSubmitDetails(this.guarantors[i].refId, this.guarantors[i].id)
        .then((res) => {
          this.guarantors[i].cibilCheckStat = res[0].cibilCheckStat;
          this.guarantors[i].cibilScore = res[0].cibilScore;
          this.guarantors[i].cibilColor = res[0].cibilColor;
          this.guarantors[i].himarkScore = res[0].himarkScore;
          this.guarantors[i].himarkCheckStat = res[0].himarkCheckStat;
          this.guarantors[i].statId = res[0].statId;
        });
    }
  }
  getAppCibilCheckStatus() {
    for (let i = 0; i < this.items.length; i++) {
      this.sqliteProvider
        .getSubmitDetails(this.items[i].refId, this.items[i].id)
        .then((res) => {
          this.items[i].cibilCheckStat = res[0].cibilCheckStat;
          this.items[i].cibilScore = res[0].cibilScore;
          this.items[i].cibilColor = res[0].cibilColor;
          this.items[i].himarkScore = res[0].himarkScore;
          this.items[i].himarkCheckStat = res[0].himarkCheckStat;
          this.items[i].statId = res[0].statId;
        });
    }
  }

  getCoappCibilCheckStatus(value = true) {
    let coAppcibilStatus = '';
    let coAppHimarkStatus = '';
    for (let i = 0; i < this.coapplicants.length; i++) {
      this.sqliteProvider
        .getSubmitDetails(this.coapplicants[i].refId, this.coapplicants[i].id)
        .then((res) => {
          if (res.length > 0) {
            this.coapplicants[i].cibilCheckStat = res[0].cibilCheckStat;
            this.coapplicants[i].cibilScore = res[0].cibilScore;
            this.coapplicants[i].cibilColor = res[0].cibilColor;
            this.coapplicants[i].himarkScore = res[0].himarkScore;
            this.coapplicants[i].himarkCheckStat = res[0].himarkCheckStat;
            this.coapplicants[i].statId = res[0].statId;
            coAppcibilStatus = coAppcibilStatus + res[0].cibilCheckStat;
            coAppHimarkStatus = coAppHimarkStatus + res[0].himarkCheckStat;
            if (i == this.coapplicants.length - 1) {
              if (
                coAppcibilStatus.includes('0') ||
                coAppHimarkStatus.includes('0')
              ) {
                this.proceedCoAppStatus = false;
              } else {
                this.proceedCoAppStatus = true;
                this.proceedNextPage(value);
              }
            }
          }
        });
    }

    // this.proceedCoAppStatus = true;
    // this.proceedNextPage(value);
  }

  async checkHimark(value) {
    if (this.himarkCheckStat == '0') {
      if (this.network.type == 'none' || this.network.type == 'unknown') {
        this.alertService.showAlert(
          'Alert!',
          'Check your network data Connection'
        );
      } else {
        await this.otpVerify(value, 'A').then(async (data: any) => {
          if (data.data) {
            console.log('Alert', 'OTP Verified SucessFully');
            let loading = await this.loadCtrl.create({
              message: 'Please wait...',
            });
            loading.present();
            let body = {
              CBHimarkRequest: {
                AgentID: this.items[0].createdUser,
                clientName:
                  this.items[0].firstname.toUpperCase() +
                  ' ' +
                  this.items[0].lastname.toUpperCase(),
                memberID: this.items[0].coAppGuaId
                  ? this.items[0].coAppGuaId
                  : this.items[0].leadId,
                fatherName: this.items[0].fathername,
                SpouseName: '',
                MotherName: this.items[0].mothername,
                DOB: this.items[0].dob, //  "1999-12-16",
                loanAmountIndividual: this.items[0].loanAmount,
                mobileNo: this.globFunc.basicDec(this.items[0].mobNum),
                city: this.getCityName(
                  this.globFunc.basicDec(this.items[0].perm_cities)
                ),
                branchCode: this.items[0].loginBranch,
                regionCode: this.getStateName(
                  this.globFunc.basicDec(this.items[0].perm_states)
                ),
                productCode: this.items[0].janaLoan,
                pin: this.globFunc.basicDec(this.items[0].perm_pincode),
                applicationId: this.items[0].appUniqueId,
                doorNo: this.globFunc.basicDec(this.items[0].perm_plots),
                streetName: this.globFunc.basicDec(this.items[0].perm_locality),
                GENDER: this.items[0].gender,
                JanaReferenceID: this.appJanaRefId,
                IDType: this.AppCibilDocs,
                Module: 'VL',
              },
            };
            this.master.restApiCallAngular('CBhimark', body).then(
              (res) => {
                loading.dismiss();
                // (<any>res).CBHimarkResponse.statusCode = "SUCCESS";
                if (
                  (<any>res).CBHimarkResponse.statusCode.toUpperCase() ===
                  'SUCCESS'
                ) {
                  // this.himarkResult = {
                  //   memberID: '1637856118133',
                  //   Score: '0',
                  //   statusCode: 'SUCCESS',
                  //   statusDescription: 'Description'
                  // }
                  this.himarkResult = (<any>res).CBHimarkResponse;
                  if (this.scheme == '1052' || this.scheme == '1060') {
                    if (
                      +this.himarkResult.Score >= 21 &&
                      +this.himarkResult.Score < 650
                    ) {
                      this.rejectApplication();
                    } else {
                      let himarkstatus = '1';
                      this.sqliteProvider
                        .updateHimark(
                          this.himarkResult,
                          himarkstatus,
                          this.statId
                        )
                        .then((data) => {
                          this.sqliteProvider
                            .updateCibilSubmitDetails('1', this.statId)
                            .then((data) => {
                              this.alertService
                                .showAlert('Alert!', 'Hi-Mark Success!')
                                .then((data) => {
                                  this.getCibilCheckStatus();
                                });
                            });
                        })
                        .catch((Error) => {
                          console.log('Failed!');
                        });
                    }
                  } else {
                    let himarkstatus = '1';
                    this.sqliteProvider
                      .updateHimark(
                        this.himarkResult,
                        himarkstatus,
                        this.statId
                      )
                      .then((data) => {
                        this.sqliteProvider
                          .updateCibilSubmitDetails('1', this.statId)
                          .then((data) => {
                            this.alertService
                              .showAlert('Alert!', 'Hi-Mark Success!')
                              .then((data) => {
                                this.getCibilCheckStatus();
                              });
                          });
                      })
                      .catch((Error) => {
                        console.log('Failed!');
                      });
                  }
                } else {
                  if (this.uatLocalStat) {
                    this.himarkResult = {
                      memberID: 'HI1234',
                      Score: '150',
                      statusCode: 'SUCCESS',
                      statusDescription: 'Description',
                    };
                    let himarkstatus = '1';
                    this.sqliteProvider
                      .updateHimark(
                        this.himarkResult,
                        himarkstatus,
                        this.statId
                      )
                      .then((data) => {
                        this.sqliteProvider
                          .updateCibilSubmitDetails('1', this.statId)
                          .then((data) => {
                            this.alertService
                              .showAlert('Alert!', 'Hi-Mark Success!')
                              .then((data) => {
                                this.getCibilCheckStatus();
                              });
                          });
                      });
                  } else {
                    this.himarkResult = undefined;
                    this.alertService.showAlert(
                      'Alert!',
                      (<any>res).CBHimarkResponse.ErrorDetails[0]
                        ? (<any>res).CBHimarkResponse.ErrorDetails[0].errorDesc
                        : (<any>res).CBHimarkResponse.statusCode
                    );
                  }
                }
              },
              (err) => {
                loading.dismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'No Response from Server!'
                );
                // this.himarkResult = {
                //   memberID: '1637856118133',
                //   Score: '0',
                //   statusCode: 'SUCCESS',
                //   statusDescription: 'Description'
                // }
                // // this.himarkResult = (<any>res).CBHimarkResponse;
                // let himarkstatus = "1";
                // this.sqliteProvider.updateHimark(this.himarkResult, himarkstatus, this.statId).then(data => {
                //   this.alertService.showAlert("Alert!", "Hi-Mark Success!").then(data => {
                //     this.getCibilCheckStatus();
                //   });
                // }).catch(Error => {
                //   console.log("Failed!");
                // });
              }
            );
            // }
            // else {
            //   this.alertService.showAlert("Alert!", "Must Complete the CIBIL Process!");
            // }
          }
        });
      }
    } else {
      this.alertService.showAlert(
        'Alert!',
        'Already Applicant Hi-Mark Checked!'
      );
    }
  }

  async checkHimarkCoapplicant(coapp) {
    if (this.himarkGuaCheckStat == '0') {
      if (this.network.type == 'none' || this.network.type == 'unknown') {
        this.alertService.showAlert(
          'Alert!',
          'Check your network data Connection'
        );
      } else {
        await this.otpVerify(coapp, 'C').then(async (data) => {
          if (data) {
            console.log('Alert', 'OTP Verified SucessFully');
            let loading = await this.loadCtrl.create({
              message: 'Please wait...',
            });
            loading.present();
            let body = {
              CBHimarkRequest: {
                AgentID: this.items[0].createdUser,
                clientName: coapp.firstname + ' ' + coapp.lastname,
                memberID: coapp.coAppGuaId,
                fatherName: coapp.fathername,
                SpouseName: '',
                MotherName: coapp.mothername,
                DOB: coapp.dob, //  "1999-12-16",
                loanAmountIndividual: this.items[0].loanAmount,
                mobileNo: this.globFunc.basicDec(coapp.mobNum),
                city: this.getCityName(
                  this.globFunc.basicDec(coapp.perm_cities)
                ),
                branchCode: this.items[0].loginBranch,
                regionCode: this.getStateName(
                  this.globFunc.basicDec(coapp.perm_states)
                ),
                productCode: this.items[0].janaLoan,
                pin: this.globFunc.basicDec(coapp.perm_pincode),
                applicationId: this.items[0].appUniqueId,
                doorNo: this.globFunc.basicDec(coapp.perm_plots),
                streetName: this.globFunc.basicDec(coapp.perm_locality),
                GENDER: coapp.gender,
                JanaReferenceID: this.coappJanaRefId,
                IDType: this.CoappCibilDocs,
                Module: 'VL',
              },
            };
            this.master.restApiCallAngular('CBhimark', body).then(
              (res) => {
                loading.dismiss();
                if (
                  (<any>res).CBHimarkResponse.statusCode.toUpperCase() ==
                  'SUCCESS'
                ) {
                  this.himarkResult = (<any>res).CBHimarkResponse;
                  let himarkstatus = '1';
                  this.sqliteProvider
                    .updateHimark(this.himarkResult, himarkstatus, coapp.statId)
                    .then((data) => {
                      this.sqliteProvider
                        .updateCoCibilSubmitDetails('1', coapp.statId)
                        .then((data) => {
                          this.alertService
                            .showAlert('Alert!', 'Hi-Mark Success!')
                            .then((data) => {
                              this.getCoappCibilCheckStatus(true);
                            });
                        });
                    })
                    .catch((Error) => {
                      console.log('Failed!');
                    });
                } else {
                  if (this.uatLocalStat) {
                    this.himarkResult = {
                      memberID: 'HI1234',
                      Score: '150',
                      statusCode: 'SUCCESS',
                      statusDescription: 'Description',
                    };
                    let himarkstatus = '1';
                    this.sqliteProvider
                      .updateHimark(
                        this.himarkResult,
                        himarkstatus,
                        coapp.statId
                      )
                      .then((data) => {
                        this.sqliteProvider
                          .updateCoCibilSubmitDetails('1', coapp.statId)
                          .then((data) => {
                            this.alertService
                              .showAlert('Alert!', 'Hi-Mark Success!')
                              .then((data) => {
                                this.getCoappCibilCheckStatus(true);
                              });
                          });
                      });
                  } else {
                    this.himarkResult = undefined;
                    this.alertService.showAlert(
                      'Alert!',
                      (<any>res).CBHimarkResponse.ErrorDetails[0]
                        ? (<any>res).CBHimarkResponse.ErrorDetails[0].errorDesc
                        : (<any>res).CBHimarkResponse.statusCode
                    );
                  }
                }
              },
              (err) => {
                loading.dismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'No Response from Server!'
                );
              }
            );
            // }
            // else {
            //   this.alertService.showAlert("Alert!", "Must Complete the CIBIL Process!");
            // }
          }
        });
      }
    } else {
      this.alertService.showAlert(
        'Alert!',
        'Already Gurantor Hi-Mark Checked!'
      );
    }
  }

  async checkHimarkGuarantor(guarantor) {
    if (this.himarkGuaCheckStat == '0') {
      if (this.network.type == 'none' || this.network.type == 'unknown') {
        this.alertService.showAlert(
          'Alert!',
          'Check your network data Connection'
        );
      } else {
        await this.otpVerify(guarantor, 'G').then(async (data) => {
          if (data) {
            console.log('Alert', 'OTP Verified SucessFully');

            let loading = await this.loadCtrl.create({
              message: 'Please wait...',
            });
            loading.present();
            let body = {
              CBHimarkRequest: {
                AgentID: this.items[0].createdUser,
                clientName: guarantor.firstname + ' ' + guarantor.lastname,
                memberID: guarantor.coAppGuaId,
                fatherName: guarantor.fathername,
                SpouseName: '',
                MotherName: guarantor.mothername,
                DOB: guarantor.dob, //  "1999-12-16",
                loanAmountIndividual: this.items[0].loanAmount,
                mobileNo: this.globFunc.basicDec(guarantor.mobNum),
                city: this.getCityName(
                  this.globFunc.basicDec(guarantor.perm_cities)
                ),
                branchCode: this.items[0].loginBranch,
                regionCode: this.getStateName(
                  this.globFunc.basicDec(guarantor.perm_states)
                ),
                productCode: this.items[0].janaLoan,
                pin: this.globFunc.basicDec(guarantor.perm_pincode),
                applicationId: this.items[0].appUniqueId,
                doorNo: this.globFunc.basicDec(guarantor.perm_plots),
                streetName: this.globFunc.basicDec(guarantor.perm_locality),
                GENDER: guarantor.gender,
                JanaReferenceID: this.guaJanaRefId,
                IDType: this.GuaCibilDocs,
              },
            };
            this.master.restApiCallAngular('CBhimark', body).then(
              (res) => {
                loading.dismiss();
                if (
                  (<any>res).CBHimarkResponse.statusCode.toUpperCase() ==
                  'SUCCESS'
                ) {
                  this.himarkResult = (<any>res).CBHimarkResponse;
                  let himarkstatus = '1';
                  this.sqliteProvider
                    .updateHimark(
                      this.himarkResult,
                      himarkstatus,
                      guarantor.statId
                    )
                    .then((data) => {
                      this.sqliteProvider
                        .updateCoCibilSubmitDetails('1', guarantor.statId)
                        .then((data) => {
                          this.getGuaCibilCheckStatus();
                          this.alertService.showAlert(
                            'Alert!',
                            'Hi-Mark Success!'
                          );
                        });
                    })
                    .catch((Error) => {
                      console.log('Failed!');
                    });
                } else {
                  if (this.uatLocalStat) {
                    this.himarkResult = {
                      memberID: 'HI1234',
                      Score: '150',
                      statusCode: 'SUCCESS',
                      statusDescription: 'Description',
                    };
                    let himarkstatus = '1';
                    this.sqliteProvider
                      .updateHimark(
                        this.himarkResult,
                        himarkstatus,
                        guarantor.statId
                      )
                      .then((data) => {
                        this.getGuaCibilCheckStatus();
                        this.alertService.showAlert(
                          'Alert!',
                          'Hi-Mark Success!'
                        );
                      });
                  } else {
                    this.himarkResult = undefined;
                    this.alertService.showAlert(
                      'Alert!',
                      (<any>res).CBHimarkResponse.ErrorDetails[0].errorDesc
                    );
                  }
                }
              },
              (err) => {
                loading.dismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'No Response from Server!'
                );
              }
            );
            // }
            // else {
            //   this.alertService.showAlert("Alert!", "Must Complete the CIBIL Process!");
            // }
          }
        });
      }
    } else {
      this.alertService.showAlert(
        'Alert!',
        'Already Gurantor Hi-Mark Checked!'
      );
    }
  }

  cibilConcern(value) {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert!',
        'Kindly check your internet connection!!!'
      );
    } else {
      if (this.red) {
        this.alertService.showAlert(
          'Alert!',
          "CIBIL Score BAD, We can't proceed further!"
        );
      } else if (value.cibilCheckStat === '1') {
        this.alertService.showAlert(
          'Alert!',
          'Already Applicant Cibil Checked!'
        );
      } else {
        this.passvalue = value;
        this.docLength = 0;
        this.promoterDocumentchecking(this.docLength);
      }
    }
  }

  promoterDocumentchecking(i) {
    // if (i < this.coapplicantMandatory.length) {
    //   this.sqliteProvider.docPromoterCheck(this.id, this.coapplicantMandatory[i].ProofId).then(data => {
    //     if (data.length >= parseInt(this.coapplicantMandatory[i].ProofMandatory)) {
    //       this.docLength++;
    //       this.promoterDocumentchecking(this.docLength);
    //     }
    //     else {
    //       this.alertService.showAlert("Alert!", "Minimum " + parseInt(this.coapplicantMandatory[i].ProofMandatory) + " " + this.coapplicantMandatory[i].ProofName + " needed for Cibil Check in Applicant Kyc Documents..");
    //     }
    //   }).catch(Error => {
    //     console.log("Failed!");
    //   });
    // } else {
    this.docLength = 0;
    console.log(this.passvalue, 'before nav to otpconcern page');
    this.router.navigate(['/OtpConcernPage'], {
      queryParams: { applicant: this.passvalue, cbusertype: 'A' },
      skipLocationChange: true,
      replaceUrl: true,
    });
    // }
  }

  // cibilConcernGuarantor(value) {
  //   if (this.cibilGuaCheckStat === '1') {
  //     this.alertService.showAlert("Alert!", "Already Guarantor Cibil Checked!");
  //   }
  //   else {
  //     this.sqliteProvider.GetCbildocs(this.guarantors[0].id).then(data => {
  //       console.log("Cibil Data==>" + JSON.stringify(data));
  //       if (data.length >= 2) {
  //         this.navCtrl.push(OtpConcernPage, { gurantor: value, cbusertype: "G" });
  //       }
  //       else {
  //         this.alertService.showAlert("Alert!", "Minimum Two KYC Document with Cibil needed for Cibil Check.")
  //       }
  //     }).catch(Error => {
  //       console.log("Failed!");
  //       //this.showAlert("Alert!", "Failed!");
  //     });
  //   }
  // }

  cibilConcernCoapp(value) {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert!',
        'Kindly check your internet connection!!!'
      );
    } else {
      if (this.red) {
        this.alertService.showAlert(
          'Alert!',
          "CIBIL Score BAD, We can't proceed further!"
        );
      } else if (value.cibilCheckStat === '1') {
        this.alertService.showAlert(
          'Alert!',
          'Already Co-Applicant Cibil Checked!'
        );
      } else {
        this.sqliteProvider
          .getPromoterProofDetails(value.refId, value.id)
          .then((prof) => {
            if (prof.length > 0) {
              this.sqliteProvider
                .getPermanentAddress(value.refId, value.id)
                .then((perm) => {
                  if (perm.length > 0) {
                    this.sqliteProvider
                      .getPresentAddress(value.refId, value.id)
                      .then((pers) => {
                        if (pers.length > 0) {
                          this.sqliteProvider
                            .getBusinessAddress(value.refId, value.id)
                            .then((busi) => {
                              if (busi.length > 0) {
                                let manDocumentCount = 0;
                                let custType =
                                  this.globalData.getCustomerType();
                                this.sqlSupport
                                  .getBasicDetailsUserType(value.refId, 'A')
                                  .then((basic) => {
                                    if (basic) {
                                      // this.sqliteProvider.getProductValuesCount(localStorage.getItem('product')).then(data => {
                                      this.sqliteProvider
                                        .getProductValuesCount(
                                          basic[0].janaLoan
                                        )
                                        .then((data) => {
                                          if (data) {
                                            if (custType == '1') {
                                              if (value.userType == 'A') {
                                                manDocumentCount =
                                                  +data[0].prdAppDocCount;
                                              } else if (
                                                value.userType == 'G'
                                              ) {
                                                manDocumentCount =
                                                  +data[0].prdGuaDocCount;
                                              } else if (
                                                value.userType == 'C'
                                              ) {
                                                manDocumentCount =
                                                  +data[0].prdCoappDocCount;
                                              }
                                            } else {
                                              manDocumentCount =
                                                +data[0].prdEntityDocCount;
                                            }
                                            this.sqliteProvider
                                              .getPromoterProofDetails(
                                                value.refId,
                                                value.id
                                              )
                                              .then((data) => {
                                                if (
                                                  data.length >=
                                                  manDocumentCount
                                                ) {
                                                  this.passvalue = value;
                                                  this.coapppassvalue = value;
                                                  this.docLength = 0;
                                                  this.coappDocumentchecking(
                                                    this.docLength
                                                  );
                                                } else {
                                                  this.alertService.showAlert(
                                                    'Alert!',
                                                    'Please complete Co-Applicant Mandatory KYC Docs!'
                                                  );
                                                }
                                              });
                                          }
                                        });
                                    }
                                  });
                              } else {
                                this.alertService.showAlert(
                                  'Alert!',
                                  'Please complete Co-applicant Business Address'
                                );
                              }
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                        } else {
                          this.alertService.showAlert(
                            'Alert!',
                            'Please complete Co-applicant Present Address'
                          );
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  } else {
                    this.alertService.showAlert(
                      'Alert!',
                      'Please complete Co-applicant Permanent Address'
                    );
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              this.alertService.showAlert(
                'Alert!',
                'Please complete Co-applicant Proof Details'
              );
            }
          })
          .catch((err) => {
            console.log(err);
          });
        // this.passvalue = value;
        // this.coapppassvalue = value;
        // this.docLength = 0;
        // this.coappDocumentchecking(this.docLength);
      }
    }
  }

  coappDocumentchecking(i) {
    this.docLength = 0;
    this.router.navigate(['/OtpConcernPage'], {
      queryParams: { coapp: this.coapppassvalue, cbusertype: 'C' },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  cibilConcernGuarantor(value) {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert!',
        'Kindly check your internet connection!!!'
      );
    } else {
      if (this.red) {
        this.alertService.showAlert(
          'Alert!',
          "CIBIL Score BAD, We can't proceed further!"
        );
      } else if (value.cibilCheckStat === '1') {
        this.alertService.showAlert(
          'Alert!',
          'Already Guarantor Cibil Checked!'
        );
      } else {
        let manDocumentCount = 0;
        let custType = this.globalData.getCustomerType();

        this.sqlSupport
          .getBasicDetailsUserType(value.refId, 'A')
          .then((basic) => {
            if (basic) {
              // this.sqliteProvider.getProductValuesCount(localStorage.getItem('product')).then(data => {
              this.sqliteProvider
                .getProductValuesCount(basic[0].janaLoan)
                .then((data) => {
                  if (data) {
                    if (custType == '1') {
                      if (value.userType == 'A') {
                        manDocumentCount = +data[0].prdAppDocCount;
                      } else if (value.userType == 'G') {
                        manDocumentCount = +data[0].prdGuaDocCount;
                      } else if (value.userType == 'C') {
                        manDocumentCount = +data[0].prdCoappDocCount;
                      }
                    } else {
                      manDocumentCount = +data[0].prdEntityDocCount;
                    }
                    this.sqliteProvider
                      .getPromoterProofDetails(value.refId, value.id)
                      .then((data) => {
                        if (data.length >= manDocumentCount) {
                          this.passvalue = value;
                          this.gupassvalue = value;
                          this.docLength = 0;
                          this.gurantorDocumentchecking(this.docLength);
                        } else {
                          this.alertService.showAlert(
                            'Alert!',
                            'Please complete Guarantor Mandatory KYC Docs!'
                          );
                        }
                      });
                  }
                });
            }
          });
        // this.passvalue = value;
        // this.gupassvalue = value;
        // this.docLength = 0;
        // this.gurantorDocumentchecking(this.docLength);
      }
    }
  }

  gurantorDocumentchecking(i) {
    // if (this.cibilGuaCheckStat === '1') {
    //   this.alertService.showAlert("Alert!", "Already Guarantor Cibil Checked!");
    // }
    // else {
    //   if (i < this.guMandatory.length) {
    //     this.sqliteProvider.docPromoterCheck(this.guarantors[0].id, this.guMandatory[i].ProofId).then(data => {
    //       if (data.length >= parseInt(this.guMandatory[i].ProofMandatory)) {
    //         this.docLength++;
    //         this.gurantorDocumentchecking(this.docLength);
    //       }
    //       else {
    //         this.alertService.showAlert("Alert!", "Minimum " + parseInt(this.guMandatory[i].ProofMandatory) + " " + this.guMandatory[i].ProofName + " needed for Cibil Check in Gurantor Kyc Documents.");
    //       }
    //     }).catch(Error => {
    //       console.log("Failed!");
    //     });
    //   } else {
    this.docLength = 0;
    this.router.navigate(['/OtpConcernPage'], {
      queryParams: { gurantor: this.gupassvalue, cbusertype: 'G' },
      skipLocationChange: true,
      replaceUrl: true,
    });
    //   }

    // }
  }

  getStateValue() {
    this.sqliteProvider.getStateList().then((data) => {
      this.master_states = data;
    });
  }

  getCityValue() {
    this.sqliteProvider.getAllCityValues().then((data) => {
      this.master_cities = data;
    });
  }

  getStateName(value: string) {
    let selectedStateName = this.master_states.find((f) => {
      return f.stateCode === value;
    });
    return selectedStateName.stateName;
  }

  getCityName(value: string) {
    let selectedCityName = this.master_cities.find((f) => {
      return f.cityCode === value;
    });
    return selectedCityName.cityName;
  }

  GetHimarkDocuments() {
    // this.sqliteProvider.GetHimarkdocs(this.id).then(data => {
    //   this.CibilDocs = data;
    // }).catch(Error => {
    //   console.log("Failed!");
    // });

    this.sqliteProvider
      .GetCbildocs(this.id)
      .then((data) => {
        let details = [];
        let IDType = '';
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            if (this.getDocumentName(data[i].promoIDType) == 'PAN CARD') {
              // PAN CARD
              IDType = 'PAN';
            } else if (
              this.getDocumentName(data[i].promoIDType) == 'AADHAR' ||
              this.getDocumentName(data[i].promoIDType) == 'AADHAR CARD'
            ) {
              // aadhar
              //IDType = "ad"
              this.appJanaRefId = this.globFunc.basicDec(data[i].promoIDRef);
            } else if (
              this.getDocumentName(data[i].promoIDType) == 'PASSPORT'
            ) {
              // Passport
              IDType = 'PASS';
            } else if (
              this.getDocumentName(data[i].promoIDType) == 'VOTER ID'
            ) {
              //VOTER
              IDType = 'VOTER';
            } else if (
              this.getDocumentName(data[i].promoIDType) == 'DRIVING LICENSE'
            ) {
              // DL
              IDType = 'DRIV';
            } else {
              IDType = '07';
            }
            if (
              this.getDocumentName(data[i].promoIDType) != 'AADHAR' &&
              this.getDocumentName(data[i].promoIDType) != 'AADHAR CARD'
            ) {
              // aadhar
              let promoIdRef = data[i].promoIDRef;
              if (!promoIdRef.includes('MV_')) {
                promoIdRef = this.globFunc.basicEnc(data[i].promoIDRef);
              }

              details.push({
                type: IDType,
                value: this.globFunc.basicDec(promoIdRef),
              });
            }
            if (i == data.length - 1) {
              this.AppCibilDocs = details;
            }
          }
        }
      })
      .catch((Error) => {
        console.log('Failed!');
      });
  }

  GetGuaHimarkDocs() {
    // if (this.guarantors.length > 0) {
    //   this.sqliteProvider.GetHimarkdocs(this.guarantors[0].id).then(data => {
    //     this.GuaCibilDocs = data;
    //   }).catch(Error => {
    //     console.log("Failed!");
    //   });
    // }
    if (this.guarantors.length > 0) {
      this.sqliteProvider
        .GetCbildocs(this.guarantors[0].id)
        .then((data) => {
          let details = [];
          let IDType = '';
          if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              if (this.getDocumentName(data[i].promoIDType) == 'PAN CARD') {
                // PAN CARD
                IDType = 'PAN';
              } else if (
                this.getDocumentName(data[i].promoIDType) == 'AADHAR' ||
                this.getDocumentName(data[i].promoIDType) == 'AADHAR CARD'
              ) {
                // aadhar
                //IDType = "ad"
                this.guaJanaRefId = data[i].promoIDRef;
              } else if (
                this.getDocumentName(data[i].promoIDType) == 'PASSPORT'
              ) {
                // Passport
                IDType = 'PASS';
              } else if (
                this.getDocumentName(data[i].promoIDType) == 'VOTER ID'
              ) {
                //VOTER
                IDType = 'VOTER';
              } else if (
                this.getDocumentName(data[i].promoIDType) == 'DRIVING LICENSE'
              ) {
                // DL
                IDType = 'DRIV';
              } else {
                IDType = '07';
              }
              if (
                this.getDocumentName(data[i].promoIDType) != 'AADHAR' &&
                this.getDocumentName(data[i].promoIDType) != 'AADHAR CARD'
              ) {
                // aadhar
                let promoIdRef = data[i].promoIDRef;
                if (!promoIdRef.includes('MV_')) {
                  promoIdRef = this.globFunc.basicEnc(data[i].promoIDRef);
                }

                details.push({
                  type: IDType,
                  value: this.globFunc.basicDec(promoIdRef),
                });
              }
              if (i == data.length - 1) {
                this.GuaCibilDocs = details;
              }
            }
          }
        })
        .catch((Error) => {
          console.log('Failed!');
        });
    }
  }

  GetCoappHimarkDocs() {
    // if (this.guarantors.length > 0) {
    //   this.sqliteProvider.GetHimarkdocs(this.guarantors[0].id).then(data => {
    //     this.GuaCibilDocs = data;
    //   }).catch(Error => {
    //     console.log("Failed!");
    //   });
    // }
    if (this.coapplicants.length > 0) {
      this.sqliteProvider
        .GetCbildocs(this.coapplicants[0].id)
        .then((data) => {
          let details = [];
          let IDType = '';
          if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              if (this.getDocumentName(data[i].promoIDType) == 'PAN CARD') {
                // PAN CARD
                IDType = 'PAN';
              } else if (
                this.getDocumentName(data[i].promoIDType) == 'AADHAR' ||
                this.getDocumentName(data[i].promoIDType) == 'AADHAR CARD'
              ) {
                // aadhar
                //IDType = "ad"
                this.coappJanaRefId = this.globFunc.basicDec(
                  data[i].promoIDRef
                );
              } else if (
                this.getDocumentName(data[i].promoIDType) == 'PASSPORT'
              ) {
                // Passport
                IDType = 'PASS';
              } else if (
                this.getDocumentName(data[i].promoIDType) == 'VOTER ID'
              ) {
                //VOTER
                IDType = 'VOTER';
              } else if (
                this.getDocumentName(data[i].promoIDType) == 'DRIVING LICENSE'
              ) {
                // DL
                IDType = 'DRIV';
              } else {
                IDType = '07';
              }
              if (
                this.getDocumentName(data[i].promoIDType) != 'AADHAR' &&
                this.getDocumentName(data[i].promoIDType) != 'AADHAR CARD'
              ) {
                // aadhar
                let promoIdRef = data[i].promoIDRef;
                if (!promoIdRef.includes('MV_')) {
                  promoIdRef = this.globFunc.basicEnc(data[i].promoIDRef);
                }

                details.push({
                  type: IDType,
                  value: this.globFunc.basicDec(promoIdRef),
                });
              }
              if (i == data.length - 1) {
                this.CoappCibilDocs = details;
              }
            }
          }
        })
        .catch((Error) => {
          console.log('Failed!');
        });
    }
  }

  getJanaProductCode(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    return selectedLoanName.prdSchemeCode;
  }

  getProductValue() {
    this.sqliteProvider.getAllProductList().then((data) => {
      this.pdt_master = data;
    });
  }

  rejectApplication() {
    if (this.network.type === 'none') {
      this.alertService.showAlert(
        'Alert!',
        'Check your network data Connection'
      );
    } else {
      this.submitData = {
        LeadMain: {
          Lead: {
            SchemeCode: this.scheme,
            BranchCode: this.items[0].loginBranch,
            LoanAmt: this.items[0].loanAmount,
            LoginUserId: this.items[0].createdUser,
            Tenor: this.items[0].tenure,
            AppCreationdt:
              this.items[0].applDate.substring(0, 2) +
              '/' +
              this.items[0].applDate.substring(3, 5) +
              '/' +
              this.items[0].applDate.substring(6, 10),
            prd_code: this.items[0].janaLoan,
            source_branch: this.items[0].loginBranch,
            Module: 'VL',
            ApplicantDetails: [
              {
                Title: this.items[0].genTitle,
                Constitution: this.items[0].constitution,
                CustType: this.items[0].custType,
                FirstName: this.items[0].firstname,
                MiddleName: this.items[0].middlename,
                lastName: this.items[0].lastname,
                DOB:
                  this.items[0].dob.substring(8, 10) +
                  '/' +
                  this.items[0].dob.substring(5, 7) +
                  '/' +
                  this.items[0].dob.substring(0, 4),
                Gender: this.items[0].gender,
                FatherName: this.items[0].fathername,
                MotherMaidenName: this.items[0].mothername,
                MobileNo: this.globFunc.basicDec(this.items[0].mobNum),
                PANAvailable: this.items[0].panAvailable,
                PANNo: this.globFunc.basicDec(this.items[0].panNum),
                CustomerNameperKYC: '',
                EmploymentStatus: this.items[0].employment,
                ExperienceinYrs: this.items[0].experience,
                Caste: this.items[0].caste,
                Religion: this.items[0].religion,
                Education: this.items[0].education,
                MaritalStatus: this.items[0].marital,
                AppExistingUniquenum: this.items[0].URNnumber,
                AppImage: '',
                BusinessDescription: this.items[0].busiDesc,
                SourcingChannel: this.items[0].sourChannel,
                TypeofCase: this.items[0].typeCase,
                BalanceTransfer: this.items[0].balTrans,
                ExistingCustomer: this.items[0].custType == 'E' ? 'Y' : 'N',
                JanaRefID:
                  this.globFunc.basicDec(
                    this.getKarzaData(this.items[0].coAppGuaId, 'aadhaar')
                  ) || '',
                leadId: this.items[0].coAppGuaId,
                VoterId:
                  this.globFunc.basicDec(
                    this.getKarzaData(this.items[0].coAppGuaId, 'voterid')
                  ) || '',
                PassportNo:
                  this.globFunc.basicDec(
                    this.getKarzaData(this.items[0].coAppGuaId, 'passport')
                  ) || '',
                OtherIdType: '1',
                OtherIdvalue:
                  this.globFunc.basicDec(
                    this.getKarzaData(this.items[0].coAppGuaId, 'licence')
                  ) || '',
                OtherIdExpireDate: '20/09/2035',
                CustomerAddressDetails: [
                  {
                    AddressType: '1',
                    Address1: this.globFunc.basicDec(this.items[0].perm_plots),
                    Address2: this.globFunc.basicDec(
                      this.items[0].perm_locality
                    ),
                    Address3: '',
                    city: this.globFunc.basicDec(this.items[0].perm_cities),
                    State: this.globFunc.basicDec(this.items[0].perm_states),
                    pincode: this.globFunc.basicDec(this.items[0].perm_pincode),
                    landmark: this.items[0].perm_landmark,
                  },
                  {
                    AddressType: '2',
                    Address1: this.globFunc.basicDec(this.items[0].pres_plots),
                    Address2: this.globFunc.basicDec(
                      this.items[0].pres_locality
                    ),
                    Address3: '',
                    city: this.globFunc.basicDec(this.items[0].pres_cities),
                    State: this.globFunc.basicDec(this.items[0].pres_states),
                    pincode: this.globFunc.basicDec(this.items[0].pres_pincode),
                    landmark: this.items[0].perm_landmark,
                  },
                ],
              },
            ],
            CoApplicantDetails: [],
            GuarantorDetails: [],
            LoanDetails: {
              ProductId: this.items[0].janaLoan,
              LoanType: this.getLoanType(this.items[0].janaLoan),
              LoanAmnt: this.items[0].loanAmount,
              IntType: this.items[0].interest,
              LoanPurpose: this.items[0].purpose,
              Tenor: this.items[0].tenure,
              Installments: this.items[0].installment,
              RecomLoanamt: this.items[0].loanAmount,
              PeriodOfInstal: this.items[0].installment,
              Refinance: this.items[0].refinance,
              HolidayPeriod: this.items[0].holiday,
              ModeofPayment: this.items[0].repayMode,
              PMAYRequired: this.items[0].pmay,
              prdNature: '1',
              prdMainCat: this.items[0].prdSche,
              prdSubCat: this.items[0].janaLoan,
              IntRate: this.items[0].intRate,
            },
            DocumentList: this.docFinalReq,
          },
        },
      };
      this.master
        .restApiCallAngular('rejectleads', this.submitData)
        .then((res) => {
          if ((<any>res).ErrorCode == '000') {
            this.submitStat = 2;
            this.alertService.showAlert(
              'Alert!',
              'CIBIL Score is not valid! Application submitted successfully! Lead will be removed from the device'
            );

            this.router.navigate(['/JsfhomePage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Something went wrong! Try after sometime!'
            );
          }
        })
        .catch((cat) => {
          console.log(cat);
        });
    }
  }

  getKarzaDetails() {
    this.sqliteProvider.getGivenKarzaDetails().then((data) => {
      if (data.length > 0) {
        this.allKarzaData = [];
        this.allKarzaData = data;
      } else {
        this.allKarzaData = [];
      }
    });
  }

  getKarzaData(leadId, idType) {
    let idNumber;
    this.allKarzaData.find((f) => {
      if (f.leadId == leadId && f.idType == idType) {
        idNumber = f.idNumber;
      }
    });
    return idNumber;
  }
  getLoanType(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    return selectedLoanName.prdNature;
  }

  getApplicantDocs() {
    this.sqliteProvider
      .getPersonalDetails(this.items[0].refId, this.items[0].id)
      .then((data) => {
        if (data.length > 0) {
          this.appLeadId = data[0].coAppGuaId;
          this.sqliteProvider
            .getPromoterProofDetails(this.items[0].refId, this.items[0].id)
            .then((proof) => {
              if (proof.length > 0) {
                for (let i = 0; i < proof.length; i++) {
                  let docReq = {
                    DocId: proof[i].promoIDType,
                    Document: '',
                    leadID: this.appLeadId,
                    Mandatory: this.getMandatoryCheck(proof[i].promoIDType),
                    DocName:
                      'Img_' +
                      this.appLeadId +
                      '_' +
                      proof[i].promoIDType +
                      '_' +
                      i +
                      1 +
                      '.jpg',
                  };
                  this.docFinalReq.push(docReq);
                }
              }
            });
        }
      });
  }

  getMandatoryCheck(proodId) {
    let prdType = this.docs_master.find((f) => {
      return f.DocID === proodId;
    });
    return prdType.DocType;
  }

  getDocumentValue() {
    let prdCode = localStorage.getItem('product');
    let custType = this.globalData.getCustomerType();
    let entityStat;
    if (custType == '1') {
      entityStat = 'N';
      this.sqliteProvider
        .getDocumentsByIndividualPrdCode(prdCode, entityStat)
        .then((data) => {
          this.docs_master = data;
        });
    } else {
      entityStat = 'Y';
      this.sqliteProvider.getDocumentsByPrdCode(prdCode).then((data) => {
        this.docs_master = data;
      });
    }
  }

  getDocumentName(value: string) {
    let selectedDocName = this.docs_master.find((f) => {
      return f.DocID === value;
    });
    return selectedDocName.DocDesc.toUpperCase();
  }

  async otpVerify(value, applicantType) {
    try {
      return new Promise(async (resolve, reject) => {
        if (applicantType == 'A') {
          let model = await this.modalCtrl.create({
            component: VerifyOtpComponent,
            componentProps: {
              applicant: value,
              cbusertype: applicantType,
              showBackdrop: true,
              enableBackdropDismiss: true,
              cssClass: 'modalCss',
            },
          });
          model.onDidDismiss().then((data) => {
            if (data) {
              resolve(data);
            }
          });
          return model.present();
        } else if (applicantType == 'G') {
          let model = await this.modalCtrl.create({
            component: VerifyOtpComponent,
            componentProps: {
              gurantor: value,
              cbusertype: applicantType,
              showBackdrop: true,
              enableBackdropDismiss: true,
              cssClass: 'modalCss',
            },
          });
          model.onDidDismiss().then((data) => {
            if (data) {
              resolve(data);
            }
          });
          return model.present();
        } else if (applicantType == 'C') {
          let model = await this.modalCtrl.create({
            component: VerifyOtpComponent,
            componentProps: {
              coapp: value,
              cbusertype: applicantType,
              showBackdrop: true,
              enableBackdropDismiss: true,
              cssClass: 'modalCss',
            },
          });
          model.onDidDismiss().then((data) => {
            if (data) {
              resolve(data);
            }
          });
          return model.present();
        }
      }).catch((err) => {
        console.log(err, 'Verify OTP Function');
      });
    } catch (error) {
      console.log(error, 'VerifyOtp');

      // this.sqlSupport.insertErrorLog(error.stack, "PersonalComponent-openOTP");
    }
  }
}
