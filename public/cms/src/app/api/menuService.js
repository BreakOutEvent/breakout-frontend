let MenuService = ($resource) => {
  'ngInject';
  return $resource('//localhost:3000/api/menu/:menuId', {menuId: '@_id'})
};

export default MenuService