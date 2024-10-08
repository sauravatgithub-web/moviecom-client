import React, { Fragment, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useInfiniteScrollTop } from '6pp';

import { AppBar, Backdrop, Badge, Box, IconButton, Skeleton, Stack, Toolbar, Tooltip, Typography } from '@mui/material'
import { AttachFile as AttachFileButton, Duo as VideoCallIcon, Send as SendIcon, MovieCreation as MovieCreationIcon } from '@mui/icons-material';

import peer from '../service/peer.js'
import AppLayout from '../components/layout/AppLayout'
import FileMenu from '../components/dialogues/FileMenu';
import ChatProfile from '../components/specefic/ChatProfile.jsx';
import MessageComponent from '../components/shared/MessageComponent'

import { getSocket } from '../socket';
import { TypingLoader } from '../components/layout/Loaders.jsx';
import { useErrors, useSocketEvents } from '../hooks/hooks.jsx';
import { InputBox } from '../components/styles/StyledComponents';
import { removeNewMessagesAlert } from '../redux/reducers/chat.js';
import { useChatDetailsQuery, useGetMessagesQuery } from '../redux/api/api.js';
import { chatListColor, chatThemeColor, orange } from '../components/constants/color';
import { ALERT, CALL_REJECTED, CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE, START_TYPING, STOP_TYPING } from '../components/constants/events.js';
import { setCalling, setIsFileMenu, setIsMovie, setIsChatProfile, setIsVideo, setShowVideo } from '../redux/reducers/misc.js';

const MovieDialog = lazy(() => import('../components/dialogues/MovieDialog.jsx'));

