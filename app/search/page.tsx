// app/search/page.tsx
import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search…</div>}>
      <SearchClient />
    </Suspense>
  );
}
