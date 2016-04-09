/**
 * Created by l.heddendorp on 05.03.2016.
 */
let ViewService = ($resource) => {
  'ngInject';
  return $resource('//localhost:3000/admin/api/view/:view_id', {view_id: '@_id'})
};

export default ViewService
