import { Network } from '@awesome-cordova-plugins/network/ngx';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
// import { AccessTokenRequest, ORPAuthRequestNew, ORPAuthRequestUsed } from 'src/utility/AppConstants';
import { GlobalService } from './global.service';
import { SqliteService } from './sqlite.service';
import { environment } from 'src/environments/environment';
import { CustomAlertControlService } from './custom-alert-control.service';

// import { Network } from '@awesome-cordova-plugins/network/ngx';
// import { HttpClient } from '@angular/common/http';
// import { GlobalService } from './global.service';
// import { Injectable } from '@angular/core';
// import { HTTP } from '@awesome-cordova-plugins/http/ngx';
// import { SqliteService } from './sqlite.service';

@Injectable()
export class OnRoadPriceService {
  apiUrl;
  dateTime = new Date();
  make: string;
  model: string;
  varient: string;
  category: string;
  uatLive: boolean;
  accessTokenRequest: AccessTokenRequest;
  constructor(
    public http: HttpClient,
    public global: GlobalService,
    public httpAngular: HttpClient,
    public alertService: CustomAlertControlService,
    public network: Network,
    public sqliteService: SqliteService
  ) {
    this.apiUrl = ORPApiStrings.url;
    this.uatLive = environment.uatlive;
    this.getUserCredentials();
  }

  /**
   * @method getUserCredentials
   * @description Function will return the login Credentials for the API based on the Env...
   * @author HariHaraSuddhan S
   */
  async getUserCredentials(refresh?: boolean) {
    let userCredentials = UserCredentials;
    if (refresh) {
      this.accessTokenRequest = {
        grant_type: 'password',
        client_id: userCredentials.clientIdPre,
        client_secret: userCredentials.clientSecretPre,
        refresh_token: localStorage.getItem('refresh_token'),
      };
    } else {
      // For Pre-Prod or UAT this request...
      if (this.uatLive) {
        this.accessTokenRequest = {
          grant_type: 'password',
          client_id: userCredentials.clientIdPre,
          client_secret: userCredentials.clientSecretPre,
          username: userCredentials.usernamePre,
          password: userCredentials.passwordPre,
        };
      } else {
        // For Production this request...
        this.accessTokenRequest = {
          grant_type: 'password',
          client_id: userCredentials.clientIdProd,
          client_secret: userCredentials.clientSecretProd,
          username: userCredentials.usernameProd,
          password: userCredentials.passwordProd,
        };
      }
    }
  }

