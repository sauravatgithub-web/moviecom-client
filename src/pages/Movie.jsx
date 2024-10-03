import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Cancel as CancelIcon, Pause as PauseIcon, PlayArrow as PlayIcon } from '@mui/icons-material'
import { Stack, IconButton } from '@mui/material'
import { buttonBackgroundColor } from '../components/constants/color'
import { buttonStyle, iconStyle } from '../lib/features'
import { getSocket } from '../socket'
import { setShowMovie } from '../redux/reducers/misc'
import { useDispatch } from 'react-redux'

const Movie = ({movieMembers, movie}) => {
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

    useEffect(() => {
        socket.on('play', handlePlay);
        socket.on('pause', handlePause);
        socket.on('cancel', handleCancel);
        return () => {
            socket.off('play', handlePlay);
            socket.off('pause', handlePause);
            socket.off('cancel', handleCancel);
        }
    }, [handlePlay, handlePause, handleCancel])

    return (
        <>
            <div style = {{ height: "100%", width: "100%" }}>
                <video ref={videoPlayer} width="100%" height="auto" controls autoPlay>
                    <source src = {movie?.url} type = "video/mp4"/>
                </video>
            </div>
            <Stack direction={"row"} spacing = {"1rem"} sx = {{
                borderRadius: 20,
                zIndex: 2,
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
            </Stack>
        </>
    )
}

export default Movie
