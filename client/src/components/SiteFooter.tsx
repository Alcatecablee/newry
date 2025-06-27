export function SiteFooter() {
  return (
    <footer className="w-full py-6 px-6 mt-auto bg-black border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-sm text-zinc-400">
      <div className="mb-2 sm:mb-0">
        &copy; {new Date().getFullYear()} NeuroLint. All rights reserved.
      </div>
      <div>
        Feedback?{" "}
        <a
          href="mailto:founder@neurolint.com"
          className="underline hover:text-white transition-colors"
        >
          founder@neurolint.com
        </a>
      </div>
    </footer>
  );
}
