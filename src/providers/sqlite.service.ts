import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { SQLitePorter } from '@awesome-cordova-plugins/sqlite-porter/ngx';
import { BehaviorSubject, map } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import * as moment from 'moment';
import { DataPassingProviderService } from './data-passing-provider.service';
import { GlobalService } from './global.service';
import { CustomAlertControlService } from './custom-alert-control.service';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  database: SQLiteObject;
  databaseReady: BehaviorSubject<boolean>;
  name: string;
  db_name: string = 'jfs.db';
  dateTime = new Date();

  constructor(
    public httpAngular: HttpClient,
    public platform: Platform,
    public sqlite: SQLite,
    public sqlitePorter: SQLitePorter,
    public globalData: DataPassingProviderService,
    public device: Device,
    private globFunc: GlobalService, // ,public base64: Base64,
    public alertService: CustomAlertControlService,
  ) {
    this.databaseReady = new BehaviorSubject(false);
    this.platform.ready().then(() => {
      this.sqlite
        .create({
          name: this.db_name,
          location: 'default',
        })
        .then((db: SQLiteObject) => {
          console.log(db);
          this.database = db;
          this.globalData.setGlobalSQLiteObj(this.database);
          this.loadInit();
          this.databaseReady.next(true);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  getDatabaseState() {
    return this.databaseReady.asObservable();
  }

  vehicleBrand: any;
  loadInit() {
    this.httpAngular
      .get('assets/sql/query.sql', { responseType: 'text' })
      .subscribe((sql) => {
        this.sqlitePorter
          .importSqlToDb(this.database, sql)
          .then((data) => {
            console.log('loadinit triggred');
            this.alterQuery();
          })
          .catch((e) => console.log(e));
      });

    this.httpAngular
      .get('assets/brand.json')
      .pipe(
        map((data: any) => {
          return data.map((val: any) => {
            val.created_on = val.created_on.substring(
              6,
              val.created_on.length - 2,
            );
            val.created_on = new Date(+val.created_on).getFullYear();
            return val;
          });
        }),
      )
      .subscribe((brand: any) => {
        console.log(brand, 'modified data from json');
        this.vehicleBrand = brand;
      });
  }

  getVehicleBrand() {
    return this.vehicleBrand;
  }

  getAll(result) {
    var output = [];
    for (var i = 0; i < result.rows.length; i++) {
      output.push(result.rows.item(i));
    }
    return output;
  }

  rootDetails(data) {
    return this.database
      .executeSql(
        'INSERT INTO ORIG_APP_DETAILS(createdDate, deviceId, createdUser, appUniqueId) VALUES (?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('root err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'rootDetails',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  addBasicDetails(
    refId,
    value,
    loanAmountFrom,
    loanAmountTo,
    guaFlag,
    userType,
    productType,
    profPic,
    lmsLeadId,
    signPic,
  ) {
    let processingFee = Math.round(value.processingFee);
    let data = [
      refId,
      value.prdSche,
      value.janaLoan,
      value.loanAmount,
      value.tenure,
      value.interest,
      parseFloat(value.intRate).toFixed(2),
      value.purpose,
      value.installment,
      value.refinance,
      value.holiday,
      value.repayMode,
      value.pmay || '',
      value.advavceInst,
      value.vehicleType,
      value.electricVehicle,
      value.margin,
      processingFee,
      value.segmentType,
      value.stampDuty,
      value.nachCharges,
      value.pddCharges,
      value.otherCharges,
      value.borHealthIns,
      value.coBorHealthIns,
      value.insPremium,
      '0',
      value.advanceEmi,
      value.gstonPf,
      value.gstonSdc,
      value.gstonNach,
      value.gstonPddCharges,
      value.gstonOtherCharges,
      value.emi,
      value.emiMode,
      value.downpayment,
      value.totalDownPay,
      value.dbAmount,
      value.dealerName,
      value.dealerCode || '',
      loanAmountFrom,
      loanAmountTo,
      guaFlag,
      userType,
      productType,
      profPic,
      lmsLeadId,
      value.janaRefId,
      value.vaultStatus,
      signPic,
    ];
    return this.database
      .executeSql(
        'INSERT INTO ORIG_BASIC_DETAILS(refId, prdSche, janaLoan, loanAmount, tenure, interest, intRate, purpose, installment, refinance, holiday, repayMode, pmay, advavceInst, vehicleType, electricVehicle, margin, processingFee, segmentType, stampDuty, nachCharges, pddCharges, otherCharges, borHealthIns, coBorHealthIns, insPremium, preEmi, advanceEmi, gstonPf, gstonSdc, gstonNach, gstonPddCharges, gstonOtherCharges, emi, emiMode, downpayment,totalDownPay, dbAmount, dealerName, dealerCode, loanAmountFrom, loanAmountTo, guaFlag, userType, productType, profPic, lmsLeadId,janaRefId, vaultStatus, signPic) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'addBasicDetails',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  updateBasicDetails(
    refId,
    value,
    loanAmountFrom,
    loanAmountTo,
    guaFlag,
    userType,
    productType,
    profPic,
    lmsLeadId,
    signPic,
    id,
  ) {
    let processingFee = Math.round(value.processingFee);
    let data = [
      refId,
      value.prdSche,
      value.janaLoan,
      value.loanAmount,
      value.tenure,
      value.interest,
      parseFloat(value.intRate).toFixed(2),
      value.purpose,
      value.installment,
      value.refinance,
      value.holiday,
      value.repayMode,
      value.pmay || '',
      value.advavceInst,
      value.vehicleType,
      value.electricVehicle,
      value.margin,
      processingFee,
      value.segmentType,
      value.stampDuty,
      value.nachCharges,
      value.pddCharges,
      value.otherCharges,
      value.borHealthIns,
      value.coBorHealthIns,
      value.insPremium,
      '0',
      value.advanceEmi,
      value.gstonPf,
      value.gstonSdc,
      value.gstonNach,
      value.gstonPddCharges,
      value.gstonOtherCharges,
      value.emi,
      value.emiMode,
      value.downpayment,
      value.totalDownPay,
      value.dbAmount,
      value.dealerName,
      value.dealerCode || '',
      loanAmountFrom,
      loanAmountTo,
      guaFlag,
      userType,
      productType,
      profPic,
      lmsLeadId,
      signPic,
      id,
    ];
    return this.database
      .executeSql(
        'UPDATE ORIG_BASIC_DETAILS SET refId=?, prdSche=?, janaLoan=?, loanAmount=?, tenure=?, interest=?, intRate=?, purpose=?, installment=?, refinance=?, holiday=?, repayMode=?, pmay=?, advavceInst=?, vehicleType=?, electricVehicle=?, margin=?, processingFee=?, segmentType=?, stampDuty=?, nachCharges=?, pddCharges=?, otherCharges=?, borHealthIns=?, coBorHealthIns=?, insPremium=?, preEmi=?, advanceEmi=?, gstonPf=?, gstonSdc=?, gstonNach=?, gstonPddCharges=?, gstonOtherCharges=?, emi=?, emiMode=?, downpayment=?,totalDownPay=?, dbAmount=?, dealerName=?, dealerCode=?, loanAmountFrom=?, loanAmountTo=?, guaFlag=?, userType=?, productType=?, profPic=?, lmsLeadId=?, signPic=? WHERE id=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateBasicDetails',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  updateBasicDetailsinPostSanction(loanAmount, refId, id) {
    let data = [loanAmount, refId, id];
    return this.database
      .executeSql(
        'UPDATE ORIG_BASIC_DETAILS SET loanAmount=? WHERE refId=? and id=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateBasicDetailsinPostSanction',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  updateAdvanceEmiInPostSanction(advanceEmi, refId, id) {
    let data = [advanceEmi, refId, id];
    return this.database
      .executeSql(
        'UPDATE ORIG_BASIC_DETAILS SET advanceEmi=? WHERE refId=? and id=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateBasicDetailsinPostSanction',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  updateBasicDetailsForCoApp(id) {
    let data = ['Y', id];
    return this.database
      .executeSql('UPDATE ORIG_BASIC_DETAILS SET coAppFlag=? WHERE id=?', data)
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateBasicDetailsForCoApp',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  updateCoAppFlag(refId, id) {
    let data = ['Y', refId, id];
    return this.database
      .executeSql(
        'UPDATE ORIG_BASIC_DETAILS SET coAppFlag=? WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateCoAppFlag',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  updateGuaFlag(refId, id) {
    let data = ['Y', refId, id];
    return this.database
      .executeSql(
        'UPDATE ORIG_BASIC_DETAILS SET guaFlag=? WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateGuaFlag',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getBasicDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_BASIC_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getBasicDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  insertFieldInspectionDetails(
    refId,
    id,
    value,
    fieldId,
    backgroundImg,
    fieldInsFlag,
  ) {
    if (fieldId === '' || fieldId === undefined || fieldId === null) {
      let data = [
        refId,
        id,
        value.fieldLocation,
        value.inspectedDate,
        value.appNo,
        value.personMet,
        value.customerRelationship,
        value.customerName,
        value.customerMobileNum,
        value.customerAddress,
        value.neighbour1Check,
        value.neighbour2Check,
        value.residenceStabilityCheck,
        value.houseOwnerShip,
        value.agencyFeedback,
        value.additionalRemarks,
        value.latitude,
        value.longitude,
        value.neighbourName1,
        value.neighbourName2,
        backgroundImg,
        fieldInsFlag,
      ];
      return this.database
        .executeSql(
          'INSERT INTO FIELDINSPECTION(refId, id, fieldLocation,inspectedDate,appNo,personMet,customerRelationship,customerName,customerMobileNum,customerAddress,neighbour1Check,neighbour2Check,residenceStabilityCheck,houseOwnerShip,agencyFeedback,additionalRemarks,latitude,longitude,neighbourName1,neighbourName2,backgroundImg,fieldInsFlag) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertFieldInspectionDetails',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let data = [
        refId,
        id,
        value.fieldLocation,
        value.inspectedDate,
        value.appNo,
        value.personMet,
        value.customerRelationship,
        value.customerName,
        value.customerMobileNum,
        value.customerAddress,
        value.neighbour1Check,
        value.neighbour2Check,
        value.residenceStabilityCheck,
        value.houseOwnerShip,
        value.agencyFeedback,
        value.additionalRemarks,
        value.latitude,
        value.longitude,
        value.neighbourName1,
        value.neighbourName2,
        backgroundImg,
        fieldInsFlag,
        fieldId,
      ];
      return this.database
        .executeSql(
          'UPDATE FIELDINSPECTION SET refId=?,id=?,fieldLocation=?,inspectedDate=?,appNo=?,personMet=?,customerRelationship=?,customerName=?,customerMobileNum=?,customerAddress=?,neighbour1Check=?,neighbour2Check=?,residenceStabilityCheck=?,houseOwnerShip=?,agencyFeedback=?,additionalRemarks=?,latitude=?,longitude=?,neighbourName1=?,neighbourName2=?,backgroundImg=?, fieldInsFlag=? WHERE fieldId=?',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertFieldInspectionDetails',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }

  getFieldInspectionDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql('SELECT * FROM FIELDINSPECTION WHERE refId=? AND id=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getFieldInspectionDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getVehicleValuationDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM VEHICLEVALUATIONS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getVehicleValuationDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  insertVehicleValuationDetails(
    refId,
    id,
    value,
    vId,
    obcCheck,
    inspectionVideo,
  ) {
    if (vId === '' || vId === undefined || vId === null) {
      let data = [
        refId,
        id,
        value.make,
        value.model,
        value.vechicleAge,
        value.kmDriven,
        value.obvValue,
        value.valuationAmount,
        value.sanctionAmount,
        obcCheck,
        inspectionVideo,
      ];
      return this.database
        .executeSql(
          'INSERT INTO VEHICLEVALUATIONS(refId, id, make,model,vechicleAge,kmDriven,obvValue,valuationAmount,sanctionAmount,obvCheck,inspectionVideo) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertVehicleValuationDetails',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let data = [
        refId,
        id,
        value.make,
        value.model,
        value.vechicleAge,
        value.kmDriven,
        value.obvValue,
        value.valuationAmount,
        value.sanctionAmount,
        obcCheck,
        inspectionVideo,
      ];
      return this.database
        .executeSql(
          'UPDATE VEHICLEVALUATIONS SET refId=?,id=?,make=?,model=?,vechicleAge=?,kmDriven=?,obvValue=?,valuationAmount=?,sanctionAmount=?,obvCheck=?,inspectionVideo=? WHERE vId=?',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertVehicleValuationDetails',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }

  addPersonalDetails(
    refId,
    id,
    URNnumber,
    customerType,
    value,
    profPic,
    userType,
    coAppGuaId,
    applType,
    promocustType,
    leadStatus,
    disableFirstName,
    disableLastName,
    disableFatherName,
    dobDisable,
    disableGender,
    isNameAsPerEkyc,
    ShowAadharDob,
    disablePan,
    panName,
    panValidation,
    nameValidation,
    DOBValidation,
    seedingStatus,
  ) {
    let data = [
      refId,
      id,
      URNnumber,
      customerType,
      value.genTitle,
      value.firstname,
      value.middlename,
      value.lastname,
      value.fathername,
      value.mothername,
      value.dobAadhar,
      value.dobDocument,
      value.dob,
      value.marital,
      value.spouseName,
      value.gender,
      this.globFunc.basicEnc(value.mobNum),
      this.globFunc.basicEnc(value.altMobNum),
      value.panAvailable,
      this.globFunc.basicEnc(value.panNum),
      this.globFunc.basicEnc(value.form60),
      value.employment,
      value.employerName,
      value.employeeId,
      value.designation,
      value.joinDate,
      value.lmName,
      this.globFunc.basicEnc(value.lmEmail),
      value.experience,
      value.monthSalary,
      value.bussName,
      value.actDetail,
      value.monthIncome,
      value.vinOfServ,
      value.annualIncome,
      value.caste,
      value.religion,
      value.languages,
      value.resciStatus,
      value.education,
      this.globFunc.basicEnc(value.email),
      profPic,
      userType,
      coAppGuaId,
      applType,
      promocustType,
      leadStatus,
      value.coAppFlag,
      disableFirstName,
      disableLastName,
      disableFatherName,
      dobDisable,
      disableGender,
      isNameAsPerEkyc,
      value.nameEkyc,
      ShowAadharDob,
      disablePan,
      panName,
      panValidation,
      nameValidation,
      DOBValidation,
      seedingStatus,
      value.upiNo,
      value.nameupi,
      value.vap,
    ];
    return this.database
      .executeSql(
        'INSERT INTO ORIG_PERSONAL_DETAILS(refId, id, URNnumber, customerType, genTitle, firstname, middlename, lastname, fathername, mothername, dobAadhar, dobDocument, dob, marital,spouseName, gender, mobNum, altMobNum, panAvailable, panNum, form60, employment, employerName, employeeId, designation, joinDate, lmName, lmEmail, experience, monthSalary, bussName,actDetail,monthIncome,vinOfServ, annualIncome, caste, religion, languages, resciStatus, education, email, profPic, userType, coAppGuaId, applType, promocustType, leadStatus,coAppFlag,disableFirstName,disableLastName,disableFatherName,dobDisable,disableGender,isNameAsPerEkyc,nameAsPerEkyc,ShowAadharDob,disablePan,panName,panValidation,nameValidation,DOBValidation,seedingStatus,upiNo,nameupi,vap) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'addPersonalDetails',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  updatePesonalDetails(
    refId,
    id,
    URNnumber,
    customerType,
    value,
    profPic,
    perId,
  ) {
    let data = [
      refId,
      id,
      URNnumber,
      customerType,
      value.genTitle,
      value.firstname,
      value.middlename,
      value.lastname,
      value.fathername,
      value.mothername,
      value.dobAadhar,
      value.dobDocument,
      value.dob,
      value.marital,
      value.spouseName,
      value.gender,
      this.globFunc.basicEnc(value.mobNum),
      this.globFunc.basicEnc(value.altMobNum),
      value.panAvailable,
      this.globFunc.basicEnc(value.panNum),
      this.globFunc.basicEnc(value.form60),
      value.employment,
      value.employerName,
      value.employeeId,
      value.designation,
      value.joinDate,
      value.lmName,
      this.globFunc.basicEnc(value.lmEmail),
      value.experience,
      value.monthSalary,
      value.bussName,
      value.actDetail,
      value.monthIncome,
      value.vinOfServ,
      value.annualIncome,
      value.caste,
      value.religion,
      value.languages,
      value.resciStatus,
      value.education,
      this.globFunc.basicEnc(value.email),
      profPic,
      value.coAppFlag,
      value.upiNo,
      value.nameupi,
      value.vap,
      perId,
    ];
    return this.database
      .executeSql(
        'UPDATE ORIG_PERSONAL_DETAILS SET refId=?, id=?, URNnumber=?, customerType=?, genTitle=?, firstname=?, middlename=?, lastname=?, fathername=?, mothername=?, dobAadhar=?, dobDocument=?, dob=?, marital=?,spouseName=?, gender=?, mobNum=?,altMobNum=?, panAvailable=?, panNum=?, form60=?, employment=?, employerName=?,employeeId=?,designation=?,joinDate=?,lmName=?,lmEmail=?, experience=?, monthSalary=?, bussName=?, actDetail=?, monthIncome=?, vinOfServ=?, annualIncome=?, caste=?, religion=?, languages=?, resciStatus=?, education=?, email=?, profPic=?, coAppFlag=?,upiNo=?,nameupi=?,vap=? WHERE perId=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updatePesonalDetails',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getPersonalDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PERSONAL_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPersonalDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getPersonalDetailsForPanValue(refId, userType) {
    let data = [refId, userType];
    return this.database
      .executeSql(
        'SELECT panAvailable FROM ORIG_PERSONAL_DETAILS WHERE refId=? AND userType=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPersonalDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getAgePersonalDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT dob FROM ORIG_PERSONAL_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getAgePersonalDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getPromoterURN(refId, borrower) {
    let data = [refId, borrower];
    return this.database
      .executeSql(
        'SELECT URNnumber FROM ORIG_PERSONAL_DETAILS WHERE refId=? AND userType=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPromoterURN',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  addSourcingDetails(refId, id, userType, value, sourceid) {
    if (sourceid === '' || sourceid === undefined || sourceid === null) {
      let data = [
        refId,
        id,
        userType,
        value.janaEmployee,
        value.applicType,
        value.busiDesc,
        value.sourChannel,
        value.sourIdName,
        value.sourIdName1,
        value.leadId,
        value.typeCase,
        value.balTrans,
        value.branchName,
        value.branchState,
        value.loginBranch,
        value.applDate,
        value.roName,
        value.roCode,
      ];
      return this.database
        .executeSql(
          'INSERT INTO ORIG_SOURCING_DETAILS(refId, id, userType, janaEmployee, applicType, busiDesc, sourChannel, sourIdName, sourIdName1, leadId, typeCase, balTrans, branchName, branchState, loginBranch, applDate, roName, roCode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Sourcing Details Added Successfully',
            );
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addSourcingDetails',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let data = [
        refId,
        id,
        value.janaEmployee,
        value.applicType,
        value.busiDesc,
        value.sourChannel,
        value.sourIdName,
        value.sourIdName1,
        value.leadId,
        value.typeCase,
        value.balTrans,
        value.branchName,
        value.branchState,
        value.loginBranch,
        value.applDate,
        value.roName,
        value.roCode,
        sourceid,
      ];
      return this.database
        .executeSql(
          'UPDATE ORIG_SOURCING_DETAILS SET refId=?, id=?, janaEmployee=?, applicType=?, busiDesc=?, sourChannel=?, sourIdName=?, sourIdName1=?, leadId=?, typeCase=?, balTrans=?, branchName=?, branchState=?, loginBranch=?, applDate=?, roName=?, roCode=? WHERE sourceid=?',
          data,
        )
        .then(
          (data) => {
            this.globalData.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Sourcing Details Updated Successfully',
            );
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addSourcingDetails',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }
  getSourcingDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_SOURCING_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSourcingDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getPSLDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql('SELECT * FROM PSL_BUSINESS WHERE refId=? AND id=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'GetPSL',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  addPSLDetails(refId, id, value, pslId) {
    if (pslId === '' || pslId === undefined || pslId === null) {
      let data = [
        refId,
        id,
        value.psl,
        value.loanPurpose,
        value.agriProofType,
        value.landHolding,
        value.farmerType,
        value.actType,
        value.agriPurpose,
        value.udyamCNo,
        value.udyamRegNo,
        value.udyamClass,
        value.majorAct,
        value.udyamInvest,
        value.udyamTurnOver,
        value.servUnit,
      ];
      return this.database
        .executeSql(
          'INSERT INTO PSL_BUSINESS(refId,id,psl, loanPurpose, agriProofType, landHolding, farmerType, actType, agriPurpose, udyamCNo, udyamRegNo, udyamClass, majorAct, udyamInvest, udyamTurnOver, servUnit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addPSLDetails',
              'Insert Sucess',
              JSON.stringify(data),
            );
            this.globFunc.globalLodingDismiss();
            // this.alertService.showAlert("Alert!", "PSL_BUSINESS Details Added Successfully");
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addPSLDetails',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let data = [
        refId,
        id,
        value.psl,
        value.loanPurpose,
        value.agriProofType,
        value.landHolding,
        value.farmerType,
        value.actType,
        value.agriPurpose,
        value.udyamCNo,
        value.udyamRegNo,
        value.udyamClass,
        value.majorAct,
        value.udyamInvest,
        value.udyamTurnOver,
        value.servUnit,
        pslId,
      ];
      return this.database
        .executeSql(
          'UPDATE PSL_BUSINESS SET refId=?, id=?, psl=?, loanPurpose=?, agriProofType=?, landHolding=?, farmerType=?, actType=?, agriPurpose=?, udyamCNo=?, udyamRegNo=?, udyamClass=?, majorAct=?, udyamInvest=?, udyamTurnOver=?, servUnit=? WHERE pslId=?',
          data,
        )
        .then(
          (data) => {
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addPSLDetails',
              'Insert Sucess',
              JSON.stringify(data),
            );
            this.globFunc.globalLodingDismiss();
            // this.alertService.showAlert("Alert!", "PSL_BUSINESS Details Updated Successfully");
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addPSLDetails',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }
  insertPermanentAddress(refId, id, appSameCheck, value, userType, PERMID) {
    if (PERMID === '' || PERMID === undefined || PERMID === null) {
      let data = [
        refId,
        id,
        appSameCheck,
        value.perm_permAdrsKYC,
        value.perm_manualEntry,
        this.globFunc.basicEnc(value.perm_plots),
        this.globFunc.basicEnc(value.perm_locality),
        this.globFunc.basicEnc(value.perm_line3),
        this.globFunc.basicEnc(value.perm_states),
        this.globFunc.basicEnc(value.perm_cities),
        this.globFunc.basicEnc(value.perm_district),
        this.globFunc.basicEnc(value.perm_pincode),
        value.perm_countries,
        value.perm_landmark,
        value.resType || '',
        value.perm_yrsCurCity,
        userType,
      ];
      return this.database
        .executeSql(
          'INSERT INTO ORIG_PERMANENT_ADDRESS_DETAILS(refId, id, appSameCheck, perm_permAdrsKYC, perm_manualEntry, perm_plots, perm_locality,perm_line3, perm_states, perm_cities,perm_district, perm_pincode, perm_countries, perm_landmark,resType, perm_yrsCurCity, userType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertPermanentAddress',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let data = [
        refId,
        id,
        appSameCheck,
        value.perm_permAdrsKYC,
        value.perm_manualEntry,
        this.globFunc.basicEnc(value.perm_plots),
        this.globFunc.basicEnc(value.perm_locality),
        this.globFunc.basicEnc(value.perm_line3),
        this.globFunc.basicEnc(value.perm_states),
        this.globFunc.basicEnc(value.perm_cities),
        this.globFunc.basicEnc(value.perm_district),
        this.globFunc.basicEnc(value.perm_pincode),
        value.perm_countries,
        value.perm_landmark,
        value.resType || '',
        value.perm_yrsCurCity,
        userType,
        PERMID,
      ];
      return this.database
        .executeSql(
          'UPDATE ORIG_PERMANENT_ADDRESS_DETAILS SET refId=?, id=?, appSameCheck=?, perm_permAdrsKYC=?, perm_manualEntry=?, perm_plots=?, perm_locality=?,perm_line3=?, perm_states=?, perm_cities=?,perm_district=?, perm_pincode=?, perm_countries=?, perm_landmark=?,resType=?, perm_yrsCurCity=?, userType=? WHERE PERMID=?',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertPermanentAddress',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }
  getPermanentAddress(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PERMANENT_ADDRESS_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPermanentAddress',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  insertPresentAddress(refId, id, permSameCheck, value, userType, PRESID) {
    if (PRESID === '' || PRESID === undefined || PRESID === null) {
      let data = [
        refId,
        id,
        permSameCheck,
        this.globFunc.basicEnc(value.pres_plots),
        this.globFunc.basicEnc(value.pres_locality),
        this.globFunc.basicEnc(value.pres_line3),
        this.globFunc.basicEnc(value.pres_states),
        this.globFunc.basicEnc(value.pres_cities),
        this.globFunc.basicEnc(value.pres_district),
        this.globFunc.basicEnc(value.pres_pincode),
        value.pres_countries,
        value.pres_landmark,
        value.pres_resType || '',
        value.pres_yrsCurCity,
        value.pres_presmAdrsKYC,
        value.pres_manualEntry,
        userType,
      ];
      return this.database
        .executeSql(
          'INSERT INTO ORIG_PRESENT_ADDRESS_DETAILS(refId, id, permSameCheck, pres_plots, pres_locality,pres_line3 ,pres_states, pres_cities,pres_district, pres_pincode, pres_countries, pres_landmark, pres_resType, pres_yrsCurCity,pres_presmAdrsKYC,pres_manualEntry, userType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertPresentAddress',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let data = [
        refId,
        id,
        permSameCheck,
        this.globFunc.basicEnc(value.pres_plots),
        this.globFunc.basicEnc(value.pres_locality),
        this.globFunc.basicEnc(value.pres_line3),
        this.globFunc.basicEnc(value.pres_states),
        this.globFunc.basicEnc(value.pres_cities),
        this.globFunc.basicEnc(value.pres_district),
        this.globFunc.basicEnc(value.pres_pincode),
        value.pres_countries,
        value.pres_landmark,
        value.pres_resType || '',
        value.pres_yrsCurCity,
        value.pres_presmAdrsKYC,
        value.pres_manualEntry,
        userType,
        PRESID,
      ];
      return this.database
        .executeSql(
          'UPDATE ORIG_PRESENT_ADDRESS_DETAILS SET refId=?, id=?, permSameCheck=?, pres_plots=?, pres_locality=?, pres_line3=?,pres_states=?, pres_cities=?,pres_district=?, pres_pincode=?, pres_countries=?, pres_landmark=?, pres_resType=?, pres_yrsCurCity=?,pres_presmAdrsKYC=?,pres_manualEntry=?, userType=? WHERE PRESID=?',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertPresentAddress',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }
  getPresentAddress(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PRESENT_ADDRESS_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPresentAddress',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getBusinessAddress(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_BUSINESS_ADDRESS_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'ORIG_BUSINESS_ADDRESS_DETAILS',
            'Retrieve Success',
            JSON.stringify(data),
          );
          return this.getAll(data);
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'ORIG_BUSINESS_ADDRESS_DETAILS',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', JSON.stringify(err));
          return [];
        },
      );
  }
  insertBusinessAddress(refId, id, permSameCheck, value, userType, BUSID) {
    if (BUSID === '' || BUSID === undefined || BUSID === null) {
      let data = [
        refId,
        id,
        permSameCheck,
        value.busi_AdrsKYC || '',
        value.busi_manualEntry || '',
        value.busi_plots,
        value.busi_locality,
        value.busi_line3,
        JSON.stringify(value.busi_states),
        JSON.stringify(value.busi_cities),
        JSON.stringify(value.busi_district),
        value.busi_pincode,
        value.busi_countries,
        value.busi_landmark,
        value.busi_yrsCurCity,
        value.busi_type,
        userType,
      ];
      return this.database
        .executeSql(
          'INSERT INTO ORIG_BUSINESS_ADDRESS_DETAILS(refId, id, permSameCheck, busi_AdrsKYC, busi_manualEntry, busi_plots, busi_locality,busi_line3, busi_states, busi_cities, busi_district, busi_pincode, busi_countries, busi_landmark, busi_yrsCurCity, busi_type, userType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'ORIG_BUSINESS_ADDRESS_DETAILS',
              'Insert Success',
              JSON.stringify(data),
            );
            return data;
          },
          (err) => {
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'ORIG_BUSINESS_ADDRESS_DETAILS',
              'Insert Failure',
              JSON.stringify(err),
            );
            console.log('err: ' + JSON.stringify(err));
            return err;
          },
        );
    } else {
      let data = [
        refId,
        id,
        permSameCheck,
        value.busi_AdrsKYC || '',
        value.busi_manualEntry || '',
        value.busi_plots,
        value.busi_locality,
        value.busi_line3,
        JSON.stringify(value.busi_states),
        JSON.stringify(value.busi_cities),
        JSON.stringify(value.busi_district),
        value.busi_pincode,
        value.busi_countries,
        value.busi_landmark,
        value.busi_yrsCurCity,
        value.busi_type,
        userType,
        BUSID,
      ];
      return this.database
        .executeSql(
          'UPDATE ORIG_BUSINESS_ADDRESS_DETAILS SET refId=?, id=?, permSameCheck=?, busi_AdrsKYC=?, busi_manualEntry=?, busi_plots=?, busi_locality=?,busi_line3=? ,busi_states=?, busi_cities=?, busi_district=?, busi_pincode=?, busi_countries=?, busi_landmark=?, busi_yrsCurCity=?, busi_type=?, userType=? WHERE BUSID=?',
          data,
        )
        .then(
          (data) => {
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'ORIG_BUSINESS_ADDRESS_DETAILS',
              'Update Success',
              JSON.stringify(data),
            );
            return data;
          },
          (err) => {
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'ORIG_BUSINESS_ADDRESS_DETAILS',
              'Update Failure',
              JSON.stringify(err),
            );
            console.log('err: ' + JSON.stringify(err));
            return err;
          },
        );
    }
  }

  insertSourcingIdName(value) {
    let insertRows = [];
    value.forEach((master) => {
      insertRows.push([
        'INSERT INTO SOURCING_ID_MASTER(userId, userName, userType, orgId) values (?,?,?,?)',
        [master.userId, master.userName, master.userType, master.orgId],
      ]);
    });
    return this.database.sqlBatch(insertRows).then(
      (result) => {
        return result;
      },
      (err) => {
        console.log(err, 'sqlbatch error');
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'insertSourcingIdName',
          'Insert Failure',
          JSON.stringify(err),
        );
      },
    );

    // let data = [value.userId, value.userName, value.userType, value.orgId];
    // return this.database.executeSql("INSERT INTO SOURCING_ID_MASTER(userId, userName, userType, orgId) values (?,?,?,?)", data).then(data => {
    //   // this.addAuditTrail(moment(this.dateTime).format("YYYY-MM-DD HH:mm:ss"), "insertSourcingIdName", "Insert Success", JSON.stringify(data));
    //   return data;
    // }, err => {
    //   this.addAuditTrail(moment(this.dateTime).format("YYYY-MM-DD HH:mm:ss"), "insertSourcingIdName", "Insert Failure", JSON.stringify(err));
    //   console.log('Error: ', err);
    //   return [];
    // });
  }
  getSourcingIdName(userType, orgId) {
    return this.database
      .executeSql(
        'SELECT * FROM SOURCING_ID_MASTER WHERE userType=? AND orgId=?',
        [userType, orgId],
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSourcingIdName',
            'Retrieve Success',
            JSON.stringify(data),
          );
          return this.getAll(data);
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSourcingIdName',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', err);
          return [];
        },
      );
  }
  removeSourcingIdName() {
    return this.database.executeSql('DELETE FROM SOURCING_ID_MASTER', []).then(
      (data) => {
        // this.addAuditTrail(moment(this.dateTime).format("YYYY-MM-DD HH:mm:ss"), "removeSourcingIdName", "Delete Success", JSON.stringify(data));
        return data;
      },
      (err) => {
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeSourcingIdName',
          'Delete Failure',
          JSON.stringify(err),
        );
        console.log('Error: ', err);
        return [];
      },
    );
  }

  addPromotersProofDetails(refId, id, value, vaultStatus, proofName, pproofId) {
    if (pproofId === '' || pproofId === undefined || pproofId === null) {
      let promoIdRef = this.globFunc.basicEnc(value.promoIDRef);
      if (!promoIdRef.includes('MV_')) {
        promoIdRef = this.globFunc.basicEnc(value.promoIDRef);
      }
      let data = [
        refId,
        id,
        value.promoIDType,
        JSON.stringify(value.promoDoc),
        promoIdRef,
        value.promoexpiry,
        vaultStatus,
        proofName,
        value.aepsStatus,
      ];
      return this.database
        .executeSql(
          'INSERT INTO ORIG_PROOF_PROMOTER_DETAILS(refId, id, promoIDType, promoDoc, promoIDRef, promoexpiry, vaultStatus, proofName,aepsFlag) VALUES (?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addPromotersProofDetails',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let promoIdRef = this.globFunc.basicEnc(value.promoIDRef);
      if (!promoIdRef.includes('MV_')) {
        promoIdRef = this.globFunc.basicEnc(value.promoIDRef);
      }
      let udata = [
        refId,
        id,
        value.promoIDType,
        JSON.stringify(value.promoDoc),
        promoIdRef,
        value.promoexpiry,
        vaultStatus,
        proofName,
        value.aepsStatus,
        pproofId,
      ];
      return this.database
        .executeSql(
          'UPDATE ORIG_PROOF_PROMOTER_DETAILS SET refId=?, id=?, promoIDType=?, promoDoc=?, promoIDRef=?, promoexpiry=?, vaultStatus=?, proofName=?,aepsFlag=? WHERE pproofId=?',
          udata,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addPromotersProofDetails',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }
  getPromoterProofDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PROOF_PROMOTER_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPromoterProofDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getPromoterProofImageDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PROOF_PROMOTER_DETAILS a LEFT OUTER JOIN ORIG_PROMOTER_PROOF_IMGS b ON a.pproofId = b.pproofId WHERE a.refId=? AND b.id=? GROUP BY a.promoIDType;',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPromoterProofImageDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getPromoterProofDetailsByProof(refId, promoIDRef) {
    let data = [refId, this.globFunc.basicEnc(promoIDRef)];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PROOF_PROMOTER_DETAILS WHERE refId=? AND promoIDRef=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPromoterProofDetailsByProof',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getPromoterProofDetailsByProofID(refId, id, promoIDType) {
    let data = [refId, id, this.globFunc.basicEnc(promoIDType)];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PROOF_PROMOTER_DETAILS WHERE refId=? AND id=? AND promoIDType=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPromoterProofDetailsByProofID',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  removeProofData(proofData) {
    if (proofData.name == 'ProofPromoter') {
      return (
        this.database.executeSql(
          'DELETE FROM ORIG_PROOF_PROMOTER_DETAILS where pproofId=?',
          [proofData.proofid],
        ),
        this.database
          .executeSql('DELETE FROM ORIG_PROMOTER_PROOF_IMGS where pproofId=?', [
            proofData.proofid,
          ])
          .then(
            (data) => {
              return data;
            },
            (err) => {
              console.log(JSON.stringify(err));
              this.addAuditTrail(
                moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
                'removeProofData',
                'Delete Failure',
                JSON.stringify(err),
              );
              return err;
            },
          )
      );
    } else if (proofData.name == 'ProofEntity') {
      return (
        this.database.executeSql(
          'DELETE FROM ORIG_PROOF_ENTITY_DETAILS where eproofId=?',
          [proofData.proofid],
        ),
        this.database
          .executeSql('DELETE FROM ORIG_ENTITY_PROOF_IMGS where eproofId=?', [
            proofData.proofid,
          ])
          .then(
            (data) => {
              return data;
            },
            (err) => {
              console.log(JSON.stringify(err));
              this.addAuditTrail(
                moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
                'removeProofData',
                'Delete Failure',
                JSON.stringify(err),
              );
              return err;
            },
          )
      );
    }
  }
  removeSecondKycData(leadId, idType) {
    return this.database
      .executeSql('DELETE FROM KARZA_DATA WHERE leadId=? AND idType=?', [
        leadId,
        idType,
      ])
      .then((data) => {
        console.log(data);
        return data;
      })
      .catch((err) => err);
  }
  removeGuaDetails(refId, id) {
    let data = [refId, id];
    return (
      this.database.executeSql(
        'DELETE FROM ORIG_PERSONAL_DETAILS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_PRESENT_ADDRESS_DETAILS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_PERMANENT_ADDRESS_DETAILS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_PROMOTER_PROOF_IMGS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_PROOF_PROMOTER_DETAILS where refId=? and id=?',
        data,
      ),
      this.database
        .executeSql('DELETE FROM SUBMIT_STATUS where refId=? and id=?', data)
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log(JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'removeGuaDetails',
              'Delete Failure',
              JSON.stringify(err),
            );
            return err;
          },
        )
    );
  }
  saveOtherDocData(data, docId) {
    if (docId) {
      data.push(docId);
      return this.database
        .executeSql(
          'UPDATE ORIG_OTHERDOCUMENT_DETAILS SET refId=?, id=?, docType=?, docDescription=?, otherDocImg=? WHERE docId=?',
          data,
        )
        .then(
          (data) => {
            this.alertService.showAlert(
              'Alert!',
              'Other Document Details Updated Successfully',
            );
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'saveOtherDocData',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      return this.database
        .executeSql(
          'INSERT INTO ORIG_OTHERDOCUMENT_DETAILS (refId, id, docType, docDescription, otherDocImg) VALUES (?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            this.alertService.showAlert(
              'Alert!',
              'Other Document Details Added Successfully',
            );
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'saveOtherDocData',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }
  getOtherDocs(ids) {
    let refId = ids.refId,
      id = ids.id;
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_OTHERDOCUMENT_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getOtherDocs',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  deleteOtherDocs(ids) {
    return (
      this.database.executeSql(
        'DELETE FROM ORIG_OTHERDOCUMENT_DETAILS WHERE refId=? AND id=? AND docId=?',
        ids,
      ),
      this.database
        .executeSql(
          'DELETE FROM ORIG_OTHERDOCUMENT_IMGS_DETAILS WHERE refId=? AND id=? AND docId=?',
          ids,
        )
        .then(
          (data) => {
            this.alertService.showAlert('Alert!', 'Data Deleted Successfully');
            return data;
          },
          (err) => {
            console.log('Error: ', err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'deleteOtherDocs',
              'Delete Failure',
              JSON.stringify(err),
            );
            return err;
          },
        )
    );
  }
  addOtherDocsImages(imgSet) {
    return this.database
      .executeSql(
        'INSERT INTO ORIG_OTHERDOCUMENT_IMGS_DETAILS (refId,id,docId,docsImgs) VALUES (?,?,?,?)',
        imgSet,
      )
      .then(
        (data) => {
          this.alertService.showAlert('Alert!', 'Image Added Successfully');
          return data;
        },
        (err) => {
          console.log(err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'addOtherDocsImages',
            'Insert Failure',
            JSON.stringify(err),
          );
        },
      );
  }
  getOtherDocsImgs(docId) {
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_OTHERDOCUMENT_IMGS_DETAILS WHERE docId=?',
        [docId],
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getOtherDocsImgs',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  removeOtherDocsImg(id) {
    return this.database
      .executeSql(
        'DELETE FROM ORIG_OTHERDOCUMENT_IMGS_DETAILS WHERE docImgId=?',
        [id],
      )
      .then(
        (data) => {
          this.alertService.showAlert('Alert!', 'Image Deleted Successfully');
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removeOtherDocsImg',
            'Delete Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  addAdditionalData(refId, id, value, adtlId) {
    if (adtlId) {
      let data = [
        refId,
        id,
        value.ownType,
        value.owner,
        value.owner1,
        value.address1,
        value.address2,
        value.states,
        value.cities,
        value.district,
        value.pincode,
        value.country,
        value.landmark,
        value.property,
        adtlId,
      ];
      return this.database
        .executeSql(
          'UPDATE ORIG_ADDITIONAL_DETAILS SET refId=?, id=?, ownType=?, owner=?, owner1=?, address1=?, address2=?, states=?, cities=?, district=?, pincode=?, country=?, landmark=?, property=? WHERE adtlId=?',
          data,
        )
        .then(
          (data) => {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Property Details Updated Successfully',
            );
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addAdditionalData',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let data = [
        refId,
        id,
        value.ownType,
        value.owner,
        value.owner1,
        value.address1,
        value.address2,
        value.states,
        value.cities,
        value.district,
        value.pincode,
        value.country,
        value.landmark,
        value.property,
      ];
      return this.database
        .executeSql(
          'INSERT INTO ORIG_ADDITIONAL_DETAILS (refId, id, ownType, owner, owner1, address1, address2, states, cities, district, pincode, country, landmark, property) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Property Details Added Successfully',
            );
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addAdditionalData',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }
  getAdditionDtlData(refId, id) {
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_ADDITIONAL_DETAILS WHERE refId=? AND id=?',
        [refId, id],
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getAdditionDtlData',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getguappDetails(refId, userType) {
    let data = [refId, userType];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PERSONAL_DETAILS WHERE refId=? AND userType=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getguappDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  removeApplicantDetails(refId, id) {
    let data = [refId, id];
    return (
      this.database.executeSql(
        'DELETE FROM ORIG_BASIC_DETAILS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_PERSONAL_DETAILS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_PRESENT_ADDRESS_DETAILS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_PERMANENT_ADDRESS_DETAILS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_PROOF_PROMOTER_DETAILS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_PROMOTER_PROOF_IMGS where refId=? and id=?',
        data,
      ),
      this.database.executeSql(
        'DELETE FROM ORIG_SOURCING_DETAILS where refId=? and id=?',
        data,
      ),
      this.database
        .executeSql('DELETE FROM SUBMIT_STATUS where refId=? and id=?', data)
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log(err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'removeApplicantDetails',
              'Delete Failure',
              JSON.stringify(err),
            );
            return err;
          },
        )
    );
  }
  selectOrgin(id) {
    return this.database
      .executeSql('SELECT * FROM ORIG_APP_DETAILS WHERE id=?', [id])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'selectOrgin',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getAllDetails(leadStatus, createdUser) {
    let data = [leadStatus, createdUser];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_APP_DETAILS a LEFT OUTER JOIN ORIG_BASIC_DETAILS b ON (a.id=b.id) LEFT OUTER JOIN ORIG_PERSONAL_DETAILS c ON (a.id=c.id) LEFT OUTER JOIN ORIG_SOURCING_DETAILS d ON (a.id=d.id) LEFT OUTER JOIN SUBMIT_STATUS e ON (a.id=e.id) WHERE c.leadStatus=? AND e.submitStat='0' AND e.eapplType='A' AND a.createdUser=?",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getAllDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getSubmittedApplications(createdUser) {
    let data = [createdUser];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_APP_DETAILS a LEFT OUTER JOIN ORIG_BASIC_DETAILS b ON (b.id=a.id) LEFT OUTER JOIN ORIG_SOURCING_DETAILS c ON (c.id=b.id) LEFT OUTER JOIN ORIG_PERSONAL_DETAILS d ON (d.id=c.id) LEFT OUTER JOIN SUBMIT_STATUS e ON (e.id=d.id) WHERE e.submitStat='1' AND e.applicationStatus !='SR' AND a.createdUser=? ORDER BY a.id DESC ",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmittedApplications',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getNonIndSubmitDataDetails(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_APP_DETAILS a LEFT OUTER JOIN ORIG_BASIC_DETAILS b ON (b.id=a.id) LEFT OUTER JOIN ORIG_PERSONAL_DETAILS c ON (c.id=b.id) LEFT OUTER JOIN ORIG_PERMANENT_ADDRESS_DETAILS d ON (d.id=c.id) LEFT OUTER JOIN ORIG_PRESENT_ADDRESS_DETAILS e  ON (e.id=d.id) LEFT OUTER JOIN ORIG_SOURCING_DETAILS f ON (f.id=e.id) LEFT OUTER JOIN ORIG_ENTITY_DETAILS g ON (g.id=f.id) WHERE c.refId=? AND c.userType='A'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getNonIndSubmitDataDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getSubmitDataDetails(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_APP_DETAILS a LEFT OUTER JOIN ORIG_BASIC_DETAILS b ON (b.id=a.id) LEFT OUTER JOIN ORIG_PERSONAL_DETAILS c ON (c.id=b.id) LEFT OUTER JOIN ORIG_PERMANENT_ADDRESS_DETAILS d ON (d.id=c.id) LEFT OUTER JOIN ORIG_PRESENT_ADDRESS_DETAILS e ON (e.id=d.id) LEFT OUTER JOIN ORIG_SOURCING_DETAILS f ON (f.id=e.id) LEFT OUTER JOIN VEHICLE_DETAILS g ON (g.id=f.id) LEFT OUTER JOIN ORIG_BUSINESS_ADDRESS_DETAILS h ON (h.id=g.id) WHERE c.refId=? AND c.userType='A'",
        data,
      )
      .then(
        (data) => {
          console.log(data, 'getsubmit in sqlite');
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmitDataDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getSubmitStatusDetails(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM SUBMIT_STATUS WHERE refId=? AND eapplType='A'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmitStatusDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getGuaranDetails(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_PERSONAL_DETAILS a LEFT OUTER JOIN ORIG_PERMANENT_ADDRESS_DETAILS b ON (b.id=a.id) LEFT OUTER JOIN ORIG_PRESENT_ADDRESS_DETAILS c ON (c.id=b.id) WHERE a.userType='G' AND a.refId=?",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getGuaranDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getCoappDetails(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_PERSONAL_DETAILS a LEFT OUTER JOIN ORIG_PERMANENT_ADDRESS_DETAILS b ON (b.id=a.id) LEFT OUTER JOIN ORIG_PRESENT_ADDRESS_DETAILS c ON (c.id=b.id) LEFT OUTER JOIN ORIG_BUSINESS_ADDRESS_DETAILS d ON (d.id=c.id) WHERE a.userType='C' AND a.refId=?",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getCoappDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getCoappDetailsForBureau(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_PERSONAL_DETAILS a LEFT OUTER JOIN ORIG_PERMANENT_ADDRESS_DETAILS b ON (b.id=a.id) LEFT OUTER JOIN ORIG_PRESENT_ADDRESS_DETAILS c ON (c.id=b.id) LEFT OUTER JOIN SUBMIT_STATUS d ON (d.id=c.id) WHERE a.userType='C' AND a.refId=?",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getCoappDetailsForBureau',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  addpromoterproofImages(refId, id, imgpath, pproofId) {
    let data = [refId, id, imgpath, pproofId];
    return this.database
      .executeSql(
        'INSERT INTO ORIG_PROMOTER_PROOF_IMGS (refId,id,imgpath,pproofId) VALUES (?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log(err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'addpromoterproofImages',
            'Insert Failure',
            JSON.stringify(err),
          );
        },
      );
  }
  addPostSanctionImages(refId, id, imgpath, pproofId, postSanImgId) {
    if (postSanImgId) {
      let data = [refId, id, pproofId, imgpath, postSanImgId];
      return this.database
        .executeSql(
          'UPDATE ORIG_POST_SANCTION_IMGS SET refId=?,id=?, pproofId=?, imgpath=? WHERE postSanImgId=?',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('err: ' + JSON.stringify(err));
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addPostSanctionImages',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let data = [refId, id, imgpath, pproofId];
      return this.database
        .executeSql(
          'INSERT INTO ORIG_POST_SANCTION_IMGS (refId,id,imgpath,pproofId) VALUES (?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log(err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addPostSanctionImages',
              'Insert Failure',
              JSON.stringify(err),
            );
          },
        );
    }
  }
  getpromoterproofImages(pproofId) {
    return this.database
      .executeSql('SELECT * FROM ORIG_PROMOTER_PROOF_IMGS WHERE pproofId=?', [
        pproofId,
      ])
      .then(
        (data) => {
          let details = [];
          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              details.push({
                imgpath: data.rows.item(i).imgpath,
                id: data.rows.item(i).proofImgId,
                pproofId: data.rows.item(i).pproofId,
              });
            }
          }
          return details;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getpromoterproofImages',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getPostSanctionImages(pproofId, refId, id) {
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_POST_SANCTION_IMGS WHERE pproofId=? and refId=? and id=?',
        [pproofId, refId, id],
      )
      .then(
        (data) => {
          let details = [];
          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              details.push({
                imgpath: data.rows.item(i).imgpath,
                id: data.rows.item(i).id,
                refId: data.rows.item(i).refId,
                postSanImgId: data.rows.item(i).postSanImgId,
                pproofId: data.rows.item(i).pproofId,
                uploaded: data.rows.item(i).uploaded,
              });
            }
          }
          return details;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPostSanctionImages',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  removepromoterproofImages(id) {
    return this.database
      .executeSql('DELETE FROM ORIG_PROMOTER_PROOF_IMGS WHERE pproofId=?', [id])
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removepromoterproofImages',
            'Delete Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  removepostSanctionImages(postSanImgId, refId, id) {
    return this.database
      .executeSql(
        'DELETE FROM ORIG_POST_SANCTION_IMGS WHERE postSanImgId=? and refId=? and id=?',
        [postSanImgId, refId, id],
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removepostSanctionImages',
            'Delete Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  removepromoterImgDetails(id) {
    return this.database
      .executeSql('DELETE FROM ORIG_PROMOTER_PROOF_IMGS WHERE proofImgId=?', [
        id,
      ])
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removepromoterImgDetails',
            'Delete Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  insertSubmitDetails(
    refId,
    id,
    cibilCheckStat,
    submitStat,
    applicationNumber,
    applicationStatus,
    ApplType,
    cibilColor,
    cibilScore,
  ) {
    let data = [
      refId,
      id,
      cibilCheckStat,
      submitStat,
      applicationNumber,
      applicationStatus,
      ApplType,
      cibilColor,
      cibilScore,
      this.globFunc.basicDec(localStorage.getItem('username')),
    ];
    return this.database
      .executeSql(
        'INSERT INTO SUBMIT_STATUS(refId, id, cibilCheckStat, submitStat, applicationNumber, applicationStatus, eapplType, cibilColor, cibilScore,createdUser) VALUES(?,?,?,?,?,?,?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'insertSubmitDetails',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  updateSubmitDetails(
    cibilCheckStat,
    submitStat,
    applicationNumber,
    applicationStatus,
    cibilColor,
    cibilScore,
    statId,
  ) {
    let data = [
      cibilCheckStat,
      submitStat,
      applicationNumber,
      applicationStatus,
      cibilColor,
      cibilScore,
      statId,
    ];
    return this.database
      .executeSql(
        'UPDATE SUBMIT_STATUS SET cibilCheckStat=?, submitStat=?, applicationNumber=?, applicationStatus=?, cibilColor=?, cibilScore=? WHERE statId=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateSubmitDetails',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  updateCibilSubmitDetails(cibilCheckStat, statId) {
    let data = [cibilCheckStat, statId];
    return this.database
      .executeSql(
        'UPDATE SUBMIT_STATUS SET cibilCheckStat=? WHERE statId=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateSubmitDetails',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  updateNewSubmitDetails(
    applicationNo,
    SfosLeadId,
    LpLeadId,
    LpUrn,
    LpCustid,
    refId,
    id,
    eapplType,
  ) {
    let data = [
      applicationNo,
      SfosLeadId,
      LpLeadId,
      LpUrn,
      LpCustid,
      refId,
      id,
      eapplType,
    ];
    return this.database
      .executeSql(
        'UPDATE SUBMIT_STATUS SET applicationNumber=?, SfosLeadId=?, LpLeadId=?, LpUrn=?, LpCustid=? WHERE refId=? and id=? and eapplType=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateNewSubmitDetails',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getSubmitDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql('SELECT * FROM SUBMIT_STATUS WHERE refId=? AND id=?', data)
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmitDetails',
            'Retrieve Sucess',
            JSON.stringify(data),
          );
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmitDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getSubmitDetailsByRefId(refId, eapplType) {
    let data = [refId, eapplType];
    return this.database
      .executeSql(
        'SELECT * FROM SUBMIT_STATUS WHERE refId=? AND eapplType=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmitDetailsByRefId',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getSubmitDetailsByRefIdOnly(refId) {
    let data = [refId];
    return this.database
      .executeSql('SELECT * FROM SUBMIT_STATUS WHERE refId=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmitDetailsByRefIdOnly',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getleadDetails(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_APP_DETAILS a LEFT OUTER JOIN ORIG_BASIC_DETAILS b ON a.id=b.refId LEFT OUTER JOIN ORIG_PERSONAL_DETAILS c ON a.id=c.refId WHERE a.id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getleadDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  insertLoginDetails(
    username,
    password,
    orgscode,
    status,
    statusCode,
    ro_name,
    userID,
    userGroups,
  ) {
    let gdata = [
      this.globFunc.basicEnc(username),
      this.globFunc.basicEnc(password),
      orgscode,
      status,
      statusCode,
      this.globFunc.basicEnc(ro_name),
      this.globFunc.basicEnc(userID),
      JSON.stringify(userGroups),
    ];
    let cdata = [this.globFunc.basicEnc(username)];
    return this.database
      .executeSql('SELECT * FROM LOGIN_DETAILS WHERE userID=?', cdata)
      .then(
        (data) => {
          if (data.rows.length > 0) {
            return this.database
              .executeSql('DELETE FROM LOGIN_DETAILS WHERE userID=?', [cdata])
              .then((data) => {
                return this.database
                  .executeSql(
                    'INSERT INTO LOGIN_DETAILS(user_name,password,orgscode,status,statusCode,ro_name, userID,userGroups) VALUES (?,?,?,?,?,?,?,?)',
                    gdata,
                  )
                  .then(
                    (data) => {
                      // this.addAuditTrail(moment(this.dateTime).format("YYYY-MM-DD HH:mm:ss"), "insertLoginDetails", "Insert Success", JSON.stringify(data));
                      return data;
                    },
                    (err) => {
                      this.addAuditTrail(
                        moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
                        'insertLoginDetails',
                        'Delete Failure',
                        JSON.stringify(err),
                      );
                      console.log(err);
                    },
                  );
              });
          } else {
            return this.database
              .executeSql(
                'INSERT INTO LOGIN_DETAILS(user_name,password,orgscode,status,statusCode,ro_name,userID,userGroups) VALUES (?,?,?,?,?,?,?,?)',
                gdata,
              )
              .then(
                (data) => {
                  // this.addAuditTrail(moment(this.dateTime).format("YYYY-MM-DD HH:mm:ss"), "insertLoginDetails", "Insert Success", JSON.stringify(data));
                  return data;
                },
                (err) => {
                  this.addAuditTrail(
                    moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
                    'insertLoginDetails',
                    'Insert Failure',
                    JSON.stringify(err),
                  );
                  console.log(err);
                },
              );
          }
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'insertLoginDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', err);
          return [];
        },
      );
  }
  forOfflineLogin(uName, psw): Promise<any> {
    let parameters = [
      this.globFunc.basicEnc(uName),
      this.globFunc.basicEnc(psw),
    ];
    return this.database
      .executeSql(
        'select * from LOGIN_DETAILS where user_name = ? and password = ?',
        parameters,
      )
      .then((data) => {
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'forOfflineLogin',
          'Retrieve Success',
          JSON.stringify(data),
        );
        return this.getAll(data);
      })
      .catch((err) => {
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'forOfflineLogin',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        console.log(err);
      });
  }

  GetCbildocs(id) {
    let data = [id];
    return this.database
      .executeSql('SELECT * FROM ORIG_PROOF_PROMOTER_DETAILS WHERE id=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'GetCbildocs',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  docPromoterCheck(id, proofid) {
    let data = [id];
    return this.database
      .executeSql(
        "SELECT * FROM  ORIG_PROOF_PROMOTER_DETAILS WHERE id=? and promoDoc LIKE '%" +
          proofid +
          "%'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'docPromoterCheck',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  saveExistingData(data) {
    let existingData = [
      data.AppId,
      data.AppFirstName,
      data.AppLastName,
      this.globFunc.basicEnc(data.Mobile),
      this.globFunc.basicEnc(data.PanNum),
      data.OldAppId,
      data.Urnno,
      data.LeadId,
      data.ErrorMsg,
      data.ErrorCode,
      data.UrnStatus,
      data.Aadhar,
      this.globFunc.basicEnc(data.VoterId),
      this.globFunc.basicEnc(data.RationCard),
      this.globFunc.basicEnc(data.Passport),
      this.globFunc.basicEnc(data.DrivingLic),
      data.Others,
      data.EnrollStatus,
      data.IdProof,
      this.globFunc.basicEnc(data.IdProofValue),
      data.IdProofExp,
      data.Salutation,
      data.FatherName,
      data.MaritalStatus,
      data.FatherOrSpouse,
      data.Gndr,
      this.globFunc.basicEnc(data.pre_Area),
      this.globFunc.basicEnc(data.pre_Village),
      this.globFunc.basicEnc(data.pre_City),
      this.globFunc.basicEnc(data.pre_State),
      this.globFunc.basicEnc(data.pre_pincode),
      this.globFunc.basicEnc(data.per_Doorno),
      this.globFunc.basicEnc(data.per_StreetName),
      this.globFunc.basicEnc(data.per_Area),
      this.globFunc.basicEnc(data.per_Village),
      this.globFunc.basicEnc(data.per_City),
      this.globFunc.basicEnc(data.per_State),
      this.globFunc.basicEnc(data.per_pincode),
      data.per_landmark,
      data.RedFlag,
      data.aadharCardAvailability,
      data.aadharCardNumber,
      data.contactType,
      data.contactURN,
      data.CustomerID,
      data.CustomerType,
      data.customerURN,
      this.globFunc.basicEnc(data.pre_District),
      data.Dnum,
      data.DOB,
      this.globFunc.basicEnc(data.Email),
      data.EnrollmentStatus,
      data.errorStackTrace,
      data.errorType,
      data.FHLastName,
      data.FHName,
      data.MothersMaidedName,
      data.Name,
      data.EKycStatus,
      data.Per_Cross,
      data.primaryIdentityProof,
      data.Per_type,
      data.Per_val,
      data.resultCode,
      data.secondaryIdentityProofValue,
      data.secondaryIDExpiry,
      data.SIdType,
      data.SidVal,
      data.Sname,
      data.JanaReferenceID,
    ];
    return this.database
      .executeSql(
        'INSERT INTO EXISTING_CUSTOMER_DATA(AppId, AppFirstName, AppLastName, Mobile, PanNum, OldAppId, Urnno, LeadId, ErrorMsg, ErrorCode, UrnStatus, Aadhar, VoterId, RationCard, Passport, DrivingLic, Others, EnrollStatus, IdProof, IdProofValue, IdProofExp, Salutation, FatherName, MaritalStatus, FatherOrSpouse, Gndr, pre_Area, pre_Village, pre_City, pre_State, pre_pincode, per_Doorno, per_StreetName, per_Area, per_Village, per_City, per_State, per_pincode, per_landmark, RedFlag, aadharCardAvailability, aadharCardNumber, contactType, contactURN, CustomerID, CustomerType, customerURN, pre_District, Dnum, DOB, Email, EnrollmentStatus, errorStackTrace, errorType, FHLastName, FHName, MothersMaidedName, Name, EKycStatus, Per_Cross, primaryIdentityProof, Per_type, Per_val, resultCode, secondaryIdentityProofValue, secondaryIDExpiry, SIdType, SidVal, Sname, JanaReferenceID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        existingData,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'saveExistingData',
            'Insert Success',
            JSON.stringify(data),
          );
          return data;
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'saveExistingData',
            'Insert Failure',
            JSON.stringify(err),
          );
          console.log('err: ' + JSON.stringify(err));
          return err;
        },
      );
  }
  updateExistingData(data) {
    let existingData = [
      data.AppId,
      data.AppFirstName,
      data.AppLastName,
      this.globFunc.basicEnc(data.Mobile),
      this.globFunc.basicEnc(data.PanNum),
      data.OldAppId,
      data.LeadId,
      data.ErrorMsg,
      data.ErrorCode,
      data.UrnStatus,
      data.Aadhar,
      this.globFunc.basicEnc(data.VoterId),
      this.globFunc.basicEnc(data.RationCard),
      this.globFunc.basicEnc(data.Passport),
      this.globFunc.basicEnc(data.DrivingLic),
      data.Others,
      data.EnrollStatus,
      data.IdProof,
      this.globFunc.basicEnc(data.IdProofValue),
      data.IdProofExp,
      data.Salutation,
      data.FatherName,
      data.MaritalStatus,
      data.FatherOrSpouse,
      data.Gndr,
      this.globFunc.basicEnc(data.pre_Area),
      this.globFunc.basicEnc(data.pre_Village),
      this.globFunc.basicEnc(data.pre_City),
      this.globFunc.basicEnc(data.pre_State),
      this.globFunc.basicEnc(data.pre_pincode),
      this.globFunc.basicEnc(data.per_Doorno),
      this.globFunc.basicEnc(data.per_StreetName),
      this.globFunc.basicEnc(data.per_Area),
      this.globFunc.basicEnc(data.per_Village),
      this.globFunc.basicEnc(data.per_City),
      this.globFunc.basicEnc(data.per_State),
      this.globFunc.basicEnc(data.per_pincode),
      data.per_landmark,
      data.RedFlag,
      data.aadharCardAvailability,
      data.aadharCardNumber,
      data.contactType,
      data.contactURN,
      data.CustomerID,
      data.CustomerType,
      data.customerURN,
      this.globFunc.basicEnc(data.pre_District),
      data.Dnum,
      data.DOB,
      this.globFunc.basicEnc(data.Email),
      data.EnrollmentStatus,
      data.errorStackTrace,
      data.errorType,
      data.FHLastName,
      data.FHName,
      data.MothersMaidedName,
      data.Name,
      data.EKycStatus,
      data.Per_Cross,
      data.primaryIdentityProof,
      data.Per_type,
      data.Per_val,
      data.resultCode,
      data.secondaryIdentityProofValue,
      data.secondaryIDExpiry,
      data.SIdType,
      data.SidVal,
      data.Sname,
      data.JanaReferenceID,
      data.Urnno,
    ];
    return this.database
      .executeSql(
        'UPDATE EXISTING_CUSTOMER_DATA SET AppId=?, AppFirstName=?, AppLastName=?, Mobile=?, PanNum=?, OldAppId=?, LeadId=?, ErrorMsg=?, ErrorCode=?, UrnStatus=?, Aadhar=?, VoterId=?, RationCard=?, Passport=?, DrivingLic=?, Others=?, EnrollStatus=?, IdProof=?, IdProofValue=?, IdProofExp=?, Salutation=?, FatherName=?, MaritalStatus=?, FatherOrSpouse=?, Gndr=?, pre_Area=?, pre_Village=?, pre_City=?, pre_State=?, pre_pincode=?, per_Doorno=?, per_StreetName=?, per_Area=?, per_Village=?, per_City=?, per_State=?, per_pincode=?, per_landmark=?, RedFlag=?, aadharCardAvailability=?, aadharCardNumber=?, contactType=?, contactURN=?, CustomerID=?, CustomerType=?, customerURN=?, pre_District=?, Dnum=?, DOB=?, Email=?, EnrollmentStatus=?, errorStackTrace=?, errorType=?, FHLastName=?, FHName=?, MothersMaidedName=?, Name=?, EKycStatus=?, Per_Cross=?, primaryIdentityProof=?, Per_type=?, Per_val=?, resultCode=?, secondaryIdentityProofValue=?, secondaryIDExpiry=?, SIdType=?, SidVal=?, Sname=?, JanaReferenceID=? WHERE Urnno=?',
        existingData,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateExistingData',
            'Update Success',
            JSON.stringify(data),
          );
          return data;
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateExistingData',
            'Update Failure',
            JSON.stringify(err),
          );
          console.log('err: ' + JSON.stringify(err));
          return err;
        },
      );
  }
  selectExData(id) {
    return this.database
      .executeSql('SELECT * FROM  EXISTING_CUSTOMER_DATA WHERE Urnno=?', [id])
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'selectExData',
            'Retrieve Success',
            JSON.stringify(data),
          );
          return this.getAll(data);
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'selectExData',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', err);
          return [];
        },
      );
  }

  updateHimark(himark, himarkstatus, statId) {
    let data = [
      himark.memberID,
      himark.Score,
      himark.statusCode,
      himark.statusDescription,
      himarkstatus,
      statId,
    ];
    return this.database
      .executeSql(
        'UPDATE SUBMIT_STATUS SET himarkMemberID=?, himarkScore=?, himarkstatusCode=?, himarkstatusDescription=?, himarkCheckStat=? WHERE statId=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateHimark',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  updateCoCibilSubmitDetails(cibilCheckStat, statId) {
    let data = [cibilCheckStat, statId];
    return this.database
      .executeSql(
        'UPDATE SUBMIT_STATUS SET cibilCheckStat=? WHERE statId=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateSubmitDetails',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  insertversionDetails(version) {
    let gdata = [version];
    return this.database
      .executeSql('SELECT * FROM MASTER_UPDATE_VERSION', [])
      .then(
        (data) => {
          if (data.rows.length > 0) {
            return this.database
              .executeSql('DELETE FROM MASTER_UPDATE_VERSION', [])
              .then((data) => {
                return this.database
                  .executeSql(
                    'INSERT INTO MASTER_UPDATE_VERSION(version) VALUES (?)',
                    gdata,
                  )
                  .then(
                    (data) => {
                      return data;
                    },
                    (err) => {
                      console.log(err);
                      this.addAuditTrail(
                        moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
                        'Retrieve',
                        'Delete Failure',
                        JSON.stringify(err),
                      );
                    },
                  );
              });
          } else {
            return this.database
              .executeSql(
                'INSERT INTO MASTER_UPDATE_VERSION(version) VALUES (?)',
                gdata,
              )
              .then(
                (data) => {
                  return data;
                },
                (err) => {
                  console.log(err);
                  this.addAuditTrail(
                    moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
                    'Retrieve',
                    'Insert Failure',
                    JSON.stringify(err),
                  );
                },
              );
          }
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'insertversionDetails',
            'Insert Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getversionDetails() {
    return this.database
      .executeSql('SELECT * FROM  MASTER_UPDATE_VERSION', [])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'Retrieve',
            'select Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  adProofupdate(refId, id, promoIDType, aadharNum) {
    if (aadharNum == '' || aadharNum == undefined || aadharNum == null) {
      console.log('NO proof value recived');
    } else {
      let sdata = [id, promoIDType];
      let udata = [this.globFunc.basicEnc(aadharNum), id, promoIDType];
      return this.database
        .executeSql(
          'SELECT * FROM ORIG_PROOF_PROMOTER_DETAILS WHERE id=? and promoIDType=?',
          sdata,
        )
        .then(
          (gdata) => {
            if (gdata.rows.length > 0) {
              return this.database
                .executeSql(
                  'UPDATE ORIG_PROOF_PROMOTER_DETAILS set promoIDRef=? WHERE id=? and promoIDType=?',
                  udata,
                )
                .then(
                  (data) => {
                    return data;
                  },
                  (err) => {
                    console.log(err);
                    this.addAuditTrail(
                      moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
                      'adProofupdate',
                      'Update Failure',
                      JSON.stringify(err),
                    );
                  },
                );
            } else {
              console.log('NO aadhaar value Found');
            }
          },
          (err) => {
            console.log('Error: ', err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'adProofupdate',
              'select Failure',
              JSON.stringify(err),
            );
            return [];
          },
        );
    }
  }
  addAuditTrail(Timestamp, service, action, value) {
    let data = [
      this.globFunc.basicDec(localStorage.getItem('username')),
      this.device.uuid,
      Timestamp,
      service,
      action,
      value,
    ];
    return this.database
      .executeSql(
        'INSERT INTO AUDIT_LOG(username,deviceID,Timestamp,service,action,value) VALUES (?,?,?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'addAuditTrail',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getAuditTrail() {
    return this.database.executeSql('SELECT * FROM  AUDIT_LOG', []).then(
      (data) => {
        return this.getAll(data);
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getAuditTrail',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  getAuditTrailbydate(value) {
    let data = [value.startDate, value.endDate];
    return this.database
      .executeSql(
        'SELECT * FROM AUDIT_LOG WHERE auditDate BETWEEN ? AND ?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getAuditTrailbydate',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  deleteAuditTrailbydate(fromDate, toDate) {
    let cdata = [fromDate, toDate];
    return this.database
      .executeSql(
        'DELETE FROM AUDIT_LOG WHERE auditDate BETWEEN ? AND ?',
        cdata,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'deleteAuditTrailbydate',
            'Delete Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getSubmitedOtherDocs(ids) {
    let refId = ids.refId,
      id = ids.id;
    let data = [refId, id];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_OTHERDOCUMENT_DETAILS WHERE refId=? AND id=? AND submitStatus='1'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmitedOtherDocs',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getNonSubmitedOtherDocs(ids) {
    let refId = ids.refId,
      id = ids.id;
    let data = [refId, id];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_OTHERDOCUMENT_DETAILS WHERE refId=? AND id=? AND submitStatus='0'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getNonSubmitedOtherDocs',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  checkNonSubmitedOtherDocs(ids) {
    let refId = ids.refId,
      id = ids.id;
    let data = [refId, id];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_OTHERDOCUMENT_DETAILS WHERE refId=? AND id=? AND submitStatus='0'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'checkNonSubmitedOtherDocs',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  updateSubmitedOtherDocs(submitStatus, refId, id) {
    let data = [submitStatus, refId, id];
    return this.database
      .executeSql(
        'UPDATE ORIG_OTHERDOCUMENT_DETAILS SET submitStatus=? WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateSubmitedOtherDocs',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getAddedDocImage(docId) {
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_OTHERDOCUMENT_IMGS_DETAILS WHERE docId=?',
        docId,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getAddedDocImage',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  appdatacheck() {
    return this.database.executeSql('SELECT * FROM MASTER_APP_DATA', []).then(
      (Data) => {
        return Data;
      },
      (err) => {
        console.log(err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'appdatacheck',
          'Retrieve Failure',
          JSON.stringify(err),
        );
      },
    );
  }
  appdatainsert(appDate) {
    let data = [appDate];
    return this.database
      .executeSql('INSERT INTO MASTER_APP_DATA(appDate) VALUES (?)', data)
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'appdatainsert',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  insertLMSData(value) {
    let data = [
      value.promoter_fname,
      value.promoter_mname,
      value.promoter_lname,
      value.customer_type,
      value.branch_code,
      value.name_of_enterprise,
      value.type_of_industry,
      value.annual_turnover,
      value.Loan_amount,
      value.Loan_purpose,
      value.mobile_number,
      value.landline,
      value.email,
      value.Offering_Category,
      value.offering_name,
      value.offering_variant,
      value.Other_Offering_Interested,
      value.Campaign_Code,
      value.lead_source,
      value.Lead_status,
      value.Lead_substatus,
      value.priority,
      value.Remarks,
      value.Door_No,
      value.Street_Name,
      value.Cross,
      value.Area,
      value.Land_Mark,
      value.Pincode,
      value.Country,
      value.State,
      value.City,
      value.Preferred_Store_Front,
      value.current_emp_id,
      value.created_date,
      value.modified_date,
      value.created_by,
      value.reference_id,
      value.Preferred_Meeting_datetime,
      value.scheme_code,
      value.Lead_id,
    ];
    return this.database
      .executeSql(
        'INSERT INTO LMS_DATA(promoter_fname, promoter_mname, promoter_lname, customer_type, branch_code, name_of_enterprise, type_of_industry, annual_turnover, Loan_amount, Loan_purpose, mobile_number, landline, email, Offering_Category, offering_name, offering_variant, Other_Offering_Interested, Campaign_Code, lead_source, Lead_status, Lead_substatus, priority, Remarks, Door_No, Street_Name, Cross, Area, Land_Mark, Pincode, Country, State, City, Preferred_Store_Front, current_emp_id, created_date, modified_date, created_by, reference_id, Preferred_Meeting_datetime, scheme_code, Lead_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'insertLMSData',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  updateLMSData(value) {
    let data = [
      value.promoter_fname,
      value.promoter_mname,
      value.promoter_lname,
      value.customer_type,
      value.branch_code,
      value.name_of_enterprise,
      value.type_of_industry,
      value.annual_turnover,
      value.Loan_amount,
      value.Loan_purpose,
      value.mobile_number,
      value.landline,
      value.email,
      value.Offering_Category,
      value.offering_name,
      value.offering_variant,
      value.Other_Offering_Interested,
      value.Campaign_Code,
      value.lead_source,
      value.Lead_status,
      value.Lead_substatus,
      value.priority,
      value.Remarks,
      value.Door_No,
      value.Street_Name,
      value.Cross,
      value.Area,
      value.Land_Mark,
      value.Pincode,
      value.Country,
      value.State,
      value.City,
      value.Preferred_Store_Front,
      value.current_emp_id,
      value.created_date,
      value.modified_date,
      value.created_by,
      value.reference_id,
      value.Preferred_Meeting_datetime,
      value.scheme_code,
      value.Lead_id,
    ];
    return this.database
      .executeSql(
        'UPDATE LMS_DATA set promoter_fname=?, promoter_mname=?, promoter_lname=?, customer_type=?, branch_code=?, name_of_enterprise=?, type_of_industry=?, annual_turnover=?, Loan_amount=?, Loan_purpose=?, mobile_number=?, landline=?, email=?, Offering_Category=?, offering_name=?, offering_variant=?, Other_Offering_Interested=?, Campaign_Code=?, lead_source=?, Lead_status=?, Lead_substatus=?, priority=?, Remarks=?, Door_No=?, Street_Name=?, Cross=?, Area=?, Land_Mark=?, Pincode=?, Country=?, State=?, City=?, Preferred_Store_Front=?, current_emp_id=?, created_date=?, modified_date=?, created_by=?, reference_id=?, Preferred_Meeting_datetime=?, scheme_code=? where Lead_id=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateLMSData',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  updatePassedLMSData(passed_lead, Lead_id) {
    let data = [passed_lead, Lead_id];
    return this.database
      .executeSql('UPDATE LMS_DATA set passed_lead=? where Lead_id=?', data)
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updatePassedLMSData',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getLMSDetails(value) {
    let data = [value];
    return this.database
      .executeSql('SELECT * FROM LMS_DATA where Lead_id=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getLMSDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getPassedLMSDetails(value) {
    let data = [value];
    return this.database
      .executeSql(
        "SELECT * FROM LMS_DATA where Lead_id=? and passed_lead='1'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPassedLMSDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  get_LMS_Data() {
    return this.database
      .executeSql("SELECT * FROM LMS_DATA WHERE passed_lead='0'", [])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'get_LMS_Data',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  removeLMSData() {
    return this.database.executeSql('DELETE FROM LMS_DATA', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeLMSData',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  getLastLogin(action) {
    let data = [action];
    return this.database
      .executeSql('SELECT * FROM AUDIT_LOG WHERE action=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getLastLogin',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  forOfflineReLogin(uName, psw): Promise<any> {
    let parameters = [uName, this.globFunc.basicEnc(psw)];
    return this.database
      .executeSql(
        'select * from RESUBMIT_LOGIN_DETAILS where re_user_name = ? and re_password = ?',
        parameters,
      )
      .then((data) => {
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'forOfflineReLogin',
          'Retrieve Success',
          JSON.stringify(data),
        );
        return this.getAll(data);
      })
      .catch((err) => {
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'forOfflineReLogin',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        console.log(err);
      });
  }

  getNomList(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PERSONAL_DETAILS a LEFT OUTER JOIN ORIG_PERMANENT_ADDRESS_DETAILS b ON (b.id=a.id) WHERE a.refId=? AND a.id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getNomList',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getAllProductValues() {
    return this.database.executeSql('SELECT * FROM PRODUCT_MASTER', []).then(
      (data) => {
        return this.getAll(data);
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getAllProductValues',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  getProductValuesScheme(prdSchemeId) {
    return this.database
      .executeSql('SELECT * FROM PRODUCT_MASTER WHERE prdSchemeId=?', [
        prdSchemeId,
      ])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getProductValuesScheme',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  removeProduct() {
    return this.database.executeSql('DELETE FROM PRODUCT_MASTER', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeProduct',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }

  getOrganisation() {
    return this.database
      .executeSql('SELECT * FROM ORGANISATION_MASTER', [])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getOrganisation',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getOrganisationState(OrgBranchCode) {
    return this.database
      .executeSql('SELECT * FROM ORGANISATION_MASTER WHERE OrgBranchCode=?', [
        OrgBranchCode,
      ])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getOrganisationState',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  removeOrganisation() {
    return this.database.executeSql('DELETE FROM ORGANISATION_MASTER', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeOrganisation',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  InsertDocuments(doc) {
    let insertRows = [];
    doc.forEach((master) => {
      insertRows.push([
        'INSERT INTO DOCUMENT_TYPE_MASTER(DocRowID, DocPrdCode, DocDesc, DocType, DocID, EntityDocFlag) values (?,?,?,?,?,?)',
        [
          master.DocRowID,
          master.DocPrdCode,
          master.DocDesc,
          master.DocType,
          master.DocID,
          master.EntityDocFlag,
        ],
      ]);
    });
    return this.database.sqlBatch(insertRows).then(
      (result) => {
        return result;
      },
      (err) => {
        console.log(err, 'sqlbatch error');
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'InsertDocuments',
          'Insert Failure',
          JSON.stringify(err),
        );
      },
    );

    // let data = [doc.DocRowID, doc.DocPrdCode, doc.DocDesc, doc.DocType, doc.DocID, doc.EntityDocFlag];
    // return this.database.executeSql("INSERT INTO DOCUMENT_TYPE_MASTER(DocRowID, DocPrdCode, DocDesc, DocType, DocID, EntityDocFlag) values (?,?,?,?,?,?)", data).then(data => {
    //   return data;
    // }, err => {
    //   console.log('Error: ', err);
    //   this.addAuditTrail(moment(this.dateTime).format("YYYY-MM-DD HH:mm:ss"), "InsertDocuments", "Insert Failure", JSON.stringify(err));
    //   return [];
    // });
  }
  getDocuments() {
    return this.database
      .executeSql('SELECT * FROM DOCUMENT_TYPE_MASTER', [])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getDocuments',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getDocumentsByIndividualPrdCode(prdCode, EntityDocFlag) {
    return this.database
      .executeSql(
        'SELECT * FROM DOCUMENT_TYPE_MASTER WHERE DocPrdCode=? AND EntityDocFlag=?',
        [prdCode, EntityDocFlag],
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getDocumentsByIndividualPrdCode',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getDocumentsByPrdCode(prdCode) {
    return this.database
      .executeSql('SELECT * FROM DOCUMENT_TYPE_MASTER WHERE DocPrdCode=?', [
        prdCode,
      ])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getDocumentsByPrdCode',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getMandDocumentsByPrdCode(value) {
    if (value.EntityDocFlag == '') {
      let data = [value.DocPrdCode];
      return this.database
        .executeSql(
          "SELECT * FROM DOCUMENT_TYPE_MASTER WHERE DocPrdCode=? AND DocType='M'",
          data,
        )
        .then(
          (data) => {
            return this.getAll(data);
          },
          (err) => {
            console.log('Error: ', err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'getMandDocumentsByPrdCode',
              'Retrieve Failure',
              JSON.stringify(err),
            );
            return [];
          },
        );
    } else {
      let data = [value.DocPrdCode, value.EntityDocFlag];
      return this.database
        .executeSql(
          "SELECT * FROM DOCUMENT_TYPE_MASTER WHERE DocPrdCode=? AND EntityDocFlag=? AND DocType='M'",
          data,
        )
        .then(
          (data) => {
            return this.getAll(data);
          },
          (err) => {
            console.log('Error: ', err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'getMandDocumentsByPrdCode',
              'Retrieve Failure',
              JSON.stringify(err),
            );
            return [];
          },
        );
    }
  }
  removeDocuments() {
    return this.database
      .executeSql('DELETE FROM DOCUMENT_TYPE_MASTER', [])
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removeDocuments',
            'Delete Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getInterestRate(prdCode, IntType) {
    let data = [prdCode, IntType];
    return this.database
      .executeSql(
        'SELECT * FROM INTEREST_RATE_MASTER_DATA WHERE prdCode=? AND IntType=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getInterestRate',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  removeInterestRate() {
    return this.database
      .executeSql('DELETE FROM INTEREST_RATE_MASTER_DATA', [])
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removeInterestRate',
            'Delete Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getSelectedCity(stateCode) {
    let data = [stateCode];
    return this.database
      .executeSql(
        'SELECT * FROM STATE_CITY_MASTER WHERE stateCode=? ORDER BY cityName ASC',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSelectedCity',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getAllCityValues() {
    return this.database.executeSql('SELECT * FROM STATE_CITY_MASTER', []).then(
      (data) => {
        return this.getAll(data);
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getAllCityValues',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  getStateList() {
    return this.database
      .executeSql(
        'SELECT DISTINCT stateCode, stateName FROM STATE_CITY_MASTER ORDER BY stateName ASC',
        [],
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getStateList',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  removeStateCity() {
    return this.database.executeSql('DELETE FROM STATE_CITY_MASTER', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeStateCity',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }

  getDealerMasterData(orgCode) {
    return this.database
      .executeSql(
        "SELECT * FROM DEALER_MASTER WHERE dealerName !='' AND orgScode=?",
        [orgCode],
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getDealerMasterData',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getMasterDataUsingType(type) {
    return this.database
      .executeSql('SELECT * FROM COMMON_MASTER_DATA WHERE TYPE=?', [type])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getMasterDataUsingType',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getVehicleBrandMaster() {
    return this.database.executeSql('SELECT * FROM VEHICLEBRAND', []).then(
      (data) => {
        return this.getAll(data);
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getVehicleBrandMaster',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  removeAllMasterData(type) {
    return this.database
      .executeSql('DELETE FROM COMMON_MASTER_DATA WHERE TYPE=?', [type])
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removeAllMasterData',
            'Delete Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  removeAllDealerMasterData() {
    return this.database.executeSql('DELETE FROM DEALER_MASTER', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeAllDealerMasterData',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  removeAllScoreCardMasterData() {
    return this.database
      .executeSql('DELETE FROM VEHICLESCORECARDMASTER', [])
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removeAllScoreCardMasterData',
            'Delete Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  removeAllVehicleBrandMasters() {
    return this.database.executeSql('DELETE FROM VEHICLEBRAND', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeAllVehicleBrandMasters',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  removeAllVehicleModelMasters() {
    return this.database.executeSql('DELETE FROM VEHICLEMODEL', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeAllVehicleModelMasters',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  removeAllVehicleVariantMasters() {
    return this.database.executeSql('DELETE FROM VEHICLEVARIANT', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeAllVehicleVariantMasters',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  removeAllVehiclePricesMasters() {
    return this.database.executeSql('DELETE FROM VEHICLEPRICES', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeAllVehiclePricesMasters',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  removeAllVehicleWorkflowMasters() {
    return this.database.executeSql('DELETE FROM VEHICLEWORKFLOW', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeAllVehicleWorkflowMasters',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  checkProofDetails(promoIDType, id) {
    let data = [promoIDType, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PROOF_PROMOTER_DETAILS WHERE promoIDType=? and id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'checkProofDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  insertIdproofData(idNumber, idType, leadId) {
    if (idType == 'aadhaar') {
      let data = [idNumber, idType, leadId];
      return this.database
        .executeSql(
          'INSERT INTO PROOF_DETAILS(janaId, idType, leadId) values (?,?,?)',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('Error: ', err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertIdproofData',
              'Insert Failure',
              JSON.stringify(err),
            );
            return [];
          },
        );
    } else {
      let data = [idNumber, idType, leadId];
      return this.database
        .executeSql(
          'INSERT INTO PROOF_DETAILS(idNumber, idType, leadId) values (?,?,?)',
          data,
        )
        .then(
          (data) => {
            return data;
          },
          (err) => {
            console.log('Error: ', err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'insertIdproofData',
              'Insert Failure',
              JSON.stringify(err),
            );
            return [];
          },
        );
    }
  }

  getGivenKarzaDetails() {
    return this.database.executeSql('SELECT * FROM KARZA_DATA', []).then(
      (data) => {
        return this.getAll(data);
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getGivenKarzaDetails',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }

  getGivenKarzaDetailsByLeadid(leadId) {
    return this.database
      .executeSql('SELECT * FROM KARZA_DATA WHERE leadId=?', [leadId])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getGivenKarzaDetailsByLeadid',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getGivenSecondKarzaDetailsByLeadid(leadId, karzaCheck) {
    return this.database
      .executeSql('SELECT * FROM KARZA_DATA WHERE leadId=? AND karzaCheck=?', [
        leadId,
        karzaCheck,
      ])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getGivenSecondKarzaDetailsByLeadid',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getAllProductList() {
    return this.database.executeSql('SELECT * FROM PRODUCT_MASTER', []).then(
      (data) => {
        return this.getAll(data);
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getAllProductList',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }

  getAllDocumentsByRefid(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT DISTINCT * FROM ORIG_PERSONAL_DETAILS a LEFT OUTER JOIN ORIG_PROOF_PROMOTER_DETAILS b ON (a.id=b.id) LEFT OUTER JOIN ORIG_PROMOTER_PROOF_IMGS c ON (b.id=c.id) WHERE a.refId=? AND a.id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getAllDocumentsByRefid',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  InsertKarzaData(
    leadId,
    name,
    fathername,
    dob,
    idNumber,
    address1,
    address2,
    state,
    pincode,
    adrsType,
    gender,
    idType,
    idExpiry,
    karzaCheck?,
  ) {
    let data = [
      leadId,
      name,
      fathername,
      dob,
      this.globFunc.basicEnc(idNumber),
      this.globFunc.basicEnc(address1),
      this.globFunc.basicEnc(address2),
      this.globFunc.basicEnc(state),
      this.globFunc.basicEnc(pincode),
      adrsType,
      gender,
      idType,
      idExpiry,
      karzaCheck,
    ];
    return this.database
      .executeSql(
        'INSERT INTO KARZA_DATA(leadId, name, fathername, dob, idNumber, address1, address2, state, pincode, adrsType, gender, idType, idExpiry, karzaCheck) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'InsertKarzaData',
            'Insert Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getKarzaData(leadId, idType) {
    return this.database
      .executeSql('SELECT * FROM KARZA_DATA WHERE leadId=? AND idType=?', [
        leadId,
        idType,
      ])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getKarzaData',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  InsertEntityKarzaData(body) {
    let data = [
      body.leadId,
      body.entityName,
      body.entityId,
      body.proName,
      body.idType,
      body.gst,
      body.cin,
      body.tan,
      body.pan,
      body.proEmail,
      body.proPin,
      body.contact,
    ];
    return this.database
      .executeSql(
        'INSERT INTO ENTITY_KARZA_DATA(leadId, entityName, entityId, proName, idType, gst, cin, tan, pan, proEmail, proPin, contact) values (?,?,?,?,?,?,?,?,?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'InsertEntityKarzaData',
            'Insert Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getEntityKarzaData(leadId, idType) {
    return this.database
      .executeSql(
        'SELECT * FROM ENTITY_KARZA_DATA WHERE leadId=? AND idType=?',
        [leadId, idType],
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getEntityKarzaData',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getPersonalDetailsByLeadId(coAppGuaId) {
    let data = [coAppGuaId];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PERSONAL_DETAILS WHERE coAppGuaId=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPersonalDetailsByLeadId',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  addEntityDetails(
    refId,
    id,
    value,
    profPic,
    entiProfPic,
    applicantUniqueId,
    eapplType,
    custType,
    leadStatus,
    entId,
  ) {
    if (entId === '' || entId === undefined || entId === null) {
      let data = [
        refId,
        id,
        value.enterName,
        value.constitution,
        value.cin,
        value.regNo,
        value.gst,
        value.doi,
        value.busiVintage,
        value.ownership,
        value.industry,
        value.enterprise,
        profPic,
        entiProfPic,
        applicantUniqueId,
        eapplType,
        custType,
        leadStatus,
      ];
      return this.database
        .executeSql(
          'INSERT INTO ORIG_ENTITY_DETAILS(refId, id, enterName, constitution, cin, regNo, gst, doi, busiVintage, ownership, industry, enterprise, profPic, entiProfPic, applicantUniqueId, eapplType, custType, leadStatus) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          data,
        )
        .then(
          (data) => {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Entity Details Added Successfully',
            );
            return data;
          },
          (err) => {
            console.log('err: ' + err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addEntityDetails',
              'Insert Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    } else {
      let data = [
        refId,
        id,
        value.enterName,
        value.constitution,
        value.cin,
        value.regNo,
        value.gst,
        value.doi,
        value.busiVintage,
        value.ownership,
        value.industry,
        value.enterprise,
        profPic,
        leadStatus,
        entiProfPic,
        entId,
      ];
      return this.database
        .executeSql(
          'UPDATE ORIG_ENTITY_DETAILS SET refId=?, id=?, enterName=?, constitution=?, cin=?, regNo=?, gst=?, doi=?, busiVintage=?, ownership=?, industry=?, enterprise=?, profPic=?, leadStatus=?, entiProfPic=? WHERE entId=?',
          data,
        )
        .then(
          (data) => {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert(
              'Alert!',
              'Entity Details Updated Successfully',
            );
            return data;
          },
          (err) => {
            console.log('err: ' + err);
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'addEntityDetails',
              'Update Failure',
              JSON.stringify(err),
            );
            return err;
          },
        );
    }
  }

  getEntityDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_ENTITY_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getEntityDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getPersonalEntityDetails(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PERSONAL_DETAILS a LEFT OUTER JOIN ORIG_ENTITY_DETAILS b ON a.id=b.id WHERE a.refId=? AND a.id=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPersonalEntityDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  convertToString(value: [string]) {
    return Array.isArray(value) ? value.toString() : value;
  }
  addVehicleDetails(refId, id, value, assetAge) {
    const data = [
      refId,
      id,
      this.convertToString(value.brandName),
      this.convertToString(value.model),
      this.convertToString(value.variant),
      value.cc,
      value.onroadPrice,
      value.downpayment,
      value.dealerType,
      value.dealerIFSCcode,
      value.dealerBank,
      value.dealerCurAcc,
      value.dealerBranch,
      value.dealerAddress,
      value.insPolicyNo,
      value.insCompany,
      value.insDate,
      value.insExpDate,
      value.insValue,
      value.scheme,
      value.promoCode,
      value.rcNo,
      value.engineNo,
      value.chassisNo,
      value.yearOfMan,
      value.kmDriven,
      value.vehicleAge,
      value.dealerName,
      value.dealerCode,
      value.nomName,
      value.nomRel,
      value.nomDOB,
      value.nomGender,
      value.variant,
      value.registrationDate,
      value.dealerQuotation,
      value.obv,
      value.assetPrice,
      value.insuranceCover,
      value.hypothecation,
      value.noofOwner,
      assetAge,
      value.vehicleCatogery,
      value.nameAsPerRC,
      value.apiFlag,
    ];
    return this.database
      .executeSql(
        'INSERT INTO VEHICLE_DETAILS(refId, id, brandName, model,variant, cc, onroadPrice,downpayment,dealerType,dealerIFSCcode,dealerBank,dealerCurAcc,dealerBranch,dealerAddress,insPolicyNo,insCompany,insDate,insExpDate,insValue, scheme, promoCode, rcNo, engineNo, chassisNo, yearOfMan, kmDriven, vehicleAge, dealerName, dealerCode, nomName, nomRel, nomDOB, nomGender, variant, registrationDate, dealerQuotation, obv, assetPrice, insuranceCover, hypothecation, noofOwner, assetAge,vehicleCatogery,nameAsPerRC,apiFlag) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        data,
      )
      .then((data) => data)
      .catch((err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'addVehicleDetails',
          'Insert Failure',
          JSON.stringify(err),
        );
        return [];
      });
  }
  updateVehicleDetails(refId, id, vehicleId, value, assetAge) {
    const data = [
      refId,
      id,
      this.convertToString(value.brandName),
      this.convertToString(value.model),
      this.convertToString(value.variant),
      value.cc,
      value.onroadPrice,
      value.downpayment,
      value.dealerType,
      value.dealerIFSCcode,
      value.dealerBank,
      value.dealerCurAcc,
      value.dealerBranch,
      value.dealerAddress,
      value.insPolicyNo,
      value.insCompany,
      value.insDate,
      value.insExpDate,
      value.insValue,
      value.scheme,
      value.promoCode,
      value.rcNo,
      value.engineNo,
      value.chassisNo,
      value.yearOfMan,
      value.kmDriven,
      value.vehicleAge,
      value.dealerName,
      value.dealerCode,
      value.nomName,
      value.nomRel,
      value.nomDOB,
      value.nomGender,
      value.variant,
      value.registrationDate,
      value.dealerQuotation,
      value.obv,
      value.assetPrice,
      value.insuranceCover,
      value.hypothecation,
      value.noofOwner,
      assetAge,
      value.vehicleCatogery,
      value.nameAsPerRC,
      value.apiFlag,
      vehicleId,
    ];
    return this.database
      .executeSql(
        'UPDATE VEHICLE_DETAILS SET refId =?, id =?, brandName =?, model =?,variant=?, cc =?, onroadPrice =?,downpayment =?,dealerType =?,dealerIFSCcode =?,dealerBank =?,dealerCurAcc=?,dealerBranch =?,dealerAddress =?,insPolicyNo =?,insCompany =?,insDate =?,insExpDate =?,insValue =?, scheme =?, promoCode =?, rcNo =?, engineNo =?, chassisNo =?, yearOfMan =?, kmDriven =?, vehicleAge =?, dealerName =?, dealerCode =?, nomName =?, nomRel =?, nomDOB =?, nomGender =?, variant=?, registrationDate=?, dealerQuotation=?, obv=?, assetPrice=?, insuranceCover=?, hypothecation=?, noofOwner=?, assetAge=?, vehicleCatogery=?, nameAsPerRC=?, apiFlag=? WHERE vehicleId=?',
        data,
      )
      .catch((err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'updateVehicleDetails',
          'Update Failure',
          JSON.stringify(err),
        );
        return [];
      });
  }
  insertVerifiedPosidex(
    refId,
    id,
    userType,
    verifiedFlag,
    matchCust,
    rewRemarks,
    existCust,
    urnNo,
    propNo,
    custId,
  ) {
    const data = [
      refId,
      id,
      userType,
      verifiedFlag,
      matchCust,
      rewRemarks,
      existCust,
      urnNo,
      propNo,
      custId,
    ];
    return this.database
      .executeSql(
        'INSERT INTO POSIDEXCHECK(refId,id, userType, verified, matchedCustomerDetails,newCustomerRemarks, existCust, urnNo, propNo, custId) VALUES (?,?,?,?,?,?,?,?,?,?)',
        data,
      )
      .then((data) => data)
      .catch((err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'insertVerifiedPosidex',
          'Insert Failure',
          JSON.stringify(err),
        );
        return [];
      });
  }
  updatePosidexAMLDetails(refId, id, amlstat, userType, amlFlag) {
    const data = [amlFlag, amlstat, refId, userType, id];
    return this.database
      .executeSql(
        'UPDATE POSIDEXCHECK SET amlCheck =?, amlStatus=? WHERE refId =? and userType =? and id=?',
        data,
      )
      .catch((err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'updatePosidexAMLDetails',
          'Update Failure',
          JSON.stringify(err),
        );
        return [];
      });
  }
  updatePosidexCBSDetails(refId, id, cbsstat, userType, cbsFlag) {
    const data = [cbsFlag, cbsstat, refId, userType, id];
    return this.database
      .executeSql(
        'UPDATE POSIDEXCHECK SET cbsCheck =?,cbsStatus=? WHERE refId =? and userType =? and id=?',
        data,
      )
      .catch((err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'updatePosidexCBSDetails',
          'Update Failure',
          JSON.stringify(err),
        );
        return [];
      });
  }
  getPosidexDetails(refId, userType, id?) {
    if (id) {
      return this.database
        .executeSql(
          'SELECT * FROM POSIDEXCHECK WHERE refId=? and userType=? and id=?',
          [refId, userType, id],
        )
        .then((data) => this.getAll(data))
        .catch((err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPosidexDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        });
    } else {
      return this.database
        .executeSql('SELECT * FROM POSIDEXCHECK WHERE refId=? and userType=?', [
          refId,
          userType,
        ])
        .then((data) => this.getAll(data))
        .catch((err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPosidexDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return err;
        });
    }
  }
  getApplicantPosidexDetails(refId) {
    return this.database
      .executeSql("SELECT * FROM POSIDEXCHECK WHERE refId=? and userType='A'", [
        refId,
      ])
      .then((data) => this.getAll(data))
      .catch((err) => {
        console.log('err: ' + JSON.stringify(err));
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getApplicantPosidexDetails',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return err;
      });
  }
  getVehicleDetails(refId, id) {
    return this.database
      .executeSql('SELECT * FROM VEHICLE_DETAILS WHERE refId=? AND id=?', [
        refId,
        id,
      ])
      .then((data) => {
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getVehicleDetails',
          'Retrieve Sucess',
          JSON.stringify(data),
        );
        return this.getAll(data);
      })
      .catch((err) => {
        console.log('err: ' + JSON.stringify(err));
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getVehicleDetails',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return err;
      });
  }
  getVehicleAndAddress(refId, id) {
    return this.database
      .executeSql(
        'SELECT * FROM VEHICLE_DETAILS v LEFT OUTER JOIN ORIG_PERMANENT_ADDRESS_DETAILS a ON (v.refId=a.refId) AND (v.id=a.id) WHERE v.refId=? AND v.id=?',
        [refId, id],
      )
      .then((data) => this.getAll(data))
      .catch((err) => {
        console.log('err: ' + JSON.stringify(err));
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getVehicleAndAddress',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return err;
      });
  }
  getSubmitDataDetailsCibil(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_APP_DETAILS a LEFT OUTER JOIN ORIG_BASIC_DETAILS b ON (b.id=a.id) LEFT OUTER JOIN ORIG_PERSONAL_DETAILS c ON (c.id=b.id) LEFT OUTER JOIN ORIG_PERMANENT_ADDRESS_DETAILS d ON (d.id=c.id) LEFT OUTER JOIN ORIG_PRESENT_ADDRESS_DETAILS e ON (e.id=d.id) LEFT OUTER JOIN ORIG_SOURCING_DETAILS f ON (f.id=e.id) WHERE c.refId=? AND c.userType='A'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmitDataDetailsCibil',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getApplicantDataAfterSubmit(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_APP_DETAILS a LEFT OUTER JOIN ORIG_BASIC_DETAILS b ON (b.id=a.id) LEFT OUTER JOIN ORIG_PERSONAL_DETAILS c ON (c.id=b.id) LEFT OUTER JOIN SUBMIT_STATUS d ON (d.id=c.id) WHERE c.refId=? AND c.userType='A'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getApplicantDataAfterSubmit',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getApplicantDataforPostSanction(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_APP_DETAILS a LEFT OUTER JOIN ORIG_BASIC_DETAILS b ON (b.id=a.id) LEFT OUTER JOIN ORIG_PERSONAL_DETAILS c ON (c.id=b.id) LEFT OUTER JOIN SUBMIT_STATUS d ON (d.id=c.id) LEFT OUTER JOIN VEHICLE_DETAILS e ON (e.id=d.id) WHERE c.refId=? AND c.userType='A'",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getApplicantDataforPostSanction',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getCoApplicantDataAfterSubmit(refId) {
    let data = [refId];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_PERSONAL_DETAILS a LEFT OUTER JOIN SUBMIT_STATUS b ON (b.id=a.id) WHERE a.userType='C' AND a.refId=?",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getCoApplicantDataAfterSubmit',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getCoApplicantBasedOnId(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        "SELECT * FROM ORIG_PERSONAL_DETAILS a LEFT OUTER JOIN SUBMIT_STATUS b ON (b.id=a.id) WHERE a.userType='C' AND a.refId=? AND a.id=?",
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getCoApplicantBasedOnId',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getUserIDLoginDetails(user_name) {
    let data = [this.globFunc.basicEnc(user_name)];
    return this.database
      .executeSql('SELECT * FROM LOGIN_DETAILS WHERE userID=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getUserIDLoginDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getDocNumberFromPersonalDetails(coAppGuaId, docName) {
    let data = [coAppGuaId, docName];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PERSONAL_DETAILS WHERE coAppGuaId=? and docName=?',
        data,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getDocNumberFromPersonalDetails',
            'Retrieve Success',
            JSON.stringify(data),
          );
          return this.getAll(data);
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getDocNumberFromPersonalDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', err);
          return [];
        },
      );
  }
  getModelBasedonBrand(makeId) {
    let data = [makeId];
    return this.database
      .executeSql('SELECT * FROM VEHICLEMODEL WHERE makeId=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getModelBasedonBrand',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getVariantBasedonModel(modelId) {
    let data = [modelId];
    return this.database
      .executeSql('SELECT * FROM VEHICLEVARIANT WHERE modelId=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getVariantBasedonModel',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getPriceBasedonVariant(variantId) {
    let data = [variantId];
    return this.database
      .executeSql('SELECT * FROM VEHICLEPRICES WHERE variantId=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPriceBasedonVariant',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getVehicleScoreMaster() {
    return this.database
      .executeSql('SELECT * FROM VEHICLESCORECARDMASTER', [])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getVehicleScoreMaster',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  addScoreCard(
    refId,
    checked,
    lookalikeScore,
    ltvScore,
    answers,
    AutoApprovalFlag,
    FIFLAG,
    SRFLAG,
    STPFLAG,
    NTCFLAG,
    manualApp = 'N',
  ) {
    let data = [
      refId,
      checked,
      lookalikeScore,
      ltvScore,
      answers,
      AutoApprovalFlag,
      FIFLAG,
      SRFLAG,
      STPFLAG,
      NTCFLAG,
      manualApp,
    ];
    return this.database
      .executeSql(
        'INSERT INTO SCORECARD(refId, checked, lookalikeScore, ltvScore, answers,AutoApprovalFlag,FIFLAG, SRFLAG, STPFLAG, NTCFLAG,manualApp) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'addScoreCard',
            'Insert Sucess',
            JSON.stringify(data),
          );
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'addScoreCard',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  updateScoreCard(
    refId,
    scoreId,
    checked,
    lookalikeScore,
    ltvScore,
    answers,
    AutoApprovalFlag,
    FIFLAG,
    SRFLAG,
    STPFLAG,
    NTCFLAG,
  ) {
    const data = [
      refId,
      checked,
      lookalikeScore,
      ltvScore,
      answers,
      AutoApprovalFlag,
      FIFLAG,
      SRFLAG,
      STPFLAG,
      NTCFLAG,
      scoreId,
    ];
    return this.database
      .executeSql(
        'UPDATE SCORECARD SET refId =?, checked =?, lookalikeScore =?,ltvScore=?, answers =?,AutoApprovalFlag=?,FIFLAG=?,SRFLAG=?,STPFLAG=?,NTCFLAG=? WHERE refId =? AND scoreId=?',
        data,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateScoreCard',
            'Insert Sucess',
            JSON.stringify(data),
          );
          return data;
        },
        (err) => {
          console.log('err: ScoreUpdate' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateScoreCard',
            'Update Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  updateScoreCardinPostsanction(checked, refId, scoreId) {
    const data = [checked, refId, scoreId];
    return this.database
      .executeSql(
        'UPDATE SCORECARD SET checked =? WHERE refId =? AND scoreId=?',
        data,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateScoreCardinPostsanction',
            'Insert Sucess',
            JSON.stringify(data),
          );
          return data;
        },
        (err) => {
          console.log('err: ScoreUpdate' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateScoreCardinPostsanction',
            'Update Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  updateScoreCardinPostsanctionWhileQuit(checked, refId) {
    const data = [checked, refId];
    return this.database
      .executeSql('UPDATE SCORECARD SET checked =? WHERE refId =?', data)
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateScoreCardinPostsanctionWhileQuit',
            'Insert Sucess',
            JSON.stringify(data),
          );
          return data;
        },
        (err) => {
          console.log('err: ScoreUpdate' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateScoreCardinPostsanctionWhileQuit',
            'Update Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getScoreCard(refId) {
    return this.database
      .executeSql('SELECT * FROM SCORECARD WHERE refId=?', [refId])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getScoreCard',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getProductValuesCount(prdCode) {
    return this.database
      .executeSql('SELECT * FROM PRODUCT_MASTER WHERE prdCode=?', [prdCode])
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getProductValuesCount',
            'Retrieve Success',
            JSON.stringify(data),
          );
          return this.getAll(data);
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getProductValuesCount',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', err);
          return [];
        },
      );
  }
  getJanarefSourcingDetails(refId, userType) {
    let data = [refId, userType];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_SOURCING_DETAILS WHERE refId=? AND userType=?',
        data,
      )
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getJanarefSourcingDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getAadharNum(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT janaRefId, vaultStatus FROM ORIG_BASIC_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getAadharNum',
            'Retrieve Success',
            JSON.stringify(data),
          );
          return this.getAll(data);
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getAadharNum',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', JSON.stringify(err));
          return [];
        },
      );
  }
  getEKYCDetails(leadId) {
    let data = [leadId];
    return this.database
      .executeSql('SELECT * FROM EKYC_RESPONSE WHERE leadId=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getEKYCDetails',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  insertPddDetailsSave(refId, id, value, desc, uploadFlag) {
    let data = [refId, id, value.docType, desc, value.remarks, uploadFlag];
    return this.database
      .executeSql(
        'INSERT INTO PDD_DOCUMENT_DETAILS(refId, id, docType, docDescription, remarks, uploadFlag) VALUES (?,?,?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'insertPddDetailsSave',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getPddDetailsSave(refId, id, docValue) {
    let data = [refId, id, docValue];
    return this.database
      .executeSql(
        'SELECT * FROM PDD_DOCUMENT_DETAILS WHERE refId=? AND id=? and docType=?',
        data,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getSubmitedOtherDocs',
            'Retrieve Success',
            JSON.stringify(data),
          );
          return this.getAll(data);
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getPddDetailsSave',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', err);
          return err;
        },
      );
  }
  removePddDocImages(refId, id, doc) {
    let data = [refId, id, doc];
    return this.database
      .executeSql(
        'DELETE FROM PDD_DOCUMENT_IMAGES WHERE refId=? and id=? and docType=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removePddDocImages',
            'Delete Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  addPddDocImages(refId, id, doc, pddDocImgs) {
    let data = [refId, id, doc, pddDocImgs];
    return this.database
      .executeSql(
        'INSERT INTO PDD_DOCUMENT_IMAGES (refId,id,docType,pddDocImgs) VALUES (?,?,?,?)',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'addPddDocImages',
            'Insert Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }
  getPddDocImages(refId, id, doc): Promise<any> {
    let parameters = [refId, id, doc];
    return this.database
      .executeSql(
        'select * from PDD_DOCUMENT_IMAGES where refId=? and id=? and docType=?',
        parameters,
      )
      .then((data) => {
        return this.getAll(data);
      })
      .catch((err) => {
        console.log(err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getPddDocImages',
          'Retrieve Failure',
          JSON.stringify(err),
        );
      });
  }
  deletePddSavedDetailsFromDb(refId, id, docVal) {
    let ids = [refId, id, docVal];
    return (
      this.database.executeSql(
        'DELETE FROM PDD_DOCUMENT_DETAILS WHERE refId=? AND id=? AND docType=?',
        ids,
      ),
      this.database
        .executeSql(
          'DELETE FROM PDD_DOCUMENT_IMAGES WHERE refId=? AND id=? AND docType=?',
          ids,
        )
        .then(
          (data) => {
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'PDD_DOCUMENT_DETAILS PDD_DOCUMENT_IMAGES',
              'Delete Success',
              JSON.stringify(data),
            );
            this.alertService.showAlert(
              'Alert!',
              'PDD_Document Deleted Successfully',
            );
            return data;
          },
          (err) => {
            this.addAuditTrail(
              moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              'deletePddSavedDetailsFromDb',
              'Delete Failure',
              JSON.stringify(err),
            );
            console.log('Error: ', err);
            return err;
          },
        )
    );
  }

  getPddDetailsFromDd(refId, id): Promise<any> {
    let data = [refId, id];
    return this.database
      .executeSql(
        'SELECT * FROM PDD_DOCUMENT_DETAILS WHERE refId=? AND id=?',
        data,
      )
      .then((data) => {
        return this.getAll(data);
      })
      .catch((err) => {
        console.log(err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getPddDetailsFromDd',
          'Retrieve Failure',
          JSON.stringify(err),
        );
      });
  }
  getPddUploadImgFromDb(refId, id): Promise<any> {
    let data = [refId, id];
    return this.database
      .executeSql(
        'select * from PDD_DOCUMENT_IMAGES where refId=? and id=?',
        data,
      )
      .then((data) => {
        return this.getAll(data);
      })
      .catch((err) => {
        console.log(err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getPddUploadImgFromDb',
          'Retrieve Failure',
          JSON.stringify(err),
        );
      });
  }
  updatePddUpload(refId, id, uploadFlag) {
    const data = [uploadFlag, refId, id];
    return this.database
      .executeSql(
        'UPDATE PDD_DOCUMENT_DETAILS SET uploadFlag=? WHERE refId=? and id=?',
        data,
      )
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'updatePddUpload',
          'Update Failure',
          JSON.stringify(err),
        );
        return [];
      });
  }
  removeAllDocumentsVehicle(types) {
    return this.database
      .executeSql('DELETE FROM Documents_Vehicle WHERE TYPES=?', [types])
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removeAllDocumentsVehicle',
            'Delete Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getDocumentsVehicle(types) {
    return this.database
      .executeSql('SELECT * FROM Documents_Vehicle WHERE TYPES=?', [types])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getDocumentsVehicle',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getVehicleApproval(user) {
    let data = ['AR'];
    return this.database
      .executeSql('SELECT * FROM VEHICLEWORKFLOW WHERE flowLevel=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getVehicleApproval',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  getVehicleWorkflowList(user) {
    let data = [user];
    return this.database
      .executeSql('SELECT * FROM VEHICLEWORKFLOW WHERE flowDesc=?', data)
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getVehicleWorkflowList',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  updateFIstatus(appNo, status) {
    let data = [
      status,
      appNo,
      this.globFunc.basicDec(localStorage.getItem('username')),
    ];
    return this.database
      .executeSql(
        'UPDATE SUBMIT_STATUS SET underFI=? WHERE applicationNumber=? and createdUser=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateFIstatus',
            'Update Failure',
            JSON.stringify(err),
          );
          console.log('err: ' + JSON.stringify(err));
          return err;
        },
      );
  }
  updateAfterPostSanction(refId, id) {
    let data = [refId, id];
    return this.database
      .executeSql(
        "UPDATE SUBMIT_STATUS SET autoApproval='0',fromGroupInbox='Y',postSanction='0' WHERE refId=? AND id=?",
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateAfterPostSanction',
            'Update Failure',
            JSON.stringify(err),
          );
          console.log('err: ' + JSON.stringify(err));
          return err;
        },
      );
  }
  clearScoreCardDetails(refId) {
    return this.database
      .executeSql('DELETE FROM SCORECARD WHERE refId=?', [refId])
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'clearScoreCardDetails',
            'Delete Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }
  updateFieldInvestigationFlag(refId, id, fieldInsFlag, manualStatus) {
    const data = [fieldInsFlag, manualStatus, refId, id];
    return this.database
      .executeSql(
        'UPDATE FIELDINSPECTION SET fieldInsFlag=?,manualStatus=? WHERE refId=? and id=?',
        data,
      )
      .then(
        (data) => {
          return data;
        },
        (err) => {
          console.log('err: ' + JSON.stringify(err));
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'updateFieldInvestigationFlag',
            'Update Failure',
            JSON.stringify(err),
          );
          return err;
        },
      );
  }

  removeAllProcessingFees() {
    return this.database.executeSql('DELETE FROM PROCESSING_FEES', []).then(
      (data) => {
        return data;
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'removeAllProcessingFees',
          'Delete Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  insertAllProcessingFees(masters): Promise<any> {
    let insertRows = [];
    masters.forEach((master) => {
      insertRows.push([
        'INSERT INTO PROCESSING_FEES(amtFrom,amtTo,minProcessingFee,maxProcessingFee,prodId,proPercentage) values (?,?,?,?,?,?)',
        [
          master.amtFrom,
          master.amtTo,
          master.minProcessingFee,
          master.maxProcessingFee,
          master.prodId,
          master.percentage,
        ],
      ]);
    });
    return this.database.sqlBatch(insertRows).then(
      (result) => {
        return result;
      },
      (err) => {
        console.log(err, 'sqlbatch error');
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'insertAllProcessingFees',
          'Insert Failure',
          JSON.stringify(err),
        );
      },
    );
  }

  getProcessingFees() {
    return this.database.executeSql('SELECT * FROM PROCESSING_FEES', []).then(
      (data) => {
        return this.getAll(data);
      },
      (err) => {
        console.log('Error: ', err);
        this.addAuditTrail(
          moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          'getProcessingFees',
          'Retrieve Failure',
          JSON.stringify(err),
        );
        return [];
      },
    );
  }
  getUserGroupsNameBasedOnId(UserGroup) {
    return this.database
      .executeSql('SELECT * FROM VEHICLEWORKFLOW WHERE UserGroup=?', [
        UserGroup,
      ])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getUserGroupsNameBasedOnId',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  duplicateAadharCheck(refId, promoIDRef) {
    let data = [refId, promoIDRef];
    return this.database
      .executeSql(
        'SELECT * FROM ORIG_PROOF_PROMOTER_DETAILS WHERE refId=? AND promoIDRef=?',
        data,
      )
      .then(
        (data) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'ORIG_PROOF_PROMOTER_DETAILS',
            'Retrieve Success',
            JSON.stringify(data),
          );
          return this.getAll(data);
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'ORIG_PROOF_PROMOTER_DETAILS',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', JSON.stringify(err));
          return [];
        },
      );
  }

  getGivenExistingCustomerData(ExistURN) {
    return this.database
      .executeSql('SELECT * FROM EXISTING_CUSTOMER_DATA WHERE Urnno=?', [
        ExistURN,
      ])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'getGivenExistingCustomerData',
            'Retrieve Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  getApplicationVersionCheck() {
    return this.database
      .executeSql('SELECT * FROM  APPLICATION_VERSION_CHECK', [])
      .then(
        (data) => {
          return this.getAll(data);
        },
        (err) => {
          console.log('Error: ', err);
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'Retrieve',
            'select Failure',
            JSON.stringify(err),
          );
          return [];
        },
      );
  }

  insertApplicationVersionCheck(appDate) {
    let value = [appDate];
    return this.database
      .executeSql('DELETE FROM APPLICATION_VERSION_CHECK', [])
      .then((del) => {
        return this.database
          .executeSql(
            'INSERT INTO APPLICATION_VERSION_CHECK (AppDate) VALUES (?)',
            value,
          )
          .then(
            (data) => {
              return data;
            },
            (err) => {
              console.log('Error: ', err);
              this.addAuditTrail(
                moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
                'insertApplicationVersionCheck',
                'Insert Failure',
                JSON.stringify(err),
              );
              return err;
            },
          );
      });
  }

  removeKarzaData(leadId) {
    return this.database
      .executeSql('DELETE FROM KARZA_DATA where leadId=?', [leadId])
      .then(
        (data) => {
          // this.addAuditTrail(moment(this.dateTime).format("YYYY-MM-DD HH:mm:ss"), "removeSourcingIdName", "Delete Success", JSON.stringify(data));
          return data;
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removeSourcingIdName',
            'Delete Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', err);
          return [];
        },
      );
  }

  removeEkycData(leadId) {
    return this.database
      .executeSql('DELETE FROM EKYC_RESPONSE where leadId=?', [leadId])
      .then(
        (data) => {
          // this.addAuditTrail(moment(this.dateTime).format("YYYY-MM-DD HH:mm:ss"), "removeSourcingIdName", "Delete Success", JSON.stringify(data));
          return data;
        },
        (err) => {
          this.addAuditTrail(
            moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss'),
            'removeSourcingIdName',
            'Delete Failure',
            JSON.stringify(err),
          );
          console.log('Error: ', err);
          return [];
        },
      );
  }

  alterQuery() {
    console.log('alterQuery triggred');
    this.database
      .executeSql('SELECT aepsFlag FROM ORIG_PROOF_PROMOTER_DETAILS', [])
      .then(
        (org) => {
          return org;
        },
        (err) => {
          if (err.code == 5) {
            this.database.executeSql(
              'ALTER TABLE ORIG_PROOF_PROMOTER_DETAILS ADD COLUMN aepsFlag TEXT',
              [],
            );
          }
        },
      );
    //   this.database.executeSql("SELECT lsoFlag FROM VEHICLE_DETAILS", []).then(org => {
    //     return org;
    //   }, err => {
    //     if (err.code == 5) {
    //       this.database.executeSql("ALTER TABLE VEHICLE_DETAILS ADD COLUMN lsoFlag TEXT DEFAULT 'N'", []);
    //     }
    //   })
    //   this.database.executeSql("SELECT lsoFlag FROM ORIG_POST_SANCTION", []).then(org => {
    //     return org;
    //   }, err => {
    //     if (err.code == 5) {
    //       this.database.executeSql("ALTER TABLE ORIG_POST_SANCTION ADD COLUMN lsoFlag TEXT DEFAULT 'N'", []);
    //     }
    //   })
  }
}
