"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  // Temporizador de 4 segundos antes de exibir o formulário
  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarForm(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    // Validação estática temporária: admin / 123456
    setTimeout(() => {
      if (nome === "admin" && senha === "123456") {
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify({ nome: "Administrador", perfil: "admin" })
        );
        router.push("/dashboard");
      } else {
        setErro("Credenciais inválidas. Use admin / 123456");
        setCarregando(false);
      }
    }, 600);
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-start pt-16 md:pt-20 px-4 overflow-hidden">

      {/* IMAGEM DE FUNDO: Totalmente visível e limpa */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/fundo-henares.jpg')" }}
      >
        <div className="absolute inset-0 bg-slate-950/10"></div>
      </div>

      {/* TELA INICIAL (Primeiros 4 segundos): Título animado no topo/centro */}
      {!mostrarForm && (
        <div className="relative z-10 text-center animate-pulse space-y-2 mt-20 pointer-events-none">
          <h2 className="text-3xl md:text-5xl font-black text-cyan-400 tracking-widest drop-shadow-[0_0_25px_rgba(6,182,212,0.9)]">
            HENARES TECNOLOGIA
          </h2>
          <p className="text-slate-200 text-xs tracking-wider uppercase font-semibold">Carregando ambiente seguro...</p>
        </div>
      )}

      {/* FORMULÁRIO DE LOGIN: Centro-alto com vidro fosco */}
      <div
        className={`relative z-20 w-full max-w-md p-8 bg-slate-950/60 border border-slate-700/60 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-1000 transform ${
          mostrarForm ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-95 pointer-events-none"
        }`}
      >
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-extrabold text-cyan-400 tracking-wider">Henares Tecnologia</h1>
          <p className="text-slate-300 text-xs">Acesso ao Painel Administrativo</p>
        </div>

        {erro && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-xl text-xs font-medium mb-4 text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">Nome de Utilizador</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="admin"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">Senha de Acesso</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="123456"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/30 disabled:opacity-50 mt-2"
          >
            {carregando ? "Autenticando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-800/80 pt-4">
          Projeto Integrador &bull; Engenharia de Computação UNIVESP
        </div>
      </div>
    </main>
  );
}