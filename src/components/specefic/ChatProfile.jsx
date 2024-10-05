import React from 'react'
import moment from 'moment';

import { Avatar, Popover, Stack, Typography } from '@mui/material'
import { Face as FaceIcon, AlternateEmail as UserNameIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material'

import { transformImage } from '../../lib/features';
import { useSelector } from 'react-redux';
import { setIsChatProfile } from '../../redux/reducers/misc';
import { profileColor } from '../constants/color';

const ChatProfile = ({ user, dispatch, chatProfileAnchor }) => {
    const { isChatProfile } = useSelector((state) => state.misc);

    const closeHandler = () => {
        dispatch(setIsChatProfile(false));
        chatProfileAnchor.current = null;
    }

    return (
        <Popover open = {isChatProfile} onClose = {closeHandler} anchorEl = {chatProfileAnchor ? chatProfileAnchor.current : null}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            style = {{ zIndex: 2 }}
        >
            <div style = {{ backgroundColor: profileColor, borderRadius: 9, padding: 0, marginTop: -8, marginBottom: -8 }}>
                <Stack spacing={"0.5rem"} direction={"column"}>
                    <Stack direction = "row" spacing = {"1rem"} style = {{ padding: 10 }}>
                        <Avatar 
                            src = {transformImage(user?.avatar)}
                            sx={{
                                width: 100,
                                height: 100,
                                objectFit: "contain",
                                marginBottom: "1rem",
                                border: "1px solid black",
                            }}
                        />
                        <Stack direction = "column" spacing = {"1rem"} style = {{ padding: 10 }}>
                            <ProfileCard text = {user?.name} icon = {<FaceIcon/>}/>
                            {!user?.groupChat && <ProfileCard text = {user?.username} icon = {<UserNameIcon/>}/>}
                        </Stack>
                    </Stack>
                    <Stack spacing = {"1rem"} style = {{ padding: 10 }}>
                        <ProfileCard heading = {"About"} text = {user?.bio}/>
                        <ProfileCard text = {moment(user?.createdAt).fromNow()} icon = {<CalendarIcon/>}/>
                    </Stack>
                </Stack>
            </div>
        </Popover>
    )
}

const ProfileCard = ({text, icon, heading}) => (
    <Stack
        direction = {"row"}
        alignItems = {"center"}
        spacing = {"0.5rem"}
        color = {"black"}
        textAlign = {"center"}
    >
        {icon && icon}
        <Stack style = {{ textAlign: "left" }}>
            <Typography color = "black" variant = 'h6'>{heading}</Typography>
            <Typography variant = 'body1'>{text}</Typography>
        </Stack>
    </Stack>
);

export default ChatProfile
