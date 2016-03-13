/**
 * Created by l.heddendorp on 04.03.2016.
 */
import angular from 'angular'
import ngResource from 'angular-resource'
import ngMaterial from 'angular-material'
import 'angular-drag-and-drop-lists'
import 'angular-material/angular-material.scss'
import './../style/app.scss'

import theme from './app.config'
import template from './app.html'
import templateLib from './templateLib/templateLib'
import siteEditor from './siteEditor/siteEditor'
import apiServices from './api/apiServices'

class AppCtrl {
  constructor (Page, $log) {
    'ngInject'
    this.pages = Page.query()
    this._log = $log
  }
  selectPage (page) {
    this._log.debug('Page selected:')
    this._log.debug(page)
    this.selectedPage = page
  }
}

let app = {
  restrict: 'E',
  bindings: {},
  template,
  controller: AppCtrl,
  controllerAs: 'app'
}

angular
  .module('app', [
    ngMaterial,
    ngResource,
    'dndLists',
    templateLib,
    siteEditor,
    apiServices
  ])
  .config(theme)
  .component('app', app)
