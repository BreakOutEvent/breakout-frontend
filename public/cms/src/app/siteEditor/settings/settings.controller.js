/**
 * Created by l.heddendorp on 20.03.2016.
 */
export default class SettingsCtrl {
  constructor ($mdDialog, $mdToast) {
    'ngInject';
    this._dialog = $mdDialog;
    this._mdToast = $mdToast.showSimple;
    this.availableLanguages = [
      {language: 'Deutsch', code: 'de'},
      {language: 'Englisch', code: 'en'}
    ];
  }
  cancel(){
    this._dialog.cancel();
  }


  addLanguage() {
    if (this.props.length < this.availableLanguages.length) {
      this.props.push({
        url: '',
        title: '',
        language: ''
      });
    } else {
      this._mdToast('Keine weiteren Sprachen verfügbar');
    }
  }
}