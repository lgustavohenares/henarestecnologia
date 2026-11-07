"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ExcluirClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) return;

    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      setMensagem(`Erro ao excluir: ${error.message}`);
    } else {
      setMensagem(`Cliente "${nome}" excluído com sucesso.`);
      carregarClientes();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold">Gestão e Exclusão de Clientes</h1>
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

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <p className="p-6 text-center text-gray-400">A carregar clientes...</p>
          ) : clientes.length === 0 ? (
            <p className="p-6 text-center text-gray-400">Nenhum cliente registado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-950/50 text-gray-400 text-sm">
                    <th className="p-4">Nome</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Telefone</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-800/50">
                      <td className="p-4 font-medium text-white">{cliente.nome}</td>
                      <td className="p-4 text-gray-300">{cliente.email || "-"}</td>
                      <td className="p-4 text-gray-300">{cliente.telefone || "-"}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleExcluir(cliente.id, cliente.nome)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}