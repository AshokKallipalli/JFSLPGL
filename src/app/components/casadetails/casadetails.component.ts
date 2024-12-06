import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { NomineedetailsComponent } from '../nomineedetails/nomineedetails.component';
import { Subject } from 'rxjs';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-casadetails',
  templateUrl: './casadetails.component.html',
  styleUrls: ['./casadetails.component.scss'],
})
export class CasadetailsComponent {
  guaList: any = [];
  nomShow: boolean = false;
  submitDisable: boolean = false;
  javaAccCheck: boolean = false;
  showGuaran: boolean = false;
  refId: any;
  id: any;
  usertype: any;
  casaId: any;
  accDetails: FormGroup;
  rel_master = [
    { ReligionId: '1', ReligionName: 'type 1' },
    { ReligionId: '2', ReligionName: 'type 2' },
    { ReligionId: '3', ReligionName: 'type 3' },
  ];
  coAppFlag: any;
  guaFlag: any = 'N';

  // @ViewChild(NomineedetailsComponent, { static: true }) Nominee: NomineedetailsComponent;

  constructor(
    public navCtrl: NavController,
    public router: Router,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public sqlSupport: SquliteSupportProviderService,
    public globalData: DataPassingProviderService,
    // public global: DataPassingProvider,
    // public events: Events,
    public alertCtrl: AlertController,
    public platform: Platform,
    public alertService: CustomAlertControlService
  ) {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.usertype = this.globalData.getborrowerType();
    this.coAppFlag = this.globalData.getCoAppFlag();
    // this.guaFlag = this.globalData.getGuaFlag();
    this.getGuaranList(this.refId);
    this.getCoappList(this.refId);
    this.accDetails = this.formBuilder.group({
      janaAcc: ['N'],
      nomAvail: ['N', Validators.required],
      guaAvail: [''],
      nomList: [''],
    });
    this.getCasaDetails();
    if (localStorage.getItem('submit') == 'true') {
      this.submitDisable = true;
      localStorage.setItem('submit', 'true');
    } else {
      this.submitDisable = false;
    }
  }

  ionViewWillLeave() {
    // this.platform.registerBackButtonAction(() => {
    //   if (this.submitDisable) {
    //     this.navCtrl.push(ExistApplicationsPage);
    //   } else {
    //     this.navCtrl.push(ExistingPage);
    //   }
    // });
  }

