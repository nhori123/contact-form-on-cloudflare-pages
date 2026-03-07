import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequestPost: PagesFunction = async (context) => {
  const formData = await context.request.formData();

  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const message = formData.get("message") as string | null;

  return new Response(
    JSON.stringify({ name, email, message }, null, 2),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};
