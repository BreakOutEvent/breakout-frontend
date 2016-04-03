/**
 * Created by l.heddendorp on 05.03.2016.
 */
let PageService = ($resource) => {
  'ngInject';
  return $resource('//localhost:3000/api/page/:pageId', {pageId: '@_id'})
};

export default PageService
