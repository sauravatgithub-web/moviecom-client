import React from 'react'
import { Avatar, Menu, Stack, Typography } from '@mui/material'
import {Face as FaceIcon, AlternateEmail as UserNameIcon, CalendarMonth as CalendarIcon} from '@mui/icons-material'
import moment from 'moment';
import { transformImage } from '../../lib/features';
import { useSelector } from 'react-redux';
import { setIsProfile } from '../../redux/reducers/misc';
import { profileColor } from '../constants/color';

const Profile = ({ user, dispatch, profileAnchor }) => {
    const { isProfile } = useSelector((state) => state.misc);

    const closeHandler = () => {
        dispatch(setIsProfile(false));
        profileAnchor.current = null;
    }

    return (
        <Menu open = {isProfile} onClose = {closeHandler} anchorEl = {profileAnchor ? profileAnchor.current : null}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "center",
                horizontal: "center",
            }}
            style = {{ zIndex: 2 }}
        >
            <div style = {{ backgroundColor: profileColor, borderRadius: 9, padding: 0, marginTop: -8, marginBottom: -8 }}>
                <Stack spacing={"0.5rem"} direction={"column"}>
                    <Stack direction = "row" spacing = {"1rem"} style = {{ padding: 10 }}>
                        <Avatar 
                            src = {transformImage(user?.avatar?.url)}
                            sx={{
                                width: 100,
                                height: 100,
                                objectFit: "contain",
                                marginBottom: "1rem",
                                border: "1px solid black",
                            }}
                        />
                        <Stack direction = "column" spacing = {"1rem"} style = {{ padding: 10 }}>
                            <ProfileCard text={user?.name} icon={<FaceIcon/>}/>
                            <ProfileCard text={user?.username} icon={<UserNameIcon/>}/>
                        </Stack>
                    </Stack>
                    <Stack spacing = {"1rem"} style = {{ padding: 10 }}>
                        <ProfileCard heading={"About"} text={user?.bio || "Hi, I am using moviecom"}/>
                        <ProfileCard text={moment(user?.createdAt).fromNow()} icon={<CalendarIcon/>}/>
                    </Stack>
                </Stack>
            </div>
        </Menu>
    )
}

const ProfileCard = ({text, icon, heading}) => (
    <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"0.5rem"}
        color={"black"}
        textAlign={"center"}
    >
        {icon && icon}
        <Stack style = {{ textAlign: "left" }}>
            <Typography color = "black" variant='h6'>{heading}</Typography>
            <Typography variant='body1'>{text}</Typography>
        </Stack>
    </Stack>
);

export default Profile
