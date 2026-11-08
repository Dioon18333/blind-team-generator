import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export async function GET(){
 const {data:event,error}=await supabase.from("events").select("registration_open,revealed").eq("id",1).single();
 if(error||!event)return NextResponse.json({error:"Event is not configured."},{status:500});
 const {count}=await supabase.from("participants").select("*",{count:"exact",head:true});
 const result:{registrationOpen:boolean;revealed:boolean;count:number;teams?:{team:number;members:string[]}[]}={registrationOpen:event.registration_open,revealed:event.revealed,count:count||0};
 if(event.revealed){
   const {data}=await supabase.from("participants").select("name,team_number").not("team_number","is",null).order("team_number").order("created_at");
   const grouped=new Map<number,string[]>();
   for(const p of data||[]){const n=p.team_number as number;grouped.set(n,[...(grouped.get(n)||[]),p.name as string]);}
   result.teams=[...grouped.entries()].map(([team,members])=>({team,members}));
 }
 return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}});
}
