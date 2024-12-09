import { EventEmitter, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
// import { GlobalfunctionsProvider } from "../globalfunctions/globalfunctions";
// import { File } from '@ionic-native/file';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { BehaviorSubject, Subject } from 'rxjs';
import { GlobalService } from './global.service';
import { RestService } from 'src/providers/rest.service';
import { environment } from 'src/environments/environment';
import { Plugins } from '@capacitor/core';
import { CustomLoadingControlService } from './custom-loading-control.service';
const { WebPConvertorBase64 } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class DataPassingProviderService {
  _coAppFlag: any;
  _guaFlag: any;
  _sqlObj: any;
  _cifdata: any;
  _loading: any;
  _customerType: any;
  _loantype: any;
  _profileimg: any;
  _entiprofileimg: any;
  _refId: any;
  _Id: any;
  _gId: any;
  _borrower: any;
  //   _SubmitStatus: string;
  _EditSaveStatus: any = [];
  //   _address: any;
  _custType: any;
  //   username: any;
  uniqueId: any;
  //   karzaEndPoint: any;
  urlEndPoint: any;
  urlEndPointStat: any;
  _aadharNum: any;
  _panNum: any;
  _jana: any;
  _URN: any;
  _pdt: any;

  eventValue = new Subject();

  assetsEvent = new Subject();

  leadEvent = new Subject();

  nomineeValue: BehaviorSubject<string> = new BehaviorSubject<string>('');
  loginUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  constructor(
    // public global: GlobalService,
    public device: Device,
    public toastCtrl: ToastController, // public master: RestService,
    public loadingService: CustomLoadingControlService
  ) {
    //     // this.urlEndPoint = this.global.localUrlEndpoint.url; // Local URL
    //     // this.urlEndPointStat = this.global.localUrlEndpoint.local; // Local URL
    this.urlEndPoint = environment.apiURL; // UAT URL
    // this.karzaEndPoint = 'Y';
    this.urlEndPointStat = environment.local; // UAT URL
    //     //this.CheckAuditFile();
  }

  publishEvent(val, title?) {
    if (title) {
      this.assetsEvent.next({ value: val, title: title });
    } else {
      this.assetsEvent.next(val);
    }
  }
  getEventsObservable(): Subject<any> {
    return this.assetsEvent;
  }

  //   getSystemDate() {
  //     let sysDate = new Date();
  //     //console.log("sysDate" + sysDate);
  //     return sysDate;
  //   }

  getToday(): string {
    var yesterday = new Date(Date.now());
    let composedDate = yesterday.toISOString().split('T')[0];
    return composedDate;
  }

  getEighteenFromToday(): string {
    var yesterday = new Date(Date.now() - 567648e6);
    return yesterday.toISOString().split('T')[0];
  }

  //   dateFormatterFn(value) {
  //     let year = value.substring(0, 4);
  //     let month = value.substring(5, 7);
  //     let day = value.substring(8, 10);
  //     let formattedDate = day + month + year;
  //     return formattedDate;
  //   }

  getloanType() {
    return this._loantype;
  }

  setloanType(value) {
    // console.log("datapass loan value ==>" + value);
    this._loantype = value;
  }

  setProfileImage(value) {
    // console.log("profile img value ==>" + value);
    this._profileimg = value;
  }
  getProfileImage() {
    return this._profileimg;
  }

  setEntiProfileImage(value) {
    // console.log("enti profile img value ==>" + value);
    this._entiprofileimg = value;
  }
  getEntiProfileImage() {
    return this._entiprofileimg;
  }

  setborrowerType(value) {
    this._borrower = value;
  }
  getborrowerType() {
    return this._borrower;
  }

  setrefId(value) {
    // console.log("refId datapass ==>" + value);
    this._refId = value;
  }
  getrefId() {
    return this._refId;
  }
  setId(value) {
    // console.log("Id datapass ==>" + value);
    this._Id = value;
  }
  getId() {
    return this._Id;
  }

  //   setSaveStatus(value) {
  //     this._SubmitStatus = value;
  //   }

  //   getSaveStatus() {
  //     return this._SubmitStatus;
  //   }

  async presentToastMiddle(value) {
    const toast = await this.toastCtrl.create({
      message: value,
      duration: 2000,
      position: 'middle',
    });
    toast.present();
  }

  setgId(value) {
    this._gId = value;
  }
  getgId() {
    return this._gId;
  }
  leadId;
  setLeadId(leadId) {
    this.leadId = leadId;
  }
  getLeadId() {
    return this.leadId;
  }

  //   set_address(value) {
  //     this._address = value;
  //   }
  //   get_address() {
  //     return this._address;
  //   }
  //   setusername(value) {
  //     this.username = value;
  //   }
  //   getusername() {
  //     return this.username;
  //   }
  //   // setEditSaveStatus(value) {
  //   //   this._EditSaveStatus.push(value);
  //   // }
  //   // getEditSaveStatus() {
  //   //   return this._EditSaveStatus;
  //   // }
  setUniqueId(value) {
    this.uniqueId = value;
  }
  getUniqueId() {
    return this.uniqueId;
  }
  setCustType(value) {
    this._custType = value;
  }

  getCustType() {
    return this._custType;
  }
  setAdhaarNum(value) {
    this._aadharNum = value;
    // console.log("aadhar num pass: " + value);
  }
  getAdhaarNum() {
    return this._aadharNum;
  }
  setPanNum(value) {
    this._panNum = value;
    // console.log("Pan num pass: " + value);
  }
  getPanNum() {
    return this._panNum;
  }
  setJanaCenter(value) {
    this._jana = value;
    // console.log("_jana pass: " + value);
  }
  getJanaCenter() {
    return this._jana;
  }

  getCifData() {
    return this._cifdata;
  }

  setCifData(value) {
    // console.log("datapass cifdata value ==>" + value);
    this._cifdata = value;
  }

  setURN(urn) {
    this._URN = urn;
  }
  getURN() {
    return this._URN;
  }
  setCustomerType(type) {
    this._customerType = type;
    localStorage.setItem('customerType', type);
  }
  getCustomerType() {
    // return this._customerType;
    return this._customerType
      ? this._customerType
      : localStorage.getItem('customerType');
  }
  setPDT(pdt) {
    this._pdt = pdt;
  }
  getPDT() {
    return this._pdt;
  }
  setGlobalSQLiteObj(val) {
    this._sqlObj = val;
  }
  getGlobalSQLiteObj() {
    return this._sqlObj;
  }
  setCoAppFlag(val) {
    this._coAppFlag = val;
  }
  getCoAppFlag() {
    return this._coAppFlag;
  }
  setGuaFlag(val) {
    this._guaFlag = val;
  }
  getGuaFlag() {
    return this._guaFlag;
  }

  // Method to update the value
  updateNomineeValue(value: string) {
    this.nomineeValue.next(value);
  }

  loginUserName(value: boolean) {
    this.loginUser.next(value);
  }

  getAndroidV() {
    return this.device.version;
  }

  getYearList() {
    return [
      '2024',
      '2023',
      '2022',
      '2021',
      '2020',
      '2019',
      '2018',
      '2017',
      '2016',
      '2015',
    ];
  }

  /**
   * @method convertToWebPBase64
   * @description Compressing the captured actual image size.
   * @author HariHaraSuddhan S
   */

  async convertToWebPBase64(data, sizeReq?: number) {
    try {
      this.loadingService.globalLodingPresent('Please Wait...');
      let webpResult;
      if (WebPConvertorBase64) {
        const result = await WebPConvertorBase64['convertToWebP']({
          base64: data,
        });
        if (result) {
          let pathData = result.data;
          let size = result.data.length / 1000;
          let chargesFormatValue = size.toFixed(2).toString().split('.');
          if (chargesFormatValue[1] <= '49') {
            size = Math.floor(size);
          } else {
            size = Math.ceil(size);
          }
          webpResult = { path: pathData, size: size };
          this.loadingService.globalLodingDismiss();
          return webpResult;
        } else {
          this.loadingService.globalLodingDismiss();
        }
      }
      this.loadingService.globalLodingDismiss();
    } catch (e) {
      this.loadingService.globalLodingDismiss();
      alert(`Error From WebPConvertor Plugin => ${e}`);
    }
  }

  checkIsJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * @method formatDateString
   * @description Function helps to change the Date into string.
   * @author HariHaraSuddhan S
   */

  formatDateString(dateString: string): string {
    const dateParts: string[] = dateString.split('-');
    const day: string = dateParts[0].padStart(2, '0');
    const monthString: string = dateParts[1];
    const year: string = dateParts[2];
    const month: number = new Date(`${monthString} 01, ${year}`).getMonth() + 1;
    const formattedMonth: string = month.toString().padStart(2, '0');
    return `${year}-${formattedMonth}-${day}`;
  }

  /**
   * @method convertToString
   * @description Function helps to array of values into string.
   * @author HariHaraSuddhan S
   */
  convertToString(value: [string]) {
    return Array.isArray(value) ? value.toString() : value;
  }
}
