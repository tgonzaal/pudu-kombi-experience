import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Container } from "@/components/shared/container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight"
        >
          PUDÚ<span className="text-primary"> Kombi</span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-1"
        >
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </Container>
    </header>
  );
}
