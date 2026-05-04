import { usePostsContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personnalisé usePosts
 * Sert de façade pour accéder aux données et actions des posts
 * tout en vérifiant l'état de l'utilisateur.
 */
export const usePosts = () => {
  const {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    // Note : Ajoute ici d'autres fonctions (updateComment, etc.) 
    // si tu les as définies dans ton PostContext
  } = usePostsContext();

  const { user } = useAuth();

  // --- ACTIONS SUR LES POSTS ---

  /**
   * Crée un nouveau post
   * @param {string} content - Le texte du post
   * @param {string|null} image_url - L'URL de l'image (optionnel)
   */
  const handleCreatePost = async (content, image_url = null) => {
    if (!user) {
      console.warn("L'utilisateur doit être connecté pour publier.");
      return;
    }
    if (!content.trim()) return;

    try {
      await createPost(content, image_url);
    } catch (err) {
      console.error("Erreur hook handleCreatePost:", err);
    }
  };

  /**
   * Gère le système de Like/Unlike
   * @param {string} postId - L'ID du post
   * @param {boolean} isLikedByMe - État actuel du like
   */
  const handleLikePost = async (postId, isLikedByMe) => {
    if (!user) return;
    try {
      await toggleLike(postId, isLikedByMe);
    } catch (err) {
      console.error("Erreur hook handleLikePost:", err);
    }
  };

  /**
   * Supprime un post après confirmation
   * @param {string} postId 
   */
  const handleDeletePost = async (postId) => {
    if (!user) return;
    if (window.confirm("Voulez-vous vraiment supprimer ce post ?")) {
      try {
        await deletePost(postId);
      } catch (err) {
        console.error("Erreur hook handleDeletePost:", err);
      }
    }
  };

  // --- ACTIONS SUR LES COMMENTAIRES ---

  /**
   * Ajoute un commentaire à un post
   * @param {string} postId 
   * @param {string} content 
   */
  const handleAddComment = async (postId, content) => {
    if (!user || !content.trim()) return;
    try {
      await addComment(postId, content);
    } catch (err) {
      console.error("Erreur hook handleAddComment:", err);
    }
  };

  // --- RETOUR DU HOOK ---
  return {
    // États (venant du contexte)
    posts,
    loading,
    error,

    // Actions (encapsulées avec vérification utilisateur)
    createPost: handleCreatePost,
    likePost: handleLikePost,
    deletePost: handleDeletePost,
    updatePost,
    addComment: handleAddComment,
  };
};

export default usePosts; 
