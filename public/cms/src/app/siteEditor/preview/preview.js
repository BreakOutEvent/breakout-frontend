/**
 * Created by l.heddendorp on 06.03.2016.
 */
import angular from 'angular'

function preview ($compile) {
  'ngInject'
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
          if (va.values[scope.locale]) {
            scope.context[va.name] = va.values[scope.locale].value
          } else {
            scope.context[va.name] = 'K/A'
          }
        })
      })
      rebind()
      function rebind () {
        let modified = scope.template.replace(/{{[A-z]*}}/g, (bound) => {
          return '<bo-editable field=context.' + bound.replace(/{{|}}/g, '') + '></bo-editable>'
        }).replace(/{{!--((?:\n|\r|.)*)--}}/g, '')
        let elem = $compile(modified)(scope)
        iElement.children().replaceWith(elem)
      }
    }
  }
}

class PreviewCtrl {}

export default angular.module('bo.pageEditor.preview', [])
  .directive('boPreview', preview)
  .name
