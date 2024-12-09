import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class CustomAlertControlService {
  constructor(public alertCtrl: AlertController) {}

  async showAlert(tittle, subtitle, message?: string, buttons?: any[]) {
    const alert = await this.alertCtrl.create({
      header: tittle,
      subHeader: subtitle,
      message: message,
      buttons: this._buttonBehaviour(buttons),
    });
    await alert.present();
  }

  _buttonBehaviour(buttons?: any[]) {
    if (buttons) {
      return buttons;
    } else {
      return ['OK'];
    }
  }

  confirmationVersionAlert(title, message, page?): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: title,
        message,
        buttons: [
          {
            text: 'OK',
            handler: () => {
              resolve(true);
            },
          },
        ],
      });
      alert.present();
    });
  }

  async logout() {
    let alert = await new AlertController().create({
      header: 'Alert',
      message: 'Are you sure to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('cancel');
          },
        },
        {
          text: 'Sure',
          role: 'ok',
          handler: () => {},
        },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role;
  }

  async proccedOk(title, subtitle): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: title,
        subHeader: subtitle,
        backdropDismiss: false,
        cssClass: 'alertBox',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              resolve('no');
            },
          },
          {
            text: 'Ok',
            role: 'ok',
            handler: () => {
              resolve('yes');
            },
          },
        ],
      });
      await alert.present();
    });
  }

  confirmationAlert(title, message, page?): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: title,
        message,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              resolve('No');
            },
          },
          {
            text: 'Yes',
            role: 'ok',
            handler: () => {
              resolve('Yes');
            },
          },
        ],
      });
      alert.present();
    });
  }

  async showVideoAlert(videoFile) {
    let alert = await this.alertCtrl.create({
      header: 'INSPECTION VIDEO',
      cssClass: 'videoAlert',
      message: `<video class="videoLayout" controls preload="metadata" width=240 height=350><source src=${videoFile}#t=0.5 type='video/mp4'></video> `,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            console.log('working');
          },
        },
      ],
    });
    alert.present();
  }

  async showScore() {
    const alert = await this.alertCtrl.create({
      header: 'CIBIL REQUIRED SCORE',
      cssClass: 'alertHeader',
      message: `<img src="../../../assets/imgs/credit1.jpg"><br> <center><strong>750</strong></center>`,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            console.log('working');
          },
        },
      ],
    });
    alert.present();
  }

  async showStatusAlert(status) {
    const alert = await this.alertCtrl.create({
      cssClass: 'status',
      header: 'Application Status',
      message: status,
      buttons: ['OK'],
    });
    alert.present();
  }

  customerConfirmationAlert(title, message, page?): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: title,
        message,
        buttons: [
          {
            text: 'Individual',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              resolve('No');
            },
          },
          {
            text: 'Non-Individual',
            role: 'ok',
            handler: () => {
              resolve('Yes');
            },
          },
        ],
      });
      alert.present();
    });
  }

  async presentPrompt(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let alert = await this.alertCtrl.create({
        header: 'OTP',
        message: 'Please Enter your OTP.',
        backdropDismiss: false,
        inputs: [
          {
            name: 'otpNumber',
            placeholder: 'OTP',
            type: 'tel',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: (data) => {
              console.log('Cancel clicked');
            },
          },
          {
            text: 'Verify',
            handler: (data) => {
              resolve('Yes');
            },
          },
        ],
      });
      alert.present();
    });
  }
}
