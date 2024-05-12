import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Modal, Backdrop, Fade } from '@mui/material';
import UploadPost from './dashboard/UploadPost';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import moment from 'moment';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 480,
  bgcolor: 'background.paper',
  boxShadow: 24,
  border: 'none',
  p: 4,

  '@media (max-width: 600px)': {
    width: '95%',
  },
};

const Navbar = () => {
  const [uploadModal, setUploadModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationModal, setNotificationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuListRef = useRef()

  // socket states
  const socket = useSelector((state) => state?.chat?.socketConnection);

  const loggedInUser = useSelector((state) => state?.auth?.userDetails);

  const handleClose = () => { setUploadModal(false) }

  const handleLoadingChange = (loadingState) => {
    setLoading(loadingState)
  }

  // get notifications
  const getNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications', {
        headers: {
          Authorization: loggedInUser?.token
        }
      })

      if (response) {
        setNotifications(response.data.notifications.reverse())
      }

    } catch (error) {
      console.log(error)
    }
  }

  const formatTime = (time) => {
    let formattedTime = moment(time).fromNow()
    if (formattedTime.includes('minutes')) {
      formattedTime = formattedTime.replace('minutes', 'mins')
    } else if (formattedTime.includes('hours')) {
      formattedTime = formattedTime.replace('hours', 'hr')
    } else if (formattedTime.includes('minute')) {
      formattedTime = formattedTime.replace('minute', 'min')
    }
    else if (formattedTime.includes('few')) {
      formattedTime = formattedTime.replace('few', '')
    }
    else if (formattedTime.includes('seconds')) {
      formattedTime = formattedTime.replace('seconds', 'sec')
    }
    else if (formattedTime.includes('second')) {
      formattedTime = formattedTime.replace('second', 'sec')
    }
    else {
      formattedTime = formattedTime
    }

    return formattedTime
  }

  useEffect(() => {
    if (socket) {
      socket.on('getLikedNotification', (data) => {
        console.log(data)
        setNotifications((prev) => [data, ...prev,])
      })
    }
  }, [socket])

  useEffect(() => {
    getNotifications()
  }, [])

  useEffect(() => {
    const handleCloseMenuList = (event) => {
      if (menuListRef.current && !menuListRef.current.contains(event.target)) {
        setNotificationModal(false);
      }
    };

    if (notificationModal) {
      document.addEventListener('mousedown', handleCloseMenuList);
    } else {
      document.removeEventListener('mousedown', handleCloseMenuList);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleCloseMenuList);
    };
  }, [notificationModal]);

  return (
    <main>
      <div className='flex justify-between items-center bg-white navbar-wrapper'>

        {/* brand name */}
        <section>
          <Link to='/' className='app-name'>
            ViksChat
          </Link>
        </section>

        {/* search input */}
        <section className='relative'>
          <input type='text' placeholder='search' className='navbar-input' />
          <i className='fa-solid fa-magnifying-glass absolute left-4 top-3 text-gray-400 text-lg'></i>
        </section>

        {/* upload & notification button & profiler image */}
        <section className='flex gap-8 items-center'>
          {/* upload */}
          <div className='cursor-pointer'>
            <button onClick={() => setUploadModal(true)} className='text-white py-2 px-4 primary-bg-color rounded-lg flex gap-4 items-center'>
              <i className='fa-solid fa-cloud-arrow-up bg-transparent text-white text-md'></i>
              <p className='font-bold text-md'>UPLOAD</p>
            </button>
          </div>

          {/* notification */}
          <div className='relative' onClick={() => setNotificationModal(!notificationModal)}>
            <i className='fa-solid fa-bell text-2xl text-gray-900 cursor-pointer'></i>
            <span className='bg-red-500 text-white rounded-full text-xs w-5 h-5 flex justify-center items-center absolute -top-2 -right-3 font-bold'>
              10
            </span>

            {notificationModal && (
              <div ref={menuListRef} className={`absolute top-12 -right-4 bg-white shadow-md rounded-lg ${notifications?.length > 0 ? 'notification-wrapper p-4' : 'p-5 text-center'}  overflow-y-auto border`} style={{ width: '300px' }}>
                {notifications?.length > 0 ? (
                  <>
                    {notifications?.map((notification) => (
                      <div key={notification?._id} className='notification-content'>
                        <div className='flex gap-4 items-center'>
                          <img src={notification?.senderId?.profilePicUrl} alt='profile' className='w-10 h-10 rounded-full cursor-pointer' />

                          <div>
                            <p className='font-semibold text-sm'>{notification.message}<span className='text-sm'> likes your post</span></p>
                            <p className='text-xs'>
                              {formatTime(notification?.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p>
                    No new notifications...
                  </p>
                )}
              </div>
            )}
          </div>


          {/* profile image */}
          <img
            src={loggedInUser?.user.profilePicUrl}
            alt='profile'
            className='w-10 h-10 rounded-full cursor-pointer'
          />
        </section>
      </div>


      {/* upload modal */}
      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        open={uploadModal}
        onClose={loading ? null : handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={uploadModal}>
          <Box sx={style}>
            <UploadPost
              handleClose={handleClose}
              onLoadingChange={handleLoadingChange}
            />
          </Box>
        </Fade>
      </Modal>
    </main>
  );
};

export default Navbar;
