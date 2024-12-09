import { BehaviorSubject } from 'rxjs';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  HttpClient,
  HttpRequest,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpInterceptor,
} from '@angular/common/http';
import { GlobalService } from './global.service';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { SqliteService } from './sqlite.service';

import * as moment from 'moment';
import { CustomAlertControlService } from './custom-alert-control.service';
import { CustomLoadingControlService } from './custom-loading-control.service';
import { ApplicationStateService } from './application-state.service';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  apiURL = environment.apiURL;
  patch = environment.patch;
  status: any;
  public uploadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );
  public downloadProgress: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  dateTime = new Date();
  version: string;
  masterLink: any;

  constructor(
    public http: HTTP,
    public global: GlobalService,
    public httpAngular: HttpClient,
    public network: Network,
    public sqliteService: SqliteService,
    public alertService: CustomAlertControlService,
    public loadingService: CustomLoadingControlService,
    public as: ApplicationStateService
  ) {}

  //need to do httpInerseptor
  restApiCallAngular(method, data, isKarza?): any {
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert('Alert', 'Enable Internet connection!.');
      this.loadingService.globalLodingDismiss();
    } else {
      let link;
      if (isKarza == 'Y') {
        link = this.apiURL + `lendperfect/kaarza/${method}`;
      } else {
        link = this.apiURL + `lendperfect/LOSMobileRestServices/${method}`;
      }
      this.http.setDataSerializer('json');
      let token = this.as.token;
      let headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token: this.global.encMyReq(token),
        deviceId: this.global.encMyReq(this.as.deviceId),
      };
      let encryptData = this.global.encryptMyReq(data);
      let curDateTime = moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss');
      if (method == 'finalSubmission') {
        var exceptDocument = JSON.parse(JSON.stringify(data));
        exceptDocument.LeadMain.Lead.ApplicantDetails[0].AppImage = '';
        exceptDocument.LeadMain.Lead.CoApplicantDetails.length
          ? (exceptDocument.LeadMain.Lead.CoApplicantDetails[0].CoappAppImage =
              '')
          : exceptDocument.LeadMain.Lead.CoApplicantDetails;
        this.sqliteService.addAuditTrail(
          curDateTime,
          link,
          method + ' Request',
          JSON.stringify(exceptDocument)
        );
      } else {
        if (method != 'LoginDocument' && method != 'UploadDocs') {
          this.sqliteService.addAuditTrail(
            curDateTime,
            link,
            method + ' Request',
            JSON.stringify(data)
          );
        }
      }
      return new Promise((resolve, reject) => {
        this.global.getCertPinningStatus().then((data) => {
          if (data == true) {
            console.log('api link', link);
            console.log('api encryptData', encryptData);
            console.log('api headers', headers);
            this.http.post(link, encryptData, headers).then(
              (response) => {
                let decryRes = this.global.decryptMyRes(
                  JSON.parse(response['data'])
                );
                console.log(response, 'response');
                this.sqliteService.addAuditTrail(
                  curDateTime,
                  link,
                  method + ' Response',
                  JSON.stringify(decryRes)
                );
                resolve(JSON.parse(decryRes.data));
              },
              (error) => {
                reject(error);
                console.log(error, 'error');
                this.loadingService.globalLodingDismiss();
                this.alertService.showAlert('Alert', error);
                this.sqliteService.addAuditTrail(
                  curDateTime,
                  link,
                  method + ' Error Response',
                  JSON.stringify(error)
                );
              }
            );
          } else {
            this.loadingService.globalLodingDismiss();
            this.alertService.showAlert('Alert', 'Certificates pinning error!');
          }
        });
      });
    }
  }

  resetProgress() {
    this.uploadProgress.next(0);
    this.downloadProgress.next(0);
  }

  async getProdCodeByLoginGroup(value: any[]) {
    let userPrdCode = [];
    return new Promise(async (resolve, reject) => {
      if (value) {
        for (var i = 0; i < value.length; i++) {
          await this.sqliteService
            .getProductValuesCount(value[i])
            .then((data: any) => {
              userPrdCode.push({
                main: data[0].prdSchemeId,
                sub: data[0].prdCode,
              });
            });
          if (i == value.length - 1) {
            resolve(userPrdCode);
          }
        }
      } else {
        resolve([]);
      }
    });
  }
}
