import React, { useCallback, useEffect, useRef, useState } from 'react'
import Header from './Header';
import Title from '../shared/Title';
import { Button, Drawer, Grid, Skeleton, Stack, Typography } from '@mui/material';
import ChatList from '../specefic/ChatList'
import Profile from '../specefic/Profile'
import { useNavigate, useParams } from 'react-router-dom';
import { useMyChatsQuery } from '../../redux/api/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCalling, setDisplayHandleCall, setIsDeleteMenu, setIsMobile, setIsProfile, setIsVideo, setSelectedDeleteChat, setShowVideo } from '../../redux/reducers/misc';
import { useErrors, useSocketEvents } from '../../hooks/hooks';
import { getSocket } from '../../socket';
import { ALERT, NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } from '../constants/events';
import { incrementNotification, setNewMessagesAlert } from '../../redux/reducers/chat';
import { getOrSaveFromStorage } from '../../lib/features';
import DeleteChatMenu from '../dialogues/DeleteChatMenu';
import Room from '../../pages/Room';
import peer from '../../service/peer'
import { callBackgroundColor } from '../constants/color';

const AppLayout = () => (WrappedComponent) => {
    return (props) => {
        const params = useParams();
        const dispatch = useDispatch();
        const navigate = useNavigate();
        const socket = getSocket();

        const chatId = params.chatId;
        const profileAnchor = useRef(null);
        const deleteMenuAnchor = useRef(null); 

        const [onlineUsers, setOnlineUsers] = useState([]);
        const [messageToDisplay, setMessageToDisplay] = useState("");
        const [room, setRoom] = useState(null);
        const [callMembers, setCallMembers] = useState([]);
        const [offer, setOffer] = useState(null);

        const { isMobile, isVideo, displayHandleCall, showMovie } = useSelector((state) => state.misc);
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

        const sendAlert = useCallback(() => console.log("You are added to a new group."))

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

        const acceptCallHandler = async(e) => {
            e.preventDefault();
            setMessageToDisplay("");
            dispatch(setCalling(false));
            dispatch(setDisplayHandleCall(false));
            dispatch(setIsVideo(true));
            dispatch(setShowVideo(true));
            const ans = await peer.getAnswer(offer);
            socket.emit('accept-call', {callMembers, room, ans});
        }

        const declineCallHandler = (e) => {
            e.preventDefault();
            setMessageToDisplay("");
            dispatch(setDisplayHandleCall(false));
            socket.emit('reject-call', {callMembers});
        };

        const handleCallRequest = useCallback(({ members, displayMessage, room, offer }) => {
            setMessageToDisplay(displayMessage);
            setRoom(room);
            setCallMembers(members);
            setOffer(offer);
            dispatch(setDisplayHandleCall(true));
        });

        const alreadyEndedCallHandler = useCallback(() => {
            dispatch(setDisplayHandleCall(false));
        })

        useEffect(() => {
            socket.on('call-request', handleCallRequest);
            socket.on('call-ended-before-recieving', alreadyEndedCallHandler);
            return () => {
                socket.off('call-request', handleCallRequest);
                socket.off('call-ended-before-recieving', alreadyEndedCallHandler);
            }
        }, [socket, handleCallRequest, alreadyEndedCallHandler]);

        return (
            <>  
                <Title/>
                <Header/>

                <DeleteChatMenu dispatch = {dispatch} deleteMenuAnchor={deleteMenuAnchor}/>

                <img src = {user.avatar.url} 
                    alt = "image" 
                    height = "40rem" 
                    width = "40rem" 
                    style = {{ marginRight: 15, borderRadius: 20, zIndex: 2,
                        position: "fixed", left: 0, bottom: 0, margin: 10, cursor: "pointer",
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    }}
                    onClick = {openProfile}
                />
                <Profile user = {user} dispatch = {dispatch} profileAnchor = {profileAnchor}/>

                {isVideo && 
                    <div style = {{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%', 
                        height: '70%', 
                        zIndex: 2,
                        backgroundColor: callBackgroundColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid black', 
                        borderRadius: 40
                    }}>
                        <Room callMembers = {callMembers} />
                    </div>
                }

                {displayHandleCall && <Stack sx = {{
                    display: "flex",
                    position: "fixed",
                    zIndex: 2,
                    height: "100vh",
                    justifyContent: "center",
                    alignItems: "center",
                    left: "50vw",
                    transform: "translateX(-50%)"
                }}>
                    <Stack sx = {{ border: "2px solid blue", padding: '1rem', alignItems: "center"}}>
                        <Typography variant = "h5" sx = {{ marginBottom: "1rem" }}>{messageToDisplay}</Typography>
                        <Stack direction = "row" spacing = "1rem" alignItems = {"center"}>
                            <Button variant = "contained" onClick = {acceptCallHandler}>Accept</Button>
                            <Button variant = "outlined" onClick = {declineCallHandler}>Decline</Button>
                        </Stack>
                    </Stack>
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
                    </Drawer>
                )}

                <Grid container height="calc(100vh - 4rem)">
                    <Grid item sm={4} md={3} sx={{ display: { xs: "none", sm: "block" } }} height="100%">
                        {!showMovie ? (
                            isLoading ? (
                                <Skeleton />
                            ) : (
                                <ChatList 
                                    chats={data?.chats} 
                                    chatId={chatId}
                                    handleDeleteChat={handleDeleteChat}
                                    newMessagesAlert={newMessagesAlert}
                                    onlineUsers={onlineUsers}
                                />
                            )
                        ) : (
                            <Grid item xs={12} sm={8} md={9} lg={9} height="100%">
                                <WrappedComponent {...props} chatId = {chatId} user = {user}/>
                            </Grid>
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

export default AppLayout