  accDetailsSave(value) {
    this.sqlSupport
      .InsertCASADetails(
        this.refId,
        this.id,
        this.usertype,
        value,
        this.casaId,
        '1'
      )
      .then((data) => {
        if (
          this.casaId == null ||
          this.casaId == '' ||
          this.casaId == undefined
        ) {
          this.casaId = data.insertId;
          this.alertService
            .showAlert('Alert!', 'Current/Savings Account details saved!')
            .then((data) => {
              if (this.accDetails.get('janaAcc').value == 'N') {
                this.proceedNextPage();
              }
            });
        } else {
          this.alertService
            .showAlert('Alert!', 'Current/Savings Account details updated!')
            .then((data) => {
              if (this.accDetails.get('janaAcc').value == 'N') {
                this.proceedNextPage();
              }
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getCasaDetails() {
    this.sqlSupport.getCASADetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        this.accDetails.get('janaAcc').setValue(data[0].janaAcc);
        this.accDetails.get('nomAvail').setValue(data[0].nomAvail);
        this.accDetails.get('guaAvail').setValue(data[0].guaAvail);
        this.accDetails.get('nomList').setValue(data[0].nomList);
        this.casaId = data[0].casaId;
        this.refId = data[0].refId;
        this.id = data[0].id;
        if (data[0].janaAcc == 'Y') {
          this.getNomineeDetails(data[0].nomAvail);
          // this.getGuarantorDetails(data[0].guaAvail);

          if (this.accDetails.get('janaAcc').value == 'N') {
            // this.proceedNextPage();
          }
          if (data[0].nomAvail == 'Y') {
            this.showGuaran = true;
          } else {
            this.showGuaran = false;
            this.accDetails.get('guaAvail').setValue('N');
          }
          if (data[0].guaAvail == 'Y') {
            this.nomShow = true;
          }
        } else {
          if (this.accDetails.get('janaAcc').value == 'N') {
            this.accDetails.get('nomAvail').clearValidators();
            this.accDetails.get('nomAvail').updateValueAndValidity();
            this.javaAccCheck = true;
          }
          this.getJanaAccDetails(this.accDetails.get('janaAcc').value);
        }
      } else {
        if (this.accDetails.get('janaAcc').value == 'N') {
          this.accDetails.get('nomAvail').clearValidators();
          this.accDetails.get('nomAvail').updateValueAndValidity();
          this.javaAccCheck = true;
        }
        this.getJanaAccDetails(this.accDetails.get('janaAcc').value);
      }
    });
  }

  getNomineeDetails(event) {
    let value = event.detail ? event.detail.value : event;
    if (value == 'Y') {
      this.showGuaran = true;
    } else {
      this.sqlSupport
        .getNomineeDetails(this.refId, this.id)
        .then(async (nom) => {
          if (nom.length > 0) {
            let alert = await this.alertCtrl.create({
              header: 'Alert!',
              message: 'It will delete your given Nominee Details?',
              buttons: [
                {
                  text: 'Ok',
                  handler: () => {
                    this.sqlSupport.removeNomineeDetails(this.refId, this.id);
                    this.showGuaran = false;
                    this.accDetails.get('guaAvail').setValue('N');
                  },
                },
              ],
            });
            alert.present();
          } else {
            this.showGuaran = false;
            this.accDetails.get('guaAvail').setValue('N');
          }
        });
    }
    this.globalData.publishEvent(value, 'nominee');
  }

  getGuarantorDetails(event) {
    let value = event.detail.value;
    if (this.navParams.get('fieldDisable')) {
      console.log('Already submitted');
    } else {
      if (value == 'Y') {
        this.nomShow = true;
        this.accDetails.controls.nomList.setValidators(Validators.required);
        console.log('guara: ' + value);
        // this.Nominee.fetchGuaranDetails();
        // this.globalData.updateNomineeValue('Y');
        // this.globalData.publishEvent(value, "guaran");
      } else {
        if (!this.submitDisable) {
          this.nomShow = false;
          // this.Nominee.nomiDetails.reset();
          this.globalData.updateNomineeValue('N');
          this.accDetails.controls.nomList.setValue('');
          this.accDetails.controls.nomList.clearValidators();
          this.accDetails.controls.nomList.updateValueAndValidity();
          this.sqlSupport
            .getNomineeDetails(this.refId, this.id)
            .then(async (nom) => {
              if (nom.length > 0) {
                let alert = await this.alertCtrl.create({
                  header: 'Alert!',
                  message: 'Do you want to delete given Nominee Details?',
                  buttons: [
                    {
                      text: 'No',
                      role: 'cancel',
                      handler: () => {
                        console.log('NO clicked');
                      },
                    },
                    {
                      text: 'Yes',
                      handler: () => {
                        this.sqlSupport.removeNomineeDetails(
                          this.refId,
                          this.id
                        );
                      },
                    },
                  ],
                });
                alert.present();
              }
            });
        }
      }
    }
  }

  getGuaranList(refId) {
    this.sqlSupport.getNomList(refId, 'G').then((guaran) => {
      if (guaran.length > 0) {
        this.guaList = guaran;
      } else {
        this.guaList = [];
      }
    });
  }

  getCoappList(refId) {
    this.sqlSupport.getNomList(refId, 'C').then((coapp) => {
      if (coapp.length > 0) {
        for (let i = 0; i < coapp.length; i++) {
          this.guaList.push(coapp[i]);
        }
      } else {
        console.log('coapp not available');
      }
    });
  }

  getJanaAccDetails(event) {
    let value = event.detail.value;
    if (value == 'N') {
      this.javaAccCheck = true;
      this.accDetails.get('nomAvail').setValue('N');
      this.accDetails.get('nomAvail').updateValueAndValidity();
      this.accDetails.get('guaAvail').setValue('');
      this.accDetails.get('guaAvail').updateValueAndValidity();
    } else {
      this.javaAccCheck = false;
      this.accDetails.get('nomAvail').setValue('Y');
      this.accDetails.get('nomAvail').updateValueAndValidity();
    }
    this.globalData.publishEvent(value, 'nomineeJana');
  }

  proceedNextPage() {
    this.alertService
      .proccedOk('Alert', 'Proceed to vehicle details')
      .then((data) => {
        if (data == 'yes') {
          this.globalData.setborrowerType(this.usertype);
          this.globalData.setrefId(this.refId);
          this.globalData.setId(this.id);
          this.router.navigate(['/AssetTabsPage'], {
            skipLocationChange: true,
            replaceUrl: true,
          });
        }
      });
  }

  fetchNomineeDetails(event) {
    let value: string = event.detail.value;
    value.length > 0
      ? this.globalData.updateNomineeValue(value)
      : this.globalData.updateNomineeValue('N');
  }
}
