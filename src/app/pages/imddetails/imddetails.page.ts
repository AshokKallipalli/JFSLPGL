import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { SignAnnexImgsPage } from '../sign-annex-imgs/sign-annex-imgs.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-imddetails',
  templateUrl: './imddetails.page.html',
  styleUrls: ['./imddetails.page.scss'],
})
export class ImddetailsPage implements OnInit {
  today: any = new Date();
  mindate: any;
  imdBName: any;
  refId: any;
  id: any;
  userType: any;
  imdId: any;
  submitDisable: boolean = false;
  bankNames: any = [];
  imdDetails: FormGroup;
  imdImgs = [];
  imdImglen: number = 0;
  selectOptions = {
    cssClass: 'remove-ok',
  };
  payments: any = [];

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public globalData: DataPassingProviderService,
    public sqlsupport: SquliteSupportProviderService,
    public modalCtrl: ModalController,
    // public viewCtrl: ViewController,
    public sqliteProvider: SqliteService,
    public alertService: CustomAlertControlService
  ) {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.userType = this.globalData.getborrowerType();
    this.callmaxdate();
    this.getPaymentDetails();
    this.getBankName();

    this.imdDetails = this.formBuilder.group({
      imdPayType: ['', Validators.required],
      imdInstrument: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z0-9 ]*'),
          Validators.required,
        ]),
      ],
      imdACName: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      imdACNumber: [
        '',
        Validators.compose([
          Validators.maxLength(18),
          Validators.pattern('[0-9]*'),
          Validators.required,
        ]),
      ],
      imdAmount: [
        '',
        Validators.compose([
          Validators.maxLength(10),
          Validators.pattern('[0-9]*'),
          Validators.required,
        ]),
      ],
      imdBName: ['', Validators.required],
      imdDate: ['', Validators.required],
    });

    if (this.route.snapshot.queryParamMap.get('fieldDisable')) {
      this.submitDisable = true;
    }

    this.getImdDetails();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImddetailsPage');
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

  imdDetailsSave(value) {
    if (this.imdImgs.length > 0) {
      this.sqlsupport
        .InsertIMDDetails(this.refId, this.id, this.userType, value, this.imdId)
        .then((data) => {
          if (
            this.imdId == '' ||
            this.imdId == undefined ||
            this.imdId == null
          ) {
            this.imdId = data.insertId;
            this.uploadImdImg();
            this.alertService.showAlert(
              'Alert!',
              'IMD Details Added Successfully'
            );
          } else {
            this.updateImdImg(this.imdId);
            this.alertService.showAlert(
              'Alert!',
              'IMD Details Updated Successfully'
            );
          }
        });
    } else {
      this.alertService.showAlert('Alert!', 'Please add Cheque Image.');
    }
  }

  getImdDetails() {
    this.sqlsupport.getImdDetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        this.imdDetails.controls.imdPayType.setValue(data[0].imdPayType);
        this.imdDetails.controls.imdInstrument.setValue(data[0].imdInstrument);
        this.imdDetails.controls.imdACName.setValue(data[0].imdACName);
        this.imdDetails.controls.imdACNumber.setValue(data[0].imdACNumber);
        this.imdDetails.controls.imdAmount.setValue(data[0].imdAmount);
        this.imdDetails.controls.imdBName.setValue(
          JSON.parse(data[0].imdBName)
        );
        this.imdDetails.controls.imdDate.setValue(data[0].imdDate);

        this.imdBName = JSON.parse(data[0].imdBName);
        this.imdId = data[0].imdId;
        this.refId = data[0].refId;
        this.id = data[0].id;
        this.getimdImgs();
      }
    });
  }

  async showpicmaodal(value) {
    if (value == 'imdcheque') {
      // let emodal = this.modalCtrl.create("SignAnnexImgsPage", { imdpics: this.imdImgs, submitstatus: this.submitDisable });
      // emodal.onDidDismiss(data => {
      //   this.imdImgs = [];
      //   this.imdImgs = data;
      //   this.imdImglen = data.length;
      // })
      // emodal.present();

      const emodal = await this.modalCtrl.create({
        component: SignAnnexImgsPage,
        componentProps: {
          imdpics: this.imdImgs,
          submitstatus: this.submitDisable,
        },
      });

      await emodal.onDidDismiss().then((data) => {
        this.imdImgs = [];
        this.imdImgs = data.data;
        this.imdImglen = data.data.length;
      });
      await emodal.present();
    }
  }

  uploadImdImg() {
    for (let i = 0; i < this.imdImgs.length; i++) {
      this.sqlsupport
        .addImdImages(this.refId, this.id, this.imdImgs[i].imgpath, this.imdId)
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

  updateImdImg(imdId) {
    //alert(imdId);
    this.sqlsupport
      .removeImdImages(imdId)
      .then((data) => {
        for (let i = 0; i < this.imdImgs.length; i++) {
          this.sqlsupport
            .addImdImages(this.refId, this.id, this.imdImgs[i].imgpath, imdId)
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

  getimdImgs() {
    this.sqlsupport.getImdImages(this.imdId).then((data) => {
      if (data.length > 0) {
        this.imdImglen = data.length;
        this.imdImgs = data;
      } else {
        this.imdImglen = 0;
        this.imdImgs = [];
      }
    });
  }

  getPaymentDetails() {
    this.sqliteProvider
      .getMasterDataUsingType('PaymentDetails')
      .then((data) => {
        this.payments = data;
      });
  }

  getBankName() {
    this.sqliteProvider.getMasterDataUsingType('BankMaster').then((data) => {
      this.bankNames = data;
    });
  }

  callmaxdate() {
    let dd = this.today.getDate();
    let mm = this.today.getMonth() + 1; //January is 0!
    let yyyy = this.today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    this.mindate = yyyy + '-' + mm + '-' + dd;
  }
}
