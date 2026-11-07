import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Listar todos os chamados (GET)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("chamados")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Criar um novo chamado (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("chamados")
      .insert([body])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Atualizar status ou data de agendamento do chamado (PUT)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, data_agendamento } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório para atualização." }, { status: 400 });
    }

    // Objeto dinâmico para atualizar apenas o que foi enviado
    const dadosAtualizacao: any = {};
    if (status) dadosAtualizacao.status = status;
    if (data_agendamento !== undefined) dadosAtualizacao.data_agendamento = data_agendamento;

    // Se estiver a agendar via calendário e o status anterior for comum, atualizamos automaticamente para "Agendado"
    if (data_agendamento && !status) {
      dadosAtualizacao.status = "Agendado";
    }

    const { data, error } = await supabase
      .from("chamados")
      .update(dadosAtualizacao)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Excluir chamado (DELETE)
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório para exclusão." }, { status: 400 });
    }

    const { error } = await supabase
      .from("chamados")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}