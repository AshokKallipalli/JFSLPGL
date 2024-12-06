import { Injectable, NgZone } from '@angular/core';
import {
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import * as CryptoJS from 'crypto-js';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
// import 'rxjs/add/operator/map';
import { App } from '@capacitor/app';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { BatteryStatus } from '@awesome-cordova-plugins/battery-status/ngx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { CropImageComponent } from 'src/app/components/crop-image/crop-image.component';
declare var google: any;
import { Plugins } from '@capacitor/core';
import { CustomAlertControlService } from './custom-alert-control.service';
const { WebPConvertor } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  sys_token: string;
  _img: any;
  _loading: boolean = false;
  _stateMaster: any;
  _cityMaster: any;
  _productList: any;
  _Gender: any;
  _IncomeType: any;
  _Employment: any;
  _InterestType: any;
  _Title: any;
  _RelationShip: any;
  _appStatus: any;
  _selectedCities: any;
  _branch: any;
  _docList: any;
  _wifi?: any;
  _battery?: any;
  _gps?: any;
  _borrower: any;
  applicationDataChangeDetector = [];
  _alertCtrl: any;

  uploadStatus = new Subject();
  reRunScoreCard = new Subject();

  _sk = 'sysarc@1234INFO@';
  _refId: any;
  subscription: Subscription;
  gpsStatus: any = new BehaviorSubject<any>(undefined);
  battery: any = new BehaviorSubject<any>(undefined);
  wifiStatus: any = new BehaviorSubject<any>(undefined);

  constructor(
    public loadingCtrl: LoadingController,
    public zone: NgZone,
    public loadCtrl: LoadingController,
    private network: Network,
    public http: HTTP,
    public device: Device,
    public batteryStatus: BatteryStatus,
    private diagnostic: Diagnostic,
    public modalCtrl: ModalController,
    public alertService: CustomAlertControlService
  ) {
    this.getSystemDate();
    this.getTimestamp();
    setInterval(() => this.statusbarValuesForPages(), 3000);
    // window.addEventListener("batterystatus", this.onBatteryStatus, false);
  }

  // onBatteryStatus(status) {
  //   console.log("Level: " + status.level + " isPlugged: " + status.isPlugged);
  // }
  getOtherimg() {
    return this._img;
  }

  setOtherimg(value) {
    // console.log("other img value ==>" + value);
    this._img = value;
  }
  getTimestamp() {
    let date = new Date();
    let n = date.toDateString();
    let time = date.toLocaleTimeString();
    let timestamp = n + ' ' + time;
    //console.log("timestamp"+timestamp);
    return timestamp;
  }
  getSystemDate() {
    let sysDate = new Date();
    //console.log("sysDate"+sysDate);
    return sysDate;
  }

  getDeviceId() {
    return this.device.uuid;
  }
  getAndroidV() {
    return this.device.version;
  }

  async getPackageName() {
    return await (
      await App.getInfo()
    ).id;
  }

  // async globalAlert(tittle, subtitle) {
  //   if (!this._alertCtrl) {
  //     this._alertCtrl = this.alertCtrl.create({
  //       header: tittle,
  //       subHeader: subtitle,
  //       // buttons: ['OK']
  //       buttons: [
  //         {
  //           text: 'Ok',
  //           role: 'cancel',
  //           handler: () => {
  //             this._alertCtrl.dismiss();
  //             this._alertCtrl = null;
  //           },
  //         },
  //       ],
  //     });
  //     await this._alertCtrl.present();
  //   }
  // }

  // async globalLodingPresent(loadingContent: string) {
  //   if (!this._loading) {
  //     this._loading = this.loadingCtrl.create({
  //       spinner: 'bubbles',
  //       // content: `${loadingContent}`,
  //       cssClass: 'spinnerCss'
  //     });
  //     await this._loading.present();
  //   }
  // }

  async globalLodingPresent(msg, time?) {
    this._loading = true;
    return await this.loadingCtrl
      .create({
        message: msg,
        duration: time,
        spinner: 'circles',
        cssClass: 'custom-loading',
      })
      .then((a) => {
        a.present().then(() => {
          if (!this._loading) {
            a.dismiss().then(() => console.log('abort presenting'));
          }
        });
      });
  }

  async globalLodingDismiss() {
    this._loading = false;
    return await this.loadingCtrl
      .dismiss()
      .then(() => console.log('dismissed'));
  }

  /* Nidheesh Source */

  getFullStateMaster() {
    return this._stateMaster;
  }

  setFullCityMaster(value) {
    this._cityMaster = value;
  }
  getFullCityMaster() {
    return this._cityMaster;
  }

  setFullStateMaster(value) {
    this._stateMaster = value;
  }
  getFullProductList() {
    return this._productList;
  }

  setFullProductList(value) {
    this._productList = value;
  }

  getGenderList() {
    return this._Gender;
  }

  setGenderList(value) {
    this._Gender = value;
  }

  getIncomeTypeList() {
    return this._IncomeType;
  }

  setIncomeTypeList(value) {
    this._IncomeType = value;
  }
  getEmployementList() {
    return this._Employment;
  }

  setEmployementList(value) {
    this._Employment = value;
  }
  getTitleList() {
    return this._Title;
  }

  setTitleList(value) {
    this._Title = value;
  }
  setDocumentList(val) {
    this._docList = val;
  }
  getDocumentList() {
    return this._docList;
  }
  getRelationShipList() {
    return this._RelationShip;
  }

  setRelationShipList(value) {
    this._RelationShip = value;
  }
  getInterestRateType() {
    return this._InterestType;
  }

  setInterestRateType(value) {
    this._InterestType = value;
  }

  setApplicationSubStatus(val) {
    this._appStatus = val;
  }
  getApplicationSubStatus() {
    return this._appStatus;
  }

  setScoreCardChecked(val) {
    this._refId = val;
  }
  getScoreCardChecked() {
    return this._refId;
  }

  setBranchCode(val) {
    this._branch = val;
  }
  getBranchCode() {
    return this._branch;
  }
  getGlobalConstants = function (value) {
    let constantValue;
    if (value == 'DocCode') {
      constantValue = 'TAB-BOS-SUCCESS';
    }

    return constantValue;
  };
  filterStateItems(searchTerm) {
    return this._stateMaster.filter((item) => {
      return (
        item.sgmStateName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
      );
    });
  }
  filterCityItems(search) {
    return this._selectedCities.filter((item) => {
      return item.sgmCityName.toLowerCase().indexOf(search.toLowerCase()) > -1;
    });
  }
  filterDocItems(search) {
    return this._docList.filter((item) => {
      return (
        item.doc_description.toLowerCase().indexOf(search.toLowerCase()) > -1
      );
    });
  }
  setSelectedCities(val) {
    this._selectedCities = val;
  }
  getSelectedCities() {
    return this._selectedCities;
  }

  reverseGeocode(lat: number, lng: number): Promise<any> {
    return new Promise((resolve, reject) => {
      var latlng = new google.maps.LatLng(lat, lng);
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { latLng: latlng },
        function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            resolve(results);
          } else {
            if (status == 'ZERO_RESULTS') {
              reject('Location is not available for your current position.');
            } else if (status == 'OVER_QUERY_LIMIT') {
              reject('Request Count exceeded !');
            } else if (status == 'REQUEST_DENIED') {
              reject('Request was Denied');
            } else if (status == 'INVALID_REQUEST') {
              reject('Invalid request. Unable to process your request.');
            } else if (status == 'UNKNOWN_ERROR') {
              reject(
                'Request could not be processed due to server error. The request may succeed if you try again.'
              );
            }
          }
        },
        function (error) {
          reject(
            'Request could not be processed due to server error. The request may succeed if you try again with internet .'
          );
        }
      );
    });
  }

  // ionViewWillLeave() {
  //   this.subscription.unsubscribe();
  // }

  latitudeCheck(lat1, lon1, lat2, lon2): boolean {
    // console.log(lat1 + " " + lon1 + " " + lat2 + " " + lon2)
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = Math.abs(lon1 - lon2);
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    // console.log("distance: " + dist);
    if (dist < 2) {
      return true;
    } else {
      return false;
    }
  }

  returnDistanceFromLatLong(lat1, lon1, lat2, lon2): number {
    // console.log(lat1 + " " + lon1 + " " + lat2 + " " + lon2)
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = Math.abs(lon1 - lon2);
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    return Math.round(dist);
  }

  // _batteryStatus() {
  //   this.batteryStatus.onChange().subscribe(status => {
  //     this._battery = status.level;
  //     // console.log(`battery status provider => ${this._battery}`);
  //     this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  //   })
  // }

  _batteryStatus() {
    try {
      this.subscription = this.batteryStatus.onChange().subscribe((status) => {
        // console.log(status.level, status.isPlugged, 'battery');
        this.setBatteryStatus(status.level);
        return status.level;
      });
    } catch (err) {
      console.log('battery: ', err);
    }
  }

  _wifiStatus() {
    let network = this.network.type;
    if (network == 'none' || network == 'unknown') {
      this._wifi = 'OFF';
    } else {
      this._wifi = 'ON';
    }
    this.setWifiStatus(this._wifi);
    return this._wifi;
  }

  // _wifiChangeDeduct() {
  //   this.network.onConnect().subscribe(() => {
  //     this.zone.run(_ => {
  //       // console.log('network connected!');
  //       this._wifi = "ON";
  //       // console.log(`_wifiChangeDeduct onConnect => ${this._wifi}`);
  //       // this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  //     })
  //   })

  //   this.network.onDisconnect().subscribe(() => {
  //     this.zone.run(_ => {
  //       // console.log('onDisconnect network was disconnected  :-(');
  //       this._wifi = 'OFF';
  //       // this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  //     })

  //   })
  // }

  // _wifiStatus() {
  //   this.network.onConnect().subscribe(() => {
  //     this.zone.run((_) => {
  //       this.setWifiStatus('ON');
  //     });
  //   });

  //   this.network.onDisconnect().subscribe(() => {
  //     this.zone.run((_) => {
  //       this.setWifiStatus('OFF');
  //     });
  //   });
  // }

  // _GpsStatus() {
  //   this.diagnostic.isGpsLocationAvailable().then((isAvailable) => {
  //     if (isAvailable == true) {
  //       this._gps = "ON";
  //       //        console.log(`if block diagnostic.isLocationAvailable ${isAvailable}`);
  //       this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  //     } else {
  //       this._gps = "OFF";
  //       //      console.log(`else block diagnostic.isLocationAvailable ${isAvailable}`);
  //       this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  //     }
  //   }).catch((error: any) => {
  //     this._gps = "OFF";
  //     //      console.log(`catch block diagnostic.isLocationAvailable ${error}`);
  //     this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  //   })
  // }

  _GpsStatus() {
    this.diagnostic
      .isLocationEnabled()
      .then((enabled) => {
        if (enabled == true) {
          // console.log('gps', 'on');
          this.setGpsStatus('ON');
        } else {
          // console.log('gps', 'OFF');
          this.setGpsStatus('OFF');
        }
      })
      .catch((error: any) => {
        console.log('gps', error);
        this.setGpsStatus('OFF');
      });
  }

  // statusbarValues() {
  //   // this._batteryStatus();
  //   this._wifiStatus();
  //   // this._GpsStatus();
  //   // this._wifiChangeDeduct();
  //   // console.log(`inside statusbarValues`);
  //   // this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  // }

  statusbarValuesForPages() {
    this._GpsStatus();
    this._wifiStatus();
    this._batteryStatus();
  }

  getLocalUrlEndpoint() {
    let localUrl = {
      url: 'http://192.168.0.91:9081/laps/rest/LOSMobileRestServices/',
      local: true,
    };
    return localUrl;
  }

  getMasterSubmitUrlEndpoint() {
    let masSub = {
      url: 'http://192.168.0.91:9081/laps/rest/LOSMobileRestServices/',
      local: true,
    };
    return masSub;
  }

  _pusblishHardwareBackButtonClicked = new Subject<string>();
  _publishPageNavigation = new Subject<string>();
  _JanaEmployee = new Subject<string>();
  secKycAddress = new Subject<any>();
  hardwareBackButtonClicked$ =
    this._pusblishHardwareBackButtonClicked.asObservable();
  pageNavigationClicked$ = this._publishPageNavigation.asObservable();
  JanaEmployee = this._JanaEmployee.asObservable();

  publishPageNavigation(e: any) {
    this._publishPageNavigation.next(e);
  }

  // Service message commands
  pusblishHardwareBackButtonClicked(e: string) {
    this._pusblishHardwareBackButtonClicked.next(e);
  }

  JanaEmpl(e: any) {
    this._JanaEmployee.next(e);
  }

  secKycAdd(data) {
    this.secKycAddress.next(data);
  }
  eKycDismissed = new Subject<any>();
  ekycDismiss(data) {
    this.eKycDismissed.next(data);
  }
  getapplicationDataChangeDetector() {
    return this.applicationDataChangeDetector;
  }

  setapplicationDataChangeDetector(formActivatorStatus, pagename) {
    let page: any;
    let pageIndex: number;
    page = this.applicationDataChangeDetector.find((f, index) => {
      return f.pageName === pagename;
    });
    pageIndex = this.applicationDataChangeDetector.indexOf(page);
    // alert(`page= ${JSON.stringify(page)} === pageindex ${pageIndex}`);
    if (pageIndex == -1) {
      this.applicationDataChangeDetector.push({
        pageName: pagename,
        changeDetected: formActivatorStatus,
      });
      //  alert(`this.applicationDataChangeDetector= ${JSON.stringify(this.applicationDataChangeDetector)}`);
    } else {
      this.applicationDataChangeDetector[pageIndex].pageName = pagename;
      this.applicationDataChangeDetector[pageIndex].changeDetected =
        formActivatorStatus;
    }
  }

  // _GpsStatus() {
  //   this.diagnostic.isGpsLocationAvailable().then((isAvailable) => {
  //     if (isAvailable == true) {
  //       this._gps = "ON";
  //       //        console.log(`if block diagnostic.isLocationAvailable ${isAvailable}`);
  //       this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  //     } else {
  //       this._gps = "OFF";
  //       //      console.log(`else block diagnostic.isLocationAvailable ${isAvailable}`);
  //       this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  //     }
  //   }).catch((error: any) => {
  //     this._gps = "OFF";
  //     //      console.log(`catch block diagnostic.isLocationAvailable ${error}`);
  //     this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  //   })
  // }

  // statusbarValues() {
  //   this._batteryStatus();
  //   this._wifiStatus();
  //   // this._GpsStatus();
  //   // this._wifiChangeDeduct();
  //   // console.log(`inside statusbarValues`);
  //   // this.events.publish('statusBar', this._battery, this._wifi, this._gps);
  // }

  resetapplicationDataChangeDetector() {
    this.applicationDataChangeDetector = [];
    // alert(`reseting array length => ${this.applicationDataChangeDetector.length}`);
  }

  encMyReq(val) {
    if (val != '' && val != null && val != undefined) {
      let encryptedMessage = CryptoJS.AES.encrypt(val, this._sk);
      return encryptedMessage.toString();
    }
  }

  decMyReq(val) {
    if (val != '' && val != null && val != undefined) {
      var decryptedBytes = CryptoJS.AES.decrypt(val, this._sk);
      console.log(decryptedBytes);
      if (decryptedBytes) {
        try {
          var decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
          val = decryptedMessage;
          return val;
        } catch (err) {
          // this.globalLodingDismiss();
          console.log(err);
        }
      }
    } else {
      // this.globalLodingDismiss();
      // this.globalAlert('Alert', 'No Proper Response from Server!!');
    }
  }

  encryptMyReq(val) {
    if (val != '' && val != null && val != undefined) {
      let encryptedMessage = CryptoJS.AES.encrypt(
        JSON.stringify(val),
        this._sk
      );
      let req = { data: encryptedMessage.toString() };
      return req;
    }
  }

  decryptMyRes(val) {
    if (val != '' && val != null && val != undefined) {
      if (val.data != '' && val.data != null && val.data != undefined) {
        var decryptedBytes = CryptoJS.AES.decrypt(val.data, this._sk);
        console.log(decryptedBytes);
        if (decryptedBytes) {
          try {
            var decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
            val.data = decryptedMessage;
            return val;
          } catch (err) {
            // this.globalLodingDismiss();
            console.log(err);
          }
        }
      } else {
        // this.globalLodingDismiss();
        // this.globalAlert('Alert', 'No Proper Response from Server!!');
      }
    }
  }

  genToken() {
    let timestamp = new Date().getTime();
    let RanNum = Math.floor(Math.random() * 90000000) + 10000000;
    this.sys_token = timestamp.toString() + '_' + RanNum.toString();
    return this.sys_token;
  }

  basicEnc(val) {
    if (val != '' && val != null && val != undefined) {
      return 'MV_+' + window.btoa(val);
    }
  }

  basicDec(val) {
    if (val != '' && val != null && val != undefined) {
      let vals = val.substring(4);
      return window.atob(vals);
    } else {
      return val;
    }
  }

  getToken() {
    return this.sys_token;
  }

  uploadImgFailed(value) {
    this.uploadStatus.next(value);
  }

  setRerunScoreCard(value) {
    this.reRunScoreCard.next(value);
    console.log('Value ', value);
  }

  getCertPinningStatus() {
    return new Promise((resolve, reject) => {
      this.http.setServerTrustMode('nocheck').then(
        (data) => {
          console.log('ssl pinning pass here', data);
          resolve(true);
        },
        (error) => {
          console.log('ssl pinning error here', error);
          reject(false);
        }
      );
    });
  }

  setGpsStatus(data: any) {
    this.gpsStatus.next(data);
  }

  getGpsStatus(): BehaviorSubject<any> {
    return this.gpsStatus;
  }

  setWifiStatus(data: any) {
    this.wifiStatus.next(data);
  }

  getWifiStatus(): BehaviorSubject<any> {
    return this.wifiStatus;
  }

  setBatteryStatus(data: any) {
    this.battery.next(data);
  }

  getBatteryStatus(): BehaviorSubject<any> {
    return this.battery;
  }

  async takeOnlyImage(type) {
    try {
      return new Promise(async (resolve, reject) => {
        let cameraPicture;
        let moveFile, checkfile;
        cameraPicture = await Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 25,
        });
        console.log('cameraPicture', cameraPicture);
        let imageData: string = cameraPicture.dataUrl;
        resolve(imageData);
      });
    } catch (e) {
      console.log(e);
    }
  }

  async takeImage(type) {
    try {
      return new Promise(async (resolve, reject) => {
        let cameraPicture;
        let moveFile, checkfile;
        cameraPicture = await Camera.getPhoto({
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
          quality: 25,
        });
        console.log('cameraPicture', cameraPicture);
        // let imageData: string = cameraPicture.dataUrl
        let picdata = cameraPicture.base64String;
        const cropComponent = await this.modalCtrl.create({
          component: CropImageComponent,
          componentProps: { imgUrl: picdata },
          cssClass: '',
          showBackdrop: true,
          animated: true,
        });
        cropComponent.present();
        cropComponent.onDidDismiss().then(async (data) => {
          if (data.data == 'data:,') {
            this.alertService.showAlert('Alert', 'Please again take photo');
          } else if (data) {
            let path = data.data.replace('data:image/jpeg;base64,', '');
            let size = path.length / 1024;
            let chargesFormatValue = size.toFixed(2).toString().split('.');
            if (chargesFormatValue[1] <= '49') {
              size = Math.floor(size);
            } else {
              size = Math.ceil(size);
            }
            if (size < 2000) {
              resolve({ path: path, size: size });
              console.log('imageData for UploadConsent', data.data);
              resolve(data.data.replace('data:image/jpeg;base64,', ''));
            } else {
              this.alertService.showAlert(
                'Alert',
                'Image Size should be lesser then (2-MB),Please Capture again!'
              );
            }
          }
        });
        // console.log("imageData", data.data)
      });
    } catch (error) {
      console.log(error, 'error');
    }
  }

  async saveReadMethod(url, existingPathValue?) {
    return new Promise(async (resolve, reject) => {
      // let existingPath = existingPathValue ? existingPathValue : undefined
      await this.saveImageInFolder(url).then(async (imagePath) => {
        let pathName = imagePath;
        await this.readImageFile(pathName).then((path: any) => {
          let size = path.length / 1024;
          let chargesFormatValue = size.toFixed(2).toString().split('.');
          if (chargesFormatValue[1] <= '49') {
            size = Math.floor(size);
          } else {
            size = Math.ceil(size);
          }
          resolve({ Name: pathName, path: path, size: size });
          // return response;
        });
      });
    });
  }

  async saveImageInFolder(url, existingPath?) {
    try {
      return new Promise(async (resolve, reject) => {
        const time = new Date().getTime();
        const imageData = url;
        const filePath = `WebPImage/Doc${time}.jpg`;
        const directory =
          +this.getAndroidV() > 10 ? Directory.Documents : Directory.External;
        await Filesystem.writeFile({
          path: filePath,
          data: imageData,
          directory: directory, // Use Directory.Data for the private folder you created
        }).catch((err) => {
          console.log(err);
        });
        // const readedImageFromPhoneDirectory = await this.readImageFile(filePath);
        // alert(filePath);
        console.log('Image saved to folder:', filePath);
        resolve(filePath);
      });
    } catch (error) {
      alert(error);
      console.error('Error saving image:', error);
    }
  }

  async readImageFile(path) {
    try {
      return new Promise(async (resolve, reject) => {
        const filePath = path;
        const directory =
          +this.getAndroidV() > 10 ? Directory.Documents : Directory.External;
        const image = await Filesystem.readFile({
          path: filePath,
          directory: directory,
        });
        // alert(image);
        console.log('read image', image.data);
        resolve(image.data);
      });
    } catch (err) {
      alert(err);
      console.log(err);
    }
  }

  getDroomAccessToken() {
    try {
      return new Promise((resolve, reject) => {
        this.globalLodingPresent('Please Wait...');
        let link = `https://apig.droom.in/dss/v1/oauth/token`;
        let body = {
          grant_type: 'password',
          client_id: '9486339',
          client_secret:
            'dd8538e4e1dea8e218ca1f65dce6d63faecb5e9628f2d58adbf161667acc8943',
          username: 'kaustubh.prahladka@janabank.com',
          password: '2ArAHY322',
        };
        this.http.post(link, body, '').then((response) => {
          let res = JSON.parse(response.data);
          if (res.access_token.length > 0) {
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('refresh_token', res.refresh_token);
            this.globalLodingDismiss();
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.log(`getDroomAccessToken ${error}`);
    }
  }

  async convertToWebPTest(data, sizeReq?: number) {
    try {
      this.globalLodingPresent('Please Wait...');
      let webpResult;
      let folderImage = data;
      const path =
        +this.getAndroidV() > 10
          ? `/storage/emulated/0/Documents/${data}`
          : `/storage/emulated/0/Android/data/com.jfs.vlwebp/files/${data}`;
      if (WebPConvertor) {
        const result = await WebPConvertor['convertToWebP']({
          path: path,
          // `/storage/emulated/0/Android/data/com.jfs.vlwebp/files/${data}`,
          // `/storage/emulated/0/Documents/${data}`,
        });
        if (result.data) {
          let pathData = result.data;
          let size = result.data.length / 1000;
          let chargesFormatValue = size.toFixed(2).toString().split('.');
          if (chargesFormatValue[1] <= '49') {
            size = Math.floor(size);
          } else {
            size = Math.ceil(size);
          }
          if (size <= sizeReq) {
            webpResult = { path: pathData, size: size };
            this.saveImageInFolder(webpResult.path);
            this.globalLodingDismiss();
            return webpResult;
          } else {
            let imgName = `data:image/jpeg;base64,${pathData}`;
            await this.saveImageInFolder(imgName).then((resp: any) => {
              this.convertToWebPTest(resp);
            });
          }
        }
      }
      this.globalLodingDismiss();
    } catch (e) {
      this.globalLodingDismiss();
      alert(`Error From WebPConvertor Plugin => ${e}`);
    }
  }

  /**
   * @method checkImageLength
   * @description checking the image length was in under requirement.
   * @author HariHaraSuddhan S
   */

  checkImageLength(size) {
    try {
      let requiredSize: number;
      let finalsize: boolean;
      if ('signpic') {
        requiredSize = 105;
        finalsize = size < requiredSize ? true : false;
      } else {
        finalsize = true;
      }
      if (finalsize) return true;
      else
        this.alertService.showAlert(
          'Alert',
          `Image Size should be lesser then ( ${requiredSize}.KB),Please Capture again!`
        );
    } catch (error) {
      console.log(error);
    }
  }

  onFileSelect(event) {
    if (event.target.files && event.target.files[0]) {
      this.globalLodingPresent('Please Wait...');
      var filename = event.target.files[0].name.toString().replace(/ /gi, '_');
      let fileExtn = filename.split('.')[1];
      var fileType = event.target.files[0].type;
      let setFileType: any;
      if (fileExtn == 'jpg' || fileExtn == 'jpeg' || fileExtn == 'png') {
        setFileType = 'image';
      } else {
        setFileType = 'file';
      }
      console.log('filename-filee', filename);
      console.log('event.target.files', event.target.files);
      if (
        fileType == 'application/pdf' ||
        fileType == 'application/msword' ||
        fileType == 'application/vnd.ms-excel' ||
        fileType ==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType ==
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType == 'text/plain' ||
        fileType == 'image/png' ||
        fileType == 'image/jpeg'
      ) {
        var reader = new FileReader();
        const zoneOriginalInstance = (reader as any)[
          '__zone_symbol__originalInstance'
        ];
        zoneOriginalInstance.onload = async (file: any) => {
          console.log('reader', file);
          console.log('event.targer', file.target.result);
          // here this method will return base64 string :D
          if (file.target.result) {
            let imgPath = 'Pictures/';
            let picdata = file.target.result;
            const fileName = new Date().getTime() + '.pdf';
            let moveFile = await Filesystem.writeFile({
              path: fileName,
              data: picdata,
              directory: Directory.Data,
            });
            console.log('moveFile', moveFile);
            let document = { data: picdata, type: 'PDF' };
            return document;
          }
        };
        zoneOriginalInstance.readAsDataURL(event.target.files[0]);
        zoneOriginalInstance.onerror = function (error) {
          console.log('Error: ', error);
        };
      }
    }
  }
}
