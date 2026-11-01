import { installedRelease } from "@/lib/installed-release";
import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/db/migrate";
import packageJson from "../../../../package.json";

const startTime = Date.now();
let dbReady = false;

export async function GET() {
  const release = await installedRelease("translate", packageJson.version);
  if (!dbReady) {
    try {
      await runMigrations();
      dbReady = true;
    } catch {
      // DB not available yet — still report healthy for the container
    }
  }

  return NextResponse.json({
    status: "ok",
    app: "ye-translate",
    version: release?.version ?? "unknown",
    buildVersion: packageJson.version,
    release,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    database: dbReady ? "connected" : "pending",
  });
}
