var clientRTC = new ClientWebRTC(false, true, {order: true}, 'ws://localhost:8888');

var yourVideo = document.querySelector('#yours'),
    myVideo = document.querySelector('#my'),
    usernameInput = document.querySelector('#username'),
    otherusernameInput = document.querySelector('#otherUsername'),
    loginButton = document.querySelector('#login'),
    takeCaptureButton = document.querySelector('#takeCapture'),
    callButton = document.querySelector('#call'),
    answerButton = document.querySelector('#answer'),
    hangUpButton = document.querySelector('#hangUp'),
    messageInput = document.querySelector('#message'),
    otherName = document.querySelector('#otherName'),
    otherMessage= document.querySelector('#messageReceived'),
    sendMessageButton = document.querySelector('#send'),
    canvas = window.canvas = document.querySelector('canvas'),
    otName = " ";
    canvas.width = 480;
    canvas.height = 360;

loginButton.addEventListener('click', function (event) {
    clientRTC.login(usernameInput.value);

});

callButton.addEventListener('click', function (event) {
    clientRTC.call(otherusernameInput.value);
});

answerButton.addEventListener('click', function (event) {
    otherusernameInput.value = otName;
    clientRTC.answer();
});

hangUpButton.addEventListener('click', function (event) {
    clientRTC.hangUp();
});
takeCaptureButton.addEventListener('click', function () {
    canvas.getContext('2d').drawImage(myVideo, 0, 0, canvas.width, canvas.height);
});

sendMessageButton.addEventListener('click',function (event) {
    var message = messageInput.value;
    clientRTC.sendMessage(message);
});

clientRTC.onLocalStream = function(localStream){
    myVideo.srcObject = localStream;
};

clientRTC.onLogin = function (success) {
    alert("onLogin: " + success);
};

clientRTC.onCall = function (name) {
    otName = name;
    alert("onCall: " + name);
};

clientRTC.onDataChannelMessage = function (message) {
    otherName.textContent = otName;
    otherMessage.textContent = message;
    alert("onMessage: " + message);
};

clientRTC.onRemoteStream = function (remoteStream) {
    yourVideo.srcObject = remoteStream;
};

clientRTC.onLeave = function (success) {
    alert("onLeave: " + success);
};


