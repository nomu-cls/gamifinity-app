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
            user_id, // Standard mapping
            event_item01, // Raw UTAGE field
            event_schedule,
            event_url,
            event_password,
            datechangepage
        } = body;

        // Use event_item01 as user_id if user_id is missing
        const targetUserId = user_id || event_item01;

        console.log('UTAGE Webhook received:', { user_id: targetUserId, mail, name });

        // 3. Validate
        if (!targetUserId && !mail) {
            console.error('Missing user_id/event_item01 and mail in payload. Cannot identify user.');
            return new Response(JSON.stringify({ success: false, message: 'Missing user_id or mail' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 4. Update Logic
        const updateData = {
            name: name,
            email: mail,
            is_session_booked: true,
            booked_at: new Date().toISOString(),
            // Custom fields
            event_schedule,
            event_url,
            event_password,
            datechangepage
        };

        if (mail) {
            Object.assign(updateData, { email: mail });
        }

        let updatedUsers: any[] = [];

        // Strategy 1: Try by user_id (targetUserId) if present
        if (targetUserId) {
            const { data, error } = await supabase
                .from('user_stories')
                .update(updateData)
                .eq('line_user_id', targetUserId)
                .select();

            if (error) throw error;
            if (data) updatedUsers = data;
        }

        // Strategy 2: If no user updated by ID (or ID missing), try by Email
        if ((!updatedUsers || updatedUsers.length === 0) && mail) {
            console.log(`User not found by ID (${targetUserId}) or ID missing. Trying by Email (${mail})...`);
            const { data, error } = await supabase
                .from('user_stories')
                .update(updateData)
                .eq('email', mail)
                .select();

            if (error) throw error;
            if (data) updatedUsers = data;
        }

        if (!updatedUsers || updatedUsers.length === 0) {
            console.warn(`User not found for user_id: ${targetUserId} or email: ${mail}`);
            return new Response(JSON.stringify({ success: false, message: 'User not found, but processed' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        console.log('User updated successfully:', updatedUsers[0].id);

        return new Response(JSON.stringify({ success: true, count: updatedUsers.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('Error in utage-webhook:', error);
        // Always return 200 to UTAGE
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
}
