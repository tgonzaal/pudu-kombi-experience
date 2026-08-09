import { writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { Livery } from "@/components/viewer/decals";

/**
 * Publica la disposición del editor: la guarda en `public/graficas/layout.json`,
 * que es lo que lee la página de la Kombi. Así deja de vivir solo en el
 * navegador de quien la armó.
 *
 * Escribe en el proyecto, o sea que funciona corriendo el sitio en el
 * computador. En un servidor de solo lectura (Vercel) devuelve un aviso claro:
 * ahí lo que corresponde es publicar en local y subir el archivo al repo.
 */
export const runtime = "nodejs";

const DESTINO = path.join(process.cwd(), "public", "graficas", "layout.json");

export async function POST(request: Request) {
  let livery: unknown;
  try {
    livery = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (
    !livery ||
    typeof livery !== "object" ||
    !Array.isArray((livery as Livery).decals)
  ) {
    return NextResponse.json(
      { error: "Se esperaba la pintura y la lista de gráficas." },
      { status: 400 },
    );
  }

  try {
    await writeFile(DESTINO, JSON.stringify(livery as Livery, null, 2), "utf8");
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudo escribir el archivo. Publica desde el sitio corriendo en tu computador y sube public/graficas/layout.json al repositorio.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    total: (livery as Livery).decals.length,
  });
}
