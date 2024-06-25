import { Avatar, Button, Dialog, DialogTitle, ListItem, Skeleton, Stack, Typography } from '@mui/material';
import React, { memo } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useErrors } from '../../hooks/hooks';
import { useAcceptFriendRequestMutation, useGetNotificationsQuery } from '../../redux/api/api';
import { setIsNotification } from '../../redux/reducers/misc';
import { headerDialogColor } from '../constants/color';

const Notifications = () => {
    const dispatch = useDispatch();
    const { isNotification } = useSelector((state) => state.misc)
    const { isLoading, data, error, isError } = useGetNotificationsQuery();
    const [acceptRequest] = useAcceptFriendRequestMutation();

    const friendRequestHandler = async( _id, accept ) => {
        dispatch(setIsNotification(false));
        try {
            const res = await acceptRequest({ requestId: _id, accept });
            if(res.data?.success) {
                toast.success(res.data.message);
            }
            else toast.error(res.data?.error || "Something went wrong");
        }
        catch (error) {
            toast.error("Something went wrong");
        }
    };

    const closeHandler = () => dispatch(setIsNotification(false));

    useErrors([{ error, isError }]);

    return (
        <Dialog open = {isNotification} onClose = {closeHandler}>
            <Stack p={{ xs: "1rem", sm: "2rem"}} maxWidth={"25rem"} style = {{ backgroundColor: headerDialogColor }}>
                <DialogTitle>Notifications</DialogTitle>

                {
                    isLoading ? (
                        <Skeleton />
                    ) : (
                        <>
                            {data?.requests.length > 0 ? (
                                data?.requests?.map((item) => {
                                    return <NotificationItem sender = {item.sender} _id = {item._id} handler = {friendRequestHandler} key = {item._id}/>
                                })
                            ) : (
                                <Typography>0 Notifications</Typography>
                            )}
                        </>
                    )
                }

            </Stack>
        </Dialog>
    );
};

const NotificationItem = memo(({ sender, _id, handler }) => {
    const { name, avatar } = sender;
    return (
        <ListItem>
            <Stack direction={"row"} alignItems={"center"} spacing={"1rem"} width={"100%"}>
                <Avatar src = {avatar?.url}/>
                <Typography variant = "body1"
                    sx = {{
                        flexGlow: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}
                    width={"100%"}
                >{`${name} sent you a friend request.`}</Typography>
                
                <Stack direction={{ xs: "columns", sm: "row"}}>
                    <Button onClick = {() => handler( _id, true )}>Accept</Button>
                    <Button color="error" onClick = {() => handler( _id, false )}>Reject</Button>
                </Stack>
            </Stack>
        </ListItem>
    )
});

export default Notifications
