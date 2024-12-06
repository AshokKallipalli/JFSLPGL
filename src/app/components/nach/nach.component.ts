import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { ModalController, NavParams } from '@ionic/angular';
import { SignAnnexImgsPage } from 'src/app/pages/sign-annex-imgs/sign-annex-imgs.page';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';

@Component({
  selector: 'app-nach',
  templateUrl: './nach.component.html',
  styleUrls: ['./nach.component.scss'],
})
export class NachComponent {
  nachBName: any;
  refId: any;
  id: any;
  userType: any;
  nachId: any;
  submitDisable: boolean = false;
  bankNames: any = [];
  nachDetails: FormGroup;
  nachImgs: any = [];
  nachImglen: number = 0;
  nachStateImgs: any = [];
  nachStateImglen: number = 0;
  selectOptions = {
    cssClass: 'remove-ok',
  };
  yesOrNo: any = [
    { code: '1', name: 'YES' },
    { code: '2', name: 'NO' },
  ];
  username: any;
  accountType: any[];
  userInfo: any;
  NACH_data: any = [];
  nach_imgs: any[];
  applicationNumber: any;
  other_docs: any = [];
  nachSubmitData: any;
  appStatId: any;

  submitNach: boolean = true;
  nachDoc: any;
  applicantDetails: any;
  eStatus: boolean = false;
  eRequest: boolean = true;
  nachaccounttype: any[];
  naveParamsValue: any;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };
  @Input('sanctionModify') sanctionModify: string;
  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public globalData: DataPassingProviderService,
    public sqlsupport: SquliteSupportProviderService,
    public modalCtrl: ModalController,
    // public viewCtrl: ViewControlller,
    public sqliteProvider: SqliteService,
    public network: Network,
    public globalFunction: GlobalService,
    public sqlSupport: SquliteSupportProviderService,
    // public base64: Base64,
    public master: RestService,
    public activatedRoute: ActivatedRoute,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService
  ) {
    this.activatedRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.userInfo = JSON.parse(this.naveParamsValue.viewData);

    // this.refId = this.globalData.getrefId();
    // this.id = this.globalData.getId();
    // this.userType = this.globalData.getborrowerType();

    this.refId = this.userInfo.refId;
    this.id = this.userInfo.id;
    this.userType = this.userInfo.userType;
    this.applicationNumber = this.userInfo.applicationNumber;

    this.getBankName();
    this.getaccountType();
    this.getNachaccountType();
    this.nachDetails = this.formBuilder.group({
      nachImdSame: [''],
      nachBName: ['', Validators.required],
      nachBranName: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      nachACNumber: [
        '',
        Validators.compose([
          Validators.minLength(9),
          Validators.maxLength(17),
          Validators.pattern('[0-9]*'),
          Validators.required,
        ]),
      ],
      // nachIFSC: ["", Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.pattern(/^[a-zA-Z]{4}[0-9]{7}$/), Validators.required])],
      nachIFSC: ['', Validators.required],
      nachAcType: ['', Validators.required],
      nachACName: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
    });

    if (this.navParams.get('fieldDisable')) {
      this.submitDisable = true;
    }

    this.getnachDetails();
    this.getAppCibilCheckStatus();
    this.getNACHDetailsFromDB();

    this.sqliteProvider.getApplicantDataAfterSubmit(this.refId).then((data) => {
      this.applicantDetails = [];
      this.applicantDetails = data;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad nachDetailsPage');
    // this.events.publish("pageName", 'Nach Page');
    // this.globalFunction.publishPageNavigation({ title: 'Nach Details', component: NachPage });
  }
  ionViewWillLeave() {
    // localStorage.setItem("submit", "false");
    // this.events.publish("pageName", 'Nach Details');
  }

  ngOnInit() {
    // let root = this.viewCtrl.instance.navCtrl._app._appRoot;
    document.addEventListener('click', function (event) {
      let btn = <HTMLLIElement>(
        document.querySelector('.remove-ok .alert-button-group')
      );
      let target = <HTMLElement>event.target;
      if (
        (btn && target.className == 'alert-radio-label') ||
        target.className == 'alert-radio-inner' ||
        target.className == 'alert-radio-icon'
      ) {
        // let view = root._overlayPortal._views[0];
        // let inputs = view.instance.d.inputs;
        // for (let input of inputs) {
        //   if (input.checked) {
        //     view.instance.d.buttons[1].handler([input.value]);
        //     view.dismiss();
        //     break;
        //   }
        // }
      }
    });
  }
  proceedNextPage() {
    let leadStatus;
    this.username = this.globalFunction.basicDec(
      localStorage.getItem('username')
    );
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      leadStatus = 'offline';
    } else {
      leadStatus = 'online';
    }
    this.alertService
      .proccedOk('Alert', 'proceed to existing leads')
      .then((data) => {
        if (data == 'yes') {
          this.navCtrl.navigate(['/ExistingPage'], {
            queryParams: { username: this.username, _leadStatus: leadStatus },
            skipLocationChange: true,
            replaceUrl: true,
          });
        }
      });
  }

  nachDetailsSave(value) {
    console.log(value, 'nachsave');
    if (this.sanctionModify) {
      if (this.nachImgs.length > 0) {
        if (this.nachStateImgs.length > 0) {
          this.sqlsupport
            .InsertNachDetails(
              this.refId,
              this.id,
              this.userType,
              value,
              this.nachId
            )
            .then((data) => {
              if (
                this.nachId == '' ||
                this.nachId == undefined ||
                this.nachId == null
              ) {
                this.nachId = data.insertId;
                this.uploadnachImg();
                this.uploadNachStateImg();
                this.alertService
                  .showAlert('Alert!', 'Nach Details Added Successfully')
                  .then((data) => {
                    // this.proceedNextPage();
                  });
              } else {
                this.updatenachImg(this.nachId);
                this.updateNachStateImg(this.nachId);
                this.alertService
                  .showAlert('Alert!', 'Nach Details Updated Successfully')
                  .then((data) => {
                    // this.proceedNextPage();
                  });
              }
              this.getNACHDetailsFromDB();
            });
        } else {
          this.alertService.showAlert('Alert!', 'Please add Statement Image.');
        }
      } else {
        this.alertService.showAlert('Alert!', 'Please add Cheque Image.');
      }
    } else {
      this.alertService.showAlert(
        'Alert!',
        'Please complete Post Sanction Modification Details.'
      );
    }
  }

  getnachDetails() {
    this.sqlsupport.getNachDetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        this.nachDetails.get('nachImdSame').setValue(data[0].nachImdSame);
        this.nachDetails.get('nachBName').setValue(data[0].nachBName);
        this.nachDetails.get('nachBranName').setValue(data[0].nachBranName);
        this.nachDetails.get('nachACNumber').setValue(data[0].nachACNumber);
        this.nachDetails.get('nachIFSC').setValue(data[0].nachIFSC);
        this.nachDetails.get('nachAcType').setValue(data[0].nachAcType);
        this.nachDetails.get('nachACName').setValue(data[0].nachACName);
        this.nachId = data[0].nachId;
        this.refId = data[0].refId;
        this.id = data[0].id;
        this.getnachImgs();
        this.getNachStateImgs();
        this.nachBName = JSON.parse(data[0].nachBName);
      }
    });
  }

  async showpicmaodal(value) {
    if (value == 'nachcheque') {
      let emodal = await this.modalCtrl.create({
        component: SignAnnexImgsPage,
        componentProps: {
          nachpics: this.nachImgs,
          submitstatus: this.submitDisable,
        },
      });
      emodal.onDidDismiss().then((data: any) => {
        this.nachImgs = [];
        this.nachImgs = data.data;
        this.nachImglen = data.data.length;
      });
      emodal.present();
    } else {
      let emodal = await this.modalCtrl.create({
        component: SignAnnexImgsPage,
        componentProps: {
          nachStatePics: this.nachStateImgs,
          submitstatus: this.submitDisable,
        },
      });
      emodal.onDidDismiss().then((data: any) => {
        this.nachStateImgs = [];
        this.nachStateImgs = data.data;
        this.nachStateImglen = data.data.length;
      });
      emodal.present();
    }
  }

  uploadnachImg() {
    for (let i = 0; i < this.nachImgs.length; i++) {
      this.sqlsupport
        .addNachImages(
          this.refId,
          this.id,
          this.nachImgs[i].imgpath,
          this.nachId
        )
        .then((data) => {
          // console.log("promoter image insert" + data);
        })
        .catch((Error) => {
          console.log('Failed!' + Error);
          this.alertService.showAlert('Alert!', 'Failed!');
        });
      //alert(i);
    }
  }

  updatenachImg(nachId) {
    this.sqlsupport
      .removeNachImages(nachId)
      .then((data) => {
        for (let i = 0; i < this.nachImgs.length; i++) {
          this.sqlsupport
            .addNachImages(
              this.refId,
              this.id,
              this.nachImgs[i].imgpath,
              nachId
            )
            .then((data) => {})
            .catch((Error) => {
              console.log('Failed!' + Error);
              this.alertService.showAlert('Alert!', 'Failed!');
            });
        }
      })
      .catch((Error) => {
        console.log('Failed!' + Error);
        this.alertService.showAlert('Alert!', 'Failed!');
      });
  }

  getnachImgs() {
    this.sqlsupport.getNachImages(this.nachId).then((data) => {
      if (data.length > 0) {
        this.nachImglen = data.length;
        this.nachImgs = data;
      } else {
        this.nachImglen = 0;
        this.nachImgs = [];
      }
    });
  }

  uploadNachStateImg() {
    for (let i = 0; i < this.nachStateImgs.length; i++) {
      this.sqlsupport
        .addNachStateImages(
          this.refId,
          this.id,
          this.nachStateImgs[i].imgpath,
          this.nachId
        )
        .then((data) => {
          // console.log("promoter image insert" + data);
        })
        .catch((Error) => {
          console.log('Failed!' + Error);
          this.alertService.showAlert('Alert!', 'Failed!');
        });
    }
  }

  updateNachStateImg(nachId) {
    this.sqlsupport
      .removeNachStateImages(nachId)
      .then((data) => {
        for (let i = 0; i < this.nachStateImgs.length; i++) {
          this.sqlsupport
            .addNachStateImages(
              this.refId,
              this.id,
              this.nachStateImgs[i].imgpath,
              nachId
            )
            .then((data) => {})
            .catch((Error) => {
              console.log('Failed!' + Error);
              this.alertService.showAlert('Alert!', 'Failed!');
            });
        }
      })
      .catch((Error) => {
        console.log('Failed!' + Error);
        this.alertService.showAlert('Alert!', 'Failed!');
      });
  }

  getNachStateImgs() {
    this.sqlsupport.getNachStateImages(this.nachId).then((data) => {
      if (data.length > 0) {
        this.nachStateImglen = data.length;
        this.nachStateImgs = data;
      } else {
        this.nachStateImglen = 0;
        this.nachStateImgs = [];
      }
    });
  }

  getBankName() {
    this.sqliteProvider.getMasterDataUsingType('BankMaster').then((data) => {
      this.bankNames = data;
    });
  }

  getaccountType() {
    this.sqliteProvider.getMasterDataUsingType('AccountType').then((data) => {
      this.accountType = data;
    });
  }

  getNachaccountType() {
    this.sqliteProvider
      .getMasterDataUsingType('Nachaccounttype')
      .then((data) => {
        this.nachaccounttype = data;
        console.log(`nacha acc component ${this.nachaccounttype}`);
      });
  }

  toUpperCase(frmGrpName, ctrlName) {
    this[frmGrpName].controls[ctrlName].setValue(
      this[frmGrpName].controls[ctrlName].value.toUpperCase()
    );
  }

  getNACHDetailsFromDB() {
    this.sqlSupport
      .getNachDetails(this.userInfo.refId, this.userInfo.id)
      .then((data) => {
        if (data.length > 0) {
          this.NACH_data = data;
          this.submitNach = false;
          console.log(this.NACH_data, 'nach details');
          this.getNachImgs(this.NACH_data[0].nachId);
        }
        // else {
        //   this.alertService.showAlert("Alert!", "NACH details not found");
        // }
      })
      .catch((e) => {
        console.log('er' + e);
        this.NACH_data = [];
      });
  }

  getNachImgs(nachId) {
    this.sqlSupport
      .getNachStateImages(nachId)
      .then((nach) => {
        if (nach.length > 0) {
          this.nach_imgs = [];
          for (let i = 0; i < nach.length; i++) {
            let base64File = '';
            // this.base64.encodeFile(nach[i].imgpath).then((base64File: string) => {
            let temp_nach = {
              nachImg: nach[i].imgpath,
              nachImgName: this.applicationNumber + '_NACH_' + i + '.jpg',
            };
            this.nach_imgs.push(temp_nach);

            let nachData = {
              DocName: 'NACH',
              DocDesc: this.applicationNumber + '_NACH_' + i + '.jpg',
              DocFile: nach[i].imgpath,
            };
            this.other_docs.push(nachData);

            if (i == this.nach_imgs.length - 1) {
              console.log(this.other_docs, 'nach images');
              // console.log(JSON.stringify(this.annex_imgs));
            }
            // }, (err) => {
            //   console.log(err);
            // });
          }
        }
      })
      .catch((e) => {
        console.log('er' + e);
        // this.items = [];
      });
    this.getNachcash(nachId);
  }

  getNachcash(nachId) {
    this.sqlSupport
      .getNachImages(nachId)
      .then((nach) => {
        if (nach.length > 0) {
          this.nach_imgs = [];
          for (let i = 0; i < nach.length; i++) {
            // this.base64.encodeFile(nach[i].imgpath).then((base64File: string) => {
            let base64File = '';
            let temp_nach = {
              nachImg: nach[i].imgpath,
              nachImgName: this.applicationNumber + '_NACH_CASH_' + i + '.jpg',
            };
            this.nach_imgs.push(temp_nach);

            let nachData = {
              DocName: 'NACH',
              DocDesc: this.applicationNumber + '_NACH_CASH_' + i + '.jpg',
              DocFile: nach[i].imgpath,
            };
            // let nachData = {
            //   "DocName": "NACH_CASH",
            //   "DocDesc": this.applicationNumber + "_NACH_CASH_" + i + ".jpg",
            //   "DocFile": base64File.replace(/\n/g, ''),
            // }
            this.other_docs.push(nachData);

            if (i == this.nach_imgs.length - 1) {
              console.log(this.other_docs, 'nach images checking');
              // console.log(JSON.stringify(this.annex_imgs));
            }

            // }, (err) => {
            //   console.log(err);
            // });
          }
        }
      })
      .catch((e) => {
        console.log('er' + e);
        // this.items = [];
      });
  }

  getAppCibilCheckStatus() {
    this.sqliteProvider
      .getSubmitDetails(this.userInfo.refId, this.userInfo.id)
      .then((data) => {
        // this.appCibilCheckStat = data[0].cibilCheckStat;
        // this.submitStat = data[0].submitStat;
        this.appStatId = data[0].statId;
        this.nachDoc = data[0].nachDoc;
        // this.appCibilColor = data[0].cibilColor;
        // this.appCibilScore = data[0].cibilScore;
        // this.appHimarkCheckStat = data[0].himarkCheckStat;

        if (data[0].NACH == '1') {
          this.submitDisable = true;
        }
        if (this.nachDoc == 'Y') {
          this.submitNach = true;
        }
      });
  }

  submitDetails() {
    this.sqliteProvider
      .getSubmitDetails(this.userInfo.refId, this.userInfo.id)
      .then((submitlead) => {
        if (submitlead[0].NACH == '0') {
          this.loadingService.globalLodingPresent('Please wait...');
          this.nachSubmitData = {
            lpcomProposal: this.applicationNumber,
            lndAccountNo: this.NACH_data[0].nachACNumber,
            lndEnachType: '',
            lndNachRepayDet: this.NACH_data[0].nachImdSame,
            lndBankName: JSON.parse(this.NACH_data[0].nachBName).CODE,
            lndBranchName: this.NACH_data[0].nachBranName,
            lndIfscCode: this.NACH_data[0].nachIFSC,
            lndAccType: this.NACH_data[0].nachAcType,
            lndAccHolder: this.NACH_data[0].nachACName,
          };
          this.master
            .restApiCallAngular('updateNachDetails', this.nachSubmitData)
            .then(
              (data) => {
                if ((<any>data).ErrorCode == '000') {
                  this.sqlSupport
                    .updateNACHSubmitDetails('1', this.applicationNumber)
                    .then((data) => {
                      this.submitDisable = true;
                      this.loadingService.globalLodingDismiss();
                      this.uploadDocs();
                    });
                } else {
                  this.loadingService.globalLodingDismiss();
                  if ((<any>data).ErrorDesc) {
                    this.alertService.showAlert('Alert', (<any>data).ErrorDesc);
                  } else {
                    this.alertService.showAlert(
                      'Alert!',
                      'NACH details submission failed'
                    );
                  }
                }
              },
              (err) => {
                this.loadingService.globalLodingDismiss();
                if (err.name == 'TimeoutError') {
                  this.alertService.showAlert('Alert!', err.message);
                } else {
                  this.alertService.showAlert(
                    'Alert!',
                    'No response from server!'
                  );
                }
              }
            );
        } else {
          this.uploadDocs();
        }
      });
  }

  uploadDocs() {
    if (this.nachDoc == 'Y') {
      this.alertService.showAlert('Alert!', 'Documents already Submitted!');
    } else {
      // this.globalFunction.globalLodingPresent('Please wait...');
      let docs_upload = {
        OtherDoc: {
          DocAppno: this.applicationNumber,
          OtherDocs: this.other_docs,
        },
      };
      this.master.restApiCallAngular('UploadDocs', docs_upload).then(
        (data) => {
          if ((<any>data).errorCode == '00') {
            this.sqlSupport
              .updateNACHDocSubmitDetails('Y', this.applicationNumber)
              .then((data) => {
                this.submitNach = true;
                // this.globalFunction.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Documents Submitted Successfully!'
                );
              });
          } else {
            // this.globalFunction.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Documents Submitted Failed!'
            );
          }
        },
        (err) => {
          // this.globalFunction.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      );
    }
  }

  checkEnachRequest() {
    console.log('Check EnachRequest');
    this.loadingService.globalLodingPresent('Please Wait..');
    let body = {
      UserID: this.applicantDetails[0].createdUser,
      propNo: this.applicantDetails[0].applicationNumber,
    };

    this.master.restApiCallAngular('EnachRequest', body).then((res) => {
      console.log('EnachRequest ', res);
      let response = <any>res;
      if (response.success == true) {
        this.eRequest = false;
        this.eStatus = true;
        this.loadingService.globalLodingDismiss();
      } else {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert!', response.fetchAlert);
        this.eRequest = true;
      }
    });
  }

  checkEnachStatus() {
    console.log('Check EnachStatus');
    let body = {
      UserID: this.applicantDetails[0].createdUser,
      propNo: this.applicantDetails[0].applicationNumber,
    };

    this.master.restApiCallAngular('EnachStatus', body).then((res) => {
      console.log('EnachStatus ', res);
      let response = <any>res;
      console.log('EnachStatus res ', response);
      if (response.success == true) {
        // this.eRequest = false;
        this.eStatus = false;
        this.alertService.showAlert('Alert!', response.success);
        this.loadingService.globalLodingDismiss();
      } else {
        this.loadingService.globalLodingDismiss();
        this.alertService.showAlert('Alert!', response.fetchAlert);
      }
    });
  }
}
