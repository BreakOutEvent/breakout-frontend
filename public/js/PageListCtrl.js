/**
 * Created by timpf on 20.02.2016.
 */
angular.module('pageList')
  .controller("PageListCtrl", function (APISrv, $rootScope, $scope, $uibModal, lodash) {
    var vm = this;

    function init() {
      vm.current = null;
      APISrv.page.getList().then(function (res) {
        vm.pages = res;
        console.log(res);
      });
    }

    init();


    $rootScope.$on("pageAdded", function (event, page) {
      console.log(page);
      vm.pages.push(page);
    });

    $scope.deletePage = function (page, index) {
      console.log(index);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'deletePageModal.html',
        controller: 'ModalInstanceCtrl',
        size: "small",
        resolve: {
          page: function () {
            return page;
          }
        }
      });

      modalInstance.result.then(function (pageForDemolition) {
        APISrv.page.delete(pageForDemolition._id).then(function () {
          delete $scope.list.pages[index];
        }, function (err) {
          console.log(err);
        });
      });
    };

    vm.selectPage = function (index) {
      if (vm.pages[index]) {
        vm.current = index;
        $rootScope.$broadcast("selectPage", vm.pages[index]);
      }
    }
  })
  .directive('toggleButton', ['APISrv', '$rootScope', 'focus', function (APISrv, $rootScope, focus) {
    return {
      restrict: 'E',
      template: '<div>' +
      '<button class="btn btn-primary" ng-hide="toggle" ng-transclude></button>' +
      '<div class="input-group" ng-show="toggle">' +
      '<input type="text" id="new-page-input" ng-blur="toggle = false" class="form-control new-page-input" ng-model="newTitle" placeholder="Titel eingeben...">' +
      '<span class="input-group-btn">' +
      '<button class="btn btn-default" type="button">Speichern</button>' +
      '</span>' +
      '</div>',
      transclude: true,
      replace: true,
      link: function (scope, elem, attrs) {
        scope.toggle = false;
        scope.newTitle = "";

        //toggle to input field on click
        elem.on("click", function () {
          if (!scope.toggle) {
            scope.toggle = true;
            focus('new-page-input');
            scope.$apply();
          }
        });

        //create page on enter
        elem.bind("keydown keypress", function (event) {
          if (event.which === 13) {
            scope.$apply(function () {
              if (scope.toggle && scope.newTitle) {
                //Create Page with this name
                APISrv.page.create(scope.newTitle).then(function (page) {
                  $rootScope.$broadcast("pageAdded", page);
                });
              }
            });
            event.preventDefault();
          }
        });
      }
    }
  }])
  .directive('pageListElement', function () {
    return {
      restrict: 'E',
      template: '<a href="" class="page-element-sortable">{{page_title}}' +
      '<i class="material-icons md-20 right" ng-show="hover">delete</i>' +
      '</a>',
      replace: true,
      transclude: false,
      link: function (scope, elem, attrs) {

        var properties = scope.page.properties;
        console.log(properties);
        for (var i = 0; i < properties.length; i++) {
          if (properties[i].language == 'de')
            scope.page_title = properties[i].title;
        }

        elem.on("click", function (evt) {

          var isFirstChild = (elem.context.children[0] === evt.target);
          if (isFirstChild) {
            scope.deletePage(scope.page, scope.$index);
          } else {
            scope.list.selectPage(attrs.index);
          }
        });
        elem.on("mouseover", function () {
          scope.hover = true;
          scope.$apply();
        });
        elem.on("mouseout", function () {
          scope.hover = false;
          scope.$apply();
        });
      }
    }
  })

  .controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, page) {
    var vm = this;
    vm.page = page;

    $scope.ok = function () {
      $uibModalInstance.close(page);
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });