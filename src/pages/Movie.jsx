import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { Stack, IconButton } from '@mui/material'
import { Cancel as CancelIcon, Duo as CallIcon, Pause as PauseIcon, PlayArrow as PlayIcon } from '@mui/icons-material'

import { getSocket } from '../socket'
import peer from '../service/peer.js'
import { useSocketEvents } from '../hooks/hooks.jsx'
import { buttonStyle, iconStyle } from '../lib/features'
import { buttonBackgroundColor } from '../components/constants/color'
import { CANCEL, PAUSE, PLAY } from '../components/constants/events.js'
import { setCalling, setIsVideo, setShowMovie, setShowVideo } from '../redux/reducers/misc'

const Movie = ({ movieMembers, movie, user, chatId }) => {
    const socket = getSocket();
    const dispatch = useDispatch();

    const videoPlayer = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true); 

    const pauseHandler = () => {
        if(videoPlayer) {
            videoPlayer.current.pause();
            socket.emit('pause', {movieMembers, time: videoPlayer.current.currentTime});
            setIsPlaying(false);
        }
    };

    const playHandler = () => {
        if(videoPlayer) {
            videoPlayer.current.play();
            socket.emit('play', {movieMembers, time: videoPlayer.current.currentTime});
            setIsPlaying(true);
        }
    };

    const cancelHandler = () => {
        if(videoPlayer) {
            pauseHandler();
            socket.emit('cancel', {movieMembers});
            videoPlayer.current = null;
            setIsPlaying(false);
            dispatch(setShowMovie(false));
        }
    };

    const handlePlay = useCallback(({time}) => {
        if(videoPlayer) {
            videoPlayer.current.currentTime = time;
            videoPlayer.current.play();
            setIsPlaying(true);
        }
    })

    const handlePause = useCallback(({time}) => {
        if(videoPlayer) {
            videoPlayer.current.currentTime = time;
            videoPlayer.current.pause();
            setIsPlaying(false);
        }
    })

    const handleCancel = useCallback(() => {
        if(videoPlayer) {
            videoPlayer.current = null;
            setIsPlaying(false);
            dispatch(setShowMovie(false));
        }
    })

    const callHandler = async (e) => {
        e.stopPropagation();
        dispatch(setCalling(true));
        dispatch(setIsVideo(true));
        dispatch(setShowVideo(true));
        const offer = await peer.getOffer();
        socket.emit("make-call", { chatId, members : movieMembers, user, offer });
    }

    const eventHandlers = {
        [PLAY]: handlePlay,
        [PAUSE]: handlePause,
        [CANCEL]: handleCancel
    }
    useSocketEvents(socket, eventHandlers);


    return (
        <>
            <div style = {{ height: "100%", width: "100%" }}>
                <video ref={videoPlayer} width="100%" height="auto" controls autoPlay>
                    <source src = {movie?.url} type = "video/mp4"/>
                </video>
            </div>
            <Stack direction={"row"} spacing = {"1rem"} sx = {{
                borderRadius: 20,
                zIndex: 400,
                position: "fixed",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: "1rem",
                backGroundColor: {buttonBackgroundColor}
            }}>
                <IconButton onClick = {pauseHandler} sx = {buttonStyle} disabled = {!isPlaying}>
                    <PauseIcon sx = {iconStyle}/>
                </IconButton>
                <IconButton onClick = {playHandler} sx = {buttonStyle} disabled = {isPlaying}>
                    <PlayIcon sx = {iconStyle}/>
                </IconButton>
                <IconButton onClick = {cancelHandler} sx = {{...buttonStyle, backgroundColor: "#ff5252"}}>
                    <CancelIcon sx = {iconStyle}/>
                </IconButton>
                <IconButton onClick = {callHandler} sx = {buttonStyle}>
                    <CallIcon sx = {iconStyle}/>
                </IconButton>
            </Stack>
        </>
    )
}

export default Movie
