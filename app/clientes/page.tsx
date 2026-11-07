"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ModuloClientesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Cabeçalho com o botão Voltar no topo */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Módulo de Clientes</h1>
            <p className="text-sm text-gray-400">Henares Tecnologia - Gestão Unificada</p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm text-white font-medium rounded-md transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>

        {/* Cartões de Acesso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">

          {/* Consulta */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4 hover:border-gray-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-900/40 flex items-center justify-center text-blue-400 font-bold">
              🔍
            </div>
            <h2 className="text-xl font-semibold text-white">Consulta</h2>
            <p className="text-sm text-gray-400">
              Pesquise clientes cadastrados em tempo real e edite informações detalhadas.
            </p>
            <div>
              <Link
                href="/clientes/consulta"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                Acessar Consulta →
              </Link>
            </div>
          </div>

          {/* Cadastrar Novo */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4 hover:border-gray-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-green-900/40 flex items-center justify-center text-green-400 font-bold">
              +
            </div>
            <h2 className="text-xl font-semibold text-white">Cadastrar Novo</h2>
            <p className="text-sm text-gray-400">
              Preencha novos cadastros de clientes com validação de endereço e E-mail.
            </p>
            <div>
              <Link
                href="/clientes/novo"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                Acessar Cadastro →
              </Link>
            </div>
          </div>

          {/* Excluir */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4 hover:border-gray-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-red-900/40 flex items-center justify-center text-red-400 font-bold">
              🗑️
            </div>
            <h2 className="text-xl font-semibold text-white">Excluir</h2>
            <p className="text-sm text-gray-400">
              Remova cadastros de clientes e limpe registros relacionados do banco.
            </p>
            <div>
              <Link
                href="/clientes/excluir"
                className="text-sm text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
              >
                Acessar Exclusão →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}