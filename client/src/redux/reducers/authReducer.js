import {
  REGISTER_SUCCESS,
  LOGIN_SUCCESS,
  LOGOUT,
  CLEAR_AUTH_STATE,
} from './types';

const initialState = {
  userDetails: null,
};

export const authReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      return {
        ...state,
        userDetails: payload,
      };
    case LOGOUT:
      return {
        ...state,
        userDetails: null,
      };
    case CLEAR_AUTH_STATE:
      return {
        userDetails: null,
      };
    default:
      return state;
  }
};
