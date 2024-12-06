import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  AlertController,
  IonSlides,
  ModalController,
  NavController,
  NavParams,
} from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { OtherImgsPage } from '../other-imgs/other-imgs.page';
import { ProofModalPage } from '../proof-modal/proof-modal.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-other-docs',
  templateUrl: './other-docs.page.html',
  styleUrls: ['./other-docs.page.scss'],
})
export class OtherDocsPage implements OnInit {
  @ViewChild('Slides') slides: IonSlides;
  docImg: boolean = false;
  public addProofDocs = [];
  addDocuments: boolean = false;
  docFinalReq = [];
  titles = [
    { CODE: '01', NAME: 'RC Book' },
    { CODE: '02', NAME: 'Insurances' },
  ];
  attachPic: any;
  attchImg: boolean = false;
  docDetails: any;
  submitRequest: any;
  submitedData: any;
  OtherDocData: FormGroup;
  userType: any;
  refId: any;
  id: number;
  docId: any;
  docsData = [];
  submitType: any;
  applicationNumber: any;

  // options: CameraOptions = {
  //   quality: 50,
  //   destinationType: this.camera.DestinationType.FILE_URI,
  //   encodingType: this.camera.EncodingType.JPEG,
  //   mediaType: this.camera.MediaType.PICTURE,
  //   correctOrientation: true
  // }

