import { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import RootLayout from './components/RootLayout';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Dashboard from './pages/DashboardPage';
import Chat from './pages/ChatPage';
import Profile from './pages/ProfilePage';
import Settings from './pages/SettingsPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserProfile from './pages/UserProfile';
import io from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/' element={<RootLayout />}>
        <Route index element={<Dashboard />} />
        <Route path='/chats' element={<Chat />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/userProfile/:id' element={<UserProfile />} />
        <Route path='/settings' element={<Settings />} />
      </Route>
    </>
  )
);

function App() {
  const loggedInUser = useSelector((state) => state?.auth?.userDetails);
  const dispatch = useDispatch();

  // socket connection
  useEffect(() => {
    if (loggedInUser) {
      const socketConnection = io(
        'https://realtime-social-media-app.onrender.com/',
        {
          query: { userId: loggedInUser?.user._id },
        }
      );
      dispatch({ type: 'SOCKET_CONNECTION', payload: socketConnection });

      socketConnection.on('getOnlineUsers', (users) => {
        const onlineUsers = users?.map((user) => user.userId);
        dispatch({ type: 'ONLINE_USERS', payload: onlineUsers });
      });

      return () => {
        socketConnection.close();
      };
    }
  }, []);

  return (
    <>
      <ToastContainer autoClose={2000} />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
