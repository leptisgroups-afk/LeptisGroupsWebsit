import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#0b0f19] text-center px-6 text-slate-350">
      <h1 className="text-6xl font-black text-amber-500 mb-4">404</h1>
      <h2 className="text-2xl font-extrabold text-white mb-2">Page Not Found</h2>
      <p className="text-slate-400 mb-6 font-semibold">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Link
        href="/"
        className="text-amber-500 hover:text-amber-600 hover:underline font-extrabold"
      >
        Back to Home
      </Link>
    </div>
  );
}
