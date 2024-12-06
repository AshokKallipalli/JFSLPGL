import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  AlertController,
  IonItemSliding,
  LoadingController,
  ModalController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { environment } from 'src/environments/environment';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-exist-application',
  templateUrl: './exist-application.page.html',
  styleUrls: ['./exist-application.page.scss'],
})
export class ExistApplicationPage {
  org_master: any = [];
  pdt_master: any = [];
  items: any = [];
  users: any = [];
  showhide: boolean = false;
  itemExpandHeight: number = 100;
  nouserdata: any;
  userType: any;
  username: any;
  appUniqueId: any;
  guarantors: any;
  guranLength: any;
  submitUrl: any;
  submitResult: any;
  janaCenter: any;
  productName: any;
  showSubmit: boolean = false;
  submitdata: any;
  leadStatus: any;
  wholeDetails: any;
  entityAddress: any;
  appStatusURL: any;
  applicationStatus: any;
  refId: any;
  showSearch: boolean;
  status: any;
  userGroupsName = [];

  itemslist: any[] = [];

  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public alertCtrl: AlertController,
    public loadCtrl: LoadingController,
    public globFunc: GlobalService,
    public http: HTTP,
    public network: Network,
    public platform: Platform,
    public master: RestService,
    public sqlSupport: SquliteSupportProviderService,
    public alertService: CustomAlertControlService
  ) {
    this.getproducts();
    this.appStatusURL = environment.apiURL + 'AppStatus';
    // this.username = this.globalData.getusername();

    this.sqliteProvider.getOrganisation().then((data) => {
      this.org_master = data;
    });

    this.username = this.globFunc.basicDec(localStorage.getItem('username'));
    this.getUserGroupsNames();
  }

  ionViewWillEnter() {
    // this.globFunc.statusbarValues();
    this.loadAllApplicantDetails();
  }

  ionViewDidEnter() {
    // this.globFunc.statusbarValues();
    // this.platform.backButton(() => {
    //   this.navCtrl.navigate(JsfhomePage);
    // });
  }

  ionViewWillLeave() {
    // this.platform.registerBackButtonAction(() => {
    //   // this.navCtrl.pop();
    //   this.navCtrl.navigate(JsfhomePage);
    // });
  }

  home() {
    this.navCtrl.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  getUserGroupsNames() {
    let userGroup;
    this.sqliteProvider.getUserIDLoginDetails(this.username).then((data) => {
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

  docsUpload(item) {
    this.globalData.setborrowerType(item.userType);
    this.globalData.setrefId(item.refId);
    this.globalData.setId(item.id);
    this.navCtrl.navigate(['/OtherDocsPage'], {
      queryParams: { application: item.applicationNumber },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  expandItem(item) {
    this.items.map((listItem) => {
      if (item == listItem) {
        listItem.expanded = !listItem.expanded;
      } else {
        listItem.expanded = false;
      }
      return listItem;
    });
  }

  viewDetails(item) {
    this.globalData.setgId('');
    this.navCtrl.navigate(['/ViewDetailsPage'], {
      queryParams: {
        refvalue: JSON.stringify(item),
        userVal: JSON.stringify(item),
        user_Type: 'G',
      },
      skipLocationChange: true,
      replaceUrl: true,
    });
    // console.log("view details: " + JSON.stringify(item));
  }

  someThing(slidingItem: IonItemSliding) {
    slidingItem.close();
  }

  passdetails(item) {
    this.sqliteProvider.getEntityDetails(item.refId, item.id).then((ent) => {
      if (ent.length > 0) {
        this.sqliteProvider
          .getPersonalEntityDetails(item.refId, item.id)
          .then((data) => {
            if (data.length > 0) {
              if (
                data[0].URNnumber != '' &&
                data[0].URNnumber != null &&
                data[0].URNnumber != undefined
              ) {
                this.globalData.setURN(data[0].URNnumber);
                this.globalData.setCustType(data[0].promocustType);
                this.globalData.setborrowerType(item.userType);
                this.globalData.setrefId(item.refId);
                this.globalData.setId(item.id);
                this.globalData.setProfileImage(data[0].profPic);
                this.globalData.setEntiProfileImage(data[0].entiProfPic);
                this.globalData.setloanType(item.productType);
                this.globalData.setJanaCenter(item.janaCenter);
                this.globalData.setCustomerType(item.customerType);
                localStorage.setItem('leadId', item.coAppGuaId);
                this.navCtrl.navigate(['/NewapplicationPage'], {
                  queryParams: {
                    appRefValue: JSON.stringify(item),
                    usertype: 'A',
                    fieldDisable: true,
                  },
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              } else {
                this.globalData.setborrowerType(item.userType);
                this.globalData.setrefId(item.refId);
                this.globalData.setId(item.id);
                this.globalData.setProfileImage(data[0].profPic);
                this.globalData.setEntiProfileImage(data[0].entiProfPic);
                this.globalData.setloanType(item.productType);
                this.globalData.setJanaCenter(item.janaCenter);
                localStorage.setItem('leadId', item.coAppGuaId);
                this.globalData.setCustomerType(item.customerType);
                this.navCtrl.navigate(['/NewapplicationPage'], {
                  queryParams: {
                    appRefValue: JSON.stringify(item),
                    usertype: 'A',
                    fieldDisable: true,
                  },
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              }
            } else {
              this.globalData.setborrowerType(item.userType);
              this.globalData.setrefId(item.refId);
              this.globalData.setId(item.id);
              this.globalData.setProfileImage(item.profPic);
              this.globalData.setEntiProfileImage(data[0].entiProfPic);
              this.globalData.setloanType(item.productType);
              this.globalData.setJanaCenter(item.janaCenter);
              localStorage.setItem('leadId', item.coAppGuaId);
              this.globalData.setCustomerType(item.customerType);
              this.navCtrl.navigate(['/NewapplicationPage'], {
                queryParams: {
                  appRefValue: JSON.stringify(item),
                  usertype: 'A',
                  fieldDisable: true,
                },
                skipLocationChange: true,
                replaceUrl: true,
              });
            }
          });
      } else {
        this.sqliteProvider
          .getPersonalDetails(item.refId, item.id)
          .then((data) => {
            if (data.length > 0) {
              if (
                data[0].URNnumber != '' &&
                data[0].URNnumber != null &&
                data[0].URNnumber != undefined
              ) {
                this.globalData.setURN(data[0].URNnumber);
                this.globalData.setCustType(data[0].promocustType);
                this.globalData.setborrowerType(item.userType);
                this.globalData.setrefId(item.refId);
                this.globalData.setId(item.id);
                this.globalData.setProfileImage(data[0].profPic);
                this.globalData.setloanType(item.productType);
                this.globalData.setJanaCenter(item.janaCenter);
                localStorage.setItem('leadId', item.coAppGuaId);
                this.globalData.setCustomerType(item.customerType);
                this.navCtrl.navigate(['/NewapplicationPage'], {
                  queryParams: {
                    appRefValue: JSON.stringify(item),
                    usertype: 'A',
                    fieldDisable: true,
                  },
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              } else {
                this.globalData.setborrowerType(item.userType);
                this.globalData.setrefId(item.refId);
                this.globalData.setId(item.id);
                this.globalData.setProfileImage(data[0].profPic);
                this.globalData.setloanType(item.productType);
                this.globalData.setJanaCenter(item.janaCenter);
                localStorage.setItem('leadId', item.coAppGuaId);
                this.globalData.setCustomerType(item.customerType);
                this.navCtrl.navigate(['/NewapplicationPage'], {
                  queryParams: {
                    appRefValue: JSON.stringify(item),
                    usertype: 'A',
                    fieldDisable: true,
                  },
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              }
            } else {
              this.globalData.setborrowerType(item.userType);
              this.globalData.setrefId(item.refId);
              this.globalData.setId(item.id);
              this.globalData.setProfileImage(item.profPic);
              this.globalData.setloanType(item.productType);
              this.globalData.setJanaCenter(item.janaCenter);
              localStorage.setItem('leadId', item.coAppGuaId);
              this.globalData.setCustomerType(item.customerType);
              this.navCtrl.navigate(['/NewapplicationPage'], {
                queryParams: {
                  appRefValue: JSON.stringify(item),
                  usertype: 'A',
                  fieldDisable: true,
                },
                skipLocationChange: true,
                replaceUrl: true,
              });
            }
          });
      }
    });

    // this.globalData.setborrowerType(item.userType);
    // this.globalData.setrefId(item.refId);
    // this.globalData.setId(item.id);
    // this.globalData.setProfileImage(item.profPic);
    // this.globalData.setloanType(item.productType);
    // this.navCtrl.navigate(['/NewapplicationPage'], {queryParams : { appRefValue: item, usertype: "A", fieldDisable: true },skipLocationChange: true, replaceUrl: true);
  }

  passGuaDetails(item) {
    this.sqliteProvider.getguappDetails(item.refId, 'G').then((data) => {
      let guaran = data;
      this.userType = guaran[0].userType;
      this.globalData.setborrowerType(this.userType);
      this.globalData.setrefId(guaran[0].refId);
      this.refId = this.globalData.getrefId();
      this.globalData.setId(guaran[0].id);
      this.globalData.setCustType('N');
      this.globalData.setProfileImage(guaran[0].profPic);
      this.navCtrl.navigate(['/NewapplicationPage'], {
        queryParams: {
          userType: this.userType,
          GrefId: this.refId,
          fieldDisable: true,
        },
        skipLocationChange: true,
        replaceUrl: true,
      });
    });
  }

  passCoAppDetails(item) {
    this.sqliteProvider.getguappDetails(item.refId, 'C').then((data) => {
      let guaran = data;
      this.userType = guaran[0].userType;
      this.globalData.setborrowerType(this.userType);
      this.globalData.setrefId(guaran[0].refId);
      this.refId = this.globalData.getrefId();
      this.globalData.setId(guaran[0].id);
      this.globalData.setCustType('N');
      this.globalData.setProfileImage(guaran[0].profPic);
      this.navCtrl.navigate(['/NewapplicationPage'], {
        queryParams: {
          userType: this.userType,
          GrefId: this.refId,
          fieldDisable: true,
        },
        skipLocationChange: true,
        replaceUrl: true,
      });
    });
  }

  checkPosidex(item) {
    this.navCtrl.navigate(['/PosidexCheckPage'], {
      queryParams: {
        userType: JSON.stringify(this.userType),
        GrefId: JSON.stringify(this.refId),
        fieldDisable: true,
        submitData: JSON.stringify(item),
      },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  creditCheck(item) {
    let coAppStatus = '';
    console.log(item, 'creditcheck');
    this.sqliteProvider
      .getPosidexDetails(item.refId, item.userType)
      .then((data) => {
        if (data.length > 0) {
          if (
            (data[0].cbsCheck == 'Y' && data[0].cbsStatus == 'Approved') ||
            (data[0].amlCheck == 'Y' && data[0].amlStatus == 'No Match') ||
            data[0].amlStatus == 'AML Approved'
          ) {
            if (item.coAppFlag == 'Y') {
              this.sqliteProvider
                .getPosidexDetails(item.refId, 'C')
                .then((coApp) => {
                  if (coApp.length > 0) {
                    if (
                      coApp.every(
                        (data) =>
                          (data.cbsCheck == 'Y' &&
                            data.cbsStatus == 'Approved') ||
                          (data.amlCheck == 'Y' &&
                            data.amlStatus == 'No Match') ||
                          data.amlStatus == 'AML Approved'
                      )
                    ) {
                      this.navCtrl.navigate(['/CreditCheckPage'], {
                        queryParams: {
                          userType: this.userType,
                          GrefId: this.refId,
                          fieldDisable: true,
                          submitData: JSON.stringify(item),
                        },
                        skipLocationChange: true,
                        replaceUrl: true,
                      });
                    } else {
                      let coAppAlert = coApp.filter(
                        (data) =>
                          (data.cbsCheck == 'Y' &&
                            data.cbsStatus != 'Approved') ||
                          (data.amlCheck == 'Y' &&
                            data.amlStatus != 'No Match') ||
                          data.amlStatus != 'AML Approved'
                      );
                      this.alertService.showAlert(
                        'Alert',
                        coAppAlert[0].amlCheck == 'Y' ||
                          coAppAlert[0].cbsCheck == 'Y'
                          ? `${
                              coAppAlert[0].amlCheck == 'Y' ? 'AML' : 'CBS'
                            } status -Co-Applicant: ${
                              coAppAlert[0].amlCheck == 'Y'
                                ? coAppAlert[0].amlStatus
                                : coAppAlert[0].cbsStatus
                                ? coAppAlert[0].cbsStatus
                                : 'Initiated'
                            }. Cannot proceed further`
                          : 'Please complete Co-Applicant AML/CBS check'
                      );
                    }
                    // if (coApp[0].cbsCheck == 'Y' || (coApp[0].amlCheck == 'Y' && coApp[0].amlStatus == 'No Match' || coApp[0].amlStatus == 'AML Approved')) {
                    //   this.navCtrl.navigate(CreditCheckPage, { userType: this.userType, GrefId: this.refId, fieldDisable: true, submitData: item });
                    // } else {
                    //   this.globFunc.globalAlert("Alert", `AML status -Co-Applicant: ${coApp[0].amlStatus}. Cannot proceed further`);
                    // }
                    // for (let i = 0; i < coApp.length; i++) {
                    //   coAppStatus = coAppStatus + coApp[0].creditCheck;
                    //   if (i == coApp.length - 1) {
                    //     if (coAppStatus.includes('0')) {
                    //       this.globFunc.globalAlert("Alert", "Please complete Co-Applicant Posidex check");
                    //     } else {
                    //       this.navCtrl.navigate(ScoreCardPage, { userType: this.userType, GrefId: this.refId, fieldDisable: true, submitData: item });
                    //     }
                    //   }
                    // }
                    // this.navCtrl.navigate(CreditCheckPage, { userType: this.userType, GrefId: this.refId, fieldDisable: true, submitData: item });
                  } else {
                    this.alertService.showAlert(
                      'Alert',
                      'Please complete Co-Applicant Posidex check'
                    );
                  }
                });
            } else {
              this.navCtrl.navigate(['/CreditCheckPage'], {
                queryParams: {
                  userType: this.userType,
                  GrefId: this.refId,
                  fieldDisable: true,
                  submitData: JSON.stringify(item),
                },
                skipLocationChange: true,
                replaceUrl: true,
              });
            }
          } else {
            // this.globFunc.globalAlert("Alert", `${data[0].amlCheck == 'Y' ? 'AML' : 'CBS'} status - Applicant: ${data[0].amlCheck == 'Y' ? data[0].amlStatus : data[0].cbsStatus }. Cannot proceed further`);
            this.alertService.showAlert(
              'Alert',
              data[0].amlCheck == 'Y' || data[0].cbsCheck == 'Y'
                ? `${
                    data[0].amlCheck == 'Y' ? 'AML' : 'CBS'
                  } status - Applicant: ${
                    data[0].amlCheck == 'Y'
                      ? data[0].amlStatus
                      : data[0].cbsStatus
                      ? data[0].cbsStatus
                      : 'Initiated'
                  }. Cannot proceed further`
                : 'Please complete Applicant AML/CBS check'
            );
          }
        } else {
          this.alertService.showAlert(
            'Alert',
            'Please complete Applicant Posidex check'
          );
        }
      });
  }

  scoreCard(item) {
    let coAppStatus = '';
    this.sqliteProvider
      .getSubmitDetails(item.refId, item.id)
      .then((creditCheckData) => {
        if (
          creditCheckData.length &&
          creditCheckData[0].creditEligibility == 'eligible'
        ) {
          this.globFunc.setScoreCardChecked(item.refId);
          this.navCtrl.navigate(['/ScoreCardPage'], {
            queryParams: {
              userType: this.userType,
              GrefId: this.refId,
              fieldDisable: true,
              submitData: JSON.stringify(item),
            },
            skipLocationChange: true,
            replaceUrl: true,
          });
          // if (item.coAppFlag == 'Y') {
          //   this.sqliteProvider.getSubmitDetailsByRefId(item.refId, 'C').then(coApp => {
          //     if (coApp.length > 0) {
          //       for (let i = 0; i < coApp.length; i++) {
          //         coAppStatus = coAppStatus + coApp[0].creditCheck;
          //         if (i == coApp.length - 1) {
          //           if (coAppStatus.includes('0')) {
          //             this.globFunc.globalAlert("Alert", "Please complete Co-Applicant Credit check");
          //           } else {
          //             this.navCtrl.navigate(ScoreCardPage, { userType: this.userType, GrefId: this.refId, fieldDisable: true, submitData: item });
          //           }
          //         }
          //       }
          //       // if (coApp.length > 0 && coApp[0].creditCheck == '1') {
          //       // }else{
          //       //   this.globFunc.globalAlert("Alert", "Please complete Co-Applicant Credit check");
          //       // }
          //     } else {
          //       this.globFunc.globalAlert("Alert", "Please complete Co-Applicant Credit check");
          //     }
          //   })
          // } else {
          //   this.navCtrl.navigate(ScoreCardPage, { userType: this.userType, GrefId: this.refId, fieldDisable: true, submitData: item });
          // }
        } else {
          this.alertService.showAlert(
            'Alert',
            'Please Complete Applicant Credit Check'
          );
        }
      });
  }

  additional(item) {
    this.globalData.setborrowerType(item.userType);
    this.globalData.setrefId(item.refId);
    this.globalData.setId(item.id);
    this.navCtrl.navigate(['/AdditionalDetailsPage'], {
      queryParams: { fieldDisable: true },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  async removeApplicant(item) {
    let alertq = await this.alertCtrl.create({
      header: 'Delete?',
      subHeader: 'Do you want to delete?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          handler: () => {
            console.log('cancelled');
            // this.loadAllDetails();
            this.loadAllApplicantDetails();
          },
        },
        {
          text: 'yes',
          handler: () => {
            // console.log("u r click yes");
            this.sqliteProvider
              .removeApplicantDetails(item.refId, item.id)
              .then((data) => {
                console.log(data);
                // this.loadAllDetails();
                this.loadAllApplicantDetails();
              })
              .catch((err) => {
                console.log(err);
              });
          },
        },
      ],
    });
    alertq.present();
  }

  loadAllApplicantDetails() {
    this.sqliteProvider
      .getSubmittedApplications(this.username)
      .then((data) => {
        // alert(JSON.stringify(data))
        this.items = [];
        this.items = data;
        this.itemslist = this.items;
        for (let i = 0; i < this.items.length; i++) {
          this.items[i].prdtype = this.getproducttype(this.items[i].janaLoan);
          this.items[i].branch = this.getBranch(this.items[i].loginBranch);
          this.items[i].janaLoanName = this.getLoanName(this.items[i].janaLoan);
          let newDate = new Date(this.items[i].createdDate).toString();
          this.items[i].inputDate =
            newDate == 'Invalid Date'
              ? this.items[i].createdDate
              : this.convertDate(this.items[i].createdDate); //this.convertDate(this.items[i].createdDate)
        }
        if (this.items.length > 0) {
          this.nouserdata = true;
        } else {
          this.nouserdata = false;
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  appstatus(item) {
    // this.status = item.applicationStatus;
    this.globalData.globalLodingPresent('Please wait...');
    let body = {
      propNo: item.applicationNumber,
    };
    this.master.restApiCallAngular('statusCheck', body).then(
      (res) => {
        // console.log((<any>res));
        if ((<any>res).errorCode == '000') {
          this.status = (<any>res).status + ': ' + (<any>res).flowPoint;
          this.sqliteProvider.updateSubmitDetails(
            item.cibilCheckStat,
            item.submitStat,
            item.applicationNumber,
            (<any>res).status + ': ' + (<any>res).flowPoint,
            item.cibilColor,
            item.cibilScore,
            item.statId
          );
          // this.navCtrl.setRoot(this.navCtrl.getActive().component);
          this.globalData.globalLodingDismiss();
          this.showStatusAlert();
        } else {
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Alert!', (<any>res).errorDesc);
        }
      },
      (err) => {
        this.globalData.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'No Response from Server!');
      }
    );
  }

  async showStatusAlert() {
    const alert = await this.alertCtrl.create({
      cssClass: 'status',
      header: 'Application Status',
      message: this.status,
      buttons: ['OK'],
    });
    alert.present();
  }

  serachClick() {
    if (this.showSearch) {
      this.showSearch = false;
    } else {
      this.showSearch = true;
    }
  }

  filterItems(event: any) {
    let searchTerm = event.target.value;
    this.items = this.itemslist;
    if (searchTerm && searchTerm !== '') {
      this.items = this.items.filter((item) => {
        return (
          (item.applicationNumber &&
            item.applicationNumber
              .toString()
              .toLowerCase()
              .indexOf(searchTerm.toLowerCase()) > -1) ||
          (item.firstname &&
            item.firstname.toLowerCase().indexOf(searchTerm.toLowerCase()) >
              -1) ||
          (item.inputDate &&
            item.inputDate
              .toString()
              .toLowerCase()
              .indexOf(searchTerm.toLowerCase()) > -1) ||
          (item.enterName &&
            item.enterName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
        );
      });
    }

    // this.sqliteProvider.getSubmittedApplications(this.username).then(data => {
    //   this.items = data;
    //   let value = event.target.value;
    //   if (value && value.trim() !== '') {
    //     // console.log(JSON.stringify(this.items));
    //     // console.log((this.items));

    //     this.items = this.items.filter(function (item) {
    //       return (
    //         (item.enterName.toLowerCase().indexOf(value.toLowerCase()) > -1) ||
    //         (item.appUniqueId.toLowerCase().indexOf(value.toLowerCase()) > -1) ||
    //         (item.loanAmount.toLowerCase().indexOf(value.toLowerCase()) > -1) ||
    //         (item.appRevd.toLowerCase().indexOf(value.toLowerCase()) > -1) ||
    //         (item.janaCenterName.toLowerCase().indexOf(value.toLowerCase()) > -1) ||
    //         (item.janaLoanName.toLowerCase().indexOf(value.toLowerCase()) > -1) ||
    //         (item.applicationStatus.toLowerCase().indexOf(value.toLowerCase()) > -1)
    //       )
    //     })
    //   }
    // }).catch(Error => {
    //   console.log(Error);
    //   this.items = [];
    // });
  }

  IMD(item) {
    this.globalData.setborrowerType(item.userType);
    this.globalData.setrefId(item.refId);
    this.globalData.setId(item.id);
    this.navCtrl.navigate(['/ImddetailsPage'], {
      queryParams: { fieldDisable: true },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  CASA(item) {
    this.globalData.setborrowerType(item.userType);
    this.globalData.setrefId(item.refId);
    this.globalData.setId(item.id);
    this.globalData.setCoAppFlag(item.coAppFlag);
    localStorage.setItem('submit', 'true');
    this.navCtrl.navigate(['/TabsPage'], {
      queryParams: { userVal: item, fieldDisable: true },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  referenceDetails(item) {
    this.globalData.setborrowerType(item.userType);
    this.globalData.setrefId(item.refId);
    this.globalData.setId(item.id);
    this.navCtrl.navigate(['/ReferenceDetailsPage'], {
      queryParams: { fieldDisable: true },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  nach(item) {
    // this.sqlSupport.getServDetails(item.refId, item.id).then(data => {
    //   console.log(data, 'data in nach func');
    //   if (data.length > 0) {
    this.globalData.setborrowerType(item.userType);
    this.globalData.setrefId(item.refId);
    this.globalData.setId(item.id);
    this.navCtrl.navigate(['/NachPage'], {
      queryParams: { fieldDisable: true },
      skipLocationChange: true,
      replaceUrl: true,
    });
    //   } else {
    //     this.alertService.showAlert("Alert!", "Please complete CASA details!");
    //   }
    // });
  }

  vehicleDetails(item) {
    this.globalData.setborrowerType(item.userType);
    this.globalData.setrefId(item.refId);
    this.globalData.setId(item.id);
    this.globalData.setCoAppFlag(item.coAppFlag);
    localStorage.setItem('submit', 'true');
    this.navCtrl.navigate(['/AssetTabsPage'], {
      queryParams: { userVal: item, fieldDisable: true },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  getproducts() {
    // let productType = localStorage.getItem('loan');
    this.sqliteProvider.getAllProductValues().then((data) => {
      this.pdt_master = data;
    });
  }

  getproducttype(janaLoan) {
    let prdType = this.pdt_master.find((f) => {
      if (f.prdCode === janaLoan) {
        return f.prdCode === janaLoan;
      }
    });
    return prdType.prdLoanType;
  }

  getLoanName(janaLoan) {
    let prdType = this.pdt_master.find((f) => {
      return f.prdCode === janaLoan;
    });
    return prdType.prdDesc;
  }

  getBranch(branch) {
    let branches = this.org_master.find((f) => {
      return f.OrgBranchCode === branch;
    });
    return branches.OrgName;
  }

  convertDate(str) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('-');
  }

  fieldInspect(item) {
    this.navCtrl.navigate(['/FieldInspectionPage'], {
      queryParams: {
        userType: this.userType,
        GrefId: this.refId,
        fieldDisable: true,
        submitData: JSON.stringify(item),
      },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }
  vehicleValuation() {
    this.navCtrl.navigate(['/VehicleValuationPage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  PDDSubmit(item) {
    if (item.postSancDocUpload == 'Y') {
      this.navCtrl.navigate(['/PddSubmissionPage'], {
        queryParams: {
          userType: this.userType,
          GrefId: this.refId,
          fieldDisable: true,
          submitData: JSON.stringify(item),
        },
        skipLocationChange: true,
        replaceUrl: true,
      });
    } else {
      this.alertService.showAlert('Alert', 'Please complete Post sanction');
    }
  }

  viewDocuments(item) {
    this.navCtrl.navigate(['/DocumentUploadPage'], {
      queryParams: { viewData: item, submitStatus: true },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  postSanction(item) {
    this.navCtrl.navigate(['/PostSanctionPage'], {
      queryParams: { viewData: JSON.stringify(item) },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  checkManualApprovalStatus(item) {
    // this.sqlSupport.updateForPostSanction(item.applicationNumber, 1).then(data => {

    // })
    this.globalData.globalLodingPresent('Please wait...');
    let body = {
      propNo: item.applicationNumber,
    };
    this.master.restApiCallAngular('ApprovalStatus', body).then(
      (res) => {
        // console.log((<any>res));
        if ((<any>res).statusCode == '000') {
          this.globalData.globalLodingDismiss();
          if (
            (<any>res).statusDescription.toLowerCase() ==
            'Approved'.toLowerCase()
          ) {
            this.sqlSupport
              .updateForPostSanction(item.applicationNumber, 1, 'N')
              .then((data) => {
                this.alertService.showAlert(
                  'Alert!',
                  'Approved... Proceed to post sanction'
                );
                this.loadAllApplicantDetails();
              });
          } else {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert('Alert!', (<any>res).statusDescription);
          }
        } else {
          this.globalData.globalLodingDismiss();
          this.alertService.showAlert('Alert!', (<any>res).statusDescription);
        }
      },
      (err) => {
        this.globalData.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'No Response from Server!');
      }
    );
  }
}
