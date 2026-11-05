"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Chamado = {
  id: string;
  numero_chamado?: string;
  nome: string;
  celular: string;
  equipamento?: string;
  problema: string;
  status: string;
  data_agendamento?: string;
  created_at?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarChamados() {
    try {
      const res = await fetch("/api/chamados");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setChamados(data);
      }
    } catch (err) {
      console.error("Erro ao carregar chamados:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarChamados();
  }, []);

  // Função para atualizar o status do chamado
  async function atualizarStatus(id: string, novoStatus: string) {
    try {
      const res = await fetch("/api/chamados", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: novoStatus }),
      });

      if (res.ok) {
        carregarChamados();
      } else {
        alert("Erro ao atualizar status.");
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      alert("Erro ao atualizar o chamado.");
    }
  }

  // Função para excluir o chamado permanentemente do banco de dados
  async function excluirChamado(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o chamado de "${nome}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/chamados", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const dataRes = await res.json();

      if (res.ok) {
        carregarChamados();
      } else {
        alert(`Erro ao excluir: ${dataRes.message || "Erro desconhecido"}`);
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      alert("Erro de conexão ao tentar excluir.");
    }
  }

  // Métricas rápidas
  const totalAbertos = chamados.filter((c) => c.status === "Aberto").length;
  const totalEmAndamento = chamados.filter((c) => c.status === "Em andamento" || c.status === "Em Andamento").length;
  const totalAgendados = chamados.filter((c) => c.status === "Agendado").length;
  const totalConcluidos = chamados.filter((c) => c.status === "Concluído" || c.status === "Finalizado").length;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Painel Administrativo</h1>
            <p className="text-slate-400 text-sm">Gestão operacional de chamados técnicos - Henares Tecnologia</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/agenda")}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg flex items-center gap-2"
            >
              📅 Ver Agenda Interativa
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-slate-700"
            >
              Voltar ao Dashboard
            </button>
            <button
              onClick={() => router.push("/chamados/novo")}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
            >
              + Abrir Chamado
            </button>
          </div>
        </div>

        {/* MÉTRICAS RÁPIDAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Abertos</div>
            <div className="text-3xl font-bold mt-2">{totalAbertos}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Em Atendimento</div>
            <div className="text-3xl font-bold mt-2">{totalEmAndamento}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Agendados</div>
            <div className="text-3xl font-bold mt-2">{totalAgendados}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Concluídos</div>
            <div className="text-3xl font-bold mt-2">{totalConcluidos}</div>
          </div>
        </div>

        {/* LISTAGEM DE CHAMADOS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-xl font-bold text-white">Chamados Operacionais</h2>

          {loading ? (
            <p className="text-slate-400 py-4">A carregar chamados...</p>
          ) : chamados.length === 0 ? (
            <p className="text-slate-500 italic py-4">Nenhum chamado registado no momento.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Nº / Cliente</th>
                    <th className="p-3">Equipamento</th>
                    <th className="p-3">Problema</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Data Agenda</th>
                    <th className="p-3 rounded-r-xl text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {chamados.map((chamado) => {
                    const num = chamado.numero_chamado ? `#${chamado.numero_chamado}` : `#${chamado.id.slice(0, 5)}`;
                    const emAndamento = chamado.status === "Em andamento" || chamado.status === "Em Andamento";

                    return (
                      <tr key={chamado.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-medium text-white">
                          <div className="text-cyan-400 font-bold text-xs">{num}</div>
                          <div>{chamado.nome}</div>
                          <div className="text-xs text-slate-400">{chamado.celular}</div>
                        </td>
                        <td className="p-3 text-slate-300">{chamado.equipamento || "Geral"}</td>
                        <td className="p-3 text-slate-400 max-w-xs truncate">{chamado.problema}</td>
                        <td className="p-3">
                          {/* Badge com animação pulsante para "Em andamento" */}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${
                            chamado.status === "Aberto" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                            emAndamento ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.3)]" :
                            chamado.status === "Agendado" ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" :
                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {emAndamento && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                            )}
                            {chamado.status}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-slate-400">{chamado.data_agendamento || "Não agendado"}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => atualizarStatus(chamado.id, "Em andamento")}
                            className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-all border border-cyan-500/30"
                            title="Colocar em atendimento"
                          >
                            Atender
                          </button>
                          <button
                            onClick={() => atualizarStatus(chamado.id, "Concluído")}
                            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-all border border-emerald-500/30"
                            title="Finalizar chamado"
                          >
                            Finalizar
                          </button>
                          <button
                            onClick={() => excluirChamado(chamado.id, chamado.nome)}
                            className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-all border border-red-500/30"
                            title="Excluir chamado permanentemente do banco"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-800 pt-6 mt-12">
        Henares Tecnologia &bull; Projeto Integrador - Engenharia de Computação UNIVESP
      </footer>
    </main>
  );
}