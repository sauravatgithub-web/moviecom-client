import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

const ConfirmDeleteDialog = ({open, handleClose, deleteHandler}) => {
    return (
        <Dialog open = {open} onClose = {handleClose}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete ?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick = {handleClose}>No</Button>
                <Button color = "error" onClick = {deleteHandler}>Yes</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmDeleteDialog

