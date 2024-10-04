import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import Draggable from 'react-draggable';
import { useDispatch, useSelector } from 'react-redux'
import { CallEnd as CallEndIcon } from '@mui/icons-material'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { endCallColor } from '../components/constants/color'
import { setCalling, setIsVideo, setShowVideo } from '../redux/reducers/misc'
import { getSocket } from '../socket'
import peer from '../service/peer'

const Room = ({ callMembers }) => {
    const dispatch = useDispatch();
    const socket = getSocket();
    
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const { calling, showMovie, showVideo } = useSelector((state) => state.misc);

    const sendStreams = useCallback(() => {
        if (myStream) {
            const senders = peer.peer.getSenders();
            myStream.getTracks().forEach(track => {
                if (!senders.find(sender => sender.track === track)) {
                    peer.peer.addTrack(track, myStream);
                }
            });
        }
    }, [myStream]);

    const showMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
    };

    useEffect(() => {
        if (showVideo) {
            showMedia();
        }
    }, [showVideo]);

    const endCallHandler = (e) => {
        e.preventDefault();
        if (myStream) {
            myStream.getTracks().forEach(track => {
                track.stop();
            });
        }
        if (peer.peer) {
            peer.peer.close();
            peer.initializePeer();
        }

        if(remoteStream) socket.emit('call-ended', { callMembers });
        else socket.emit('call-ended-not-recieved', { callMembers });

        setRemoteStream(null);
        setMyStream(null);
        dispatch(setShowVideo(false));
        dispatch(setIsVideo(false));
    };

    const processCallHandler = useCallback(({ callMembers, room, ans }) => {
        peer.setLocalDescription(ans);
        sendStreams();
        dispatch(setCalling(false));
    }, [sendStreams]);

    const handleNegotiationNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer-negotiation-needed', { callMembers, offer });
    }, [socket]);

    const handleIncomingNegotiation = useCallback(async ({ callMembers, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer-negotiation-done', { callMembers, ans });
    }, [socket]);

    const handleNegotiationFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    const handleEnd = useCallback(() => {
        if (myStream) {
            myStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        if (peer.peer) {
            peer.peer.close();
            peer.initializePeer();
        }

        setRemoteStream(null);
        setMyStream(null);
        dispatch(setCalling(true));
        dispatch(setShowVideo(false));
        dispatch(setIsVideo(false));
    }, [dispatch, myStream])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
        };
    }, [handleNegotiationNeeded]);

    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const streams = ev.streams;
            setRemoteStream(streams[0]);
        });
    }, []);

    useEffect(() => {
        socket?.on('call-accepted', processCallHandler);
        socket.on('peer-negotiation-needed', handleIncomingNegotiation);
        socket.on('peer-negotiation-final', handleNegotiationFinal);
        socket.on('end-call', handleEnd);
        return () => {
            socket?.off('call-accepted', processCallHandler);
            socket.off('peer-negotiation-needed', handleIncomingNegotiation);
            socket.off('peer-negotiation-final', handleNegotiationFinal);
            socket.off('end-call', handleEnd);
        };
    }, [socket, processCallHandler, handleIncomingNegotiation, handleNegotiationFinal, handleEnd]);

    useEffect(() => {
        if (myStream) {
            sendStreams();
        }
    }, [myStream, sendStreams]);

    return (
        <>  
            {!showMovie && (
                <>
                    {calling ? (
                        <Stack sx = {{ height: "100%", width: "100%", justifyContent: "center", alignItems: "center" }}>
                            <Typography variant = "h4" sx = {{ marginBottom: "2rem", color: "white" }}>Ringing...</Typography>
                            <ReactPlayer height = "50%" width = "70%" url = {myStream} playing style = {{ borderRadius: 20 }}/>
                        </Stack>
                    ) : (
                        <Stack sx={{ position: 'relative', height: '100%', width: '100%' }}>
                            <div style={{ position: 'absolute', top: '10%', left: '10%', height: "40%", width: "30%", zIndex: 2, }}>
                                <ReactPlayer height="100%" width="100%" url={myStream} playing style = {{ borderRadius: 20 }}/>
                            </div>
                            <ReactPlayer height="100%" width="100%" url={remoteStream} playing />
                        </Stack>
                    )}
                </>
            )}
            {showMovie && 
                <Draggable>
                    <Box
                        sx={{
                            position: 'fixed',
                            bottom: '1rem',
                            right: '1rem',
                            zIndex: 1000, 
                        }}
                    >
                        <ReactPlayer height="50%" width="70%" url={remoteStream} playing />
                    </Box>
                </Draggable>
            }
            
            <IconButton onClick = {endCallHandler} sx = {{
                height: showMovie ? "6rem" : "4rem",
                width: showMovie ? "6rem" : "4rem",
                borderRadius: 40,
                backgroundColor: endCallColor,
                zIndex: 2,
                position: "fixed",
                left: !showMovie ? "50%" : "10%",
                transform: "translateX(-50%)",
                bottom: "1rem",
                "&:hover": {
                    backgroundColor: endCallColor,
                }
            }}
            >
                <CallEndIcon sx = {{ color: "white" }}/>
            </IconButton>
        </>
    )
}

export default Room
