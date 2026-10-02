"use client";

import { useEffect, useState } from "react";

type Chamado = {
  id: string;
  nome: string;
  problema: string;
  status: string;
};

export default function AdminPage() {
  const [chamados, setChamados] = useState<Chamado[]>([]);

  async function carregarChamados() {
    const response = await fetch("/api/chamados");
    const data = await response.json();

    setChamados(data);
  }

  async function atualizarStatus(
    id: string,
    status: string
  ) {
    await fetch("/api/chamados", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status,
      }),
    });

    carregarChamados();
  }

  useEffect(() => {
    carregarChamados();
  }, []);

  return (
    <main className="admin-container">
      <div className="admin-card">
        <h1>Painel Administrativo</h1>

        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Problema</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {chamados.map((chamado) => (
              <tr key={chamado.id}>
                <td>{chamado.nome}</td>
                <td>{chamado.problema}</td>

                <td>
                  <select
                    value={chamado.status}
                    onChange={(e) =>
                      atualizarStatus(
                        chamado.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="Aberto">
                      Aberto
                    </option>

                    <option value="Em andamento">
                      Em andamento
                    </option>

                    <option value="Concluído">
                      Concluído
                    </option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}