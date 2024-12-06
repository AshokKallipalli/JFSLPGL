import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  AlertController,
  LoadingController,
  NavController,
  NavParams,
  ToastController,
} from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-otp-concern',
  templateUrl: './otp-concern.page.html',
  styleUrls: ['./otp-concern.page.scss'],
})
export class OtpConcernPage {
  productCode: any;
  entitypic: any;
  promoterpic: any;
  submitData: any;
  checkOTP: boolean = false;
  smsbody: { SMS: { Request: { Mobile: any; OTP: any } } };
  guitems: any;
  cuitems: any;
  guarantors: any;
  cbusertype: any;
  message: any;
  refId: any;
  id: any;
  pdt_master = [];
  OTPNUM: any;
  enteredOTP: any;
  otpValue = 'I AGREE';
  otpCount = 0;
  verifiedMobNum: any = false;

  userInfo: any;
  items: any;
  username: any;

  green: any;
  amber: any;
  red: any;
  co_green: any;
  co_amber: any;
  co_red: any;

  guagreen: any;
  guaamber: any;
  guared: any;
  cibilResult: any;
  GcibilScore: any;
  AcibilScore: any;
  RcibilScore: any;
  GcibilGuaScore: any;
  AcibilGuaScore: any;
  RcibilGuaScore: any;
  GcibilCoAppScore: any;
  AcibilCoAppScore: any;
  RcibilCoAppScore: any;
  cibilShowResult: any;

  urlCheck: any;
  cibilCheckUrl: any;
  applicationStatus: any;
  applicationNumber = 0;
  cibilCheckStat: any = 0;
  submitStat: any = 0;
  cibilGuaCheckStat: any = 0;
  cibilCoappCheckStat: any = 0;
  statId: any;
  GstatId: any;
  CstatId: any;

  otpUrl: any;
  urlType: any;
  otpResult = undefined;

  CibilDocs = [];
  GuaCibilDocs = [];
  docs_master: any = [];
  coapp: any;

