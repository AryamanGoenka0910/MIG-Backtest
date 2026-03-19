import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { TeamMember } from "@/lib/types/team";

export const runtime = "nodejs";

export async function GET() {
  let user;
  try {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    user = data.user;
  } catch (e) {
    return NextResponse.json({ error: "Auth error" }, { status: 401 });
  }

  const { data: userRow, error: userError } = await supabaseAdmin
    .from("Users")
    .select("team_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (userError) {
    return NextResponse.json(
      { error: `Failed to load user: ${userError.message}` },
      { status: 500 }
    );
  }
  if (!userRow) {
    return NextResponse.json({ error: "User profile not found." }, { status: 404 });
  }

  const teamId = (userRow as { team_id?: unknown } | null)?.team_id as number | null;
  if (teamId === null) {
    return NextResponse.json(
      { team: null },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const [membersResult, teamResult] = await Promise.all([
    supabaseAdmin
      .from("Users")
      .select("user_id, user_name")
      .eq("team_id", teamId)
      .order("user_name", { ascending: true }),
    supabaseAdmin
      .from("Teams")
      .select("team_name")
      .eq("team_id", teamId)
      .maybeSingle(),
  ]);

  if (membersResult.error) {
    return NextResponse.json(
      { error: `Failed to load team members: ${membersResult.error.message}` },
      { status: 500 }
    );
  }

  const members: TeamMember[] = (membersResult.data ?? []) as TeamMember[];
  const teamName = (teamResult.data as { team_name?: string } | null)?.team_name ?? null;

  return NextResponse.json(
    { team: { team_id: teamId, team_name: teamName, members } },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
