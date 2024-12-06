import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { ViewReferenceDetailsComponent } from 'src/app/components/view-reference-details/view-reference-details.component';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-reference-details',
  templateUrl: './reference-details.page.html',
  styleUrls: ['./reference-details.page.scss'],
})
export class ReferenceDetailsPage implements OnInit {
  refId: any;
  id: any;
  userType: any;
  detailId: any;
  referenceDetails: FormGroup;
  relationShipMaster = [];
  referenceDetailsData = [];
  username: any;
  submitDisable = false;
  selectOptions = {
    cssClass: 'remove-ok',
  };

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public sqlsupport: SquliteSupportProviderService,
    public globalData: DataPassingProviderService,
    public modalCtrl: ModalController,
    public network: Network,
    // public viewCtrl: ViewController,
    public router: Router,
    private globFunc: GlobalService,
    public alertService: CustomAlertControlService
  ) {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.userType = this.globalData.getborrowerType();
    this.getRelationShip();

    this.referenceDetails = this.formBuilder.group({
      refName: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      mobileNo: [
        '',
        Validators.compose([
          Validators.maxLength(10),
          Validators.pattern('[0-9]{10}$'),
          Validators.required,
        ]),
      ],
      refAddress: ['', Validators.required],
      relationship: ['', Validators.required],
    });

    this.getReferenceDetailsFromDB();
    if (this.navParams.get('fieldDisable')) {
      this.submitDisable = true;
    }
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReferenceDetailsPage');
  }

  async getRelationShip() {
    let data = await this.sqliteProvider.getMasterDataUsingType(
      'VLRelationShip'
    );
    this.relationShipMaster = data;
  }
  getReferenceDetailsFromDB() {
    this.sqlsupport.getreferenceDetails(this.refId, this.id).then((data) => {
      this.referenceDetailsData = data;
    });
  }

  referenceDetailsSave(value) {
    this.sqlsupport
      .insertReferenceDetails(
        this.refId,
        this.id,
        this.userType,
        value,
        this.detailId
      )
      .then((data) => {
        if (this.detailId) {
          this.alertService.showAlert(
            'Alert',
            'Reference details updated successfully'
          );
        } else {
          this.alertService.showAlert(
            'Alert',
            'Reference details saved successfully'
          );
        }
        this.referenceDetails.reset();
        this.getReferenceDetailsFromDB();
        // this.proceedNextPage();
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

  async viewReferenceDetails() {
    if (this.referenceDetailsData.length > 0) {
      let modal = await this.modalCtrl.create({
        component: ViewReferenceDetailsComponent,
        componentProps: {
          viewRefDetails: this.referenceDetailsData,
          submitDisable: this.submitDisable,
        },
      });
      modal.onDidDismiss().then(async (refValue: any) => {
        let refData = refValue.data;
        if (refData) {
          this.detailId = refData.detailId;
          this.referenceDetails.get('refName').setValue(refData.refName);
          this.referenceDetails.get('mobileNo').setValue(refData.mobileNo);
          this.referenceDetails.get('refAddress').setValue(refData.refAddress);
          this.referenceDetails
            .get('relationship')
            .setValue(refData.relationship);
        } else {
          this.referenceDetails.reset();
        }
        this.getReferenceDetailsFromDB();
      });
      modal.present();
    } else {
      this.alertService.showAlert('Alert', 'Please add reference details');
    }
  }
}
