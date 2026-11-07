"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NovoChamadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Lista de clientes cadastrados no banco
  const [clientes, setClientes] = useState<any[]>([]);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  // Equipamento
  const [tipoEquipamento, setTipoEquipamento] = useState("Notebook");
  const [outroEquipamento, setOutroEquipamento] = useState("");

  // Prioridade e Problema
  const [prioridade, setPrioridade] = useState("Média");
  const [problema, setProblema] = useState("");

  // Agendamento
  const [querAgendar, setQuerAgendar] = useState("nao");
  const [dataAgendamento, setDataAgendamento] = useState("");
  const [horaAgendamento, setHoraAgendamento] = useState("");

  // Carregar clientes ao iniciar
  useEffect(() => {
    async function carregarClientes() {
      const { data, error } = await supabase.from("clientes").select("*").order("nome", { ascending: true });
      if (!error && data) {
        setClientes(data);
      }
    }
    carregarClientes();
  }, []);

  // Filtrar clientes conforme digita
  const clientesFiltrados = clientes.filter((c) =>
    c.nome?.toLowerCase().includes(buscaCliente.toLowerCase())
  );

  // Selecionar um cliente existente
  const selecionarCliente = (cliente: any) => {
    setClienteSelecionado(cliente);
    setBuscaCliente(cliente.nome);
    setMostrarDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!clienteSelecionado) {
      alert("Por favor, selecione um cliente cadastrado antes de abrir o chamado.");
      setLoading(false);
      return;
    }

    const equipamentoFinal =
      tipoEquipamento === "Outros" ? `Outros: ${outroEquipamento}` : tipoEquipamento;

    // Montar endereço completo automaticamente a partir dos dados do cliente cadastrado
    const enderecoCompleto = `${clienteSelecionado.logradouro || ""}, Nº ${clienteSelecionado.numero || "S/N"}${
      clienteSelecionado.complemento ? ` (${clienteSelecionado.complemento})` : ""
    } - ${clienteSelecionado.bairro || ""}, ${clienteSelecionado.cidade || ""}/${clienteSelecionado.uf || ""} (CEP: ${clienteSelecionado.cep || ""})`;

    const numeroChamado5Digitos = String(Math.floor(10000 + Math.random() * 90000));

    let statusFinal = "Aberto";
    let dataAgendamentoFormatada = undefined;

    if (querAgendar === "sim") {
      if (!dataAgendamento || !horaAgendamento) {
        alert("Por favor, selecione a data e o horário para o agendamento.");
        setLoading(false);
        return;
      }
      statusFinal = "Agendado";
      dataAgendamentoFormatada = `${dataAgendamento} às ${horaAgendamento}`;
    }

    try {
      const response = await fetch("/api/chamados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteSelecionado.id,
          nome: clienteSelecionado.nome,
          celular: clienteSelecionado.telefone || "",
          endereco: enderecoCompleto,
          equipamento: equipamentoFinal,
          prioridade,
          problema,
          status: statusFinal,
          numero_chamado: numeroChamado5Digitos,
          data_agendamento: dataAgendamentoFormatada,
        }),
      });

      if (response.ok) {
        alert(`Chamado nº ${numeroChamado5Digitos} registrado com sucesso!`);
        router.push("/admin");
      } else {
        const errorData = await response.json();
        alert("Erro ao registrar chamado: " + (errorData.error || errorData.message || "Tente novamente."));
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">Abrir Novo Chamado</h1>
            <p className="text-slate-400 text-sm">Selecione o cliente e preencha os dados do atendimento</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="text-slate-400 hover:text-white text-sm bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* BUSCA DE CLIENTE CADASTRADO */}
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300">Cliente Cadastrado *</label>
              <button
                type="button"
                onClick={() => router.push("/clientes/novo")}
                className="text-xs text-cyan-400 hover:underline"
              >
                + Cadastrar Novo Cliente
              </button>
            </div>
            <input
              type="text"
              required
              value={buscaCliente}
              onChange={(e) => {
                setBuscaCliente(e.target.value);
                setClienteSelecionado(null);
                setMostrarDropdown(true);
              }}
              onFocus={() => setMostrarDropdown(true)}
              placeholder="Digite o nome do cliente..."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
            />

            {/* Dropdown de sugestões de clientes */}
            {mostrarDropdown && buscaCliente.trim() !== "" && !clienteSelecionado && (
              <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {clientesFiltrados.length === 0 ? (
                  <div className="p-3 text-sm text-slate-400 flex justify-between items-center">
                    <span>Nenhum cliente encontrado.</span>
                    <button
                      type="button"
                      onClick={() => router.push("/clientes/novo")}
                      className="px-2 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-500"
                    >
                      Cadastrar
                    </button>
                  </div>
                ) : (
                  clientesFiltrados.map((cli) => (
                    <div
                      key={cli.id}
                      onClick={() => selecionarCliente(cli)}
                      className="p-3 hover:bg-slate-700 cursor-pointer text-sm border-b border-slate-700/50 last:border-none"
                    >
                      <p className="font-semibold text-white">{cli.nome}</p>
                      <p className="text-xs text-slate-400">Tel: {cli.telefone || "Não informado"} | {cli.cidade || "Sem cidade"}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* TIPO DE EQUIPAMENTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Equipamento *</label>
              <select
                value={tipoEquipamento}
                onChange={(e) => setTipoEquipamento(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              >
                <option value="Notebook">Notebook</option>
                <option value="CPU">CPU</option>
                <option value="Impressora">Impressora</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            {tipoEquipamento === "Outros" ? (
              <div>
                <label className="block text-xs font-semibold text-cyan-400 mb-1">Especifique o Equipamento *</label>
                <input
                  type="text"
                  required
                  value={outroEquipamento}
                  onChange={(e) => setOutroEquipamento(e.target.value)}
                  placeholder="Ex: Roteador, Tablet..."
                  className="w-full p-3 bg-slate-800 border border-cyan-500/50 rounded-lg text-white outline-none text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridade *</label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            )}
          </div>

          {tipoEquipamento === "Outros" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridade *</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          )}

          {/* DESEJA AGENDAR */}
          <div>
            <label className="block text-xs font-semibold text-purple-400 mb-1">Deseja Agendar Atendimento?</label>
            <select
              value={querAgendar}
              onChange={(e) => setQuerAgendar(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-purple-500/50 rounded-lg text-white focus:border-purple-400 outline-none text-sm font-medium"
            >
              <option value="nao">Não (Abrir chamado comum)</option>
              <option value="sim">Sim (Escolher data e horário)</option>
            </select>
          </div>

          {querAgendar === "sim" && (
            <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-xl space-y-4">
              <p className="text-xs font-semibold text-purple-300">Selecione o Agendamento:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    value={dataAgendamento}
                    onChange={(e) => setDataAgendamento(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-purple-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Horário</label>
                  <input
                    type="time"
                    value={horaAgendamento}
                    onChange={(e) => setHoraAgendamento(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-purple-400 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DESCRIÇÃO DO PROBLEMA */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Problema *</label>
            <textarea
              required
              rows={4}
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
              placeholder="Descreva detalhadamente a falha ou serviço necessário..."
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
            ></textarea>
          </div>

          {/* BOTÃO SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? "A registrar chamado..." : "Confirmar e Abrir Chamado"}
          </button>
        </form>
      </div>
    </main>
  );
}