/**
 * Created by l.heddendorp on 06.03.2016.
 */
import angular from 'angular'
import Handlebars from 'handlebars/dist/handlebars'

function preview ($compile) {
  return {
    restrict: 'E',
    scope: {
      template: '<',
      data: '=',
      locale: '<'
    },
    controller: PreviewCtrl,
    controllerAs: 'preview',
    link: (scope, iElement) => {
      scope.$watchGroup(['data', 'locale'], () => {
        let newValue = scope.data
        scope.context = {}
        newValue.variables.forEach((va) => {
          if (scope.context[va.name] = va.values[scope.locale])
            scope.context[va.name] = va.values[scope.locale].value
          else
            scope.context[va.name] = 'K/A'
        })
        rebind()
      })
      function rebind () {
        let modified = scope.template.replace(/{{[A-z]*}}/g, (bound) => {
          return '<span ng-click="preview.change(\'' + bound.replace(/{{|}}/g, '') + '\')">' + bound + '</span>'
        })
        let template = Handlebars.compile(modified)(scope.context)
        let elem = $compile(template)(scope)
        iElement.children().replaceWith(elem)
      }
    }
  }
}

class PreviewCtrl {
  constructor () {}
  static change (name) {
    console.log(name)
  }
}

export default angular.module('bo.pageEditor.preview', [])
  .directive('boPreview', preview)
  .name
