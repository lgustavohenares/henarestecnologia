"use client";

import { useState } from "react";

export default function Home() {
  const [nome, setNome] = useState("");
  const [problema, setProblema] = useState("");

  const enviarChamado = async (e: React.FormEvent) => {
    e.preventDefault();

    alert(
      `Chamado registrado!\n\nNome: ${nome}\nProblema: ${problema}`
    );

    setNome("");
    setProblema("");
  };

  return (
    <main className="max-w-3xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">
        Sistema de Chamados
      </h1>

      <form onSubmit={enviarChamado} className="space-y-4">
        <input
          className="border p-2 rounded w-full"
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <textarea
          className="border p-2 rounded w-full"
          placeholder="Descreva o problema"
          rows={5}
          value={problema}
          onChange={(e) => setProblema(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded"
        >
          Abrir Chamado
        </button>
      </form>
    </main>
  );
}