import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavParams,
  Platform,
} from '@ionic/angular';
import * as moment from 'moment';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { KarzaDetailsPage } from '../karza-details/karza-details.page';
import * as X2JS from 'x2js';
import { BioNavigatorService } from 'src/providers/BioMetricPlugin/bio-navigator.service';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
declare var EsysRDService;
declare var MantraRDService;
var capturexml = '';

@Component({
  selector: 'app-fingerprint',
  templateUrl: './fingerprint.page.html',
  styleUrls: ['./fingerprint.page.scss'],
})
export class FingerprintPage implements OnInit {
  public sigshow = true;
  aadharNum: any;
  ekycUrl: any;
  BTName: string;
  BTAddress: string;
  deviceCode: any;
  _timeout = 30000;
  _pidVersion = '2.0';
  format = 0;
  _fType = 2; // Prod & PreProd
  _fCoutn = 1;
  // _iCount = "";          //L1Device
  // _iType = "";           //L1Device
  _environment = 'PP'; //PROD, L1Device
  // _environment = "PP";      //UAT, L1Device
  _demotag = '';
  _bluetoothConnection = 'N';
  _btName = '';
  _dmac = '';
  _wadh = 'E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=';
  _otp = '';
  _pidOptionsXML: any;
  loading: any;

  curDateTime = moment().format();
  customPopoverOptions = {
    cssClass: 'custom-popover',
  };
  selectOptions = {
    cssClass: 'remove-ok',
  };
  divColor1: string = '#da107e';
  divColor2: string = '#da107e';
  divColor3: string = '#da107e';
  divColor4: string = '#da107e';
  divColor5: string = '#da107e';
  divColor6: string = '#da107e';
  divColor7: string = '#da107e';
  divColor8: string = '#da107e';
  divColor9: string = '#da107e';
  divColor10: string = '#da107e';

  fingerbutton1 = false;
  fingerbutton2 = false;
  fingerbutton3 = false;
  fingerbutton4 = false;
  fingerbutton5 = false;
  fingerbutton6 = false;
  fingerbutton7 = false;
  fingerbutton8 = false;
  fingerbutton9 = false;
  fingerbutton10 = false;

  leadId: any;
  idType: any;
  leadStatus: any;

  OTP: any = {
    first: '',
    second: '',
    third: '',
    forth: '',
    fifth: '',
    sixth: '',
  };
  mobileNo: any;
  OTPNUM: any;
  otpCheckEnable: boolean = false;
  randomDataRefNumber: number;

