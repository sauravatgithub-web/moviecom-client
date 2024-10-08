import React, { useState } from 'react'
import { useLocation, Link as LinkComponent, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { Box, Drawer, Grid, IconButton, Stack, Typography, styled } from '@mui/material'
import { 
    Dashboard as DashboardIcon, 
    Menu as MenuIcon, 
    Close as CloseIcon, 
    ManageAccounts as ManageAccountsIcon,
    Groups as GroupsIcon,
    Message as MessageIcon,
    ExitToApp as ExitToAppIcon
} from '@mui/icons-material'

import { adminLogout } from '../../redux/thunk/admin'

const Link = styled(LinkComponent)`
    text-decoration: none;
    border-radius: 2rem;
    padding: 1rem 2rem;
    color: black;
    &:hover {
        color: rgba(0, 0, 0, 0.54);
    }
`;

export const adminTabs = [
    {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <DashboardIcon/>
    },
    {
        name: "User",
        path: "/admin/user-management",
        icon: <ManageAccountsIcon/>
    },
    {
        name: "Chats",
        path: "/admin/chat-management",
        icon: <GroupsIcon/>
    },
    {
        name: "Messages",
        path: "/admin/message-management",
        icon: <MessageIcon/>
    },
];

const SideBar = ({w = "100%"}) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logOutHandler = () => {
        dispatch(adminLogout());
        navigate('/');
    };

    return (
        <Stack width = {w} direction = {"column"} p = {"3rem"} spacing = {"3rem"}>
            <Typography variant='h5' textTransform={"uppercase"}>
                Moviecom
            </Typography>
            <Stack spacing={"1rem"}>
                {adminTabs.map((tab) => (
                    <Link key = {tab.path} to = {tab.path}
                        sx = {
                            location.pathname === tab.path && {
                                bgcolor: "black",
                                color: "white",
                                ":hover": {color: "white"},
                            }
                        }
                    >
                        <Stack direction = "row" alignItems = {"center"} spacing = {"1rem"}>
                            {tab.icon}
                            <Typography>{tab.name}</Typography>
                        </Stack>
                    </Link>
                ))}
                <Link onClick = {logOutHandler}>
                    <Stack direction = "row" alignItems = {"center"} spacing = {"1rem"}>
                        <ExitToAppIcon/>
                        <Typography>Log Out</Typography>
                    </Stack>
                </Link>
            </Stack>
        </Stack>
    )
}

const AdminLayout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    const { isAdmin } = useSelector((state) => state.auth);
    const handleMobile = () => {
        setIsMobile(!isMobile);
    }
    const handleClose = () => setIsMobile(false);
    if(!isAdmin) return <Navigate to = "/admin"/>

    return (
        <Grid container minHeight={"100vh"}>
            <Box 
                sx = {{
                    display: {xs: "block", md: "none"},
                    position: "fixed",
                    right: "1rem",
                    top: "1rem",
                }}
            >   
                <IconButton onClick = {handleMobile}>
                {isMobile ? <CloseIcon/> : <MenuIcon/>}
                </IconButton>
            </Box>

            <Grid item 
                md = {4} lg = {3}
                sx = {{ display: {xs: "none", md: "block"} }}
            >
                <SideBar/>
            </Grid>

            <Grid item 
                xs = {12} md = {8} lg = {9}
                sx = {{
                    bgcolor: "#c4c9db",
                }}
            >
                {children}
            </Grid>

            <Drawer open = {isMobile} onClose = {handleClose}>
                <SideBar w = "50vw" />
            </Drawer>
        </Grid>
    )
}

export default AdminLayout
