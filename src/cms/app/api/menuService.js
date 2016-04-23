let MenuService = ($resource) => {
  'ngInject';
  return $resource('/api/menu/:menuId', {menuId: '@_id'})
};

export default MenuService