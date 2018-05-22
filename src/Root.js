import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { rootReducer } from './reducers';
import App from './App';

const store = createStore(rootReducer);

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default Root;
