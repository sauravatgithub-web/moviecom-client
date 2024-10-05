import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import moment from 'moment';

import { Avatar, IconButton, Popover, Stack, TextField, Typography } from '@mui/material'
import { Done as DoneIcon, Edit as EditIcon, Face as FaceIcon, AlternateEmail as UserNameIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material'

import { transformImage } from '../../lib/features';
import { setIsProfile } from '../../redux/reducers/misc';
import { profileColor } from '../constants/color';
import { useAsyncMutation } from '../../hooks/hooks';
import { useUpdateAboutMutation } from '../../redux/api/api';

const Profile = ({ user, dispatch, profileAnchor }) => {
    const { isProfile } = useSelector((state) => state.misc);

    const [isEdit, setIsEdit] = useState(false);
    const [about, setAbout] = useState("");
    const [aboutUpdateValue, setAboutUpdateValue] = useState("");
    const [changeAbout, isLoadingChangeAbout] = useAsyncMutation(useUpdateAboutMutation);

    useEffect(() => {
        setAbout(user?.bio);
        setAboutUpdateValue(user?.bio);

        return () => {
            setAbout("");
            setAboutUpdateValue("");
            setIsEdit(false);
        }
    },[user])

    const updateAbout = () => {
        setIsEdit(false);
        changeAbout("Updating group name...", { userId : user._id, about: aboutUpdateValue })
    }

    const closeHandler = () => {
        dispatch(setIsProfile(false));
        profileAnchor.current = null;
    }

    return (
        <Popover open = {isProfile} onClose = {closeHandler} anchorEl = {profileAnchor ? profileAnchor.current : null}
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
                <Stack spacing = {"0.5rem"} direction = {"column"}>
                    <Stack direction = "row" spacing = {"1rem"} style = {{ padding: 10 }}>
                        <Avatar 
                            src = {transformImage(user?.avatar?.url)}
                            sx = {{
                                width: 100,
                                height: 100,
                                objectFit: "contain",
                                marginBottom: "1rem",
                                border: "1px solid black",
                            }}
                        />
                        <Stack direction = "column" spacing = {"1rem"} style = {{ padding: 10 }}>
                            <ProfileCard text = {user?.name} icon = {<FaceIcon/>}/>
                            <ProfileCard text = {user?.username} icon = {<UserNameIcon/>}/>
                        </Stack>
                    </Stack>
                    <Stack spacing = {"1rem"} style = {{ padding: 10 }}>
                        <Stack direction = {"row"}>
                            {isEdit ? (
                            <>
                                <TextField variant = "standard" value = {aboutUpdateValue} onChange = {(e) => setAboutUpdateValue(e.target.value)}/>
                                <IconButton onClick = {updateAbout} disabled = {isLoadingChangeAbout}><DoneIcon/></IconButton>
                            </>
                            ) : (
                                <>  
                                    <ProfileCard heading={"About"} text = {about}/>
                                    <IconButton onClick = {() => {setIsEdit(true)}} disabled = {isLoadingChangeAbout}><EditIcon/></IconButton>
                                </>
                            )}
                        </Stack>
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

export default Profile
