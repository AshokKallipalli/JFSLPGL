import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { SignAnnexImgsPage } from '../sign-annex-imgs/sign-annex-imgs.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-service-after-ps',
  templateUrl: './service-after-ps.page.html',
  styleUrls: ['./service-after-ps.page.scss'],
})
export class ServiceAfterPsPage implements OnInit {
  selectOptions = {
    cssClass: 'remove-ok',
  };
  submitDisable: boolean = false;
  signImgs = [];
  annexImgs = [];
  signImglen: number = 0;
  annexImglen: number = 0;
  refId: any;
  id: any;
  userType: any;
  serId: any;
  servDetails: FormGroup;
  modeOperation: any = [];
  accountType: any = [];
  OperationInstruction: any = [];
  psData: any;

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
    // public events: Events,
    public platform: Platform,
    // public viewCtrl: ViewController,
    public sqliteProvider: SqliteService,
    public globalFun: GlobalService,
    // public app: App,
    public router: Router,
    public alertService: CustomAlertControlService
  ) {
    this.psData = this.navParams.get('PostSanctionData');
    this.refId = this.psData.refId;
    this.id = this.psData.id;
    this.userType = '';
    // this.userType = this.globalData.getborrowerType();
    this.getModeofOperation();
    this.getOperationInstruction();
    this.getaccountType();
    this.servDetails = this.formBuilder.group({
      acType: ['', Validators.required],
      modeofoper: ['', Validators.required],
      operaInst: ['', Validators.required],
      authSign: ['', Validators.required],
    });
    this.getApplicantName();
    this.getServDetails();
    // if (localStorage.getItem("submit") == "true") {
    //   this.submitDisable = true;
    //   localStorage.setItem("submit", "true");
    // } else {
    //   this.submitDisable = false;
    // }
  }

  ionViewWillLeave() {
    // this.platform.registerBackButtonAction(() => {
    //   if (this.submitDisable) {
    //     this.navCtrl.push(ExistApplicationsPage);
    //   } else {
    //     this.navCtrl.push(ExistingPage);
    //   }
    // });
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
    this.alertService
      .proccedOk('Alert', 'Proceed to vehicle details')
      .then((data) => {
        if (data == 'yes') {
          this.globalData.setborrowerType(this.userType);
          this.globalData.setrefId(this.refId);
          this.globalData.setId(this.id);
          // this.navCtrl.pop();
          // this.app.getRootNav().pop();
          this.router.navigate(['/AssetTabsPage'], {
            skipLocationChange: true,
            replaceUrl: true,
          });
        }
      });
  }

  servDetailsSave(value) {
    if (this.signImgs.length > 0 && this.annexImgs.length > 0) {
      this.sqlsupport
        .InsertServiceDetails(
          this.refId,
          this.id,
          this.userType,
          value,
          this.serId
        )
        .then((data) => {
          if (
            this.serId == '' ||
            this.serId == undefined ||
            this.serId == null
          ) {
            this.serId = data.insertId;
            this.uploadSignImg();
            this.uploadAnnexureImg();
            this.alertService
              .showAlert('Alert!', 'Service Details Added Successfully')
              .then((data) => {
                this.modalCtrl.dismiss(value);
              });
          } else {
            this.updateSignImg(this.serId);
            this.updateAnnexureImg(this.serId);
            this.alertService
              .showAlert('Alert!', 'Service Details Updated Successfully')
              .then((data) => {
                this.modalCtrl.dismiss(value);
              });
          }
        });
    } else {
      if (this.signImgs.length == 0) {
        this.alertService.showAlert('Alert!', 'Please add Signature Images.');
      } else {
        this.alertService.showAlert('Alert!', 'Please add Annexure Images.');
      }
    }
  }

  getServDetails() {
    this.sqlsupport.getServDetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        this.servDetails.get('acType').setValue(data[0].acType);
        this.servDetails.get('modeofoper').setValue(data[0].modeofoper);
        this.servDetails.get('operaInst').setValue(data[0].operaInst);
        this.servDetails.get('authSign').setValue(data[0].authSign);
        this.serId = data[0].serId;
        this.refId = data[0].refId;
        this.id = data[0].id;
        this.getSignImgs();
        this.getAnnexureImgs();
      }
    });
  }

  getApplicantName() {
    this.sqlsupport
      .getPrimaryApplicantName(this.refId, this.id)
      .then((data) => {
        if (data.length > 0) {
          this.servDetails
            .get('authSign')
            .setValue(data[0].firstname + ' ' + data[0].lastname);
        }
      });
  }

  async showpicmaodal(value) {
    if (value == 'annexure') {
      if (this.annexImglen < 5) {
        let modal = await this.modalCtrl.create({
          component: SignAnnexImgsPage,
          componentProps: {
            proofpics: this.annexImgs,
            submitstatus: this.submitDisable,
          },
        });
        modal.onDidDismiss().then((data: any) => {
          this.annexImgs = [];
          this.annexImgs = data.data;
          this.annexImglen = data.data.length;
        });
        modal.present();
      } else {
        this.alertService.showAlert('Alert!', 'Maximum 4 Images only allowed');
      }
    } else if (value == 'signature') {
      if (this.signImglen < 2) {
        let emodal = await this.modalCtrl.create({
          component: SignAnnexImgsPage,
          componentProps: {
            eproofpics: this.signImgs,
            submitstatus: this.submitDisable,
          },
        });
        emodal.onDidDismiss().then((data: any) => {
          this.signImgs = [];
          this.signImgs = data.data;
          this.signImglen = data.data.length;
        });
        emodal.present();
      } else {
        this.alertService.showAlert('Alert!', 'Maximum 1 Image only allowed');
      }
    }
  }

  uploadSignImg() {
    for (let i = 0; i < this.signImgs.length; i++) {
      this.sqlsupport
        .addSignImages(
          this.refId,
          this.id,
          this.signImgs[i].imgpath,
          this.serId
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

  updateSignImg(serId) {
    //alert(serId);
    this.sqlsupport
      .removeSignImages(serId)
      .then((data) => {
        for (let i = 0; i < this.signImgs.length; i++) {
          this.sqlsupport
            .addSignImages(this.refId, this.id, this.signImgs[i].imgpath, serId)
            .then((data) => {
              // console.log("promoter image insert" + data);
            })
            .catch((Error) => {
              console.log('Failed!' + Error);
              this.alertService.showAlert('Alert!', 'Failed!');
            });
          //alert(i);
        }
      })
      .catch((Error) => {
        console.log('Failed!' + Error);
        this.alertService.showAlert('Alert!', 'Failed!');
      });
  }

  uploadAnnexureImg() {
    for (let i = 0; i < this.annexImgs.length; i++) {
      this.sqlsupport
        .addAnnexure(this.refId, this.id, this.annexImgs[i].imgpath, this.serId)
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

  updateAnnexureImg(serId) {
    //alert(serId);
    this.sqlsupport
      .removeAnnexure(serId)
      .then((data) => {
        // console.log("promoter image delete" + data);
        //alert(serId);
        for (let i = 0; i < this.annexImgs.length; i++) {
          this.sqlsupport
            .addAnnexure(this.refId, this.id, this.annexImgs[i].imgpath, serId)
            .then((data) => {
              // console.log("promoter image insert" + data);
            })
            .catch((Error) => {
              console.log('Failed!' + Error);
              this.alertService.showAlert('Alert!', 'Failed!');
            });
          //alert(i);
        }
      })
      .catch((Error) => {
        console.log('Failed!' + Error);
        this.alertService.showAlert('Alert!', 'Failed!');
      });
  }

  getSignImgs() {
    this.sqlsupport.getSignImages(this.serId).then((data) => {
      if (data.length > 0) {
        this.signImglen = data.length;
        this.signImgs = data;
      } else {
        this.signImglen = 0;
        this.signImgs = [];
      }
    });
  }

  getAnnexureImgs() {
    this.sqlsupport.getAnnexure(this.serId).then((data) => {
      if (data.length > 0) {
        this.annexImglen = data.length;
        this.annexImgs = data;
      } else {
        this.annexImglen = 0;
        this.annexImgs = [];
      }
    });
  }

  getModeofOperation() {
    this.sqliteProvider
      .getMasterDataUsingType('ModeofOperation')
      .then((data) => {
        this.modeOperation = data;
      });
  }

  getOperationInstruction() {
    this.sqliteProvider
      .getMasterDataUsingType('OperationInstruction')
      .then((data) => {
        this.OperationInstruction = data;
      });
  }

  getaccountType() {
    this.sqliteProvider.getMasterDataUsingType('AccountType').then((data) => {
      this.accountType = data;
    });
  }
}
