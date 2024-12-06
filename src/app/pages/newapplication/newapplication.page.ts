import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { CameraOptions } from '@capacitor/camera';
import {
  IonSlides,
  IonContent,
  NavController,
  NavParams,
  ModalController,
  AlertController,
  Platform,
  MenuController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LeadComponent } from 'src/app/components/lead/lead.component';
import { ProofComponent } from 'src/app/components/proof/proof.component';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { ProofModalPage } from '../proof-modal/proof-modal.page';
import { ActivatedRoute, Router } from '@angular/router';
import { ShowImagePage } from '../show-image/show-image.page';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-newapplication',
  templateUrl: './newapplication.page.html',
  styleUrls: ['./newapplication.page.scss'],
})
export class NewapplicationPage {
  @ViewChild('mySlider') slider: IonSlides;
  @ViewChild(IonContent) content: IonContent;
  // @ViewChild('Content') content: IonContent;
  @ViewChild(LeadComponent) leadComponent: LeadComponent;
  @ViewChild(ProofComponent)
  private ProofComponent: ProofComponent;
  //private LeadComponent: LeadComponent;
  imgName: any;
  public deviceId: any;
  public createdDate: any;
  public createdUser: string = 'JFS';

  basicShow = true;
  leadShow = true;
  custType: any;
  leadStatus: any;
  getGuaValues: any;

  aadhardetails = false;
  personalShow = true;

  slides: any;
  userdetail: string = 'userdetail';
  userType: any;

  submitDisable: boolean = false;

  // options: CameraOptions = {
  //   quality: 50,
  //   destinationType: this.camera.DestinationType.FILE_URI,
  //   encodingType: this.camera.EncodingType.JPEG,
  //   mediaType: this.camera.MediaType.PICTURE,
  //   correctOrientation: true
  // }

  promoterPic: boolean = true;
  entityPic: boolean = false;
  entiProfImg: boolean = false;

  profImg: boolean = false;
  public profPic: any;
  public entiProfPic: any;
  public userValues: any;

