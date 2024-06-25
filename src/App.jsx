import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LayoutLoader } from './components/layout/Loaders';
import { SocketProvider } from "./socket";
import ProtectRoute from "./components/auth/ProtectRoute";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import { server } from './components/constants/config';
import { userExists, userNotExists } from './redux/reducers/auth';
import { Toaster } from 'react-hot-toast';

const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const Chat = lazy(() => import("./pages/Chat"));
const Room = lazy(() => import("./pages/Room"));
const Groups = lazy(() => import("./pages/Groups"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLogin = lazy(() => import("./pages/admin/adminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManage = lazy(() => import("./pages/admin/UserManage"));
const ChatManage = lazy(() => import("./pages/admin/ChatManage"));
const MessageManage = lazy(() => import("./pages/admin/MessageManage"));

const App = () => {

  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(`${server}/api/v1/user/me`, { withCredentials: true })
      .then(({ data }) => dispatch(userExists(data.user)))
      .catch((err) => dispatch(userNotExists()));
  }, [dispatch])

  return (
    <BrowserRouter>
      <Suspense fallback = {<LayoutLoader/>}>
        <Routes>
          <Route element = {
            <SocketProvider>
              <ProtectRoute user = {user}/>
            </SocketProvider>
          }>
            <Route path = '/' element = {<Home/>} />
            <Route path = '/chat/:chatId' element = {<Chat/>} />
            <Route path = '/groups' element = {<Groups/>} />
            <Route path = '/room' element = {<Room/>} />
          </Route>
          <Route path = '/login' element = {
            <ProtectRoute user = {!user} redirect = "/">
              <Login/>
            </ProtectRoute>}>
          </Route>

          <Route path = '/admin' element = {<AdminLogin/>} />
          <Route path = '/admin/dashboard' element = {<Dashboard/>} />
          <Route path = '/admin/user-management' element = {<UserManage/>} />
          <Route path = '/admin/chat-management' element = {<ChatManage/>} />
          <Route path = '/admin/message-management' element = {<MessageManage/>} />

          <Route path = "*" element = {<NotFound/>} />
        </Routes>
      </Suspense>

      <Toaster position='bottom-center' />
    </BrowserRouter>
  )
}

export default App;
