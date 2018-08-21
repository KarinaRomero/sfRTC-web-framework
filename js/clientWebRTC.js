var stream, otherStream, peerConnection, dataChannel, wsConnection, otherUserName, haveOffer, message, self;

class ClientWebRTC {

    constructor(audioConstrains, videoConstrains, dataChannelConstrains, url) {
        this.audioConstrains = audioConstrains;
        this.videoConstrains = videoConstrains;
        this.dataConstrains = dataChannelConstrains;
        self = this;
        this.initClient();

        if (url != null && url != undefined) {
            this.url = url;
            otherUserName = null;
            otherStream = null;
            haveOffer = false;
            peerConnection = null;
            this.signalConnect(this.dataConstrains);
        }
    }

    answer() {
        if (haveOffer) {
            peerConnection.createAnswer(function (answer) {
                peerConnection.setLocalDescription(answer);
                send({type: "answer", answer: answer}, otherUserName);
            }, function (error) {
                throw new ClientWebRTCException(error);
            }, {'mandatory': {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true}});
            haveOffer = false;
        }
    }

    login(name) {
        console.log('login ' + name);
        this.userName = name;
        send({
            type: "login"
        }, name);
    }

    call(calToName) {
        otherUserName = calToName;
        peerConnection.createOffer(function (offer) {
            send({type: "offer", offer: offer}, otherUserName);
            peerConnection.setLocalDescription(offer);
        }, function (error) {
            throw new ClientWebRTCException(error);
        });
    }

    hangUp() {
        send({type: "leave"}, otherUserName);
        console.log('leaving');

        otherUserName = null;
        peerConnection.close();
        peerConnection.onicecandidate = null;
        peerConnection.onaddstream = null;
    }

    sendMessage(message) {
        dataChannel.send(message);
        console.log(this.userName + " enviaste: " + message);
    }


    initClient() {
        if (this.hasUserMedia()) {
            navigator.getUserMedia({video: this.videoConstrains, audio: this.audioConstrains}, function (myStream) {
                stream = myStream;
                self.onLocalStream(myStream);
            }, function (error) {
                throw new ClientWebRTCException(error);
            });
        }
    }

    signalConnect() {
        wsConnection = new WebSocketSignalingClient(this.url);
        wsConnection.onLogin = function (success) {
            console.log('onLogin', success);
            if (!success) {
                throw new ClientWebRTCException("Login unsuccessful, please try a different name.");
            }
            else {
                self.onLogin(success);
                setupPeerConnection(self.dataConstrains);
            }
        };
        wsConnection.onOffer = function (offer, name) {
            otherUserName = name;
            peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            haveOffer = true;
            self.onCall(haveOffer);

        };
        wsConnection.onAnswer = function (answer) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        };
        wsConnection.onCandidate = function (candidate) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        };
        wsConnection.onLeave = function () {
            self.onLeave(true);
            otherUserName = null;
            peerConnection.close();
            peerConnection.onicecandidate = null;
            peerConnection.onaddstream = null;
        };
        wsConnection.disconnect = function (message) {
            console.log('disconnecting', message);
        };
        wsConnection.connect();
    }

    hasUserMedia() {
        return !!(navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
            || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    hasRTCPeerConnection() {
        window.RTCPeerConnection = window.RTCPeerConnection ||
            window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
        window.RTCSessionDescription = window.RTCSessionDescription ||
            window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
        window.RTCIceCandidate = window.RTCIceCandidate ||
            window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
        return !!window.RTCPeerConnection;
    }

}


ClientWebRTC.prototype.onLogin = function (success) {
};
ClientWebRTC.prototype.onCall = function (success) {

};
ClientWebRTC.prototype.onDataChannelMessage = function (message) {

};
ClientWebRTC.prototype.onRemoteStream = function (remoteStream) {

};
ClientWebRTC.prototype.onLocalStream = function (localStream) {

};
ClientWebRTC.prototype.onLeave = function (success) {

};



function ClientWebRTCException(exception) {
    this.exception = exception;
    this.name = "ClientWebRTCException";
}

ClientWebRTCException.prototype.toString = function () {
    return this.name + ': "' + this.exception + '"';
};



function setupPeerConnection(dataConstrains) {

    var configuration = {
        "optional": [{"DtlsSrtpKeyAgreement": true}, {"RtpDataChannels": true}, {RtpDataChannels: true}],
        "iceServers": [{"url": "stun:stun.1.google.com:19302"}]
    };

    peerConnection = new RTCPeerConnection(configuration);
    peerConnection.addStream(stream);
    console.log("ADD stream: ", stream);
    peerConnection.onaddstream = function (e) {
        otherStream = e.stream;
        self.onRemoteStream(e.stream);
    };

    peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
            console.log("Enviando candidato a:: ", otherUserName);
            send({
                type: "candidate",
                candidate: event.candidate
            }, otherUserName);
        }
    };

    openDataChannel(dataConstrains);
}

