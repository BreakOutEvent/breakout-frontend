/**
 * Created by l.heddendorp on 05.03.2016.
 */
import angular from 'angular'
import scoper from './../scoper'

import template from './site-editor.html'
import previewDirective from './preview/preview'
import editableComponent from './editable/editable'

class pageEditorCtrl {
  constructor (View, Page, Template, $sce, $http, $rootScope, $log) {
    'ngInject'
    this.views = []
    this.html = {}
    this.props = 0
    this.context = {}
    this._sce = $sce
    this._http = $http
    this._view = View
    this._page = Page
    this._template = Template
    this._log = $log
    this._log.debug('Editor initilized, current page:')
    this._log.debug(this.page)
    this._http.get('//localhost:3000/api/css').then((res) => {
      this.style = this._sce.trustAsCss(res.data)
      this._log.debug('## CSS loaded ### styles get scoped ##')
      scoper.scopeStyles()
      scoper.process(res.data)
    })
    $rootScope.$watch(()=>{return this.page}, () => {
      this._log.debug('Page changed')
      this.reload()
    })
  }
  reload () {
    this._log.debug('Reloading page contents')
    this._log.debug(this.page.views)
    this.views = []
    this.page.views.forEach((view, index) => {
      this._view.get({view_id: view}).$promise.then((viewRes) => {
        this._log.debug('###ViewResponse###')
        this._log.debug(viewRes)
        this._template.getHtml(viewRes.templateName).then((res) => {
          this.views[index] = {
            view: viewRes,
            html: res.data
          }
        })
      })
    })
  }
  drop (event, index, item) {
    let vm = this
    var view = new this._view
    this._log.debug('###Dropped Item###')
    this._log.debug(item)
    view.templateName = item.name
    view.variables = item.vars
    view.$save(null, function (call) {
      vm._log.debug('###Save callback###')
      vm._log.debug(call)
      vm.page.views.splice(index, 0, call._id)
      vm._page.update({pageId: vm.page._id}, vm.page)
      vm.reload()
      return true
    })
  }
}
let pageEditor = {
  restrict: 'E',
  bindings: {
    page: '='
  },
  template,
  controller: pageEditorCtrl,
  controllerAs: 'edit'
}

let pageEditorModule = angular.module('bo.pageEditor', [
    previewDirective,
    editableComponent
  ])
  .component('boEditor', pageEditor)

export default pageEditorModule.name
