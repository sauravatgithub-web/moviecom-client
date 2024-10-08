import React from 'react'
import { Box, Typography } from '@mui/material';
import { lightBlue } from '../constants/color';
import { fileFormat } from '../../lib/features';
import RenderAttachment from './RenderAttachment';

const MessageComponent = ({ message, user, group }) => {
    const { sender, content, attachment = [], createdAt } = message;
    const sameSender = sender?._id === user?._id;

    const hours = new Date(createdAt).getHours();
    const minutes = new Date(createdAt).getMinutes();
    const time = (minutes > 10) ? `${hours}:${minutes}` : `${hours}:0${minutes}`;

    return (
        <div 
            style={{
                alignSelf: sameSender ? "flex-end": "flex-start",
                backgroundColor: "white",
                color: "black",
                borderRadius: "7px",
                padding: "0.5rem",
                width: "fit-content",
                maxWidth: "70%",
                wordWrap: "break-word",    
                wordBreak: "break-word",     
                overflowWrap: "break-word",
                "&:hover" : {
                    bgcolor: "black"
                }
            }}
        >   
            {group && !sameSender && <Typography color = {lightBlue} fontWeight = {"600"} variant = "caption">{sender.name}</Typography>}
            {content && <Typography>{content}</Typography>}
        
            {attachment.length > 0 && attachment.map((attachment, index) => { 
                const url = attachment.url;
                const file = fileFormat(url);
                return <Box key = {index}>
                    <a href = {url} target = "_blank" download style = {{ color: "black" }}>
                        {RenderAttachment(file, url)}
                    </a>
                </Box>
            })}

            <Typography variant = "caption" color = "text.secondary">{time}</Typography>
        </div>
    )
}

export default MessageComponent
