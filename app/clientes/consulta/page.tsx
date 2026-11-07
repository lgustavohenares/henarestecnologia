"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConsultaClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  // Estado para controlar a edição (armazena todos os campos do cliente selecionado)
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

  // Máscara e formatador automático de CPF / CNPJ
  const aplicarMascaraCpfCnpj = (valor: string) => {
    if (!valor) return "";
    const limpo = valor.replace(/\D/g, "");

    if (limpo.length <= 11) {
      return limpo
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return limpo
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

  // Buscar CEP automaticamente ao editar
  const buscarCep = async (cepValor: string) => {
    const cepLimpo = cepValor ? cepValor.replace(/\D/g, "") : "";
    setClienteEditando((prev: any) => ({ ...prev, cep: cepLimpo }));

    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setClienteEditando((prev: any) => ({
            ...prev,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            uf: data.uf || "",
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  // Filtra apenas se houver texto digitado na busca
  const clientesFiltrados = busca.trim() === "" ? [] : clientes.filter((c) =>
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase()) ||
    c.documento?.toLowerCase().includes(busca.toLowerCase())
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
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-cyan-400">Consulta e Edição de Clientes</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm rounded-md transition-colors border border-slate-700"
          >
            Voltar
          </button>
        </div>

        {mensagem && (
          <div className="p-4 rounded-md bg-slate-900 border border-slate-700 text-sm text-cyan-300">
            {mensagem}
          </div>
        )}

        {/* Barra de Pesquisa */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Pesquisar Cliente</label>
          <input
            type="text"
            placeholder="Digite o nome, e-mail ou documento do cliente..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setClienteEditando(null);
            }}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Formulário de Edição Completo (Aparece apenas quando clica em Editar) */}
        {clienteEditando ? (
          <form onSubmit={handleSalvarEdicao} className="space-y-6 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xl font-semibold text-cyan-400">Editar Cliente: {clienteEditando.nome}</h2>
              <button
                type="button"
                onClick={() => setClienteEditando(null)}
                className="text-sm text-slate-400 hover:text-white bg-slate-800 px-3 py-1 rounded-md border border-slate-700"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo / Empresa *</label>
                <input
                  type="text"
                  required
                  value={clienteEditando.nome || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, nome: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">CPF ou CNPJ *</label>
                <input
                  type="text"
                  required
                  value={clienteEditando.documento || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, documento: aplicarMascaraCpfCnpj(e.target.value) })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Telemóvel / WhatsApp</label>
                <input
                  type="text"
                  value={clienteEditando.telefone || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, telefone: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={clienteEditando.email || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, email: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <hr className="border-slate-800 my-4" />

            {/* ENDEREÇO (TODOS OS CAMPOS TOTALMENTE EDITÁVEIS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">CEP</label>
                <input
                  type="text"
                  maxLength={9}
                  value={clienteEditando.cep || ""}
                  onChange={(e) => buscarCep(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Número</label>
                <input
                  type="text"
                  value={clienteEditando.numero || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, numero: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Complemento</label>
                <input
                  type="text"
                  value={clienteEditando.complemento || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, complemento: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Logradouro / Rua</label>
              <input
                type="text"
                value={clienteEditando.logradouro || ""}
                onChange={(e) => setClienteEditando({ ...clienteEditando, logradouro: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bairro</label>
                <input
                  type="text"
                  value={clienteEditando.bairro || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, bairro: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade</label>
                <input
                  type="text"
                  value={clienteEditando.cidade || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, cidade: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado (UF)</label>
                <input
                  type="text"
                  value={clienteEditando.uf || ""}
                  onChange={(e) => setClienteEditando({ ...clienteEditando, uf: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors shadow-lg text-sm w-full"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        ) : (
          /* Lista em formato de Cards ao digitar */
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-slate-500 py-4">A carregar...</p>
            ) : busca.trim() === "" ? (
              <p className="text-center text-slate-500 py-8">Comece a digitar no campo acima para encontrar o cliente.</p>
            ) : clientesFiltrados.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Nenhum cliente encontrado com este termo.</p>
            ) : (
              clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">{cliente.nome}</h3>
                    <p className="text-sm text-slate-400">
                      DOC: {cliente.documento || "Não informado"} | Tel: {cliente.telefone || "Sem telefone"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {cliente.email ? `E-mail: ${cliente.email}` : "Sem e-mail"}
                    </p>
                  </div>
                  <button
                    onClick={() => setClienteEditando(cliente)}
                    className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white text-sm font-medium rounded-lg transition-colors border border-cyan-500/30"
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