import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  ModalController,
  NavController,
  NavParams,
  PopoverController,
} from '@ionic/angular';
import { RemarksComponent } from 'src/app/components/remarks/remarks.component';
import { SfdCviewComponent } from 'src/app/components/sfd-cview/sfd-cview.component';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-posidex-check',
  templateUrl: './posidex-check.page.html',
  styleUrls: ['./posidex-check.page.scss'],
})
export class PosidexCheckPage {
  custType: any = 'Promoter';
  newCustomerUrn: any;
  showNewCust: any = false;
  showEixtCust: any = false;
  urnSelected: any = false;
  showCoApp: any = false;
  applicantDetails: any;
  coapplicantsList: any = [];
  coapplicant: any = [];
  userInfo: any;
  newCustRemarks: any;
  existingRemarks: any = {};
  existingUrn: any;
  showAml = false;
  showCbs = false;
  coAppDisable = true;
  refId: any;
  userType: any = 'A';
  id: any;
  selectedCust: any;
  existCustCheck: boolean = false;
  appCustId: any;
  coAppCustId: any;
  posidexInfo: any = [];
  storedRemarks: any;
  newCustRadio = 'N';
  existingCustomer: any = [];
  amlResp: any;
  leadUserType: any;
  coAppFlag: any;
  coapplicantsLength: any;
  selectedItem: any;
  naveParamsValue: any;
  selectedItemIndex: number;
  checked: boolean = false;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public master: RestService,
    public globFunc: GlobalService,
    public sqliteProvider: SqliteService,
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public globalData: DataPassingProviderService,
    public sqliteSupport: SquliteSupportProviderService,
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
    this.userInfo = JSON.parse(this.naveParamsValue.submitData);
    this.coAppFlag = this.userInfo.coAppFlag;

    // this.leadUserType = this.userInfo.promocustType;
    this.refId = this.userInfo.refId;

