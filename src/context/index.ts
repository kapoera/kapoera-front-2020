import React, { Dispatch } from 'react';

interface GlobalState {
  isLoggedIn: boolean;
  userInfo: {
    username: string;
    nickname: string;
  };
}

export enum Actions {
  Login = 'LOGIN',
  Logout = 'LOGOUT',
  SetInfo = 'SETINFO'
}

interface GlobalAction {
  type: Actions;
  payload?: {
    username: string;
    nickname: string;
  };
}

export const initialState: GlobalState = {
  isLoggedIn: false,
  userInfo: null
};

export const GlobalContext = React.createContext<{
  state: GlobalState;
  dispatch: Dispatch<GlobalAction>;
}>(null);

export const globalContextReducer = (
  state: GlobalState,
  action: GlobalAction
): GlobalState => {
  switch (action.type) {
    case Actions.Login:
      return { ...state, isLoggedIn: true };
    case Actions.Logout:
      return { ...state, isLoggedIn: false };
    case Actions.SetInfo:
      return { ...state, userInfo: action.payload };
    default:
      return state;
  }
};
