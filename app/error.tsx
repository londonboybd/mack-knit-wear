"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="page-intro">
      <h1>We couldn’t load this page.</h1>
      <p>Please try again in a moment.</p>
      <button className="button dark" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
