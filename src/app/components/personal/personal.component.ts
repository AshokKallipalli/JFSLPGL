import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
} from '@ionic/angular';
import isMatch from 'date-fns/isMatch';
import { Subscription } from 'rxjs';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';
import { ProofComponent } from '../proof/proof.component';
import { environment } from 'src/environments/environment';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
})
export class PersonalComponent implements OnInit {
  relationsList: any = [];
  customerType: any;
  titles: any;
  individual: boolean = true;
  maxAge: string;
  PANCheckStatus: string = 'N';

  panHide: boolean = false;
  aadharHide: boolean = false;

  lmsLeadId: any;
  leadcreated: any;
  leadreference: any;
  LMSDetails: any;
  @ViewChild(ProofComponent)
  private ProofComponent: ProofComponent;

  panform60: any;
  maxdate: string;
  mindate: string;
  minAge: any;
  todayDate: any = new Date();

  cibilCheckStat: any;
  guacibilCheckStat: any;
  submitStat: any;
  guasubmitStat: any;
  applicationStatus: any;

  caste_master: any;
  edu_master: any;
  emp_master: any = [];
  mari_master: any = [];
  org_master: any;
  rel_master: any;
  job_master: any;
  coAppGuaId: any;
  applType: any;
  custType: any;
  leadStatus: any;
  OTPNUM: any;
  enteredOTP: any;
  aadharNum: any;

  refId: any;
  grefId: any;
  id: any;
  perId: any;
  profPic: any;
  userType: any;
  dummyusertype: any;
  mobNum: any;
  applicationNumber: any;
  otpValue = 'GET OTP';

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  panCheck: boolean = true;
  form60Check: boolean = false;
  submitDisable: boolean = false;
  disablePan: boolean = false;
  disableFORM60: boolean;
  dbValue: boolean = true;

  docName: any;
  docShow: boolean = true;
  docValue: any;
  genderList: any = [];
  pdt_master: any = [];
  residenceStatus: any = [];
  public form60Proofs = [
    {
      code: 'VOTER',
      name: 'Voter Id',
    },
    {
      code: 'DRIV',
      name: 'Driving Licence',
    },
    {
      code: 'PASS',
      name: 'Passport',
    },
  ];

  docType: any;

  getPersonalData: any;

  getGuaValues: any;
  panResult: any;

  personalData: FormGroup;
  applicantDetails: FormGroup;
  genderSelect: any;
  panNumber: any;
  userValues: any;

  refinfo: any;
  verifiedMobNum: any = false;

  parsedValues: any;
  qrdata: any;
  firstname: any;
  middlename: any;
  lastname: any;
  aadhar: any;
  fathername: any;
  dobyear: any;
  dobmonth: any;
  dobdate: any;
  dob: any;

  address1: any;
  district: any;
  pc: any;
  state: any;
  address2: any;
  city: any;
  village: any;
  otpCount = 0;

  selectOptions = {
    cssClass: 'remove-ok',
  };

  otpUrl: any;
  panUrl: any;
  urlType: any;
  otpResult = undefined;
  ageExperiance: number = 1;
  otpstatus: string = 'NO';
  mobDisable: boolean = false;
  exCNameDisable: boolean = false;

  @Output() saveStatus = new EventEmitter();
  @Output() clearvalue = new EventEmitter();
  yesOrNo: any = [
    { code: 'Y', name: 'YES' },
    { code: 'N', name: 'NO' },
  ];
  dummyLangMaster: any = [];
  // { code: "1", name: "English" },
  // { code: "2", name: "Hindi" },
  // { code: "3", name: "Marathi" },
  // { code: "4", name: "Tamil" },
  // { code: "5", name: "Telugu" },
  // { code: "6", name: "Kannada" },
  // { code: "7", name: "Gujarati" },
  // { code: "8", name: "Bengali" },

  dummyBussiness: any = [
    // { CODE: "1", NAME: "Type 1" },
    // { CODE: "2", NAME: "Type 2" },
    // { CODE: "3", NAME: "Type 3" },
    // { CODE: "4", NAME: "Type 4" }
  ];
  vinOfServMaster: any = [
    { CODE: '1', NAME: '1 to 2 ' },
    { CODE: '2', NAME: '2 to 5' },
    { CODE: '3', NAME: '>5' },
  ];
  karzaData: any;
  idType: any;
  idNumber: any;
  leadId: any;
  isMarried = false;
  isSalaried = false;
  isJanaEmp = false;
  isSelfEmp = false;
  disableCoApp = false;
  coAppNeedList = [
    { CODE: 'Y', NAME: 'Yes' },
    { CODE: 'N', NAME: 'No' },
  ];
  formActivater = { disableForm: true };
  pagename = 'Personal Details';
  janaEmp: string;
  janaEmpSription: Subscription;
  today: any = new Date();
  getEkycData: any;

  firstNameDisable: boolean = false;
  lastNameDisable: boolean = false;

  disableFatherName: boolean = false;
  dobDisable: boolean = false;
  disableGender: boolean = false;

  annualIncomeMaster: any = [];
  ShowAadharDob: boolean = false;
  disableAadharDOB: boolean = false;

  ekyc: any;

  aadharIdProofTypes = [
    { code: 'Pan', name: 'Pan' },
    { code: 'Voter ID', name: 'Voter ID' },
    { code: 'Passport', name: 'Passport' },
    { code: 'Driving License', name: 'Driving License' },
  ];

  panName: any;
  panValidation: any;
  nameValidation: any;
  DOBValidation: any;
  seedingStatus: any;

