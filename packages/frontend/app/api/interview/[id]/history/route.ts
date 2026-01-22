import { getHistory } from "@/app/(tabs)/(simulator)/interview/[id]/actions";
import { NextResponse } from "next/server";

export async function GET() {
  const history = await getHistory({ interviewId: "1" });
  return NextResponse.json(history);
}
