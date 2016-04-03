/**
 * Created by l.heddendorp on 05.03.2016.
 */
import angular from 'angular'

import template from './site-editor.html'
import previewDirective from './preview/preview'
import editableComponent from './editable/editable'
import siteEditorCtrl from './siteEditor.controller'

let pageEditor = {
  restrict: 'E',
  bindings: {
    page: '='
  },
  template,
  controller: siteEditorCtrl,
  controllerAs: 'edit'
};

let pageEditorModule = angular.module('bo.pageEditor', [
    previewDirective,
    editableComponent
  ])
  .component('boEditor', pageEditor);

export default pageEditorModule.name
