import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { thunk } from 'redux-thunk';
import { authReducer } from './reducers/authReducer';
import { postReducer } from './reducers/postReducer';
import { chatReducer } from './reducers/chatReducers';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const middleware = [thunk];

const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  chat: chatReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'post'],
  blacklist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(
  persistedReducer,
  composeWithDevTools(
    applyMiddleware(...middleware),
    typeof window.__REDUX_DEVTOOLS_EXTENSION__ === 'undefined'
      ? (a) => a
      : window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

export const persistor = persistStore(store);
