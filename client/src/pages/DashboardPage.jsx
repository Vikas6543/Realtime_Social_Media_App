import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { RECENT_POSTS } from '../redux/reducers/types';
import Dashboard from '../components/dashboard';
import { CircularProgress, Typography } from '@mui/material';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const loggedInUser = useSelector((state) => state?.auth?.userDetails);
  const recentPosts = useSelector((state) => state?.post?.recentPosts);
  const dispatch = useDispatch();

  const config = {
    headers: {
      Authorization: loggedInUser?.token,
    },
  };

  // get recent posts
  const getRecentPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        '/posts', config
      );
      if (response) {
        dispatch({ type: RECENT_POSTS, payload: response?.data.posts });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecentPosts();
  }, []);

  return (
    <main>
      {loading && <CircularProgress size={40} sx={{ color: 'gray', position: 'absolute', top: '40%', left: '55%', transform: 'translate(-50%, -50%)' }} />}

      {/* recent posts */}
      {recentPosts?.length === 0 && (
        <Typography
          sx={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            position: 'absolute', top: '40%', left: '55%', transform: 'translate(-50%, -50%)',
          }}
        >
          No Posts Found...
        </Typography>
      )}
      {recentPosts?.map((post) => (
        <Dashboard post={post} key={post._id} loggedInUser={loggedInUser} recentPosts={recentPosts} getRecentPosts={getRecentPosts} />
      ))}
    </main>
  );
};

export default DashboardPage;
