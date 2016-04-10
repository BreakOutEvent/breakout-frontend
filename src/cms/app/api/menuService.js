let MenuService = ($resource) => {
  'ngInject';
  return $resource('//localhost:3000/admin/api/menu/:menuId', {menuId: '@_id'})
};

export default MenuService