import { useFriendContext } from '../context/FriendContext';

export const useFriends = () => {
  const { invitations, acceptInvitation, declineInvitation } = useFriendContext();

  return {
    invitations,
    acceptInvitation,
    declineInvitation
  };
};
