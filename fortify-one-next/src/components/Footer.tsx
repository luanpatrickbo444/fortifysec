export default function Footer() {
  return (
    <footer className="border-t border-fortify-border/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-fortify-purple flex items-center justify-center font-bold text-white text-sm">
            F
          </div>
          <span className="font-display font-bold text-white">FORTIFY</span>
        </div>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Fortify One. Todos os direitos reservados.
        </p>
        <a
          href="https://wa.me/5565999221436"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-fortify-neon transition-colors"
        >
          (65) 99922-1436
        </a>
      </div>
    </footer>
  );
}
