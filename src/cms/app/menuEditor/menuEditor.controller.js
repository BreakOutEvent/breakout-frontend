export default class editMenu {
  constructor(Menu, pages, $mdDialog, $mdToast) {
    'ngInject'
    this._dialog = $mdDialog;
    this._menu = Menu;
    this.allPages = pages;
    this.pages = [];
    this.menu = {_items: []};
    this.menus = Menu.query();

    this._mdToast = $mdToast.showSimple;
    this.availableLanguages = [
      {language: 'Deutsch', code: 'de'},
      {language: 'Englisch', code: 'en'}
    ];
    this.language = this.availableLanguages[0].code;
  }

  loadMenu() {
    var vm = this;
    vm.menus.$promise.then(function () {
      var found = false;
      angular.forEach(vm.menus, function (menu) {
        if (menu.language === vm.language) {
          vm.menu = menu;
          found = true;
        }
      });
      if (!found) {
        vm.menu = {_items: []};
      }
    });

  }

  addLanguage() {
    var vm = this;
    var menu = new this._menu;
    menu.language = this.language;
    menu.$save(function(newMenu) {
      //TODO: added sich nicht wirklich
      vm.menus.push(newMenu);
      vm._mdToast('Menü für weitere Sprache');
    });
  }

  removePage(index) {
    this.menu._items.splice(index, 1);
    this.menu.$save();
    this._mdToast('Seite vom Menü entfernt');
  }

  //TODO: get title for selected language
  addPage(page) {
    this.menu._items.push({title: page.properties[0].title, _page: page._id});
    this.menu.$save();
    this._mdToast('Seite zum Menü hinzugefügt');
  }

  editTitle(index) {
    //TODO: change title of menu-item
  }

  drop(event, index, item, type) {
    if (type === 'menuItem_new') {
      let vm = this;
    } else {
      console.log(item);
      this.menu._items.splice(this.menu._items.indexOf(item._id), 1);
      this.menu._items.splice(index, 0, item._id);
      this.menu.$save();
      return true;
    }
  }

  cancel() {
    this._dialog.cancel();
  }
}