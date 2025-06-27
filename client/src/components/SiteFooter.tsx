export function SiteFooter() {
  return (
    <footer className="w-full py-6 px-6 mt-auto bg-charcoal border-t border-charcoal-light flex flex-col sm:flex-row items-center justify-between text-sm text-charcoal-lighter">
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
