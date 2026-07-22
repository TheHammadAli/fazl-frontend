import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "assets/content/privacy-policy.pdf",
  );
  const file:any = await readFile(filePath);

  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="privacy-policy.pdf"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
