var app = angular.module('app', []);

app.controller('Ctrl', function ($scope, $http) {
	$scope.deleteID = "";
	$scope.getID = "";
	$scope.changeID = "";

	$scope.GetSchedules = function () {
		$http.get('http://localhost:1337/api/schedules').success(function (response) {
			console.log(response);
		});
	};
	$scope.PostSchedule = function () {
		var body = {
			title: "My first schedule",
			schedule: [
				{title: "Проснуться", time: new Date().toString(), color: "rgba(100,120,200, 0.8)" },
				{title: "Заснуть", time: new Date().toString(), color: "rgba(100,120,200, 0.8)" },
			]
		};
		$http.post('http://localhost:1337/api/schedules', body).success(function (response) {
			console.log(response);
		});
	};
	$scope.DeleteSchedule = function () {
		$http.delete('http://localhost:1337/api/schedules/' + $scope.deleteID).success(function (response) {
			console.log(response);
		});
	};

	$scope.GetScheduleById = function () {
		$http.get('http://localhost:1337/api/schedules/' + $scope.getID).success(function (response) {
			console.log(response);
		});
	};

	$scope.ChangeScheduleById = function () {
		var body = {
			title: "Changed title for id " + $scope.changeID
		}
		$http.put('http://localhost:1337/api/schedules/' + $scope.changeID, body).success(function (response) {
			console.log(response);
		});
	};

	$scope.SignUp = function () {
		var body = {
			username: $scope.username,
			password: $scope.password
		};
		$http.post('http://localhost:1337/auth/local/signup', body).success(function (response) {
			console.log(response);
		});
	};

	$scope.LogIn = function  () {
		var body = {
			username: $scope.username,
			password: $scope.password
		};
		$http.post('http://localhost:1337/auth/local/login', body).success(function (response) {
			console.log(response);
		});
	};
});