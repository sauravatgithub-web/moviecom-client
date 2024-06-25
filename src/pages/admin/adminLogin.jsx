import { useInputValidation } from '6pp';
import React, { useEffect } from 'react'
import { Button, Container, Paper, TextField, Typography } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"
import { adminLogin, getAdmin } from '../../redux/thunk/admin';

const isAdmin = true;

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
        <Container component = {"main"} maxWidth = "xs" 
            sx = {{
                height : "100vh",
                display : "flex",
                justifyContent: "center",
                alignItems : "center"
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
                backgroundColor =  {"linear-gradient(45deg, #ff0000, #ff7f7f)"}
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
