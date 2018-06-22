'use strict';

angular.module('IFSIPrototype')
.directive('selectBox', function($timeout) {
  return {
    restrict: 'E',
    require: ["ngModel", "^form"],
    replace: true,
    scope: {
      options:'=',
      clear:'=',
      allOption:'=',
      limit:'=',
      allowFilter:'='
    },
    templateUrl: 'app/select-box/_select_box.html',
    link: function($scope, $element, $attrs, ctrls) {
      var ngModelCtrl = ctrls[0]
      ,   form = ctrls[1]
      ,   $input = $element.find('input')
      ;
      console.log($scope.ids)
      $scope.filter = '';

      $timeout(function() {
        form.$setPristine();
      });

      $scope.$watch('options', function(newVal, oldVal) {
        if (angular.equals(newVal, oldVal)) return;
        var newIds = getAllOptIDs();

        $scope.ids = $scope.ids.filter(function(id) {
          return newIds.indexOf(id) > -1;
        });

        $scope.all = $scope.allOption.hasOwnProperty('value') ?
                      $scope.ids.indexOf($scope.allOption.value) > -1 :
                      angular.equals($scope.ids.length, newIds.length);

        ngModelCtrl.$setViewValue({
          ids: $scope.ids
        });
      });

      ngModelCtrl.$formatters.push(function(modelValue) {
        if (!modelValue) {
          $scope.all = false;
          return {ids:[]};
        }
        return {ids: angular.copy(modelValue)};
      });

      ngModelCtrl.$parsers.push(function(viewModel) {
        return angular.copy(viewModel.ids);
      });

      ngModelCtrl.$render = function() {
        //default value if empty
        if (!ngModelCtrl.$viewValue) {
          ngModelCtrl.$viewValue = {ids:[]};
        }

        $scope.ids = ngModelCtrl.$viewValue.ids;
        $scope.all = $scope.allOption.hasOwnProperty('value') ?
                      $scope.ids.indexOf($scope.allOption.value) > -1 :
                      angular.equals($scope.ids.length, getAllOptIDs().length);
      }

      $scope.toggle = function(id) {
        var i = $scope.ids.indexOf(id);

        $scope.ids = $scope.ids.filter(function(id) { return id != $scope.allOption.value;});

        if (i>-1&&!$scope.all) {
          $scope.ids = $scope.ids.filter(function(ident) {
            return ident != id;
          });
        }
        else if (i>-1&&$scope.all) {
          $scope.ids = [id];
        }
        else if (!$scope.limit || ($scope.limit && $scope.ids.length < $scope.limit)) {
          $scope.ids.push(id);
        }

        $scope.all = angular.equals($scope.ids.length, getAllOptIDs().length);
        ngModelCtrl.$setViewValue({ids: $scope.ids});
      }

      $scope.toggleAll = function() {
        $scope.all = !$scope.all;

        if ($scope.all&&$scope.allOption.hasOwnProperty('value')) {
          $scope.ids = [$scope.allOption.value];
        }
        else if ($scope.all) {
          $scope.ids = getAllOptIDs();
        }

        ngModelCtrl.$setViewValue({ids:$scope.ids});
      }

      $scope.deselectAll = function() {
        $scope.ids = [];
        ngModelCtrl.$setViewValue({ids: $scope.ids});
        $scope.all = false;
      }

      function getAllOptIDs() {
        return $scope.options.map(function(o){return o.ID;});
      }

      $(document).click(function(e) {
        var hasFocus = $element.has($(e.target)).length > 0 || $element.is($(e.target));
        $element.toggleClass('focus', hasFocus);
        if (hasFocus) {
          $input.focus();
        }
      });
    }
  }
});