import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPublicIdentities() {
    console.log("Checking public_identities...");

    // First, let's just see if we can query public_identities directly
    const { data: identities, error: idError } = await supabase
        .from('public_identities')
        .select('*')
        .limit(5);

    console.log("Direct query public_identities:");
    console.log("Data:", identities);
    console.log("Error:", idError);

    console.log("\n---");

    // Now let's try the exact query from the frontend
    const testPropertyId = "e4b1379b-fdd0-4d2d-9a6d-02ee0cb8af6d"; // Using property ID from previous logs

    const { data: reviews, error: revError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          user_id,
          public_identities:user_id (name, avatar_url)
        `)
        .eq("property_id", testPropertyId)
        .limit(2);

    console.log(`\nJoined query for property ${testPropertyId}:`);
    console.log("Data:", JSON.stringify(reviews, null, 2));
    console.log("Error:", revError);
}

checkPublicIdentities();
