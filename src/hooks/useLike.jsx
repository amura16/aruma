import { useEffect, useState } from "react"
import supabase from "../services/supabaseClient"

const useLike = () => {
    const fetchLike = async() => {
        try{
            const {data, error } = await supabase.from("likes").select("*");
            return data;
        }
        catch{
            return "error from fetching post likes"
        }
    }
    useEffect(() => {
        fetchLike()
    }, [like]);
}

export default useLike;