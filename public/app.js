(function ready() {
    'use strict';
    angular.module('endcrypt', [])
    .factory('endcrypt', function ($window) {
        if ($window.endcrypt) {
            //Delete endcrypt from window so it's not globally accessible.
            //  We can still get at it through _thirdParty however, more on why later
            $window._thirdParty = $window._thirdParty || {};
            $window._thirdParty.endcrypt = $window.endcrypt;
            try { delete $window.endcrypt; } catch (e) {
                $window.endcrypt = undefined;
                /*<IE8 doesn't do delete of window vars, make undefined if delete error*/
            }
        }
        var endcrypt = $window._thirdParty.endcrypt;
        return endcrypt;
    });
    angular.module('thesisApp', ['ngRoute', 'ngCookies', 'ngSanitize', 'ngLodash', 'ngStorage', 'ngMaterial', 'endcrypt']);
    angular.module('thesisApp').factory('myService', ['endcrypt', function (endcrypt) {
        console.log('Wow, such clean access to endcrypt as a service', endcrypt());
    }]);
})();