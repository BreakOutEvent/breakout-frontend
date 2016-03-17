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
    this._scope = $rootScope
    this._sce = $sce
    this._http = $http
    this._view = View
    this._page = Page
    this._template = Template
    this._log = $log
    this._debug('Editor initilized, current page:', this.page)
    this._http.get('//localhost:3000/api/css').then((res) => {
      this.style = this._sce.trustAsCss(res.data)
      this._debug('## CSS loaded ### styles get scoped ##')
      scoper.scopeStyles()
      scoper.process(res.data)
    })
    $rootScope.$watch(()=>{return this.page}, () => {
      this._debug('Page changed, current page: ', this.page)
      this.reload()
    })
  }
  dumpViews () {
    this._debug('VIEW DUMP ####', this.views)
  }
  reload () {
    let views = []
    this._debug('Reloading page contents, current views: ', this.page.views)
    this.views = []
    this.page.views.forEach((view, index) => {
      this._view.get({view_id: view}).$promise.then((viewRes) => {
        this._debug('View call finished, response: ', viewRes)
        this._template.getHtml(viewRes.templateName).then((res) => {
          views[index] = {
            view: viewRes,
            html: res.data
          }
          if(views.length == this.page.views.length){
            this.views = views
          }
        })
      })
    })

  }
  _debug (msg, dump) {
    let text = "boEditor - "+msg
    this._log.debug(text)
    if(dump) {
      this._log.debug(dump)
      this._log.debug('----DUMP COMPLETE----')
    }
  }
  drop (event, index, item) {
    let vm = this
    var view = new this._view
    this._debug('Item was dropped, content:', item)
    view.templateName = item.name
    view.variables = item.vars
    view.$save(null, function (call) {
      vm._debug('view.$save got called with data:', call)
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
