import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12">
      <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link href="/">
            <span className="font-sans font-extrabold text-xl tracking-[-0.04em] text-primary leading-none">
              germring.de
            </span>
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">FFB Energie & Zukunft</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Ein faktenbasiertes Lokalmedium für Erneuerbare, Kommunalpolitik und die Zukunft des Landkreises FFB — mit Haltung und Nutzwert.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Rubriken</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/kategorie/energie-erneuerbare" className="hover:text-foreground transition-colors">Energie & Erneuerbare</Link></li>
            <li><Link href="/kategorie/kommunalpolitik" className="hover:text-foreground transition-colors">Kommunalpolitik</Link></li>
            <li><Link href="/kategorie/zahlen-daten" className="hover:text-foreground transition-colors">Zahlen & Daten</Link></li>
            <li><Link href="/kategorie/praxis-zukunft" className="hover:text-foreground transition-colors">Praxis & Zukunft</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Über uns</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/newsletter" className="hover:text-foreground transition-colors">Newsletter</Link></li>
            <li><Link href="/partner" className="hover:text-foreground transition-colors font-medium text-primary/80">Partner werden</Link></li>
            <li><Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link></li>
            <li><Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link></li>
            <li><a href="mailto:redaktion@germring.de" className="hover:text-foreground transition-colors">Kontakt</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 mt-12 pt-8 border-t text-sm text-muted-foreground text-center">
        © {new Date().getFullYear()} germring.de — FFB Energie & Zukunft. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
