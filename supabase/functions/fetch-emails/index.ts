import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailMessage {
  id: string;
  subject: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  bodyPreview: string;
  body: {
    contentType: string;
    content: string;
  };
  hasAttachments: boolean;
  isRead: boolean;
}

interface Attachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
  contentBytes?: string;
}

async function getAccessToken(): Promise<string> {
  const tenantId = Deno.env.get("MS_TENANT_ID");
  const clientId = Deno.env.get("MS_CLIENT_ID");
  const clientSecret = Deno.env.get("MS_CLIENT_SECRET");

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing Microsoft credentials in environment variables");
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "https://graph.microsoft.com/.default",
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Token fetch error:", error);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchEmails(accessToken: string, mailbox: string): Promise<EmailMessage[]> {
  const url = `https://graph.microsoft.com/v1.0/users/${mailbox}/messages?$top=50&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,bodyPreview,body,hasAttachments,isRead`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Email fetch error:", error);
    throw new Error(`Failed to fetch emails: ${response.status}`);
  }

  const data = await response.json();
  return data.value || [];
}

async function fetchAttachments(accessToken: string, mailbox: string, messageId: string): Promise<Attachment[]> {
  const url = `https://graph.microsoft.com/v1.0/users/${mailbox}/messages/${messageId}/attachments`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Attachment fetch error for message:", messageId);
    return [];
  }

  const data = await response.json();
  return data.value || [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mailbox = Deno.env.get("MS_MAILBOX_ADDRESS");
    
    if (!mailbox) {
      throw new Error("MS_MAILBOX_ADDRESS not configured");
    }

    console.log(`Fetching emails for mailbox: ${mailbox}`);
    
    const accessToken = await getAccessToken();
    console.log("Access token obtained successfully");
    
    const emails = await fetchEmails(accessToken, mailbox);
    console.log(`Fetched ${emails.length} emails`);

    // Fetch attachments for emails that have them
    const emailsWithAttachments = await Promise.all(
      emails.map(async (email) => {
        let attachments: Attachment[] = [];
        if (email.hasAttachments) {
          attachments = await fetchAttachments(accessToken, mailbox, email.id);
        }
        return {
          ...email,
          attachments,
        };
      })
    );

    return new Response(JSON.stringify({
      success: true,
      emails: emailsWithAttachments,
      count: emailsWithAttachments.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in fetch-emails:", errorMessage);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
