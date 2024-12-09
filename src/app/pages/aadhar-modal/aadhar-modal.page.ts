import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonSlides,
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { SqliteService } from 'src/providers/sqlite.service';

@Component({
  selector: 'app-aadhar-modal',
  templateUrl: './aadhar-modal.page.html',
  styleUrls: ['./aadhar-modal.page.scss'],
})
export class AadharModalPage {
  @ViewChild('Slides') slides: IonSlides;
  addAadharImgDocs = [];
  docAadharImg: boolean = false;
  aadhardocinfo: any;
  panId: any;
  refId: any;
  id: any;
  aadharImageName: any;
  aadharImgData: any;
  public unregisterBackButtonAction: any;

  // options: CameraOptions = {
  //   quality: 50,
  //   destinationType: this.camera.DestinationType.FILE_URI,
  //   encodingType: this.camera.EncodingType.JPEG,
  //   mediaType: this.camera.MediaType.PICTURE,
  //   correctOrientation: true
  //   // targetWidth: 500,
  //   // targetHeight: 500
  // }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // public viewCtrl: ViewController,
    // public camera: Camera,
    public sqliteProvider: SqliteService,
    public platform: Platform,
    public modalCtrl: ModalController
  ) {
    this.aadhardocinfo = this.navParams.get('aadharImgVal');
    this.refId = this.navParams.get('arefId');
    this.id = this.navParams.get('aid');
    this.panId = this.aadhardocinfo;
    //console.log("pan modal: pan id: -------------" + this.panId);
  }
  initializeBackButtonCustomHandler(): void {
    // this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function (event) {
    //  console.log('Prevent Back Button Page Change');
    // }, 101); // Priority 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file */
  }
  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    // this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  ionViewDidLoad() {
    // this.getAadharImg();
    // console.log('ionViewDidLoad ProofModalPage');
    this.initializeBackButtonCustomHandler();
  }
  closeAadharModal() {
    this.modalCtrl.dismiss();
  }

  aadharImgRemove(value) {
    console.log(value, 'aadharImgRemove');
  }

  takeAadharImg() {
    console.log('takeAadharImg');
  }

  openAadharGallery() {
    console.log('openAadharGallery');
  }
}
