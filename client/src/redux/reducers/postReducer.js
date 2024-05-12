import {
  RECENT_POSTS,
  CLEAR_RECENT_POSTS,
  PROFILE_POSTS,
  USER_PROFILE_DETAILS,
  POST_USER_PROFILE_DETAILS,
} from './types';

const initialState = {
  recentPosts: [],
  profilePosts: {},
};

export const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case RECENT_POSTS:
      return { ...state, recentPosts: action.payload };

    case USER_PROFILE_DETAILS:
      return { ...state, userProfileDetails: action.payload };

    case POST_USER_PROFILE_DETAILS:
      return { ...state, userProfileDetails: action.payload };

    case PROFILE_POSTS:
      return { ...state, profilePosts: action.payload };

    case CLEAR_RECENT_POSTS:
      return {
        ...state,
        recentPosts: [],
        profilePosts: {},
        chatStatus: false,
      };

    default:
      return state;
  }
};