  janaRefId: string = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public network: Network,
    public http: HTTP,
    public loadCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public master: RestService,
    public router: Router,
    // public base64: Base64,
    public sqlSupport: SquliteSupportProviderService,
    private globFunc: GlobalService,
    public alertService: CustomAlertControlService
  ) {
    this.urlType = this.globalData.urlEndPointStat;
    this.otpUrl = this.globalData.urlEndPoint + 'Smsotp';
    this.urlCheck = this.globalData.urlEndPointStat;
    this.cibilCheckUrl = this.globalData.urlEndPoint + 'Cibil';
    this.green = false;
    this.amber = false;
    this.red = false;

    if (this.navParams.get('applicant')) {
      this.userInfo = this.navParams.get('applicant');
      console.log(this.userInfo, 'after nav to otp');
      this.refId = this.userInfo.refId;
      this.id = this.userInfo.id;
    }

    this.cbusertype = this.navParams.get('cbusertype');

    if (this.navParams.get('gurantor')) {
      this.guarantors = this.navParams.get('gurantor');
      this.refId = this.guarantors.refId;
      this.id = this.guarantors.id;
    }

    if (this.navParams.get('coapp')) {
      this.coapp = this.navParams.get('coapp');
      this.refId = this.coapp.refId;
      this.id = this.coapp.id;
    }

    // this.username = this.globalData.getusername();
    this.username = this.globFunc.basicDec(localStorage.getItem('username'));
    // this.getProductValue();
    // this.loadAllApplicantDetails();
    // this.getCibilCheckStatus();

    if (this.cbusertype == 'G') {
      this.getGurantorDetails();
      this.getGuaCibilCheckStatus();
      //this.GetGuCbilDocs();
    }

    if (this.cbusertype == 'C') {
      this.getCoappDetails();
      this.getCoappCibilCheckStatus();
    }
  }
  ionViewWillEnter() {
    this.getProductValue();
    this.loadAllApplicantDetails();
    this.getCibilCheckStatus();
  }

  loadAllApplicantDetails() {
    this.sqliteProvider
      .getSubmitDataDetailsCibil(this.refId)
      .then((data) => {
        this.items = [];
        this.items = data;
        this.productCode = this.getJanaProductCode(this.items[0].janaLoan);

        let custType = this.globalData.getCustomerType();
        let entityStat;
        if (custType == '1') {
          entityStat = 'N';
          this.sqliteProvider
            .getDocumentsByIndividualPrdCode(this.items[0].janaLoan, entityStat)
            .then((data) => {
              this.docs_master = data;
              this.GetCbilDocs();
            });
        } else {
          entityStat = 'Y';
          this.sqliteProvider
            .getDocumentsByPrdCode(this.items[0].janaLoan)
            .then((data) => {
              this.docs_master = data;
              this.GetCbilDocs();
            });
        }
        // this.sqliteProvider.getDocumentsByPrdCode(this.items[0].janaLoan, entityStat).then(data => {
        //   this.docs_master = data;
        //   this.GetCbilDocs();
        // });
        // this.base64.encodeFile(this.items[0].profPic).then((base64File: string) => {
        //   this.promoterpic = base64File.replace(/\n/g, '');
        // }, (err) => {
        //   console.log(err);
        // });

        // console.log("items: " + JSON.stringify(this.items));
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  getGurantorDetails() {
    this.sqliteProvider
      .getGuaranDetails(this.refId)
      .then((data) => {
        this.guitems = [];
        this.guitems = data;
      })
      .catch((e) => {
        console.log('er' + e);
        this.guitems = [];
      });
  }

  getCoappDetails() {
    this.sqliteProvider
      .getGuaranDetails(this.refId)
      .then((data) => {
        this.guitems = [];
        this.guitems = data;
      })
      .catch((e) => {
        console.log('er' + e);
        this.guitems = [];
      });
  }

  async cibilCheck() {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert!',
        'Please Check your Data Connection!'
      );
    } else {
      let loading = await this.loadCtrl.create({
        message: 'Please wait...',
      });
      loading.present();
      if (this.cibilCheckStat === '1') {
        loading.dismiss();
        this.green = true;
        this.GcibilScore = '750';
        this.alertService.showAlert('Alert!', 'Already Cibil Checked!');
      } else {
        let body = {
          CibilMobRequest: {
            memberReferenceNum: this.items[0].coAppGuaId
              ? this.items[0].coAppGuaId
              : this.items[0].leadId,
            enquiryAmount: this.items[0].loanAmount,
            FirstName: this.items[0].firstname,
            LastName: this.items[0].lastname,
            MidName: this.items[0].middlename,
            DOB:
              this.items[0].dob.substring(8, 10) +
              this.items[0].dob.substring(5, 7) +
              this.items[0].dob.substring(0, 4),
            gender: this.items[0].gender,
            branchCode: this.items[0].loginBranch,
            productCode: this.items[0].janaLoan,
            JanaReferenceID: this.janaRefId,
            IDSegment: this.CibilDocs,
            addressSegment: [
              {
                addressLine1: this.globFunc.basicDec(this.items[0].perm_plots),
                addressLine2: this.globFunc.basicDec(
                  this.items[0].perm_locality
                ),
                addressLine3: this.globFunc.basicDec(this.items[0].perm_cities),
                addressLine4: '',
                addressLine5: '',
                stateCode: this.globFunc.basicDec(this.items[0].perm_states),
                pinCode: this.globFunc.basicDec(this.items[0].perm_pincode),
                addressCategory: '04',
              },
            ],
            AgenID: this.items[0].createdUser,
            stateCode: this.globFunc.basicDec(this.items[0].perm_states),
          },
        };
        console.log(body, 'req body');
        console.log(this.items, 'items');
        console.log(this.CibilDocs, 'cibildocs for id segment');
        this.master.restApiCallAngular('Cibil', body).then(
          (res) => {
            loading.dismiss();
            if (!this.urlCheck) {
              if ((<any>res).CibilMobResponseType.statusCode == '000') {
                this.cibilResult = (<any>res).CibilMobResponseType;
                if (this.cibilResult.Color === 'Green') {
                  this.green = true;
                  this.GcibilScore = +this.cibilResult.Score;
                  this.cibilCheckStat = 1;
                  this.applicationStatus = 'Not';
                  this.sqliteProvider.updateSubmitDetails(
                    this.cibilCheckStat,
                    this.submitStat,
                    this.applicationNumber,
                    this.applicationStatus,
                    (<any>res).CibilMobResponseType.Color,
                    (<any>res).CibilMobResponseType.Score,
                    this.statId
                  );
                  this.message = 'Applicant Cibil Check Success!';
                  this.presentToast();
                  this.navCtrl.pop();
                } else if (this.cibilResult.Color === 'Amber') {
                  this.amber = true;
                  this.AcibilScore = +this.cibilResult.Score;
                  this.cibilCheckStat = 1;
                  this.applicationStatus = 'Not';
                  this.sqliteProvider.updateSubmitDetails(
                    this.cibilCheckStat,
                    this.submitStat,
                    this.applicationNumber,
                    this.applicationStatus,
                    (<any>res).CibilMobResponseType.Color,
                    (<any>res).CibilMobResponseType.Score,
                    this.statId
                  );
                  this.message = 'Applicant Cibil Check Success!';
                  this.presentToast();
                  this.navCtrl.pop();
                } else if (this.cibilResult.Color === 'Red') {
                  this.red = true;
                  this.RcibilScore = +this.cibilResult.Score;
                  this.cibilCheckStat = 1;
                  this.applicationStatus = 'Not';
                  this.sqliteProvider.updateSubmitDetails(
                    this.cibilCheckStat,
                    this.submitStat,
                    this.applicationNumber,
                    this.applicationStatus,
                    (<any>res).CibilMobResponseType.Color,
                    (<any>res).CibilMobResponseType.Score,
                    this.statId
                  );
                  this.message = 'Applicant Cibil Check Success!';
                  this.presentToast();
                  this.navCtrl.pop();
                }
              } else {
                this.cibilResult = undefined;
                this.green = false;
                this.amber = false;
                this.red = false;
                if ((<any>res).CibilMobResponseType.Color === '') {
                  this.GcibilScore = 'Not found';
                  this.AcibilScore = 'Not found';
                  this.RcibilScore = 'Not found';
                }
                console.log('Cibil Unsuccess Response: ' + JSON.stringify(res));
                this.alertService.showAlert(
                  'Alert!',
                  (<any>res).CibilMobResponseType.statusCode +
                    ': ' +
                    (<any>res).CibilMobResponseType.statusDescription
                );
              }
            } else {
              if (this.items[0].pres_plots === null) {
                this.alertService.showAlert(
                  'Alert!',
                  'Please add Address Details for the Applicant!'
                );
              } else if (this.cibilCheckStat === '0') {
                this.green = true;
                this.GcibilScore = '750';
                this.cibilCheckStat = 1;
                this.applicationStatus = 'Not';
                this.sqliteProvider.updateSubmitDetails(
                  this.cibilCheckStat,
                  this.submitStat,
                  this.applicationNumber,
                  this.applicationStatus,
                  'GREEN',
                  '750',
                  this.statId
                );
                //this.alertService.showAlert("Alert!", "Promoter Cibil Check Success1!");
                this.message = 'Applicant Cibil Check Success1!';
                this.presentToast();
                this.navCtrl.pop();
                this.getCibilCheckStatus();
              }
            }
          },
          (err) => {
            loading.dismiss();
            this.alertService.showAlert('Alert!', 'No Response from Server!');
          }
        );
      }
    }
  }

  getCibilCheckStatus() {
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      this.cibilCheckStat = data[0].cibilCheckStat;
      this.statId = data[0].statId;
      // console.log("cibil check: " + JSON.stringify(data));
      if (this.cibilCheckStat === '1') {
        this.green = true;
        this.GcibilScore = '750';
        // this.alertService.showAlert("Alert!", "Already Promoter Cibil Checked!");
      }
    });
  }

  async cibilCheckCoApplicant() {
    let guarantor = this.coapp;
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert!',
        'Please Check your Data Connection!'
      );
    } else {
      let loading = await this.loadCtrl.create({
        message: 'Please wait...',
      });
      loading.present();
      if (this.cibilGuaCheckStat === '1') {
        loading.dismiss();
        this.green = true;
        this.GcibilGuaScore = '750';
        this.alertService.showAlert('Alert!', 'Already Cibil Checked!');
      } else {
        let body = {
          CibilMobRequest: {
            memberReferenceNum: guarantor.coAppGuaId,
            enquiryAmount: this.items[0].loanAmount,
            FirstName: guarantor.firstname,
            LastName: '',
            MidName: guarantor.middlename,
            DOB:
              guarantor.dob.substring(8, 10) +
              guarantor.dob.substring(5, 7) +
              guarantor.dob.substring(0, 4),
            gender: guarantor.gender,
            branchCode: this.items[0].loginBranch,
            productCode: this.items[0].janaLoan,
            JanaReferenceID: this.janaRefId,
            IDSegment: this.CibilDocs,
            addressSegment: [
              {
                addressLine1: this.globFunc.basicDec(guarantor.perm_plots),
                addressLine2: this.globFunc.basicDec(guarantor.perm_locality),
                addressLine3: this.globFunc.basicDec(guarantor.perm_cities),
                addressLine4: '',
                addressLine5: '',
                stateCode: this.globFunc.basicDec(guarantor.perm_states),
                pinCode: this.globFunc.basicDec(guarantor.perm_pincode),
                addressCategory: '04',
              },
            ],
            AgenID: this.items[0].createdUser,
            stateCode: this.globFunc.basicDec(guarantor.perm_states),
          },
        };
        this.master.restApiCallAngular('Cibil', body).then(
          (res) => {
            loading.dismiss();
            if (!this.urlCheck) {
              (<any>res).CibilMobResponseType.statusCode = '000';
              (<any>res).CibilMobResponseType.Color = 'Green';
              (<any>res).CibilMobResponseType.Score = -1;
              if ((<any>res).CibilMobResponseType.statusCode === '000') {
                this.cibilResult = (<any>res).CibilMobResponseType;
                if ((<any>res).CibilMobResponseType.Color === 'Green') {
                  this.co_green = true;
                  this.GcibilCoAppScore = (<any>res).CibilMobResponseType.Score;
                  this.cibilCoappCheckStat = 1;
                  this.applicationStatus = 'Not';
                  this.sqliteProvider.updateSubmitDetails(
                    this.cibilCoappCheckStat,
                    this.submitStat,
                    this.applicationNumber,
                    this.applicationStatus,
                    (<any>res).CibilMobResponseType.Color,
                    (<any>res).CibilMobResponseType.Score,
                    this.CstatId
                  );
                } else if ((<any>res).CibilMobResponseType.Color === 'Amber') {
                  this.co_amber = true;
                  this.AcibilCoAppScore = (<any>res).CibilMobResponseType.Score;
                  this.cibilCoappCheckStat = 1;
                  this.applicationStatus = 'Not';
                  this.sqliteProvider.updateSubmitDetails(
                    this.cibilCoappCheckStat,
                    this.submitStat,
                    this.applicationNumber,
                    this.applicationStatus,
                    (<any>res).CibilMobResponseType.Color,
                    (<any>res).CibilMobResponseType.Score,
                    this.CstatId
                  );
                } else if ((<any>res).CibilMobResponseType.Color === 'Red') {
                  this.co_red = true;
                  this.RcibilCoAppScore = (<any>res).CibilMobResponseType.Score;
                  this.cibilCoappCheckStat = 1;
                  this.applicationStatus = 'Not';
                  this.sqliteProvider.updateSubmitDetails(
                    this.cibilCoappCheckStat,
                    this.submitStat,
                    this.applicationNumber,
                    this.applicationStatus,
                    (<any>res).CibilMobResponseType.Color,
                    (<any>res).CibilMobResponseType.Score,
                    this.CstatId
                  );
                }
                //this.alertService.showAlert("Alert!", "Guarantor Cibil Check Success!");
                this.message = 'Co-Applicant Cibil Check Success!';
                this.presentToast();
                this.navCtrl.pop();
              } else {
                this.cibilResult = undefined;
                this.guagreen = false;
                this.guaamber = false;
                this.guared = false;
                if ((<any>res).CibilMobResponseType.Color === '') {
                  this.GcibilCoAppScore = 'Not found';
                  this.AcibilCoAppScore = 'Not found';
                  this.RcibilCoAppScore = 'Not found';
                }
                console.log('Cibil Unsuccess Response: ' + JSON.stringify(res));
                this.alertService.showAlert(
                  'Alert!',
                  (<any>res).CibilMobResponseType.statusCode +
                    ': ' +
                    (<any>res).CibilMobResponseType.statusDescription
                );
              }
            } else {
              if (guarantor.address1 === null) {
                this.alertService.showAlert(
                  'Alert!',
                  'Please add Address Details for the Guarantor!'
                );
              } else if (this.cibilCoappCheckStat === '0') {
                this.guagreen = true;
                // this.GcibilGuaScore = '750';
                this.cibilCoappCheckStat = 1;
                this.applicationStatus = 'Not';
                this.sqliteProvider.updateSubmitDetails(
                  this.cibilCoappCheckStat,
                  this.submitStat,
                  this.applicationNumber,
                  this.applicationStatus,
                  'GREEN',
                  '750',
                  this.CstatId
                );
                //this.alertService.showAlert("Alert!", "Guarantor Cibil Check Success!");
                this.message = 'Guarantor Cibil Check Success!';
                this.presentToast();
                this.navCtrl.pop();
                this.getCoappCibilCheckStatus();
              }
            }
          },
          (err) => {
            loading.dismiss();
            this.alertService.showAlert('Alert!', 'No Response from Server!');
          }
        );
      }
    }
  }

  async cibilCheckGuarantor() {
    let guarantor = this.guarantors;
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert!',
        'Please Check your Data Connection!'
      );
    } else {
      let loading = await this.loadCtrl.create({
        message: 'Please wait...',
      });
      loading.present();
      if (this.cibilGuaCheckStat === '1') {
        loading.dismiss();
        this.green = true;
        this.GcibilGuaScore = '750';
        this.alertService.showAlert('Alert!', 'Already Cibil Checked!');
      } else {
        let body = {
          CibilMobRequest: {
            memberReferenceNum: guarantor.coAppGuaId,
            enquiryAmount: this.items[0].loanAmount,
            FirstName: guarantor.firstname,
            LastName: '',
            DOB:
              guarantor.dob.substring(8, 10) +
              guarantor.dob.substring(5, 7) +
              guarantor.dob.substring(0, 4),
            gender: guarantor.gender,
            branchCode: this.items[0].loginBranch,
            productCode: this.items[0].janaLoan,
            JanaReferenceID: this.janaRefId,
            IDSegment: this.CibilDocs,
            addressSegment: [
              {
                addressLine1: this.globFunc.basicDec(guarantor.perm_plots),
                addressLine2: this.globFunc.basicDec(guarantor.perm_locality),
                addressLine3: this.globFunc.basicDec(guarantor.perm_cities),
                addressLine4: '',
                addressLine5: '',
                stateCode: this.globFunc.basicDec(guarantor.perm_states),
                pinCode: this.globFunc.basicDec(guarantor.perm_pincode),
                addressCategory: '04',
              },
            ],
            AgenID: this.items[0].createdUser,
            stateCode: guarantor.perm_states,
          },
        };
        this.master.restApiCallAngular('Cibil', body).then(
          (res) => {
            loading.dismiss();
            if (!this.urlCheck) {
              if ((<any>res).CibilMobResponseType.statusCode === '000') {
                this.cibilResult = (<any>res).CibilMobResponseType;
                if ((<any>res).CibilMobResponseType.Color === 'Green') {
                  this.guagreen = true;
                  this.GcibilGuaScore = (<any>res).CibilMobResponseType.Score;
                  this.cibilGuaCheckStat = 1;
                  this.applicationStatus = 'Not';
                  this.sqliteProvider.updateSubmitDetails(
                    this.cibilGuaCheckStat,
                    this.submitStat,
                    this.applicationNumber,
                    this.applicationStatus,
                    (<any>res).CibilMobResponseType.Color,
                    (<any>res).CibilMobResponseType.Score,
                    this.GstatId
                  );
                } else if ((<any>res).CibilMobResponseType.Color === 'Amber') {
                  this.guaamber = true;
                  this.AcibilGuaScore = (<any>res).CibilMobResponseType.Score;
                  this.cibilGuaCheckStat = 1;
                  this.applicationStatus = 'Not';
                  this.sqliteProvider.updateSubmitDetails(
                    this.cibilGuaCheckStat,
                    this.submitStat,
                    this.applicationNumber,
                    this.applicationStatus,
                    (<any>res).CibilMobResponseType.Color,
                    (<any>res).CibilMobResponseType.Score,
                    this.GstatId
                  );
                } else if ((<any>res).CibilMobResponseType.Color === 'Red') {
                  this.guared = true;
                  this.RcibilGuaScore = (<any>res).CibilMobResponseType.Score;
                  this.cibilGuaCheckStat = 1;
                  this.applicationStatus = 'Not';
                  this.sqliteProvider.updateSubmitDetails(
                    this.cibilGuaCheckStat,
                    this.submitStat,
                    this.applicationNumber,
                    this.applicationStatus,
                    (<any>res).CibilMobResponseType.Color,
                    (<any>res).CibilMobResponseType.Score,
                    this.GstatId
                  );
                }
                //this.alertService.showAlert("Alert!", "Guarantor Cibil Check Success!");
                this.message = 'Guarantor Cibil Check Success!';
                this.presentToast();
                this.navCtrl.pop();
              } else {
                this.cibilResult = undefined;
                this.guagreen = false;
                this.guaamber = false;
                this.guared = false;
                if ((<any>res).CibilMobResponseType.Color === '') {
                  this.GcibilGuaScore = 'Not found';
                  this.AcibilGuaScore = 'Not found';
                  this.RcibilGuaScore = 'Not found';
                }
                console.log('Cibil Unsuccess Response: ' + JSON.stringify(res));
                this.alertService.showAlert(
                  'Alert!',
                  (<any>res).CibilMobResponseType.statusCode +
                    ': ' +
                    (<any>res).CibilMobResponseType.statusDescription
                );
              }
            } else {
              if (guarantor.address1 === null) {
                this.alertService.showAlert(
                  'Alert!',
                  'Please add Address Details for the Guarantor!'
                );
              } else if (this.cibilGuaCheckStat === '0') {
                this.guagreen = true;
                // this.GcibilGuaScore = '750';
                this.cibilGuaCheckStat = 1;
                this.applicationStatus = 'Not';
                this.sqliteProvider.updateSubmitDetails(
                  this.cibilGuaCheckStat,
                  this.submitStat,
                  this.applicationNumber,
                  this.applicationStatus,
                  'GREEN',
                  '750',
                  this.GstatId
                );
                //this.alertService.showAlert("Alert!", "Guarantor Cibil Check Success!");
                this.message = 'Guarantor Cibil Check Success!';
                this.presentToast();
                this.navCtrl.pop();
                this.getGuaCibilCheckStatus();
              }
            }
          },
          (err) => {
            loading.dismiss();
            this.alertService.showAlert('Alert!', 'No Response from Server!');
          }
        );
      }
    }
  }

  getGuaCibilCheckStatus() {
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((res) => {
      this.cibilGuaCheckStat = res[0].cibilCheckStat;
      this.GstatId = res[0].statId;
      if (this.cibilGuaCheckStat === '1') {
        this.guagreen = true;
        this.GcibilGuaScore = '750';
      }
    });
  }

  getCoappCibilCheckStatus() {
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((res) => {
      this.cibilCoappCheckStat = res[0].cibilCheckStat;
      this.CstatId = res[0].statId;
      if (this.cibilCoappCheckStat === '1') {
        this.guagreen = true;
        this.GcibilGuaScore = '750';
      }
    });
  }

  async sendSms() {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert!',
        'Please Check your Data Connection!'
      );
    } else {
      this.otpCount++;
      this.checkOTP = true;
      if (this.otpCount > 3) {
        this.alertService.showAlert('Alert!', 'Exceed the limit!');
      } else {
        let loading = await this.loadCtrl.create({
          message: 'Sending OTP...',
        });
        loading.present();
        this.OTPNUM = Math.floor(Math.random() * 900000) + 100000;
        console.log(this.OTPNUM);
        if (this.cbusertype == 'A') {
          this.smsbody = {
            SMS: {
              Request: {
                Mobile: this.globFunc.basicDec(this.items[0].mobNum),
                OTP:
                  'Your One Time Password for your loan application is ' +
                  this.OTPNUM +
                  '. Please do not share OTP with anyone - Jana Bank.',
              },
            },
          };
        } else if (this.cbusertype == 'G') {
          this.smsbody = {
            SMS: {
              Request: {
                Mobile: this.globFunc.basicDec(this.guarantors.mobNum),
                OTP:
                  'Your One Time Password for your loan application is ' +
                  this.OTPNUM +
                  '. Please do not share OTP with anyone - Jana Bank.',
              },
            },
          };
        } else if (this.cbusertype == 'C') {
          this.smsbody = {
            SMS: {
              Request: {
                Mobile: this.globFunc.basicDec(this.coapp.mobNum),
                OTP:
                  'Your One Time Password for your loan application is ' +
                  this.OTPNUM +
                  '. Please do not share OTP with anyone - Jana Bank.',
              },
            },
          };
        }
        this.master.restApiCallAngular('Smsotp', this.smsbody).then(
          (data) => {
            loading.dismiss();
            if (this.urlType) {
              this.otpResult = (<any>data).SMS.Response;
              this.verifiedMobNum = false;
              this.otpValue = 'RESEND OTP';
            } else {
              if ((<any>data).SMS.Response.statusCode === 'Success') {
                this.otpResult = (<any>data).SMS.Response;
                this.verifiedMobNum = false;
                this.otpValue = 'RESEND OTP';
                this.message = 'OTP Sent to Entered Mobile number Success!';
                this.presentToast();
              } else {
                this.verifiedMobNum = false;
                this.otpResult = undefined;
                this.alertService.showAlert(
                  'Alert!',
                  'Something went wrong! OTP not sent!'
                );
                // let statId;
                // if (this.cbusertype == "A") {
                //   statId = this.statId;
                // } else if (this.cbusertype == "G") {
                //   statId = this.GstatId;
                // }
                // this.sqliteProvider.updateSubmitDetails("1", "0", "0", "0", "GREEN", "700", this.statId);
                // this.alertService.showAlert("Alert!", "CIBIL check success!!");
                // this.navCtrl.pop();
              }
            }
          },
          (err) => {
            loading.dismiss();
            this.otpValue = 'RESEND OTP';
            this.alertService.showAlert('Alert!', 'No Response from Server!');
          }
        );
      }
    }
  }

  async presentPrompt() {
    let alert = await this.alertCtrl.create({
      header: 'OTP',
      message: 'Please Enter your OTP.',
      backdropDismiss: false,
      inputs: [
        {
          name: 'otpNumber',
          // id:'maxLength6',
          placeholder: 'OTP',
          type: 'tel',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (data) => {
            console.log('Cancel clicked');
          },
        },
        {
          text: 'Verify',
          handler: (data) => {
            this.OTPNUM = parseInt(this.OTPNUM);
            let value: any = parseInt(data.otpNumber);
            if (this.OTPNUM === value) {
              this.verifiedMobNum = true;
              this.message = 'Mobile Number verified Successfully!';
              this.presentToast();
              if (this.cbusertype == 'A') {
                this.cibilCheck();
              } else if (this.cbusertype == 'G') {
                this.cibilCheckGuarantor();
              } else if (this.cbusertype == 'C') {
                this.cibilCheckCoApplicant();
              }
            } else if (this.OTPNUM != value) {
              this.verifiedMobNum = false;
              this.enteredOTP = '';
              this.message = 'Please enter valid OTP!';
              this.presentToast();
              this.presentPrompt();
            } else if (value === '' || value === undefined || value === null) {
              this.verifiedMobNum = false;
              this.message = 'Please enter OTP!';
              this.presentToast();
            }
          },
        },
      ],
    });
    alert.present();
    //.then(result =>{document.getElementById('maxLength6').setAttribute('maxlength','6');});
  }

  async presentToast() {
    let toast = await this.toastCtrl.create({
      message: this.message,
      duration: 1000,
      position: 'top',
    });
    toast.present();
  }

  verifyOTP(val) {
    //  alert(value);
    //  this.OTPNUM = parseInt(this.OTPNUM);
    let value: any = parseInt(val);
    if (this.OTPNUM === value) {
      this.verifiedMobNum = true;
      this.message = 'Mobile Number verified Successfully!';
      this.presentToast();
      if (this.cbusertype == 'A') {
        this.cibilCheck();
      } else if (this.cbusertype == 'G') {
        this.cibilCheckGuarantor();
      } else if (this.cbusertype == 'C') {
        this.cibilCheckCoApplicant();
      }
    } else if (this.OTPNUM != value) {
      this.verifiedMobNum = false;
      this.enteredOTP = '';
      this.message = 'Please enter valid OTP!';
      this.presentToast();
      // this.presentPrompt();
    } else if (value === '' || value === undefined || value === null) {
      this.verifiedMobNum = false;
      this.message = 'Please enter OTP!';
      this.presentToast();
    }
  }

  GetCbilDocs() {
    this.sqliteProvider
      .GetCbildocs(this.id)
      .then((data) => {
        let details = [];
        let IDType = '';
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            if (this.getDocumentName(data[i].promoIDType) == 'PAN CARD') {
              // PAN CARD
              IDType = '01';
            } else if (
              this.getDocumentName(data[i].promoIDType) == 'AADHAR' ||
              this.getDocumentName(data[i].promoIDType) == 'AADHAR CARD'
            ) {
              // aadhar
              // IDType = ""
              this.janaRefId = this.globFunc.basicDec(data[i].promoIDRef);
            } else if (
              this.getDocumentName(data[i].promoIDType) == 'PASSPORT'
            ) {
              // Passport
              IDType = '02';
            } else if (
              this.getDocumentName(data[i].promoIDType) == 'VOTER ID'
            ) {
              //VOTER
              IDType = '03';
            } else if (
              this.getDocumentName(data[i].promoIDType) == 'DRIVING LICENSE'
            ) {
              // DL
              IDType = '04';
            } else {
              IDType = '07';
            }
            if (
              this.getDocumentName(data[i].promoIDType) != 'AADHAR' &&
              this.getDocumentName(data[i].promoIDType) != 'AADHAR CARD'
            ) {
              let promoIdRef = data[i].promoIDRef;
              if (!promoIdRef.includes('MV_')) {
                promoIdRef = this.globFunc.basicEnc(data[i].promoIDRef);
              }

              details.push({
                IDType: IDType,
                IDNumber: this.globFunc.basicDec(promoIdRef),
              });
            }
            if (i == data.length - 1) {
              this.CibilDocs = details;
            }
          }
        }
      })
      .catch((Error) => {
        console.log('Failed!');
        //this.showAlert("Alert!", "Failed!");
      });
  }

  getProductValue() {
    this.sqliteProvider.getAllProductList().then((data) => {
      this.pdt_master = data;
    });
  }

  getJanaProductCode(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    return selectedLoanName.prdSchemeCode;
  }

  rejectApplication() {
    this.submitData = {
      LeadMain: {
        Lead: {
          LeadId: this.items[0].appUniqueId,
          UniqueNumberEntity: this.items[0].applicantUniqueId,
          UniqueNumberPromo: this.items[0].coAppGuaId,
          UniqueNumberGua: '',
          SchemeCode: this.productCode,
          BranchCode: this.items[0].janaCenter,
          LoanAmt: this.items[0].loanAmount + '.00',
          LoginUserId: this.items[0].createdUser,
          Tenor: this.items[0].tenure,
          AppCreationdt:
            this.items[0].appRevd.substring(0, 2) +
            '/' +
            this.items[0].appRevd.substring(3, 5) +
            '/' +
            this.items[0].appRevd.substring(6, 10),
          NatureofEnterp: this.items[0].enterprise,
          IndustryTyp: this.items[0].industry,
          CurrentAcc: this.items[0].curAc,
          ApplicantDetails: [
            {
              Title: this.items[0].enTitle,
              NameofEnterprise: this.items[0].enterName,
              CustType: this.items[0].custType,
              Constitution: this.items[0].constitution,
              DateofInc:
                this.items[0].doi.substring(8, 10) +
                '/' +
                this.items[0].doi.substring(5, 7) +
                '/' +
                this.items[0].doi.substring(0, 4),
              NicCode: '', //this.items[0].nic
              OfficePremises: this.items[0].premises,
              YearsInCity:
                this.items[0].yrsCurBusiAddr +
                '~' +
                this.items[0].monCurBusiAddr,
              YearsAtBusiAddr: this.items[0].yrsCurBusiAddr,
              PreAddress1: this.items[0].enti_address1,
              PreAddress2: this.items[0].enti_address2,
              PreCity: this.items[0].enti_cities,
              PreState: this.items[0].enti_states,
              PrePinCode: this.items[0].enti_pincode,
              PreCountry: 'INDIA',
              PermAddress1: '',
              PermAddress2: '',
              PermCity: '',
              PermState: '',
              PermPinCode: '',
              PermCountry: '',
              MobileNo: '',
              AppExistingUniquenum: '',
              BusiRegnNum: this.items[0].busiRegNo,
              PreLandmark: this.items[0].enti_landmark,
              AppImage: this.entitypic,
            },
          ],
          CoApplicantDetails: [
            {
              CoappTitle: this.items[0].genTitle.toUpperCase(),
              CoappFirstName: this.items[0].firstname,
              CoappLastName: this.items[0].lastname,
              CoappnewCustType: this.items[0].promocustType,
              CoappMotherName: this.items[0].mothername,
              CoappGender: this.items[0].gender,
              CoappResiStat: this.items[0].resiStatus,
              CoappYearsResi: this.items[0].yrsCurResi,
              CoappYearsCity: this.items[0].resi_yrsCurCity,
              CoappMarStat: this.items[0].marital,
              CoappPan: this.globFunc.basicDec(this.items[0].panNum),
              CoappForm60: '',
              CoappPreAddr1: this.globFunc.basicDec(this.items[0].address1),
              CoappPreAddr2: this.globFunc.basicDec(this.items[0].address2),
              CoappPreCity: this.globFunc.basicDec(this.items[0].cities),
              CoappPreCountry: this.items[0].countries,
              CoappPermAddr1: this.items[0].busi_address1,
              CoappPermAddr2: this.items[0].busi_address2,
              CoappPermCity: this.items[0].busi_cities,
              CoappPermCountry: this.items[0].busi_countries,
              CoappMobileNum: this.globFunc.basicDec(this.items[0].mobNum),
              CoappEmpStatus: this.items[0].employment,
              CoappExpYears: this.items[0].experience,
              CoappJobTyp: '',
              CoappCaste: this.items[0].caste,
              CoappEduQuali: this.items[0].education,
              CoappRelation: '',
              CoapplfatName: this.items[0].fathername,
              //"DobCoapp": this.items[0].dob.substring(0, 2) + "/" + this.items[0].dob.substring(2, 4) + "/" + this.items[0].dob.substring(4, 8),
              DobCoapp:
                this.items[0].dob.substring(8, 10) +
                '/' +
                this.items[0].dob.substring(5, 7) +
                '/' +
                this.items[0].dob.substring(0, 4),
              CoappPreState: this.items[0].states,
              CoappPrePin: this.items[0].pincode,
              CoappPermState: this.items[0].busi_states,
              CoappPermPin: this.items[0].busi_pincode,
              CoappRelig: this.items[0].religion,
              CoappConstitution: this.items[0].promoconstitution,
              CoappExistingUniquenum: this.items[0].URNnumber,
              CoappImage: this.promoterpic,
              CoappEkycAddr1: this.items[0].per_address1,
              CoappEkycAddr2: this.items[0].per_address2,
              CoappEkycCity: this.items[0].per_cities,
              CoappEkycState: this.items[0].per_states,
              CoappEkycPin: this.items[0].per_pincode,
              CoappEkycCountry: this.items[0].per_countries,
            },
          ],
          LoanDetails: [
            {
              Product: this.items[0].janaLoan,
              LoanType: this.items[0].janaLoanName,
              LoanAmnt: this.items[0].loanAmount,
              IntType: this.items[0].interest,
              LoanPurpose: this.items[0].purpose,
              Tenor: this.items[0].tenure,
              RecomLoanamt: this.items[0].loanAmountTo,
              DocFee: '00',
              ProcFee: '00',
              PeriodOfInsta: this.items[0].installment,
              RepayType: this.items[0].repayMode,
            },
          ],
        },
      },
    };
    this.master
      .restApiCallAngular('RejectedLeads', this.submitData)
      .then((res) => {
        if ((<any>res).ErrorCode == '000') {
          this.submitStat = 2;
          // this.sqliteProvider.updateSubmitDetails(this.cibilCheckStat, this.submitStat, this.applicationNumber, this.applicationStatus, this.cibilResult.Color, this.cibilResult.Score, this.statId);
          this.alertService.showAlert(
            'Alert!',
            'CIBIL Score is not valid! Application submitted successfully! Lead will be removed from the device'
          );
          this.sqlSupport.deleteApplicantDetails(this.items[0].refId);
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
      });
  }

  getDocumentName(value: string) {
    let selectedDocName = this.docs_master.find((f) => {
      return f.DocID === value;
    });
    return selectedDocName.DocDesc.toUpperCase();
  }
}
