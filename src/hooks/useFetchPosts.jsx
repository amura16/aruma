import { useState, useEffect } from "react";
import supabase from "../services/supabaseClient";

const useFetchPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        // On utilise la jointure : "*, profile:user_id(*)" 
        // On récupère tout de 'posts' et on joint la table 'profiles' via 'user_id'
        const { data, error: supabaseError } = await supabase
          .from("posts")
          .select(`
            *,
            author:user_id (
              id,
              username,
              firstname,
              lastname,
              avatar_url
            )
          `)
          .order("created_at", { ascending: false });

        if (supabaseError) throw supabaseError;
        setPosts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Realtime : On écoute les nouveaux posts
    const channel = supabase
      .channel("realtime_posts_users")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          // Pour le realtime, comme le payload ne contient pas la jointure,
          // on peut soit refaire un fetch du post spécifique, soit gérer l'affichage
          // Ici, pour simplifier et garder les infos user, on récupère le profil de l'auteur
          const { data: userData } = await supabase
            .from("profiles")
            .select("id, username, firstname, lastname, avatar_url")
            .eq("id", payload.new.user_id)
            .single();

          const newPostWithUser = { ...payload.new, author: userData };
          setPosts((prev) => [newPostWithUser, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { posts, loading, error };
};

export default useFetchPosts;