// Proxies the holiday API so the API key in the upstream URL never reaches the browser.
export default async (req: Request) => {
  const raw = process.env.HOLIDAY_API_URL || process.env.REACT_APP_HOLIDAY_API_URL || "";
  // Tolerate values that were saved with surrounding quotes.
  const upstreamUrl = raw.trim().replace(/^["']|["']$/g, "");

  if (!upstreamUrl) {
    return Response.json({ error: "Holiday API is not configured." }, { status: 500 });
  }

  try {
    const upstream = await fetch(upstreamUrl, { signal: req.signal });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return Response.json({ error: "Could not reach the holiday service." }, { status: 502 });
  }
};
