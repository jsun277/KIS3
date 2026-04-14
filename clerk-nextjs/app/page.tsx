import { createServerSupabaseClient } from "../lib/supabase-server";
import Link from "next/link";

type Favorite = {
  id: number;
  user_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  ol_key: string;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerSupabaseClient();

  const { data: favorites } = await supabase
    .from("favorites")
    .select("*")
    .order("created_at", { ascending: false });

  const books: Favorite[] = favorites ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Class Bookshelf</h1>
          {books.length > 0 && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {books.length} {books.length === 1 ? "book" : "books"}
            </span>
          )}
        </div>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Books saved by everyone in the class.{" "}
          <Link
            href="/search"
            className="text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            Add yours
          </Link>
        </p>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 py-20 dark:border-zinc-800">
          <p className="text-lg text-zinc-400">No books yet.</p>
          <Link
            href="/search"
            className="mt-4 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Search &amp; add the first one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <div key={book.id} className="group flex flex-col">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-100 shadow-md transition-shadow group-hover:shadow-xl dark:bg-zinc-800">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
