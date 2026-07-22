import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "assets/content/terms-and-conditions.pdf",
  );
  const file:any = await readFile(filePath);

  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="terms-and-conditions.pdf"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
