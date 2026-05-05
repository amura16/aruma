import { useEffect, useState } from "react"
import supabase from "../services/supabaseClient"
import { User } from "lucide-react";

const useLike = ({ post , user}) => {
    const fetchLike = async () => {
        try {
            const { data, error } = await supabase.from("likes").select("*").eq("id",post.id).eq("user_id", user.id).maybeSingle();
            return data;
        }
        catch {
            return "error from fetching post likes"
        }
    }
    const like = fetchLike();
    return like;
}

export default useLike; 
