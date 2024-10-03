import { Divider, ListItemText, Menu, MenuItem, MenuList, Tooltip } from '@mui/material'
import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setIsFileMenu, setUploadingLoader } from '../../redux/reducers/misc';
import { AudioFile as AudioFileIcon, Image as ImageIcon, UploadFile as UploadFileIcon, VideoFile as VideoFileIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useSendAttachmentMutation } from '../../redux/api/api';

const FileMenu = ({ anchorE1, chatId }) => {
    const dispatch  = useDispatch();
    const {isFileMenu} = useSelector(state => state.misc);

    const [sendAttachments] = useSendAttachmentMutation();
    const closeFileMenu = () => dispatch(setIsFileMenu(false));

    const imageRef = useRef(null);
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const fileRef = useRef(null);

    const selectImage = () => imageRef.current?.click();
    const selectAudio = () => audioRef.current?.click();
    const selectVideo = () => videoRef.current?.click();
    const selectFile = () => fileRef.current?.click();

    const fileChangeHandler = async(e, key) => {
        const files = Array.from(e.target.files);
        if(files.length <= 0) return;
        else if(files.length > 5) return toast.error(`You can only send ${key} at a time.`);
        else {
            dispatch(setUploadingLoader(true));
            const toastId = toast.loading(`Sending ${key}`);
            closeFileMenu();

            try {
                const myForm = new FormData();
                myForm.append("chatId", chatId);
                files.forEach((file) => myForm.append("files", file));
                const res = await sendAttachments(myForm);

                if(res.data) toast.success(`${key} went sucessfully`, { id: toastId });
                else toast.error(`Failed to send ${key}`, { id: toastId });
            }
            catch(error) { toast.error(error, { id: toastId }); }
            finally { dispatch(setUploadingLoader(false)); }
        }
    }

    return (
        <Menu anchorEl = {anchorE1} open = {isFileMenu} onClose = {closeFileMenu}
            sx = {{
                borderRadius: '12px', 
                overflow: 'hidden',
                '& .MuiPaper-root': {
                    borderRadius: '12px', 
                },
            }}
        >
            <div style = {{ width: "10rem" }}>
                <MenuList>
                    <MenuItem onClick = {selectImage}>
                        <Tooltip title = "Image">
                            <ImageIcon/>
                        </Tooltip>
                        <ListItemText style = {{ marginLeft: "0.5rem" }} >Image</ListItemText>
                        <input 
                            type = "file"
                            multiple
                            accept = "image/png, image/jpeg, image/gif"
                            style = {{ display: "none"}}
                            onChange = {(e) => fileChangeHandler(e, "Images")}
                            ref = {imageRef}
                        />
                    </MenuItem>
                    <Divider/>
                    <MenuItem onClick = {selectAudio}>
                        <Tooltip title = "Audio">
                            <AudioFileIcon/>
                        </Tooltip>
                        <ListItemText style = {{ marginLeft: "0.5rem" }} >Audio</ListItemText>
                        <input 
                            type = "file"
                            multiple
                            accept = "audio/mpeg, audio/wav"
                            style = {{ display: "none"}}
                            onChange = {(e) => fileChangeHandler(e, "Audio")}
                            ref = {audioRef}
                        />
                    </MenuItem>
                    <Divider/>
                    <MenuItem onClick = {selectVideo}>
                        <Tooltip title = "Video">
                            <VideoFileIcon/>
                        </Tooltip>
                        <ListItemText style = {{ marginLeft: "0.5rem" }} >Video</ListItemText>
                        <input 
                            type = "file"
                            multiple
                            accept = "video/mp4, video/wav, video/ogg"
                            style = {{ display: "none"}}
                            onChange = {(e) => fileChangeHandler(e, "Videos")}
                            ref = {videoRef}
                        />
                    </MenuItem>
                    <Divider/>
                    <MenuItem onClick = {selectFile}>
                        <Tooltip title = "file">
                            <UploadFileIcon/>
                        </Tooltip>
                        <ListItemText style = {{ marginLeft: "0.5rem" }} >File</ListItemText>
                        <input 
                            type = "file"
                            multiple
                            accept = "*"
                            style = {{ display: "none"}}
                            onChange = {(e) => fileChangeHandler(e, "Files")}
                            ref = {fileRef}
                        />
                    </MenuItem>
                </MenuList>
            </div>
        </Menu>
    );
};

export default FileMenu;
