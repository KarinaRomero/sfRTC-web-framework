var stream,otherStream,peerConnection,dataChannel,wsConnection,otherUserName,haveOffer,message,self;class ClientWebRTC{constructor(n,e,o,t){this.audioConstrains=n,this.videoConstrains=e,this.dataConstrains=o,self=this,this.initClient(),null!=t&&null!=t&&(this.url=t,otherUserName=null,otherStream=null,haveOffer=!1,peerConnection=null,this.signalConnect(this.dataConstrains))}answer(){haveOffer&&(peerConnection.createAnswer(function(n){peerConnection.setLocalDescription(n),send({type:"answer",answer:n},otherUserName)},function(n){throw new ClientWebRTCException(n)},{mandatory:{OfferToReceiveAudio:!0,OfferToReceiveVideo:!0}}),haveOffer=!1)}login(n){console.log("login "+n),this.userName=n,send({type:"login"},n)}call(n){otherUserName=n,peerConnection.createOffer(function(n){send({type:"offer",offer:n},otherUserName),peerConnection.setLocalDescription(n)},function(n){throw new ClientWebRTCException(n)})}hangUp(){send({type:"leave"},otherUserName),console.log("leaving"),otherUserName=null,peerConnection.close(),peerConnection.onicecandidate=null,peerConnection.onaddstream=null}sendMessage(n){dataChannel.send(n),console.log(this.userName+" enviaste: "+n)}initClient(){this.hasUserMedia()&&navigator.getUserMedia({video:this.videoConstrains,audio:this.audioConstrains},function(n){stream=n,self.onLocalStream(n)},function(n){throw new ClientWebRTCException(n)})}signalConnect(){(wsConnection=new WebSocketSignalingClient(this.url)).onLogin=function(n){if(console.log("onLogin",n),!n)throw new ClientWebRTCException("Login unsuccessful, please try a different name.");self.onLogin(n),setupPeerConnection(self.dataConstrains)},wsConnection.onOffer=function(n,e){otherUserName=e,peerConnection.setRemoteDescription(new RTCSessionDescription(n)),haveOffer=!0,self.onCall(haveOffer)},wsConnection.onAnswer=function(n){peerConnection.setRemoteDescription(new RTCSessionDescription(n))},wsConnection.onCandidate=function(n){peerConnection.addIceCandidate(new RTCIceCandidate(n))},wsConnection.onLeave=function(){self.onLeave(!0),otherUserName=null,peerConnection.close(),peerConnection.onicecandidate=null,peerConnection.onaddstream=null},wsConnection.disconnect=function(n){console.log("disconnecting",n)},wsConnection.connect()}hasUserMedia(){return!!(navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia)}hasRTCPeerConnection(){return window.RTCPeerConnection=window.RTCPeerConnection||window.webkitRTCPeerConnection||window.mozRTCPeerConnection,window.RTCSessionDescription=window.RTCSessionDescription||window.webkitRTCSessionDescription||window.mozRTCSessionDescription,window.RTCIceCandidate=window.RTCIceCandidate||window.webkitRTCIceCandidate||window.mozRTCIceCandidate,!!window.RTCPeerConnection}}function ClientWebRTCException(n){this.exception=n,this.name="ClientWebRTCException"}function setupPeerConnection(n){(peerConnection=new RTCPeerConnection({optional:[{DtlsSrtpKeyAgreement:!0},{RtpDataChannels:!0},{RtpDataChannels:!0}],iceServers:[{url:"stun:stun.1.google.com:19302"}]})).addStream(stream),console.log("ADD stream: ",stream),peerConnection.onaddstream=function(n){otherStream=n.stream,self.onRemoteStream(n.stream)},peerConnection.onicecandidate=function(n){n.candidate&&(console.log("Enviando candidato a:: ",otherUserName),send({type:"candidate",candidate:n.candidate},otherUserName))},openDataChannel(n)}function openDataChannel(n){return(dataChannel=peerConnection.createDataChannel("datachannel",n)).onopen=function(){console.log("DATACHANNEL OPENED")},dataChannel.onmessage=function(n){console.log(otherUserName+" dice: "+n.data),self.onDataChannelMessage(n.data)},dataChannel.onclose=function(){console.log("DC closed!")},dataChannel.onerror=function(n){throw new ClientWebRTCException(n)},peerConnection.ondatachannel=function(n){console.log("peerConnection.ondatachannel"),n.channel.onopen=function(){console.log("Data channel is open and ready to be used.")},n.channel.onmessage=function(n){console.log(otherUserName+" dice: "+n.data),self.onDataChannelMessage(n.data)},n.channel.onerror=function(n){throw new ClientWebRTCException(n)}},peerConnection}function send(n,e){console.log(n+" _ "+e),wsConnection.send(n,e)}ClientWebRTC.prototype.onLogin=function(n){},ClientWebRTC.prototype.onCall=function(n){},ClientWebRTC.prototype.onDataChannelMessage=function(n){},ClientWebRTC.prototype.onRemoteStream=function(n){},ClientWebRTC.prototype.onLocalStream=function(n){},ClientWebRTC.prototype.onLeave=function(n){},ClientWebRTCException.prototype.toString=function(){return this.name+': "'+this.exception+'"'},WebSocketSignalingClient=function(){function n(n){this.url=n,this.connection=null}return n.prototype.send=function(n,e){e&&(n.name=e),n.candidate&&console.log("Sending final Candidate:: ",n),n.answer&&console.log("Sending final Answer:: ",n),n.offer&&console.log("Sending final Offer:: ",n),this.connection.send(JSON.stringify(n))},n.prototype.connect=function(){this.connection=new WebSocket(this.url),this.connection.onopen=function(){console.log("Connected")},this.connection.onmessage=function(n){var e=JSON.parse(n.data);switch(e.type){case"login":this.onLogin(e.success);break;case"offer":this.onOffer(e.offer,e.name);break;case"answer":this.onAnswer(e.answer);break;case"candidate":this.onCandidate(e.candidate);break;case"leave":this.onLeave()}}.bind(this),this.connection.onclose=function(n){this.disconnect(n.error())}.bind(this),this.connection.onerror=function(n){throw new ClientWebRTCException(n)}},n.prototype.disconnect=function(n){},n.prototype.onLogin=function(n){},n.prototype.onOffer=function(n,e){},n.prototype.onAnswer=function(n){},n.prototype.onCandidate=function(n){},n.prototype.onLeave=function(){},n}();