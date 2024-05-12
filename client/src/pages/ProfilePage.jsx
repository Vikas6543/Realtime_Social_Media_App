import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfilePosts from '../components/profile/Posts';
import ProfileStats from '../components/profile/Stats';
import ProfileFollowers from '../components/profile/Followers';
import ProfileFollowing from '../components/profile/Following';
import axiosInstance from './../api/axiosInstance';
import {
  PROFILE_POSTS,
  USER_PROFILE_DETAILS
} from '../redux/reducers/types';

const ProfilePage = () => {
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowersLoading, setIsFollowersLoading] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [postsTab, setPostsTab] = useState(true);
  const [followersTab, setFollowersTab] = useState(false);
  const [followingTab, setFollowingTab] = useState(false);

  const loggedInUser = useSelector((state) => state?.auth?.userDetails);
  const recentPosts = useSelector((state) => state.post?.recentPosts);
  const profilePosts = useSelector((state) => state.post?.profilePosts);

  const dispatch = useDispatch();

  const openPostsTab = () => {
    setPostsTab(true);
    setFollowersTab(false);
    setFollowingTab(false);
  };

  const openFollowersTab = () => {
    setFollowersTab(true);
    setPostsTab(false);
    setFollowingTab(false);
  };

  const openFollowingTab = () => {
    setFollowingTab(true);
    setPostsTab(false);
    setFollowersTab(false);
  };

  // get my profile details
  const getProfileDetails = async () => {
    try {
      const response = await axiosInstance.get(
        '/users/profile', {
        headers: {
          Authorization: loggedInUser?.token
        },
      }
      );
      dispatch({ type: PROFILE_POSTS, payload: response?.data.user });
      dispatch({
        type: USER_PROFILE_DETAILS,
        payload: response?.data?.user,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // get followers list
  const getFollowersList = async () => {
    try {
      const response = await axiosInstance.get(
        '/users/followers', {
        headers: {
          Authorization: loggedInUser?.token
        },
      }
      );
      setFollowersList(response?.data.followers);
    } catch (error) {
      console.log(error);
    }
  };

  // get following list
  const getFollowingList = async () => {
    try {
      const response = await axiosInstance.get(
        '/users/following', {
        headers: {
          Authorization: loggedInUser?.token
        },
      }
      );
      setFollowingList(response?.data.following);
    } catch (error) {
      console.log(error);
    }
  };

  const unFollowHandler = async (id) => {
    try {
      setIsFollowersLoading(true);
      await axiosInstance.put(
        `/users/follow/${id}`, {}, {
        headers: {
          Authorization: loggedInUser?.token
        },
      }
      );
      setIsFollowersLoading(false);
      getProfileDetails();
      getFollowersList();
      getFollowingList();
    } catch (error) {
      setIsFollowersLoading(false);
      console.log(error);
    }
  };

  const removeFollower = async (id) => {
    try {
      await axiosInstance.put(
        `/users/removeFollower/${id}`, {}, {
        headers: {
          Authorization: loggedInUser?.token
        },
      }
      );
      getProfileDetails();
      getFollowersList();
      getFollowingList();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filteredPosts = recentPosts.filter((post) => {
      return post.postOwner._id === loggedInUser?.user._id
    });
    setMyPosts(filteredPosts);
  }, []);

  useEffect(() => {
    getProfileDetails();
    getFollowersList();
    getFollowingList();
  }, []);

  return (
    <div className='lg:w-8/12 -mt-2'>
      {isLoading ? (
        <div>
          loading
        </div>
      ) : (
        <>
          {/* header top */}
          <div className='flex items-center lg:justify-between'>
            {/* profile image */}
            <section className='flex items-center gap-10'>
              <img
                src={loggedInUser?.user.profilePicUrl}
                alt='profile'
                className='lg:w-36 lg:h-36 w-20 h-20 rounded-full'
              />
              <div>
                <p className='lg:text-4xl text-2xl font-bold'>
                  {profilePosts?.name}
                </p>
                <p className='text-sm pt-2 pl-1 font-semibold text-gray-500'>
                  {profilePosts?.email}
                </p>
              </div>
            </section>
          </div>

          {/* profile stats */}
          <ProfileStats
            profilePosts={profilePosts}
            myPosts={myPosts}
            followersTab={followersTab}
            postsTab={postsTab}
            followingTab={followingTab}
            openPostsTab={openPostsTab}
            openFollowingTab={openFollowingTab}
            openFollowersTab={openFollowersTab}
          />

          {/* all tabs */}
          <div className='mt-8'>
            {postsTab && <ProfilePosts myPosts={myPosts} />}
            {followersTab && (
              <div>
                <ProfileFollowers
                  followersList={followersList}
                  removeFollower={removeFollower}
                />
              </div>
            )}
            {followingTab && (
              <div>
                <ProfileFollowing
                  followingList={followingList}
                  unFollowHandler={unFollowHandler}
                  isFollowersLoading={isFollowersLoading}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
