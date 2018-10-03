'use strict';

/**
 * @ngdoc overview
 * @name meandyouv2App
 * @description
 * # meandyouv2App
 *
 * Main module of the application.
 */
angular
  .module('meandyouv2App', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'ngAnimate', 
    'toastr'
  ])
  .constant('LOCALES', {
    'locales': {
      'it-IT': 'Italiano',
      'en-GB': 'English',
      'ro-RO': 'Română',
      'sv-SE': 'Svenska'
    },
    'preferredLocale': 'en-GB'
  })
  .config(function ($routeProvider, $translateProvider, tmhDynamicLocaleProvider, $locationProvider, LOCALES) {

    $locationProvider.html5Mode(true); //OJO CAMBIAR A TRUE PARA PRODUCCION
    $translateProvider.useMissingTranslationHandlerLog()
    .useStaticFilesLoader({
        prefix: 'resources/locale_',// path to translations files
        suffix: '.json'// suffix, currently- extension of the translations
    })
    .preferredLanguage(LOCALES.preferredLocale)// is applied on first load
    .useSanitizeValueStrategy('escape')
    .useLocalStorage();
    tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');

    //    tmhDynamicLocaleProvider.localeLocationPattern('resources/locale_{{locale}}.json');
    //END OF i18N CONFIGURATION


 /*    //I18N CONFIG
    $translateProvider.useMissingTranslationHandlerLog();
    $translateProvider.useStaticFilesLoader({
        prefix: 'resources/locale_',// path to translations files
        suffix: '.json'// suffix, currently- extension of the translations
    });

    $translateProvider.preferredLanguage('en-GB');// is applied on first load
    $translateProvider.useLocalStorage();// saves selected language to localStorage

    tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js'); */


    $routeProvider
      .when('/:lang', {
        templateUrl: function(){


          if((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)){
            return 'views/mobile.html';
          }else{
            return 'views/main.html';
          }
        },
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/stories/:lang', {
        templateUrl: 'views/stories.html',
        controller: 'StoriesCtrl',
        controllerAs: 'stories'
      })
      .otherwise({
        redirectTo: '/en-GB'
      });

  });
