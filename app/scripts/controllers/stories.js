'use strict';

/**
 * @ngdoc function
 * @name meandyouv2App.controller:StoriesCtrl
 * @description
 * # StoriesCtrl
 * Controller of the meandyouv2App
 */
angular.module('meandyouv2App')
  .controller('StoriesCtrl', function($scope, $routeParams, cardsRsc, 
    LocaleService, LOCALES, $http, $timeout, $translate, toastr) {

    document.body.classList.add('not-game');

    // alert('STORIE');
    $scope.data = {};
    $scope.data.storyIndex = 0;

    $scope.bl = {};
    $scope.bl.viewStory = function(index){
        $scope.data.storyIndex = index;
    };

    $scope.bl.goBack = function(){
        $scope.data.storyIndex = 0;
    };

    $scope.bl.close = function(){
        close();
    }
    });