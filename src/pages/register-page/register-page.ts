import { Camera, CameraOptions } from '@ionic-native/camera';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Base64 } from '@ionic-native/base64';
import { ImageResizer } from '@ionic-native/image-resizer';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Loading, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Console } from '../utils/console';
import { Constants } from '../utils/constants';
import { Geolocation } from '@ionic-native/geolocation';
import 'rxjs/add/operator/map';

declare var genwallet: any;

/**
 * Generated class for the RegisterPageOnePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register-page',
  templateUrl: 'register-page.html',
})
export class RegisterPaginated {

  registerPageOneForm;
  registerPageTwoForm;
  registerPageThreeForm;
  registerPageFourForm;
  registerPageFiveForm;

  page = 1;

  states = [];
  lgas = [];
  selectedLGAs = [];
  tradeTypes = [];
  tradeSubtypes = [];
  selectedTradeSubtypes = [];
  disabilityTypes = [];
  disabilitySubtypes = [];
  selectedDisabilitySubTypes = [];
  banks = [];
  idTypes = []

  idImagePath: string = undefined;
  idImage: string;

  lat: number;
  long: number;

  loading: Loading;
  ls;

  constructor(public camera: Camera, public androidPermissions: AndroidPermissions, public base64: Base64, public imageResizer: ImageResizer, private toastCtrl: ToastController, private geolocation: Geolocation, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, private http: Http, private loadingCtrl: LoadingController, public platform: Platform) {

    this.platform.ready().then(() => {
      androidPermissions.requestPermissions([androidPermissions.PERMISSION.CAMERA, androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
    });

    this.states = Constants.properties['states'];
    this.lgas = Constants.properties['lgas'];

    this.tradeSubtypes = Constants.properties['trade.subtypes'];
    this.tradeTypes = Constants.properties['trade.types']

    this.banks = Constants.properties['banks'];
    this.idTypes = Constants.properties['id.types'];

    this.disabilityTypes = Constants.properties['disability.types'];
    this.disabilitySubtypes = Constants.properties['disability.subtypes'];

    this.registerPageOneForm = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      middleName: [''],
      phoneNumber: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', Validators.required],
      disabilityType: [''],
      disabilitySubtype: [''],
      state: ['', Validators.required],
      lga: ['', Validators.required],
    });

    this.registerPageTwoForm = this.formBuilder.group({
      cluster: ['', Validators.required],
      association: ['', Validators.required],
      gpsCoordinate: [''],
      tradeType: ['', Validators.required],
      tradeSubtype: ['', Validators.required],
    });

    this.registerPageThreeForm = this.formBuilder.group({
      accountName: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      accountNumber: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(10), Validators.required])],
      bank: ['', Validators.required],
      bvn: ['', Validators.compose([Validators.minLength(11), Validators.maxLength(11), Validators.required])],
    });

    this.registerPageFourForm = this.formBuilder.group({
      nextOfKin1: ['', Validators.required],
      nextOfKin2: ['', Validators.required],
      nextOfKin3: ['', Validators.required],
      guarantor1: ['', Validators.required],
      guarantor2: ['', Validators.required],
      guarantor3: ['', Validators.required],
    });

    this.registerPageFiveForm = this.formBuilder.group({
      idType: ['', Validators.required],
      idNumber: ['', Validators.required],
      idExpiry: ['', Validators.required],
      smi: ['', Validators.required]
    });


    this.ls = Constants.storageService;
    this.loading = Constants.showLoading(this.loading, this.loadingCtrl, "Please Wait...");
    let app = this;
    setTimeout(function () {
      //Wait for sometimes for storage to be ready
      app.loading.dismiss();
    }, Constants.WAIT_FOR_STORAGE_TO_BE_READY_DURATION);
  }

  capturePassport() {
    Console.log("Capturing Passport");
    const options: CameraOptions = {
      quality: 15,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.idImage = base64Image;
      this.idImagePath = "data:image";
      Console.log(base64Image);
    }, (err) => {
      // Handle error
    });
  }

  submit() {
    let rf = this.registerPageOneForm.value;
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude
      Console.log(resp);
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    Constants.registrationData = {};

    Constants.registrationData['firstName'] = rf.firstName;
    Constants.registrationData['lastName'] = rf.lastName;
    Constants.registrationData['middleName'] = rf.middleName;
    Constants.registrationData['phoneNumber'] = rf.phoneNumber;
    Constants.registrationData['gender'] = rf.gender;
    Constants.registrationData['dateOfBirth'] = new Date(rf.dateOfBirth).getTime();
    Constants.registrationData['address'] = rf.address;
    Constants.registrationData['disabilityType'] = rf.disabilityType;
    Constants.registrationData['disabilitySubtype'] = rf.disabilitySubtype;
    Constants.registrationData['state'] = rf.state;
    Constants.registrationData['lga'] = rf.lga;

    rf = this.registerPageTwoForm.value;
    Constants.registrationData['cluster'] = rf.gender;
    Constants.registrationData['association'] = rf.association;
    Constants.registrationData['gpsCoordinates'] = this.lat + "," + this.long;
    Constants.registrationData['tradeType'] = rf.tradeType;
    Constants.registrationData['tradeSubtype'] = rf.tradeSubtype;

    rf = this.registerPageThreeForm.value;
    Constants.registrationData['accountName'] = rf.accountName;
    Constants.registrationData['accountNumber'] = rf.accountNumber;
    Constants.registrationData['bank'] = rf.bank;
    Constants.registrationData['bvn'] = rf.bvn;

    rf = this.registerPageFourForm.value;
    Constants.registrationData['nextOfKin1'] = rf.nextOfKin1;
    Constants.registrationData['nextOfKin2'] = rf.nextOfKin2;
    Constants.registrationData['nextOfKin3'] = rf.nextOfKin3;
    Constants.registrationData['guarantor1'] = rf.guarantor1;
    Constants.registrationData['guarantor2'] = rf.guarantor2;
    Constants.registrationData['guarantor3'] = rf.guarantor3;

    rf = this.registerPageFiveForm.value;
    Constants.registrationData['idType'] = rf.idType;
    Constants.registrationData['idNumber'] = rf.idNumber;
    Constants.registrationData['idExpiry'] = new Date(rf.idExpiry).getTime();
    Constants.registrationData['idImage'] = this.idImage;

    let result = genwallet();
    Console.log(result);

    Constants.registrationData['passphrase'] = result.mnemonic;
    Constants.registrationData['dateRegistered'] = new Date().getTime();
    Constants.registrationData['agentEmail'] = this.ls.getItem("emailAddress");

    Constants.otherData['is_beneficiary'] = true;
    this.navCtrl.push('PasswordPage');
  }

  ionViewWillEnter() {
    Constants.otherData['loading'] = this.loading;
    Constants.otherData['loadingCtrl'] = this.loadingCtrl;
    Constants.otherData['http'] = this.http;
    Constants.otherData['ls'] = this.ls;
    Constants.otherData['toastCtrl'] = this.toastCtrl;
    Constants.otherData['obv'] = Observable;
    Constants.otherData['navCtrl'] = this.navCtrl;
  }

  ionViewDidLoad() {
    Console.log('ionViewDidLoad RegisterPageOnePage');
  }

  tradeTypeSelected(value) {
    console.log("Trade type selected: " + value);
    let tradeType = this.findTradeTypeById(value);
    this.selectedTradeSubtypes = this.findTradeSubtypeByTypeId(tradeType.typeId);
  }


  findTradeTypeById(tradeTypeId) {
    for (let tradeType of this.tradeTypes) {
      if (tradeType.typeId === tradeTypeId) {
        return tradeType;
      }
    }
  }

  findTradeSubtypeByTypeId(tradeTypeId) {
    let found = [];
    for (let tradeSubtype of this.tradeSubtypes) {
      if (tradeSubtype.typeId === tradeTypeId) {
        found.push(tradeSubtype);
      }
    }

    return found;
  }

  disabilityTypeSelected(typeId) {
    Console.log("Type ID: " + typeId);
    for (let disabilityType of this.disabilityTypes) {
      if (disabilityType.typeId === typeId) {
        this.selectedDisabilitySubTypes = this.findDisabilitySubTypes(disabilityType.typeId);
      }
    }
  }

  findDisabilitySubTypes(typeId) {
    let found = [];
    for (let disabilitySubtype of this.disabilitySubtypes) {
      Console.log(disabilitySubtype);
      if (disabilitySubtype.typeId === typeId) {
        Console.log(found);
        found.push(disabilitySubtype);
      }
    }

    return found;
  }

  stateSelected(value) {
    let state = this.findStateByName(value);
    this.selectedLGAs = this.findLGAByStateId(state.id);
  }

  findLGAByStateId(id) {
    let found = [];
    for (let lga of this.lgas) {
      if (lga.state_id === id) {
        found.push(lga);
      }
    }

    return found;
  }

  findStateByName(name) {
    for (let state of this.states) {
      if (state.name === name) {
        return state;
      }
    }
  }

  validateForm() {
    switch (this.page) {
      case 1:
        if (!this.registerPageOneForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }

        let rf = this.registerPageOneForm.value;
        let dob = rf.dateOfBirth;
        let age = new Date(dob);
        var myAge = ~~((Date.now() - age.getTime()) / (31557600000));

        if (myAge < 18) {
          Constants.showLongToastMessage("Beneficiary must be at least 18 years old", this.toastCtrl);
          return false;
        }

        break;
      case 2:
        if (!this.registerPageTwoForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }
        break;
      case 3:
        if (!this.registerPageThreeForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }
        break;
      case 4:
        if (!this.registerPageFourForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }

        rf = this.registerPageFourForm.value;
        if (rf.nextOfKin1 === rf.nextOfKin2 || rf.nextOfKin1 === rf.nextOfKin3 || rf.nextOfKin2 === rf.nextOfKin3) {
          Constants.showLongToastMessage("All next of kin must be unique", this.toastCtrl);
          return false;
        }

        if (rf.guarantor1 === rf.guarantor2 || rf.guarantor1 === rf.guarantor3 || rf.guarantor2 === rf.guarantor3) {
          Constants.showLongToastMessage("All guarantors must be unique", this.toastCtrl);
          return false;
        }

        break;
      case 5:
        if (!this.registerPageFiveForm.valid) {
          Constants.showLongToastMessage("Please fill all required fields. Required fields are marked with **", this.toastCtrl);
          return false;
        }

        //this.idImagePath = "path";
        //this.idImage = 'data:image/jpeg;base64,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';
        if (this.idImagePath === undefined) {
          Constants.showLongToastMessage("Please capture a picture of yourself", this.toastCtrl);
          return false;
        }
        break;
    }

    return true;
  }

  previous() {
    this.page -= 1;
    if (this.page < 1) {
      this.page = 1;
    }
  }

  next() {
    if (this.validateForm()) {
      this.page += 1;
      if (this.page > 5) {
        this.page = 5;
      }
    }
  }
}
