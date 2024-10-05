import React from 'react'
import { Error as ErrorIcon } from '@mui/icons-material'
import { Container, Stack, Typography } from '@mui/material'

const NotFound = () => {
    return (
        <Container maxWidth = "lg" sx = {{ height: "100vh"}}>
            <Stack alignItems = {"center"} justifyContent = {"center"} spacing = {"2rem"} height = "100%43">
                <ErrorIcon sx = {{ fontSize: "10rem"}}/>
                <Typography variant = "h1">404</Typography>
                <Typography variant = "h3">Not Found</Typography>
                <link to = "/">Go back to home</link>
            </Stack>
        </Container>
    )
}

export default NotFound
