import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RECENT_POSTS } from '../../redux/reducers/types';
import axiosInstance from '../../api/axiosInstance';
import { Box, Modal, Typography } from '@mui/material';
import CommentsList from './CommentsList';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client'

const commentsModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'rgb(255, 255, 255)',
  border: 'none',
  boxShadow: 24,
  paddingTop: '1.8rem',
  paddingBottom: '0',
  paddingLeft: '1.8rem',
  maxHeight: '55vh',
  overflowY: 'auto',
  overflowX: 'hidden',

  '@media (max-width: 700px)': {
    width: '94%',
    paddingTop: '1rem',
    paddingLeft: '1rem',
  },
};

const deleteModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'rgb(255, 255, 255)',
  border: 'none',
  boxShadow: 24,
  p: 4,

  '@media (max-width: 700px)': {
    width: '95%',
    paddingTop: '1rem',
    paddingLeft: '1rem',
  },
};

const Dashboard = ({ post, loggedInUser, recentPosts, getRecentPosts }) => {
  const [animateOnLike, setAnimateOnLike] = useState(false);
  const [commentsModal, setCommentsModal] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState('');
  const [menuListDropDown, setMenuListDropDown] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deletePostId, setDeletePostId] = useState('')
  const [loading, setLoading] = useState(false)

  const socket = useSelector((state) => state?.chat?.socketConnection);

  const dispatch = useDispatch();
  const navigate = useNavigate()
  const menuListRef = useRef()

  // like & unlike function
  const likeUnlikeHandler = async (postId) => {
    const postIndex = recentPosts.findIndex((post) => post._id === postId);
    const post = recentPosts[postIndex];
    const likedByUser = post.likes.includes(loggedInUser?.user?._id);

    // Update the post's like count optimistically
    const newPost = {
      ...post,
      likes: likedByUser
        ? post.likes.filter((id) => id !== loggedInUser?.user?._id)
        : [...post.likes, loggedInUser?.user?._id],
    };
    setAnimateOnLike(true);
    setTimeout(() => {
      setAnimateOnLike(false);
    }, 800);

    const newRecentPosts = [...recentPosts];
    newRecentPosts[postIndex] = newPost;
    dispatch({ type: RECENT_POSTS, payload: newRecentPosts });

    try {
      const response = await axiosInstance.put(
        `posts/like/${postId}`, {}, {
        headers: {
          Authorization: loggedInUser?.token
        }
      }
      );

      if (response?.data?.notifications) {
        const notifications = {
          _id: response?.data?.notifications._id,
          senderId: {
            _id: loggedInUser?.user?._id,
            name: loggedInUser?.user?.name,
            profilePicUrl: loggedInUser?.user?.profilePicUrl,
          },
          receiverId: response?.data?.notifications.receiverId,
          message: response?.data?.notifications.message,
          isRead: response?.data?.notifications.isRead,
          createdAt: response?.data?.notifications.createdAt,
          updatedAt: response?.data?.notifications.updatedAt,
        }

        socket.emit('sendLikedNotification', notifications)
      }

    } catch (error) {
      console.log(error);
    }
  }

  // comment function
  const commentHandler = async (postId) => {
    setCommentsPostId(postId);
    setCommentsModal(true);
  }

  // delete post function
  const openDeleteModalHandler = async (postId) => {
    setDeleteModal(true)
    setDeletePostId(postId)
  }

  // delete post function
  const deletePostHandler = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.delete(`posts/${deletePostId}`, {
        headers: {
          Authorization: loggedInUser?.token
        }
      })

      if (response) {
        setLoading(false)
        getRecentPosts()
        setDeleteModal(false)
        setDeletePostId('')
      }

    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  // Function to close menu list when clicked outside
  const handleCloseMenuList = (event) => {
    if (menuListRef.current && !menuListRef.current.contains(event.target)) {
      setMenuListDropDown(false);
    }
  };

  // get user profile by id
  const goToProfileDetailPage = (id) => {
    if (id === loggedInUser?.user?._id) {
      return navigate('/profile');
    } else {
      navigate(`/userProfile/${id}`);
    }
  };

  // close menu list when click outside of it
  useEffect(() => {
    if (menuListDropDown) {
      document.addEventListener('mousedown', handleCloseMenuList);
    } else {
      document.removeEventListener('mousedown', handleCloseMenuList);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleCloseMenuList);
    };
  }, [menuListDropDown]);

  return (
    <div className='dashboard-wrappper mb-10'>
      {/* post header */}
      <section className='flex items-center justify-between px-4 py-5'>
        {/* profilen image & name */}
        <div className='flex items-center gap-2 cursor-pointer' onClick={() => goToProfileDetailPage(post.postOwner._id)}>
          <img
            src={post.postOwner.profilePicUrl}
            alt='profile'
            className='w-10 h-10 rounded-full'
          />
          <p className='font-bold text-xl text-gray-700'>
            {post.postOwner.name}
          </p>
        </div>

        {/* menu list */}
        <div className='relative'>
          <i onClick={() => setMenuListDropDown(!menuListDropDown)} className='text-2xl fa-solid fa-ellipsis cursor-pointer'></i>

          {menuListDropDown && (
            <div className='absolute border top-7 right-0 bg-white shadow-md rounded w-32 p-1' ref={menuListRef}>
              {post.postOwner._id === loggedInUser?.user._id && (
                <div className='flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded p-2' onClick={() => openDeleteModalHandler(post._id)}><i className="fa-solid fa-trash"></i> <p>Delete</p></div>
              )}
              <div className='flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded p-2'><i className="fa-solid fa-star"></i>
                <p>Save</p></div>
            </div>
          )}
        </div>
      </section>

      {/* post image */}
      <section onDoubleClick={() => likeUnlikeHandler(post._id)}>
        <img src={post.imageUrl} alt='profile' className='post-image cursor-pointer' />
      </section>

      {/* post footer */}
      <section className='flex items-center justify-between px-5 py-5'>
        <div className='flex gap-5'>
          {/* like and unlike icon */}
          <div className='flex flex-col items-center'>
            <div onClick={() => likeUnlikeHandler(post._id)}>
              {post?.likes.includes(loggedInUser?.user._id) ? (
                <i className={`fa-solid fa-heart text-2xl text-red-500 cursor-pointer ${animateOnLike ? 'animate-ping' : ''}`}></i>
              ) : (
                <i className={`fa-regular fa-heart text-2xl cursor-pointer`}></i>
              )}
            </div>
            <p className='text-gray-700 text-xs'>
              <span className='text-xs font-semibold'>{post?.likes.length > 0 ? post?.likes.length : ''}</span>
              {post?.likes.length > 0 && (
                post?.likes.length > 1 ? ' likes' : ' like'
              )}
            </p>
          </div>

          {/* comment icon */}
          <div className='flex flex-col items-center' onClick={() => commentHandler(post._id)} >
            <i className='fa-regular fa-comment text-2xl cursor-pointer'></i>
            <p className='text-gray-700 text-xs'>
              <span className='text-xs font-semibold'>{post?.comments.length > 0 ? post?.comments.length : ''}</span>
              {post?.comments.length > 0 && (
                post?.comments.length > 1 ? ' comments' : ' comment'
              )}
            </p>
          </div>
        </div>

        {/* bookmark icon */}
        <div>
          <i className='fa-regular fa-bookmark text-2xl cursor-pointer'></i>
        </div>
      </section>

      {/* comments modal */}
      <Modal
        open={commentsModal}
        onClose={() => setCommentsModal(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={commentsModalStyle}>
          <CommentsList
            recentPosts={recentPosts}
            commentPostId={commentsPostId}
            post={post}
            loggedInUser={loggedInUser}
          />
        </Box>
      </Modal>

      {/* delete post modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={deleteModalStyle}>
          <Typography
            id='modal-modal-description'
            sx={{ mt: 1, mb: 3 }}
          >
            <span className='text-lg'>
              Are you sure you want to delete this post?
            </span>
          </Typography>
          <section className='float-right'>
            <button
              className='bg-red-500 text-white px-4 py-2 rounded-lg'
              onClick={() => setDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              className='bg-green-500 text-white px-4 py-2 rounded-lg ml-4'
              onClick={() => deletePostHandler(post._id)}
            >
              {loading ? (
                <i className='fas fa-spinner fa-spin px-4 text-lg'></i>
              ) : (
                'Delete'
              )}
            </button>
          </section>
        </Box>
      </Modal>
    </div>
  )
};

export default Dashboard;
