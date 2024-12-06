import { Component, OnInit } from '@angular/core';
import {
  NavController,
  LoadingController,
  Platform,
  ToastController,
  ModalController,
} from '@ionic/angular';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { GlobalService } from 'src/providers/global.service';
import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router';
import { CaptureImageComponent } from 'src/app/components/capture-image/capture-image.component';
import { PicproofPage } from '../picproof/picproof.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
const { App } = Plugins;

@Component({
  selector: 'app-jfshome',
  templateUrl: './jfshome.page.html',
  styleUrls: ['./jfshome.page.scss'],
})
export class JfshomePage implements OnInit {
  userType: any;
  username: any;
  branchCode: any;
  leadStatus: any;
  public counter = 0;
  userGroupsName = [];
  sideMenu = true;
  proofImgs: any;
  proofImglen: any;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadCtrl: LoadingController,
    public network: Network,
    public globalData: DataPassingProviderService,
    private globFunc: GlobalService,
    public platform: Platform,
    public toastCtrl: ToastController,
    public sqliteProvider: SqliteService,
    public master: RestService,
    public router: Router,
    public alertService: CustomAlertControlService
  ) {
    // this.username = this.globalData.getusername();
    this.username = this.globFunc.basicDec(localStorage.getItem('username'));
    // this.branchCode = this.globalData.getJanaCenter();
    this.branchCode = localStorage.getItem('janaCenter');
  }

  ionViewWillEnter() {
    this.username = this.globFunc.basicDec(localStorage.getItem('username'));
    this.getUserGroupsNames();
    this.globalData.setProfileImage(undefined);
    this.globalData.setEntiProfileImage(undefined);
    this.globalData.setrefId('');
    this.globalData.setId('');
    this.globalData.setloanType('');
    this.globalData.setCustType('');
    this.globalData._EditSaveStatus = [];
    localStorage.setItem('Basic', '');
    localStorage.setItem('Sourcing', '');
    localStorage.setItem('Personal', '');
    localStorage.setItem('Permanent', '');
    localStorage.setItem('Present', '');
    localStorage.setItem('Proof', '');
  }

  showPicModal(value) {
    if (value === 'idproof') {
      this.modalCtrl
        .create({
          component: PicproofPage, // Replace 'PicproofPage' with the actual component you want to display
          componentProps: {
            proofpics: true,
            submitstatus: false,
          },
        })
        .then((modal) => {
          modal.onDidDismiss().then((data) => {
            if (data && data.data) {
              this.proofImgs = [];
              this.proofImgs = data.data;
              this.proofImglen = data.data.length;
              console.log(data.data, 'ondid dismiss');
            }
          });
          modal.present();
        });
    }
  }

  ngOnInit() {}

  getUserGroupsNames() {
    let userGroup;
    this.sqliteProvider.getUserIDLoginDetails(this.username).then((data) => {
      if (data.length > 0) {
        userGroup = JSON.parse(data[0].userGroups);
        for (let i = 0; i < userGroup.length; i++) {
          this.sqliteProvider
            .getUserGroupsNameBasedOnId(userGroup[i])
            .then((data) => {
              this.userGroupsName.push(data[0].UserGroupName);
            });
        }
      }
    });
  }

  newapplicantclick() {
    if (
      (this.userGroupsName.includes('CRES') &&
        this.userGroupsName.includes('CPCOPS')) ||
      this.userGroupsName.includes('CRES')
    ) {
      if (this.network.type == 'none' || this.network.type == 'unknown') {
        this.leadStatus = 'offline';
        this.userType = 'A';
        this.globalData.setborrowerType(this.userType);
        this.globalData.setCustType('N');
        this.router.navigate(['/home'], {
          queryParams: { userType: this.userType, leadStatus: this.leadStatus },
          skipLocationChange: true,
          replaceUrl: true,
        });
      } else {
        this.leadStatus = 'online';
        this.userType = 'A';
        this.globalData.setborrowerType(this.userType);
        this.globalData.setCustType('N');
        this.router.navigate(['/home'], {
          queryParams: { userType: this.userType, leadStatus: this.leadStatus },
          skipLocationChange: true,
          replaceUrl: true,
        });
      }
    } else {
      this.alertService.showAlert(
        'Alert',
        'This user is not allowed to create lead!'
      );
    }
  }

  existapplicantclick(leadStatus) {
    // console.log("lead: " + leadStatus)
    if (
      (this.userGroupsName.includes('CRES') &&
        this.userGroupsName.includes('CPCOPS')) ||
      this.userGroupsName.includes('CRES')
    ) {
      this.router.navigate(['/ExistingPage'], {
        queryParams: { username: this.username, _leadStatus: leadStatus },
        skipLocationChange: true,
        replaceUrl: true,
      });
    } else {
      this.alertService.showAlert(
        'Alert',
        'This user is allowed to view lead!'
      );
    }
  }

  submittedApplicant() {
    this.router.navigate(['/ExistApplicationsPage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  checkLMS() {
    this.router.navigate(['/LmsPage'], {
      queryParams: { user: this.username, branch: this.branchCode },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  groupInbox() {
    this.router.navigate(['/GroupInboxPage'], {
      queryParams: { user: this.username, branch: this.branchCode },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  async takeImage() {
    try {
      const modalClosed = await this.modalCtrl.create({
        component: CaptureImageComponent,
        cssClass: '',
        showBackdrop: true,
        animated: true,
      });

      return await modalClosed.present();
    } catch (err) {
      console.log(err);
    }
  }
}