function openDataChannel(dataConstrains) {

    dataChannel = peerConnection.createDataChannel("datachannel", dataConstrains);

    dataChannel.onopen = function () {
        console.log("DATACHANNEL OPENED");
    };
    dataChannel.onmessage = function (e) {
        console.log(otherUserName + " dice: " + e.data);
        self.onDataChannelMessage(e.data);
    };
    dataChannel.onclose = function () {
        console.log("DC closed!")
    };
    dataChannel.onerror = function (error) {
        throw new ClientWebRTCException(error);
    };
    peerConnection.ondatachannel = function (ev) {
        console.log('peerConnection.ondatachannel');
        ev.channel.onopen = function () {
            console.log('Data channel is open and ready to be used.');
        };
        ev.channel.onmessage = function (e) {
            console.log(otherUserName + " dice: " + e.data);
            self.onDataChannelMessage(e.data);
        };
        ev.channel.onerror = function (error) {
            throw new ClientWebRTCException(error);
        };
    };

    return peerConnection;
}
function send(message, name) {
    console.log(message + ' _ ' + name);
    wsConnection.send(message, name);
};

WebSocketSignalingClient = (function () {
    function WebSocketSignalingClient(url) {
        this.url = url;
        this.connection = null;
    }

    WebSocketSignalingClient.prototype.send = function (message, name) {

        if (name) {
            message.name = name;
        }

        if (message.candidate) {
            console.log("Sending final Candidate:: ", message);
        }
        if (message.answer) {
            console.log("Sending final Answer:: ", message);
        }
        if (message.offer) {
            console.log("Sending final Offer:: ", message);
        }

        this.connection.send(JSON.stringify(message));
    };

    WebSocketSignalingClient.prototype.connect = function () {
        this.connection = new WebSocket(this.url);

        this.connection.onopen = function () {
            console.log("Connected");
        };

        this.connection.onmessage = function (message) {

            var data = JSON.parse(message.data);

            switch (data.type) {
                case "login":
                    this.onLogin(data.success);
                    break;
                case "offer":
                    this.onOffer(data.offer, data.name);
                    break;
                case "answer":
                    this.onAnswer(data.answer);
                    break;
                case "candidate":
                    this.onCandidate(data.candidate);
                    break;
                case "leave":
                    this.onLeave();
                    break;
                default:
                    break;
            }
        }.bind(this);

        this.connection.onclose = function (event) {

            this.disconnect(event.error());
        }.bind(this);


        this.connection.onerror = function (error) {
            throw new ClientWebRTCException(error);
        };
    };

    WebSocketSignalingClient.prototype.disconnect = function (message) {

    };
    WebSocketSignalingClient.prototype.onLogin = function (success) {

    };
    WebSocketSignalingClient.prototype.onOffer = function (offer, name) {

    };
    WebSocketSignalingClient.prototype.onAnswer = function (answer) {
    };
    WebSocketSignalingClient.prototype.onCandidate = function (candidate) {
    };
    WebSocketSignalingClient.prototype.onLeave = function () {
    };
    return WebSocketSignalingClient;
})();