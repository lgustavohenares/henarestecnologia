import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: Lista todos os chamados
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("chamados")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  // POST: Cria um novo chamado/cliente
  if (req.method === "POST") {
    try {
      const {
        nome,
        celular,
        cpf,
        email,
        equipamento,
        endereco,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        prioridade,
        problema,
        status,
        numero_chamado,
        data_agendamento,
      } = req.body;

      const { data, error } = await supabase.from("chamados").insert([
        {
          nome,
          celular,
          cpf,
          email,
          equipamento,
          endereco,
          cep,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          prioridade,
          problema,
          status: status || "Aberto",
          numero_chamado,
          data_agendamento: data_agendamento || null,
        },
      ]);

      if (error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(200).json({ message: "Criado com sucesso", data });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  // PUT: Atualiza informações do cliente ou status/datas
  if (req.method === "PUT") {
    try {
      const { id, status, data_agendamento, nome, celular, cpf, email, equipamento, problema } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID não fornecido." });
      }

      const updateFields: any = {};
      if (status !== undefined) updateFields.status = status;
      if (nome !== undefined) updateFields.nome = nome;
      if (celular !== undefined) updateFields.celular = celular;
      if (cpf !== undefined) updateFields.cpf = cpf;
      if (email !== undefined) updateFields.email = email;
      if (equipamento !== undefined) updateFields.equipamento = equipamento;
      if (problema !== undefined) updateFields.problema = problema;

      const dataHoje = new Date().toISOString().split("T")[0];

      if (data_agendamento !== undefined) {
        updateFields.data_agendamento = data_agendamento;
      } else if (status === "Em andamento" || status === "Em atendimento") {
        updateFields.data_agendamento = dataHoje;
      } else if (status === "Concluído" || status === "Finalizado") {
        updateFields.data_agendamento = dataHoje;
      }

      const { data, error } = await supabase
        .from("chamados")
        .update(updateFields)
        .eq("id", id);

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(200).json({ message: "Atualizado com sucesso", data });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  // DELETE: Remove o registo do banco de dados pelo ID (aceita via query ou body)
  if (req.method === "DELETE") {
    try {
      const id = req.query.id || req.body?.id;

      if (!id) {
        return res.status(400).json({ message: "ID não fornecido para exclusão." });
      }

      const { error } = await supabase
        .from("chamados")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao deletar no Supabase:", error);
        return res.status(500).json({ message: error.message });
      }

      return res.status(200).json({ message: "Removido com sucesso do banco de dados." });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: "Método não permitido" });
}