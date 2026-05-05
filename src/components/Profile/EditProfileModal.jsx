import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Lock, AlignLeft, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../services/supabaseClient';

const EditProfileModal = ({ isOpen, onClose, user }) => {
  const { updateProfile, session } = useAuth();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    bio: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        bio: user.bio || '',
        email: session?.user?.email || user.email || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [isOpen, user, session]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Update Profile (Name & Bio)
      const profileUpdates = {};
      if (formData.firstname !== user?.firstname) profileUpdates.firstname = formData.firstname;
      if (formData.lastname !== user?.lastname) profileUpdates.lastname = formData.lastname;
      if (formData.bio !== user?.bio) profileUpdates.bio = formData.bio;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await updateProfile(profileUpdates);
        if (profileError) throw new Error(profileError);
      }

      // 2. Update Auth (Email & Password)
      const authUpdates = {};
      if (formData.email !== session?.user?.email && formData.email.trim() !== '') {
        authUpdates.email = formData.email;
      }
      
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        authUpdates.password = formData.password;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }

      setSuccess("Profil mis à jour avec succès !");
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Modifier le profil</h2>
            <p className="text-sm text-gray-500 font-medium">Personnalisez votre présence sur Aruma</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-full transition-all shadow-sm hover:shadow-md border border-transparent hover:border-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span className="font-semibold">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-2xl border border-green-100 flex items-center gap-3 animate-in slide-in-from-top-2">
              <Check size={20} />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Identité */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Identité publique
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Prénom</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium group-hover:bg-white group-hover:border-gray-300"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Nom</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium group-hover:bg-white group-hover:border-gray-300"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Biographie</label>
                <div className="relative group">
                  <div className="absolute left-4 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <AlignLeft size={18} />
                  </div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Parlez-nous de vous..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none group-hover:bg-white group-hover:border-gray-300"
                  ></textarea>
                </div>
                <p className="text-[11px] text-gray-400 ml-1 font-medium italic">Max 150 caractères</p>
              </div>
            </div>

            {/* Section: Sécurité */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} /> Sécurité & Connexion
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium group-hover:bg-white group-hover:border-gray-300"
                      required
                    />
                  </div>
                  {formData.email !== session?.user?.email && (
                    <p className="text-[11px] text-amber-600 font-bold ml-1 animate-pulse">
                      * Un email de confirmation sera requis.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Mot de passe</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium group-hover:bg-white group-hover:border-gray-300"
                      />
                    </div>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-gray-700 ml-1">Confirmation</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                          <Check size={18} />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium group-hover:bg-white group-hover:border-gray-300"
                          required={!!formData.password}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95 shadow-sm"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 shadow-lg shadow-blue-500/25 flex justify-center items-center gap-3 disabled:opacity-70 disabled:scale-100"
              >
                {loading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>Mettre à jour le profil</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
