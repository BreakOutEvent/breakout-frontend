/**
 * Created by l.heddendorp on 04.03.2016.
 */
import angular from 'angular';
import ngResource from 'angular-resource';
import ngMaterial from 'angular-material';
import 'angular-drag-and-drop-lists';
import 'angular-material/angular-material.scss';
import './../style/app.scss';

import theme from './app.config';
import template from './app.html';
import templateLib from './templateLib/templateLib';
import siteEditor from './siteEditor/siteEditor';
import apiServices from './api/apiServices';
import CreateSiteCtrl from './createSite/createSite.controller';

class AppCtrl {
  constructor(Page, $log, $mdDialog, $mdToast) {
    'ngInject';
    this.pages = Page.query();
    this._log = $log;
    this._dialog = $mdDialog;
    this._mdToast = $mdToast.showSimple;
  }

  selectPage(page) {
    this._log.debug('Page selected:');
    this._log.debug(page);
    this.selectedPage = page;
  }

  createPage() {
    let vm = this;
    this._dialog.show({
      controller: CreateSiteCtrl,
      controllerAs: 'createSite',
      bindToController: true,
      template: require('./createSite/createSite.ng.html'),
      parent: angular.element(document.body),
      //onRemove: function () {
      //  console.log('reload')
      //  vm.pages = Page.query()
      //},
      targetEvent: event,
      clickOutsideToClose: true
    });
  }

  drop (event, index, item, type) {
    if(type === 'page') {
      var oldIndex = 0
      angular.forEach(this.pages, (value, key) => {
        if(this.pages[key]._id === item._id)
          oldIndex = key
      })
      this.pages.splice(oldIndex, 1)
      this.pages.splice(index, 0, item)
      //TODO: send change to server
      this._mdToast('Seitenreihenfolge geändert')
      return true
    }
  }
}

let app = {
  restrict: 'E',
  bindings: {},
  template,
  controller: AppCtrl,
  controllerAs: 'app',
};

angular
  .module('app', [
    ngMaterial,
    ngResource,
    'dndLists',
    templateLib,
    siteEditor,
    apiServices,
  ])
  .config(theme)
  .component('app', app);
