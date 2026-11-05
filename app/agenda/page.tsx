"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";

type Chamado = {
  id: string;
  numero_chamado?: string;
  nome: string;
  equipamento?: string;
  problema: string;
  status: string;
  data_agendamento?: string;
  created_at?: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    chamado: Chamado;
  };
};

export default function AgendaPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [naoAgendados, setNaoAgendados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const externalEventsRef = useRef<HTMLDivElement>(null);

  const getStatusColors = (status: string) => {
    switch (status) {
      case "Aberto":
        return { bg: "#f59e0b", border: "#d97706" };
      case "Em andamento":
      case "Em Andamento":
        return { bg: "#06b6d4", border: "#0891b2" };
      case "Agendado":
        return { bg: "#a855f7", border: "#9333ea" };
      case "Concluído":
      case "Finalizado":
        return { bg: "#10b981", border: "#059669" };
      case "Cancelado":
        return { bg: "#ef4444", border: "#dc2626" };
      default:
        return { bg: "#64748b", border: "#475569" };
    }
  };

  const extrairDataIso = (chamado: Chamado): string | null => {
    if (chamado.data_agendamento) {
      const parteData = chamado.data_agendamento.split(" ")[0];
      if (parteData.includes("-")) return parteData;
      if (parteData.includes("/")) {
        const [dia, mes, ano] = parteData.split("/");
        return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
      }
    }
    return null;
  };

  async function carregarChamados() {
    try {
      const response = await fetch("/api/chamados");
      const data: Chamado[] = await response.json();

      if (response.ok && Array.isArray(data)) {
        const agendados: CalendarEvent[] = [];
        const pendentes: Chamado[] = [];

        data.forEach((c) => {
          if (c.status === "Cancelado") return;

          const dataIso = extrairDataIso(c);
          if (dataIso) {
            const { bg, border } = getStatusColors(c.status);
            const num = c.numero_chamado ? `#${c.numero_chamado}` : `#${c.id.slice(0, 5)}`;
            agendados.push({
              id: c.id,
              title: `${num} - ${c.nome}`,
              start: dataIso,
              backgroundColor: bg,
              borderColor: border,
              textColor: "#ffffff",
              extendedProps: { chamado: c },
            });
          } else {
            pendentes.push(c);
          }
        });

        setEvents(agendados);
        setNaoAgendados(pendentes);
      }
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
    } finally {
      setLoading(false);
    }
  }

  // Inicializa o Draggable para os itens da lista lateral
  useEffect(() => {
    if (externalEventsRef.current) {
      new Draggable(externalEventsRef.current, {
        itemSelector: ".fc-draggable-item",
        eventData: (eventEl) => {
          const id = eventEl.getAttribute("data-id") || "";
          const title = eventEl.getAttribute("data-title") || "";
          return {
            id: id,
            title: title,
            backgroundColor: "#a855f7",
            borderColor: "#9333ea",
            textColor: "#ffffff",
          };
        },
      });
    }
  }, [naoAgendados]);

  // Função centralizada para atualizar o banco de dados via PUT
  async function atualizarDataChamado(id: string, novaDataIso: string) {
    try {
      const response = await fetch("/api/chamados", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          status: "Agendado",
          data_agendamento: novaDataIso,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        console.error("Erro do servidor:", resData);
        alert(`Erro ao atualizar no banco: ${resData.message || "Erro desconhecido"}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Erro de conexão:", err);
      alert("Erro de conexão ao tentar atualizar o chamado.");
      return false;
    }
  }

  // Ao arrastar um evento já agendado para outra data no calendário
  async function handleEventDrop(info: any) {
    const chamadoId = info.event.id;
    const novaDataIso = info.event.startStr.split("T")[0];

    const sucesso = await atualizarDataChamado(chamadoId, novaDataIso);
    if (!sucesso) {
      info.revert();
    } else {
      carregarChamados();
    }
  }

  // Ao soltar um chamado pendente da lista lateral no calendário
  async function handleEventReceive(info: any) {
    const chamadoId = info.event.id;
    const novaDataIso = info.event.startStr.split("T")[0];

    const sucesso = await atualizarDataChamado(chamadoId, novaDataIso);
    if (!sucesso) {
      info.event.remove();
    } else {
      carregarChamados();
    }
  }

  useEffect(() => {
    carregarChamados();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Agenda de Chamados</h1>
            <p className="text-slate-400 text-sm">
              Arraste chamados da lista lateral para agendar ou altere a data diretamente no calendário.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700"
          >
            Voltar ao Painel
          </button>
        </div>

        {/* LEGENDA */}
        <div className="flex flex-wrap gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-semibold">
          <span className="text-slate-400">Legenda:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Aberto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
            <span>Em Andamento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span>Agendado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Concluído</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LISTA LATERAL */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col h-full">
            <h3 className="text-sm font-bold text-amber-400 mb-1">Não Agendados / Pendentes</h3>
            <p className="text-xs text-slate-400 mb-4">Arraste um item para o calendário:</p>

            <div ref={externalEventsRef} className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
              {naoAgendados.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">Nenhum chamado pendente de data.</p>
              ) : (
                naoAgendados.map((item) => {
                  const num = item.numero_chamado ? `#${item.numero_chamado}` : `#${item.id.slice(0, 5)}`;
                  const titulo = `${num} - ${item.nome}`;
                  return (
                    <div
                      key={item.id}
                      data-id={item.id}
                      data-title={titulo}
                      className="fc-draggable-item bg-slate-800 hover:bg-slate-700/80 border border-amber-500/30 p-3 rounded-xl cursor-grab active:cursor-grabbing text-xs transition-all shadow"
                    >
                      <div className="font-bold text-amber-400">{num}</div>
                      <div className="text-white font-medium truncate">{item.nome}</div>
                      <div className="text-slate-400 text-[11px] truncate mt-1">{item.problema}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CALENDÁRIO */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            {loading ? (
              <p className="text-slate-400">A carregar agenda...</p>
            ) : (
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                editable={true}
                droppable={true}
                events={events}
                eventDrop={handleEventDrop}
                eventReceive={handleEventReceive}
                locale="pt-br"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth",
                }}
                buttonText={{
                  today: "Hoje",
                  month: "Mês",
                }}
                height="auto"
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}