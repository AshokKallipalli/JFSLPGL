import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';
import { GlobalService } from 'src/providers/global.service';
import { RestService } from 'src/providers/rest.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import { Plugins } from '@capacitor/core';
const { WebPConvertor } = Plugins;

@Component({
  selector: 'app-capture-image',
  templateUrl: './capture-image.component.html',
  styleUrls: ['./capture-image.component.scss'],
})
export class CaptureImageComponent implements OnInit {
  @ViewChild('mySliderReference', { static: false }) sliderReference: IonSlides;
  @ViewChild('convertedSlide', { static: false }) convertedSlide: IonSlides;

  currentSlide: number = 0;
  convertedCurrentSlide: number = 0;
  capturedImage = [];
  readedImageFromPhoneDirectory = [];
  uploadingDoc = [];
  convertedImg = [];
  size: number;
  saved = true;

  constructor(
    private globFunc: GlobalService,
    public modalController: ModalController,
    private master: RestService
  ) {}

  async onSlideChanged(event) {
    this.currentSlide = await this.sliderReference.getActiveIndex();
  }

  async onConvertedSlideChanged(event) {
    this.convertedCurrentSlide = await this.convertedSlide.getActiveIndex();
    this.currentSlide = this.convertedCurrentSlide;
    this.sliderReference.slideTo(this.currentSlide);
  }

  ngOnInit() {}

  clickCamera() {
    this.globFunc.takeImage('document').then((data) => {
      console.log(`Captured data ${data}`);
      this.capturedImage.push(data);
      // this.saveImageInFolder(data,this.capturedImage.length)
    });
  }

  async saveImageInFolder(url, length, filepath?) {
    try {
      const imageData = url;
      const filePath = filepath ? filepath : `/Doc${length}.jpg`;
      await Filesystem.writeFile({
        path: filePath,
        data: imageData,
        directory: Directory.External, // Use Directory.Data for the private folder you created
      });
      alert(filePath);
      this.readImageFile(filePath);
      console.log('Image saved to folder:', filePath);
    } catch (error) {
      alert(error);
      console.error('Error saving image:', error);
    }
  }

  async readImageFile(path) {
    try {
      const filePath = path;
      const image = await Filesystem.readFile({
        path: filePath,
        directory: Directory.External,
      });
      alert(image);
      this.readedImageFromPhoneDirectory.push(image.data);
      console.log('read image', image);
    } catch (err) {
      alert(err);
      console.log(err);
    }
  }

  deleteDoc() {
    this.capturedImage.splice(this.currentSlide, 1);
  }

  // uploadImg() {
  //   let appLeadId = 1245424522;
  //   let promoIDType = 'KYC';
  //   if (this.capturedImage.length > 0) {
  //     for (let i = 0; i < this.capturedImage.length; i++) {
  //       let docReq = {
  //         "DocId": promoIDType,
  //         "Document": this.capturedImage[i],
  //         "leadID": appLeadId,
  //         "Mandatory": '',
  //         "DocName": "Img_" + appLeadId + "_" + promoIDType + "_" + i + ".jpg",
  //         "KarzaDetails": ''
  //       }
  //       this.uploadingDoc.push(docReq)
  //     }

  //     let docs_upload = {
  //       "OtherDoc": {
  //         "DocAppno": '14350000003756',
  //         "OtherDocs": this.uploadingDoc
  //       }
  //     }
  //     this.globFunc.globalLodingPresent('Please wait...')
  //     this.master.restApiCallAngular('LoginDocument', docs_upload).then(data => {
  //       if (data) {
  //         this.globFunc.globalLodingDismiss();
  //         this.alertService.showAlert('Alert', data.ErrorDesc)
  //       }
  //     })
  //   } else {
  //     this.alertService.showAlert('Alert', 'Please Capture Image...')
  //   }
  // }

  closeModal() {
    this.modalController.dismiss();
  }

  async convertToWebP() {
    try {
      console.log(WebPConvertor);
      // const result = await WebPConvertor['convertToWebP']({
      //   path:
      //   // `/storage/emulated/0/Android/data/com.jfs.vl/files/${this.capturedImage[i].Name}`,
      // });
      // alert(`WebpConversion.convertToWebP => ${result.value}`);
    } catch (e) {
      alert(`Error From WebPConvertor Plugin => ${e}`);
    }
  }

  async convertToWebPBase64() {
    try {
      console.log(WebPConvertor);
      this.globFunc.globalLodingPresent('Please Wait...');
      if (WebPConvertor) {
        for (let i = 0; i < this.capturedImage.length; i++) {
          const result = await WebPConvertor['convertToWebP']({
            path: `/storage/emulated/0/Android/data/com.jfs.vlwebp/files/${this.capturedImage[i].Name}`,
          });
          if (result.data) {
            // alert(`WebpConversion.convertToWebP => ${result.value}`);
            let path = result.data;
            let size = result.data.length / 1000;
            let chargesFormatValue = size.toFixed(2).toString().split('.');
            if (chargesFormatValue[1] <= '49') {
              size = Math.floor(size);
            } else {
              size = Math.ceil(size);
            }
            this.convertedImg.push({ path: path, size: size });
          }
        }
        this.globFunc.globalLodingDismiss();
      }
    } catch (e) {
      this.globFunc.globalLodingDismiss();
      alert(`Error From WebPConvertor Plugin => ${e}`);
    }
  }

  save() {
    this.saved = false;
  }
}
