import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Rotas que exigem autenticação
  const isRotaProtegida = path.startsWith('/admin') || path.startsWith('/agenda') || path.startsWith('/clientes')

  // Verifica se existe o cookie de sessão do Supabase ou o token de fallback
  const hasSession = request.cookies.getAll().some(cookie =>
    cookie.name.includes('auth-token') || cookie.name.includes('sb-') || cookie.name === 'sb-access-token'
  )

  // Se for uma rota protegida e não houver sessão, redireciona para o login
  if (isRotaProtegida && !hasSession) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/agenda/:path*',
    '/clientes/:path*',
  ],
}