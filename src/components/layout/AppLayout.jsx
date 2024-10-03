import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive';
import Header from './Header';
import Title from '../shared/Title';
import { Button, Drawer, Grid, Skeleton, Stack, Typography } from '@mui/material';
import ChatList from '../specefic/ChatList'
import Profile from '../specefic/Profile'
import { useNavigate, useParams } from 'react-router-dom';
import { useMyChatsQuery } from '../../redux/api/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCalling, setDisplayDialog, setIsDeleteMenu, setIsMobile, setIsProfile, setIsVideo, setSelectedDeleteChat, setShowMovie, setShowVideo } from '../../redux/reducers/misc';
import { useErrors, useSocketEvents } from '../../hooks/hooks';
import { getSocket } from '../../socket';
import { ALERT, NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } from '../constants/events';
import { incrementNotification, setNewMessagesAlert } from '../../redux/reducers/chat';
import { getOrSaveFromStorage } from '../../lib/features';
import DeleteChatMenu from '../dialogues/DeleteChatMenu';
import Room from '../../pages/Room';
import Movie from '../../pages/Movie';
import peer from '../../service/peer'
import { callBackgroundColor } from '../constants/color';
import toast from 'react-hot-toast';

const AppLayout = () => (WrappedComponent) => {
    return (props) => {
        const params = useParams();
        const dispatch = useDispatch();
        const navigate = useNavigate();
        const socket = getSocket();
        const isNotMobile = useMediaQuery({ minWidth : 601 });

        const chatId = params.chatId;
        const profileAnchor = useRef(null);
        const deleteMenuAnchor = useRef(null); 

        const [onlineUsers, setOnlineUsers] = useState([]);
        const [messageToDisplay, setMessageToDisplay] = useState("");
        const [callMembers, setCallMembers] = useState([]);
        const [movieMembers, setMovieMembers] = useState([]);
        const [room, setRoom] = useState(null);
        const [offer, setOffer] = useState(null);
        const [movie, setMovie] = useState(null);
        const [dialogForCall, setDialogForCall] = useState(false);
        const [dialogForMovie, setDialogForMovie] = useState(false);

        const { isMobile, isVideo, displayDialog, showMovie } = useSelector((state) => state.misc);
        const { user } = useSelector((state) => state.auth);
        const { newMessagesAlert } = useSelector((state) => state.chat);
        const {isLoading, data, isError, error, refetch} = useMyChatsQuery("");

        useErrors([{ isError, error }]);

        useEffect(() => {
            getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert })
        }, [newMessagesAlert])

        const handleDeleteChat = (e, id, groupChat) => {
            e.preventDefault();
            deleteMenuAnchor.current = e.currentTarget;
            dispatch(setIsDeleteMenu(true));
            dispatch(setSelectedDeleteChat({ id, groupChat }));
        }

        const handleMobileClose = () => dispatch(setIsMobile(false));

        const newMessagesAlertHandler = useCallback((data) => {
            if(data.chatId === chatId) return;
            dispatch(setNewMessagesAlert(data));
        }, [chatId]);

        const newRequestHandler = useCallback(() => {
            dispatch(incrementNotification());
        }, [dispatch]);

        const refetchListener = useCallback(() => {
            refetch();
            navigate('/');
        },[refetch, navigate])

        const onlineUsersListener = useCallback((data) => {
            setOnlineUsers(data);
        }, [dispatch]);

        const sendAlert = useCallback((data) => {
            toast.success(data); 
        })

        const eventHandlers = { 
            [ALERT]: sendAlert,
            [REFETCH_CHATS]: refetchListener,
            [NEW_MESSAGE_ALERT]: newMessagesAlertHandler,
            [NEW_REQUEST]: newRequestHandler,
            [ONLINE_USERS]: onlineUsersListener,
        };
        useSocketEvents(socket, eventHandlers);

        const openProfile = (e) => {
            e.preventDefault();
            profileAnchor.current = e.currentTarget;
            dispatch(setIsProfile(true));
        };

        const acceptCallHandler = useCallback(async(e) => {
            e.preventDefault();
            setMessageToDisplay("");
            dispatch(setCalling(false));
            dispatch(setDisplayDialog(false));
            dispatch(setIsVideo(true));
            dispatch(setShowVideo(true));
            setDialogForCall(false);
            const ans = await peer.getAnswer(offer);
            socket.emit('accept-call', {callMembers, room, ans});
        }, [dispatch, offer, callMembers, room, socket])

        const declineCallHandler = useCallback((e) => {
            e.preventDefault();
            setMessageToDisplay("");
            dispatch(setDisplayDialog(false));
            setDialogForCall(false);
            socket.emit('reject-call', {callMembers});
        }, [dispatch, socket]);

        const acceptMovieRequestHandler = (e) => {
            e.preventDefault();
            socket.emit('movie-request-accepted', {movieMembers, movie});
            setDialogForMovie(false);
        }

        const declineMovieRequestHandler = (e) => {
            e.preventDefault();
            socket.emit('movie-request-declined', {movieMembers});
            setDialogForMovie(false);
        }

        const handleCallRequest = useCallback(({ members, displayMessage, room, offer }) => {
            setMessageToDisplay(displayMessage);
            setRoom(room);
            setCallMembers(members);
            setOffer(offer);
            setDialogForCall(true);
            dispatch(setDisplayDialog(true));
        });

        const alreadyEndedCallHandler = useCallback(() => {
            dispatch(setDisplayDialog(false));
        })

        const handleMovieRequest = useCallback(({ displayMessage, members, movie }) => {
            setMessageToDisplay(displayMessage);
            setMovieMembers(members);
            setMovie(movie);
            setDialogForMovie(true);
            dispatch(setDisplayDialog(true));
        }) 

        const handleAcceptRequest = useCallback(({movieMembers, movie}) => {
            setMovie(movie);
            setMovieMembers(movieMembers);
            dispatch(setShowMovie(true));
        })

        const handleDeclineRequest = useCallback(() => {
            toast.error("Oops, your request has been declined");
        })

        useEffect(() => {
            socket.on('call-request', handleCallRequest);
            socket.on('call-ended-before-recieving', alreadyEndedCallHandler);
            socket.on('request-to-watch-movie', handleMovieRequest);
            socket.on('movieRequest-declined', handleDeclineRequest);
            socket.on('movieRequest-accepted', handleAcceptRequest);
            return () => {
                socket.off('call-request', handleCallRequest);
                socket.off('call-ended-before-recieving', alreadyEndedCallHandler);
                socket.off('request-to-watch-movie', handleMovieRequest);
                socket.off('movieRequest-declined', handleDeclineRequest);
                socket.off('movieRequest-accepted', handleAcceptRequest);
            }
        }, [socket, handleCallRequest, alreadyEndedCallHandler, handleMovieRequest, handleDeclineRequest, handleAcceptRequest]);

        return (
            <>  
                <Title/>
                <Header/>

                <DeleteChatMenu dispatch = {dispatch} deleteMenuAnchor={deleteMenuAnchor}/>

                {isNotMobile && <ProfileDialog src = {user.avatar.url} openProfile = {openProfile}/>}
                
                <div>
                    <Profile user = {user} dispatch = {dispatch} profileAnchor = {profileAnchor}/>
                </div>

                {(isVideo || showMovie) && 
                    <div style = {{
                        position: "fixed",
                        width: '100%', 
                        height: '100%', 
                        zIndex: 2,
                        backgroundColor: callBackgroundColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid black'
                    }}>
                        {isVideo && <Room callMembers = {callMembers} />}
                        {showMovie && <Movie movielMembers = {movieMembers} movie = {movie} />}
                    </div>
                }

                {displayDialog && <Stack sx = {{
                    display: "flex",
                    position: "fixed",
                    zIndex: 2,
                    height: "100vh",
                    justifyContent: "center",
                    alignItems: "center",
                    left: "50vw",
                    transform: "translateX(-50%)"
                }}>
                    {dialogForCall && 
                        <DialogBox messageToDisplay={messageToDisplay} acceptClick={acceptCallHandler} declineClick={declineCallHandler} />
                    }
                    {dialogForMovie && 
                        <DialogBox messageToDisplay={messageToDisplay} acceptClick={acceptMovieRequestHandler} declineClick={declineMovieRequestHandler} />
                    }
                </Stack>}

                {isLoading ? (
                    <Skeleton />
                ) : (
                    <Drawer open = {isMobile} onClose={handleMobileClose}>
                        <ChatList 
                            w="70vw"
                            chats = {data?.chats} 
                            chatId = {chatId}
                            handleDeleteChat={handleDeleteChat}
                            newMessagesAlert={newMessagesAlert}
                            onlineUsers={onlineUsers}
                        />
                        {!isNotMobile && <ProfileDialog src = {user.avatar.url} openProfile = {openProfile} />}
                    </Drawer>
                )}

                <Grid container height="calc(100vh - 4rem)">
                    <Grid item sm={4} md={3} sx={{ display: { xs: "none", sm: "block" } }} height="100%">
                        {isLoading ? (
                            <Skeleton />
                        ) : (
                            <ChatList 
                                chats={data?.chats} 
                                chatId={chatId}
                                handleDeleteChat={handleDeleteChat}
                                newMessagesAlert={newMessagesAlert}
                                onlineUsers={onlineUsers}
                            />
                        )}
                    </Grid>
                    <Grid item xs={12} sm={8} md={9} lg={9} height="100%">
                        <WrappedComponent {...props} chatId = {chatId} user = {user}/>
                    </Grid>
                </Grid>
            </>
        );
    };
};

const DialogBox = ({ messageToDisplay, acceptClick, declineClick }) => {
    return (
        <Stack sx = {{ border: "2px solid blue", padding: '1rem', alignItems: "center"}}>
            <Typography variant = "h5" sx = {{ marginBottom: "1rem" }}>{messageToDisplay}</Typography>
            <Stack direction = "row" spacing = "1rem" alignItems = {"center"}>
                <Button variant = "contained" onClick = {acceptClick}>Accept</Button>
                <Button variant = "outlined" onClick = {declineClick}>Decline</Button>
            </Stack>
        </Stack>
    )
}

const ProfileDialog = ({ src, openProfile }) => {
    return (
        <img src = {src} 
            alt = "image" 
            height = "40rem" 
            width = "40rem" 
            style = {{ marginRight: 15, borderRadius: 20, zIndex: 2,
                position: "fixed", left: 0, bottom: 0, margin: 10, cursor: "pointer",
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
            }}
            onClick = {openProfile}
        />
    )
}

export default AppLayout
