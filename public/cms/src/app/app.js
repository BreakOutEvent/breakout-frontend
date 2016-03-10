/**
 * Created by l.heddendorp on 04.03.2016.
 */
import angular from 'angular'
import ngResource from 'angular-resource'
import ngMaterial from 'angular-material'
import 'angular-drag-and-drop-lists'
import 'angular-material/angular-material.css'
import './scoper'
import './../style/app.css'

import templateLib from './templateLib/templateLib'
import siteEditor from './siteEditor/siteEditor'
import apiServices from './api/apiServices'

let app = () => {
  return {
    template: require('./app.html'),
    controller: 'AppCtrl',
    controllerAs: 'app'
  }
}

let config = ($mdThemingProvider) => {
  $mdThemingProvider.theme('default')
    .primaryPalette('deep-orange')
    .accentPalette('blue-grey')
}

class AppCtrl {
  constructor (Page) {
    this.pages = Page.query()
  }
  selectPage (page) {
    this.selectedPage = page
  }
}

const MODULE_NAME = 'app'

angular.module(MODULE_NAME, [
  ngMaterial,
  ngResource,
  'dndLists',
  templateLib,
  siteEditor,
  apiServices
])
  .config(config)
  .directive('app', app)
  .controller('AppCtrl', AppCtrl)

export default MODULE_NAME
