(function () {
    'use strict';

    angular.module('thesisApp').config(function ($routeProvider) {
        $routeProvider
          // route for the main page
         .when('/main', {
             templateUrl: 'main/main.template.html',
             controller: 'MainController'
         })
         // route for the join page
         .when('/join', {
             templateUrl: 'join/join.template.html',
             controller: 'JoinController'
         })
         .otherwise({
             redirectTo: '/join'
         });
    })
})();