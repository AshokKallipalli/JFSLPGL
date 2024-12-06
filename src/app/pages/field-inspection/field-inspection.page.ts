import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { PicproofPage } from '../picproof/picproof.page';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Geolocation } from '@capacitor/geolocation';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';

@Component({
  selector: 'app-field-inspection',
  templateUrl: './field-inspection.page.html',
  styleUrls: ['./field-inspection.page.scss'],
})
export class FieldInspectionPage implements OnInit {
  fieldInspectionDetails: FormGroup;
  selectOptions = {
    cssClass: 'remove-ok',
  };
  proofImglen: any = 0;
  proofImgs = [];
  refId: any;
  id: any;
  fieldId: any;
  submitDisable: boolean = false;
  ownershipMaster: any = [];
  fieldInfo: any;
  presLat: any;
  presLong: any;
  fieldSbt: boolean = true;
  showField = true;
  feedback: any;
  selectedUser: any;
  positiveUserList: any = [];
  negativeUserList: any = [];
  fieldUpload: any;
  disableBtn = false;
  fieldImgArray: any = [];

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  constructor(
    public router: Router,
    public modalCtrl: ModalController,
    public globalData: GlobalService,
    public global: DataPassingProviderService,
    public platform: Platform,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public route: ActivatedRoute,
    public master: RestService,
    // public viewCtrl: ViewController,
    public sqliteSupport: SquliteSupportProviderService,
    public alertService: CustomAlertControlService, // public base64: Base64
    public loadingService: CustomLoadingControlService
  ) {
    // this.getresType();
    this.formgroup();
    this.getVehicleWorkflow();
    // if (localStorage.getItem("submit") == "true") {
    //   this.submitDisable = true;
    //   localStorage.setItem("submit", "true");
    // } else {
    //   this.submitDisable = false;
    // }
    this.fieldInfo = JSON.parse(
      this.route.snapshot.queryParamMap.get('submitData')
    );
    this.refId = this.fieldInfo.refId;
    (this.id = this.fieldInfo.id), this.getResStatus();
    this.getAllFieldValues(this.fieldInfo);
    this.getFieldInspectionFormValues();
    this.loadAllApplicantDetails();
  }

  async ionViewDidEnter() {
    await this.getCoordinates();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FieldInspectionPage');
  }

