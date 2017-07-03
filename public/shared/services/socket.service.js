(function () {
    'use strict';

    angular.module('thesisApp').factory('socket', socket);

    socket.$inject = ['$rootScope'];

    function socket($rootScope) {

        var socket = io.connect();
        return {
            on: on,
            emit: emit
        }

        // Socket 'on' method here
        function on(eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        };

        // Socket 'emit' method here
        function emit(eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        };
    }

})()