    this.loadAllApplicantDetails();
    this.loadAllPosidexDetails();
    this.loadAppPosidexDetails();
    this.loadCoappDetails();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PosidexCheckPage');
    this.globFunc.publishPageNavigation({
      title: 'Posidex Details',
      component: PosidexCheckPage,
    });
  }

  ionViewWillEnter() {
    // this.loadCoappDetails();
  }

  loadAllPosidexDetails(id?) {
    this.sqliteProvider
      .getPosidexDetails(this.refId, this.userType, id)
      .then((data) => {
        if (data.length > 0) {
          if (data[0].verified == 'Y') {
            this.posidexInfo = data;
            if (
              data[0].existCust == 'Y' &&
              JSON.parse(data[0].matchedCustomerDetails).MatchedCRN !== 'new'
            ) {
              this.showCbs = true;
              this.showEixtCust = true;
              this.existingCustomer = [];
              this.existCustCheck = true;
              this.existingCustomer.push(
                JSON.parse(data[0].matchedCustomerDetails)
              );
              this.existingUrn = data[0].urnNo;
              this.storedRemarks = data[0].newCustomerRemarks;
              this.existingRemarks[
                JSON.parse(data[0].matchedCustomerDetails).MatchedCRN
              ] = JSON.parse(data[0].matchedCustomerDetails).existingRemarks;
            } else if (
              data[0].matchedCustomerDetails &&
              JSON.parse(data[0].matchedCustomerDetails).MatchedCRN == 'new'
            ) {
              this.existingUrn = data[0].urnNo;
              this.showAml = true;
              this.storedRemarks = data[0].newCustomerRemarks;
              this.existingCustomer = [];
              this.existingCustomer.push(
                JSON.parse(data[0].matchedCustomerDetails)
              );
              this.showEixtCust = true;
              this.existCustCheck = true;
            } else {
              if (data[0].amlCheck == 'Y') {
              }
              this.newCustomerUrn = data[0].urnNo;
              this.storedRemarks = data[0].newCustomerRemarks;
              this.showNewCust = true;
              this.showAml = true;
            }
          } else {
            if (data[0].existCust == 'Y') {
              this.showCbs = true;
              this.showEixtCust = true;
              this.existingCustomer = [];
              this.existCustCheck = true;
              this.existingCustomer.push(
                JSON.parse(data[0].matchedCustomerDetails)
              );
              this.storedRemarks = data[0].newCustomerRemarks;
              console.log(this.existingRemarks, 'existingRemarks');
              // this.existingRemarks[JSON.parse(data[0].matchedCustomerDetails).MatchedCRN] = JSON.parse(data[0].matchedCustomerDetails).existingRemarks;
            } else {
              if (data[0].amlCheck == 'Y') {
              }
              this.newCustomerUrn = data[0].urnNo;
              this.storedRemarks = data[0].newCustomerRemarks;
              this.showNewCust = true;
              this.showAml = true;
            }
          }
        } else {
          this.showNewCust = false;
          this.showEixtCust = false;
          this.showAml = false;
          this.showCbs = false;
          this.existCustCheck = false;
          this.posidexInfo = [];
          this.storedRemarks = '';
        }
      });
  }

  loadAppPosidexDetails() {
    this.sqliteProvider.getApplicantPosidexDetails(this.refId).then((data) => {
      if (data.length > 0) {
        this.coAppDisable = false;
      } else {
        this.coAppDisable = true;
      }
    });
  }

  loadAllApplicantDetails() {
    this.sqliteProvider
      .getApplicantDataAfterSubmit(this.refId)
      .then((data) => {
        this.applicantDetails = [];
        this.applicantDetails = data;
        this.id = data[0].id;
        this.appCustId = data[0].LpCustid;
        this.leadUserType = data[0].promocustType;
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
        if (res.length > 0) {
          this.coapplicantsList = [];
          this.coapplicantsList = res;
          this.coapplicantsLength = res.length;
          console.log(this.coapplicantsList, 'coapplicants');
          // this.id = res[0].id;
          // this.coAppCustId = res[0].LpCustid;
          // console.log(this.id, "thisssssssssss.id");
          // this.loadCoApplicantBasedOnId(this.coapplicantsList[0]);
        }
      });
  }

  onCoAppChange(event) {
    let id = event.detail.value;
    this.sqliteProvider.getCoApplicantBasedOnId(this.refId, id).then((data) => {
      console.log(data, 'tttttttttttttt');
      this.coapplicant = data;
      this.showCoApp = true;
      this.coAppCustId = data[0].LpCustid;
      this.leadUserType = data[0].promocustType;
      this.id = data[0].id;
      this.selectedItem = '';
      this.loadAllPosidexDetails(this.id);
    });
  }

  // loadCoApplicantBasedOnId(coApp){
  //   this.sqliteProvider.getCoApplicantBasedOnId(coApp.refId,coApp.id).then(data=>{
  //        console.log(data,"tttttttttttttt");
  //        this.coapplicant = data;
  //   })
  // }

  getApplicantDetails() {}

  getCoApplicantDetails() {}

  fetchPosidex(ev?) {
    this.globFunc.globalLodingPresent('Please wait...');
    let body;
    if (this.appCustId || this.coAppCustId) {
      body = {
        propNo: this.applicantDetails[0].applicationNumber,
        CustId:
          this.custType === 'Promoter' ? this.appCustId : this.coAppCustId,
      };
    } else {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert',
        'The Customer Id is Empty in the Application'
      );
    }
    this.master.restApiCallAngular('fetchcustposidex', body).then(
      (res) => {
        let posidexData = <any>res;
        if (posidexData.errorCode === '000') {
          this.globFunc.globalLodingDismiss();
          if (
            posidexData.hasOwnProperty('MatchedCustomer') &&
            posidexData.MatchedCustomer.length > 0
          ) {
            this.existingUrn = posidexData.lpUrnNo;
            this.existingCustomer = posidexData.MatchedCustomer;
            if (this.leadUserType != 'E') {
              this.existingCustomer.unshift({
                newCust: 'Proceed as new customer',
                MatchedCRN: 'new',
                urn: this.existingUrn,
              });
            }

            this.showNewCust = false;
            this.showEixtCust = true;
          } else {
            this.showNewCust = true;
            this.showEixtCust = false;
            this.newCustomerUrn = posidexData.lpUrnNo;
            this.storedRemarks = '';
          }
        } else {
          this.globFunc.globalLodingDismiss();
          this.alertService.showAlert('Alert', posidexData.errorStatus);
        }
      },
      (err) => {
        this.globFunc.globalLodingDismiss();
        if (err.name == 'TimeoutError') {
          this.alertService.showAlert('Alert!', err.message);
        } else {
          this.alertService.showAlert('Alert!', 'No response from server!');
        }
      }
    );
  }

  async verifyPosidex(ev?) {
    let body, remarks;
    if (
      (this.showNewCust && this.urnSelected) ||
      (this.selectedItem && this.showEixtCust)
    ) {
      let popover = await this.modalCtrl.create({
        component: RemarksComponent,
        componentProps: {
          data: this.showEixtCust ? this.selectedItem : this.newCustomerUrn,
          showBackdrop: true,
          enableBackdropDismiss: true,
          cssClass: 'modalCss',
        },
      });
      popover.onDidDismiss().then((data) => {
        // this.globFunc.globalLodingPresent("Please wait...");
        if (data) {
          remarks = data.data;
          if (this.showEixtCust && this.selectedItem.MatchedCRN != 'new') {
            // if (this.showEixtCust) {
            // exist
            body = {
              propNo: this.applicantDetails[0].applicationNumber,
              CustId:
                this.custType === 'Promoter'
                  ? this.appCustId
                  : this.coAppCustId,
              Urn: this.selectedItem.MatchedCRN,
              type: 'Matched URN',
              MatchSno: this.selectedItem.MatchSno,
              Remarks: remarks,
            };
          } else {
            // new
            let urn;
            if (
              this.selectedItem &&
              this.selectedItem.hasOwnProperty('MatchedCRN')
            ) {
              urn =
                this.selectedItem.MatchedCRN == 'new'
                  ? this.selectedItem.urn
                  : this.newCustomerUrn
                  ? this.newCustomerUrn
                  : this.existingUrn;
            } else {
              urn = this.newCustomerUrn
                ? this.newCustomerUrn
                : this.existingUrn;
            }
            body = {
              propNo: this.applicantDetails[0].applicationNumber,
              CustId:
                this.custType === 'Promoter'
                  ? this.appCustId
                  : this.coAppCustId,
              Urn: urn, // (this.newCustomerUrn) ? this.newCustomerUrn : this.existingUrn
              type: 'New URN',
              Remarks: remarks,
            };
          }

          this.master.restApiCallAngular('verifycustposidex', body).then(
            (res) => {
              let verifyPosidexData = <any>res;
              if (verifyPosidexData.errorCode === '000') {
                if (this.showEixtCust) {
                  this.sqliteProvider.insertVerifiedPosidex(
                    this.refId,
                    this.id,
                    this.userType,
                    'Y',
                    JSON.stringify(this.selectedItem),
                    remarks,
                    'Y',
                    this.existingUrn,
                    this.applicantDetails[0].applicationNumber,
                    this.custType === 'Promoter'
                      ? this.appCustId
                      : this.coAppCustId
                  );
                } else {
                  this.sqliteProvider.insertVerifiedPosidex(
                    this.refId,
                    this.id,
                    this.userType,
                    'Y',
                    JSON.stringify(this.selectedItem),
                    remarks,
                    'N',
                    this.newCustomerUrn,
                    this.applicantDetails[0].applicationNumber,
                    this.custType === 'Promoter'
                      ? this.appCustId
                      : this.coAppCustId
                  );
                }
                this.loadAppPosidexDetails();
                this.loadAllPosidexDetails(this.id);
                // this.globFunc.globalLodingDismiss();
                if (this.showNewCust || this.selectedItem.MatchedCRN == 'new') {
                  this.showAml = true;
                  this.alertService.showAlert(
                    'Alert',
                    'Posidex Verified Successfully. Please check AML'
                  );
                } else {
                  this.showCbs = true;
                  this.alertService.showAlert(
                    'Alert',
                    'Posidex Verified Successfully. Please check CBS'
                  );
                }
              } else {
                // this.globFunc.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert',
                  verifyPosidexData.errorDesc
                    ? verifyPosidexData.errorDesc
                    : 'Posidex Failed to Verify'
                );
              }
            },
            (err) => {
              // this.globFunc.globalLodingDismiss();
              if (err) {
                this.alertService.showAlert(
                  'Alert',
                  err.message ? err.message : 'Error'
                );
              } else {
                this.alertService.showAlert(
                  'Alert',
                  'No Response from Server!'
                );
              }
            }
          );
          // this.globFunc.globalLodingDismiss();
        } else {
          // this.globFunc.globalLodingDismiss();
        }
      });
      // this.globFunc.globalLodingDismiss();
      return await popover.present();
    } else {
      // this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert', 'Please Select a URN');
    }
  }

  verifyPosidex1(item?) {
    console.log(this.existingRemarks, 'aaaaaaaaa');
    let remarks;
    if (this.showNewCust || (this.selectedItem && this.showEixtCust)) {
      this.globFunc.globalLodingPresent('Please wait...');
      let body;
      if (this.showEixtCust) {
        remarks = this.existingRemarks[this.selectedItem.MatchedCRN];
        this.selectedItem['existingRemarks'] = remarks;
      }
    } else {
      this.alertService.showAlert('Alert', 'Please Select a URN');
    }
  }

  fetchAml() {
    this.globFunc.globalLodingPresent('Please wait...');
    let methodName, custId, body;
    if (
      this.posidexInfo[0].amlStatus == 'AML Initiated' ||
      this.posidexInfo[0].amlStatus == 'Match'
    ) {
      methodName = 'amlstscheck';
      // custId = 'CustId';
      body = {
        propNo: this.applicantDetails[0].applicationNumber,
        CustId:
          this.custType === 'Promoter' ? this.appCustId : this.coAppCustId,
      };
    } else {
      methodName = 'AmlRequest';
      // custId = 'custId';
      body = {
        propNo: this.applicantDetails[0].applicationNumber,
        custId:
          this.custType === 'Promoter' ? this.appCustId : this.coAppCustId,
      };
    }

    // this.master.restApiCallAngular('amlstscheck', body).then(res => {
    this.master.restApiCallAngular(methodName, body).then(
      (res) => {
        let amlData = <any>res;
        if (amlData.errorCode === '000') {
          // this.sqliteProvider.updatePosidexAMLDetails(this.refId, this.id, "No Match", this.userType, 'Y');
          this.amlResp = amlData.errorDesc;
          this.sqliteProvider.updatePosidexAMLDetails(
            this.refId,
            this.id,
            amlData.errorDesc == 'Success'
              ? 'AML Initiated'
              : amlData.errorDesc,
            this.userType,
            'Y'
          );
          this.loadAllPosidexDetails(this.id);
          this.globFunc.globalLodingDismiss();
          if (amlData.errorDesc == 'Success') {
            this.alertService.showAlert(
              'Alert',
              'AML request initiated. Please try again!'
            );
          } else if (amlData.errorDesc == 'Match') {
            this.alertService.showAlert(
              'Alert',
              'The AML Status is Match, so please wait untill Processing!'
            );
          } else {
            this.alertService
              .showAlert('Alert', amlData.errorDesc)
              .then((data) => {
                this.proceedNextPage();
              });
          }
          // this.alertService.showAlert('Alert', amlData.errorDesc ? amlData.errorDesc : 'Aml Initiated').then(data => {
          // this.proceedNextPage();
          // })
        } else {
          this.globFunc.globalLodingDismiss();
          this.alertService
            .showAlert('Alert', amlData.errorDesc)
            .then((data) => {
              this.proceedNextPage();
            });
        }
      },
      (err) => {
        if (err) {
          this.alertService.showAlert('Alert', err.message);
        } else {
          this.alertService.showAlert('Alert', 'No Response from Server!');
        }
        this.globFunc.globalLodingDismiss();
      }
    );
  }

  fetchCbs() {
    this.globFunc.globalLodingPresent('Please wait...');
    let methodName, body;
    if (this.posidexInfo[0].cbsStatus == 'Inititated') {
      methodName = 'CbsAccountFetch';
      // custId = 'CustId';
      body = {
        propNo: this.applicantDetails[0].applicationNumber,
        CustId:
          this.custType === 'Promoter' ? this.appCustId : this.coAppCustId,
      };
    } else {
      methodName = 'cbsCustomer360';
      // custId = 'custId';
      body = {
        propNo: this.applicantDetails[0].applicationNumber,
        custId:
          this.custType === 'Promoter' ? this.appCustId : this.coAppCustId,
      };
    }
    // body = {
    //   "propNo": this.applicantDetails[0].applicationNumber,
    //   "custId": (this.custType === 'Promoter') ? this.appCustId : this.coAppCustId
    // }

    // this.master.restApiCallAngular('CbsAccountFetch', body).then(res => {
    this.master.restApiCallAngular(methodName, body).then(
      (res) => {
        let cbsData = <any>res;
        if (!this.isEmpty(cbsData) && cbsData.errorCode === '000') {
          if (cbsData.ExistingVehicle == 'Y') {
            this.sqliteProvider.updatePosidexCBSDetails(
              this.refId,
              this.id,
              'rejected',
              this.userType,
              'Y'
            );
            this.loadAllPosidexDetails(this.id);
            this.alertService.showAlert(
              'Alert',
              'You are not eligible application rejected'
            );
          } else {
            this.sqliteProvider.updatePosidexCBSDetails(
              this.refId,
              this.id,
              cbsData.errorDesc ? 'Inititated' : 'Approved',
              this.userType,
              'Y'
            );
            this.loadAllPosidexDetails(this.id);
            if (cbsData.errorDesc == 'Success') {
              this.alertService.showAlert(
                'Alert',
                'CBS request initiated. Please try again!'
              );
            } else {
              this.alertService
                .showAlert('Alert', 'Proceed further')
                .then((data) => {
                  this.proceedNextPage();
                });
            }
          }
          this.globFunc.globalLodingDismiss();
        } else {
          this.globFunc.globalLodingDismiss();
          this.alertService.showAlert(
            'Alert',
            cbsData.errorDesc ? cbsData.errorDesc : 'No response'
          );
        }
      },
      (err) => {
        if (err) {
          this.alertService.showAlert('Alert', err.message);
        } else {
          this.alertService.showAlert('Alert', 'No Response from Server!');
        }
        this.globFunc.globalLodingDismiss();
      }
    );
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  proceedNextPage() {
    let appStatus = false;
    if (this.coAppFlag == 'Y') {
      this.sqliteProvider.getPosidexDetails(this.refId, 'C').then((coApp) => {
        if (coApp.length == this.coapplicantsLength) {
          this.sqliteSupport.getPosidexData(this.refId).then((data) => {
            appStatus = data.every(
              (data) =>
                (data.cbsCheck == 'Y' && data.cbsStatus == 'Approved') ||
                (data.amlCheck == 'Y' && data.amlStatus == 'No Match') ||
                data.amlStatus == 'AML Approved'
            );
            if (appStatus) {
              this.alertService
                .proccedOk('Alert', 'Proceed to Credit check!')
                .then((data) => {
                  if (data == 'yes') {
                    this.router.navigate(['/ExistApplicationsPage'], {
                      queryParams: {
                        submitData: JSON.stringify(this.userInfo),
                      },
                      skipLocationChange: true,
                      replaceUrl: true,
                    });
                  }
                });
            }
          });
        }
      });
    } else {
      this.sqliteProvider.getPosidexDetails(this.refId, 'A').then((data) => {
        if (data.length > 0) {
          appStatus = data.every(
            (data) =>
              (data.cbsCheck == 'Y' && data.cbsStatus == 'Approved') ||
              (data.amlCheck == 'Y' && data.amlStatus == 'No Match') ||
              data.amlStatus == 'AML Approved'
          );
          if (appStatus) {
            this.alertService
              .proccedOk('Alert', 'Proceed to Credit check!')
              .then((data) => {
                if (data == 'yes') {
                  this.router.navigate(['/ExistApplicationsPage'], {
                    queryParams: { submitData: this.userInfo },
                    skipLocationChange: true,
                    replaceUrl: true,
                  });
                }
              });
          }
        }
      });
    }
  }

  // proceedNextPage() {
  //   if (this.userType == 'A' || this.userType == 'C') {
  //     if (this.amlResp == 'No Match' || this.amlResp == 'AML Approved') {
  //       this.globalData.proccedOk("Alert", "Proceed to credit check").then(data => {
  //         if (data == "yes") {
  //           // this.navCtrl.push(CreditCheckPage, { submitData: this.userInfo });
  //           this.navCtrl.push(ExistApplicationsPage, { submitData: this.userInfo });
  //         }
  //       });
  //     } else if (this.amlResp == 'Match') {
  //       this.alertService.showAlert("Alert", "The AML Status is Match, so please wait untill Processing!");
  //     }else if(this.amlResp == 'Success'){
  //       this.alertService.showAlert("Alert", "AML request initiated. Please try again!");
  //     } else if (this.amlResp == 'AML Rejected') {
  //       this.alertService.showAlert("Alert", "The AML Status is AML Rejected, so the Application has been Rejected!");
  //     }
  //   } else {
  //     this.alertService.showAlert("Alert", "The AML Status is Aml Initated Can't Proceed Further!");
  //   }
  // }

  view360(item) {
    this.globFunc.globalLodingPresent('Please wait...');
    let body = {
      custurn: this.existingUrn,
    };
    this.master.restApiCallAngular('sfdcCust360', body).then(
      async (res) => {
        let res1 = {
          sfdc360Res: {
            custURN: '72110141824248155',
            DOB: '14/10/1982',
            FirstName: 'ajith',
            MobNumber: '',
            Email_ID: 'sam@gmail.com',
            customerID: '',
            err_code: '000',
            OppStatusArr: [],
          },
          custurn: '72110141824248155',
          success: true,
          errorCode: '000',
          responseData: {},
        };
        let cfdsData = <any>res;
        if (cfdsData.errorCode === '000') {
          this.globFunc.globalLodingDismiss();
          console.log('360 view');
          let modal = await this.modalCtrl.create({
            component: SfdCviewComponent,
            componentProps: { data: cfdsData.sfdc360Res },
          });
          modal.present();
        } else {
          this.globFunc.globalLodingDismiss();
          this.alertService.showAlert('Alert', cfdsData.errorDesc);
        }
      },
      (err) => {
        if (err) {
          this.alertService.showAlert('Alert', err.message);
        } else {
          this.alertService.showAlert('Alert', 'No Response from Server!');
        }
        this.globFunc.globalLodingDismiss();
      }
    );
  }
  existChange(event) {
    let index = event.detail ? event.detail.value : undefined;
    if (index && index !== 'Y') {
      this.selectedItem = this.existingCustomer[index];
      this.selectedItemIndex = index;
    } else if (index == 'Y') {
      this.urnSelected = true;
    } else {
      this.alertService.showAlert('Alert', 'event value are empty..!');
    }
  }

  tabChanges() {
    if (this.custType === 'Promoter') {
      this.userType = 'A';
      this.showEixtCust = false;
      this.showNewCust = false;
      this.showCoApp = false;
      this.showAml = false;
      this.showCbs = false;
      this.loadAllPosidexDetails();
    } else {
      this.userType = 'C';
      this.showEixtCust = false;
      this.showNewCust = false;
      this.showCoApp = false;
      this.showAml = false;
      this.showCbs = false;
      this.selectedItem = '';
    }
    // this.loadAllPosidexDetails();
  }

  homePage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }
}
