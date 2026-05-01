import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, User2, Smile, MapPin, Film, Loader2, AlertCircle } from 'lucide-react';
import { usePostsContext } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const CreatePostModal = ({ userAvatar, closeModal }) => {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);
  const { createPost } = usePostsContext();
  const { user } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // Limite 10 Mo
      setErrorMsg("Le fichier est trop volumineux (Max 10 Mo)");
      return;
    }

    setErrorMsg("");
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedFile) return;
    setIsUploading(true);
    let mediaUrl = null;

    try {
      // Upload vers le bucket 'posts'
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);

        mediaUrl = urlData.publicUrl;
      }

      await createPost(content, mediaUrl); // Appel au contexte
      closeModal();
    } catch (err) {
      setErrorMsg("Erreur lors de la publication.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="w-8"></div>
          <h2 className="text-xl font-bold">Créer une publication</h2>
          <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          <div className="flex items-center gap-3 mb-4">
            <img src={userAvatar} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
            <div>
              <p className="font-bold">{user?.firstname} {user?.lastname}</p>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md w-fit text-gray-600">
                <User2 size={12} />
                <span className="text-[12px] font-semibold">Public</span>
              </div>
            </div>
          </div>

          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Quoi de neuf, ${user?.firstname || '...'} ?`}
            className="w-full min-h-[120px] text-lg border-none focus:ring-0 resize-none outline-none"
          />

          {previewUrl && (
            <div className="mt-4 relative rounded-xl border overflow-hidden bg-gray-50">
              <button
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full shadow-md z-10"
              >
                <X size={18} />
              </button>
              {selectedFile?.type.startsWith('image/') ? (
                <img src={previewUrl} className="w-full max-h-[300px] object-contain" alt="Aperçu" />
              ) : (
                <video src={previewUrl} className="w-full max-h-[300px]" controls />
              )}
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}
        </div>

        <div className="mx-4 mb-4 p-3 border rounded-lg flex items-center justify-between">
          <span className="font-bold text-gray-700">Ajouter à votre publication</span>
          <div className="flex items-center gap-1">
            <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-100 rounded-full group">
              <ImageIcon className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
            </button>
            <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-100 rounded-full group">
              <Film className="text-red-500 group-hover:scale-110 transition-transform" size={24} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileSelect}
            />
            <button className="p-2 hover:bg-gray-100 rounded-full"><Smile className="text-yellow-500" size={24} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full"><MapPin className="text-red-500" size={24} /></button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button
            disabled={(!content.trim() && !selectedFile) || isUploading}
            onClick={handlePost}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;