import { Skeleton } from '@mui/material';
import React from 'react';

const ChatList = ({ chatListUsers, loading, selectedChat, setSelectedChat, onlineUsers }) => {
  return (
    <>
      <p className='font-bold text-md lg:text-xl text-gray-700 border-b cursor-pointer py-[15px] px-[20px] bg-white'>Friends</p>

      {loading ? (
        Array(6).fill(0).map((_, index) => (
          <section key={index} className='flex items-center gap-4 p-3'>
            <Skeleton animation="wave" variant="circular" width={40} height={40} />
            <Skeleton
              animation="wave"
              height={20}
              width="60%"
              style={{ marginBottom: 6 }}
            />
          </section >
        ))
      ) : (
        <>
          {chatListUsers?.map((chat, index) => (
            <div key={index} className={`flex items-center gap-4 cursor-pointer border-b-2 md:border-b-0 ml-2 mt-2 hover:bg-gray-200 p-3 rounded-md relative ${chat?._id === selectedChat?._id ? 'bg-gray-300' : ''
              }`} onClick={() => {
                setSelectedChat(chat)
              }}>
              <img
                src={chat.profilePicUrl}
                alt='profile'
                className='w-10 h-10 rounded-full'
              />
              <p className='hidden md:block font-bold text-md text-gray-700'>{chat.name}</p>
              {onlineUsers?.includes(chat._id) && <span className='bg-green-500 text-white rounded-full w-2 h-2 flex justify-center items-center text-xs absolute top-3 left-10'></span>}
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default ChatList;