  //Submitted Ticks
  basicTick: boolean = false;
  kycTick: boolean = false;
  entityTick: boolean = false;
  sourcingTick: boolean = false;
  personalTick: boolean = false;
  addressTick: boolean = false;
  idproofTick: boolean = false;
  leadTick: boolean = false;
  customerType: any;
  subscription: Subscription;
  naveParamsValue: any;
  profileSize: { PPBS: any; PPAS: any }[];
  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public device: Device,
    // public camera: Camera,  public crop: Crop,
    public sqliteProvider: SqliteService,
    public alertCtrl: AlertController,
    public globalData: DataPassingProviderService,
    public globFunc: GlobalService,
    public activatedRoute: ActivatedRoute, // public file: File,
    public network: Network,
    public platform: Platform,
    public menuCtrl: MenuController,
    public alertService: CustomAlertControlService
  ) {
    this.activatedRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.customerType = this.globalData.getCustomerType();
    if (this.naveParamsValue.usertype) {
      this.userType = this.naveParamsValue.usertype;
      this.globalData.setborrowerType(this.userType);
    }

    if (this.naveParamsValue.usergtype) {
      this.userType = this.naveParamsValue.usergtype;
      this.globalData.setborrowerType(this.userType);
    }

    if (this.naveParamsValue.fieldDisable) {
      this.submitDisable = true;
    }

    this.userType = this.globalData.getborrowerType();

    this.deviceId = this.device.uuid;
    this.createdDate = new Date();

    this.aadhardetails = false;
    this.personalShow = true;

    if (this.naveParamsValue.newApplication) {
      this.custType = this.globalData.getCustType();
      this.leadStatus = this.naveParamsValue.leadStatus;
      this.globalData.setCustType(this.custType);
      this.globalData.setrefId('');
      this.globalData.setId('');
    }

    console.log(this.userType, 'usertype in lead details');
    // this.getOrgId()
    if (this.userType === 'A') {
      this.basicShow = true;
      this.leadShow = true;
      this.userdetail = 'basic';
      if (this.customerType == '1') {
        this.slides = [
          {
            id: 'basic',
          },
          {
            id: 'sourcing',
          },
          {
            id: 'personal',
          },
          {
            id: 'idproof',
          },
          {
            id: 'address',
          },
          {
            id: 'lead',
          },
        ];
      } else {
        this.slides = [
          {
            id: 'basic',
          },
          {
            id: 'sourcing',
          },
          {
            id: 'entity',
          },
          {
            id: 'personal',
          },
          {
            id: 'idproof',
          },
          {
            id: 'address',
          },
          {
            id: 'lead',
          },
        ];
      }
    }

    if (this.userType === 'G' || this.userType === 'C') {
      this.basicShow = false;
      this.leadShow = false;
      localStorage.setItem('Sourcing', 'sourcingSaved');
      this.globalData.setrefId(this.globalData.getrefId());
      this.userdetail = 'personal';
      this.slides = [
        {
          id: 'personal',
        },
        {
          id: 'idproof',
        },
        {
          id: 'address',
        },
      ];
    }
  }

  ionViewWillEnter() {
    this.globFunc.statusbarValuesForPages();
    this.menuCtrl.swipeGesture(true);
    // Ensure the content is scrolled to the top when the view is entered
    this.content.scrollToTop(0);

    if (this.userType === 'A') {
      if (this.naveParamsValue.paramNo) {
        this.slider.slideTo(2);
      }
      if (this.naveParamsValue.paramYes) {
        this.slider.slideTo(2);
      }
    } else if (this.userType === 'G') {
      if (this.naveParamsValue.paramNo) {
        this.slider.slideTo(1);
      }
      if (this.naveParamsValue.paramYes) {
        this.slider.slideTo(1);
      }
    }

    if (this.naveParamsValue.leadSlide) {
      this.slider.slideTo(6);
    }
  }

  ionViewDidEnter() {
    if (this.globalData.getProfileImage()) {
      this.profPic = this.globalData.getProfileImage();
      this.profImg = true;
    }
    if (this.globalData.getEntiProfileImage()) {
      this.entiProfPic = this.globalData.getEntiProfileImage();
      this.entiProfImg = true;
    }
    this.globFunc.statusbarValuesForPages();
  }

  ionViewDidLoad() {
    this.subscription = this.globFunc.hardwareBackButtonClicked$.subscribe(
      (value) => {
        // checkForDataChangesInForms(this, 'backbutton')
      }
    );
    this.globFunc.resetapplicationDataChangeDetector();
    this.globFunc.publishPageNavigation({
      title: 'Lead Details',
      component: NewapplicationPage,
    });
  }

  ionViewDidLeave() {
    let status;
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      status = 'offline';
    } else {
      status = 'online';
    }
    // this.platform.registerBackButtonAction(() => {
    //   this.navCtrl.push(ExistingPage, { _leadStatus: status });
    // })
  }

  onSegmentChanged(segmentButton) {
    // console.log("Segment changed to", segmentButton.value);
    const selectedIndex = this.slides.findIndex((slide) => {
      return slide.id === segmentButton.detail.value;
    });
    this.slider.slideTo(selectedIndex);
    // console.log("selected: " + selectedIndex);
  }

  getOrgId() {
    // this.sqliteProvider.getOrganisationState(localStorage.getItem('janaCenter')).then(data => {
    //   if (data.length > 0) {
    //     localStorage.setItem('orgId', data[0].OrgID);
    //     console.log("data[0].OrgID: ---------> " + data[0].OrgID);
    //   }
    // })
  }

  async onSlideChanged(slider) {
    let selectedSlide = await this.slider.getActiveIndex();
    const currentSlide = await this.slides[selectedSlide];
    console.log(currentSlide, 'current slide');
    this.userdetail = currentSlide.id;
    // Ensure the content is scrolled to the top when the slide changes
    this.content.scrollToTop(0);
    if (this.userType === 'A') {
      if (currentSlide.id == 'lead') {
        this.slider.lockSwipeToNext(true);
        this.leadComponent.LeadDetails();
      } else {
        this.slider.lockSwipeToNext(false);
      }
    } else if (this.userType === 'G' || this.userType === 'C') {
      if (currentSlide.id == 'address') {
        this.slider.lockSwipeToNext(true);
      } else {
        this.slider.lockSwipeToNext(false);
      }
    } else {
      console.log('no usertype recived for slide lock..');
    }
    if (currentSlide.id == 'entity') {
      this.promoterPic = false;
      this.entityPic = true;
    } else {
      this.promoterPic = true;
      this.entityPic = false;
    }
  }

  async ProofModal() {
    const proofModal = await this.modalCtrl.create({
      component: ProofModalPage,
    });
    proofModal.present();
  }

  preview() {
    this.navCtrl.navigate(['/PreviewPage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
    // this.navCtrl.push(PreviewPage);
  }

  async showAlert(tittle, subtitle) {
    let alert = await this.alertCtrl.create({
      header: tittle,
      subHeader: subtitle,
      buttons: ['OK'],
    });
    alert.present();
  }

  captureImg(value) {
    this.globFunc.takeImage('document').then((res: any) => {
      // this.imgName = res
      this.imgName = res.path;
      this.globalData.convertToWebPBase64(this.imgName).then((cnvtImg: any) => {
        // this.globalData.convertToWebPBase64(res).then((cnvtImg: any) => {
        this.imgName = `data:image/*;charset=utf-8;base64,${cnvtImg.path}`;
        localStorage.setItem('PPBS', res.size);
        localStorage.setItem('PPAS', cnvtImg.size);
        this.globalData.globalLodingDismiss();
        if (value == 'profPic') {
          this.profPic = this.imgName;
          this.profileSize = [{ PPBS: res.size, PPAS: cnvtImg.size }];
          this.globalData.setProfileImage(this.profPic);
          this.profImg = true;
        } else if (value == 'entiProfPic') {
          this.entiProfPic = this.imgName;
          this.profileSize = [{ PPBS: res.size, PPAS: cnvtImg.size }];
          this.globalData.setEntiProfileImage(this.entiProfPic);
          this.entiProfImg = true;
        }
      });
    });
    // })
  }

  // captureImg(value) {

  //   this.globFunc.takeOnlyImage(value).then(async (img: string) => {
  //     this.imgName = img;
  //     if (this.imgName) {
  //       let filePath = `Pictures/${value}.jpg`;
  //       await Filesystem.writeFile({
  //         path: filePath,
  //         data: this.imgName,
  //         directory: Directory.External, // Use Directory.Data for the private folder you created
  //       }).then(res => {
  //         if (value == 'profPic') {
  //           this.profPic = this.imgName;
  //           this.globalData.setProfileImage(this.profPic);
  //           this.profImg = true;
  //         } else if (value == 'entiProfPic') {
  //           this.entiProfPic = this.imgName;
  //           this.globalData.setEntiProfileImage(this.entiProfPic);
  //           this.entiProfImg = true;
  //         }
  //       });
  //     }
  //   })
  //   // })
  // }

  async takeProfPic(value) {
    if (!this.profImg) {
      this.captureImg(value);
    } else {
      const Profilemodal = await this.modalCtrl.create({
        component: ShowImagePage,
        componentProps: { pic: this.profPic, size: this.profileSize },
      });
      await Profilemodal.present();
      await Profilemodal.onDidDismiss().then((data) => {
        if (data.data == 'updateProfileIMAGE') {
          if (this.submitDisable) {
            this.alertService.showAlert(
              'Alert!',
              'Application already submitted!'
            );
          } else {
            this.captureImg(value);
          }
        }
      });
    }
  }

  existPage() {
    let leadStatus;
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      leadStatus = 'offline';
    } else {
      leadStatus = 'online';
    }
    this.navCtrl.navigate(['/ExistingPage'], {
      queryParams: { _leadStatus: leadStatus },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }
  homePage() {
    this.navCtrl.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  // scrollToTop() {
  //   this.content.scrollToTop();
  // }

  showSubmittedTick(data: any) {
    // console.log('emit ' + data);
    // if(this.globalData.getSaveStatus()){
    //  let check = this.globalData.getSaveStatus();
    switch (data) {
      case 'basicTick':
        this.basicTick = true;
        break;
      case 'kycTick':
        this.kycTick = true;
        break;
      case 'sourcingTick':
        this.sourcingTick = true;
        break;
      case 'entityTick':
        this.entityTick = true;
        break;
      case 'personalTick':
        this.personalTick = true;
        break;
      case 'addressTick':
        this.addressTick = true;
        break;
      case 'idproofTick':
        this.idproofTick = true;
        break;
      case 'leadTick':
        this.leadTick = true;
        break;
      case 'noIdProof':
        this.idproofTick = false;
    }
  }
  // }

  clearpromo() {
    // this.ProofComponent.clearpromoall();
  }

  async takeentiProfPic(value) {
    if (!this.entiProfImg) {
      this.captureImg(value);
    } else {
      const Profilemodal = await this.modalCtrl.create({
        component: ShowImagePage,
        componentProps: { pic: this.entiProfPic },
      });
      await Profilemodal.present();
      await Profilemodal.onDidDismiss().then((data) => {
        if (data.data == 'updateProfileIMAGE') {
          if (this.submitDisable) {
            this.alertService.showAlert(
              'Alert!',
              'Application already submitted!'
            );
          } else {
            this.captureImg(value);
          }
        }
      });
    }
  }

  openMenu() {
    // checkForDataChangesInForms(this, 'menubutton');
  }

  navigateTo() {
    this.subscription.unsubscribe();
    // this.navCtrl.pop();
  }
}
