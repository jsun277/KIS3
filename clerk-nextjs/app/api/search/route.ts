import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ books: [] });
  }

  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) {
      return NextResponse.json(
        { books: [], error: "Open Library returned an error" },
        { status: 502 }
      );
    }

    const data = await res.json();

    const books = data.docs.map(
      (doc: {
        title: string;
        author_name?: string[];
        cover_i?: number;
        key: string;
      }) => ({
        title: doc.title,
        author: doc.author_name?.[0] ?? "Unknown",
        cover_id: doc.cover_i ?? null,
        ol_key: doc.key,
      })
    );

    return NextResponse.json({ books });
  } catch {
    return NextResponse.json(
      { books: [], error: "Could not reach Open Library. Try again." },
      { status: 502 }
    );
  }
}
