import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  IonSlides,
  ModalController,
  NavController,
  NavParams,
} from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';

@Component({
  selector: 'app-proof-modal',
  templateUrl: './proof-modal.page.html',
  styleUrls: ['./proof-modal.page.scss'],
})
export class ProofModalPage {
  @ViewChild('Slides') slides: IonSlides;

  // options: CameraOptions = {
  //   quality: 50,
  //   destinationType: this.camera.DestinationType.FILE_URI,
  //   encodingType: this.camera.EncodingType.JPEG,
  //   mediaType: this.camera.MediaType.PICTURE,
  //   correctOrientation: true
  // }
  docImg: boolean = false;
  docsImg: any;
  addProofDocs = [];
  docId: number;
  refId: number;
  id: number;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // public viewCtrl: ViewController,
    // public camera: Camera,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public globalFun: GlobalService,
    public alertService: CustomAlertControlService
  ) {
    this.docId = this.navParams.get('imgId');
    this.refId = this.navParams.get('refId');
    this.id = this.navParams.get('id');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProofModalPage');
  }

  closeProofModal() {
    this.modalCtrl.dismiss();
  }

  ionViewDidEnter() {
    this.getDocsImg();
  }

  openProofGallery() {
    // if(this.global.getApplicationSubStatus()=='Y'){

    // }else{
    // const goptions: CameraOptions = {
    //   quality: 50,
    //   allowEdit: true,
    //   sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    //   saveToPhotoAlbum: false,
    //   correctOrientation: true,
    //   encodingType: this.camera.EncodingType.JPEG,
    //   destinationType: this.camera.DestinationType.FILE_URI
    // }

    this.globalFun.takeOnlyImage('document').then(
      (imageData) => {
        this.docsImg = imageData;
        let imgIds = [this.refId, this.id, this.docId, this.docsImg];
        this.sqliteProvider
          .addOtherDocsImages(imgIds)
          .then((data) => {
            console.log(data);
            this.docImg = true;
            this.getDocsImg();
            // this.showAlert("Document Image", "Document Uploaded");
          })
          .catch((Error) => {
            console.log('Failed!');
          });
      },
      (err) => {
        this.alertService.showAlert('Alert!', `Document Not Updated`);
      }
    );
    // }
  }

  takeProofImg() {
    this.globalFun.takeImage('document').then(
      (imageData) => {
        this.docsImg = imageData;

        let imgIds = [this.refId, this.id, this.docId, this.docsImg];
        this.sqliteProvider
          .addOtherDocsImages(imgIds)
          .then((data) => {
            console.log(data);
            this.docImg = true;
            this.getDocsImg();
            // this.showAlert("Document Image", "Document Uploaded");
          })
          .catch((Error) => {
            console.log('Failed!');
          });
      },
      (err) => {
        // this.showAlert("Document Image", "Document Not Uploaded");
      }
    );
  }

  getDocsImg() {
    this.addProofDocs = [];
    //  let ids ={refId : this.refId, id: this.id, docId: this.docId};
    this.sqliteProvider.getOtherDocsImgs(this.docId).then((data) => {
      console.log(data);
      var retriveImgData = data;
      for (let i = 0; i < retriveImgData.length; i++) {
        this.addProofDocs.push({
          url: retriveImgData[i].docsImgs,
          docsImgId: retriveImgData[i].docImgId,
        });
        //console.log("addProofDocs==>" + JSON.stringify(this.retriveImgData));
        this.docImg = true;
      }
      if (retriveImgData.length === 0) {
        this.docImg = false;
      }
    });
  }

  async proofImgRemove(docImg) {
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
            let slideend = this.slides.isEnd();
            this.sqliteProvider
              .removeOtherDocsImg(docImg.docsImgId)
              .then((data) => {
                this.getDocsImg();
                console.log('slideend  is', slideend);
                if (slideend) {
                  this.slides.slideTo(0);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          },
        },
      ],
    });
    alertq.present();
  }
}
