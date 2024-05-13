import React, { useEffect, useRef } from 'react';
import moment from 'moment';
import { Button } from '@mui/material';

const MessageBox = ({ dbMessages, loggedInUser, selectedChat, onlineUsers, handleSendMessage, inputText, setInputText, handleTyping, isTyping }) => {
  const messagesEndRef = useRef(null);

  const messageTimeFormat = (time) => {
    let newTime = moment(time).fromNow()

    if (newTime.includes('seconds')) {
      newTime = newTime.replace('seconds', 'sec')
    }

    if (newTime.includes('minute')) {
      newTime = newTime.replace('minute', 'min')
    }

    if (newTime.includes('hour')) {
      newTime = newTime.replace('hour', 'hr')
    }

    return newTime
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [dbMessages]);

  return (
    <main>
      {/* message box header */}
      <section className='bg-white flex items-center gap-3 pl-6 py-3 border-b cursor-pointer'>
        <img
          src={selectedChat?.profilePicUrl}
          alt='profile'
          className='w-10 h-10 rounded-full'
        />
        <div className='font-bold text-xl text-gray-700'>
          {selectedChat?.name}
          {onlineUsers?.includes(selectedChat._id) && (
            <p className='text-xs text-gray-500'>
              Online
            </p>
          )}
        </div>
      </section>

      {/* message box body */}
      <section className='messages'>
        {dbMessages.length > 0 ? (
          <div className='mb-10'>
            {dbMessages?.map((message, index) => (
              <div key={index} className={`mb-5 flex justify-${loggedInUser?.user._id === message.senderId ? 'end' : 'start'}`}>
                <div className={`p-3 shadow-lg rounded-xl ${loggedInUser?.user._id === message.senderId ? 'primary-bg-color text-white max-w-96' : 'bg-white text-gray-700 max-w-96'}`}>
                  <p style={{ wordBreak: 'break-all' }}>{message.textMessage}</p>
                  <p className='text-xs flex justify-end pt-2'>{messageTimeFormat(message.createdAt)}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className='w-full h-full flex justify-center items-center'>
            <p>Start Messaging Now</p>
          </div>
        )}
      </section>

      {/* message box footer */}
      <section className='flex items-center'>
        <input type='text' value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={handleTyping} placeholder='Type a message' className='p-3 text-input flex-1' />

        <Button onClick={handleSendMessage}>
          <i className="fa-regular fa-paper-plane text-3xl bg-gray-800 py-2 px-4 text-white cursor-pointer"></i>
        </Button>
      </section>
    </main>

  )
};

export default MessageBox;
