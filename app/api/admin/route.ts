import { NextRequest,NextResponse } from "next/server";
import { isAdmin,ADMIN_COOKIE } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { makeTeams } from "@/lib/shuffle";
export const dynamic="force-dynamic";
export async function GET(){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const [{data:event},{data:people,count}]=await Promise.all([
  supabase.from("events").select("*").eq("id",1).single(),
  supabase.from("participants").select("id,name,team_number",{count:"exact"}).order("created_at")
 ]);
 const teamsMap=new Map<number,string[]>();
 for(const p of people||[])if(p.team_number){teamsMap.set(p.team_number,[...(teamsMap.get(p.team_number)||[]),p.name]);}
 return NextResponse.json({open:event?.registration_open??false,revealed:event?.revealed??false,count:count||0,names:(people||[]).map(p=>p.name),teams:[...teamsMap.entries()].map(([team,members])=>({team,members}))},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:NextRequest){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 const {action}=await req.json().catch(()=>({action:""}));
 if(action==="logout"){const r=NextResponse.json({ok:true});r.cookies.set(ADMIN_COOKIE,"",{path:"/",maxAge:0});return r;}
 if(action==="open"||action==="close"){
  const {error}=await supabase.from("events").update({registration_open:action==="open"}).eq("id",1);
  if(error) {
  console.error("Registration update failed:", error);
  return NextResponse.json(
    {error: error.message, details: error.details, hint: error.hint},
    {status:500}
  );
}
  return NextResponse.json({message:action==="open"?"Registration opened.":"Registration closed."});
 }
 if(action==="generate"){
  const {data:event}=await supabase.from("events").select("registration_open,revealed").eq("id",1).single();
  if(!event||event.registration_open||event.revealed)return NextResponse.json({error:"Close registration before generating teams."},{status:400});
  const {data:people,error}=await supabase.from("participants").select("id").order("created_at");
  if(error||!people?.length)return NextResponse.json({error:"There are no participants to group."},{status:400});
  const teams=makeTeams(people);
  for(let i=0;i<teams.length;i++){
   const ids=teams[i].map(p=>p.id);
   const {error:updateError}=await supabase.from("participants").update({team_number:i+1}).in("id",ids);
   if(updateError)return NextResponse.json({error:"Team assignment failed. Please contact support before retrying."},{status:500});
  }
  return NextResponse.json({message:`Generated ${teams.length} team${teams.length===1?"":"s"}. Preview is private until reveal.`});
 }
 if(action==="reveal"){
  const {data:event}=await supabase.from("events").select("registration_open").eq("id",1).single();
  if(event?.registration_open)return NextResponse.json({error:"Close registration before revealing."},{status:400});
  const {count}=await supabase.from("participants").select("*",{count:"exact",head:true});
  if(!count)return NextResponse.json({error:"Register participants and generate teams first."},{status:400});
  const {data:assigned}=await supabase.from("participants").select("id").not("team_number","is",null);
  if((assigned?.length||0)!==count)return NextResponse.json({error:"Generate teams before revealing."},{status:400});
  const {error}=await supabase.from("events").update({revealed:true}).eq("id",1);
  if(error)return NextResponse.json({error:"Could not reveal teams."},{status:500});
  return NextResponse.json({message:"Teams revealed! Participants can now see all teams."});
 }
 if(action==="reset"){
  const {error:delError}=await supabase.from("participants").delete().not("id","is",null);
  if(delError)return NextResponse.json({error:"Could not clear participants."},{status:500});
  const {error}=await supabase.from("events").update({registration_open:true,revealed:false}).eq("id",1);
  if(error)return NextResponse.json({error:"Participants cleared, but event settings could not reset."},{status:500});
  return NextResponse.json({message:"Event reset. Registration is open for a new event."});
 }
 return NextResponse.json({error:"Unknown action."},{status:400});
}
