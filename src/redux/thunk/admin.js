import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { server } from "../../components/constants/config"

const adminLogin = createAsyncThunk("/admin/login", async(secretKey) => {
    try {
        const config = {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
        }
        const { data } = await axios.post(`${server}/api/v1/admin/verify`, {secretKey}, config);
        return data.message;
    }
    catch (error){
        throw error.message.data.message;
    }
})

const getAdmin = createAsyncThunk("admin/getAdmin", async() => {
    try {
        const config = {
            withCredentials: true,
        }
        const { data } = await axios.get(`${server}/api/v1/admin/`, config)
        return data.admin;
    } 
    catch (error) {
        throw error.message.data.message;
    }
})

const adminLogout = createAsyncThunk("/admin/logout", async() => {
    try {
        const config = {
            withCredentials: true,
        }
        const { data } = await axios.post(`${server}/api/v1/admin/logout`, null, config);
        return data.message;
    }
    catch (error){
        throw error.message.data.message;
    }
})

export { adminLogin, getAdmin, adminLogout };