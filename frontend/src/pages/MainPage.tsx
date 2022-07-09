import React, { useContext } from 'react';
import { AllContext } from '../store';
// import GamePage from './HomePage';
import LoginPage from './LoginPage';
import NicknamePage from './NicknamePage';
import SecondAuthPage from './SecondAuthPage';
import ModalSet from '../components/common/Modal/ModalSet';
import HomePage from './HomePage';
import { MenuType } from '../utils/interface';

interface MainPageProps {
  menu?: MenuType;
}

const MainPage: React.FC<MainPageProps> = ({ menu }) => {
  const { userStatus } = useContext(AllContext).userStatus;

  return (
    <>
      {
        {
          LOGOUT: <LoginPage />,
          SET_NICKNAME: <NicknamePage />,
          SECOND_AUTH: <SecondAuthPage />,
          LOGIN: menu ? <HomePage menu={menu} /> : <HomePage />,
        }[userStatus]
      }
      <ModalSet />
    </>
  );
};

export default MainPage;
