import { Injectable } from '@angular/core';
import { Device } from '@awesome-cordova-plugins/device/ngx';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStateService {
  sys_token: string;
  _img: any;
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

  _borrower: any;
  applicationDataChangeDetector = [];
  _refId: any;
  constructor(public device: Device) {}

  get deviceId() {
    return this.device.uuid;
  }
  get androidV() {
    return this.device.version;
  }

  get localUrlEndpoint() {
    let localUrl = {
      url: 'http://192.168.0.91:9081/laps/rest/LOSMobileRestServices/',
      local: true,
    };
    return localUrl;
  }

  get masterSubmitUrlEndpoint() {
    let masSub = {
      url: 'http://192.168.0.91:9081/laps/rest/LOSMobileRestServices/',
      local: true,
    };
    return masSub;
  }

  get otherimg() {
    return this._img;
  }

  set otherimg(value) {
    this._img = value;
  }

  get timeStamp() {
    let date = new Date();
    let n = date.toDateString();
    let time = date.toLocaleTimeString();
    let timestamp = n + ' ' + time;
    return timestamp;
  }

  get systemDate() {
    let sysDate = new Date();
    return sysDate;
  }

  get fullStateMaster() {
    return this._stateMaster;
  }

  set fullStateMaster(value) {
    this._stateMaster = value;
  }

  set fullCityMaster(value) {
    this._cityMaster = value;
  }

  get fullCityMaster() {
    return this._cityMaster;
  }

  get fullProductList() {
    return this._productList;
  }

  set fullProductList(value) {
    this._productList = value;
  }

  get genderList() {
    return this._Gender;
  }

  set genderList(value) {
    this._Gender = value;
  }

  get incomeTypeList() {
    return this._IncomeType;
  }

  set incomeTypeList(value) {
    this._IncomeType = value;
  }
  get employementList() {
    return this._Employment;
  }

  set employementList(value) {
    this._Employment = value;
  }

  get titleList() {
    return this._Title;
  }

  set titleList(value) {
    this._Title = value;
  }
  set documentList(val) {
    this._docList = val;
  }
  get documentList() {
    return this._docList;
  }
  get relationShipList() {
    return this._RelationShip;
  }

  set relationShipList(value) {
    this._RelationShip = value;
  }

  get interestRateType() {
    return this._InterestType;
  }

  set interestRateType(value) {
    this._InterestType = value;
  }

  set applicationSubStatus(val) {
    this._appStatus = val;
  }
  get applicationSubStatus() {
    return this._appStatus;
  }

  set scoreCardChecked(val) {
    this._refId = val;
  }
  get scoreCardChecked() {
    return this._refId;
  }

  set branchCode(val) {
    this._branch = val;
  }
  get branchCode() {
    return this._branch;
  }

  set selectedCities(val) {
    this._selectedCities = val;
  }

  get selectedCities() {
    return this._selectedCities;
  }

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
    if (pageIndex == -1) {
      this.applicationDataChangeDetector.push({
        pageName: pagename,
        changeDetected: formActivatorStatus,
      });
    } else {
      this.applicationDataChangeDetector[pageIndex].pageName = pagename;
      this.applicationDataChangeDetector[pageIndex].changeDetected =
        formActivatorStatus;
    }
  }

  resetapplicationDataChangeDetector() {
    this.applicationDataChangeDetector = [];
  }

  get token() {
    let timestamp = new Date().getTime();
    let RanNum = Math.floor(Math.random() * 90000000) + 10000000;
    this.sys_token = timestamp.toString() + '_' + RanNum.toString();
    return this.sys_token;
  }
}
