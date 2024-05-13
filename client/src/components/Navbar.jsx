import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Modal, Backdrop, Fade } from '@mui/material';
import UploadPost from './dashboard/UploadPost';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import moment from 'moment';
import { CLEAR_AUTH_STATE, CLEAR_RECENT_POSTS } from '../redux/reducers/types';

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

const links = [
  {
    name: 'Home',
    icon: <i className='fa-solid fa-house text-3xl'></i>,
    url: '/',
  },
  {
    name: 'Chats',
    icon: <i className='fa-solid fa-message text-3xl'></i>,
    url: '/chats',
  },
  {
    name: 'Profile',
    icon: <i className='fa-solid fa-user text-3xl'></i>,
    url: '/profile',
  },
  {
    name: 'Logout',
    icon: <i className='fa-solid fa-right-from-bracket text-3xl'></i>,
    url: '',
  },
];

const Navbar = () => {
  const [uploadModal, setUploadModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationModal, setNotificationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBlink, setShowBlink] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuListRef = useRef()
  const mobileMenuRef = useRef()
  const dispatch = useDispatch();

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

  // handle links logout
  const handleLinks = (name) => {
    if (name === 'Logout') {
      dispatch({ type: CLEAR_AUTH_STATE });
      dispatch({ type: CLEAR_RECENT_POSTS });
      window.location.href = '/login';
    }
    setMobileMenuOpen(false)
  };

  useEffect(() => {
    if (socket) {
      socket.on('getLikedNotification', (data) => {
        setShowBlink(true)
        setNotifications((prev) => [data, ...prev,])
      })
    }
  }, [socket])

  useEffect(() => {
    getNotifications()
  }, [])

  // handle notification modal close
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

  // handle mobile menu close
  useEffect(() => {
    const handleCloseMenuList = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleCloseMenuList);
    } else {
      document.removeEventListener('mousedown', handleCloseMenuList);
    }
    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleCloseMenuList);
    };
  }, [mobileMenuOpen]);

  return (
    <main>
      <div className='flex justify-around lg:justify-between items-center bg-white navbar-wrapper py-[14px] lg:px-[20px] px-[0]'>

        {/* brand name */}
        <section>
          <Link to='/' className='app-name text-[20px] lg:text-[30px]'>
            ViksChat
          </Link>
        </section>

        {/* search input */}
        <section className='relative hidden lg:block'>
          <input type='text' placeholder='search' className='navbar-input' />
          <i className='fa-solid fa-magnifying-glass absolute left-4 top-3 text-gray-400 text-lg'></i>
        </section>

        {/* upload & notification button & profiler image */}
        <section className='flex gap-8 items-center'>
          {/* upload */}
          <div className='cursor-pointer'>
            <button onClick={() => setUploadModal(true)} className='text-white py-1 px-3 lg:py-2 lg:px-3 primary-bg-color rounded-lg flex gap-4 items-center'>
              <i className='fa-solid fa-cloud-arrow-up bg-transparent text-white text-md'></i>
              <p className='font-bold text-md'>UPLOAD</p>
            </button>
          </div>

          {/* notification */}
          <div className='relative' onClick={() => {
            setNotificationModal(!notificationModal)
            setShowBlink(false)
          }}>
            <i className='fa-solid fa-bell text-2xl text-gray-900 cursor-pointer'></i>
            {showBlink && (
              <span className='bg-red-500 text-white rounded-full text-xs w-1 h-1 flex justify-center items-center absolute font-bold animate-ping' style={{
                top: 2,
                right: -2
              }}>
              </span>
            )}

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
          <div>
            <i
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='fa-solid fa-bars text-2xl lg:hidden cursor-pointer'
            ></i>
            <img
              src={loggedInUser?.user.profilePicUrl}
              alt='profile'
              className='w-10 h-10 rounded-full cursor-pointer hidden lg:block'
            />
          </div>
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

      {/* mobile sidebar menu */}
      <section ref={mobileMenuRef} className='h-full lg:hidden fixed top-0 bottom-0 z-10 text-white ' style={{ left: mobileMenuOpen ? '0' : '-500px', transition: 'all 0.9s ease', width: '300px', background: 'rgba(0,0,0,0.9)' }}>
        <div className='mt-52 mx-8'>
          {/* close menu button */}
          <i className='fa-solid bg-white text-black py-2 px-3 rounded-lg text-xl fa-x cursor-pointer absolute top-24 right-4' onClick={() => setMobileMenuOpen(!mobileMenuOpen)}></i>

          {/* user name & email */}
          <section className='bg-white text-black flex items-center py-4 rounded-lg gap-6 mb-20 justify-center'>
            <img
              src={loggedInUser?.user.profilePicUrl}
              alt='profile-user'
              className='w-[54px] h-[54px] rounded-full'
            />
            <div>
              <p className='font-bold text-[22px]'>
                {loggedInUser?.user?.name}
              </p>
              <p className='text-lg'>
                {loggedInUser?.user?.email}
              </p>
            </div>
          </section>

          {/* sidebar menus */}
          <section>
            {links.map((link, index) => {
              return (
                <Link
                  to={link.url}
                  className='flex items-center gap-5 mb-20 cursor-pointer'
                  key={index}
                  onClick={() => handleLinks(link.name)}
                >
                  <p>{link.icon}</p>
                  <p className='text-3xl'>{link.name}</p>
                </Link>
              );
            })}
          </section>
        </div>
      </section>
    </main>
  );
};

export default Navbar;
