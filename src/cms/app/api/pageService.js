/**
 * Created by l.heddendorp on 05.03.2016.
 */
let PageService = ($resource) => {
  'ngInject';
  return $resource('/api/page/:pageId', {pageId: '@_id'})
};

export default PageService
