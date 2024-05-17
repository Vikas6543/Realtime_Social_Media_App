import { useState } from 'react';
import userCode from '../assets/user-code.jpg'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LOGIN_SUCCESS } from '../redux/reducers/types';
import axiosInstance from '../api/axiosInstance';
import { toast } from "react-toastify";
import CircularProgress from '@mui/material/CircularProgress';
import io from 'socket.io-client';

const LoginPage = () => {
  const [inputValues, setInputValues] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setInputValues({
      ...inputValues,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data } = await axiosInstance.post('/users/login', inputValues)

      if (data) {
        const socketConnection = io(
          'http://localhost:5000',
          {
            query: { userId: data?.user._id },
          }
        );

        socketConnection.on('getOnlineUsers', (users) => {
          const onlineUsers = users?.map((user) => user.userId)
          dispatch({ type: 'ONLINE_USERS', payload: onlineUsers });
        });

        dispatch({ type: LOGIN_SUCCESS, payload: data });
        dispatch({ type: 'SOCKET_CONNECTION', payload: socketConnection });
        setLoading(false)
        navigate('/');
      }
    } catch (error) {
      setLoading(false)
      toast.error(error?.response?.data.message);
    }
  }

  return (
    <main>
      <div className="flex w-4/6 shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

        {/* left side image */}
        <div className="hidden lg:flex items-center justify-center flex-1 bg-white text-black">
          <div className="max-w-md text-center">
            <section className='login-brand-name'>
              ViksChat
            </section>
            <img src={userCode} alt="user code" className="mb-8" />
          </div>
        </div>

        {/* right side login inputs */}
        <div className="w-full bg-gray-100 lg:w-1/2 flex items-center justify-center">
          <div className="max-w-md w-full p-6">
            <section className='mb-10 text-center'>
              <p className='text-3xl font-bold'>Login</p>
            </section>

            {/* login form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* email */}
              <div>
                <input placeholder='Email'
                  type="text"
                  id="email"
                  name="email"
                  value={inputValues.email}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border-2 rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300" />
              </div>

              {/* password */}
              <div className='relative'>
                <input
                  placeholder='Password'
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={inputValues.password}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border-2 rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300" />

                {!showPassword ? <i className='fas fa-eye-slash absolute right-3 -translate-y-1/2 cursor-pointer' onClick={() => setShowPassword(!showPassword)} style={{ top: '55%' }}></i> : <i className='fas fa-eye absolute right-3 -translate-y-1/2 cursor-pointer' onClick={() => setShowPassword(!showPassword)} style={{ top: '55%' }}></i>}
              </div>

              {/* login button */}
              <section className='pt-3'>
                <button type="submit" className="w-full bg-black text-white  py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black  focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300 text-lg flex items-center justify-center gap-3">
                  {loading && <CircularProgress size={20} sx={{ color: 'white' }} />}
                  <p>Login</p>
                </button>
              </section>
            </form>

            <div className="mt-10 text-sm text-gray-600 text-center">
              <Link to="/register">Don't have an account? <span href="#" className="text-black hover:underline font-bold">Register Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginPage