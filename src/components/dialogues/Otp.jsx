import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, TextField, Button } from '@mui/material'
import { setIsOtp } from '../../redux/reducers/misc';
import { useInputValidation } from '6pp';
import toast from 'react-hot-toast';
import axios from 'axios';
import { server } from '../constants/config';
import { emailValidator } from '../../utils/validators';

const Otp = () => {
    const dispatch = useDispatch();
    const { isOtp } = useSelector((state) => state.misc);
    const otpCloseHandler = () => {
        dispatch(setIsOtp(false));
    }

    const email = useInputValidation("", emailValidator);
    const newp = useInputValidation("");
    const otp = useInputValidation("");

    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState(false);

    const handleOTPsubmit = async(e) => {
        e.preventDefault();
        const toastId = toast.loading("Verifying OTP .... ");

        setIsLoading (true);
        const config = {
            withCredentials: true,
            headers: {
                "Content-type": "application/json",
            }
        };

        try {
            const { data } = await axios.post(`${server}/api/v1/user/confirm`, { email : email.value, otp : otp.value }, config);
            console.log(data);
            toast.success(data.message, { id: toastId });
            setNewPassword(true);
        }
        catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong", { id: toastId });
        }
        finally { setIsLoading(false) }
    }

    const submitNewPasswordHandler = async(e) => {
        e.preventDefault();
        const toastId = toast.loading("Setting new password....");

        setIsLoading (true);
        const config = {
            withCredentials: true,
            headers: {
                "Content-type": "application/json",
            }
        };

        try {
            const { data } = await axios.post(`${server}/api/v1/user/setNewPassword`, { email : email.value, password : newp.value }, config) ;
            console.log(data);
            toast.success(data.message, { id: toastId });
            if(data.success) {
                dispatch(setIsOtp(false));
            }
        }
        catch(error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Something went wrong", { id: toastId });
        }
        finally { setIsLoading(false) }
    }

    return (
        <Dialog open = {isOtp} onClose = {otpCloseHandler}>
            {!newPassword && <DialogTitle>Enter your OTP</DialogTitle>}
            {newPassword && <DialogTitle>Enter new password</DialogTitle>}
            <DialogContent>
                <form style = {{ width: "100%", marginTop: "1rem" }} onSubmit = {!newPassword ? handleOTPsubmit : submitNewPasswordHandler} >
                    <TextField required fullWidth 
                        label = "email" 
                        variant = "outlined" autoComplete = 'true' 
                        value = {email.value }
                        onChange = {email.changeHandler} 
                        sx = {{ marginBottom: "1rem" }}
                    />
                    <TextField required fullWidth 
                        label = {!newPassword ? "otp" : "password"} 
                        variant = "outlined" autoComplete = 'true' 
                        value = {!newPassword ? otp.value : newp.value} 
                        onChange = {!newPassword ? otp.changeHandler : newp.changeHandler} 
                    />
                    <Button sx = {{ marginTop: "1rem" }} fullWidth variant = "contained" color = "primary" type = "submit" disabled = {isLoading}>Submit</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default Otp
