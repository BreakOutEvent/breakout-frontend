/**
 * Created by l.heddendorp on 05.03.2016.
 */
import angular from 'angular'

import template from './editable.html'

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
  .filter('to_trusted', ['$sce', function($sce){
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }]);

export default editableModule.name
