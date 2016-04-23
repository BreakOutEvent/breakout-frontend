/**
 * Created by l.heddendorp on 20.03.2016.
 */
export default class SettingsCtrl {
  constructor ($mdDialog, $mdToast, Upload) {
    'ngInject';
    this._dialog = $mdDialog;
    this._mdToast = $mdToast.showSimple;
    this._upload = Upload;
  }
  cancel(){
    this._dialog.cancel();
  }
  uploadFile(file) {
    if (file) {
      file.upload = this._upload.upload({
        url: 'api/image',
        data: { image: file }
      });

      file.upload.then((response) => {
        $timeout(() => {
          file.result = response.data;
          console.log(response.data);
        });
      }, (response) => {
        if (response.status > 0)
          this._mdToast(response.status + ': ' + response.data);
      }, (evt) => {
        file.progress = Math.min(100, parseInt(100.0 *
          evt.loaded / evt.total));
      });
    }
  }
}