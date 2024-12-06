import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { DocumentViewPage } from '../document-view/document-view.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.page.html',
  styleUrls: ['./document-upload.page.scss'],
})
export class DocumentUploadPage {
  custType: any;
  items: any;
  coapplicants: any;
  userInfo: any;
  refId: any;
  id: any;
  appkycDocument: any = [];
  coappkycDocument: any = [];
  submitStatus = false;
  coAppFlag: any;
  naveParamsValue: any;

  constructor(
    public navCtrl: NavController,
    public globalData: DataPassingProviderService,
    public navParams: NavParams,
    public sqliteProvider: SqliteService,
    public modalCtrl: ModalController,
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
    this.custType = 'Promoter';
    this.userInfo = JSON.parse(this.naveParamsValue.viewData);
    this.submitStatus = this.navParams.get('submitStatus');
    this.refId = this.userInfo.refId;
    this.id = this.userInfo.id;
    this.loadAllApplicantDetails();
    this.loadCoappDetails();
    // this.getIdProofLength();
    // this.proceedNextPage();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DocumentUploadPage');
  }

  ionViewWillEnter() {}

  loadAllApplicantDetails() {
    this.sqliteProvider
      .getSubmitDataDetailsCibil(this.userInfo.refId)
      .then((data) => {
        this.items = [];
        this.items = data;
        this.coAppFlag = this.items[0].coAppFlag;
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  loadCoappDetails() {
    this.sqliteProvider.getCoappDetails(this.userInfo.refId).then((res) => {
      this.coapplicants = [];
      this.coapplicants = res;
    });
  }

  getIdProofLength() {
    this.sqliteProvider
      .getPromoterProofDetails(this.refId, this.id)
      .then((data) => {
        this.appkycDocument = data;
      })
      .catch((Error) => {
        console.log(Error);
      });
  }

  viewIdProof(data) {
    console.log(data, 'aaaaaaaaa');
    this.sqliteProvider
      .getPromoterProofDetails(this.refId, data.id)
      .then(async (documents) => {
        if (this.custType == 'Promoter') {
          this.appkycDocument = documents;
        } else {
          this.coappkycDocument = documents;
        }
        let modal = await this.modalCtrl.create({
          component: DocumentViewPage,
          componentProps: {
            document:
              this.custType == 'Promoter'
                ? this.appkycDocument
                : this.coappkycDocument,
            userInfo: data,
            custType: this.custType,
            submitStatus: this.submitStatus,
          },
        });
        modal.present();
        modal.onDidDismiss().then(async (data) => {
          console.log('Data');
          this.proceedNextPage();
        });
      })
      .catch((Error) => {
        console.log(Error);
      });
  }

  getApplicantDocument() {
    console.log('Applicant document');
  }

  getCoApplicantDocument() {
    console.log('Co Applicant document');
  }

  homepage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  proceedNextPage() {
    let coAppStatus = '';
    this.sqliteProvider
      .getPromoterProofDetails(this.refId, this.id)
      .then((proofData) => {
        if (proofData) {
          this.sqliteProvider
            .getPromoterProofImageDetails(this.refId, this.id)
            .then((appProof) => {
              if (proofData.length == appProof.length) {
                console.log('UserInfo', this.userInfo);
                if (this.userInfo.coAppFlag == 'Y') {
                  this.sqliteProvider
                    .getCoappDetails(this.userInfo.refId)
                    .then((coAppData) => {
                      if (coAppData.length > 0) {
                        for (let i = 0; i < coAppData.length; i++) {
                          this.sqliteProvider
                            .getPromoterProofDetails(
                              this.userInfo.refId,
                              coAppData[i].id
                            )
                            .then((coAppProof) => {
                              this.sqliteProvider
                                .getPromoterProofImageDetails(
                                  this.userInfo.refId,
                                  coAppData[i].id
                                )
                                .then((coProofData) => {
                                  if (coAppProof.length != coProofData.length) {
                                    coAppStatus = coAppStatus + '0';
                                  }
                                  if (i == coAppData.length - 1) {
                                    if (!coAppStatus.includes('0')) {
                                      this.alertService
                                        .proccedOk(
                                          'Alert',
                                          'Proceed to CASA details'
                                        )
                                        .then((data) => {
                                          if (data == 'yes') {
                                            this.globalData.setborrowerType(
                                              this.userInfo.userType
                                            );
                                            this.globalData.setrefId(
                                              this.userInfo.refId
                                            );
                                            this.globalData.setId(
                                              this.userInfo.id
                                            );
                                            this.globalData.setCoAppFlag(
                                              this.userInfo.coAppFlag
                                            );
                                            this.globalData.setGuaFlag(
                                              this.userInfo.guaFlag
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
                                        });
                                    }
                                  }
                                });
                            });
                        }
                      } else {
                        this.alertService
                          .proccedOk('Alert', 'Proceed to Co-Applicant details')
                          .then((data) => {
                            if (data == 'yes') {
                              this.globalData.setgId('');
                              this.globalData.setrefId(this.userInfo.refId);
                              this.globalData.setId(this.userInfo.id);
                              this.router.navigate(['/ViewDetailsPage'], {
                                queryParams: {
                                  refvalue: JSON.stringify(this.userInfo),
                                  userVal: JSON.stringify(this.userInfo),
                                  user_Type: 'G',
                                },
                                skipLocationChange: true,
                                replaceUrl: true,
                              });
                            }
                          });
                      }
                    });
                } else {
                  this.alertService
                    .proccedOk('Alert', 'Proceed to CASA details')
                    .then((data) => {
                      if (data == 'yes') {
                        this.globalData.setborrowerType(this.userInfo.userType);
                        this.globalData.setrefId(this.userInfo.refId);
                        this.globalData.setId(this.userInfo.id);
                        this.globalData.setCoAppFlag(this.userInfo.coAppFlag);
                        this.globalData.setGuaFlag(this.userInfo.guaFlag);
                        localStorage.setItem('submit', 'false');
                        this.router.navigate(['/TabsPage'], {
                          skipLocationChange: true,
                          replaceUrl: true,
                        });
                      }
                    });
                }
              }
            });
        }
      });
  }
}
