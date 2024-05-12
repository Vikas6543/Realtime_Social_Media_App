import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import userCode from '../assets/user-code.jpg'
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

const RegisterPage = () => {
  const [inputValues, setInputValues] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');

  const cloudinaryApiKey = process.env.REACT_APP_CLOUDINARY_NAME

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setInputValues({
      ...inputValues,
      [name]: value
    })
  }

  // upload image to cloudinary
  const uploadImage = async (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'test_app');
    data.append('cloud_name', cloudinaryApiKey);
    try {
      setLoading(true);
      const response = await axios
        .post(
          `https://api.cloudinary.com/v1_1/${cloudinaryApiKey}/image/upload`,
          data
        );
      setProfilePicUrl(response?.data?.secure_url);
      setSelectedImage(response?.data?.secure_url);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // handle form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const data = {
      name: inputValues.name,
      email: inputValues.email,
      password: inputValues.password,
      profilePicUrl: profilePicUrl
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        '/users/register',
        data
      );

      if (response) {
        navigate('/login');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-4/6 shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

      {/* left side image */}
      <div className="hidden lg:flex items-center justify-center flex-1 bg-white text-black">
        <div className="max-w-md text-center">
          <section className='login-brand-name'>
            ViksChat
          </section>
          <p className='brand-name-subtitle'>
            where we meet new people and connect with them
          </p>
          <img src={userCode} alt="user code" className="mb-8" />
        </div>
      </div>

      {/* right side login inputs */}
      <div className="w-full bg-gray-100 lg:w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <section className='mb-10 text-center'>
            <p className='text-3xl font-bold'>Register</p>
          </section>

          {/* register form */}
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            {/* name */}
            <div>
              <input
                placeholder='Name'
                type="text"
                id="name"
                name="name"
                value={inputValues.name}
                onChange={handleChange}
                className="mt-1 p-2 w-full border-2 rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300" />
            </div>

            {/* email */}
            <div>
              <input
                placeholder='Email'
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

            {/* file picker */}
            <div className='my-5'>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-white pl-2" htmlFor="file_input">Profile Picture - Optional</label>

              <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white p-2 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" accept='image/*'
                name='profilePic' type="file" onChange={uploadImage} />
            </div>

            {/* selected image */}
            {selectedImage && (
              <div className='flex justify-center relative'>
                <img src={selectedImage} alt="Selected Image" className='w-32 object-cover rounded-md' />
              </div>
            )}

            {/* register button */}
            <section className='pt-3'>
              <button type="submit" className={`w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black  focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300 text-lg flex gap-3 justify-center ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`} disabled={loading}>
                {loading && <CircularProgress size={20} sx={{ color: 'white' }} />}
                <p>
                  {loading ? 'Please Wait...' : 'Register'}
                </p>
              </button>
            </section>
          </form>

          <div className="mt-10 text-sm text-gray-600 text-center">
            <Link to="/login">Already have an account? <span href="#" className="text-black hover:underline font-bold">Login Now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage