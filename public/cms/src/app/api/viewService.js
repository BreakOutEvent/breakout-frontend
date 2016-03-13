/**
 * Created by l.heddendorp on 05.03.2016.
 */
let ViewService = ($resource) => {
  'ngInject'
  return $resource('//localhost:3000/api/view/:view_id', null, { 'update': { method: 'PUT' }})
}

export default ViewService
