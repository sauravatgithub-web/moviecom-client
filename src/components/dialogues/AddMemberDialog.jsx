import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button, Dialog, DialogTitle, Skeleton, Stack, Typography } from '@mui/material'

import UserItem from '../shared/UserItem'
import { useAsyncMutation, useErrors } from '../../hooks/hooks'
import { useAddMemberMutation, useAvailaibleFriendsQuery } from '../../redux/api/api'
import { setIsAddMember } from '../../redux/reducers/misc'

const AddMemberDialog = ({ chatId }) => {
    const dispatch = useDispatch();
    const [addMember, isLoadingAddMember] = useAsyncMutation(useAddMemberMutation);
    const {isLoading, data} = useAvailaibleFriendsQuery(chatId);

    const members = data?.friends;
    const [selectedMembers, setSelectedMembers] = useState([]);
    const { isAddMember } = useSelector((state) => state.misc)

    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) => 
            prev.includes(id)
                ? prev.filter((currElement) => currElement !== id)
                : [...prev, id]
        );
    };
    
    const closeHandler = () => {
        setSelectedMembers([]);
        dispatch(setIsAddMember(false));
    };
    const addMemberSubmitHandler = () => {
        addMember("Adding members...", { members: selectedMembers, chatId })
        closeHandler();
    };

    const errors = [];
    useErrors(errors);

    return (
        <Dialog open={isAddMember} onClose = {closeHandler}>
            <Stack spacing = {"1rem"} width = {"19rem"} p = {"1rem"}>
                <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
                <Stack spacing = {"0.7rem"}>
                    {isLoading ? (
                        <Skeleton/>
                    ) : ( 
                            members?.length > 0 ? (
                                members?.map((item) => (
                                    <UserItem key={item._id} user={item} handler={selectMemberHandler} 
                                        isAdded = {selectedMembers.includes(item._id)}
                                    />
                                ))
                            ) : (
                                <Typography textAlign={"center"}>No Friends</Typography>
                            )
                        )
                    }
                </Stack>
                <Stack direction={"row"} justifyContent={"space-evenly"}>
                    <Button color = "error" variant = "outlined" onClick = {closeHandler}>Cancel</Button>
                    <Button variant = "contained" onClick = {addMemberSubmitHandler} disabled = {isLoadingAddMember}>Submit Changes</Button>
                </Stack>
            </Stack>
        </Dialog>
    )
}

export default AddMemberDialog
