import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"
import { useInputValidation } from '6pp';

import { Button, Container, Paper, TextField, Typography } from '@mui/material'

import { adminLogin, getAdmin } from '../../redux/thunk/admin';
import { adminBackgroundColor } from '../../components/constants/color';

const AdminLogin = () => {
    const secretKey = useInputValidation("");
    const { isAdmin } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(adminLogin(secretKey.value))
    }

    useEffect(() => {
        dispatch(getAdmin());
    }, [dispatch])

    if(isAdmin) return <Navigate to = '/admin/dashboard' />;

    return (
        <Container component = {"main"} maxWidth = "100vw" 
            sx = {{
                height : "100vh",
                display : "flex",
                justifyContent: "center",
                alignItems : "center",
                background: adminBackgroundColor
            }}
        >
            <Paper 
                elevation = {3}
                sx = {{
                    padding : 4,
                    display : "flex",
                    flexDirection : "column",
                    alignItems : "center",
                }}
            >
                
                <Typography variant = "h5">Admin Login</Typography>
                <form style = {{
                    width: "100%",
                    marginTop : "1rem"
                }} onSubmit = {submitHandler}>
                    <TextField required fullWidth label = "Password" type = "password" margin = "normal" variant = "outlined" autoComplete = "true"  value = {secretKey.value} onChange = {secretKey.changeHandler}/>
                    <Button sx = {{marginTop : "1rem"}} fullWidth variant = "contained" color = "primary" type = "submit">Log In</Button>
                </form>
            </Paper>
        </Container>
    )
}

export default AdminLogin
