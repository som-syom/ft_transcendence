import React, { useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Modal from '.';
import Button from '../Button';
import { AllContext } from '../../../store';
import { CANCEL_MATCH_MODAL, IUserData } from '../../../utils/interface';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../../API';

let socket: Socket;
/**
 * 대전 신청한 사람한테 보이는 대기 모달
 * @param targetId : 대전 대상자의 id
 * @returns
 */
const FightResModal: React.FC<{ targetId: number }> = ({ targetId }) => {
  const { setModal } = useContext(AllContext).modalData;
  const { user } = useContext(AllContext).userData;
  const [targetInfo, setTargetInfo] = useState<IUserData | null>(null);
  const navigate = useNavigate();

  const cancelFight = () => {
    setModal(CANCEL_MATCH_MODAL);
  };

  const getTargetInfo = async () => {
    if (user && targetId) {
      const data = await usersAPI.getUserProfile(user.userId, targetId, user.jwt);
      if (data) {
        setTargetInfo(data);
      }
    }
  };

  useEffect(() => {
    getTargetInfo();
    if (user) {
      socket = io(`${process.env.REACT_APP_BACK_API}/ws-game`, {
        transports: ['websocket'],
        multiplex: false,
        query: { userId: user.userId },
      });
      socket.emit('canMatch', {
        userId: user.userId,
        targetId: targetId,
      });
      socket.on('cancelMatch', () => {
        console.log('cancel Match');
        // TODO: 매칭이 취소됨을 알려야함
        setModal(CANCEL_MATCH_MODAL);
      });
      socket.on('startMatch', (roomId: number) => {
        navigate(`/gameroom/${roomId}`);
      });
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);
  return (
    <Modal width={400} height={200}>
      <ModalWrap>
        <FightMsg>{targetInfo ? targetInfo.nickname : undefined}님의</FightMsg>
        <FightMsg>응답 대기중...</FightMsg>
        <CancelBtnWrap>
          <Button width={110} height={30} color="white" text="취소" onClick={cancelFight} />
        </CancelBtnWrap>
      </ModalWrap>
    </Modal>
  );
};

const FightMsg = styled.h3`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  line-height: 23px;
`;

const ModalWrap = styled.div`
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
const CancelBtnWrap = styled.div`
  margin-top: 20px;
  & button {
    font-size: 14px;
    border-radius: 5px;
  }
`;

export default FightResModal;
