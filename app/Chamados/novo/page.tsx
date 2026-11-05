"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoChamadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Campos do Formulário
  const [nome, setNome] = useState("");
  const [celular, setCelular] = useState("");

  // Endereço via CEP
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");

  // Equipamento (Select + Campo extra se "Outros")
  const [tipoEquipamento, setTipoEquipamento] = useState("Notebook");
  const [outroEquipamento, setOutroEquipamento] = useState("");

  const [prioridade, setPrioridade] = useState("Média");
  const [problema, setProblema] = useState("");

  // Lógica de Agendamento (Sim / Não)
  const [querAgendar, setQuerAgendar] = useState("nao");
  const [dataAgendamento, setDataAgendamento] = useState("");
  const [horaAgendamento, setHoraAgendamento] = useState("");

  // Máscara automática para telefone: (00)0000-0000 ou (00)00000-0000
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length > 6) {
      valor = `(${valor.slice(0, 2)})${valor.slice(2, 7)}-${valor.slice(7)}`;
    } else if (valor.length > 2) {
      valor = `(${valor.slice(0, 2)})${valor.slice(2)}`;
    } else if (valor.length > 0) {
      valor = `(${valor}`;
    }
    setCelular(valor);
  };

  // Buscar CEP automaticamente
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cepLimpo = e.target.value.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setLogradouro(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
      } else {
        alert("CEP não encontrado.");
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validação do telefone
    const regexTel = /^\(\d{2}\)\d{4,5}-\d{4}$/;
    if (!regexTel.test(celular)) {
      alert("Por favor, preencha o telemóvel no formato correto: (XX)XXXX-XXXX ou (XX)XXXXX-XXXX");
      setLoading(false);
      return;
    }

    // Definir equipamento final
    const equipamentoFinal =
      tipoEquipamento === "Outros" ? `Outros: ${outroEquipamento}` : tipoEquipamento;

    // Endereço completo formatado
    const enderecoCompleto = `${logradouro}, Nº ${numero}${complemento ? ` (${complemento})` : ""} - ${bairro}, ${cidade}/${estado} (CEP: ${cep})`;

    // Gerar número do chamado de 5 dígitos
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
          nome,
          equipamento: equipamentoFinal,
          endereco: enderecoCompleto,
          celular,
          prioridade,
          problema,
          status: statusFinal,
          numero_chamado: numeroChamado5Digitos,
          data_agendamento: dataAgendamentoFormatada,
        }),
      });

      if (response.ok) {
        alert(`Chamado nº ${numeroChamado5Digitos} registrado com sucesso!`);
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        alert("Erro ao registrar chamado: " + (errorData.message || "Tente novamente."));
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
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">Abrir Novo Chamado</h1>
            <p className="text-slate-400 text-sm">Preencha os dados do atendimento técnico</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-slate-400 hover:text-white text-sm bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NOME E CELULAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Cliente *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Telemóvel / WhatsApp *</label>
              <input
                type="text"
                required
                value={celular}
                onChange={handleTelefoneChange}
                placeholder="(00)00000-0000"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* EQUIPAMENTO E ESPECIFICAÇÃO SE "OUTROS" */}
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">CEP *</label>
                <input
                  type="text"
                  required
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
                />
              </div>
            )}
          </div>

          {tipoEquipamento === "Outros" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CEP *</label>
              <input
                type="text"
                required
                maxLength={9}
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onBlur={handleCepBlur}
                placeholder="00000-000"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
          )}

          {/* ENDEREÇO AUTO-PREENCHIDO (LOGRADOURO E BAIRRO) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Logradouro / Rua</label>
              <input
                type="text"
                readOnly
                value={logradouro}
                placeholder="Preenchido via CEP"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 outline-none text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número *</label>
              <input
                type="text"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex: 123"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* COMPLEMENTO, BAIRRO, CIDADE E ESTADO */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Complemento</label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Ex: Apto 42"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bairro</label>
              <input
                type="text"
                readOnly
                value={bairro}
                placeholder="Bairro"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 outline-none text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade</label>
              <input
                type="text"
                readOnly
                value={cidade}
                placeholder="Cidade"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 outline-none text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
              <input
                type="text"
                readOnly
                value={estado}
                placeholder="UF"
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 outline-none text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* PRIORIDADE E DESEJA AGENDAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridade</label>
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
          </div>

          {/* CAMPOS DE DATA E HORA SE 'SIM' */}
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">Horário</label>
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

          {/* PROBLEMA */}
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