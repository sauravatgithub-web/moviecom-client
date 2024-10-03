import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOtp: false,
    isNewGroup: false,
    isAddMember: false,
    isNotification: false,
    isMobile: false,
    isSearch: false,
    isFileMenu: false,
    isDeleteMenu: false,
    isProfile: false,
    isChatProfile: false,
    isVideo: false,
    showVideo: false,
    uploadingLoader: false,
    selectedDeleteChat: {
        id: "",
        groupChat: false,
    },
    displayDialog: false,
    calling: true,
    isMovie: false,
    showMovie: false,
}

const miscSlice = createSlice({
    name: "misc",
    initialState,
    reducers: {
        setIsOtp: (state, action) => {
            state.isOtp = action.payload;
        },
        setIsNewGroup: (state, action) => {
            state.isNewGroup = action.payload;
        },
        setIsAddMember: (state, action) => {
            state.isAddMember = action.payload;
        },
        setIsNotification: (state, action) => {
            state.isNotification = action.payload;
        },
        setIsMobile: (state, action) => {
            state.isMobile = action.payload;
        },
        setIsSearch: (state, action) => {
            state.isSearch = action.payload;
        },
        setIsFileMenu: (state, action) => {
            state.isFileMenu = action.payload;
        },
        setIsDeleteMenu: (state, action) => {
            state.isDeleteMenu = action.payload;
        },
        setIsProfile: (state, action) => {
            state.isProfile = action.payload;
        },
        setIsChatProfile: (state, action) => {
            state.isChatProfile = action.payload;
        },
        setIsVideo: (state, action) => {
            state.isVideo = action.payload;
        },
        setShowVideo: (state, action) => {
            state.showVideo = action.payload;
        },
        setUploadingLoader: (state, action) => {
            state.uploadingLoader = action.payload;
        },
        setSelectedDeleteChat: (state, action) => {
            state.selectedDeleteChat = action.payload;
        },
        setDisplayDialog: (state, action) => {
            state.displayDialog = action.payload;
        },
        setCalling: (state, action) => {
            state.calling = action.payload;
        },
        setIsMovie: (state, action) => {
            state.isMovie = action.payload;
        },
        setShowMovie: (state, action) => {
            state.showMovie = action.payload;
        }
    }
});

export default miscSlice;
export const { 
    setIsOtp,
    setIsNewGroup, 
    setIsAddMember,
    setIsNotification,
    setIsMobile,
    setIsSearch,
    setIsFileMenu,
    setIsDeleteMenu,
    setIsProfile,
    setIsChatProfile,
    setIsVideo,
    setShowVideo,
    setUploadingLoader,
    setSelectedDeleteChat,
    setDisplayDialog,
    setCalling,
    setIsMovie,
    setShowMovie
} = miscSlice.actions;