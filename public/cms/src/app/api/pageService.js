/**
 * Created by l.heddendorp on 05.03.2016.
 */
let PageService = ($resource) => {
  'ngInject'
  return $resource('//localhost:3000/api/page/:page_id')
}

export default PageService
