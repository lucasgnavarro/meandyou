'use strict';

/**
 * @ngdoc directive
 * @name meandyouv2App.directive:Card
 * @description
 * # Card
 */

angular.module('meandyouv2App')
  .directive('card', function () {
    return {
      templateUrl: 'views/partials/card.html',
      restrict: 'E',
      replace: true,
      scope: {
        definition:'=',
        // id: '@'
      },
      controller: function($scope){
        $scope.self = $scope.definition; //angular.copy();
        // alert($scope.self.name);
      },
      link: function postLink(scope, element, attrs) {

        element.css({
          'background': 'url("' +scope.self.image +'") no-repeat center center #FFF',
          'background-size' : 'cover'
        });
        
        

        // MAKE CARD DRAGGABLE
        $(element).draggable({
            revert:true,
            start: function(event, ui) {//event, ui
              $(this).css('z-index','10000');
              $(this).css('cursor', 'move');
              //$(this);.addClass('card-selected');
              
              if(!scope.self.selected){
                scope.self.toggleSelectedState();
                scope.$apply();
              }
            },
            drag: function(e, ui) {
              // this works because the position is relative to the starting position
              $('[is-selected=true]').css({
                  top: ui.position.top,
                  left: ui.position.left
              });
            },           
            stop: function(  ) { //event, ui
              $(this).css('z-index','2');
              $(this).css('cursor', 'pointer');
              $('[is-selected=true]').css({
                  top: 0,
                  left: 0
              });
              // $(this).children('.btn-view-fs').show();
            },
  
          });

          element.bind("click", function(){
            scope.$parent.ui.closeAllDropdowns()
            scope.self.clickListener();
            scope.$apply();
          });



        /*     var id = attrs.id;
            scope.$parent.stack.toggleSelectedCard(id);
            scope.$parent.$apply(); */

        // console.debug(scope.self);
        
        // scope.id = attrs.id;

        // element.on('$destroy',function(){
        //   scope.$destroy();
        // });

        // var url = attrs.src;
        // element.css({
        //     'background-color': '#0F0F0F',
        //     'background': 'url("' + url +'") no-repeat center center #FFF',
        //     'background-size' : 'cover'
        // });
        // console.debug(element);

        
        // $(element).draggable({
        //   revert:true,
        //   start: function(  ) {//event, ui
        //     $(this).css('z-index','10000');
        //     //$(this).addClass('card-selected');

        //     var id = attrs.id;
        //     console.debug('On make card draggable');
        //     if(!scope.$parent.stack.cardIsSelected(id)){
        //       scope.$parent.stack.toggleSelectedCard(id);
        //       scope.$parent.$apply();
        //     }

        //     // scope.$parent.stack.toggleSelectedCard(attrs.id);
        //     // $(this).children('.btn-view-fs').hide();
        //   },
        //   stop: function(  ) { //event, ui
        //     $(this).css('z-index','2');
        //     $('.card-selected').css({
        //         top: 0,
        //         left: 0
        //     });
        //     // $(this).children('.btn-view-fs').show();
        //   },
        //   drag: function(e, ui) {
        //         // this works because the position is relative to the starting position
        //         $('.card-selected').css({
        //             top: ui.position.top,
        //             left: ui.position.left
        //         });
        //   }

        // });

        // element.bind("click", function(){
        //   // if(!scope.$parent.settings.cards.showOnlySelected){
        //     var id = attrs.id;
        //     scope.$parent.stack.toggleSelectedCard(id);
        //     scope.$parent.$apply();
        //   // }

        // });

      }
    };
  });
