/**
 * Created by timpf on 20.02.2016.
 */
angular.module('app')
  .service('APISrv', function ($http, $q, $rootScope) {
    return {
      request: {
        get: function (path) {
          return $http.get(path);
        },
        push: function (path, body) {
          return $http.push(path, body);
        },
        put: function (path, body) {
          return $http.put(path, body);
        },
        delete: function (path) {
          return $http.delete(path);
        }
      },
      page: {
        getList: function () {
          return $q(function (resolve, reject) {
            $http.get("/api/page").then(function (res) {
              resolve(res.data);
            }, function (err) {
              reject(err);
            });
          });
        },
        delete: function (page_id) {
          return $q(function (resolve, reject) {
            if (!page_id)
              reject(new Error("Missing page_id"));
            $http.delete("/api/page/" + page_id).then(function (res) {
              resolve();
            }, function (err) {
              reject(err);
            });
          });
        },
        create: function (name) {
          return $q(function (resolve, reject) {
            $http.post("/api/page", {
              properties: [{
                language: 'de',
                title: name,
                url: name
              }],
              views: []
            }).then(function (res) {
              resolve(res.data);
            }, function (err) {
              reject(err);
            });
          });
        }
      },
      view: {
        get: function (view_id) {
          return $q(function (resolve, reject) {
            $http.get("/api/view/" + view_id).then(function (res) {
              resolve(res.data);
            }, function (err) {
              reject(err);
            });
          })
        },
        put: function(view_id, view) {
          return $q(function (resolve, reject) {
            $http.put("/api/view/" + view_id, view).then(function (res) {
              resolve(res.data);
            }, function (err) {
              reject(err);
            });
          })
        },
        add: function (page_id, template) {
          return $q(function (resolve, reject) {
            //Generate variable defaults
            var variables = [];
            for (var i = 0; i < template.vars.length; i++) {
              var type = null;
              switch (template.vars[i].type) {
                case 'text':
                  type = "-";
                  break;
                case 'bool':
                  type = false;
                  break;
                case 'array':
                  type = [];
                  break;
              }
              type = " "; //TODO: set default values on top
              variables.push({name: template.vars[i].name, values: [{language: 'de', value: type}]});
            }
            $http.post("/api/view", {
              templateName: template.name,
              variables: variables
            }).then(function (res) {
              $rootScope.currentPage.views.push(res.data._id);
              $http.put("/api/page/" + page_id, {
                views: $rootScope.currentPage.views
              }).then(function (res) {
                resolve(res.data);
              }, function (err) {
                reject(err);
              });
            });
          });
        }
      },
      template: {
        getList: function () {
          return $q(function (resolve, reject) {
            $http.get("/api/getList").then(function (res) {
              resolve(res.data);
            }, function (err) {
              reject(err);
            });
          });
        },
        getHTML: function (templateName) {
          return $q(function (resolve, reject) {
            $http.get("/api/html/" + templateName).then(function (res) {
              resolve(res.data);
            }, function (err) {
              reject(err);
            });
          });
        }
      }
    }
  });