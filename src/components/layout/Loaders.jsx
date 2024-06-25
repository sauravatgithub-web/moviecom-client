import React from 'react'
import { Skeleton, Stack, Grid } from '@mui/material'
import { BouncingSkeleton } from '../styles/StyledComponents';

const LayoutLoader = () => {
    return (
        <Grid container height = "calc(100vh - 4rem)">
            <Grid item>
                <Stack spacing = {"1rem"}>
                    {Array.from({ length: 10 }).map((_, index) => (
                        <Skeleton key = {index} variant = "rounded" height = {"5rem"} />
                    ))}
                </Stack>
            </Grid>
            <Grid item>
                <Skeleton variant = "rectangular" height = {"100vh"} />
            </Grid>
        </Grid>
    )
}

const TypingLoader = () => {
    return (
        <Stack
            spacing={"0.5rem"}
            direction={"row"}
            padding={"0.5rem"}
            justifyContent={"center"}
        >
            <BouncingSkeleton variant = "circular" width = {15} height = {15} style = {{ animationDelay: "0.1s"}}/>
            <BouncingSkeleton variant = "circular" width = {15} height = {15} style = {{ animationDelay: "0.2s"}}/>
            <BouncingSkeleton variant = "circular" width = {15} height = {15} style = {{ animationDelay: "0.4s"}}/>
            <BouncingSkeleton variant = "circular" width = {15} height = {15} style = {{ animationDelay: "0.6s"}}/>
        </Stack>
    );
}

export { LayoutLoader, TypingLoader }
