/**
 * Created by timpf on 20.02.2016.
 */
angular.module('page')
  .controller("PageCtrl", function (APISrv, $rootScope, $sce, $scope) {
    var vm = this;

    $rootScope.$on("selectPage", function (event, page) {
      vm.page = page;
      console.log("select page");
      loadPageViews();
    });

    function loadPageViews() {
      $scope.list = [];
      if (vm.page) {
        var views = vm.page.views;
        for (var i = 0; i < views.length; i++) {
          loadView(views[i]);
        }
      }
    }

    function loadView(view_id, language) {
      APISrv.view.get(view_id).then(function (data) {
        $scope.list.push(data);
      });
    }

    $scope.renderView = function (data, callback) {
      console.log("hello");
      if (data && data.templateName) {
        APISrv.template.getHTML(data.templateName).then(function (handlebarsTemplate) {
          var compiledHtml = Handlebars.compile(handlebarsTemplate);
          var variables = {};
          var language = language || "de";

          for (var i = 0; i < data.variables.length; i++) {
            var values = data.variables[i].values;
            for (var k = 0; k < values.length; k++) {
              if (values[k].language == language)
                variables[data.variables[i].name] = values[k].value;
            }
          }
          callback(compiledHtml(variables));
        });
      }
    }


  })
  .directive('viewElem', ['$sce', '$uibModal', 'APISrv', function ($sce, $uibModal, APISrv) {
    return {
      restrict: 'E',
      template: '<div>' +
      '<span class="glyphicon glyphicon-edit right" aria-hidden="true"></span>' +
      '<div ng-bind-html="html"></div>' +
      '</div>',
      transclude: false,
      replace: true,
      scope: {
        view: "=",
        renderView: "&",
        html: "@"
      },
      link: function (scope, elem, attrs) {
        if (scope.view) {
          elem.on("click", function (evt) {
            var isEditButton = (elem.context.children[0] === evt.target);
            if (isEditButton) {
              var editViewModal = $uibModal.open({
                animation: true,
                templateUrl: 'editViewModal.html',
                controller: 'EditViewCtrl',
                resolve: {
                  view: function () {
                    return scope.view;
                  }
                }
              });

              editViewModal.result.then(function (view) {
                APISrv.view.put(view._id, view).then(function (res) {
                 console.log(res);
                });
              });
            }
          });
          var data = scope.view;
          APISrv.template.getHTML(data.templateName).then(function (handlebarsTemplate) {
            var compiledHtml = Handlebars.compile(handlebarsTemplate);
            var variables = {};
            var language = language || "de";

            for (var i = 0; i < data.variables.length; i++) {
              var values = data.variables[i].values;
              for (var k = 0; k < values.length; k++) {
                if (values[k].language == language)
                  variables[data.variables[i].name] = values[k].value;
              }
            }
            scope.html = $sce.trustAsHtml(compiledHtml(variables));
          });
        }
      }
    }
  }])
  .directive('templateVariable', function () {
    return {
      restrict: 'E',
      replace: true,
      template: '<div>' +
      '<label>{{variable.name}}</label>' +
      '<input type="text" ng-model=variable.values[variableIndex].value />' +
      '</div>',
      scope: {
        variable: "=",
        variableIndex: "@"
      },
      link: function (scope, elem, attrs) {
        for (var i = 0; i < scope.variable.values.length; i++) {
          if (scope.variable.values[i].language == 'de') {
            scope.variableIndex = i;
          }
        }
      }
    }
  })
  .controller('EditViewCtrl', function ($scope, $uibModalInstance, view) {
    $scope.view = view;

    $scope.ok = function () {
      $uibModalInstance.close(view);
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });