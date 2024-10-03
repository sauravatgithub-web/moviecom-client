import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Avatar, Skeleton } from '@mui/material'
import Table from '../../components/shared/Table'
import { transformImage } from '../../lib/features'
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
        field: "avatar",
        headerName: "Avatar",
        headerClassName: "table-header",
        width: 150,
        renderCell: (params) => (
            <Avatar alt = {params.row.name} src = {params.row.avatar} />
        )
    },
    {
        field: "name",
        headerName: "Name",
        headerClassName: "table-header",
        width: 150,
    },
    {
        field: "username",
        headerName: "User Name",
        headerClassName: "table-header",
        width: 150,
    },
    {
        field: "groups",
        headerName: "Groups",
        headerClassName: "table-header",
        width: 150,
    },
]

const UserManage = () => {
    const { loading, data, error } = useFetchData(`${server}/api/v1/admin/users`, "dashboard-users")
    useErrors([{ isError: error, error: error }])

    const [rows, setRows] = useState([]);

    useEffect(() => {
        if(data) {
            setRows(data.users.map((item) => (
                {
                    ...item, 
                    id: item._id, 
                    avatar: transformImage(item.avatar, 50)
                })));
        }
    }, [data])

    return (
        <AdminLayout>
            {loading ? <Skeleton height={"100vh"}/> : <Table heading = {"All Users"} columns = {columns} rows = {rows}/>}
        </AdminLayout>
    )
}

export default UserManage
