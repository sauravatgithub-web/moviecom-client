import React from 'react'

const otp = () => {
    const { isOtp } = useSelector((state) => state.misc);
    return (
        <Dialog open = {isOtp}>
            <DialogTitle>Enter your OTP</DialogTitle>
            <DialogContent>
            <p>This is a dialog box content.</p>
            </DialogContent>
        </Dialog>
    )
}

export default otp
