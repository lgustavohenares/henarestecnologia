"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function FormClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Campos do Cliente
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState(""); // CPF ou CNPJ
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  // Endereço
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  // Máscara e formatador automático de CPF / CNPJ
  const aplicarMascaraCpfCnpj = (valor: string) => {
    const limpo = valor.replace(/\D/g, "");

    if (limpo.length <= 11) {
      // Máscara de CPF: 000.000.000-00
      return limpo
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // Máscara de CNPJ: 00.000.000/0000-00
      return limpo
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = aplicarMascaraCpfCnpj(e.target.value);
    setDocumento(formatado);
  };

  // Validador de CPF / CNPJ
  const validarCpfCnpj = (doc: string) => {
    const limpo = doc.replace(/\D/g, "");
    return limpo.length === 11 || limpo.length === 14;
  };

  // Buscar CEP automaticamente na API ViaCEP
  const buscarCep = async (cepValor: string) => {
    const cepLimpo = cepValor.replace(/\D/g, "");
    setCep(cepLimpo);

    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setLogradouro(data.logradouro || "");
          setBairro(data.bairro || "");
          setCidade(data.localidade || "");
          setUf(data.uf || "");
        } else {
          alert("CEP não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarCpfCnpj(documento)) {
      alert("Por favor, insira um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("clientes").insert([
        {
          nome,
          documento,
          telefone,
          email,
          cep,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          uf,
        },
      ]);

      if (error) {
        alert("Erro ao cadastrar cliente: " + error.message);
      } else {
        alert("Cliente cadastrado com sucesso!");
        router.push("/clientes");
      }
    } catch (err) {
      console.error("Erro:", err);
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
            <h1 className="text-2xl font-bold text-cyan-400">Cadastrar Novo Cliente</h1>
            <p className="text-slate-400 text-sm">Insira as informações de identificação e morada</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/clientes")}
            className="text-slate-400 hover:text-white text-sm bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NOME E DOCUMENTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo / Empresa *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CPF ou CNPJ *</label>
              <input
                type="text"
                required
                value={documento}
                onChange={handleDocumentoChange}
                placeholder="Digite o CPF ou CNPJ"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* TELEFONE E EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Telemóvel / WhatsApp</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
          </div>

          <hr className="border-slate-800 my-4" />

          {/* ENDEREÇO: EDITÁVEIS APENAS CEP, NÚMERO E COMPLEMENTO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CEP *</label>
              <input
                type="text"
                required
                maxLength={9}
                value={cep}
                onChange={(e) => buscarCep(e.target.value)}
                placeholder="00000-000"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número *</label>
              <input
                type="text"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Nº"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Complemento</label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Ex: Bloco A, Apto 23"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* CAMPOS DE MORADA BLOQUEADOS (Preenchidos via CEP) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Logradouro / Rua (Automático via CEP)</label>
            <input
              type="text"
              readOnly
              value={logradouro}
              placeholder="Preenchido automaticamente"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 outline-none text-sm cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Bairro</label>
              <input
                type="text"
                readOnly
                value={bairro}
                placeholder="Bairro"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 outline-none text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Cidade</label>
              <input
                type="text"
                readOnly
                value={cidade}
                placeholder="Cidade"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 outline-none text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Estado</label>
              <input
                type="text"
                readOnly
                value={uf}
                placeholder="UF"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 outline-none text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* BOTÃO SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50 mt-4"
          >
            {loading ? "A cadastrar..." : "Salvar Cliente"}
          </button>
        </form>
      </div>
    </main>
  );
}