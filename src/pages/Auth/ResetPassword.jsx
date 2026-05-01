import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../services/supabaseClient';
import { Lock, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError('');

        // Validation simple
        if (newPassword !== confirmPassword) {
            return setError("Les mots de passe ne correspondent pas.");
        }
        if (newPassword.length < 6) {
            return setError("Le mot de passe doit contenir au moins 6 caractères.");
        }

        setLoading(true);

        try {
            // Supabase gère automatiquement la session via le lien de l'email
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMessage("Votre mot de passe a été mis à jour avec succès !");

            // Redirection automatique après 3 secondes
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError("Le lien a peut-être expiré. Veuillez recommencer la procédure.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-[400px] border border-gray-100">

                <div className="mb-6 text-center">
                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-blue-600" size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800">Nouveau mot de passe</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Sécurisez votre compte avec un nouveau mot de passe.
                    </p>
                </div>

                {message ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex flex-col items-center gap-3 text-center animate-in zoom-in-95">
                        <CheckCircle2 size={40} className="text-green-500" />
                        <p className="font-medium text-sm">{message}</p>
                        <p className="text-xs text-green-600">Redirection vers la connexion...</p>
                    </div>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Nouveau mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    placeholder="Minimum 6 caractères"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Confirmer le mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    placeholder="Confirmez votre mot de passe"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Mettre à jour"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;