const Chat = ({ chatId, user }) => {
    const bottomRef = useRef(null);
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const chatProfileAnchor = useRef(null);
    const socket = getSocket();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]); 
    const [page, setPage] = useState(1);
    const [fileMenuAnchor, setFileMenuAnchor] = useState(null)

    const [IamTyping, setIamTyping] = useState(false);
    const [userTyping, setUserTyping] = useState(false);
    const typingTimeOut = useRef(null);

    const { isMovie } = useSelector((state) => state.misc);

    const chatDetails = useChatDetailsQuery({chatId, skip: !chatId});
    const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

    const {data: oldMessages, setData: setOldMessages} = useInfiniteScrollTop (
        containerRef, oldMessagesChunk.data?.totalPages, page, setPage, 
        oldMessagesChunk.data?.messages
    )

    const errors = [
        { isError: chatDetails.isError, error: chatDetails.error },
        { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error }
    ]

    const members = chatDetails?.data?.chat?.members;
    const avatars = chatDetails?.data?.chat?.avatar;
    const nAmE = chatDetails?.data?.chat?.name;
    const movies = chatDetails?.data?.chat?.movies;
    const groupChat = chatDetails?.data?.chat?.groupChat;

    let chatName = "";
    if(members?.length === 2) {
        const parts = nAmE.split('-');
        chatName = (parts[0] === user.name) ? parts[1] : parts[0];
    }
    else chatName = nAmE;

    let avatar, username, createdAt, bio;
    if(members?.length === 2) {
        const avatarId = (members[0]._id === user._id) ? members[1]._id : members[0]._id;
        bio = (members[0]._id === user._id) ? members[1].bio : members[0].bio;
        username = (members[0]._id === user._id) ? members[1].username : members[0].username;
        createdAt = (members[0]._id === user._id) ? members[1].createdAt : members[0].createdAt;
        avatar = avatars[avatarId];

    }
    else avatar = avatars?.group;

    const chatPerson = { name : chatName, avatar, bio, username, createdAt, groupChat }
    const memberIds = members?.map(member => member._id);

    const messageOnChange = (e) => {
        setMessage(e.target.value);

        if(!IamTyping) { 
            socket.emit(START_TYPING, {members, chatId});
            setIamTyping(true);
        }

        if(typingTimeOut.current) clearTimeout(typingTimeOut.current);

        typingTimeOut.current = setTimeout(() => {
            socket.emit(STOP_TYPING, { members, chatId });
            setIamTyping(false);
        }, 2000)
    }

    const handleFileOpen = (e) => {
        dispatch(setIsFileMenu(true));
        setFileMenuAnchor(e.currentTarget);
    }

    const sendHandler = (e) => {
        e.preventDefault();
        if(!message.trim()) return;

        socket.emit(NEW_MESSAGE, { chatId, members, message });
        setMessage("");
    }

    useEffect(() => {
        socket.emit(CHAT_JOINED, { userId: user._id, members })
        dispatch(removeNewMessagesAlert(chatId));
        return () => {
            setMessages([]);
            setMessage("");
            setOldMessages([]);
            setPage(1);
            socket.emit(CHAT_LEAVED, { userId: user._id, members })
        };
    }, [chatId])

    useEffect(() => {
        if(bottomRef.current) bottomRef.current.scrollIntoView({ behaviour: "smooth" });
    }, [messages])

    useEffect(() => {
        if(chatDetails.isError) return navigate('/');
    }, [chatDetails.isError])

    const newMessageHandler = useCallback((data) => {
        if(data.chatId !== chatId) return;
        setMessages((prev) => [...prev, data.message]);
    }, [chatId])

    const startTypingListener = useCallback((data) => {
        if(data.chatId !== chatId) return;
        setUserTyping(true);
    }, [chatId])

    const stopTypingListener = useCallback((data) => {
        if(data.chatId !== chatId) return;
        setUserTyping(false);
    }, [chatId])

    const alertListener = useCallback((data) => {
        if(data.chatId !== chatId) return;
        const messageForAlert = {
            content: data.message,
            sender: {
                _id: "svreuighnwigtuhbnhsdfyhi",
                name: "Admin",
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        };

        setMessages((prev) => [...prev, messageForAlert]);
    })

    useErrors(errors);

    const allMessages = [...oldMessages, ...messages];

    const openMovieList = (e) => {
        e.stopPropagation();
        dispatch(setIsMovie(true));
    }

    const callHandler = async(e) => {
        e.stopPropagation();
        dispatch(setCalling(true));
        dispatch(setIsVideo(true));
        dispatch(setShowVideo(true));
        const offer = await peer.getOffer();
        socket.emit("make-call", { chatId, members : memberIds, user, offer });
    }

    const callRejectedHandler = useCallback(() => {
        dispatch(setIsVideo(false));
        dispatch(setShowVideo(false));
    })

    const showChatProfile = (e) => {
        e.preventDefault();
        chatProfileAnchor.current = imageRef.current;
        dispatch(setIsChatProfile(true));
    }

    const eventHandler = { 
        [ALERT]: alertListener,
        [NEW_MESSAGE]: newMessageHandler ,
        [START_TYPING]: startTypingListener,
        [STOP_TYPING]: stopTypingListener,
        [CALL_REJECTED]: callRejectedHandler
    };
    useSocketEvents(socket, eventHandler);
    

    return chatDetails.isLoading ? <Skeleton/> :  (
        <Fragment>
            <Box sx = {{flexGrow : 1}} height = {"8%"} onClick = {showChatProfile}>
                <AppBar position = 'static' sx = {{bgcolor : chatListColor}}>
                    <Toolbar direction = "row">
                        <img src = {avatar} alt = "image" height = "30rem" width = "30rem" style = {{ marginRight: 15, borderRadius: 40, border: "1px solid white" }} ref = {imageRef}/>
                        <Typography variant = "h5">{chatName}</Typography>
                        <Box sx = {{ flexGrow : 1}}/>
                        <IconBtn title = {"Movies"} icon = {<MovieCreationIcon/>} onClick = {openMovieList}/>
                        <IconButton sx = {{ color: "white" }} onClick = {callHandler}
                            disabled = {chatDetails?.data?.chat?.groupChat}
                        ><VideoCallIcon/></IconButton>
                    </Toolbar>
                </AppBar>
            </Box>
            {isMovie && (
                <Suspense fallback = {<Backdrop open/>}>
                    <MovieDialog chatId = {chatId} chatName = {chatName} members = {memberIds} movies = {movies}/>
                </Suspense>
            )}
            <Stack 
                ref = {containerRef}
                boxSizing = {"border-box"}
                padding = {"1rem"}
                spacing = {"1rem"}
                bgcolor = {chatThemeColor}
                height = {"82%"}
                sx = {{
                    overflowX: "hidden",
                    overFlowY: "auto"
                }}
            >
                
                {
                    allMessages.map((item) => (
                        <MessageComponent key = {item._id} message = {item} user = {user} group = {groupChat}/>
                    ))
                }

                {userTyping && <TypingLoader/>}
                <div ref = {bottomRef}/>

            </Stack>
            
            <form style = {{height: "10%"}} onSubmit={sendHandler}>
                <Stack height = {"100%"} direction={"row"} padding = {"1rem"} alignItems = {"center"} position = {"relative"}>
                    <IconButton
                        sx = {{
                            position: "absolute",
                            left: "1.5rem",
                            rotate: "30deg",
                        }}
                        onClick = {handleFileOpen}
                    >
                    <AttachFileButton/></IconButton>
                    <InputBox name = "textMessage" height = "100%" placeholder='Type message here ...' value = {message} onChange = {messageOnChange}/>
                    <IconButton 
                        type = "submit"
                        sx = {{
                            rotate: "-20deg",  
                            bgcolor: orange,
                            color: "white",
                            marginLeft: "1rem",
                            padding: "0.5rem",
                            "&:hover": {
                                bgcolor: "error.dark",
                            }
                        }}
                    >
                    <SendIcon/></IconButton>
                </Stack>
            </form>

            <FileMenu anchorE1={fileMenuAnchor} chatId = {chatId} />
            <ChatProfile user = {chatPerson} dispatch={dispatch} chatProfileAnchor = {chatProfileAnchor}/>
        </Fragment>
    )
}

const IconBtn = ({title, icon, onClick, value}) => {
    return (
        <Tooltip title = {title}>
            <IconButton color = "inherit" size = "large" onClick = {onClick}>
                {
                    value ? <Badge badgeContent = {value} color = "error">{icon}</Badge> : icon
                }
            </IconButton>
        </Tooltip>
    );
}

export default AppLayout()(Chat)
