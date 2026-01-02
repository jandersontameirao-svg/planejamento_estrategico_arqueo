import nodemailer from "nodemailer";

// Configuração do transporte de email
// Em produção, use variáveis de ambiente para credenciais
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

export interface AlertaEmail {
  tipo: "objetivo" | "projeto";
  titulo: string;
  mensagem: string;
  severidade: "critico" | "aviso";
  diasRestantes: number;
  empresa: string;
}

export async function enviarAlertaCritico(
  destinatario: string,
  alerta: AlertaEmail
) {
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #f97316; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background-color: #f5f5f5; }
          .alert { background-color: ${alerta.severidade === "critico" ? "#fee2e2" : "#fef3c7"}; 
                   border-left: 4px solid ${alerta.severidade === "critico" ? "#dc2626" : "#f59e0b"};
                   padding: 15px; margin: 15px 0; border-radius: 4px; }
          .footer { padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .button { background-color: #3b82f6; color: white; padding: 10px 20px; 
                   text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Alerta de Planejamento Estratégico</h2>
            <p>Grupo Arqueo - ${alerta.empresa}</p>
          </div>
          <div class="content">
            <h3>${alerta.titulo}</h3>
            <div class="alert">
              <strong>Severidade:</strong> ${alerta.severidade === "critico" ? "🔴 CRÍTICO" : "🟡 AVISO"}<br>
              <strong>Tipo:</strong> ${alerta.tipo === "objetivo" ? "Objetivo Estratégico" : "Projeto"}<br>
              <strong>Dias Restantes:</strong> ${alerta.diasRestantes} dias
            </div>
            <p>${alerta.mensagem}</p>
            <p>Acesse o sistema para mais detalhes e tomar as ações necessárias.</p>
            <a href="${process.env.APP_URL || "https://planejamento.arqueo.com"}" class="button">
              Acessar Sistema
            </a>
          </div>
          <div class="footer">
            <p>Este é um email automático do Sistema de Gestão Estratégica do Grupo Arqueo.</p>
            <p>Não responda este email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@arqueo.com",
      to: destinatario,
      subject: `[${alerta.severidade.toUpperCase()}] ${alerta.titulo}`,
      html: htmlContent,
      text: `${alerta.titulo}\n\n${alerta.mensagem}\n\nDias Restantes: ${alerta.diasRestantes}`,
    });

    return { success: true, message: "Email enviado com sucesso" };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error: String(error) };
  }
}

export async function enviarResumoSemanal(
  destinatario: string,
  empresa: string,
  alertas: AlertaEmail[]
) {
  const criticos = alertas.filter((a) => a.severidade === "critico");
  const avisos = alertas.filter((a) => a.severidade === "aviso");

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #f97316; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background-color: #f5f5f5; }
          .section { margin: 20px 0; }
          .section-title { background-color: #e5e7eb; padding: 10px; font-weight: bold; border-radius: 4px; }
          .alert-item { padding: 10px; margin: 5px 0; background-color: white; border-left: 4px solid #3b82f6; }
          .critico { border-left-color: #dc2626; }
          .aviso { border-left-color: #f59e0b; }
          .footer { padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Resumo Semanal - Planejamento Estratégico</h2>
            <p>Grupo Arqueo - ${empresa}</p>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>Segue o resumo dos alertas da semana para sua empresa:</p>
            
            ${
              criticos.length > 0
                ? `
              <div class="section">
                <div class="section-title">🔴 Alertas Críticos (${criticos.length})</div>
                ${criticos.map((a) => `<div class="alert-item critico"><strong>${a.titulo}</strong><br>${a.mensagem}</div>`).join("")}
              </div>
            `
                : ""
            }
            
            ${
              avisos.length > 0
                ? `
              <div class="section">
                <div class="section-title">🟡 Avisos (${avisos.length})</div>
                ${avisos.map((a) => `<div class="alert-item aviso"><strong>${a.titulo}</strong><br>${a.mensagem}</div>`).join("")}
              </div>
            `
                : ""
            }
            
            ${
              alertas.length === 0
                ? "<p style='color: green; font-weight: bold;'>✅ Nenhum alerta crítico ou aviso no momento!</p>"
                : ""
            }
          </div>
          <div class="footer">
            <p>Este é um email automático do Sistema de Gestão Estratégica do Grupo Arqueo.</p>
            <p>Não responda este email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@arqueo.com",
      to: destinatario,
      subject: `Resumo Semanal - Planejamento Estratégico - ${empresa}`,
      html: htmlContent,
      text: `Resumo Semanal\n\nCríticos: ${criticos.length}\nAvisos: ${avisos.length}`,
    });

    return { success: true, message: "Resumo enviado com sucesso" };
  } catch (error) {
    console.error("Erro ao enviar resumo:", error);
    return { success: false, error: String(error) };
  }
}
