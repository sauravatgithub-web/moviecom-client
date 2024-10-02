import React, { useState } from 'react'
import { Avatar, Box, Button, Container, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { VisuallyHiddenInput } from '../components/styles/StyledComponents';
import { useFileHandler, useInputValidation, useStrongPassword } from '6pp';
import { usernameValidator, emailValidator } from '../utils/validators';
import { useDispatch } from 'react-redux';
import { userExists } from '../redux/reducers/auth';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { blueGradientNear, blueGradientFar } from '../components/constants/color';
import { server } from '../components/constants/config';

const Login = () => {

    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    const toggleLogin = () => setIsLogin((prev) => !prev);
    const name = useInputValidation("");
    const email = useInputValidation("", emailValidator);
    const username = useInputValidation("", usernameValidator);
    const password = useStrongPassword();

    const avatar = useFileHandler("single");

    const dispatch = useDispatch();

    const handleLogIn = async(e) => {
        e.preventDefault();
        const toastId = toast.loading("Logging in .... ");

        setIsLoading(true);
        const config = {
            withCredentials: true,
            headers: {
                "Content-type": "application/json",
            }
        };

        try {
            const { data } = await axios.post(
                `${server}/api/v1/user/login`, 
                {
                    username: username.value,
                    password: password.value,
                }, 
                config
            );
            dispatch(userExists(data.user));
            toast.success(data.message, { id: toastId });
        }
        catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong", { id: toastId });
        }
        finally { setIsLoading(false) }
    }

    const handleSignUp = async(e) => {
        e.preventDefault();
        const toastId = toast.loading("Signing up .... ");

        const formData = new FormData();
        formData.append("avatar", avatar.file);
        formData.append("name", name.value);
        formData.append("username", username.value);
        formData.append("password", password.value);
        formData.append("email", email.value);

        const config = {
            withCredentials: true,
            headers: {
                
            }
        };

        try {
            setIsLoading(true);
            const { data } = await axios.post(`${server}/api/v1/user/new`, formData, config);
            dispatch(userExists(data.user));
            toast(data.success, { id: toastId });
        }
        catch(error) {
            toast.error(error?.response?.data?.message || "Something went wrong", { id: toastId });
        }
        finally { setIsLoading(false) }
    }

    const handleForgetPassword = async(e) => {
        e.preventDefault();
        const toastId = toast.loading("Sending OTP  .... ");
        const config = {
            withCredentials: true,
            headers: {
                "Content-type": "application/json",
            }
        };

        try {
            setIsLoading(true);
            const { data } = await axios.post(`${server}/api/v1/user/send`, {username: username.value}, config);
            toast(data.success, { id: toastId });
        }
        catch(error) {
            toast.error(error?.response?.data?.message || "Something went wrong", { id: toastId });
        }
        finally { setIsLoading(false) }
    }

    return (
        <div style = {{ 
            backgroundImage: `linear-gradient(${blueGradientNear}, ${blueGradientFar})`
        }}>
            <Container component = {"main"} maxWidth = "xs"
                sx = {{
                    marginLeft: { md: 15, lg: 15, xl: 15 },
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Paper
                    elevation={3}
                    sx = {{
                        padding: 4,
                        paddingBottom: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}    
                >
                    {isLogin ? (
                        <>  
                            <Typography variant = "h5">Login</Typography>
                            <form style = {{
                                width: "100%",
                                marginTop : "1rem"
                            }} onSubmit = {handleLogIn}>
                                <TextField required fullWidth label = "Username" margin = "normal" variant = "outlined" autoComplete = "true"  value = {username.value} onChange = {username.changeHandler}/>
                                <TextField required fullWidth label = "Password" type = "password" margin = "normal" variant = "outlined" autoComplete = "true"  value = {password.value} onChange = {password.changeHandler}/>
                                <Button sx = {{marginTop : "1rem"}} fullWidth variant = "contained" color = "primary" type = "submit" disabled = {isLoading}>Log In</Button>

                                <Box sx = {{ display: "flex", justifyContent: "right", paddingBottom: "3vh" }}>
                                    <Button onClick = {handleForgetPassword} style={{ color: theme.palette.text.primary }} sx = {{ textTransform: "none" }}>Forget Password ?</Button>
                                </Box>
                                <Box sx = {{ 
                                    display: "flex", 
                                    justifyContent: "center", 
                                    flexDirection: "row", 
                                    '@media (max-width: 400px)': {
                                        flexDirection: "column", 
                                        alignItems: "center",
                                    }, 
                                }}>
                                    <span>Don't have an account ? </span>
                                    <Button variant = "text" onClick = {toggleLogin} disabled = {isLoading} sx = {{ textTransform: "none", textDecoration: "underline", padding: "0 3px" }}>Sign up instead</Button>
                                </Box>
                            </form>
                        </>
                    ) : (
                        <>  
                            <Typography variant = "h5">Sign Up</Typography>
                            <form style = {{
                                width: "100%",
                                marginTop: "1rem",
                            }} onSubmit = {handleSignUp}>
                                <Box spacing = {"0.5rem"} sx = {{ 
                                    display: "flex",
                                    flexDirection: "column",
                                    '@media (max-height: 720px)': {
                                        flexDirection: "row",
                                    },
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                    <Stack position = {"relative"} width = {"8rem"} margin = {"auto"}>
                                        <Avatar sx = {{width: "8rem", height: "8rem", objectFit: "contain"}} src = {avatar.preview}/>
                                        <IconButton 
                                            sx = {{
                                                position: "absolute",
                                                bottom: 0,
                                                right: 0,
                                                color: "white",
                                                bgcolor: "rgba(0, 0, 0, 0.5)",
                                                "&:hover" : {
                                                    bgcolor: "rgba(0, 0, 0, 0.7)",
                                                },
                                            }}
                                            component = "label"
                                        >
                                            <>
                                                <CameraAltIcon/>
                                                <VisuallyHiddenInput type = "file" onChange = {avatar.changeHandler}/>
                                            </>
                                        </IconButton>
                                    </Stack>
                                    {avatar.error && (
                                        <Typography color = "error" variant = "caption">{avatar.error}</Typography>
                                    )}
                                    <Stack sx = {{ marginLeft: "1rem" }}>
                                        <TextField required fullWidth label = "Name" margin = "normal" variant = "outlined" autoComplete = "true" value = {name.value} onChange={name.changeHandler} />
                                        <TextField required fullWidth label = "Username" margin = "normal" variant = "outlined" autoComplete = "true" value = {username.value} onChange = {username.changeHandler}/>
                                        {username.error && (
                                            <Typography color = "error" variant = "caption">{username.error}</Typography>
                                        )}
                                    </Stack>
                                </Box>
                                {email.error && (
                                    <Typography color = "error" variant = "caption">{email.error}</Typography>
                                )}
                                <TextField required fullWidth label = "Email" margin = "normal" variant = "outlined" autoComplete = "true" value = {email.value} onChange={email.changeHandler} />

                                <TextField required fullWidth label = "Password" type = "password" margin = "normal" variant = "outlined" autoComplete = "true" value = {password.value} onChange = {password.changeHandler}/>
                                {password.error && (
                                    <Typography color = "error" variant = "caption">{password.error}</Typography>
                                )}

                                <Button sx = {{marginTop : "1rem"}} fullWidth variant = "contained" color = "primary" type = "submit" disabled = {isLoading}>Sign Up</Button>
                                
                                <Box sx = {{ display: "flex", justifyContent: "center", paddingTop: "3vh" }}>
                                    <span>Already have an account ? </span>
                                    <Button variant = "text" onClick = {toggleLogin} disabled = {isLoading} sx = {{ textTransform: "none", textDecoration: "underline", padding: "0 3px" }}>Log In</Button>
                                </Box>
                            </form>
                        </>                
                    )}
                </Paper>
            </Container>
        </div>
    )
}

export default Login;
