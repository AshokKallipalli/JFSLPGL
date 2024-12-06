import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import {
  NavController,
  Platform,
  LoadingController,
  MenuController,
} from '@ionic/angular';
import { GlobalService } from 'src/providers/global.service';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { JfshomePage } from '../jfshome/jfshome.page';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { environment } from 'src/environments/environment';
import { OnRoadPriceService } from 'src/providers/on-road-price.service';
import { BioNavigatorService } from 'src/providers/BioMetricPlugin/bio-navigator.service';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

// import 'rxjs/add/operator/map';

declare var cordova: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  todayDate: any = new Date();
  @ViewChild('loginDiv') logindiv: ElementRef;
  updateDate: string;
  lastLoginDate: string;
  public userData: any;
  deviceImei: string;
  version: any;
  orgscode: any;
  logResult: any;
  urlType: any;
  userGroupsName: any;
  versionDetails: string;
  patch: string;
  todayLoginDate: any = new Date();
  masterData: {
    Setupmastval: { setupfinal: any; setupversion: any; setupmodule: string };
  };
  masterDataValues: any;
  masterDataValuesTest: any;
  versionvalue: any;

  droomModel: [];
  customPopoverOptions = {
    cssClass: 'custom-popover',
  };
  OhpDocsArray = [];
  @ViewChild('fileref') fileRef: ElementRef;
  capacitorVersion: number = 1;
  constructor(
    public navCtrl: NavController,
    public network: Network,
    public globalData: DataPassingProviderService,
    public loadCtrl: LoadingController,
    public platform: Platform,
    public master: RestService,
    public sqliteProvider: SqliteService,
    public globFunc: GlobalService,
    public sqlSupport: SquliteSupportProviderService,
    public device: Device,
    public router: Router,
    public renderer: Renderer2,
    public bioService: BioNavigatorService,
    private appVersion: AppVersion,
    public menuCtrl: MenuController,
    public orpService: OnRoadPriceService,
    public alertService: CustomAlertControlService
  ) {
    this.userData = [{ username: '', password: '' }];
    this.userData.username = '0024CH';
    this.userData.password = 'Laps@1234';
    this.patch = this.master.patch;
  }

  ionViewDidLeave() {
    this.menuCtrl.swipeGesture(true);
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      var self = this;
      if (parseFloat(self.device.version) >= 9.0) {
        self.deviceImei = self.device.uuid;
        localStorage.setItem('imei', self.deviceImei);
        console.log('UUID: ' + self.deviceImei);
      } else {
        cordova.plugins.IMEI(function (err, imei) {
          self.deviceImei = imei;
          localStorage.setItem('imei', self.deviceImei);
          console.log('imei: ' + self.deviceImei);
        });
      }
      this.urlType = environment.local;
      this.appVersion.getVersionNumber().then((version) => {
        this.versionDetails = version;
      });
    });
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.menuCtrl.swipeGesture(false);
      setTimeout(() => {
        this.checkappData();
      }, 3000);
    });
  }

  checkappData() {
    let todayDate = moment().format('YYYY-MM-DD');
    this.sqliteProvider
      .appdatacheck()
      .then((data) => {
        // console.log(data);
        if (data.length > 0) {
          let appcreatedDate = data[0].appDate;
          //let appcreatedDate ="2018-01-01"
          let check = moment(appcreatedDate).diff(todayDate, 'days');
          if (check >= 31) {
            let toDate = moment().subtract(31, 'days').format('YYYY-MM-DD');
            this.sqliteProvider
              .deleteAuditTrailbydate(appcreatedDate, toDate)
              .then((data) => {
                console.log(data);
              })
              .catch((Error) => {
                console.log('Failed!');
              });
          }
        } else {
          this.sqliteProvider
            .appdatainsert(todayDate)
            .then((data) => {
              console.log(data);
            })
            .catch((Error) => {
              console.log('Failed!');
            });
        }
      })
      .catch((Error) => {
        console.log('Failed!');
      });
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  AppversionCheck() {
    let dd = this.todayDate.getDate();
    let mm = this.todayDate.getMonth() + 1; //January is 0!
    let yyyy = this.todayDate.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    this.updateDate = yyyy + '-' + mm + '-' + dd;
    this.sqliteProvider.getApplicationVersionCheck().then(
      (data) => {
        if (data.length > 0) {
          if (this.updateDate != data[0].AppDate) {
            this.mdmVersionCheck();
          } else {
            this.login();
          }
        } else {
          this.mdmVersionCheck();
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  mdmVersionCheck() {
    console.log(this.versionDetails);
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert',
        'Enable Internet connection / First Time Login Must be Online.'
      );
    } else {
      let body = {
        VersionId: this.versionDetails,
        Module: 'GL',
      };
      this.globFunc.globalLodingPresent('loading...');
      this.master
        .restApiCallAngular('VersionCheck', body)
        .then((data) => {
          let resp = <any>data;
          if (resp.ErrorCode === '000') {
            this.sqliteProvider
              .insertApplicationVersionCheck(this.updateDate)
              .then((data) => {
                this.globFunc.globalLodingDismiss();
                this.login();
              })
              .catch((Error) => {
                console.log('Failed!', Error);
              });
          } else {
            if (
              resp.ErrorDesc == 'App Version Mismatch' &&
              resp.ErrorCode === '001'
            ) {
              this.globFunc.globalLodingDismiss();
              let dd = this.todayDate.getDate();
              let mm = this.todayDate.getMonth() + 1; //January is 0!
              let yyyy = this.todayDate.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }
              this.todayLoginDate = yyyy + '-' + mm + '-' + dd;
              this.sqliteProvider
                .getApplicationVersionCheck()
                .then((data) => {
                  if (data.length > 0) {
                    if (this.todayLoginDate == data[0].AppDate) {
                      this.alertService
                        .confirmationVersionAlert(
                          'Version Update',
                          'Your Current Version is ' +
                            resp.CurrentVersion +
                            ' Please Update!'
                        )
                        .then((data) => {
                          if (data) {
                            this.login();
                          }
                        })
                        .catch((Error) => {
                          console.log(Error);
                        });
                    } else {
                      this.alertService.showAlert(
                        'Alert',
                        'login disabled as you are using older version of the APK. To Proceed please update the APK to the latest Version and Login again'
                      );
                      setTimeout(() => {
                        // this.platform.exitApp();
                      }, 2000);
                    }
                  } else {
                    this.sqliteProvider
                      .insertApplicationVersionCheck(this.todayLoginDate)
                      .then((data) => {
                        this.alertService
                          .confirmationVersionAlert(
                            'Version Update',
                            'Your Current Version is ' +
                              resp.CurrentVersion +
                              ' Please Update!'
                          )
                          .then((data) => {
                            if (data) {
                              this.login();
                            }
                          })
                          .catch((Error) => {
                            console.log(Error);
                          });
                      })
                      .catch((Error) => {
                        console.log('Failed!', Error);
                      });
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert', resp.ErrorDesc);
            }
          }
        })
        .catch((err) => {
          console.log(err);
          this.globFunc.globalLodingDismiss();
          this.alertService.showAlert('Alert!', 'No Response From Server!');
        });
    }
  }

  onClickLoginBtn() {
    this.renderer.addClass(this.logindiv.nativeElement, 'open');
  }

  close() {
    this.renderer.removeClass(this.logindiv.nativeElement, 'open');
  }

  login() {
    this.sqliteProvider.getLastLogin('LoginService Response').then(
      (data) => {
        let resp = data;
        let len = data.length;
        if (len == 0) {
          this.lastLoginDate = '';
        } else {
          this.lastLoginDate = resp[len - 1].Timestamp;
        }
        let body = {
          Login: {
            Loginuser: this.userData.username,
            Loginpasswd: this.userData.password,
            IMEI: this.deviceImei,
            LLdate: this.lastLoginDate,
            Version: this.versionDetails,
            Brach_code: '',
            Module: 'GL',
          },
        };
        if (
          this.userData.username == undefined ||
          this.userData.username == null ||
          this.userData.username == ''
        ) {
          this.alertService.showAlert('Alert!', 'Please enter Username!');
        } else if (
          this.userData.password == undefined ||
          this.userData.password == null ||
          this.userData.password == ''
        ) {
          this.alertService.showAlert('Alert!', 'Please enter password!');
        } else {
          if (this.network.type == 'none' || this.network.type == 'unknown') {
            this.globFunc.globalLodingPresent(
              'Please wait... Fetching master data!'
            );
            this.sqliteProvider
              .getDocuments()
              .then((docdata) => {
                if (docdata.length > 0) {
                  this.sqliteProvider
                    .getUserIDLoginDetails(this.userData.username)
                    .then()
                    .then((user) => {
                      if (user.length > 0) {
                        localStorage.setItem('username', user[0].userID);
                        localStorage.setItem('userGroups', user[0].userGroups);
                        this.sqliteProvider
                          .forOfflineLogin(
                            this.userData.username,
                            this.userData.password
                          )
                          .then((data) => {
                            if (data.length > 0) {
                              this.orgscode = data[0].orgscode;
                              localStorage.setItem('roname', data[0].ro_name);
                              this.globalData.setJanaCenter(this.orgscode);
                              localStorage.setItem('janaCenter', this.orgscode);
                              this.globFunc.globalLodingDismiss();
                              this.userData.username = '';
                              this.userData.password = '';
                              this.getUserGroupsNames(this.userData.username);
                              console.log(this.userGroupsName);
                              this.globalData.loginUserName(true);
                              this.router.navigate(['/ExistingPage'], {
                                queryParams: {
                                  username: this.userData.username,
                                },
                                skipLocationChange: true,
                                replaceUrl: true,
                              });
                            } else {
                              this.globFunc.globalLodingDismiss();
                              this.alertService.showAlert(
                                'Alert!',
                                'Username or Password Invalid!!'
                              );
                            }
                          })
                          .catch((Error) => {
                            console.log('Failed!');
                          });
                      }
                    });
                } else {
                  if (
                    this.network.type == 'none' ||
                    this.network.type == 'unknown'
                  ) {
                    this.globFunc.globalLodingDismiss();
                    this.alertService.showAlert(
                      'Alert',
                      'Enable Internet connection / First Time Login Must be Online.'
                    );
                  } else {
                    this.getProductList();
                  }
                }
              })
              .catch((Error) => {
                console.log('Failed!');
              });
          } else {
            this.globFunc.globalLodingPresent(
              'Please wait... Fetching master data!'
            );
            this.master
              .restApiCallAngular('LoginService', body)
              .then(
                (data) => {
                  if ((<any>data).StatusCode === '000') {
                    this.logResult = <any>data;
                    this.orgscode = (<any>data).Orgscode;
                    localStorage.setItem(
                      'roname',
                      this.globFunc.basicEnc((<any>data).UserName)
                    );
                    localStorage.setItem(
                      'userPrdSubCode',
                      (<any>data).UserPrdId
                        ? JSON.stringify((<any>data).UserPrdId)
                        : JSON.stringify([])
                    );
                    if (this.urlType) {
                      this.globalData.setJanaCenter('2351');
                      localStorage.setItem('janaCenter', '2351');
                    } else {
                      this.globalData.setJanaCenter(this.orgscode);
                      localStorage.setItem('janaCenter', this.orgscode);
                    }
                    localStorage.setItem(
                      'username',
                      this.globFunc.basicEnc((<any>data).LPuserID)
                    );
                    localStorage.setItem('userGroups', (<any>data).UserGroups);
                    this.sqliteProvider
                      .insertLoginDetails(
                        this.userData.username,
                        this.userData.password,
                        (<any>data).Orgscode,
                        (<any>data).Status,
                        (<any>data).StatusCode,
                        (<any>data).UserName,
                        (<any>data).LPuserID,
                        (<any>data).UserGroups
                      )
                      .then((data) => {
                        this.getversion();
                      })
                      .catch((Error) => {
                        console.log('Failed!');
                      });
                  } else if ((<any>data).StatusCode === '001') {
                    let status = (<any>data).Status.toUpperCase();
                    if (status == 'USERBLOCKED') {
                      this.globFunc.globalLodingDismiss();
                      alert('User Blocked, please contact administrator!');
                    } else if (status == 'ACCLOCKED') {
                      this.globFunc.globalLodingDismiss();
                      alert('Acc Blocked, please contact administrator!');
                    } else if (status == 'FAILED') {
                      this.globFunc.globalLodingDismiss();
                      alert('Username or Password Invalid!!');
                    } else {
                      this.globFunc.globalLodingDismiss();
                      alert((<any>data).Status);
                    }
                  } else {
                    this.globFunc.globalLodingDismiss();
                    this.logResult = undefined;
                    alert((<any>data).Status);
                  }
                },
                (err) => {
                  if (err.name == 'TimeoutError') {
                    this.globFunc.globalLodingDismiss();
                    alert(err.message);
                  } else {
                    this.globFunc.globalLodingDismiss();
                    alert('No Response from Server!');
                  }
                }
              )
              .catch((err) => {
                this.globFunc.globalLodingDismiss();
                alert('No Response from Server!');
              });
          }
        }
      },
      (err) => {
        console.log('error: ' + err);
      }
    );
  }

  getversion() {
    this.sqliteProvider.getversionDetails().then((data) => {
      this.masterData = {
        Setupmastval: {
          setupfinal: '0',
          setupversion: '0',
          setupmodule: 'GL',
        },
      };
      if (data.length > 0) {
        let version = data[0].version;
        console.log(version, 'version inside setupresp call');
        this.masterData = {
          Setupmastval: {
            setupfinal: version,
            setupversion: version,
            setupmodule: 'GL',
          },
        };
        this.master.restApiCallAngular('Setupresp', this.masterData).then(
          (result) => {
            if (result != undefined && result != null && result != '') {
              if (version == (<any>result).version) {
                this.checklogin();
              } else {
                if ((<any>result).errorCode === '000') {
                  this.getProductList();
                } else if ((<any>result).errorCode === '002') {
                  this.checklogin();
                } else {
                  this.globFunc.globalLodingDismiss();
                  this.alertService.showAlert('Alert', (<any>result).errorDesc);
                }
              }
            }
          },
          (err) => {
            if (err.name == 'TimeoutError') {
              this.globFunc.globalLodingDismiss();
              alert(err.message);
            } else {
              this.globFunc.globalLodingDismiss();
              alert('No Response from Server!');
            }
          }
        );
      } else {
        this.checklogin();
      }
    });
  }

  checklogin() {
    this.sqliteProvider
      .getDocuments()
      .then((data) => {
        if (data.length > 0) {
          this.globFunc.globalLodingDismiss();
          this.userData.username = '';
          this.userData.password = '';
          this.globalData.loginUserName(true);
          this.router.navigate(['/ExistingPage'], {
            queryParams: { username: this.userData.username },
            skipLocationChange: true,
            replaceUrl: true,
          });
        } else {
          if (this.network.type == 'none' || this.network.type == 'unknown') {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert',
              'Enable Internet connection / First Time Login Must be Online.'
            );
          } else {
            this.getProductList();
          }
        }
      })
      .catch((Error) => {
        console.log('Failed!');
      });
  }

  getUserGroupsNames(value) {
    let userGroup;
    let username = value;
    this.sqliteProvider.getUserIDLoginDetails(username).then((data) => {
      if (data.length > 0) {
        userGroup = JSON.parse(data[0].userGroups);
        for (let i = 0; i < userGroup.length; i++) {
          this.sqliteProvider
            .getUserGroupsNameBasedOnId(userGroup[i])
            .then((data) => {
              this.userGroupsName.push(data[0].UserGroupName);
            });
        }
      }
    });
  }

  getProductList() {
    this.master.restApiCallAngular('Setupresp', this.masterData).then(
      (result) => {
        const vlResult = result;
        this.masterDataValues = (<any>vlResult).Setupmaster;
        console.log(this.masterDataValues, 'GL Masters Setupresp');
        if (result != undefined && result != null && result != '') {
          if ((<any>result).errorCode === '000') {
            this.masterDataValuesTest = (<any>result).Setupmaster;
            console.log(this.masterDataValuesTest, 'GL Masters Setupresp');
            this.versionvalue = (<any>result).version;

            this.sqliteProvider.removeProduct().then((data) => {
              if (
                !this.isEmpty(this.masterDataValues.ProductMaster) &&
                this.masterDataValues.ProductMaster.length > 0
              ) {
                this.sqlSupport
                  .InsertProductValue(this.masterDataValues.ProductMaster)
                  .then((data) => {
                    this.getOrganisations();
                  });
              } else {
                this.globFunc.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Product list values are empty!'
                );
              }
            });
          } else if ((<any>result).errorCode === '002') {
            this.checklogin();
          } else {
            this.globFunc.globalLodingDismiss();
            alert((<any>result).errorDesc);
          }
        }
      },
      (err) => {
        if (err.name == 'TimeoutError') {
          this.globFunc.globalLodingDismiss();
          alert(err.message);
        } else {
          this.globFunc.globalLodingDismiss();
          alert('No Response from Server!');
        }
      }
    );
  }

  getOrganisations() {
    if (
      !this.isEmpty(this.masterDataValues.OrganizationMaster) &&
      this.masterDataValues.OrganizationMaster.length > 0
    ) {
      this.sqliteProvider.removeOrganisation().then((data) => {
        this.sqlSupport
          .InsertOrganisation(this.masterDataValues.OrganizationMaster)
          .then((data) => {
            this.getRepayments();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Organizations values are empty!');
    }
  }

  getRepayments() {
    if (
      !this.isEmpty(this.masterDataValues.ModeofRepayment) &&
      this.masterDataValues.ModeofRepayment.length > 0
    ) {
      this.sqliteProvider
        .removeAllMasterData('ModeofRepayment')
        .then((data) => {
          this.sqlSupport
            .insertAllMasterData(
              this.masterDataValues.ModeofRepayment,
              'ModeofRepayment'
            )
            .then((data) => {
              this.getSourcingChannel();
            });
        });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Mode of repayment values are empty!'
      );
    }
  }

  getSourcingChannel() {
    if (
      !this.isEmpty(this.masterDataValues.SourcingChannel) &&
      this.masterDataValues.SourcingChannel.length > 0
    ) {
      this.sqliteProvider
        .removeAllMasterData('SourcingChannel')
        .then((data) => {
          this.sqlSupport
            .insertAllMasterData(
              this.masterDataValues.SourcingChannel,
              'SourcingChannel'
            )
            .then((data) => {
              this.getCustomerType();
            });
        });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Sourcing channel values are empty!'
      );
    }
  }
  getCustomerType() {
    if (
      !this.isEmpty(this.masterDataValues.CustomerType) &&
      this.masterDataValues.CustomerType.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('CustomerType').then((data) => {
        this.sqlSupport
          .insertAllMasterData(
            this.masterDataValues.CustomerType,
            'CustomerType'
          )
          .then((data) => {
            this.getTitleMaster();
          });
      });
    } else {
      // this.globFunc.globalLodingDismiss();
      this.getTitleMaster();
      this.alertService.showAlert('Alert!', 'Customer Type values are empty!');
    }
  }
  getTitleMaster() {
    if (
      !this.isEmpty(this.masterDataValues.TitleMaster) &&
      this.masterDataValues.TitleMaster.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('TitleMaster').then((data) => {
        this.sqlSupport
          .insertAllMasterData(this.masterDataValues.TitleMaster, 'TitleMaster')
          .then((data) => {
            this.aadharAsPerKyc();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Title Master values are empty!');
    }
  }
  aadharAsPerKyc() {
    if (
      !this.isEmpty(this.masterDataValues.AddressAsPerKyc) &&
      this.masterDataValues.AddressAsPerKyc.length > 0
    ) {
      this.sqliteProvider
        .removeAllMasterData('AddressAsPerKyc')
        .then((data) => {
          this.sqlSupport
            .insertAllMasterData(
              this.masterDataValues.AddressAsPerKyc,
              'AddressAsPerKyc'
            )
            .then((data) => {
              this.otherDocuments();
            });
        });
    } else {
      // this.globFunc.globalLodingDismiss();
      this.otherDocuments();
      this.alertService.showAlert(
        'Alert!',
        'AddressAsPerKyc values are empty!'
      );
    }
  }

  otherDocuments() {
    if (
      !this.isEmpty(this.masterDataValues.OtherDocuments) &&
      this.masterDataValues.OtherDocuments.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('OtherDocuments').then((data) => {
        this.sqlSupport
          .insertAllMasterData(
            this.masterDataValues.OtherDocuments,
            'OtherDocuments'
          )
          .then((data) => {
            this.getCasteMaster();
          });
      });
    } else {
      // this.globFunc.globalLodingDismiss();
      this.getCasteMaster();
      this.alertService.showAlert('Alert!', 'OtherDocuments values are empty!');
    }
  }

  getCasteMaster() {
    if (
      !this.isEmpty(this.masterDataValues.Caste) &&
      this.masterDataValues.Caste.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('Caste').then((data) => {
        this.sqlSupport
          .insertAllMasterData(this.masterDataValues.Caste, 'Caste')
          .then((data) => {
            this.getReligionMaster();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Caste values are empty!');
    }
  }

  getReligionMaster() {
    if (
      !this.isEmpty(this.masterDataValues.Religion) &&
      this.masterDataValues.Religion.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('Religion').then((data) => {
        this.sqlSupport
          .insertAllMasterData(this.masterDataValues.Religion, 'Religion')
          .then((data) => {
            this.getNoofyearsresidence();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Religion values are empty!');
    }
  }

  getNoofyearsresidence() {
    if (
      !this.isEmpty(this.masterDataValues.Noofyearsresidence) &&
      this.masterDataValues.Noofyearsresidence.length > 0
    ) {
      this.sqliteProvider
        .removeAllMasterData('Noofyearsresidence')
        .then((data) => {
          this.sqlSupport
            .insertAllMasterData(
              this.masterDataValues.Noofyearsresidence,
              'Noofyearsresidence'
            )
            .then((data) => {
              this.getEducationMaster();
            });
        });
    } else {
      // this.globFunc.globalLodingDismiss();
      this.getEducationMaster();
      this.alertService.showAlert(
        'Alert!',
        'No of years residence values are empty!'
      );
    }
  }

  getEducationMaster() {
    if (
      !this.isEmpty(this.masterDataValues.Education) &&
      this.masterDataValues.Education.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('Education').then((data) => {
        this.sqlSupport
          .insertAllMasterData(this.masterDataValues.Education, 'Education')
          .then((data) => {
            this.getMaritalStatus();
          });
      });
    } else {
      // this.globFunc.globalLodingDismiss();
      this.getMaritalStatus();
      this.alertService.showAlert('Alert!', 'Education values are empty!');
    }
  }
  getMaritalStatus() {
    if (
      !this.isEmpty(this.masterDataValues.MaritalStatus) &&
      this.masterDataValues.MaritalStatus.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('MaritalStatus').then((data) => {
        this.sqlSupport
          .insertAllMasterData(
            this.masterDataValues.MaritalStatus,
            'MaritalStatus'
          )
          .then((data) => {
            this.getAddressType();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Marital Status values are empty!');
    }
  }
  getAddressType() {
    if (
      !this.isEmpty(this.masterDataValues.AddressType) &&
      this.masterDataValues.AddressType.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('AddressType').then((data) => {
        this.sqlSupport
          .insertAllMasterData(this.masterDataValues.AddressType, 'AddressType')
          .then((data) => {
            this.getAnnualIncome();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'AddressType values are empty!');
    }
  }
  getAnnualIncome() {
    if (
      !this.isEmpty(this.masterDataValues.AnnualIncome) &&
      this.masterDataValues.AnnualIncome.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('AnnualIncome').then((data) => {
        this.sqlSupport
          .insertAllMasterData(
            this.masterDataValues.AnnualIncome,
            'AnnualIncome'
          )
          .then((data) => {
            this.getBusinessDescription();
          });
      });
    } else {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Annual Income values are empty!');
    }
  }
  getBusinessDescription() {
    if (
      !this.isEmpty(this.masterDataValues.BusinessDescription) &&
      this.masterDataValues.BusinessDescription.length > 0
    ) {
      this.sqliteProvider
        .removeAllMasterData('BusinessDescription')
        .then((data) => {
          this.sqlSupport
            .insertAllMasterData(
              this.masterDataValues.BusinessDescription,
              'BusinessDescription'
            )
            .then((data) => {
              this.getEmploymentStatus();
            });
        });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Business Description values are empty!'
      );
    }
  }
  getEmploymentStatus() {
    if (
      !this.isEmpty(this.masterDataValues.EmploymentStatus) &&
      this.masterDataValues.EmploymentStatus.length > 0
    ) {
      this.sqliteProvider
        .removeAllMasterData('EmploymentStatus')
        .then((data) => {
          this.sqlSupport
            .insertAllMasterData(
              this.masterDataValues.EmploymentStatus,
              'EmploymentStatus'
            )
            .then((data) => {
              this.geGLInterestType();
            });
        });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Occupation Type values are empty!'
      );
    }
  }
  geGLInterestType() {
    if (
      !this.isEmpty(this.masterDataValues.GLInterestType) &&
      this.masterDataValues.GLInterestType.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('GLInterestType').then((data) => {
        this.sqlSupport
          .insertAllMasterData(
            this.masterDataValues.GLInterestType,
            'GLInterestType'
          )
          .then((data) => {
            this.getInterestRate();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Occupation Type values are empty!'
      );
    }
  }
  getInterestRate() {
    if (
      !this.isEmpty(this.masterDataValues.IntRateMaster) &&
      this.masterDataValues.IntRateMaster.length > 0
    ) {
      this.sqliteProvider.removeInterestRate().then((data) => {
        this.sqlSupport
          .InsertInterestRate(this.masterDataValues.IntRateMaster)
          .then((data) => {
            this.getGenderList();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Interest Rate Master values are empty!'
      );
    }
  }
  getGenderList() {
    if (
      !this.isEmpty(this.masterDataValues.Gender) &&
      this.masterDataValues.Gender.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('Gender').then((data) => {
        this.sqlSupport
          .insertAllMasterData(this.masterDataValues.Gender, 'Gender')
          .then((data) => {
            this.getGLTenure();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Gender values are empty!');
    }
  }
  getGLTenure() {
    if (
      !this.isEmpty(this.masterDataValues.GlTenure) &&
      this.masterDataValues.GlTenure.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('GlTenure').then((data) => {
        this.sqlSupport
          .insertAllMasterData(this.masterDataValues.GlTenure, 'GlTenure')
          .then((data) => {
            this.getIndustryType();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'GL Tenure values are empty!');
    }
  }
  getIndustryType() {
    if (
      !this.isEmpty(this.masterDataValues.IndustryType) &&
      this.masterDataValues.IndustryType.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('IndustryType').then((data) => {
        this.sqlSupport
          .insertAllMasterData(
            this.masterDataValues.IndustryType,
            'IndustryType'
          )
          .then((data) => {
            this.getNatureofBussiness();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Industry Type values are empty!');
    }
  }
  getNatureofBussiness() {
    if (
      !this.isEmpty(this.masterDataValues.NatureofBussiness) &&
      this.masterDataValues.NatureofBussiness.length > 0
    ) {
      this.sqliteProvider
        .removeAllMasterData('NatureofBussiness')
        .then((data) => {
          this.sqlSupport
            .insertAllMasterData(
              this.masterDataValues.NatureofBussiness,
              'NatureofBussiness'
            )
            .then((data) => {
              this.getPddChargesMaster();
            });
        });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Nature of Bussiness values are empty!'
      );
    }
  }
  getPddChargesMaster() {
    if (
      !this.isEmpty(this.masterDataValues.PrdPddChargesMaster) &&
      this.masterDataValues.PrdPddChargesMaster.length > 0
    ) {
      this.sqlSupport.removeAllPddChargesMaster().then((data) => {
        this.sqlSupport
          .insertAllPddChargesMaster(this.masterDataValues.PrdPddChargesMaster)
          .then((data) => {
            this.getProductScheme();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'DocumentsVehicle values are empty!'
      );
    }
  }
  getProductScheme() {
    if (
      !this.isEmpty(this.masterDataValues.ProductScheme) &&
      this.masterDataValues.ProductScheme.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('ProductScheme').then((data) => {
        this.sqlSupport
          .insertAllMasterData(
            this.masterDataValues.ProductScheme,
            'ProductScheme'
          )
          .then((data) => {
            this.getStateList();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'Product Scheme values are empty!');
    }
  }
  getStateList() {
    if (
      !this.isEmpty(this.masterDataValues.StateCityMaster) &&
      this.masterDataValues.StateCityMaster.length > 0
    ) {
      this.sqliteProvider.removeStateCity().then((data) => {
        this.sqlSupport
          .InsertStateCity(this.masterDataValues.StateCityMaster)
          .then((data) => {
            this.getYesNo();
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'State City Master values are empty!'
      );
    }
  }
  getYesNo() {
    if (
      !this.isEmpty(this.masterDataValues.YesNo) &&
      this.masterDataValues.YesNo.length > 0
    ) {
      this.sqliteProvider.removeAllMasterData('YesNo').then((data) => {
        this.sqlSupport
          .insertAllMasterData(this.masterDataValues.YesNo, 'YesNo')
          .then((data) => {
            this.getDocuments();
          });
      });
    } else {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert('Alert!', 'YesNo values are empty!');
    }
  }
  getDocuments() {
    if (
      !this.isEmpty(this.masterDataValues.DocumentMaster) &&
      this.masterDataValues.DocumentMaster.length > 0
    ) {
      this.sqliteProvider.removeDocuments().then((data) => {
        this.sqliteProvider
          .InsertDocuments(this.masterDataValues.DocumentMaster)
          .then((data) => {
            this.sqliteProvider
              .insertversionDetails(this.versionvalue)
              .then((data) => {
                this.globFunc.globalLodingDismiss();
                this.userData.username = '';
                this.userData.password = '';
                this.globalData.loginUserName(true);
                this.router.navigate(['/ExistingPage'], {
                  queryParams: { username: this.userData.username },
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              });
          });
      });
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'Document Master values are empty!'
      );
    }
  }

  dummyLogin() {
    this.router.navigate(['/ExistingPage'], {
      queryParams: { username: this.userData.username },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  // ---------------------------------------- END for GL Setup ---------------------------------------------------------------
}
