/**
 * Created by l.heddendorp on 05.03.2016.
 */
import angular from 'angular'

import template from './template-lib.html'
import Apiservices from './../api/apiServices'

class templateLibCtrl {
  constructor(Template) {
    'ngInject';
    var vm = this;
    Template.getList().then(function (res) {
      vm.templates = res.data
    })
  }
}

let templateLib = {
  restrict: 'E',
  bindings: {
    active: '<'
  },
  template,
  controller: templateLibCtrl,
  controllerAs: 'lib'
};

let templateLibModule = angular.module('bo.templateLib', [
    Apiservices
  ])
  .component('boLib', templateLib);

export default templateLibModule.name
