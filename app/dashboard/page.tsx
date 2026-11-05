"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-8">

        {/* CABEÇALHO */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Henares Tecnologia</h1>
            <p className="text-slate-400 text-sm">Dashboard Principal - Projeto Integrador</p>
          </div>
        </div>

        {/* OS TRÊS CARDS SOLICITADOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">

          {/* Card 1: Novo Chamado */}
          <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all">
            <div>
              <div className="text-cyan-400 font-bold text-lg mb-2">Novo Atendimento</div>
              <p className="text-slate-400 text-xs mb-6">
                Abra um novo chamado técnico com seleção de equipamentos, busca por CEP e automações de status.
              </p>
            </div>
            <button
              onClick={() => router.push("/chamados/novo")}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-lg w-full"
            >
              + Abrir Chamado
            </button>
          </div>

          {/* Card 2: Administração */}
          <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all">
            <div>
              <div className="text-purple-400 font-bold text-lg mb-2">Administração & Agenda</div>
              <p className="text-slate-400 text-xs mb-6">
                Gerencie o painel operacional de chamados ativos e a agenda interativa com suporte a drag-and-drop.
              </p>
            </div>
            <button
              onClick={() => router.push("/admin")}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-lg w-full"
            >
              Acessar Painel Admin
            </button>
          </div>

          {/* Card 3: Clientes */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all">
            <div>
              <div className="text-amber-400 font-bold text-lg mb-2">Consulta Clientes</div>
              <p className="text-slate-400 text-xs mb-6">
                Consulte clientes cadastrados em tempo real, valide CPF e E-mail, cadastre novos e edite informações.
              </p>
            </div>
            <button
              onClick={() => router.push("/clientes")}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-lg w-full"
            >
              Gerenciar Clientes
            </button>
          </div>

        </div>

      </div>

      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-800 pt-6 mt-8">
        Henares Tecnologia &bull; Projeto Integrador - Engenharia de Computação UNIVESP
      </footer>
    </main>
  );
}