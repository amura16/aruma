import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../../services/supabaseClient'; // Vérifie ton chemin
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setMessage("Un lien de récupération a été envoyé sur votre adresse email.");
        } catch (err) {
            setError("Impossible d'envoyer l'email. Vérifiez l'adresse saisie.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-[400px] border border-gray-100">

                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-black text-gray-800 mb-2">Récupérer votre compte</h2>
                    <p className="text-gray-500 text-sm">
                        Entrez votre email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                {message ? (
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex flex-col items-center gap-3">
                            <CheckCircle2 size={40} className="text-green-500" />
                            <p className="font-medium text-sm">{message}</p>
                        </div>
                        <Link to="/login" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">
                            <ArrowLeft size={18} /> Retour à la connexion
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="nom@exemple.com"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Envoyer le lien"}
                        </button>

                        <Link to="/login" className="text-gray-500 text-sm font-bold hover:text-gray-700 flex items-center justify-center gap-2 transition-colors">
                            <ArrowLeft size={16} /> Retour à la connexion
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;