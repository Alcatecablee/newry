export function SiteFooter() {
  return (
    <footer className="w-full py-8 px-4 mt-auto bg-black border-t border-zinc-800/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span>&copy; {new Date().getFullYear()} NeuroLint.</span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span>All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-400">Have feedback?</span>
          <a
            href="mailto:founder@neurolint.com"
            className="text-white font-medium hover:text-purple-300 transition-colors px-3 py-1 bg-zinc-800/50 hover:bg-zinc-800 rounded-full"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
