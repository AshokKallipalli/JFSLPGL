import { Component, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { StatusBar } from '@capacitor/status-bar';
import {
  AlertController,
  IonRouterOutlet,
  MenuController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { AuditLogsPage } from './pages/audit-logs/audit-logs.page';
import { ExistApplicationPage } from './pages/exist-application/exist-application.page';
import { ExistingPage } from './pages/existing/existing.page';
import { JfshomePage } from './pages/jfshome/jfshome.page';
import { Geolocation } from '@capacitor/geolocation';
import { SplashScreen } from '@capacitor/splash-screen';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
declare var cordova: any;
declare var window: any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  myDate = new Date();
  // alertCheck: boolean = false;
  userGroupsName = [];
  usersGroupsName: string;
  alertCtrl = new AlertController();
  fname: string;
  pages: Array<{ title: string; component: any; icon: any }>;
  @ViewChildren(IonRouterOutlet) routerOutlet: QueryList<IonRouterOutlet>;
  username: any;

  constructor(
    public network: Network,
    public globalData: DataPassingProviderService,
    public globFunc: GlobalService,
    private router: Router,
    public sqliteProvider: SqliteService,
    public sqliteSuportProvider: SquliteSupportProviderService,
    public platform: Platform,
    public menuCtrl: MenuController
  ) {
    this.pages = [
      { title: 'Home Page', component: '/JsfhomePage', icon: 'home' },
      {
        title: 'Existing Leads',
        component: '/ExistingPage',
        icon: 'document-text',
      },
      {
        title: 'Existing Applications',
        component: '/ExistApplicationsPage',
        icon: 'documents',
      },
      { title: 'Audit Log', component: '/audit-logs', icon: 'reader' },
    ];
    this.initializeApp();
    this.globalData.loginUser.subscribe((data) => this.getUsersGroupsNames());
  }

  async ionViewDidEnter() {
    this.getUserGroupsNames();
  }

  ionViewWillLeave() {
    this.userGroupsName = [];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.setBackgroundColor({
        color: '#DA107E',
      });
      setTimeout(() => {
        SplashScreen.hide();
      }, 13000);
      this.LocationPermission();
      // this.securityCheck();
      this.globFunc.statusbarValuesForPages();
      this.sqliteProvider.getDatabaseState().subscribe((ready) => {
        if (ready) {
          this.getUsersGroupsNames();
          this.getUserGroupsNames();
        }
      });
      this.username = this.globFunc.basicDec(localStorage.getItem('username'));
      this.backButtonFun();
    });
  }

  async LocationPermission() {
    try {
      let reqLoc = await Geolocation.requestPermissions();
      console.log('reqLoc', reqLoc);
    } catch (error) {
      console.log('Get Location:', error.message);

      this.globFunc.globalLodingPresent(error.message);
    }
  }

  async logout() {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.globFunc.showAlert('Alert!', 'Check your network data Connection');
    } else {
      this.globalData
        .confirmationAlert('Confirm logout?', 'Are you sure to logout?')
        .then(async (data) => {
          this.userGroupsName = [];
          if (data == 'Yes') {
            this.globFunc.globalLodingPresent('Logging out...');
            this.menuCtrl.close();
            await this.router.navigate(['/login'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
            this.globFunc.globalLodingDismiss();
          } else {
            this.globFunc.globalLodingDismiss();
          }
        })
        .catch((Error) => {
          this.globFunc.globalLodingDismiss();
        });
    }
  }

  getUsersGroupsNames() {
    let userGroup;
    let usersGroupsName = [];
    this.fname = this.globFunc.basicDec(localStorage.getItem('username'));
    this.sqliteProvider.getUserIDLoginDetails(this.fname).then((data) => {
      userGroup = JSON.parse(data[0].userGroups);
      for (let i = 0; i < userGroup.length; i++) {
        this.sqliteProvider
          .getUserGroupsNameBasedOnId(userGroup[i])
          .then((data) => {
            usersGroupsName.push(data[0].UserGroupName);
            this.usersGroupsName = usersGroupsName.join();
          });
      }
    });
  }

  async getUserGroupsNames() {
    let userGroup;
    this.fname = this.globFunc.basicDec(localStorage.getItem('username'));
    this.sqliteProvider.getUserIDLoginDetails(this.fname).then((data) => {
      console.log(data);
      if (data.length > 0) {
        userGroup = JSON.parse(data[0].userGroups);
        for (let i = 0; i < userGroup.length; i++) {
          this.sqliteProvider
            .getUserGroupsNameBasedOnId(userGroup[i])
            .then((data) => {
              this.userGroupsName.push(data[0].UserGroupName);
              console.log(this.userGroupsName);
              return true;
              // this.usersGroupsName = userGroupsName.join();
            });
        }
      }
    });
  }

  /**
   * @method backButtonFun
   * @description Function helps to navigate the respective page while hitting back button.
   * @author HariHaraSuddhan S
   */

  backButtonFun() {
    this.platform.backButton.subscribeWithPriority(0, async () => {
      this.routerOutlet.forEach((outlet: IonRouterOutlet) => {
        if (
          this.router.url.includes('/JsfhomePage') ||
          this.router.url == '/JsfhomePage'
        ) {
          this.globFunc.logout().then((data) => {
            if (data === 'ok') {
              this.callLogOut();
            }
          });
        } else {
          if (
            this.router.url.includes('/secondKycPage') ||
            this.router.url == '/secondKycPage'
          ) {
            this.router.navigate(['/JsfhomePage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          } else if (
            this.router.url.includes('/NewapplicationPage') ||
            this.router.url == '/NewapplicationPage'
          ) {
            this.router.navigate(['/JsfhomePage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          } else if (
            this.router.url.includes('/ExistApplicationsPage') ||
            this.router.url == '/ExistApplicationsPage'
          ) {
            this.router.navigate(['/JsfhomePage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          } else if (
            this.router.url.includes('/TabsPage') ||
            this.router.url == '/TabsPage'
          ) {
            this.router.navigate(['/ExistingPage'], {
              queryParams: {
                username: this.username,
                _leadStatus: 'online',
                skipLocationChange: true,
                replaceUrl: true,
              },
            });
          } else if (
            this.router.url.includes('/AssetTabsPage') ||
            this.router.url == '/AssetTabsPage'
          ) {
            this.router.navigate(['/ExistingPage'], {
              queryParams: {
                username: this.username,
                _leadStatus: 'online',
                skipLocationChange: true,
                replaceUrl: true,
              },
            });
          } else if (
            this.router.url.includes('/ReferenceDetailsPage') ||
            this.router.url == '/ReferenceDetailsPage'
          ) {
            this.router.navigate(['/ExistingPage'], {
              queryParams: {
                username: this.username,
                _leadStatus: 'online',
                skipLocationChange: true,
                replaceUrl: true,
              },
            });
          } else if (
            this.router.url.includes('/submit') ||
            this.router.url == '/submit'
          ) {
            this.router.navigate(['/ExistingPage'], {
              queryParams: {
                username: this.username,
                _leadStatus: 'online',
                skipLocationChange: true,
                replaceUrl: true,
              },
            });
          } else if (
            this.router.url.includes('/ChoosecustomerPage') ||
            this.router.url == '/ChoosecustomerPage'
          ) {
            this.router.navigate(['/ExistingPage'], {
              queryParams: {
                username: this.username,
                _leadStatus: 'online',
                skipLocationChange: true,
                replaceUrl: true,
              },
            });
          } else if (
            this.router.url.includes('/PosidexCheckPage') ||
            this.router.url == '/PosidexCheckPage'
          ) {
            this.router.navigate(['/ExistApplicationsPage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          } else if (
            this.router.url.includes('/CreditCheckPage') ||
            this.router.url == '/CreditCheckPage'
          ) {
            this.router.navigate(['/ExistApplicationsPage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          } else if (
            this.router.url.includes('/secondKycPage') ||
            this.router.url == '/secondKycPage'
          ) {
            return new Promise(async (resolve, reject) => {
              let alert = await this.alertCtrl.create({
                header: 'Alert!',
                subHeader: 'Data will be lost?',
                buttons: [
                  {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {},
                  },
                  {
                    text: 'Yes',
                    handler: () => {
                      this.sqliteSuportProvider.removeEkycData(
                        this.globalData.getLeadId()
                      );
                      this.sqliteSuportProvider.removeKarzaData(
                        this.globalData.getLeadId()
                      );
                      this.router.navigate(['/ExistApplicationsPage'], {
                        skipLocationChange: true,
                        replaceUrl: true,
                      });
                    },
                  },
                ],
              });
              alert.present();
            });
          } else if (
            this.router.url.includes('/ScoreCardPage') ||
            this.router.url == '/ScoreCardPage'
          ) {
            return new Promise(async (resolve, reject) => {
              let alert = await this.alertCtrl.create({
                header: 'Alert!',
                subHeader: 'Complete the Process! Otherwise Data will be lost!',
                buttons: [
                  {
                    text: 'OK',
                    handler: () => {
                      let refId = this.globFunc.getScoreCardChecked();
                      this.sqliteProvider.updateScoreCardinPostsanctionWhileQuit(
                        'N',
                        refId
                      );
                      this.router.navigate(['/ExistApplicationsPage'], {
                        skipLocationChange: true,
                        replaceUrl: true,
                      });
                    },
                  },
                ],
              });
              alert.present();
            });
          } else if (
            this.router.url.includes('/PostSanctionPage') ||
            this.router.url == '/PostSanctionPage'
          ) {
            this.router.navigate(['/ExistApplicationsPage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          } else if (
            this.router.url.includes('/login') ||
            this.router.url == '/login'
          ) {
            this.exitApp();
          } else {
            this.router.navigate(['/JsfhomePage'], {
              skipLocationChange: true,
              replaceUrl: true,
            });
          }
        }
      });
    });
  }

  callLogOut(flag?) {
    if (flag) {
      this.exitApp();
    } else {
      this.router.navigate(['/login'], {
        skipLocationChange: true,
        replaceUrl: true,
      });
    }
  }

  exitApp() {
    navigator['app'].exitApp();
  }

  async floderCreation() {
    console.log('Folder Plugin triggered..,');
    const directory =
      +this.globFunc.getAndroidV() > 10
        ? Directory.Documents
        : Directory.External;
    try {
      // Attempt to read the directory
      await Filesystem.readdir({
        path: 'WebPImage',
        directory: directory,
      });
      console.log('Folder already exists.');
    } catch (e) {
      // If the directory doesn't exist, create it
      try {
        const ret = await Filesystem.mkdir({
          path: 'WebPImage',
          directory: directory,
          recursive: false,
        });
        console.log('Folder created:', ret);
      } catch (error) {
        console.error('Error creating folder:', error);
      }
    }
  }

  async floderCreationForAudit() {
    console.log('Folder Plugin triggered..,');
    const directory =
      +this.globFunc.getAndroidV() > 10
        ? Directory.Documents
        : Directory.External;
    try {
      // Attempt to read the directory
      await Filesystem.readdir({
        path: 'AuditLog',
        directory: directory,
      });
      console.log('Folder already exists.');
    } catch (e) {
      // If the directory doesn't exist, create it
      try {
        const ret = await Filesystem.mkdir({
          path: 'AuditLog',
          directory: directory,
          recursive: false,
        });
        console.log('Folder created:', ret);
      } catch (error) {
        console.error('Error creating folder:', error);
      }
    }
  }

  async openPage(page) {
    // await this.getUserGroupsNames().then((data : any) => {
    // if(data){
    if (this.pages[4])
      this.pages[4].title === page.title ? this.pages : this.pages.splice(4);
    if (
      page.title !== 'Vehicle Details' &&
      page.title !== 'Nach Details' &&
      page.title !== 'CASA Details' &&
      page.title !== 'Lead Details' &&
      page.title !== 'Posidex Details'
    ) {
      if (page.title == 'Existing Leads') {
        if (
          (this.usersGroupsName.includes('CRES') &&
            this.usersGroupsName.includes('CPCOPS')) ||
          this.usersGroupsName.includes('CRES')
        ) {
          this.router.navigate([page.component], {
            queryParams: {
              _leadStatus: 'online',
              user: this.globFunc.basicDec(localStorage.getItem('username')),
              branch: localStorage.getItem('janaCenter'),
            },
          });
        } else {
          this.globalData.showAlert(
            'Alert!',
            'This user is allowed to view lead!'
          );
          this.router.navigate(['/JsfhomePage'], {
            skipLocationChange: true,
            replaceUrl: true,
          });
        }
      } else {
        this.router.navigate([page.component], {
          queryParams: {
            _leadStatus: 'online',
            user: this.globFunc.basicDec(localStorage.getItem('username')),
            branch: localStorage.getItem('janaCenter'),
          },
        });
      }
    }
  }

  /**
   * @method securityCheck
   * @description Checking the Users device weather USB Debugging Mode Enabled or not.
   * @author HariHaraSuddhan S
   */
  securityCheck() {
    let p_this = this;
    cordova.plugins.pdfmake.checkPdfdline(
      function (val) {
        if (val == true) {
          // p_this.global.presentAlert(this.alertErrorLabel.AlertLabels.USB_Debugging_Enabled, this.alertErrorLabel.AlertLabels.Application_Not_Working_this_Environment);
          p_this.globFunc.showAlert(
            'USB Debugging Enabled!',
            'Application will not be working on this environment.'
          );
          setTimeout(() => {
            navigator['app'].exitApp();
          }, 5000);
        } else {
          console.log('checkPdfdline');
        }
      },
      function (error) {
        console.log('error ===>' + error);
        navigator['app'].exitApp();
      }
    );

    cordova.plugins.pdfmake.checkPdfFshow('netstat', function (res) {
      if (res.output != null && res.output != undefined && res.output != '') {
        let fridaavailable = res.output.includes('frida');
        if (fridaavailable == true) {
          // p_this.global.presentAlert(this.alertErrorLabel.AlertLabels.Frida_Detected, this.alertErrorLabel.AlertLabels.Application_Not_Working_this_Environment);
          p_this.globFunc.showAlert(
            'Frida Detected!',
            'Application will not be working on this environment.'
          );
          setTimeout(() => {
            navigator['app'].exitApp();
          }, 2000);
        }
      }
    });
  }

  /**
   * @method emulatordetect
   * @description Application will not work if user sharing the screen or recording the screen.
   * @author HariHaraSuddhan S
   */

  emulatordetect() {
    let p_this = this;
    cordova.plugins.pdfmake.checkPdfVinfo(
      function (val) {
        if (val == true) {
          p_this.globFunc.showAlert(
            'Virtual Device!',
            'Application will not be working on this environment.'
          );
          setTimeout(() => {
            navigator['app'].exitApp();
          });
        }
      },
      function (error) {
        navigator['app'].exitApp();
      }
    );
  }
}
