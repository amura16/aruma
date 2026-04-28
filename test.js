import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://oeahmleuzedqflepwiuu.supabase.co';
const supabaseKey = 'sb_publishable_Z4r7wRteciRnwUEQ2DE8KA_mxpJ__C-';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

const {data, error} = await supabaseClient
  .from('utilisateurs')
  .select('*');

  if (error) {console.error('Erreur lors de la récupération des utilisateurs:', error)}
  else {console.log('Utilisateurs récupérés:', data)}