import { NextRequest,NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export async function POST(req:NextRequest){
 try{
  const body=await req.json();const name=String(body.name||"").trim().replace(/\s+/g," ");
  if(name.length<2||name.length>70)return NextResponse.json({error:"Enter a name between 2 and 70 characters."},{status:400});
  const {data:event,error:e}=await supabase.from("events").select("registration_open,revealed").eq("id",1).single();
  if(e||!event)return NextResponse.json({error:"Event unavailable."},{status:500});
  if(!event.registration_open||event.revealed)return NextResponse.json({error:"Registration is closed."},{status:403});
  const {data:existing}=await supabase.from("participants").select("id").ilike("name",name).limit(1);
  if(existing?.length)return NextResponse.json({error:"That name is already registered. Please check with the organizer if this is a mistake."},{status:409});
  const {error}=await supabase.from("participants").insert({name});
  if(error)return NextResponse.json({error:"Registration could not be saved. Please try again."},{status:500});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Invalid request."},{status:400});}
}
