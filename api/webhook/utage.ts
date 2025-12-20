import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
};

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    // 1. Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Server Environment Error: Missing Supabase credentials');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. Parse payload
        // Mapping:
        // %name% -> name
        // %email% -> mail
        // %event_item01% -> user_id (Key)
        // %event_schedule% -> event_schedule
        // %event_url% -> event_url
        // %event_password% -> event_password
        // %event_schedule_change_url% -> datechangepage
        const body = await req.json();
        const {
            name,
            mail,
            user_id, // Mapped from %event_item01% by UTAGE setting
            event_schedule,
            event_url,
            event_password,
            datechangepage
        } = body;

        console.log('UTAGE Webhook received:', { user_id, mail, name });

        // 3. Validate
        if (!user_id) {
            console.error('Missing user_id in payload. Cannot identify user.');
            // Return 200 to prevent UTAGE retry loop, but log error
            return new Response(JSON.stringify({ success: false, message: 'Missing user_id' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 4. Update (Upsert) Logic
        // We only update if user exists. If not, we log.
        // Or if requirement is to INSERT new user, we'd use upsert. 
        // Instruction says "update existing user DB info".

        const updateData = {
            name: name,
            email: mail, // Mapping 'mail' to 'email' column (assuming standard) or 'mail' column? App.tsx uses 'email'. User asked for 'mail'. I will try to support both or stick to user instruction if DB column matches.
            // Converting 'mail' from payload to 'email' in DB if that's the convention, 
            // BUT user said: "%email% => mail". I should check if DB has 'mail' or 'email'.
            // App.tsx line 388 uses `email`. I will map payload `mail` to DB `email` to be safe/standard, 
            // or should I trust the user's "mail" key?
            // User said: "Receiver Parameter Name: mail". 
            // If DB column is 'email', I should map `mail` -> `email`.
            // Let's assume the payload field is `mail` (as requested) and DB column is `email` (standard).
            // Actually, let's just save what we have.
            // Note: App.tsx uses `email`. I will map `mail` (from input) to `email` (DB).

            // Wait, strict mapping request:
            // %email% => mail (Parameter Name)
            // So input body has `mail`.

            // DB Columns (inferred):
            // name, email (likely), event_schedule, event_url, event_password, datechangepage

            is_session_booked: true,
            booked_at: new Date().toISOString(),

            // Custom fields
            event_schedule,
            event_url,
            event_password,
            datechangepage
        };

        // handle mapping "mail" -> "email" for DB if valid, otherwise keep as is?
        // Safest is to use the existing 'email' column for the email address.
        if (mail) {
            Object.assign(updateData, { email: mail });
        }

        const { data, error } = await supabase
            .from('user_stories')
            .update(updateData)
            .eq('line_user_id', user_id) // Matching user_id (from UTAGE %event_item01%) to line_user_id
            .select();

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn(`User not found for user_id: ${user_id}`);
            return new Response(JSON.stringify({ success: false, message: 'User not found, but processed' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        console.log('User updated successfully:', data[0].id);

        return new Response(JSON.stringify({ success: true, count: data.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('Error in utage-webhook:', error);
        // Always return 200 to UTAGE to prevent retries on logic errors, unless transient
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
}