  selectOptions = {
    cssClass: 'remove-ok',
  };

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public globFunc: GlobalService,
    // public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public network: Network,
    // public camera: Camera,
    public master: RestService,
    public alertService: CustomAlertControlService // public base64: Base64, // public file: File,
  ) // public crop: Crop
  {
    this.applicationNumber = this.navParams.get('application');
    this.userType = this.globalData.getborrowerType();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.submitType = 'non-submit';

    this.OtherDocData = this.formBuilder.group({
      docType: ['', Validators.required],
      docDescription: [
        '',
        Validators.compose([Validators.maxLength(30), Validators.required]),
      ],
    });
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad OtherDocsPage');
  }

  ionViewDidEnter() {
    if (this.refId && this.id) {
      //  alert("getting OtherDocs Data");
      this.getSubmitDocDetails();
      this.getNonSubmitDocDetails();
    }

    // this.globFunc.statusbarValues();
    this.globFunc.statusbarValuesForPages();
  }

  ionViewWillEnter() {
    // this.globFunc.statusbarValues();
    this.globFunc.statusbarValuesForPages();
  }

  otherDocSave(value) {
    if (this.attchImg) {
      let data = [
        this.refId,
        this.id,
        value.docType,
        value.docDescription,
        this.attachPic,
      ];
      this.sqliteProvider.saveOtherDocData(data, this.docId).then((data) => {
        // console.log(JSON.stringify(data));
        this.docId = '';
        this.getNonSubmitDocDetails();
      });
      this.OtherDocData.reset();
      this.attchImg = false;
    } else {
      this.alertService.showAlert('Alert!', 'Please attach Image!');
    }
  }

  getNonSubmitDocDetails() {
    this.docId = '';
    this.attchImg = false;
    this.addDocuments = false;
    this.OtherDocData.reset();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    let ids = { refId: this.refId, id: this.id };
    this.sqliteProvider.getNonSubmitedOtherDocs(ids).then((totaldata) => {
      this.docsData = totaldata;
    });
  }

  getSubmitDocDetails() {
    this.addDocuments = true;
    this.OtherDocData.reset();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    let ids = { refId: this.refId, id: this.id };
    this.sqliteProvider.getSubmitedOtherDocs(ids).then((totaldata) => {
      this.submitedData = totaldata;
      // this.docId = totaldata[0].docId;
    });
  }

  async deleteDoc(docId) {
    let alert = await this.alertCtrl.create({
      header: 'Delete?',
      subHeader: 'Do you want to delete?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          handler: () => {
            console.log('cancelled');
            this.getNonSubmitDocDetails();
          },
        },
        {
          text: 'yes',
          handler: () => {
            let ids = [this.refId, this.id, docId];
            this.sqliteProvider
              .deleteOtherDocs(ids)
              .then((data) => {
                console.log(data);
                this.OtherDocData.reset();
                this.getNonSubmitDocDetails();
              })
              .catch((err) => {
                console.log(err);
              });
          },
        },
      ],
    });
    alert.present();
  }

  showData(i) {
    this.docId = i;
    this.OtherDocData = this.formBuilder.group({
      docType: [this.docsData[i].docType, Validators.required],
      docDescription: [
        this.docsData[i].docDescription,
        Validators.compose([Validators.maxLength(30), Validators.required]),
      ],
    });
    this.docId = this.docsData[i].docId;
    this.attachPic = this.docsData[i].otherDocImg;
    this.attchImg = true;
  }

  async ProofModal(docId) {
    let proofModal = await this.modalCtrl.create({
      component: ProofModalPage,
      componentProps: { refId: this.refId, id: this.id, imgId: docId },
    });
    proofModal.present();
  }

  submitOtherDocs() {
    if (this.docsData.length > 0) {
      if (this.network.type == 'none' || this.network.type == 'unknown') {
        this.alertService.showAlert(
          'Alert!',
          'Please Check your Data Connection!'
        );
      } else {
        this.globalData.globalLodingPresent('Please wait...');
        this.refId = this.globalData.getrefId();
        this.id = this.globalData.getId();
        let ids = { refId: this.refId, id: this.id };
        this.sqliteProvider.checkNonSubmitedOtherDocs(ids).then(
          (totaldata) => {
            this.docDetails = totaldata;
            var ilen = 0;
            // this.converttobase(ilen, this.docDetails[0]);
          },
          (err) => {
            this.globalData.globalLodingDismiss();
            alert('No Response from Server!');
          }
        );
      }
    } else {
      this.alertService.showAlert(
        'Alert!',
        'Please Add At least One Document to Submit!'
      );
    }
  }

  // converttobase(ilen, doc) {
  //   this.base64.encodeFile(doc.otherDocImg).then((base64File: string) => {
  //     let docImg1 = base64File.replace(/\n/g, '');
  //     var docReq = {
  //       "DocName": doc.docType,
  //       "DocDesc": doc.docDescription,
  //       "DocFile": docImg1
  //     }
  //     this.docFinalReq.push(docReq);
  //     // console.log("promodocs==>" + JSON.stringify(this.docFinalReq));
  //     if (ilen != this.docDetails.length - 1) {
  //       ilen = ilen + 1;
  //       this.converttobase(ilen, this.docDetails[ilen]);
  //     }
  //     else {
  //       this.submitRequest = {
  //         "OtherDoc": {
  //           "DocAppno": this.applicationNumber,
  //           "OtherDocs": this.docFinalReq
  //         }
  //       }
  //       console.log("Other Docs: " + JSON.stringify(this.submitRequest));
  //       this.master.restApiCallAngular('OtherDocDetails', this.submitRequest).then((resp) => {
  //         let res = (<any>resp);
  //         if (res.errorMsg.toUpperCase() == 'SUCCESS') {
  //           let submitStatus = '1';
  //           this.sqliteProvider.updateSubmitedOtherDocs(submitStatus, this.refId, this.id).then(data => {
  //             this.submitedData = data;
  //             this.getNonSubmitDocDetails();
  //             this.globalData.globalLodingDismiss();
  //             this.alertService.showAlert("Alert!", "Given other documents submited successfully.");
  //           })
  //         } else {
  //           this.globalData.globalLodingDismiss();
  //           this.alertService.showAlert("Alert!", "Failed!");
  //         }
  //       }).catch(err => {
  //         this.globalData.globalLodingDismiss();
  //         console.log("Other catch: " + JSON.stringify(err));
  //       })
  //     }
  //   }, (err) => {
  //     this.globalData.globalLodingDismiss();
  //     console.log("Other: " + JSON.stringify(err));
  //   });
  // }

  getAttachedImgs(value) {
    this.sqliteProvider.getAddedDocImage(value).then((data) => {
      console.log('DATA: ' + JSON.stringify(data));
    });
  }

  showSubmitData(i) {
    this.docId = i;
    this.OtherDocData = this.formBuilder.group({
      docType: [this.submitedData[i].docType, Validators.required],
      docDescription: [
        this.submitedData[i].docDescription,
        Validators.compose([Validators.maxLength(20), Validators.required]),
      ],
    });
    this.docId = this.submitedData[i].docId;
    this.attachPic = this.submitedData[i].otherDocImg;
    this.attchImg = true;
  }

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
  //           this.attachPic = image;
  //           this.attchImg = true;
  //         })
  //       }
  //     })
  //   }, (err) => {
  //     this.alertService.showAlert("Document Image", "Document Not Uploaded");
  //   })
  // }

  capureImg() {
    this.globFunc.takeImage('document').then((data: any) => {
      let imageName = data.path;
      this.globalData.convertToWebPBase64(imageName).then((cnvtImg) => {
        this.globalData.globalLodingDismiss();
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

  async attacheDocPic() {
    if (this.submitType === 'submited') {
      let Profilemodal = await this.modalCtrl.create({
        component: OtherImgsPage,
        componentProps: { pic: this.attachPic },
      });
      Profilemodal.onDidDismiss().then((data: any) => {
        if (data == 'updateProfileIMAGE') {
          if (this.submitType === 'submited') {
            this.alertService.showAlert(
              'Alert!',
              'Document already submitted!'
            );
          } else {
            this.capureImg();
          }
        }
      });
      Profilemodal.present();
    } else {
      if (
        this.OtherDocData.value['docType'] === '' ||
        this.OtherDocData.value['docType'] === null ||
        this.OtherDocData.value['docType'] === undefined
      ) {
        this.alertService.showAlert(
          'Alert!',
          'Must Select the Document Type value.'
        );
      } else if (
        this.OtherDocData.value['docDescription'] === '' ||
        this.OtherDocData.value['docDescription'] === null ||
        this.OtherDocData.value['docDescription'] === undefined
      ) {
        this.alertService.showAlert(
          'Alert!',
          'Must Enter the Document Description value.'
        );
      } else if (!this.attchImg) {
        this.capureImg();
      } else {
        let Profilemodal = await this.modalCtrl.create({
          component: OtherImgsPage,
          componentProps: {
            pic: this.attachPic,
          },
        });
        Profilemodal.onDidDismiss().then((data: any) => {
          if (data == 'updateProfileIMAGE') {
            this.capureImg();
          }
        });
        Profilemodal.present();
      }
    }
  }
}
