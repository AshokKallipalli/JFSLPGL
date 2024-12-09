import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { ModalController, NavParams } from '@ionic/angular';
import { ModalPage } from 'src/app/pages/modal/modal.page';
import { PicproofPage } from 'src/app/pages/picproof/picproof.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-proof',
  templateUrl: './proof.component.html',
  styleUrls: ['./proof.component.scss'],
})
export class ProofComponent implements OnInit {
  aadhar: boolean = false;
  textType: any = 'text';
  aadharBtn: string = 'Vault';
  vaultDisable: boolean = false;
  vaultStatus: string = '';
  janaRefId: boolean = false;
  proofName: any;
  proofUserData: any;
  mandCheck: any;
  appliType: string;
  mandDocs: any = [];
  mandDocsCount: any;
  today: any = new Date();
  maxdate: any;
  mindate: any;

  submitstatus: any;
  entityDatalen: any = 0;
  promoterDatalen: any = 0;
  entiexpiry: any;
  promoexpiry: any;
  promodoi: any;
  proofImglen: any = 0;
  proofImgs = [];
  eproofImglen: any = 0;
  eproofImgs = [];
  public promoDoc;
  public entiDoc;
  proofType: any;
  entidoi: any;
  docs_master: any;
  docName: any;
  bdocs_master: any;
  bdocName: any;
  DocumentCode: any;
  bDocumentCode: any;
  docslist_master: any;
  bdocslist_master: any;

  refId: any;
  id: any;
  pproofId: any;
  eproofId: any;

  proofData: FormGroup;
  busiProofData: FormGroup;

  getPromodata: any;
  getEntitydata: any;
  userType: any;

  //SaveTick
  PromoterTick: boolean = false;
  EntityTick: boolean = false;
  submitDisable: boolean = false;
  esubmitDisable: boolean = false;
  IDTypeDisable: boolean = false;
  eIDTypeDisable: boolean = false;
  idNumDisable: boolean = false;
  expdate: boolean = false;
  eexpdate: boolean = false;
  documentDetails: boolean = false;
  entidocumentDetails: boolean = false;
  //auth: boolean = true;
  master_busiProofs: any;
  master_idProofs: any;

  statId: any;
  isPreApprovedLead: any;

