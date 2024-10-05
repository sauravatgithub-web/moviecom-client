import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useInputValidation } from '6pp'

import { Button, Dialog, DialogTitle, Skeleton, Stack, TextField, Typography } from '@mui/material'

import UserItem from '../shared/UserItem';
import { useAvailaibleFriendsQuery, useNewGroupMutation } from '../../redux/api/api';
import { useErrors, useAsyncMutation } from '../../hooks/hooks';
import { setIsNewGroup } from '../../redux/reducers/misc';
import { headerDialogColor } from '../constants/color';

const NewGroup = () => {
    const dispatch = useDispatch();

    const { isNewGroup } = useSelector((state) => state.misc);
    const {isError, isLoading, error, data} = useAvailaibleFriendsQuery()
    const [ newGroup, isLoadingNewGroup ] = useAsyncMutation(useNewGroupMutation);
    const groupName = useInputValidation("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const errors = [{ isError, error }];
    useErrors(errors);

    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) => 
            prev.includes(id)
                ? prev.filter((currElement) => currElement !== id)
                : [...prev, id]
        );
    };
    
    const submitHandler = () => {
        if(!groupName.value) return toast.error("Group name is required");
        else if(selectedMembers.length < 2) return toast.error("Please select atleast 3 members.")
        else {
            newGroup("Creating new group...", { name: groupName.value, members: selectedMembers });
        }

        closeHandler();
    };

    const closeHandler = () => {
        dispatch(setIsNewGroup(false));
    };

    return (
        <Dialog open = {isNewGroup} onClose = {closeHandler}>
            <Stack p={{ xs: "1rem", sm: "3rem"}} width={"25rem"} spacing={"2rem"} style = {{ backgroundColor: headerDialogColor }}>
                <DialogTitle textAlign = {"center"} variant = "h4">New Group</DialogTitle>
                <TextField label = "Group Name" value = {groupName.value} onChange = {groupName.changeHandler}/>
                <Typography variant = "body1">Members</Typography>
                <Stack>
                    {isLoading ? ( 
                        <Skeleton/> 
                    ) : (
                        data?.friends?.map((user) => (
                            <UserItem 
                                user = {user} 
                                key = {user._id} 
                                handler = {selectMemberHandler} 
                                isAdded = {selectedMembers.includes(user._id)}
                            />
                        ))
                    )}
                </Stack>
                <Stack direction = {"row"} justifyContent={"space-evenly"}>
                    <Button variant = "outline" color = "error" size = "large" onClick = {closeHandler}>Cancel</Button>
                    <Button variant = "contained" size = "large" onClick = {submitHandler} disabled = {isLoadingNewGroup}>Create</Button>
                </Stack>

            </Stack>
        </Dialog>
    )
}

export default NewGroup
