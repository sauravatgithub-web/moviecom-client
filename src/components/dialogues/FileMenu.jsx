import React, { useRef, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Box, Button, Dialog, DialogActions, DialogTitle, DialogContent, Divider, ListItemText, Menu, MenuItem, MenuList, Tooltip } from '@mui/material'
import { AddAPhoto as AddAPhotoIcon, AudioFile as AudioFileIcon, Image as ImageIcon, UploadFile as UploadFileIcon, VideoFile as VideoFileIcon } from '@mui/icons-material';
import { setIsFileMenu, setUploadingLoader } from '../../redux/reducers/misc';
import { useSendAttachmentMutation } from '../../redux/api/api';
import fileIcon from '../../../fileIcon.png'
import ReactPlayer from 'react-player';

const FileMenu = ({ anchorE1, chatId }) => {
    const dispatch  = useDispatch();
    const { isFileMenu } = useSelector(state => state.misc);

    const [sendAttachments] = useSendAttachmentMutation();
    const closeFileMenu = () => dispatch(setIsFileMenu(false));

    const imageRef = useRef(null);
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const fileRef = useRef(null);
    const videoPreviewRef = useRef(null);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);

    const selectImage = () => imageRef.current?.click();
    const selectAudio = () => audioRef.current?.click();
    const selectVideo = () => videoRef.current?.click();
    const selectFile = () => fileRef.current?.click();

    useEffect(() => {
        if (videoPreviewRef.current && stream) {
            videoPreviewRef.current.srcObject = stream;
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const fileChangeHandler = async(e, key) => {
        const files = Array.from(e.target.files);
        if(files.length <= 0) return;
        else if(files.length > 5) return toast.error(`You can only send 5 ${key} at a time.`);
        else {
            setSelectedFiles(files);
            setCurrentFileIndex(0);
            closeFileMenu();
            setShowPreview(true);
        }
    };

    const sendFiles = async () => {
        if (selectedFiles.length === 0) {
            toast.error('No files to send.');
            return; // Prevent sending if no files are selected
        }
    
        dispatch(setUploadingLoader(true));
        const toastId = toast.loading(`Sending attachments...`);
        setShowPreview(false);
    
        try {
            const myForm = new FormData();
            myForm.append("chatId", chatId);
            selectedFiles.forEach((file) => myForm.append("files", file));
            
            const res = await sendAttachments(myForm);
            if (res.data) {
                toast.success(`Attachments sent successfully.`, { id: toastId });
            } else {
                toast.error(`Failed to send attachments.`, { id: toastId });
            }
        } catch (error) {
            toast.error('Error sending files.', { id: toastId });
        } finally {
            dispatch(setUploadingLoader(false));
            setSelectedFiles([]); // Clear the selected files after sending
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setSelectedFiles([]);
    }

    const handleTakePhoto = async () => {
        if (!videoPreviewRef.current) return; 
        const video = videoPreviewRef.current.getInternalPlayer();
        if(video.videoWidth === 0 || video.videoHeight === 0) {
            toast.error('Video stream is not ready');
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
    
        canvas.width = video.videoWidth || 640; 
        canvas.height = video.videoHeight || 480; 
    
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'photo.png', { type: 'image/png' });
                setSelectedFiles((prevFiles) => {
                    const newFiles = [...prevFiles];
                    if (!newFiles.some(f => f.name === file.name)) {
                        newFiles.push(file);
                    }
                    return newFiles;
                });
            } else {
                toast.error('Failed to capture photo');
            }
        }, 'image/png');
        setCurrentFileIndex(0);
        setStream(null);
        setShowCamera(false);
        setShowPreview(true);
        videoPreviewRef.current = null;
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video : true });
            setStream(mediaStream);
            setShowCamera(true);
        }
        catch(error) {
            toast.error('Could not access camera');
        }
    };

    const stopCamera = () => {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        setShowCamera(false);
    };

    return (
        <>
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
                        <Divider/>
                        <MenuItem onClick = {startCamera}>
                            <Tooltip title = "Take Photo">
                                <AddAPhotoIcon/>
                            </Tooltip>
                            <ListItemText style = {{ marginLeft: "0.5rem" }} >Take Photo</ListItemText>
                        </MenuItem>
                    </MenuList>
                </div>
            </Menu>

            <Dialog open = {showCamera} onClose = {stopCamera}>
                <DialogTitle alignSelf={"center"}>Take Photo</DialogTitle>
                <DialogContent style={{ padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {stream && 
                        <ReactPlayer 
                            url={stream} 
                            ref={videoPreviewRef} 
                            playing 
                            autoPlay 
                            style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                            config={{ 
                                youtube: { playerVars: { showinfo: 0 } } 
                            }} 
                        />
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick = {handleTakePhoto} color = "primary">Capture</Button>
                    <Button onClick = {stopCamera} color = "secondary">Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open = {showPreview} onClose = {handleClosePreview}>
                <DialogTitle>Preview Selected Files</DialogTitle>
                <DialogContent>
                    {selectedFiles.length > 0 ? (
                        <Box display="flex" flexDirection="column" alignItems="center">
                        {selectedFiles[currentFileIndex] && (
                            <>
                                {selectedFiles[currentFileIndex].type.startsWith('image/') && (
                                    <img
                                        src={URL.createObjectURL(selectedFiles[currentFileIndex])}
                                        alt={selectedFiles[currentFileIndex].name}
                                        style={{ maxWidth: '100%', marginBottom: '1rem' }}
                                    />
                                )}
            
                                {selectedFiles[currentFileIndex].type.startsWith('video/') && (
                                    <video
                                        controls
                                        style={{ maxWidth: '100%', marginBottom: '1rem' }}
                                    >
                                        <source
                                            src={URL.createObjectURL(selectedFiles[currentFileIndex])}
                                            type={selectedFiles[currentFileIndex].type}
                                        />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
            
                                {selectedFiles[currentFileIndex].type.startsWith('audio/') && (
                                    <audio
                                        controls
                                        style={{ width: '100%', marginBottom: '1rem' }}
                                    >
                                        <source
                                            src={URL.createObjectURL(selectedFiles[currentFileIndex])}
                                            type={selectedFiles[currentFileIndex].type}
                                        />
                                        Your browser does not support the audio tag.
                                    </audio>
                                )}

                                {!selectedFiles[currentFileIndex].type.startsWith('image/') && 
                                !selectedFiles[currentFileIndex].type.startsWith('audio/') && 
                                !selectedFiles[currentFileIndex].type.startsWith('video/') &&
                                (
                                    <img
                                        src={fileIcon}
                                        alt={selectedFiles[currentFileIndex].name}
                                        style={{ maxWidth: '100%', marginBottom: '1rem' }}
                                    />
                                )}
                            </>
                        )}

                        {selectedFiles.length > 1 && <Box display="flex" justifyContent="space-between" width="100%">
                            <Button
                                disabled={currentFileIndex === 0}
                                onClick={() => setCurrentFileIndex((prev) => prev - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                disabled={currentFileIndex === selectedFiles.length - 1}
                                onClick={() => setCurrentFileIndex((prev) => prev + 1)}
                            >
                                Next
                            </Button>
                        </Box>}
                    </Box>
                    ) : (
                        <p>No files selected</p>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick = {handleClosePreview} color = "secondary">
                        Cancel
                    </Button>
                    <Button onClick = {sendFiles} color = "primary">
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FileMenu;
