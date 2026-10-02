"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    nome: "",
    endereco: "",
    celular: "",
    equipamento: "",
    prioridade: "Media",
    problema: "",
  });

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "/api/chamados",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erro ao registrar chamado"
        );
      }

      alert(
        "Chamado registrado com sucesso!"
      );

      setForm({
        nome: "",
        endereco: "",
        celular: "",
        equipamento: "",
        prioridade: "Media",
        problema: "",
      });
    } catch (error) {
      console.error(error);

      alert(
        "Erro ao registrar chamado."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">

      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">
            Henares Tecnologia
          </h1>

          <p className="text-blue-100">
            Sistema de Chamados Técnicos
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow-xl p-8">

          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Novo Chamado
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <div>
              <label className="block mb-2 font-semibold">
                Nome
              </label>

              <input
                type="text"
                value={form.nome}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nome: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Endereço
              </label>

              <input
                type="text"
                value={form.endereco}
                onChange={(e) =>
                  setForm({
                    ...form,
                    endereco: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block mb-2 font-semibold">
                  Celular
                </label>

                <input
                  type="text"
                  value={form.celular}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      celular: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">
                  Equipamento
                </label>

                <input
                  type="text"
                  value={form.equipamento}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      equipamento:
                        e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3"
                  required
                />
              </div>

            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Prioridade
              </label>

              <select
                value={form.prioridade}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prioridade:
                      e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="Baixa">
                  Baixa
                </option>

                <option value="Media">
                  Média
                </option>

                <option value="Alta">
                  Alta
                </option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">
                Problema
              </label>

              <textarea
                rows={5}
                value={form.problema}
                onChange={(e) =>
                  setForm({
                    ...form,
                    problema:
                      e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Registrar Chamado
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}