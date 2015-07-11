var app = angular.module('app', [
	'ngRoute',
	'AppCtrl'
	])
	.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
		$routeProvider
		.when('/create', {
			templateUrl: 'app/views/create.html',
			controller: 'CreateCtrl'
		})
		.when('/edit', {
			templateUrl: 'app/views/edit.html',
			controller: 'EditCtrl'
		})
		.when('/schedules', {
			templateUrl: 'app/views/view.html',
			controller: 'ScheduleCtrl'
		})
		.when('/detail', {
			templateUrl: 'app/views/detail.html',
			controller: 'DetailCtrl'
		})
		.otherwise({redirectTo: '/schedules'});

		$locationProvider.html5Mode({enabled: true, requireBase: false});
	}]);