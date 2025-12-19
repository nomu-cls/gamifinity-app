import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function maskApiKey(key: string | null): string {
  if (!key || key.length < 12) return '';
  return '****' + key.slice(-8);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, provider, api_key, is_active } = await req.json();

    if (action === 'get') {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('provider, is_active, is_valid, last_validated_at, validation_error');

      if (error) throw error;

      const { data: keyData } = await supabase
        .from('ai_settings')
        .select('provider, api_key_encrypted');

      const settings = {
        gemini: { has_key: false, is_active: false, is_valid: null as boolean | null, masked_key: '' },
        openai: { has_key: false, is_active: false, is_valid: null as boolean | null, masked_key: '' }
      };

      data?.forEach((row: { provider: string; is_active: boolean; is_valid: boolean | null }) => {
        const key = keyData?.find((k: { provider: string }) => k.provider === row.provider)?.api_key_encrypted;
        if (row.provider === 'gemini' || row.provider === 'openai') {
          settings[row.provider] = {
            has_key: !!key && key.length > 0,
            is_active: row.is_active,
            is_valid: row.is_valid,
            masked_key: maskApiKey(key)
          };
        }
      });

      return new Response(
        JSON.stringify({ success: true, settings }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'save') {
      if (!provider || !['gemini', 'openai'].includes(provider)) {
        return new Response(
          JSON.stringify({ error: 'Invalid provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updateData: { is_active: boolean; updated_at: string; api_key_encrypted?: string } = {
        is_active: is_active ?? false,
        updated_at: new Date().toISOString()
      };

      if (api_key !== undefined && api_key !== null && api_key !== '') {
        updateData.api_key_encrypted = api_key;
      }

      const { error } = await supabase
        .from('ai_settings')
        .upsert({
          provider,
          ...updateData
        }, {
          onConflict: 'provider'
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'test') {
      if (!provider || !['gemini', 'openai'].includes(provider)) {
        return new Response(
          JSON.stringify({ error: 'Invalid provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: setting } = await supabase
        .from('ai_settings')
        .select('api_key_encrypted')
        .eq('provider', provider)
        .maybeSingle();

      const testKey = api_key || setting?.api_key_encrypted;

      if (!testKey) {
        return new Response(
          JSON.stringify({ success: false, message: 'APIキーが設定されていません' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let testSuccess = false;
      let testMessage = '';

      try {
        if (provider === 'gemini') {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${testKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello' }] }],
                generationConfig: { maxOutputTokens: 10 }
              })
            }
          );

          if (response.ok) {
            testSuccess = true;
            testMessage = '接続成功';
          } else {
            const errorData = await response.json();
            testMessage = errorData.error?.message || `エラー: ${response.status}`;
          }
        } else if (provider === 'openai') {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${testKey}` }
          });

          if (response.ok) {
            testSuccess = true;
            testMessage = '接続成功';
          } else {
            const errorData = await response.json();
            testMessage = errorData.error?.message || `エラー: ${response.status}`;
          }
        }
      } catch (e) {
        testMessage = '接続テストに失敗しました';
      }

      await supabase
        .from('ai_settings')
        .update({
          is_valid: testSuccess,
          last_validated_at: new Date().toISOString(),
          validation_error: testSuccess ? null : testMessage
        })
        .eq('provider', provider);

      return new Response(
        JSON.stringify({ success: testSuccess, message: testMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'エラーが発生しました' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});