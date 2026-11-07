import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Função para CRIAR um novo chamado (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, descricao, cliente, prioridade } = body;

    if (!titulo || !descricao) {
      return NextResponse.json(
        { message: "Título e descrição são obrigatórios." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chamados")
      .insert([
        {
          titulo,
          descricao,
          cliente,
          prioridade: prioridade || "Normal",
          status: "Aberto",
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Chamado criado com sucesso!", data },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// Função para APAGAR um chamado (DELETE)
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { message: "ID não fornecido para exclusão." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("chamados")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Removido com sucesso do banco de dados." },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}