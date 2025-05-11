// middleware.js
import { NextResponse } from 'next/server'

const protectedAdminRoutes = ['/Dashboard']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Only protect /dashboard and subroutes
  if (protectedAdminRoutes.some((path) => pathname.toLowerCase().startsWith(path))) {
    const token = request.cookies.get('authToken')?.value


    try {
      const res = await fetch(`http://127.0.0.1:8000/my_profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })


      const user = await res.json()

      if (!user.years_of_experience) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // ✅ User is admin → allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Make sure this matches your folder structure
export const config = {
  matcher: ['/dashboard/:path*'],
}