  otpEnable: boolean = false;
  bioEnable: boolean = false;
  janaid: any;
  secKyc = false;
  existAather: boolean;
  deviceCodeBio: string;
  hideNum: string;
  aepsStatus: string;
  bio_master: any[] = [];
  selectedDeviceName: string = '';
  constructor(
    // public ionicApp: IonicApp,
    public router: Router,
    public network: Network,
    public route: ActivatedRoute,
    public platform: Platform,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    // public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public http: HttpClient,
    public globalData: DataPassingProviderService,
    public globFunc: GlobalService,
    public masterProvider: RestService,
    public sqlSupport: SquliteSupportProviderService,
    public navParams: NavParams,
    public bioMetricService: BioNavigatorService,
    public actionSheetCtrl: ActionSheetController,
    public alertService: CustomAlertControlService
  ) {
    this.ekycUrl = this.globalData.urlEndPoint + 'Ekyc';
    if (this.navParams.get('second') == true) {
      this.aadharNum = this.navParams.get('idNumber');
      this.leadId = this.navParams.get('leadId');
      this.idType = this.navParams.get('idType');
      this.aepsStatus = this.navParams.get('aepsStatus');
      this.leadStatus = this.navParams.get('leadStatus');
      this.secKyc = this.navParams.get('second');
      this.existAather = this.navParams.get('existAather');
      this.janaid = this.navParams.get('janaId');
    } else {
      this.aadharNum = this.route.snapshot.queryParamMap.get('idNumber');
      this.leadId = this.route.snapshot.queryParamMap.get('leadId');
      this.idType = this.route.snapshot.queryParamMap.get('idType');
      this.aepsStatus = this.route.snapshot.queryParamMap.get('aepsStatus');
      this.leadStatus = this.route.snapshot.queryParamMap.get('leadStatus');
      this.secKyc = JSON.parse(this.route.snapshot.queryParamMap.get('second'));
      this.existAather = JSON.parse(
        this.route.snapshot.queryParamMap.get('existAather')
      );
      this.janaid = this.route.snapshot.queryParamMap.get('janaId');
    }
    this.hideNum = this.aadharNum.slice(-3);
    this.bio_master = this.bioMetricService.bioDevices;
    this.deviceCode = 'JFS' + localStorage.getItem('imei');
    if (this.deviceCode.length > 15) {
      this.deviceCode = this.deviceCode.substring(0, 15);
    }

    this.deviceCodeBio = 'JFU' + localStorage.getItem('imei');
    if (this.deviceCodeBio.length > 15) {
      this.deviceCodeBio = this.deviceCodeBio.substring(0, 15);
    }

    this.loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      message: 'Capturing Finger Print...',
      duration: 3000,
    });
  }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FingerprintPage');
  }

  ionViewWillEnter() {
    this.globFunc.statusbarValuesForPages();
  }

  ionViewWillLeave() {
    this.platform.backButton.subscribe(() => {
      this.router.navigate([
        '/ExistingPage',
        { _leadStatus: status, replaceUrl: true, skipLocationChange: true },
      ]);
    });
  }

  //  async showAlert(tittle, subtitle) {
  //     const alert = await this.alertCtrl.create({
  //       header: tittle,
  //       subHeader: subtitle,
  //       buttons: ['OK']
  //     });
  //     await alert.present();
  //   }

  async showfp() {
    // this.sigshow = false;
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Choose EKYC option',
      buttons: [
        {
          text: 'Biometric',
          handler: () => {
            this.sigshow = false;
            this.bioEnable = true;
          },
        },
        {
          text: 'OTP',
          handler: () => {
            this.sigshow = false;
            this.otpEnable = true;
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    await actionSheet.present();
  }

  fingerLL() {
    this.fingerbutton1 = true;
    if (this.fingerbutton1 === true) {
      this.divColor1 = 'green';
      this.divColor2 = '#da107e';
      this.divColor3 = '#da107e';
      this.divColor4 = '#da107e';
      this.divColor5 = '#da107e';
      this.divColor6 = '#da107e';
      this.divColor7 = '#da107e';
      this.divColor8 = '#da107e';
      this.divColor9 = '#da107e';
      this.divColor10 = '#da107e';
      this.fingerbutton1 = true;
      this.fingerbutton2 = false;
      this.fingerbutton3 = false;
      this.fingerbutton4 = false;
      this.fingerbutton5 = false;
      this.fingerbutton6 = false;
      this.fingerbutton7 = false;
      this.fingerbutton8 = false;
      this.fingerbutton9 = false;
      this.fingerbutton10 = false;
    }
  }

  fingerLR() {
    this.fingerbutton2 = true;
    if (this.fingerbutton2 === true) {
      this.divColor1 = '#da107e';
      this.divColor2 = 'green';
      this.divColor3 = '#da107e';
      this.divColor4 = '#da107e';
      this.divColor5 = '#da107e';
      this.divColor6 = '#da107e';
      this.divColor7 = '#da107e';
      this.divColor8 = '#da107e';
      this.divColor9 = '#da107e';
      this.divColor10 = '#da107e';
      this.fingerbutton1 = false;
      this.fingerbutton2 = true;
      this.fingerbutton3 = false;
      this.fingerbutton4 = false;
      this.fingerbutton5 = false;
      this.fingerbutton6 = false;
      this.fingerbutton7 = false;
      this.fingerbutton8 = false;
      this.fingerbutton9 = false;
      this.fingerbutton10 = false;
    }
  }

  fingerLM() {
    this.fingerbutton3 = true;
    if (this.fingerbutton3 === true) {
      this.divColor1 = '#da107e';
      this.divColor2 = '#da107e';
      this.divColor3 = 'green';
      this.divColor4 = '#da107e';
      this.divColor5 = '#da107e';
      this.divColor6 = '#da107e';
      this.divColor7 = '#da107e';
      this.divColor8 = '#da107e';
      this.divColor9 = '#da107e';
      this.divColor10 = '#da107e';
      this.fingerbutton1 = false;
      this.fingerbutton2 = false;
      this.fingerbutton3 = true;
      this.fingerbutton4 = false;
      this.fingerbutton5 = false;
      this.fingerbutton6 = false;
      this.fingerbutton7 = false;
      this.fingerbutton8 = false;
      this.fingerbutton9 = false;
      this.fingerbutton10 = false;
    }
  }

  fingerLI() {
    this.fingerbutton4 = true;
    if (this.fingerbutton4 === true) {
      this.divColor1 = '#da107e';
      this.divColor2 = '#da107e';
      this.divColor3 = '#da107e';
      this.divColor4 = 'green';
      this.divColor5 = '#da107e';
      this.divColor6 = '#da107e';
      this.divColor7 = '#da107e';
      this.divColor8 = '#da107e';
      this.divColor9 = '#da107e';
      this.divColor10 = '#da107e';
      this.fingerbutton1 = false;
      this.fingerbutton2 = false;
      this.fingerbutton3 = false;
      this.fingerbutton4 = true;
      this.fingerbutton5 = false;
      this.fingerbutton6 = false;
      this.fingerbutton7 = false;
      this.fingerbutton8 = false;
      this.fingerbutton9 = false;
      this.fingerbutton10 = false;
    }
  }

  fingerLT() {
    this.fingerbutton5 = true;
    if (this.fingerbutton5 === true) {
      this.divColor1 = '#da107e';
      this.divColor2 = '#da107e';
      this.divColor3 = '#da107e';
      this.divColor4 = '#da107e';
      this.divColor5 = 'green';
      this.divColor6 = '#da107e';
      this.divColor7 = '#da107e';
      this.divColor8 = '#da107e';
      this.divColor9 = '#da107e';
      this.divColor10 = '#da107e';
      this.fingerbutton1 = false;
      this.fingerbutton2 = false;
      this.fingerbutton3 = false;
      this.fingerbutton4 = false;
      this.fingerbutton5 = true;
      this.fingerbutton6 = false;
      this.fingerbutton7 = false;
      this.fingerbutton8 = false;
      this.fingerbutton9 = false;
      this.fingerbutton10 = false;
    }
  }

  fingerRT() {
    this.fingerbutton6 = true;
    if (this.fingerbutton6 === true) {
      this.divColor1 = '#da107e';
      this.divColor2 = '#da107e';
      this.divColor3 = '#da107e';
      this.divColor4 = '#da107e';
      this.divColor5 = '#da107e';
      this.divColor6 = 'green';
      this.divColor7 = '#da107e';
      this.divColor8 = '#da107e';
      this.divColor9 = '#da107e';
      this.divColor10 = '#da107e';
      this.fingerbutton1 = false;
      this.fingerbutton2 = false;
      this.fingerbutton3 = false;
      this.fingerbutton4 = false;
      this.fingerbutton5 = false;
      this.fingerbutton6 = true;
      this.fingerbutton7 = false;
      this.fingerbutton8 = false;
      this.fingerbutton9 = false;
      this.fingerbutton10 = false;
    }
  }

  fingerRI() {
    this.fingerbutton7 = true;
    if (this.fingerbutton7 === true) {
      this.divColor1 = '#da107e';
      this.divColor2 = '#da107e';
      this.divColor3 = '#da107e';
      this.divColor4 = '#da107e';
      this.divColor5 = '#da107e';
      this.divColor6 = '#da107e';
      this.divColor7 = 'green';
      this.divColor8 = '#da107e';
      this.divColor9 = '#da107e';
      this.divColor10 = '#da107e';
      this.fingerbutton1 = false;
      this.fingerbutton2 = false;
      this.fingerbutton3 = false;
      this.fingerbutton4 = false;
      this.fingerbutton5 = false;
      this.fingerbutton6 = false;
      this.fingerbutton7 = true;
      this.fingerbutton8 = false;
      this.fingerbutton9 = false;
      this.fingerbutton10 = false;
    }
  }

  fingerRM() {
    this.fingerbutton8 = true;
    if (this.fingerbutton8 === true) {
      this.divColor1 = '#da107e';
      this.divColor2 = '#da107e';
      this.divColor3 = '#da107e';
      this.divColor4 = '#da107e';
      this.divColor5 = '#da107e';
      this.divColor6 = '#da107e';
      this.divColor7 = '#da107e';
      this.divColor8 = 'green';
      this.divColor9 = '#da107e';
      this.divColor10 = '#da107e';
      this.fingerbutton1 = false;
      this.fingerbutton2 = false;
      this.fingerbutton3 = false;
      this.fingerbutton4 = false;
      this.fingerbutton5 = false;
      this.fingerbutton6 = false;
      this.fingerbutton7 = false;
      this.fingerbutton8 = true;
      this.fingerbutton9 = false;
      this.fingerbutton10 = false;
    }
  }

  fingerRR() {
    this.fingerbutton9 = true;
    if (this.fingerbutton9 === true) {
      this.divColor1 = '#da107e';
      this.divColor2 = '#da107e';
      this.divColor3 = '#da107e';
      this.divColor4 = '#da107e';
      this.divColor5 = '#da107e';
      this.divColor6 = '#da107e';
      this.divColor7 = '#da107e';
      this.divColor8 = '#da107e';
      this.divColor9 = 'green';
      this.divColor10 = '#da107e';
      this.fingerbutton1 = false;
      this.fingerbutton2 = false;
      this.fingerbutton3 = false;
      this.fingerbutton4 = false;
      this.fingerbutton5 = false;
      this.fingerbutton6 = false;
      this.fingerbutton7 = false;
      this.fingerbutton8 = false;
      this.fingerbutton9 = true;
      this.fingerbutton10 = false;
    }
  }

  fingerRL() {
    this.fingerbutton10 = true;
    if (this.fingerbutton10 === true) {
      this.divColor1 = '#da107e';
      this.divColor2 = '#da107e';
      this.divColor3 = '#da107e';
      this.divColor4 = '#da107e';
      this.divColor5 = '#da107e';
      this.divColor6 = '#da107e';
      this.divColor7 = '#da107e';
      this.divColor8 = '#da107e';
      this.divColor9 = '#da107e';
      this.divColor10 = 'green';
      this.fingerbutton1 = false;
      this.fingerbutton2 = false;
      this.fingerbutton3 = false;
      this.fingerbutton4 = false;
      this.fingerbutton5 = false;
      this.fingerbutton6 = false;
      this.fingerbutton7 = false;
      this.fingerbutton8 = false;
      this.fingerbutton9 = false;
      this.fingerbutton10 = true;
    }
  }

  async LoadingCustom() {
    const loading = await this.loadingCtrl.create({
      message: 'Processing...',
      duration: 3000,
    });
    await loading.present();
    await loading.onDidDismiss().then(async () => {
      console.log('Dismissed loading');
      const alert = await this.alertCtrl.create({
        header: 'Information!',
        message: 'FP Scanned Successfully!',
        buttons: ['OK'],
      });
      await alert.present();
      await alert.onDidDismiss().then(() => {
        this.router.navigate(['/aadhaarpreview'], {
          replaceUrl: true,
          skipLocationChange: true,
        });
      });
    });
  }

  async accessdata() {
    const alertq = await this.alertCtrl.create({
      header: 'Data Access',
      message: 'Would you like to use Aadhaar Data in Lead Process?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          handler: () => {
            console.log('cancelled');
          },
        },
        {
          text: 'yes',
          handler: () => {
            console.log('u r click yes');
            //  alert(user.refId);
            this.router.navigate(['/aadhaarpreview'], {
              replaceUrl: true,
              skipLocationChange: true,
            });
          },
        },
      ],
    });
    await alertq.present();
  }

  fingerPrintScan() {
    this.platform.ready().then(() => {
      // if (this.selectedDeviceName !== '' && this.selectedDeviceName !== '3') {
      if (this.selectedDeviceName !== '') {
        //       this.loading = this.loadingCtrl.create({
        //   spinner: 'bubbles',
        //   content: 'Capturing Finger Print...',
        //   duration: 3000
        // });
        // this.loading.present();
        // this.globFunc.globalLodingPresent('Please wait...')
        // var demotag = "<Demo lang =\"07\">" + "<Pi " + "name=\"" + "Dummy Name" + "\"/>" + "</Demo>";
        var self = this;
        // , "2.0", 0, 0, 1, "P", demotag, "N", "", "", "E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=", ""

        // this._getGetPidOptionsXML().then(data => {
        //   this._pidOptionsXML = data;
        //   console.log("_pidOptionsXML", this._pidOptionsXML);

        //   EsysRDService.vCapture(function (data) {
        //     if ((<any>data)[0].res_code == 0) {
        //       self.globalData.globalLodingPresent("Getting data!!!");
        //       var x2js = new X2JS();
        //       console.log("XML Pid Data", data[0].res_info);
        //       var jsonData = x2js.xml2js(data[0].res_info);
        //       console.log("JSON Pid Data", JSON.stringify(jsonData));
        this.bioMetricService
          .selectedDevice(this.selectedDeviceName)
          .then((data: any) => {
            self.globalData.globalLodingPresent('Getting data!!!');
            var jsonData = JSON.parse(data);
            if ((<any>jsonData).PidData.Resp._errCode == '0') {
              let dpId = (<any>jsonData).PidData.DeviceInfo._dpId;
              let rdsId = (<any>jsonData).PidData.DeviceInfo._rdsId;
              let rdsVer = (<any>jsonData).PidData.DeviceInfo._rdsVer;
              let dc = (<any>jsonData).PidData.DeviceInfo._dc;
              let fpDeviceCode = (<any>jsonData).PidData.DeviceInfo
                .additional_info.Param[0]._value;
              let mi = (<any>jsonData).PidData.DeviceInfo._mi;
              let mc = (<any>jsonData).PidData.DeviceInfo._mc;
              let fData = (<any>jsonData).PidData.Data.__text;
              let Hmac = (<any>jsonData).PidData.Hmac;
              let skey = (<any>jsonData).PidData.Skey.__text;
              let ci = (<any>jsonData).PidData.Skey._ci;
              let transactionId = Math.floor(Math.random() * 900000) + 100000;
              let reqData = {
                NpciRequest: {
                  rdInfo: {
                    dc: dc,
                    rdsId: rdsId,
                    rdsVer: rdsVer,
                    mc: mc,
                    dpId: dpId,
                    mi: mi,
                  },
                  headerInfo: {
                    consumerName: 'JBLP',
                    dataRef: self.leadId,
                    // "dataRef": JSON.stringify(self.leadId),
                    correlId: '',
                    timestamp: self.curDateTime.substring(0, 19),
                    requestType: 'eKycBio API',
                    transactionId: JSON.stringify(transactionId),
                    dateTime: self.curDateTime.substring(0, 19),
                    providerName: 'NPCI',
                  },
                  customerInfo: {
                    aadhaarNum: self.aadharNum,
                    biometricInfo: fData,
                    SessionKey: {
                      CertExpiryDate: ci,
                      Key: skey,
                    },
                    hmac: Hmac,
                    localLang: 'N',
                    custAddrConsent: 'Y',
                    authType: 'FFR', // Prod & PreProd
                    // "authType": "F",
                    printReq: 'N',

                    custMobMailConsent: 'Y',
                    adhaarBioConsent: 'Y',
                  },
                  metaInfo: {
                    serviceEntryMode: '019',
                    deviceCode: self.deviceCodeBio,
                    // "deviceCode": "05", //self.deviceCode, //"05",
                    serviceConditionCode: '05',

                    fpDeviceCode: fpDeviceCode,
                    irisDeviceCode: 'NA',
                    publicIPAddress: '192.168.20.178',
                    locationType: 'P',
                    locationValue: '560027',
                  },
                },
              };
              console.log(JSON.stringify(reqData));
              self.masterProvider
                .restApiCallAngular('EkyBiometric', reqData)
                .then(
                  async (data) => {
                    console.log(<any>data);
                    if ((<any>data).errorCode == '000') {
                      let res = JSON.parse((<any>data).EkycResponse);
                      if (res.NpciResponse.statusInfo.respCode == '00') {
                        var decodedKyc = window.atob(
                          res.NpciResponse.eKycResp.kycRes
                        );
                        // console.log("decodedKyc", decodedKyc);
                        var x2js = new X2JS();
                        var ekycData = x2js.xml2js(decodedKyc);
                        console.log('jsonData', ekycData);
                        ekycData['KycRes'].UidData.Poi._name = ekycData[
                          'KycRes'
                        ].UidData.Poi._name.replace(/[~!#$%^&*=|?+@.]/g, ' ');
                        let janaid = res.NpciResponse.eKycResp.janaid;
                        let Ekycaddress = ekycData['KycRes'].UidData.Poa;
                        for (let i in Ekycaddress) {
                          Ekycaddress[i.substring(1)] = Ekycaddress[i];
                        }

                        let EkycPersonal = ekycData['KycRes'].UidData.Poi;
                        for (let i in EkycPersonal) {
                          EkycPersonal[i.substring(1)] = EkycPersonal[i];
                        }
                        console.log('Change detect', ekycData);
                        let EkycRes = {
                          ...EkycPersonal,
                          ...Ekycaddress,
                        };
                        // await this.functionalityRest();

                        if (self.existAather) {
                          self.sqlSupport.insertEKYCDetails(
                            self.leadId,
                            self.janaid,
                            '',
                            '',
                            this.aepsStatus
                          );
                          self.globalData.setCustType('E');
                          self.globalData.globalLodingDismiss();
                          self.router.navigate(['/NewapplicationPage'], {
                            queryParams: {
                              leadStatus: self.leadStatus,
                              leadId: self.leadId,
                              userType: self.globalData.getborrowerType(),
                              janaid: self.janaid,
                              existAather: self.existAather,
                              getExistAather: ekycData,
                              ekyc: 'bio',
                            },
                            skipLocationChange: true,
                            replaceUrl: true,
                          });
                        } else {
                          self.sqlSupport.insertEKYCDetails(
                            self.leadId,
                            janaid,
                            EkycPersonal,
                            Ekycaddress,
                            this.aepsStatus
                          );
                          self.alertService.showAlert(
                            'Alert!!!',
                            res.NpciResponse.statusInfo.respMsg
                          );
                          self.globalData.globalLodingDismiss();
                          self.globalData.setCustomerType('1');
                          self.globalData.setCustType('N');
                          self.normalWorkflow(EkycRes);
                          // self.navCtrl.push(NewapplicationPage, { leadStatus: self.leadStatus, leadId: self.leadId, userType: self.globalData.getborrowerType(), ekycData: ekycData, janaid: janaid });
                        }
                      } else {
                        self.globalData.globalLodingDismiss();
                        self.alertService.showAlert(
                          'Alert!!!',
                          res.NpciResponse.statusInfo.respMsg
                        );
                      }
                    } else {
                      self.globalData.globalLodingDismiss();
                      self.alertService.showAlert(
                        'Alert!!!',
                        (<any>data).errorDesc
                      );
                    }
                  },
                  (err) => {
                    if (err.name == 'TimeoutError') {
                      self.globalData.globalLodingDismiss();
                      self.alertService.showAlert('Alert!', err.message);
                    } else {
                      self.globalData.globalLodingDismiss();
                      self.alertService.showAlert(
                        'Alert!',
                        'No Response from Server!'
                      );
                    }
                  }
                )
                .catch((err) => {
                  self.globalData.globalLodingDismiss();
                  self.alertService.showAlert('Alert!!!', JSON.stringify(err));
                });
            } else {
              self.globalData.globalLodingDismiss();
              self.alertService.showAlert(
                'Alert!!!',
                (<any>jsonData).PidData.Resp._errInfo
              );
            }

            // }
            //   }, function (err) {
            //     self.globalData.globalLodingDismiss();
            //     console.log("Error");
            //     // console.log(JSON.stringify(err));
            //     self.alertService.showAlert("Alert!!!", JSON.stringify(err));
            //   }, this._pidOptionsXML);

            // }, err => {
            //   self.globalData.globalLodingDismiss();
            //   this._pidOptionsXML = err;
            // });
          })
          .catch((err) => {
            self.globalData.globalLodingDismiss();
            console.log('Error');
            self.alertService.showAlert('Alert!!!', JSON.stringify(err));
          });
      } else {
        this.alertService.showAlert('Alert', 'Please Select Device Type!');
      }
    });
  }

  private _getGetPidOptionsXML() {
    // throw new Error('Method not implemented.');
    let _self = this;
    return new Promise((resolve, reject) => {
      // RDSample.finger_deviceInfo((res) => {
      //   console.log(res);
      // })
      EsysRDService.vGetPidOptionXML(
        function (pid) {
          _self.globalData.globalLodingDismiss();
          capturexml = pid[0].res_info;
          resolve(capturexml);
        },
        function (err) {
          _self.globalData.globalLodingDismiss();
          console.log('Error');
          // console.log(JSON.stringify(err));
          _self.alertService.showAlert('Alert!!!', JSON.stringify(err));
          reject(null);
          // }, this._timeout, this._pidVersion, this.format, this._fType, this._fCoutn, this._environment, this._demotag, this._bluetoothConnection, this._btName, this._dmac, this._wadh, this._otp, this._iCount, this._iType);        // L1Device
        },
        this._timeout,
        this._pidVersion,
        this.format,
        this._fType,
        this._fCoutn,
        this._environment,
        this._demotag,
        this._bluetoothConnection,
        this._btName,
        this._dmac,
        this._wadh,
        this._otp
      );
    });
  }

  otpController(event, next, prev, index?) {
    console.log(event, 'keyup');
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
  // sendOtp(){
  //   let aadharRes = {
  //     "ErrorCode": "000",
  //     "ErrorDesc": "Approved",
  //     "dob": "22-12-1993",
  //     "gender": "M",
  //     "name": "Rajesh S",
  //     "co": "S/O: Sekar",
  //     "country": "India",
  //     "dist": "Chennai",
  //     "house": "16/1",
  //     "lm": "",
  //     "loc": "",
  //     "pc": "600041",
  //     "state": "Tamil Nadu",
  //     "street": "HOUSING BOARD periyar NAGAR",
  //     "vtc": "Thiruvanmiyur"
  //   }
  //   let EkycPersonal = {
  //     name:aadharRes.name,
  //     dob:aadharRes.dob,
  //     gender:aadharRes.gender,
  //     co:aadharRes.co
  //   }
  //   let Ekycaddress = {
  //     house:aadharRes.house,
  //     street:aadharRes.street,
  //     vtc:aadharRes.vtc,
  //     lm:aadharRes.lm,
  //     loc:aadharRes.loc,
  //     dist:aadharRes.dist,
  //     state:aadharRes.state,
  //     pc:aadharRes.pc,
  //     country:aadharRes.country
  //   }
  //   let janaid = "";
  //   let ekycData = {...EkycPersonal,...Ekycaddress};
  //   this.sqlSupport.insertEKYCDetails(this.leadId, janaid, EkycPersonal, Ekycaddress);
  //   this.globalData.setCustomerType('1');
  //       this.globalData.setCustType('N');
  //       this.navCtrl.push(NewapplicationPage, { leadStatus: this.leadStatus, leadId: this.leadId, userType: this.globalData.getborrowerType(),ekycData: ekycData, janaid: janaid});
  // }

  sendOtp() {
    if (this.network.type == 'none') {
      this.alertService.showAlert(
        'Alert',
        'Please Check your Data Connection!'
      );
    } else {
      this.globalData.globalLodingPresent('Sending OTP...');
      //6digit
      this.OTPNUM = Math.floor(Math.random() * 900000) + 100000;
      // console.log(this.OTPNUM);
      // this.otpCheckEnable = true;
      //16digit
      let sixteenDigit =
        Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
      // console.log(sixteenDigit);

      //datetime
      let newDate = new Date();
      let timeformat =
        newDate.getFullYear() +
        '-' +
        newDate.getMonth() +
        '-' +
        newDate.getDate() +
        'T' +
        newDate.toTimeString().split(' ')[0];

      let otpRequestEKYC = {
        NpciRequest: {
          headerInfo: {
            providerName: 'NPCI',
            consumerName: 'JBLP', //JBLP JBNW for local
            dateTime: timeformat,
            requestType: 'otpreqekyc',
            transactionId: this.OTPNUM, //random otp 6 digit
            dataRef: sixteenDigit, //random 16 digit
            correlId: '',
          },
          metaInfo: {
            serviceEntryMode: '019',
            serviceConditionCode: '05',
            deviceCode: 'JFS940062276344',
          },
          customerInfo: {
            aadhaarType: 'adh',
            aadhaarNum: this.aadharNum,
          },
        },
      };
      console.log(otpRequestEKYC, 'otp 1st service requesst');
      this.masterProvider
        .restApiCallAngular('otpRequestApi', otpRequestEKYC)
        .then(
          (data) => {
            console.log(data, 'otp 1st service response');
            if ((<any>data).errorCode === '000') {
              this.globalData.globalLodingDismiss();
              this.randomDataRefNumber =
                otpRequestEKYC.NpciRequest['headerInfo']['dataRef'];
              this.otpCheckEnable = true;
              // console.log(this.randomDataRefNumber,"randomDataRefNumber");
              // if (JSON.parse((<any>data).EkycResponse).NpciResponse.statusInfo.respCode == "00") {
              //   this.alertService.showAlert("Alert", "OTP sent Successfully!.");
              //   this.otpCheckEnable = true;OTP
              // } else {
              //   this.alertService.showAlert("Alert", JSON.parse((<any>data).EkycResponse).NpciResponse.statusInfo.respMsg);
              //   this.otpCheckEnable = false;
              // }
            } else {
              this.otpCheckEnable = false;
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert', (<any>data).errorDesc);
            }

            // if ((<any>data).NpciResponse.statusInfo.respCode == "00") {
            //   let otpResponse = (<any>data);
            //   console.log(otpResponse, "otp response");
            // } else {
            //   this.alertService.showAlert("Alert", "Request Error. Try Again");
            // }
          },
          (err) => {
            console.log(err);
            if (err.name == 'TimeoutError') {
              this.alertService.showAlert('Alert!', err.message);
            } else {
              this.alertService.showAlert('Alert', 'No response from server!');
            }
          }
        );
    }
  }

  checkOTP(val) {
    // console.log(val)
    this.globalData.globalLodingPresent('Verifying OTP...');
    let receivedOTP = Object.values(val).join('');
    let newDate = new Date();
    let timeformat =
      newDate.getFullYear() +
      '-' +
      newDate.getMonth() +
      '-' +
      newDate.getDate() +
      'T' +
      newDate.toTimeString().split(' ')[0];
    let fullDate =
      newDate.getFullYear() + '' + newDate.getMonth() + '' + newDate.getDate();
    //uni 6 digit
    let random6digit = Math.floor(Math.random() * 900000) + 100000;
    let random16digit =
      Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
    // console.log(random6digit);

    let otpCheckEKYC = {
      refNo: random16digit,
      aadharNo: this.aadharNum,
      otp: receivedOTP,
      tnx: this.OTPNUM,
      deviceCode: 'JFS520070012989',
    };

    // let otpCheckEKYC = {
    //   "NpciRequest": {
    //     "headerInfo": {
    //       "providerName": "NPCI",
    //       "consumerName": "JBNW",//JBNW, JBLP for production
    //       "dateTime": timeformat,
    //       "requestType": 'otpcheckekyc',
    //       "transactionId": this.OTPNUM,
    //       "dataRef": random16digit,
    //       "correlId": ""
    //     },
    //     "rdInfo": {
    //       "dpId": "",
    //       "rdsId": "",
    //       "rdsVer": "",
    //       "dc": "",
    //       "mi": "",
    //       "mc": ""
    //     },
    //     "metaInfo": {
    //       "serviceEntryMode": "019",
    //       "serviceConditionCode": "05",
    //       "deviceCode": "JFS520070012989",
    //     },
    //     "customerInfo": {
    //       "aadhaarType": "adh",
    //       "aadhaarNum": this.aadharNum,
    //       "authType": "O",
    //       "custAddrConsent": "Y",
    //       "localLang": "N",
    //       "printReq": "Y",
    //       "otpReceived": receivedOTP,
    //       "biometricInfo": "",
    //       "hmac": "",
    //       "SessionKey": {
    //         "CertExpiryDate": fullDate,
    //         "Key": random16digit
    //       }
    //     }
    //   }
    // }
    console.log(otpCheckEKYC, 'otp 2nd service requesst');
    // this.masterProvider.restApiCall('otpCheckApi', otpCheckEKYC).then(data => {
    this.masterProvider
      .restApiCallAngular('aadharOtpVerification', otpCheckEKYC)
      .then(
        async (data) => {
          console.log(data, 'otp 2nd service response');
          let aadharRes = <any>data;
          if (aadharRes.ErrorCode === '000') {
            // await this.functionalityRest();
            if (this.existAather) {
              this.sqlSupport.insertEKYCDetails(
                this.leadId,
                this.janaid,
                '',
                '',
                this.aepsStatus
              );
              this.globalData.setCustType('E');
              this.globalData.globalLodingDismiss();
              aadharRes.name = aadharRes.name.replace(/[~!#$%^&*=|?+@.]/g, ' ');
              this.router.navigate(['/NewapplicationPage'], {
                queryParams: {
                  leadStatus: this.leadStatus,
                  leadId: this.leadId,
                  userType: this.globalData.getborrowerType(),
                  janaid: this.janaid,
                  aadharName: aadharRes,
                  existAather: this.existAather,
                  ekyc: 'OTP',
                },
                replaceUrl: true,
                skipLocationChange: true,
              });
            } else {
              // this.globalData.globalLodingDismissAll();
              this.normalWorkflow(aadharRes);
            }
          } else {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert('Alert', aadharRes.ErrorDesc);
          }
          // if ((<any>data).EkycResponse.NpciResponse.statusInfo.respCode == "00") {
          //   this.alertService.showAlert("Alert", "OTP Verified Successfully!.");
          //   this.viewCtrl.dismiss('success');
          // } else if (this.OTPNUM != receivedOTP) {
          //   this.OTP = { first: '', second: '', third: '', forth: '', fifth: '', sixth: '' };
          //   this.alertService.showAlert("Alert", "Please enter a valid OTP");
          // } else if (val === '' || val === null || val === undefined) {
          //   this.alertService.showAlert("Alert", "Please enter a valid OTP");
          // }
        },
        (err) => {
          console.log(err);
          this.globalData.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert', 'No response from server!');
          }
        }
      );
  }

  async initKarzaAPi(idType, idNumber, leadId, body?, ekycData?) {
    // let modal = this.modalCtrl.create('KarzaDetailsPage', { data: JSON.stringify(body), idType: idType, idNumber: idNumber, leadId: leadId, leadStatus: this.leadStatus,userType: this.globalData.getborrowerType()  });
    // modal.present();

    const modal = await this.modalCtrl.create({
      component: KarzaDetailsPage,
      componentProps: {
        data: JSON.stringify(body),
        idType: idType,
        idNumber: idNumber,
        leadId: leadId,
        leadStatus: this.leadStatus,
        userType: this.globalData.getborrowerType(),
      },
    });

    await modal.onDidDismiss().then((data) => {
      console.log(data, 'data');
      this.globFunc.globalLodingDismiss();
      if (data) {
        if (idType == 'aadhar') {
          this.globalData.setCustType('N');
          this.globFunc.globalLodingDismiss();
          this.router.navigate(['/NewapplicationPage'], {
            queryParams: {
              leadStatus: this.leadStatus,
              leadId: this.leadId,
              userType: this.globalData.getborrowerType(),
              ekycData: ekycData,
              janaid: idNumber,
              aadharName: data,
              ekyc: 'OTP',
            },
            replaceUrl: true,
            skipLocationChange: true,
          });
          // this.navCtrl.push(NewapplicationPage, { pan: data, leadStatus: this.leadStatus, leadId: leadId, userType: this.globalData.getborrowerType() });
        }
      }
    });
    await modal.present();
  }

  //for req otp
  otpRequestEKYC = {
    NpciRequest: {
      headerInfo: {
        providerName: 'NPCI',
        consumerName: 'DIGI',
        dateTime: '2020-01-08T05:21:29',
        requestType: 'OTP Request',
        transactionId: '819519', //random otp 6 digit
        dataRef: '654356856587585', //random 16 digit
        correlId: '',
      },
      metaInfo: {
        serviceEntryMode: '019',
        serviceConditionCode: '05',
        deviceCode: 'JFS940062276344',
      },
      customerInfo: {
        aadhaarType: 'adh',
        aadhaarNum: '123456123559',
      },
    },
  };

  //to verify otp
  otpCheckEKYC = {
    NpciRequest: {
      headerInfo: {
        providerName: 'NPCI',
        consumerName: 'DIGI',
        dateTime: '2020-01-08T05:21:29',
        requestType: 'OTP eKYC',
        transactionId: '430220',
        dataRef: '654356856587585',
        correlId: '',
      },
      rdInfo: {
        dpId: '',
        rdsId: '',
        rdsVer: '',
        dc: '',
        mi: '',
        mc: '',
      },
      metaInfo: {
        serviceEntryMode: '019',
        serviceConditionCode: '05',
        deviceCode: 'JFS520070012989',
      },
      customerInfo: {
        aadhaarType: 'adh',
        aadhaarNum: '335387123559',
        authType: 'O',
        custAddrConsent: 'Y',
        localLang: 'N',
        printReq: 'Y',
        otpReceived: '819519',
        biometricInfo: '',
        hmac: '',
        SessionKey: {
          CertExpiryDate: '20221021',
          Key: '',
        },
      },
    },
  };

  resendOtp() {
    if (this.network.type == 'none') {
      this.alertService.showAlert(
        'Alert',
        'Please Check your Data Connection!'
      );
    } else {
      this.OTP = {
        first: '',
        second: '',
        third: '',
        forth: '',
        fifth: '',
        sixth: '',
      };
      this.globalData.globalLodingPresent('Sending OTP...');
      //6digit
      this.OTPNUM = Math.floor(Math.random() * 900000) + 100000;
      // console.log(this.OTPNUM);
      // this.otpCheckEnable = true;
      //16digit
      let sixteenDigit =
        Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
      // console.log(sixteenDigit);

      //datetime
      let newDate = new Date();
      let timeformat =
        newDate.getFullYear() +
        '-' +
        newDate.getMonth() +
        '-' +
        newDate.getDate() +
        'T' +
        newDate.toTimeString().split(' ')[0];

      let otpRequestEKYC = {
        NpciRequest: {
          headerInfo: {
            providerName: 'NPCI',
            consumerName: 'JBLP', //JBLP JBNW for local
            dateTime: timeformat,
            requestType: 'otpreqekyc',
            transactionId: this.OTPNUM, //random otp 6 digit
            dataRef: sixteenDigit, //random 16 digit
            correlId: '',
          },
          metaInfo: {
            serviceEntryMode: '019',
            serviceConditionCode: '05',
            deviceCode: 'JFS940062276344',
          },
          customerInfo: {
            aadhaarType: 'adh',
            aadhaarNum: this.aadharNum,
          },
        },
      };
      console.log(otpRequestEKYC, 'otp 1st service requesst');
      this.masterProvider
        .restApiCallAngular('otpRequestApi', otpRequestEKYC)
        .then(
          (data) => {
            console.log(data, 'otp 1st service response');
            if ((<any>data).errorCode === '000') {
              this.globalData.globalLodingDismiss();
              this.randomDataRefNumber =
                otpRequestEKYC.NpciRequest['headerInfo']['dataRef'];
              this.otpCheckEnable = true;
              // console.log(this.randomDataRefNumber,"randomDataRefNumber");
              // if (JSON.parse((<any>data).EkycResponse).NpciResponse.statusInfo.respCode == "00") {
              //   this.alertService.showAlert("Alert", "OTP sent Successfully!.");
              //   this.otpCheckEnable = true;
              // } else {
              //   this.alertService.showAlert("Alert", JSON.parse((<any>data).EkycResponse).NpciResponse.statusInfo.respMsg);
              //   this.otpCheckEnable = false;
              // }
            } else {
              this.otpCheckEnable = false;
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert', (<any>data).errorDesc);
            }

            // if ((<any>data).NpciResponse.statusInfo.respCode == "00") {
            //   let otpResponse = (<any>data);
            //   console.log(otpResponse, "otp response");
            // } else {
            //   this.alertService.showAlert("Alert", "Request Error. Try Again");
            // }
          },
          (err) => {
            this.globalData.globalLodingDismiss();
            console.log(err);
            if (err.name == 'TimeoutError') {
              this.alertService.showAlert('Alert!', err.message);
            } else {
              this.alertService.showAlert('Alert', 'No response from server!');
            }
          }
        );
    }
  }

  async normalWorkflow(aadharRes) {
    let EkycPersonal = {
      name: aadharRes.name.replace(/[~!#$%^&*=|?+@.]/g, ' '),
      dob: aadharRes.dob,
      gender: aadharRes.gender,
      co: aadharRes.co,
    };
    let Ekycaddress = {
      house: aadharRes.house,
      street: aadharRes.street,
      vtc: aadharRes.vtc,
      lm: aadharRes.lm,
      loc: aadharRes.loc,
      dist: aadharRes.dist,
      state: aadharRes.state,
      pc: aadharRes.pc,
      country: aadharRes.country,
    };
    let body = {
      name: aadharRes.name.replace(/[~!#$%^&*=|?+@.]/g, ' '),
      fathername: '',
      lastname: '',
      dob: aadharRes.dob,
      idNumber: '',
      type: 'aadhar',
    };
    // let janaid = "";
    let ekycData = { ...EkycPersonal, ...Ekycaddress };
    this.sqlSupport.insertEKYCDetails(
      this.leadId,
      this.janaid,
      EkycPersonal,
      Ekycaddress,
      this.aepsStatus
    );
    // if (JSON.parse((<any>data).EkycResponse).NpciResponse.statusInfo.respCode == "00") {
    this.globalData.globalLodingDismiss();

    // this.alertService.showAlert("Alert", "OTP Verified Successfully!.");
    this.globalData.setCustomerType('1');
    this.globalData.setCustType('N');
    if (this.secKyc) {
      this.modalCtrl.dismiss({ body, ekycData });
    } else {
      this.router.navigate(['/secondKycPage'], {
        queryParams: {
          data: JSON.stringify(body),
          idType: 'aadhar',
          idNumber: this.janaid,
          leadId: this.leadId,
          ekycData: JSON.stringify(ekycData),
          leadStatus: this.leadStatus,
          userType: this.globalData.getborrowerType(),
        },
        replaceUrl: true,
        skipLocationChange: true,
      });

      // this.initKarzaAPi("aadhar", this.janaid, this.leadId, body, ekycData);
    }
    // this.navCtrl.push(NewapplicationPage, { leadStatus: this.leadStatus, leadId: this.leadId, userType: this.globalData.getborrowerType(), ekycData: ekycData, janaid: janaid });

    // this.viewCtrl.dismiss('success');
    // } else {
    //   this.globalData.globalLodingDismiss();
    //   this.alertService.showAlert("Alert", JSON.parse((<any>data).EkycResponse).NpciResponse.statusInfo.respMsg);
    // }
  }

  async functionalityRest() {
    try {
      this.sigshow = true;
      this.otpEnable = false;
      this.bioEnable = false;
      this.OTP = {
        first: '',
        second: '',
        third: '',
        forth: '',
        fifth: '',
        sixth: '',
      };
    } catch (error) {
      console.log(error);
    }
  }

  fingerPrintScanMantra() {
    return new Promise(async (resolve, reject) => {
      MantraRDService.finger_deviceInfo(
        'finger_deviceInfo',
        async (success) => {
          var x2js = new X2JS();
          var jsonData = x2js.xml2js(success.rd_service_info);
          console.log('XML Pid Data', jsonData);
          if ((<any>jsonData).RDService._status == 'READY') {
            await this.captureFingurePrint();
          } else {
            this.alertService.showAlert(
              'Alert',
              `Please Check the Device is ${(<any>jsonData).RDService._status}`
            );
            await this.captureFingurePrint();
          }
        },
        (failed) => {
          this.alertService.showAlert('Failed', JSON.stringify(failed));
          reject('');
        }
      );
    });
  }

  bioDeviceSelected(event) {
    this.selectedDeviceName = event.detail.value;
  }

  private captureFingurePrint() {
    return new Promise((resolve, reject) => {
      MantraRDService.finger_capture(
        'finger_capture',
        (sucess) => {
          if ((<any>sucess).pid_data) {
            // this.globalData.globalLodingPresent("Getting data!!!");
            var x2js = new X2JS();
            console.log('XML Pid Data', sucess.pid_data);
            var jsonData = x2js.xml2js(sucess.pid_data);
            console.log('JSON Pid Data', JSON.stringify(jsonData));
            if ((<any>jsonData).PidData.Resp._errCode) {
              this.alertService
                .confirmationAlert(
                  'Alert',
                  JSON.stringify((<any>jsonData).PidData.Resp)
                )
                .then((data) => {
                  let dpId = (<any>jsonData).PidData.DeviceInfo._dpId;
                  let rdsId = (<any>jsonData).PidData.DeviceInfo._rdsId;
                  let rdsVer = (<any>jsonData).PidData.DeviceInfo._rdsVer;
                  let dc = (<any>jsonData).PidData.DeviceInfo._dc;
                  let fpDeviceCode = (<any>jsonData).PidData.DeviceInfo
                    .additional_info.Param[0]._value;
                  let mi = (<any>jsonData).PidData.DeviceInfo._mi;
                  let mc = (<any>jsonData).PidData.DeviceInfo._mc;
                  let fData = (<any>jsonData).PidData.Data.__text;
                  let Hmac = (<any>jsonData).PidData.Hmac;
                  let skey = (<any>jsonData).PidData.Skey.__text;
                  let ci = (<any>jsonData).PidData.Skey._ci;
                  let transactionId =
                    Math.floor(Math.random() * 900000) + 100000;
                  let reqData = {
                    NpciRequest: {
                      rdInfo: {
                        dc: dc,
                        rdsId: rdsId,
                        rdsVer: rdsVer,
                        mc: mc,
                        dpId: dpId,
                        mi: mi,
                      },
                      headerInfo: {
                        consumerName: 'JBLP',
                        dataRef: JSON.stringify(this.leadId),
                        correlId: '',
                        timestamp: this.curDateTime.substring(0, 19),
                        requestType: 'eKycBio API',
                        transactionId: JSON.stringify(transactionId),
                        dateTime: this.curDateTime.substring(0, 19),
                        providerName: 'NPCI',
                      },
                      customerInfo: {
                        aadhaarNum: this.aadharNum,
                        biometricInfo: fData,
                        SessionKey: {
                          CertExpiryDate: ci,
                          Key: skey,
                        },
                        hmac: Hmac,
                        localLang: 'N',
                        custAddrConsent: 'Y',
                        authType: 'FFR', // Prod & PreProd
                        // "authType": "F",
                        printReq: 'N',

                        custMobMailConsent: 'Y',
                        adhaarBioConsent: 'Y',
                      },
                      metaInfo: {
                        serviceEntryMode: '019',
                        deviceCode: this.deviceCodeBio,
                        // "deviceCode": "05", //self.deviceCode, //"05",
                        serviceConditionCode: '05',

                        fpDeviceCode: fpDeviceCode,
                        irisDeviceCode: 'NA',
                        publicIPAddress: '192.168.20.178',
                        locationType: 'P',
                        locationValue: '560027',
                      },
                    },
                  };
                  console.log(JSON.stringify(reqData));
                  let self = this;
                  // this.masterProvider.restApiCallAngular('EkyBiometric', reqData).then(async data => {
                  self.masterProvider
                    .restApiCallAngular('EkyBiometric', reqData)
                    .then(
                      async (data) => {
                        console.log(<any>data);
                        if ((<any>data).errorCode == '000') {
                          let res = JSON.parse((<any>data).EkycResponse);
                          if (res.NpciResponse.statusInfo.respCode == '00') {
                            var decodedKyc = window.atob(
                              res.NpciResponse.eKycResp.kycRes
                            );
                            // console.log("decodedKyc", decodedKyc);
                            var x2js = new X2JS();
                            var ekycData = x2js.xml2js(decodedKyc);
                            console.log('jsonData', ekycData);
                            ekycData['KycRes'].UidData.Poi._name = ekycData[
                              'KycRes'
                            ].UidData.Poi._name.replace(
                              /[~!#$%^&*=|?+@.]/g,
                              ' '
                            );
                            let janaid = res.NpciResponse.eKycResp.janaid;
                            let Ekycaddress = ekycData['KycRes'].UidData.Poa;
                            for (let i in Ekycaddress) {
                              Ekycaddress[i.substring(1)] = Ekycaddress[i];
                            }

                            let EkycPersonal = ekycData['KycRes'].UidData.Poi;
                            for (let i in EkycPersonal) {
                              EkycPersonal[i.substring(1)] = EkycPersonal[i];
                            }
                            console.log('Change detect', ekycData);
                            let EkycRes = {
                              ...EkycPersonal,
                              ...Ekycaddress,
                            };
                            // await this.functionalityRest();

                            if (self.existAather) {
                              self.sqlSupport.insertEKYCDetails(
                                self.leadId,
                                self.janaid,
                                '',
                                '',
                                this.aepsStatus
                              );
                              self.globalData.setCustType('E');
                              self.globalData.globalLodingDismiss();
                              self.router.navigate(['/NewapplicationPage'], {
                                queryParams: {
                                  leadStatus: self.leadStatus,
                                  leadId: self.leadId,
                                  userType: self.globalData.getborrowerType(),
                                  janaid: self.janaid,
                                  existAather: self.existAather,
                                  getExistAather: ekycData,
                                  ekyc: 'bio',
                                },
                                skipLocationChange: true,
                                replaceUrl: true,
                              });
                            } else {
                              self.sqlSupport.insertEKYCDetails(
                                self.leadId,
                                janaid,
                                EkycPersonal,
                                Ekycaddress,
                                this.aepsStatus
                              );
                              self.alertService.showAlert(
                                'Alert!!!',
                                res.NpciResponse.statusInfo.respMsg
                              );
                              self.globalData.globalLodingDismiss();
                              self.globalData.setCustomerType('1');
                              self.globalData.setCustType('N');
                              self.normalWorkflow(EkycRes);
                              // self.navCtrl.push(NewapplicationPage, { leadStatus: self.leadStatus, leadId: self.leadId, userType: self.globalData.getborrowerType(), ekycData: ekycData, janaid: janaid });
                            }
                          } else {
                            self.globalData.globalLodingDismiss();
                            self.alertService.showAlert(
                              'Alert!!!',
                              res.NpciResponse.statusInfo.respMsg
                            );
                          }
                        } else {
                          self.globalData.globalLodingDismiss();
                          self.alertService.showAlert(
                            'Alert!!!',
                            (<any>data).errorDesc
                          );
                        }
                      },
                      (err) => {
                        if (err.name == 'TimeoutError') {
                          self.globalData.globalLodingDismiss();
                          self.alertService.showAlert('Alert!', err.message);
                        } else {
                          self.globalData.globalLodingDismiss();
                          self.alertService.showAlert(
                            'Alert!',
                            'No Response from Server!'
                          );
                        }
                      }
                    )
                    .catch((err) => {
                      self.globalData.globalLodingDismiss();
                      self.alertService.showAlert(
                        'Alert!!!',
                        JSON.stringify(err)
                      );
                    });
                });
            } else {
              this.alertService.showAlert(
                'Alert',
                JSON.stringify((<any>jsonData).PidData.Resp)
              );
            }
          } else {
            this.alertService.showAlert('Failed', JSON.stringify(sucess));
          }
        },
        (failed) => {
          this.alertService.showAlert('Failed', JSON.stringify(failed));
        }
      );
    });
  }

  private lblstatus: any = '';

  private btnClick = '';

  success(response) {
    // alert("success: " + response.toString());
    switch (this.btnClick) {
      case 'finger_deviceInfo':
        var info = '';
        info += '\nRDService Info= \n' + response.rd_service_info + '\n\n';
        info += 'Capture Info= \n' + response.device_info;
        this.lblstatus.innerText = info;
        break;
      case 'finger_capture':
        this.lblstatus.innerText = '\nPID Data= \n' + response.pid_data;
        break;
      case 'iris_deviceInfo':
        var info = '';
        info += '\nRDService Info= \n' + response.rd_service_info + '\n\n';
        info += 'Capture Info= \n' + response.device_info;
        this.lblstatus.innerText = info;
        break;
      case 'iris_capture':
        this.lblstatus.innerText = '\nPID Data= \n' + response.pid_data;
        break;
      default:
        break;
    }
  }

  failed(error) {
    // alert("failed: " + error);
    this.lblstatus.innerText = error;
  }
}
