import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController, NavParams } from '@ionic/angular';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';

@Component({
  selector: 'app-cif-data',
  templateUrl: './cif-data.page.html',
  styleUrls: ['./cif-data.page.scss'],
})
export class CifDataPage {
  leadStatus: any;
  cifData: any;
  leadId: any;
  GrefId: any;
  GId: any;

  constructor(
    public navCtrl: NavController,
    public route: ActivatedRoute,
    public globalData: DataPassingProviderService,
    public navParams: NavParams,
    public router: Router,
    public loadingService: CustomLoadingControlService
  ) {
    this.route.queryParamMap.subscribe((data: any) => {
      let chooseCustdata = data.params;
      this.cifData = JSON.parse(chooseCustdata.cifData);
      this.leadId = chooseCustdata.leadId;
      this.GrefId = chooseCustdata.GrefId;
      this.GId = chooseCustdata.GId;
    });

    // if (this.navParams.get("cifData")) {
    //   this.cifData = this.navParams.get("cifData");
    // }
    if (this.route.snapshot.queryParamMap.get('leadStatus')) {
      this.leadStatus = this.route.snapshot.queryParamMap.get('leadStatus');
      //this.globalData.setborrowerType(this.userType);
    }

    // if (this.navParams.get("cifData")) {
    //   this.leadId = this.navParams.get("leadId");
    //   console.log("CIF: ", this.leadId);
    // }
    this.globalData.setrefId(this.globalData.getrefId());
    this.globalData.setId(this.globalData.getId());
  }

  presentLoadingCustomNo() {
    this.globalData.setrefId(this.globalData.getrefId());
    this.globalData.setId(this.globalData.getId().slice(2));
    // this.navCtrl.pop();
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  presentLoadingCustomYes() {
    this.loadingService.globalLodingPresent('Please wait...');
    this.globalData.setCustType('E');
    // this.navCtrl.pop();
    this.globalData.setCifData(this.cifData);
    let userType = this.globalData.getborrowerType();
    this.loadingService.globalLodingDismiss();
    // let navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     "cifData": JSON.stringify({
    //       leadStatus: this.leadStatus,
    //       leadId: this.leadId,
    //       userType: userType,
    //       GrefId: this.GrefId,
    //       GId: this.GId
    //     })
    //   }
    // };
    this.router.navigate(['/NewapplicationPage'], {
      queryParams: {
        leadStatus: this.leadStatus,
        leadId: this.leadId,
        userType: userType,
        GrefId: this.GrefId,
        GId: this.GId,
      },
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
}
