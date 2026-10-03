"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const entrar = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      usuario === "admin" &&
      senha === "123456"
    ) {
      router.push("/dashboard");
      return;
    }

    alert("Usuário ou senha inválidos.");
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/background.png')",
      }}
    >
      <div className="bg-black/60 backdrop-blur-md rounded-2xl p-10 w-full max-w-md shadow-2xl border border-cyan-500">

        <h1 className="text-4xl text-center font-bold text-cyan-400 mb-2">
          Henares Tecnologia
        </h1>

        <p className="text-center text-white mb-8">
          Sistema de Gestão Técnica
        </p>

        <form
          onSubmit={entrar}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="E-mail"
            value={usuario}
            onChange={(e) =>
              setUsuario(e.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600"
          />

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold p-3 rounded-lg"
          >
            Entrar
          </button>
        </form>

      </div>
    </main>
  );
}