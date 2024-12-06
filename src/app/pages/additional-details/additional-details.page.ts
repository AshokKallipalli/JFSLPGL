import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController, NavParams } from '@ionic/angular';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { SquliteSupportProviderService } from 'src/providers/squlite-support-provider.service';

@Component({
  selector: 'app-additional-details',
  templateUrl: './additional-details.page.html',
  styleUrls: ['./additional-details.page.scss'],
})
export class AdditionalDetailsPage implements OnInit {
  submitDisable: boolean = false;
  additionalData: FormGroup;
  userType: any;
  refId: number;
  id: number;
  aDtlId: number;
  stateCode: any;
  stateName: any;

  customPopoverOptions = {
    cssClass: 'custom-popover',
  };

  appDisable: boolean = false;

  master_owners: any;
  master_relations: any;
  master_mortgages: any;
  master_properties: any;
  valuations = [
    { code: 'Y', name: 'Yes' },
    { code: 'N', name: 'No' },
  ];
  selectOptions = {
    cssClass: 'remove-ok',
  };

  master_cities: any;
  master_states: any;

  dummy_master: any = [
    { CODE: '1', NAME: 'Dummy 1' },
    { CODE: '2', NAME: 'Dummy 2' },
    { CODE: '3', NAME: 'Dummy 3' },
    { CODE: '4', NAME: 'Dummy 4' },
    { CODE: '5', NAME: 'Dummy 5' },
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    // public viewCtrl: ViewController,
    public globFunc: GlobalService,
    public sqlSupport: SquliteSupportProviderService,
    public router: Router,
    public loadingService: CustomLoadingControlService
  ) {
    this.userType = this.globalData.getborrowerType();
    this.refId = this.globalData.getrefId();
    this.id = this.globalData.getId();

    this.getStateValue();
    this.getAdditionalDtlData();

    this.additionalData = this.formBuilder.group({
      ownType: ['', Validators.required],
      owner: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
          Validators.required,
        ]),
      ],
      owner1: [
        '',
        Validators.compose([
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z ]*'),
        ]),
      ],
      address1: [
        '',
        Validators.compose([Validators.maxLength(35), Validators.required]),
      ],
      address2: [
        '',
        Validators.compose([Validators.maxLength(35), Validators.required]),
      ],
      states: ['', Validators.required],
      cities: ['', Validators.required],
      district: ['', Validators.required],
      pincode: [
        '',
        Validators.compose([
          Validators.pattern('[0-9]{6}'),
          Validators.required,
        ]),
      ],
      country: ['', Validators.required],
      landmark: [
        '',
        Validators.compose([Validators.maxLength(35), Validators.required]),
      ],
      property: ['', Validators.required],
    });

    if (this.navParams.get('fieldDisable')) {
      this.submitDisable = true;
    } else {
      this.submitDisable = false;
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

  ionViewWillEnter() {
    this.globFunc.statusbarValuesForPages();
  }

  ionViewDidEnter() {
    this.globFunc.statusbarValuesForPages();
  }

  existPage() {
    this.router.navigate(['/ExistingPage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }
  homePage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  additionalDatasave(value) {
    this.loadingService.globalLodingPresent('Please wait...');
    // let data = [this.refId, this.id, value.applType, value.owner, value.address1, value.address2, value.states, value.cities, value.pincode, value.ownType, value.property, value.relation, value.mortgage, value.valuation];
    this.sqliteProvider
      .addAdditionalData(this.refId, this.id, value, this.aDtlId)
      .then((data) => {
        this.aDtlId = data.insertId;
      });
  }

  getAdditionalDtlData() {
    this.sqliteProvider.getAdditionDtlData(this.refId, this.id).then((data) => {
      this.additionalData = this.formBuilder.group({
        ownType: [data[0].ownType, Validators.required],
        owner: [
          data[0].owner,
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
            Validators.required,
          ]),
        ],
        owner1: [
          data[0].owner1,
          Validators.compose([
            Validators.maxLength(30),
            Validators.pattern('[a-zA-Z ]*'),
          ]),
        ],
        address1: [
          data[0].address1,
          Validators.compose([Validators.maxLength(35), Validators.required]),
        ],
        address2: [
          data[0].address2,
          Validators.compose([Validators.maxLength(35), Validators.required]),
        ],
        states: [data[0].states, Validators.required],
        cities: [data[0].cities, Validators.required],
        district: [data[0].district, Validators.required],
        pincode: [
          data[0].pincode,
          Validators.compose([
            Validators.pattern('[0-9]{6}'),
            Validators.required,
          ]),
        ],
        country: [data[0].country, Validators.required],
        landmark: [
          data[0].landmark,
          Validators.compose([Validators.maxLength(35), Validators.required]),
        ],
        property: [data[0].property, Validators.required],
      });
      this.additionalData.get('cities').setValue(data[0].cities);
      this.aDtlId = data[0].adtlId;
      this.stateCode = data[0].states;
      this.getCityValue('N');
      if (data[0].applType == 'A') {
        this.appDisable = true;
      }
    });
  }

  getStateValue() {
    this.sqliteProvider.getStateList().then((data) => {
      this.master_states = data;
      // alert('get states: ' + JSON.stringify(this.master_states));
    });
  }

  getCityValue(val) {
    this.sqliteProvider.getSelectedCity(this.stateCode).then((data) => {
      this.master_cities = data;
      if (val == 'Y') {
        this.additionalData.get('cities').setValue('');
        this.additionalData.get('cities').updateValueAndValidity();
      }
      // alert('get city: ' + JSON.stringify(this.master_cities));
    });
  }

  stateChng() {
    this.master_states.forEach((element) => {
      if (element.stateCode == this.stateName) {
        this.stateCode = element.stateCode;
      }
    });
    this.getCityValue('Y');
  }

  applicantChange(value) {
    if (value == 'A') {
      this.additionalData.get('relation').setValue('10');
      this.additionalData.get('relation').updateValueAndValidity();
      this.appDisable = true;
    } else {
      this.additionalData.get('relation').clearValidators();
      this.additionalData.get('relation').setValue('');
      this.appDisable = false;
    }
  }
}
