import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Lista todos os chamados
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("chamados")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// POST: Cria um novo chamado
export async function POST(req: Request) {
  try {
    const body = await req.json();
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
    } = body;

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
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Criado com sucesso", data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// PUT: Atualiza informações
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status, data_agendamento, nome, celular, cpf, email, equipamento, problema } = body;

    if (!id) {
      return NextResponse.json({ message: "ID não fornecido." }, { status: 400 });
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
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Atualizado com sucesso", data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// DELETE: Remove o registo pelo ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // Ignora se não houver body
      }
    }

    if (!id) {
      return NextResponse.json({ message: "ID não fornecido para exclusão." }, { status: 400 });
    }

    const { error } = await supabase
      .from("chamados")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Removido com sucesso do banco de dados." }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}