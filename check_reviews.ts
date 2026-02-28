import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkReviews() {
    const { data: policies, error } = await supabase.from('reviews').select('*').limit(1); // Test select
    const { data: rawSql } = await supabase.rpc('get_policies', {}); // This probably won't work due to no RPC

    // Instead we can just do a select without auth
    const anonSupabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: anonReviews } = await anonSupabase.from('reviews').select('id').limit(5);

    const fs = require('fs');
    fs.writeFileSync('reviews_dump.json', JSON.stringify({ anonReviews }, null, 2));
    console.log('Dumped to reviews_dump.json');
}

checkReviews();