  ngAfterViewInit() {
    this.platform.ready().then((readySource) => {
      if (readySource === 'cordova') {
        let posOptions = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        };
      }
    });
  }

  async getCoordinates() {
    try {
      this.loadingService.globalLodingPresent('Fetching Location');
      const coordinates = await Geolocation.getCurrentPosition();
      console.log('coordinates', coordinates);
      this.presLat = coordinates.coords.latitude;
      this.presLong = coordinates.coords.longitude;
      this.fieldInspectionDetails.get('latitude').setValue(this.presLat);
      this.fieldInspectionDetails.get('longitude').setValue(this.presLong);
      this.loadingService.globalLodingDismiss();
    } catch (error) {
      console.log('Get Location:', error.message);
      this.loadingService.globalLodingDismiss();
      this.alertService.showAlert('Alert', error.message);
    }
  }

  getVehicleWorkflow() {
    this.sqliteProvider
      .getVehicleApproval('Recommendation & Approval')
      .then((positiveUser) => {
        this.positiveUserList = positiveUser.filter(
          (val) => val.UserGroupName !== 'BH'
        );
        // const filterBHValue = positiveUser;
        // this.positiveUserList = filterBHValue.filter(val => val.UserGroupName !== 'BH');
      })
      .then((data) => {
        this.sqliteProvider
          .getVehicleWorkflowList('FI Reject Review')
          .then((negativeUser) => {
            this.negativeUserList = negativeUser;
          });
      });
  }
  applicantDetails: any = [];
  loadAllApplicantDetails() {
    this.sqliteProvider
      .getApplicantDataAfterSubmit(this.refId)
      .then((data) => {
        if (data.length > 0) {
          this.applicantDetails = [];
          this.applicantDetails = data;
          if (data[0].manualApprovalSucess == 'Y') {
            this.disableBtn = true;
          }
          // this.appStatId = data[0].statId;
          // this.id = data[0].id;
          // this.cibilScore = data[0].cibilScore;
          // this.showFooter = true;
          // this.getAppStatus();
          // this.getRequiredScore();
          // this.checkEligibile();
        } else {
          this.applicantDetails = [];
        }
        // this.id = data[0].id;
        // this.appCustId = data[0].LpCustid;
      })
      .catch((e) => {
        console.log('er' + e);
        this.applicantDetails = [];
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

  formgroup() {
    this.fieldInspectionDetails = this.formBuilder.group({
      fieldLocation: [
        '',
        [Validators.pattern('[a-zA-Z ]*'), Validators.required],
      ],
      inspectedDate: ['', Validators.required],
      appNo: ['', [Validators.pattern('[0-9]*'), Validators.required]],
      personMet: ['', [Validators.pattern('[a-zA-Z ]*'), Validators.required]],
      customerRelationship: [
        '',
        [Validators.pattern('[a-zA-Z ]*'), Validators.required],
      ],
      customerName: [
        '',
        [Validators.pattern('[a-zA-Z ]*'), Validators.required],
      ],
      customerMobileNum: [
        '',
        [Validators.pattern('[0-9]{10}$'), Validators.required],
      ],
      customerAddress: [
        '',
        Validators.compose([
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>\/]*$/),
          Validators.maxLength(40),
          Validators.minLength(3),
          Validators.required,
        ]),
      ],
      neighbourName1: [
        '',
        [Validators.pattern('[a-zA-Z ]*'), Validators.required],
      ],
      neighbour1Check: ['', Validators.required],
      neighbourName2: [
        '',
        [Validators.pattern('[a-zA-Z ]*'), Validators.required],
      ],
      neighbour2Check: ['', Validators.required],
      residenceStabilityCheck: ['', Validators.required],
      houseOwnerShip: ['', Validators.required],
      agencyFeedback: ['', Validators.required],
      additionalRemarks: [''],
      latitude: ['', [Validators.pattern('[0-9.]*'), Validators.required]],
      longitude: ['', [Validators.pattern('[0-9.]*'), Validators.required]],
    });
  }

  homePage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  getResStatus() {
    this.sqliteProvider
      .getMasterDataUsingType('ResidenceStatus')
      .then((data) => {
        this.ownershipMaster = data;
      });
  }

  fieldInspectionDetailsSave(formValue) {
    this.loadingService.globalLodingPresent('Please wait...');
    console.log(formValue);
    if (this.proofImgs.length === 0) {
      this.alertService.showAlert('Alert!', 'Please Add Background Image');
      this.loadingService.globalLodingDismiss();
    } else {
      this.sqliteProvider
        .insertFieldInspectionDetails(
          this.refId,
          this.id,
          formValue,
          this.fieldId,
          JSON.stringify(this.proofImgs),
          'N'
        )
        .then((data) => {
          console.log(data);
          if (
            this.fieldId === '' ||
            this.fieldId === undefined ||
            this.fieldId === null
          ) {
            this.fieldId = data.insertId;
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert',
              'Field Investigation Values Added Successfully.'
            );
            this.fieldSbt = false;
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert',
              'Field Investigation Values Updated Successfully.'
            );
            this.fieldSbt = false;
          }
        })
        .catch((err) => {
          console.log(err);
          this.loadingService.globalLodingDismiss();
        });
    }
  }

  async showpicmaodal(value) {
    if (value == 'idproof') {
      if (this.proofImglen < 3) {
        const modal = await this.modalCtrl.create({
          component: PicproofPage,
          componentProps: {
            proofpics: this.proofImgs,
            submitstatus: this.submitDisable,
            fromFieldInves: true,
          },
          cssClass: '',
          showBackdrop: true,
          animated: true,
        });
        modal.present();
        modal.onDidDismiss().then(async (data) => {
          this.proofImgs = [];
          this.proofImgs = data.data;
          this.proofImglen = data.data.length;
        });
        console.log(this.proofImglen, this.proofImgs);
      } else {
        this.alertService.showAlert(
          'Alert!',
          'Maximum Two Image only allowed.'
        );
      }
    }
  }

  getAllFieldValues(data) {
    // this.fieldInspectionDetails.get("inspectedDate").setValue(data.applDate);
    this.fieldInspectionDetails.get('appNo').setValue(data.applicationNumber);
    this.fieldInspectionDetails
      .get('customerName')
      .setValue(data.firstname + ' ' + data.lastname);
    this.fieldInspectionDetails
      .get('customerMobileNum')
      .setValue(this.globalData.basicDec(data.mobNum));
    // this.fieldInspectionDetails.get("customerMobileNum").setValue(data.mobNum);
  }

  getFieldInspectionFormValues() {
    if (!!this.refId) {
      try {
        const exceptCol = ['refId', 'id', 'fieldId', 'backgroundImg'];
        this.sqliteProvider.getFieldInspectionDetails(this.refId, this.id).then(
          (data) => {
            console.log(data);
            if (data.length > 0) {
              let mStatus = data[0].manualStatus;
              if (mStatus == 'Y') {
                this.showField = false;
              } else {
                this.showField = true;
              }

              this.fieldId = data[0].fieldId;
              this.feedback = data[0].agencyFeedback;
              this.proofImgs = JSON.parse(data[0].backgroundImg);
              this.proofImglen = this.proofImgs.length;
              let fieldIns = data[0].fieldInsFlag;
              if (fieldIns == 'Y') {
                this.fieldSbt = true;
                this.submitDisable = true;
              } else {
                this.fieldSbt = false;
                this.submitDisable = false;
              }

              let dataKeys = Object.keys(data[0]);
              for (let i = 0; i <= dataKeys.length - 1; i++) {
                if (exceptCol.indexOf(dataKeys[i]) == -1) {
                  this.fieldInspectionDetails.controls[dataKeys[i]].setValue(
                    data[0][dataKeys[i]]
                  );
                }
              }
            }
          },
          (err) => {
            console.log(err);
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  submitFieldIns() {
    this.loadingService.globalLodingPresent('Please wait...');
    this.sqliteProvider.getFieldInspectionDetails(this.refId, this.id).then(
      async (imgdata) => {
        console.log('imgs', imgdata);
        let fieldInsImages = JSON.parse(imgdata[0].backgroundImg);
        for (let i = 0; i < fieldInsImages.length; i++) {
          // this.base64.encodeFile(fieldInsImages[i].imgpath).then(async (base64File: string) => {
          // let fieldImg = base64File.replace(/\n/g, '');
          let fieldImg = fieldInsImages[i].imgpath;
          let PropNo = this.fieldInspectionDetails.get('appNo').value;
          //let filetype = fieldInsImages[i].imgpath.substring(fieldInsImages[i].imgpath.lastIndexOf("."));
          let fieldInvData = {
            DocName: 'FIELD',
            DocDesc: PropNo + '_FieldInspection_' + i + '.jpg',
            DocFile: fieldImg,
          };
          await this.fieldImgArray.push(fieldInvData);
          if (i == fieldInsImages.length - 1) {
            this.uploadFieldInspection();
          }
          // });
        }
      },
      (err) => {
        console.log(err);
        this.loadingService.globalLodingDismiss();
      }
    );
  }

  uploadFieldInspection() {
    this.sqliteProvider.getFieldInspectionDetails(this.refId, this.id).then(
      (data) => {
        console.log(data);
        this.feedback = data[0].agencyFeedback;
        let fieldData = {
          PropNo: data[0].appNo,
          Location: data[0].fieldLocation,
          Date:
            data[0].inspectedDate.substring(8, 10) +
            '/' +
            data[0].inspectedDate.substring(5, 7) +
            '/' +
            data[0].inspectedDate.substring(0, 4),
          PersonMet: data[0].personMet,
          RelationwithCustomer: data[0].customerRelationship,
          CustName: data[0].customerName,
          CustMobNo: data[0].customerMobileNum,
          // "CustMobNo": data[0].customerMobileNum,
          CustAdd1: data[0].customerAddress,
          NeighName1: data[0].neighbourName1,
          NeighName2: data[0].neighbourName2,
          ResStability: data[0].residenceStabilityCheck,
          HouseOwnerShip: data[0].houseOwnerShip,
          AddRemarks: data[0].additionalRemarks,
          AgencyFeedback: data[0].agencyFeedback,
          Latitude: data[0].latitude,
          Longitude: data[0].longitude,
          CustAdd2: '',
          CustAdd3: '',
          NeighCheck1: data[0].neighbour1Check,
          NeighCheck2: data[0].neighbour2Check,
          // "DocuName": imgdata[0].backgroundImg.substring(imgdata[0].backgroundImg.lastIndexOf("/") + 1),
          // "DocuImg": this.fieldUpload.DocImg
        };
        this.master
          .restApiCallAngular('FieldInvestigation', fieldData)
          .then((res) => {
            let fieldRes = <any>res;
            if (fieldRes.ErrorCode === '000') {
              this.uploadFieldImages(data[0].appNo);
            } else if (fieldRes.ErrorCode === '001') {
              this.fieldSbt = false;
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert(
                'Alert',
                fieldRes.ErrorDesc
                  ? fieldRes.ErrorDesc
                  : 'Field Investigation Submitted Failed!!!'
              );
            } else {
              this.fieldSbt = false;
              this.loadingService.globalLodingDismiss();
              this.alertService.showAlert('Alert', fieldRes.ErrorDesc);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  uploadFieldImages(PropNo) {
    let docs_upload = {
      OtherDoc: {
        DocAppno: PropNo,
        OtherDocs: this.fieldImgArray,
      },
    };
    this.master
      .restApiCallAngular('UploadDocs', docs_upload)
      .then((res) => {
        let sanctionRes = <any>res;
        if (sanctionRes.errorCode == '00') {
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert(
            'Alert',
            'Field Investigation Submitted Successfully'
          );
          this.showField = false;
          this.fieldSbt = true;
          this.sqliteProvider
            .updateFieldInvestigationFlag(this.refId, this.id, 'Y', 'Y')
            .then((data) => {
              console.log(data);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          this.loadingService.globalLodingDismiss();
          this.alertService.showAlert('Alert', sanctionRes.errorDesc);
        }
      })
      .catch((err) => {
        this.loadingService.globalLodingDismiss();
        console.log(err);
      });
  }

  onUserChange(ev) {
    if (this.feedback == '1') {
      // 1 = positive
      this.selectedUser = this.positiveUserList.find(
        (data) => data.UserGroup == ev.detail.value
      );
    } else {
      this.selectedUser = this.negativeUserList.find(
        (data) => data.UserGroup == ev.detail.value
      );
    }
  }

  fiSubmit() {
    this.loadingService.globalLodingPresent('Please wait');
    let body = {
      userId: this.applicantDetails[0].createdUser,
      PropNo: this.applicantDetails[0].applicationNumber,
      nextFlowPoint: this.selectedUser.flowPoint,
      GroupId: this.selectedUser.UserGroup,
    };

    this.master
      .restApiCallAngular('mobileWorkflow', body)
      .then(
        (res) => {
          let fieldInvesRes = <any>res;
          if (fieldInvesRes.ErrorCode === '000') {
            this.loadingService.globalLodingDismiss();
            this.sqliteSupport.updateManualApprovalForSubmit(
              this.applicantDetails[0].applicationNumber
            );
            if (this.feedback == '1') {
              this.sqliteSupport
                .updateManualApproval(
                  this.applicantDetails[0].applicationNumber,
                  'Y'
                )
                .then((data) => {
                  this.router.navigate(['/ExistApplicationsPage'], {
                    skipLocationChange: true,
                    replaceUrl: true,
                  });
                });
            } else {
              this.alertService
                .showAlert('Alert', 'Field Investigation rejected')
                .then((data) => {
                  this.sqliteSupport
                    .removeAllApplicantDetails(this.refId)
                    .then((data) => {
                      this.router.navigate(['/ExistApplicationsPage'], {
                        skipLocationChange: true,
                        replaceUrl: true,
                      });
                    });
                });
            }
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert', fieldInvesRes.ErrorDesc);
          }
        },
        (err) => {
          this.loadingService.globalLodingDismiss();
          if (err) {
            this.alertService.showAlert('Alert', err.message);
          } else {
            this.alertService.showAlert('Alert', 'No Response from Server!');
          }
          this.loadingService.globalLodingDismiss();
        }
      )
      .catch((err) => err);
  }
}
