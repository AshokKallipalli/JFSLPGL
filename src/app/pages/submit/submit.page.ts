import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  AlertController,
  IonSlides,
  LoadingController,
  ModalController,
  NavParams,
} from '@ionic/angular';
import { ProgressbarComponent } from 'src/app/components/progressbar/progressbar.component';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { ErrorLogService } from 'src/providers/error-log.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { format } from 'date-fns';
import { SubmitModalPage } from '../submit-modal/submit-modal.page';
import * as moment from 'moment';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.page.html',
  styleUrls: ['./submit.page.scss'],
})
export class SubmitPage {
  custName: any;
  submitStat: any;
  applicantDetails: any = [];
  appCibilCheckStat: any;
  appStatId: any;
  appCibilColor: any;
  appCibilScore: any;
  appHimarkCheckStat: any;

  coappCibilCheckStat: boolean = false;
  coappHimarkCheckStat: boolean = false;

  uploadprogressCmpRef: ComponentRef<ProgressbarComponent>;

  guaCibilCheckStat: boolean = false;
  guaHimarkCheckStat: boolean = false;

  applicantDocs: any = [];
  guarantorDocs: any = [];
  coapplicantDocs: any = [];
  loading = this.loadCtrl.create({
    message: 'Please wait...',
  });
  nomAvail: any;
  guaAvail: any;
  annex_imgs: any[];
  sign_imgs: any;
  service_data: any[];
  nominee_Data: any;
  casaSubmitData: any;
  imdSubmitData: any;
  securityValue: any;
  securityDetails: any;
  productCode: any;
  pdt_master = [];
  master_Products: any;
  promoterpic: any;
  entitypic: any;
  guarantorpic: any;
  docFinalReq = [];
  doclist = [];
  Gudoclist = [];
  entidoclist = [];
  @ViewChild('Slides') slides: IonSlides;
  @ViewChild('dynamic', { read: ViewContainerRef }) myRef: ViewContainerRef;
  IMD_data: any = [];
  imgImg: any;
  master_Docs: any;
  items: any;
  CASA_data: any;
  basicLength = 0;
  sourcingLength = 0;
  promoterLength = 0;
  entityAdrsLength = 0;
  presentAdrsLength = 0;
  permaAdrsLength = 0;
  promoProofLength = 0;
  vehicleDetailsLength = 0;
  entityProofLength = 0;
  guapromoterLength = 0;
  guapresentAdrsLength = 0;
  guapermaAdrsLength = 0;
  guapromoProofLength = 0;
  coappLength = 0;
  coapppresentAdrsLength = 0;
  coapppermaAdrsLength = 0;
  coapppromoProofLength = 0;
  securityDetailsLength: any;
  submitdata: any;
  submitUrl: any;
  username: any;
  submitResult: any;
  applicant: any;
  guarantor: any;
  applicationNumber: any;
  applicationStatus: any;
  submitDisable: boolean = false;
  iagree: boolean = false;
  allKarzaData: any = [];
  appLeadId: any;
  docs_master: any = [];
  coappFinal: any = [];
  guaFinal: any = [];
  coapplicants: any = [];
  other_docs: any = [];
  nachSubmitData: any;
  NACH_data: any = [];
  vehicle_data: any = [];
  nach_imgs: any[];
  vehicleSubmitData: any;
  vehicleType: any;
  leadIdType: any;
  leadIdValue: any;
  leadIdExpiry: any;

  docUpload: boolean = false;
  documentCheck: boolean = false;
  documentResubmit: any;

  referenceDetails: any = [];
  CoappPANAvailable: any;
  finalDocForFinalSub: any = [];
  insuranceData: any;
  naveParamsValue: any;
  dummy_masterDealer = [];
  signpic: any;
  appAespFlag: any;
  coAppAespFlag: any;
  constructor(
    public navCtrl: Router,
    public navParams: NavParams,
    public loadCtrl: LoadingController,
    public modalCtrl: ModalController,
    public http: HTTP,
    public globalData: DataPassingProviderService,
    public sqliteProvider: SqliteService,
    public globalFunc: GlobalService,
    public alertCtrl: AlertController,
    // public base64: Base64,
    public master: RestService,
    public sqlSupport: SquliteSupportProviderService,
    public factoryRef: ComponentFactoryResolver,
    public network: Network,
    private errorLog: ErrorLogService,
    public activateRoute: ActivatedRoute,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService
  ) {
    this.activateRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.getProductValue();
    this.username = this.globalFunc.basicDec(localStorage.getItem('username'));
    this.applicant = JSON.parse(this.naveParamsValue.applicantDetails);
    console.log(this.applicant, 'applicant in submit');
    this.coapplicants = this.naveParamsValue.coappDetails
      ? JSON.parse(this.naveParamsValue.coappDetails)
      : '';
    console.log(this.coapplicants, 'applicant in submit');
    this.guarantor = this.naveParamsValue.guaranDetails
      ? JSON.parse(this.naveParamsValue.guaranDetails)
      : '';
    this.getDocumentValue();
    this.lengthCheck();
    this.getApplicantDocs();
    this.getCoApplicantDetails();
    this.getGuarantorDetails();
    this.username = this.globalFunc.basicDec(localStorage.getItem('username'));
    this.CASASubmitData();
    // this.getServiceDetails();
    this.getAllVehcileDetails();
    // this.getNACHDetails();
    this.getreferenceDetails();
  }

  ionViewWillEnter() {
    this.getDealerMaster();
    this.getKarzaDetails();
    this.loadAllApplicantDetails();
    this.getAppCibilCheckStatus();
    this.getGuaCibilCheckStatus();
    this.getCoappCibilCheckStatus();
  }

  ionViewDidEnter() {
    this.globalFunc.statusbarValuesForPages();
  }

