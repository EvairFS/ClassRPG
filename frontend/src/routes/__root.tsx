import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-secondary/20 blur-3xl" />
      <div className="glass-strong relative z-10 max-w-md rounded-3xl p-10 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/40 to-secondary/40 text-3xl ring-1 ring-white/15">
          🗺️
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Missão não encontrada</p>
        <h1 className="mt-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-7xl font-black text-transparent">
          404
        </h1>
        <h2 className="mt-3 text-xl font-semibold text-foreground">Você saiu do mapa, aventureiro</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura foi consumida por um boss épico ou nunca existiu neste universo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/student"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Voltar ao QG
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/10"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
