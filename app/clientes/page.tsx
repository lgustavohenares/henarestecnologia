"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Chamado = {
  id: string;
  nome: string;
  celular?: string;
  cpf?: string;
  email?: string;
  equipamento?: string;
  problema?: string;
  status?: string;
};

export default function ClientesPage() {
  const router = useRouter();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"menu" | "consultar" | "cadastrar" | "excluir">("menu");

  // Estados de Consulta e Edição
  const [termoConsulta, setTermoConsulta] = useState("");
  const [clienteEditando, setClienteEditando] = useState<Chamado | null>(null);
  const [erroEdicao, setErroEdicao] = useState("");

  // Estados de Cadastro
  const [novoNome, setNovoNome] = useState("");
  const [novoCelular, setNovoCelular] = useState("");
  const [novoCpf, setNovoCpf] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoEquipamento, setNovoEquipamento] = useState("");
  const [novoProblema, setNovoProblema] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");

  // Estados de Exclusão e Feedback Global
  const [termoExclusao, setTermoExclusao] = useState("");
  const [sucessoMsg, setSucessoMsg] = useState("");

  // Validações de CPF e E-mail
  function validarCpf(cpf: string): boolean {
    if (!cpf) return true;
    const limpo = cpf.replace(/\D/g, "");
    if (limpo.length !== 11) return false;
    if (/^(\d)\1+$/.test(limpo)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(limpo.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    let digito1 = resto === 10 || resto === 11 ? 0 : resto;
    if (digito1 !== parseInt(limpo.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(limpo.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    let digito2 = resto === 10 || resto === 11 ? 0 : resto;
    return digito2 === parseInt(limpo.charAt(10));
  }

  function validarEmail(email: string): boolean {
    if (!email) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async function carregarDados() {
    try {
      const res = await fetch("/api/chamados");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setChamados(data);
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const clientesConsulta = chamados.filter((c) =>
    c.nome.toLowerCase().includes(termoConsulta.toLowerCase())
  );

  const clientesExclusao = chamados.filter((c) =>
    c.nome.toLowerCase().includes(termoExclusao.toLowerCase())
  );

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErroCadastro("");

    if (novoCpf && !validarCpf(novoCpf)) {
      setErroCadastro("CPF inválido. Verifique os números digitados.");
      return;
    }
    if (novoEmail && !validarEmail(novoEmail)) {
      setErroCadastro("E-mail inválido. Utilize o formato nome@dominio.");
      return;
    }

    try {
      const res = await fetch("/api/chamados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoNome,
          celular: novoCelular || "(11)99999-9999",
          cpf: novoCpf || "",
          email: novoEmail || "",
          equipamento: novoEquipamento || "Outros",
          problema: novoProblema || "Aberto via Gestão de Clientes",
          status: "Aberto",
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        setSucessoMsg("Cliente cadastrado com sucesso!");
        setNovoNome("");
        setNovoCelular("");
        setNovoCpf("");
        setNovoEmail("");
        setNovoEquipamento("");
        setNovoProblema("");
        setAbaAtiva("menu");
        carregarDados();
        setTimeout(() => setSucessoMsg(""), 4000);
      } else {
        setErroCadastro(`Erro ao cadastrar: ${resData.message || "Erro desconhecido"}`);
      }
    } catch (err) {
      setErroCadastro("Erro de conexão ao tentar cadastrar.");
    }
  }

  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    setErroEdicao("");

    if (clienteEditando?.cpf && !validarCpf(clienteEditando.cpf)) {
      setErroEdicao("CPF inválido. Verifique os dígitos.");
      return;
    }
    if (clienteEditando?.email && !validarEmail(clienteEditando.email)) {
      setErroEdicao("E-mail inválido (formato exigido: nome@dominio).");
      return;
    }

    try {
      const res = await fetch("/api/chamados", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteEditando),
      });

      const dataRes = await res.json();

      if (res.ok) {
        setSucessoMsg("Dados atualizados com sucesso!");
        setClienteEditando(null);
        carregarDados();
        setTimeout(() => setSucessoMsg(""), 4000);
      } else {
        setErroEdicao(`Erro ao atualizar: ${dataRes.message || "Erro desconhecido"}`);
      }
    } catch (err) {
      setErroEdicao("Erro de conexão ao tentar atualizar.");
    }
  }

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir o cadastro e os chamados de "${nome}"?`)) return;

    try {
      const res = await fetch(`/api/chamados?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSucessoMsg("Cliente e dados relacionados excluídos com sucesso!");
        carregarDados();
        setTimeout(() => setSucessoMsg(""), 4000);
      } else {
        alert("Erro ao excluir cliente.");
      }
    } catch (err) {
      alert("Erro de conexão ao excluir.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-6">

        {/* CABEÇALHO */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Módulo de Clientes</h1>
            <p className="text-slate-400 text-sm">Henares Tecnologia - Gestão Unificada</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-slate-700"
          >
            Voltar ao Dashboard
          </button>
        </div>

        {sucessoMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-xl text-sm font-medium">
            {sucessoMsg}
          </div>
        )}

        {/* MENU PRINCIPAL */}
        {abaAtiva === "menu" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div
              onClick={() => setAbaAtiva("consultar")}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 p-6 rounded-2xl shadow-xl cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="text-lg font-bold text-cyan-400 group-hover:text-cyan-300">Consulta</h3>
                <p className="text-slate-400 text-xs mt-1">Pesquise clientes cadastrados em tempo real e edite informações detalhadas.</p>
              </div>
              <span className="text-xs font-bold text-cyan-400 underline">Acessar Consulta &rarr;</span>
            </div>

            <div
              onClick={() => { setAbaAtiva("cadastrar"); setErroCadastro(""); }}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 p-6 rounded-2xl shadow-xl cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="text-3xl mb-2">➕</div>
                <h3 className="text-lg font-bold text-emerald-400 group-hover:text-emerald-300">Cadastrar Novo</h3>
                <p className="text-slate-400 text-xs mt-1">Preencha novos cadastros de clientes com validação de CPF e E-mail.</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 underline">Acessar Cadastro &rarr;</span>
            </div>

            <div
              onClick={() => setAbaAtiva("excluir")}
              className="bg-slate-900 border border-slate-800 hover:border-red-500/60 p-6 rounded-2xl shadow-xl cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="text-3xl mb-2">🗑️</div>
                <h3 className="text-lg font-bold text-red-400 group-hover:text-red-300">Excluir</h3>
                <p className="text-slate-400 text-xs mt-1">Remova cadastros de clientes e limpe todos os chamados relacionados do banco.</p>
              </div>
              <span className="text-xs font-bold text-red-400 underline">Acessar Exclusão &rarr;</span>
            </div>
          </div>
        )}

        {/* 1. SEÇÃO CONSULTAR */}
        {abaAtiva === "consultar" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-cyan-400">🔍 Consultar & Editar Clientes</h2>
              <button onClick={() => setAbaAtiva("menu")} className="text-xs text-slate-400 hover:text-white font-semibold">
                &larr; Voltar ao Menu
              </button>
            </div>

            <input
              type="text"
              value={termoConsulta}
              onChange={(e) => setTermoConsulta(e.target.value)}
              placeholder="Digite o nome do cliente para pesquisar..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            {termoConsulta.trim() !== "" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {clientesConsulta.length > 0 ? (
                  clientesConsulta.map((cli) => (
                    <div
                      key={cli.id}
                      onClick={() => { setClienteEditando(cli); setErroEdicao(""); }}
                      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 p-4 rounded-xl space-y-1 cursor-pointer transition-all shadow"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-cyan-400 text-sm">{cli.nome}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">Editar ✏️</span>
                      </div>
                      <div className="text-xs text-slate-300">Celular: {cli.celular || "N/A"}</div>
                      <div className="text-xs text-slate-300">CPF: {cli.cpf || "N/A"}</div>
                      <div className="text-xs text-slate-300">Email: {cli.email || "N/A"}</div>
                      <div className="text-xs text-slate-400">Equipamento: {cli.equipamento || "Geral"}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic col-span-3">Nenhum cliente encontrado com este nome.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. SEÇÃO CADASTRAR NOVO */}
        {abaAtiva === "cadastrar" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-emerald-400">➕ Cadastrar Novo Cliente</h2>
              <button onClick={() => setAbaAtiva("menu")} className="text-xs text-slate-400 hover:text-white font-semibold">
                &larr; Voltar ao Menu
              </button>
            </div>

            {erroCadastro && (
              <div className="bg-red-500/25 border border-red-500 text-red-300 p-3 rounded-xl text-xs font-medium">
                {erroCadastro}
              </div>
            )}

            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Celular</label>
                  <input
                    type="text"
                    value={novoCelular}
                    onChange={(e) => setNovoCelular(e.target.value)}
                    placeholder="(11)98888-7777"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">CPF Válido</label>
                  <input
                    type="text"
                    value={novoCpf}
                    onChange={(e) => setNovoCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">E-mail (nome@dominio)</label>
                <input
                  type="text"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Equipamento</label>
                  <input
                    type="text"
                    value={novoEquipamento}
                    onChange={(e) => setNovoEquipamento(e.target.value)}
                    placeholder="Ex: Notebook"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Problema Inicial</label>
                  <input
                    type="text"
                    value={novoProblema}
                    onChange={(e) => setNovoProblema(e.target.value)}
                    placeholder="Relato do problema"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-lg"
              >
                Salvar Novo Cliente
              </button>
            </form>
          </div>
        )}

        {/* 3. SEÇÃO EXCLUIR */}
        {abaAtiva === "excluir" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xl font-bold text-red-400">🗑️ Excluir Cliente e Chamados</h2>
              <button onClick={() => setAbaAtiva("menu")} className="text-xs text-slate-400 hover:text-white font-semibold">
                &larr; Voltar ao Menu
              </button>
            </div>

            <input
              type="text"
              value={termoExclusao}
              onChange={(e) => setTermoExclusao(e.target.value)}
              placeholder="Pesquise o nome do cliente que deseja excluir..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />

            {termoExclusao.trim() !== "" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {clientesExclusao.length > 0 ? (
                  clientesExclusao.map((cli) => (
                    <div
                      key={cli.id}
                      className="bg-slate-800/80 border border-red-500/30 p-4 rounded-xl space-y-2 shadow"
                    >
                      <div className="font-bold text-white text-sm">{cli.nome}</div>
                      <div className="text-xs text-slate-400">CPF: {cli.cpf || "N/A"}</div>
                      <div className="text-xs text-slate-400">Equipamento: {cli.equipamento || "N/A"}</div>
                      <button
                        onClick={() => handleExcluir(cli.id, cli.nome)}
                        className="w-full bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/50 py-2 rounded-lg text-xs font-bold transition-all"
                      >
                        Excluir Cliente e Chamados ⚠️
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic col-span-3">Nenhum cliente encontrado para exclusão.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODAL DE EDIÇÃO COM MENSAGEM DE ERRO DETALHADA E VISÍVEL */}
        {clienteEditando && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-cyan-400">Editar Cliente</h3>
                <button onClick={() => setClienteEditando(null)} className="text-slate-400 hover:text-white text-sm font-bold">
                  ✕ Fechar
                </button>
              </div>

              {erroEdicao && (
                <div className="bg-red-500/25 border border-red-500 text-red-300 p-3 rounded-xl text-xs font-medium">
                  {erroEdicao}
                </div>
              )}

              <form onSubmit={handleSalvarEdicao} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={clienteEditando.nome || ""}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, nome: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Celular</label>
                    <input
                      type="text"
                      value={clienteEditando.celular || ""}
                      onChange={(e) => setClienteEditando({ ...clienteEditando, celular: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">CPF Válido</label>
                    <input
                      type="text"
                      value={clienteEditando.cpf || ""}
                      onChange={(e) => setClienteEditando({ ...clienteEditando, cpf: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">E-mail</label>
                    <input
                      type="text"
                      value={clienteEditando.email || ""}
                      onChange={(e) => setClienteEditando({ ...clienteEditando, email: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Equipamento</label>
                  <input
                    type="text"
                    value={clienteEditando.equipamento || ""}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, equipamento: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Problema</label>
                  <textarea
                    value={clienteEditando.problema || ""}
                    onChange={(e) => setClienteEditando({ ...clienteEditando, problema: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setClienteEditando(null)}
                    className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-xs"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-800 pt-6 mt-8">
        Henares Tecnologia &bull; Projeto Integrador - Engenharia de Computação UNIVESP
      </footer>
    </main>
  );
}