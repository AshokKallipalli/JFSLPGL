import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  IonSlides,
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-sign-annex-imgs',
  templateUrl: './sign-annex-imgs.page.html',
  styleUrls: ['./sign-annex-imgs.page.scss'],
})
export class SignAnnexImgsPage {
  @ViewChild('Slides') slides: IonSlides;
  maxImgs: number = 1;
  public addProofDocs = [];
  docImg: boolean = false;
  proofpic: boolean = false;
  entitypic: boolean = false;
  imdpic: boolean = false;
  nachpic: boolean = false;
  nachStatePic: boolean = false;
  imdcheque: boolean = false;
  pslPic = false;
  fieldDisable: boolean = true;
  proofdocinfo = [];
  // options: CameraOptions = {
  //   quality: 50,
  //   destinationType: this.camera.DestinationType.FILE_URI,
  //   encodingType: this.camera.EncodingType.JPEG,
  //   mediaType: this.camera.MediaType.PICTURE,
  //   correctOrientation: true
  // }
  public unregisterBackButtonAction: any;

  async showAlert(tittle, subtitle) {
    let alert = await this.alertCtrl.create({
      header: tittle,
      subHeader: subtitle,
      buttons: ['OK'],
    });
    alert.present();
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // public camera: Camera,
    public alertCtrl: AlertController,
    // public viewCtrl: ViewController,
    public sqliteProvider: SqliteService,
    public platform: Platform,
    // public file: File,
    // public crop: Crop,
    public modalCtrl: ModalController,
    public sqlSupport: SquliteSupportProviderService,
    public globalFun: GlobalService,
    public globalData: DataPassingProviderService,
    public loadingService: CustomLoadingControlService
  ) {
    let submitstatus = this.navParams.get('submitstatus');
    if (submitstatus == true) {
      this.fieldDisable = false;
    }
    if (this.navParams.get('proofpics')) {
      this.proofpic = true;
      this.proofdocinfo = this.navParams.get('proofpics');
      // if(this.navParams.get('fieldDisable')){
      //   this.fieldDisable = false;
      // }
    } else if (this.navParams.get('eproofpics')) {
      this.entitypic = true;
      this.proofdocinfo = this.navParams.get('eproofpics');
    } else if (this.navParams.get('imdpics')) {
      this.imdpic = true;
      this.proofdocinfo = this.navParams.get('imdpics');
    } else if (this.navParams.get('nachpics')) {
      this.nachpic = true;
      this.proofdocinfo = this.navParams.get('nachpics');
    } else if (this.navParams.get('nachStatePics')) {
      this.nachStatePic = true;
      this.proofdocinfo = this.navParams.get('nachStatePics');
    } else if (this.navParams.get('psl')) {
      this.pslPic = true;
      this.proofdocinfo = this.navParams.get('psl');
    } else {
      console.log('no pics recived');
    }

    if (this.proofdocinfo.length > 0) {
      this.addProofDocs = this.proofdocinfo;
      this.docImg = true;
      if (this.navParams.get('eproofpics') || this.navParams.get('imdpics')) {
        this.maxImgs = 1;
      } else {
        this.maxImgs = 4;
      }
    }
  }

  ionViewDidLoad() {
    // this.initializeBackButtonCustomHandler();
  }
  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    // this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }
  // initializeBackButtonCustomHandler(): void {
  //   this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function (event) {
  //     console.log('Prevent Back Button Page Change');
  //   }, 101); // Priority 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file */
  // }

  // capureImg() {
  //   this.camera.getPicture(this.options).then(img => {
  //     let imagePath = normalizeURL(img);
  //     let fileName = imagePath.substr(imagePath.lastIndexOf("/") + 1, imagePath.lastIndexOf("jpg"));
  //     let cropModel = this.modalCtrl.create('CropImgPage', { imgUrl: imagePath });
  //     cropModel.present();
  //     cropModel.onDidDismiss(data => {
  //       if (data) {
  //         let imgPath = this.file.externalApplicationStorageDirectory + 'photos/';
  //         this.file.writeFile(imgPath, fileName, data).then(res => {
  //           let image = imgPath + fileName;
  //           this.addProofDocs.push({ imgpath: image });
  //           this.docImg = true;
  //           this.slides.slideNext();
  //         })
  //       }
  //     })
  //   }, (err) => {
  //     this.showAlert("Document Image", "Document Not Uploaded");
  //   })
  // }

