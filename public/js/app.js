/**
 * Created by timpf on 20.02.2016.
 */
angular.module('templateList', []);
angular.module('pageList', ['ui.bootstrap', 'ngLodash']);
angular.module('page', []);


var app = angular.module('app', ['templateList', 'pageList', 'page', 'ui.sortable', 'ui.bootstrap', 'ngLodash']);
app.controller('MainCtrl', function ($rootScope, $scope, APISrv) {
    var vm = this;

    $rootScope.$on("selectPage", function (event, page) {
      $rootScope.currentPage = page;
    });

    $scope.list = [];



    $scope.sortableOptions = {
      update: function (e, ui) {
        var droppedElement = ui.item.context.firstElementChild;
        //Create new View from Template
        if(droppedElement.className.indexOf("template-item") > -1) {
            var template = $rootScope.templates[droppedElement.attributes['index'].value];
        } else if(droppedElement.className.indexOf("page-element-sortable") > -1) {
            //SET MENU ORDER HERE
        }
      },
      receive: function (e, ui) {
        //
      },
      connectWith: ".list",
      stop: function (e, ui) {
        //
      }
    };
  })
  .factory('focus', function ($timeout, $window) {
    return function (id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function () {
        var element = $window.document.getElementById(id);
        if (element)
          element.focus();
      });
    };
  });