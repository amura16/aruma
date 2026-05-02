import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ebzagnzrbyqeivqedxln.supabase.co" ;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

export default supabase;
