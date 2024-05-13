import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { CLEAR_AUTH_STATE, CLEAR_RECENT_POSTS, CLEAR_SOCKET_STATE } from '../redux/reducers/types';

const links = [
  {
    name: 'Home',
    icon: <i className='fa-solid fa-house text-xl'></i>,
    url: '/',
  },
  {
    name: 'Chats',
    icon: <i className='fa-solid fa-message text-xl'></i>,
    url: '/chats',
  },
  {
    name: 'Profile',
    icon: <i className='fa-solid fa-user text-xl'></i>,
    url: '/profile',
  },
  {
    name: 'Logout',
    icon: <i className='fa-solid fa-right-from-bracket text-xl'></i>,
    url: '',
  },
];

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state) => state?.auth?.userDetails);

  const handleLinks = (name) => {
    if (name === 'Logout') {
      dispatch({ type: CLEAR_AUTH_STATE });
      dispatch({ type: CLEAR_RECENT_POSTS });
      dispatch({ type: CLEAR_SOCKET_STATE });
      window.location.href = '/login';
    }
  };

  return (
    <div>
      {/* user name & email */}
      <section className='sidebar-user'>
        <img
          src={loggedInUser?.user.profilePicUrl}
          alt='profile-user'
          className='w-11 h-11 rounded-full'
        />
        <div>
          <p className='font-bold text-[16px]'>
            {loggedInUser?.user?.name}
          </p>
          <p className='text-xs'>
            {loggedInUser?.user?.email}
          </p>
        </div>
      </section>

      {/* sidebar menus */}
      <section className='sidebar-menus'>
        {links.map((link, index) => {
          return (
            <Link
              to={link.url}
              className={`flex items-center gap-3 mb-4 cursor-pointer sidebar-menu-links ${location.pathname === link.url ? 'active-link' : ''
                }`}
              key={index}
              onClick={() => handleLinks(link.name)}
            >
              <p>{link.icon}</p>
              <p className='text-xl'>{link.name}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default Sidebar;
