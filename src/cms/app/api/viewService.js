/**
 * Created by l.heddendorp on 05.03.2016.
 */
let ViewService = ($resource) => {
  'ngInject';
  return $resource('/api/view/:view_id', {view_id: '@_id'})
};

export default ViewService
