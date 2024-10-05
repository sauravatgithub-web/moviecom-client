import React, { useEffect, useState } from 'react'
import { useFetchData } from '6pp'
import { Avatar, Stack, Skeleton } from '@mui/material'

import { useErrors } from '../../hooks/hooks'
import Table from '../../components/shared/Table'
import { transformImage } from '../../lib/features'
import { server } from '../../components/constants/config'
import AvatarCard from '../../components/shared/AvatarCard'
import AdminLayout from '../../components/layout/AdminLayout'

const columns = [
    {
        field: "id",
        headerName: "ID",
        headerClassName: "table-header",
        width: 100
    },
    {
        field: "avatar",
        headerName: "Avatar",
        headerClassName: "table-header",
        width: 150,
        renderCell: (params) => <AvatarCard avatar = {params.row.avatar} />
    },
    {
        field: "name",
        headerName: "Name",
        headerClassName: "table-header",
        width: 300,
    },
    {
        field: "groupChat",
        headerName: "Group",
        headerClassName: "table-header",
        width: 100,
    },
    {
        field: "totalMembers",
        headerName: "Total Members",
        headerClassName: "table-header",
        width: 120,
    },
    {
        field: "members",
        headerName: "Members",
        headerClassName: "table-header",
        width: 400,
        renderCell: (params) => (
            <AvatarCard max = {100} avatar = {params.row.members} />
        )
    },
    {
        field: "totalMessages",
        headerName: "Total Messages",
        headerClassName: "table-header",
        width: 150,
    },
    {
        field: "creator",
        headerName: "Created By",
        headerClassName: "table-header",
        width: 250,
        renderCell: (params) => (
            <Stack direction = "row" alignItems={"center"} spacing = {"1rem"}>
                <Avatar alt = {params.row.creator.name} src = {params.row.creator.avatar} />
                <span>{params.row.creator.name}</span>
            </Stack>
        )
    },
]

const ChatManage = () => {
    const { loading, data, error } = useFetchData(`${server}/api/v1/admin/chats`, "dashboard-chats")

    useErrors([{ isError: error, error: error }])
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if(data){
            setRows(data?.chats?.map((item) => (
            {
                ...item, 
                id: item._id, 
                avatar: item.avatar.map((i) => transformImage(i, 50)),
                members: item.members.map((i) => transformImage(i.avatar, 50)),
                creatot: {
                    name: item.creator.name,
                    avatar: transformImage(item.creator.avatar, 50),
                }
            })));
        }
    }, [data])

    return (
        <AdminLayout>
            {loading ? <Skeleton height={"100vh"}/> : <Table heading = {"All Chats"} columns = {columns} rows = {rows}/>}
        </AdminLayout>
    )
}

export default ChatManage
