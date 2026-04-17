import type { Tour } from "@/types/tours";
import nodemailer from "nodemailer";
import QRCode from "qrcode";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "admin",
    pass: process.env.SMTP_PASS || "password",
  },
});

export const sendTourConfirmation = async (to: string, data: Tour) => {
  const qrCodeDataUrl = await QRCode.toDataURL(data.ticketid);
  const jsDate = new Date(data.date_booking);
  const dateFormat = jsDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const mailOptions = {
    from: '"Better With a Teacher" <no-reply@ankinflow.com>',
    to,
    subject: `Ticket de tu reserva: ${data.name_es} 🎟️`,
    html: `
      <!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microso=ft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office" ng-app="a=pp">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-sc=ale=1">
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,=400,700,900" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Poppins:300=,400,500,600,700,800,900&display=swap"
        rel="stylesheet">
</head>

<body style=" padding-left: 20%; padding-top: 3px; background-color:#EFEEEE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table style="width: 600px; height: 100%; border-radius: 7px; box-shadow: 2px 0 16px -4px rgba(116, 116, 116,
        0.16); background-color: #ffffff; padding-bottom: 25px; border-spacing:0;">
        <tbody>
            <br>
            <tr>
                <td style="">
                <h1 style="font-weight: bold; margin:2rem 0 0.3rem 2rem;">Better with a teacher</h1>
                </td>
            </tr>
            <tr>
                <td>
                    <img style="width: 100%; height: 200px; object-fit: cover;" src=${data.img}>
                </td>
            </tr>
            <br>
            <tr>
                <td style="color:#2c2c2c;">
                    <p style="padding:0 2rem 0 2rem;">¡Hola ${data.name}!</p>
                    <p style="padding:0 2rem 0 2rem; font-size: 16px;">¡Qué alegría que hayas decidido explorar con nosotros el tour <span style="font-weight: bold">${data.name_es}</span>! 👏 Estamos emocionados de acompañarte.</p>
                    <p style="padding:0 2rem 0 2rem; font-size: 16px;">Aquí tienes los detalles de tu próxima aventura:</p>
                </td>
            </tr>
            <tr>
                <td>
                    <div style="background-color: #f8f9fa; padding:2rem; border-radius: 10px; margin: 20px 0;">
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;justify-items: center;justify-content: center;align-items: center;">
                            <img style="width: 150px;" src="${qrCodeDataUrl}" />
                            <p style="font-size: 11px; color: #994D52;background: #F2E8E8;padding: 5px 10px;border-radius: 7px;">Codigo: ${data.ticketid}</p>
                        </div>
                        <p><strong>📍 Tour:</strong> ${data.name_es}</p>
                        <p><strong>📅 Fecha:</strong> ${dateFormat}</p>
                        <p><strong>⏰ Hora:</strong> ${data.hours.slice(0, 5)} hrs.(Horario 🇨🇱)</p>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <div style="padding:0 2rem; margin-bottom: 2rem;">
                        <h3>¿Surgió algún imprevisto?</h3>
                        <p>Sabemos que los planes pueden cambiar. Si por alguna razón no puedes asistir, te pedimos que nos avises lo antes posible para liberar el cupo. Para cancelar tu reserva, solo tienes que hacer clic en el siguiente enlace:</p>
                        <div style="display: flex;justify-content: center;justify-items: center;align-items: center;">
                            <a href="http://localhost:4321/es/cancelar/?ticket=${data.ticketid}" 
                            style="color: white; text-decoration: none; background: #E82933;padding: 15px 35px; border-radius: 20px;">
                            Cancelar mi reserva
                            </a>
                        </div>
                    </div>
                </td>    
            </tr>
            <tr>
                <td>
                    <hr style="height: 0px; border: solid 0.5px #cdcdcd;">
                </td>
            </tr>
            <tr>
                <td>
                    <h3 style="font-weight: bold; margin:0 0 0 2rem;">Better with a teacher<h3/>
                </td>
            </tr>
            <tr>
                <td style="padding:0 52px 0 52px; font-size: 9px; font-weight: normal; font-stretch: normal; font-style: normal; line-height: 1.89; letter-spacing:
                    0.58px; color: #898989;">
                    <p style="text-align: justify;">Este correo electrónico se ha generado automáticamente, por favor no responder. Este correo electrónico y cualquier documento adjunto puede contener información sobre los trabajadores internos, dirigida para el conocimiento y uso exclusivo de la persona o entidad arriba mencionadas. Si usted no es el destinatario, se le informa que cualquier divulgación, distribución o copia de esta comunicación está estrictamente prohibida. Si usted ha recibido este correo electrónico por error, agradeceremos notificarnos al correo contacto@betterwithateacher.com y eliminando el original y cualquier copia o impresión de este. Gracias.
                    </p>
                </td>
            </tr>
            <tr>
                <td>
                    <div style="padding-left: 10px;padding-top:40px;">
                        <a href="https://www.youtube.com/channel/UCW-YyJqRU3w_gu7Oo_4KrXA" target="_blank"
                            style="padding: 0.8rem; color:black; text-decoration:none;">
                            <i class="fa-brands fa-youtube fa-xl"></i>
                        </a>
                        <a href="https://www.instagram.com/provaltec/" target="_blank"
                            style="padding: 0.8rem; color:black; text-decoration:none;">
                            <i class="fa-brands fa-instagram fa-xl"></i>
                        </a>
                        <a href="https://www.facebook.com/valvulastecnicas/" target="_blank"
                            style="padding: 0.8rem; color:black; text-decoration:none;">
                            <i class="fa-brands fa-facebook fa-xl"></i>
                        </a>
                        <a href="https://www.linkedin.com/company/provaltec/" target="_blank"
                            style="padding: 0.8rem; color:black; text-decoration:none;">
                            <i class="fa-brands fa-linkedin fa-xl"></i>
                        </a>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    <table style="width: 600px;">
        <tbody style="width: 600px;">
            <tr>
                <td>
                    <p style="text-align:center; font-size: 9px; font-weight: normal; font-stretch: normal;
                        font-style: normal; line-height: 1.67; letter-spacing: 0.58px; color: #7e8288; text-align:
                        center;">Better With a Teacher - Los mejores Tours en Santiago de Chile
                </td>
            </tr>
        </tbody>
    </table>

</html>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
