/**
 * Created by l.heddendorp on 05.03.2016.
 */
let TemplateService = ($http) => {
  "ngInject"
  return {
    getList: function () {
      return $http.get('//localhost:3000/api/getList')
    },
    getHtml: function (templateName) {
      return $http.get('//localhost:3000/api/html/' + templateName)
    }
  }
}

export default TemplateService
