/**
 * Created by l.heddendorp on 05.03.2016.
 */
let TemplateService = ($http) => {
  'ngInject';
  return {
    getList: function () {
      return $http.get('/api/getList')
    },
    getHtml: function (templateName) {
      return $http.get('/api/html/' + templateName)
    }
  }
};

export default TemplateService
