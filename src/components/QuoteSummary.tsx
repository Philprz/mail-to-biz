import { ArrowLeft, CheckCircle, Calculator, FileText, TrendingUp, Building2, Package } from 'lucide-react';
import { ProcessedEmail } from '@/types/email';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface QuoteSummaryProps {
  quote: ProcessedEmail;
  onValidate: () => void;
  onBack: () => void;
}

// Mock data for demo
const mockArticles = [
  { reference: 'MOT-5KW-001', designation: 'Moteur industriel 5kW', quantity: 10, price: 1250.00 },
  { reference: 'PMP-HYD-A01', designation: 'Pompe hydraulique Type A', quantity: 5, price: 890.00 },
  { reference: 'PNL-CTR-003', designation: 'Panneau de contrôle', quantity: 3, price: 2100.00 },
];

const mockClient = {
  name: 'ACME Industries',
  country: 'France',
  type: 'Client existant',
};

const mockPricing = {
  subtotal: 23150.00,
  margin: 18,
  total: 27317.00,
};

export function QuoteSummary({ quote, onValidate, onBack }: QuoteSummaryProps) {
  // Use data from quote if available, otherwise use mock
  const clientName = quote.preSapDocument?.businessPartner.CardName || mockClient.name;
  
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Synthèse du devis</h1>
        <p className="text-muted-foreground">Pré-analyse automatique avant création SAP</p>
      </div>

      {/* Client Block */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nom du client</p>
              <p className="font-medium">{clientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pays</p>
              <p className="font-medium">{mockClient.country}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge variant="secondary">{mockClient.type}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Block */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-primary" />
            Articles détectés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix estimé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockArticles.map((article) => (
                <TableRow key={article.reference}>
                  <TableCell className="font-mono text-sm">{article.reference}</TableCell>
                  <TableCell>{article.designation}</TableCell>
                  <TableCell className="text-right">{article.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    {article.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pricing Block */}
      <Card className="card-elevated border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Pricing
            </span>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Calcul automatique
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Sous-total HT</p>
              <p className="text-xl font-semibold">
                {mockPricing.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Marge appliquée</p>
              <p className="text-xl font-semibold text-success">{mockPricing.margin}%</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Prix total estimé</p>
              <p className="text-2xl font-bold text-primary">
                {mockPricing.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why this price Block */}
      <Card className="card-elevated bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Pourquoi ce prix ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Source des prix</p>
                <p className="text-sm text-muted-foreground">
                  Prix récupérés depuis SAP B1 (tarif client ACME Industries) et catalogue PDF joint pour les références non référencées.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Marge appliquée selon politique RONDOT</p>
                <p className="text-sm text-muted-foreground">
                  Marge standard de 18% appliquée (catégorie client : Industrie France). Conforme à la grille tarifaire Q1 2026.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Ajustements appliqués</p>
                <p className="text-sm text-muted-foreground">
                  Transport inclus (zone France métropolitaine). Remise historique client de 2% déduite sur les moteurs industriels.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button onClick={onValidate} size="lg">
          <CheckCircle className="w-4 h-4 mr-2" />
          Valider (démo)
        </Button>
      </div>
    </div>
  );
}
