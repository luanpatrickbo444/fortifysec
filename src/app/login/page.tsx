export default function LoginPage() {
  return (
    <main className="min-h-screen hero-wash flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold one-title">Fortify Academy</h1>
          <p className="mt-2 opacity-80">
            Entre para acessar seus cursos e o Google Classroom.
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="text-sm">E-mail</label>
            <input
              type="email"
              placeholder="aluno@fortifysec.com.br"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm">Senha</label>
            <input
              type="password"
              placeholder="********"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl py-3 font-semibold"
          >
            Entrar
          </button>

          <a href="/esqueci-senha" className="block text-center text-sm">
            Esqueci minha senha
          </a>
        </form>
      </div>
    </main>
  );
}
