(function () {
    'use strict';

    angular.module('thesisApp').controller('MainController', MainController);

    MainController.$inject = ['$scope', '$location', '$localStorage', 'socket', '$filter', 'lodash', '$mdToast']

    function MainController($scope, $location, $localStorage, socket, $filter, lodash, $mdToast) {
        $scope.isPrivateChatEnabled = false;
        $scope.message = '';
        $scope.messages = [];
        $scope.users = [];
        $scope.mynickname = $localStorage.nickname;
        var nickname = $scope.mynickname;
        var sender;
        var receiver;

        // Emitting to get users
        socket.emit('get-users');

        // Response from server with all connected users
        // Filtering users array to remove the current user
        socket.on('all-users', function (data) {
            $scope.users = data.filter(function (item) {
                return item.nickname !== nickname;
            });
        });

        // On message-rceived pushes the data in the messages array
        socket.on('message-received', function (data) {
            if (sender) {
                var decrypted = sender.decrypt(data.message);
            }
            if (receiver) {
                var decrypted = receiver.decrypt(data.message);
            }
            data.message = decrypted;
            $scope.messages.push(data);
        })

        $scope.getTime = function () {
            var date = new Date();
            return $filter('date')(new Date(), 'HH:mm:ss');
        }

       
        $scope.createPrivateRoom = function (user) {
            
            //Create sender keys
            sender = new Endcrypt();
            var senderPublicKey = sender.publicKeyString;

            var id = lodash.get(user, 'socketid');
            var privateRoomUsers = {
                from: nickname,
                to: user.socketid,
                senderPublicKey: senderPublicKey
            }

            socket.emit('create-private-room', privateRoomUsers);
        }

        socket.on('update-chat', function (username, data) {
            if (data.newPrivateRoom) 
                $localStorage.newPrivateRoom = data.newPrivateRoom;
            if (data.isChatEnabled == true)
                $scope.isPrivateChatEnabled = true;
            if (data.senderPublicKey)
                $localStorage.senderPublicKey = data.senderPublicKey;
            else
                $localStorage.senderPublicKey = "";

            if (data.receiverPublicKey && sender!=undefined) {
                $localStorage.receiverPublicKey = data.receiverPublicKey;
                sender.receiveHandshake($localStorage.receiverPublicKey);
                sender.encryptionKey = sender.aesFindKey(sender.foreignPublicKey);
            }
            else {
                $localStorage.receiverPublicKey = "";
            }
        });

        $scope.showActionToast = function (data) {
            var toast = $mdToast.simple()
              .textContent('Accept private chat request from: '+data.from)
              .action('ACCEPT')
              .highlightAction(true)
              .highlightClass('md-accent')
              .position('bottom right')
              .hideDelay(0);

            $mdToast.show(toast).then(function (response) {
                if (response == 'ok') {
                    $scope.acceptRoomRequest();
                    $mdToast.hide(toast);
                }
            });

        };

        //Send notification
        $scope.isPrivateRoomRequestArrived = false
        socket.on('join-private-room-request', function (data) {
            $scope.showActionToast(data);
            //Ask to join private rooom
            $scope.isPrivateRoomRequestArrived = true;
        });

        $scope.acceptRoomRequest = function () {
            //Create receiver keys
            receiver = new Endcrypt();
            receiver.receiveHandshake($localStorage.senderPublicKey);
            receiver.encryptionKey=receiver.aesFindKey(receiver.foreignPublicKey);
            $scope.isPrivateChatEnabled = true;
            var chatObj = {
                isChatEnabled: $scope.isPrivateChatEnabled,
                newPrivateRoom: $localStorage.newPrivateRoom,
                receiverPublicKey: receiver.publicKeyString
            }
            socket.emit('accept-private-room-request', chatObj);
        }

        $scope.sendPrivateMessage = function (keyEvent) {
            var encrypted = "";
            if (keyEvent.which === 13) {
                    if (sender) {
                        encrypted = sender.encrypt($scope.message);
                    }
                    if (receiver) {
                        encrypted = receiver.encrypt($scope.message);
                    }
                    var newMessage = {
                        message: encrypted,
                        from: $scope.mynickname,
                        time: $scope.getTime(),
                    }
                    socket.emit('send-private-message', newMessage);
                    $scope.message = '';                
            }
        }              
    }

})();