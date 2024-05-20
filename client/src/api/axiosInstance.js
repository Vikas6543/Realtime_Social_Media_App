import axios from 'axios';
import { store } from '../redux/store';
import {
  CLEAR_AUTH_STATE,
  CLEAR_RECENT_POSTS,
  CLEAR_SOCKET_STATE,
} from '../redux/reducers/types';

// base url
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_PRODUCTION_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// if response status is 400, 401 than it means that the token has expired and we need to redirect the user to the login page
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 || status === 404) {
        store.dispatch({ type: CLEAR_AUTH_STATE });
        store.dispatch({ type: CLEAR_RECENT_POSTS });
        store.dispatch({ type: CLEAR_SOCKET_STATE });
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
