/**
 * Created by l.heddendorp on 05.03.2016.
 */
import angular from 'angular'

import template from './editable.html'
import ImageCtrl from './image.controller'

class editableCtrl {
  constructor() {
    this.editMode = false;
    //this.field = this.field.replace(/\n/g, '<br />');
  }

  checkReturn(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.stopPropagation();
      event.preventDefault();
      this.field = this.field.replace(/\n/g, '<br />');
      this.editMode = false;
    }
  }
}

let editable = {
  restrict: 'E',
  bindings: {
    field: '='
  },
  template,
  controller: editableCtrl,
  controllerAs: 'editable'
};

let editableModule = angular.module('bo.siteEditor.editable', [])
  .component('boEditable', editable)
  .directive('boImage', function ($mdDialog) {
    'ngInject';
    return {
      restrict: 'A',
      scope: {
        url: '=boImage'
      },
      link: (scope, element, attr) => {
        element.on('click', (ev) => {
          console.log('Clicked');
          var confirm = {
            controller: ImageCtrl,
            controllerAs: 'image',
            bindToController: true,
            template: require('./image.ng.html'),
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true,
          };
          $mdDialog.show(confirm).then(function(result) {
            scope.url = result;
          }, function() {
          });
        })
      }
    };
  })
  .directive('boLink', function ($mdDialog) {
    'ngInject';
    return {
      restrict: 'A',
      scope: {
        url: '=boLink'
      },
      link: (scope, element, attr) => {
        element.on('click', (ev) => {
          console.log('Clicked');
          ev.stopPropagation();
          var confirm = $mdDialog.prompt()
            .title('Welcehs Bild soll gezeigt werden?')
            .textContent('Bitte absolute url eingeben.')
            .placeholder('Bild url')
            .ariaLabel('url')
            .targetEvent(ev)
            .ok('Speichern')
            .cancel('Abbrechen');
          $mdDialog.show(confirm).then(function(result) {
            scope.url = result;
          }, function() {
          });
        })
      }
    };
  })
  .filter('to_trusted', ['$sce', function($sce){
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }]);

export default editableModule.name
