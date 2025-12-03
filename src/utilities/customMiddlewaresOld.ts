/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Role } from "@/types/enums";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export function withUserData(handler: (req: NextRequest, context: any, self_user_data?: {user_id: string; email: string; role: Role}) => Promise<Response>) {
    return async function(req: NextRequest, context: any){
        // //Bearer Token check
        // const authHeader = req.headers.get('Authorization');
      
        // if (!authHeader || !authHeader.startsWith('Bearer ')) {
        //     return handler(req, context);
        // }
        
        // const token = authHeader.slice(7); // Remove "Bearer " prefix

        
        // Request Cookies check
        // const token = req.cookies.get('session-token')?.value;
        
        // Response with traditional methods
        // if (!token) {
        //     return new NextResponse(
        //         JSON.stringify('Invalid or expired token'),
        //         { status: 401 }
        //     );
        // }

        // next-auth session check
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse(
                JSON.stringify('Invalid or expired token'),
                { status: 401 }
            );
        }
        
        try {
            // Traditional auth checks
            // const decoded = jwt.verify(token ?? "", process.env.JWT_SECRET ?? "abc");

            // if (decoded && typeof decoded !== "string") {
            //     const userData = decoded as { user_id: string; email: string; role: Role };

            //     return handler(req, context, userData);
            // }
            // else{
            //     return new NextResponse(
            //         JSON.stringify('Invalid or expired token'),
            //         { status: 401 }
            //     );
            // }

            if(session)
            {
                const userData = session?.user as { user_id: string; email: string; role: Role };
                return handler(req, context, userData);
            }
            else{
                return new NextResponse(
                    JSON.stringify('Invalid or expired token'),
                    { status: 401 }
                );
            }
        }
        catch(error){
            return new NextResponse(
                JSON.stringify('Invalid or expired token'),
                { status: 401 }
            );
        }
    }
}

//One middleware would've been enough. Role checks can be done inside route handlers as well.

export function withAdminRole(handler: (req: NextRequest, context: any, self_user_data?: {user_id: string; email: string; role: Role}) => Promise<Response>, 
    accessType: Role) {
    return async function(req: NextRequest, context: any){
        // //Bearer Token check
        // const authHeader = req.headers.get('Authorization');
      
        // if (!authHeader || !authHeader.startsWith('Bearer ')) {
        //     return handler(req, context);
        // }
        
        // const token = authHeader.slice(7); // Remove "Bearer " prefix

        
        // Request Cookies check
        // const token = req.cookies.get('session-token')?.value;

        // Response with traditional methods
        // if (!token) {
        //     return new NextResponse(
        //         JSON.stringify('Invalid or expired token'),
        //         { status: 401 }
        //     );
        // }

        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse(
                JSON.stringify('Invalid or expired token'),
                { status: 401 }
            );
        }
        
        try {
            // Traditional auth and role checks
            // const decoded = jwt.verify(token ?? "", process.env.JWT_SECRET ?? "abc");

            // if (decoded && typeof decoded !== "string") {
            //     const userData = decoded as { user_id: string; email: string; role: Role };
                
            //     if(userData.role === accessType || userData.role === 'MASTER_ADMIN') {
            //         return handler(req, context ?? null, userData ?? null);
            //     }
            //     else {
            //         return new NextResponse(
            //             JSON.stringify('Unauthorized action for user role.'),
            //             { status: 401 }
            //         );
            //     }
            // }
            // else{
            //     return new NextResponse(
            //         JSON.stringify('Invalid or expired token'),
            //         { status: 401 }
            //     );
            // }

            if(session)
            {
                const userData = session?.user as { user_id: string; email: string; role: Role };

                if(userData.role === accessType || userData.role === 'MASTER_ADMIN') {
                    return handler(req, context ?? null, userData ?? null);
                }
                else {
                    return new NextResponse(
                        JSON.stringify('Unauthorized action for user role.'),
                        { status: 401 }
                    );
                }
            }
            else{
                return new NextResponse(
                    JSON.stringify('Invalid or expired token'),
                    { status: 401 }
                );
            }
        }
        catch(error){
            return new NextResponse(
                JSON.stringify('Invalid or expired token'),
                { status: 401 }
            );
        }
    }
}