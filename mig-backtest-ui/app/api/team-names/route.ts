import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Auth error" }, { status: 401 });
  }

  const { teamIds } = await req.json();
  if (!Array.isArray(teamIds) || teamIds.length === 0) {
    return NextResponse.json({ teamNames: {} });
  }

  const { data: teams } = await supabaseAdmin
    .from("Teams")
    .select("team_id, team_name")
    .in("team_id", teamIds);

  const teamNames: Record<string, string> = {};
  for (const t of teams ?? []) {
    const row = t as { team_id: string | number; team_name: string };
    teamNames[String(row.team_id)] = row.team_name;
  }

  return NextResponse.json({ teamNames });
}
