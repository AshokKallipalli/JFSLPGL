import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage {
  userType: any;
  promoterProofData: any;
  entityProofData: any;
  noData: any;
  fieldDisable: boolean = false;
  public status = '';

  id: any;
  refId: any;

  idProof = false;
  entityProof = false;

  unregisterBackButtonAction: any;
  leadId: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    private modalCtrl: ModalController,
    public platform: Platform,
    public alertCtrl: AlertController,
    public globFunc: GlobalService,
    public alertService: CustomAlertControlService
  ) {
    let submitstatus = this.navParams.get('submitstatus');
    if (submitstatus == true) {
      this.fieldDisable = true;
    }
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.sqliteProvider.getPersonalDetails(this.refId, this.id).then((data) => {
      console.log(data);
      if (data.length > 0) {
        this.leadId = data[0].coAppGuaId;
      }
    });
    if (this.navParams.get('ID_proof')) {
      let prooftype = this.navParams.get('ID_proof');
      if (prooftype == 'ProofPromoter') {
        this.idProof = true;
        this.getIdProofDetails();
      } else {
        console.log('Proof Type Not Recived in modal.');
      }
    }
    this.userType = this.navParams.get('userType');
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

  closeModal() {
    this.modalCtrl.dismiss(this.status);
  }

  getIdProofDetails() {
    this.sqliteProvider
      .getPromoterProofDetails(this.refId, this.id)
      .then((data) => {
        //alert("getIdProofDetails: " + JSON.stringify(data));
        this.promoterProofData = data;
        if (this.promoterProofData.length > 0) {
          this.noData = false;
        } else {
          this.noData = true;
        }
      })
      .catch((Error) => {
        console.log(Error);
      });
  }

  passDetails(value, index) {
    value.index = index;
    this.modalCtrl.dismiss(value);
  }
  docNames = {
    'DRIVING LICENSE': 'licence',
    PASSPORT: 'passport',
    'VOTER ID': 'voterid',
    'PAN CARD': 'pan',
  };
  async deleteData(proof) {
    if (this.fieldDisable) {
      this.alertService.showAlert('Alert!', 'Unable to Delete Document.');
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
              this.getIdProofDetails();
            },
          },
          {
            text: 'yes',
            handler: () => {
              // console.log("u r click yes");
              if (this.navParams.get('ID_proof') == 'ProofPromoter') {
                this.sqliteProvider
                  .getKarzaData(this.leadId, this.docNames[proof.proofName])
                  .then((secKycCheck) => {
                    if (secKycCheck.length > 0) {
                      if (secKycCheck[0].karzaCheck == 'Y') {
                        this.sqliteProvider
                          .removeProofData({
                            name: 'ProofPromoter',
                            refId: proof.refId,
                            id: proof.id,
                            proofid: proof.pproofId,
                          })
                          .then((_) => {
                            this.sqliteProvider.removeSecondKycData(
                              this.leadId,
                              this.docNames[proof.proofName]
                            );
                            this.getIdProofDetails();
                            this.status = 'proofDelete';
                          });
                      } else {
                        this.alertService.showAlert(
                          'Alert!',
                          "We couldn't able to delete first kyc validation!"
                        );
                      }
                    } else {
                      this.sqliteProvider
                        .getPromoterProofDetails(proof.refId, proof.id)
                        .then((kycLength) => {
                          if (kycLength.length > 0) {
                            this.sqliteProvider
                              .removeProofData({
                                name: 'ProofPromoter',
                                refId: proof.refId,
                                id: proof.id,
                                proofid: proof.pproofId,
                              })
                              .then((_) => {
                                this.getIdProofDetails();
                                this.status = 'proofDelete';
                              });
                          }
                        });
                    }
                  });
              } else if (this.navParams.get('ID_proof') == 'ProofEntity') {
                this.sqliteProvider
                  .removeProofData({
                    name: 'ProofEntity',
                    refId: proof.refId,
                    id: proof.id,
                    proofid: proof.eproofId,
                  })
                  .then((_) => {
                    this.status = 'promoterDelete';
                  });
              }
            },
          },
        ],
      });
      alertq.present();
    }
  }
}
