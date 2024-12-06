import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ModalController,
  NavController,
  NavParams,
  Platform,
} from '@ionic/angular';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-nominee-after-ps',
  templateUrl: './nominee-after-ps.page.html',
  styleUrls: ['./nominee-after-ps.page.scss'],
})
export class NomineeAfterPsPage implements OnInit {
  today: any = new Date();
  mindate: any;
  leadId: any = '';
  fetchRelate: boolean = false;
  submitDisable: boolean = false;
  relation: boolean = false;
  titles: any[];
  master_relations: any = [];
  guardian_cities: any[];
  nominee_cities: any[];
  refId: any;
  id: any;
  usertype: any;
  guardian: boolean = false;
  nomiDetails: FormGroup;
  todayDate: any = new Date();
  nomId: any;
  selectOptions = {
    cssClass: 'remove-ok',
  };
  master_states: any;
  master_cities: any;
  rel_master = [
    { ReligionId: '1', ReligionName: 'type 1' },
    { ReligionId: '2', ReligionName: 'type 2' },
    { ReligionId: '3', ReligionName: 'type 3' },
  ];
  postSanctionEdit: any;
  psData: any;
  nominame: any;
  pc: any;
  nomiCNum: any;
  guaname: any;
  guaCNum: any;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    // public viewCtrl: viewController,
    public modalCtrl: ModalController,
    public sqlSupport: SquliteSupportProviderService,
    public sqliteProvider: SqliteService,
    // public events: Events,
    public platform: Platform,
    public globFunc: DataPassingProviderService,
    public global: GlobalService,
    public alertService: CustomAlertControlService
  ) {
    this.psData = this.navParams.get('PostSanctionData');
    this.refId = this.psData.refId;
    this.id = this.psData.id;
    this.usertype = '';
    // this.usertype = this.global.getborrowerType();
    this.callmaxdate();
    this.getTitles();
    this.getRelationship();
    this.getStateValue();
    this.getCityValue(undefined);
    this.nomiDetails = this.formBuilder.group({
      nomTitle: ['', Validators.required],
      nominame: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      nomdob: ['', Validators.required],
      nomiage: [
        '',
        Validators.compose([
          Validators.maxLength(3),
          Validators.pattern('[0-9]*'),
          Validators.required,
        ]),
      ],
      nomrelation: ['', Validators.required],
      nomi_address1: [
        '',
        Validators.compose([
          Validators.maxLength(40),
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>\/]*$/),
          Validators.required,
        ]),
      ], //Validators.pattern('[a-zA-Z0-9.,/#& ]*')
      nomi_address2: [
        '',
        Validators.compose([
          Validators.maxLength(40),
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>\/]*$/),
          Validators.required,
        ]),
      ], //Validators.pattern('[a-zA-Z0-9.,/#& ]*')
      nomi_address3: [
        '',
        Validators.compose([
          Validators.maxLength(40),
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>\/]*$/),
        ]),
      ], //Validators.pattern('[a-zA-Z0-9.,/#& ]*')
      nomicities: ['', Validators.required],
      nomistates: ['', Validators.required],
      nomipincode: [
        '',
        Validators.compose([
          Validators.pattern('[0-9]{6}'),
          Validators.required,
        ]),
      ],
      nomicountries: ['India'],
      nomiCNum: [
        '',
        Validators.compose([
          Validators.maxLength(10),
          Validators.pattern('[0-9]{10}$'),
        ]),
      ],
      guaTitle: [''],
      guaname: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
        ]),
      ],
      guarelation: [''],
      guaCNum: [
        '',
        Validators.compose([
          Validators.maxLength(10),
          Validators.pattern('[0-9]{10}$'),
        ]),
      ],
      gua_address1: [
        '',
        Validators.compose([
          Validators.maxLength(35),
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>\/]*$/),
        ]),
      ], //Validators.pattern('[a-zA-Z0-9.,/#& ]*')
      gua_address2: [
        '',
        Validators.compose([
          Validators.maxLength(35),
          Validators.pattern(/^[a-zA-Z0-9 ()_\-\[\]{};':"\\.`,<>\/]*$/),
        ]),
      ], //Validators.pattern('[a-zA-Z0-9.,/#& ]*')
      guacities: [''],
      guastates: [''],
      guapincode: ['', Validators.compose([Validators.pattern('[0-9]{6}')])],
      guacountries: ['India'],
    });
    this.nomiDetails.get('nomicountries').setValue('India');
    this.nomiDetails.get('guacountries').setValue('India');

    // if (localStorage.getItem("submit") == "true") {
    //   this.submitDisable = true;
    //   this.relation = true;
    //   localStorage.setItem("submit", "true");
    // } else {
    //   this.submitDisable = false;
    //   this.relation = false;
    // }
  }

  ionViewWillEnter() {
    this.fetchGuaranDetails();
    this.getnominee();
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

  ngOnInit() {
    // let root = this.viewCtrl.instance.navCtrl._app._appRoot;
    document.addEventListener('click', function (event) {
      let btn = <HTMLLIElement>(
        document.querySelector('.remove-ok .alert-button-group')
      );
      let target = <HTMLElement>event.target;
      // if (btn && target.className == 'alert-radio-label' || target.className == 'alert-radio-inner' || target.className == 'alert-radio-icon') {
      //   let view = root._overlayPortal._views[0];
      //   let inputs = view.instance.d.inputs;
      //   for (let input of inputs) {
      //     if (input.checked) {
      //       view.instance.d.buttons[1].handler([input.value]);
      //       view.dismiss();
      //       break;
      //     }
      //   }
      // }
    });
  }

  nomiDetailsSave(value) {
    this.sqlSupport
      .InsertNomineeDetails(
        this.refId,
        this.id,
        this.usertype,
        this.leadId,
        value,
        this.nomId
      )
      .then((data) => {
        if (this.nomId == null || this.nomId == '' || this.nomId == undefined) {
          this.alertService
            .showAlert('Alert!', 'Nominee details saved!')
            .then((data) => {
              this.modalCtrl.dismiss(value);
            });
        } else {
          this.alertService
            .showAlert('Alert!', 'Nominee details updated!')
            .then((data) => {
              this.modalCtrl.dismiss(value);
            });
        }
        this.nomId = data.insertId;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getnominee() {
    this.sqlSupport.getNomineeDetails(this.refId, this.id).then((data) => {
      if (data.length > 0) {
        this.nomiDetails.get('nomTitle').setValue(data[0].nomTitle);
        this.nomiDetails.get('nominame').setValue(data[0].nominame);
        this.nomiDetails.get('nomdob').setValue(data[0].nomdob);
        this.nomiDetails.get('nomiage').setValue(data[0].nomiage);
        this.nomiDetails.get('nomrelation').setValue(data[0].nomrelation);
        this.nomiDetails.get('nomi_address1').setValue(data[0].nomi_address1);
        this.nomiDetails.get('nomi_address2').setValue(data[0].nomi_address2);
        this.nomiDetails.get('nomi_address3').setValue(data[0].nomi_address3);
        this.nomiDetails.get('nomicities').setValue(data[0].nomicities);
        this.nomiDetails.get('nomistates').setValue(data[0].nomistates);
        this.nomiDetails.get('nomipincode').setValue(data[0].nomipincode);
        this.nomiDetails.get('nomicountries').setValue(data[0].nomicountries);
        this.nomiDetails.get('nomiCNum').setValue(data[0].nomiCNum);
        this.nomiDetails.get('guaTitle').setValue(data[0].guaTitle);
        this.nomiDetails.get('guaname').setValue(data[0].guaname);
        this.nomiDetails.get('guarelation').setValue(data[0].guarelation);
        this.nomiDetails.get('guaCNum').setValue(data[0].guaCNum);
        this.nomiDetails.get('gua_address1').setValue(data[0].gua_address1);
        this.nomiDetails.get('gua_address2').setValue(data[0].gua_address2);
        this.nomiDetails.get('guacities').setValue(data[0].guacities);
        this.nomiDetails.get('guastates').setValue(data[0].guastates);
        this.nomiDetails.get('guapincode').setValue(data[0].guapincode);
        this.nomiDetails.get('guacountries').setValue(data[0].guacountries);
        this.refId = data[0].refId;
        this.id = data[0].id;
        this.nomId = data[0].nomId;
        this.leadId = data[0].leadId;
        this.getCityValue('nominee');
        this.fetchRelate = false;
        if (parseInt(data[0].nomiage) >= 18) {
          this.guardian = false;
        } else {
          this.guardian = true;
          this.getCityValue('guardian');
        }

        // if (localStorage.getItem("submit") == "true") {
        //   this.submitDisable = true;
        //   this.relation = true;
        //   localStorage.setItem("submit", "true");
        // } else {
        //   this.submitDisable = false;
        //   this.relation = false;
        // }
      } else {
        this.nomiDetails.get('nomicountries').setValue('India');
        this.nomiDetails.get('guacountries').setValue('India');
      }
    });
  }

  calculate_age(value) {
    let val = value.value;
    let today_date = new Date();
    let today_year = today_date.getFullYear();
    let today_month = today_date.getMonth();
    let today_day = today_date.getDate();
    let age = today_year - val.year;
    if (today_month < val.month - 1) {
      age--;
    }
    if (val.month - 1 == today_month && today_day < val.day) {
      age--;
    }
    console.log(age);
    this.nomiDetails.get('nomiage').setValue(age);
    if (age >= 18) {
      this.guardian = false;
      this.nomiDetails.get('guaTitle').clearValidators();
      this.nomiDetails.get('guaTitle').setValue('');
      this.nomiDetails.get('guaTitle').updateValueAndValidity();
      this.nomiDetails.get('guaname').clearValidators();
      this.nomiDetails.get('guaname').setValue('');
      this.nomiDetails.get('guaname').updateValueAndValidity();
      this.nomiDetails.get('guarelation').clearValidators();
      this.nomiDetails.get('guarelation').setValue('');
      this.nomiDetails.get('guarelation').updateValueAndValidity();
      this.nomiDetails.get('guaCNum').clearValidators();
      this.nomiDetails.get('guaCNum').setValue('');
      this.nomiDetails.get('guaCNum').updateValueAndValidity();
      this.nomiDetails.get('gua_address1').clearValidators();
      this.nomiDetails.get('gua_address1').setValue('');
      this.nomiDetails.get('gua_address1').updateValueAndValidity();
      this.nomiDetails.get('gua_address2').clearValidators();
      this.nomiDetails.get('gua_address2').setValue('');
      this.nomiDetails.get('gua_address2').updateValueAndValidity();
      this.nomiDetails.get('guacities').clearValidators();
      this.nomiDetails.get('guacities').setValue('');
      this.nomiDetails.get('guacities').updateValueAndValidity();
      this.nomiDetails.get('guastates').clearValidators();
      this.nomiDetails.get('guastates').setValue('');
      this.nomiDetails.get('guastates').updateValueAndValidity();
      this.nomiDetails.get('guapincode').clearValidators();
      this.nomiDetails.get('guapincode').setValue('');
      this.nomiDetails.get('guapincode').updateValueAndValidity();
      this.nomiDetails.get('guacountries').clearValidators();
      this.nomiDetails.get('guacountries').setValue('');
      this.nomiDetails.get('guacountries').updateValueAndValidity();
    } else {
      this.guardian = true;
      this.nomiDetails.get('guaTitle').setValidators(Validators.required);
      this.nomiDetails
        .get('guaname')
        .setValidators(
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ])
        );
      this.nomiDetails.get('guarelation').setValidators(Validators.required);
      this.nomiDetails
        .get('guaCNum')
        .setValidators(
          Validators.compose([
            Validators.maxLength(10),
            Validators.pattern('[0-9]{10}$'),
          ])
        );
      this.nomiDetails
        .get('gua_address1')
        .setValidators(
          Validators.compose([
            Validators.maxLength(35),
            Validators.pattern('[a-zA-Z0-9.,/#& ]*'),
            Validators.required,
          ])
        );
      this.nomiDetails
        .get('gua_address2')
        .setValidators(
          Validators.compose([
            Validators.maxLength(35),
            Validators.pattern('[a-zA-Z0-9.,/#& ]*'),
            Validators.required,
          ])
        );
      this.nomiDetails.get('guacities').setValidators(Validators.required);
      this.nomiDetails.get('guastates').setValidators(Validators.required);
      this.nomiDetails
        .get('guapincode')
        .setValidators(
          Validators.compose([
            Validators.pattern('[0-9]{6}'),
            Validators.required,
          ])
        );
      this.nomiDetails.get('guacountries').setValidators(Validators.required);
    }
  }

  getStateValue() {
    this.sqliteProvider.getStateList().then((data) => {
      this.master_states = data;
    });
  }

  getCityValue(state) {
    switch (state) {
      case 'nominee':
        let statecodeEntity = this.nomiDetails.controls.nomistates.value;
        this.sqliteProvider.getSelectedCity(statecodeEntity).then((data) => {
          this.nominee_cities = data;
        });
        break;
      case 'guardian':
        let statecodePresent = this.nomiDetails.controls.guastates.value;
        this.sqliteProvider.getSelectedCity(statecodePresent).then((data) => {
          this.guardian_cities = data;
        });
        // code block
        break;
      default:
        this.sqliteProvider.getAllCityValues().then((data) => {
          this.guardian_cities = data;
          this.nominee_cities = data;
        });
    }
  }

  fetchGuaranDetails() {
    this.sqlSupport.getCASADetails(this.refId, this.id).then((gua) => {
      if (gua.length > 0) {
        // this.accDetails.get('guaAvail').setValue(data[0].guaAvail);
        if (gua[0].guaAvail == 'Y') {
          this.sqliteProvider
            .getNomList(this.refId, gua[0].nomList)
            .then((data) => {
              console.log(JSON.stringify(data));
              this.nomiDetails.get('nomTitle').setValue(data[0].genTitle);
              this.nomiDetails
                .get('nominame')
                .setValue(data[0].firstname + ' ' + data[0].lastname);
              this.nomiDetails.get('nomdob').setValue(data[0].dob);
              this.nomiDetails
                .get('nomi_address1')
                .setValue(this.global.basicDec(data[0].perm_plots));
              this.nomiDetails
                .get('nomi_address2')
                .setValue(this.global.basicDec(data[0].perm_locality));
              this.nomiDetails
                .get('nomi_address3')
                .setValue(this.global.basicDec(data[0].perm_line3));
              this.nomiDetails
                .get('nomicities')
                .setValue(this.global.basicDec(data[0].perm_cities));
              this.nomiDetails
                .get('nomistates')
                .setValue(this.global.basicDec(data[0].perm_states));
              this.nomiDetails
                .get('nomipincode')
                .setValue(this.global.basicDec(data[0].perm_pincode));
              this.nomiDetails
                .get('nomicountries')
                .setValue(data[0].perm_countries);
              this.nomiDetails
                .get('nomiCNum')
                .setValue(this.global.basicDec(data[0].mobNum));
              this.leadId = data[0].coAppGuaId;
              this.sqlSupport
                .getNomineeDetails(this.refId, this.id)
                .then((data) => {
                  if (data.length > 0) {
                    this.fetchRelate = false;
                  } else {
                    this.fetchRelate = true;
                    this.nomiDetails.controls.nomrelation.setValue('');
                  }
                });
              this.submitDisable = true;
              let day = data[0].dob.substring(8, 10);
              let month = data[0].dob.substring(5, 7);
              let year = data[0].dob.substring(0, 4);
              let ageDate = {
                value: {
                  day: parseInt(day),
                  month: parseInt(month),
                  year: parseInt(year),
                },
              };
              this.calculate_age(ageDate);
            });
        } else {
          this.nomiDetails.get('nomTitle').setValue('');
          this.nomiDetails.get('nominame').setValue('');
          this.nomiDetails.get('nomdob').setValue('');
          this.nomiDetails.get('nomiage').setValue('');
          this.nomiDetails.get('nomrelation').setValue('');
          this.nomiDetails.get('nomi_address1').setValue('');
          this.nomiDetails.get('nomi_address2').setValue('');
          this.nomiDetails.get('nomi_address3').setValue('');
          this.nomiDetails.get('nomicities').setValue('');
          this.nomiDetails.get('nomistates').setValue('');
          this.nomiDetails.get('nomipincode').setValue('');
          this.nomiDetails.get('nomiCNum').setValue('');
          this.submitDisable = false;
          this.fetchRelate = false;
          this.leadId = '';
        }
      }
    });
  }

  getRelateValue(value) {
    this.fetchRelate = false;
  }

  getTitles() {
    this.sqliteProvider.getMasterDataUsingType('TitleMaster').then((data) => {
      this.titles = data;
    });
  }
  getRelationship() {
    this.sqliteProvider.getMasterDataUsingType('RelationShip').then((data) => {
      this.master_relations = data;
    });
  }

  callmaxdate() {
    let dd = this.today.getDate();
    let mm = this.today.getMonth() + 1; //January is 0!
    let yyyy = this.today.getFullYear();
    let years = this.today.getFullYear() + 20;
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    this.mindate = yyyy + '-' + mm + '-' + dd;
    // this.maxdate = years + '-' + mm + '-' + dd;
  }

  pincodeValidation(value) {
    if (value == 'nom') {
      if (this.nomiDetails.controls.nomipincode.value.length == 6) {
        let str = this.nomiDetails.controls.nomipincode.value;
        str = str.split('');
        if (
          str[0] == str[1] &&
          str[0] == str[2] &&
          str[0] == str[3] &&
          str[0] == str[4] &&
          str[0] == str[5]
        ) {
          this.nomiDetails.controls.nomipincode.setValue('');
          this.alertService.showAlert('Alert!', 'Given pincode is not valid!');
        }
      }
    } else if (value == 'guar') {
      if (this.nomiDetails.controls.guapincode.value.length == 6) {
        let str = this.nomiDetails.controls.guapincode.value;
        str = str.split('');
        if (
          str[0] == str[1] &&
          str[0] == str[2] &&
          str[0] == str[3] &&
          str[0] == str[4] &&
          str[0] == str[5]
        ) {
          this.nomiDetails.controls.guapincode.setValue('');
          this.alertService.showAlert('Alert!', 'Given pincode is not valid!');
        }
      }
    }
  }
}
