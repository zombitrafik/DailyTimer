var AppCtrl = angular.module('AppCtrl', [])
	.controller('ScheduleCtrl', ['$scope', '$location', '$http', function ($scope, $location, $http) {
		$scope.schedules = [];
		$scope.items = [];

		$scope.loadSchedules = function () {
			$http.get('https://sleepy-river-1523.herokuapp.com/api/schedules?access_token='+$scope.token).success(function (response) {
				$scope.schedules = response.schedules;
			});
		};

		$scope.deleteSchedule = function (id) {
			$http.delete('https://sleepy-river-1523.herokuapp.com/api/schedules/' + id + '?access_token='+$scope.token).success(function (response) {
				console.log(response);
				init();
			});
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
			$http.get('https://sleepy-river-1523.herokuapp.com/api/schedules/'+$routeParams.id+'?access_token='+$scope.token).success(function (response) {
				$scope.detailsSchedule = response.schedule;
			});
		};

		var init = function () {
			$scope.loadSchedule();
		};
		init();
	}])
	.controller('EditCtrl', ['$scope', '$http', '$routeParams', '$location', function ($scope, $http, $routeParams, $location) {
		
		function Item(tid, config) {
			this.tid = tid;
			if(config!=null) {
				this.title = config.title;
				this.fontColor = config.fontColor;
				this.bgColor = config.bgColor;
				this.time = config.time;
				return;
			}
			this.title = '';
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

		$scope.AddItem = function () {
			var s = $scope.schedule.schedule;
			
			if(s.length<=0 || s[s.length-1].validate()){
				$scope.schedule.schedule.push(new Item(currentItem, null));
				currentItem++;
			}
		};

		$scope.deleteItem = function (tid) {
			var s = $scope.schedule.schedule;
			for(var i in s){
				if(s[i].tid == tid) {
					s.splice(i, 1);
					return;
				}
			}
		};

		var currentItem = 0;


		$scope.loadSchedule = function () {
			$http.get('https://sleepy-river-1523.herokuapp.com/api/schedules/'+$routeParams.id+'?access_token='+$scope.token).success(function (response) {
				$scope.schedule = response.schedule;

				var s = $scope.schedule.schedule;
				for(var i in s){
					s[i] = new Item(currentItem, s[i]);
					currentItem++;
				}
			});
		};

		$scope.Save = function () {
			var s = $scope.schedule.schedule;
			for(var i in s){
				if(!s[i].validate()) s.splice(i, 1);
			}
			if($scope.schedule.title == '') return; // empty title
			if($scope.schedule.schedule.length == 0) return; // empty items

			var body = $scope.schedule;

			$http.put('https://sleepy-river-1523.herokuapp.com/api/schedules/' + $routeParams.id + '?access_token='+$scope.token, body).success(function (response) {
				$location.url('/schedules');
			});
		};

		var init = function () {
			$scope.loadSchedule();
		};
		init();
	}])
	.controller('CreateCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
		
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
			
			if(s.length<=0 || s[s.length-1].validate()){
				$scope.schedule.schedule.push(new Item(currentItem));
				currentItem++;
			}
		};

		$scope.deleteItem = function (tid) {
			var s = $scope.schedule.schedule;
			for(var i in s){
				if(s[i].tid == tid) {
					s.splice(i, 1);
					return;
				}
			}
		};

		$scope.Save = function () {
			for(var i in $scope.schedule.schedule){
				var s = $scope.schedule.schedule;
				if(!s[i].validate()) s.splice(i, 1);
			}
			if($scope.schedule.title == '') return; // empty title
			if($scope.schedule.schedule.length == 0) return; // empty items

			var body = $scope.schedule;

			$http.post('https://sleepy-river-1523.herokuapp.com/api/schedules?access_token=' + $scope.token, body).success(function (response) {
				console.log(response);
				$location.url('/schedules');
			});
		};

		var init = function () {
			var s = $scope.schedule.schedule;
			s.push(new Item(currentItem));
			currentItem++;
		};

		init();

	}])
	.directive('myItem', function(){
        return {
            restrict: 'E',
            templateUrl: 'app/templates/item.html',
            replace: true,
            transclude: false,
            scope: {
            	item: '=item',
            	deleteItem: '=deleteItem'
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