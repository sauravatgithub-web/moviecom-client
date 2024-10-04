import { Avatar, Box, Stack, Skeleton } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Table from '../../components/shared/Table'
import AdminLayout from '../../components/layout/AdminLayout'
import { fileFormat, transformImage } from '../../lib/features'
import moment from 'moment'
import RenderAttachment from '../../components/shared/RenderAttachment'
import { useFetchData } from '6pp'
import { server } from '../../components/constants/config'
import { useErrors } from '../../hooks/hooks'

const columns = [
    {
        field: "id",
        headerName: "ID",
        headerClassName: "table-header",
        width: 200
    },
    {
        field: "attachments",
        headerName: "Attachments",
        headerClassName: "table-header",
        width: 200,
        renderCell: (params) => {
            const {attachments} = params.row;
            return attachments?.length > 0 ? (
                attachments?.map((item) => {
                    const url = item.url;
                    const file = fileFormat(url);

                    return (
                        <Box> b
                            <a href = {url} download target = "_blank" style = {{color: "black"}}>
                                {RenderAttachment(url, file)}
                            </a>
                        </Box>
                    )
                })
            ) : "No Attachments";
        }
    },
    {
        field: "content",
        headerName: "Content",
        headerClassName: "table-header",
        width: 400,
    },
    {
        field: "sender",
        headerName: "Sender",
        headerClassName: "table-header",
        width: 200,
        renderCell: (params) => (
            <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
                <Avatar alt = {params.row.sender.name} src = {params.row.sender.avatar} />
                <span>{params.row.sender.name}</span>
            </Stack>
        )
    },
    {
        field: "chat",
        headerName: "Chat",
        headerClassName: "table-header",
        width: 220,
    },
    {
        field: "groupChat",
        headerName: "Group Chat",
        headerClassName: "table-header",
        width: 100,
    },
    {
        field: "createdAt",
        headerName: "Time",
        headerClassName: "table-header",
        width: 250,
    },
]


const MessageManage = () => {
    const { loading, data, error } = useFetchData(`${server}/api/v1/admin/messages`, "dashboard-chats")

    useErrors([{ isError: error, error: error }])
    const [rows, setRows] = useState([]);
    console.log(data);

    useEffect(() => {
        if(data) {
            setRows(data?.messages?.map((item) => ({
                ...item,
                id: item._id,
                sender: {
                    name: item.sender.name,
                    avatar: transformImage(item.sender.avatar, 50),
                },
                createdAt: moment(item.createdAt).format("MMMM Do YYYY, h:mm:ss a")
            })))
        }
    }, [data])

    return (
        <AdminLayout>
            {loading ? <Skeleton height={"100vh"}/>: <Table heading = {"All Messages"} columns = {columns} rows = {rows}/>}
        </AdminLayout>
    )
}

export default MessageManage
