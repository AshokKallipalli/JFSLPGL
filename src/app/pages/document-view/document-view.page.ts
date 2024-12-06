import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  MenuController,
  ModalController,
  NavController,
  NavParams,
} from '@ionic/angular';
import { DataPassingProviderService } from 'src/providers/data-passing-provider.service';
import { GlobalService } from 'src/providers/global.service';
import { SqliteService } from 'src/providers/sqlite.service';
import { PicproofPage } from '../picproof/picproof.page';
import { CustomAlertControlService } from 'src/providers/custom-alert-control.service';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.page.html',
  styleUrls: ['./document-view.page.scss'],
})
export class DocumentViewPage {
  documents: any;
  userInfo: any;
  proofImgs = [];
  proofImglen: any = 0;
  refId: any;
  id: any;
  pproofId: any;
  custType: any;
  submitStatus = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public sqliteProvider: SqliteService,
    public globalData: DataPassingProviderService,
    public menuCtrl: MenuController,
    //  public viewCtrl: ViewController,
    public globFunc: GlobalService,
    public router: Router,
    public alertService: CustomAlertControlService
  ) {
    console.log('Document', this.navParams.get('document'));
    this.userInfo = this.navParams.get('userInfo');
    this.documents = this.navParams.get('document');
    this.custType = this.navParams.get('custType');
    this.submitStatus = this.navParams.get('submitStatus');
    this.documents = this.documents.filter((data) => (data.imgs = []));
    this.refId = this.userInfo.refId;
    this.id = this.userInfo.id;
    this.getProofImg();
  }

  ionViewDidLoad() {
    this.menuCtrl.enable(true, 'mymenu');
  }

  async viewIdProof(doc, imgs) {
    let modal = await this.modalCtrl.create({
      component: PicproofPage,
      componentProps: { proofpics: imgs, submitstatus: this.submitStatus },
    });
    modal.onDidDismiss().then((imgData) => {
      // if (imgData.length != 0) {
      this.documents.filter((imgdoc) => {
        if (imgdoc.pproofId == doc.pproofId) {
          imgdoc.imgs = imgData.data;
        }
      });
      this.updateimg(doc.pproofId, imgData.data, doc.proofName);
      // }
    });
    modal.present();
  }

  getProofImg() {
    for (let i = 0; i < this.documents.length; i++) {
      this.sqliteProvider
        .getpromoterproofImages(this.documents[i].pproofId)
        .then((imgData) => {
          if (0 < imgData.length) {
            this.documents.filter((imgdoc) => {
              if (imgdoc.pproofId == this.documents[i].pproofId) {
                for (let j = 0; j < imgData.length; j++) {
                  imgdoc.imgs.push(imgData[j]);
                }
              }
            });
          }
        })
        .catch((Error) => {
          console.log(Error);
        });
    }
  }

  updateimg(upid, imgData, proofName) {
    this.sqliteProvider
      .removepromoterproofImages(upid)
      .then((data) => {
        for (let i = 0; i < imgData.length; i++) {
          this.sqliteProvider
            .addpromoterproofImages(
              this.refId,
              this.id,
              imgData[i].imgpath,
              upid
            )
            .then((data) => {})
            .catch((Error) => {
              console.log('Failed!' + Error);
              this.alertService.showAlert('Alert!', 'Document Insert Failed!');
            });
        }
      })
      .catch((Error) => {
        console.log('Failed!' + Error);
        this.alertService.showAlert('Alert!', 'Document Insert Failed!');
      });
  }

  homepage() {
    this.router.navigate(['/JsfhomePage'], {
      skipLocationChange: true,
      replaceUrl: true,
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
