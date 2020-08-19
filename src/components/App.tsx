import React, { useEffect, useReducer } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import {
  GlobalContext,
  globalContextReducer as reducer,
  Actions,
  initialState,
  User
} from '@/context';
import axios from '@/utils/axios';
import * as AuthUtils from '@/utils/auth';
import NavBar from './NavBar';
import { Login, Profile } from '@/pages';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #ebebeb;
  }
`;

const Foo: React.FC = () => <div>FooFooFooFooFooFoo</div>;

interface CheckStatusResponse {
  success: boolean;
  userinfo?: User;
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data }: { data: CheckStatusResponse } = await axios.get(
          '/api/check'
        );

        if (data.success) {
          dispatch({ type: Actions.Login });
          dispatch({ type: Actions.SetInfo, payload: data.userinfo });
        } else {
          AuthUtils.logout();
          dispatch({ type: Actions.Logout });
        }
      } catch (error) {
        console.error('Kapoera: Not Logged In');
      }
    };

    fetchStatus();
  }, []);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      <GlobalStyle />
      <BrowserRouter>
        <NavBar />
        <Switch>
          <Route exact path="/">
            <Foo />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/profile">
            <Profile />
          </Route>
        </Switch>
      </BrowserRouter>
    </GlobalContext.Provider>
  );
};

export default App;
