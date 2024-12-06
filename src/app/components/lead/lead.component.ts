import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavParams } from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';

@Component({
  selector: 'app-lead',
  templateUrl: './lead.component.html',
  styleUrls: ['./lead.component.scss'],
})
export class LeadComponent {
  mandCount: any;
  pdt_master: any = [];
  org_master: any = [];
  janaLoanName: any;
  janaCenterName: any;
  firstname: any;
  cdate: any;
  leadno: any;
  leadData: any = undefined;
  id: any;
  refId: any;
  leadStatus: string;
  showTick: boolean = true;
  submitDisable: boolean = false;
  showLead: boolean = false;

  text: string;
  @Input('checkProof') checkProof: boolean;
  @Output() saveStatus = new EventEmitter();
  naveParamsValue: any;
  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    private activateRoute: ActivatedRoute,
    public alertCtrl: AlertController,
    public master: RestService,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService
  ) {
    this.activateRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.getproducts();
    this.sqliteProvider.getOrganisation().then((data) => {
      this.org_master = data;
    });
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.getCibilCheckedDetails();

    // this.events.subscribe('lead', (value) => {
    //   if (value == 'proof') {
    //     this.showSaveTick();
    //   } else {

    //   }
    // });

    this.globalData.leadEvent.subscribe((value: string) => {
      if (value === 'proof') {
        this.showSaveTick();
      } else {
        // Handle other cases if needed
      }
    });

    // console.log('Hello LeadComponent Component');

    this.LeadDetails();
  }

  leadSave() {
    if (this.checkProof) {
      if (this.leadData) {
        // console.log(this.leadData);
        this.saveStatus.emit('leadTick');
        // let alert = this.alertCtrl.create({
        //   title: 'Alert!',
        //   message: 'Proceed to psoidex?',
        //   buttons: [
        //     {
        //       text: 'No',
        //       role: 'cancel',
        //       handler: () => {
        //         this.loadingService.globalLodingDismiss();
        //         // this.navCtrl.push(JsfhomePage);
        //       }
        //     },
        //     {
        //       text: 'Yes',
        //       handler: () => {
        //         this.checkPosidex();
        //       }
        //     }
        //   ]
        // });
        // alert.present();
        this.navCtrl.navigate(['/ExistingPage'], {
          queryParams: { _leadStatus: this.leadStatus },
          skipLocationChange: true,
          replaceUrl: true,
        });
      }
    } else {
      this.alertService.showAlert('Alert!', 'Please Save KYC Details.');
    }
  }

  checkPosidex() {
    let body = {
      propNo: '102710000000619',
      CustId: '1462102',
    };
    this.master.restApiCallAngular('fetchcustposidex', body).then((data) => {
      console.log(data);
    });
  }

  showSaveTick() {
    let docs;
    let custType = this.globalData.getCustomerType();
    if (custType == 1) {
      docs = {
        DocPrdCode: localStorage.getItem('product'),
        EntityDocFlag: 'N',
      };
    } else {
      docs = {
        DocPrdCode: localStorage.getItem('product'),
        EntityDocFlag: '',
      };
    }
    this.sqliteProvider
      .getMandDocumentsByPrdCode(docs)
      .then((data) => {
        this.mandCount = data.length;
      })
      .then(() => {
        this.sqliteProvider
          .getPromoterProofDetails(this.refId, this.id)
          .then((data1) => {
            if (this.mandCount >= data1.length) {
              this.saveStatus.emit('leadTick');
            }
          });
      });
  }

  LeadDetails() {
    this.refId = this.globalData.getrefId();
    this.sqliteProvider
      .getleadDetails(this.refId)
      .then((data) => {
        if (data.length != 0) {
          this.leadData = data[0];
          this.leadno = this.leadData.appUniqueId;
          this.cdate = this.convertdate(this.leadData.createdDate);
          this.firstname = this.leadData.firstname || this.leadData.enterName;
          this.janaCenterName = this.getBranch(
            localStorage.getItem('janaCenter')
          );
          this.janaLoanName = this.getLoanName(this.leadData.janaLoan);
          this.leadStatus = this.leadData.leadStatus;
          if (
            this.leadno &&
            this.cdate &&
            this.firstname &&
            this.janaCenterName &&
            this.janaLoanName
          ) {
            this.showTick = false;
          }
          this.showLead = true;
          this.loadingService.globalLodingDismiss();
        } else {
          this.showLead = false;
          this.loadingService.globalLodingDismiss();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  convertdate(str: string) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('-');
    //alert([day, mnth, date.getFullYear()].join("-"));
  }

  getCibilCheckedDetails() {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        if (data[0].cibilCheckStat == '1') {
          this.submitDisable = true;
        } else {
          this.submitDisable = false;
        }
      }
    });
  }

  getproducts() {
    // let productType = localStorage.getItem('loan');
    this.sqliteProvider.getAllProductValues().then((data) => {
      this.pdt_master = data;
    });
  }

  getLoanName(janaLoan) {
    let prdType = this.pdt_master.find((f) => {
      return f.prdCode === janaLoan;
    });
    return prdType.prdDesc;
  }

  getBranch(branch) {
    let branches = this.org_master.find((f) => {
      return f.OrgBranchCode === branch;
    });
    return branches.OrgName;
  }
}
