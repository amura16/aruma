import { useState } from 'react';

export const useShare = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postToShare, setPostToShare] = useState(null);

  const openShareModal = (post) => {
    setPostToShare(post);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setPostToShare(null);
  };

  return {
    isShareModalOpen,
    postToShare,
    openShareModal,
    closeShareModal
  };
};