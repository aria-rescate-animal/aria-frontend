import { Link } from 'react-router-dom'
import { Home, Search, PawPrint } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10">
          <PawPrint className="h-7 w-7 text-teal" />
        </div>
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-teal">Ruta no encontrada</p>
        <h1 className="text-3xl font-bold text-foreground">Esta página no existe o fue movida</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Puedes volver al inicio o revisar las publicaciones de mascotas perdidas.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white transition hover:opacity-90">
            <Home className="h-4 w-4" /> Ir al inicio
          </Link>
          <Link to="/perdidos" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground transition hover:bg-muted">
            <Search className="h-4 w-4" /> Mascotas perdidas
          </Link>
        </div>
      </section>
    </main>
  )
}
