# sfRTC
This is a framework to simplify implementation webRTC protocol to web applications.

[![Build Status](https://travis-ci.com/KarinaRomero/sfRTC-web-framework.svg?branch=master)](https://travis-ci.com/KarinaRomero/sfRTC-web-framework)
: [![npm version](https://badge.fury.io/js/sfrtc-web-framework.svg)](https://badge.fury.io/js/sfrtc-web-framework)

# Install

- You can install by npm
```
npm i sfrtc-web-framework
```
or
- Get the minify file from [https://github.com/KarinaRomero/sfRTC-web-framework/releases/download/1.0.0/sfRTC.zip](https://github.com/KarinaRomero/sfRTC-web-framework/releases/download/1.0.0/sfRTC.zip)

# Setup

Include the following line after your HTML file body:

```html
<script src="node_modules/sfrtc-web-framework/sfRTC.min.js"></script>
```
# Usage

To implement the framework you must do the following:

- Before make sure the signaling channel is running, to more information go to [https://github.com/KarinaRomero/signaling](https://github.com/KarinaRomero/signaling).

- To make a video call, receive and send data, add the following structure in your HTML file:

```html
<!--To login-->
<input type="text" id="username"  placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
<button id="login">login</button>

<!--To show the local and remote video-->
<video id="my" autoplay></video>
<video id="yours" autoplay></video>

<!--To draw the video-->
<canvas></canvas>

<!--To make a video call you must enter an id or name-->
<input type="text" id="otherUsername"  placeholder="Call to name" aria-label="Username to call" aria-describedby="basic-addon1">
<button id="call">call</button>

<!--Button to answer a call-->
<button  id="answer">Answer</button>

<!--Button to hang up a call-->
<button  id="hangUp">Hang up</button>

<!--To show the last message received by the data channel-->
<h5 id= "otherName"></h5>

<!--To send a message by the data channel-->
 <input type="text" id="message"  placeholder="Message" aria-label="Recipient's username" aria-describedby="button-addon2">
<button  id="send">Send</button>
```

- In your JS file add the following code:

```JavaScript
// Create a variable of type ClientWebRTC
// audioConstrains, a Boolean value to allow audio to be sent
// videoConstrains, a Boolean value to allow audio to be sent video
// dataChannelConstrains, a Boolean value to activate the data channel
 // url, a string type value that contains the url of the signaling channel
var clientRTC = new ClientWebRTC(true, true, true, “your.signaling.url”);


//Create the following variables to link the elements of the HTML file
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
    canvas.width = 480; // To set the width of the video
    canvas.height = 360; // To set the height of the video
```

- Then add the listeners to the buttons.

*NOTE: In order to make calls it is always necessary to login first

```JavaScript
// Login button
loginButton.addEventListener('click', function (event) {

//  This method allows you to login in the signaling channel, receive the name or id of string type
    clientRTC.login(usernameInput.value);

});

// Call button
callButton.addEventListener('click', function (event) {

// This method allows you to call to other user, receive the name or id of string type
    clientRTC.call(otherusernameInput.value);
});

// Answer button
answerButton.addEventListener('click', function (event) {
    otherusernameInput.value = otName;

// This method allows you to answer
    clientRTC.answer();
});

// Hang up button
hangUpButton.addEventListener('click', function (event) {

// This method allows you to hang up a call
    clientRTC.hangUp();
});

// Button to send message
sendMessageButton.addEventListener('click',function (event) {
    var message = messageInput.value;

// This method allow you to send message, receive a string type value
    clientRTC.sendMessage(message);
});
```

- Finally we added the following Callbacks

```JavaScript
// This method return the local vídeo
clientRTC.onLocalStream = function(localStream){
    myVideo.srcObject = localStream;
};

// This method returns true if it was able to connect to the signaling channel or false otherwise
clientRTC.onLogin = function (success) {
    alert("onLogin: " + success);
};

// When a call is received, this method returns returns the id or name of the calling user.
clientRTC.onCall = function (name) {
    otName = name;
    alert("onCall: " + name);
};

// This method returns the received messages by the data channel.
clientRTC.onDataChannelMessage = function (message) {
    otherName.textContent = otName;
    otherMessage.textContent = message;
    alert("onMessage: " + message);
};

// This method returns the video and audio remote
clientRTC.onRemoteStream = function (remoteStream) {
    yourVideo.srcObject = remoteStream;
};

// This method returns a notification when the other user hang up.
clientRTC.onLeave = function (success) {
    alert("onLeave: " + success);
};
```
# License

This framework is licenced under [MIT Licence](https://opensource.org/licenses/MIT).