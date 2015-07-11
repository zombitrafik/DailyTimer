var AppCtrl = angular.module('AppCtrl', [])
	.controller('ScheduleCtrl', ['$scope', '$location', '$http', function ($scope, $location, $http) {
		$scope.schedules = [];
		$scope.items = [];

		$scope.loadSchedules = function () {
			$http.get('http://localhost:3000/api/schedules?access_token='+$scope.token).success(function (response) {
				$scope.schedules = response.schedules;
			});
		};

		$scope.deleteSchedule = function (id) {
			//alert
			//delete query
			//update view
			console.log($scope.token);
			console.log('Delete schedule ' + id);
		};

		$scope.createSchedule = function () {
			$location.url('/create');	
		};

		$scope.editSchedule = function (id) {
			$location.url('/edit?id='+id);
		};

		$scope.detailSchedule = function(id) {
			$location.url('/detail?id='+id);
		};

		var init = function () {
			$scope.loadSchedules();
		};
		init();

	}])
	.controller('DetailCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
		$scope.loadSchedule = function () {
			$http.get('http://localhost:3000/api/schedules/'+$routeParams.id+'?access_token='+$scope.token).success(function (response) {
				$scope.detailsSchedule = response.schedule;
			});
		};

		var init = function () {
			$scope.loadSchedule();
		};
		init();
	}])
	.controller('EditCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
		$scope.loadSchedule = function () {
			$http.get('http://localhost:3000/api/schedules/'+$routeParams.id+'?access_token='+$scope.token).success(function (response) {
				$scope.detailsSchedule = response.schedule;
			});
		};

		var init = function () {
			$scope.loadSchedule();
		};
		init();
	}])
	.controller('CreateCtrl', ['$scope', '$http', function ($scope, $http) {
		
		function Item(tid) {
			this.title = '';
			this.tid = tid;
			this.fontColor = '';
			this.bgColor = '';
			this.time = '';
		}

		Item.prototype.validate = function() {
			if(this.title == ''     ||
			   this.fontColor == '' ||
			   this.bgColor == ''   ||
			   this.time == '') return false;
			return true;
		};

		Item.prototype.rgbToStr = function (rgb) {
			return 'rgba('+rgb.r+','+rgb.g+','+rgb.b+','+rgb.a+')';
		};

		$scope.schedule = {
			title: '',
			isPrivate: false,
			schedule: []
		};	

		var currentItem = 0;

		$scope.AddItem = function () {
			var s = $scope.schedule.schedule;
			// other validation
			if(s[s.length-1].validate()){
				$scope.schedule.schedule.push(new Item(currentItem));
				currentItem++;
			}

			
			console.log($scope.schedule);
		};

		$scope.Save = function () {
			for(var i in $scope.schedule.schedule){
				var s = $scope.schedule.schedule;
				if(!s[i].validate) s.splice(i, 1);
			}
			if($scope.schedule.title == '') return; // empty title
			if($scope.schedule.schedule.length == 0) return; // empty items

			var body = $scope.schedule;

			$http.post('http://localhost:3000/api/schedules?access_token=' + $scope.token, body).success(function (response) {
				console.log(response);
			});
		};

		var init = function () {
			var s = $scope.schedule.schedule;
			s.push(new Item(currentItem));
			currentItem++
		};

		init();

	}])
	.directive('myItem', function(){
        return {
            restrict: 'E',
            templateUrl: 'app/templates/item.html',
            replace: false,
            transclude: false,
            scope: {
            	item: '=item'
            },
            link: {
	            post: function ($scope, element, attrs) {
	            	// init all components
	            	setTimeout(function () {
	            		$('#timepicker'+$scope.item.tid).timepicker({
	            			showSeconds: true,
	            			showMeridian: false,
	            			defaultTime: 'current'
	            		});
	            		$('#colorpicker_bg'+$scope.item.tid).colorpicker().on('changeColor.colorpicker', function(event){
							$scope.item.bgColor = $scope.item.rgbToStr(event.color.toRGB());
						});

	            		$('#colorpicker_font'+$scope.item.tid).colorpicker().on('changeColor.colorpicker', function(event){
							$scope.item.fontColor = $scope.item.rgbToStr(event.color.toRGB());
						});
	            	}, 0);
	            }
	        }
        };
    });