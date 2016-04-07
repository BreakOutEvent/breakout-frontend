export default class CreateSite {
  constructor(Page, $mdDialog, $mdToast) {
    'ngInject'
    this._dialog = $mdDialog
    this._mdToast = $mdToast.showSimple
    this._page = Page
    this.availableLanguages = [
      {language: 'Deutsch', code: 'de'},
      {language: 'Englisch', code: 'en'}
    ]
    this.properties = [{
      url: '',
      title: '',
      language: ''
    }]
  }

  addLanguage() {
    if (this.properties.length < this.availableLanguages.length) {
      this.properties.push({
        url: '',
        title: '',
        language: ''
      })
    } else {
      this._mdToast('Keine weiteren Sprachen verfügbar')
    }
  }

  save() {
    var page = new this._page
    page.properties = this.properties
    let vm = this
    page.$save(null, () => {
      //vm._debug('Create Page:', page)
      vm._mdToast('Seite erfolgreich erstellt')
      vm._dialog.cancel()
    })
  }

  cancel() {
    this._dialog.cancel()
  }
}