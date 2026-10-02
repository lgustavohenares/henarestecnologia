import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      nome,
      endereco,
      celular,
      equipamento,
      prioridade,
      problema,
    } = req.body;

    const { data, error } = await supabase
      .from("chamados")
      .insert([
        {
          nome,
          endereco,
          celular,
          equipamento,
          prioridade,
          problema,
          status: "Aberto",
        },
      ])
      .select();

    if (error) {
      return res.status(500).json(error);
    }

    return res.status(200).json(data);
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("chamados")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return res.status(500).json(error);
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({
    error: "Método não permitido",
  });
}