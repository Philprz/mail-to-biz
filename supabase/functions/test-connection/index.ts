import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectionTestResult {
  success: boolean;
  step: string;
  details: {
    tenantId: boolean;
    clientId: boolean;
    clientSecret: boolean;
    mailboxAddress: boolean;
    tokenAcquired: boolean;
    mailboxAccessible: boolean;
  };
  error?: string;
  mailboxInfo?: {
    displayName: string;
    mail: string;
  };
}

async function testConnection(): Promise<ConnectionTestResult> {
  const tenantId = Deno.env.get("MS_TENANT_ID");
  const clientId = Deno.env.get("MS_CLIENT_ID");
  const clientSecret = Deno.env.get("MS_CLIENT_SECRET");
  const mailboxAddress = Deno.env.get("MS_MAILBOX_ADDRESS");

  const result: ConnectionTestResult = {
    success: false,
    step: "checking_credentials",
    details: {
      tenantId: !!tenantId,
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      mailboxAddress: !!mailboxAddress,
      tokenAcquired: false,
      mailboxAccessible: false,
    },
  };

  // Step 1: Check all credentials are present
  if (!tenantId || !clientId || !clientSecret || !mailboxAddress) {
    const missing = [];
    if (!tenantId) missing.push("MS_TENANT_ID");
    if (!clientId) missing.push("MS_CLIENT_ID");
    if (!clientSecret) missing.push("MS_CLIENT_SECRET");
    if (!mailboxAddress) missing.push("MS_MAILBOX_ADDRESS");
    
    result.error = `Missing credentials: ${missing.join(", ")}`;
    return result;
  }

  // Step 2: Acquire access token
  result.step = "acquiring_token";
  console.log("Testing token acquisition...");

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "https://graph.microsoft.com/.default",
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  try {
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token error:", errorText);
      
      let errorMessage = `Token acquisition failed (${tokenResponse.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error_description) {
          errorMessage = errorJson.error_description;
        }
      } catch {
        // Keep default error message
      }
      
      result.error = errorMessage;
      return result;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    result.details.tokenAcquired = true;
    console.log("Token acquired successfully");

    // Step 3: Test mailbox access
    result.step = "testing_mailbox";
    console.log(`Testing mailbox access for: ${mailboxAddress}`);

    const userUrl = `https://graph.microsoft.com/v1.0/users/${mailboxAddress}`;
    
    const userResponse = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("Mailbox access error:", errorText);
      
      let errorMessage = `Mailbox access failed (${userResponse.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // Keep default error message
      }
      
      result.error = errorMessage;
      return result;
    }

    const userData = await userResponse.json();
    result.details.mailboxAccessible = true;
    result.mailboxInfo = {
      displayName: userData.displayName || "Unknown",
      mail: userData.mail || mailboxAddress,
    };

    // All tests passed
    result.success = true;
    result.step = "complete";
    console.log("Connection test successful:", result.mailboxInfo);

    return result;

  } catch (error) {
    console.error("Connection test error:", error);
    result.error = error instanceof Error ? error.message : "Unknown error occurred";
    return result;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Microsoft Graph connection test...");
    const result = await testConnection();
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in test-connection:", errorMessage);
    
    return new Response(JSON.stringify({
      success: false,
      step: "error",
      error: errorMessage,
      details: {
        tenantId: false,
        clientId: false,
        clientSecret: false,
        mailboxAddress: false,
        tokenAcquired: false,
        mailboxAccessible: false,
      },
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
