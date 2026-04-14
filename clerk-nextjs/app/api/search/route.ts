import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ docs: [] });
  }

  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12`
  );
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
}
