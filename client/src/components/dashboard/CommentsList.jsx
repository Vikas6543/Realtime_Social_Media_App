import { Typography } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RECENT_POSTS } from '../../redux/reducers/types';
import moment from 'moment';
import axiosInstance from '../../api/axiosInstance';

const CommentsList = ({ recentPosts, commentPostId, loggedInUser }) => {
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { comments } = recentPosts.find((post) => post._id === commentPostId);

    const sortedComments = comments.sort((a, b) => {
        return new Date(b.createdOn) - new Date(a.createdOn);
    });

    const dispatch = useDispatch();

    const commentSubmitHandler = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.put(
                `/posts/comment/${commentPostId}`,
                {
                    text: comment,
                },
                {
                    headers: {
                        Authorization: loggedInUser?.token
                    }
                }
            );
            setIsLoading(false);
            if (response) {
                setComment('');
                try {
                    const response = await axiosInstance.get(
                        '/posts', { headers: { Authorization: loggedInUser?.token } }
                    );
                    if (response) {
                        dispatch({ type: RECENT_POSTS, payload: response?.data.posts });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    };

    // format time
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

    return (
        <div>
            {/* comment input */}
            <section className='pb-3 md:pb-6'>
                <div className='flex'>
                    <input
                        type='text'
                        className='w-full border border-pink-300 rounded-l-lg px-3 py-3 focus:outline-none focus:ring-1 focus:ring-pink-300'
                        placeholder='Add Comment...'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                        className='primary-bg-color text-white px-4 py-3 rounded-r-lg mr-6'
                        onClick={commentSubmitHandler}
                    >
                        {isLoading ? (
                            <div className='flex items-center justify-center'>
                                <div className='w-6 h-6 border-b-2 border-gray-100 rounded-full animate-spin mx-1'></div>
                            </div>
                        ) : (
                            <span style={{ fontWeight: '500' }}>Post</span>
                        )}
                    </button>
                </div>
            </section>

            {/* comments list */}
            {sortedComments.map((comment) => (
                <main key={comment._id}>
                    <div className='flex py-3 border-b justify-between'>
                        <div className='flex items-center'>
                            {/* profile picture */}
                            <section className='flex-shrink-0 mr-3'>
                                <img
                                    className='md:h-10 md:w-10 w-8 h-8 rounded-full'
                                    src={comment.user.profilePicUrl}
                                    alt='profile_picture'
                                />
                            </section>

                            {/* comment text */}
                            <section>
                                <div className='flex items-center'>
                                    <p className='md:text-md text-md font-bold text-gray-900 pr-3'>{comment.user.name}</p> •
                                    <p className='text-gray-500 ml-3 md:text-[11px] text-xs'>
                                        {formatTime(comment?.createdOn)}
                                    </p>
                                </div>
                                <div
                                    className='pt-1 md:text-[15px] text-xs text-gray-500'
                                    style={{ fontWeight: '500' }}
                                >
                                    {comment?.text}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            ))}
        </div>
    );
};

export default CommentsList;
