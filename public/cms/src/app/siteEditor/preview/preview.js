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
      console.info('Initialize preview')
      console.info(scope)
      scope.$watch('data.variables', (oldVal, newVal) => {
        console.info('Watcher triggered')
        console.info(oldVal)
        console.info(newVal)
        scope.context = {}
        newVal.forEach((va) => {
          if (va.values[scope.locale] && va.values[scope.locale].value) {
            scope.context[va.name] = va.values[scope.locale].value
          } else {
            scope.context[va.name] = 'K/A'
          }
        })
      })
      rebind()
      function rebind () {
        let modified = scope.template.replace(/{{[A-z]*}}/g, (bound) => {
          if(bound.indexOf('#each') != -1){
            console.warn(bound)
          }
          console.log(bound)
          return '<bo-editable field=variables.values[locale].' + bound.replace(/{{|}}/g, '') + '.value></bo-editable>'
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
