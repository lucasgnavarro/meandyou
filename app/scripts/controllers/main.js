'use strict';

/**
 * @ngdoc function
 * @name meandyouv2App.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meandyouv2App
 */
angular.module('meandyouv2App')
  .controller('MainCtrl', function($scope, $routeParams, cardsRsc, 
    LocaleService, LOCALES, $http, $timeout, $translate, toastr) {

    // Settings data
    $scope.settings = {};
    $scope.settings.cardScales = new CardScale();
    $scope.settings.fullscreen = false;
    $scope.settings.autoScaling = true;
    $scope.settings.scale = 1;

    document.body.classList.remove('not-game');

    /***
     * Game data Vars
     */
    $scope.data = {};

    $scope.data.categories = [];

    $scope.data.filteredCategories = [];//angular.copy($scope.data.categories);
    $scope.data.cards = [];
    $scope.data.cardsInitialState = [];
    $scope.data.cardsInBoard = [];
    $scope.data.savedStates = [];
    $scope.data.audio = {
      clickCard: new Howl({src: ['/files/click_card.ogg']}),
      drop: new Howl({src: ['/files/drop_card.ogg']}),
      ready: new Howl({src: ['/files/suit_ready.ogg']})
    };
    $scope.data.loader = {};
    $scope.data.loader.total = 0;
    $scope.data.loader.count = 0;

    /**
     * Businnes Logic
     */
    $scope.bl = {};

    $scope.bl.scaleUp = function(){
      if(!$scope.settings.autoScaling && $scope.settings.scale < 15){
        $scope.settings.scale += 1;
      }
    };

    $scope.bl.scaleDown = function(){
      if(!$scope.settings.autoScaling && $scope.settings.scale > 1){
        $scope.settings.scale -= 1;
      }
    };

    // Check if category is filtered
    $scope.bl.categoryIsFiltered = function(category){
      return $scope.data.filteredCategories.indexOf(category) >= 0 ;
    };

    // Push or Splice category from filtered categories array
    $scope.bl.categoryFilteredToggle = function(category){
      let index = $scope.data.filteredCategories.indexOf(category);
      // Check if category is filtered
      if(index >= 0){
        $scope.data.filteredCategories.splice(index, 1);
        
        $scope.bl.filterCardsInBoard(category);

      }else{
        $scope.data.filteredCategories.push(category);
      }

    };

    /**
     * Get card name
     * @param {*} cardsDef Full card definition
     */
    $scope.bl.getCardName = function(cardsDef){
      let splitedDef = cardsDef.split('/');
      splitedDef = splitedDef[splitedDef.length-1];
      //  splitedDef.split('.')[0]

      return splitedDef; 
    };

    /**
    * 
    */
    $scope.bl.scaleCalculator = function(){
      let scales = $scope.settings.cardScales.scales; 
      
      if( $scope.settings.autoScaling ){
        //console.debug('AutoScaling RETURNS ' + scales[$scope.bl.getCardsInBoardCount()] );
        let _scaleToReturn = parseInt(scales[$scope.bl.getCardsInBoardCount()]);
        $scope.settings.scale = _scaleToReturn; 
        return parseInt(_scaleToReturn);   
      }else{
        return parseInt($scope.settings.scale);
      }

    };

    // Get cards json definition
    $scope.bl.getCardsDefinition = function(callback){

      let success = function(response){
        let _cardsDef = response.data[$scope.settings.lang];
        //console.debug(_cardsDef);
        if(!angular.isDefined(_cardsDef) || _cardsDef.length === 0){
          console.error('ERROR AL LEER CARTAS PARA ' + LocaleService.getLocaleDisplayName());
          toastr.error('Failed on load resources for language ' + LocaleService.getLocaleDisplayName(), 'Ooops');

        }

        for(let category in _cardsDef){
          // console.debug(_cardsDef[category]);
          $scope.data.categories.push(category)
          $scope.data.filteredCategories.push(category);

          // Iterate over all cards def 
          for(let i=0; i< _cardsDef[category].length; i++){
            let _currentCardDef = _cardsDef[category][i];
            let _cardName = $scope.bl.getCardName(_currentCardDef);

            //Create the card Obj
            let cardObj = new Card({'$http': $http});
            cardObj.name = _cardName;
            cardObj.category = category;
            cardObj.image = _currentCardDef;
            cardObj.mappedScales = $scope.settings.cardScales.scales;
            cardObj.cardsInBoardCount = $scope.bl.getCardsInBoardCount;
            cardObj.scaleCalculator = $scope.bl.scaleCalculator;
            $scope.data.cards.push(cardObj);

          }//Loop definitions 

        }//Loop Categories
        
        // console.debug($scope.data.cards.length);  
        //Return card length
        $scope.bl.shuffle($scope.data.cards);
        $scope.settings.cardsCount = $scope.data.cards.length;

        // Callo to Fn to preload Images
        callback($scope.data.cards);

      };
      
      let error = function(error){
        console.error(JSON.stringify(error));
      };

      cardsRsc.then(success, error);
      
    };

    /**
     * Save stack and board state
     */
    $scope.bl.saveState = function(){

      let _state = {
        'cards': angular.copy($scope.data.cards),
        'cardsInBoard': angular.copy($scope.data.cardsInBoard)
      };

      $scope.data.savedStates.push(_state);

    };


    $scope.bl.restoreState = function(){
      let _last = $scope.data.savedStates.length -1;

      $scope.data.cards = [];
      $scope.data.cardsInBoard = [];

      $scope.data.cards = angular.copy($scope.data.savedStates[_last]['cards']);
      $scope.data.cardsInBoard = angular.copy($scope.data.savedStates[_last]['cardsInBoard']);

      $scope.data.savedStates.splice(_last, 1);
    };
    
    $scope.bl.getSavedStatesCount = function(){
      return $scope.data.savedStates.length;
    };

    //Set card from stack to Board
    $scope.bl.setCardInBoard = function(){
      for(let i=0; i<$scope.data.cards.length; i++){
        let currentCard = $scope.data.cards[i];

        if($scope.bl.checkCardIsValid(currentCard)){
          //SAVE STATE
          $scope.bl.saveState();

          //Set card in board
          $scope.data.cardsInBoard.push(currentCard);

          //Remove card from stack
          $scope.data.cards.splice(i, 1);

          
          break;
        }

      }      
    };

    $scope.bl.setAllCardsInBoard = function(){
      $scope.data.cardsInBoard = angular.copy($scope.data.cardsInitialState);
      $scope.data.cards = [];
      /* for(var i = $scope.data.cards.length; i--;){
        $scope.data.cardsInBoard.push($scope.data.cards[i]);
        $scope.data.cards.splice(i, 1);
      } */
    };

    $scope.bl.setCardsInBoardByCategory = function(category){
      $scope.data.cardsInBoard = [];
      $scope.data.cards = angular.copy($scope.data.cardsInitialState);

      for(var i = $scope.data.cards.length; i--;){
        let currentCard = $scope.data.cards[i];

        if(currentCard.category === category){

          //Set card in board
          $scope.data.cardsInBoard.push(currentCard);

          //Remove card from stack
          $scope.data.cards.splice(i, 1);
        }

      }
    };

    /**
     * FN to remove card from board
     * @param {*} card  Card to Remove
     */
    $scope.bl.removeCardFromBoard = function(card){

      let indexToRemove = $scope.data.cardsInBoard.indexOf(card);

      if(indexToRemove !== -1){
        //let removedCard = $scope.data.cardsInBoard[indexToRemove];
       
        card.selected = false;
        //Add card at the end of stack
        $scope.data.cards.push(card);

        //Remove card from board
        $scope.data.cardsInBoard.splice(indexToRemove, 1);
        $scope.$apply();

      }else{
        console.error('ERROR AL DROPEAR LA CARTA');
      }

    };

    /**
     * Set all cards.selected = false in board
     */
    $scope.bl.clearSelectedCards = function(){
      for(let i=0; i < $scope.data.cardsInBoard.length; i++){
        $scope.data.cardsInBoard[i].selected = false;
      }
      //$scope.$apply();

    };

    $scope.bl.keepSelectedCards = function(){
      $scope.bl.saveState();
      for(var i = $scope.data.cardsInBoard.length; i--;){
        let _card = $scope.data.cardsInBoard[i];

        if(!_card.selected){
          $scope.data.cards.push(_card);
          $scope.data.cardsInBoard.splice(i,1);
        }else{
          _card.selected = false;
        }

      }

    };

    $scope.bl.resetBoard = function(){
      $scope.data.cardsInBoard = [];
      $scope.data.cards = angular.copy($scope.data.cardsInitialState);
      $scope.data.savedStates = [];
    };

    /**
     * FN to filter cards in board by category 
     * @param {String} category 
     */
    $scope.bl.filterCardsInBoard = function(category){
      
      console.debug($scope.data.cardsInBoard.length);
      for(var i = $scope.data.cardsInBoard.length; i--;){
        //let i=0; i < $scope.data.cardsInBoard.length; i++){
        console.debug(i);
        let _card =  $scope.data.cardsInBoard[i];
        console.debug(_card.category);
        if(_card.category === category){
          console.debug('IF CARD.EQUALS ' +_card);
          //Add card to end of stack
          $scope.data.cards.push(_card);

          //remove from board
          $scope.data.cardsInBoard.splice(i, 1);
        }
        
      }
    };

    /**
     * Check if card is valid (not in board, and category in filtered categories)
     * @param {*} card Card to check
     */
    $scope.bl.checkCardIsValid = function(card){
      let _isValid = false;

      if($scope.data.cardsInBoard.indexOf(card) === -1){
        _isValid = true;

        if($scope.data.filteredCategories.indexOf(card.category) === -1){
        //   _isValid = true;
        // }else{
          _isValid = false;
        }

      }

      return _isValid;
    };

    /**
     * Get number of cards in board
     */
    $scope.bl.getCardsInBoardCount = function(){
      //console.debug($scope.data.cardsInBoard);
      return parseInt($scope.data.cardsInBoard.length);
    };

    
    /**
     * Ger number of selected cards 
     */
    $scope.bl.getCardsSelectedCount = function(){
      let _selected = 0;
      for(let i=0; i < $scope.data.cardsInBoard.length; i++){
        if($scope.data.cardsInBoard[i].selected){
          _selected += 1;
        }
      }

      return _selected;//$('[is-selected=true]').length;
    };


    /**
     * Get css grid class
     */
    $scope.bl.getGridClass = function(){
      let _gridClass = null;
      _gridClass = 'grid-scale-' + $scope.bl.scaleCalculator(); 
      //+ $scope.settings.cardScales.scales[$scope.bl.getCardsInBoardCount()];
      return _gridClass;
    };

    /**
     * AutoScaling Toggle
     */
    $scope.bl.toggleAutoScaling = function(){
      $scope.settings.autoScaling = !$scope.settings.autoScaling;
    };

    $scope.bl.gameIsLoaded = function(){
      if($scope.data.cards.length > 0 && ($scope.data.loader.count === $scope.data.cards.length)){
        return true;
      }
    };

    $scope.bl.isMobileDevice = function(){
      return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    };

    $scope.bl.shuffle = function(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
    };
  

    /**
     * UI Listeners
     */
    $scope.ui = {};
    $scope.ui.listeners = {};


    $scope.ui.closeAllDropdowns = function(){
      document.getElementById("show-category-dropdown").classList.remove("show");
      document.getElementById("scale-dropdown").classList.remove("show");
      document.getElementById("filter-card-dropdown").classList.remove("show");
    };

    /**
     * Stack Click Listener
     */
    $scope.ui.listeners.stackClick = function(){
      $scope.ui.closeAllDropdowns();
      $scope.bl.setCardInBoard();
    };

    /**
     * Stack Drop Listener
     */
    $scope.ui.setStackDropListener = function(){

      $('#stack-img').droppable({
        drop: function(){ //event, ui
          $scope.ui.closeAllDropdowns();
          //SAVE STATE
          $scope.bl.saveState();

          // Loop through selected cards to drop them
          $("[is-selected=true]").each(function( index, element ) {
            /* if(idsToRemove.indexOf(element.id) === -1){
              idsToRemove.push(element.id);
            } */
            //console.debug( .image );

            //REMOVE CARD
            let card = angular.element(element).scope().card;
            $scope.bl.removeCardFromBoard(card);
            $scope.$apply();
            let audio = document.getElementById('audio-drop-card');
            audio.muted = false;
            audio.play();

          });

        },
        activate: function(){
          $(this).effect('shake', {distance:1});
        }
      });

    };

    $scope.ui.listeners.howToUse = function(){
      $scope.ui.closeAllDropdowns();
      let _urls = {
        'en-GB':'http://meandyouandeveryone.com/?page_id=32',
        'it-IT': 'http://meandyouandeveryone.com/?page_id=3890&lang=it',
        'ro-RO': 'http://meandyouandeveryone.com/?page_id=3893&lang=ro',
        'sv-SE': 'http://meandyouandeveryone.com/?page_id=3896&lang=sv'
      };

      window.open(_urls[$scope.settings.lang], '_blank');
    
    };

    $scope.ui.listeners.viewFullScreen = function(index, $event){
      $scope.ui.closeAllDropdowns();
      $event.stopPropagation();
      console.debug('view full screen ' + index);

      //Create the DOM element for viewer
      let _container = document.getElementById('viewer-container');
      let _ulViewer = document.createElement('ul');

      for(let i=0; i< $scope.data.cardsInBoard.length; i++){
        let _li = document.createElement('li');
        let _img = document.createElement('img');

        _img.src = $scope.data.cardsInBoard[i].image;
        _img.alt = $scope.data.cardsInBoard[i].name;

        _li.appendChild(_img);
        console.debug('Img ' + JSON.stringify(_li));

        _ulViewer.appendChild(_li);
        _ulViewer.id = 'viewer';

      }
      _container.appendChild(_ulViewer);
      //Create the DOM element for viewer

      let options = {
        title:false,
        toolbar: {prev:1, next:1},
        initialViewIndex: index,
        hidden: function(){
          //Empty viewer container
          while (_container.firstChild) {
            _container.removeChild(_container.firstChild);
          }
        }
      };

      var viewer = new Viewer(document.getElementById('viewer'), options);
      viewer.show();

    };

    // START DROPDONWS
    $scope.ui.listeners.filterCardDropdown = function($event){
      $event.stopPropagation();
      document.getElementById("show-category-dropdown").classList.remove("show");
      document.getElementById("scale-dropdown").classList.remove("show");
      document.getElementById("filter-card-dropdown").classList.toggle("show");
    };

    $scope.ui.listeners.showCategoryDropdown = function($event){
      $event.stopPropagation();
      document.getElementById("filter-card-dropdown").classList.remove("show");
      document.getElementById("scale-dropdown").classList.remove("show");
      document.getElementById("show-category-dropdown").classList.toggle("show");
    };

    $scope.ui.listeners.scaleDropdown = function($event){
      $event.stopPropagation();
      document.getElementById("filter-card-dropdown").classList.remove("show");
      document.getElementById("show-category-dropdown").classList.remove("show");
      document.getElementById("scale-dropdown").classList.toggle("show");
      
    };
    // END DROPDOWNS
    

    

    /* View in fullscreen */
    $scope.ui.openFullscreen = function() {
      let elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
      $scope.settings.fullscreen = true;
    };

    /* Close fullscreen */
    $scope.ui.closeFullscreen = function() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
      $scope.settings.fullscreen = false;
    };


    $scope.ui.listeners.startGame = function(){
      if($scope.bl.gameIsLoaded()){
        
        //alert($scope.bl.isMobileDevice());
        /* if($scope.bl.isMobileDevice()){
          $scope.ui.openFullscreen();
        } */
        
        let _element = document.getElementById('preload-overlay');
        _element.parentNode.removeChild(_element);

      }
    };


    $scope.ui.listeners.btnShowStories = function(){
      // $('#stories-overlay').fadeIn(100);
      var goTo = '/stories/'+$scope.settings.lang //$state.href('game-stories', {}, {absolute: true});
      var win_config = "location=no,height=550,width=1000,scrollbars=yes,status=yes, titlebar=yes";

      window.open(goTo, "Stories", win_config);
    };


     /**
     * Scope init methods 
     * */ 
    $scope.init = {};


    // Fn to Set Language
    $scope.init.setLang = function(){
      let _locales = LOCALES.locales;
      let _currentLang = $routeParams.lang;

      if(_currentLang in _locales){
        LocaleService.setLocaleByDisplayName(_locales[_currentLang]);
        $scope.settings.lang = _currentLang;
      }else{
        LocaleService.setLocaleByDisplayName(_locales['en_GB']);
        $scope.settings.lang = 'en_GB';
      }

      //POR LAS DUDAS REFRESCO
      /* $scope.data.categories = [
        (function(){return $translate.instant('characters');})(), 
        (function(){return $translate.instant('commonStatements');})(), 
        (function(){return $translate.instant('definitions');})(), 
        (function(){return $translate.instant('keywords');})(), 
        (function(){return $translate.instant('keywordsNoWords');})(), 
        (function(){return $translate.instant('settings');})()
      ]; */

      
      
    };

    
    /**
     * Load Game Resources
     */
    $scope.init.loadResources = function(){
      console.debug('LOADING RESOURCES');
      //Get cards Definition

      // $scope.data.audio.ready.play();
      //Get the cards definition and return cardsCount
      $scope.bl.getCardsDefinition( 
        // callback of cards definition
        function(arrayCards){
          $scope.data.loader.total = arrayCards.length;
          for(let i=0; i< arrayCards.length; i++){
            arrayCards[i].preloadImage(
              //Callback of load card image
              function(){
              //console.log(arrayCards[i].image +' Loaded ');
                $scope.data.loader.count += 1;
                if($scope.data.loader.count === arrayCards.length){
                  let audio = document.getElementById('audio-game-ready');
                  audio.muted = false;
                  audio.load();
                  audio.addEventListener('canplaythrough', function() { 
                    audio.play();
                  }, false);
                      
                }
              }
            );
          }
          $scope.data.cardsInitialState = angular.copy($scope.data.cards);

        }
      );

    };

    //Call all init Functions
    for(let fn in $scope.init){
      if(typeof $scope.init[fn] === 'function'){
        $scope.init[fn]();
      }
    }



/*     //WATCHERS 
    $scope.$watch('settings.scale', function() {
        $scope.settings.scale  = parseInt($scope.settings.scale);
    }, true);
 */





  
    // // Close the dropdown menu if the user clicks outside of it
    // window.onclick = function(event) {
    //   if (!event.target.matches('.dropbtn')) {
    
    //     var dropdowns = document.getElementsByClassName("dropdown-content");
    //     var i;
    //     for (i = 0; i < dropdowns.length; i++) {
    //       var openDropdown = dropdowns[i];
    //       if (openDropdown.classList.contains('show')) {
    //         openDropdown.classList.remove('show');
    //       }
    //     }
    //   }
    // };

    /**
     * TERMINA DROPDONWS
     */
       
  });
