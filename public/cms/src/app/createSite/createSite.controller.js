export default class CreateSite {
  constructor(Page, $mdDialog, $mdToast) {
    'ngInject'
    this._dialog = $mdDialog
    this._mdToast = $mdToast.showSimple
    this._page = Page
    this.availableLanguages = [
      {language: 'Deutsch', code: 'DE'},
      {language: 'Englisch', code: 'EN'}
    ]
    this.properties = [{
      url: '',
      title: '',
      language: this.availableLanguages[0].code
    }]
  }

  save() {
    var page = new this._page
    page.properties = this.properties
    let vm = this
    page.$save(null, function () {
      //vm._debug('Create Page:', page)
      vm._mdToast('Seite erfolgreich erstellt')
      vm._dialog.cancel()
    })
  }

  cancel() {
    this._dialog.cancel()
  }
}