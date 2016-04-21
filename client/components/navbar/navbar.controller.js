'use strict';

angular.module('testappApp')
  .controller('NavbarCtrl', function ($scope, $uibModal, $location) {
    $scope.menu = [{
      'title': 'Page1',
      'link': '/page1'
    },{
      'title': 'Page2',
      'link': '/page2'
    }];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return route === $location.path();
    };

      $scope.openModal = function (size) {

          var modalInstance = $uibModal.open({
              animation: true,
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceCtrl',
              size: size,
              resolve: {
                  items: function () {
                      return $scope.items;
                  }
              }
          });

          modalInstance.result.then(function (selectedItem) {
              //$scope.selected = selectedItem;
          }, function () {
              //$log.info('Modal dismissed at: ' + new Date());
          });
      };
  });

angular.module('testappApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {
  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
