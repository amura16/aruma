import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, User2, Smile, MapPin, MoreHorizontal, Film, Loader2, AlertCircle } from 'lucide-react';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const CreatePostModal = ({ userAvatar, closeModal }) => {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef(null);
  const { createPost } = usePosts();
  const { user } = useAuth();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg("Le fichier est trop volumineux (Max 10 Mo)");
      return;
    }

    setErrorMsg("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedFile) return;
    
    setIsUploading(true);
    let mediaUrl = null;

    try {
      // 1. Upload du média si présent
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);
        
        mediaUrl = publicUrl;
      }

      // 2. Création du post
      await createPost(content, mediaUrl);
      
      closeModal();
      setContent("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur lors de la publication.");
    } finally {
      setIsUploading(false);
    }
  };

  const userName = user ? `${user.firstname} ${user.lastname}` : "Utilisateur ArumA";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
      <div className="fixed inset-0 bg-black/20" onClick={closeModal}></div>

      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="w-8"></div>
          <h2 className="text-xl font-bold text-gray-800">Créer une publication</h2>
          <button onClick={closeModal} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* User Info */}
          <div className="p-4 flex items-center gap-3">
            <img src={userAvatar} className="w-10 h-10 rounded-full object-cover" alt="me" />
            <div>
              <p className="font-bold text-gray-900">{userName}</p>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md w-fit">
                <User2 size={12} />
                <span className="text-[12px] font-semibold">Public</span>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="px-4">
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Quoi de neuf, ${user?.firstname || '...'} ?`}
              className="w-full min-h-[120px] text-xl placeholder:text-gray-400 border-none focus:ring-0 resize-none"
            />
          </div>

          {/* Preview Area */}
          {previewUrl && (
            <div className="px-4 mb-4 relative">
              <button 
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="absolute top-2 right-6 p-1 bg-white rounded-full shadow-md z-10 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
              <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                {selectedFile.type.startsWith('image/') ? (
                  <img src={previewUrl} className="w-full max-h-[300px] object-contain" alt="preview" />
                ) : (
                  <video src={previewUrl} className="w-full max-h-[300px]" controls />
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mx-4 mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm font-bold">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}
        </div>

        {/* Add to post bar */}
        <div className="mx-4 p-3 border border-gray-200 rounded-lg flex items-center justify-between mb-4 mt-2">
          <span className="font-bold text-[15px] text-gray-700">Ajouter à votre publication</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => fileInputRef.current.click()}
              className="p-2 hover:bg-gray-100 rounded-full transition group"
            >
              <ImageIcon className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
            </button>
            <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-100 rounded-full transition group">
              <Film className="text-red-500 group-hover:scale-110 transition-transform" size={24} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleFileSelect}
            />
            <button className="p-2 hover:bg-gray-100 rounded-full transition"><Smile className="text-yellow-500" size={24} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition"><MapPin className="text-red-500" size={24} /></button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-4 pb-4">
          <button
            disabled={(!content.trim() && !selectedFile) || isUploading}
            onClick={handlePost}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Publication en cours...
              </>
            ) : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;