"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConsultaClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  // Estado para controlar a edição
  const [clienteEditando, setClienteEditando] = useState<any | null>(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("clientes").select("*").order("nome", { ascending: true });
    if (!error && data) {
      setClientes(data);
    }
    setLoading(false);
  };

  // Filtra apenas se houver texto digitado na busca
  const clientesFiltrados = busca.trim() === "" ? [] : clientes.filter((c) =>
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteEditando) return;

    const { error } = await supabase
      .from("clientes")
      .update(clienteEditando)
      .eq("id", clienteEditando.id);

    if (error) {
      setMensagem(`Erro ao atualizar: ${error.message}`);
    } else {
      setMensagem("Cliente atualizado com sucesso!");
      setClienteEditando(null);
      carregarClientes();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold">Consulta e Edição de Clientes</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-md transition-colors"
          >
            Voltar
          </button>
        </div>

        {mensagem && (
          <div className="p-4 rounded-md bg-gray-900 border border-gray-700 text-sm">
            {mensagem}
          </div>
        )}

        {/* Barra de Pesquisa */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Pesquisar Cliente</label>
          <input
            type="text"
            placeholder="Digite o nome ou e-mail do cliente..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setClienteEditando(null);
            }}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Modal / Formulário de Edição (Aparece apenas quando clica em Editar) */}
        {clienteEditando ? (
          <form onSubmit={handleSalvarEdicao} className="space-y-6 bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h2 className="text-xl font-semibold text-white">Editar Cliente: {clienteEditando.nome}</h2>
              <button
                type="button"
                onClick={() => setClienteEditando(null)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={clienteEditando.nome || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, nome: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={clienteEditando.email || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                <input
                  type="text"
                  value={clienteEditando.telefone || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, telefone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        ) : (
          /* Lista em formato de Cards ao digitar */
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-gray-500 py-4">A carregar...</p>
            ) : busca.trim() === "" ? (
              <p className="text-center text-gray-500 py-8">Comece a digitar no campo acima para encontrar o cliente.</p>
            ) : clientesFiltrados.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Nenhum cliente encontrado com este nome.</p>
            ) : (
              clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex justify-between items-center hover:border-gray-700 transition-all"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">{cliente.nome}</h3>
                    <p className="text-sm text-gray-400">
                      {cliente.email ? `E-mail: ${cliente.email}` : "Sem e-mail"} | {cliente.telefone ? `Tel: ${cliente.telefone}` : "Sem telefone"}
                    </p>
                  </div>
                  <button
                    onClick={() => setClienteEditando(cliente)}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-sm font-medium rounded-md transition-colors border border-blue-500/30"
                  >
                    Editar
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}