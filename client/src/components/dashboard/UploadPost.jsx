import { Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RECENT_POSTS } from '../../redux/reducers/types';
import axiosInstance from './../../api/axiosInstance';

const UploadPost = ({ handleClose, onLoadingChange }) => {
    const [selectedImage, setSelectedImage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const cloudinaryApiKey = process.env.REACT_APP_CLOUDINARY_NAME

    const dispatch = useDispatch();
    const loggedInUser = useSelector((state) => state?.auth?.userDetails);

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        setSelectedImage(URL.createObjectURL(file));
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'test_app');
        data.append('cloud_name', cloudinaryApiKey);
        setIsLoading(true);
        onLoadingChange(true);
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryApiKey}/image/upload`,
            {

                method: 'POST',
                body: data,
            }
        );
        const res = await response.json();
        setImageUrl(res.secure_url);
        setIsLoading(false);
        onLoadingChange(false);
    };

    const uploadHandler = async () => {
        try {
            const response = await axiosInstance.post(
                '/posts',
                {
                    imageUrl,
                },
                {
                    headers: {
                        Authorization: loggedInUser?.token
                    }
                }
            );
            if (response) {
                handleClose();
                try {
                    const response = await axiosInstance.get(
                        '/posts', {
                        headers: {
                            Authorization: loggedInUser?.token
                        }
                    }
                    );
                    if (response) {
                        dispatch({ type: RECENT_POSTS, payload: response?.data.posts });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <Typography variant='h5' className='pb-6 text-center'>
                Upload New Post
            </Typography>

            {/* upload form */}
            <form>
                <div className='mb-5'>
                    <input
                        type='file'
                        id='image'
                        name='image'
                        onChange={handleImageChange}
                        className='block w-full border rounded-md shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 cursor-pointer'
                    />
                </div>
                {selectedImage && (
                    <div className='my-4 flex justify-center'>
                        <img
                            src={selectedImage}
                            alt='Selected image'
                            className='selectedUploadImage'
                        />
                    </div>
                )}
            </form>
            {/* upload button */}
            <section className='mt-6'>
                {imageUrl ? (
                    <button className='custom-button' onClick={uploadHandler}>
                        {isLoading ? (
                            <div className='flex items-center justify-center '>
                                <div className='w-6 h-6 border-b-2 border-gray-100 rounded-full animate-spin'></div>
                            </div>
                        ) : (
                            <span>Upload</span>
                        )}
                    </button>
                ) : (
                    <Tooltip title='Please choose an image' placement='top'>
                        <button className='custom-button-disabled'>
                            {isLoading ? (
                                <div className='flex items-center justify-center '>
                                    <div className='w-6 h-6 border-b-2 border-gray-100 rounded-full animate-spin'></div>
                                </div>
                            ) : (
                                <span className='font-bold'>Upload</span>
                            )}
                        </button>
                    </Tooltip>
                )}
            </section>
        </>
    );
};

export default UploadPost;
