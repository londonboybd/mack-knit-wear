import Link from "next/link";
export default function NotFound() {
  return (
    <main className="page-intro">
      <span className="eyebrow">404</span>
      <h1>This page isn’t available.</h1>
      <p>It may have moved or hasn’t been published yet.</p>
      <Link className="button dark" href="/">
        Back to home
      </Link>
    </main>
  );
}
