import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import {
  AlertController,
  IonItemSliding,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
//7231222161141064
@Component({
  selector: 'app-existing',
  templateUrl: './existing.page.html',
  styleUrls: ['./existing.page.scss'],
})
export class ExistingPage {
  org_master: any = [];
  pdt_master: any = [];
  items: any = [];
  users: any = [];
  showhide: boolean;
  showSearch: boolean;
  noSearchResult: boolean;
  itemExpandHeight: number = 100;
  nouserdata: any;
  userType: any;
  username: any;
  appUniqueId: any;
  coapplicants: any;
  submitUrl: any;
  submitResult: any;
  janaCenter: any;
  productName: any;
  showSubmit: boolean = false;
  submitdata: any;
  leadStatus: any;
  online: boolean = true;
  wholeDetails: any;
  entityAddress: any;
  cibilStatus: any;
  nachAccnType: any;

  appCibilCheckStat: any;
  appHimarkCheckStat: any;

  coappCibilCheckStat: boolean = false;
  coappHimarkCheckStat: boolean = false;

  guaCibilCheckStat: boolean = false;
  guaHimarkCheckStat: boolean = false;

  itemslist: any[] = [];
  naveParamsValue: any;

  constructor(
    public navCtrl: NavController,
    public network: Network,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public alertCtrl: AlertController,
    public loadCtrl: LoadingController,
    public globFunc: GlobalService,
    public http: HTTP,
    public platform: Platform,
    public sqlSupport: SquliteSupportProviderService,
    public activateRoute: ActivatedRoute,
    public router: Router,
    public alertService: CustomAlertControlService
  ) {
    this.activateRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.leadStatus = this.naveParamsValue._leadStatus || 'online';
    this.submitUrl = environment.apiURL + 'LeadDetails';
    this.getproducts();
    this.username = this.globFunc.basicDec(localStorage.getItem('username'));
    this.sqliteProvider.getOrganisation().then((data) => {
      this.org_master = data;
    });
    if (this.naveParamsValue._leadStatus) {
      if (this.leadStatus == 'online') {
        this.online = true;
      } else if (this.leadStatus == 'offline') {
        this.online = false;
      }
    }
  }

  ionViewWillEnter() {
    this.globFunc.statusbarValuesForPages();
    this.loadAllApplicantDetails();
    this.globalData.setProfileImage(undefined);
    this.globalData.setEntiProfileImage(undefined);
    this.globalData.setrefId('');
    this.globalData.setId('');
    this.globalData.setloanType('');
    this.globalData.setCustType('');
    this.globalData._EditSaveStatus = [];
    localStorage.setItem('leadId', '');
    localStorage.setItem('Basic', '');
    localStorage.setItem('Sourcing', '');
    localStorage.setItem('Personal', '');
    localStorage.setItem('Permanent', '');
    localStorage.setItem('Present', '');
    localStorage.setItem('Proof', '');
  }
  ionViewWillLeave() {}

  ionViewDidEnter() {}

  newapplication() {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.leadStatus = 'online';
      this.userType = 'A';
      this.globalData.setborrowerType(this.userType);
      this.globalData.setCustType('N');
      this.router.navigate(['/ProofVerification'], {
        queryParams: { userType: this.userType, leadStatus: this.leadStatus },
        skipLocationChange: true,
        replaceUrl: true,
      });
    }
  }

  docsUpload(item) {
    this.globalData.setborrowerType(item.userType);
    this.globalData.setrefId(item.refId);
    this.globalData.setId(item.id);
    this.router.navigate(['/OtherDocsPage'], {
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
    if (item.cibilColor === 'Red') {
      this.alertService.showAlert(
        'Alert!',
        "CIBIL Score BAD, We can't proceed further!"
      );
    } else {
      this.sqliteProvider.getGuaranDetails(item.refId).then((gua) => {
        this.sqliteProvider
          .getCoappDetailsForBureau(item.refId)
          .then((coapp) => {
            if (gua.length > 0 || coapp.length > 0) {
              let cibilCheck = coapp.filter(
                (data) => data.cibilCheckStat == '0'
              );
              let himarkCheck = coapp.filter(
                (data) => data.himarkCheckStat == '0'
              );
              if (cibilCheck.length == 0) {
                if (himarkCheck.length == 0) {
                  this.router.navigate(['/DocumentUploadPage'], {
                    queryParams: { viewData: JSON.stringify(item) },
                    skipLocationChange: true,
                    replaceUrl: true,
                  });
                } else {
                  this.alertService.showAlert(
                    'Alert!',
                    "Please Check the Co-Applicant's Hi-Mark Status!"
                  );
                }
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  "Please Check the Co-Applicant's Cibil Status!"
                );
              }
            } else {
              this.sqliteProvider
                .getSubmitDetails(item.refId, item.id)
                .then((data) => {
                  let cibilCheckStat = data[0].cibilCheckStat;
                  let himarkCheckStat = data[0].himarkCheckStat;
                  if (cibilCheckStat == '1') {
                    if (himarkCheckStat == '1') {
                      this.router.navigate(['/DocumentUploadPage'], {
                        queryParams: { viewData: JSON.stringify(item) },
                        skipLocationChange: true,
                        replaceUrl: true,
                      });
                    } else {
                      this.alertService.showAlert(
                        'Alert!',
                        "Please Check the Applicant's Hi-Mark Status!"
                      );
                    }
                  } else {
                    this.alertService.showAlert(
                      'Alert!',
                      "Please Check the Applicant's Cibil Status!"
                    );
                  }
                });
            }
          });
      });
    }
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
                this.router.navigate(['/NewapplicationPage'], {
                  queryParams: {
                    appRefValue: JSON.stringify(item),
                    usertype: 'A',
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
                this.router.navigate(['/NewapplicationPage'], {
                  queryParams: {
                    appRefValue: JSON.stringify(item),
                    usertype: 'A',
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
              this.router.navigate(['/NewapplicationPage'], {
                queryParams: {
                  appRefValue: JSON.stringify(item),
                  usertype: 'A',
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
                this.router.navigate(['/NewapplicationPage'], {
                  queryParams: {
                    appRefValue: JSON.stringify(item),
                    usertype: 'A',
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
                this.router.navigate(['/NewapplicationPage'], {
                  queryParams: {
                    appRefValue: JSON.stringify(item),
                    usertype: 'A',
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
              this.router.navigate(['/NewapplicationPage'], {
                queryParams: {
                  appRefValue: JSON.stringify(item),
                  usertype: 'A',
                },
                skipLocationChange: true,
                replaceUrl: true,
              });
            }
          });
      }
    });
  }

  additional(item) {
    if (item.cibilColor === 'Red') {
      this.alertService.showAlert(
        'Alert!',
        "CIBIL Score BAD, We can't proceed further!"
      );
    } else {
      this.sqlSupport.getCASADetails(item.refId, item.id).then((casa) => {
        if (casa.length > 0) {
          if (casa[0].janaAcc == 'Y') {
            this.sqlSupport.getServDetails(item.refId, item.id).then((data) => {
              console.log(data, 'data in nach func');
              if (data.length > 0) {
                this.globalData.setborrowerType(item.userType);
                this.globalData.setrefId(item.refId);
                this.globalData.setId(item.id);
                this.router.navigate(['/AssetTabsPage'], {
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  'Please complete CASA details!'
                );
              }
            });
          } else {
            this.globalData.setborrowerType(item.userType);
            this.globalData.setrefId(item.refId);
            this.globalData.setId(item.id);
            this.router.navigate(['/AssetTabsPage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          }
        } else {
          this.alertService.showAlert(
            'Alert!',
            'Please complete CASA details!'
          );
        }
      });
    }
  }

  removeApplicant(item) {
    this.sqliteProvider
      .getSubmitDetails(item.refId, item.id)
      .then(async (data) => {
        this.cibilStatus = data[0].cibilCheckStat;
        if (this.cibilStatus === '1') {
          this.alertService.showAlert(
            'Alert!',
            'Deletion not allowed once CIBIL had been checked!'
          );
        } else {
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
      });
  }

  ageCalc(dob) {
    let dt = new Date();
    var diff = dt.getTime() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
  }

  loadAllApplicantDetails() {
    this.sqliteProvider
      .getAllDetails(this.leadStatus, this.username)
      .then((data) => {
        this.items = [];
        this.items = data;
        this.itemslist = this.items;
        for (let i = 0; i < this.items.length; i++) {
          this.items[i].prdtype = this.getproducttype(this.items[i].janaLoan);
          this.items[i].branch = this.getBranch(this.items[i].loginBranch);
          this.items[i].janaLoanName = this.getLoanName(this.items[i].janaLoan);
          this.items[i].inputDate = this.convertDate(this.items[i].createdDate);
          this.items[i].age = this.ageCalc(this.items[i].dob);
        }
        console.log(this.items, 'all applicant');
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

  cibilreport(item) {
    let docs;
    let custType = this.globalData.getCustomerType();
    let manDocumentCount = 0;
    this.sqliteProvider.getProductValuesCount(item.janaLoan).then((data) => {
      if (data) {
        if (custType == '1') {
          if (item.userType == 'A') {
            manDocumentCount = +data[0].prdAppDocCount;
          } else if (item.userType == 'G') {
            manDocumentCount = +data[0].prdGuaDocCount;
          } else if (item.userType == 'C') {
            manDocumentCount = +data[0].prdCoappDocCount;
          }
        } else {
          manDocumentCount = +data[0].prdEntityDocCount;
        }

        this.sqliteProvider
          .getPresentAddress(item.refId, item.id)
          .then((proof) => {
            if (proof.length > 0) {
              this.sqliteProvider.selectOrgin(item.refId).then((data) => {
                console.log(`cibil data ===>${JSON.stringify(data)}`);
                this.globalData.setCustomerType(item.customerType);
                this.globalData.setUniqueId(data[0].rootId);
                this.router.navigate(['/CibilcheckPage'], {
                  queryParams: { viewData: JSON.stringify(item) },
                  skipLocationChange: true,
                  replaceUrl: true,
                });
              });
            } else {
              this.alertService.showAlert(
                'Alert!',
                'Please complete Applicant address details!'
              );
            }
          });
      }
    });
  }

  loadGuaranDetails(item) {
    if (item.cibilColor === 'Red') {
      this.alertService.showAlert(
        'Alert!',
        "CIBIL Score BAD, We can't proceed further!"
      );
    } else {
      let coAppStatus = '';
      this.sqliteProvider.getPersonalDetails(item.refId, item.id).then(
        (app) => {
          if (app.length > 0) {
            this.sqliteProvider.getPresentAddress(item.refId, item.id).then(
              (pres) => {
                if (pres.length > 0) {
                  this.sqliteProvider
                    .getPermanentAddress(item.refId, item.id)
                    .then(
                      (perm) => {
                        if (perm.length > 0) {
                          let docs;
                          let custType = this.globalData.getCustomerType();
                          if (custType == 1) {
                            docs = {
                              DocPrdCode: localStorage.getItem('product'),
                              EntityDocFlag: 'N',
                            };
                          } else {
                            docs = {
                              DocPrdCode: localStorage.getItem('product'),
                              EntityDocFlag: '',
                            };
                          }
                          this.sqliteProvider
                            .getProductValuesCount(item.janaLoan)
                            .then(
                              (mand) => {
                                if (parseInt(mand[0].prdAppDocCount) > 0) {
                                  this.sqliteProvider
                                    .getPromoterProofDetails(
                                      item.refId,
                                      item.id
                                    )
                                    .then(
                                      (proof) => {
                                        console.log(mand, 'mand docs');
                                        console.log(proof, 'proof docs');
                                        if (
                                          proof.length >=
                                          parseInt(mand[0].prdAppDocCount)
                                        ) {
                                          // if (proof.length >= 5) {

                                          if (
                                            item.coAppFlag == 'Y' &&
                                            item.guaFlag == 'Y'
                                          ) {
                                            this.sqliteProvider
                                              .getGuaranDetails(item.refId)
                                              .then((gua) => {
                                                // if (gua.length > 0) {
                                                this.sqliteProvider
                                                  .getCoappDetails(item.refId)
                                                  .then(
                                                    (coapp) => {
                                                      if (coapp.length > 0) {
                                                        for (
                                                          let i = 0;
                                                          i < coapp.length;
                                                          i++
                                                        ) {
                                                          this.sqliteProvider
                                                            .getPromoterProofDetails(
                                                              item.refId,
                                                              coapp[i].id
                                                            )
                                                            .then(
                                                              (coAppProof) => {
                                                                this.sqliteProvider
                                                                  .getPromoterProofImageDetails(
                                                                    item.refId,
                                                                    coapp[i].id
                                                                  )
                                                                  .then(
                                                                    (
                                                                      coProofData
                                                                    ) => {
                                                                      if (
                                                                        coAppProof.length !=
                                                                        coProofData.length
                                                                      ) {
                                                                        coAppStatus =
                                                                          coAppStatus +
                                                                          '0';
                                                                      }
                                                                      if (
                                                                        i ==
                                                                        coapp.length -
                                                                          1
                                                                      ) {
                                                                        if (
                                                                          coAppStatus.includes(
                                                                            '0'
                                                                          )
                                                                        ) {
                                                                          this.alertService.showAlert(
                                                                            'Alert!',
                                                                            "Please capture Co-Applicant's Mandatory KYC Docs!"
                                                                          );
                                                                        } else {
                                                                          this.sqlSupport
                                                                            .getCASADetails(
                                                                              item.refId,
                                                                              item.id
                                                                            )
                                                                            .then(
                                                                              (
                                                                                casa
                                                                              ) => {
                                                                                if (
                                                                                  casa.length >
                                                                                  0
                                                                                ) {
                                                                                  if (
                                                                                    casa[0]
                                                                                      .janaAcc ==
                                                                                    'Y'
                                                                                  ) {
                                                                                    if (
                                                                                      casa[0]
                                                                                        .nomAvail ==
                                                                                      'Y'
                                                                                    ) {
                                                                                      this.sqlSupport
                                                                                        .getNomineeDetails(
                                                                                          item.refId,
                                                                                          item.id
                                                                                        )
                                                                                        .then(
                                                                                          (
                                                                                            nom
                                                                                          ) => {
                                                                                            if (
                                                                                              nom.length >
                                                                                              0
                                                                                            ) {
                                                                                              this.sqlSupport
                                                                                                .getServDetails(
                                                                                                  item.refId,
                                                                                                  item.id
                                                                                                )
                                                                                                .then(
                                                                                                  (
                                                                                                    ser
                                                                                                  ) => {
                                                                                                    if (
                                                                                                      ser.length >
                                                                                                      0
                                                                                                    ) {
                                                                                                      this.sqlSupport
                                                                                                        .getreferenceDetails(
                                                                                                          item.refId,
                                                                                                          item.id
                                                                                                        )
                                                                                                        .then(
                                                                                                          (
                                                                                                            nach
                                                                                                          ) => {
                                                                                                            if (
                                                                                                              nach.length >
                                                                                                              0
                                                                                                            ) {
                                                                                                              this.router.navigate(
                                                                                                                [
                                                                                                                  '/submit',
                                                                                                                ],
                                                                                                                {
                                                                                                                  queryParams:
                                                                                                                    {
                                                                                                                      applicantDetails:
                                                                                                                        JSON.stringify(
                                                                                                                          item
                                                                                                                        ),
                                                                                                                      coappDetails:
                                                                                                                        JSON.stringify(
                                                                                                                          coapp
                                                                                                                        ),
                                                                                                                      guaranDetails:
                                                                                                                        JSON.stringify(
                                                                                                                          gua
                                                                                                                        ),
                                                                                                                    },
                                                                                                                  skipLocationChange:
                                                                                                                    true,
                                                                                                                  replaceUrl:
                                                                                                                    true,
                                                                                                                }
                                                                                                              );
                                                                                                            } else {
                                                                                                              this.alertService.showAlert(
                                                                                                                'Alert!',
                                                                                                                'Please add Reference Details!'
                                                                                                              );
                                                                                                            }
                                                                                                          }
                                                                                                        );
                                                                                                    } else {
                                                                                                      this.alertService.showAlert(
                                                                                                        'Alert!',
                                                                                                        'Please add Service Details!'
                                                                                                      );
                                                                                                    }
                                                                                                  },
                                                                                                  (
                                                                                                    err
                                                                                                  ) => {
                                                                                                    console.log(
                                                                                                      err
                                                                                                    );
                                                                                                  }
                                                                                                );
                                                                                            } else {
                                                                                              this.alertService.showAlert(
                                                                                                'Alert!',
                                                                                                'Please add Nominee Details!'
                                                                                              );
                                                                                            }
                                                                                          },
                                                                                          (
                                                                                            err
                                                                                          ) => {
                                                                                            console.log(
                                                                                              err
                                                                                            );
                                                                                          }
                                                                                        );
                                                                                    } else {
                                                                                      this.sqlSupport
                                                                                        .getServDetails(
                                                                                          item.refId,
                                                                                          item.id
                                                                                        )
                                                                                        .then(
                                                                                          (
                                                                                            ser
                                                                                          ) => {
                                                                                            if (
                                                                                              ser.length >
                                                                                              0
                                                                                            ) {
                                                                                              this.sqlSupport
                                                                                                .getreferenceDetails(
                                                                                                  item.refId,
                                                                                                  item.id
                                                                                                )
                                                                                                .then(
                                                                                                  (
                                                                                                    nach
                                                                                                  ) => {
                                                                                                    if (
                                                                                                      nach.length >
                                                                                                      0
                                                                                                    ) {
                                                                                                      this.router.navigate(
                                                                                                        [
                                                                                                          '/submit',
                                                                                                        ],
                                                                                                        {
                                                                                                          queryParams:
                                                                                                            {
                                                                                                              applicantDetails:
                                                                                                                JSON.stringify(
                                                                                                                  item
                                                                                                                ),
                                                                                                              coappDetails:
                                                                                                                JSON.stringify(
                                                                                                                  coapp
                                                                                                                ),
                                                                                                              guaranDetails:
                                                                                                                JSON.stringify(
                                                                                                                  gua
                                                                                                                ),
                                                                                                            },
                                                                                                          skipLocationChange:
                                                                                                            true,
                                                                                                          replaceUrl:
                                                                                                            true,
                                                                                                        }
                                                                                                      );
                                                                                                    } else {
                                                                                                      this.alertService.showAlert(
                                                                                                        'Alert!',
                                                                                                        'Please add Reference Details!'
                                                                                                      );
                                                                                                    }
                                                                                                  }
                                                                                                );
                                                                                            } else {
                                                                                              this.alertService.showAlert(
                                                                                                'Alert!',
                                                                                                'Please add Service Details!'
                                                                                              );
                                                                                            }
                                                                                          },
                                                                                          (
                                                                                            err
                                                                                          ) => {
                                                                                            console.log(
                                                                                              err
                                                                                            );
                                                                                          }
                                                                                        );
                                                                                    }
                                                                                  } else {
                                                                                    this.sqlSupport
                                                                                      .getreferenceDetails(
                                                                                        item.refId,
                                                                                        item.id
                                                                                      )
                                                                                      .then(
                                                                                        (
                                                                                          nach
                                                                                        ) => {
                                                                                          if (
                                                                                            nach.length >
                                                                                            0
                                                                                          ) {
                                                                                            this.router.navigate(
                                                                                              [
                                                                                                '/submit',
                                                                                              ],
                                                                                              {
                                                                                                queryParams:
                                                                                                  {
                                                                                                    applicantDetails:
                                                                                                      JSON.stringify(
                                                                                                        item
                                                                                                      ),
                                                                                                    coappDetails:
                                                                                                      JSON.stringify(
                                                                                                        coapp
                                                                                                      ),
                                                                                                    guaranDetails:
                                                                                                      JSON.stringify(
                                                                                                        gua
                                                                                                      ),
                                                                                                  },
                                                                                                skipLocationChange:
                                                                                                  true,
                                                                                                replaceUrl:
                                                                                                  true,
                                                                                              }
                                                                                            );
                                                                                            // this.navCtrl.push(SubmitPage, { applicantDetails: item, coappDetails: coapp, guaranDetails: JSON.stringify(gua) });
                                                                                          } else {
                                                                                            this.alertService.showAlert(
                                                                                              'Alert!',
                                                                                              'Please add Reference Details!'
                                                                                            );
                                                                                          }
                                                                                        }
                                                                                      );

                                                                                    // this.navCtrl.push(SubmitPage, { applicantDetails: item, coappDetails: coapp, guaranDetails: JSON.stringify(gua) });
                                                                                  }
                                                                                } else {
                                                                                  this.alertService.showAlert(
                                                                                    'Alert!',
                                                                                    'Please add the CASA Details!'
                                                                                  );
                                                                                }
                                                                              },
                                                                              (
                                                                                err
                                                                              ) => {
                                                                                console.log(
                                                                                  err
                                                                                );
                                                                              }
                                                                            );
                                                                        }
                                                                      }
                                                                    }
                                                                  );
                                                              }
                                                            );
                                                        }
                                                      } else {
                                                        this.alertService.showAlert(
                                                          'Alert!',
                                                          'Please add the Co-Applicant Details!'
                                                        );
                                                      }
                                                    },
                                                    (err) => {
                                                      console.log(err);
                                                    }
                                                  );
                                              });
                                          } else if (
                                            item.coAppFlag == 'Y' &&
                                            item.guaFlag == 'N'
                                          ) {
                                            this.sqliteProvider
                                              .getCoappDetails(item.refId)
                                              .then(
                                                (coapp) => {
                                                  if (coapp.length > 0) {
                                                    for (
                                                      let i = 0;
                                                      i < coapp.length;
                                                      i++
                                                    ) {
                                                      this.sqliteProvider
                                                        .getPromoterProofDetails(
                                                          item.refId,
                                                          coapp[i].id
                                                        )
                                                        .then((coAppProof) => {
                                                          this.sqliteProvider
                                                            .getPromoterProofImageDetails(
                                                              item.refId,
                                                              coapp[i].id
                                                            )
                                                            .then(
                                                              (coProofData) => {
                                                                if (
                                                                  coAppProof.length !=
                                                                  coProofData.length
                                                                ) {
                                                                  coAppStatus =
                                                                    coAppStatus +
                                                                    '0';
                                                                }
                                                                if (
                                                                  i ==
                                                                  coapp.length -
                                                                    1
                                                                ) {
                                                                  if (
                                                                    coAppStatus.includes(
                                                                      '0'
                                                                    )
                                                                  ) {
                                                                    this.alertService.showAlert(
                                                                      'Alert!',
                                                                      "Please capture Co-Applicant's Mandatory KYC Docs!"
                                                                    );
                                                                  } else {
                                                                    this.sqlSupport
                                                                      .getCASADetails(
                                                                        item.refId,
                                                                        item.id
                                                                      )
                                                                      .then(
                                                                        (
                                                                          casa
                                                                        ) => {
                                                                          if (
                                                                            casa.length >
                                                                            0
                                                                          ) {
                                                                            if (
                                                                              casa[0]
                                                                                .janaAcc ==
                                                                              'Y'
                                                                            ) {
                                                                              if (
                                                                                casa[0]
                                                                                  .nomAvail ==
                                                                                'Y'
                                                                              ) {
                                                                                this.sqlSupport
                                                                                  .getNomineeDetails(
                                                                                    item.refId,
                                                                                    item.id
                                                                                  )
                                                                                  .then(
                                                                                    (
                                                                                      nom
                                                                                    ) => {
                                                                                      if (
                                                                                        nom.length >
                                                                                        0
                                                                                      ) {
                                                                                        this.sqlSupport
                                                                                          .getServDetails(
                                                                                            item.refId,
                                                                                            item.id
                                                                                          )
                                                                                          .then(
                                                                                            (
                                                                                              ser
                                                                                            ) => {
                                                                                              if (
                                                                                                ser.length >
                                                                                                0
                                                                                              ) {
                                                                                                this.sqlSupport
                                                                                                  .getreferenceDetails(
                                                                                                    item.refId,
                                                                                                    item.id
                                                                                                  )
                                                                                                  .then(
                                                                                                    (
                                                                                                      nach
                                                                                                    ) => {
                                                                                                      if (
                                                                                                        nach.length >
                                                                                                        0
                                                                                                      ) {
                                                                                                        this.router.navigate(
                                                                                                          [
                                                                                                            '/submit',
                                                                                                          ],
                                                                                                          {
                                                                                                            queryParams:
                                                                                                              {
                                                                                                                applicantDetails:
                                                                                                                  JSON.stringify(
                                                                                                                    item
                                                                                                                  ),
                                                                                                                coappDetails:
                                                                                                                  JSON.stringify(
                                                                                                                    coapp
                                                                                                                  ),
                                                                                                              },
                                                                                                            skipLocationChange:
                                                                                                              true,
                                                                                                            replaceUrl:
                                                                                                              true,
                                                                                                          }
                                                                                                        );
                                                                                                      } else {
                                                                                                        this.alertService.showAlert(
                                                                                                          'Alert!',
                                                                                                          'Please add Reference Details!'
                                                                                                        );
                                                                                                      }
                                                                                                    }
                                                                                                  );
                                                                                              } else {
                                                                                                this.alertService.showAlert(
                                                                                                  'Alert!',
                                                                                                  'Please add Service Details!'
                                                                                                );
                                                                                              }
                                                                                            },
                                                                                            (
                                                                                              err
                                                                                            ) => {
                                                                                              console.log(
                                                                                                err
                                                                                              );
                                                                                            }
                                                                                          );
                                                                                      } else {
                                                                                        this.alertService.showAlert(
                                                                                          'Alert!',
                                                                                          'Please add Nominee Details!'
                                                                                        );
                                                                                      }
                                                                                    },
                                                                                    (
                                                                                      err
                                                                                    ) => {
                                                                                      console.log(
                                                                                        err
                                                                                      );
                                                                                    }
                                                                                  );
                                                                              } else {
                                                                                this.sqlSupport
                                                                                  .getServDetails(
                                                                                    item.refId,
                                                                                    item.id
                                                                                  )
                                                                                  .then(
                                                                                    (
                                                                                      ser
                                                                                    ) => {
                                                                                      if (
                                                                                        ser.length >
                                                                                        0
                                                                                      ) {
                                                                                        this.sqlSupport
                                                                                          .getreferenceDetails(
                                                                                            item.refId,
                                                                                            item.id
                                                                                          )
                                                                                          .then(
                                                                                            (
                                                                                              nach
                                                                                            ) => {
                                                                                              if (
                                                                                                nach.length >
                                                                                                0
                                                                                              ) {
                                                                                                this.router.navigate(
                                                                                                  [
                                                                                                    '/submit',
                                                                                                  ],
                                                                                                  {
                                                                                                    queryParams:
                                                                                                      {
                                                                                                        applicantDetails:
                                                                                                          JSON.stringify(
                                                                                                            item
                                                                                                          ),
                                                                                                        coappDetails:
                                                                                                          JSON.stringify(
                                                                                                            coapp
                                                                                                          ),
                                                                                                      },
                                                                                                    skipLocationChange:
                                                                                                      true,
                                                                                                    replaceUrl:
                                                                                                      true,
                                                                                                  }
                                                                                                );
                                                                                              } else {
                                                                                                this.alertService.showAlert(
                                                                                                  'Alert!',
                                                                                                  'Please add Reference Details!'
                                                                                                );
                                                                                              }
                                                                                            }
                                                                                          );
                                                                                      } else {
                                                                                        this.alertService.showAlert(
                                                                                          'Alert!',
                                                                                          'Please add Service Details!'
                                                                                        );
                                                                                      }
                                                                                    },
                                                                                    (
                                                                                      err
                                                                                    ) => {
                                                                                      console.log(
                                                                                        err
                                                                                      );
                                                                                    }
                                                                                  );
                                                                              }
                                                                            } else {
                                                                              this.sqlSupport
                                                                                .getreferenceDetails(
                                                                                  item.refId,
                                                                                  item.id
                                                                                )
                                                                                .then(
                                                                                  (
                                                                                    nach
                                                                                  ) => {
                                                                                    if (
                                                                                      nach.length >
                                                                                      0
                                                                                    ) {
                                                                                      this.router.navigate(
                                                                                        [
                                                                                          '/submit',
                                                                                        ],
                                                                                        {
                                                                                          queryParams:
                                                                                            {
                                                                                              applicantDetails:
                                                                                                JSON.stringify(
                                                                                                  item
                                                                                                ),
                                                                                              coappDetails:
                                                                                                JSON.stringify(
                                                                                                  coapp
                                                                                                ),
                                                                                            },
                                                                                          skipLocationChange:
                                                                                            true,
                                                                                          replaceUrl:
                                                                                            true,
                                                                                        }
                                                                                      );
                                                                                    } else {
                                                                                      this.alertService.showAlert(
                                                                                        'Alert!',
                                                                                        'Please add Reference Details!'
                                                                                      );
                                                                                    }
                                                                                  }
                                                                                );
                                                                            }
                                                                          } else {
                                                                            this.alertService.showAlert(
                                                                              'Alert!',
                                                                              'Please add the CASA Details!'
                                                                            );
                                                                          }
                                                                        },
                                                                        (
                                                                          err
                                                                        ) => {
                                                                          console.log(
                                                                            err
                                                                          );
                                                                        }
                                                                      );
                                                                  }
                                                                }
                                                              }
                                                            );
                                                        });
                                                    }
                                                  } else {
                                                    this.alertService.showAlert(
                                                      'Alert!',
                                                      'Please add the Co-Applicant Details!'
                                                    );
                                                  }
                                                },
                                                (err) => {
                                                  console.log(err);
                                                }
                                              );
                                          } else if (
                                            item.coAppFlag == 'N' &&
                                            item.guaFlag == 'Y'
                                          ) {
                                            this.sqliteProvider
                                              .getGuaranDetails(item.refId)
                                              .then(
                                                (gua) => {
                                                  this.sqlSupport
                                                    .getCASADetails(
                                                      item.refId,
                                                      item.id
                                                    )
                                                    .then(
                                                      (casa) => {
                                                        if (casa.length > 0) {
                                                          if (
                                                            casa[0].janaAcc ==
                                                            'Y'
                                                          ) {
                                                            if (
                                                              casa[0]
                                                                .nomAvail == 'Y'
                                                            ) {
                                                              this.sqlSupport
                                                                .getNomineeDetails(
                                                                  item.refId,
                                                                  item.id
                                                                )
                                                                .then(
                                                                  (nom) => {
                                                                    if (
                                                                      nom.length >
                                                                      0
                                                                    ) {
                                                                      this.sqlSupport
                                                                        .getServDetails(
                                                                          item.refId,
                                                                          item.id
                                                                        )
                                                                        .then(
                                                                          (
                                                                            ser
                                                                          ) => {
                                                                            if (
                                                                              ser.length >
                                                                              0
                                                                            ) {
                                                                              this.sqlSupport
                                                                                .getreferenceDetails(
                                                                                  item.refId,
                                                                                  item.id
                                                                                )
                                                                                .then(
                                                                                  (
                                                                                    nach
                                                                                  ) => {
                                                                                    if (
                                                                                      nach.length >
                                                                                      0
                                                                                    ) {
                                                                                      this.router.navigate(
                                                                                        [
                                                                                          '/submit',
                                                                                        ],
                                                                                        {
                                                                                          queryParams:
                                                                                            {
                                                                                              applicantDetails:
                                                                                                JSON.stringify(
                                                                                                  item
                                                                                                ),
                                                                                              guaranDetails:
                                                                                                JSON.stringify(
                                                                                                  gua
                                                                                                ),
                                                                                            },
                                                                                          skipLocationChange:
                                                                                            true,
                                                                                          replaceUrl:
                                                                                            true,
                                                                                        }
                                                                                      );
                                                                                    } else {
                                                                                      this.alertService.showAlert(
                                                                                        'Alert!',
                                                                                        'Please add Reference Details!'
                                                                                      );
                                                                                    }
                                                                                  }
                                                                                );
                                                                            } else {
                                                                              this.alertService.showAlert(
                                                                                'Alert!',
                                                                                'Please add Service Details!'
                                                                              );
                                                                            }
                                                                          },
                                                                          (
                                                                            err
                                                                          ) => {
                                                                            console.log(
                                                                              err
                                                                            );
                                                                          }
                                                                        );
                                                                    } else {
                                                                      this.alertService.showAlert(
                                                                        'Alert!',
                                                                        'Please add Nominee Details!'
                                                                      );
                                                                    }
                                                                  },
                                                                  (err) => {
                                                                    console.log(
                                                                      err
                                                                    );
                                                                  }
                                                                );
                                                            } else {
                                                              this.sqlSupport
                                                                .getServDetails(
                                                                  item.refId,
                                                                  item.id
                                                                )
                                                                .then(
                                                                  (ser) => {
                                                                    if (
                                                                      ser.length >
                                                                      0
                                                                    ) {
                                                                      this.sqlSupport
                                                                        .getreferenceDetails(
                                                                          item.refId,
                                                                          item.id
                                                                        )
                                                                        .then(
                                                                          (
                                                                            nach
                                                                          ) => {
                                                                            if (
                                                                              nach.length >
                                                                              0
                                                                            ) {
                                                                              this.router.navigate(
                                                                                [
                                                                                  '/submit',
                                                                                ],
                                                                                {
                                                                                  queryParams:
                                                                                    {
                                                                                      applicantDetails:
                                                                                        JSON.stringify(
                                                                                          item
                                                                                        ),
                                                                                      guaranDetails:
                                                                                        JSON.stringify(
                                                                                          gua
                                                                                        ),
                                                                                    },
                                                                                  skipLocationChange:
                                                                                    true,
                                                                                  replaceUrl:
                                                                                    true,
                                                                                }
                                                                              );
                                                                            } else {
                                                                              this.alertService.showAlert(
                                                                                'Alert!',
                                                                                'Please add Reference Details!'
                                                                              );
                                                                            }
                                                                          }
                                                                        );
                                                                    } else {
                                                                      this.alertService.showAlert(
                                                                        'Alert!',
                                                                        'Please add Service Details!'
                                                                      );
                                                                    }
                                                                  },
                                                                  (err) => {
                                                                    console.log(
                                                                      err
                                                                    );
                                                                  }
                                                                );
                                                            }
                                                          } else {
                                                            this.sqlSupport
                                                              .getreferenceDetails(
                                                                item.refId,
                                                                item.id
                                                              )
                                                              .then((nach) => {
                                                                if (
                                                                  nach.length >
                                                                  0
                                                                ) {
                                                                  // this.navCtrl.push(SubmitPage, { applicantDetails: item, coappDetails: coapp, guaranDetails: JSON.stringify(gua) });
                                                                  this.router.navigate(
                                                                    ['/submit'],
                                                                    {
                                                                      queryParams:
                                                                        {
                                                                          applicantDetails:
                                                                            JSON.stringify(
                                                                              item
                                                                            ),
                                                                          guaranDetails:
                                                                            JSON.stringify(
                                                                              gua
                                                                            ),
                                                                        },
                                                                      skipLocationChange:
                                                                        true,
                                                                      replaceUrl:
                                                                        true,
                                                                    }
                                                                  );
                                                                } else {
                                                                  this.alertService.showAlert(
                                                                    'Alert!',
                                                                    'Please add Reference Details!'
                                                                  );
                                                                }
                                                              });
                                                          }
                                                        } else {
                                                          this.alertService.showAlert(
                                                            'Alert!',
                                                            'Please add the CASA Details!'
                                                          );
                                                        }
                                                      },
                                                      (err) => {
                                                        console.log(err);
                                                      }
                                                    );
                                                },
                                                (err) => {
                                                  console.log(err);
                                                }
                                              );
                                          } else if (item.coAppFlag == 'N') {
                                            this.sqlSupport
                                              .getCASADetails(
                                                item.refId,
                                                item.id
                                              )
                                              .then(
                                                (casa) => {
                                                  if (casa.length > 0) {
                                                    if (
                                                      casa[0].janaAcc == 'Y'
                                                    ) {
                                                      if (
                                                        casa[0].nomAvail == 'Y'
                                                      ) {
                                                        this.sqlSupport
                                                          .getNomineeDetails(
                                                            item.refId,
                                                            item.id
                                                          )
                                                          .then(
                                                            (nom) => {
                                                              if (
                                                                nom.length > 0
                                                              ) {
                                                                this.sqlSupport
                                                                  .getServDetails(
                                                                    item.refId,
                                                                    item.id
                                                                  )
                                                                  .then(
                                                                    (ser) => {
                                                                      if (
                                                                        ser.length >
                                                                        0
                                                                      ) {
                                                                        this.sqlSupport
                                                                          .getreferenceDetails(
                                                                            item.refId,
                                                                            item.id
                                                                          )
                                                                          .then(
                                                                            (
                                                                              nach
                                                                            ) => {
                                                                              if (
                                                                                nach.length >
                                                                                0
                                                                              ) {
                                                                                this.router.navigate(
                                                                                  [
                                                                                    '/submit',
                                                                                  ],
                                                                                  {
                                                                                    queryParams:
                                                                                      {
                                                                                        applicantDetails:
                                                                                          JSON.stringify(
                                                                                            item
                                                                                          ),
                                                                                        guaranDetails:
                                                                                          '',
                                                                                      },
                                                                                    skipLocationChange:
                                                                                      true,
                                                                                    replaceUrl:
                                                                                      true,
                                                                                  }
                                                                                );
                                                                              } else {
                                                                                this.alertService.showAlert(
                                                                                  'Alert!',
                                                                                  'Please add Reference Details!'
                                                                                );
                                                                              }
                                                                            }
                                                                          );
                                                                      } else {
                                                                        this.alertService.showAlert(
                                                                          'Alert!',
                                                                          'Please add Service Details!'
                                                                        );
                                                                      }
                                                                    },
                                                                    (err) => {
                                                                      console.log(
                                                                        err
                                                                      );
                                                                    }
                                                                  );
                                                              } else {
                                                                this.alertService.showAlert(
                                                                  'Alert!',
                                                                  'Please add Nominee Details!'
                                                                );
                                                              }
                                                            },
                                                            (err) => {
                                                              console.log(err);
                                                            }
                                                          );
                                                      } else {
                                                        this.sqlSupport
                                                          .getServDetails(
                                                            item.refId,
                                                            item.id
                                                          )
                                                          .then(
                                                            (ser) => {
                                                              if (
                                                                ser.length > 0
                                                              ) {
                                                                this.sqlSupport
                                                                  .getreferenceDetails(
                                                                    item.refId,
                                                                    item.id
                                                                  )
                                                                  .then(
                                                                    (nach) => {
                                                                      if (
                                                                        nach.length >
                                                                        0
                                                                      ) {
                                                                        this.router.navigate(
                                                                          [
                                                                            '/submit',
                                                                          ],
                                                                          {
                                                                            queryParams:
                                                                              {
                                                                                applicantDetails:
                                                                                  JSON.stringify(
                                                                                    item
                                                                                  ),
                                                                                guaranDetails:
                                                                                  '',
                                                                              },
                                                                            skipLocationChange:
                                                                              true,
                                                                            replaceUrl:
                                                                              true,
                                                                          }
                                                                        );
                                                                      } else {
                                                                        this.alertService.showAlert(
                                                                          'Alert!',
                                                                          'Please add Reference Details!'
                                                                        );
                                                                      }
                                                                    }
                                                                  );
                                                              } else {
                                                                this.alertService.showAlert(
                                                                  'Alert!',
                                                                  'Please add Service Details!'
                                                                );
                                                              }
                                                            },
                                                            (err) => {
                                                              console.log(err);
                                                            }
                                                          );
                                                      }
                                                    } else {
                                                      this.sqlSupport
                                                        .getreferenceDetails(
                                                          item.refId,
                                                          item.id
                                                        )
                                                        .then((nach) => {
                                                          if (nach.length > 0) {
                                                            // this.navCtrl.push(SubmitPage, { applicantDetails: item, coappDetails: coapp, guaranDetails: JSON.stringify(gua) });
                                                            this.router.navigate(
                                                              ['/submit'],
                                                              {
                                                                queryParams: {
                                                                  applicantDetails:
                                                                    JSON.stringify(
                                                                      item
                                                                    ),
                                                                  guaranDetails:
                                                                    '',
                                                                },
                                                                skipLocationChange:
                                                                  true,
                                                                replaceUrl:
                                                                  true,
                                                              }
                                                            );
                                                          } else {
                                                            this.alertService.showAlert(
                                                              'Alert!',
                                                              'Please add Reference Details!'
                                                            );
                                                          }
                                                        });
                                                    }
                                                  } else {
                                                    this.alertService.showAlert(
                                                      'Alert!',
                                                      'Please add the CASA Details!'
                                                    );
                                                  }
                                                },
                                                (err) => {
                                                  console.log(err);
                                                }
                                              );
                                          }
                                        } else {
                                          this.alertService.showAlert(
                                            'Alert!',
                                            "Please add the Applicant's Mandatory KYC Docs!"
                                          );
                                        }
                                      },
                                      (err) => {
                                        console.log(err);
                                      }
                                    );
                                } else {
                                  this.alertService.showAlert(
                                    'Alert!',
                                    'For this product Applicant document count is empty, please configure!'
                                  );
                                }
                              },
                              (err) => {
                                console.log(err);
                              }
                            );
                        } else {
                          this.alertService.showAlert(
                            'Alert!',
                            "Please add the Applicant's Permanent Address Details!"
                          );
                        }
                      },
                      (err) => {
                        console.log(err);
                      }
                    );
                } else {
                  this.alertService.showAlert(
                    'Alert!',
                    "Please add the Applicant's Present Address Details!"
                  );
                }
              },
              (err) => {
                console.log(err);
              }
            );
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Please add the Applicant Details!'
            );
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
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
          (item.appUniqueId &&
            item.appUniqueId
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
  }
  async ageFromDb(item) {
    try {
      const borrower = await this.sqliteProvider.getAgePersonalDetails(
        item.refId,
        item.id
      );
      const borrowerAge = this.ageCalc(borrower[0].dob);
      return borrowerAge;
    } catch (error) {
      return error;
    }
  }
  CASA(item) {
    if (item.cibilColor === 'Red') {
      this.alertService.showAlert(
        'Alert!',
        "CIBIL Score BAD, We can't proceed further!"
      );
    } else {
      let coAppStatus = '';
      this.ageFromDb(item)
        .then((age) => {
          this.sqliteProvider
            .getPromoterProofDetails(item.refId, item.id)
            .then((proofData) => {
              if (proofData) {
                this.sqliteProvider
                  .getPromoterProofImageDetails(item.refId, item.id)
                  .then((appProof) => {
                    if (proofData.length == appProof.length) {
                      if (item.coAppFlag == 'Y') {
                        this.sqliteProvider
                          .getCoappDetails(item.refId)
                          .then((coAppData) => {
                            if (coAppData.length > 0) {
                              for (let i = 0; i < coAppData.length; i++) {
                                this.sqliteProvider
                                  .getPromoterProofDetails(
                                    item.refId,
                                    coAppData[i].id
                                  )
                                  .then((coAppProof) => {
                                    this.sqliteProvider
                                      .getPromoterProofImageDetails(
                                        item.refId,
                                        coAppData[i].id
                                      )
                                      .then((coProofData) => {
                                        if (
                                          coAppProof.length !=
                                          coProofData.length
                                        ) {
                                          coAppStatus = coAppStatus + '0';
                                        }
                                        if (i == coAppData.length - 1) {
                                          if (coAppStatus.includes('0')) {
                                            this.alertService.showAlert(
                                              'Alert!',
                                              "Please capture Co-Applicant's Mandatory KYC Docs!"
                                            );
                                          } else {
                                            this.globalData.setborrowerType(
                                              item.userType
                                            );
                                            this.globalData.setrefId(
                                              item.refId
                                            );
                                            this.globalData.setId(item.id);
                                            this.globalData.setCoAppFlag(
                                              item.coAppFlag
                                            );
                                            this.globalData.setGuaFlag(
                                              item.guaFlag
                                            );
                                            localStorage.setItem(
                                              'submit',
                                              'false'
                                            );
                                            this.router.navigate(
                                              ['/TabsPage'],
                                              {
                                                skipLocationChange: true,
                                                replaceUrl: true,
                                              }
                                            );
                                          }
                                        }
                                      });
                                  });
                              }
                            } else {
                              this.alertService.showAlert(
                                'Alert!',
                                'Please add Co-Applicant!'
                              );
                            }
                          });
                      } else {
                        this.globalData.setborrowerType(item.userType);
                        this.globalData.setrefId(item.refId);
                        this.globalData.setId(item.id);
                        this.globalData.setCoAppFlag(item.coAppFlag);
                        this.globalData.setGuaFlag(item.guaFlag);
                        localStorage.setItem('submit', 'false');
                        this.router.navigate(['/TabsPage'], {
                          skipLocationChange: true,
                          replaceUrl: true,
                        });
                      }
                    } else {
                      this.alertService.showAlert(
                        'Alert!',
                        "Please capture Borrower's Mandatory KYC Docs!"
                      );
                    }
                  });
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  'Please add Applicant kyc details!'
                );
              }
            });
        })
        .catch((err) => err);
    }
  }

  IMD(item) {
    if (item.coAppFlag == 'Y' && item.guaFlag == 'Y') {
      this.sqliteProvider
        .getSubmitDetailsByRefId(item.refId, 'C')
        .then((coapp) => {
          if (coapp.length > 0) {
            let coappcibilcheck = '';
            let coapphimarkcheck = '';
            let guacibilcheck = '';
            let guahimarkcheck = '';
            for (let i = 0; i < coapp.length; i++) {
              this.sqliteProvider
                .getSubmitDetails(coapp[i].refId, coapp[i].id)
                .then((data) => {
                  coappcibilcheck = coappcibilcheck + data[0].cibilCheckStat;
                  coapphimarkcheck = coapphimarkcheck + data[0].himarkCheckStat;
                  if (i == coapp.length - 1) {
                    if (coappcibilcheck.includes('0')) {
                      this.coappCibilCheckStat = false;
                    } else {
                      this.coappCibilCheckStat = true;
                    }
                    if (coapphimarkcheck.includes('0')) {
                      this.coappHimarkCheckStat = false;
                    } else {
                      this.coappHimarkCheckStat = true;
                    }
                    this.sqliteProvider
                      .getSubmitDetailsByRefId(item.refId, 'G')
                      .then((gua) => {
                        if (gua.length > 0) {
                          for (let j = 0; j < gua.length; j++) {
                            this.sqliteProvider
                              .getSubmitDetails(gua[j].refId, gua[j].id)
                              .then((data) => {
                                guacibilcheck =
                                  guacibilcheck + data[0].cibilCheckStat;
                                guahimarkcheck =
                                  guahimarkcheck + data[0].himarkCheckStat;
                                if (j == gua.length - 1) {
                                  if (guacibilcheck.includes('0')) {
                                    this.guaCibilCheckStat = false;
                                  } else {
                                    this.guaCibilCheckStat = true;
                                  }
                                  if (guahimarkcheck.includes('0')) {
                                    this.guaHimarkCheckStat = false;
                                  } else {
                                    this.guaHimarkCheckStat = true;
                                  }
                                  if (
                                    this.coappCibilCheckStat &&
                                    this.coappHimarkCheckStat
                                  ) {
                                    if (
                                      this.guaCibilCheckStat &&
                                      this.guaHimarkCheckStat
                                    ) {
                                      this.globalData.setborrowerType(
                                        item.userType
                                      );
                                      this.globalData.setrefId(item.refId);
                                      this.globalData.setId(item.id);
                                      this.router.navigate(['/imddetails'], {
                                        skipLocationChange: true,
                                        replaceUrl: true,
                                      });
                                    } else {
                                      this.alertService.showAlert(
                                        'Alert!',
                                        'Please complete Guarantor details!'
                                      );
                                    }
                                  } else {
                                    this.alertService.showAlert(
                                      'Alert!',
                                      'Please complete Co-Applicant details!'
                                    );
                                  }
                                }
                              });
                          }
                        } else {
                          this.alertService.showAlert(
                            'Alert!',
                            'Please add Guarantor details!'
                          );
                        }
                      });
                  }
                });
            }
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Please add Co-Applicant details!'
            );
          }
        });
    }
    if (item.coAppFlag == 'Y' && item.guaFlag == 'N') {
      this.sqliteProvider
        .getSubmitDetailsByRefId(item.refId, 'C')
        .then((coapp) => {
          if (coapp.length > 0) {
            let coappcibilcheck = '';
            let coapphimarkcheck = '';
            for (let i = 0; i < coapp.length; i++) {
              this.sqliteProvider
                .getSubmitDetails(coapp[i].refId, coapp[i].id)
                .then((data) => {
                  coappcibilcheck = coappcibilcheck + data[0].cibilCheckStat;
                  coapphimarkcheck = coapphimarkcheck + data[0].himarkCheckStat;
                  if (i == coapp.length - 1) {
                    if (coappcibilcheck.includes('0')) {
                      this.coappCibilCheckStat = false;
                    } else {
                      this.coappCibilCheckStat = true;
                    }
                    if (coapphimarkcheck.includes('0')) {
                      this.coappHimarkCheckStat = false;
                    } else {
                      this.coappHimarkCheckStat = true;
                    }
                    if (this.coappCibilCheckStat && this.coappHimarkCheckStat) {
                      this.globalData.setborrowerType(item.userType);
                      this.globalData.setrefId(item.refId);
                      this.globalData.setId(item.id);
                      this.router.navigate(['/imddetails'], {
                        skipLocationChange: true,
                        replaceUrl: true,
                      });
                    } else {
                      this.alertService.showAlert(
                        'Alert!',
                        'Please complete Co-Applicant details!'
                      );
                    }
                  }
                });
            }
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Please add Co-Applicant details!'
            );
          }
        });
    }
    if (item.coAppFlag == 'N' && item.guaFlag == 'Y') {
      let guacibilcheck = '';
      let guahimarkcheck = '';
      this.sqliteProvider
        .getSubmitDetailsByRefId(item.refId, 'G')
        .then((gua) => {
          if (gua.length > 0) {
            for (let j = 0; j < gua.length; j++) {
              this.sqliteProvider
                .getSubmitDetails(gua[j].refId, gua[j].id)
                .then((data) => {
                  guacibilcheck = guacibilcheck + data[0].cibilCheckStat;
                  guahimarkcheck = guahimarkcheck + data[0].himarkCheckStat;
                  if (j == gua.length - 1) {
                    if (guacibilcheck.includes('0')) {
                      this.guaCibilCheckStat = false;
                    } else {
                      this.guaCibilCheckStat = true;
                    }
                    if (guahimarkcheck.includes('0')) {
                      this.guaHimarkCheckStat = false;
                    } else {
                      this.guaHimarkCheckStat = true;
                    }
                    if (this.guaCibilCheckStat && this.guaHimarkCheckStat) {
                      this.globalData.setborrowerType(item.userType);
                      this.globalData.setrefId(item.refId);
                      this.globalData.setId(item.id);
                      this.router.navigate(['/imddetails'], {
                        skipLocationChange: true,
                        replaceUrl: true,
                      });
                    } else {
                      this.alertService.showAlert(
                        'Alert!',
                        'Please complete Guarantor details!'
                      );
                    }
                  }
                });
            }
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Please add Guarantor details!'
            );
          }
        });
    }
  }

  getproducts() {
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

  referenceDetails(item) {
    if (item.cibilColor === 'Red') {
      this.alertService.showAlert(
        'Alert!',
        "CIBIL Score BAD, We can't proceed further!"
      );
    } else {
      this.sqliteProvider
        .getVehicleDetails(item.refId, item.id)
        .then((data) => {
          if (data.length > 0) {
            this.globalData.setborrowerType(item.userType);
            this.globalData.setrefId(item.refId);
            this.globalData.setId(item.id);
            this.router.navigate(['/ReferenceDetailsPage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Please complete vehicle details!'
            );
          }
        });
    }
  }

  nach(item) {
    if (item.cibilColor === 'Red') {
      this.alertService.showAlert(
        'Alert!',
        "CIBIL Score BAD, We can't proceed further!"
      );
    } else {
      this.sqliteProvider
        .getVehicleDetails(item.refId, item.id)
        .then((data) => {
          if (data.length > 0) {
            this.globalData.setborrowerType(item.userType);
            this.globalData.setrefId(item.refId);
            this.globalData.setId(item.id);
            this.router.navigate(['/nach'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Please complete vehicle details!'
            );
          }
        });
    }
  }

  docUpload(item, type) {
    this.router.navigate(['/DocumentUploadPage'], {
      queryParams: { viewData: JSON.stringify(item) },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }
  postSanction(item) {
    this.router.navigate(['/PostSanctionPage'], {
      queryParams: { viewData: JSON.stringify(item) },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  viewCoDetails(item) {
    if (item.cibilColor === 'Red') {
      this.alertService.showAlert(
        'Alert!',
        "CIBIL Score BAD, We can't proceed further!"
      );
    } else {
      this.sqliteProvider.getGuaranDetails(item.refId).then((gua) => {
        this.sqliteProvider.getCoappDetails(item.refId).then((coapp) => {
          if (gua.length > 0 || coapp.length > 0) {
            this.sqliteProvider
              .getSubmitDetails(item.refId, item.id)
              .then((data) => {
                let cibilCheckStat = data[0].cibilCheckStat;
                let himarkCheckStat = data[0].himarkCheckStat;
                if (cibilCheckStat == '1') {
                  if (himarkCheckStat == '1') {
                    this.globalData.setgId('');
                    this.globalData.setrefId(item.refId);
                    this.globalData.setId(item.id);

                    this.router.navigate(['/ViewDetailsPage'], {
                      queryParams: {
                        refvalue: JSON.stringify(item),
                        userVal: JSON.stringify(item),
                        user_Type: 'G',
                      },
                      skipLocationChange: true,
                      replaceUrl: true,
                    });
                  } else {
                    this.alertService.showAlert(
                      'Alert!',
                      "Please Check the Applicant's Hi-Mark Status!"
                    );
                  }
                } else {
                  this.alertService.showAlert(
                    'Alert!',
                    "Please Check the Applicant's Cibil Status!"
                  );
                }
              });
          } else {
            this.sqliteProvider
              .getSubmitDetails(item.refId, item.id)
              .then((data) => {
                let cibilCheckStat = data[0].cibilCheckStat;
                let himarkCheckStat = data[0].himarkCheckStat;
                if (cibilCheckStat == '1') {
                  if (himarkCheckStat == '1') {
                    this.sqliteProvider
                      .getPromoterProofDetails(item.refId, item.id)
                      .then((proofData) => {
                        if (proofData) {
                          this.sqliteProvider
                            .getPromoterProofImageDetails(item.refId, item.id)
                            .then((appProof) => {
                              if (proofData.length == appProof.length) {
                                this.globalData.setgId('');
                                this.globalData.setrefId(item.refId);
                                this.globalData.setId(item.id);

                                this.router.navigate(['/ViewDetailsPage'], {
                                  queryParams: {
                                    refvalue: JSON.stringify(item),
                                    userVal: JSON.stringify(item),
                                    user_Type: 'G',
                                  },
                                  skipLocationChange: true,
                                  replaceUrl: true,
                                });
                              } else {
                                this.alertService.showAlert(
                                  'Alert!',
                                  "Please capture Borrower's Mandatory KYC Docs!"
                                );
                              }
                            });
                        } else {
                          this.alertService.showAlert(
                            'Alert!',
                            'Please add Applicant kyc details!'
                          );
                        }
                      });
                  } else {
                    this.alertService.showAlert(
                      'Alert!',
                      "Please Check the Applicant's Hi-Mark Status!"
                    );
                  }
                } else {
                  this.alertService.showAlert(
                    'Alert!',
                    "Please Check the Applicant's Cibil Status!"
                  );
                }
              });
          }
        });
      });
    }
  }

  submittedApplicant() {
    this.router.navigate(['/ExistApplicationsPage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }
}