  selectOptions = {
    cssClass: 'remove-ok',
  };
  customPopoverOptions = {
    cssClass: 'custom-popover',
  };
  @Output() saveStatus = new EventEmitter();
  save: any = [];
  custType: any;
  showBusiness = false;
  MFIExposureAmount: any;
  aepsTypes: any = [
    { code: 'Y', name: 'Yes' },
    { code: 'N', name: 'No' },
  ];
  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public network: Network,
    public master: RestService,
    public sqlSupport: SquliteSupportProviderService,
    public alertService: CustomAlertControlService
  ) {
    this.userType = this.globalData.getborrowerType();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.custType = this.globalData.getCustType();

    this.globalData.eventValue.subscribe((data) => {
      this.getDocumentValue(data);
    });

    console.log(localStorage.getItem('product'));

    if (this.userType == 'G' || this.userType == 'C') {
      this.getDocumentValue();
      this.userType == 'C' ? (this.showBusiness = false) : '';
    }

    // if (this.userType == 'C') {
    //   this.showBusiness = false;
    // }

    // this.globalData.emitEvents.subscribe((value: any) => {
    //   console.log(value, "loanPurpose emitted");
    //   let val = value.value.code ? value.value : value
    //   if (this.userType == 'A' && (val == 2 || val == 3 || val == 14)) {
    //     this.showBusiness = true;
    //   } else {
    //     this.showBusiness = false;
    //   }
    // });

    this.getCibilCheckedDetails();

    this.getIdProofLength();
    if (this.refId === '' || this.refId === undefined || this.refId === null) {
      this.refId = '';
      // alert("save proof data");
    } else {
    }
    this.proofType = 'ProofPromoter';
    this.proofData = this.formBuilder.group({
      promoIDType: ['', Validators.compose([Validators.required])],
      promoDoc: [''],
      promoIDRef: ['', Validators.required],
      promoexpiry: [''],
      aepsStatus: [''],
    });

    if (this.navParams.get('fieldDisable')) {
      this.submitDisable = true;
      this.esubmitDisable = true;
    }
    this.calldate();
    // this.callmaxdate();
  }

  ngOnInit() {
    // let root = this.viewCtrl.instance.navCtrl._app._appRoot;
    document.addEventListener('click', function (event) {
      let btn = <HTMLLIElement>(
        document.querySelector('.remove-ok .alert-button-group')
      );
      let target = <HTMLElement>event.target;
      if (btn && target.className == 'alert-radio-label') {
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

  proofpromotersave(value) {
    try {
      if (this.aadhar && this.vaultStatus == 'N') {
        this.alertService.showAlert(
          'Alert!',
          'Please complete aadhar vault process!!!'
        );
      } else {
        this.globalData.globalLodingPresent('Please wait...');
        if (
          (this.showBusiness &&
            localStorage.getItem('Business') == 'businessAddSaved') ||
          (!this.showBusiness &&
            localStorage.getItem('Present') == 'presentAddSaved')
        ) {
          if (this.proofImgs.length > 0) {
            this.refId = this.globalData.getrefId();
            this.id = this.globalData.getId();
            this.sqliteProvider
              .getPromoterProofDetailsByProof(this.refId, value.promoIDRef)
              .then((proofData) => {
                if (proofData.length > 0) {
                  this.sqliteProvider
                    .getPromoterProofDetailsByProofID(
                      this.refId,
                      this.id,
                      value.promoIDType
                    )
                    .then((sameApp) => {
                      if (sameApp.length > 0) {
                        this.IDTypeDisable = false;
                        this.idNumDisable = false;
                        this.globalData.globalLodingDismiss();

                        this.updateProofImg();
                        this.clearpromo();
                      } else {
                        this.proofImgs = [];
                        this.proofImglen = this.proofImgs.length;
                        this.proofData.get('promoIDType').setValue('');
                        this.proofData.get('promoIDRef').setValue('');
                        this.proofData.get('promoexpiry').setValue('');
                        this.proofData.get('aepsStatus').setValue('');
                        this.aadhar = false;
                        this.textType = 'text';
                        this.vaultDisable = false;
                        this.janaRefId = false;
                        this.vaultStatus = '';
                        this.globalData.globalLodingDismiss();
                        this.alertService.showAlert(
                          'Alert',
                          'Same ID proof is already captured in the same application!!!'
                        );
                      }
                    })
                    .catch((error) => {
                      this.sqlSupport.insertErrorLog(
                        error.stack,
                        'ProofComponent-proofpromotersave-getPromoterProofDetailsByProofID'
                      );
                    });
                } else {
                  this.sqliteProvider
                    .addPromotersProofDetails(
                      this.refId,
                      this.id,
                      value,
                      this.vaultStatus,
                      this.proofName,
                      this.pproofId
                    )
                    .then((data) => {
                      if (
                        this.pproofId === '' ||
                        this.pproofId === null ||
                        this.pproofId === undefined
                      ) {
                        this.pproofId = data.insertId;
                        this.uploadimg();
                        this.globalData.globalLodingDismiss();
                        if (this.userType == 'A') {
                          this.alertService.showAlert(
                            'Alert!',
                            'Borrower Proof Details Added Successfully'
                          );
                        } else if (this.userType == 'G') {
                          this.alertService.showAlert(
                            'Alert!',
                            'Guarantor Proof Details Added Successfully'
                          );
                        } else if (this.userType == 'C') {
                          this.alertService.showAlert(
                            'Alert!',
                            'Co-Applicant Proof Details Added Successfully'
                          );
                        } else {
                          console.log('No user type Recived');
                        }
                        this.getIdProofLength();
                        this.IDTypeDisable = false;
                        this.vaultStatus = '';
                        this.janaRefId = false;
                      } else {
                        this.updateProofImg();
                      }
                      this.clearpromo();
                    })
                    .catch((error) => {
                      console.log('Failed!');
                      this.globalData.globalLodingDismiss();
                      this.alertService.showAlert('Alert!', 'Failed!');
                      this.sqlSupport.insertErrorLog(
                        error.stack,
                        'ProofComponent-proofpromotersave-addPromotersProofDetails'
                      );
                    });
                }
              })
              .catch((error) => {
                this.sqlSupport.insertErrorLog(
                  error.stack,
                  'ProofComponent-proofpromotersave'
                );
              });
          } else {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert('Alert!', 'Please Add Proof Images.');
          }
        } else {
          this.globalData.globalLodingDismiss();
          if (this.showBusiness) {
            this.alertService.showAlert(
              'Alert!',
              'Must Save Business Address Details'
            );
          } else {
            this.alertService.showAlert(
              'Alert!',
              'Must Save Present Address Details'
            );
          }
        }
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-proofpromotersave'
      );
    }
  }

  async viewIdProof(value?) {
    try {
      const modal = await this.modalCtrl.create({
        component: ModalPage,
        componentProps: {
          ID_proof: this.proofType,
          userType: this.userType,
          submitstatus: this.submitDisable,
        },
      });
      modal.present();
      modal.onDidDismiss().then(async (proofvalue: any) => {
        let kycdata = proofvalue.data;
        if (value == 'proofDelete') {
          this.clearpromo();
          this.getIdProofLength();
          this.proofImgs = [];
          this.proofImglen = 0;
          this.IDTypeDisable = false;
          this.aadhar = false;
          this.vaultDisable = false;
          this.idNumDisable = false;
          this.vaultStatus = '';
        } else if (value == 'promoterDelete') {
          this.eproofImgs = [];
          this.eproofImglen = 0;
          this.eIDTypeDisable = false;
        } else if (kycdata) {
          switch (this.proofType) {
            case 'ProofPromoter':
              this.clearpromo();
              if (
                kycdata.promoexpiry == null ||
                kycdata.promoexpiry == 'null'
              ) {
                kycdata.promoexpiry = '';
              }
              this.proofData.get('promoIDType').setValue(kycdata.promoIDType);
              this.promoDoc = JSON.parse(kycdata.promoDoc);
              this.proofData.get('promoIDRef').setValue(kycdata.promoIDRef);
              this.proofData.get('promoexpiry').setValue(kycdata.promoexpiry);
              if (
                kycdata.proofName == 'AADHAR CARD' ||
                kycdata.proofName == 'AADHAR'
              ) {
                this.proofData.get('aepsStatus').setValue(kycdata.aepsStatus);
                this.aadhar = true;
              } else {
                this.aadhar = false;
              }
              this.IDTypeDisable = true;
              this.idNumDisable = true;
              this.textType = 'text';

              if (kycdata.promoexpiry) {
                this.expdate = true;
              } else {
                this.expdate = false;
              }
              this.pproofId = kycdata.pproofId;
              this.vaultStatus = kycdata.vaultStatus;
              this.sqliteProvider
                .getpromoterproofImages(this.pproofId)
                .then((data) => {
                  this.proofImgs = [];
                  this.proofImgs = data;
                  this.proofImglen = data.length;
                  this.getIdProofLength();
                })
                .catch((Error) => {
                  console.log(Error);
                });
              break;
          }
        } else {
          //this.getPromoterProofDetails();
          switch (this.proofType) {
            case 'ProofPromoter':
              this.getIdProofLength();
              break;
            case 'ProofEntity':
              break;
          }
        }
      });
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'ProofComponent-viewIdProof');
    }
  }

  clearpromo() {
    try {
      this.pproofId = '';
      this.proofData = this.formBuilder.group({
        promoIDType: '',
        promoDoc: '',
        promoIDRef: '',
        promoexpiry: '',
        aepsStatus: '',
      });
      // this.idNumDisable = false;
      this.promoDoc = '';
      //this.promoexpiry = "";
      this.proofData = this.formBuilder.group({
        promoIDType: ['', Validators.compose([Validators.required])],
        promoDoc: [''],
        promoIDRef: [
          '',
          Validators.compose([
            Validators.pattern('[a-zA-Z0-9]*'),
            Validators.required,
          ]),
        ],
        promoexpiry: [''],
        aepsStatus: [''],
      });
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'ProofComponent-viewIdProof');
    }
  }

  getDocumentValue(value?) {
    try {
      let prdCode = localStorage.getItem('product')
        ? localStorage.getItem('product')
        : value;
      let custType = this.globalData.getCustomerType();
      let entityStat;
      if (custType == '1') {
        entityStat = 'N';
        this.sqliteProvider
          .getDocumentsByIndividualPrdCode(prdCode, entityStat)
          .then((data) => {
            this.docs_master = data;
            this.callmaxdate();
          })
          .catch((error) => {
            this.sqlSupport.insertErrorLog(
              error.stack,
              'ProofComponent-getDocumentValue-getDocumentsByIndividualPrdCode'
            );
          });
      } else {
        entityStat = 'Y';
        this.sqliteProvider
          .getDocumentsByPrdCode(prdCode)
          .then((data) => {
            this.docs_master = data;
            this.callmaxdate();
          })
          .catch((error) => {
            this.sqlSupport.insertErrorLog(
              error.stack,
              'ProofComponent-getDocumentValue-getDocumentsByPrdCode'
            );
          });
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'ProofComponent-viewIdProof');
    }
  }

  getDocuments(docCode) {
    docCode = docCode.detail.value;
    try {
      this.refId = this.globalData.getrefId();
      this.id = this.globalData.getId();
      this.callmaxdate(docCode);
      if (this.custType == 'E') {
        this.idNumDisable = false;
        this.sqliteProvider
          .checkProofDetails(docCode, this.id)
          .then((data) => {
            if (data.length > 0) {
              this.proofData.get('promoIDType').setValue('');
              this.proofData.get('promoIDRef').setValue('');
              this.aadhar = false;
              this.textType = 'text';
              this.vaultDisable = false;
              this.janaRefId = false;
              this.vaultStatus = '';
              setTimeout(() => {
                this.alertService.showAlert(
                  'Alert!',
                  'This Kyc Document Already Exists!'
                );
              }, 400);
            } else {
              this.sqliteProvider
                .selectExData(this.globalData.getURN())
                .then((data) => {
                  this.proofImgs = [];
                  this.proofImglen = 0;
                  this.getDocumentsValidator(docCode, data);
                })
                .catch((error) => {
                  this.sqlSupport.insertErrorLog(
                    error.stack,
                    'ProofComponent-getDocuments-selectExData'
                  );
                });
            }
          })
          .catch((error) => {
            this.sqlSupport.insertErrorLog(
              error.stack,
              'ProofComponent-getDocuments-checkProofDetails'
            );
          });
      } else {
        this.sqliteProvider
          .checkProofDetails(docCode, this.id)
          .then((data) => {
            if (data.length > 0) {
              this.proofData.get('promoIDType').setValue('');
              this.proofData.get('promoIDRef').setValue('');
              this.aadhar = false;
              this.textType = 'text';
              this.vaultDisable = false;
              this.janaRefId = false;
              this.vaultStatus = '';
              setTimeout(() => {
                this.alertService.showAlert(
                  'Alert!',
                  'This Kyc Document Already Exists!'
                );
              }, 400);
            } else {
              this.proofImgs = [];
              this.proofImglen = 0;
              if (
                this.getDocumentName(docCode) == 'DRIVING LICENSE' ||
                this.getDocumentName(docCode) == 'DRIVING LISENCE'
              ) {
                // DL
                this.getStoredDrivingLicense(docCode);
              } else if (this.getDocumentName(docCode) == 'PASSPORT') {
                // Pasport
                this.getStoredPassport(docCode);
              } else if (
                this.getDocumentName(docCode) == 'PAN CARD' ||
                this.getDocumentName(docCode) == 'PAN'
              ) {
                // PAN
                this.getstoredPAN(docCode);
              } else if (
                this.getDocumentName(docCode) == 'AADHAR' ||
                this.getDocumentName(docCode) == 'AADHAR CARD'
              ) {
                // aadhar
                if (this.userType == 'A') {
                  // this.sqliteProvider.getAadharNum(this.refId, this.id).then(data => {
                  this.sqlSupport
                    .getEKYCDetails(localStorage.getItem('leadId'))
                    .then((data) => {
                      if (data.length > 0) {
                        if (
                          data[0].janaid != '' &&
                          data[0].janaid != undefined &&
                          data[0].janaid != null
                        ) {
                          this.idNumDisable = true;
                          this.aadhar = true;
                          this.expdate = false;
                          this.janaRefId = true;
                          this.proofName = this.getDocumentName(docCode);
                          // this.proofData.controls.promoIDRef.setValue(data[0].janaRefId);
                          this.proofData.controls.promoIDRef.setValue(
                            data[0].janaid
                          );
                          this.proofData.controls.aepsStatus.setValue(
                            data[0].aepsFlag
                          );
                          // this.vaultStatus = data[0].vaultStatus;
                          this.vaultStatus = 'Y';
                          this.proofData.controls.promoIDRef.setValidators(
                            Validators.compose([
                              Validators.maxLength(12),
                              Validators.minLength(12),
                              Validators.pattern('[0-9]{12}'),
                              Validators.required,
                            ])
                          );
                          this.proofData.controls.promoexpiry.clearValidators();
                          this.proofData.controls.promoIDRef.updateValueAndValidity();
                          this.proofData.controls.promoexpiry.updateValueAndValidity();
                          this.proofData.controls.aepsStatus.setValidators(
                            Validators.required
                          );
                          this.proofData.controls.aepsStatus.updateValueAndValidity();
                        } else {
                          this.idNumDisable = false;
                          this.aadhar = true;
                          this.expdate = false;
                          this.janaRefId = false;
                          this.vaultDisable = false;
                          this.proofName = this.getDocumentName(docCode);
                          this.proofData.controls.promoIDRef.setValue('');
                          this.vaultStatus = 'N';
                          this.textType = 'password';
                          this.proofData.controls.promoIDRef.setValidators(
                            Validators.compose([
                              Validators.maxLength(12),
                              Validators.minLength(12),
                              Validators.pattern('[0-9]{12}'),
                              Validators.required,
                            ])
                          );
                          this.proofData.controls.promoexpiry.clearValidators();
                          this.proofData.controls.promoIDRef.updateValueAndValidity();
                          this.proofData.controls.promoexpiry.updateValueAndValidity();
                          this.proofData.controls.aepsStatus.setValidators(
                            Validators.required
                          );
                          this.proofData.controls.aepsStatus.updateValueAndValidity();
                        }
                      } else {
                        this.getStoredAadhar(docCode);
                      }
                    })
                    .catch((error) => {
                      this.sqlSupport.insertErrorLog(
                        error.stack,
                        'ProofComponent-getDocuments-getEKYCDetails'
                      );
                    });
                } else {
                  this.sqlSupport
                    .getEKYCDetails(localStorage.getItem('leadId'))
                    .then((ekyc) => {
                      if (ekyc.length > 0) {
                        if (ekyc[0].janaid) {
                          this.idNumDisable = true;
                          this.aadhar = true;
                          this.expdate = false;
                          this.janaRefId = true;
                          this.proofName = this.getDocumentName(docCode);
                          this.proofData.controls.promoIDRef.setValue(
                            ekyc[0].janaid
                          );
                          this.proofData.controls.aepsStatus.setValue(
                            ekyc[0].aepsFlag
                          );
                          this.vaultStatus = 'Y';
                          this.proofData.controls.promoIDRef.setValidators(
                            Validators.compose([
                              Validators.maxLength(12),
                              Validators.minLength(12),
                              Validators.pattern('[0-9]{12}'),
                              Validators.required,
                            ])
                          );
                          this.proofData.controls.promoexpiry.clearValidators();
                          this.proofData.controls.promoIDRef.updateValueAndValidity();
                          this.proofData.controls.promoexpiry.updateValueAndValidity();
                          this.proofData.controls.aepsStatus.setValidators(
                            Validators.required
                          );
                          this.proofData.controls.aepsStatus.updateValueAndValidity();
                        } else {
                          this.idNumDisable = false;
                          this.aadhar = true;
                          this.vaultStatus = 'N';
                          this.expdate = false;
                          this.proofName = this.getDocumentName(docCode);
                          this.proofData.controls.promoIDRef.setValue('');
                          this.proofData.controls.promoIDRef.setValidators(
                            Validators.compose([
                              Validators.maxLength(12),
                              Validators.minLength(12),
                              Validators.pattern('[0-9]{12}'),
                              Validators.required,
                            ])
                          );
                          this.proofData.controls.promoexpiry.clearValidators();
                          this.proofData.controls.promoIDRef.updateValueAndValidity();
                          this.proofData.controls.promoexpiry.updateValueAndValidity();
                          this.proofData.controls.aepsStatus.setValidators(
                            Validators.required
                          );
                          this.proofData.controls.aepsStatus.updateValueAndValidity();
                        }
                      } else {
                        this.getStoredAadhar(docCode);
                        // this.idNumDisable = false;
                        // this.aadhar = true;
                        // this.vaultStatus = 'N';
                        // this.expdate = false;
                        // this.proofName = this.getDocumentName(docCode);
                        // this.proofData.controls.promoIDRef.setValue('');
                        // this.proofData.controls.promoIDRef.setValidators(Validators.compose([Validators.maxLength(12), Validators.minLength(12), Validators.pattern('[0-9]{12}'), Validators.required]));
                        // this.proofData.controls.promoexpiry.clearValidators();
                        // this.proofData.controls.promoIDRef.updateValueAndValidity();
                        // this.proofData.controls.promoexpiry.updateValueAndValidity();
                      }
                    })
                    .catch((error) => {
                      this.sqlSupport.insertErrorLog(
                        error.stack,
                        'ProofComponent-getDocuments-getEKYCDetails'
                      );
                    });
                }
              } else if (this.getDocumentName(docCode) == 'VOTER ID') {
                // voter
                this.getStoredVoterId(docCode);
              } else if (this.getDocumentName(docCode) == 'GSTIN') {
                this.sqliteProvider
                  .getEntityDetails(this.refId, this.id)
                  .then((data) => {
                    if (data.length > 0) {
                      if (
                        data[0].gst != '' &&
                        data[0].gst != undefined &&
                        data[0].gst != null
                      ) {
                        this.proofName = this.getDocumentName(docCode);
                        this.aadhar = false;
                        this.textType = 'text';
                        this.vaultDisable = false;
                        this.janaRefId = false;
                        this.vaultStatus = '';
                        this.proofData.controls.promoIDRef.setValue(
                          data[0].gst
                        );
                        this.proofData.controls.promoIDRef.setValidators(
                          Validators.compose([
                            Validators.maxLength(30),
                            Validators.minLength(10),
                            Validators.required,
                          ])
                        );
                        this.proofData.controls.promoexpiry.clearValidators();
                        this.proofData.controls.promoIDRef.updateValueAndValidity();
                        this.proofData.controls.promoexpiry.updateValueAndValidity();
                        this.proofData.controls.aepsStatus.clearValidators();
                        this.proofData.controls.aepsStatus.updateValueAndValidity();
                        this.idNumDisable = true;
                        this.expdate = false;
                      } else {
                        this.idNumDisable = false;
                        this.expdate = false;
                        this.aadhar = false;
                        this.textType = 'text';
                        this.vaultDisable = false;
                        this.janaRefId = false;
                        this.vaultStatus = '';
                        this.proofName = this.getDocumentName(docCode);
                        this.proofData.controls.promoIDRef.setValue('');
                        this.proofData.controls.promoIDRef.setValidators(
                          Validators.compose([
                            Validators.maxLength(30),
                            Validators.minLength(10),
                            Validators.required,
                          ])
                        );
                        this.proofData.controls.promoexpiry.clearValidators();
                        this.proofData.controls.promoIDRef.updateValueAndValidity();
                        this.proofData.controls.promoexpiry.updateValueAndValidity();
                        this.proofData.controls.aepsStatus.clearValidators();
                        this.proofData.controls.aepsStatus.updateValueAndValidity();
                      }
                    }
                  });
              } else if (this.getDocumentName(docCode) == 'CIN') {
                this.sqliteProvider
                  .getEntityDetails(this.refId, this.id)
                  .then((data) => {
                    if (data.length > 0) {
                      if (
                        data[0].cin != '' &&
                        data[0].cin != undefined &&
                        data[0].cin != null
                      ) {
                        this.proofName = this.getDocumentName(docCode);
                        this.aadhar = false;
                        this.textType = 'text';
                        this.vaultDisable = false;
                        this.janaRefId = false;
                        this.vaultStatus = '';
                        this.proofData.controls.promoIDRef.setValue(
                          data[0].cin
                        );
                        this.proofData.controls.promoIDRef.setValidators(
                          Validators.compose([
                            Validators.maxLength(30),
                            Validators.minLength(10),
                            Validators.pattern('^[a-zA-Z0-9]*'),
                            Validators.required,
                          ])
                        );
                        this.proofData.controls.promoexpiry.clearValidators();
                        this.proofData.controls.promoIDRef.updateValueAndValidity();
                        this.proofData.controls.promoexpiry.updateValueAndValidity();
                        this.proofData.controls.aepsStatus.clearValidators();
                        this.proofData.controls.aepsStatus.updateValueAndValidity();
                        this.idNumDisable = true;
                        this.expdate = false;
                      } else {
                        this.idNumDisable = false;
                        this.expdate = false;
                        this.aadhar = false;
                        this.textType = 'text';
                        this.vaultDisable = false;
                        this.janaRefId = false;
                        this.vaultStatus = '';
                        this.proofName = this.getDocumentName(docCode);
                        this.proofData.controls.promoIDRef.setValue('');
                        this.proofData.controls.promoIDRef.setValidators(
                          Validators.compose([
                            Validators.maxLength(30),
                            Validators.minLength(10),
                            Validators.pattern('^[a-zA-Z0-9]*'),
                            Validators.required,
                          ])
                        );
                        this.proofData.controls.promoexpiry.clearValidators();
                        this.proofData.controls.promoIDRef.updateValueAndValidity();
                        this.proofData.controls.promoexpiry.updateValueAndValidity();
                        this.proofData.controls.aepsStatus.clearValidators();
                        this.proofData.controls.aepsStatus.updateValueAndValidity();
                      }
                    }
                  });
              } else if (this.getDocumentName(docCode) == 'NREGA') {
                this.getStoredNerga(docCode);
              } else {
                this.idNumDisable = false;
                this.expdate = false;
                this.aadhar = false;
                this.textType = 'text';
                this.vaultDisable = false;
                this.janaRefId = false;
                this.vaultStatus = '';
                this.proofName = this.getDocumentName(docCode);
                this.proofData.controls.promoIDRef.setValue('');
                this.proofData.controls.promoIDRef.setValidators(
                  Validators.compose([
                    Validators.maxLength(20),
                    Validators.minLength(10),
                    Validators.pattern('[a-zA-Z0-9]*'),
                    Validators.required,
                  ])
                );
                this.proofData.controls.promoexpiry.clearValidators();
                this.proofData.controls.promoIDRef.updateValueAndValidity();
                this.proofData.controls.promoexpiry.updateValueAndValidity();
                this.proofData.controls.promoexpiry.clearValidators();
                this.proofData.controls.promoexpiry.updateValueAndValidity();
                this.proofData.controls.aepsStatus.clearValidators();
                this.proofData.controls.aepsStatus.updateValueAndValidity();
              }

              // if (docCode == '1556646') {
              //   // aadhar
              //   this.proofData.controls.promoIDRef.setValidators(Validators.compose([Validators.pattern('[0-9]*'), Validators.maxLength(12), Validators.required]));
              // } else if (docCode == '1556649') {
              //   // DL
              //   this.proofData.controls.promoIDRef.setValidators(Validators.compose([Validators.pattern(/^(([A-Z]{2}[0-9]{2}))  $/), Validators.maxLength(12), Validators.required]));
              // // ^(([A-Z]{2}[0-9]{2})( )|([A-Z]{2}-[0-9]{2}))((19|20)[0-9][0-9])[0-9]{7}$
              // } else if (docCode == '1556652') {
              //   //pan
              // } else if (docCode == '1556653') {
              //   //Pass
              // } else if (docCode == '1556655') {
              //   //voter
              // } else {
              //   // others
              // }
            }
          })
          .catch((error) => {
            this.sqlSupport.insertErrorLog(
              error.stack,
              'ProofComponent-getDocuments-checkProofDetails'
            );
          });
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'ProofComponent-viewIdProof');
    }
  }

  async showpicmaodal(value) {
    try {
      if (value == 'idproof') {
        const modal = await this.modalCtrl.create({
          component: PicproofPage,
          componentProps: {
            proofpics: this.proofImgs,
            submitstatus: this.submitDisable,
          },
        });
        await modal.present();
        await modal.onDidDismiss().then(async (data: any) => {
          this.proofImgs = [];
          this.proofImgs = data.data;
          this.proofImglen = data.data.length;
        });
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-showpicmaodal'
      );
    }
  }

  uploadimg() {
    for (let i = 0; i < this.proofImgs.length; i++) {
      this.sqliteProvider
        .addpromoterproofImages(
          this.refId,
          this.id,
          this.proofImgs[i].imgpath,
          this.pproofId
        )
        .then((data) => {
          // console.log("promoter image insert" + data);
        })
        .catch((Error) => {
          console.log('Failed!' + Error);
          this.alertService.showAlert('Alert!', 'Failed!');
        })
        .catch((error) => {
          this.sqlSupport.insertErrorLog(
            error.stack,
            'ProofComponent-uploadimg-addpromoterproofImages'
          );
        });
      //alert(i);
    }
    this.proofImgs = [];
    this.proofImglen = 0;
  }

  updateimg(upid) {
    //alert(upid);
    this.sqliteProvider
      .removepromoterproofImages(upid)
      .then((data) => {
        // console.log("promoter image delete" + data);
        //alert(upid);
        for (let i = 0; i < this.proofImgs.length; i++) {
          this.sqliteProvider
            .addpromoterproofImages(
              this.refId,
              this.id,
              this.proofImgs[i].imgpath,
              upid
            )
            .then((data) => {
              // console.log("promoter image insert" + data);
            })
            .catch((error) => {
              console.log('Failed!' + error);
              this.alertService.showAlert('Alert!', 'Failed!');
              this.sqlSupport.insertErrorLog(
                error.stack,
                'ProofComponent-updateimg-addpromoterproofImages'
              );
            });
          //alert(i);
        }
        this.proofImgs = [];
        this.proofImglen = 0;
      })
      .catch((error) => {
        console.log('Failed!' + Error);
        this.alertService.showAlert('Alert!', 'Failed!');
        this.sqlSupport.insertErrorLog(
          error.stack,
          'ProofComponent-updateimg-removepromoterproofImages'
        );
      });
  }

  getIdProofLength() {
    this.sqliteProvider
      .getPromoterProofDetails(this.refId, this.id)
      .then((data) => {
        this.proofUserData = data;
        this.promoterDatalen = data.length;
        if (this.promoterDatalen > 0) {
          this.mandDocsCheckcount(this.promoterDatalen);
          // this.PromoterTick = true;
          // this.saveStatus.emit('idproofTick');
          // localStorage.setItem('Proof', 'proofSaved');
          // this.events.publish('lead', "proof");
        } else {
          this.PromoterTick = false;
          this.saveStatus.emit('noIdProof');
          // this.events.publish('lead', "proof");
        }
        // this.events.publish('lead', "proof");
      })
      .catch((error) => {
        console.log(error);
        this.sqlSupport.insertErrorLog(
          error.stack,
          'ProofComponent-getIdProofLength-getPromoterProofDetails'
        );
      });
  }

  aadharValidation() {
    try {
      if (this.proofData.controls.promoIDRef.value.length == 12) {
        let str = this.proofData.controls.promoIDRef.value;
        str = str.split('');
        if (
          str[0] == str[1] &&
          str[0] == str[2] &&
          str[0] == str[3] &&
          str[0] == str[4] &&
          str[0] == str[5] &&
          str[0] == str[6] &&
          str[0] == str[7] &&
          str[0] == str[8] &&
          str[0] == str[9] &&
          str[0] == str[10] &&
          str[0] == str[11]
        ) {
          this.proofData.controls.promoIDRef.setValue('');
          this.alertService.showAlert(
            'Alert!',
            'Given Aadhar number is not valid!'
          );
        }
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-aadharValidation'
      );
    }
  }

  toUpperCase(frmGrpName, ctrlName) {
    try {
      this[frmGrpName].controls[ctrlName].setValue(
        this[frmGrpName].controls[ctrlName].value.toUpperCase()
      );
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'ProofComponent-toUpperCase');
    }
  }

  getCibilCheckedDetails() {
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.sqliteProvider
      .getSubmitDetails(this.refId, this.id)
      .then((data) => {
        if (data.length > 0) {
          this.statId = data[0].statId;
          this.submitstatus = data[0].submitStat;
          if (data[0].cibilCheckStat == '1' || data[0].himarkCheckStat == '1') {
            this.submitDisable = true;
            this.esubmitDisable = true;
          } else {
            this.submitDisable = false;
            this.esubmitDisable = false;
          }
        }
      })
      .catch((error) => {
        console.log(error);
        this.sqlSupport.insertErrorLog(
          error.stack,
          'ProofComponent-getCibilCheckedDetails-getSubmitDetails'
        );
      });
  }

  calldate() {
    try {
      let dd = this.today.getDate();
      let mm = this.today.getMonth() + 1; //January is 0!
      let yyyy = this.today.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      let mindate = yyyy + '-' + mm + '-' + dd;
      this.mindate = mindate;
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'ProofComponent-calldate');
    }
  }

  callmaxdate(docCode?) {
    try {
      let dd = this.today.getDate();
      let mm = this.today.getMonth() + 1; //January is 0!
      // let yyyy = this.today.getFullYear() + 20;
      let yyyy;
      if (
        this.getDocumentName(docCode) == 'DRIVING LICENSE' ||
        this.getDocumentName(docCode) == 'DRIVING LISENCE'
      ) {
        yyyy = this.today.getFullYear() + 20; //maximum expiry year for driving license is 20 years.
      } else if (this.getDocumentName(docCode) == 'PASSPORT') {
        yyyy = this.today.getFullYear() + 10; //maximum expiry year for passport is 10 years.
      } else {
        yyyy = this.today.getFullYear() + 20;
      }
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      let maxdate = yyyy + '-' + mm + '-' + dd;
      this.maxdate = maxdate;
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'ProofComponent-calldate');
    }
  }

  clearpromoall() {
    try {
      this.pproofId = '';
      this.proofData = this.formBuilder.group({
        promoIDType: '',
        promoDoc: '',
        promoIDRef: '',
        promoexpiry: '',
        aepsStatus: '',
      });
      this.promoDoc = '';
      //this.promoexpiry = "";
      this.proofData = this.formBuilder.group({
        promoIDType: ['', Validators.compose([Validators.required])],
        promoDoc: [''],
        promoIDRef: [
          '',
          Validators.compose([
            Validators.pattern('[a-zA-Z0-9]*'),
            Validators.required,
          ]),
        ],
        promoexpiry: [''],
        aepsStatus: '',
      });
      this.proofImgs = [];
      this.proofImglen = 0;
      this.IDTypeDisable = false;
      // this.AdPanDisable = false;
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-clearpromoall'
      );
    }
  }

  getDocumentName(value: string) {
    try {
      if (value) {
        let selectedDocName = this.docs_master.find((f) => {
          return f.DocID === value;
        });
        return selectedDocName.DocDesc.toUpperCase();
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-getDocumentName'
      );
    }
  }

  mandDocsCheck() {
    try {
      this.mandCheck = '';
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
          this.mandDocs = data;
          this.mandDocsCount = data.length;
          for (let i = 0; i < this.mandDocs.length; i++) {
            this.sqliteProvider
              .getPromoterProofDetailsByProofID(
                this.refId,
                this.id,
                this.mandDocs[i].DocID
              )
              .then((data) => {
                if (data.length > 0) {
                  this.mandCheck = this.mandCheck + 'true ';
                } else {
                  this.mandCheck = this.mandCheck + 'false ';
                }
                if (i == this.mandDocs.length - 1) {
                  if (this.mandCheck.includes('false')) {
                    this.PromoterTick = false;
                    this.saveStatus.emit('noIdProof');
                  } else {
                    this.PromoterTick = true;
                    this.saveStatus.emit('idproofTick');
                    localStorage.setItem('Proof', 'proofSaved');
                    // this.events.publish('lead', "proof");
                  }
                }
              })
              .catch((error) => {
                console.log(error);
                this.sqlSupport.insertErrorLog(
                  error.stack,
                  'ProofComponent-mandDocsCheck-getMandDocumentsByPrdCode-getPromoterProofDetailsByProofID'
                );
              });
          }
        })
        .catch((error) => {
          console.log(error);
          this.sqlSupport.insertErrorLog(
            error.stack,
            'ProofComponent-mandDocsCheck-getMandDocumentsByPrdCode'
          );
        });
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-clearpromoall'
      );
    }
  }

  mandDocsCheckcount(docLength) {
    try {
      let manDocumentCount = 0;
      let custType = this.globalData.getCustomerType();
      console.log('Custype', custType);
      this.sqliteProvider.selectOrgin(this.refId).then((data) => {
        this.isPreApprovedLead = data[0].isPreApprovedLead;
      });
      this.sqliteProvider
        .getProductValuesCount(localStorage.getItem('product'))
        .then((data) => {
          if (data) {
            if (custType == '1') {
              if (this.userType == 'A') {
                manDocumentCount = +data[0].prdAppDocCount;
                this.sqliteProvider
                  .getBasicDetails(this.refId, this.id)
                  .then((data) => {
                    this.MFIExposureAmount = data[0].loanAmount;
                  });
              } else if (this.userType == 'G') {
                manDocumentCount = +data[0].prdGuaDocCount;
              } else if (this.userType == 'C') {
                manDocumentCount = +data[0].prdCoappDocCount;
              }
            } else {
              manDocumentCount = +data[0].prdEntityDocCount;
            }
            if (docLength >= manDocumentCount) {
              this.PromoterTick = true;
              this.saveStatus.emit('idproofTick');
              localStorage.setItem('Proof', 'proofSaved');
              // this.events.publish('lead', "proof");
              // if (this.isPreApprovedLead == 'Y') {
              //   this.sqlSupport.updatePreApprovalLeadStatus('1', '000', this.MFIExposureAmount, 'ACCEPT', '1', this.refId, this.id);
              // }
              // if (this.userType == "C" && this.isPreApprovedLead == "Y") {
              //   this.sqlSupport.updatePreApprovalLeadStatus('1', '000', '', 'ACCEPT', '1', this.refId, this.id);
              // }
            } else {
              this.PromoterTick = false;
              this.saveStatus.emit('noIdProof');
            }
          }
        })
        .catch((error) => {
          console.log(error);
          this.sqlSupport.insertErrorLog(
            error.stack,
            'ProofComponent-mandDocsCheckcount-getProductValuesCount'
          );
        });
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-mandDocsCheckcount'
      );
    }
  }

  aadhaarVaultInsert() {
    try {
      if (this.network.type === 'none' || this.network.type == 'unknown') {
        this.alertService.showAlert(
          'Alert!',
          'Please Check your Data Connection!'
        );
      } else {
        let aepsValue = this.proofData.controls.aepsStatus.value[0];
        if (aepsValue === '' || aepsValue === undefined || aepsValue === null) {
          this.alertService.showAlert('Alert!', 'Please Select AEPS Status');
        } else {
          this.globalData.globalLodingPresent('Getting reference number!!!');
          let body = {
            aadhaar: this.proofData.controls.promoIDRef.value,
            aepsStatus: aepsValue,
          };
          this.master.restApiCallAngular('AadharInsertVoulting', body).then(
            (data) => {
              if ((<any>data).status == '00') {
                this.sqliteProvider
                  .getPromoterProofDetailsByProof(
                    this.refId,
                    (<any>data).janaId
                  )
                  .then((pro) => {
                    if (pro.length > 0) {
                      this.globalData.globalLodingDismiss();
                      this.vaultStatus = 'N';
                      this.janaRefId = false;
                      this.proofData.controls.promoIDRef.setValue('');
                      this.proofData.controls.promoIDRef.updateValueAndValidity();
                      this.aadharBtn = 'Vault';
                      this.vaultDisable = false;
                      this.textType = 'password';
                      this.alertService.showAlert(
                        'Alert!',
                        'Given aadhar number already used in this application!'
                      );
                    } else {
                      this.globalData.globalLodingDismiss();
                      this.vaultStatus = 'Y';
                      this.janaRefId = true;
                      this.proofData.controls.promoIDRef.setValue('');
                      this.proofData.controls.promoIDRef.clearValidators();
                      this.proofData.controls.promoIDRef.updateValueAndValidity();
                      this.proofData.controls.promoIDRef.setValue(
                        (<any>data).janaId
                      );
                      this.aadharBtn = 'Retrieve';
                      this.vaultDisable = true;
                      this.textType = 'text';
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    this.sqlSupport.insertErrorLog(
                      error.stack,
                      'ProofComponent-aadhaarVaultInsert-getPromoterProofDetailsByProof'
                    );
                  });
              } else {
                this.vaultDisable = false;
                this.janaRefId = false;
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', (<any>data).error);
              }
            },
            (err) => {
              if (err.name == 'TimeoutError') {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert('Alert!', err.message);
              } else {
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'No Response from Server!'
                );
              }
            }
          );
        }
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-aadhaarVaultInsert'
      );
    }
  }

  aadhaarVaultRetrieve(value) {
    try {
      if (this.network.type === 'none' || this.network.type == 'unknown') {
        this.alertService.showAlert(
          'Alert!',
          'Please Check your Data Connection!'
        );
      } else {
        this.globalData.globalLodingPresent('Getting aadhar number!!!');
        let body = {
          keyValue: this.proofData.controls.promoIDRef.value,
        };
        this.master.restApiCallAngular('aadharretrieveService', body).then(
          (data) => {
            if ((<any>data).status == '00') {
              this.globalData.globalLodingDismiss();
              this.vaultStatus = 'Y';
              this.vaultDisable = true;
              this.aadharBtn = 'Retrieve';
              this.alertService.showAlert(
                'Alert!',
                'Given aadhar number is ' + (<any>data).aadhaar
              );
            } else {
              this.vaultDisable = true;
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert!', (<any>data).error);
            }
          },
          (err) => {
            if (err.name == 'TimeoutError') {
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert!', err.message);
            } else {
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert!', 'No Response from Server!');
            }
          }
        );
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-aadhaarVaultRetrieve'
      );
    }
  }

  removeVault() {
    try {
      this.refId = this.globalData.getrefId();
      this.id = this.globalData.getId();
      this.sqliteProvider
        .getAadharNum(this.refId, this.id)
        .then((data) => {
          if (data.length > 0) {
            if (
              data[0].janaRefId != '' &&
              data[0].janaRefId != undefined &&
              data[0].janaRefId != null
            ) {
              this.alertService.showAlert('Alert!', 'Cannot be remove here!');
            } else {
              this.vaultStatus = 'N';
              this.proofData.controls.promoIDRef.setValue('');
              this.proofData.controls.promoIDRef.setValidators(
                Validators.compose([
                  Validators.pattern('[0-9]*'),
                  Validators.maxLength(12),
                  Validators.minLength(12),
                  Validators.required,
                ])
              );
              this.proofData.controls.promoIDRef.updateValueAndValidity();
              this.aadharBtn = 'Vault';
              this.vaultDisable = false;
              this.janaRefId = false;
            }
          } else {
            this.vaultStatus = 'N';
            this.proofData.controls.promoIDRef.setValue('');
            this.proofData.controls.promoIDRef.setValidators(
              Validators.compose([
                Validators.pattern('[0-9]*'),
                Validators.maxLength(12),
                Validators.minLength(12),
                Validators.required,
              ])
            );
            this.proofData.controls.promoIDRef.updateValueAndValidity();
            this.aadharBtn = 'Vault';
            this.vaultDisable = false;
            this.janaRefId = false;
          }
        })
        .catch((error) => {
          this.sqlSupport.insertErrorLog(
            error.stack,
            'ProofComponent-removeVault'
          );
        });
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'ProofComponent-removeVault');
    }
  }

  viewAadhar() {
    if (this.textType == 'password') {
      this.textType = 'text';
    } else {
      this.textType = 'password';
    }
  }

  getstoredPAN(docCode) {
    this.sqliteProvider
      .getPersonalDetailsByLeadId(localStorage.getItem('leadId'))
      .then((data) => {
        if (data.length > 0) {
          if (
            data[0].panNum != '' &&
            data[0].panNum != undefined &&
            data[0].panNum != null
          ) {
            this.proofName = this.getDocumentName(docCode);
            this.aadhar = false;
            this.textType = 'text';
            this.vaultDisable = false;
            this.janaRefId = false;
            this.vaultStatus = '';
            this.proofData.controls.promoIDRef.setValue(data[0].panNum);
            this.proofData.controls.promoIDRef.setValidators(
              Validators.compose([
                Validators.maxLength(10),
                Validators.minLength(10),
                Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
                Validators.required,
              ])
            );
            this.proofData.controls.promoexpiry.clearValidators();
            this.proofData.controls.promoIDRef.updateValueAndValidity();
            this.proofData.controls.promoexpiry.updateValueAndValidity();
            this.proofData.controls.aepsStatus.clearValidators();
            this.proofData.controls.aepsStatus.updateValueAndValidity();
            this.idNumDisable = true;
            this.expdate = false;
          } else {
            this.idNumDisable = true;
            this.aadhar = false;
            this.textType = 'text';
            this.vaultDisable = false;
            this.janaRefId = false;
            this.vaultStatus = '';
            this.expdate = false;
            this.proofName = this.getDocumentName(docCode);
            this.proofData.controls.promoIDRef.setValue('');
            this.proofData.controls.promoIDRef.setValidators(
              Validators.compose([
                Validators.maxLength(10),
                Validators.minLength(10),
                Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
                Validators.required,
              ])
            );
            this.proofData.controls.promoexpiry.clearValidators();
            this.proofData.controls.promoIDRef.updateValueAndValidity();
            this.proofData.controls.promoexpiry.updateValueAndValidity();
            this.proofData.controls.aepsStatus.clearValidators();
            this.proofData.controls.aepsStatus.updateValueAndValidity();
            setTimeout(() => {
              if (this.userType == 'A') {
                this.alertService.showAlert(
                  'Alert!',
                  'Kindly update the PAN availability in Borrower Details!'
                );
              } else if (this.userType == 'C') {
                this.alertService.showAlert(
                  'Alert!',
                  'Kindly update the PAN availability in Co-Applicant Details!'
                );
              } else if (this.userType == 'G') {
                this.alertService.showAlert(
                  'Alert!',
                  'Kindly update the PAN availability in Guarantor Details!'
                );
              }
            }, 400);
          }
        } else {
          this.proofName = this.getDocumentName(docCode);
          this.proofData.controls.promoIDRef.setValue('');
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.maxLength(10),
              Validators.minLength(10),
              Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
              Validators.required,
            ])
          );
          this.proofData.controls.promoexpiry.clearValidators();
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.promoexpiry.updateValueAndValidity();
          this.proofData.controls.aepsStatus.clearValidators();
          this.proofData.controls.aepsStatus.updateValueAndValidity();
          this.idNumDisable = false;
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
          this.expdate = false;
        }
      })
      .catch((error) => {
        this.sqlSupport.insertErrorLog(
          error.stack,
          'ProofComponent-getDocuments-getDocNumberFromPersonalDetails'
        );
      });
  }

  getStoredNerga(docCode) {
    this.sqliteProvider
      .getDocNumberFromPersonalDetails(localStorage.getItem('leadId'), 'nregea')
      .then((nregeadata) => {
        if (nregeadata.length > 0) {
          this.proofName = this.getDocumentName(docCode);
          this.proofData.controls.promoIDRef.setValue(nregeadata[0].docValue);
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.maxLength(20),
              Validators.minLength(10),
              Validators.pattern('[a-zA-Z0-9]*'),
            ])
          );
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.aepsStatus.clearValidators();
          this.proofData.controls.aepsStatus.updateValueAndValidity();
          this.idNumDisable = true;
          this.expdate = false;
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
        } else {
          this.expdate = true;
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
          this.idNumDisable = false;
          this.proofName = this.getDocumentName(docCode);
          this.proofData.controls.promoIDRef.setValue('');
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.maxLength(20),
              Validators.minLength(10),
              Validators.pattern('[a-zA-Z0-9]*'),
            ])
          ); //Validators.pattern(/^[a-zA-Z0-9-\/]*$/),
          this.proofData.controls.promoIDRef.updateValueAndValidity();
        }
      });
  }

  getStoredDrivingLicense(docCode) {
    this.sqliteProvider
      .getKarzaData(localStorage.getItem('leadId'), 'licence')
      .then((data) => {
        if (data.length > 0) {
          this.proofName = this.getDocumentName(docCode);
          this.proofData.controls.promoIDRef.setValue(data[0].idNumber);
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.maxLength(17),
              Validators.minLength(15),
              Validators.required,
              Validators.pattern(/^[a-zA-Z0-9-\/]*$/),
            ])
          );
          this.proofData.controls.promoexpiry.setValidators(
            Validators.compose([Validators.required])
          );
          this.proofData.controls.promoexpiry.updateValueAndValidity();
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.aepsStatus.clearValidators();
          this.proofData.controls.aepsStatus.updateValueAndValidity();
          this.idNumDisable = true;
          this.expdate = true;
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
        } else {
          this.sqliteProvider
            .getDocNumberFromPersonalDetails(
              localStorage.getItem('leadId'),
              'licence'
            )
            .then((dl) => {
              if (dl.length > 0) {
                this.proofName = this.getDocumentName(docCode);
                this.proofData.controls.promoIDRef.setValue(dl[0].docValue);
                this.proofData.controls.promoIDRef.setValidators(
                  Validators.compose([
                    Validators.maxLength(17),
                    Validators.minLength(15),
                    Validators.required,
                    Validators.pattern(/^[a-zA-Z0-9-\/]*$/),
                  ])
                );
                this.proofData.controls.promoexpiry.setValidators(
                  Validators.compose([Validators.required])
                );
                this.proofData.controls.promoexpiry.updateValueAndValidity();
                this.proofData.controls.promoIDRef.updateValueAndValidity();
                this.proofData.controls.aepsStatus.clearValidators();
                this.proofData.controls.aepsStatus.updateValueAndValidity();
                this.idNumDisable = true;
                this.expdate = true;
                this.aadhar = false;
                this.textType = 'text';
                this.vaultDisable = false;
                this.janaRefId = false;
                this.vaultStatus = '';
              } else {
                this.expdate = true;
                this.aadhar = false;
                this.textType = 'text';
                this.vaultDisable = false;
                this.janaRefId = false;
                this.vaultStatus = '';
                this.idNumDisable = false;
                this.proofName = this.getDocumentName(docCode);
                this.proofData.controls.promoIDRef.setValue('');
                this.proofData.controls.promoIDRef.setValidators(
                  Validators.compose([
                    Validators.maxLength(17),
                    Validators.minLength(15),
                    Validators.required,
                    Validators.pattern(/^[a-zA-Z0-9-\/]*$/),
                  ])
                ); //Validators.pattern(/^[a-zA-Z0-9-\/]*$/),
                this.proofData.controls.promoexpiry.setValidators(
                  Validators.compose([Validators.required])
                );
                this.proofData.controls.promoexpiry.updateValueAndValidity();
                this.proofData.controls.promoIDRef.updateValueAndValidity();
                this.proofData.controls.aepsStatus.clearValidators();
                this.proofData.controls.aepsStatus.updateValueAndValidity();
              }
            })
            .catch((error) => {
              this.sqlSupport.insertErrorLog(
                error.stack,
                'ProofComponent-getDocuments-getDocNumberFromPersonalDetails'
              );
            });
        }
      })
      .catch((error) => {
        this.sqlSupport.insertErrorLog(
          error.stack,
          'ProofComponent-getDocuments-getKarzaData'
        );
      });
  }

  getStoredPassport(docCode) {
    this.sqliteProvider
      .getKarzaData(localStorage.getItem('leadId'), 'passport')
      .then((data) => {
        if (data.length > 0) {
          this.proofName = this.getDocumentName(docCode);
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
          this.proofData.controls.promoIDRef.setValue(data[0].idNumber);
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.pattern(/^[A-Za-z]{1}[0-9]{7}$/),
              Validators.maxLength(8),
              Validators.minLength(8),
              Validators.required,
            ])
          );
          this.proofData.controls.promoexpiry.setValidators(
            Validators.compose([Validators.required])
          );
          this.proofData.controls.promoexpiry.updateValueAndValidity();
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.aepsStatus.clearValidators();
          this.proofData.controls.aepsStatus.updateValueAndValidity();
          this.idNumDisable = true;
          this.expdate = true;
        } else {
          this.sqliteProvider
            .getPersonalDetailsByLeadId(localStorage.getItem('leadId'))
            .then((data) => {
              if (data.length > 0 && data[0].docName == 'passport') {
                // if(data[0].docName == "passport"){
                this.proofName = this.getDocumentName(docCode);
                this.aadhar = false;
                this.textType = 'text';
                this.vaultDisable = false;
                this.janaRefId = false;
                this.vaultStatus = '';
                this.proofData.controls.promoIDRef.setValue(data[0].docValue);
                this.proofData.controls.promoIDRef.setValidators(
                  Validators.compose([
                    Validators.pattern(/^[A-Za-z]{1}[0-9]{7}$/),
                    Validators.maxLength(8),
                    Validators.minLength(8),
                    Validators.required,
                  ])
                );
                this.proofData.controls.promoexpiry.setValidators(
                  Validators.compose([Validators.required])
                );
                this.proofData.controls.promoexpiry.updateValueAndValidity();
                this.proofData.controls.promoIDRef.updateValueAndValidity();
                this.proofData.controls.aepsStatus.clearValidators();
                this.proofData.controls.aepsStatus.updateValueAndValidity();
                this.idNumDisable = true;
                this.expdate = true;
                // }
              } else {
                this.idNumDisable = false;
                this.aadhar = false;
                this.textType = 'text';
                this.vaultDisable = false;
                this.janaRefId = false;
                this.vaultStatus = '';
                this.expdate = true;
                this.proofName = this.getDocumentName(docCode);
                this.proofData.controls.promoIDRef.setValue('');
                this.proofData.controls.promoIDRef.setValidators(
                  Validators.compose([
                    Validators.pattern(/^[A-Za-z]{1}[0-9]{7}$/),
                    Validators.maxLength(8),
                    Validators.minLength(8),
                    Validators.required,
                  ])
                );
                this.proofData.controls.promoexpiry.setValidators(
                  Validators.compose([Validators.required])
                );
                this.proofData.controls.promoexpiry.updateValueAndValidity();
                this.proofData.controls.promoIDRef.updateValueAndValidity();
                this.proofData.controls.aepsStatus.clearValidators();
                this.proofData.controls.aepsStatus.updateValueAndValidity();
              }
            })
            .catch((error) => {
              this.sqlSupport.insertErrorLog(
                error.stack,
                'ProofComponent-getDocuments-getDocNumberFromPersonalDetails'
              );
            });
        }
      })
      .catch((error) => {
        this.sqlSupport.insertErrorLog(
          error.stack,
          'ProofComponent-getDocuments-getKarzaData'
        );
      });
  }

  getStoredVoterId(docCode) {
    this.sqliteProvider
      .getKarzaData(localStorage.getItem('leadId'), 'voterid')
      .then((data) => {
        if (data.length > 0) {
          this.proofName = this.getDocumentName(docCode);
          this.proofData.controls.promoIDRef.setValue(data[0].idNumber);
          // this.proofData.controls.promoIDRef.setValidators(Validators.compose([Validators.maxLength(10), Validators.minLength(10), Validators.pattern(/^[a-zA-Z]{3}[0-9]{7}$/), Validators.required]));
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.maxLength(16),
              Validators.minLength(10),
              Validators.required,
            ])
          );
          this.proofData.controls.promoexpiry.clearValidators();
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.promoexpiry.updateValueAndValidity();
          this.proofData.controls.aepsStatus.clearValidators();
          this.proofData.controls.aepsStatus.updateValueAndValidity();
          this.idNumDisable = true;
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
          this.expdate = false;
        } else {
          this.sqliteProvider
            .getDocNumberFromPersonalDetails(
              localStorage.getItem('leadId'),
              'voterid'
            )
            .then((voter) => {
              if (voter.length > 0) {
                this.proofName = this.getDocumentName(docCode);
                this.proofData.controls.promoIDRef.setValue(voter[0].docValue);
                this.proofData.controls.promoIDRef.setValidators(
                  Validators.compose([
                    Validators.maxLength(16),
                    Validators.minLength(10),
                    Validators.required,
                  ])
                );
                this.proofData.controls.promoexpiry.clearValidators();
                this.proofData.controls.promoIDRef.updateValueAndValidity();
                this.proofData.controls.promoexpiry.updateValueAndValidity();
                this.proofData.controls.aepsStatus.clearValidators();
                this.proofData.controls.aepsStatus.updateValueAndValidity();
                this.idNumDisable = true;
                this.aadhar = false;
                this.textType = 'text';
                this.vaultDisable = false;
                this.janaRefId = false;
                this.vaultStatus = '';
                this.expdate = false;
              } else {
                this.idNumDisable = false;
                this.expdate = false;
                this.aadhar = false;
                this.textType = 'text';
                this.vaultDisable = false;
                this.janaRefId = false;
                this.vaultStatus = '';
                this.proofName = this.getDocumentName(docCode);
                this.proofData.controls.promoIDRef.setValue('');
                // this.proofData.controls.promoIDRef.setValidators(Validators.compose([Validators.maxLength(10), Validators.minLength(10), Validators.pattern(/^[a-zA-Z]{3}[0-9]{7}$/), Validators.required]));
                this.proofData.controls.promoIDRef.setValidators(
                  Validators.compose([
                    Validators.maxLength(16),
                    Validators.minLength(10),
                    Validators.required,
                  ])
                );
                this.proofData.controls.promoexpiry.clearValidators();
                this.proofData.controls.promoIDRef.updateValueAndValidity();
                this.proofData.controls.promoexpiry.updateValueAndValidity();
                this.proofData.controls.aepsStatus.clearValidators();
                this.proofData.controls.aepsStatus.updateValueAndValidity();
              }
            })
            .catch((error) => {
              this.sqlSupport.insertErrorLog(
                error.stack,
                'ProofComponent-getDocuments-getDocNumberFromPersonalDetails'
              );
            });
        }
      })
      .catch((error) => {
        this.sqlSupport.insertErrorLog(
          error.stack,
          'ProofComponent-getDocuments-getKarzaData'
        );
      });
  }

  getStoredAadhar(docCode) {
    this.sqliteProvider
      .getPersonalDetailsByLeadId(localStorage.getItem('leadId'))
      .then((data) => {
        if (data.length > 0) {
          if (data[0].aadharRefSucess == 'true') {
            this.idNumDisable = true;
            this.aadhar = true;
            this.expdate = false;
            this.janaRefId = true;
            this.proofName = this.getDocumentName(docCode);
            // this.proofData.controls.promoIDRef.setValue(data[0].janaRefId);
            this.proofData.controls.promoIDRef.setValue(data[0].docValue);
            this.proofData.controls.aepsStatus.setValue(data[0].aepsStatus);
            // this.vaultStatus = data[0].vaultStatus;
            this.vaultStatus = 'Y';
            this.proofData.controls.promoIDRef.setValidators(
              Validators.compose([
                Validators.maxLength(12),
                Validators.minLength(12),
                Validators.pattern('[0-9]{12}'),
                Validators.required,
              ])
            );
            this.proofData.controls.promoexpiry.clearValidators();
            this.proofData.controls.promoIDRef.updateValueAndValidity();
            this.proofData.controls.promoexpiry.updateValueAndValidity();
            this.proofData.controls.aepsStatus.setValidators(
              Validators.required
            );
            this.proofData.controls.aepsStatus.updateValueAndValidity();
          } else {
            this.idNumDisable = false;
            this.aadhar = true;
            this.expdate = false;
            this.janaRefId = false;
            this.vaultDisable = false;
            this.proofName = this.getDocumentName(docCode);
            this.proofData.controls.promoIDRef.setValue('');
            this.vaultStatus = 'N';
            this.textType = 'password';
            this.proofData.controls.promoIDRef.setValidators(
              Validators.compose([
                Validators.maxLength(12),
                Validators.minLength(12),
                Validators.pattern('[0-9]{12}'),
                Validators.required,
              ])
            );
            this.proofData.controls.promoexpiry.clearValidators();
            this.proofData.controls.promoIDRef.updateValueAndValidity();
            this.proofData.controls.promoexpiry.updateValueAndValidity();
            this.proofData.controls.aepsStatus.setValidators(
              Validators.required
            );
            this.proofData.controls.aepsStatus.updateValueAndValidity();
          }
        } else {
          this.idNumDisable = false;
          this.aadhar = true;
          this.expdate = false;
          this.proofName = this.getDocumentName(docCode);
          this.vaultStatus = 'N';
          this.proofData.controls.promoIDRef.setValue('');
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.maxLength(12),
              Validators.minLength(12),
              Validators.pattern('[0-9]{12}'),
              Validators.required,
            ])
          );
          this.proofData.controls.promoexpiry.clearValidators();
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.promoexpiry.updateValueAndValidity();
          this.proofData.controls.aepsStatus.setValidators(Validators.required);
          this.proofData.controls.aepsStatus.updateValueAndValidity();
        }
      });
  }

  getDocumentsValidator(docCode, value) {
    try {
      if (
        this.getDocumentName(docCode) == 'DRIVING LICENSE' ||
        this.getDocumentName(docCode) == 'DRIVING LISENCE'
      ) {
        // DL
        if (
          value[0].DrivingLic &&
          /^[a-zA-Z0-9-\/]*$/.test(value[0].DrivingLic) &&
          value[0].DrivingLic.length >= 15 &&
          value[0].DrivingLic.length <= 17
        ) {
          this.proofData.controls.promoIDRef.clearValidators();
          this.proofData.controls.promoexpiry.clearValidators();
          this.proofData.controls.promoIDRef.setValue(value[0].DrivingLic);
          this.expdate = true;
          this.expdate = true;
          this.idNumDisable = true;
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
          this.proofName = this.getDocumentName(docCode);
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.maxLength(17),
              Validators.minLength(15),
              Validators.required,
              Validators.pattern(/^[a-zA-Z0-9-\/]*$/),
            ])
          );
          this.proofData.controls.promoexpiry.setValidators(
            Validators.compose([Validators.required])
          );
          this.proofData.controls.promoexpiry.updateValueAndValidity();
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.aepsStatus.clearValidators();
          this.proofData.controls.aepsStatus.updateValueAndValidity();
        } else {
          this.getStoredDrivingLicense(docCode);
        }
      } else if (this.getDocumentName(docCode) == 'PASSPORT') {
        // Pasport
        if (value[0].Passport) {
          this.proofData.controls.promoIDRef.clearValidators();
          this.proofData.controls.promoexpiry.clearValidators();
          this.proofData.controls.promoIDRef.setValue(value[0].Passport);
          this.expdate = true;
          this.idNumDisable = true;
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
          this.proofName = this.getDocumentName(docCode);
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.pattern(/^[A-Za-z]{1}[0-9]{7}$/),
              Validators.maxLength(8),
              Validators.minLength(8),
              Validators.required,
            ])
          );
          this.proofData.controls.promoexpiry.setValidators(
            Validators.compose([Validators.required])
          );
          this.proofData.controls.promoexpiry.updateValueAndValidity();
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.aepsStatus.clearValidators();
          this.proofData.controls.aepsStatus.updateValueAndValidity();
        } else {
          this.getStoredPassport(docCode);
        }
      } else if (
        this.getDocumentName(docCode) == 'PAN CARD' ||
        this.getDocumentName(docCode) == 'PAN'
      ) {
        // PAN
        if (value[0].PanNum) {
          this.proofData.controls.promoIDRef.clearValidators();
          this.proofData.controls.promoexpiry.clearValidators();
          this.proofData.controls.promoIDRef.setValue(value[0].PanNum);
          this.expdate = false;
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
          this.proofName = this.getDocumentName(docCode);
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.maxLength(10),
              Validators.minLength(10),
              Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
              Validators.required,
            ])
          );
          this.proofData.controls.promoexpiry.clearValidators();
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.promoexpiry.updateValueAndValidity();
          this.proofData.controls.aepsStatus.clearValidators();
          this.proofData.controls.aepsStatus.updateValueAndValidity();
          this.idNumDisable = true;
        } else {
          this.getstoredPAN(docCode);
        }
      } else if (
        this.getDocumentName(docCode) == 'AADHAR' ||
        this.getDocumentName(docCode) == 'AADHAR CARD'
      ) {
        // aadhar

        this.proofData.controls.promoIDRef.clearValidators();
        this.proofData.controls.promoexpiry.clearValidators();
        this.proofData.controls.aepsStatus.clearValidators();
        // this.proofData.controls.promoIDRef.setValue(value[0].Aadhar);

        if (value[0].EKycStatus == 'Y' || value[0].EKycStatus == 'Positive') {
          if (value[0].JanaReferenceID != '') {
            // jana ref id mapping
            this.vaultStatus = 'Y';
            this.idNumDisable = true;
            this.proofName = this.getDocumentName(docCode);
            this.aadhar = true;
            this.expdate = false;
            this.vaultDisable = true;
            this.janaRefId = true;
            this.proofData.controls.promoIDRef.setValue(
              value[0].JanaReferenceID
            );
            if (value[0].aepsStatus) {
              this.aadhar = false;
              this.idNumDisable = true;
              this.proofData.controls.aepsStatus.setValue(value[0].aepsStatus);
              this.proofData.controls.aepsStatus.updateValueAndValidity();
            } else {
              this.aadhar = true;
              this.idNumDisable = false;
              this.proofData.controls.aepsStatus.setValue('');
              this.proofData.controls.aepsStatus.updateValueAndValidity();
            }
            this.proofData.controls.promoIDRef.setValidators(
              Validators.compose([
                Validators.maxLength(12),
                Validators.minLength(12),
                Validators.pattern('[0-9]{12}'),
                Validators.required,
              ])
            );
            this.proofData.controls.promoexpiry.clearValidators();
            this.proofData.controls.promoIDRef.updateValueAndValidity();
            this.proofData.controls.promoexpiry.updateValueAndValidity();
            this.proofData.controls.aepsStatus.setValidators(
              Validators.required
            );
            this.proofData.controls.aepsStatus.updateValueAndValidity();
          } else {
            // valut
            this.vaultStatus = 'N';
            this.idNumDisable = false;
            this.proofName = this.getDocumentName(docCode);
            this.aadhar = true;
            this.expdate = false;
            this.vaultDisable = false;
            this.janaRefId = false;
            this.proofData.controls.promoIDRef.setValue(value[0].Aadhar);
            this.proofData.controls.promoIDRef.setValidators(
              Validators.compose([
                Validators.maxLength(12),
                Validators.minLength(12),
                Validators.pattern('[0-9]{12}'),
                Validators.required,
              ])
            );
            this.proofData.controls.promoexpiry.clearValidators();
            this.proofData.controls.promoIDRef.updateValueAndValidity();
            this.proofData.controls.promoexpiry.updateValueAndValidity();
            this.proofData.controls.aepsStatus.setValidators(
              Validators.required
            );
            this.proofData.controls.aepsStatus.updateValueAndValidity();
          }
        } else {
          this.sqlSupport
            .getEKYCDetails(localStorage.getItem('leadId'))
            .then((data) => {
              if (data.length > 0) {
                if (
                  data[0].janaid != '' &&
                  data[0].janaid != undefined &&
                  data[0].janaid != null
                ) {
                  this.idNumDisable = true;
                  this.aadhar = true;
                  this.expdate = false;
                  this.janaRefId = true;
                  this.proofName = this.getDocumentName(docCode);
                  // this.proofData.controls.promoIDRef.setValue(data[0].janaRefId);
                  this.proofData.controls.promoIDRef.setValue(data[0].janaid);
                  this.proofData.controls.aepsStatus.setValue(data[0].aepsFlag);
                  // this.vaultStatus = data[0].vaultStatus;
                  this.vaultStatus = 'Y';
                  this.proofData.controls.promoIDRef.setValidators(
                    Validators.compose([
                      Validators.maxLength(12),
                      Validators.minLength(12),
                      Validators.pattern('[0-9]{12}'),
                      Validators.required,
                    ])
                  );
                  this.proofData.controls.promoexpiry.clearValidators();
                  this.proofData.controls.promoIDRef.updateValueAndValidity();
                  this.proofData.controls.promoexpiry.updateValueAndValidity();
                  this.proofData.controls.aepsStatus.setValidators(
                    Validators.required
                  );
                  this.proofData.controls.aepsStatus.updateValueAndValidity();
                } else {
                  this.idNumDisable = false;
                  this.aadhar = true;
                  this.expdate = false;
                  this.janaRefId = false;
                  this.vaultDisable = false;
                  this.proofName = this.getDocumentName(docCode);
                  this.proofData.controls.promoIDRef.setValue('');
                  this.vaultStatus = 'N';
                  this.textType = 'password';
                  this.proofData.controls.promoIDRef.setValidators(
                    Validators.compose([
                      Validators.maxLength(12),
                      Validators.minLength(12),
                      Validators.pattern('[0-9]{12}'),
                      Validators.required,
                    ])
                  );
                  this.proofData.controls.promoexpiry.clearValidators();
                  this.proofData.controls.promoIDRef.updateValueAndValidity();
                  this.proofData.controls.promoexpiry.updateValueAndValidity();
                  this.proofData.controls.aepsStatus.setValidators(
                    Validators.required
                  );
                  this.proofData.controls.aepsStatus.updateValueAndValidity();
                }
              } else {
                this.getStoredAadhar(docCode);
                // this.idNumDisable = false;
                // this.aadhar = true;
                // this.expdate = false;
                // this.proofName = this.getDocumentName(docCode);
                // this.vaultStatus = 'N';
                // this.proofData.controls.promoIDRef.setValue('');
                // this.proofData.controls.promoIDRef.setValidators(Validators.compose([Validators.maxLength(12), Validators.minLength(12), Validators.pattern('[0-9]{12}'), Validators.required]));
                // this.proofData.controls.promoexpiry.clearValidators();
                // this.proofData.controls.promoIDRef.updateValueAndValidity();
                // this.proofData.controls.promoexpiry.updateValueAndValidity();
              }
            })
            .catch((error) => {
              this.sqlSupport.insertErrorLog(
                error.stack,
                'ProofComponent-getEKYCDetails'
              );
            });
        }

        // this.expdate = false;
        // this.proofName = this.getDocumentName(docCode);
        // // this.idNumDisable = false;
        // this.aadhar = true;
        // this.expdate = false;
        // this.proofName = this.getDocumentName(docCode);
        // // this.vaultStatus = 'N';
        // this.proofData.controls.promoIDRef.setValue('');
        // this.proofData.controls.promoIDRef.setValidators(Validators.compose([Validators.maxLength(12), Validators.minLength(12), Validators.pattern('[0-9]{12}'), Validators.required]));
        // this.proofData.controls.promoexpiry.clearValidators();
        // this.proofData.controls.promoIDRef.updateValueAndValidity();
        // this.proofData.controls.promoexpiry.updateValueAndValidity();
        // this.proofData.controls.promoIDRef.setValidators(Validators.compose([Validators.maxLength(12), Validators.minLength(12), Validators.pattern('[0-9]{12}'), Validators.required]));
        // this.proofData.controls.promoexpiry.clearValidators();
        // this.proofData.controls.promoIDRef.updateValueAndValidity();
        // this.proofData.controls.promoexpiry.updateValueAndValidity();
      } else if (this.getDocumentName(docCode) == 'VOTER ID') {
        // voter
        if (value[0].VoterId) {
          this.proofData.controls.promoIDRef.clearValidators();
          this.proofData.controls.promoexpiry.clearValidators();
          this.proofData.controls.promoIDRef.setValue(value[0].VoterId);
          this.expdate = false;
          this.aadhar = false;
          this.textType = 'text';
          this.vaultDisable = false;
          this.janaRefId = false;
          this.vaultStatus = '';
          this.proofName = this.getDocumentName(docCode);
          this.proofData.controls.promoIDRef.setValidators(
            Validators.compose([
              Validators.maxLength(16),
              Validators.minLength(10),
              Validators.required,
            ])
          );
          this.proofData.controls.promoexpiry.clearValidators();
          this.proofData.controls.promoIDRef.updateValueAndValidity();
          this.proofData.controls.promoexpiry.updateValueAndValidity();
          this.proofData.controls.aepsStatus.clearValidators();
          this.proofData.controls.aepsStatus.updateValueAndValidity();
          this.idNumDisable = true;
        } else {
          this.getStoredVoterId(docCode);
        }
      } else if (this.getDocumentName(docCode) == 'GSTIN') {
        this.proofData.controls.promoIDRef.clearValidators();
        this.proofData.controls.promoexpiry.clearValidators();
        this.proofData.controls.promoIDRef.setValidators(
          Validators.compose([
            Validators.maxLength(30),
            Validators.minLength(10),
            Validators.required,
          ])
        );
        this.proofData.controls.promoexpiry.clearValidators();
        this.proofData.controls.promoIDRef.updateValueAndValidity();
        this.proofData.controls.promoexpiry.updateValueAndValidity();
        this.proofData.controls.aepsStatus.clearValidators();
        this.proofData.controls.aepsStatus.updateValueAndValidity();
      } else if (this.getDocumentName(docCode) == 'CIN') {
        this.proofData.controls.promoIDRef.clearValidators();
        this.proofData.controls.promoexpiry.clearValidators();
        this.proofData.controls.promoIDRef.setValidators(
          Validators.compose([
            Validators.maxLength(30),
            Validators.minLength(10),
            Validators.pattern('^[a-zA-Z0-9]*'),
            Validators.required,
          ])
        );
        this.proofData.controls.promoexpiry.clearValidators();
        this.proofData.controls.promoIDRef.updateValueAndValidity();
        this.proofData.controls.promoexpiry.updateValueAndValidity();
        this.proofData.controls.aepsStatus.clearValidators();
        this.proofData.controls.aepsStatus.updateValueAndValidity();
      } else if (this.getDocumentName(docCode) == 'NREGA') {
        this.getStoredNerga(docCode);
      } else {
        this.idNumDisable = false;
        this.expdate = false;
        this.aadhar = false;
        this.textType = 'text';
        this.vaultDisable = false;
        this.janaRefId = false;
        this.vaultStatus = '';
        this.proofName = this.getDocumentName(docCode);
        this.proofData.controls.promoIDRef.clearValidators();
        this.proofData.controls.promoexpiry.clearValidators();
        this.proofData.controls.promoIDRef.setValidators(
          Validators.compose([
            Validators.maxLength(20),
            Validators.minLength(10),
            Validators.pattern('[a-zA-Z0-9]*'),
            Validators.required,
          ])
        );
        this.proofData.controls.promoexpiry.clearValidators();
        this.proofData.controls.promoIDRef.updateValueAndValidity();
        this.proofData.controls.promoexpiry.updateValueAndValidity();
        this.proofData.controls.aepsStatus.clearValidators();
        this.proofData.controls.aepsStatus.updateValueAndValidity();
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-getDocumentsValidator'
      );
    }
  }

  updateProofImg() {
    try {
      this.updateimg(this.pproofId);
      this.globalData.globalLodingDismiss();
      if (this.userType == 'A') {
        this.alertService.showAlert(
          'Alert!',
          'Borrower Proof Details Updated Successfully'
        );
      } else if (this.userType == 'G') {
        this.alertService.showAlert(
          'Alert!',
          'Guarantor Proof Details Updated Successfully'
        );
      } else if (this.userType == 'C') {
        this.alertService.showAlert(
          'Alert!',
          'Co-Applicant Proof Details Updated Successfully'
        );
      } else {
        console.log('No user type Recived');
      }
      this.IDTypeDisable = false;
      this.vaultStatus = '';
      this.janaRefId = false;
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'ProofComponent-updateProofImg'
      );
    }
  }
}
