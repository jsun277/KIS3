"use client";

import { useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

type Book = {
  title: string;
  author: string;
  cover_id: number | null;
  ol_key: string;
};

function useSupabase() {
  const { session } = useSession();
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      async accessToken() {
        return session?.getToken() ?? null;
      },
    }
  );
}

export default function SearchPage() {
  const { user } = useUser();
  const supabase = useSupabase();
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setBooks(data.books);
    setLoading(false);
  }

  async function handleSave(book: Book) {
    if (!user) return;

    const coverUrl = book.cover_id
      ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
      : null;

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      title: book.title,
      author: book.author,
      cover_url: coverUrl,
      ol_key: book.ol_key,
    });

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      setSaved((prev) => new Set(prev).add(book.ol_key));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Search Books</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Find books on Open Library and save your favorites.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-10 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or author..."
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {books.length > 0 && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <div key={book.ol_key} className="group flex flex-col">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-100 shadow-md transition-shadow group-hover:shadow-xl dark:bg-zinc-800">
                {book.cover_id ? (
                  <img
                    src={`https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-zinc-400">
                    No cover
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold leading-tight line-clamp-2">
                {book.title}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {book.author}
              </p>
              <button
                onClick={() => handleSave(book)}
                disabled={saved.has(book.ol_key)}
                className="mt-2 self-start rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
              >
                {saved.has(book.ol_key) ? "Saved" : "Save"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
