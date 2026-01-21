import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Key, Mail, Shield } from 'lucide-react';

export function ConfigPanel() {
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
