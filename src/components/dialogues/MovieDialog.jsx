import { Box, Dialog, DialogTitle, IconButton, List, Stack, Typography } from '@mui/material';
import React, { useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setIsMovie, setUploadingLoader } from '../../redux/reducers/misc.js';
import { borderBlueColor, deleteIconColor, headerDialogColor } from '../constants/color.js';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../constants/config.js';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useDeleteMovieMutation, useUploadMovieMutation } from '../../redux/api/api.js';
import { getSocket } from '../../socket.jsx';
import { renameFile } from '../../utils/nameCorrector.js'

const MovieDialog = ({ chatId, chatName, members, movies }) => {
    const dispatch = useDispatch();
    const socket = getSocket();

    const movieRef = useRef(null);
    const { isMovie } = useSelector((state) => state.misc);
    const [uploadMovie] = useUploadMovieMutation();
    const [deleteMovie] = useDeleteMovieMutation();

    const uploadMovieHandler = async(e, key) => {
        const files = Array.from(e.target.files);
        const toastId = toast.loading(`Uploading ${key}`);
        dispatch(setUploadingLoader(true));

        try {
            const myForm = new FormData();
            myForm.append("chatId", chatId);
            files.forEach((file) => myForm.append("files", file));
            const res = await uploadMovie(myForm);

            if(res.data) toast.success("Movie uploaded successfully", { id : toastId });
            else toast.error("Failed to upload", { id: toastId });
        }
        catch(error) { toast.error(error, { id: toastId }); }
        finally { dispatch(setUploadingLoader(false)); }
    }

    const playMovieHandler = (movie) => {
        socket.emit('watch-movie-request', {chatName, members, movie});
        dispatch(setIsMovie(false)); 
    }

    const movieDeleteHandler = async(movie) => {
        const toastId = toast.loading(`Deleting ${movie.name}`);
        dispatch(setUploadingLoader(true));
        try {
            const res = await deleteMovie({chatId, movie});
            if(res.data) toast.success("Movie deleted successfully", { id : toastId });
            else toast.error("Failed to delete", { id: toastId });
        }
        catch(error) { toast.error(error, { id: toastId }); }
        finally { dispatch(setUploadingLoader(false)); }
    }

    const selectMovie = () => movieRef.current?.click();
    const movieCloseHandler = () => dispatch(setIsMovie(false));

    return (
        <Dialog open = {isMovie} onClose = {movieCloseHandler}>
            <Stack p = {"2rem"} direction = {"column"} sx = {{ backgroundColor: headerDialogColor, textAlign: "center", paddingBottom: "0.8rem" }}>
                <DialogTitle textAlign={"center"}>Your movies with {chatName}</DialogTitle>
                {movies?.length > 0 ? (
                    <List>
                        {movies.map((movie) => (
                            <MovieItem movie = {movie} key = {idGenerator()} onClick = {() => playMovieHandler(movie)} onDelete = {() => movieDeleteHandler(movie)} />    
                        ))}
                    </List>
                ) : (
                    <Typography variant = "caption">You have no movies in collection together.</Typography>
                )}
                <Typography variant = "caption" sx = {{ marginBottom: 0, paddingBottom: 0 }}>
                    {movies?.length > 0 ? "You can add more to your collection" : `Start a collection now with ${chatName}` }
                    <IconButton onClick = {selectMovie}>
                        <AddIcon/>
                        <input 
                            type = "file"
                            multiple
                            accept = "video/mp4, video/wav, video/ogg"
                            style = {{ display: "none"}}
                            onChange = {(e) => uploadMovieHandler(e, "Movies")}
                            ref = {movieRef}
                        />
                    </IconButton>
                </Typography>
            </Stack>
        </Dialog>
    )
}

const MovieItem = ({movie, onClick, onDelete}) => {
    return (
        <Stack direction = "row" spacing = {"0.8rem"} borderBottom={`1px solid ${borderBlueColor}`}>
            <Typography variant = "h6" marginTop={"0.2rem"} onClick = {onClick}>{renameFile(movie.name)}</Typography>
            <Box sx = {{ flexGrow: 1 }} />
            <IconButton sx = {{ color: deleteIconColor }} onClick = {onDelete}><DeleteIcon/></IconButton>
        </Stack>
    )
}

const idGenerator = () => {
    let num = 0;
    let i = 0;
    while(i < 10) {
        num = num + Math.floor(Math.random()*10) + 1;
        i++;
    }
    return num;
}

export default MovieDialog;
