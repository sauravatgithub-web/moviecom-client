import React, { Suspense, lazy, memo, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Backdrop, Box, Button, CircularProgress, Drawer, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon, Done as DoneIcon, Edit as EditIcon, KeyboardBackspace as KeyboardBackspaceIcon, Menu as MenuIcon} from '@mui/icons-material'

import UserItem from '../components/shared/UserItem'
import AvatarCard from '../components/shared/AvatarCard'
import { setIsAddMember } from '../redux/reducers/misc.js'
import { Link } from '../components/styles/StyledComponents'
import { LayoutLoader } from '../components/layout/Loaders.jsx'
import { useAsyncMutation, useErrors } from '../hooks/hooks.jsx';
import { groupListColor } from '../components/constants/color.js'
import { useChatDetailsQuery, useDeleteChatMutation, useMyGroupsQuery, useRemoveMemberMutation, useRenameGroupMutation } from '../redux/api/api.js'

const Groups = () => {
    const navigate = useNavigate(); 
    const dispatch = useDispatch(); 
    
    const myGroups = useMyGroupsQuery("");
    const chatId = useSearchParams()[0].get("group");

    const { isAddMember } = useSelector((state) => state.misc)
    const groupDetails = useChatDetailsQuery({ chatId, populate: true }, { skip: !chatId });

    const [deleteChat, isLoadingDeleteChat] = useAsyncMutation(useDeleteChatMutation);
    const [removeMember, isLoadingRemoveMember] = useAsyncMutation(useRemoveMemberMutation);
    const [changeGroupName, isLoadingChangeGroupName] = useAsyncMutation(useRenameGroupMutation);

    const [members, setMembers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [isMobileMenu, setIsMobileMenu] = useState(false);
    const [groupNameUpdateValue, setGroupNameUpdateValue] = useState("");
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
    
    const AddMemberDialog = lazy(() => import("../components/dialogues/AddMemberDialog"));
    const ConfirmDeleteDialog = lazy(() => import("../components/dialogues/ConfirmDeleteDialog"));

    const errors = [
        {
            isError: myGroups.isError,
            error: myGroups.error,
        },
        {
            isError: groupDetails.isError,
            error: groupDetails.error,
        },
    ]

    useErrors(errors);

    useEffect(() => {
        const groupData = groupDetails.data?.chat;
        if(groupData) {
            setGroupName(groupData.name);
            setGroupNameUpdateValue(groupData.name);
            setMembers(groupData.members);
        }

        return () => {
            setGroupName("");
            setGroupNameUpdateValue("");
            setMembers([]);
            setIsEdit(false);
        }
    },[groupDetails.data])

    const navigateBack = () => {
        navigate("/");
    }

    const handleMobile = () => {
        setIsMobileMenu((prev) => !prev);
    }

    const handleMobileClose = () => {
        setIsMobileMenu(false);
    }
    
    
    const updateGroupName = () => {
        setIsEdit(false);
        changeGroupName("Updating group name...", { chatId, name: groupNameUpdateValue })
    }
    
    const closeConfirmDeleteHandler = () => {
        setConfirmDeleteDialog(false);
    };
    const openConfirmDeleteHandler = () => {
        setConfirmDeleteDialog(true);
    };
    const deleteHandler = () => {
        deleteChat("Deleting chat...", chatId);
        closeConfirmDeleteHandler();
        navigate("/");
    };

    const addMemberHandler = () => {
        dispatch(setIsAddMember(true));
    };

    const removeMemberHandler = (userId) => {
        removeMember("Removing member...", { userId, chatId });
    }

    const IconBtns = (
        <>
            <Box sx = {{
                display: {
                    xs: "block",
                    sm: "none",
                    position: "fixed",
                    right: "1rem",
                    top: "1rem"
                }
            }}>
                <IconButton onClick = {handleMobile}>
                    <MenuIcon />
                </IconButton>
            </Box>

            <Tooltip title = "back">
                <IconButton sx = {{ 
                    position: "absolute", 
                    left: "2rem", 
                    top: "2rem", 
                    bgcolor: "rgba(0, 0, 0, 0.8)", 
                    color: "white",
                    "&:hover": {
                        bgcolor: "rgba(0, 0, 0, 0.5",
                    },
                }} onClick= {navigateBack}>
                    <KeyboardBackspaceIcon/>
                </IconButton>
            </Tooltip>
        </>
    );

    const ButtonGroup = (
        <Stack
            direction={{
                xs: "column-reverse",
                sm: "row",
            }}
            spacing={"0.8rem"}
            p = {{
                xs: "0",
                sm: "0.7rem",
                md: "0.7rem 3rem"
            }}
        >
            <Button size="large" color = "error" variant = "outlined" startIcon = {<DeleteIcon/>} onClick = {openConfirmDeleteHandler}>Delete Group</Button>
            <Button size="large" variant = "contained" startIcon = {<AddIcon/>} onClick = {addMemberHandler}>Add Member</Button>
        </Stack>
    )

    const GroupName = (
        <Stack 
            direction= {"row"}
            alignItems = {"center"}
            justifyContent={"center"}
            spacing = {"1rem"}
            padding = {'2rem'}
        >
            {isEdit ? (
            <>
                <TextField variant = "standard" value = {groupNameUpdateValue} onChange={(e) => setGroupNameUpdateValue(e.target.value)}/>
                <IconButton onClick={updateGroupName} disabled={isLoadingChangeGroupName}><DoneIcon/></IconButton>
            </>
            ) : (
                <>
                    <Typography variant = "h4">{groupName}</Typography>
                    <IconButton onClick={() => setIsEdit(true)} disabled={isLoadingChangeGroupName}><EditIcon/></IconButton>
                </>
            )}
        </Stack>
    )

    return myGroups.isLoading?<LayoutLoader/> : (
        <Grid container height = {"100vh"}>
            <Grid item
                sx = {{ display: { xs: "none", sm: "block" } }}
                sm = {3}
                bgcolor = {groupListColor}
            >
                <GroupsList myGroups = {myGroups?.data?.groups} chatId={chatId} />
            </Grid>

            <Grid item xs = {12} sm = {9} sx = {{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                padding: "1rem 3rem"
            }}>
                {IconBtns}
                {groupName && (<>
                    {GroupName}

                    <Typography margin = {"1.5rem"} 
                        alignSelf = {"flex-start"}
                        variant = "body1"
                    >
                        Members
                    </Typography>
                    
                    <Stack 
                        maxWidth={"45rem"}
                        width={"100%"}
                        boxSizing={"border-box"}
                        padding = {{
                            sm: "0.5rem",
                            xs: "0",
                            md: "0.5rem 3rem"
                        }}
                        spacing={"1.5rem"}
                        height={"40vh"}
                        overflow={"auto"}
                    >

                        {isLoadingRemoveMember ? <CircularProgress/> : members.map((item) => (
                            <UserItem user = {item} isAdded styling = {{
                                    boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.2)",
                                    padding: "0.7rem 1.5rem",
                                    borderRadius: "1rem"
                                }}
                                key = {item._id}
                                handler = {removeMemberHandler}
                            />
                        ))}

                    </Stack>
                    {ButtonGroup}
                </>)}
            </Grid>

            {isAddMember && (
                <Suspense fallback = {<Backdrop open/>}>
                    <AddMemberDialog chatId = {chatId}/>
                </Suspense>
            )}

            {confirmDeleteDialog && (
                <Suspense fallback = {<Backdrop open />}>
                    <ConfirmDeleteDialog 
                        open = {confirmDeleteDialog}
                        handleClose = {closeConfirmDeleteHandler}
                        deleteHandler = {deleteHandler}
                    />
                </Suspense>
            )}

            <Drawer sx = {{
                display : {
                    xs: "block",
                    sm: "none"
                },
                "& .MuiPaper-root": {  
                    bgcolor: groupListColor,  
                },
            }}
            open = {isMobileMenu} onClose = {handleMobileClose}>
                <GroupsList w = {"50vw"} myGroups = {myGroups?.data?.groups} chatId={chatId}/>
            </Drawer>
        </Grid>
    )
}

const GroupsList = ({ w = "100%", myGroups = [], chatId }) => {
    return (
        <Stack width = {w}>
            {myGroups.length > 0 ? (
                myGroups.map((group) => {
                    return <GroupsListItem group = {group} chatId = {chatId} key = {group._id} />
                })
            ) : (
                <Typography textAlign = {"center"} padding = "2rem">
                    No Groups
                </Typography>
            )}
        </Stack>
    )
}

const GroupsListItem = memo(({ group, chatId }) => {
    const {name, avatar, _id} = group;
    return (
        <Link to = {`?group=${_id}`}
            onClick = {(e) => {
                if(chatId === _id) e.preventDefault();
            }}
        >
            <Stack direction = {"row"} spacing = {"0.7rem"} alignItems = {"center"} padding = {"0.5rem"}>
                <AvatarCard avatar = {avatar}/>
                <Typography>{name}</Typography>
            </Stack>
        </Link>
    )
});

export default Groups