  /**
   * @method getAccessTokenCall
   * @description Function helps to generate accessToken from Droom API to get Bike details from the API.
   * @author HariHaraSuddhan S
   */
  async getAccessTokenCall() {
    try {
      return new Promise(async (resolve, reject) => {
        this.global.globalLodingPresent('Please Wait...');
        let link = `${this.apiUrl}v1/oauth/token`;
        let body = this.accessTokenRequest;
        await this.http.post(link, body).subscribe(
          (response: any) => {
            if (response.access_token) {
              localStorage.setItem('access_token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);
              this.global.globalLodingDismiss();
              resolve(true);
            } else {
              resolve(false);
              this.alertService.showAlert('Alert', response.message);
            }
          },
          (err) => {
            console.log(err, 'ORP getAccessTokenCall');
            resolve(true);
          }
        );
      });
    } catch (error) {
      console.log(`getDroomAccessToken ${error}`);
    }
  }

  /**
   * @method getRefreshTokenCall
   * @description Function helps to generate accessToken with help of Refresh Token.
   * @author HariHaraSuddhan S
   */
  // async getRefreshTokenCall(method?, data?, v?) {
  //   try {
  //     return new Promise(async (resolve, reject) => {
  //       this.global.globalLodingPresent('Please Wait...');
  //       let link = `${this.apiUrl}v1/oauth/token`;
  //       let body = this.accessTokenRequest;
  //       await this.http.post(link, body).subscribe((response: any) => {
  //         if (response.access_token) {
  //           localStorage.setItem('access_token', response.access_token);
  //           localStorage.setItem('refresh_token', response.refresh_token);
  //           this.global.globalLodingDismiss();
  //           resolve(true);
  //           this.onRoadPriceApiCall(method, data, v);
  //         } else {
  //           resolve(false);
  //           this.global.showAlert('Alert', response.message)
  //         }
  //       }, err => {
  //         console.log(err, 'ORP getAccessTokenCall');
  //         resolve(true);
  //       })
  //     })
  //   } catch (error) {
  //     console.log(`getDroomAccessToken ${error}`);
  //   }
  // }

  /**
   * @method onRoadPriceApiCall
   * @description Function helps to get Bike details from the Droom API based on the request response will retrun here.
   * @author HariHaraSuddhan S
   */
  async onRoadPriceApiCall(method: ORPApiStrings, data: any, v?: string) {
    let headers;
    let endPoint = `${this.apiUrl}${method}`;
    if (this.network.type == 'none' || this.network.type == 'unknown') {
      this.alertService.showAlert('Alert', 'Enable Internet connection!.');
      this.global.globalLodingDismiss();
    } else {
      return new Promise((resolve, reject) => {
        let headers = {
          headers: new HttpHeaders({
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          }),
        };
        let curDateTime = moment(this.dateTime).format('YYYY-MM-DD HH:mm:ss');
        console.log(endPoint);
        this.http.post(endPoint, data, headers).subscribe(
          async (response: any) => {
            // if (response.message.includes("authorization header is mandatory and must be correct")) {
            //   await this.getRefreshTokenCall(method, data, v);
            // } else {
            console.log(response, 'response');
            this.sqliteService.addAuditTrail(
              curDateTime,
              endPoint,
              method + ' Response',
              JSON.stringify(response)
            );
            resolve(response);
            // }
          },
          async (err: HttpErrorResponse) => {
            if (err.status === 401) {
              this.handle401Error(method, data, v);
            } else {
              // await this.getRefreshTokenCall(method, data, v);
            }
          }
        );
      });
    }
  }

  async handle401Error(method: ORPApiStrings, data: any, v?: string) {
    localStorage.setItem('access_token', localStorage.getItem('refresh_token'));
    this.onRoadPriceApiCall(method, data, v);
  }

  /**
   * @method frameRequestORPNew
   * @description Function helps to frame the request based on user selection and it will retrun
   * the request to onRoadPriceApiCall().
   * @author HariHaraSuddhan S
   */

  async frameRequestORPNew(
    type: string,
    value: string,
    year?: string,
    brandName?: string,
    city?: string
  ) {
    let request: ORPAuthRequestNew;
    let response;
    let endPoint = ORPApiStrings.endPointCatalog;
    return new Promise(async (resolve, reject) => {
      if (value) {
        switch (type) {
          case ORPApiStrings.category:
            this.category = value;
            request = {
              category: this.category,
            };
            break;
          case ORPApiStrings.model:
            this.make = value;
            request = {
              category: this.category,
              make: this.make,
            };
            break;
          case ORPApiStrings.variant:
            this.model = value;
            request = {
              category: this.category,
              make: this.make || brandName,
              model: this.model,
              year: year,
            };
            break;
          case ORPApiStrings.ORP:
            this.varient = value;
            request = {
              category: this.category,
              make: this.make,
              model: this.model,
              trim: this.varient,
              year: year,
              city: city,
            };
            // endPoint = 'v2/onroad-price'
            endPoint = ORPApiStrings.endPointORP;
            break;
          default:
            break;
        }
        response = await this.onRoadPriceApiCall(endPoint, request);
        if (response.code == 'success') {
          resolve(response.data);
        } else {
          this.alertService.showAlert(
            'Alert',
            `${response.code} ${response.message}`
          );
        }
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * @method getRCDetails
   * @description Function helps to fetch the RC Details from user input.
   * @author HariHaraSuddhan S
   */

  async getRCDetails(value) {
    let request: RCNumberRequest;
    // let endPoint: string = 'enterprise-used-price-range';
    let endPoint = ORPApiStrings.endPointRC;
    let response;
    try {
      request = {
        rc_number: value,
      };
      response = await this.onRoadPriceApiCall(endPoint, request);
      if (response.code == 'success') {
        return response.data;
      } else {
        this.alertService.showAlert(
          'Alert',
          `${response.code} ${response.message}`
        );
      }
    } catch (error) {
      console.log(error, 'frameRequestORPUsed');
    }
  }

  /**
   * @method getRCDetails
   * @description Function helps to get the used vehicle price range from the API based on the user input details.
   * @author HariHaraSuddhan S
   */

  async frameRequestORPUsed(value) {
    let request: ORPAuthRequestUsed;
    // let endPoint: string = 'enterprise-used-price-range';
    let endPoint = ORPApiStrings.endPointUsedP;
    let response;
    try {
      request = {
        transaction_type: 'b',
        customer_type: 'dealer',
        make: value.make,
        model: value.model,
        year: value.year,
        trim: value.trim,
        city: value.city,
        kms_driven: value.kms_driven,
        noOfOwners: value.noOfOwners,
      };
      response = await this.onRoadPriceApiCall(endPoint, request);
      if (response.code == 'success') {
        return response.data;
      } else {
        this.alertService.showAlert(
          'Alert',
          `${response.code} ${response.message}`
        );
      }
    } catch (error) {
      console.log(error, 'frameRequestORPUsed');
    }
  }
}

export interface AccessTokenRequest {
  grant_type: string;
  client_id: string;
  client_secret: string;
  username?: string;
  password?: string;
  refresh_token?: string;
}

export interface ORPAuthRequestUsed {
  transaction_type: string;
  customer_type: string;
  make: string;
  model: string;
  year: string;
  trim: string;
  kms_driven: string;
  city: string;
  noOfOwners: string;
}

export interface RCNumberRequest {
  rc_number: string;
}

export interface ORPAuthRequestNew {
  category: string;
  make?: string;
  model?: string;
  year?: string;
  trim?: string;
  city?: string;
}

export enum ORPApiStrings {
  url = 'https://apig.droom.in/dss/',
  endPointCatalog = 'enterprise-catalog',
  endPointORP = 'v2/onroad-price',
  endPointUsedP = 'enterprise-used-price-range',
  endPointRC = 'enterprise-history-report',
  category = 'category',
  model = 'model',
  variant = 'variant',
  ORP = 'ORP',
}

export enum UserCredentials {
  usernamePre = 'kaustubh.prahladka@janabank.com',
  passwordPre = '2ArAHY322',
  clientSecretPre = 'dd8538e4e1dea8e218ca1f65dce6d63faecb5e9628f2d58adbf161667acc8943',
  clientIdPre = '9486339',
  usernameProd = 'anubhav.goel@janabank.com',
  passwordProd = '2ArAHY320',
  clientSecretProd = '42471dc9c8dbc5ac179d9051fc9ae35c990c0ae3197615f92861d63ebf8dcf7a',
  clientIdProd = '9486338',
}

// OLD Lines of Code..................................................................
// import { Network } from '@awesome-cordova-plugins/network/ngx';
// import { HttpClient } from '@angular/common/http';
// import { GlobalService } from './global.service';
// import { Injectable } from '@angular/core';
// import { HTTP } from '@awesome-cordova-plugins/http/ngx';
// import { SqliteService } from './sqlite.service';

// import * as moment from 'moment';
// // import { AccessTokenRequest, ORPAuthRequestNew, ORPAuthRequestUsed } from 'src/utility/AppConstants';

// import * as AppConstants from 'src/utility/AppConstants';
// import { Observable, Subject, switchMap } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class OnRoadPriceService {
//   apiUrl: string;
//   dateTime = new Date();
//   make: string
//   model: string
//   varient: string
//   category: string
//   accessTokenRequest: AppConstants.AccessTokenRequest;
//   choosedVehicleValue: AppConstants.storedVehicleValue;
//   private ORPRequestFactoryCall = new Subject<{ endPoint: string, request: any }>();
//   public ORPRequestFactoryCallObs$ = this.ORPRequestFactoryCall.asObservable();
//   constructor(public http: HTTP, public global: GlobalService, public httpAngular: HttpClient,
//     public network: Network, public sqliteService: SqliteService
//   ) {
//     this.apiUrl = AppConstants.ORPApiStrings.url;
//     // If Pre-Prod or UAT Enable this request...
//     this.accessTokenRequest = {
//       grant_type: 'password',
//       client_id: '9486339',
//       client_secret: 'dd8538e4e1dea8e218ca1f65dce6d63faecb5e9628f2d58adbf161667acc8943',
//       username: 'kaustubh.prahladka@janabank.com',
//       password: '2ArAHY322'
//     }

//     // If Production Enable this request...
//     // this.accessTokenRequest = {
//     //   grant_type: 'password',
//     //   client_id: '9486338',
//     //   client_secret: '42471dc9c8dbc5ac179d9051fc9ae35c990c0ae3197615f92861d63ebf8dcf7a',
//     //   username: 'anubhav.goel@janabank.com',
//     //   password: '2ArAHY320'
//     // }
//   }

//   /**
// * @method AccessTokenCall
// * @description get the Access token from the Droom Api.
// * @author HariHaraSuddhan
// */

//   async getAccessTokenCall() {
//     try {
//       return new Promise((resolve, reject) => {
//         this.global.globalLodingPresent('Please Wait...');
//         let link = `${this.apiUrl}v1/oauth/token`;
//         let body = this.accessTokenRequest;
//         this.http.post(link, body, '').then(response => {
//           let res = JSON.parse(response.data);
//           if (res.access_token.length > 0) {
//             localStorage.setItem('access_token', res.access_token);
//             localStorage.setItem('refresh_token', res.refresh_token);
//             this.global.globalLodingDismiss();
//             resolve(true);
//           } else resolve(false);
//         }).catch(err => {
//           console.log(err, 'ORP getAccessTokenCall');
//           resolve(false);
//         })
//       })
//     } catch (error) {
//       console.log(`getDroomAccessToken ${error}`);
//     }
//   }

//   /**
// * @method ORPDroomApiCall
// * @description get the parameter request from the function and call the http post method to retrun the response.
// * @author HariHaraSuddhan
// */
//   async onRoadPriceApiCall(method: string, data: any, v?: string) {
//     let headers;
//     let endPoint = `${this.apiUrl}${method}`
//     if (this.network.type == 'none' || this.network.type == "unknown") {
//       this.global.showAlert("Alert", "Enable Internet connection!.");
//       this.global.globalLodingDismiss();
//     } else {
//       return new Promise((resolve, reject) => {
//         headers = {
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//         }
//         let curDateTime = moment(this.dateTime).format("YYYY-MM-DD HH:mm:ss");
//         console.log(endPoint);
//         this.http.post(endPoint, data, headers).then(response => {
//           console.log(response, "response");
//           this.sqliteService.addAuditTrail(curDateTime, endPoint, method + " Response", JSON.stringify(response));
//           resolve(JSON.parse(response.data));
//         })
//       }).catch(err => {
//         if (err.status) {
//           this.handle401Error(method, data, v);
//         }
//       })
//     }
//   }

//   async handle401Error(method: string, data: any, v?: string) {
//     localStorage.setItem('access_token', localStorage.getItem("refresh_token"));
//     this.onRoadPriceApiCall(method, data, v);
//   }

//   /**
// * @method ORPRequestFrameForNewVehicle
// * @description get the parameter values from the function and make a request object and push to the next method.
// * @author HariHaraSuddhan
// */

//   async frameRequestORPNew(type: string, value: string, year?, city?) {
//     let request: AppConstants.ORPAuthRequestNew;
//     let response;
//     let endPoint = AppConstants.ORPApiStrings.endPoint1;
//     switch (type) {
//       case AppConstants.ORPApiStrings.category:
//         this.choosedVehicleValue.category = value
//         request = {
//           category: this.category
//         }
//         break;
//       case AppConstants.ORPApiStrings.model:
//         this.choosedVehicleValue.make = value
//         request = {
//           category: this.category,
//           make: this.make
//         }
//         break;
//       case AppConstants.ORPApiStrings.variant:
//         this.choosedVehicleValue.model = value;
//         request = {
//           category: this.category,
//           make: this.make,
//           model: this.model,
//           year: year,
//         }
//         break;
//       case AppConstants.ORPApiStrings.ORP:
//         this.choosedVehicleValue.trim = value
//         request = {
//           category: this.choosedVehicleValue.category,
//           make: this.choosedVehicleValue.make,
//           model: this.choosedVehicleValue.model,
//           trim: this.choosedVehicleValue.trim,
//           year: year,
//           city: city
//         }
//         endPoint = AppConstants.ORPApiStrings.endPoint2
//         break;
//       default:
//         break;
//     }
//     response = await this.onRoadPriceApiCall(endPoint, request);
//     if (response.code == 'success') {
//       return response.data;
//     } else {
//       this.global.showAlert('Alert', `${response.code} ${response.message}`)
//     }
//   }

//   /**
//  * @method ORPRequestFrameForUsedVehicle
//  * @description get the parameter values from the function and make a request object and push to the next method.
//  * @author HariHaraSuddhan
//  */

//   async frameRequestORPUsed(value) {
//     let request: AppConstants.ORPAuthRequestUsed;
//     let endPoint: string = AppConstants.ORPApiStrings.endPoint2;
//     try {
//       request = {
//         make: value.make,
//         model: value.model,
//         year: value.year,
//         trim: value.trim,
//         kms_driven: value.kms_driven,
//         city: value.city,
//         noOfOwners: value.noOfOwners
//       }

//       this.ORPRequestFactoryCall.next({ endPoint: endPoint, request: request });

//       const response: any = await this.ORPRequestFactoryCallObs$.pipe(
//         switchMap(val => this.onRoadPriceApiCall(val.endPoint, val.request))
//       ).subscribe();
//       if (response.code == 'success') {
//         return response.data;
//       } else {
//         this.global.showAlert('Alert', `${response.code} ${response.message}`)
//       }
//     } catch (error) {
//       console.log(error, 'frameRequestORPUsed');
//     }
//   }
// }
