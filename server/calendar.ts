import IcalGenerator from "ical-generator";
type IcalGeneratorType = typeof IcalGenerator;

export interface EventoCalendario {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio: Date;
  dataFim: Date;
  local?: string;
  responsavel?: string;
  tipo: "objetivo" | "projeto";
  status: string;
}

/**
 * Gera arquivo iCalendar (.ics) para sincronização com Google Calendar, Outlook, etc.
 */
export function gerarEventosCalendario(eventos: EventoCalendario[]) {
  const cal = new (IcalGenerator as any)({
    prodId: "//Grupo Arqueo//Planejamento Estratégico//PT",
    name: "Planejamento Estratégico - Grupo Arqueo",
    description: "Eventos de objetivos e projetos estratégicos",
    timezone: "America/Sao_Paulo",
  });

  for (const evento of eventos) {
    const cor = evento.tipo === "objetivo" ? "BLUE" : "ORANGE";
    const categoria = evento.tipo === "objetivo" ? "Objetivo" : "Projeto";

    cal.createEvent({
      id: evento.id,
      summary: `[${categoria}] ${evento.titulo}`,
      description: evento.descricao || "",
      start: evento.dataInicio,
      end: evento.dataFim,
      location: evento.local || "Virtual",
      organizer: {
        name: "Grupo Arqueo",
        email: "planejamento@arqueo.com",
      },
      attendees: evento.responsavel
        ? [
            {
              name: evento.responsavel,
              email: "responsavel@arqueo.com",
              role: "REQ-PARTICIPANT",
            },
          ]
        : [],
      categories: [categoria, evento.status],
      color: cor,
      status: evento.status === "concluido" ? "COMPLETED" : "CONFIRMED",
      transp: "OPAQUE",
      busyStatus: "BUSY",
    });
  }

  return cal;
}

/**
 * Gera URL para sincronização com Google Calendar
 */
export function gerarURLGoogleCalendar(evento: EventoCalendario): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `[${evento.tipo === "objetivo" ? "Objetivo" : "Projeto"}] ${evento.titulo}`,
    dates: `${formatarDataISO(evento.dataInicio)}/${formatarDataISO(evento.dataFim)}`,
    details: evento.descricao || "",
    location: evento.local || "Virtual",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Gera URL para sincronização com Outlook
 */
export function gerarURLOutlook(evento: EventoCalendario): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    startdt: formatarDataISO(evento.dataInicio),
    enddt: formatarDataISO(evento.dataFim),
    subject: `[${evento.tipo === "objetivo" ? "Objetivo" : "Projeto"}] ${evento.titulo}`,
    body: evento.descricao || "",
    location: evento.local || "Virtual",
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Gera link para download do arquivo .ics
 */
export function gerarDownloadICS(eventos: EventoCalendario[]): Buffer {
  const cal = gerarEventosCalendario(eventos) as any;
  return Buffer.from(cal.toString());
}

/**
 * Formata data para ISO 8601 (YYYYMMDDTHHMMSSZ)
 */
function formatarDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  const horas = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");
  const segundos = String(data.getSeconds()).padStart(2, "0");

  return `${ano}${mes}${dia}T${horas}${minutos}${segundos}Z`;
}

/**
 * Cria um objeto de evento para calendário
 */
export function criarEventoCalendario(
  id: string,
  titulo: string,
  dataInicio: Date,
  dataFim: Date,
  tipo: "objetivo" | "projeto",
  status: string,
  descricao?: string,
  local?: string,
  responsavel?: string
): EventoCalendario {
  return {
    id,
    titulo,
    descricao,
    dataInicio,
    dataFim,
    local,
    responsavel,
    tipo,
    status,
  };
}
