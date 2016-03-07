/**
 * Created by timpf on 20.02.2016.
 */
angular.module('templateList')
  .controller("TemplateListCtrl", function (APISrv, $rootScope) {
    var vm = this;
    var images = [
      "http://innovastudio.com/builderdemo/assets/default/thumbnails/08.png",
      "http://innovastudio.com/builderdemo/assets/default/thumbnails/07.png",
      "http://innovastudio.com/builderdemo/assets/default/thumbnails/35.png",
      "http://innovastudio.com/builderdemo/assets/default/thumbnails/19.png",
      "http://innovastudio.com/builderdemo/assets/default/thumbnails/28.png"
    ];
    vm.randomImage = function() {
      var num = Math.floor(Math.random()*4, 2);

      return images[num];
    };

    vm.templates = [];
    APISrv.template.getList().then(function (res) {
      vm.templates = res;
      for(var i=0; i<vm.templates.length;i++) {
        vm.templates[i].image = vm.randomImage();
      }
      $rootScope.templates = vm.templates;
    });
  });