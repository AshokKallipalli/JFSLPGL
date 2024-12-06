import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Camera,
  CameraOptions,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { PddImgsPage } from '../pdd-imgs/pdd-imgs.page';
import { CropImgPage } from '../crop-img/crop-img.page';
import { WebView } from '@awesome-cordova-plugins/ionic-webview/ngx';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { OnRoadPriceService } from 'src/providers/on-road-price.service';
import { PicproofPage } from '../picproof/picproof.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-pdd-submission',
  templateUrl: './pdd-submission.page.html',
  styleUrls: ['./pdd-submission.page.scss'],
})
export class PddSubmissionPage implements OnInit {
  Document_Type = [
    // { "code": "1", "name": "Licence" },
    // { "code": "2", "name": "Rc_Book" },
    // { "code": "3", "name": "Insurence" },
  ];

  selectOptions = {
    cssClass: 'remove-ok',
  };

  loading: any;

  PddDetails: FormGroup;
  userType: any;
  userInfo: any;
  refId: any;
  id: any;
  docValue: any;
  submittedData: any;
  pddDetailsArray: any = [];
  showDetail: boolean = false;
  pddDocImgs: any = [];
  pddDocImglen: number = 0;
  uploadBtn: boolean = true;
  //addButton: boolean = false;
  docUploadDocs: any = [];
  PddImgs: number = 0;
  submitDisable: boolean = false;
  docVal: any;
  newPddArray: any = [];
  applicNo: any;
  pddDisable: boolean = false;
  imgName: any;
  PddData: FormGroup;
  pddDataId: any;
  showFinalBtn = false;
  applicantDetails = [];
  disbursedAccount: any;
  pddDocDetails: any = [];
  count = 0;
  documentType: any;
  RCFetchDetailsDisable: boolean = true;
  hypothecation: boolean = false;
  rcVerify: boolean = false;
  customPopoverOptions = {
    cssClass: 'custom-popover',
  };
  // showAlert(tittle, subtitle) {
  //   let alert = this.alertCtrl.create({
  //     title: tittle,
  //     subTitle: subtitle,
  //     buttons: ['OK']
  //   });
  //   alert.present();
  // }
  @ViewChild('fileref') fileRef: ElementRef;
  showFile = false;
  disableDoc = false;
  constructor(
    public router: Router,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    // public viewCtrl: ViewController,
    public sqlite: SqliteService,
    public globalData: DataPassingProviderService,
    public globalFunction: GlobalService,
    public master: RestService,
    // public base64: Base64,
    public loadCtrl: LoadingController,
    public sqliteSupport: SquliteSupportProviderService,
    public actionSheetCtrl: ActionSheetController,
    public orpApi: OnRoadPriceService,
    //  public camera: Camera,
    public webview: WebView,
    public alertService: CustomAlertControlService
  ) {
    this.loading = this.loadCtrl.create({
      message: 'Please wait...',
    });
    this.PddDetails = this.formBuilder.group({
      docType: ['', Validators.required],
      remarks: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
        ]),
      ],
    });

    this.PddData = this.formBuilder.group({
      rcNo: ['', Validators.required],
      engineNo: ['', Validators.required],
      chassisno: ['', Validators.required],
      nameAsPerRC: ['', Validators.required],
      finalInvoice: ['', Validators.required],
      hypothecation: ['', Validators.required],
      hypothecationName: ['', Validators.required],
    });

    if (this.route.snapshot.queryParamMap.get('fieldDisable')) {
      this.submitDisable = true;
    }

    this.userType = this.globalData.getborrowerType();
    this.userInfo = JSON.parse(
      this.route.snapshot.queryParamMap.get('submitData')
    );
    this.refId = this.userInfo.refId;
    this.id = this.userInfo.id;
    this.applicNo = this.userInfo.applicationNumber;

    this.getDocumentsVehicle();
    //this.getPddDetailsValue()
    this.getApplicationDetails();
    this.getDisbursedAccount();
  }

  // async showAlert(tittle, subtitle) {
  //   let alert = await this.alertCtrl.create({
  //     header: tittle,
  //     message: subtitle,
  //     buttons: ['OK']
  //   });
  //   return await alert.present();
  // }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PddSubmissionPage');
  }

  getDocumentsVehicle() {
    this.sqlite.getDocumentsVehicle('DocumentsVehicle').then((data) => {
      this.Document_Type = data;
    });
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

  getDisbursedAccount() {
    this.sqlite.getVehicleWorkflowList('Disbursed Account').then((flowDesc) => {
      this.disbursedAccount = flowDesc[0];
    });
  }

  getApplicationDetails() {
    this.sqlite.getApplicantDataAfterSubmit(this.refId).then((data) => {
      if (data.length > 0) {
        this.applicantDetails = data;
        if (data[0].pdDocUpload == 'Y') {
          this.showFinalBtn = true;
        }
      }
    });
  }

  getPddDetailsValue() {
    this.sqliteSupport.getPddDataDetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        this.PddData.controls.rcNo.setValue(data[0].rcNo);
        this.PddData.controls.engineNo.setValue(data[0].engineNo);
        this.PddData.controls.chassisno.setValue(data[0].chassisno);
        this.PddData.controls.finalInvoice.setValue(data[0].finalInvoice);
        this.pddDataId = data[0].pddDataId;
      }
    });

    this.sqlite
      .getPddDetailsFromDd(this.refId, this.id)
      .then((data) => {
        if (data.length > 0) {
          this.submittedData = data;
          this.pddDetailsArray = [];
          this.submittedData.forEach((element) => {
            this.pddDetailsArray.push({
              pddDocId: element.pddDocId,
              refId: element.refId,
              id: element.id,
              docType: element.docType,
              docDescription: element.docDescription,
              remarks: element.remarks,
              uploadFlag: element.uploadFlag,
              AllImages: '',
            });
            if (element.uploadFlag == 'N') {
              this.showDetail = true;
              this.uploadBtn = false;
            } else {
              this.uploadBtn = true;
              this.pddDisable = true;
            }
          });
          console.log(this.pddDetailsArray);
          for (let v = 0; v < this.pddDetailsArray.length; v++) {
            this.docVal = this.pddDetailsArray[v].docType;
            this.getPddImages(this.docVal);
          }
        } else {
          this.pddDetailsArray = [];
          this.uploadBtn = true;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  PddDetailsSave(value) {
    if (value.docType) {
      console.log('value', value);
      let docmentExists = this.pddDetailsArray.filter(
        (data) => data.docType == value.docType
      );

      if (docmentExists.length != 0) {
        this.alertService.showAlert('Alert!', 'This Documents Added');
      } else {
        this.docValue = value.docType;
        let docDescp = this.Document_Type.filter(
          (data) => data.docId == this.docValue
        );
        let desc = docDescp[0].docDescription;
        let pddData = {
          docType: this.docValue,
          docDescription: desc,
          remarks: value.remarks,
          uploadFlag: 'N',
          AllImages: [],
        };
        this.pddDetailsArray.push(pddData);
        console.log('this.pddDetailsArray', this.pddDetailsArray);
        // this.sqliteSupport.insertPddDataDetailsSave(this.refId, this.id, this.PddData.value, this.pddDataId).then(data => {
        //   this.pddDataId = data.insertId;
        // }).catch(err => {
        //   console.log(err)
        // })

        // this.sqlite.insertPddDetailsSave(this.refId, this.id, value, desc, 'N').then(data => {
        //   this.PddDetails.reset();
        //   this.alertService.showAlert("Alert!", "Pdd Documents Added Successfully");
        // }).catch(err => {
        //   console.log(err);
        // })
        // this.getPddDetailsArray(this.docValue);
      }
    } else {
      this.alertService.showAlert('Alert!', 'Please Select Document Type');
    }
  }

  getPddDetailsArray(docValue) {
    this.sqlite
      .getPddDetailsSave(this.refId, this.id, docValue)
      .then((data) => {
        this.submittedData = data;
        this.submittedData.forEach((element) => {
          this.pddDetailsArray.push({
            pddDocId: element.pddDocId,
            refId: element.refId,
            id: element.id,
            docType: element.docType,
            docDescription: element.docDescription,
            remarks: element.remarks,
            uploadFlag: element.uploadFlag,
            AllImages: [],
          });
          if (element.uploadFlag == 'N') {
            this.showDetail = true;
            this.uploadBtn = false;
          }
        });
        console.log(this.pddDetailsArray);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async addPddImages(doc) {
    console.log('doc', doc);
    let newpddArray = this.pddDocImgs.filter((data) => data.docType == doc);
    console.log('newpddArray', newpddArray);
    const modal = await this.modalCtrl.create({
      component: PddImgsPage,
      componentProps: {
        pddpics: newpddArray,
        submitstatus: this.submitDisable,
      },
    });
    modal.onDidDismiss().then((data) => {
      this.pddDocImgs = [];
      this.pddDocImgs = data.data;
      this.pddDocImglen = data.data.length;
      console.log('this.pddDocImgs', this.pddDocImgs);
      // if(data.length > 0){
      this.deletePddImages(doc);
      // }
    });
    return await modal.present();
  }

  deletePddImages(doc) {
    this.sqlite
      .removePddDocImages(this.refId, this.id, doc)
      .then((data) => {
        console.log(data);
        if (data.length > 0) {
          this.uploadPddImages(doc);
          this.getPddImages(doc);
        } else {
          this.uploadPddImages(doc);
          this.getPddImages(doc);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  uploadPddImages(doc) {
    if (this.pddDocImgs.length > 0) {
      for (let i = 0; i < this.pddDocImgs.length; i++) {
        this.sqlite
          .addPddDocImages(this.refId, this.id, doc, this.pddDocImgs[i].imgpath)
          .then((data) => {})
          .catch((Error) => {
            console.log('Failed!' + Error);
            this.alertService.showAlert('Alert!', 'Failed!');
          });
      }
      this.pddDocImgs = [];
      this.pddDocImglen = 0;
      this.alertService.showAlert('Alert!', 'Pdd Images Added Successfully');
    } else {
      this.alertService.showAlert('Alert!', 'No Images Added');
    }
  }
  getPddImages(doc) {
    this.sqlite
      .getPddDocImages(this.refId, this.id, doc)
      .then((docimg) => {
        this.pddDocImgs = [];
        if (docimg.length > 0) {
          for (let i = 0; i < docimg.length; i++) {
            this.pddDocImgs.push({
              imgpath: docimg[i].pddDocImgs,
              docType: docimg[i].docType,
            });
          }
          //this.pddDocImglen = docimg.length;
          for (let j = 0; j < this.pddDetailsArray.length; j++) {
            for (let k = 0; k < this.pddDocImgs.length; k++) {
              if (this.pddDetailsArray[j].docType == this.pddDocImgs[k].docType)
                this.pddDetailsArray[j].AllImages = this.pddDocImgs;
              this.PddImgs = this.pddDocImgs.length;
            }
          }
          console.log(this.pddDetailsArray, 'this.pddDetailsArray');
          this.showDetail = true;
          this.uploadBtn = false;
        } else {
          this.pddDocImgs = [];
          this.pddDetailsArray.forEach((data) => {
            if (data.docType == doc) {
              data.AllImages = [];
            }
          });
        }
      })
      .catch((err) => {
        console.log('Failed!' + err);
        this.alertService.showAlert('Alert!', 'Failed!');
      });
  }

  async deleteDoc(docVal) {
    let alert = await this.alertCtrl.create({
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
            this.sqlite
              .deletePddSavedDetailsFromDb(this.refId, this.id, docVal)
              .then((data) => {
                console.log(data);
                this.pddDocImgs = [];
                this.PddDetails.reset();
                this.getPddDetailsValue();
              })
              .catch((err) => {
                console.log(err);
              });
          },
        },
      ],
    });
    await alert.present();
  }

  PddDocUploadImgs() {
    this.sqlite
      .getPddUploadImgFromDb(this.refId, this.id)
      .then(async (data) => {
        if (data.length > 0) {
          for (let j = 0; j < data.length; j++) {
            if (data[j].pddDocImgs != undefined && data[j].pddDocImgs != '') {
              const base64File = await Filesystem.readFile({
                path: data[j].pddDocImgs,
                directory: Directory.External,
              });
              console.log(base64File, 'ppd submision readfile');
              let docImg = base64File.data.replace(/\n/g, '');
              console.log(docImg, 'ppd readfile replace');
              let docUpload = {
                DocId: data[j].docType,
                DocName: 'Img' + j + '.jpg',
                DocImg: docImg,
              };
              this.docUploadDocs.push(docUpload);

              // this.base64.encodeFile(data[j].pddDocImgs).then((base64File: string) => {
              //   let docImg = base64File.replace(/\n/g, '');
              //   let docUpload = {
              //     "DocId": data[j].docType,
              //     "DocName": "Img" + j + ".jpg",
              //     "DocImg": docImg
              //   }
              //   this.docUploadDocs.push(docUpload);
              // });
            }
          }
          console.log(this.docUploadDocs, 'Upload Pdd Docs Imgs');
        }
      });
  }

  pddDocUpload() {
    if (this.pddDocImgs.length > 0) {
      this.PddDocUploadImgs();
      this.sqlite.getPddDetailsFromDd(this.refId, this.id).then((data) => {
        if (data.length > 0) {
          this.globalFunction.globalLodingPresent('Please wait...');
          let body = {
            PropNo: this.applicNo,
            remarks: 'Remark',
            DocumentList: this.docUploadDocs,
            RcNo: this.PddData.controls.rcNo.value,
            EngineNo: this.PddData.controls.engineNo.value,
            ChassisNo: this.PddData.controls.chassisno.value,
            FinalInvoice: this.PddData.controls.finalInvoice.value,
          };
          this.master
            .restApiCallAngular('pdddocupload', body)
            .then((res) => {
              let pddDocRes = <any>res;
              if (pddDocRes.errorCode === '000') {
                this.globalFunction.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert',
                  'Pdd Documents Uploaded Successfully'
                );
                this.pddDetailsArray.forEach((element) => {
                  this.sqlite
                    .updatePddUpload(element.refId, element.id, 'Y')
                    .then((data) => {
                      console.log(data);
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                });
                this.sqliteSupport
                  .updatePDDdocSuccessStatus(this.refId, this.id)
                  .then((data) => {
                    this.showFinalBtn = true;
                  });
                // this.deleteAllData();
                this.uploadBtn = true;
                this.pddDisable = true;
              } else if (pddDocRes.errorCode === '001') {
                this.globalFunction.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert',
                  'Pdd Documents Image Should not be Empty'
                );
                this.uploadBtn = false;
              } else {
                this.globalFunction.globalLodingDismiss();
                this.alertService.showAlert('Alert', pddDocRes.errorStatus);
                this.uploadBtn = false;
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    } else {
      this.alertService.showAlert('Alert!', 'Please Add Pdd Document Images');
    }
  }

  deleteAllData() {
    this.sqliteSupport.removeAllApplicantDetails(this.refId).then((data) => {
      this.router.navigate(['/ExistApplicationsPage'], {
        skipLocationChange: true,
        replaceUrl: true,
      });
    });
  }

  finalWorkFlow() {
    this.globalFunction.globalLodingPresent(
      'Submitting for disbursed account Please wait...'
    );
    let body = {
      userId: this.applicantDetails[0].createdUser,
      PropNo: this.applicantDetails[0].applicationNumber,
      nextFlowPoint: this.disbursedAccount.flowPoint,
      GroupId: this.disbursedAccount.UserGroup,
    };

    this.master
      .restApiCallAngular('mobileWorkflow', body)
      .then(
        (res) => {
          let fieldInsRes = <any>res;
          if (fieldInsRes.ErrorCode === '000') {
            this.globalFunction.globalLodingDismiss();
            this.deleteAllData();
          } else {
            this.globalFunction.globalLodingDismiss();
            this.alertService.showAlert('Alert', fieldInsRes.ErrorDesc);
          }
        },
        (err) => {
          this.globalFunction.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      )
      .catch((err) => err);
  }

  async actionSheet(docType) {
    this.documentType = docType;
    console.log('this.documentType', this.documentType);
    let actionSheet = await this.actionSheetCtrl.create({
      header: 'Choose File/Image',
      buttons: [
        {
          text: 'File',
          handler: () => {
            console.log('Destructive clicked');
            this.fileRef.nativeElement.click();
          },
        },
        {
          text: 'Take Image',
          handler: () => {
            console.log('Archive clicked');
            this.capureImg(1);
          },
        },
        {
          text: 'Choose Image',
          handler: () => {
            console.log('Archive clicked');
            this.capureImg(0);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });

    await actionSheet.present();
  }

  captureImg(value) {
    this.globalFunction.takeImage('document').then((res: any) => {
      // this.imgName = res
      this.imgName = res.path;
      this.globalData.convertToWebPBase64(this.imgName).then((cnvtImg: any) => {
        // this.globalData.convertToWebPBase64(res).then((cnvtImg: any) => {
        this.imgName = `data:image/*;charset=utf-8;base64,${cnvtImg.path}`;
        localStorage.setItem('PPBS', res.size);
        localStorage.setItem('PPAS', cnvtImg.size);
        this.globalData.globalLodingDismiss();
        if (value == 'profPic') {
          this.uploadService(this.imgName);
        }
      });
    });
    // })
  }

  capureImg(srcType) {
    let options: any;
    // let takeOptions: CameraOptions = {
    //   quality: 50,
    //   destinationType: this.camera.DestinationType.FILE_URI,
    //   encodingType: this.camera.EncodingType.JPEG,
    //   mediaType: this.camera.MediaType.PICTURE,
    //   sourceType: srcType
    // }
    let takeOptions = {
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 25,
    };

    let libOptions = {
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 25,
    };

    // let libOptions: CameraOptions = {
    //   quality: 50,
    //   sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    //   saveToPhotoAlbum: false,
    //   correctOrientation: true,
    //   encodingType: this.camera.EncodingType.JPEG,
    //   destinationType: this.camera.DestinationType.FILE_URI
    // }

    if (srcType == 1) {
      options = takeOptions;
    } else {
      options = libOptions;
    }

    // this.camera.getPicture(options).then(async img => {
    Camera.getPhoto(options).then(
      async (img: any) => {
        console.log('imgimg', img);
        let imagePath = this.webview.convertFileSrc(img);
        console.log('imagePath', imagePath);
        let cropModel = await this.modalCtrl.create({
          component: CropImgPage,
          componentProps: { imgUrl: imagePath, pdd: true },
        });
        await cropModel.present();
        cropModel.onDidDismiss().then((data) => {
          console.log('crop-data', data);
          if (data) {
            this.uploadService(data);
          }
        });
      },
      (err) => {
        this.alertService.showAlert('Document Image', 'Document Not Added');
      }
    );
  }

  async viewPddImages(doc) {
    console.log('doc', doc);
    let newpddArray = this.pddDetailsArray.filter(
      (data) => data.docType == doc
    );
    console.log('newpddArray', newpddArray);
    let modal = await this.modalCtrl.create({
      component: PddImgsPage,
      componentProps: {
        pddpics: newpddArray,
        submitstatus: this.submitDisable,
      },
    });
    modal.onDidDismiss().then((data) => {
      // this.pddDocImgs = [];
      // this.pddDocImgs = data;
      // this.pddDocImglen = data.length;
      // console.log("this.pddDocImgs",this.pddDocImgs)
      // if(data.length > 0){
      //  this.deletePddImages(doc);
      // }
    });
    await modal.present();
  }

  uploadService(data, pdffiles?) {
    let img = data[0].imgpath;
    let docImg = img.replace(
      'data:image/*;charset=utf-8;base64,',
      'data:image/jpeg;base64,/9j/'
    );
    let fileType = data[0].fileType;
    let fileName: any;
    let type: any;
    let timestamp = new Date().getTime().toString();

    if (
      fileType == '.jpg' ||
      fileType == '.jpeg' ||
      fileType == '.png' ||
      fileType == 'image'
    ) {
      fileName = 'Img' + timestamp + fileType;
      type = 'image';
    } else {
      console.log('pdffiles', pdffiles);
      img = `data:image/*;charset=utf-8;base64,${img}`;
      type = 'file';
    }
    let docUpload = {
      DocId: this.documentType,
      DocName: fileName,
      DocImg: docImg,
    };
    console.log('docUpload', docUpload);
    let docDetails = {
      DocId: this.documentType,
      DocName: fileName,
      //"DocImg": docImg
      imgpath: docImg,
      count: timestamp,
      type: type,
    };
    this.uploadToServer(docUpload, docDetails);
    // for(let i=0;i<this.pddDetailsArray.length;i++){
    //   if(this.pddDetailsArray[i].docType == docType){
    //     this.pddDetailsArray[i].AllImages.push(docDetails)
    //   }
    // }
    // //this.pddDocDetails.push(docDetails)
    // console.log("pddDetailsArray",this.pddDetailsArray)
  }
  onFileSelect(event) {
    var filename = event.target.files[0].name;
    var fileType = event.target.files[0].type;
    console.log(filename);
    console.log('event.target.files', event.target.files);
    if (
      fileType == 'application/pdf' ||
      fileType == 'application/msword' ||
      fileType == 'application/vnd.ms-excel' ||
      fileType ==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType == 'image/png' ||
      fileType ==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType == 'image/jpeg' ||
      fileType == 'text/plain'
    ) {
      var reader = new FileReader();
      reader.onload = (file: any) => {
        console.log('reader', file);
        console.log('event.targer', file.target.result);
        this.uploadService(file.target.result, filename);
        // here this method will return base64 string :D
      };
      reader.readAsDataURL(event.target.files[0]);
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    } else {
      this.alertService.showAlert(
        'Alert',
        'This Type Of File Is Not Supported'
      );
    }
  }

  uploadToServer(file, docDetails) {
    this.globalFunction.globalLodingPresent('Please wait...');
    let uplodfile = [];
    uplodfile.push(file);
    let body = {
      PropNo: this.applicNo,
      remarks: 'Remark',
      DocumentList: uplodfile,
      RcNo: this.PddData.controls.rcNo.value,
      EngineNo: this.PddData.controls.engineNo.value,
      ChassisNo: this.PddData.controls.chassisno.value,
      NameAsPerRC: this.PddData.controls.nameAsPerRC.value,
      FinalInvoice: this.PddData.controls.finalInvoice.value,
    };
    console.log('body', body);
    this.master
      .restApiCallAngular('pdddocupload', body)
      .then((res) => {
        let pddDocRes = <any>res;
        if (pddDocRes.errorCode === '000') {
          for (let i = 0; i < this.pddDetailsArray.length; i++) {
            if (this.pddDetailsArray[i].docType == file.DocId) {
              docDetails.imgpath = docDetails.imgpath.replace(
                'data:image/jpeg;base64,/9j/',
                'data:image/*;charset=utf-8;base64,'
              );
              this.pddDetailsArray[i].AllImages.push(docDetails);
            }
          }
          console.log('pddDetailsArray', this.pddDetailsArray);
          this.globalFunction.globalLodingDismiss();
          this.alertService.showAlert(
            'Alert',
            'Pdd Documents Uploaded Successfully'
          );
        } else if (pddDocRes.errorCode === '001') {
          this.globalFunction.globalLodingDismiss();
          this.alertService.showAlert('Alert', JSON.stringify(pddDocRes));
        } else {
          this.globalFunction.globalLodingDismiss();
          this.alertService.showAlert('Alert', pddDocRes.errorStatus);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  onchangeDocType(value) {
    console.log('docTyope', value);
    if (this.PddData.invalid) {
      this.PddDetails.get('docType').setValue('');
      this.PddDetails.get('docType').updateValueAndValidity();
      this.alertService.showAlert('Alert', 'Please Fill the Form');
    }
  }

  async fetchDetailsFromRC() {
    try {
      this.globalData.globalLodingPresent('Please Wait..');
      await this.orpApi
        .getRCDetails(this.PddData.get('rcNo').value)
        .then((data: any) => {
          console.log('getRCDetails', data);
          this.globalData.globalLodingDismiss();
          if (data) {
            if (!data.blacklisted) {
              this.PddData.get('engineNo').setValue(
                data.engine_number ? data.engine_number : 'NA'
              );
              this.PddData.get('chassisno').setValue(
                data.chassis_number ? data.chassis_number : 'NA'
              );
              this.PddData.get('nameAsPerRC').setValue(
                data.vehicle_model ? data.vehicle_model : 'NA'
              );
              this.PddData.get('hypothecationName').setValue(
                data.financing_authority ? data.financing_authority : 'NA'
              );
              this.PddData.get('hypothecation').setValue(
                data.financing_authority ? 'YES' : 'NO'
              );
              data.financing_authority
                ? (this.hypothecation = true)
                : (this.hypothecation = false);
              // this.RCFetchDetailsDisable = true
            } else {
              this.alertService.showAlert(
                'Alert',
                'Given RC Number is Black Listed!'
              );
              this.reSetRCDetails();
              this.RCFetchDetailsDisable = false;
            }
          } else {
            this.alertService.showAlert('Alert', 'Details not found!');
            this.reSetRCDetails();
            this.RCFetchDetailsDisable = false;
          }
        });
    } catch (error) {
      this.sqliteSupport.addAuditTrail(
        new Date().getTime(),
        'fetchDetailsFromRC',
        '',
        error
      );
      this.RCFetchDetailsDisable = false;
    }
  }

  /**
   * @method reSetRCDetails
   * @description Function helps to reset the values if Values not found from API .
   * @author HariHaraSuddhan S
   */
  reSetRCDetails() {
    this.PddData.get('engineNo').setValue('');
    this.PddData.get('chassisno').setValue('');
    this.PddData.get('nameAsPerRC').setValue('');
    this.PddData.get('hypothecationName').setValue('');
    this.PddData.get('hypothecation').setValue('');
    this.hypothecation = false;
  }

  /**
   * @method viewIdProof
   * @description Function helps to Capture Document or Image.
   * @author HariHaraSuddhan S
   */

  async viewIdProof(doc, imgs) {
    this.documentType = doc;
    let modal = await this.modalCtrl.create({
      component: PicproofPage,
      componentProps: {
        proofpics: imgs,
        disableDoc: this.disableDoc,
        postSancDoc: true,
      },
    });
    modal.onDidDismiss().then((data: any) => {
      let imgData = data.data;
      this.uploadService(imgData);
      console.log(imgData, 'post dos');
    });
    modal.present();
  }
}