  capureImg() {
    this.globalFun.takeImage('document').then((data: any) => {
      let imageName = data.path;
      this.globalData.convertToWebPBase64(imageName).then((cnvtImg) => {
        this.loadingService.globalLodingDismiss();
        // let imagePath = `data:image/jpeg;base64,${cnvtImg.path}`
        let imagePath = `data:image/*;charset=utf-8;base64,${cnvtImg.path}`;
        localStorage.setItem('BS', data.size);
        localStorage.setItem('AS', cnvtImg.size);
        this.addProofDocs.push({
          imgpath: imagePath,
          BS: data.size,
          AS: cnvtImg.size,
        });
        this.docImg = true;
        this.slides.slideNext();
      });
    });
  }

  takeProofImg() {
    if (this.navParams.get('eproofpics') || this.navParams.get('imdpics')) {
      this.maxImgs = 1;
    } else {
      this.maxImgs = 4;
    }
    if (this.addProofDocs.length >= this.maxImgs) {
      this.showAlert('Document', 'Document Maximum Limit Reached.');
    } else {
      this.capureImg();
    }
  }

  openProofGallery() {
    if (this.addProofDocs.length >= 2) {
      this.showAlert('Document', 'Document Maximum Limit Reached.');
    } else {
      // const goptions: CameraOptions = {
      //   quality: 50,
      //   allowEdit: true,
      //   sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      //   saveToPhotoAlbum: false,
      //   correctOrientation: true,
      //   encodingType: this.camera.EncodingType.JPEG,
      //   destinationType: this.camera.DestinationType.FILE_URI
      // }

      this.globalFun.takeOnlyImage('GDocument').then(
        (imageData) => {
          this.addProofDocs.push({ imgpath: imageData });
          this.docImg = true;
          this.slides.slideNext();
        },
        (err) => {
          this.showAlert('Document Image', 'Document Not Uploaded');
        }
      );
    }
  }

  async proofImgRemove(img) {
    let alertq = await this.alertCtrl.create({
      header: 'Delete?',
      subHeader: 'Do you want to delete?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          handler: () => {
            console.log('cancelled');
          },
        },
        {
          text: 'yes',
          handler: () => {
            if (img.id != null || img.id != undefined) {
              if (this.proofpic) {
                this.sqlSupport
                  .removeAnnexure(img.id)
                  .then((data) => {
                    this.removeimgbylocal(img);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else if (this.entitypic) {
                this.sqlSupport
                  .removeSignImages(img.id)
                  .then((data) => {
                    this.removeimgbylocal(img);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else if (this.imdpic) {
                this.sqlSupport
                  .removeImdImages(img.id)
                  .then((data) => {
                    this.removeimgbylocal(img);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else if (this.nachpic) {
                this.sqlSupport
                  .removeNachImages(img.id)
                  .then((data) => {
                    this.removeimgbylocal(img);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else if (this.nachStatePic) {
                this.sqlSupport
                  .removeNachStateImages(img.id)
                  .then((data) => {
                    this.removeimgbylocal(img);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            } else {
              this.removeimgbylocal(img);
            }
          },
        },
      ],
    });
    alertq.present();
  }

  removeimgbylocal(img) {
    let slideend = this.slides.isEnd();
    let index: number = this.addProofDocs.indexOf(img);
    this.addProofDocs.splice(index, 1);
    // console.log(this.addProofDocs);
    if (slideend) {
      this.slides.slideTo(0);
    }
    if (this.addProofDocs.length == 0) {
      this.docImg = false;
    }
  }

  closeProofModal() {
    this.modalCtrl.dismiss(this.addProofDocs);
  }
}
