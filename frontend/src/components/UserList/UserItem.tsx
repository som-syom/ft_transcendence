import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { AllContext } from '../../store';
import { ActiveMenuType, IUserList, PLAY, ON, OFF, SHOW_PROFILE } from '../../utils/interface';

interface UserItemProps {
  user: IUserList;
  activeMenu: ActiveMenuType;
}

const UserItem: React.FC<UserItemProps> = ({ user, activeMenu }) => {
  const { setModal } = useContext(AllContext).modalData;

  return (
    <>
      {activeMenu === 'ALL' ? (
        <UserItemContainer status={user.status} onClick={() => setModal(SHOW_PROFILE)}>
          {user.nickname}
        </UserItemContainer>
      ) : (
        user.isfriend && (
          <UserItemContainer status={user.status} onClick={() => setModal(SHOW_PROFILE)}>
            {user.nickname}
          </UserItemContainer>
        )
      )}
    </>
  );
};

/*
 * 서클(유저현재상태표시) 프롭스 : 서클 커스텀
 * 유저아이텐에 프롭스는, 유저이름을 감싸는 박스 커스텀
 * #circle 로 아이템박스에 정의하던 속성 합쳤습니다 <-- 다솜님 요청사항
 * 서클 컴포넌트가 유저아이템의 가상요소(pseudo element) before로 합쳐졌습니다.
 */

// props.status === 'play'
//   ? `background: ${props.theme.colors.red};`
//   : props.status === 'on'
//   ? `background: ${props.theme.colors.green};`
//   : `background: ${props.theme.colors.deepGrey};`}
//마우스 포인트 버튼되는 형태로. >> 이후 추가할 이벤트를 위해서 임시로.
const UserItemContainer = styled.li<{ status: string }>`
  ::before {
    content: '';
    position: absolute;
    top: 15px;
    left: 15px;
    border-radius: 50%;
    background-color: ${props => props.theme.colors.green};
    width: 8px;
    height: 8px;
    ${props => {
      switch (props.status) {
        case PLAY:
          return `background: ${props.theme.colors.red};`;
        case ON:
          return `background: ${props.theme.colors.green};`;
        default:
          return `background: ${props.theme.colors.deepGrey};`;
      }
    }}
  }
  cursor: pointer;
  position: relative;
  border: 1px solid ${props => props.theme.colors.grey};
  display: flex;
  justify-content: left;
  align-items: center;
  width: 250px;
  height: 35px;
  line-height: 30px;
  margin-top: 10px;
  padding-left: 30px;
  border-radius: 10px;
  background-color: transparent;
  font-style: normal;
  font-size: 14px;
  ${props => props.status === OFF && `color: ${props.theme.colors.deepGrey};`}
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.main};
  }
`;

export default UserItem;
