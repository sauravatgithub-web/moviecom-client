class PeerService {
    constructor() {
        this.initializePeer();
    }

    initializePeer() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302"
                    ],
                }
            ]
        });

        // Handle ICE candidates
        this.peer.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sending ICE candidate:", event.candidate);
                // Send the ICE candidate to the remote peer via your signaling server
                // Example: socket.emit('ice-candidate', event.candidate);
            }
        };
        
        this.peer.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", this.peer.iceConnectionState);
            if (this.peer.iceConnectionState === 'disconnected' || 
                this.peer.iceConnectionState === 'failed' || 
                this.peer.iceConnectionState === 'closed') {
                console.warn('ICE connection lost. Closing peer connection.');
                this.closePeerConnection();
            }
        };

        this.peer.onconnectionstatechange = () => {
            if (this.peer.connectionState === 'disconnected' || 
                this.peer.connectionState === 'failed' || 
                this.peer.connectionState === 'closed') {
                console.warn('Peer connection closed or failed. Reinitializing.');
                this.closePeerConnection();
            }
        };
    }

    closePeerConnection() {
        if (this.peer) {
            this.peer.close();
            this.initializePeer();  
        }
    }

    async getAnswer(offer) {
        if (this.peer.signalingState === 'closed') {
            this.initializePeer();
        }
        if (this.peer.signalingState === 'stable') {
            console.warn('Cannot set remote description when the peer is in stable state');
            return;
        }

        await this.peer.setRemoteDescription(offer);
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(ans));
        return ans;
    }

    async getOffer() {
        if (this.peer.signalingState === 'closed') {
            this.initializePeer();
        }
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
    }

    async setLocalDescription(ans) {
        if (this.peer.signalingState === 'closed') {
            this.initializePeer();
        }

        if (this.peer.signalingState !== 'stable') {
            if (ans && ans.sdp) {
                try {
                    await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
                    console.log('Remote description set successfully');
                } catch (error) {
                    console.error('Failed to set remote description:', error);
                }
            } else {
                console.error('Invalid answer:', ans);
            }
        } else {
            console.warn('Peer is in stable state, cannot set remote description');
        }
    }

    async addIceCandidate(candidate) {
        if (this.peer.signalingState !== 'closed' && candidate) {
            try {
                await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
                console.log('ICE candidate added successfully');
            } catch (error) {
                console.error('Error adding received ICE candidate', error);
            }
        }
    }
}

const peerServiceInstance = new PeerService();
export default peerServiceInstance;
