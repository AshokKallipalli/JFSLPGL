import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  IonSlides,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { CropImgPage } from '../crop-img/crop-img.page';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-picproof',
  templateUrl: './picproof.page.html',
  styleUrls: ['./picproof.page.scss'],
})
export class PicproofPage {
  name = 'PicproofPage';
  @ViewChild('Slides') slides: IonSlides;
  public addProofDocs = [];
  docImg: boolean = false;
  proofpic: boolean = false;
  entitypic: boolean = false;
  fieldDisable: boolean = true;
  proofdocinfo = [];
  fromFieldInvestigation = false;
  postSancDoc = false;
  packageName: string;
  // options: CameraOptions = {
  //   quality: 50,
  //   destinationType: this.camera.DestinationType.FILE_URI,
  //   encodingType: this.camera.EncodingType.JPEG,
  //   mediaType: this.camera.MediaType.PICTURE,
  //   correctOrientation: true
  //   // targetWidth: 500,
  //   // targetHeight: 800
  // }
  public unregisterBackButtonAction: any;
  signpic: boolean = false;
  fseImage: boolean = false;

  async showAlert(tittle, subtitle) {
    let alert = await this.alertCtrl.create({
      header: tittle,
      subHeader: subtitle,
      buttons: ['OK'],
    });
    alert.present();
  }
  @ViewChild('fileref') fileRef: ElementRef;
  loading: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // public camera: Camera,
    public alertCtrl: AlertController,
    // public viewCtrl: ViewController,
    public sqliteProvider: SqliteService,
    public platform: Platform,
    public modalCtrl: ModalController,
    // public crop: Crop,
    public sqliteSupport: SquliteSupportProviderService,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public globalFun: GlobalService,
    public globalData: DataPassingProviderService,
    public alertService: CustomAlertControlService
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
    } else if (this.navParams.get('eproofpics')) {
      console.log('no pics recived');
    } else if (this.navParams.get('signpics')) {
      this.signpic = true;
      // this.type = 'signpic';
      this.proofdocinfo = this.navParams.get('signpics');
    }

    if (this.navParams.get('fromFieldInves')) {
      this.fromFieldInvestigation = true;
      this.fseImage = true;
    }
    if (this.navParams.get('disableDoc')) {
      this.fieldDisable = false;
    }
    if (this.navParams.get('postSancDoc')) {
      this.postSancDoc = true;
      // this.type = 'postSancDoc';
    }

    if (this.proofdocinfo.length > 0) {
      this.addProofDocs = this.proofdocinfo;
      if (this.postSancDoc || this.fromFieldInvestigation) {
        for (let i = 0; i < this.addProofDocs.length; i++) {
          // if (this.addProofDocs[i].imgpath) {
          //   this.addProofDocs[i].fil = this.addProofDocs[i].fileName.split(".")[1]
          //   if (this.addProofDocs[i].name == "jpg" || this.addProofDocs[i].name == "jpeg" || this.addProofDocs[i].name == "png") {
          //   this.addProofDocs[i].fileType = "image"
          //   } else {
          //     this.addProofDocs[i].fileType = "file"
          //   }
          // }
          if (this.addProofDocs[i].imgpath) {
            this.addProofDocs[i].fileName =
              this.addProofDocs[i].imgpath.split('/')[
                this.addProofDocs[i].imgpath.split('/').length - 1
              ];
            this.addProofDocs[i].name =
              this.addProofDocs[i].fileName.split('.')[1];
            if (
              this.addProofDocs[i].imgpath.includes('data:image') ||
              this.addProofDocs[i].imgpath.includes('jpeg')
            ) {
              this.addProofDocs[i].fileType = 'image';
            } else {
              this.addProofDocs[i].fileType = 'file';
              this.addProofDocs[i].fileName = 'PDF';
            }
          }
        }
        console.log('this.addProofDocs', this.addProofDocs);
      }

      this.docImg = true;
    }
  }

  async ngOnInit() {
    this.packageName = await this.globalFun.getPackageName();
  }

  ionViewDidLoad() {
    this.initializeBackButtonCustomHandler();
  }
  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }
  initializeBackButtonCustomHandler(): void {
    // this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function (event) {
    //   console.log('Prevent Back Button Page Change');
    // }, 101); // Priority 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file */
  }

  // capureImg() {
  //   this.globalFun.takeOnlyImage('Document').then(async (img: string) => {
  //     let imagePath = img;
  //     console.log("imagePath", imagePath)
  //     let fileName = imagePath;
  //     // let cropModel = await this.modalCtrl.create({
  //     //   component: CropImgPage,
  //     //   componentProps: { imgUrl: imagePath }
  //     // });
  //     // cropModel.present();
  //     // cropModel.onDidDismiss().then(async (data) => {
  //     //   console.log("data-CROP", data)
  //     if (imagePath) {
  //       let imgPath = 'Pictures/Document.jpg';
  //       console.log("fileName", fileName)
  //       await Filesystem.writeFile({
  //         path: imgPath,
  //         data: fileName,
  //         directory: Directory.External // Use Directory.Data for the private folder you created
  //       }).then(res => {
  //         console.log("res", res)
  //         let image = fileName;
  //         if (this.postSancDoc) {
  //           this.addProofDocs.push({ imgpath: image, fileType: "image", fileName: fileName });
  //         } else {
  //           this.addProofDocs.push({ imgpath: image });
  //         }
  //         this.docImg = true;
  //         this.slides.slideNext();
  //       }, err => {
  //         console.log("err-", err)
  //         this.showAlert("Alert!", "Error writing file.")
  //         //this.global.globalLodingDismiss();
  //       });
  //     }
  //     // })
  //   }, (err) => {
  //     this.showAlert("Document Image", "Document Not Uploaded");
  //   })
  // }

  capureImg() {
    if (this.fseImage) {
      this.globalFun.takeImage('document').then((data: any) => {
        let imagePath = data.path;
        imagePath = `data:image/*;charset=utf-8;base64,${data.path}`;
        this.addProofDocs.push({
          imgpath: imagePath,
          fileType: 'image',
          BS: data.size,
          AS: data.size - 100,
        });
        this.docImg = true;
        this.slides.slideNext();
      });
    } else {
      this.globalFun.takeImage('document').then((data: any) => {
        let imageName = data.path;
        this.globalData.convertToWebPBase64(imageName).then(async (cnvtImg) => {
          this.globalData.globalLodingDismiss();
          let imagePath = `data:image/*;charset=utf-8;base64,${cnvtImg.path}`;
          localStorage.setItem('BS', data.size);
          localStorage.setItem('AS', cnvtImg.size);
          const sizeRestricted = await this.checkImageLength(cnvtImg.size);
          if (sizeRestricted) {
            if (this.postSancDoc || this.fromFieldInvestigation) {
              this.addProofDocs.push({
                imgpath: imagePath,
                fileType: 'image',
                BS: data.size,
                AS: cnvtImg.size,
              });
            } else {
              this.addProofDocs.push({
                imgpath: imagePath,
                BS: data.size,
                AS: cnvtImg.size,
              });
            }
            this.docImg = true;
            this.slides.slideNext();
          }
        });
      });
    }
  }

  checkImageLength(size) {
    try {
      let requiredSize: number;
      let finalsize: boolean;
      if (this.signpic) {
        requiredSize = 500;
        finalsize = size < requiredSize ? true : false;
      } else {
        finalsize = true;
      }
      if (finalsize) return true;
      else
        this.alertService.showAlert(
          'Alert',
          `Image Size should be lesser then ( ${requiredSize}.KB),Please Capture again!`
        );
    } catch (error) {
      console.log(error);
    }
  }

  takeProofImg() {
    if (this.signpic) {
      if (this.addProofDocs.length >= 1) {
        this.showAlert('Document', 'Document Maximum Limit Reached.');
      } else {
        this.capureImg();
      }
    } else {
      if (this.postSancDoc) {
        this.capureImg();
      } else {
        if (
          (this.fromFieldInvestigation && this.addProofDocs.length > 2) ||
          this.addProofDocs.length >= 2
        ) {
          this.showAlert('Document', 'Document Maximum Limit Reached.');
        } else {
          this.capureImg();
        }
      }
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
      //   destinationType: this.camera.DestinationType.FILE_URI,
      //   // targetWidth: 500,
      //   // targetHeight: 700
      // }

      this.globalFun.takeOnlyImage('GDocument').then(
        (imageData) => {
          //this.proofimgpath = imageData;
          this.addProofDocs.push({ imgpath: imageData });
          this.docImg = true;
          this.slides.slideNext();
          // console.log(this.addProofDocs);
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
            // console.log("u r click yes");
            //  alert(user.refId);
            if (this.slides && this.slides.isEnd) {
              if (img.id != null || img.id != undefined) {
                //let slideend = this.slides.isEnd();
                if (this.proofpic) {
                  this.sqliteProvider
                    .removepromoterImgDetails(img.id)
                    .then(() => {
                      // console.log(data);
                      //this.getPanImg();
                      this.removeimgbylocal(img);
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }
              } else {
                this.removeimgbylocal(img);
              }
            } else [console.log('Slides not initialized or accessible.')];
          },
        },
      ],
    });
    alertq.present();
  }

  removeimgbylocal(img) {
    if (this.postSancDoc && img.postSanImgId) {
      this.sqliteProvider.removepostSanctionImages(
        img.postSanImgId,
        img.refId,
        img.id
      );
    }
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

  openfile() {
    try {
      this.fileRef.nativeElement.click();
    } catch (err) {
      console.log(err);
      this.showAlert('Alert!', JSON.stringify(err));
    }
  }

  async onFileSelect(event) {
    try {
      if (this.fromFieldInvestigation && this.addProofDocs.length >= 2) {
        this.showAlert('Document', 'Document Maximum Limit Reached.');
      } else {
        return new Promise(async (resolve, reject) => {
          if (event.target.files && event.target.files[0]) {
            this.globalFun.globalLodingPresent('Please Wait...');
            var filename = event.target.files[0].name
              .toString()
              .replace(/ /gi, '_');
            let fileExtn = filename.split('.')[1];
            var fileType = event.target.files[0].type;
            let setFileType: any;
            if (fileExtn == 'jpg' || fileExtn == 'jpeg' || fileExtn == 'png') {
              setFileType = 'image';
            } else {
              setFileType = 'file';
            }
            console.log('filename-filee', filename);
            console.log('event.target.files', event.target.files);
            if (
              fileType == 'application/pdf' ||
              fileType == 'application/msword' ||
              fileType == 'application/vnd.ms-excel' ||
              fileType ==
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
              fileType ==
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
              fileType == 'text/plain' ||
              fileType == 'image/png' ||
              fileType == 'image/jpeg'
            ) {
              if (event.target.files[0].size <= 10000000) {
                var reader = new FileReader();
                const zoneOriginalInstance = (reader as any)[
                  '__zone_symbol__originalInstance'
                ];
                zoneOriginalInstance.onload = async (file: any) => {
                  if (file.target.result) {
                    let pdfData = file.target.result;
                    if (pdfData.includes('data:application/pdf'))
                      pdfData = pdfData.replace(
                        'data:application/pdf;base64,',
                        ''
                      );
                    else
                      pdfData = pdfData.replace(
                        'data:image/jpeg;base64,',
                        'data:image/*;charset=utf-8;base64,'
                      );
                    const fileName = `Documents/${
                      new Date().getTime() + '.pdf'
                    }`;
                    let moveFile = await Filesystem.writeFile({
                      path: fileName,
                      data: pdfData,
                      directory: Directory.External,
                      encoding: Encoding.UTF8,
                      recursive: true,
                    });
                    console.log(moveFile);
                    this.addProofDocs.push({
                      imgpath: pdfData,
                      fileType: setFileType,
                      fileName: filename,
                      fileExten: fileType,
                      url: moveFile.uri,
                    });
                    this.docImg = true;
                    this.slides.slideNext();
                    console.log(document);
                    this.globalFun.globalLodingDismiss();
                    resolve(true);
                  }
                };
                reader.readAsDataURL(event.target.files[0]);
                reader.onerror = function (error) {
                  console.log('Error: ', error);
                };
              } else {
                this.alertService.showAlert(
                  'Alert',
                  'Document Should be lesser then 10MB!'
                );
                this.globalFun.globalLodingDismiss();
                resolve(true);
              }
            } else {
              this.globalFun.globalLodingDismiss();
              this.showAlert('Alert', 'This Type Of File Is Not Supported');
            }
          }
        });
      }
    } catch (error) {
      console.log(error, 'DocumentsService-GalleryFetch');
    }
  }
  // onFileSelect(event) {
  //   if (this.fromFieldInvestigation && this.addProofDocs.length >= 2) {
  //     this.showAlert("Document", "Document Maximum Limit Reached.");
  //   } else {
  //     if (event.target.files && event.target.files[0]) {
  //       this.globalFun.globalLodingPresent('Please Wait...');
  //       var filename = event.target.files[0].name.toString().replace(/ /gi, "_")
  //       let fileExtn = filename.split(".")[1]
  //       var fileType = event.target.files[0].type
  //       let setFileType: any;
  //       if (fileExtn == "jpg" || fileExtn == "jpeg" || fileExtn == "png") {
  //         setFileType = "image"
  //       } else {
  //         setFileType = "file"
  //       }
  //       console.log("filename-filee", filename)
  //       console.log("event.target.files", event.target.files)
  //       if (fileType == "application/pdf" || fileType == "application/msword" || fileType == "application/vnd.ms-excel" || fileType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileType == "text/plain" || fileType == "image/png" || fileType == "image/jpeg") {
  //         var reader = new FileReader();
  //         reader.onload = (file: any) => {
  //           console.log("reader", file)
  //           console.log("event.targer", file.target.result)
  //           // here this method will return base64 string :D
  //           if (file.target.result) {
  //             let imgPath = 'Pictures/';

  //             fetch(file.target.result,
  //               {
  //                 method: "GET"
  //               }).then(res => res.blob()).then(blob => {

  //                 Filesystem.writeFile({
  //                   path: imgPath,
  //                   data: filename,
  //                   directory: Directory.External
  //                 }).then((res: any) => {
  //                   if (res) {
  //                     // let finalDocFormat = { ...doc, nativeURL: res.nativeURL };
  //                     this.addProofDocs.push({ imgpath: res.nativeURL, fileType: setFileType, fileName: filename, fileExten: fileType });
  //                     this.docImg = true;
  //                     this.slides.slideNext();
  //                     console.log(res);
  //                     this.globalFun.globalLodingDismiss();
  //                   }

  //                 }, err => {
  //                   this.globalFun.globalLodingDismiss()
  //                   this.showAlert("Alert!", "Error writing file.")
  //                   //this.global.globalLodingDismiss();
  //                 });

  //               }).catch(error => {
  //                 this.globalFun.globalLodingDismiss()
  //                 this.showAlert("Alert!", "Error writing file.")
  //                 //this.global.globalLodingDismiss();
  //               });
  //           }
  //         }
  //         reader.readAsDataURL(event.target.files[0])
  //         reader.onerror = function (error) {
  //           console.log('Error: ', error);
  //         };
  //       } else {
  //         this.globalFun.globalLodingDismiss()
  //         this.showAlert('Alert', 'This Type Of File Is Not Supported')
  //       }
  //     }
  //   }
  // }

  async fileOpen(value) {
    console.log('value', value);
    value = value.url
      ? value.url
      : 'file:///storage/emulated/0/Android/data/com.jfs.vlwebp/files/Documents/';
    this.alertService.showAlert(
      'Alert',
      `To view the file, please follow the path: (${value})`
    );
  }
}
