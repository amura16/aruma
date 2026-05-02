import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ebzagnzrbyqeivqedxln.supabase.co" ;
const supabaseAnonKey = "sb_publishable_VKfWNDn_UHd5gtbjgReA7g_Cs29fUk-";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

export default supabase;
