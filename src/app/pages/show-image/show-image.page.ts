import { Component, OnInit } from '@angular/core';
import {
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { SqliteService } from 'src/providers/sqlite.service';

@Component({
  selector: 'app-show-image',
  templateUrl: './show-image.page.html',
  styleUrls: ['./show-image.page.scss'],
})
export class ShowImagePage {
  deregisterFunction: Function;
  applicant: any = [];
  picSize: any = [];
  showImage: boolean = false;
  refId: any;
  id: any;
  cibilStat: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // public viewCtrl: ViewController,
    public platform: Platform,
    // public ionicApp: IonicApp,
    public globalData: DataPassingProviderService,
    public sqliteProvider: SqliteService,
    public modalCtrl: ModalController,
    public alertService: CustomAlertControlService
  ) {
    this.getCibilCheckStatus();
    this.applicant = navParams.get('pic');
    this.picSize = navParams.get('size');
    if (navParams.get('pic')) {
      this.showImage = true;
    } else {
      this.showImage = false;
    }
  }

  /* closeModal() {
    this.viewCtrl.dismiss();
    this.deregisterFunction = this.platform.registerBackButtonAction(()=>{
      // customFunction();
      if(this.ionicApp._modalPortal.getActive())
      {
        this.ionicApp._modalPortal.getActive().dismiss();
      }
  });
  } */

  ionViewWillLeave() {
    // enable the root left menu when leaving this page
    // this.platform.registerBackButtonAction(() => {
    //   this.navCtrl.pop();
    // });
    this.deregisterFunction();
  }
  ionViewDidEnter() {
    // this.deregisterFunction = this.platform.registerBackButtonAction(() => {
    //   this.viewCtrl.dismiss();
    // });
  }

  updateimage() {
    if (this.cibilStat == '1') {
      this.alertService.showAlert(
        'Alert!',
        'Cannot update the profile image after cibil check!'
      );
    } else {
      this.modalCtrl.dismiss('updateProfileIMAGE');
    }
  }

  getCibilCheckStatus() {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      this.cibilStat = data[0].cibilCheckStat;
    });
  }
}
