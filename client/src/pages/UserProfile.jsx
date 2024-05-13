import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { CircularProgress, Tooltip } from '@mui/material';
import { LOGIN_SUCCESS } from '../redux/reducers/types';

const UserProfile = () => {
    const [posts, setPosts] = useState([]);
    const [profileDetails, setProfileDetails] = useState({});
    const [loading, setIsLoading] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loggedInUser = useSelector((state) => state?.auth?.userDetails);
    const recentPosts = useSelector((state) => state.post?.recentPosts);

    // get user profile deatils
    const getProfileDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                `/users/profile/${id}`, {
                headers: {
                    Authorization: loggedInUser?.token,
                },
            }
            );
            if (response) {
                setProfileDetails(response?.data?.user);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    // update loggedin user deatils after following or unfollowing
    const updateLoggedInUserDetails = async () => {
        try {
            setFollowLoading(true);
            const response = await axiosInstance.get(
                '/users/profile', {
                headers: {
                    Authorization: loggedInUser?.token,
                },
            }
            );
            setFollowLoading(false);
            dispatch({ type: LOGIN_SUCCESS, payload: response?.data });
        } catch (error) {
            setFollowLoading(false);
            console.log(error);
        }
    };

    // follow & unfollow
    const followHandler = async (userId) => {
        try {
            setFollowLoading(true);
            const response = await axiosInstance.put(
                `/users/follow/${userId}`, {}, {
                headers: {
                    Authorization: loggedInUser?.token,
                },
            }
            );
            setFollowLoading(false);
            if (response) {
                getProfileDetails();
                updateLoggedInUserDetails();
            }
        } catch (error) {
            setFollowLoading(false);
            console.log(error);
        }
    };

    useEffect(() => {
        getProfileDetails();
    }, [])

    useEffect(() => {
        const filteredPosts = recentPosts?.filter((post) => {
            return post.postOwner._id === profileDetails?._id
        });
        setPosts(filteredPosts);
    }, [profileDetails]);

    return (
        <main className='lg:w-[62%] mx-4 lg:mx-0'>
            <div>
                <Tooltip title='Go Back'>
                    <i className='fa-solid mb-4 fa-arrow-left text-3xl cursor-pointer' onClick={() => navigate(-1)}></i>
                </Tooltip>
            </div>
            {loading ? (<CircularProgress size={40} sx={{ color: 'gray', position: 'absolute', top: '40%', left: '60%', transform: 'translate(-50%, -50%)' }} />) : (
                <>
                    <div className='flex items-center lg:justify-between'>
                        {/* profile image & name */}
                        <section className='flex items-center gap-10'>
                            <img
                                src={profileDetails?.profilePicUrl}
                                alt='profile'
                                className='lg:w-36 lg:h-36 w-20 h-20 rounded-full'
                            />
                            <div>
                                <p className='lg:text-4xl text-2xl font-bold'>
                                    {profileDetails?.name}
                                </p>

                                {/* follow, unFollow & message */}
                                <div className='lg:mt-4 mt-2'>
                                    {profileDetails?.followers?.includes(loggedInUser?.user?._id) ? (
                                        <>
                                            <button
                                                className={
                                                    followLoading
                                                        ? 'bg-blue-300 text-white rounded-lg text-sm py-2 px-2 lg:mx-3 mx-1'
                                                        : 'bg-blue-500 text-white rounded-lg text-sm py-2 px-3 lg:mx-3 mx-1'
                                                }
                                                style={{ fontWeight: '500' }}
                                                onClick={() => followHandler(profileDetails?._id)}
                                            >
                                                Unfollow
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className={
                                                    followLoading
                                                        ? 'bg-blue-300 text-white rounded-lg text-sm py-2 px-3 lg:mx-3 mx-1'
                                                        : 'bg-blue-500 text-white rounded-lg text-sm py-2 px-3 lg:mx-3 mx-1'
                                                }
                                                style={{ fontWeight: '500' }}
                                                onClick={() => followHandler(profileDetails?._id)}
                                            >
                                                Follow
                                            </button>
                                        </>
                                    )}

                                    <button
                                        className='bg-white rounded-lg text-sm py-2 px-3 border border-gray-300'
                                        style={{ fontWeight: '500' }}
                                    >
                                        Message
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* profile stats */}
                    <section className='flex mt-8 mb-10 border-t border-b py-3 justify-between lg:px-12 px-4'>
                        {/* Posts */}
                        <section className='cursor-pointer'>
                            <p className='lg:text-[15px]'>
                                Posts
                            </p>
                            <p
                                className='text-center font-medium text-gray-600 pt-1 text-lg'
                                style={{ fontWeight: '500' }}
                            >
                                {posts?.length}
                            </p>
                        </section>

                        {/* Followers */}
                        <section className='cursor-pointer'>
                            <p className='lg:text-[15px]'>
                                Followers
                            </p>
                            <p
                                className='text-center font-medium text-gray-600 pt-1 text-lg'
                                style={{ fontWeight: '500' }}
                            >
                                {profileDetails?.followers?.length}
                            </p>
                        </section>

                        {/* Following */}
                        <section className='cursor-pointer'>
                            <p className='lg:text-[15px]'>
                                Following
                            </p>
                            <p
                                className='text-center font-medium text-gray-600 pt-1 text-lg'
                                style={{ fontWeight: '500' }}
                            >
                                {profileDetails?.following?.length}
                            </p>
                        </section>
                    </section>

                    {/* posts */}
                    <section className='grid grid-cols-12 gap-8 mb-5'>
                        {posts?.map((post, index) => (
                            <div
                                key={index}
                                className='col-span-6 md:col-span-4 mr-3 cursor-pointer shadow-lg'
                            >
                                <img
                                    src={post.imageUrl}
                                    alt='post'
                                    className='profile-post-image'
                                />
                            </div>
                        ))}
                    </section>
                </>
            )}
        </main>
    )
}

export default UserProfile