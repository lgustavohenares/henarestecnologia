import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ message: "Nome e senha são obrigatórios." });
    }

    // Procura o usuário pelo nome ignorando maiúsculas/minúsculas usando .ilike
    const { data: usuarios, error } = await supabase
      .from("usuarios")
      .select("*")
      .ilike("nome", nome.trim());

    if (error || !usuarios || usuarios.length === 0) {
      return res.status(401).json({ message: "Utilizador não encontrado." });
    }

    const usuario = usuarios[0];

    // Valida a senha
    if (usuario.senha !== senha) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    // Login bem-sucedido
    return res.status(200).json({
      message: "Login efetuado com sucesso",
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}