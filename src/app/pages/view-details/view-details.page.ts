import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonItemSliding,
  NavController,
  NavParams,
} from '@ionic/angular';
import { tr } from 'date-fns/locale';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.page.html',
  styleUrls: ['./view-details.page.scss'],
})
export class ViewDetailsPage {
  applType: any = 'coapp';
  userInfo: any;
  gurantors: any = [];
  userType: any;
  nouserdata: any;
  noCoappData: any;
  coapplicants: any = [];
  naveParamsValue: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public alertCtrl: AlertController,
    public globFunc: GlobalService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public alertService: CustomAlertControlService
  ) {
    this.activatedRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.userInfo = JSON.parse(this.naveParamsValue.userVal);
    if (this.userInfo.coAppFlag == 'Y' && this.userInfo.guaFlag == 'Y') {
      this.applType = 'coapp';
    } else if (this.userInfo.coAppFlag == 'Y' && this.userInfo.guaFlag == 'N') {
      this.applType = 'coapp';
    } else if (this.userInfo.coAppFlag == 'N' && this.userInfo.guaFlag == 'Y') {
      this.applType = 'guaran';
    }
    this.nouserdata = true;
    this.noCoappData = true;
  }

  ionViewDidEnter() {
    this.globFunc.statusbarValuesForPages();
  }

  ionViewWillEnter() {
    this.loadCoappDetails();
    this.loadguDetails();
    this.globFunc.statusbarValuesForPages();
  }

  loadguDetails() {
    this.sqliteProvider
      .getguappDetails(this.userInfo.refId, 'G')
      .then((data) => {
        this.gurantors;
        this.gurantors = data;
        if (this.gurantors.length > 0) {
          this.nouserdata = true;
        } else {
          this.nouserdata = false;
        }
      })
      .catch((Error) => {
        console.log(Error);
        this.gurantors = [];
      });
  }

  loadCoappDetails() {
    this.sqliteProvider
      .getguappDetails(this.userInfo.refId, 'C')
      .then((data) => {
        this.coapplicants = [];
        this.coapplicants = data;
        if (this.coapplicants.length > 0) {
          this.noCoappData = true;
        } else {
          this.noCoappData = false;
        }
      })
      .catch((Error) => {
        console.log(Error);
        this.coapplicants = [];
      });
  }

  someThing(coApplSwipe: IonItemSliding) {
    coApplSwipe.close();
  }

  gurantordetails(gurantor) {
    this.router.navigate(['/NewapplicationPage'], {
      queryParams: { getGuaValue: JSON.stringify(gurantor), usertype: 'G' },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  addCoappDetails() {
    let minutes = 1000 * 60;
    let hours = minutes * 60;
    let days = hours * 24;
    let years = days * 365;
    let d = new Date();
    let timeStamp = d.getTime();
    this.userType = 'C';
    this.globalData.setborrowerType(this.userType);
    this.globalData.setrefId(this.userInfo.refId);
    this.globalData.setId(timeStamp);
    this.globalData.setCustomerType('1');
    this.sqliteProvider
      .getguappDetails(this.userInfo.refId, 'C')
      .then((data) => {
        let cglength = data.length;
        if (cglength <= 10) {
          // cglength < 4 --to add more gurantor
          this.router.navigate(['/ChoosecustomerPage'], {
            queryParams: {
              userType: JSON.stringify(this.userType),
              GrefId: JSON.stringify(this.globalData.getrefId()),
              GId: JSON.stringify(this.globalData.getId()),
            },
            skipLocationChange: true,
            replaceUrl: true,
          });
        } else {
          this.alertService.showAlert(
            'Alert!',
            'Gurantor Maximum Limit reached!'
          );
        }
      })
      .catch((error) => {
        console.log('addcoappDetails: ' + error);
      });
  }

  addguarantorDetails() {
    let minutes = 1000 * 60;
    let hours = minutes * 60;
    let days = hours * 24;
    let years = days * 365;
    let d = new Date();
    let timeStamp = d.getTime();
    this.userType = 'G';
    this.globalData.setborrowerType(this.userType);
    this.globalData.setrefId(this.userInfo.refId);
    this.globalData.setId(timeStamp);
    this.globalData.setCustomerType('1');
    this.sqliteProvider
      .getguappDetails(this.userInfo.refId, 'G')
      .then((data) => {
        let cglength = data.length;
        if (cglength <= 10) {
          // cglength < 4 --to add more gurantor
          this.router.navigate(['/ChoosecustomerPage'], {
            queryParams: {
              userType: JSON.stringify(this.userType),
              GrefId: JSON.stringify(this.globalData.getrefId()),
              GId: JSON.stringify(this.globalData.getId()),
            },
            skipLocationChange: true,
            replaceUrl: true,
          });
        } else {
          this.alertService.showAlert(
            'Alert!',
            'Gurantor Maximum Limit reached!'
          );
        }
      })
      .catch((error) => {
        console.log('addguarantorDetails: ' + error);
      });
  }

  passGuaDetails(gurantor) {
    this.globalData.setURN(gurantor.URNnumber);
    this.globalData.setborrowerType(gurantor.userType);
    this.globalData.setrefId(gurantor.refId);
    this.globalData.setId(gurantor.id);
    this.globalData.setCustType(gurantor.promocustType);
    this.globalData.setProfileImage(gurantor.profPic);
    this.globalData.setCustomerType(gurantor.customerType);
    localStorage.setItem('leadId', gurantor.coAppGuaId);
    this.router.navigate(['/NewapplicationPage'], {
      queryParams: { appRefValue: JSON.stringify(gurantor), usergtype: 'G' },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  passCoappDetails(coapp) {
    this.globalData.setURN(coapp.URNnumber);
    this.globalData.setborrowerType(coapp.userType);
    this.globalData.setrefId(coapp.refId);
    this.globalData.setId(coapp.id);
    this.globalData.setCustType(coapp.promocustType);
    this.globalData.setProfileImage(coapp.profPic);
    this.globalData.setCustomerType(coapp.customerType);
    localStorage.setItem('leadId', coapp.coAppGuaId);
    this.router.navigate(['/NewapplicationPage'], {
      queryParams: { appRefValue: JSON.stringify(coapp), usergtype: 'C' },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  removeGuaUser(gurantor) {
    this.sqliteProvider
      .getSubmitDetails(gurantor.refId, gurantor.id)
      .then(async (data) => {
        if (data[0].cibilCheckStat === '1') {
          this.alertService.showAlert(
            'Alert!',
            'Deletion not allowed once CIBIL had been checked!'
          );
        } else {
          let alertq = await this.alertCtrl.create({
            header: 'Delete?',
            subHeader: 'Do you want to delete?',
            buttons: [
              {
                text: 'NO',
                role: 'cancel',
                handler: () => {
                  console.log('cancelled');
                  this.loadguDetails();
                },
              },
              {
                text: 'yes',
                handler: () => {
                  this.sqliteProvider
                    .removeGuaDetails(gurantor.refId, gurantor.id)
                    .then((data) => {
                      this.loadguDetails();
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
      });
  }

  removeCoappUser(gurantor) {
    this.sqliteProvider
      .getSubmitDetails(gurantor.refId, gurantor.id)
      .then(async (data) => {
        if (data[0].cibilCheckStat === '1') {
          this.alertService.showAlert(
            'Alert!',
            'Deletion not allowed once CIBIL had been checked!'
          );
        } else {
          let alertq = await this.alertCtrl.create({
            header: 'Delete?',
            subHeader: 'Do you want to delete?',
            buttons: [
              {
                text: 'NO',
                role: 'cancel',
                handler: () => {
                  console.log('cancelled');
                  this.loadCoappDetails();
                },
              },
              {
                text: 'yes',
                handler: () => {
                  this.sqliteProvider
                    .removeGuaDetails(gurantor.refId, gurantor.id)
                    .then((data) => {
                      this.loadCoappDetails();
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
      });
  }
}