  lengthCheck() {
    this.sqliteProvider
      .getBasicDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        this.basicLength = data.length;
      });
    this.sqliteProvider
      .getSourcingDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        this.sourcingLength = data.length;
      });
    this.sqliteProvider
      .getPersonalDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        this.promoterLength = data.length;
      });
    this.sqliteProvider
      .getPresentAddress(this.applicant.refId, this.applicant.id)
      .then((data) => {
        this.presentAdrsLength = data.length;
      });
    this.sqliteProvider
      .getPermanentAddress(this.applicant.refId, this.applicant.id)
      .then((data) => {
        this.permaAdrsLength = data.length;
      });
    this.sqliteProvider
      .getPromoterProofDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        this.promoProofLength = data.length;
      });
    this.sqliteProvider
      .getVehicleDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        this.vehicleDetailsLength = data.length;
      });

    if (this.applicant.guaFlag == 'Y') {
      this.sqliteProvider
        .getGuaranDetails(this.guarantor[0].refId)
        .then((data) => {
          this.guapromoterLength = data.length;
        });
      this.sqliteProvider
        .getPresentAddress(this.guarantor[0].refId, this.guarantor[0].id)
        .then((data) => {
          this.guapresentAdrsLength = data.length;
        });
      this.sqliteProvider
        .getPermanentAddress(this.guarantor[0].refId, this.guarantor[0].id)
        .then((data) => {
          this.guapermaAdrsLength = data.length;
        });
      this.sqliteProvider
        .getPromoterProofDetails(this.guarantor[0].refId, this.guarantor[0].id)
        .then((data) => {
          this.guapromoProofLength = data.length;
        });
    }

    if (this.applicant.coAppFlag == 'Y') {
      this.sqliteProvider
        .getCoappDetails(this.coapplicants[0].refId)
        .then((data) => {
          this.coappLength = data.length;
        });
      this.sqliteProvider
        .getPresentAddress(this.coapplicants[0].refId, this.coapplicants[0].id)
        .then((data) => {
          this.coapppresentAdrsLength = data.length;
        });
      this.sqliteProvider
        .getPermanentAddress(
          this.coapplicants[0].refId,
          this.coapplicants[0].id
        )
        .then((data) => {
          this.coapppermaAdrsLength = data.length;
        });
      this.sqliteProvider
        .getPromoterProofDetails(
          this.coapplicants[0].refId,
          this.coapplicants[0].id
        )
        .then((data) => {
          this.coapppromoProofLength = data.length;
        });
    }
  }

  submitCall() {
    try {
      if (this.network.type == 'none' || this.network.type == 'unknown') {
        this.alertService.showAlert(
          'Alert!',
          'Please check your network connection!!!'
        );
      } else {
        if (this.iagree) {
          // this.submitLeads();
          if (this.applicant.coAppFlag == 'Y') {
            if (this.appCibilCheckStat == '1') {
              if (this.appHimarkCheckStat == '1') {
                if (this.coappCibilCheckStat) {
                  if (this.coappHimarkCheckStat) {
                    this.submitLeads();
                    // this.lottieSubmit();
                    // if (this.guaCibilCheckStat) {
                    //   if (this.guaHimarkCheckStat) {
                    //     this.submitLeads();
                    //     // this.lottieSubmit();
                    //   } else {
                    //     this.alertService.showAlert("Alert!", "Please complete all guarantor's hi-mark status!");
                    //   }
                    // } else {
                    //   this.alertService.showAlert("Alert!", "Please complete all guarantor's cibil status!");
                    // }
                  } else {
                    this.alertService.showAlert(
                      'Alert!',
                      "Please complete all co-applicant's hi-mark status!"
                    );
                  }
                } else {
                  this.alertService.showAlert(
                    'Alert!',
                    "Please complete all co-applicant's cibil status!"
                  );
                }
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  "Please complete applicant's hi-mark status!"
                );
              }
            } else {
              this.alertService.showAlert(
                'Alert!',
                "Please complete applicant's cibil status!"
              );
            }
          } else if (this.applicant.coAppFlag == 'Y') {
            if (this.appCibilCheckStat == '1') {
              if (this.appHimarkCheckStat == '1') {
                if (this.coappCibilCheckStat) {
                  if (this.coappHimarkCheckStat) {
                    this.submitLeads();
                    // this.lottieSubmit()
                  } else {
                    this.alertService.showAlert(
                      'Alert!',
                      "Please complete all co-applicant's hi-mark status!"
                    );
                  }
                } else {
                  this.alertService.showAlert(
                    'Alert!',
                    "Please complete all co-applicant's cibil status!"
                  );
                }
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  "Please complete applicant's hi-mark status!"
                );
              }
            } else {
              this.alertService.showAlert(
                'Alert!',
                "Please complete applicant's cibil status!"
              );
            }
          } else if (this.applicant.coAppFlag == 'N') {
            if (this.appCibilCheckStat == '1') {
              if (this.appHimarkCheckStat == '1') {
                this.submitLeads();
                // if (this.guaCibilCheckStat) {
                //   if (this.guaHimarkCheckStat) {
                //     // this.lottieSubmit()
                //   } else {
                //     this.alertService.showAlert("Alert!", "Please complete all guarantor's hi-mark status!");
                //   }
                // } else {
                //   this.alertService.showAlert("Alert!", "Please complete all guarantor's cibil status!");
                // }
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  "Please complete applicant's hi-mark status!"
                );
              }
            } else {
              this.alertService.showAlert(
                'Alert!',
                "Please complete applicant's cibil status!"
              );
            }
          } else if (this.applicant.coAppFlag == 'N') {
            if (this.appCibilCheckStat == '1') {
              if (this.appHimarkCheckStat == '1') {
                this.submitLeads();
                // this.lottieSubmit();
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  "Please complete applicant's hi-mark status!"
                );
              }
            } else {
              this.alertService.showAlert(
                'Alert!',
                "Please complete applicant's cibil status!"
              );
            }
          }
        } else {
          this.alertService.showAlert('Alert!', 'Please Agree Before Submit!');
        }
      }
    } catch (error) {
      console.log(error.message);
      this.alertService.showAlert('Alert!', error.message);
      this.sqliteProvider.addAuditTrail(
        format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        'submitCall',
        'submitCall',
        JSON.stringify(error)
      );
    }
  }

  async lottieSubmit() {
    console.log('lottie');
    let loading = await this.loadCtrl.create({ message: 'Please wait...' });
    loading.present();
    loading.dismiss();
    let modal = await this.modalCtrl.create({
      component: SubmitModalPage,
      componentProps: {
        showBackdrop: true,
        enableBackdropDismiss: false,
        cssClass: 'submit-modal',
      },
    });
    modal.onDidDismiss().then((data) => {
      console.log(data, 'submitmodal ondismiss');
      this.navCtrl.navigate(['/ExistingPage'], {
        queryParams: { username: this.username, _leadStatus: 'online' },
        skipLocationChange: true,
        replaceUrl: true,
      });
    });
    modal.present();
  }

  submitLeads1() {
    this.casaInit(this.applicationNumber);
    this.getAnnexImgs(this.service_data[0].serId);
    this.getServiceImgs(this.service_data[0].serId);
    this.getNachImgs(this.NACH_data[0].nachId);
    this.getVehicleDetails(this.applicationNumber);
  }

  getDealerMaster() {
    this.sqliteProvider
      .getDealerMasterData(localStorage.getItem('janaCenter'))
      .then((data) => {
        this.dummy_masterDealer = data;
      });
  }

  submitLeads() {
    try {
      console.log('submit leads');
      this.submitDisable = true;
      this.loadingService.globalLodingPresent('Please Wait...');
      // let loading = this.loadCtrl.create({
      //   content: 'Please wait...'
      // });
      // loading.present();
      // this.globalFunc.globalLodingPresent('Please wait...');
      if (this.submitStat === '1') {
        // loading.dismiss();
        // this.globalFunc.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'This Lead already Submitted!');
      } else {
        console.log(this.items, 'itemssss');
        // let dealerData = JSON.parse(this.items[0].dealerName)
        // const dealer = this.dummy_masterDealer.find(val => val.dealerCode == this.items[0].dealerName);
        console.log(this.applicantDetails, 'applicantDetails');
        console.log(this.coappFinal, 'coappFinal');
        console.log(this.productCode, 'productCode');
        console.log(this.docFinalReq, 'docFinalReq');
        this.sqliteProvider
          .getSubmitDetails(this.applicant.refId, this.applicant.id)
          .then((submitlead) => {
            if (
              submitlead[0].applicationNumber == '0' ||
              submitlead[0].applicationNumber == null ||
              submitlead[0].applicationNumber == ''
            ) {
              this.submitdata = {
                LeadMain: {
                  Lead: {
                    SchemeCode: this.productCode,
                    BranchCode: this.items[0].loginBranch,
                    LoanAmt: this.items[0].loanAmount,
                    LoginUserId: this.items[0].createdUser,
                    Tenor: this.items[0].tenure,
                    AppCreationdt: this.items[0].applDate,
                    prd_code: this.items[0].janaLoan,
                    source_branch: this.items[0].loginBranch,
                    Module: 'VL',
                    LMSLeadid: this.items[0].lmsLeadId || '',
                    // "DealerId": dealerData,   //this.items[0].dealerCode,
                    DealerId: this.items[0].dealerName,
                    TypeofTwoWheeler: this.items[0].vehicleType,
                    ProductcodeSelection: this.items[0].janaLoanName || '',
                    ApplicantType: this.items[0].applicType, //Changed
                    ApplicantDetails: this.applicantDetails,
                    CoApplicantDetails: this.coappFinal,
                    ReferenceDetails: this.referenceDetails,
                    LoanDetails: {
                      ProductId: this.items[0].janaLoan, //1556592 uat 1556531 local
                      LoanType: this.getLoanType(this.items[0].janaLoan),
                      LoanAmnt: this.items[0].loanAmount,
                      Insurancepremium: this.items[0].insPremium, //new
                      DBAmount: this.items[0].dbAmount, //new
                      Totaldownpay: this.items[0].totalDownPay, //new
                      IntType: this.items[0].interest,
                      LoanPurpose: this.items[0].purpose,
                      Tenor: this.items[0].tenure,
                      Installments: this.items[0].installment,
                      RecomLoanamt: this.items[0].loanAmount,
                      NachCharges: this.items[0].nachCharges, //new
                      MarginMoney: this.items[0].margin, //new
                      PeriodOfInstal: this.items[0].installment,
                      AdvanceEmiAmt: this.items[0].advanceEmi, //new
                      PddCharges: this.items[0].pddCharges, //new
                      Refinance: this.items[0].refinance,
                      HolidayPeriod: this.items[0].holiday,
                      ModeofPayment: this.items[0].repayMode,
                      prdMainCat: this.items[0].prdSche,
                      prdSubCat: this.items[0].janaLoan,
                      IntRate: this.items[0].intRate, //total dp,ins prem, db amount,eligible amount
                      Vehicletype: this.items[0].vehicleType,
                      ElectricVehicle: this.items[0].electricVehicle, //new
                      ProcessingFee: this.items[0].processingFee
                        .toString()
                        .split('.')[0], //new
                      GstPf: this.items[0].gstonPf.toString().split('.')[0], //new
                      StampDuty: this.items[0].stampDuty, //new
                      GstSdc: this.items[0].gstonSdc, //new
                      GstNach: this.items[0].gstonNach, //new
                      GstPdd: this.items[0].gstonPddCharges, //new
                      DocCharges: this.items[0].otherCharges, //new
                      GstotherCharges: this.items[0].gstonOtherCharges, //new
                      SegmentType: this.items[0].segmentType, //new
                      EmiAmt: this.items[0].emi, //new
                      AdvInstallment: this.items[0].advavceInst, //new
                      BorrhealthIns: this.items[0].borHealthIns, //new
                      CoborrhealthIns: this.items[0].coBorHealthIns, //new
                      Emimode: this.items[0].emiMode, //new
                      Preemi: '0', //new

                      DBdate: this.convertdate(this.items[0].dbDate),
                      PreEmiDB: this.items[0].preEmiDB,
                      TotalLoanAmt: this.items[0].totalloanAmount,
                    },
                    // "DocumentList": this.finalDocForFinalSub
                  },
                },
              };
              // let dateTime = new Date();
              // let curDateTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
              // console.log(this.submitdata, 'submit data before call');
              // console.log(JSON.stringify(this.submitdata), 'finalSubmission');
              this.master
                .restApiCallAngular('finalSubmission', this.submitdata)
                .then(
                  async (data) => {
                    console.log('Sent data to web  => ', this.submitdata);
                    if ((<any>data).LeadResMain.SuccessMsg === '000') {
                      let submitResponse = (<any>data).LeadResMain;
                      // loading.dismiss();
                      this.loadingService.globalLodingDismiss();
                      this.applicationNumber = (<any>data).LeadResMain.AppNo;
                      // this.submitStat = 1;
                      // this.sqliteProvider.updateSubmitDetails(this.appCibilCheckStat, this.submitStat, this.applicationNumber, this.applicationStatus, this.appCibilColor, this.appCibilScore, this.appStatId);
                      if (submitResponse.CustomerDetails.length < 1) {
                        let customerDetailsApi: any;
                        try {
                          customerDetailsApi =
                            await this.master.restApiCallAngular(
                              'getVLcustdetails',
                              { propNo: this.applicationNumber }
                            );
                        } catch (error) {
                          console.log(error);
                          customerDetailsApi = { ErrorCode: '111' };
                        }
                        if (customerDetailsApi.ErrorCode == '000') {
                          this.sqliteProvider.updateNewSubmitDetails(
                            this.applicationNumber,
                            customerDetailsApi.CustomerDetails[0].SfosLeadId,
                            customerDetailsApi.CustomerDetails[0].LpLeadId,
                            customerDetailsApi.CustomerDetails[0].LpUrn,
                            customerDetailsApi.CustomerDetails[0].LpCustid,
                            this.applicant.refId,
                            this.applicant.id,
                            'A'
                          );
                          if (customerDetailsApi.CustomerDetails.length > 1) {
                            for (
                              let i = 1;
                              i < customerDetailsApi.CustomerDetails.length;
                              i++
                            ) {
                              this.sqliteProvider.updateNewSubmitDetails(
                                this.applicationNumber,
                                customerDetailsApi.CustomerDetails[i]
                                  .SfosLeadId,
                                customerDetailsApi.CustomerDetails[i].LpLeadId,
                                customerDetailsApi.CustomerDetails[i].LpUrn,
                                customerDetailsApi.CustomerDetails[i].LpCustid,
                                this.applicant.refId,
                                this.coapplicants[i - 1].id,
                                'C'
                              );
                            }
                          }
                        } else {
                          this.alertService.showAlert(
                            'Alert!',
                            'Customer Id is not received'
                          );
                        }
                      } else {
                        this.sqliteProvider.updateNewSubmitDetails(
                          this.applicationNumber,
                          submitResponse.CustomerDetails[0].SfosLeadId,
                          submitResponse.CustomerDetails[0].LpLeadId,
                          submitResponse.CustomerDetails[0].LpUrn,
                          submitResponse.CustomerDetails[0].LpCustid,
                          this.applicant.refId,
                          this.applicant.id,
                          'A'
                        );
                        if (submitResponse.CustomerDetails.length > 1) {
                          for (
                            let i = 1;
                            i < submitResponse.CustomerDetails.length;
                            i++
                          ) {
                            this.sqliteProvider.updateNewSubmitDetails(
                              this.applicationNumber,
                              submitResponse.CustomerDetails[i].SfosLeadId,
                              submitResponse.CustomerDetails[i].LpLeadId,
                              submitResponse.CustomerDetails[i].LpUrn,
                              submitResponse.CustomerDetails[i].LpCustid,
                              this.applicant.refId,
                              this.coapplicants[i - 1].id,
                              'C'
                            );
                          }
                        }
                      }
                      // this.globalFunc.globalLodingDismiss();
                      // this.casaInit(this.applicationNumber);

                      if (this.CASA_data[0].janaAcc == 'Y') {
                        this.getAnnexImgs(this.service_data[0].serId);
                        this.getServiceImgs(this.service_data[0].serId);
                      }

                      // this.getNachImgs(this.NACH_data[0].nachId);
                      // this.loading.dismiss();

                      if (submitlead[0].docUploadStatus == 'Y') {
                        this.casaInit(this.applicationNumber);
                      } else {
                        this.getDocumentStatusCheck().then((data) => {
                          if (data == true) {
                            this.casaInit(this.applicationNumber);
                          }
                        });
                      }

                      (await this.loading).dismiss();
                      // }
                      this.submitResult = (<any>data).LeadResMain;
                      // this.submitStat = 1;
                      this.applicationStatus = (<any>(
                        data
                      )).LeadResMain.AppStatus;
                      // this.navCtrl.push(ExistApplicationsPage);
                    } else if ((<any>data).LeadResMain.SuccessMsg === '002') {
                      // this.getImdImgs(this.IMD_data[0].imdId, (<any>data).LeadResMain.AppNo);
                      // this.globalFunc.globalLodingDismiss();

                      // this.getNachImgs(this.NACH_data[0].nachId);

                      //new code
                      let submitResponse = (<any>data).LeadResMain;
                      this.applicationNumber = (<any>data).LeadResMain.AppNo;
                      if (submitResponse.CustomerDetails.length < 1) {
                        let customerDetailsApi: any;
                        try {
                          customerDetailsApi =
                            await this.master.restApiCallAngular(
                              'getVLcustdetails',
                              { propNo: this.applicationNumber }
                            );
                        } catch (error) {
                          console.log(error);
                          customerDetailsApi = { ErrorCode: '111' };
                        }
                        if (customerDetailsApi.ErrorCode == '000') {
                          this.sqliteProvider.updateNewSubmitDetails(
                            this.applicationNumber,
                            customerDetailsApi.CustomerDetails[0].SfosLeadId,
                            customerDetailsApi.CustomerDetails[0].LpLeadId,
                            customerDetailsApi.CustomerDetails[0].LpUrn,
                            customerDetailsApi.CustomerDetails[0].LpCustid,
                            this.applicant.refId,
                            this.applicant.id,
                            'A'
                          );
                          if (customerDetailsApi.CustomerDetails.length > 1) {
                            for (
                              let i = 1;
                              i < customerDetailsApi.CustomerDetails.length;
                              i++
                            ) {
                              this.sqliteProvider.updateNewSubmitDetails(
                                this.applicationNumber,
                                customerDetailsApi.CustomerDetails[i]
                                  .SfosLeadId,
                                customerDetailsApi.CustomerDetails[i].LpLeadId,
                                customerDetailsApi.CustomerDetails[i].LpUrn,
                                customerDetailsApi.CustomerDetails[i].LpCustid,
                                this.applicant.refId,
                                this.coapplicants[i - 1].id,
                                'C'
                              );
                            }
                          }
                        } else {
                          this.alertService.showAlert(
                            'Alert!',
                            'Customer Id is not received'
                          );
                        }
                      } else {
                        this.sqliteProvider.updateNewSubmitDetails(
                          this.applicationNumber,
                          submitResponse.CustomerDetails[0].SfosLeadId,
                          submitResponse.CustomerDetails[0].LpLeadId,
                          submitResponse.CustomerDetails[0].LpUrn,
                          submitResponse.CustomerDetails[0].LpCustid,
                          this.applicant.refId,
                          this.applicant.id,
                          'A'
                        );
                        if (submitResponse.CustomerDetails.length > 1) {
                          for (
                            let i = 1;
                            i < submitResponse.CustomerDetails.length;
                            i++
                          ) {
                            this.sqliteProvider.updateNewSubmitDetails(
                              this.applicationNumber,
                              submitResponse.CustomerDetails[i].SfosLeadId,
                              submitResponse.CustomerDetails[i].LpLeadId,
                              submitResponse.CustomerDetails[i].LpUrn,
                              submitResponse.CustomerDetails[i].LpCustid,
                              this.applicant.refId,
                              this.coapplicants[i - 1].id,
                              'C'
                            );
                          }
                        }
                      }

                      if (this.CASA_data[0].janaAcc == 'Y') {
                        this.getAnnexImgs(this.service_data[0].serId);
                        this.getServiceImgs(this.service_data[0].serId);
                      }
                      this.applicationNumber = (<any>data).LeadResMain.AppNo;
                      // this.sqliteProvider.updateSubmitLeadDetails(this.applicationNumber, this.appStatId);
                      if (submitlead[0].docUploadStatus == 'Y') {
                        if (submitlead[0].CASA == '0') {
                          this.casaInit(this.applicationNumber);
                        } else if (submitlead[0].vehicleSub == '0') {
                          this.getVehicleDetails(this.applicationNumber);
                        } else {
                          // new
                          this.other_docs = [];
                          // this.getImdImgs(this.IMD_data[0].imdId, this.applicationNumber);
                          // this.getNachImgs(this.NACH_data[0].nachId);
                          if (this.CASA_data[0].janaAcc == 'Y') {
                            this.getAnnexImgs(this.service_data[0].serId);
                            this.getServiceImgs(this.service_data[0].serId);
                          }
                        }
                      } else {
                        this.getDocumentStatusCheck().then((data) => {
                          if (data == true) {
                            if (submitlead[0].CASA == '0') {
                              this.casaInit(this.applicationNumber);
                            } else if (submitlead[0].vehicleSub == '0') {
                              this.getVehicleDetails(this.applicationNumber);
                            } else {
                              this.other_docs = [];
                              // this.getImdImgs(this.IMD_data[0].imdId, this.applicationNumber);
                              // this.getNachImgs(this.NACH_data[0].nachId);
                              if (this.CASA_data[0].janaAcc == 'Y') {
                                this.getAnnexImgs(this.service_data[0].serId);
                                this.getServiceImgs(this.service_data[0].serId);
                              }
                            }
                          }
                        });
                      }

                      // else if (submitlead[0].NACH == "0") {
                      //   this.NACHinit(this.applicationNumber);
                      // }
                    } else {
                      // loading.dismiss();
                      // this.globalFunc.globalLodingDismiss();
                      this.submitResult = undefined;
                      this.submitDisable = false;
                      this.alertService.showAlert(
                        'Alert!',
                        'Application Submission Failed!'
                      );
                    }
                  },
                  (err) => {
                    // loading.dismiss();
                    // this.globalFunc.globalLodingDismiss();
                    this.submitDisable = false;
                    this.alertService.showAlert(
                      'Alert!',
                      'No Response from Server!'
                    );
                    // this.modalCtrl.create(SubmitModalPage, {}, { showBackdrop: true, enableBackdropDismiss: false });
                  }
                );
            } else {
              this.applicationNumber = submitlead[0].applicationNumber;
              // this.sqliteProvider.updateSubmitLeadDetails(this.applicationNumber, this.appStatId);
              this.other_docs = [];
              // this.getImdImgs(this.IMD_data[0].imdId, this.applicationNumber);
              // this.getNachImgs(this.NACH_data[0].nachId);
              if (this.CASA_data[0].janaAcc == 'Y') {
                this.getAnnexImgs(this.service_data[0].serId);
                this.getServiceImgs(this.service_data[0].serId);
              }

              if (submitlead[0].docUploadStatus == 'Y') {
                if (submitlead[0].CASA == '0') {
                  this.casaInit(this.applicationNumber);
                } else if (submitlead[0].vehicleSub == '0') {
                  this.getVehicleDetails(this.applicationNumber);
                }
                // else if (submitlead[0].NACH == "0") {
                //   this.NACHinit(this.applicationNumber);
                // }
                else {
                  this.other_docs = [];
                  // this.getImdImgs(this.IMD_data[0].imdId, this.applicationNumber);
                  // this.getNachImgs(this.NACH_data[0].nachId);
                  if (this.CASA_data[0].janaAcc == 'Y') {
                    this.getAnnexImgs(this.service_data[0].serId);
                    this.getServiceImgs(this.service_data[0].serId);
                  }
                }
              } else {
                this.getDocumentStatusCheck().then((data) => {
                  if (data == true) {
                    if (submitlead[0].CASA == '0') {
                      this.casaInit(this.applicationNumber);
                    } else if (submitlead[0].vehicleSub == '0') {
                      this.getVehicleDetails(this.applicationNumber);
                    }
                    // else if (submitlead[0].NACH == "0") {
                    //   this.NACHinit(this.applicationNumber);
                    // }
                    else {
                      this.other_docs = [];
                      // this.getImdImgs(this.IMD_data[0].imdId, this.applicationNumber);
                      // this.getNachImgs(this.NACH_data[0].nachId);
                      if (this.CASA_data[0].janaAcc == 'Y') {
                        this.getAnnexImgs(this.service_data[0].serId);
                        this.getServiceImgs(this.service_data[0].serId);
                      }
                    }
                  }
                });
              }

              // loading.dismiss();
              // this.globalFunc.globalLodingDismiss();
            }
          })
          .catch((err) => {
            // loading.dismiss();
            // this.globalFunc.globalLodingDismiss();
            this.submitResult = undefined;
            this.submitDisable = false;
            console.log('Err', err);
            this.alertService.showAlert(
              'Alert!',
              'Submission is not happen!!!!'
            );
          });
      }
    } catch (error) {
      console.log(error.message);
      this.alertService.showAlert('Alert!', error.message);
      this.sqliteProvider.addAuditTrail(
        format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        'submitleads',
        'submitleads',
        JSON.stringify(error)
      );
    }
  }

  async loadAllApplicantDetails() {
    this.sqliteProvider
      .getGivenKarzaDetailsByLeadid(this.applicant.leadId)
      .then(async (kar) => {
        if (kar.length > 0) {
          this.custName = kar[0].name;
          this.leadIdType = kar[0].idType;
          this.leadIdValue = kar[0].idNumber;
          this.leadIdExpiry = kar[0].idExpiry;
        } else {
          this.custName = '';
        }
        await this.sqlSupport
          .getEKYCDetails(this.applicant.coAppGuaId)
          .then((data) => {
            if (data.length > 0) {
              if (data[0].aespFlag && data[0].aespFlag.length > 0) {
                this.appAespFlag = data[0].aespFlag;
              } else {
                this.appAespFlag = '';
              }
            } else this.appAespFlag = '';
          });
        // await this.sqlSupport.getEKYCDetails(this.applicant.leadId).then(data =>
        //   data.length > 0 && data[0].aespFlag.length > 0 ? this.appAespFlag = data[0].aespFlag : this.appAespFlag = '')
        this.sqliteProvider
          .getEntityDetails(this.applicant.refId, this.applicant.id)
          .then((ent) => {
            if (ent.length > 0) {
              this.sqliteProvider
                .getNonIndSubmitDataDetails(this.applicant.refId)
                .then((data) => {
                  this.items = [];
                  this.items = data;
                  let custURN;
                  console.log('Applicant array -', this.items);
                  this.productCode = this.getJanaProductCode(
                    this.items[0].janaLoan
                  );
                  // this.base64.encodeFile(this.items[0].profPic).then((base64File: string) => {
                  this.promoterpic = this.items[0].profPic;
                  // this.base64.encodeFile(this.items[0].entiProfPic).then((entity: string) => {
                  this.entitypic = this.items[0].entiProfPic;
                  this.signpic = this.items[0].signPic;
                  this.sqliteProvider
                    .getPromoterProofDetails(
                      this.items[0].refId,
                      this.items[0].id
                    )
                    .then((docs) => {
                      this.applicantDocs = docs;
                      // console.log("AppExistingUniquenum ",this.items[0].URNnumber);
                      if (docs.length > 0) {
                        let dlExpiry;
                        let other;
                        let passExpiry;
                        let passOther;
                        if (
                          this.getAppDocNumber('DRIVING LICENSE').promoexpiry ==
                          undefined
                        ) {
                          dlExpiry = '';
                          other = '';
                        } else {
                          dlExpiry =
                            this.getAppDocNumber(
                              'DRIVING LICENSE'
                            ).promoexpiry.substring(8, 10) +
                            '/' +
                            this.getAppDocNumber(
                              'DRIVING LICENSE'
                            ).promoexpiry.substring(5, 7) +
                            '/' +
                            this.getAppDocNumber(
                              'DRIVING LICENSE'
                            ).promoexpiry.substring(0, 4);
                          other = '1';
                        }
                        if (
                          this.getAppDocNumber('PASSPORT').promoexpiry ==
                          undefined
                        ) {
                          passExpiry = '';
                          passOther = '';
                        } else {
                          passExpiry =
                            this.getAppDocNumber(
                              'PASSPORT'
                            ).promoexpiry.substring(8, 10) +
                            '/' +
                            this.getAppDocNumber(
                              'PASSPORT'
                            ).promoexpiry.substring(5, 7) +
                            '/' +
                            this.getAppDocNumber(
                              'PASSPORT'
                            ).promoexpiry.substring(0, 4);
                          passOther = '1';
                        }
                        custURN =
                          this.items[0].applicType == 'New'
                            ? null
                            : this.items[0].URNnumber;
                        this.applicantDetails = [
                          {
                            //add spouse, altmob num, languages
                            // "PromoterFlag": "Y",
                            Title: this.items[0].genTitle,
                            // "Constitution": "",
                            CustType: '1',
                            FirstName: this.items[0].firstname,
                            MiddleName: this.items[0].middlename,
                            lastName: this.items[0].lastname,
                            DOB:
                              this.items[0].dob.substring(8, 10) +
                              '/' +
                              this.items[0].dob.substring(5, 7) +
                              '/' +
                              this.items[0].dob.substring(0, 4),
                            Gender: this.items[0].gender,
                            FatherName: this.items[0].fathername,
                            MotherMaidenName: this.items[0].mothername,
                            MobileNo: this.globalFunc.basicDec(
                              this.items[0].mobNum
                            ),
                            //"PANAvailable": this.items[0].panAvailable,                       //chang
                            // "PANNo": this.getAppDocNumber("PAN CARD").promoIDRef || "",
                            PANNo: this.globalFunc.basicDec(
                              this.items[0].panNum
                            ),
                            // "CustomerNameperKYC": this.custName,
                            EmploymentStatus: this.items[0].employment,
                            // "ExperienceinYrs": this.items[0].experience,
                            DeclrAnnInc: this.items[0].annualIncome,
                            Caste: this.items[0].caste,
                            Religion: this.items[0].religion,
                            Education: this.items[0].education,
                            MaritalStatus: this.items[0].marital,
                            AppExistingUniquenum: custURN,
                            // "AppExistingUniquenum": this.items[0].URNnumber,
                            AppImage: this.promoterpic,
                            signatureImage: this.signpic,
                            // "BusinessDescription": this.items[0].busiDesc,
                            SourcingChannel: this.items[0].sourChannel,
                            // "TypeofCase": this.items[0].typeCase,
                            // "BalanceTransfer": this.items[0].balTrans,
                            // "ExistingCustomer": this.items[0].custType == 'E' ? 'Y' : 'N',
                            SourcingID:
                              this.items[0].sourIdName ||
                              this.items[0].sourIdName1 ||
                              '',
                            JanaRefID:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('AADHAR CARD').promoIDRef
                              ) || '', //Chang
                            aespFlag: this.appAespFlag,
                            leadId: this.items[0].coAppGuaId,
                            VoterId:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('VOTER ID').promoIDRef
                              ) || '', //Chang
                            PassportNo:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('PASSPORT').promoIDRef
                              ) || '', //Chang
                            PassportExpiry: passExpiry || '',
                            DrivingLcno:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('DRIVING LICENSE')
                                  .promoIDRef
                              ) || '', //new
                            dlExpiry: dlExpiry || '', //newz
                            NegraIdvalue:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('NREGA').promoIDRef
                              ) || '', //new
                            OtherIdType: this.leadIdType || '', //new
                            OtherIdvalue:
                              this.globalFunc.basicDec(this.leadIdValue) || '', //new
                            OtherIdExpireDate: this.leadIdExpiry || '', //new
                            emailId: this.globalFunc.basicDec(
                              this.items[0].email
                            ),
                            SpouseName: '',
                            AlternateMobno: '',
                            Vehicletype: '',
                            ElectricVehicle: '',
                            Language: '',
                            Qualification: '',
                            YearsattheResidence: '',
                            AadharFlag: '',
                            appForm60: this.items[0].panAvailable, //chang
                            Coapplicantrequired: '',
                            EmployeeID: '',
                            PresentEmployerName: '',
                            Designation: '',
                            JoiningDate: '',
                            TotalExperience: '',
                            MontlySalary: '',
                            NameServiceBusiness: '',
                            DetailsActivity: '',
                            MontlyIncome: '',
                            VintageServiceBusiness: '',
                            LineManagerName: '',
                            LineManagerEmail: '',
                            ResidentialStatus: '',
                            form60: this.globalFunc.basicDec(
                              this.items[0].form60
                            ),
                            EkycFlag: this.items[0].janaRefId
                              ? 'Positive'
                              : 'Negative',
                            CustomerNameasperEkyc: this.items[0].nameAsPerEkyc
                              ? this.items[0].nameAsPerEkyc
                              : '',
                            aadharChangedFlag: this.items[0].ShowAadharDob,
                            aadharDob: this.items[0].dobAadhar
                              ? this.items[0].dobAadhar
                              : '',
                            aadharDobDocument: this.items[0].dobDocument
                              ? this.items[0].dobDocument
                              : '',
                            NameAsPerPan: this.items[0].panName,
                            DobAsPerPan:
                              this.items[0].panValidation == 'Y'
                                ? this.items[0].dob.substring(8, 10) +
                                  '/' +
                                  this.items[0].dob.substring(5, 7) +
                                  '/' +
                                  this.items[0].dob.substring(0, 4)
                                : '',
                            PanValidation: this.items[0].panValidation || '',
                            NameValidation: this.items[0].nameValidation || '',
                            DOBValidation: this.items[0].DOBValidation || '',
                            SeedingStatus: this.items[0].seedingStatus || '',
                            loanUpiId: this.items[0].upiNo || '',
                            upiNameAsPerBank: this.items[0].nameupi || '',
                            upiValidate:
                              this.items[0].nameupi &&
                              this.items[0].nameupi.length > 0
                                ? 'Y'
                                : 'N',
                            CustomerAddressDetails: [
                              {
                                AddressType: '1',
                                Address1: this.globalFunc.basicDec(
                                  this.items[0].perm_plots
                                ),
                                Address2: this.globalFunc.basicDec(
                                  this.items[0].perm_locality
                                ),
                                Address3: this.globalFunc.basicDec(
                                  this.items[0].perm_line3
                                ),
                                city: this.globalFunc.basicDec(
                                  this.items[0].perm_cities
                                ),
                                State: this.globalFunc.basicDec(
                                  this.items[0].perm_states
                                ),
                                pincode: this.globalFunc.basicDec(
                                  this.items[0].perm_pincode
                                ),
                                landmark: this.items[0].perm_landmark,
                                YearIncurrentCity:
                                  this.items[0].perm_yrsCurCity,
                                AddrAsPerKyc: this.items[0].perm_permAdrsKYC,
                                OtherDoc: this.items[0].perm_manualEntry,
                              },
                              {
                                AddressType: '2',
                                Address1: this.globalFunc.basicDec(
                                  this.items[0].pres_plots
                                ),
                                Address2: this.globalFunc.basicDec(
                                  this.items[0].pres_locality
                                ),
                                Address3: this.globalFunc.basicDec(
                                  this.items[0].pres_line3
                                ),
                                city: this.globalFunc.basicDec(
                                  this.items[0].pres_cities
                                ),
                                State: this.globalFunc.basicDec(
                                  this.items[0].pres_states
                                ),
                                pincode: this.globalFunc.basicDec(
                                  this.items[0].pres_pincode
                                ),
                                landmark: this.items[0].pres_landmark,
                                YearIncurrentCity:
                                  this.items[0].pres_yrsCurCity,
                                AddrAsPerKyc: this.items[0].pres_presmAdrsKYC,
                                OtherDoc: this.items[0].pres_manualEntry,
                              },
                              {
                                AddressType: this.items[0].busi_type,
                                Address1: this.items[0].busi_plots,
                                Address2: this.items[0].busi_locality,
                                Address3: this.items[0].busi_line3,
                                city: JSON.parse(this.items[0].busi_cities),
                                State: JSON.parse(this.items[0].busi_states),
                                pincode: this.items[0].busi_pincode,
                                landmark: this.items[0].busi_landmark,
                                YearIncurrentCity:
                                  this.items[0].busi_yrsCurCity,
                              },
                            ],
                          },
                          {
                            Constitution: this.items[0].constitution || '',
                            CustType: '2',
                            PromoterFlag: 'N',
                            EntityName: this.items[0].enterName || '',
                            CIN: this.items[0].cin || '',
                            RegistrationNo: this.items[0].regNo || '',
                            GSTIN: this.items[0].gst || '',
                            DateofIncorporation:
                              this.items[0].doi.substring(8, 10) +
                                '/' +
                                this.items[0].doi.substring(5, 7) +
                                '/' +
                                this.items[0].doi.substring(0, 4) || '',
                            BusinessVintage: this.items[0].busiVintage || '',
                            ShopOwnership: this.items[0].ownership || '',
                            IndustryType: this.items[0].industry || '',
                            NatureofBusiness: this.items[0].enterprise || '',
                            AppImage: this.entitypic,
                            BusinessDescription: this.items[0].busiDesc,
                            SourcingChannel: this.items[0].sourChannel,
                            TypeofCase: this.items[0].typeCase,
                            BalanceTransfer: this.items[0].balTrans,
                            SourcingID:
                              this.items[0].sourIdName ||
                              this.items[0].sourIdName1 ||
                              '',
                            ExistingCustomer: 'N',
                            leadId: this.items[0].applicantUniqueId,
                            CustomerAddressDetails: [
                              {
                                AddressType: '1',
                                Address1: '',
                                Address2: '',
                                Address3: '',
                                city: '',
                                State: '',
                                pincode: '',
                              },
                              {
                                AddressType: '2',
                                Address1: '',
                                Address2: '',
                                Address3: '',
                                city: '',
                                State: '',
                                pincode: '',
                              },
                            ],
                          },
                        ];
                      } else {
                        this.applicantDocs = [];
                      }
                    });
                  //   }, (err) => {
                  //     console.log(err);
                  //   });
                  // }, (err) => {
                  //   console.log(err);
                  // });
                })
                .catch((e) => {
                  console.log('er' + e);
                  this.items = [];
                });
            } else {
              this.sqliteProvider
                .getSubmitDataDetails(this.applicant.refId)
                .then((data) => {
                  this.items = [];
                  this.items = data;
                  this.vehicleType = data[0].vehicleType;
                  let joinDate;
                  let custURN;
                  this.productCode = this.getJanaProductCode(
                    this.items[0].janaLoan
                  );
                  // this.base64.encodeFile(this.items[0].profPic).then((base64File: string) => {
                  this.promoterpic = this.items[0].profPic;
                  this.signpic = this.items[0].signPic;
                  this.sqliteProvider
                    .getPromoterProofDetails(
                      this.items[0].refId,
                      this.items[0].id
                    )
                    .then((docs) => {
                      if (docs.length > 0) {
                        this.applicantDocs = docs;
                        let dlExpiry;
                        let other;
                        let passExpiry;
                        let passOther;
                        if (
                          this.getAppDocNumber('DRIVING LICENSE').promoexpiry ==
                          undefined
                        ) {
                          dlExpiry = '';
                          other = '';
                        } else {
                          dlExpiry =
                            this.getAppDocNumber(
                              'DRIVING LICENSE'
                            ).promoexpiry.substring(8, 10) +
                            '/' +
                            this.getAppDocNumber(
                              'DRIVING LICENSE'
                            ).promoexpiry.substring(5, 7) +
                            '/' +
                            this.getAppDocNumber(
                              'DRIVING LICENSE'
                            ).promoexpiry.substring(0, 4);
                          other = '1';
                        }
                        if (
                          this.getAppDocNumber('PASSPORT').promoexpiry ==
                          undefined
                        ) {
                          passExpiry = '';
                          passOther = '';
                        } else {
                          passExpiry =
                            this.getAppDocNumber(
                              'PASSPORT'
                            ).promoexpiry.substring(8, 10) +
                            '/' +
                            this.getAppDocNumber(
                              'PASSPORT'
                            ).promoexpiry.substring(5, 7) +
                            '/' +
                            this.getAppDocNumber(
                              'PASSPORT'
                            ).promoexpiry.substring(0, 4);
                          passOther = '1';
                        }
                        custURN =
                          this.items[0].applicType == 'New'
                            ? null
                            : this.items[0].URNnumber;
                        this.applicantDetails = [
                          {
                            // "PromoterFlag": "Y",
                            Title: this.items[0].genTitle,
                            // "Constitution": "",
                            CustType: '1',
                            FirstName: this.items[0].firstname,
                            MiddleName: this.items[0].middlename,
                            lastName: this.items[0].lastname,
                            DOB:
                              this.items[0].dob.substring(8, 10) +
                              '/' +
                              this.items[0].dob.substring(5, 7) +
                              '/' +
                              this.items[0].dob.substring(0, 4),
                            Gender: this.items[0].gender,
                            FatherName: this.items[0].fathername,
                            MotherMaidenName: this.items[0].mothername,
                            MobileNo: this.globalFunc.basicDec(
                              this.items[0].mobNum
                            ),
                            //"PANAvailable": this.items[0].panAvailable,                          //Chang
                            PANNo: this.globalFunc.basicDec(
                              this.items[0].panNum
                            ),
                            // "CustomerNameperKYC": this.custName,
                            EmploymentStatus: this.items[0].employment,
                            // "ExperienceinYrs": this.items[0].experience,
                            DeclrAnnInc: this.items[0].annualIncome,
                            Caste: this.items[0].caste,
                            Religion: this.items[0].religion,
                            Education: this.items[0].education, //Chang
                            MaritalStatus: this.items[0].marital,
                            AppExistingUniquenum: custURN,
                            // "AppExistingUniquenum": this.items[0].URNnumber,
                            AppImage: this.promoterpic,
                            signatureImage: this.signpic,
                            // "BusinessDescription": this.items[0].busiDesc,
                            SourcingChannel: this.items[0].sourChannel,
                            // "TypeofCase": this.items[0].typeCase,
                            // "BalanceTransfer": this.items[0].balTrans,
                            // "ExistingCustomer": this.items[0].custType == 'E' ? 'Y' : 'N',
                            SourcingID:
                              this.items[0].sourIdName ||
                              this.items[0].sourIdName1 ||
                              '',
                            JanaRefID:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('AADHAR CARD').promoIDRef
                              ) || '', //Chang
                            aespFlag: this.appAespFlag,
                            leadId: this.items[0].coAppGuaId,
                            VoterId:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('VOTER ID').promoIDRef
                              ) || '', //Chang
                            PassportNo:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('PASSPORT').promoIDRef
                              ) || '', //new
                            PassportExpiry: passExpiry || '',
                            DrivingLcno:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('DRIVING LICENSE')
                                  .promoIDRef
                              ) || '', //new
                            dlExpiry: dlExpiry || '', //newz
                            NegraIdvalue:
                              this.globalFunc.basicDec(
                                this.getAppDocNumber('NREGA').promoIDRef
                              ) || '', //new
                            OtherIdType: this.leadIdType || '', //new
                            OtherIdvalue:
                              this.globalFunc.basicDec(this.leadIdValue) || '', //new
                            OtherIdExpireDate: this.leadIdExpiry || '', //new
                            emailId: this.globalFunc.basicDec(
                              this.items[0].email
                            ),
                            SpouseName: this.items[0].spouseName,
                            AlternateMobno: this.globalFunc.basicDec(
                              this.items[0].altMobNum
                            ),
                            Vehicletype: this.items[0].vehicleType,
                            ElectricVehicle: this.items[0].electricVehicle,
                            Language: this.items[0].languages,
                            Qualification: this.items[0].education,
                            YearsattheResidence: this.items[0].perm_yrsCurCity,
                            AadharFlag: 'N',
                            appForm60: this.items[0].panAvailable, //chang
                            Coapplicantrequired: this.items[0].coAppFlag,
                            EmployeeID: this.items[0].employeeId,
                            PresentEmployerName: this.items[0].employerName,
                            Designation: this.items[0].designation,
                            JoiningDate: this.items[0].joinDate
                              ? this.items[0].joinDate
                                  .split('-')
                                  .reverse()
                                  .join('/')
                              : '', // change format
                            TotalExperience: this.items[0].experience,
                            MontlySalary: this.items[0].monthSalary,
                            NameServiceBusiness: this.items[0].bussName,
                            DetailsActivity: this.items[0].actDetail,
                            MontlyIncome: this.items[0].monthIncome,
                            VintageServiceBusiness: this.items[0].vinOfServ,
                            LineManagerName: this.items[0].lmName, //changed
                            LineManagerEmail: this.globalFunc.basicDec(
                              this.items[0].lmEmail
                            ), //changed
                            ResidentialStatus: this.items[0].resciStatus, //changed
                            form60: this.globalFunc.basicDec(
                              this.items[0].form60
                            ),
                            EkycFlag: this.items[0].janaRefId
                              ? 'Positive'
                              : 'Negative',
                            CustomerNameasperEkyc: this.items[0].nameAsPerEkyc
                              ? this.items[0].nameAsPerEkyc
                              : '',
                            aadharChangedFlag: this.items[0].ShowAadharDob,
                            aadharDob: this.items[0].dobAadhar
                              ? this.items[0].dobAadhar
                              : '',
                            aadharDobDocument: this.items[0].dobDocument
                              ? this.items[0].dobDocument
                              : '',
                            NameAsPerPan: this.items[0].panName,
                            DobAsPerPan:
                              this.items[0].panValidation == 'Y'
                                ? this.items[0].dob.substring(8, 10) +
                                  '/' +
                                  this.items[0].dob.substring(5, 7) +
                                  '/' +
                                  this.items[0].dob.substring(0, 4)
                                : '',
                            PanValidation: this.items[0].panValidation,
                            NameValidation: this.items[0].nameValidation,
                            DOBValidation: this.items[0].DOBValidation,
                            SeedingStatus: this.items[0].seedingStatus,
                            loanUpiId: this.items[0].upiNo || '',
                            upiNameAsPerBank: this.items[0].nameupi || '',
                            upiValidate:
                              this.items[0].nameupi &&
                              this.items[0].nameupi.length > 0
                                ? 'Y'
                                : 'N',
                            CustomerAddressDetails: [
                              {
                                AddressType: '1',
                                Address1: this.globalFunc.basicDec(
                                  this.items[0].perm_plots
                                ),
                                Address2: this.globalFunc.basicDec(
                                  this.items[0].perm_locality
                                ),
                                Address3: this.globalFunc.basicDec(
                                  this.items[0].perm_line3
                                ),
                                city: this.globalFunc.basicDec(
                                  this.items[0].perm_cities
                                ),
                                State: this.globalFunc.basicDec(
                                  this.items[0].perm_states
                                ),
                                pincode: this.globalFunc.basicDec(
                                  this.items[0].perm_pincode
                                ),
                                landmark: this.items[0].perm_landmark,
                                YearIncurrentCity:
                                  this.items[0].perm_yrsCurCity,
                                AddrAsPerKyc: this.items[0].perm_permAdrsKYC,
                                OtherDoc: this.items[0].perm_manualEntry,
                              },
                              {
                                AddressType: '2',
                                Address1: this.globalFunc.basicDec(
                                  this.items[0].pres_plots
                                ),
                                Address2: this.globalFunc.basicDec(
                                  this.items[0].pres_locality
                                ),
                                Address3: this.globalFunc.basicDec(
                                  this.items[0].pres_line3
                                ),
                                city: this.globalFunc.basicDec(
                                  this.items[0].pres_cities
                                ),
                                State: this.globalFunc.basicDec(
                                  this.items[0].pres_states
                                ),
                                pincode: this.globalFunc.basicDec(
                                  this.items[0].pres_pincode
                                ),
                                landmark: this.items[0].pres_landmark,
                                YearIncurrentCity:
                                  this.items[0].pres_yrsCurCity,
                                AddrAsPerKyc: this.items[0].pres_presmAdrsKYC,
                                OtherDoc: this.items[0].pres_manualEntry,
                              },
                              {
                                AddressType: this.items[0].busi_type,
                                Address1: this.items[0].busi_plots,
                                Address2: this.items[0].busi_locality,
                                Address3: this.items[0].busi_line3,
                                city: JSON.parse(this.items[0].busi_cities),
                                State: JSON.parse(this.items[0].busi_states),
                                pincode: this.items[0].busi_pincode,
                                landmark: this.items[0].busi_landmark,
                                YearIncurrentCity:
                                  this.items[0].busi_yrsCurCity,
                              },
                            ],
                          },
                        ];
                      } else {
                        this.applicantDocs = [];
                      }
                    });
                  // }, (err) => {
                  //   console.log(err);
                  // });
                })
                .catch((e) => {
                  console.log('er' + e);
                  this.items = [];
                });
            }
          });
      });
  }

  slideslider(value) {
    this.navCtrl.navigate(['/NewapplicationPage'], {
      queryParams: { slideValue: value },
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  getAppCibilCheckStatus() {
    this.sqliteProvider
      .getSubmitDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        this.appCibilCheckStat = data[0].cibilCheckStat;
        this.submitStat = data[0].submitStat;
        this.appStatId = data[0].statId;
        this.appCibilColor = data[0].cibilColor;
        this.appCibilScore = data[0].cibilScore;
        this.appHimarkCheckStat = data[0].himarkCheckStat;
        this.applicationNumber = data[0].applicationNumber;
        this.documentResubmit = data[0].docResubmit;
        if (
          !(
            data[0].applicationNumber == '0' ||
            data[0].applicationNumber == null ||
            data[0].applicationNumber == ''
          )
        ) {
          if (data[0].docUploadStatus == 'N') {
            this.documentCheck = true;
          }
        }
      });
  }

  getGuaCibilCheckStatus() {
    if (this.applicant.guaFlag == 'Y') {
      let cibilcheck = '';
      let himarkcheck = '';
      for (let i = 0; i < this.guarantor.length; i++) {
        this.sqliteProvider
          .getSubmitDetails(this.guarantor[i].refId, this.guarantor[i].id)
          .then((data) => {
            cibilcheck = cibilcheck + data[0].cibilCheckStat;
            himarkcheck = himarkcheck + data[0].himarkCheckStat;
            if (i == this.guarantor.length - 1) {
              if (cibilcheck.includes('0')) {
                this.guaCibilCheckStat = false;
              } else {
                this.guaCibilCheckStat = true;
              }
              if (himarkcheck.includes('0')) {
                this.guaHimarkCheckStat = false;
              } else {
                this.guaHimarkCheckStat = true;
              }
            }
          });
      }
    }
  }

  getCoappCibilCheckStatus() {
    if (this.applicant.coAppFlag == 'Y') {
      let cibilcheck = '';
      let himarkcheck = '';
      for (let i = 0; i < this.coapplicants.length; i++) {
        this.sqliteProvider
          .getSubmitDetails(this.coapplicants[i].refId, this.coapplicants[i].id)
          .then((data) => {
            cibilcheck = cibilcheck + data[0].cibilCheckStat;
            himarkcheck = himarkcheck + data[0].himarkCheckStat;
            if (i == this.coapplicants.length - 1) {
              if (cibilcheck.includes('0')) {
                this.coappCibilCheckStat = false;
              } else {
                this.coappCibilCheckStat = true;
              }
              if (himarkcheck.includes('0')) {
                this.coappHimarkCheckStat = false;
              } else {
                this.coappHimarkCheckStat = true;
              }
            }
          });
      }
    }
  }

  getSecurityDetails() {
    this.sqliteProvider
      .getAdditionDtlData(this.applicant.refId, this.applicant.id)
      .then((data) => {
        if (data.length > 0) {
          this.securityDetailsLength = data.length;
          this.securityDetails = data;
          this.securityValue = [
            {
              apptype: this.securityDetails[0].applType,
              Reg_Owner: this.securityDetails[0].owner,
              address1: this.securityDetails[0].address1,
              address2: this.securityDetails[0].address2,
              State: this.securityDetails[0].states,
              city: this.securityDetails[0].cities,
              pincode: this.securityDetails[0].pincode,
              owner_type: this.securityDetails[0].ownType,
              property: this.securityDetails[0].property,
              relationship: this.securityDetails[0].relation,
              mortgage: this.securityDetails[0].mortgage,
              val_property: this.securityDetails[0].valuation,
            },
          ];
        }
      });
  }
  getDocumentName(value: string) {
    let selectedDocName = this.docs_master.find((f) => {
      return f.DocID === value;
    });
    return selectedDocName.DocDesc;
  }
  // docNames = {
  //   "Driving License": "licence",
  //   "PASSPORT": "passport",
  //   "VOTER ID": "voterid",
  //   "PAN CARD": "pan"
  // }
  async getApiData(leadId, idType) {
    try {
      let karzaDetails = [];
      let applicantidType = [];
      let applicantType = await this.sqlSupport.getApplicantType(
        this.appLeadId
      );
      applicantidType = await this.sqlSupport.getApplicantidTypeByLeadid(
        leadId,
        'licence'
      );
      if (
        this.getDocumentName(idType) == 'AADHAR' ||
        this.getDocumentName(idType) == 'AADHAR CARD'
      ) {
        let ekyc = await this.sqliteProvider.getEKYCDetails(leadId);
        let personal = JSON.parse(ekyc[0].EkycPersonal);
        let address = JSON.parse(ekyc[0].Ekycaddress);
        let val = [
          {
            lableName: 'name',
            value: personal.name,
          },
          {
            lableName: 'fathername',
            value: personal.co,
          },
          {
            lableName: 'dob',
            value: personal.dob,
          },
        ];
        console.log(ekyc, personal, address, 'Applicant');
        return val;
      } else if (applicantType[0].applicType == 'Existing') {
        let val = [
          {
            lableName: 'name',
            value: '',
          },
          {
            lableName: 'fathername',
            value: '',
          },
        ];
        console.log(val, 'Applicant');
        return val;
      } else if (
        applicantidType.length > 0 &&
        applicantidType[0].idType == 'licence'
      ) {
        let karza = applicantidType;
        let val = [
          {
            lableName: 'name',
            value: karza[0].name,
          },
          {
            lableName: 'fathername',
            value: karza[0].fathername,
          },
        ];
        console.log(val, 'Applicant');
        return val;
      } else {
        let karza =
          await this.sqliteProvider.getGivenSecondKarzaDetailsByLeadid(
            leadId,
            'Y'
          );
        // let karza = await this.sqliteProvider.getGivenSecondKarzaDetailsByLeadid(leadId, 'Y');
        let val = [
          {
            lableName: 'name',
            value: karza[0].name,
          },
          {
            lableName: 'fathername',
            value: karza[0].fathername,
          },
        ];
        console.log(karza, val, 'Applicant');
        return val;
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'SubmitPage-getApiData');
      this.errorLog.errorLog(error, 'SubmitPage-getApiData');
    }
  }

  async getApplicantDocs() {
    try {
      this.sqliteProvider
        .getPersonalDetails(this.applicant.refId, this.applicant.id)
        .then((data) => {
          if (data.length > 0) {
            this.appLeadId = data[0].coAppGuaId;
            this.sqliteProvider
              .getPromoterProofDetails(this.applicant.refId, this.applicant.id)
              .then((proof) => {
                if (proof.length > 0) {
                  for (let i = 0; i < proof.length; i++) {
                    this.sqliteProvider
                      .getpromoterproofImages(proof[i].pproofId)
                      .then((imgs) => {
                        if (imgs.length > 0) {
                          for (let j = 0; j < imgs.length; j++) {
                            if (
                              imgs[j].imgpath != undefined &&
                              imgs[j].imgpath != ''
                            ) {
                              // this.base64.encodeFile(imgs[j].imgpath).then(async (base64File: string) => {
                              let docImg = imgs[j].imgpath;
                              // let docname = this.getDocumentName(proof[i].promoIDType);
                              let apidata = this.getApiData(
                                this.appLeadId,
                                proof[i].promoIDType
                              );
                              let docReq = {
                                DocId: proof[i].promoIDType,
                                Document: docImg,
                                leadID: this.appLeadId,
                                Mandatory: this.getMandatoryCheck(
                                  proof[i].promoIDType
                                ),
                                DocName:
                                  'Img_' +
                                  this.appLeadId +
                                  '_' +
                                  proof[i].promoIDType +
                                  '_' +
                                  j +
                                  '.jpg',
                                KarzaDetails: apidata || '',
                              };
                              this.docFinalReq.push(docReq);
                              console.log('doccc ', this.docFinalReq);

                              // }, (error) => {
                              //   console.log(error, "base64 conversion error");
                              // });
                            }
                          }
                        }
                      });
                  }
                }
              });
          }
        });
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'SubmitPage-getApplicantDocs'
      );
      this.errorLog.errorLog(error, 'SubmitPage-getApplicantDocs');
    }
  }

  getCoApplicantDetails() {
    try {
      if (this.applicant.coAppFlag == 'Y') {
        for (let k = 0; k < this.coapplicants.length; k++) {
          this.sqliteProvider
            .getPersonalDetailsForPanValue(
              this.coapplicants[k].refId,
              this.coapplicants[k].userType
            )
            .then((data) => {
              this.CoappPANAvailable = data[0].panAvailable;
              console.log(this.CoappPANAvailable);
            });
          this.sqliteProvider
            .getPersonalDetails(
              this.coapplicants[k].refId,
              this.coapplicants[k].id
            )
            .then((data) => {
              if (data.length > 0) {
                this.sqliteProvider
                  .getPromoterProofDetails(
                    this.coapplicants[k].refId,
                    this.coapplicants[k].id
                  )
                  .then(async (docs) => {
                    if (docs.length > 0) {
                      this.coapplicantDocs = docs;
                      // this.base64.encodeFile(this.coapplicants[k].profPic).then((base64File: string) => {
                      let coappPic = this.coapplicants[k].profPic;
                      let dlExpiry;
                      let other;
                      let passExpiry;
                      let passOther;
                      if (
                        this.getCoAppDocNumber('DRIVING LICENSE').promoexpiry ==
                        undefined
                      ) {
                        dlExpiry = '';
                        other = '';
                      } else {
                        dlExpiry =
                          this.getCoAppDocNumber(
                            'DRIVING LICENSE'
                          ).promoexpiry.substring(8, 10) +
                          '/' +
                          this.getCoAppDocNumber(
                            'DRIVING LICENSE'
                          ).promoexpiry.substring(5, 7) +
                          '/' +
                          this.getCoAppDocNumber(
                            'DRIVING LICENSE'
                          ).promoexpiry.substring(0, 4);
                        other = '1';
                      }
                      if (
                        this.getCoAppDocNumber('PASSPORT').promoexpiry ==
                        undefined
                      ) {
                        passExpiry = '';
                        passOther = '';
                      } else {
                        passExpiry =
                          this.getCoAppDocNumber(
                            'PASSPORT'
                          ).promoexpiry.substring(8, 10) +
                          '/' +
                          this.getCoAppDocNumber(
                            'PASSPORT'
                          ).promoexpiry.substring(5, 7) +
                          '/' +
                          this.getCoAppDocNumber(
                            'PASSPORT'
                          ).promoexpiry.substring(0, 4);
                        passOther = '1';
                      }
                      console.log(
                        'CoappAppExistingUniquenum ',
                        this.coapplicants[k].URNnumber
                      );
                      let coJanaRefID;
                      await this.sqlSupport
                        .getEKYCDetails(this.coapplicants[k].coAppGuaId)
                        .then((data) => {
                          if (data.length > 0) {
                            if (
                              data[0].aespFlag &&
                              data[0].aespFlag.length > 0
                            ) {
                              this.coAppAespFlag = data[0].aespFlag;
                            } else {
                              this.coAppAespFlag = '';
                            }
                            coJanaRefID = data[0].janaid;
                          }
                        });

                      let coapp = {
                        CoappTitle: this.coapplicants[k].genTitle,
                        CoappFirstName: this.coapplicants[k].firstname,
                        CoappMiddleName: this.coapplicants[k].middlename,
                        CoapplastName: this.coapplicants[k].lastname,
                        CoappDOB:
                          this.coapplicants[k].dob.substring(8, 10) +
                          '/' +
                          this.coapplicants[k].dob.substring(5, 7) +
                          '/' +
                          this.coapplicants[k].dob.substring(0, 4),
                        CoappGender: this.coapplicants[k].gender,
                        CoappFatherName: this.coapplicants[k].fathername,
                        CoappSpouseName: this.coapplicants[k].spouseName, // changed
                        CoappAlternateMobno: this.globalFunc.basicDec(
                          this.coapplicants[k].altMobNum
                        ), // changed
                        CoappLanguage: this.coapplicants[k].languages, // changed
                        CoappQualification: this.coapplicants[k].education,
                        CoappMotherMaidenName: this.coapplicants[k].mothername,
                        CoappMobileNo: this.globalFunc.basicDec(
                          this.coapplicants[k].mobNum
                        ),
                        CoappPANNo: this.globalFunc.basicDec(
                          this.coapplicants[k].panNum
                        ),
                        CoappAppImage: coappPic,
                        CoappYearsattheResidence:
                          this.coapplicants[k].perm_yrsCurCity,
                        CoappDeclrAnnInc: this.coapplicants[k].annualIncome,
                        CoappCaste: this.coapplicants[k].caste,
                        CoappReligion: this.coapplicants[k].religion,
                        CoappMaritalStatus: this.coapplicants[k].marital,
                        CoappAppExistingUniquenum:
                          this.coapplicants[k].URNnumber,
                        CoappJanaRefID: coJanaRefID,
                        aespFlag: this.coAppAespFlag,
                        CoappleadId: this.coapplicants[k].coAppGuaId,
                        CoappVoterId:
                          this.globalFunc.basicDec(
                            this.getCoAppDocNumber('VOTER ID').promoIDRef
                          ) || '', //new
                        CoappPassportNo:
                          this.globalFunc.basicDec(
                            this.getCoAppDocNumber('PASSPORT').promoIDRef
                          ) || '', //new
                        CoappPassportExpiry: passExpiry || '', //new
                        CoappNegraIdvalue:
                          this.globalFunc.basicDec(
                            this.getCoAppDocNumber('NREGA').promoIDRef
                          ) || '', //new
                        CoappDrivingLcno:
                          this.globalFunc.basicDec(
                            this.getCoAppDocNumber('DRIVING LICENSE').promoIDRef
                          ) || '', //new
                        CoappdlExpiry: dlExpiry || '',
                        CoappOtherIdType: other || '',
                        CoappOtherIdvalue:
                          this.globalFunc.basicDec(
                            this.getCoAppDocNumber('DRIVING LICENSE').promoIDRef
                          ) || '',
                        CoappOtherIdExpireDate: dlExpiry,
                        CoappemailId: this.globalFunc.basicDec(
                          this.coapplicants[k].email
                        ),
                        CoappEmploymentStatus: this.coapplicants[k].employment,
                        CoappEmployeeID: this.coapplicants[k].employeeId, // changed
                        CoappPresentEmployerName:
                          this.coapplicants[k].employerName, // changed
                        CoappDesignation: this.coapplicants[k].designation, // changed
                        CoappJoiningDate: this.coapplicants[k].joinDate
                          ? this.coapplicants[k].joinDate
                              .split('-')
                              .reverse()
                              .join('/')
                          : '', // changed
                        CoappTotalExperience: this.coapplicants[k].experience,
                        CoappMontlySalary: this.coapplicants[k].monthSalary, // changed
                        CoappNameServiceBusiness: this.coapplicants[k].bussName, // changed
                        CoappDetailsActivity: this.coapplicants[k].actDetail, // changed
                        CoappMontlyIncome: this.coapplicants[k].monthIncome, // changed
                        CoappVintageServiceBusiness:
                          this.coapplicants[k].vinOfServ, // changed
                        CoappLineManagerName: this.coapplicants[k].lmName, // changed
                        CoappLineManagerEmail: this.globalFunc.basicDec(
                          this.coapplicants[k].lmEmail
                        ), // changed
                        CoappResidentialStatus:
                          this.coapplicants[k].resciStatus, // changed
                        // "CoappForm60": this.globalFunc.basicDec(this.coapplicants[k].form60),                       //new
                        CoappForm60: this.CoappPANAvailable,
                        CoEkycFlag: coJanaRefID ? 'Positive' : 'Negative',
                        CoappaadharChangedFlag:
                          this.coapplicants[k].ShowAadharDob,
                        CoappaadharDob: this.coapplicants[k].dobAadhar
                          ? this.coapplicants[k].dobAadhar
                          : '',
                        CoappaadharDobDocument: this.coapplicants[k].dobDocument
                          ? this.coapplicants[k].dobDocument
                          : '', //new
                        CoappNameAsPerPan: this.coapplicants[k].panName,
                        CoappDobAsPerPan:
                          this.coapplicants[k].panValidation == 'Y'
                            ? this.coapplicants[k].dob.substring(8, 10) +
                              '/' +
                              this.coapplicants[k].dob.substring(5, 7) +
                              '/' +
                              this.coapplicants[k].dob.substring(0, 4)
                            : '',
                        CoappPanValidation: this.coapplicants[k].panValidation,
                        CoappNameValidation:
                          this.coapplicants[k].nameValidation,
                        CoappDOBValidation: this.coapplicants[k].DOBValidation,
                        CoappSeedingStatus: this.coapplicants[k].seedingStatus,
                        CustomerAddressDetails: [
                          {
                            AddressType: '1',
                            Address1: this.globalFunc.basicDec(
                              this.coapplicants[k].perm_plots
                            ),
                            Address2: this.globalFunc.basicDec(
                              this.coapplicants[k].perm_locality
                            ),
                            Address3: this.globalFunc.basicDec(
                              this.coapplicants[k].perm_line3
                            ),
                            city: this.globalFunc.basicDec(
                              this.coapplicants[k].perm_cities
                            ),
                            State: this.globalFunc.basicDec(
                              this.coapplicants[k].perm_states
                            ),
                            pincode: this.globalFunc.basicDec(
                              this.coapplicants[k].perm_pincode
                            ),
                            landmark: this.coapplicants[k].perm_landmark,
                            YearIncurrentCity:
                              this.coapplicants[k].perm_yrsCurCity,
                            AddrAsPerKyc: this.coapplicants[k].perm_permAdrsKYC,
                            OtherDoc: this.coapplicants[k].perm_manualEntry,
                          },
                          {
                            AddressType: '2',
                            Address1: this.globalFunc.basicDec(
                              this.coapplicants[k].pres_plots
                            ),
                            Address2: this.globalFunc.basicDec(
                              this.coapplicants[k].pres_locality
                            ),
                            Address3: this.globalFunc.basicDec(
                              this.coapplicants[k].pres_line3
                            ),
                            city: this.globalFunc.basicDec(
                              this.coapplicants[k].pres_cities
                            ),
                            State: this.globalFunc.basicDec(
                              this.coapplicants[k].pres_states
                            ),
                            pincode: this.globalFunc.basicDec(
                              this.coapplicants[k].pres_pincode
                            ),
                            landmark: this.coapplicants[k].pres_landmark,
                            YearIncurrentCity:
                              this.coapplicants[k].pres_yrsCurCity,
                            AddrAsPerKyc:
                              this.coapplicants[k].pres_presmAdrsKYC,
                            OtherDoc: this.coapplicants[k].pres_manualEntry,
                          },
                          {
                            AddressType: this.coapplicants[k].busi_type,
                            Address1: this.coapplicants[k].busi_plots,
                            Address2: this.coapplicants[k].busi_locality,
                            Address3: this.coapplicants[k].busi_line3,
                            city: JSON.parse(this.coapplicants[k].busi_cities),
                            State: JSON.parse(this.coapplicants[k].busi_states),
                            pincode: this.coapplicants[k].busi_pincode,
                            landmark: this.coapplicants[k].busi_landmark,
                            YearIncurrentCity:
                              this.coapplicants[k].busi_yrsCurCity,
                          },
                        ],
                      };

                      // let coapp = {
                      //   "CoappTitle": this.coapplicants[k].genTitle,
                      //   "CoappConstitution": this.coapplicants[k].constitution || "",
                      //   "CoappFirstName": this.coapplicants[k].firstname,
                      //   "CoappMiddleName": this.coapplicants[k].middlename,
                      //   "CoapplastName": this.coapplicants[k].lastname,
                      //   "CoappDOB": this.coapplicants[k].dob.substring(8, 10) + "/" + this.coapplicants[k].dob.substring(5, 7) + "/" + this.coapplicants[k].dob.substring(0, 4),
                      //   "CoappGender": this.coapplicants[k].gender,
                      //   "CoappFatherName": this.coapplicants[k].fathername,
                      //   "CoappMotherMaidenName": this.coapplicants[k].mothername,
                      //   "CoappMobileNo": this.coapplicants[k].mobNum,
                      //   "CoappPANAvailable": this.coapplicants[k].panAvailable,
                      //   "CoappPANNo": this.getCoAppDocNumber("PAN CARD").promoIDRef,
                      //   "CoappCustomerNameperKYC": this.getKarzaData(this.coapplicants[k].coAppGuaId),
                      //   "CoappEmploymentStatus": this.coapplicants[k].employment,
                      //   "CoappExperienceinYrs": this.coapplicants[k].experience,
                      //   "CoappCaste": this.coapplicants[k].caste,
                      //   "CoappReligion": this.coapplicants[k].religion,
                      //   "CoappEducation": this.coapplicants[k].education,
                      //   "CoappMaritalStatus": this.coapplicants[k].marital,
                      //   "CoappAppExistingUniquenum": this.coapplicants[k].URNnumber,
                      //   "CoappAppImage": coappPic,
                      //   "CoappExistingCustomer": this.coapplicants[k].custType == 'E' ? 'Y' : 'N',
                      //   "CoappJanaRefID": this.getCoAppDocNumber("AADHAR CARD").promoIDRef || "",
                      //   "CoappleadId": this.coapplicants[k].coAppGuaId,
                      //   "CoappVoterId": this.getCoAppDocNumber("VOTER ID").promoIDRef || "",
                      //   "CoappPassportNo": this.getCoAppDocNumber("PASSPORT").promoIDRef || "",
                      //   "CoappOtherIdType": "2",
                      //   "CoappOtherIdvalue": this.getCoAppDocNumber("DRIVING LICENSE").promoIDRef || "",
                      //   "CoappOtherIdExpireDate": this.getCoAppDocNumber("DRIVING LICENSE").promoexpiry.substring(8, 10) + "/" + this.getCoAppDocNumber("DRIVING LICENSE").promoexpiry.substring(5, 7) + "/" + this.getCoAppDocNumber("DRIVING LICENSE").promoexpiry.substring(0, 4),
                      //   "CoappemailId": this.coapplicants[k].email,
                      //   "CustomerAddressDetails": [
                      //     {
                      //       "AddressType": "1",
                      //       "Address1": this.coapplicants[k].perm_plots,
                      //       "Address2": this.coapplicants[k].perm_locality,
                      //       "Address3": "",
                      //       "city": this.coapplicants[k].perm_cities,
                      //       "State": this.coapplicants[k].perm_states,
                      //       "pincode": this.coapplicants[k].perm_pincode,
                      //       "landmark": this.coapplicants[k].perm_landmark,
                      //       "YearIncurrentCity": this.coapplicants[k].perm_yrsCurCity
                      //     },
                      //     {
                      //       "AddressType": "2",
                      //       "Address1": this.coapplicants[k].pres_plots,
                      //       "Address2": this.coapplicants[k].pres_locality,
                      //       "Address3": "",
                      //       "city": this.coapplicants[k].pres_cities,
                      //       "State": this.coapplicants[k].pres_states,
                      //       "pincode": this.coapplicants[k].pres_pincode,
                      //       "landmark": this.coapplicants[k].pres_landmark,
                      //       "YearIncurrentCity": this.coapplicants[k].pres_yrsCurCity
                      //     }
                      //   ]
                      // };
                      this.coappFinal.push(coapp);
                      this.sqliteProvider
                        .getPromoterProofDetails(
                          this.coapplicants[k].refId,
                          this.coapplicants[k].id
                        )
                        .then((proof) => {
                          if (proof.length > 0) {
                            for (let i = 0; i < proof.length; i++) {
                              this.sqliteProvider
                                .getpromoterproofImages(proof[i].pproofId)
                                .then((imgs) => {
                                  if (imgs.length > 0) {
                                    for (let j = 0; j < imgs.length; j++) {
                                      if (
                                        imgs[j].imgpath != undefined &&
                                        imgs[j].imgpath != ''
                                      ) {
                                        // this.base64.encodeFile(imgs[j].imgpath).then(async (base64File: string) => {
                                        let docImg = imgs[j].imgpath;
                                        let coappappLeadId =
                                          this.coapplicants[k].coAppGuaId;
                                        let coappapidata = this.getCoAppApiData(
                                          coappappLeadId,
                                          proof[i].promoIDType
                                        );
                                        let docReq = {
                                          DocId: proof[i].promoIDType,
                                          Document: docImg,
                                          leadID:
                                            this.coapplicants[k].coAppGuaId,
                                          Mandatory: this.getMandatoryCheck(
                                            proof[i].promoIDType
                                          ),
                                          DocName:
                                            'Img_' +
                                            this.coapplicants[k].coAppGuaId +
                                            '_' +
                                            proof[i].promoIDType +
                                            '_' +
                                            j +
                                            '.jpg',
                                          KarzaDetails: coappapidata || '',
                                        };
                                        this.docFinalReq.push(docReq);
                                        // });
                                      }
                                    }
                                  }
                                });
                            }
                          }
                        });
                      // }, (err) => {
                      //   console.log(err);
                      // });
                    }
                  });
              }
            });
        }
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'SubmitPage-getCoApplicantDetails'
      );
      this.errorLog.errorLog(error, 'SubmitPage-getCoApplicantDetails');
    }
  }

  async getCoAppApiData(leadId, idType) {
    try {
      let karzaDetails = [];
      if (
        this.getDocumentName(idType) == 'AADHAR' ||
        this.getDocumentName(idType) == 'AADHAR CARD'
      ) {
        let ekyc = await this.sqliteProvider.getEKYCDetails(leadId);
        let personal = JSON.parse(ekyc[0].EkycPersonal);
        let address = JSON.parse(ekyc[0].Ekycaddress);
        let val = [
          {
            lableName: 'name',
            value: personal.name,
          },
          {
            lableName: 'fathername',
            value: personal.co,
          },
          {
            lableName: 'dob',
            value: personal.dob,
          },
        ];
        console.log(ekyc, personal, address, 'Co-applicant');
        return val;
      } else {
        //let karza = await this.sqliteProvider.getGivenKarzaDetailsByLeadid(leadId, 'Y');
        let karza =
          await this.sqliteProvider.getGivenSecondKarzaDetailsByLeadid(
            leadId,
            'Y'
          );
        let val = [
          {
            lableName: 'name',
            value: karza[0].name,
          },
          {
            lableName: 'fathername',
            value: karza[0].fathername,
          },
        ];
        console.log(karza, val, 'Co-applicant');
        return val;
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(error.stack, 'SubmitPage-getCoAppApiData');
      this.errorLog.errorLog(error, 'SubmitPage-getCoAppApiData');
    }
  }

  getGuarantorDetails() {
    try {
      if (this.applicant.guaFlag == 'Y') {
        for (let k = 0; k < this.guarantor.length; k++) {
          this.sqliteProvider
            .getPersonalDetails(this.guarantor[k].refId, this.guarantor[k].id)
            .then((data) => {
              if (data.length > 0) {
                this.sqliteProvider
                  .getPromoterProofDetails(
                    this.guarantor[k].refId,
                    this.guarantor[k].id
                  )
                  .then((docs) => {
                    if (docs.length > 0) {
                      this.guarantorDocs = docs;
                      // this.base64.encodeFile(this.guarantor[k].profPic).then((base64File: string) => {
                      let guaPic = this.guarantor[k].profPic;
                      console.log(
                        'GuaAppExistingUniquenum ',
                        this.guarantor[k].URNnumber
                      );

                      let coapp = {
                        GuaTitle: this.guarantor[k].genTitle,
                        GuaConstitution: this.guarantor[k].constitution || '',
                        GuaFirstName: this.guarantor[k].firstname,
                        GuaMiddleName: this.guarantor[k].middlename,
                        GualastName: this.guarantor[k].lastname,
                        GuaDOB:
                          this.guarantor[k].dob.substring(8, 10) +
                          '/' +
                          this.guarantor[k].dob.substring(5, 7) +
                          '/' +
                          this.guarantor[k].dob.substring(0, 4),
                        GuaGender: this.guarantor[k].gender,
                        GuaFatherName: this.guarantor[k].fathername,
                        GuaMotherMaidenName: this.guarantor[k].mothername,
                        GuaMobileNo: this.globalFunc.basicDec(
                          this.guarantor[k].mobNum
                        ),
                        GuaPANAvailable: this.guarantor[k].panAvailable,
                        GuaPANNo: this.globalFunc.basicDec(
                          this.guarantor[k].panNum
                        ),
                        GuaCustomerNameperKYC: this.globalFunc.basicDec(
                          this.getKarzaData(this.guarantor[k].coAppGuaId)
                        ),
                        GuaEmploymentStatus: this.guarantor[k].employment,
                        GuaExperienceinYrs: this.guarantor[k].experience,
                        GuaDeclrAnnInc: this.guarantor[k].annualIncome,
                        GuaCaste: this.guarantor[k].caste,
                        GuaReligion: this.guarantor[k].religion,
                        GuaEducation: this.guarantor[k].education,
                        GuaMaritalStatus: this.guarantor[k].marital,
                        GuaAppExistingUniquenum: this.guarantor[k].URNnumber,
                        GuaAppImage: guaPic,
                        GuaExistingCustomer:
                          this.guarantor[k].custType == 'E' ? 'Y' : 'N',
                        GuaJanaRefID:
                          this.globalFunc.basicDec(
                            this.getAppDocNumber('AADHAR CARD').promoIDRef
                          ) || '',
                        GualeadId: this.guarantor[k].coAppGuaId,
                        GuaVoterId:
                          this.globalFunc.basicDec(
                            this.getGuaDocNumber('VOTER ID').promoIDRef
                          ) || '',
                        GuaPassportNo:
                          this.globalFunc.basicDec(
                            this.getGuaDocNumber('PASSPORT').promoIDRef
                          ) || '',
                        GuaOtherIdType: '2',
                        GuaOtherIdvalue:
                          this.globalFunc.basicDec(
                            this.getGuaDocNumber('DRIVING LICENSE').promoIDRef
                          ) || '',
                        GuaOtherIdExpireDate:
                          this.getGuaDocNumber(
                            'DRIVING LICENSE'
                          ).promoexpiry.substring(8, 10) +
                          '/' +
                          this.getGuaDocNumber(
                            'DRIVING LICENSE'
                          ).promoexpiry.substring(5, 7) +
                          '/' +
                          this.getGuaDocNumber(
                            'DRIVING LICENSE'
                          ).promoexpiry.substring(0, 4),
                        GuaemailId: this.globalFunc.basicDec(
                          this.guarantor[k].email
                        ),
                        CustomerAddressDetails: [
                          {
                            AddressType: '1',
                            Address1: this.globalFunc.basicDec(
                              this.guarantor[k].perm_plots
                            ),
                            Address2: this.globalFunc.basicDec(
                              this.guarantor[k].perm_locality
                            ),
                            Address3: '',
                            city: this.globalFunc.basicDec(
                              this.guarantor[k].perm_cities
                            ),
                            State: this.globalFunc.basicDec(
                              this.guarantor[k].perm_states
                            ),
                            pincode: this.globalFunc.basicDec(
                              this.guarantor[k].perm_pincode
                            ),
                            landmark: this.guarantor[k].perm_landmark,
                            YearIncurrentCity:
                              this.guarantor[k].perm_yrsCurCity,
                            AddrAsPerKyc: this.guarantor[k].perm_permAdrsKYC,
                            OtherDoc: this.guarantor[k].perm_manualEntry,
                          },
                          {
                            AddressType: '2',
                            Address1: this.globalFunc.basicDec(
                              this.guarantor[k].pres_plots
                            ),
                            Address2: this.globalFunc.basicDec(
                              this.guarantor[k].pres_locality
                            ),
                            Address3: '',
                            city: this.globalFunc.basicDec(
                              this.guarantor[k].pres_cities
                            ),
                            State: this.globalFunc.basicDec(
                              this.guarantor[k].pres_states
                            ),
                            pincode: this.globalFunc.basicDec(
                              this.guarantor[k].pres_pincode
                            ),
                            landmark: this.guarantor[k].pres_landmark,
                            YearIncurrentCity:
                              this.guarantor[k].pres_yrsCurCity,
                            AddrAsPerKyc: this.guarantor[k].pres_presmAdrsKYC,
                            OtherDoc: this.guarantor[k].pres_manualEntry,
                          },
                          {
                            AddressType: this.items[0].busi_type,
                            Address1: this.items[0].busi_plots,
                            Address2: this.items[0].busi_locality,
                            Address3: '',
                            city: JSON.parse(this.items[0].busi_cities),
                            State: JSON.parse(this.items[0].busi_states),
                            pincode: this.items[0].busi_pincode,
                            landmark: this.items[0].busi_landmark,
                            YearIncurrentCity: this.items[0].busi_yrsCurCity,
                          },
                        ],
                      };
                      this.guaFinal.push(coapp);
                      this.sqliteProvider
                        .getPromoterProofDetails(
                          this.guarantor[k].refId,
                          this.guarantor[k].id
                        )
                        .then((proof) => {
                          if (proof.length > 0) {
                            for (let i = 0; i < proof.length; i++) {
                              this.sqliteProvider
                                .getpromoterproofImages(proof[i].pproofId)
                                .then((imgs) => {
                                  if (imgs.length > 0) {
                                    for (let j = 0; j < imgs.length; j++) {
                                      if (
                                        imgs[j].imgpath != undefined &&
                                        imgs[j].imgpath != ''
                                      ) {
                                        // this.base64.encodeFile(imgs[j].imgpath).then((base64File: string) => {
                                        let docImg = imgs[j].imgpath;
                                        let docReq = {
                                          DocId: proof[i].promoIDType,
                                          Document: docImg,
                                          leadID: this.guarantor[k].coAppGuaId,
                                          Mandatory: this.getMandatoryCheck(
                                            proof[i].promoIDType
                                          ),
                                          DocName:
                                            'Img_' +
                                            this.guarantor[k].coAppGuaId +
                                            '_' +
                                            proof[i].promoIDType +
                                            '_' +
                                            j +
                                            '.jpg',
                                        };
                                        this.docFinalReq.push(docReq);
                                        // });
                                      }
                                    }
                                  }
                                });
                            }
                          }
                        });
                      // }, (err) => {
                      //   console.log(err);
                      // });
                    }
                  });
              }
            });
        }
      }
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'SubmitPage-getGuarantorDetails'
      );
      this.errorLog.errorLog(error, 'SubmitPage-getGuarantorDetails');
    }
  }

  // base64Convert(filePath) {
  //   this.base64.encodeFile(filePath).then((base64File: string) => {
  //     return base64File;
  //   }, (err) => {
  //     console.log(err);
  //   });
  // }

  getProductValue() {
    this.sqliteProvider.getAllProductList().then((data) => {
      this.pdt_master = data;
    });
  }

  getJanaProductCode(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    return selectedLoanName.prdSchemeCode;
  }
  getLoanType(value: string) {
    let selectedLoanName = this.pdt_master.find((f) => {
      return f.prdCode === value;
    });
    return selectedLoanName.prdNature;
  }

  IMDSubmit(appNo) {
    this.sqlSupport
      .getImdDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        if (data.length > 0) {
          this.IMD_data = data;
          this.getImdImgs(this.IMD_data[0].imdId, appNo);
        } else {
          this.alertService.showAlert('Alert!', 'IMD data not found');
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  getImdImgs(imdId, appNo) {
    this.sqlSupport.getImdImagesSubmit(imdId).then((data) => {
      if (data.length > 0) {
        // this.base64.encodeFile(data[0].imgpath).then((base64File: string) => {
        this.imgImg = data[0].imgpath;
        this.initImdSubmit(appNo);
        // }, (err) => {
        //   console.log(err);
        // });
      } else {
        console.log('IMD img not found');
      }
    });
  }

  initImdSubmit(appNo) {
    try {
      this.loadingService.globalLodingPresent('Please wait...');
      this.imdSubmitData = {
        PaymentType: this.IMD_data[0].imdPayType,
        InstrumentDetails: this.IMD_data[0].imdInstrument,
        macc_no: this.IMD_data[0].imdACNumber,
        mcollected_amount: this.IMD_data[0].imdAmount,
        mbank_name: JSON.parse(this.IMD_data[0].imdBName).NAME,
        InstrumentDate:
          this.IMD_data[0].imdDate.substring(8, 10) +
          '/' +
          this.IMD_data[0].imdDate.substring(5, 7) +
          '/' +
          this.IMD_data[0].imdDate.substring(0, 4),
        accountHoldName: this.IMD_data[0].imdACName,
        Appno: appNo,
        imagename: appNo + '_cheque.jpg',
        m_image: this.imgImg,
      };
      console.log(JSON.stringify(this.imdSubmitData), 'IMDCheck');
      this.master.restApiCallAngular('IMDCheck', this.imdSubmitData).then(
        (data) => {
          if ((<any>data).code == '000') {
            // this.globalFunc.globalLodingDismiss();
            // this.casaInit(appNo);
            this.sqlSupport
              .updateSubmitIMDDetails('1', this.appStatId)
              .then((imd) => {
                this.casaInit(appNo);
              });
          } else if ((<any>data).code == '001') {
            this.documentCheck = false;
            //  this.loading.dismiss();
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Application IMD Details submission Failed!'
            );
          } else {
            this.documentCheck = false;
            // this.loading.dismiss();
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Something went wrong! IMD Details not submitted'
            );
          }
        },
        (err) => {
          this.documentCheck = false;
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      );
    } catch (error) {
      console.log(error.message);
      this.alertService.showAlert('Alert!', error.message);
      this.sqliteProvider.addAuditTrail(
        format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        'initImdSubmit',
        'initImdSubmit',
        JSON.stringify(error)
      );
    }
  }

  casaInit(appNo) {
    try {
      // this.loading.present();
      this.loadingService.globalLodingPresent('Please wait...');
      // if(this.CASA_data[0].janaAcc == 'Y') {
      if (this.CASA_data[0].nomAvail == 'Y') {
        this.nomAvail = '1';
      } else {
        this.nomAvail = '2';
      }
      if (this.CASA_data[0].guaAvail == 'Y') {
        this.guaAvail = '1';
      } else {
        this.guaAvail = '2';
      }
      if (this.CASA_data[0].nomAvail == 'Y') {
        this.casaSubmitData = {
          appNo: appNo,
          selJanaAcc: this.CASA_data[0].janaAcc,
          nomineeAvail: this.nomAvail,
          guaranterNomiee: this.guaAvail,
          Leadid: this.nominee_Data ? this.nominee_Data[0].leadId : '',
          nomineeDetails: {
            nomieeTitle: this.nominee_Data
              ? this.nominee_Data[0].nomTitle.toUpperCase()
              : '',
            nomieeName: this.nominee_Data ? this.nominee_Data[0].nominame : '',
            nomieedob: this.nominee_Data
              ? this.nominee_Data[0].nomdob.substring(8, 10) +
                '/' +
                this.nominee_Data[0].nomdob.substring(5, 7) +
                '/' +
                this.nominee_Data[0].nomdob.substring(0, 4)
              : '',
            nomineeguardianname: this.nominee_Data
              ? this.nominee_Data[0].guaname
              : '',
            nomieeage: this.nominee_Data ? this.nominee_Data[0].nomiage : '',
            nomieerel: this.nominee_Data
              ? this.nominee_Data[0].nomrelation
              : '',
            nomieeadd1: this.nominee_Data
              ? this.nominee_Data[0].nomi_address1
              : '',
            nomieeadd2: this.nominee_Data
              ? this.nominee_Data[0].nomi_address2
              : '',
            nomieeadd3: this.nominee_Data
              ? this.nominee_Data[0].nomi_address3
              : '',
            nomieecity: this.nominee_Data
              ? this.nominee_Data[0].nomicities
              : '',
            nomieestate: this.nominee_Data
              ? this.nominee_Data[0].nomistates
              : '',
            nomieepin: this.nominee_Data
              ? this.nominee_Data[0].nomipincode
              : '',
            nomieecontry: 'INDIA',
            nomieecontno: this.nominee_Data
              ? this.nominee_Data[0].nomiCNum
              : '',
            guardianDetails: {
              guardianTitle: this.nominee_Data
                ? this.nominee_Data[0].guaTitle
                : '',
              guardianName: this.nominee_Data
                ? this.nominee_Data[0].guaname
                : '',
              reltoNominee: this.nominee_Data
                ? this.nominee_Data[0].guarelation
                : '',
              guardianContNo: this.nominee_Data
                ? this.nominee_Data[0].guaCNum
                : '',
              guardianAddressLine1: this.nominee_Data
                ? this.nominee_Data[0].gua_address1
                : '',
              guardianAddressLine2: this.nominee_Data
                ? this.nominee_Data[0].gua_address2
                : '',
              guardianCity: this.nominee_Data
                ? this.nominee_Data[0].guacities
                : '',
              guardianState: this.nominee_Data
                ? this.nominee_Data[0].guastates
                : '',
              guardianPincode: this.nominee_Data
                ? this.nominee_Data[0].guapincode
                : '',
              guardianCountry: 'INDIA',
            },
          },
          serviceRequested: {
            modeofop: this.service_data ? this.service_data[0].modeofoper : '',
            operinstruction: this.service_data
              ? this.service_data[0].operaInst
              : '',
            custid: '',
            instakitno: '',
            accountType: this.service_data ? this.service_data[0].acType : '',
          },
        };
      } else {
        this.casaSubmitData = {
          appNo: appNo,
          selJanaAcc: this.CASA_data[0].janaAcc,
          nomineeAvail: this.nomAvail,
          guaranterNomiee: this.guaAvail,
          nomineeDetails: {
            nomieeTitle: '',
            nomieeName: '',
            nomieedob: '',
            nomineeguardianname: '',
            nomieeage: '',
            nomieerel: '',
            nomieeadd1: '',
            nomieeadd2: '',
            nomieeadd3: '',
            nomieecity: '',
            nomieestate: '',
            nomieepin: '',
            nomieecontry: '',
            nomieecontno: '',
            guardianDetails: {
              guardianTitle: '',
              guardianName: '',
              reltoNominee: '',
              guardianContNo: '',
              guardianAddressLine1: '',
              guardianAddressLine2: '',
              guardianCity: '',
              guardianState: '',
              guardianPincode: '',
              guardianCountry: '',
            },
          },
          serviceRequested: {
            modeofop: this.service_data ? this.service_data[0].modeofoper : '',
            operinstruction: this.service_data
              ? this.service_data[0].operaInst
              : '',
            custid: '',
            instakitno: '',
            accountType: this.service_data ? this.service_data[0].acType : '',
          },
        };
      }
      // this.getVehicleDetails(appNo);
      console.log(JSON.stringify(this.casaSubmitData), 'CurrentAccDet');
      this.master.restApiCallAngular('CurrentAccDet', this.casaSubmitData).then(
        (data) => {
          if ((<any>data).ErrorCode == '000') {
            // this.loading.dismiss();
            this.sqlSupport
              .updateSubmitCASADetails('1', this.appStatId)
              .then((data) => {
                // this.globalFunc.globalLodingDismiss();
                this.getVehicleDetails(appNo);
              });
          } else {
            // this.loading.dismiss();
            // this.globalFunc.globalLodingDismiss();
            // this.getVehicleDetails(appNo);
            if ((<any>data).ErrorDesc) {
              this.documentCheck = false;
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert('Alert', (<any>data).ErrorDesc);
            } else {
              this.documentCheck = false;
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert(
                'Alert!',
                'Application CA/SA Details submission Failed!'
              );
            }
          }
        },
        (err) => {
          this.documentCheck = false;
          this.loadingService.globalLodingDismiss();
          // this.globalFunc.globalLodingDismiss();
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      );
      // } else {
      //   this.getVehicleDetails(appNo);
      // }
    } catch (error) {
      console.log(error.message);
      this.alertService.showAlert('Alert!', error.message);
      this.sqliteProvider.addAuditTrail(
        format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        'casaInit',
        'casaInit',
        JSON.stringify(error)
      );
    }
  }

  getVehicleDetails(appNo) {
    try {
      // this.loading.present();
      // this.globalFunc.globalLodingPresent('Please wait...');
      // let dealerData = JSON.parse(this.vehicle_data[0].dealerName)
      const dealer = this.dummy_masterDealer.find(
        (val) => val.dealerCode == this.vehicle_data[0].dealerName
      );
      if (this.vehicleType == '1') {
        this.vehicleSubmitData = {
          PropNo: appNo,
          vehicleType: 'New',
          category: this.vehicle_data[0].vehicleCatogery,
          Brand: this.vehicle_data[0].brandName,
          Model: this.vehicle_data[0].model,
          Variant: this.vehicle_data[0].variant, //Changed
          CC: this.vehicle_data[0].cc,
          Scheme: this.vehicle_data[0].scheme,
          PromoCode: this.vehicle_data[0].promoCode,
          OnRoadPrice: this.vehicle_data[0].onroadPrice,
          // "DownPayment": this.vehicle_data[0].downpayment,
          DownPayment: this.items[0].totalDownPay,
          Insurancecover: this.vehicle_data[0].insuranceCover,
          InsPolicyNo: this.vehicle_data[0].insPolicyNo
            ? this.vehicle_data[0].insPolicyNo
            : '',
          InsCompany: this.vehicle_data[0].insCompany
            ? this.vehicle_data[0].insCompany
            : '',
          InsDate: this.items[0].insDate
            ? this.items[0].insDate.split('-').reverse().join('/')
            : '',
          InsExpireDate: this.items[0].insExpDate
            ? this.items[0].insExpDate.split('-').reverse().join('/')
            : '',
          InsValue: this.vehicle_data[0].insValue
            ? this.vehicle_data[0].insValue
            : '',
          DealerCode: dealer.dealerCode || dealer.dealerName,
          DealerName: dealer.dealerName,
          DealerType: this.vehicle_data[0].dealerType,
          DealerIFSCcode: this.vehicle_data[0].dealerIFSCcode,
          DealerBankName: this.vehicle_data[0].dealerBank,
          DealerBranchName: this.vehicle_data[0].dealerBranch,
          DealerAddress: this.vehicle_data[0].dealerAddress,
          DealerAccountNumber: this.vehicle_data[0].dealerCurAcc,
          apiFlag: this.vehicle_data[0].apiFlag,
        };
      } else {
        this.vehicleSubmitData = {
          PropNo: appNo,
          vehicleType: 'Used',
          UsedChassisno: this.vehicle_data[0].chassisNo,
          UsedEngineno: this.vehicle_data[0].engineNo,
          UsedKmdriven: this.vehicle_data[0].kmDriven,
          UsedRcno: this.vehicle_data[0].rcNo,
          UsedVehicleAge: this.vehicle_data[0].vehicleAge,
          UsedYrsofmanufacture: this.vehicle_data[0].yearOfMan,
          category: this.vehicle_data[0].vehicleCatogery,
          Brand: this.vehicle_data[0].brandName,
          Model: this.vehicle_data[0].model,
          Variant: this.vehicle_data[0].variant, //Changed
          CC: this.vehicle_data[0].cc,
          Scheme: this.vehicle_data[0].scheme,
          PromoCode: this.vehicle_data[0].promoCode,
          OnRoadPrice: this.vehicle_data[0].onroadPrice || '',
          // "DownPayment": this.vehicle_data[0].downpayment || "",
          DownPayment: this.items[0].totalDownPay || '',
          Insurancecover: this.vehicle_data[0].insuranceCover,
          InsPolicyNo: this.vehicle_data[0].insPolicyNo
            ? this.vehicle_data[0].insPolicyNo
            : '',
          InsCompany: this.vehicle_data[0].insCompany
            ? this.vehicle_data[0].insCompany
            : '',
          InsDate: this.items[0].insDate
            ? this.items[0].insDate.split('-').reverse().join('/')
            : '',
          InsExpireDate: this.items[0].insExpDate
            ? this.items[0].insExpDate.split('-').reverse().join('/')
            : '',
          InsValue: this.vehicle_data[0].insValue
            ? this.vehicle_data[0].insValue
            : '',
          DealerCode: dealer.dealerCode || dealer.dealerName,
          DealerName: dealer.dealerName,
          DealerType: this.vehicle_data[0].dealerType,
          DealerIFSCcode: this.vehicle_data[0].dealerIFSCcode,
          DealerBankName: this.vehicle_data[0].dealerBank,
          DealerBranchName: this.vehicle_data[0].dealerBranch,
          DealerAddress: this.vehicle_data[0].dealerAddress,
          DealerAccountNumber: this.vehicle_data[0].dealerCurAcc,
          UsedRegistrationdate: this.items[0].registrationDate
            ? this.items[0].registrationDate.split('-').reverse().join('/')
            : '',
          UsedDealerquotation: this.vehicle_data[0].dealerQuotation,
          UsedOBV: this.vehicle_data[0].obv,
          UsedFinalassetprice: this.vehicle_data[0].assetPrice,
          UsedNumberofowner: this.vehicle_data[0].noofOwner,
          UsedAssetageatmaturity: this.vehicle_data[0].assetAge,
          UsedHypothecationstatus: this.vehicle_data[0].hypothecation,
          apiFlag: this.vehicle_data[0].apiFlag,
        };
      }
      // this.NACHinit(appNo);
      console.log(JSON.stringify(this.vehicleSubmitData), 'vehicleDetails');
      this.master
        .restApiCallAngular('vehicleDetails', this.vehicleSubmitData)
        .then(
          (data) => {
            let vehicleSubmitData = <any>data;
            if (vehicleSubmitData.ErrorCode == '000') {
              // this.loading.dismiss();
              this.sqlSupport
                .updateSubmitVehicleSubmitDetails('1', this.appStatId)
                .then((data) => {
                  // this.globalFunc.globalLodingDismiss();
                  // this.NACHinit(appNo);
                  this.getInsuranceSubmitDetails(appNo);
                  // this.uploadDocs();
                });
            } else {
              this.documentCheck = false;
              // this.loading.dismiss();
              this.loadingService.globalLodingDismiss();
              // this.NACHinit(appNo);
              if (vehicleSubmitData.ErrorDesc) {
                this.alertService.showAlert(
                  'Alert!',
                  vehicleSubmitData.ErrorDesc
                );
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  'Vehicle details submission failed..!'
                );
              }
            }
          },
          (err) => {
            this.documentCheck = false;
            // this.loading.dismiss();
            this.loadingService.globalLodingDismiss();
            if (err.name == 'TimeoutError') {
              this.alertService.showAlert('Alert!', err.message);
            } else {
              this.alertService.showAlert('Alert!', 'No response from server!');
            }
          }
        );
    } catch (error) {
      console.log(error.message);
      this.alertService.showAlert('Alert!', error.message);
      this.sqliteProvider.addAuditTrail(
        format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        'getVehicleDetails',
        'getVehicleDetails',
        JSON.stringify(error)
      );
    }
  }

  getInsuranceSubmitDetails(appNo) {
    try {
      let nomDOB = this.vehicle_data[0].nomDOB
        ? this.vehicle_data[0].nomDOB.split('-').reverse().join('/')
        : '';
      let userId = this.globalFunc.basicDec(localStorage.getItem('username'));
      console.log(nomDOB, ' Checking date');
      this.insuranceData = {
        PropNo: appNo,
        NomineeName: this.vehicle_data[0].nomName,
        NomineeRelationship: this.vehicle_data[0].nomRel,
        NomineeDOB: nomDOB,
        NomineeGender: this.vehicle_data[0].nomGender,
        UserId: userId,
      };
      console.log(JSON.stringify(this.insuranceData), 'insurance Details');
      this.master
        .restApiCallAngular('LifeInsuranceDetails', this.insuranceData)
        .then(
          (data) => {
            let insuranceData = <any>data;
            if (insuranceData.ErrorCode == '000') {
              this.uploadDocs();
            } else {
              this.loadingService.globalLodingDismiss();
              if (insuranceData.ErrorDesc) {
                this.alertService.showAlert('Alert!', insuranceData.ErrorDesc);
              } else {
                this.alertService.showAlert(
                  'Alert!',
                  'Insurance details submission failed..!'
                );
              }
            }
          },
          (err) => {
            this.loadingService.globalLodingDismiss();
            if (err.name == 'TimeoutError') {
              this.alertService.showAlert('Alert!', err.message);
            } else {
              this.alertService.showAlert('Alert!', 'No response from server!');
            }
          }
        );
    } catch (error) {
      console.log(error.message);
      this.alertService.showAlert('Alert!', error.message);
      this.sqliteProvider.addAuditTrail(
        format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        'getInsuranceSubmitDetails',
        'getInsuranceSubmitDetails',
        JSON.stringify(error)
      );
    }
  }

  // NACHinit(appNo) {
  //   // this.loading.present();
  //   this.globalFunc.globalLodingPresent('Please wait...');
  //   this.nachSubmitData =
  //   {
  //     "lpcomProposal": appNo,
  //     "lndAccountNo": this.NACH_data[0].nachACNumber,
  //     "lndEnachType": "",
  //     "lndNachRepayDet": this.NACH_data[0].nachImdSame,
  //     "lndBankName": JSON.parse(this.NACH_data[0].nachBName).CODE,
  //     "lndBranchName": this.NACH_data[0].nachBranName,
  //     "lndIfscCode": this.NACH_data[0].nachIFSC,
  //     "lndAccType": this.NACH_data[0].nachAcType,
  //     "lndAccHolder": this.NACH_data[0].nachACName
  //   }
  //   this.master.restApiCallAngular('updateNachDetails', this.nachSubmitData).then(data => {
  //     if ((<any>data).ErrorCode == "000") {
  //       // this.loading.dismiss();
  //       this.sqlSupport.updateNACHSubmitDetails('1', this.appStatId).then(data => {
  //         this.globalFunc.globalLodingDismiss();
  //         this.uploadDocs();
  //       })
  //       // this.sqliteProvider.updateSubmitNACHDetails('1', this.appStatId).then(nach => {

  //       // })

  //     } else {
  //       //this.uploadDocs();
  //       // this.loading.dismiss();
  //       this.globalFunc.globalLodingDismiss();
  //       if ((<any>data).ErrorDesc) {
  //         this.alertService.showAlert("Alert", (<any>data).ErrorDesc);
  //       } else {
  //         this.alertService.showAlert("Alert!", "NACH details submission failed");
  //       }
  //     }
  //   }, err => {
  //     // this.loading.dismiss();
  //     this.globalFunc.globalLodingDismiss();
  //     if (err.name == "TimeoutError") {
  //       this.alertService.showAlert("Alert!", err.message);
  //     } else {
  //       this.alertService.showAlert("Alert!", "No response from server!");
  //     }
  //   })
  // }

  CASASubmitData() {
    this.sqlSupport
      .getCASADetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        if (data.length > 0) {
          this.CASA_data = data;
          if (this.CASA_data[0].janaAcc == 'Y') {
            if (this.CASA_data[0].nomAvail == 'Y') {
              this.getNomineeDetails();
            }
            this.getServiceDetails();
          }
        } else {
          if (
            this.items[0].constitution == '001' ||
            this.items[0].constitution == '004'
          ) {
            this.alertService.showAlert('Alert!', 'CA/SA data not found');
          }
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  getNomineeDetails() {
    this.sqlSupport
      .getNomineeDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        if (data.length > 0) {
          this.nominee_Data = data;
        } else {
          this.alertService.showAlert('Alert!', 'Nominee details not found');
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }
  getAllVehcileDetails() {
    this.sqliteProvider
      .getVehicleDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        if (data.length > 0) {
          this.vehicle_data = data;
          console.log(this.vehicle_data, 'vehicles data');
        } else {
          this.alertService.showAlert('Alert!', 'vehicle details not found');
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  getServiceDetails() {
    if (this.CASA_data[0].janaAcc == 'Y') {
      this.sqlSupport
        .getServDetails(this.applicant.refId, this.applicant.id)
        .then((data) => {
          if (data.length > 0) {
            this.service_data = data;
            // this.getServiceImgs(this.service_data[0].serId);
          } else {
            if (
              this.items[0].constitution == '001' ||
              this.items[0].constitution == '004'
            ) {
              this.alertService.showAlert('Alert!', 'Service data not found');
            }
          }
        })
        .catch((e) => {
          console.log('er' + e);
          this.items = [];
        });
    }
  }

  getNachImgs(nachId) {
    this.sqlSupport
      .getNachStateImages(nachId)
      .then((nach) => {
        if (nach.length > 0) {
          this.nach_imgs = [];
          for (let i = 0; i < nach.length; i++) {
            // this.base64.encodeFile(nach[i].imgpath).then((base64File: string) => {
            let temp_nach = {
              nachImg: nach[i].imgpath,
              nachImgName: this.applicationNumber + '_NACH_' + i + '.jpg',
            };
            this.nach_imgs.push(temp_nach);

            let nachData = {
              DocName: 'NACH',
              DocDesc: this.applicationNumber + '_NACH_' + i + '.jpg',
              DocFile: nach[i].imgpath,
            };
            this.other_docs.push(nachData);

            if (i == this.nach_imgs.length - 1) {
              console.log(this.other_docs, 'nach images');
              // console.log(JSON.stringify(this.annex_imgs));
            }
            // }, (err) => {
            //   console.log(err);
            // });
          }
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  getServiceImgs(serId) {
    this.sqlSupport
      .getSignImages(serId)
      .then((sign) => {
        if (sign.length > 0) {
          // this.base64.encodeFile(sign[0].imgpath).then((base64File: string) => {
          this.sign_imgs = sign[0].imgpath;
          let signData = {
            DocName: 'SIGN',
            DocDesc: this.applicationNumber + '_sign.jpg',
            DocFile: this.sign_imgs,
          };
          this.other_docs.push(signData);
          console.log(this.other_docs, 'service images');
          this.sqliteProvider
            .getSubmitDetails(this.applicant.refId, this.applicant.id)
            .then((submitlead) => {
              if (
                submitlead[0].IMD != '0' &&
                submitlead[0].CASA != '0' &&
                submitlead[0].NACH != '0'
              ) {
                this.uploadDocs();
              }
            });
          // }, (err) => {
          //   console.log(err);
          // });
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  getAnnexImgs(serId) {
    this.sqlSupport
      .getAnnexure(serId)
      .then((annex) => {
        if (annex.length > 0) {
          this.annex_imgs = [];
          for (let i = 0; i < annex.length; i++) {
            // this.base64.encodeFile(annex[i].imgpath).then((base64File: string) => {
            let temp_annex = {
              annexureImg: annex[i].imgpath,
              annexureImgName: this.applicationNumber + '_ANN_' + i + '.jpg',
            };
            this.annex_imgs.push(temp_annex);

            let annexData = {
              DocName: 'ANNEX',
              DocDesc: this.applicationNumber + '_ANN_' + i + '.jpg',
              DocFile: annex[i].imgpath,
            };
            this.other_docs.push(annexData);

            if (i == this.annex_imgs.length - 1) {
              console.log(this.other_docs, 'annex images');
            }
            // }, (err) => {
            //   console.log(err);
            // });
          }
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.items = [];
      });
  }

  async uploadDocs() {
    try {
      // this.loading.present();
      // this.globalFunc.globalLodingPresent('Please wait...');
      let docs_upload = {
        OtherDoc: {
          DocAppno: this.applicationNumber,
          OtherDocs: this.other_docs,
        },
      };
      // {
      //   "appNo": this.applicationNumber,
      //   "signatureImg": this.sign_imgs,
      //   "signatureImgName": this.applicationNumber + "_sign.jpg",
      //   "AnnexureDetail": this.annex_imgs
      // }
      // console.log("upload: " + JSON.stringify(docs_upload));
      console.log(JSON.stringify(docs_upload), 'UploadDocs');
      this.master.restApiCallAngular('UploadDocs', docs_upload).then(
        async (data) => {
          if ((<any>data).errorCode == '00') {
            this.submitStat = '1';
            // if(this.applicationStatus == ''){
            //   this.applicationStatus = 'Submit'
            // }
            this.applicationStatus = 'Submit';
            this.sqliteProvider.updateSubmitDetails(
              this.appCibilCheckStat,
              this.submitStat,
              this.applicationNumber,
              this.applicationStatus,
              this.appCibilColor,
              this.appCibilScore,
              this.appStatId
            );
            let alert = await this.alertCtrl.create({
              header: 'Alert',
              message: 'Application Submitted Successfully!',
              buttons: [
                {
                  text: 'OK',
                  role: 'cancel',
                  handler: () => {
                    // console.log('submitted');
                    // this.loading.dismiss();
                    // this.globalFunc.globalLodingDismiss();
                    this.navCtrl.navigate(['/ExistApplicationsPage'], {
                      skipLocationChange: true,
                      replaceUrl: true,
                    });
                  },
                },
              ],
            });
            alert.present();
            // this.loading.dismiss();
            // this.loadingService.globalLodingDismiss();
            this.loadingService.globalLodingDismiss();
          } else {
            this.documentCheck = false;
            this.loadingService.globalLodingDismiss();
            this.submitDisable = false;
            this.docUpload = true;
            this.alertService.showAlert(
              'Alert!',
              'Documents submission Failed!'
            );
          }
        },
        (err) => {
          this.loadingService.globalLodingDismiss();
          this.documentCheck = false;
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert!', err.message);
          } else {
            this.alertService.showAlert('Alert!', 'No response from server!');
          }
        }
      );
    } catch (error) {
      console.log(error.message);
      this.alertService.showAlert('Alert!', error.message);
      this.sqliteProvider.addAuditTrail(
        format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        'uploadDocs',
        'uploadDocs',
        JSON.stringify(error)
      );
    }
  }

  getproducttype(janaLoan) {
    let prdType = this.pdt_master.find((f) => {
      return f.prdCode === janaLoan;
    });
    return prdType.prdLoanType;
  }

  getKarzaDetails() {
    this.sqliteProvider.getGivenKarzaDetails().then((data) => {
      if (data.length > 0) {
        this.allKarzaData = [];
        this.allKarzaData = data;
      } else {
        this.allKarzaData = [];
      }
    });
  }

  getKarzaData(leadId) {
    let selectName = this.allKarzaData.find((f) => {
      return f.leadId == leadId;
    });
    return selectName.name;
  }

  getMandatoryCheck(proodId) {
    let prdType = this.docs_master.find((f) => {
      return f.DocID === proodId;
    });
    return prdType.DocType;
  }

  getDocumentValue() {
    let prdCode = localStorage.getItem('product');
    let custType = this.globalData.getCustomerType();
    let entityStat;
    if (custType == '1') {
      entityStat = 'N';
      this.sqliteProvider
        .getDocumentsByIndividualPrdCode(prdCode, entityStat)
        .then((data) => {
          this.docs_master = data;
        });
    } else {
      entityStat = 'Y';
      this.sqliteProvider.getDocumentsByPrdCode(prdCode).then((data) => {
        this.docs_master = data;
      });
    }
  }

  getAppDocNumber(proofName) {
    let idNumber = this.applicantDocs.find((f) => {
      return f.proofName == proofName;
    });
    if (idNumber == undefined) {
      idNumber = '';
    }
    return idNumber;
  }

  getCoAppDocNumber(proofName) {
    let idNumber = this.coapplicantDocs.find((f) => {
      return f.proofName == proofName;
    });
    if (idNumber == undefined) {
      idNumber = '';
    }
    return idNumber;
  }

  getGuaDocNumber(proofName) {
    let idNumber = this.guarantorDocs.find((f) => {
      return f.proofName == proofName;
    });
    if (idNumber == undefined) {
      idNumber = '';
    }
    return idNumber;
  }

  getNACHDetails() {
    this.sqlSupport
      .getNachDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        if (data.length > 0) {
          this.NACH_data = data;
          console.log(this.NACH_data, 'nach details');
        } else {
          this.alertService.showAlert('Alert!', 'NACH details not found');
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.NACH_data = [];
      });
  }

  getreferenceDetails() {
    this.sqlSupport
      .getreferenceDetails(this.applicant.refId, this.applicant.id)
      .then((data) => {
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            this.referenceDetails.push({
              Name: data[i].refName,
              MobNo: data[i].mobileNo,
              Address: data[i].refAddress,
              Relationship: data[i].relationship,
            });
          }
          console.log(this.referenceDetails, 'referenceDetails');
        } else {
          this.alertService.showAlert('Alert!', 'Reference details not found');
        }
      })
      .catch((e) => {
        console.log('er' + e);
        this.referenceDetails = [];
      });
  }

  convertdate(str: string) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('/');
  }

  // getDocumentStatusCheck(): Promise<any> {
  //   this.globalData.globalLodingPresent("Please wait... Documents uploading");
  //   return new Promise((resolve, reject) => {
  //     this.sqlSupport.getdocumentUpload(this.applicationNumber).then(data => {
  //       if (data.length > 0) {

  //         let document = data.map(val => {
  //           return this.docFinalReq.find(data => {
  //             if (+data.DocId == +val.DocId && +data.leadID == +val.leadID && data.DocName == val.DocName) {
  //               data.docuploadId = val.docuploadId;
  //               return +data.DocId == +val.DocId && +data.leadID == +val.leadID && data.DocName == val.DocName;
  //             }
  //           })
  //         })
  //         console.log("document", document);
  //         resolve(this.documentUpload(document, "update"));
  //       } else {
  //         resolve(this.documentUpload(this.docFinalReq, "insert"));
  //       }
  //     })
  //   })

  // }

  getDocumentStatusCheck(): Promise<any> {
    try {
      this.loadingService.globalLodingPresent(
        'Please wait... Documents uploading'
      );
      return new Promise((resolve, reject) => {
        this.sqlSupport
          .getdocumentUpload(this.applicationNumber)
          .then((data) => {
            if (data.length > 0) {
              let document = data.map((val) => {
                return this.docFinalReq.find((data) => {
                  if (
                    +data.DocId == +val.DocId &&
                    +data.leadID == +val.leadID &&
                    data.DocName == val.DocName
                  ) {
                    data.docuploadId = val.docuploadId;
                    return (
                      +data.DocId == +val.DocId &&
                      +data.leadID == +val.leadID &&
                      data.DocName == val.DocName
                    );
                  }
                });
              });
              console.log('document', document);
              resolve(this.documentUpload(document, 'update'));
            } else {
              resolve(this.documentUpload(this.docFinalReq, 'insert'));
            }
          });
      });
    } catch (error) {
      this.sqlSupport.insertErrorLog(
        error.stack,
        'SubmitPage-getDocumentStatusCheck'
      );
      this.errorLog.errorLog(error, 'SubmitPage-getDocumentStatusCheck');
    }
  }

  // documentUpload(document, flag): Promise<any> {
  //   try {
  //     return new Promise(async (resolve, reject) => {
  //       for (let i = 0; i < document.length; i++) {
  //         let imgcount = 0;
  //         let failureCount = 0
  //         if (flag == 'insert') {
  //           imgcount = +i;
  //           failureCount = this.docFinalReq.length - (i)
  //           // this.globalData.presentToastbottom("Documents uploading " + (imgcount + 1) + "/" + this.docFinalReq.length);
  //         } else {
  //           imgcount = (this.docFinalReq.length - +document.length) + i;
  //           failureCount = (document.length - i)
  //           // this.globalData.presentToastbottom("Documents uploading " +( imgcount + 1) + "/" + this.docFinalReq.length);
  //         }

  //         this.loadingService.globalLodingDismiss();

  //         this.loadChild(imgcount + 1, this.docFinalReq.length); // DynamicComponent Call

  //         let body = {
  //           "DocId": document[i].DocId, //
  //           "Document": document[i].Document, //
  //           "leadID": document[i].leadID, //
  //           "DocName": document[i].DocName, // DocName
  //           "Proposal": this.applicationNumber // this.applicationnumber
  //         }
  //         console.log(body, i, 'LoginDocument');
  //         await this.master.restApiCallAngular('LoginDocument', body).then(async data => {

  //           if ((<any>data).ErrorCode == "000") {

  //             if (flag == "insert") {
  //               this.sqlSupport.documentUpload(document[i], this.applicationNumber, "Y");
  //             } else {
  //               this.sqlSupport.documentUploadUpdate(document[i], this.applicationNumber, "Y");
  //             }

  //             if (flag == 'update') {
  //               await this.sqlSupport.documentUploadUpdate(document[i], this.applicationNumber, "Y");
  //               await this.sqlSupport.getdocumentUpload(this.applicationNumber).then(docCount => {
  //                 if (docCount.length == 0) {
  //                   this.sqlSupport.documentUploadStatus("Y", this.applicationNumber);
  //                   // if (this.documentResubmit == 'Y') {
  //                   // this.alertService.showAlert("Alert!", `${this.docFinalReq.length} documents uploaded successfullly `)
  //                   this.documentCheck = false;
  //                   this.uploadprogressCmpRef.instance.closeModal.subscribe(() => {
  //                     this.removeDynamicComponent(this.uploadprogressCmpRef);
  //                     // this.initImdSubmit(this.applicationNumber);
  //                     this.casaInit(this.applicationNumber);
  //                   })
  //                   // } else {
  //                   //   resolve(true);
  //                   // }
  //                   this.loadingService.globalLodingDismiss();
  //                 }
  //               });
  //             } else {
  //               if (i == document.length - 1) {
  //                 this.sqlSupport.documentUploadStatus("Y", this.applicationNumber);
  //                 // this.alertService.showAlert("Alert!", `${this.docFinalReq.length} documents uploaded successfullly `)
  //                 this.uploadprogressCmpRef.instance.closeModal.subscribe(() => {
  //                   this.removeDynamicComponent(this.uploadprogressCmpRef);
  //                   resolve(true);
  //                 })
  //                 this.loadingService.globalLodingDismiss();
  //               }
  //             }
  //           } else {
  //             if (flag == "insert") {
  //               this.sqlSupport.documentUpload(document[i], this.applicationNumber, "N");
  //             } else {
  //               this.sqlSupport.documentUploadUpdate(document[i], this.applicationNumber, "N");
  //             }
  //             this.sqlSupport.documentResubmitStatus("Y", this.applicationNumber);
  //             this.documentCheck = true;
  //             this.loadingService.globalLodingDismiss();

  //             let message = `Documents Upload Service Interrupted, Due to Service / Network Issues`;
  //             let submessage = `${imgcount} - Document Uploaded Successfully, ${failureCount} - Document Failed!`;
  //             this.alertService.showAlert(message, submessage);
  //             reject(false);
  //             this.globalFunc.uploadImgFailed(true);
  //           }
  //         }, err => {
  //           for (let j = i; j < document.length; j++) {
  //             console.log("J", j);
  //             if (flag == "insert") {
  //               this.sqlSupport.documentUpload(document[j], this.applicationNumber, "N");
  //             } else {
  //               this.sqlSupport.documentUploadUpdate(document[j], this.applicationNumber, "N");
  //             }
  //           }
  //           this.sqlSupport.documentResubmitStatus("Y", this.applicationNumber);
  //           i = document.length;
  //           this.loadingService.globalLodingDismiss();
  //           this.documentCheck = true;
  //           if (err.name == "TimeoutError") {
  //             this.alertService.showAlert("Alert!", err.message);
  //           } else {
  //             let message = `Documents Upload Service Interrupted, Due to Service / Network Issues`;
  //             let submessage = `${imgcount} - Document Uploaded Successfully, ${failureCount} - Document Failed!`;
  //             this.alertService.showAlert(message, submessage);
  //             // this.alertService.showAlert("Alert!", "No response from server!");
  //             this.uploadprogressCmpRef.instance.closeModal.subscribe(() => {
  //               this.removeDynamicComponent(this.uploadprogressCmpRef);
  //             })
  //           }
  //           reject(false);
  //           this.globalFunc.uploadImgFailed(true);
  //         })
  //       }
  //     })
  //   } catch (error) {
  //     console.log(error.message);
  //     this.alertService.showAlert("Alert!", error.message);
  //     this.sqliteProvider.addAuditTrail(format(new Date(), "YYYY-MM-DD HH:mm:ss"), "documentUpload", "documentUpload", JSON.stringify(error));
  //   }
  // }

  documentUpload(document, flag): Promise<any> {
    try {
      return new Promise(async (resolve, reject) => {
        for (let i = 0; i < document.length; i++) {
          let imgcount = 0;
          let failureCount = 0;
          if (flag == 'insert') {
            imgcount = +i;
            failureCount = this.docFinalReq.length - i;
            // this.globalData.presentToastbottom("Documents uploading " + (imgcount + 1) + "/" + this.docFinalReq.length);
          } else {
            imgcount = this.docFinalReq.length - +document.length + i;
            failureCount = document.length - i;
            // this.globalData.presentToastbottom("Documents uploading " +( imgcount + 1) + "/" + this.docFinalReq.length);
          }

          this.loadingService.globalLodingDismiss();

          this.loadChild(imgcount + 1, this.docFinalReq.length); // DynamicComponent Call

          let body = {
            DocId: document[i].DocId, //
            Document: document[i].Document, //
            leadID: document[i].leadID, //
            DocName: document[i].DocName, // DocName
            Proposal: this.applicationNumber, // this.applicationnumber
          };
          console.log(body, i, 'LoginDocument');
          await this.master.restApiCallAngular('LoginDocument', body).then(
            async (data) => {
              if ((<any>data).ErrorCode == '000') {
                if (flag == 'insert') {
                  this.sqlSupport.documentUpload(
                    document[i],
                    this.applicationNumber,
                    'Y'
                  );
                } else {
                  this.sqlSupport.documentUploadUpdate(
                    document[i],
                    this.applicationNumber,
                    'Y'
                  );
                }

                if (flag == 'update') {
                  await this.sqlSupport.documentUploadUpdate(
                    document[i],
                    this.applicationNumber,
                    'Y'
                  );
                  await this.sqlSupport
                    .getdocumentUpload(this.applicationNumber)
                    .then((docCount) => {
                      if (docCount.length == 0) {
                        this.sqlSupport.documentUploadStatus(
                          'Y',
                          this.applicationNumber
                        );
                        // if (this.documentResubmit == 'Y') {
                        // this.alertService.showAlert("Alert!", `${this.docFinalReq.length} documents uploaded successfullly `)
                        this.documentCheck = false;
                        this.uploadprogressCmpRef.instance.closeModal.subscribe(
                          () => {
                            this.removeDynamicComponent(
                              this.uploadprogressCmpRef
                            );
                            // this.initImdSubmit(this.applicationNumber);
                            this.casaInit(this.applicationNumber);
                          }
                        );
                        // } else {
                        //   resolve(true);
                        // }
                        this.loadingService.globalLodingDismiss();
                      }
                    });
                } else {
                  if (i == document.length - 1) {
                    this.sqlSupport.documentUploadStatus(
                      'Y',
                      this.applicationNumber
                    );
                    // this.alertService.showAlert("Alert!", `${this.docFinalReq.length} documents uploaded successfullly `)
                    this.uploadprogressCmpRef.instance.closeModal.subscribe(
                      () => {
                        this.removeDynamicComponent(this.uploadprogressCmpRef);
                        resolve(true);
                      }
                    );
                    this.loadingService.globalLodingDismiss();
                  }
                }
              } else {
                if (flag == 'insert') {
                  this.sqlSupport.documentUpload(
                    document[i],
                    this.applicationNumber,
                    'N'
                  );
                } else {
                  this.sqlSupport.documentUploadUpdate(
                    document[i],
                    this.applicationNumber,
                    'N'
                  );
                }
                this.sqlSupport.documentResubmitStatus(
                  'Y',
                  this.applicationNumber
                );
                this.documentCheck = true;
                this.loadingService.globalLodingDismiss();

                let message = `Documents Upload Service Interrupted, Due to Service / Network Issues`;
                let submessage = `${imgcount} - Document Uploaded Successfully, ${failureCount} - Document Failed!`;
                this.alertService.showAlert(message, submessage);
                reject(false);
                this.globalFunc.uploadImgFailed(true);
              }
            },
            (err) => {
              for (let j = i; j < document.length; j++) {
                console.log('J', j);
                if (flag == 'insert') {
                  this.sqlSupport.documentUpload(
                    document[j],
                    this.applicationNumber,
                    'N'
                  );
                } else {
                  this.sqlSupport.documentUploadUpdate(
                    document[j],
                    this.applicationNumber,
                    'N'
                  );
                }
              }
              this.sqlSupport.documentResubmitStatus(
                'Y',
                this.applicationNumber
              );
              i = document.length;
              this.loadingService.globalLodingDismiss();
              this.documentCheck = true;
              if (err.name == 'TimeoutError') {
                this.alertService.showAlert('Alert!', err.message);
              } else {
                let message = `Documents Upload Service Interrupted, Due to Service / Network Issues`;
                let submessage = `${imgcount} - Document Uploaded Successfully, ${failureCount} - Document Failed!`;
                this.alertService.showAlert(message, submessage);
                // this.alertService.showAlert("Alert!", "No response from server!");
                this.uploadprogressCmpRef.instance.closeModal.subscribe(() => {
                  this.removeDynamicComponent(this.uploadprogressCmpRef);
                });
              }
              reject(false);
              this.globalFunc.uploadImgFailed(true);
            }
          );
        }
      });
    } catch (error) {
      console.log(error.message);
      this.alertService.showAlert('Alert!', error.message);
      this.sqliteProvider.addAuditTrail(
        moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        'documentUpload',
        'documentUpload',
        JSON.stringify(error)
      );
    }
  }

  // loadChild(imgCount: number, totalImgCount: number) {
  //   try {
  //     /*
  //       this function is use to call the DynamicComponent When the document uploding time
  //       and shows the uploading image count to the User
  //     */

  //     this.myRef.clear();
  //     const progressComponent = this.factoryRef.resolveComponentFactory(ProgressbarComponent);
  //     // const compRef : ViewContainerRef = this.childRef.viewRef;
  //     this.myRef.clear();
  //     this.uploadprogressCmpRef = this.myRef.createComponent(progressComponent);
  //     this.uploadprogressCmpRef.instance.uploadImageCnt = imgCount //passing upload count
  //     this.uploadprogressCmpRef.instance.totalImageCnt = totalImgCount //passing Total count
  //     this.uploadprogressCmpRef.instance.closeModal.subscribe(() => {
  //       this.removeDynamicComponent(this.uploadprogressCmpRef);

  //     })
  //   } catch (error) {
  //     console.log(error.message)
  //     this.alertService.showAlert("Alert!", error.message);
  //     this.sqliteProvider.addAuditTrail(format(new Date(), "YYYY-MM-DD HH:mm:ss"), "documentUpload", "documentUpload", JSON.stringify(error));
  //   }

  // }

  loadChild(imgCount: number, totalImgCount: number) {
    try {
      /*
        this function is use to call the DynamicComponent When the document uploding time 
        and shows the uploading image count to the User
      */

      this.myRef.clear();
      const progressComponent =
        this.factoryRef.resolveComponentFactory(ProgressbarComponent);
      // const compRef : ViewContainerRef = this.childRef.viewRef;
      this.myRef.clear();
      this.uploadprogressCmpRef = this.myRef.createComponent(progressComponent);
      this.uploadprogressCmpRef.instance.uploadImageCnt = imgCount; //passing upload count
      this.uploadprogressCmpRef.instance.totalImageCnt = totalImgCount; //passing Total count
      this.uploadprogressCmpRef.instance.closeModal.subscribe(() => {
        this.removeDynamicComponent(this.uploadprogressCmpRef);
      });
    } catch (error) {
      console.log(error.message);
      this.alertService.showAlert('Alert!', error.message);
      this.sqliteProvider.addAuditTrail(
        moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        'documentUpload',
        'documentUpload',
        JSON.stringify(error)
      );
    }
  }

  removeDynamicComponent(component) {
    //this function helps to destroy the dynamic component when the uploding completed.
    component.destroy();
  }
}
