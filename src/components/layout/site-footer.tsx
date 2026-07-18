import { siteConfig } from "@/config/site";
import { Container } from "@/components/shared/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <p className="text-sm text-muted-foreground">
          Hecho en el sur de Chile 🌲
        </p>
      </Container>
    </footer>
  );
}
