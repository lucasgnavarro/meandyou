'use strict';

/**
 * @ngdoc service
 * @name meandyouv2App.cardsRsc
 * @description
 * # cardsRsc
 * Factory in the meandyouv2App.
 */
angular.module('meandyouv2App')
  .factory('cardsRsc', function ($http) {
    var json_path = '/files/cards.json';

    return $http.get(json_path);
  });