  isNameAsPerEkyc = false;
  existAather: any;
  getexistAather: any;
  ExCusData: any[];
  upiVerify: boolean = false;
  naveParamsValue: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public alertCtrl: AlertController,
    public globalData: DataPassingProviderService,
    public http: HTTP,
    public activateRoute: ActivatedRoute,
    // public viewCtrl: ViewController,
    public loadCtrl: LoadingController,
    public network: Network,
    public master: RestService,
    public sqlSupport: SquliteSupportProviderService,
    public globFunc: GlobalService,
    public alertService: CustomAlertControlService
  ) {
    this.activateRoute.queryParamMap.subscribe((data: any) => {
      this.naveParamsValue = data.params;
      this.childConstructor(this.naveParamsValue);
    });
  }

  private childConstructor(value) {
    this.calldate();
    this.age21();
    this.janaEmpSription = this.globFunc.JanaEmployee.subscribe((data) => {
      console.log(data, 'janaemployee');
      this.janaEmp = data;
    });
    this.docType = 'panDoc';
    this.customerType = this.globalData.getCustomerType();
    this.leadStatus = this.naveParamsValue.leadStatus;
    this.leadId = this.naveParamsValue.leadId;
    console.log(this.customerType, 'customer type in personal details');
    if (this.naveParamsValue.aadhar) {
      this.idType = JSON.parse(this.naveParamsValue.aadhar);
      this.idNumber = this.naveParamsValue.idNumber;
    } else if (this.naveParamsValue.passport) {
      this.idType = JSON.parse(this.naveParamsValue.passport);
    } else if (this.naveParamsValue.licence) {
      this.idType = JSON.parse(this.naveParamsValue.licence);
    } else if (this.naveParamsValue.voter) {
      this.idType = JSON.parse(this.naveParamsValue.voter);
    } else if (this.naveParamsValue.pan) {
      this.idType = JSON.parse(this.naveParamsValue.pan);
    } else if (this.naveParamsValue.nonIndividual) {
      this.idType = JSON.parse(this.naveParamsValue.nonIndividual);
    } else {
      this.idType = '';
    }

    this.getEkycData = this.naveParamsValue.ekycData
      ? JSON.parse(this.naveParamsValue.ekycData)
      : '';
    this.ekyc = this.naveParamsValue.ekyc;
    this.existAather = this.naveParamsValue.existAather;
    this.getexistAather = this.naveParamsValue.getExistAather;

    this.getTitles();
    this.getProductValue();
    this.getEducationValue();
    this.getCasteValue();
    this.getEmploymentValue();
    this.getMaritalStatusValue();
    this.getReligionValue();
    this.getGenderList();
    // this.getJobTypeValue();
    this.getCibilCheckedDetails();
    this.getPreferredLanguage();
    this.getResStatus();
    this.getNatureofBussiness();
    this.getVintageofService();
    this.getAnnualIncome();

    this.urlType = this.master.patch;
    this.userType = this.globalData.getborrowerType();
    this.custType = this.globalData.getCustType();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.perId = this.globalData.getgId();

    if (this.naveParamsValue.usergtype) {
      this.perId = this.globalData.getgId();
    }

    if (this.naveParamsValue.appRefValue) {
      this.refinfo = JSON.parse(this.naveParamsValue.appRefValue);
      this.refId = this.refinfo.refId;
      this.globalData.setrefId(this.refId);
      this.id = this.refinfo.id;
      this.globalData.setId(this.id);
      if (this.refinfo.lmsLeadId != '') {
        this.lmsLeadId = this.refinfo.lmsLeadId;
        this.getlmsData();
      }
    }

    if (this.naveParamsValue.grefId) {
      this.refId = this.naveParamsValue.grefId;
    }
    // this.applicantDetails = this.formBuilder.group({
    this.applicantDetails = this.formBuilder.group({
      genTitle: ['', Validators.required],
      firstname: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      middlename: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
        ]),
      ],
      lastname: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      fathername: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      mothername: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      dobAadhar: [''],
      dobDocument: [''],
      dob: ['', Validators.required],
      marital: ['', Validators.required],
      spouseName: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
        ]),
      ],
      gender: ['', Validators.required],
      mobNum: [
        '',
        Validators.compose([
          Validators.maxLength(10),
          Validators.pattern('[0-9]{10}$'),
          Validators.required,
        ]),
      ],
      altMobNum: [
        '',
        Validators.compose([
          Validators.maxLength(10),
          Validators.pattern('[0-9]{10}$'),
        ]),
      ],
      panAvailable: ['', Validators.required],
      panNum: [''],
      form60: [''],
      employment: ['', Validators.required], //Validators.required
      employerName: [''],
      employeeId: [''],
      designation: [''],
      joinDate: [''],
      monthSalary: [''],
      lmName: [''],
      lmEmail: [''],
      experience: [''],
      bussName: [''],
      actDetail: [''],
      monthIncome: [''],
      vinOfServ: [''],
      annualIncome: ['', Validators.required],
      caste: ['', Validators.required],
      religion: ['', Validators.required],
      languages: ['', Validators.required],
      resciStatus: ['', Validators.required],
      education: ['', Validators.required],
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '^[A-Z0-9a-z\\._%+-]+@([A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$'
          ),
        ]),
      ],
      coAppFlag: [''], //have to handle for coapplicant
      nameEkyc: [''],
      upiNo: ['', Validators.pattern('^[0-9A-Za-z.-]{2,256}@[A-Za-z]{2,64}$')],
      nameupi: [''],
      vpa: ['', Validators.required],
    });

    this.karzaDataFetch();
    this.EkycDataFetch();
    this.clearCoAppValidation();
    let datedob = this.applicantDetails.get('dob').value;
    this.joiningMinDate(datedob);
    this.joiningMaxDate();

    if (this.naveParamsValue.lmsData) {
      this.LMSDetails = this.naveParamsValue.lmsData;
      this.personalData = this.formBuilder.group({
        genTitle: ['', Validators.required],
        firstname: [
          this.LMSDetails.promoter_fname,
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ]),
        ],
        lastname: [
          this.LMSDetails.promoter_lname,
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ]),
        ],
        fathername: [
          '',
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ]),
        ],
        constitution: [''],
        mothername: [
          '',
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ]),
        ],
        dobAadhar: '',
        dobDocument: '',
        dob: ['', Validators.required],
        gender: ['', Validators.required],
        marital: ['', Validators.required],
        aadharNum: [
          '',
          Validators.compose([
            Validators.maxLength(12),
            Validators.pattern('[0-9]{12}'),
          ]),
        ],
        panNum: '',
        docName: '',
        docValue: '',
        mobNum: [
          this.LMSDetails.mobile_number,
          Validators.compose([
            Validators.maxLength(10),
            Validators.pattern('[0-9]{10}$'),
            Validators.required,
          ]),
        ],
        enteredOTP: '',
        employment: ['', Validators.required], // Validators.required
        annualIncome: ['', Validators.required],
        experience: ['', Validators.required],
        caste: ['', Validators.required],
        religion: ['', Validators.required],
        education: ['', Validators.required],
        email: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern(
              '^[A-Z0-9a-z\\._%+-]+@([A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$'
            ),
          ]),
        ],
        vpa: ['', Validators.required],
      });
      this.leadcreated = this.LMSDetails.created_by;
      this.leadreference = this.LMSDetails.reference_id;
    } else {
      this.personalData = this.formBuilder.group({
        genTitle: ['', Validators.required],
        firstname: [
          '',
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ]),
        ],
        lastname: [
          '',
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ]),
        ],
        fathername: [
          '',
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ]),
        ],
        constitution: [''],
        mothername: [
          '',
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ]),
        ],
        dobAadhar: '',
        dobDocument: '',
        dob: ['', Validators.required],
        gender: ['', Validators.required],
        marital: ['', Validators.required],
        aadharNum: [
          '',
          Validators.compose([
            Validators.maxLength(12),
            Validators.pattern('[0-9]{12}'),
          ]),
        ],
        panNum: '',
        docName: '',
        docValue: '',
        mobNum: [
          '',
          Validators.compose([
            Validators.maxLength(10),
            Validators.pattern('[0-9]{10}$'),
            Validators.required,
          ]),
        ],
        enteredOTP: '',
        employment: ['', Validators.required], // Validators.required
        experience: ['', Validators.required],
        annualIncome: ['', Validators.required],
        caste: ['', Validators.required],
        religion: ['', Validators.required],
        education: ['', Validators.required],
        email: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern(
              '^[A-Z0-9a-z\\._%+-]+@([A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$'
            ),
          ]),
        ],
        vpa: ['', Validators.required],
      });

      if (!this.naveParamsValue.pan) {
        this.sqliteProvider
          .getGivenKarzaDetailsByLeadid(this.leadId)
          .then((value) => {
            console.log(value);
            if (value.length) {
              let idType = value.find((val) => val.idType == 'pan');
              if (idType) {
                this.applicantDetails.controls.panAvailable.setValue('Y');
                this.panAvailabilityChecking('Y');
                this.applicantDetails.controls.panNum.setValue(
                  this.globFunc.basicDec(idType.idNumber)
                );
                this.panNumber = this.globFunc.basicDec(idType.idNumber);
                this.disablePan = true;
              }
            }
          })
          .catch((err) => err);
      }
    }

    this.updateExCusData();

    if (this.refId === '' || this.refId === undefined || this.refId === null) {
      this.refId = '';
    } else {
      this.getPersonalDetails();
    }

    if (this.naveParamsValue.userType) {
      this.userType = this.naveParamsValue.userType;
      this.dummyusertype = this.naveParamsValue.userType;
    } else {
      this.userType = '';
    }
    console.log(this.userType, 'usertype in personal details');
    if (this.naveParamsValue.fieldDisable) {
      this.submitDisable = true;
    }

    this.applicantDetails.get('marital').valueChanges.subscribe((val) => {
      if (val == '1') {
        this.isMarried = true;
      } else {
        this.isMarried = false;
      }
    });
    this.applicantDetails.get('dob').valueChanges.subscribe((val) => {
      //   let dt = new Date();
      // var diff = dt.getTime() - new Date(val).getTime();
      // let age = +Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
      // if(age>18 && age <=21 || age>60){
      //   this.applicantDetails.get('coAppFlag').setValue('Y');
      //   this.disableCoApp = true;
      // }
      // else{
      //   let employment = this.applicantDetails.get('employment').value;
      //   if(employment && employment == '16'){
      //     this.applicantDetails.get('coAppFlag').setValue('Y');
      //   this.disableCoApp = true;
      //   }else{
      //     this.applicantDetails.get('coAppFlag').setValue('');
      //     this.disableCoApp = false;
      //   }
      // }
      //console.log(age,"Ageaaa");
      console.log(val);
      this.coAppCheck();
      this.joiningMinDate(val);
      this.joiningMaxDate();
    });

    this.applicantDetails.get('employment').valueChanges.subscribe((value) => {
      console.log(value);
      this.coAppCheck();
    });

    // this.applicantDetails.get('employment').valueChanges.subscribe(val => {
    //   if (val == "01") {
    //     this.isSelfEmp = false;
    //     this.isSalaried = true;
    //   } else if (val == "02" || val == "03") {
    //     this.isSelfEmp = true;
    //     this.isSalaried = false;
    //   }else if(val == "16"){
    //     this.applicantDetails.get('coAppFlag').setValue('Y');
    //     this.disableCoApp = true;
    //   }
    //   else {
    //     this.isSalaried = false;
    //     this.isSelfEmp = false;
    //   }
    // })
    //need to add jana employee
    //require validation
    // this.applicantDetails.valueChanges.subscribe(() => {
    //   // console.log(this.QDEIndividualDemoGraphic);
    //   if (this.applicantDetails.pristine == false) {
    //     if (this.applicantDetails.status === "INVALID") {
    //       this.formActivater.disableForm = true;
    //       this.globFunc.setapplicationDataChangeDetector('modified', this.pagename);
    //     } else {
    //       this.formActivater.disableForm = false;
    //       this.globFunc.setapplicationDataChangeDetector('modified', this.pagename);
    //     }
    //   }
    // })
    this.karzaPanDataFetch();
    console.log(
      `UserT : ${this.userType} , CustT : ${this.custType} , CustomerT : ${this.customerType}, refId : ${this.refId} , id : ${this.id}`
    );
  }

  coAppCheck() {
    this.sqliteProvider
      .getBasicDetails(this.refId, this.id)
      .then((items) => {
        let scheme = this.getJanaProductCode(items[0].janaLoan);

        let dob = this.applicantDetails.get('dob').value;
        let emp = this.applicantDetails.get('employment').value;
        let dt = new Date();
        var diff = dt.getTime() - new Date(dob).getTime();
        let findAge = +(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
        let age;
        if (findAge > 23 && findAge < 26) age = Math.ceil(findAge);
        else if (findAge > 17.5 && findAge < 18) age = Math.ceil(findAge);
        else age = Math.floor(findAge);
        if (
          (age >= 18 && age < 23) ||
          age >= 60 ||
          emp == '4' ||
          emp == '5' ||
          emp == '6'
        ) {
          this.applicantDetails.get('coAppFlag').setValue('Y');
          this.disableCoApp = true;
        } else if (scheme == '1052' && ((age >= 18 && age < 25) || age >= 60)) {
          this.applicantDetails.get('coAppFlag').setValue('Y');
          this.disableCoApp = true;
        } else {
          this.disableCoApp = false;
          this.applicantDetails.get('coAppFlag').setValue('');
          this.applicantDetails.get('coAppFlag').updateValueAndValidity();
        }
      })
      .catch((err) => console.log(`coAppCheck PersonalDetails Page ${err}`));
  }

  joiningMinDate(val) {
    console.log(val);
    let dd = val.split('-')[2];
    let mm = val.split('-')[1];
    let yyyy = +val.split('-')[0] + 18;
    let mindate = yyyy + '-' + mm + '-' + dd;
    this.mindate = mindate;
  }

  joiningMaxDate() {
    let dd = this.today.getDate();
    let mm = this.today.getMonth() + 1; //January is 0!
    let yyyy = this.today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    let maxdate = yyyy + '-' + mm + '-' + dd;
    this.maxdate = maxdate;
  }

  clearCoAppValidation() {
    if (this.userType === 'C') {
      this.applicantDetails.get('coAppFlag').clearValidators();
      this.applicantDetails.get('coAppFlag').updateValueAndValidity();
    }
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

  updateExCusData() {
    // this.applicantDetails.controls.panNum.clearValidators();
    if (this.custType == 'E') {
      let urn = this.globalData.getURN();
      console.log('EXT URN is ', urn);
      this.sqliteProvider.selectExData(urn).then((data) => {
        let format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        this.ExCusData = data;
        if (format.test(data[0].AppFirstName)) {
          console.log('true');
          this.applicantDetails.controls.firstname.setValue(
            data[0].AppFirstName ? data[0].AppFirstName : ''
          );
        } else {
          console.log('false');
          this.applicantDetails.controls.firstname.setValue(
            data[0].AppFirstName ? data[0].AppFirstName : ''
          );
        }
        if (format.test(data[0].AppLastName)) {
          console.log('true');
          this.applicantDetails.controls.lastname.setValue(
            data[0].AppLastName ? data[0].AppLastName : ''
          );
        } else {
          console.log('false');
          this.applicantDetails.controls.lastname.setValue(
            data[0].AppLastName ? data[0].AppLastName : ''
          );
        }

        // this.applicantDetails.controls.aadharNum.setValue(data[0].Aadhar);

        if (data[0].IdProof == 'PAN') {
          this.applicantDetails.controls.panAvailable.setValue('Y');
          this.panAvailabilityChecking('Y');
          this.applicantDetails.controls.panNum.setValue(
            this.globFunc.basicDec(data[0].IdProofValue)
          );
          this.applicantDetails.controls.panNum.updateValueAndValidity();
        } else if (data[0].PanNum != undefined || null || '') {
          this.applicantDetails.controls.panAvailable.setValue('Y');
          this.panAvailabilityChecking('Y');
          this.applicantDetails.controls.panNum.setValue(
            this.globFunc.basicDec(data[0].PanNum)
          );
          this.applicantDetails.controls.panNum.updateValueAndValidity();
        }

        // this.applicantDetails.controls.panNum.setValue(this.globFunc.basicDec(data[0].PanNum) ? this.globFunc.basicDec(data[0].PanNum) : "");
        this.applicantDetails.controls.mobNum.setValue(
          this.globFunc.basicDec(data[0].Mobile)
            ? this.globFunc.basicDec(data[0].Mobile)
            : ''
        );
        this.applicantDetails.controls.dob.setValue(
          data[0].DOB
            ? data[0].DOB.substring(0, 2) +
                '-' +
                data[0].DOB.substring(3, 5) +
                '-' +
                data[0].DOB.substring(6, 10)
            : ''
        );
        this.applicantDetails.controls.fathername.setValue(
          data[0].FatherName ? data[0].FatherName : ''
        );
        // this.applicantDetails.controls.mothername.setValue(data[0].MotherName ? data[0].MotherName: "");
        this.applicantDetails.controls.marital.setValue(
          data[0].MaritalStatus ? data[0].MaritalStatus : ''
        );
        // this.applicantDetails.controls.spousename.setValue(data[0].FatherOrSpouse);
        this.applicantDetails.controls.gender.setValue(
          data[0].Gndr ? data[0].Gndr : ''
        );
        // this.applicantDetails.controls.education.setValue(data[0].Education ? data[0].Education : "");
        this.applicantDetails.controls.email.setValue(
          this.globFunc.basicDec(data[0].Email)
            ? this.globFunc.basicDec(data[0].Email)
            : ''
        );

        if (this.existAather) {
          this.isNameAsPerEkyc = true;
          let EkycData;
          let EkycFname;
          if (this.ekyc != 'OTP') {
            EkycData = this.getexistAather.KycRes.UidData.Poi;
            EkycFname = this.getexistAather.KycRes.UidData.Poa;
          }
          let aadharName = this.naveParamsValue.aadharName;
          let nameAsPerEkyc;
          if (aadharName) {
            nameAsPerEkyc = `${aadharName.name ? aadharName.name : ''} ${
              aadharName.lastname ? aadharName.lastname : ''
            }`;
            this.applicantDetails.controls.nameEkyc.setValue(nameAsPerEkyc);
          } else {
            this.applicantDetails.controls.nameEkyc.setValue(EkycData.name);
          }
        }
      });
    }
  }

  setFilteredItems(panNumber) {
    if (this.userType == 'G' || this.userType == 'C') {
      this.panNumber = panNumber.toUpperCase();
      this.panResult = undefined;
      if (this.personalData.controls['panNum'].valid) {
        this.personalData.get('aadharNum').clearValidators();
        this.personalData
          .get('aadharNum')
          .setValidators(
            Validators.compose([
              Validators.maxLength(12),
              Validators.minLength(12),
              Validators.pattern('[0-9]{12}'),
            ])
          );
        // this.personalData.get('aadharNum').setValue("");
        this.personalData.get('docName').clearValidators();
        this.personalData.get('docName').setValue('');
        this.personalData.get('docValue').clearValidators();
        this.personalData.get('docValue').setValue('');
        this.aadharHide = true;
        this.panHide = false;
      }
    } else {
      this.panNumber = panNumber.toUpperCase();
      this.panResult = undefined;
      // this.personalData.get('aadharNum').clearValidators();
      // this.personalData.get('aadharNum').setValidators(Validators.compose([Validators.maxLength(12), Validators.minLength(12), Validators.pattern('[0-9]{12}')]));
      this.personalData
        .get('panNum')
        .setValidators(
          Validators.compose([
            Validators.maxLength(10),
            Validators.minLength(10),
            Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
            Validators.required,
          ])
        );
      // this.personalData.get('aadharNum').setValue("");
      this.personalData.get('docName').clearValidators();
      this.personalData.get('docName').setValue('');
      this.personalData.get('docValue').clearValidators();
      this.personalData.get('docValue').setValue('');
    }
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  panChecker(value, flag) {
    this.userType = this.globalData.getborrowerType();
    if (value === 'panCheck') {
      this.form60Check = false;
      this.panCheck = true;
      if (this.userType == 'A') {
        this.personalData
          .get('panNum')
          .setValidators(
            Validators.compose([
              Validators.maxLength(10),
              Validators.minLength(10),
              Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
              Validators.required,
            ])
          );
        this.personalData.get('docName').clearValidators();
        this.personalData.get('docName').updateValueAndValidity();
        this.personalData.get('docValue').clearValidators();
        // this.personalData.get('docValue').setValue('');
        this.personalData.get('docValue').updateValueAndValidity();
      }
      if (this.userType == 'G') {
        if (this.perId == '' || this.perId == null || this.perId == undefined) {
          this.personalData
            .get('panNum')
            .setValidators(
              Validators.compose([
                Validators.maxLength(10),
                Validators.minLength(10),
                Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
              ])
            );
        } else {
          this.personalData
            .get('panNum')
            .setValidators(
              Validators.compose([
                Validators.maxLength(10),
                Validators.minLength(10),
                Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
              ])
            );
        }
        this.personalData.get('docName').clearValidators();
        this.personalData.get('docName').updateValueAndValidity();
        this.personalData.get('docValue').clearValidators();
        this.personalData.get('docValue').updateValueAndValidity();
      }
    } else if (value === 'form60Check') {
      this.form60Check = true;
      this.panCheck = false;
      this.personalData.get('panNum').clearValidators();
      this.personalData.get('panNum').updateValueAndValidity();
      if (this.userType == 'A') {
        this.personalData
          .get('docName')
          .setValidators(Validators.compose([Validators.required]));
        this.personalData.get('docName').setValue('VOTER');
        this.personalData
          .get('docValue')
          .setValidators(Validators.compose([Validators.required]));
      }
      if (this.dbValue) {
        if (this.userType == 'A') {
          this.personalData
            .get('docName')
            .setValidators(Validators.compose([Validators.required]));
          this.personalData.get('docName').setValue('VOTER');
          this.personalData
            .get('docValue')
            .setValidators(Validators.compose([Validators.required]));
        } else {
          this.personalData.get('docName').clearValidators();
          this.personalData.get('docName').setValue('VOTER');
          this.personalData.get('docValue').clearValidators();
        }
      }
    }
  }

  uppercase() {
    this.docValue = this.docValue.toUpperCase();
  }

  setDocvalidator(value, flag) {
    if (this.userType == 'A') {
      this.personalData
        .get('docName')
        .setValidators(Validators.compose([Validators.required]));
      if (value == 'VOTER') {
        this.personalData
          .get('docValue')
          .setValidators(Validators.compose([Validators.required]));
        this.personalData.get('docValue').updateValueAndValidity();
      } else if (value == 'DRIV') {
        this.personalData
          .get('docValue')
          .setValidators(Validators.compose([Validators.required]));
      } else if (value == 'PASS') {
        this.personalData
          .get('docValue')
          .setValidators(
            Validators.compose([
              Validators.maxLength(8),
              Validators.minLength(8),
              Validators.pattern(/^[a-zA-Z]{1}[0-9]{7}$/),
              Validators.required,
            ])
          );
      } else {
        console.log('no data recived for set doc validator');
      }
      if (flag == 'Y') {
        this.personalData.get('docValue').setValue('');
      }
    } else {
      this.personalData.get('docName').clearValidators();
      if (value == 'VOTER') {
        this.personalData.get('docValue').clearValidators();
        this.personalData.get('docValue').updateValueAndValidity();
      } else if (value == 'DRIV') {
        this.personalData.get('docValue').clearValidators();
      } else if (value == 'PASS') {
        this.personalData
          .get('docValue')
          .setValidators(
            Validators.compose([
              Validators.maxLength(8),
              Validators.minLength(8),
              Validators.pattern(/^[a-zA-Z]{1}[0-9]{7}$/),
            ])
          );
      } else {
        console.log('no data recived for set doc validator');
      }
      if (flag == 'Y') {
        this.personalData.get('docValue').setValue('');
      }
    }
  }

  personalSaveCheck(value) {
    let custType = this.globalData.getCustomerType();
    if (custType == '1') {
      let saveStatus = localStorage.getItem('Sourcing');
      if (saveStatus == 'sourcingSaved') {
        this.personalsave(value);
      } else {
        this.globalData.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'Must Save Sourcing Details!');
      }
    } else {
      let saveStatus = localStorage.getItem('entity');
      if (saveStatus == 'entitySaved') {
        this.personalsave(value);
      } else {
        this.globalData.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'Must Save Entity Details!');
      }
    }
  }

  personalsave(value) {
    this.globalData.globalLodingPresent('Please wait...');
    let saveStatus = localStorage.getItem('Sourcing');
    this.globalData.setAdhaarNum(this.aadharNum);
    this.globalData.setPanNum(this.panNumber);
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.leadStatus = 'offline';
    } else {
      this.leadStatus = 'online';
    }
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();
    this.profPic = this.globalData.getProfileImage();
    this.userType = this.globalData.getborrowerType();
    let currentDob = value.dob.split('-');
    let currentYear = this.todayDate.getFullYear();
    let calculatedYear = currentYear - +currentDob[0];
    if (calculatedYear < 21) {
      this.globalData.globalLodingDismiss();
      this.alertService.showAlert(
        'Alert!',
        'The Customer Age should not be less than 21 years'
      );
    } else {
      if (this.profPic) {
        let URNnumber = this.globalData.getURN();

        if (this.userType == 'G') {
          if (this.perId) {
            this.sqliteProvider
              .updatePesonalDetails(
                this.refId,
                this.id,
                URNnumber,
                this.customerType,
                value,
                this.profPic,
                this.perId
              )
              .then((data) => {
                this.saveStatus.emit('personalTick');
                localStorage.setItem('Personal', 'personalSaved');
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Guarantor Details Updated Successfully'
                );
                this.formActivater.disableForm = true;
                this.globFunc.setapplicationDataChangeDetector(
                  'saved',
                  this.pagename
                );
              })
              .catch((Error) => {
                this.globalData.globalLodingDismiss();
                console.log(Error);
                this.alertService.showAlert('Alert!', 'Failed!');
              });
          } else {
            this.coAppGuaId = this.leadId;
            this.applType = 'g';
            this.guacibilCheckStat = 0;
            this.guasubmitStat = 0;
            this.applicationNumber = 0;
            this.applicationStatus = 'Not';

            if (this.idType == 'aadhaar') {
              this.sqliteProvider.insertIdproofData(
                this.idNumber,
                this.idType,
                this.leadId
              );
            } else {
              this.sqliteProvider.insertIdproofData(
                this.idType.idNumber,
                this.idType.type,
                this.leadId
              );
            }
            this.sqliteProvider.insertSubmitDetails(
              this.refId,
              this.id,
              this.guacibilCheckStat,
              this.guasubmitStat,
              this.applicationNumber,
              this.applicationStatus,
              'G',
              '0',
              '0'
            );
            this.sqliteProvider
              .addPersonalDetails(
                this.refId,
                this.id,
                URNnumber,
                this.customerType,
                value,
                this.profPic,
                this.userType,
                this.coAppGuaId,
                this.applType,
                this.custType,
                this.leadStatus,
                this.firstNameDisable ? 'Y' : 'N',
                this.lastNameDisable ? 'Y' : 'N',
                this.disableFatherName ? 'Y' : 'N',
                this.dobDisable ? 'Y' : 'N',
                this.disableGender ? 'Y' : 'N',
                this.isNameAsPerEkyc ? 'Y' : 'N',
                this.ShowAadharDob ? 'Y' : 'N',
                this.disablePan ? 'Y' : 'N',
                this.panName,
                this.panValidation,
                this.nameValidation,
                this.DOBValidation,
                this.seedingStatus
              )
              .then((data) => {
                this.perId = data.insertId;
                this.saveStatus.emit('personalTick');
                // this.globalData.setEditSaveStatus("personalSaved");
                localStorage.setItem('Personal', 'personalSaved');
                this.globalData.globalLodingDismiss();
                localStorage.setItem('leadId', this.coAppGuaId);
                this.alertService.showAlert(
                  'Alert!',
                  'Guarantor Details Added Successfully'
                );
                this.formActivater.disableForm = true;
                this.globFunc.setapplicationDataChangeDetector(
                  'saved',
                  this.pagename
                );
                this.sqliteProvider.updateCoAppFlag(this.refId, this.id);
              })
              .catch((Error) => {
                this.globalData.globalLodingDismiss();
                console.log(Error);
                this.alertService.showAlert('Alert!', 'Failed!');
              });
          }
        } else if (this.userType == 'C') {
          if (this.perId) {
            this.sqliteProvider
              .updatePesonalDetails(
                this.refId,
                this.id,
                URNnumber,
                this.customerType,
                value,
                this.profPic,
                this.perId
              )
              .then((data) => {
                this.saveStatus.emit('personalTick');
                localStorage.setItem('Personal', 'personalSaved');
                this.globalData.globalLodingDismiss();
                this.alertService.showAlert(
                  'Alert!',
                  'Co-Applicant Details Updated Successfully'
                );
                this.formActivater.disableForm = true;
                this.globFunc.setapplicationDataChangeDetector(
                  'saved',
                  this.pagename
                );
              })
              .catch((Error) => {
                this.globalData.globalLodingDismiss();
                console.log(Error);
                this.alertService.showAlert('Alert!', 'Failed!');
              });
          } else {
            this.coAppGuaId = this.leadId;
            this.applType = 'c';
            this.guacibilCheckStat = 0;
            this.guasubmitStat = 0;
            this.applicationNumber = 0;
            this.applicationStatus = 'Not';
            if (this.idType == 'aadhaar') {
              this.sqliteProvider.insertIdproofData(
                this.idNumber,
                this.idType,
                this.leadId
              );
            } else {
              this.sqliteProvider.insertIdproofData(
                this.idType.idNumber,
                this.idType.type,
                this.leadId
              );
            }
            this.sqliteProvider.insertSubmitDetails(
              this.refId,
              this.id,
              this.guacibilCheckStat,
              this.guasubmitStat,
              this.applicationNumber,
              this.applicationStatus,
              'C',
              '0',
              '0'
            );
            this.sqliteProvider
              .addPersonalDetails(
                this.refId,
                this.id,
                URNnumber,
                this.customerType,
                value,
                this.profPic,
                this.userType,
                this.coAppGuaId,
                this.applType,
                this.custType,
                this.leadStatus,
                this.firstNameDisable ? 'Y' : 'N',
                this.lastNameDisable ? 'Y' : 'N',
                this.disableFatherName ? 'Y' : 'N',
                this.dobDisable ? 'Y' : 'N',
                this.disableGender ? 'Y' : 'N',
                this.isNameAsPerEkyc ? 'Y' : 'N',
                this.ShowAadharDob ? 'Y' : 'N',
                this.disablePan ? 'Y' : 'N',
                this.panName,
                this.panValidation,
                this.nameValidation,
                this.DOBValidation,
                this.seedingStatus
              )
              .then((data) => {
                this.perId = data.insertId;
                this.saveStatus.emit('personalTick');
                // this.globalData.setEditSaveStatus("personalSaved");
                localStorage.setItem('Personal', 'personalSaved');
                this.globalData.globalLodingDismiss();
                localStorage.setItem('leadId', this.coAppGuaId);
                this.alertService.showAlert(
                  'Alert!',
                  'Co-Applicant Details Added Successfully'
                );
                this.formActivater.disableForm = true;
                this.globFunc.setapplicationDataChangeDetector(
                  'saved',
                  this.pagename
                );
                this.sqliteProvider.updateCoAppFlag(this.refId, this.id);
              })
              .catch((Error) => {
                this.globalData.globalLodingDismiss();
                console.log(Error);
                this.alertService.showAlert('Alert!', 'Failed!');
              });
          }
        } else {
          if (this.perId) {
            this.sqliteProvider
              .updatePesonalDetails(
                this.refId,
                this.id,
                URNnumber,
                this.customerType,
                value,
                this.profPic,
                this.perId
              )
              .then((data) => {
                // (value.coAppFlag == 'Y') ? this.sqliteProvider.updateCoAppFlag(this.refId,this.id) : '';
                this.saveStatus.emit('personalTick');
                // if((value.aadharNum != "" && value.aadharNum != undefined && value.aadharNum != null) || (value.panNum != "" && value.panNum != undefined && value.panNum != null)){
                // this.panadProofupdate(value.aadharNum, value.panNum, value.docName, value.docValue);
                // }
                // this.globalData.setEditSaveStatus("personalSaved");
                this.sqliteProvider
                  .getPersonalDetails(this.refId, this.id)
                  .then((data) => {
                    if (data.length > 0) {
                      // localStorage.setItem('leadId', this.coAppGuaId);
                      localStorage.setItem('leadId', data[0].coAppGuaId);
                    }
                  });
                localStorage.setItem('Personal', 'personalSaved');
                this.globalData.globalLodingDismiss();
                if (this.customerType == '2' && this.userType == 'A') {
                  this.alertService.showAlert(
                    'Alert!',
                    'Promoter Details Updated Successfully'
                  );
                  this.formActivater.disableForm = true;
                  this.globFunc.setapplicationDataChangeDetector(
                    'saved',
                    this.pagename
                  );
                } else {
                  this.alertService.showAlert(
                    'Alert!',
                    'Applicant Details Updated Successfully'
                  );
                  this.formActivater.disableForm = true;
                  this.globFunc.setapplicationDataChangeDetector(
                    'saved',
                    this.pagename
                  );
                }
              })
              .catch((Error) => {
                this.globalData.globalLodingDismiss();
                console.log(Error);
                this.alertService.showAlert('Alert!', 'Failed!');
              });
          } else {
            if (this.navParams.get('lmsData')) {
              this.coAppGuaId = this.LMSDetails.Lead_id;
            } else {
              this.coAppGuaId = this.leadId;
            }
            this.applType = 'a';
            this.guacibilCheckStat = 0;
            this.guasubmitStat = 0;
            this.applicationNumber = 0;
            this.applicationStatus = 'Not';
            this.custType = this.globalData.getCustType();

            this.sqliteProvider.insertSubmitDetails(
              this.refId,
              this.id,
              this.guacibilCheckStat,
              this.guasubmitStat,
              this.applicationNumber,
              this.applicationStatus,
              'A',
              '0',
              '0'
            );
            this.sqliteProvider
              .addPersonalDetails(
                this.refId,
                this.id,
                URNnumber,
                this.customerType,
                value,
                this.profPic,
                this.userType,
                this.coAppGuaId,
                this.applType,
                this.custType,
                this.leadStatus,
                this.firstNameDisable ? 'Y' : 'N',
                this.lastNameDisable ? 'Y' : 'N',
                this.disableFatherName ? 'Y' : 'N',
                this.dobDisable ? 'Y' : 'N',
                this.disableGender ? 'Y' : 'N',
                this.isNameAsPerEkyc ? 'Y' : 'N',
                this.ShowAadharDob ? 'Y' : 'N',
                this.disablePan ? 'Y' : 'N',
                this.panName,
                this.panValidation,
                this.nameValidation,
                this.DOBValidation,
                this.seedingStatus
              )
              .then((data) => {
                //  (value.coAppFlag == 'Y') ? this.sqliteProvider.updateCoAppFlag(this.refId,this.id) : '';
                this.perId = data.insertId;
                this.saveStatus.emit('personalTick');
                // this.globalData.setEditSaveStatus("personalSaved");
                localStorage.setItem('Personal', 'personalSaved');
                this.globalData.globalLodingDismiss();
                localStorage.setItem('leadId', this.coAppGuaId);
                if (this.customerType == '2' && this.userType == 'A') {
                  this.alertService.showAlert(
                    'Alert!',
                    'Promoter Details Added Successfully'
                  );
                  this.formActivater.disableForm = true;
                  this.globFunc.setapplicationDataChangeDetector(
                    'saved',
                    this.pagename
                  );
                } else {
                  this.alertService.showAlert(
                    'Alert!',
                    'Applicant Details Added Successfully'
                  );
                  this.formActivater.disableForm = true;
                  this.globFunc.setapplicationDataChangeDetector(
                    'saved',
                    this.pagename
                  );
                }
                this.sqliteProvider.updatePassedLMSData('1', this.coAppGuaId);
              })
              .catch((Error) => {
                this.globalData.globalLodingDismiss();
                console.log(Error);
                this.alertService.showAlert('Alert!', 'Failed!');
              });
          }
        }

        if (this.applicantDetails.controls.panAvailable.value == 'Y') {
          this.sqlSupport
            .getAfterBasicPromoterProof(
              this.refId,
              this.id,
              '1556814',
              'PAN CARD'
            )
            .then((data) => {
              if (data.length > 0) {
                this.sqlSupport.updateAfterBasicProof(
                  this.applicantDetails.controls.panNum.value,
                  this.refId,
                  this.id,
                  '1556814',
                  'PAN CARD'
                );
              }
            });
        } else {
          this.sqlSupport.removeAfterBasicProof(
            this.refId,
            this.id,
            '1556814',
            'PAN CARD'
          );
        }
      } else {
        this.globalData.globalLodingDismiss();
        this.alertService.showAlert(
          'Alert!',
          'Must Capture the Profile Image!'
        );
      }
    }

    // } else {
    //   this.globalData.globalLodingDismiss();
    //   this.alertService.showAlert("Alert!", "Must Save Sourcing Details!");
    // }
  }

  getPersonalDetails() {
    this.sqliteProvider
      .getJanarefSourcingDetails(this.refId, 'A')
      .then((data) => {
        if (data.length > 0) {
          this.janaEmp = data[0].janaEmployee;
        }
      })
      .then((data) => {
        this.id = this.globalData.getId();
        this.sqliteProvider
          .getPersonalDetails(this.refId, this.id)
          .then((data) => {
            if (data.length > 0) {
              this.getPersonalData = data;
              this.userType = this.getPersonalData[0].userType;

              if (
                this.getPersonalData[0].employment == '1' &&
                (this.janaEmp != '1' || this.userType == 'C')
              ) {
                this.isSelfEmp = false;
                this.isSalaried = true;
                this.isJanaEmp = false;
              } else if (this.getPersonalData[0].employment == '2') {
                this.isSelfEmp = true;
                this.isSalaried = false;
                this.isJanaEmp = false;
              } else if (
                this.getPersonalData[0].employment == '1' &&
                this.janaEmp == '1' &&
                this.userType == 'A'
              ) {
                this.isSalaried = true;
                this.isJanaEmp = true;
                this.isSelfEmp = false;
              } else {
                this.isSelfEmp = false;
                this.isSalaried = false;
                this.isJanaEmp = false;
              }

              this.applicantDetails.controls.genTitle.setValue(
                this.getPersonalData[0].genTitle
              );
              this.applicantDetails.controls.firstname.setValue(
                this.getPersonalData[0].firstname
              );
              this.applicantDetails.controls.middlename.setValue(
                this.getPersonalData[0].middlename
              );
              this.applicantDetails.controls.lastname.setValue(
                this.getPersonalData[0].lastname
              );
              this.applicantDetails.controls.fathername.setValue(
                this.getPersonalData[0].fathername
              );
              this.applicantDetails.controls.spouseName.setValue(
                this.getPersonalData[0].spouseName
              );
              this.applicantDetails.controls.dob.setValue(
                this.getPersonalData[0].dob
              );
              this.applicantDetails.controls.dobAadhar.setValue(
                this.getPersonalData[0].dobAadhar
              );
              this.applicantDetails.controls.dobDocument.setValue(
                this.getPersonalData[0].dobDocument
              );
              this.applicantDetails.controls.marital.setValue(
                this.getPersonalData[0].marital
              );
              this.applicantDetails.controls.gender.setValue(
                this.getPersonalData[0].gender
              );
              this.applicantDetails.controls.mobNum.setValue(
                this.globFunc.basicDec(this.getPersonalData[0].mobNum)
              );
              this.applicantDetails.controls.altMobNum.setValue(
                this.globFunc.basicDec(this.getPersonalData[0].altMobNum)
              );
              this.applicantDetails.controls.panAvailable.setValue(
                this.getPersonalData[0].panAvailable
              );
              this.applicantDetails.controls.panNum.setValue(
                this.globFunc.basicDec(this.getPersonalData[0].panNum)
              );
              this.applicantDetails.controls.form60.setValue(
                this.globFunc.basicDec(this.getPersonalData[0].form60)
              );
              this.applicantDetails.controls.employment.setValue(
                this.getPersonalData[0].employment
              );
              this.applicantDetails.controls.bussName.setValue(
                this.getPersonalData[0].bussName
              );
              this.applicantDetails.controls.actDetail.setValue(
                this.getPersonalData[0].actDetail
              );
              this.applicantDetails.controls.monthIncome.setValue(
                this.getPersonalData[0].monthIncome
              );
              this.applicantDetails.controls.vinOfServ.setValue(
                this.getPersonalData[0].vinOfServ
              );

              this.applicantDetails.controls.employerName.setValue(
                this.getPersonalData[0].employerName
              );
              this.applicantDetails.controls.employeeId.setValue(
                this.getPersonalData[0].employeeId
              );
              this.applicantDetails.controls.designation.setValue(
                this.getPersonalData[0].designation
              );
              this.applicantDetails.controls.joinDate.setValue(
                this.getPersonalData[0].joinDate
              );
              this.applicantDetails.controls.monthSalary.setValue(
                this.getPersonalData[0].monthSalary
              );
              this.applicantDetails.controls.lmName.setValue(
                this.getPersonalData[0].lmName
              );
              this.applicantDetails.controls.lmEmail.setValue(
                this.globFunc.basicDec(this.getPersonalData[0].lmEmail)
              );

              this.applicantDetails.controls.experience.setValue(
                this.getPersonalData[0].experience
              );
              this.applicantDetails.controls.annualIncome.setValue(
                this.getPersonalData[0].annualIncome
              );
              this.applicantDetails.controls.caste.setValue(
                this.getPersonalData[0].caste
              );
              this.applicantDetails.controls.religion.setValue(
                this.getPersonalData[0].religion
              );
              this.applicantDetails.controls.languages.setValue(
                this.getPersonalData[0].languages
              );
              this.applicantDetails.controls.resciStatus.setValue(
                this.getPersonalData[0].resciStatus
              );
              this.applicantDetails.controls.education.setValue(
                this.getPersonalData[0].education
              );
              this.applicantDetails.controls.email.setValue(
                this.globFunc.basicDec(this.getPersonalData[0].email)
              );
              this.applicantDetails.controls.coAppFlag.setValue(
                this.getPersonalData[0].coAppFlag
              );
              this.applicantDetails.controls.nameEkyc.setValue(
                this.getPersonalData[0].nameAsPerEkyc
              );
              if (this.getPersonalData[0].upiNo) {
                this.applicantDetails.controls.upiNo.setValue(
                  this.getPersonalData[0].upiNo
                );
                this.applicantDetails.controls.nameupi.setValue(
                  this.getPersonalData[0].nameupi
                );
                this.getPersonalData[0].nameupi.length > 0
                  ? (this.upiVerify = true)
                  : (this.upiVerify = false);
              }

              if (this.getPersonalData[0].isNameAsPerEkyc == 'Y') {
                this.isNameAsPerEkyc = true;
              }

              if (this.getPersonalData[0].disableFirstName == 'Y') {
                this.firstNameDisable = true;
              }
              if (this.getPersonalData[0].disableLastName == 'Y') {
                this.lastNameDisable = true;
              }
              if (this.getPersonalData[0].disableFatherName == 'Y') {
                this.disableFatherName = true;
              }
              if (this.getPersonalData[0].dobDisable == 'Y') {
                this.dobDisable = true;
              }
              if (this.getPersonalData[0].disableGender == 'Y') {
                this.disableGender = true;
              }
              if (this.getPersonalData[0].disablePan == 'Y') {
                this.disablePan = true;
              }
              if (this.getPersonalData[0].ShowAadharDob == 'Y') {
                this.disableAadharDOB = true;
                this.ShowAadharDob = true;
              }

              this.refId = this.getPersonalData[0].refId;
              this.id = this.getPersonalData[0].id;
              this.perId = this.getPersonalData[0].perId;

              this.profPic = this.globalData.setProfileImage(
                this.getPersonalData[0].profPic
              );
              this.saveStatus.emit('personalTick');
              // this.globalData.setEditSaveStatus("personalSaved");
              localStorage.setItem('Personal', 'personalSaved');
              if (this.getPersonalData[0].panAvailable == 'Y') {
                this.setFilteredItems(
                  this.globFunc.basicDec(this.getPersonalData[0].panNum)
                );
              } else if (this.getPersonalData[0].panAvailable == 'N') {
                this.setFilteredItems(
                  this.globFunc.basicDec(this.getPersonalData[0].form60)
                );
              }
              this.panAvailabilityChecking(
                this.getPersonalData[0].panAvailable
              );
              // this.\(undefined);
            } else {
              this.userType = this.globalData.getborrowerType();
              this.personalData.get('constitution').setValue('001');
              this.form60Check = false;
              this.panCheck = true;
              this.panform60 = 'panCheck';
              if (this.userType == 'A') {
                this.personalData
                  .get('panNum')
                  .setValidators(
                    Validators.compose([
                      Validators.maxLength(10),
                      Validators.minLength(10),
                      Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
                      Validators.required,
                    ])
                  );
              } else {
                this.personalData
                  .get('panNum')
                  .setValidators(
                    Validators.compose([
                      Validators.maxLength(10),
                      Validators.minLength(10),
                      Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
                    ])
                  );
              }
              this.personalData.get('panNum').updateValueAndValidity();
              this.personalData.get('docName').clearValidators();
              this.personalData.get('docName').updateValueAndValidity();
              this.personalData.get('docValue').clearValidators();
              this.personalData.get('docValue').updateValueAndValidity();
              this.personalData.get('docName').setValue('');
              this.personalData.get('docValue').setValue('');
            }
          })
          .catch((Error) => {
            console.log(Error);
          });
      });
  }

  postData() {
    this.globFunc.globalLodingPresent('loading...');
    let body = {
      NSDL: {
        Request: {
          Pan: [
            {
              PanNumber: this.panNumber,
            },
          ],
        },
      },
    };
    this.master.restApiCallAngular('validatePan', body).then(
      (data) => {
        this.globFunc.globalLodingDismiss();
        if (
          (<any>data).NSDL.Response.details.StatusCode == '1' &&
          (<any>data).NSDL.Response.details.Panstatus == 'E'
        ) {
          this.panResult = (<any>data).NSDL.Response.details;
          this.PANCheckStatus = 'Y';
          this.panName =
            this.panResult.firstName +
            ' ' +
            this.panResult.middleName +
            ' ' +
            this.panResult.lastName;
        } else {
          this.panResult = undefined;
          this.alertService.showAlert('Alert!', 'Not a valid PAN !');
        }
      },
      (err) => {
        this.globFunc.globalLodingDismiss();
        this.alertService.showAlert('Alert!', 'No Response from Server!');
      }
    );
  }

  sendSms() {
    if (this.network.type === 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert(
        'Alert!',
        'Please Check your Data Connection!'
      );
    } else {
      this.otpValue = 'RESEND OTP';
      this.otpCount++;
      // console.log("otpCount: " + this.otpCount);
      if (this.otpCount > 3) {
        this.alertService.showAlert('Alert!', 'Exceed the limit!');
      } else {
        this.globFunc.globalLodingPresent('loading...');
        this.OTPNUM = Math.floor(Math.random() * 900000) + 100000;
        // console.log(this.OTPNUM);
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Accept', 'application/json');
        headers.append(
          'Access-Control-Allow-Methods',
          'POST, GET, OPTIONS, PUT'
        );
        headers.append('Access-Control-Allow-Credentials', 'true');
        let body = {
          SMS: {
            Request: {
              Mobile: this.mobNum,
              OTP: this.OTPNUM,
            },
          },
        };
        // this.http.post(this.otpUrl, JSON.stringify(body), { headers: headers }).map(res => res.json())
        //   .subscribe(data => {
        this.master.restApiCallAngular('Smsotp', body).then(
          (data) => {
            this.globFunc.globalLodingDismiss();
            // console.log("data: " + JSON.stringify(data));
            if (this.urlType) {
              // console.log(this.verifiedMobNum);
              this.otpResult = (<any>data).SMS.Response;
              this.verifiedMobNum = false;
              // console.log(this.otpResult);
              this.alertService.showAlert(
                'Alert!',
                'OTP Sent to Entered Mobile number Success!'
              );
            } else {
              if ((<any>data).SMS.Response.statusCode === 'Success') {
                this.otpResult = (<any>data).SMS.Response;
                this.verifiedMobNum = false;
                this.alertService.showAlert(
                  'Alert!',
                  'OTP Sent to Entered Mobile number Success!'
                );
              } else {
                this.verifiedMobNum = false;
                this.otpResult = undefined;
                this.alertService.showAlert(
                  'Alert!',
                  'Not a valid Mobile number'
                );
              }
            }
          },
          (err) => {
            this.globFunc.globalLodingDismiss();
            this.alertService.showAlert('Alert!', 'No Response from Server!');
          }
        );
      }
    }
  }

  checkOTP(value) {
    this.OTPNUM = parseInt(this.OTPNUM);
    value = parseInt(value);
    if (this.OTPNUM === value) {
      this.verifiedMobNum = true;
      this.otpstatus = 'YES';
      this.mobDisable = true;
      this.alertService.showAlert(
        'Alert!',
        'Mobile Number verified Successfully!'
      );
    } else if (this.OTPNUM != value) {
      this.verifiedMobNum = false;
      this.personalData.get('enteredOTP').setValue('');
      this.enteredOTP = '';
      this.alertService.showAlert('Alert!', 'Please enter valid OTP');
    } else if (value === '' || value === undefined || value === null) {
      this.verifiedMobNum = false;
      this.alertService.showAlert('Alert!', 'Please enter OTP');
    }
  }

  // barcode() {
  //   let options = {
  //     showTorchButton: true,
  //     prompt: "Place a (Aadhar) QR insde the viewfinder rectangle to scan it."
  //   };
  //   this.barcodeScanner.scan(options).then(barcodeData => {
  //     // console.log('Barcode data===>', barcodeData);
  //     // alert(barcodeData.text);
  //     var _self = this;
  //     xml2js.parseString(barcodeData.text, function (err, result) {
  //       // console.log(result);
  //       _self.globalData.set_address(result);
  //       let firstname = result.PrintLetterBarcodeData.$.name;
  //       _self.firstname = firstname.split(" ")[0];
  //       _self.lastname = result.PrintLetterBarcodeData.$.gname;
  //       _self.aadhar = result.PrintLetterBarcodeData.$.uid;
  //       _self.fathername = result.PrintLetterBarcodeData.$.co.substring(5);
  //       _self.genderSelect = result.PrintLetterBarcodeData.$.gender;
  //       _self.dobyear = result.PrintLetterBarcodeData.$.dob.substring(6, 10);
  //       _self.dobmonth = result.PrintLetterBarcodeData.$.dob.substring(3, 5);
  //       _self.dobdate = result.PrintLetterBarcodeData.$.dob.substring(0, 2);
  //       _self.dob = _self.dobyear + "-" + _self.dobmonth + "-" + _self.dobdate;
  //     });
  //     //console.log('qrdata data===>' + this.qrdata);
  //   }).catch(err => {
  //     console.log('Error', err);
  //   });
  //   // alert("qr data: " + this.firstname +" "+ this.lastname + " " + this.aadhar + " " + this.fathername + " " + this.genderSelect + " " + this.address1 + " " + this.district + " " + this.pc + " " + this.state + " " + this.address2 + " " + this.city + " " + this.village + " " + this.dob);
  // }

  /*   getJobTypeValue() {
      this.sqliteProvider.getAllJobTypeValues().then(data => {
        this.job_master = data;
        //     alert('job_master: ' + JSON.stringify(this.job_master));
      })
    }
   */

  genderChange(selected) {
    let Title = this.personalData.controls.genTitle.value;
    // console.log("Gender " + Title);
    // let gender = this.personalData.controls.gender.value;
    if (selected == 'title') {
      if (Title == 'Mr') {
        this.genderSelect = 'M';
        this.personalData.get('gender').setValue('M');
      } else if (Title == 'Mrs') {
        this.genderSelect = 'F';
        this.personalData.get('gender').setValue('F');
      } else if (Title == 'Ms') {
        this.genderSelect = 'F';
        this.personalData.get('gender').setValue('F');
      } else if (Title == 'Mx') {
        this.genderSelect = 'T';
        this.personalData.get('gender').setValue('T');
      }
    }
  }

  titleChange(title) {
    let gender = this.personalData.controls.gender.value;
    // console.log("title" + gender);
    if (title == 'gender') {
      if (gender == 'M') {
        this.personalData.get('genTitle').setValue('Mr');
      } else if (gender == 'F') {
        if (this.personalData.controls.marital.value == '1') {
          this.personalData.get('genTitle').setValue('Ms');
        } else {
          this.personalData.get('genTitle').setValue('Mrs');
        }
      } else if (gender == 'T') {
        this.personalData.get('genTitle').setValue('Mx');
      }
    }
  }

  age18(): string {
    let age18: string = this.globalData.getEighteenFromToday();
    return age18;
  }

  getCibilCheckedDetails() {
    if (this.naveParamsValue.appRefValue) {
      this.refinfo = JSON.parse(this.naveParamsValue.appRefValue);
      this.refId = this.refinfo.refId;
      this.globalData.setrefId(this.refId);
      this.id = this.refinfo.id;
      this.globalData.setId(this.id);
    } else {
      this.refId = this.globalData.getrefId();
      this.id = this.globalData.getId();
    }
    this.sqliteProvider.getSubmitDetails(this.refId, this.id).then((data) => {
      // console.log("get basic: " + JSON.stringify(data));
      if (data.length > 0) {
        if (data[0].cibilCheckStat == '1') {
          this.submitDisable = true;
        } else {
          this.submitDisable = false;
        }
      }
    });
  }

  calldate() {
    let dd = this.todayDate.getDate() + 1;
    let mm = this.todayDate.getMonth() + 1; //January is 0!
    let yyyy = this.todayDate.getFullYear() - 18;
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    let mindate = yyyy + '-' + mm + '-' + dd;
    this.mindate = mindate;
  }

  age21() {
    this.userType = this.globalData.getborrowerType();
    if (this.userType == 'A') {
      let dd = this.todayDate.getDate();
      let mm = this.todayDate.getMonth() + 1; //January is 0!
      let yyyy = this.todayDate.getFullYear() - 21;
      let years = this.todayDate.getFullYear() - 65;
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      let mindate = yyyy + '-' + mm + '-' + dd;
      let maxdate = years + '-' + mm + '-' + dd;
      this.minAge = mindate;
      this.maxAge = maxdate;
    } else if (this.userType != 'A') {
      let dd = this.todayDate.getDate();
      let mm = this.todayDate.getMonth() + 1; //January is 0!
      let yyyy = this.todayDate.getFullYear() - 21;
      let years = this.todayDate.getFullYear() - 65;
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      let mindate = yyyy + '-' + mm + '-' + dd;
      let maxdate = years + '-' + mm + '-' + dd;
      this.minAge = mindate;
      this.maxAge = maxdate;
    }
  }

  panadProofupdate(aadharNum, panNum, docName, docValue) {
    if (aadharNum == '' || aadharNum == undefined || aadharNum == null) {
      if (panNum != '' && panNum != undefined && panNum != null) {
        this.sqliteProvider
          .adProofupdate(this.refId, this.id, 'PAN', panNum)
          .then((data) => {
            // console.log("pan data ==>"+data);
          })
          .catch((Error) => {
            console.log('Failed!' + Error);
            //this.showAlert("Alert!", "Failed!");
          });
      } else {
        this.sqliteProvider
          .adProofupdate(this.refId, this.id, docName, docValue)
          .then((data) => {
            // console.log("pan data ==>"+data);
          })
          .catch((Error) => {
            console.log('Failed!' + Error);
            //this.showAlert("Alert!", "Failed!");
          });
      }
      //this.ProofComponent.clearpromo();
      this.clearvalue.emit();
    } else {
      this.sqliteProvider
        .adProofupdate(this.refId, this.id, 'ad', aadharNum)
        .then((data) => {
          // console.log("adaa data ==>"+data);
          if (panNum != '' && panNum != undefined && panNum != null) {
            this.sqliteProvider
              .adProofupdate(this.refId, this.id, 'PAN', panNum)
              .then((data) => {
                // console.log("pan data ==>"+data);
              })
              .catch((Error) => {
                console.log('Failed!' + Error);
                //this.showAlert("Alert!", "Failed!");
              });
          } else {
            this.sqliteProvider
              .adProofupdate(this.refId, this.id, docName, docValue)
              .then((data) => {
                // console.log("pan data ==>"+data);
              })
              .catch((Error) => {
                console.log('Failed!' + Error);
                //this.showAlert("Alert!", "Failed!");
              });
          }
        })
        .catch((Error) => {
          console.log('Failed!' + Error);
          //this.showAlert("Alert!", "Failed!");
        });
      //this.ProofComponent.clearpromo();
      this.clearvalue.emit();
    }
  }

  getlmsData() {
    this.sqliteProvider.getPassedLMSDetails(this.lmsLeadId).then((data) => {
      if (data.length > 0) {
        this.LMSDetails = data[0];
        this.personalData = this.formBuilder.group({
          genTitle: ['', Validators.required],
          firstname: [
            this.LMSDetails.promoter_fname,
            Validators.compose([
              Validators.maxLength(30),
              Validators.pattern('[a-zA-Z ]*'),
              Validators.required,
            ]),
          ],
          lastname: [
            this.LMSDetails.promoter_lname,
            Validators.compose([
              Validators.maxLength(30),
              Validators.pattern('[a-zA-Z ]*'),
              Validators.required,
            ]),
          ],
          fathername: [
            '',
            Validators.compose([
              Validators.maxLength(30),
              Validators.pattern('[a-zA-Z ]*'),
              Validators.required,
            ]),
          ],
          constitution: [''],
          mothername: [
            '',
            Validators.compose([
              Validators.maxLength(30),
              Validators.pattern('[a-zA-Z ]*'),
              Validators.required,
            ]),
          ],
          dobAadhar: '',
          dobDocument: '',
          dob: ['', Validators.required],
          gender: ['', Validators.required],
          marital: ['', Validators.required],
          aadharNum: [
            '',
            Validators.compose([
              Validators.maxLength(12),
              Validators.pattern('[0-9]{12}'),
            ]),
          ],
          panNum: '',
          docName: '',
          docValue: '',
          mobNum: [
            this.LMSDetails.mobile_number,
            Validators.compose([
              Validators.maxLength(10),
              Validators.pattern('[0-9]{10}$'),
              Validators.required,
            ]),
          ],
          enteredOTP: '',
          employment: ['', Validators.required], //Validators.required
          experience: ['', Validators.required],
          annualIncome: ['', Validators.required],
          caste: ['', Validators.required],
          religion: ['', Validators.required],
          education: ['', Validators.required],
          email: [
            '',
            Validators.compose([
              Validators.required,
              Validators.pattern(
                '^[A-Z0-9a-z\\._%+-]+@([A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$'
              ),
            ]),
          ],
          vap: ['', Validators.required],
        });
        this.leadcreated = this.LMSDetails.created_by;
        this.leadreference = this.LMSDetails.reference_id;
      }
    });
  }

  panHideGuaran() {
    if (this.personalData.controls['aadharNum'].valid) {
      if (this.userType == 'G') {
        this.panHide = true;
        this.aadharHide = false;
        // this.panChecker("panCheck", 'N');
        this.personalData.get('panNum').clearValidators();
        this.personalData
          .get('panNum')
          .setValidators(
            Validators.compose([
              Validators.maxLength(10),
              Validators.minLength(10),
              Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
            ])
          );
        // this.personalData.get('panNum').setValue("");
        this.personalData.get('docName').clearValidators();
        // this.personalData.get('docName').setValue("");
        this.personalData.get('docValue').clearValidators();
        // this.personalData.get('docValue').setValue("");
      }
    } else {
      this.personalData
        .get('aadharNum')
        .setValidators(
          Validators.compose([
            Validators.maxLength(12),
            Validators.pattern('[0-9]{12}'),
          ])
        );
      this.panform60 = 'panCheck';
      this.personalData
        .get('panNum')
        .setValidators(
          Validators.compose([
            Validators.maxLength(10),
            Validators.minLength(10),
            Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
            Validators.required,
          ])
        );
      if (this.userType == 'A') {
        this.panform60 = 'panCheck';
        this.panChecker('panCheck', 'N');
      }
    }
  }

  aadharHideGuaran() {
    if (this.personalData.controls['docValue'].valid) {
      if (this.userType == 'G') {
        this.personalData.get('aadharNum').clearValidators();
        // this.personalData.get('aadharNum').setValue("");
        this.personalData.get('panNum').clearValidators();
        this.personalData.get('panNum').setValue('');
        this.aadharHide = true;
        this.panHide = false;
      }
    } else {
      this.aadharHide = false;
    }
  }

  panAvailabilityChecking(value) {
    let event = value.detail ? value.detail.value : value;
    if (event == 'Y') {
      this.applicantDetails.controls.panNum.setValidators(
        Validators.compose([
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
          Validators.required,
        ])
      );
      this.applicantDetails.controls.panNum.updateValueAndValidity();
      this.applicantDetails.controls.form60.clearValidators();
      this.applicantDetails.controls.form60.setValue('');
      this.applicantDetails.controls.form60.updateValueAndValidity();
      if (this.naveParamsValue.pan) {
        this.applicantDetails.controls.panNum.setValue(this.idType.idNumber);
        this.applicantDetails.controls.panNum.updateValueAndValidity();
        this.panNumber = this.idType.idNumber;
        this.disablePan = true;
      } else if (
        this.ExCusData.length > 0 &&
        this.ExCusData[0].IdProof == 'PAN'
      ) {
        this.applicantDetails.controls.panNum.setValue(
          this.globFunc.basicDec(this.ExCusData[0].IdProofValue)
        );
        this.applicantDetails.controls.panNum.updateValueAndValidity();
        this.panNumber = this.globFunc.basicDec(this.ExCusData[0].IdProofValue);
        this.disablePan = true;
      } else if (
        (this.ExCusData.length > 0 && this.ExCusData[0].PanNum != undefined) ||
        null ||
        ''
      ) {
        this.applicantDetails.controls.panNum.setValue(
          this.globFunc.basicDec(this.ExCusData[0].PanNum)
        );
        this.applicantDetails.controls.panNum.updateValueAndValidity();
        this.panNumber = this.globFunc.basicDec(this.ExCusData[0].PanNum);
        this.disablePan = true;
      }
      this.applicantDetails.controls.panNum.setValidators(
        Validators.compose([
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.pattern(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/),
          Validators.required,
        ])
      );
      this.applicantDetails.controls.panNum.updateValueAndValidity();
    } else if (event == 'N') {
      this.disablePan = false;
      this.applicantDetails.controls.panNum.clearValidators();
      this.applicantDetails.controls.panNum.setValue('');
      this.applicantDetails.controls.panNum.updateValueAndValidity();
      this.applicantDetails.controls.form60.setValue('form60');
      this.applicantDetails.controls.form60.updateValueAndValidity();
    }
  }

  getTitles() {
    this.sqliteProvider.getMasterDataUsingType('TitleMaster').then((data) => {
      this.titles = data;
    });
  }

  getMaritalStatusValue() {
    this.sqliteProvider.getMasterDataUsingType('MaritalStatus').then((data) => {
      this.mari_master = data;
    });
  }

  getEmploymentValue() {
    this.sqliteProvider
      .getMasterDataUsingType('OccupationTwovl')
      .then((data) => {
        this.emp_master = data;
      });
  }

  getCasteValue() {
    this.sqliteProvider.getMasterDataUsingType('Caste').then((data) => {
      this.caste_master = data;
    });
  }

  getEducationValue() {
    this.sqliteProvider.getMasterDataUsingType('Education').then((data) => {
      this.edu_master = data;
    });
  }

  getReligionValue() {
    this.sqliteProvider.getMasterDataUsingType('Religion').then((data) => {
      this.rel_master = data;
    });
  }

  getGenderList() {
    this.sqliteProvider.getMasterDataUsingType('Gender').then((data) => {
      this.genderList = data;
    });
  }

  getPreferredLanguage() {
    this.sqliteProvider.getMasterDataUsingType('Language').then((data) => {
      this.dummyLangMaster = data;
    });
  }

  getResStatus() {
    this.sqliteProvider
      .getMasterDataUsingType('ResidenceStatus')
      .then((data) => {
        this.residenceStatus = data;
      });
  }

  getNatureofBussiness() {
    this.sqliteProvider
      .getMasterDataUsingType('BusinessDescription')
      .then((data) => {
        this.dummyBussiness = data;
      });
  }
  getVintageofService() {
    this.sqliteProvider
      .getMasterDataUsingType('VintageofService')
      .then((data) => {
        this.vinOfServMaster = data;
      });
  }

  getAnnualIncome() {
    this.sqliteProvider.getMasterDataUsingType('AnnualIncome').then((data) => {
      this.annualIncomeMaster = data;
    });
  }

  karzaDataFetch() {
    if (this.naveParamsValue.licence) {
      this.applicantDetails.controls.firstname.setValue(this.idType.firstname);
      this.applicantDetails.controls.middlename.setValue(
        this.idType.middlename
      );
      this.applicantDetails.controls.lastname.setValue(this.idType.lastname);
      this.applicantDetails.controls.fathername.setValue(
        this.idType.fathername
      );
      this.applicantDetails.controls.dob.setValue(
        this.idType.dob.substring(6, 10) +
          '-' +
          this.idType.dob.substring(3, 5) +
          '-' +
          this.idType.dob.substring(0, 2)
      );
    } else if (this.naveParamsValue.passport) {
      this.applicantDetails.controls.firstname.setValue(this.idType.name);
      this.applicantDetails.controls.lastname.setValue(this.idType.fathername);
      this.applicantDetails.controls.dob.setValue(this.idType.dob);
      if (this.idType.gender == 'M') {
        this.applicantDetails.controls.gender.setValue('2');
      }
      if (this.idType.gender == 'F') {
        this.applicantDetails.controls.gender.setValue('1');
      }
      if (this.idType.gender == 'T') {
        this.applicantDetails.controls.gender.setValue('3');
      }
    } else if (this.naveParamsValue.voter) {
      this.applicantDetails.controls.firstname.setValue(this.idType.name);
      this.applicantDetails.controls.fathername.setValue(
        this.idType.fathername
      );

      if (this.idType.lastname) {
        this.applicantDetails.controls.lastname.setValue(this.idType.lastname);
      }

      if (this.idType.dob.trim()) {
        this.applicantDetails.controls.dob.setValue(
          this.idType.dob.substring(6, 10) +
            '-' +
            this.idType.dob.substring(3, 5) +
            '-' +
            this.idType.dob.substring(0, 2)
        );
      }
    } else if (this.naveParamsValue.nonIndividual) {
      this.applicantDetails.controls.firstname.setValue(this.idType.proName);
      this.applicantDetails.controls.mobNum.setValue(this.idType.contact);
      this.applicantDetails.controls.email.setValue(this.idType.proEmail);
      if (
        this.idType.proEmail != '' &&
        this.idType.proEmail != undefined &&
        this.idType.proEmail != null
      ) {
        this.applicantDetails.controls.panAvailable.setValue('Y');
        this.applicantDetails.controls.panNum.setValue(this.idType.pan);
        this.panNumber = this.idType.pan;
      }
    } else if (this.naveParamsValue.pan) {
      this.applicantDetails.controls.firstname.setValue(this.idType.firstname);
      if (this.idType.lastname) {
        this.applicantDetails.controls.lastname.setValue(this.idType.lastname);
      }
      // else {
      //   this.applicantDetails.controls.lastname.setValue('enterlast');
      // }
      if (
        this.idType.panDOB != '' &&
        this.idType.panDOB != null &&
        this.idType.panDOB != undefined
      ) {
        this.applicantDetails.controls.dob.setValue(
          this.idType.panDOB.substring(6, 10) +
            '-' +
            this.idType.panDOB.substring(3, 5) +
            '-' +
            this.idType.panDOB.substring(0, 2)
        );
      }
      this.applicantDetails.controls.panAvailable.setValue('Y');
      this.panAvailabilityChecking('Y');
      this.applicantDetails.controls.panNum.setValue(this.idType.idNumber);
      this.panNumber = this.idType.idNumber;
      this.panName = this.idType.name;
      this.panValidation = this.idType.panValidation;
      this.nameValidation = this.idType.nameValidation;
      this.DOBValidation = this.idType.DOBValidation;
      this.seedingStatus = this.idType.seedingStatus;
      this.disablePan = true;
    }

    if (this.applicantDetails.controls.firstname.value) {
      this.firstNameDisable = true;
    }
    if (this.applicantDetails.controls.lastname.value) {
      this.lastNameDisable = true;
    }
    if (this.applicantDetails.controls.fathername.value) {
      this.disableFatherName = true;
    }
    if (this.applicantDetails.controls.dob.value) {
      this.dobDisable = true;
    }
    if (this.applicantDetails.controls.gender.value) {
      this.disableGender = true;
    }
  }

  exCLNameDisable = false;
  mobNumValidation() {
    if (this.applicantDetails.controls.mobNum.value.length == 10) {
      let str = this.applicantDetails.controls.mobNum.value;
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
        str[0] == str[9]
      ) {
        this.applicantDetails.controls.mobNum.setValue('');
        this.alertService.showAlert(
          'Alert!',
          'Given mobile number is not valid!'
        );
      }
    }
  }

  empStatusCheck(event) {
    let val = event.detail.value;

    // if (val == "104") {
    //   this.applicantDetails.get('coAppFlag').setValue('Y');
    //   this.disableCoApp = true;
    // } else
    if (val == '1' && (this.janaEmp != '1' || this.userType == 'C')) {
      // isSalaried - employerName,employeeId, designation, joinDate, experience, monthSalary
      this.isSelfEmp = false;
      this.isSalaried = true;
      this.isJanaEmp = false;

      this.applicantDetails.get('bussName').clearValidators();
      this.applicantDetails.get('actDetail').clearValidators();
      this.applicantDetails.get('monthIncome').clearValidators();
      this.applicantDetails.get('vinOfServ').clearValidators();
      this.applicantDetails.get('bussName').setValue('');
      this.applicantDetails.get('actDetail').setValue('');
      this.applicantDetails.get('monthIncome').setValue('');
      this.applicantDetails.get('vinOfServ').setValue('');

      this.applicantDetails.get('bussName').updateValueAndValidity();
      this.applicantDetails.get('actDetail').updateValueAndValidity();
      this.applicantDetails.get('monthIncome').updateValueAndValidity();
      this.applicantDetails.get('vinOfServ').updateValueAndValidity();

      this.applicantDetails
        .get('employerName')
        .setValidators(Validators.required);
      // this.applicantDetails.get('employeeId').setValidators(Validators.required);
      this.applicantDetails
        .get('designation')
        .setValidators(Validators.required);
      this.applicantDetails.get('joinDate').setValidators(Validators.required);
      this.applicantDetails
        .get('experience')
        .setValidators(Validators.required);
      this.applicantDetails
        .get('monthSalary')
        .setValidators(Validators.required);

      this.applicantDetails.get('employerName').updateValueAndValidity();
      // this.applicantDetails.get('employeeId').updateValueAndValidity();
      this.applicantDetails.get('designation').updateValueAndValidity();
      this.applicantDetails.get('joinDate').updateValueAndValidity();
      this.applicantDetails.get('experience').updateValueAndValidity();
      this.applicantDetails.get('monthSalary').updateValueAndValidity();
    } else if (val == '1' && this.janaEmp == '1' && this.userType == 'A') {
      // isSalaried & isJanaEmp  - employerName,employeeId, designation, joinDate, experience, monthSalary, lmName, lmEmail
      this.isSelfEmp = false;
      this.isSalaried = true;
      this.isJanaEmp = true;

      this.applicantDetails.get('bussName').clearValidators();
      this.applicantDetails.get('actDetail').clearValidators();
      this.applicantDetails.get('monthIncome').clearValidators();
      this.applicantDetails.get('vinOfServ').clearValidators();
      this.applicantDetails.get('bussName').setValue('');
      this.applicantDetails.get('actDetail').setValue('');
      this.applicantDetails.get('monthIncome').setValue('');
      this.applicantDetails.get('vinOfServ').setValue('');

      this.applicantDetails.get('bussName').updateValueAndValidity();
      this.applicantDetails.get('actDetail').updateValueAndValidity();
      this.applicantDetails.get('monthIncome').updateValueAndValidity();
      this.applicantDetails.get('vinOfServ').updateValueAndValidity();

      this.applicantDetails
        .get('employerName')
        .setValidators(Validators.required);
      // this.applicantDetails.get('employeeId').setValidators(Validators.required);
      this.applicantDetails
        .get('designation')
        .setValidators(Validators.required);
      this.applicantDetails.get('joinDate').setValidators(Validators.required);
      this.applicantDetails
        .get('experience')
        .setValidators(Validators.required);
      this.applicantDetails
        .get('monthSalary')
        .setValidators(Validators.required);
      this.applicantDetails.get('lmName').setValidators(Validators.required);
      this.applicantDetails
        .get('lmEmail')
        .setValidators([
          Validators.compose([
            Validators.pattern(
              '^[A-Z0-9a-z\\._%+-]+@([A-Za-z0-9-]+\\.)+[A-Za-z]{2,4}$'
            ),
            Validators.required,
          ]),
        ]);

      this.applicantDetails.get('employerName').updateValueAndValidity();
      // this.applicantDetails.get('employeeId').updateValueAndValidity();
      this.applicantDetails.get('designation').updateValueAndValidity();
      this.applicantDetails.get('joinDate').updateValueAndValidity();
      this.applicantDetails.get('experience').updateValueAndValidity();
      this.applicantDetails.get('monthSalary').updateValueAndValidity();
      this.applicantDetails.get('lmName').updateValueAndValidity();
      this.applicantDetails.get('lmEmail').updateValueAndValidity();
    } else if (val == '2') {
      //isSelfEmp - bussName, actDetail, monthIncome, vinOfServ
      this.isSelfEmp = true;
      this.isSalaried = false;
      this.isJanaEmp = false;

      this.applicantDetails.get('employerName').clearValidators();
      this.applicantDetails.get('employeeId').clearValidators();
      this.applicantDetails.get('designation').clearValidators();
      this.applicantDetails.get('joinDate').clearValidators();
      this.applicantDetails.get('experience').clearValidators();
      this.applicantDetails.get('monthSalary').clearValidators();
      this.applicantDetails.get('lmName').clearValidators();
      this.applicantDetails.get('lmEmail').clearValidators();

      this.applicantDetails.get('employerName').setValue('');
      this.applicantDetails.get('employeeId').setValue('');
      this.applicantDetails.get('designation').setValue('');
      this.applicantDetails.get('joinDate').setValue('');
      this.applicantDetails.get('experience').setValue('');
      this.applicantDetails.get('monthSalary').setValue('');
      this.applicantDetails.get('lmName').setValue('');
      this.applicantDetails.get('lmEmail').setValue('');

      this.applicantDetails.get('employerName').updateValueAndValidity();
      this.applicantDetails.get('employeeId').updateValueAndValidity();
      this.applicantDetails.get('designation').updateValueAndValidity();
      this.applicantDetails.get('joinDate').updateValueAndValidity();
      this.applicantDetails.get('experience').updateValueAndValidity();
      this.applicantDetails.get('monthSalary').updateValueAndValidity();
      this.applicantDetails.get('lmName').updateValueAndValidity();
      this.applicantDetails.get('lmEmail').updateValueAndValidity();

      this.applicantDetails.get('bussName').setValidators(Validators.required);
      this.applicantDetails.get('actDetail').setValidators(Validators.required);
      this.applicantDetails
        .get('monthIncome')
        .setValidators(Validators.required);
      this.applicantDetails.get('vinOfServ').setValidators(Validators.required);
      this.applicantDetails.get('bussName').updateValueAndValidity();
      this.applicantDetails.get('actDetail').updateValueAndValidity();
      this.applicantDetails.get('monthIncome').updateValueAndValidity();
      this.applicantDetails.get('vinOfServ').updateValueAndValidity();
    } else {
      this.isSalaried = false;
      this.isSelfEmp = false;
      this.isJanaEmp = false;

      this.applicantDetails.get('employerName').clearValidators();
      this.applicantDetails.get('employeeId').clearValidators();
      this.applicantDetails.get('designation').clearValidators();
      this.applicantDetails.get('joinDate').clearValidators();
      this.applicantDetails.get('experience').clearValidators();
      this.applicantDetails.get('monthSalary').clearValidators();
      this.applicantDetails.get('bussName').clearValidators();
      this.applicantDetails.get('actDetail').clearValidators();
      this.applicantDetails.get('monthIncome').clearValidators();
      this.applicantDetails.get('vinOfServ').clearValidators();
      this.applicantDetails.get('lmName').clearValidators();
      this.applicantDetails.get('lmEmail').clearValidators();

      this.applicantDetails.get('employerName').updateValueAndValidity();
      this.applicantDetails.get('employeeId').updateValueAndValidity();
      this.applicantDetails.get('designation').updateValueAndValidity();
      this.applicantDetails.get('joinDate').updateValueAndValidity();
      this.applicantDetails.get('experience').updateValueAndValidity();
      this.applicantDetails.get('monthSalary').updateValueAndValidity();
      this.applicantDetails.get('bussName').updateValueAndValidity();
      this.applicantDetails.get('actDetail').updateValueAndValidity();
      this.applicantDetails.get('monthIncome').updateValueAndValidity();
      this.applicantDetails.get('vinOfServ').updateValueAndValidity();
      this.applicantDetails.get('lmName').updateValueAndValidity();
      this.applicantDetails.get('lmEmail').updateValueAndValidity();
    }
  }

  maritalStatus(value) {
    if (value == '1') {
      this.applicantDetails
        .get('spouseName')
        .setValidators(
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
          ])
        );
      this.applicantDetails.get('spouseName').updateValueAndValidity();
    } else {
      this.applicantDetails.get('spouseName').setValue('');
      this.applicantDetails.get('spouseName').clearValidators();
      this.applicantDetails.get('spouseName').updateValueAndValidity();
    }
  }

  EkycDataFetch() {
    if (this.naveParamsValue.ekycData) {
      let EkycData;
      let EkycFname;
      if (this.ekyc == 'OTP') {
        EkycData = this.getEkycData;
        EkycFname = this.getEkycData;
      } else {
        EkycData = this.getEkycData.KycRes.UidData.Poi;
        EkycFname = this.getEkycData.KycRes.UidData.Poa;
      }

      // let EkycData = this.getEkycData;
      // let EkycFname = this.getEkycData;
      let fname = EkycFname.co ? EkycFname.co.substring(3) : '';
      fname = fname.replace(/[^a-zA-Z ]/g, '');
      fname = fname.trim();
      let aadharName = JSON.parse(this.naveParamsValue.aadharName);
      if (EkycData.gender == 'M') {
        this.applicantDetails.controls.gender.setValue('2');
      }
      if (EkycData.gender == 'F') {
        this.applicantDetails.controls.gender.setValue('1');
      }
      if (EkycData.gender == 'T') {
        this.applicantDetails.controls.gender.setValue('3');
      }

      if (isMatch(EkycData.dob, 'yyyy-MM-dd')) {
        this.ShowAadharDob = false;
        this.applicantDetails.controls.dob.setValue(EkycData.dob);
        this.applicantDetails.get('dobAadhar').setValue('');
        this.applicantDetails.get('dobAadhar').clearValidators();
        this.applicantDetails.get('dobAadhar').updateValueAndValidity();
        this.applicantDetails.get('dobDocument').setValue('');
        this.applicantDetails.get('dobDocument').clearValidators();
        this.applicantDetails.get('dobDocument').updateValueAndValidity();
      } else if (isMatch(EkycData.dob, 'dd-MM-yyyy')) {
        this.ShowAadharDob = false;
        this.applicantDetails.controls.dob.setValue(
          EkycData.dob.substring(6, 10) +
            '-' +
            EkycData.dob.substring(3, 5) +
            '-' +
            EkycData.dob.substring(0, 2)
        );
        this.applicantDetails.get('dobAadhar').setValue('');
        this.applicantDetails.get('dobAadhar').clearValidators();
        this.applicantDetails.get('dobAadhar').updateValueAndValidity();
        this.applicantDetails.get('dobDocument').setValue('');
        this.applicantDetails.get('dobDocument').clearValidators();
        this.applicantDetails.get('dobDocument').updateValueAndValidity();
      } else {
        this.ShowAadharDob = true;
        this.disableAadharDOB = true;
        this.applicantDetails.controls.dobAadhar.setValue(EkycData.dob);
        this.applicantDetails.get('dobAadhar').updateValueAndValidity();
        this.applicantDetails
          .get('dobDocument')
          .setValidators(Validators.required);
        this.applicantDetails.get('dobDocument').updateValueAndValidity();
      }

      let nameAsPerEkyc;
      if (aadharName) {
        this.applicantDetails.controls.firstname.setValue(aadharName.name);
        if (aadharName.lastname) {
          this.applicantDetails.controls.lastname.setValue(aadharName.lastname);
        }
        nameAsPerEkyc = `${aadharName.name ? aadharName.name : ''} ${
          aadharName.lastname ? aadharName.lastname : ''
        }`;
        this.applicantDetails.controls.nameEkyc.setValue(nameAsPerEkyc);
      } else {
        this.applicantDetails.controls.firstname.setValue(EkycData.name);
        this.applicantDetails.controls.nameEkyc.setValue(EkycData.name);
      }

      if (this.applicantDetails.controls.firstname.value) {
        this.firstNameDisable = true;
      }
      if (this.applicantDetails.controls.lastname.value) {
        this.lastNameDisable = true;
      }
      if (fname) {
        this.disableFatherName = true;
      }

      if (EkycData.gender) {
        this.disableGender = true;
      }

      this.applicantDetails.controls.fathername.setValue(fname);
      // this.ekycDisable = true;
      if (this.applicantDetails.controls.dob.value) {
        this.dobDisable = true;
      }
    }
  }

  ngOnDestroy() {
    if (this.janaEmpSription) {
      this.janaEmpSription.unsubscribe();
    }
  }

  karzaPanDataFetch() {
    this.sqliteProvider.getKarzaData(this.leadId, 'pan').then((data) => {
      if (data.length > 0) {
        if (data[0].idType == 'pan') {
          this.applicantDetails.controls.panAvailable.setValue('Y');
          this.applicantDetails.controls.panNum.setValue(
            this.globFunc.basicDec(data[0].idNumber)
          );
          this.panNumber = this.globFunc.basicDec(data[0].idNumber);
          this.disablePan = true;
        }
      }
    });
  }

  /**
   * @method fetchDetailsFromRC
   * @description Function helps to fetch details of RC from Droom API .
   * @author HariHaraSuddhan S
   */
  async fetchUPIDetails() {
    try {
      this.globalData.globalLodingPresent('Please Wait...');
      let request = {
        upiId: this.applicantDetails.controls.upiNo.value,
        mobile: environment.uatlive ? '9999999999' : '8888888888',
        applicantName: `${this.applicantDetails.controls.firstname.value} ${this.applicantDetails.controls.lastname.value}`,
        leadId: this.leadId,
        userId: this.globFunc.basicDec(localStorage.getItem('username')),
        webFlag: 'N',
      };

      await this.master
        .restApiCallAngular('upiValidation', request)
        .then((result) => {
          if (result != undefined && result != null && result != '') {
            this.globalData.globalLodingDismiss();
            if (
              (<any>result).errorCode === '0' &&
              (<any>result).verifyFlag == 'Y'
            ) {
              this.upiVerify = true;
              this.applicantDetails.controls.nameupi.setValue(
                (<any>result).nameAsPerBank
              );
              this.applicantDetails.controls.nameupi.updateValueAndValidity();
            } else {
              this.globalData.globalLodingDismiss();
              this.alertService.showAlert('Alert!', (<any>result).errorDesc);
            }
          } else {
            this.globalData.globalLodingDismiss();
          }
        });
    } catch (error) {
      console.log('fetchUPIDetails', error);
    }
  }

  WorkingExperienceCalculation() {
    // Employee joining date
    const joiningDate = new Date(this.applicantDetails.controls.joinDate.value);
    // Total experience in years (can be a decimal value)
    const totalExperienceInYears =
      +this.applicantDetails.controls.experience.value; // Example: 4.5 years

    // Get the current date
    const currentDate = new Date();

    // Calculate the difference in years between the current date and the joining date
    let yearsOfExperience =
      currentDate.getFullYear() - joiningDate.getFullYear();

    // Calculate the number of full months since the last full year
    let monthsOfExperience = currentDate.getMonth() - joiningDate.getMonth();
    if (monthsOfExperience < 0) {
      yearsOfExperience--;
      monthsOfExperience += 12;
    }

    // Calculate the number of days since the last full month
    let daysOfExperience = currentDate.getDate() - joiningDate.getDate();
    if (daysOfExperience < 0) {
      monthsOfExperience--;
      if (monthsOfExperience < 0) {
        yearsOfExperience--;
        monthsOfExperience += 11; // Adjust for the decrement in years
      }
      // Get the number of days in the previous month
      const previousMonthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      daysOfExperience += previousMonthDate.getDate();
    }

    // Calculate the decimal experience
    const decimalExperience =
      yearsOfExperience + monthsOfExperience / 12 + daysOfExperience / 365;

    // Validate the experience
    if (decimalExperience.toFixed(1) === totalExperienceInYears.toFixed(1)) {
      console.log('Experience is valid.');
    } else {
      console.log(
        `Experience is not valid. Actual experience: ${decimalExperience.toFixed(
          1
        )} years.`
      );
    }
  }

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
}
