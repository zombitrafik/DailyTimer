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
			],
			isPrivate: true,
			creator: '559d706d9db02511004e9ca6'
		};
		$http.post('http://localhost:3000/api/schedules?access_token=Qx4DjqqSHSRhtHNpBrgyMWiiNpMxeFoi', body).success(function (response) {
			console.log(response);
		});
	};
	$scope.DeleteSchedule = function () {
		$http.delete('http://localhost:3000/api/schedules/' + $scope.deleteID + '?access_token=Qx4DjqqSHSRhtHNpBrgyMWiiNpMxeFoi').success(function (response) {
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
		$http.put('http://localhost:3000/api/schedules/' + $scope.changeID + '?access_token=RUXoSWICegffZURyR1QKUCbYJSrwjKpK', body).success(function (response) {
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

	$scope.Exchange = function  () {
		var body = {
			id: '111884272453300501793',
			displayName: '123',
			accessToken: 'ya29.rAHkdya2cteKzFVWhOM5L7yMyoxrtwpSmPhzsAOYG6Dy7-iC4J1eiCYb3Psm79R3Bv-WSnZ391L9XGdY0xrHQGMKZ8bcJBCaNf9wQAjk47Md8AGaFvJO',        
			email: '123'
		};
		$http.post('http://localhost:3000/auth/google/getAccessById', body).success(function (response) {
			console.log(response);
		});
	}
/*


	$scope.Exchange = function  () {
		var body = {
			id: '234567'
		};
		$http.post('http://localhost:1337/auth/getTokenById', body).success(function (response) {
			console.log(response);
		});
	}

*/
});