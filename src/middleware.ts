/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const routeRoleMap: Record<string, string> = {
  "/admin/create-product": "admin",
  "/admin/manage-admins": "master_admin",
  "/admin/users": "admin",
  "/admin/system": "master_admin",
};

export async function middleware(req: NextRequest) {
  if(process.env.MIDDLEWARE_DISABLED === 'true'){
    return NextResponse.next();
  }

  // //Bearer Token check
  // const authHeader = req.headers.get('Authorization');
  
  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   return new NextResponse('Authentication token is missing or malformed', { status: 401 });
  // }

  // const token = authHeader.slice(7); // Remove "Bearer " prefix

  // //Cookie-based authentication
  // const token = req.cookies.get('session-token')?.value;

  const token = req.cookies.get("next-auth.session-token")?.value || 
                req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!token) {
    return new NextResponse('Authentication token is missing', { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token ?? "", new TextEncoder().encode(process.env.JWT_SECRET || 'secret'));

    (req as any).user = payload;

    return NextResponse.next();
  } catch (error) {
    return new NextResponse('Invalid or expired token', { status: 401 });
  }
}

export const config = {
    matcher: [],
};