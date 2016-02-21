/**
 * Created by timpf on 20.02.2016.
 */
angular.module('templateList')
  .controller("TemplateListCtrl", function (APISrv, $rootScope) {
    var vm = this;
    vm.templates = [];
    APISrv.template.getList().then(function (res) {
      vm.templates = res;
      $rootScope.templates = vm.templates;
    });
  });