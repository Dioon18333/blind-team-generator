import { NextRequest,NextResponse } from "next/server";
import { makeSession,ADMIN_COOKIE } from "@/lib/auth";
export async function POST(req:NextRequest){
 const {password}=await req.json().catch(()=>({password:""}));
 const expected=process.env.ADMIN_PASSWORD;
 if(!expected||typeof password!=="string"||password!==expected)return NextResponse.json({error:"Incorrect password."},{status:401});
 const response=NextResponse.json({ok:true});
 response.cookies.set(ADMIN_COOKIE,makeSession(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:60*60*12});
 return response;
}
