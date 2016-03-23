/**
 * Created by l.heddendorp on 06.03.2016.
 */
import angular from 'angular'

function preview ($compile, $timeout) {
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
      init()
      scope.$watch(()=>{return scope.data.variables}, () =>{
        scope.context = {}
        console.warn(scope)
        scope.data.variables.forEach((va, index) => {
          scope.context[va.name] = index
        })
      })
      function init() {
        if(!scope.template) {
          $timeout(init, 200)
        } else {
          rebind()
        }
      }
      function rebind () {
        let modified = scope.template.replace(/{{!--((?:\n|\r|.)*)--}}/g, '')
        //console.info(modified)
          modified = modified.replace(/{{(#each )?(\/)?(#if )?[A-z|0-9]*}}/g, (bound) => {
          if(bound.indexOf('#each') != -1 || bound.indexOf('#if') != -1){
            return ''
          }
          if(bound.indexOf('@index') != -1) {
            return '{{$index}}';
          }
          if(bound.indexOf('@first') != -1) {
            return '{{$first}}';
          }
          return '<bo-editable field=data.variables[context["' + bound.replace(/{{|}}/g, '') + '"]].values[locale].value></bo-editable>'
        })
        let elem = $compile(modified)(scope)
        //console.info('REPLACING HTML CONTENTS')
        //console.info(scope.template)
        //console.info(elem)
        iElement.children().replaceWith(elem)
      }
    }
  }
}

class PreviewCtrl {}

export default angular.module('bo.pageEditor.preview', [])
  .directive('boPreview', preview)
  .name
