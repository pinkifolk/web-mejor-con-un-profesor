import postgress from "pg";
import { validate as isUuid } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SSL = process.env.SSL || import.meta.env.SSL;
const DATABASE_URL = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
const PEPPER = process.env.PEPPER || import.meta.env.PEPPER;
const SECRET = process.env.SECRET || import.meta.env.SECRET;

const { Pool } = postgress;
// al pasar a qa debe activarse el ssl
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: SSL === "true" ? { rejectUnauthorized: false } : false,
});

// funciones para usuarios generales
export async function GetDestinosPopulate() {
  try {
    const res = await pool.query(
      "SELECT * FROM tours WHERE status=false AND populate=true ORDER BY id",
    );
    if (res.rows.length === 0) {
      throw new Error("No hay tours disponibles");
    }
    return res.rows;
  } catch (error) {
    console.error("Error en funcion GetDestinosPopulate:", error);
    throw error;
  }
}
export async function GetDestinosAll() {
  try {
    const res = await pool.query(
      "SELECT * FROM tours WHERE status=false ORDER BY id",
    );
    if (res.rows.length === 0) {
      throw new Error("No hay tours disponibles");
    }
    return res.rows;
  } catch (error) {
    console.error("Error en funcion GetDestinos:", error);
    throw error;
  }
}
export async function GetTourBySlug(slug) {
  const res = await pool.query("SELECT * FROM tours WHERE slug=$1", [slug]);
  if (res.rows.length === 0) {
    return null;
  }
  const tour = res.rows[0];
  const resItinerary = await pool.query(
    "SELECT name FROM itinerary WHERE tour_id=$1",
    [tour.id],
  );
  const reviewsRes = await pool.query(
    `SELECT AVG(rating) rating, COUNT(*) total FROM tour_reviews WHERE tour_id=$1;`,
    [tour.id],
  );
  const commetnsRes = await pool.query(
    `SELECT name,comment,rating,created_at FROM tour_reviews WHERE tour_id=$1 ORDER BY id;`,
    [tour.id],
  );
  tour.comments = commetnsRes.rows.map((row) => ({
    name: row.name,
    comment: row.comment,
    rating: row.rating,
    created_at: row.created_at,
  }));
  const ratingCounts = await pool.query(
    `SELECT 
        rating,
        ROUND(COUNT(*)::numeric * 100 / SUM(COUNT(*)) OVER (), 2) AS porcentaje
      FROM tour_reviews
      WHERE tour_id = $1
      GROUP BY rating
      ORDER BY rating DESC;`,
    [tour.id],
  );
  tour.itinerary = resItinerary.rows.map((row) => row.name);
  tour.rating = reviewsRes.rows[0].rating
    ? parseFloat(reviewsRes.rows[0].rating).toFixed(1)
    : null;
  tour.total_reviews = parseInt(reviewsRes.rows[0].total);
  tour.rating_counts = ratingCounts.rows.map((row) => ({
    rating: parseInt(row.rating),
    percentage: parseFloat(row.porcentaje),
  }));
  return tour;
}
export async function GetHoursBySlug(slug) {
  try {
    const fineSlug = await pool.query("SELECT * FROM tours WHERE slug=$1", [
      slug,
    ]);
    if (fineSlug.rows.length === 0) {
      throw new Error("El tour no existe favor verificar el tour");
    }

    const res = await pool.query(
      `SELECT L.code, L.icon_svg, L.name, jsonb_agg(
        jsonb_build_object(
            'hour', TH.hour,
            'day_week', TH.day_week,
            'type_schedule', TH.type_schedule,
            'configurations', TH.configurations
        ) ORDER BY TH.hour ASC
    ) AS schedules FROM tours_hours TH LEFT JOIN languages L ON L.id=TH.language_id WHERE tours_id=(SELECT id FROM tours WHERE slug=$1) GROUP BY L.id, L.code, L.icon_svg, L.name ORDER BY L.id;`,
      [slug],
    );
    return res.rows;
  } catch (error) {
    console.error("Error en funcion GetHoursBySlug:", error);
    throw error;
  }
}
export async function GetAvailability(date, slug) {
  try {
    const fineSlug = await pool.query("SELECT * FROM tours WHERE slug=$1", [
      slug,
    ]);
    if (fineSlug.rows.length === 0) {
      throw new Error("El tour no existe favor verificar el tour");
    }
    const res = await pool.query(
      "SELECT COALESCE(SUM(adult), 0) + COALESCE(SUM(child), 0) AS total, T.max_people - (COALESCE(SUM(adult), 0) + COALESCE(SUM(child), 0)) AS disponible FROM tours T LEFT JOIN booking B ON T.id = B.tour_id AND B.date_booking = $1 AND confirmation= true WHERE T.slug = $2 GROUP BY T.id",
      [date, slug],
    );
    return res.rows;
  } catch (error) {
    console.error("Error en funcion GetAvailability:", error);
    throw error;
  }
}
export async function NewBooking(booking) {
  try {
    const fineIdHour = await pool.query(
      `
      SELECT TH.id FROM tours_hours TH 
      LEFT JOIN tours T ON T.id=TH.tours_id 
      WHERE T.slug=$1 AND TH.hour=$2;`, 
      [booking.slug, booking.hour]
    );
    if (fineIdHour.rows.length === 0) {
      throw new Error("El tour o el horario no existen, favor verificar");
    }
    const hourId = fineIdHour.rows[0].id;
    const res = await pool.query(
      `
      INSERT INTO booking (adult, child, date_booking, hour_id, tour_id, confirmation, ticket, hash, created_at, updated_at)
      VALUES ($1, $2, $3, $4, (SELECT id FROM tours WHERE slug=$5), false, NULL, gen_random_uuid(), NOW(), NULL)
      RETURNING hash`,
      [
        booking.adultos,
        booking.ninos,
        booking.date,
        hourId,
        booking.slug,
      ],
    );
    return res.rows[0].hash;
  } catch (error) {
    console.error("Error en NewBooking:", error);
    throw error;
  }
}
function generarCodigoTicket() {
  const fecha = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${fecha}-${random}`;
}
export async function GetBookingStatus({ id }) {
  try {    
    if (!isUuid(id)) {
      throw new Error(
        "No modificar la url de confirmación o el hash generado no es válido",
      );
    }
    const res = await pool.query(
      "SELECT confirmation FROM booking WHERE hash = $1",
      [id],
    );
    if (res.rows.length === 0) {
      throw new Error("No se encontró la reserva, favor intentar nuevamente");
    }
    return res.rows[0].confirmation;
  } catch (error) {
    console.error("Error en GetBookingStatus:", error);
    throw error;
  }
}
export async function ConfirmBooking({nombre, apellido, email, telefono, id}) {
  try {
    if (!isUuid(id)) {
      throw new Error(
        "No modificar la url de confirmación o el hash generado no es válido",
      );
    }
    const checkRes = await pool.query(
      "SELECT confirmation FROM booking WHERE hash = $1",
      [id],
    );
    if (checkRes.rows.length === 0) {
      throw new Error("No se encontró la reserva, favor intentar nuevamente");
    }

    if (checkRes.rows[0].confirmation === true) {
      throw new Error("La reserva ya fue confirmada,favor revisar su correo");
    }
    const res = await pool.query(
      `
      UPDATE booking 
      SET name = $1, last_name = $2, email= $3, phone= $4, confirmation = true, ticket = $5, updated_at = NOW() 
      WHERE hash = $6
      RETURNING id
    `,
      [
        nombre,
        apellido,
        email,
        telefono,
        generarCodigoTicket(),
        id,
      ],
    );
    if (res.rows.length === 0) {
      throw new Error("Reserva no encontrada");
    }
    const tourRes = await pool.query(
      "SELECT T.name_es, T.name_pt, T.name_en, T.img, B.adult, B.child, B.date_booking, TH.hour AS hours, B.ticket AS ticketid FROM tours T LEFT JOIN booking B ON B.tour_id=T.id LEFT JOIN tours_hours TH ON TH.id=B.hour_id WHERE B.id=$1",
      [res.rows[0].id],
    );
    return tourRes.rows[0];
  } catch (error) {
    console.error("Error en ConfirmBooking:", error);
    throw error;
  }
}
export async function RandomTour() {
  try {
    const res = await pool.query(
      "SELECT slug FROM tours WHERE status=false ORDER BY RANDOM() LIMIT 1",
    );
    if (res.rows.length === 0) {
      throw new Error("No hay tours disponibles");
    }
    return res.rows[0];
  } catch (error) {
    console.error("Error en funcion RandomTour:", error);
    throw error;
  }
}

// funciones para usuarios administradores
// dashboard

export async function GetDataFromDashboard() {
  const today =
    await pool.query(`SELECT T.id, T.name, T.img, SUM(B.adult) personas, SUM(B.child) ninos, TH.hour AS hours, TH.id hourId, string_agg(DISTINCT B.status, ', ') as status
                                  FROM booking B 
                                  LEFT JOIN tours T ON T.id=B.tour_id
                                  LEFT JOIN tours_hours TH ON TH.tours_id=B.id
                                  WHERE DATE(B.date_booking) = CURRENT_DATE
                                  GROUP BY T.id, TH.id;`);
  const nexts = await pool.query(`SELECT 
                                    T.name,
                                    to_char(B.date_booking, 'DD/MM/YYYY') AS fecha_formateada, 
                                    SUM(B.adult) personas, 
                                    SUM(B.child) ninos,
                                    H.hour
                                    FROM booking B
                                    LEFT JOIN tours T ON T.id=B.tour_id
                                    LEFT JOIN hours H ON H.id=B.hour_id
                                    WHERE B.date_booking BETWEEN NOW() AND NOW() + INTERVAL '5' DAY
                                    GROUP BY B.id, H.id,T.id;`);

  const total = await pool.query(`SELECT
                                      COUNT(*) FILTER (
                                    WHERE date(date_booking) >= date_trunc('week', CURRENT_DATE)
                                      AND date(date_booking) < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'
                                  ) AS total_semana,

                                  COUNT(*) FILTER (
                                    WHERE date(date_booking) >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago')
                                      AND date(date_booking) < date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago') + INTERVAL '1 month'
                                  ) AS total_mes,
                                  COUNT(*) FILTER (
                                    WHERE date(date_booking) >= date_trunc('year', CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago')
                                      AND date(date_booking)< date_trunc('year', CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago') + INTERVAL '12 month'
                                  ) AS total_ano
                                FROM booking
                                WHERE confirmation=TRUE;`);
  return {
    status: 200,
    today: today.rows,
    nexts: nexts.rows,
    total: total.rows[0],
  };
}
// booking admin
export async function DetailBooking(id, hourId) {
  const tour = await pool.query(
    `SELECT T.name name_tour, B.name, B.email, B.adult, B.child, B.phone, COALESCE(B.adult, 0) + COALESCE(B.child, 0) total, H.hour FROM booking B LEFT JOIN tours T ON T.id=B.tour_id LEFT JOIN hours H ON H.id=B.hour_id WHERE T.id=$1 AND H.id=$2 GROUP BY B.id, H.id,T.id;
`,
    [id, hourId],
  );
  return tour.rows;
}

export async function ActionsBooking(id, hourId, actions) {
  if (actions === "cancelado") {
    // si se cancela, cambiar el status a cancelled y enviar correos a los usuarios
    const action = await pool.query(
      `UPDATE booking SET status='cancelled' WHERE tour_id=$1 AND hour_id=$2 RETURNING *`,
      [id, hourId],
    );
    // queda pendiente el envio de correo
    return action.rows[0];
  } else {
    const action = await pool.query(
      `UPDATE booking SET status='confirmed' WHERE tour_id=$1 AND hour_id=$2 RETURNING *`,
      [id, hourId],
    );
    const { hour_id, tour_id } = action.rows[0];
    const closeHour = await pool.query(
      `UPDATE tours_hours SET status=false WHERE tour_id=$1 AND hour_id=$2`,
      [tour_id, hour_id],
    );
    return action.rows[0];
    // si se confirma hay que cambiar el status a confirmed y avisar a los usuarios
  }
}

// Tours
export async function GetToursAdmin() {
  try {
    const res = await pool.query(`SELECT 
                                id,
                                name_es,
                                img,
                                status
                                FROM tours 
                                ORDER BY id;`);
    if (res.rows.length === 0) {
      throw new Error("No hay tours disponibles");
    }
    return res.rows;
  } catch (error) {
    console.error("Error en funcion GetToursAdmin:", error);
    throw error;
  }
}
export const GetToursAdminById = async (id) => {
  try {
    const res = await pool.query("SELECT * FROM tours WHERE id=$1", [id]);
    if (res.rows.length === 0) {
      throw new Error("No se encontro el tour");
    }
    const tour = res.rows[0];
    const resItinerary = await pool.query(
      "SELECT name FROM itinerary WHERE tour_id=$1",
      [tour.id],
    );
    const resHours = await pool.query(
      "SELECT H.hour FROM tours_hours TH LEFT JOIN hours H ON H.id=TH.hours_id WHERE tours_id=$1",
      [tour.id],
    );
    tour.itinerary = resItinerary.rows.map((row) => row.name);
    tour.hours = resHours.rows.map((row) => row.hour);
    return tour;
  } catch (error) {
    console.error("Error en funcion GetToursAdminBiId:", error);
    throw error;
  }
};
export async function NewTour({
  title_es,
  title_pt,
  title_en,
  desc_es,
  desc_pt,
  desc_en,
  find_es,
  find_pt,
  find_en,
  imgTour,
  timing,
  schedules,
  points,
  persons,
  popular,
  slug,
}) {
  try {
    const fineSlug = await pool.query("SELECT * FROM tours WHERE slug=$1", [
      slug,
    ]);
    if (fineSlug.rows.length > 0) {
      throw new Error(
        "ya existe un tour con ese nombre, por favor elegir otro",
      );
    }
    const res = await pool.query(
      `INSERT INTO tours 
      (name_es, name_pt, name_en, description_es, description_pt, description_en, find_me_es, find_me_pt, find_me_en, img, duration, "max_people",slug,status,populate) 
       VALUES 
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)RETURNING *`,
      [
        title_es,
        title_pt,
        title_en,
        desc_es,
        desc_pt,
        desc_en,
        find_es,
        find_pt,
        find_en,
        imgTour,
        timing,
        parseInt(persons),
        slug,
        false,
        popular || false,
      ],
    );
    const id = res.rows[0].id;
    if (!id) {
      throw new Error("Error al crear el tour");
    }
    const rawPoints = Array.isArray(points) ? points[0] : points;
    const pointsArray =
      typeof rawPoints === "string" ? JSON.parse(rawPoints) : rawPoints;
    if (Array.isArray(pointsArray) && pointsArray.length > 0) {
      await pool.query(
        `INSERT INTO itinerary (tour_id, name) 
        SELECT $1, unnest($2::text[])`,
        [id, pointsArray],
      );
    }

    const rawSchedules = Array.isArray(schedules) ? schedules[0] : schedules;
    const horariosArray =
      typeof rawSchedules === "string"
        ? JSON.parse(rawSchedules)
        : rawSchedules;

    if (Array.isArray(horariosArray)) {
      for (const h of horariosArray) {
        const isRange = h.tipo_configuracion === "range";
        const dateStart = isRange ? h.rango?.inicio : null;
        const dateEnd = isRange ? h.rango?.fin : null;
        const cleanHour = Array.isArray(h.horas_salida)
          ? h.horas_salida[0].replace(" X", "")
          : h.horas_salida?.replace(" X", "");

        await pool.query(
          `INSERT INTO tours_hours 
      (tours_id, name, language_id, type_schedule, date_start, date_end, configurations, day_week, hour) 
      VALUES 
      ($1, $2, (SELECT id FROM languages WHERE code = $3 LIMIT 1), $4, $5, $6, $7, $8, $9)`,
          [
            id,
            h.nombre,
            h.idioma,
            h.tipo_configuracion,
            dateStart,
            dateEnd,
            JSON.stringify(h.meses || h.fechas_especificas || []),
            h.dias_semana,
            cleanHour,
          ],
        );
      }
    }

    return res.rows[0];
  } catch (error) {
    console.error("Error en NewTour:", error);
    throw error;
  }
}
export async function DeleteTour(id) {
  try {
    const res = await pool.query("DELETE FROM tours WHERE id=$1 RETURNING *", [
      id,
    ]);
    if (res.rows.length === 0) {
      throw new Error("No se encontró el tour a eliminar");
    }
    return res.rows[0];
  } catch (error) {
    console.error("Error en DeleteTour:", error);
    throw error;
  }
}
export async function ChangeStatus(id, status) {
  try {
    const res = await pool.query(
      "UPDATE tours SET status=$1 WHERE id=$2 RETURNING*",
      [status, id],
    );
    if (res.rows.length === 0) {
      throw new Error("No se encontro el tour");
    }
    return true;
  } catch (error) {
    console.error("Error en ChangeStatus", error);
  }
}

// Languages
export async function GetLanguages() {
  try {
    const res = await pool.query("SELECT * FROM languages ORDER BY id ASC");
    if (res.rows.length === 0) {
      throw new Error("No se encontró la hora a eliminar");
    }
    return res.rows;
  } catch (error) {
    console.error("Error en GetLanguages:", error);
    throw error;
  }
}
export async function NewLanguages(name, code, icon) {
  // ojo que aqui hay que crear nuevos campos en la tabla tours (name, description, find_me)
  // ALTER TABLE tours ADD COLUMN name_pt varchar(255) null;
  // ALTER TABLE tours ADD COLUMN description_pt text null;
  // ALTER TABLE tours ADD COLUMN find_me_es text null;
  return (name, code, icon);
}
// usuarios
export async function GetUsers() {
  try {
    const res = await pool.query(
      "SELECT id, name, email, status FROM users ORDER BY id",
    );
    return res.rows;
  } catch (error) {
    console.error("Error en funcion GetUsers:", error);
    throw error;
  }
}
export async function NewUser(name, email, password) {
  try {
    const hash = await bcrypt.hash(password + PEPPER, 12);
    const res = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (res.rows.length === 1) {
      throw new Error("El usuario ya existe, por favor elegir otro email");
    }
    const create = await pool.query(
      "INSERT INTO users (name,email,password, two_factor_enabled, two_factor_secret, two_factor_code) VALUES ($1,$2,$3,FALSE,NULL,NULL) RETURNING id, name, email",
      [name, email, hash],
    );
    return create.rows[0];
  } catch (error) {
    console.error("Error en NewUser:", error);
    throw error;
  }
}
export async function resetPasswordUser(id, password) {
  try {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (res.rows.length === 0) {
      throw new Error("Usuario no encontrado");
    }
    const hash = await bcrypt.hash(password + PEPPER, 12);
    const update = await pool.query(
      "UPDATE users SET password=$1 WHERE id=$2 RETURNING name,email,status",
      [hash, id],
    );

    return {
      status: 200,
      data: update.rows[0],
    };
  } catch (error) {}
}
export async function updateUser(id, name, email, estado) {
  try {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (res.rows.length === 0) {
      return {
        status: 404,
        error: "Usuario no encontrado",
      };
    }

    const update = await pool.query(
      "UPDATE users SET name=$1, email=$2, status=$3 WHERE id=$4 RETURNING name,email,status",
      [name, email, estado, id],
    );

    return {
      status: 200,
      data: update.rows[0],
    };
  } catch (error) {
    console.error("Error en updateUser:", error);
    return {
      status: 500,
      error: "Error interno del servidor",
    };
  }
}

export async function deleteUser(id) {
  try {
    const res = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING name,email,status",
      [id],
    );
    if (res.rows.length === 0) {
      throw new Error("No se encontró el usuario a eliminar");
    }
    return res.rows[0];
  } catch (error) {
    console.error("Error en deleteUser:", error);
    throw error;
  }
}

// login

export async function ValidateLogin(usuario, clave) {
  try {
    const res = await pool.query(
      "SELECT id, name, email, password, two_factor_enabled FROM users WHERE email = $1",
      [usuario],
    );
    if (res.rowCount === 0) {
      return { success: false, message: "Usuario no encontrado" };
    }

    const user = res.rows[0];
    const match = await bcrypt.compare(clave + PEPPER, user.password);

    if (!match) {
      return { success: false, message: "Contraseña incorrecta" };
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      SECRET,
      { expiresIn: "10m" },
    );

    return { success: true, twofa: user.two_factor_enabled, token: token };
  } catch (error) {
    console.error("Error en ValidateLogin:", error);
    throw error;
  }
}
export async function SetSecret2FA(id, SECRET) {
  try {
    const res = await pool.query(
      "UPDATE users SET two_factor_secret = $1 WHERE id = $2",
      [SECRET, id],
    );
    return res.rows[0];
  } catch (error) {
    console.error("Error en SetSecret2FA:", error);
    throw error;
  }
}
export async function GetFactorCode(id) {
  try {
    const res = await pool.query(
      "SELECT two_factor_secret FROM users WHERE id = $1",
      [id],
    );
    if (res.rowCount === 0) {
      throw new Error("Usuario no encontrado");
    }
    return res.rows[0].two_factor_secret;
  } catch (error) {
    console.error("Error en GetFactorCode:", error);
    throw error;
  }
}
export async function Actived2FA(id) {
  try {
    const res = await pool.query(
      "UPDATE users SET two_factor_enabled = true WHERE id = $1",
      [id],
    );
    if (res.rowCount === 0) {
      throw new Error("Usuario no encontrado");
    }
    return true;
  } catch (error) {
    console.error("Error en Actived2FA:", error);
    throw error;
  }
}
