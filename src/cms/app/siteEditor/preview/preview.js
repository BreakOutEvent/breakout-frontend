/**
 * Created by l.heddendorp on 06.03.2016.
 */
import angular from 'angular'

function preview($compile, $timeout) {
  'ngInject';
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
      init();
      scope.$watch(()=> {
        return scope.data.variables
      }, () => {
        scope.context = {};
        console.warn(scope);
        scope.data.variables.forEach((va, index) => {
          scope.context[va.name] = index
        })
      });
      function init() {
        if (!scope.template) {
          $timeout(init, 200)
        } else {
          rebind()
        }
      }

      function rebind() {
        let modified = scope.template.replace(/{{!--((?:\n|\r|.)*)--}}/g, '');
        modified = modified.replace(/src="{{{[A-z|0-9]*}}}"/g, (bound) => {
          let dataString = 'data.variables[context[\'' + bound.replace(/src="{{{|}}}"/g, '') + '\']].values[locale].value';
          return 'ng-src="{{ ' + dataString + ' == \'defaultValue\' ? \'admin/cms/add-image.svg\' : ' + dataString + ' || \'admin/cms/add-image.svg\'}}"' +
            ' bo-image=data.variables[context["' + bound.replace(/src="{{{|}}}"/g, '') + '"]].values[locale].value' +
            ' style="min-width: 50%; margin: auto;"';
        });
        modified = modified.replace(/href="{{{[A-z|0-9]*}}}"/g, (bound) => {
          return 'bo-link=data.variables[context["' + bound.replace(/src="{{{|}}}"/g, '') + '"]].values[locale].value';
        });
        console.log(modified);
        modified = modified.replace(/{{{(#each )?(\/)?(#if )?[A-z|0-9]*}}}/g, (bound) => {
          if (bound.indexOf('#each') != -1 || bound.indexOf('#if') != -1) {
            return ''
          }
          if (bound.indexOf('@index') != -1) {
            return '{{$index}}';
          }
          if (bound.indexOf('@first') != -1) {
            return '{{$first}}';
          }
          return '<bo-editable field=data.variables[context["' + bound.replace(/{{{|}}}/g, '') + '"]].values[locale].value></bo-editable>'
        });
        let elem = $compile(modified)(scope);
        iElement.children().replaceWith(elem)
      }
    }
  }
}

class PreviewCtrl {
}

export default angular.module('bo.pageEditor.preview', [])
  .directive('boPreview', preview)
  .name
