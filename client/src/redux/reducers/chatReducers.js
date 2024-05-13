import { SOCKET_CONNECTION, ONLINE_USERS } from './types';

const initialState = {
  socketConnection: null,
  onlineUsers: [],
};

export const chatReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SOCKET_CONNECTION:
      return {
        socketConnection: payload,
      };

    case ONLINE_USERS:
      return {
        ...state,
        onlineUsers: payload,
      };

    default:
      return state;
  }
};
