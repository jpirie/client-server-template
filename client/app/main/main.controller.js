'use strict';

angular.module('testappApp')
  .controller('MainCtrl', function ($scope, $http) {

    $http.get('/api/account').success(function(exampleData) {
        $scope.exampleData = exampleData;
    });
  });
