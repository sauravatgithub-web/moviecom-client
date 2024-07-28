import React, { Suspense, lazy } from 'react'
import { AppBar, Backdrop, Badge, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import {Menu as MenuIcon, Search as SearchIcon, Add as AddIcon, Group as GroupIcon, Logout as LogOutIcon, Notifications as NotificationsIcon, Search} from '@mui/icons-material'
import { lightBlue } from '../constants/color'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { server } from '../constants/config'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux';
import { userNotExists } from '../../redux/reducers/auth'
import { setIsMobile, setIsSearch, setIsNotification, setIsNewGroup } from '../../redux/reducers/misc'
import { resetNotification } from '../../redux/reducers/chat'

const SearchDialog = lazy(() => import("../specefic/Search"));
const NotificationDialog = lazy(() => import("../specefic/Notifications"));
const NewGroupDialog = lazy(() => import("../specefic/NewGroup"));
import icon from './icon.png'

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isSearch, isNotification, isNewGroup } = useSelector(state => state.misc);
    const { notificationCount } = useSelector(state => state.chat);

    const handleMobile = () => dispatch(setIsMobile(true));

    const openSearch = () => dispatch(setIsSearch(true));
    const openNewGroup = () => dispatch(setIsNewGroup(true));
    const navigateToGroup = () => navigate("/groups");
    const navigateHandler = () => navigate("/");

    const openNotifications = () => {
        dispatch(setIsNotification(true));
        dispatch(resetNotification());
    };

    const logOutHandler = async () => {
        try {
            const { data } = await axios.get(`${server}/api/v1/user/logOut`, { withCredentials: true });
            dispatch(userNotExists());
            toast.success(data.message);
        }
        catch(error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        }
    }

    return (
        <>
            <Box sx = {{flexGrow : 1}} height = {"4rem"}>
                <AppBar position = 'static' sx = {{bgcolor : lightBlue}}>
                    <Toolbar>
                        <img src = {icon} alt = "image" height = "30rem" width = "30rem" style = {{ marginRight: 15 }}/>
                        <Typography 
                            variant = "h5"
                            sx = {{ 
                                display : {xs : "none", sm : "block"},
                                cursor : "pointer"
                            }} 
                            onClick = {navigateHandler}
                        >moviecom</Typography>
                        <Box sx = {{ display : {xs : "block", sm : "none"}}}>
                            <IconButton color = "inherit" onClick = {handleMobile}>
                                <MenuIcon/>
                            </IconButton>
                        </Box>
                        <Box sx = {{ flexGrow : 1}}/>
                        <Box>
                            <IconBtn title = {"Search"} icon = {<SearchIcon/>} onClick = {openSearch}/>
                            <IconBtn title = {"New Group"} icon = {<AddIcon/>} onClick = {openNewGroup}/>
                            <IconBtn title = {"Manage Groups"} icon = {<GroupIcon/>} onClick = {navigateToGroup}/>
                            <IconBtn title = {"Notifications"} icon = {<NotificationsIcon/>} onClick = {openNotifications} value = {notificationCount}/>
                            <IconBtn title = {"Log Out"} icon = {<LogOutIcon/>} onClick = {logOutHandler}/>
                        </Box>
                    </Toolbar>
                </AppBar>
            </Box>
            {isSearch && (
                <Suspense fallback = {<Backdrop open/>}>
                    <SearchDialog/>
                </Suspense>
            )}
            {isNotification && (
                <Suspense fallback = {<Backdrop open/>}>
                    <NotificationDialog/>
                </Suspense>
            )}
            {isNewGroup && (
                <Suspense fallback = {<Backdrop open/>}>
                    <NewGroupDialog/>
                </Suspense>
            )}
        </>
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

export default Header
