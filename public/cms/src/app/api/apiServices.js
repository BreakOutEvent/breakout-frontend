/**
 * Created by l.heddendorp on 06.03.2016.
 */
import angular from 'angular'
require('angular-resource')

import PageService from './pageService'
import ViewService from './viewService'
import TemplateService from './templateService'

let apiServices = angular.module('bo.apiServices', [])
  .service('Page', PageService)
  .service('View', ViewService)
  .service('Template', TemplateService)

export default apiServices.name
