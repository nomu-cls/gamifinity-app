import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
};

export const config = {
    runtime: 'edge', // Using Edge Runtime for better performance/similarity to Supabase Functions
};

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Use Anon Key for public webhook if strict security isn't possible, or Service Role Key if available in env

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase environment variables');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { client_id, email, ...rest } = await req.json();

        console.log('UTAGE Webhook received:', { client_id, email, rest });

        if (!client_id && !email) {
            throw new Error('Missing client_id or email in payload');
        }

        let query = supabase.from('user_stories').update({
            is_session_booked: true,
            booked_at: new Date().toISOString()
        });

        // Try to find by line_user_id (client_id) first
        if (client_id) {
            const { data, error } = await query.eq('line_user_id', client_id).select();

            if (!error && data && data.length > 0) {
                console.log('Updated by client_id:', data);
                return new Response(JSON.stringify({ success: true, method: 'client_id', data }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }
        }

        // Fallback to email if client_id failed or missing
        if (email) {
            // Need fresh query builder instance for second attempt
            const { data, error } = await supabase.from('user_stories')
                .update({
                    is_session_booked: true,
                    booked_at: new Date().toISOString()
                })
                .eq('email', email)
                .select();

            if (error) throw error;

            console.log('Updated by email:', data);
            return new Response(JSON.stringify({ success: true, method: 'email', data }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        return new Response(JSON.stringify({ success: false, message: 'User not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
        });

    } catch (error: any) {
        console.error('Error in utage-webhook:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
}
