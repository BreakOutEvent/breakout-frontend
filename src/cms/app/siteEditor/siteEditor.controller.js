/**
 * Created by l.heddendorp on 19.03.2016.
 */
import scoper from './../scoper';
import SettingsCtrl from './settings/settings.controller';
export default class siteEditorCtrl {
  constructor(View, Page, Template, $sce, $http, $rootScope, $log, $mdToast, $q, $mdDialog) {
    'ngInject';
    this.views = [];
    this.html = {};
    this.props = 0;
    this.context = {};
    this._scope = $rootScope;
    this._dialog = $mdDialog;
    this._sce = $sce;
    this._http = $http;
    this._view = View;
    this._page = Page;
    this._template = Template;
    this._log = $log;
    this._q = $q;
    this._mdToast = $mdToast.showSimple;
    this._debug('Editor initilized, current page:', this.page);
    this._http.get('/api/css').then((res) => {
      this.style = this._sce.trustAsCss(res.data);
      this._debug('## CSS loaded ### styles get scoped ##');
      scoper.scopeStyles();
      scoper.process(res.data);
    });
    this._scope.$watch(()=> {
      return this.page;
    }, () => {
      this._debug('Page changed, current page: ', this.page);
      this.reload();
    });
  };

  save() {
    let promises = [];
    promises.push(this.page.$save().$promise);
    this.views.forEach((view) => {
      promises.push(view.view.$save().$promise);
    });
    this._q.all(promises).then(() => {
      this._mdToast('Seite und Templates gespeichert');
    });
  };

  remove () {
    let confirm = this._dialog
      .confirm()
      .title('Seite löschen')
      .textContent('Willst du die Seite wirklich löschen?')
      .ok('Löschen')
      .cancel('Abbrechen')

    this._dialog.show(confirm).then(() => {
      this.page.$delete()
      this._mdToast('Seite wurde gelöscht')
      //TODO: update global pages-list in app.js
    })
  }
  reload() {
    let views = [];
    this._debug('Reloading page contents, current views: ', this.page.views);
    this.views = [];
    this.page.views.forEach((view, index) => {
      this._view.get({view_id: view}).$promise.then((viewRes) => {
        this._debug('View call finished, response: ', viewRes);
        this._template.getHtml(viewRes.templateName).then((res) => {
          views[index] = {
            view: viewRes,
            html: res.data,
          };
          if (views.length == this.page.views.length) {
            this.views = views;
          }
        });
      });
    });
  };

  _debug(msg, dump) {
    let text = 'boEditor - ' + msg;
    this._log.debug(text);
    if (dump) {
      this._log.debug(dump);
      this._log.debug('----DUMP COMPLETE----');
    }
  };

  deleteView(index) {
    this.page.views.splice(index, 1);
    this.page.$save();
    this.reload();
  };

  siteSettings(event) {
    this._dialog.show({
      controller: SettingsCtrl,
      controllerAs: 'settings',
      bindToController: true,
      locals: {
        props: this.page.properties,
      },
      template: require('./settings/settings.ng.html'),
      parent: angular.element(document.body),
      targetEvent: event,
      clickOutsideToClose: true,
    });
  };

  getUrl () {
    return '/live/de/'+this.page.properties[this.props].url
  }
  drop(event, index, item, type) {
    if (type === 'template') {
      let _this = this;
      var view = new this._view;
      this._debug('Item was dropped, content:', item);
      view.name = item.name;
      view.$save(null, function (call) {
        _this._debug('view.$save got called with data:', call);
        _this.page.views.splice(index, 0, call._id);
        _this.page.$save();
        _this.reload();
        return true;
      });
    } else {
      this._debug('Dropped item: ', item);
      this.page.views.splice(this.page.views.indexOf(item.view._id), 1);
      this.page.views.splice(index, 0, item.view._id);
      this.page.$save();
      this.reload();
      return true;
    }
  };
};
