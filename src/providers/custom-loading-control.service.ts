import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class CustomLoadingControlService {
  _loading: boolean = false;

  constructor(public loadingCtrl: LoadingController) {}

  async globalLodingPresent(msg, time?) {
    this._loading = true;
    return await this.loadingCtrl
      .create({
        message: msg,
        duration: time,
        spinner: 'circles',
        cssClass: 'custom-loading',
      })
      .then((a) => {
        a.present().then(() => {
          if (!this._loading) {
            a.dismiss().then(() => console.log('abort presenting'));
          }
        });
      });
  }

  async globalLodingDismiss() {
    this._loading = false;
    return await this.loadingCtrl
      .dismiss()
      .then(() => console.log('dismissed'));
  }
}
