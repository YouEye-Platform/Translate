import { createCanvasMiddleware } from "@/lib/middleware";
import { initSession } from "@/lib/auth";

initSession("ye-translate");

export const middleware = createCanvasMiddleware({
  appId: "ye-translate",
  publicRoutes: ["/api/widgets/", "/api/cards/", "/api/inter-app/", "/api/translate/languages", "/embed/timeline/", "/embed/widget/"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons).*)"],
};
