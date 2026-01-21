import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Key, Mail, Shield, Loader2, XCircle, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export function ConfigPanel() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-connection');

      if (error) {
        toast.error('Erreur lors du test de connexion');
        setTestResult({
          success: false,
          step: 'error',
          error: error.message,
          details: {
            tenantId: false,
            clientId: false,
            clientSecret: false,
            mailboxAddress: false,
            tokenAcquired: false,
            mailboxAccessible: false,
          },
        });
        return;
      }

      setTestResult(data as ConnectionTestResult);
      
      if (data.success) {
        toast.success(`Connexion réussie à ${data.mailboxInfo?.mail}`);
      } else {
        toast.error(data.error || 'Échec de la connexion');
      }
    } catch (err) {
      toast.error('Erreur inattendue');
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title mb-2">Configuration Microsoft Graph</h2>
        <p className="text-sm text-muted-foreground">
          Connexion à Office 365 pour la récupération des emails
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Credentials Azure AD
            </CardTitle>
            <Badge className="bg-success text-success-foreground">
              <CheckCircle className="w-3 h-3 mr-1" /> Configuré
            </Badge>
          </div>
          <CardDescription>
            Les secrets sont stockés de manière sécurisée dans Lovable Cloud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">MS_TENANT_ID</span>
              </div>
              <Badge variant="outline">••••••••</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">MS_CLIENT_ID</span>
              </div>
              <Badge variant="outline">••••••••</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">MS_CLIENT_SECRET</span>
              </div>
              <Badge variant="outline">••••••••</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">MS_MAILBOX_ADDRESS</span>
              </div>
              <Badge variant="outline">••••••••</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {testResult?.success ? (
              <Wifi className="w-5 h-5 text-success" />
            ) : testResult ? (
              <WifiOff className="w-5 h-5 text-destructive" />
            ) : (
              <Wifi className="w-5 h-5 text-muted-foreground" />
            )}
            Test de connexion
          </CardTitle>
          <CardDescription>
            Vérifiez que les credentials permettent d'accéder à la boîte mail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTestConnection} 
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Tester la connexion Microsoft Graph
              </>
            )}
          </Button>

          {testResult && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">Résultat du test</h4>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="text-sm">Tenant ID</span>
                  {testResult.details.tenantId ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="text-sm">Client ID</span>
                  {testResult.details.clientId ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="text-sm">Client Secret</span>
                  {testResult.details.clientSecret ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="text-sm">Adresse boîte mail</span>
                  {testResult.details.mailboxAddress ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="text-sm">Token OAuth2</span>
                  {testResult.details.tokenAcquired ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="text-sm">Accès boîte mail</span>
                  {testResult.details.mailboxAccessible ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              </div>

              {testResult.success && testResult.mailboxInfo && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm font-medium text-success">Connexion réussie !</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Boîte mail : {testResult.mailboxInfo.displayName} ({testResult.mailboxInfo.mail})
                  </p>
                </div>
              )}

              {testResult.error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive">Erreur</p>
                  <p className="text-sm text-muted-foreground mt-1">{testResult.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions requises</CardTitle>
          <CardDescription>Azure AD App Registration</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <code className="px-2 py-0.5 rounded bg-muted font-mono text-xs">Mail.Read</code>
              <span className="text-muted-foreground">- Application permission</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
