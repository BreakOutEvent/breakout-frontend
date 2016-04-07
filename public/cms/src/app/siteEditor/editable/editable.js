/**
 * Created by l.heddendorp on 05.03.2016.
 */
import angular from 'angular'

import template from './editable.html'

class editableCtrl {
  constructor() {
    this.editMode = false
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
  .component('boEditable', editable);

export default editableModule.name
