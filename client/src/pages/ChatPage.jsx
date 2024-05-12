import React, { useEffect, useRef, useState } from 'react';
import ChatList from '../components/chat/ChatList';
import MessageBox from '../components/chat/MessageBox';
import selectChatImage from '../assets/social-community.jpg'
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import io from 'socket.io-client'

const ChatPage = () => {
  const [chatListUsers, setChatListUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const loggedInUser = useSelector((state) => state?.auth?.userDetails);
  const socket = useSelector((state) => state?.chat?.socketConnection);

  // socket states
  // const [socket, setSocket] = useState(null);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState({
    typing: false,
    receiverId: '',
  });

  const [dbMessages, setDbMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const messagesEndRef = useRef(null);

  // get following and followers list
  const getFollowingFollowersList = async () => {
    let combinedLists = []

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        '/users/following',
        {
          headers: {
            Authorization: loggedInUser?.token,
          },
        }
      );
      combinedLists.push(...response?.data.following)
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    try {
      const response = await axiosInstance.get(
        '/users/followers',
        {
          headers: {
            Authorization: loggedInUser?.token,
          },
        }
      );
      combinedLists.push(...response?.data.followers)
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    // Extract unique users based on _id
    const uniqueUsers = Array.from(new Set(combinedLists.map(user => user._id))).map(id => combinedLists.find(user => user._id === id));
    setChatListUsers(uniqueUsers);
  }

  // get messages
  const getMessage = async () => {
    try {
      const { data } = await axiosInstance.get(`/chats/${selectedChat?._id}`, {
        headers: {
          Authorization: loggedInUser?.token
        }
      })

      if (data && Array.isArray(data)) {
        setDbMessages((previousMessage) => [...previousMessage, ...data])
      }

    } catch (error) {
      console.log(error)
    }
  }

  // send message
  const handleSendMessage = async () => {
    try {
      const { data } = await axiosInstance.post(`http://localhost:5000/chats/${selectedChat?._id}`, {
        textMessage: inputText,
      }, {
        headers: {
          Authorization: loggedInUser?.token
        }
      })
      setDbMessages((previousMessage) => [...previousMessage, data])

      if (socket) {
        socket.emit('sendMessage', data);
      }

      setInputText('');

    } catch (error) {
      console.log(error)
    }
  };

  // Function to handle typing event
  const handleTyping = () => {
    let timeout;

    socket.emit('typing', selectedChat._id);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      socket.emit('stopTyping', selectedChat._id);
    }, 1500);
  };

  useEffect(() => {
    getFollowingFollowersList();
  }, []);

  // socket - get messages, typing, stop typing
  useEffect(() => {
    if (socket) {
      socket.on('getOnlineUsers', (message) => {
        setOnlineUsers(message);
      })

      socket.on('getMessage', (message) => {
        setDbMessages((previousMessage) => [...previousMessage, message]);
      });

      // Listen for typing events
      socket.on('typing', (userId) => {
        setIsTyping({ typing: true, receiverId: userId });
      });

      socket.on('stopTyping', (userId) => {
        // Handle stop typing event
        setIsTyping({ typing: false, receiverId: userId });
      });

    }

    return () => {
      if (socket) {
        socket.off('newMessage');
        socket.off('typing');
        socket.off('stopTyping');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (selectedChat?._id) {
      setDbMessages([])
      getMessage()
    }
  }, [selectedChat]);

  // socket connection
  // useEffect(() => {
  //   if (loggedInUser) {
  //     const socketConnection = io('http://localhost:5000', {
  //       query: { userId: loggedInUser?.user._id },
  //     });
  //     setSocket(socketConnection);

  //     socketConnection.on("getOnlineUsers", (users) => {
  //       console.log(users);
  //       setOnlineUsers(users.map((user) => user.userId));
  //     });

  //     return () => {
  //       socketConnection.close()
  //     }
  //   }
  // }, []);

  return (
    <main className="flex chat-wrapper">
      {/* chat list sidebar */}
      <section
        className='w-3/12 bg-white shadow-md'
        style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', height: 'calc(100vh - 100px)' }}
      >
        <ChatList chatListUsers={chatListUsers} onlineUsers={onlineUsers} setSelectedChat={setSelectedChat} selectedChat={selectedChat} loading={loading} />
      </section>

      {/* messages box */}
      <section className='w-9/12'>
        {selectedChat ? <MessageBox dbMessages={dbMessages} loggedInUser={loggedInUser} selectedChat={selectedChat} onlineUsers={onlineUsers} handleSendMessage={handleSendMessage} inputText={inputText} setInputText={setInputText} handleTyping={handleTyping} isTyping={isTyping} /> : (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '70%',
            transform: 'translate(-50%, -50%)',
          }}>
            <img src={selectChatImage} alt="select-chat-image" width="300px" />
            <p className='text-center text-gray-500 mt-4 text-xl'>Select a chat to start messaging</p>
          </div>
        )}
      </section>
    </main>
  )
};

export default ChatPage;
