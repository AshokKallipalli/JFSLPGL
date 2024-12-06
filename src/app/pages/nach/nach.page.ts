import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { SignAnnexImgsPage } from '../sign-annex-imgs/sign-annex-imgs.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-nach',
  templateUrl: './nach.page.html',
  styleUrls: ['./nach.page.scss'],
})
export class NachPage implements OnInit {
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
  nachaccounttype: any[];

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public globalData: DataPassingProviderService,
    public sqlsupport: SquliteSupportProviderService,
    public modalCtrl: ModalController,
    // public viewCtrl: ViewController,
    public sqliteProvider: SqliteService,
    public network: Network,
    // public events: Events,
    // public globalFunction: GlobalfunctionsProvider,
    public router: Router,
    public globFunc: GlobalService,
    public alertService: CustomAlertControlService
  ) {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.userType = this.globalData.getborrowerType();
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
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad nachDetailsPage');
    // this.events.publish("pageName", 'Nach Page');
    // this.globalFunction.publishPageNavigation({ title: 'Nach Details', component: NachPage });
    this.router.navigate(['/NachPage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
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
      // if (btn && target.className == 'alert-radio-label' || target.className == 'alert-radio-inner' || target.className == 'alert-radio-icon') {
      //   let view = root._overlayPortal._views[0];
      //   let inputs = view.instance.d.inputs;
      //   for (let input of inputs) {
      //     if (input.checked) {
      //       view.instance.d.buttons[1].handler([input.value]);
      //       view.dismiss();
      //       break;
      //     }
      //   }
      // }
    });
  }
  proceedNextPage() {
    let leadStatus;
    this.username = this.globFunc.basicDec(localStorage.getItem('username'));
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      leadStatus = 'offline';
    } else {
      leadStatus = 'online';
    }
    this.alertService
      .proccedOk('Alert', 'proceed to existing leads')
      .then((data) => {
        if (data == 'yes') {
          this.router.navigate(['/ExistingPage'], {
            queryParams: { username: this.username, _leadStatus: leadStatus },
            skipLocationChange: true,
            replaceUrl: true,
          });
        }
      });
  }

  nachDetailsSave(value) {
    console.log(value, 'nachsave');
    // if(this.sanctionModify !== null){
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
                  this.proceedNextPage();
                });
            } else {
              this.updatenachImg(this.nachId);
              this.updateNachStateImg(this.nachId);
              this.alertService
                .showAlert('Alert!', 'Nach Details Updated Successfully')
                .then((data) => {
                  this.proceedNextPage();
                });
            }
          });
      } else {
        this.alertService.showAlert('Alert!', 'Please add Statement Image.');
      }
    } else {
      this.alertService.showAlert('Alert!', 'Please add Cheque Image.');
    }
    // }else{
    //   this.alertService.showAlert("Alert!", "Please complete Post Sanction Modification Details");
    // }
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
        console.log(`nacha acc ${this.nachaccounttype}`);
      });
  }

  toUpperCase(frmGrpName, ctrlName) {
    this[frmGrpName].controls[ctrlName].setValue(
      this[frmGrpName].controls[ctrlName].value.toUpperCase()
    );
  }
}
