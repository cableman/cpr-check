/**
 * @file
 *
 */

var App = angular.module('App', ['ngRoute']);

App.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);

App.controller('LoginController', function($scope) {
  $scope.message = 'Please login...';
});