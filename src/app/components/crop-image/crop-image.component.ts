import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  LoadingController,
  NavParams,
  NavController,
  ModalController,
} from '@ionic/angular';
import Cropper from 'cropperjs';
import { CustomLoadingControlService } from 'src/providers/custom-loading-control.service';
import { GlobalService } from 'src/providers/global.service';

@Component({
  selector: 'app-crop-image',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss'],
})
export class CropImageComponent implements OnInit {
  @ViewChild('image') imageElement: ElementRef;
  public cropper: Cropper;
  myImage = null;
  croppedImage = null;
  location = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private modal: ModalController,
    public global: GlobalService,
    public loadingService: CustomLoadingControlService
  ) {
    this.myImage = this.navParams.get('imgUrl');
    // this.location = this.navParams.get('location');
  }

  ngOnInit() {
    this.loadingService.globalLodingPresent('Please wait...');
  }

  ionViewDidEnter() {
    this.loadingService.globalLodingDismiss();
    this.cropper = new Cropper(this.imageElement.nativeElement, {
      zoomable: true,
      scalable: true,
      dragMode: 'crop',
      responsive: true,
      checkCrossOrigin: true,
      autoCrop: true,
      autoCropArea: 0.8,
      movable: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      crop: () => {
        const canvas = this.cropper.getCroppedCanvas();
      },
    });
  }

  reset() {
    this.cropper.reset();
  }

  clear() {
    this.cropper.clear();
    this.modal.dismiss();
  }

  zoomout() {
    this.cropper.zoom(-1);
  }
  zoomin() {
    this.cropper.zoom(1);
  }

  rotate() {
    this.cropper.rotate(90);
  }

  save() {
    try {
      let croppedImgB64String: string = this.cropper
        .getCroppedCanvas()
        .toDataURL('image/jpeg', 50 / 100);
      this.croppedImage = croppedImgB64String;
      let realData = this.croppedImage.split(',')[1];
      let blob = this.b64toBlob(realData, 'image/jpeg');
      this.modal.dismiss(this.croppedImage);
    } catch (error) {
      console.log(error, 'CropImgComponent-save');
    }
  }

  b64toBlob(b64Data, contentType) {
    try {
      contentType = contentType || '';
      var sliceSize = 512;
      var byteCharacters = atob(b64Data);
      var byteArrays = [];
      for (
        var offset = 0;
        offset < byteCharacters.length;
        offset += sliceSize
      ) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      var blob = new Blob(byteArrays, { type: contentType });
      return blob;
    } catch (error) {
      console.log(error, 'CropImgComponent-b64toBlob');
    }
  }
}
