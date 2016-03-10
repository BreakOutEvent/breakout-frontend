/**
 * Created by l.heddendorp on 05.03.2016.
 */
import angular from 'angular'

import template from './site-editor.html'
import previewDirective from './preview/preview'

class pageEditorCtrl {
  constructor (View, Template, $sce, $http, $rootScope) {
    this.views = []
    this.html = {}
    this.props = 0
    this.context = {}
    this._sce = $sce
    this._http = $http
    this._view = View
    this._template = Template
    this.reload()
    console.log(this.page)
    $rootScope.$watch('page', () => {
      this.reload()})
  }
  reload () {
    console.log('reloading')
    this._http.get('//localhost:3000/api/css').then((res) => {
      this.style = this._sce.trustAsCss(res.data)
    })
    this.views = []
    this.page.views.forEach((view) => {
      this._view.get({view_id: view}).$promise.then((viewRes) => {
        this._template.getHtml(viewRes.templateName).then((res) => {
          this.views.push({
            view: viewRes,
            html: res.data
          })
        })
      })
    })
  }
  addView (template, index) {
    var vm = this
    console.log(template)
    // Generate variable defaults
    var variables = []
    for (var i = 0; i < template.vars.length; i++) {
      var type = null
      switch (template.vars[i].type) {
        case 'text':
          type = '-'
          break
        case 'bool':
          type = false
          break
        case 'array':
          type = []
          break
      }
      type = ' '; // TODO: set default values on top
      variables.push({
        name: template.vars[i].name,
        values: [{
          language: 'de',
          value: type
        }]
      })
    }
    this._http.post('//localhost:3000/api/view', {
      templateName: template.name,
      variables: variables
    }).then(function (res) {
      console.log(res.data._id)
      vm.page.views.splice(index, 0, res.data._id)
      vm.page.$save()
      vm.reload()
      return res.data._id
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
  previewDirective
])
  .component('boEditor', pageEditor)

export default pageEditorModule.name
