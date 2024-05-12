import { SOCKET_CONNECTION } from './types';

const initialState = {
  socketConnection: null,
};

export const chatReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SOCKET_CONNECTION:
      return {
        socketConnection: payload,
      };
    default:
      return state;
  }
};
