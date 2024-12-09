import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  LoadingController,
  MenuController,
  ModalController,
  NavController,
  NavParams,
  ToastController,
} from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent {
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
  beforeverify: boolean = false;

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

  OTP: any = {
    first: '',
    second: '',
    third: '',
    forth: '',
    fifth: '',
    sixth: '',
  };

  constructor(
    public navCtrl: NavController,
    public router: Router,
    public navParams: NavParams,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public network: Network,
    public http: HTTP,
    public loadCtrl: LoadingController,
    public toastCtrl: ToastController,
    public master: RestService,
    // public base64: Base64,
    public sqlSupport: SquliteSupportProviderService,
    private globFunc: GlobalService,
    public modalCtrl: ModalController,
    public alertService: CustomAlertControlService
  ) {
    this.urlType = environment.apiURL;
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
    this.username = this.globFunc.basicDec(localStorage.getItem('username'));
  }
  ionViewWillEnter() {
    this.getProductValue();
    this.loadAllApplicantDetails();
    // this.getCibilCheckStatus();
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
              // this.GetCbilDocs();
            });
        } else {
          entityStat = 'Y';
          this.sqliteProvider
            .getDocumentsByPrdCode(this.items[0].janaLoan)
            .then((data) => {
              this.docs_master = data;
              // this.GetCbilDocs();
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
            this.beforeverify = true;
            if (this.urlType) {
              this.otpResult = (<any>data).SMS.Response;
              // this.verifiedMobNum = false;
              this.otpValue = 'RESEND OTP';
            } else {
              if ((<any>data).SMS.Response.statusCode === 'Success') {
                this.otpResult = (<any>data).SMS.Response;
                // this.verifiedMobNum = false;
                this.otpValue = 'RESEND OTP';
                this.message = 'OTP Sent to Entered Mobile number Success!';
                this.presentToast();
              } else {
                // this.verifiedMobNum = false;
                this.otpResult = undefined;
                this.alertService.showAlert(
                  'Alert!',
                  'Something went wrong! OTP not sent!'
                );
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

  verifyOTP(val) {
    // let receivedOTP = Object.values(val).join('');
    let value: any = parseInt(val);
    // if(+receivedOTP.length<6){
    //   this.alertService.showAlert("Alert", "Please enter full OTP number!");
    // }else{
    if (this.OTPNUM === value) {
      this.verifiedMobNum = true;
      this.message = 'Mobile Number verified Successfully!';
      this.presentToast();
      this.modalCtrl.dismiss('true');
    } else if (this.OTPNUM != value) {
      this.verifiedMobNum = false;
      this.enteredOTP = '';
      this.message = 'Please enter valid OTP!';
      this.presentToast();
    } else if (value === '' || value === undefined || value === null) {
      this.verifiedMobNum = false;
      this.message = 'Please enter OTP!';
      this.presentToast();
    }
    // }
  }

  otpController(event, next, prev, index) {
    if (index == 6) {
      console.log('submit');
    }
    if (event.target.value.length < 1 && prev) {
      prev.setFocus();
    } else if (next && event.target.value.length > 0) {
      next.setFocus();
    } else {
      return 0;
    }
  }

  async presentToast() {
    let toast = await this.toastCtrl.create({
      message: this.message,
      duration: 1000,
      position: 'top',
    });
    toast.present();
  }
}
