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
  composeWithDevTools(applyMiddleware(...middleware))
);

export const persistor = persistStore(store);
