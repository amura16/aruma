import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, ChevronLeft, Save, AlertCircle, Camera, Calendar, Mail, UserCircle } from 'lucide-react';
import NavBar from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

const AccountSettings = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    birthdate: user?.birthdate || '',
    gender: user?.gender || '',
    avatar_url: user?.avatar_url || ''
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        birthdate: user.birthdate || '',
        gender: user.gender || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const publicUrlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      const { success, error } = await updateProfile({ avatar_url: publicUrlWithCacheBuster });
      if (!success) throw new Error(error || "Échec de la mise à jour");

      setProfileData(prev => ({ ...prev, avatar_url: publicUrlWithCacheBuster }));
      setMessage({ type: 'success', text: 'Photo de profil sauvegardée !' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Erreur lors de l'upload." });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: profileData.email });
        if (emailError) throw emailError;
        setMessage({ type: 'success', text: 'Vérifiez votre nouvelle boîte email pour confirmer.' });
      }

      const { email, ...updates } = profileData;
      await updateProfile(updates);
      
      if (profileData.email === user.email) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current) { setMessage({ type: 'error', text: 'Saisissez votre mot de passe actuel.' }); return; }
    if (passwords.new !== passwords.confirm) { setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' }); return; }
    if (passwords.new.length < 6) { setMessage({ type: 'error', text: '6 caractères minimum.' }); return; }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.current,
      });
      if (authError) throw new Error("Mot de passe actuel incorrect.");

      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;

      setMessage({ type: 'success', text: 'Mot de passe modifié !' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erreur.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <NavBar />
      <main className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-200 rounded-full transition">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Paramètres du compte</h1>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 z-50 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <AlertCircle size={20} />
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <div className="space-y-8">
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl relative">
                <img src={profileData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'}`} alt="" />
                {uploading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
              </div>
              <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full border-2 border-white group-hover:scale-110 transition-transform"><Camera size={20} /></div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
            <p className="mt-4 text-sm font-bold text-gray-500">Cliquez pour changer la photo</p>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><UserCircle size={24} /></div>
              <h2 className="text-lg font-bold">Informations personnelles</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Prénom</label>
                  <input type="text" value={profileData.firstname} onChange={(e) => setProfileData({...profileData, firstname: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nom</label>
                  <input type="text" value={profileData.lastname} onChange={(e) => setProfileData({...profileData, lastname: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2"><Mail size={14} /> Email</label>
                <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2"><Calendar size={14} /> Date de naissance</label>
                  <input type="date" value={profileData.birthdate} onChange={(e) => setProfileData({...profileData, birthdate: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2"><UserCircle size={14} /> Genre</label>
                  <select value={profileData.gender} onChange={(e) => setProfileData({...profileData, gender: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                    <option value="">Sélectionner...</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                <Save size={20} /> {loading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
              </button>
            </form>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Lock size={24} /></div>
              <h2 className="text-lg font-bold">Sécurité du compte</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mot de passe actuel</label>
                <input type="password" placeholder="••••••••" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nouveau mot de passe</label>
                <input type="password" placeholder="Minimum 6 caractères" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Confirmer le nouveau</label>
                <input type="password" placeholder="••••••••" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 font-medium" />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-100">Changer le mot de passe</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;
