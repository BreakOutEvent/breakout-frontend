/**
 * Created by l.heddendorp on 13.03.2016.
 */
theme.$inject = ['$mdThemingProvider'];
export default function theme($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('deep-orange')
    .accentPalette('blue-grey')
}
