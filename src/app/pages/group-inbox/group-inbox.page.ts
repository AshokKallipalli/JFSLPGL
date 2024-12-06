import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { NavController, NavParams } from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-group-inbox',
  templateUrl: './group-inbox.page.html',
  styleUrls: ['./group-inbox.page.scss'],
})
export class GroupInboxPage implements OnInit {
  groupInboxList: any = [];
  count = 0;
  itemsPerPage = 10;
  currentPage = 1;
  userName = '';
  loginDetails: any[];

  deviceId: any;
  loanAmountFrom: any;
  loanAmountTo: any;
  guaFlag: any;
  pdt_master: any;
  dateValue: any;
  guacibilCheckStat: any;
  guasubmitStat: any;
  applicationNumber: any;
  applicationStatus: any;
  leadStatus: any;
  showSearch: boolean;
  itemslist: any[] = [];
  userGroupsName = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public master: RestService,
    // public globalFunction: GlobalfunctionsProvider,
    public globFunc: GlobalService,
    public network: Network,
    public sqliteProvider: SqliteService,
    public sqlSupport: SquliteSupportProviderService,
    public device: Device,
    public router: Router,
    public alertService: CustomAlertControlService
  ) {
    this.userName = this.globFunc.basicDec(localStorage.getItem('username'));
  }

  ngOnInit() {
    this.getProductValue();
    this.getUserGroupsNames();
    this.sqliteProvider
      .getUserIDLoginDetails(this.userName)
      .then((val) => {
        console.log(val, 'login details in inbox');
        this.loginDetails = val;
        this.getGroupInboxData();
      })
      .catch((err) => err);

    console.log('object');
    this.sqliteProvider
      .getVehicleApproval('Recommendation & Approval')
      .then((positiveUser) => {
        console.log(positiveUser, 'AR');
      });
  }

  ionViewDidEnter() {
    // this.groupInboxList = [];
    // this.sqliteProvider.getUserIDLoginDetails(this.userName).then(val => {
    //   console.log(val, 'login details in inbox');
    //   this.loginDetails = val;
    //   this.getGroupInboxData();
    // }).catch(err => err)
  }

  getUserGroupsNames() {
    let userGroup;
    this.sqliteProvider.getUserIDLoginDetails(this.userName).then((data) => {
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupInboxPage');
  }
  //

  pageCount(value) {
    this.groupInboxList = [];
    this.count = value == '+' ? this.count + 1 : this.count - 1;
    this.getGroupInboxData('', this.count);
  }

  getGroupInboxData(event?, count?: number) {
    count = event != '' ? this.count : count;
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert('Alert', 'Please enable Internet connection');
      event ? event.detail.complete() : '';
    } else {
      let request = {
        UserID: this.userName,
        Groups: JSON.parse(this.loginDetails[0].userGroups),
        page: count,
      };
      this.globFunc.globalLodingPresent('Please wait...');
      this.master.restApiCallAngular('getMobileGroupInbox', request).then(
        async (data) => {
          let groupInboxResponse = <any>data;
          console.log(data, 'PdLeadDetails');

          if (groupInboxResponse.errorCode === '000') {
            if (
              'PdLeadDetails' in groupInboxResponse &&
              groupInboxResponse.PdLeadDetails.length > 0
            ) {
              for (
                let i = 0;
                i < groupInboxResponse.PdLeadDetails.length;
                i++
              ) {
                // groupInboxResponse.PdLeadDetails[i].SfosLead = JSON.parse(groupInboxResponse.PdLeadDetails[i].SfosLead);
                let flowdesc = await this.sqlSupport.getFlowPoint(
                  groupInboxResponse.PdLeadDetails[i].FlowPoint
                );
                console.log(flowdesc[0]['flowDesc'], 'from db');
                groupInboxResponse.PdLeadDetails[i]['flowPointDesc'] =
                  flowdesc[0]['flowDesc'];
                // if (groupInboxResponse.PdLeadDetails[i].SfosLead.LeadMain.Lead.SendbackRemarks == undefined ||
                //   groupInboxResponse.PdLeadDetails[i].SfosLead.LeadMain.Lead.SendbackRemarks == null ||
                //   groupInboxResponse.PdLeadDetails[i].SfosLead.LeadMain.Lead.SendbackRemarks == "") {
                //   groupInboxResponse.PdLeadDetails[i].SfosLead.LeadMain.Lead['SendbackRemarks'] = ''
                // } else {
                //   groupInboxResponse.PdLeadDetails[i].SfosLead.LeadMain.Lead.SendbackRemarks = groupInboxResponse.PdLeadDetails[i].SfosLead.LeadMain.Lead.SendbackRemarks
                // }
                console.log(groupInboxResponse.PdLeadDetails[i], 'after db');
              }
              this.groupInboxList = groupInboxResponse.PdLeadDetails;
              this.groupInboxSort(this.groupInboxList).then(async (data) => {
                if (data) {
                  this.groupInboxList = await data;
                  setTimeout(() => {}, 1000);
                  console.log(this.groupInboxList, 'group inbox data');
                }
              });
              this.itemslist = this.groupInboxList;
              this.globFunc.globalLodingDismiss();
              event.detail.complete();
            } else {
              this.globFunc.globalLodingDismiss();
              this.alertService.showAlert('Alert', 'No data found!');
              event.detail.complete();
            }
          } else {
            // event.detail.complete();
            event ? event.detail.complete() : '';

            this.alertService.showAlert('Alert', groupInboxResponse.errorDesc);
          }
        },
        (err) => {
          console.log(err, 'ssssssssssssssss');
          // this.globFunc.globalLodingDismiss();
          // event.detail.complete();
          event ? event.detail.complete() : '';
          if (err.name == 'TimeoutError') {
            this.alertService.showAlert('Alert', err.message);
          } else {
            this.alertService.showAlert('Alert', 'No response from server!');
          }
        }
      );
      // this.globFunc.globalLodingDismiss();
      // event.detail.complete();;
    }
  }

  groupInboxSort(data) {
    return new Promise((resolve, reject) => {
      if (data) {
        resolve(data.sort((a, b) => b.AppNo - a.AppNo));
      } else {
        reject();
      }
    });
  }

  getUserDetails(fse) {
    this.globFunc.globalLodingPresent('Please Wait...');
    let body = {
      UserID: this.userName,
      propNo: fse.AppNo,
      Groups: JSON.parse(this.loginDetails[0].userGroups),
    };
    this.master
      .restApiCallAngular('getPdDetailsILVL', body)
      .then(async (res: any) => {
        let result = res;
        if (result.errorCode == '000') {
          result.PdLeadDetails[0].SfosLead = JSON.parse(
            result.PdLeadDetails[0].SfosLead
          );
          let flowdesc = await this.sqlSupport.getFlowPoint(
            result.PdLeadDetails[0].FlowPoint
          );
          result.PdLeadDetails[0]['flowPointDesc'] = flowdesc[0]['flowDesc'];
          console.log(flowdesc[0]['flowDesc'], 'After db');
          let fseObj = result.PdLeadDetails[0];
          this.globFunc.globalLodingDismiss();
          this.proceedApplication(fseObj);
        } else {
          this.globFunc.globalLodingDismiss();
          this.alertService.showAlert('Alert!', result.errorDesc);
        }
      })
      .catch((err) => {
        this.globFunc.globalLodingDismiss();
        console.log(JSON.stringify(err));
        this.alertService.showAlert('Alert!', 'Something went wrong!!!');
      });
  }

  proceedApplication(data) {
    console.log(data, 'received proposal');
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert('Alert', 'Please enable Internet connection');
    } else {
      if (
        data.flowPointDesc.toLowerCase() ==
          'Sourcing Data entry'.toLowerCase() &&
        data.CreditReviewFlag != 'Y'
      ) {
        this.alertService.showAlert('Alert', 'Credit review is not approved');
      } else {
        // this.globalFunction.globalLodingPresent('Please wait...')
        let request = {
          UserID: this.userName,
          proposalNo: data.AppNo,
        };

        this.master
          .restApiCallAngular('receiveProposal', request)
          .then(
            (res) => {
              if ((<any>res).errorCode === '000') {
                // this.globalFunction.globalLodingDismiss();
                // this.groupInboxList = [];
                this.proceedToExistingApp(data);
                console.log(res, 'received proposal response');
              } else {
                this.alertService.showAlert('Alert', (<any>res).errorDesc);
              }
            },
            (err) => {
              // this.globalFunction.globalLodingDismiss();
              if (err.name == 'TimeoutError') {
                this.alertService.showAlert('Alert', err.message);
              } else {
                this.alertService.showAlert(
                  'Alert',
                  'No response from server!'
                );
              }
            }
          )
          .catch((err) => err);
      }
    }
  }

  proceedToExistingApp(groupInboxData) {
    this.sqliteProvider
      .getSubmittedApplications(this.userName)
      .then((data) => {
        if (data.length > 0) {
          let submittedApp = data;
          let application = submittedApp.find(
            (value) => value.applicationNumber == groupInboxData.AppNo
          );

          if (application) {
            let eliAmt;
            let eliValue = groupInboxData.eligibleAmount.toString().split('.');
            if (eliValue[1] <= '49') {
              eliAmt = Math.floor(groupInboxData.eligibleAmount);
            } else {
              eliAmt = Math.ceil(groupInboxData.eligibleAmount);
            }

            let sanctionAmt;
            let sanValue = groupInboxData.SanctionAmount.toString().split('.');
            if (sanValue[1] <= '49') {
              sanctionAmt = Math.floor(groupInboxData.SanctionAmount);
            } else {
              sanctionAmt = Math.ceil(groupInboxData.SanctionAmount);
            }

            let emiAmt;
            let emiValue = groupInboxData.emi.toString().split('.');
            if (emiValue[1] <= '49') {
              emiAmt = Math.floor(groupInboxData.emi);
            } else {
              emiAmt = Math.ceil(groupInboxData.emi);
            }

            // this.sqlSupport.updateEligibleAmout(Math.ceil(groupInboxData.eligibleAmount), groupInboxData.AppNo);
            // this.sqlSupport.updateSanctionedAmount(Math.ceil(groupInboxData.SanctionAmount), groupInboxData.emi, groupInboxData.AppNo);
            this.sqlSupport.updateEligibleAmout(eliAmt, groupInboxData.AppNo);
            this.sqlSupport.updateSanctionedAmount(
              sanctionAmt,
              emiAmt,
              groupInboxData.AppNo
            );

            if (
              groupInboxData.flowPointDesc.toLowerCase() ==
                'Sourcing Data entry'.toLowerCase() &&
              groupInboxData.CreditReviewFlag == 'Y'
            ) {
              this.sqlSupport
                .updateFromGroupInbox(groupInboxData.AppNo, 'Y')
                .then((data) => {
                  this.sqlSupport.updateCreditCheckStatus(
                    groupInboxData.AppNo,
                    '1'
                  );
                  this.router.navigate(['/ExistApplicationsPage'], {
                    queryParams: { fromGroupInbox: 'Y' },
                    skipLocationChange: true,
                    replaceUrl: true,
                  });
                });
            } else if (
              groupInboxData.flowPointDesc.toLowerCase() ==
                'Sourcing Data entry'.toLowerCase() &&
              groupInboxData.CreditReviewFlag == 'N'
            ) {
              this.alertService.showAlert(
                'Alert!',
                'Cannot proceed further. Credit review is not approved!'
              );
            } else if (
              groupInboxData.flowPointDesc.toLowerCase() ==
              'Field Investigation'.toLowerCase()
            ) {
              this.sqlSupport
                .updateFromGroupInbox(groupInboxData.AppNo, 'Y')
                .then((data) => {
                  this.sqlSupport
                    .updateCreditCheckStatus(groupInboxData.AppNo, '1')
                    .then((data) => {
                      this.sqlSupport
                        .updateFieldInvestigationStatus(
                          groupInboxData.AppNo,
                          'Y'
                        )
                        .then((data) => {
                          this.sqliteProvider
                            .updateFIstatus(groupInboxData.AppNo, 'N')
                            .then((data) => {
                              this.sqlSupport
                                .updateManualApproval(groupInboxData.AppNo, 'N')
                                .then((data) => {
                                  this.router.navigate(
                                    ['/ExistApplicationsPage'],
                                    {
                                      queryParams: { fromGroupInbox: 'Y' },
                                      skipLocationChange: true,
                                      replaceUrl: true,
                                    }
                                  );
                                });
                            });
                        });
                    });
                });
            } else if (
              groupInboxData.flowPointDesc.toLowerCase() ==
              'Post sanction Activities'.toLowerCase()
            ) {
              this.sqlSupport
                .updateFromGroupInbox(groupInboxData.AppNo, 'Y')
                .then((data) => {
                  this.sqlSupport
                    .updateFieldInvestigationStatus(groupInboxData.AppNo, 'Y')
                    .then((data) => {
                      this.sqliteProvider
                        .updateFIstatus(groupInboxData.AppNo, 'N')
                        .then((data) => {
                          this.sqlSupport
                            .updateForPostSanction(
                              groupInboxData.AppNo,
                              '1',
                              'N'
                            )
                            .then((data) => {
                              this.sqlSupport
                                .getPostSanctionDetails(
                                  application.refId,
                                  application.id
                                )
                                .then((postSancData) => {
                                  if (postSancData.length > 0) {
                                    this.sqlSupport.updateBasicDetailsFromGroupInbox(
                                      groupInboxData,
                                      application.refId,
                                      application.id
                                    );
                                    this.sqlSupport
                                      .updatePostSanctionTable(
                                        groupInboxData.AppNo,
                                        groupInboxData
                                      )
                                      .then((data) => {
                                        this.sqlSupport
                                          .updateSanctionModifiedState(
                                            groupInboxData.AppNo
                                          )
                                          .then((data) => {
                                            this.sqlSupport
                                              .updateDisbursementFlag(
                                                groupInboxData.AppNo
                                              )
                                              .then((data) => {
                                                this.sqlSupport
                                                  .updateInstakitStatus(
                                                    groupInboxData.AppNo
                                                  )
                                                  .then((data) => {
                                                    this.router.navigate(
                                                      [
                                                        '/ExistApplicationsPage',
                                                      ],
                                                      {
                                                        queryParams: {
                                                          fromGroupInbox: 'Y',
                                                        },
                                                        skipLocationChange:
                                                          true,
                                                        replaceUrl: true,
                                                      }
                                                    );
                                                  });
                                              });
                                          });
                                      });
                                  } else {
                                    this.router.navigate(
                                      ['/ExistApplicationsPage'],
                                      {
                                        queryParams: { fromGroupInbox: 'Y' },
                                        skipLocationChange: true,
                                        replaceUrl: true,
                                      }
                                    );
                                  }
                                });
                            });
                        });
                    });
                });
            } else if (
              groupInboxData.flowPointDesc.toLowerCase() ==
              'Post DB Document Upload'.toLowerCase()
            ) {
              this.sqlSupport
                .updateFromGroupInbox(groupInboxData.AppNo, 'Y')
                .then((data) => {
                  this.sqlSupport
                    .updateFieldInvestigationStatus(groupInboxData.AppNo, 'Y')
                    .then((data) => {
                      this.sqlSupport
                        .updateForPostSanction(groupInboxData.AppNo, '1', 'N')
                        .then((data) => {
                          this.sqlSupport
                            .updateForPddDoc(groupInboxData.AppNo, 'Y')
                            .then((data) => {
                              this.router.navigate(['/ExistApplicationsPage'], {
                                queryParams: { fromGroupInbox: 'Y' },
                                skipLocationChange: true,
                                replaceUrl: true,
                              });
                            });
                        });
                    });
                });
            }

            // this.navCtrl.push(ExistApplicationsPage, { fromGroupInbox: 'Y' });
          } else {
            this.insertGroupInboxOnData(groupInboxData);
            this.applicationNumber = groupInboxData.AppNo;
          }
        } else {
          this.insertGroupInboxOnData(groupInboxData);
          this.applicationNumber = groupInboxData.AppNo;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  insertGroupInboxOnData(groupInboxData) {
    this.globFunc.globalLodingPresent('loading...');
    this.deviceId = this.device.uuid;

    this.sqlSupport
      .gLeadAppDetailsInsertUpdate(
        groupInboxData.SfosLead.LeadMain.Lead,
        this.deviceId
      )
      .then(
        (data) => {
          this.groupInsertLoanBasicDetails(
            groupInboxData.SfosLead.LeadMain.Lead,
            data.insertId,
            groupInboxData
          );
        },
        (err) => {
          console.log('Lead error', err);
          this.globFunc.globalLodingDismiss();
        }
      );
  }

  groupInsertLoanBasicDetails(Lead, refId, groupInboxData) {
    let everyarr = [];
    this.pdt_master.forEach((element) => {
      if (element.prdCode == Lead.prd_code) {
        everyarr.push(true);
        this.loanAmountFrom = element.prdamtFromRange;
        this.loanAmountFrom = parseInt(this.loanAmountFrom);
        this.loanAmountTo = element.prdamtToRange;
        this.loanAmountTo = parseInt(this.loanAmountTo);
        this.guaFlag = 'N'; //element.prdGuaFlag;
        this.sqlSupport
          .gLeadBasicDetails(
            refId,
            Lead,
            this.loanAmountFrom,
            this.loanAmountTo,
            this.guaFlag,
            'A',
            'VL',
            '',
            ''
          )
          .then((data) => {
            let sourcingvalue = {
              busiDesc: '1',
              sourChannel: '1',
              leadId: Lead.ApplicantDetails[0].leadId,
              typeCase: '1',
              balTrans: '1',
              branchName: Lead.BranchCode,
              branchState: '29',
              loginBranch: Lead.BranchCode,
              applDate: this.convertdate(),
              roName: Lead.LoginUserId,
              roCode: Lead.LoginUserId,
              applicType: Lead.ApplicantType,
            };

            let personalVal = {
              genTitle: Lead.ApplicantDetails[0].Title
                ? Lead.ApplicantDetails[0].Title
                : '', //value.genTitle,
              firstname: Lead.ApplicantDetails[0].FirstName
                ? Lead.ApplicantDetails[0].FirstName
                : '', //value.firstname,
              middlename: Lead.ApplicantDetails[0].MiddleName
                ? Lead.ApplicantDetails[0].MiddleName
                : '', //value.middlename,
              lastname: Lead.ApplicantDetails[0].lastName
                ? Lead.ApplicantDetails[0].lastName
                : '', //value.lastname,
              fathername: Lead.ApplicantDetails[0].FatherName
                ? Lead.ApplicantDetails[0].FatherName
                : '', //value.fathername,
              mothername: '',
              dob: Lead.ApplicantDetails[0].DOB
                ? Lead.ApplicantDetails[0].DOB
                : '', //value.dob,
              marital: Lead.ApplicantDetails[0].MaritalStatus
                ? Lead.ApplicantDetails[0].MaritalStatus
                : '',
              spouseName: Lead.ApplicantDetails[0].SpouseName
                ? Lead.ApplicantDetails[0].SpouseName
                : '',
              gender: Lead.ApplicantDetails[0].Gender
                ? Lead.ApplicantDetails[0].Gender
                : '',
              mobNum: Lead.ApplicantDetails[0].MobileNo
                ? Lead.ApplicantDetails[0].MobileNo
                : '',
              altMobNum: Lead.ApplicantDetails[0].AlternateMobno
                ? Lead.ApplicantDetails[0].AlternateMobno
                : '',
              panAvailable: '',
              panNum: Lead.ApplicantDetails[0].PANNo
                ? Lead.ApplicantDetails[0].PANNo
                : '',
              employment: Lead.ApplicantDetails[0].EmploymentStatus
                ? Lead.ApplicantDetails[0].EmploymentStatus
                : '',
              employerName: Lead.ApplicantDetails[0].PresentEmployerName
                ? Lead.ApplicantDetails[0].PresentEmployerName
                : '',
              employeeId: Lead.ApplicantDetails[0].EmployeeID
                ? Lead.ApplicantDetails[0].EmployeeID
                : '',
              designation: Lead.ApplicantDetails[0].Designation
                ? Lead.ApplicantDetails[0].Designation
                : '',
              joinDate: Lead.ApplicantDetails[0].JoiningDate
                ? Lead.ApplicantDetails[0].JoiningDate
                : '',
              lmName: Lead.ApplicantDetails[0].LineManagerName
                ? Lead.ApplicantDetails[0].LineManagerName
                : '',
              lmEmail: Lead.ApplicantDetails[0].LineManagerEmail
                ? Lead.ApplicantDetails[0].LineManagerEmail
                : '',
              experience: Lead.ApplicantDetails[0].TotalExperience
                ? Lead.ApplicantDetails[0].TotalExperience
                : '',
              bussName: '',
              actDetail: '',
              monthIncome: Lead.ApplicantDetails[0].MontlySalary
                ? Lead.ApplicantDetails[0].MontlySalary
                : '',
              vinOfServ: Lead.ApplicantDetails[0].VintageServiceBusiness
                ? Lead.ApplicantDetails[0].VintageServiceBusiness
                : '',
              caste: Lead.ApplicantDetails[0].Caste
                ? Lead.ApplicantDetails[0].Caste
                : '',
              religion: Lead.ApplicantDetails[0].Religion
                ? Lead.ApplicantDetails[0].Religion
                : '',
              languages: Lead.ApplicantDetails[0].Language
                ? Lead.ApplicantDetails[0].Language
                : '',
              education: Lead.ApplicantDetails[0].Qualification
                ? Lead.ApplicantDetails[0].Qualification
                : '',
              email: Lead.ApplicantDetails[0].emailId
                ? Lead.ApplicantDetails[0].emailId
                : '',
              coAppFlag: Lead.ApplicantDetails[0].Coapplicantrequired
                ? Lead.ApplicantDetails[0].Coapplicantrequired
                : '',
            };
            let perAddressVal = {
              perm_permAdrsKYC: '',
              perm_manualEntry: '',
              perm_plots: Lead.ApplicantDetails[0].CustomerAddressDetails[0]
                .Address1
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[0].Address1
                : '',
              perm_locality: Lead.ApplicantDetails[0].CustomerAddressDetails[0]
                .Address2
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[0].Address2
                : '',
              perm_states: Lead.ApplicantDetails[0].CustomerAddressDetails[0]
                .State
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[0].State
                : '',
              perm_cities: Lead.ApplicantDetails[0].CustomerAddressDetails[0]
                .city
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[0].city
                : '',
              perm_district: '',
              perm_pincode: Lead.ApplicantDetails[0].CustomerAddressDetails[0]
                .pincode
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[0].pincode
                : '',
              perm_countries: '',
              perm_landmark: Lead.ApplicantDetails[0].CustomerAddressDetails[0]
                .landmark
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[0].landmark
                : '',
              resType: '',
              perm_yrsCurCity: Lead.ApplicantDetails[0]
                .CustomerAddressDetails[0].YearIncurrentCity
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[0]
                    .YearIncurrentCity
                : '',
            };
            let preAddressVal = {
              pres_plots: Lead.ApplicantDetails[0].CustomerAddressDetails[1]
                .Address1
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[1].Address1
                : '',
              pres_locality: Lead.ApplicantDetails[0].CustomerAddressDetails[1]
                .Address2
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[1].Address2
                : '',
              pres_states: Lead.ApplicantDetails[0].CustomerAddressDetails[1]
                .State
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[1].State
                : '',
              pres_cities: Lead.ApplicantDetails[0].CustomerAddressDetails[1]
                .city
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[1].city
                : '',
              pres_district: '',
              pres_pincode: Lead.ApplicantDetails[0].CustomerAddressDetails[1]
                .pincode
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[1].pincode
                : '',
              pres_countries: '',
              pres_landmark: Lead.ApplicantDetails[0].CustomerAddressDetails[1]
                .landmark
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[1].landmark
                : '',
              pres_yrsCurCit: Lead.ApplicantDetails[0].CustomerAddressDetails[1]
                .YearIncurrentCity
                ? Lead.ApplicantDetails[0].CustomerAddressDetails[1]
                    .YearIncurrentCity
                : '',
            };

            let sanAmt;
            let sancValue = groupInboxData.SanctionAmount.toString().split('.');
            if (sancValue[1] <= '49') {
              sanAmt = Math.floor(groupInboxData.SanctionAmount);
            } else {
              sanAmt = Math.ceil(groupInboxData.SanctionAmount);
            }

            let postSanVal = {
              loanAmount: groupInboxData.SanctionAmount ? sanAmt : '',
              tenure: groupInboxData.tenor ? groupInboxData.tenor : '',
              dealerName: groupInboxData.DealerCode
                ? groupInboxData.DealerCode
                : '',
              brandName: groupInboxData.Brand ? groupInboxData.Brand : '',
              model: groupInboxData.Model ? groupInboxData.Model : '',
              variant: groupInboxData.Variant ? groupInboxData.Variant : '',
              marginCost:
                groupInboxData.SanctionAmount && groupInboxData.OnRoadPrice
                  ? groupInboxData.OnRoadPrice - sanAmt
                  : '',
              downpayment: groupInboxData.Downpayment
                ? groupInboxData.Downpayment
                : '',
              segment: groupInboxData.segmentType
                ? groupInboxData.segmentType
                : '',
              dbDate: groupInboxData.DBdate ? groupInboxData.DBdate : '',
              preEmiDB: groupInboxData.PreEmiDB ? groupInboxData.PreEmiDB : '',
              totalloanAmount: groupInboxData.TotalLoanAmt
                ? groupInboxData.TotalLoanAmt
                : '',
              cc: groupInboxData.CC ? groupInboxData.CC : '',
              rcNo: groupInboxData.UsedRcno ? groupInboxData.UsedRcno : '',
              engineNo: groupInboxData.UsedEngineno
                ? groupInboxData.UsedEngineno
                : '',
              chassisNo: groupInboxData.UsedChassisno
                ? groupInboxData.UsedChassisno
                : '',
              yearOfMan: groupInboxData.UsedYrsofmanufacture
                ? groupInboxData.UsedYrsofmanufacture
                : '',
              registrationDate: groupInboxData.UsedRegistrationdate
                ? groupInboxData.UsedRegistrationdate
                : '',
              vehicleAge: groupInboxData.UsedVehicleAge
                ? groupInboxData.UsedVehicleAge
                : '',
              hypothecation: groupInboxData.UsedHypothecationstatus
                ? groupInboxData.UsedHypothecationstatus
                : '',
              noofOwner: groupInboxData.UsedNumberofowner
                ? groupInboxData.UsedNumberofowner
                : '',
              kmDriven: groupInboxData.UsedKmdriven
                ? groupInboxData.UsedKmdriven
                : '',
              dealerQuotation: groupInboxData.UsedDealerquotation
                ? groupInboxData.UsedDealerquotation
                : '',
              obv: groupInboxData.UsedOBV ? groupInboxData.UsedOBV : '',
              assetPrice: groupInboxData.UsedFinalassetprice
                ? groupInboxData.UsedFinalassetprice
                : '',
              assetAge: groupInboxData.UsedAssetageatmaturity
                ? groupInboxData.UsedAssetageatmaturity
                : '',
              lsoFlag: groupInboxData.LSOFlag ? groupInboxData.LSOFlag : '',
            };

            this.guacibilCheckStat = 0;
            this.guasubmitStat = 1;
            // this.applicationNumber = 0;
            this.applicationStatus = 'Not';

            this.sqliteProvider.addSourcingDetails(
              refId,
              data.insertId,
              'A',
              sourcingvalue,
              ''
            );
            this.network.type == 'none' || this.network.type == 'unknown'
              ? (this.leadStatus = 'online')
              : (this.leadStatus = 'online');
            this.sqliteProvider
              .insertSubmitDetails(
                refId,
                data.insertId,
                this.guacibilCheckStat,
                this.guasubmitStat,
                this.applicationNumber,
                this.applicationStatus,
                'A',
                '0',
                '0'
              )
              .then((data) => {
                let statId;
                // this.sqliteProvider.getApplicantDataAfterSubmit(refId).then(data => {
                //   if (data.length > 0) {
                //     statId = data[0].statId;
                //     this.sqlSupport.updateEligibilityStatus('eligible', statId)
                //   }
                // }).catch(err => err);
              })
              .catch((err) => err);
            this.sqliteProvider.updateNewSubmitDetails(
              this.applicationNumber,
              Lead.CustomerDetails[0].SfosLeadId,
              Lead.CustomerDetails[0].LpLeadId,
              Lead.CustomerDetails[0].LpUrn,
              Lead.CustomerDetails[0].LpCustid,
              refId,
              data.insertId,
              'A'
            );

            //

            let eliAmt;
            let eliValue = groupInboxData.eligibleAmount.toString().split('.');
            if (eliValue[1] <= '49') {
              eliAmt = Math.floor(groupInboxData.eligibleAmount);
            } else {
              eliAmt = Math.ceil(groupInboxData.eligibleAmount);
            }

            let sanctionAmt;
            let sanValue = groupInboxData.SanctionAmount.toString().split('.');
            if (sanValue[1] <= '49') {
              sanctionAmt = Math.floor(groupInboxData.SanctionAmount);
            } else {
              sanctionAmt = Math.ceil(groupInboxData.SanctionAmount);
            }

            let emiAmt;
            let emiValue = groupInboxData.emi.toString().split('.');
            if (emiValue[1] <= '49') {
              emiAmt = Math.floor(groupInboxData.emi);
            } else {
              emiAmt = Math.ceil(groupInboxData.emi);
            }

            // this.sqlSupport.updateEligibleAmout(groupInboxData.eligibleAmount, groupInboxData.AppNo);
            // this.sqlSupport.updateSanctionedAmount(groupInboxData.SanctionAmount, groupInboxData.emi, groupInboxData.AppNo);
            this.sqlSupport.updateEligibleAmout(eliAmt, groupInboxData.AppNo);
            this.sqlSupport.updateSanctionedAmount(
              sanctionAmt,
              emiAmt,
              groupInboxData.AppNo
            );
            let value = {
              janaAcc: '',
              nomAvail: '',
              guaAvail: '',
              nomList: '',
            };
            this.sqlSupport.InsertCASADetails(
              refId,
              data.insertId,
              'A',
              value,
              ''
            );

            this.sqlSupport.updateFromGroupInbox(this.applicationNumber, 'Y');
            this.sqlSupport.updateCreditCheckStatus(
              this.applicationNumber,
              '1'
            );
            this.sqliteProvider.addPersonalDetails(
              refId,
              data.insertId,
              '',
              '1',
              personalVal,
              '',
              'A',
              Lead.ApplicantDetails[0].leadId,
              'a',
              '1',
              this.leadStatus,
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              ''
            );
            this.sqliteProvider.insertPermanentAddress(
              refId,
              data.insertId,
              false,
              perAddressVal,
              'A',
              ''
            );
            this.sqliteProvider.insertPresentAddress(
              refId,
              data.insertId,
              false,
              preAddressVal,
              'A',
              ''
            );
            this.sqlSupport.insertPosidex(refId, data.insertId, 'Y', 'A');
            this.sqlSupport.gaddVehicleDetails(
              refId,
              data.insertId,
              groupInboxData
            );

            this.sqlSupport.updateGroupCASADetails(
              groupInboxData.casaFlag,
              refId,
              data.insertId
            );

            this.sqlSupport.insertPostSanctionDetails(
              refId,
              data.insertId,
              postSanVal,
              groupInboxData.AppNo,
              '',
              'N',
              'N',
              'N',
              'N',
              ''
            );
            this.sqlSupport.updateGroupPostSanction(refId, data.insertId, 'Y');

            let d = new Date();
            let id;
            if (Lead.CoApplicantDetails.length > 0) {
              for (let i = 0; i < Lead.CoApplicantDetails.length; i++) {
                id = d.getTime();
                let copersonalVal = {
                  genTitle: Lead.CoApplicantDetails[i].CoappTitle
                    ? Lead.CoApplicantDetails[i].CoappTitle
                    : '', //value.genTitle,
                  firstname: Lead.CoApplicantDetails[i].CoappFirstName
                    ? Lead.CoApplicantDetails[i].CoappFirstName
                    : '', //value.firstname,
                  middlename: Lead.CoApplicantDetails[i].CoappMiddleName
                    ? Lead.CoApplicantDetails[i].CoappMiddleName
                    : '', //value.middlename,
                  lastname: Lead.CoApplicantDetails[i].CoapplastName
                    ? Lead.CoApplicantDetails[i].CoapplastName
                    : '', //value.lastname,
                  fathername: Lead.CoApplicantDetails[i].CoappFatherName
                    ? Lead.CoApplicantDetails[i].CoappFatherName
                    : '', //value.fathername,
                  mothername: '',
                  dob: Lead.CoApplicantDetails[i].CoappDOB
                    ? Lead.CoApplicantDetails[i].CoappDOB
                    : '', //value.dob,
                  marital: Lead.CoApplicantDetails[i].CoappMaritalStatus
                    ? Lead.CoApplicantDetails[i].CoappMaritalStatus
                    : '',
                  spouseName: Lead.CoApplicantDetails[i].CoappSpouseName
                    ? Lead.CoApplicantDetails[i].CoappSpouseName
                    : '',
                  gender: Lead.CoApplicantDetails[i].CoappGender
                    ? Lead.CoApplicantDetails[i].CoappGender
                    : '',
                  mobNum: Lead.CoApplicantDetails[i].CoappMobileNo
                    ? Lead.CoApplicantDetails[i].CoappMobileNo
                    : '',
                  altMobNum: Lead.CoApplicantDetails[i].CoappAlternateMobno
                    ? Lead.CoApplicantDetails[i].CoappAlternateMobno
                    : '',
                  panAvailable: '',
                  panNum: Lead.CoApplicantDetails[i].CoappPANNo
                    ? Lead.CoApplicantDetails[i].CoappPANNo
                    : '',
                  employment: Lead.CoApplicantDetails[i].CoappEmploymentStatus
                    ? Lead.CoApplicantDetails[i].CoappEmploymentStatus
                    : '',
                  employerName: Lead.CoApplicantDetails[i]
                    .CoappPresentEmployerName
                    ? Lead.CoApplicantDetails[i].CoappPresentEmployerName
                    : '',
                  employeeId: Lead.CoApplicantDetails[i].CoappEmployeeID
                    ? Lead.CoApplicantDetails[i].CoappEmployeeID
                    : '',
                  designation: Lead.CoApplicantDetails[i].CoappDesignation
                    ? Lead.CoApplicantDetails[i].CoappDesignation
                    : '',
                  joinDate: Lead.CoApplicantDetails[i].CoappJoiningDate
                    ? Lead.CoApplicantDetails[i].CoappJoiningDate
                    : '',
                  lmName: Lead.CoApplicantDetails[i].CoappLineManagerName
                    ? Lead.CoApplicantDetails[i].CoappLineManagerName
                    : '',
                  lmEmail: Lead.CoApplicantDetails[i].CoappLineManagerEmail
                    ? Lead.CoApplicantDetails[i].CoappLineManagerEmail
                    : '',
                  experience: Lead.CoApplicantDetails[i].CoappTotalExperience
                    ? Lead.CoApplicantDetails[i].CoappTotalExperience
                    : '',
                  bussName: '',
                  actDetail: '',
                  monthIncome: Lead.CoApplicantDetails[i].CoappMontlyIncome
                    ? Lead.CoApplicantDetails[i].CoappMontlyIncome
                    : '',
                  vinOfServ: Lead.CoApplicantDetails[i]
                    .CoappVintageServiceBusiness
                    ? Lead.CoApplicantDetails[i].CoappVintageServiceBusiness
                    : '',
                  caste: Lead.CoApplicantDetails[i].CoappCaste
                    ? Lead.CoApplicantDetails[i].CoappCaste
                    : '',
                  religion: Lead.CoApplicantDetails[i].CoappReligion
                    ? Lead.CoApplicantDetails[i].CoappReligion
                    : '',
                  languages: Lead.CoApplicantDetails[i].CoappLanguage
                    ? Lead.CoApplicantDetails[i].CoappLanguage
                    : '',
                  education: Lead.CoApplicantDetails[i].CoappQualification
                    ? Lead.CoApplicantDetails[i].CoappQualification
                    : '',
                  email: Lead.CoApplicantDetails[i].CoappemailId
                    ? Lead.CoApplicantDetails[i].CoappemailId
                    : '',
                  coAppFlag: '',
                };
                let coPerAddressVal = {
                  perm_permAdrsKYC: '',
                  perm_manualEntry: '',
                  perm_plots: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[0].Address1
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[0]
                        .Address1
                    : '',
                  perm_locality: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[0].Address2
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[0]
                        .Address2
                    : '',
                  perm_states: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[0].State
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[0].State
                    : '',
                  perm_cities: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[0].city
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[0].city
                    : '',
                  perm_district: '',
                  perm_pincode: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[0].pincode
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[0]
                        .pincode
                    : '',
                  perm_countries: '',
                  perm_landmark: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[0].landmark
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[0]
                        .landmark
                    : '',
                  resType: '',
                  perm_yrsCurCity: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[0].YearIncurrentCity
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[0]
                        .YearIncurrentCity
                    : '',
                };
                let copreAddressVal = {
                  pres_plots: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[1].Address1
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[1]
                        .Address1
                    : '',
                  pres_locality: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[1].Address2
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[1]
                        .Address2
                    : '',
                  pres_states: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[1].State
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[1].State
                    : '',
                  pres_cities: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[1].city
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[1].city
                    : '',
                  pres_district: '',
                  pres_pincode: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[1].pincode
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[1]
                        .pincode
                    : '',
                  pres_countries: '',
                  pres_landmark: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[1].landmark
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[1]
                        .landmark
                    : '',
                  pres_yrsCurCit: Lead.CoApplicantDetails[i]
                    .CustomerAddressDetails[1].YearIncurrentCity
                    ? Lead.CoApplicantDetails[i].CustomerAddressDetails[1]
                        .YearIncurrentCity
                    : '',
                };
                this.network.type == 'none' || this.network.type == 'unknown'
                  ? (this.leadStatus = 'online')
                  : (this.leadStatus = 'online');
                this.sqliteProvider.addPersonalDetails(
                  refId,
                  id,
                  '',
                  '1',
                  copersonalVal,
                  '',
                  'C',
                  Lead.ApplicantDetails[0].leadId,
                  'c',
                  '1',
                  this.leadStatus,
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  '',
                  ''
                );
                this.sqliteProvider.insertSubmitDetails(
                  refId,
                  id,
                  this.guacibilCheckStat,
                  this.guasubmitStat,
                  this.applicationNumber,
                  this.applicationStatus,
                  'C',
                  '0',
                  '0'
                );
                this.sqliteProvider.insertPermanentAddress(
                  refId,
                  id,
                  false,
                  coPerAddressVal,
                  'C',
                  ''
                );
                this.sqliteProvider.insertPresentAddress(
                  refId,
                  id,
                  false,
                  copreAddressVal,
                  'C',
                  ''
                );
                this.sqlSupport.insertPosidex(refId, id, 'Y', 'C');
                this.globFunc.globalLodingDismiss();
              }
              this.sqliteProvider.getCoappDetails(refId).then((data) => {
                if (data.length > 0) {
                  let coApplicants = data;
                  if (Lead.CustomerDetails.length > 1) {
                    for (let i = 1; i < Lead.CustomerDetails.length; i++) {
                      this.sqliteProvider.updateNewSubmitDetails(
                        this.applicationNumber,
                        Lead.CustomerDetails[i].SfosLeadId,
                        Lead.CustomerDetails[i].LpLeadId,
                        Lead.CustomerDetails[i].LpUrn,
                        Lead.CustomerDetails[i].LpCustid,
                        refId,
                        coApplicants[i - 1].id,
                        'C'
                      );
                    }
                  }
                }
              });
            }
            this.globFunc.globalLodingDismiss();
            if (
              groupInboxData.flowPointDesc.toLowerCase() ==
                'Sourcing Data entry'.toLowerCase() &&
              groupInboxData.CreditReviewFlag == 'Y'
            ) {
              this.sqlSupport
                .updateFromGroupInbox(groupInboxData.AppNo, 'Y')
                .then((data) => {
                  this.router.navigate(['/ExistApplicationsPage'], {
                    queryParams: { fromGroupInbox: 'Y' },
                    skipLocationChange: true,
                    replaceUrl: true,
                  });
                });
            } else if (
              groupInboxData.flowPointDesc.toLowerCase() ==
              'Field Investigation'.toLowerCase()
            ) {
              this.sqlSupport
                .updateFromGroupInbox(groupInboxData.AppNo, 'Y')
                .then((data) => {
                  this.sqlSupport
                    .updateCreditCheckStatus(groupInboxData.AppNo, '1')
                    .then((data) => {
                      this.sqlSupport
                        .updateFieldInvestigationStatus(
                          groupInboxData.AppNo,
                          'Y'
                        )
                        .then((data) => {
                          this.sqliteProvider
                            .updateFIstatus(groupInboxData.AppNo, 'N')
                            .then((data) => {
                              this.router.navigate(['/ExistApplicationsPage'], {
                                queryParams: { fromGroupInbox: 'Y' },
                                skipLocationChange: true,
                                replaceUrl: true,
                              });
                            });
                        });
                    });
                });
            } else if (
              groupInboxData.flowPointDesc.toLowerCase() ==
              'Post sanction Activities'.toLowerCase()
            ) {
              this.sqlSupport
                .updateFromGroupInbox(groupInboxData.AppNo, 'Y')
                .then((data) => {
                  this.sqlSupport
                    .updateFieldInvestigationStatus(groupInboxData.AppNo, 'Y')
                    .then((data) => {
                      this.sqlSupport
                        .updateForPostSanction(groupInboxData.AppNo, '1', 'N')
                        .then((data) => {
                          this.router.navigate(['/ExistApplicationsPage'], {
                            queryParams: { fromGroupInbox: 'Y' },
                            skipLocationChange: true,
                            replaceUrl: true,
                          });
                        });
                    });
                });
            } else if (
              groupInboxData.flowPointDesc.toLowerCase() ==
              'Post DB Document Upload'.toLowerCase()
            ) {
              this.sqlSupport
                .updateFromGroupInbox(groupInboxData.AppNo, 'Y')
                .then((data) => {
                  this.sqlSupport
                    .updateFieldInvestigationStatus(groupInboxData.AppNo, 'Y')
                    .then((data) => {
                      this.sqlSupport
                        .updateForPostSanction(groupInboxData.AppNo, '1', 'N')
                        .then((data) => {
                          this.sqlSupport
                            .updateForPddDoc(groupInboxData.AppNo, 'Y')
                            .then((data) => {
                              this.router.navigate(['/ExistApplicationsPage'], {
                                queryParams: { fromGroupInbox: 'Y' },
                                skipLocationChange: true,
                                replaceUrl: true,
                              });
                            });
                        });
                    });
                });
            }
            // this.globalFunction.globalLodingDismiss();
            // this.navCtrl.push(ExistApplicationsPage, { fromGroupInbox: 'Y' });
            // this.sqliteProvider.addPromotersProofDetails(refId, data.insertId, value, this.proofName, "");
          });
      } else {
        everyarr.push(false);
      }
    });
    if (everyarr.every((val) => val == false)) {
      this.globFunc.globalLodingDismiss();
      this.alertService.showAlert('Alert', 'Product code is not found');
    }
  }

  getProductValue() {
    this.sqliteProvider.getAllProductValues().then((data) => {
      console.log(data, 'Lead get product');
      let vlLoan = data.filter((val) => val.prdDesc == 'Self Construction');
      this.pdt_master = [];
      this.pdt_master = data; //vlLoan;
    });
  }

  convertdate() {
    let dateNew = new Date();
    var date = new Date(dateNew),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('-');
  }

  /*  
    proceedApplication(data) {
      console.log(data, 'received proposal');
      if (this.network.type == 'none' || this.network.type == "unknown") {
        this.globalFunction.globalAlert('Alert', 'Please enable Internet connection');
      } else {
        this.globalFunction.globalLodingPresent('Please wait...')
        let request = {
          "UserID": "VLCRES1",
          "proposalNo": "298272378482"
        }
        this.master.restApiCall('receiveProposal', request).then(res => {
          console.log(res, 'received proposal response');
        }).catch(err => err);
      }
    }
  }
   */

  serachClick() {
    if (this.showSearch) {
      this.showSearch = false;
    } else {
      this.showSearch = true;
    }
  }

  filterItems(event: any) {
    let searchTerm = event.target.value;
    this.groupInboxList = this.itemslist;
    if (searchTerm && searchTerm !== '') {
      this.groupInboxList = this.groupInboxList.filter((item) => {
        return (
          (item.AppNo &&
            item.AppNo.toString()
              .toLowerCase()
              .indexOf(searchTerm.toLowerCase()) > -1) ||
          (item.SfosLead.LeadMain.Lead.ApplicantDetails[0].FirstName &&
            item.SfosLead.LeadMain.Lead.ApplicantDetails[0].FirstName.toLowerCase().indexOf(
              searchTerm.toLowerCase()
            ) > -1) ||
          (item.flowPointDesc &&
            item.flowPointDesc.toLowerCase().indexOf(searchTerm.toLowerCase()) >
              -1)
        );
      });
    }
  }

  onChange(event): void {
    console.log(event);
    this.currentPage = event;
  }
}
