import React, { memo, useState } from 'react';
import { Link } from '../styles/StyledComponents';
import { Box, Stack, Typography } from '@mui/material';
import AvatarCard from './AvatarCard';
import { hoverChatColor } from '../constants/color';

const ChatItem = ({
    index = 0, 
    newMessageAlert,
    isOnline,
    avatar = [],
    name,
    _id,
    groupChat = false,
    sameSender,
    handleDeleteChat
}) => {
    const [isHovered, setIsHovered] = useState(false); 

    const baseStyle = {
        display: "flex",
        gap: "0.3rem",
        padding: "0.7rem",
        backgroundColor: sameSender ? hoverChatColor : "unset",
        color: sameSender ? "white" : "black",
        position: "relative",
        marginLeft: "0.5rem",
        marginRight: "1rem",
        marginBottom: "0.3rem",
        borderRadius: 10,
    }
    const hoverStyle = {
        backgroundColor: hoverChatColor,
    }

    return (
        <Link 
            sx={{ padding: "0", marginLeft: "0.5rem" }}
            to={`/chat/${_id}`}
            onContextMenu={(e) => {
                e.preventDefault()
                let id = _id;
                handleDeleteChat(e, id, groupChat)
            }}
        >
            <div 
                style={isHovered ? { ...baseStyle, ...hoverStyle } : baseStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >   
                <AvatarCard avatar={avatar} />
                <Stack>
                    <Typography variant = "h6">{name}</Typography>
                    {newMessageAlert?.count && (
                        <Typography variant = "caption">{newMessageAlert.count} New Message</Typography>
                    )}
                </Stack>
                {isOnline && (
                    <Box sx={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        position: "absolute",
                        top: "50%",
                        right: "1rem",
                        transform: "translateY(-50%)",
                    }} />
                )}
            </div>
        </Link>
    );
}

export default memo(ChatItem);
