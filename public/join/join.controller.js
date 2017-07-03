(function () {
    'use strict';

    angular.module('thesisApp').controller('JoinController', JoinController);

    JoinController.$inject = ['$scope', '$location', '$localStorage', 'socket']

    function JoinController($scope, $location, $localStorage, socket) {
        $scope.name = "";
        var nickname;

        $scope.title = "Join here"
        $scope.join = function () {
            nickname = $scope.name;
            $localStorage.nickname = nickname;

            // Emittig join, while sending a nickname obj along
            socket.emit('join', {
                nickname: nickname
            });

            $location.path('/main');

        }
    }



})();