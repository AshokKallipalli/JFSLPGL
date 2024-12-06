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

@Component({
  selector: 'app-pdd-imgs',
  templateUrl: './pdd-imgs.page.html',
  styleUrls: ['./pdd-imgs.page.scss'],
})
export class PddImgsPage {
  name = 'PddImgsPage';
  @ViewChild('Slides') slides: IonSlides;

  docImg: boolean = false;
  proofdocinfo = [];
  public addProofDocs = [];
  proofpic: boolean = false;
  fieldDisable: boolean = false;

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
    public globalData: DataPassingProviderService,
    public globalFun: GlobalService,
    public loadingService: CustomLoadingControlService
  ) {
    let submitstatus = this.navParams.get('submitstatus');
    if (submitstatus == true) {
      this.fieldDisable = true;
    }

    if (this.navParams.get('pddpics')) {
      this.proofpic = true;
      this.proofdocinfo = this.navParams.get('pddpics');
      console.log('this.proofdocinfo', this.proofdocinfo);
    }

    if (this.proofdocinfo.length > 0) {
      this.addProofDocs = this.proofdocinfo[0].AllImages;
      console.log('this.addProofDocs', this.addProofDocs);

      this.docImg = true;
    }
  }

  ionViewDidLoad() {
    // this.initializeBackButtonCustomHandler();
  }

  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  // initializeBackButtonCustomHandler(): void {
  //   this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function (event) {
  //     console.log('Prevent Back Button Page Change');
  //   }, 150); // Priority 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file */
  // }

  // capureImg() {
  //   this.camera.getPicture(this.options).then(img => {
  //     console.log("img",img)
  //     let imagePath = normalizeURL(img);
  //     let fileName = imagePath.substr(imagePath.lastIndexOf("/") + 1, imagePath.lastIndexOf("jpg"));
  //     console.log("imagePath11",imagePath)

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
    if (this.addProofDocs.length >= 3) {
      this.showAlert('Document', 'Document Maximum Limit Reached.');
    } else {
      this.capureImg();
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
                // this.sqliteProvider.deletePddDocumentImages(img.id).then(data => {
                //   this.removeimgbylocal(img);
                // }).catch(err => {
                //   console.log(err);
                // });
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
