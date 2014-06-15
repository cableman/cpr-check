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

App.controller('LoginController', function($scope, $http) {

  $scope.login = function login(form) {
    alert('clicked');
    alert($scope.username);
    // Get values.
    var config = {
      params : {
        'username': $scope.username,
        'password': $scope.password
      },
    };




  }
});