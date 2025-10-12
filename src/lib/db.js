import postgress from "pg";
import { validate as isUuid } from "uuid";
const { Pool } = postgress;

const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL,
});

export async function GetDestinosPopulate() {
  try {
    const res = await pool.query(
      "SELECT * FROM tours WHERE status=false AND populate=true ORDER BY id"
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
export async function GetDestinosAll() {
  try {
    const res = await pool.query(
      "SELECT * FROM tours WHERE status=false ORDER BY id"
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
    [tour.id]
  );
  const reviewsRes = await pool.query(
    `SELECT AVG(rating) rating, COUNT(*) total FROM tour_reviews WHERE tour_id=$1;`,
    [tour.id]
  );
  const commetnsRes = await pool.query(
    `SELECT name,comment,rating,created_at FROM tour_reviews WHERE tour_id=$1 ORDER BY id;`,
    [tour.id]
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
    [tour.id]
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
export async function GetToursAdmin() {
  try {
    const res = await pool.query(`SELECT 
                                T.id,
                                T.name,
                                COUNT(B.id) total_bookings,
                                T.status
                                FROM tours T 
                                LEFT JOIN booking B ON B.tour_id=T.id AND B.confirmation= true 
                                GROUP BY T.id
                                ORDER BY T.id;`);
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
      [tour.id]
    );
    const resHours = await pool.query(
      "SELECT H.hour FROM tours_hours TH LEFT JOIN hours H ON H.id=TH.hours_id WHERE tours_id=$1",
      [tour.id]
    );
    tour.itinerary = resItinerary.rows.map((row) => row.name);
    tour.hours = resHours.rows.map((row) => row.hour);
    return tour;
  } catch (error) {
    console.error("Error en funcion GetToursAdminBiId:", error);
    throw error;
  }
};
export async function NewTour(tour) {
  try {
    const fineSlug = await pool.query("SELECT * FROM tours WHERE slug=$1", [
      tour.slug,
    ]);
    if (fineSlug.rows.length > 0) {
      throw new Error(
        "ya existe un tour con ese nombre, por favor elegir otro"
      );
    }
    const res = await pool.query(
      `
                              INSERT INTO tours (name, description, img, duration, "max_people",slug,status,populate)
                            VALUES ($1, $2, $3, $4, $5, $6,false, $7)
                            RETURNING *
                        `,
      [
        tour.title,
        tour.description,
        tour.imgTour,
        tour.timing,
        tour.persons,
        tour.slug,
        tour.populate,
      ]
    );
    const id = res.rows[0].id;
    if (!id) {
      throw new Error("Error al crear el tour");
    }
    const points = tour.points;
    if (points && Array.isArray(points)) {
      for (const p of points) {
        await pool.query(
          `INSERT INTO itinerary (tour_id, name) VALUES ($1, $2)`,
          [id, p]
        );
      }
    }
    const horario = tour.horario;
    if (horario && Array.isArray(horario)) {
      for (const h of horario) {
        await pool.query(
          `INSERT INTO tours_hours (tours_id, hours_id) VALUES ($1, $2)`,
          [id, h]
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
  console.log(id);
  try {
    const res = await pool.query(
      "UPDATE tours SET status=$1 WHERE id=$2 RETURNING*",
      [status, id]
    );
    if (res.rows.length === 0) {
      throw new Error("No se encontro el tour");
    }
    return true;
  } catch (error) {
    console.error("Error en ChangeStatus", error);
  }
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
      "SELECT H.id, H.hour FROM tours T LEFT JOIN tours_hours TH ON TH.tours_id=T.id LEFT JOIN hours H ON H.id=TH.hours_id WHERE slug=$1",
      [slug]
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
      "SELECT COALESCE(SUM(adult), 0) + COALESCE(SUM(child), 0) AS total, T.max_people - (COALESCE(SUM(adult), 0) + COALESCE(SUM(child), 0)) AS disponible FROM tours T LEFT JOIN booking B ON T.id = B.tour_id AND B.date_booking = $1 AND confirmation= false WHERE T.slug = $2 GROUP BY T.id",
      [date, slug]
    );
    return res.rows;
  } catch (error) {
    console.error("Error en funcion GetAvailability:", error);
    throw error;
  }
}
export async function NewBooking(booking) {
  try {
    const res = await pool.query(
      `
                              INSERT INTO booking (adult, child, date_booking, hours, tour_id, confirmation, ticket, hash, created_at, updated_at)
                            VALUES ($1, $2, $3, $4, (SELECT id FROM tours WHERE slug=$5), false, NULL, (SELECT uuid_generate_v4()), NOW(), NULL)
                            RETURNING hash
                        `,
      [booking.adultos, booking.ninos, booking.date, booking.hour, booking.slug]
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
export async function ConfirmBooking(data) {
  try {
    if (!isUuid(data.id)) {
      throw new Error(
        "No modificar la url de confirmación o el hash generado no es válido"
      );
    }
    const checkRes = await pool.query(
      "SELECT confirmation FROM booking WHERE hash = $1",
      [data.id]
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
      RETURNING tour_id, adult, child, date_booking, to_char(hours, 'HH24:MI') AS hours, ticket as ticketid
    `,
      [
        data.nombre,
        data.apellido,
        data.email,
        data.telefono,
        generarCodigoTicket(),
        data.id,
      ]
    );
    if (res.rows.length === 0) {
      throw new Error("Reserva no encontrada");
    }
    const tourRes = await pool.query(
      "SELECT name, img FROM tours WHERE id=$1",
      [res.rows[0].tour_id]
    );
    res.rows[0].tour = tourRes.rows[0].name;
    res.rows[0].imgTour = tourRes.rows[0].img;
    return res.rows[0];
  } catch (error) {
    console.error("Error en ConfirmBooking:", error);
    throw error;
  }
}
export async function RandomTour() {
  try {
    const res = await pool.query(
      "SELECT slug FROM tours WHERE status=false ORDER BY RANDOM() LIMIT 1"
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
// listar las horas

export async function GetHours() {
  try {
    const res = await pool.query("SELECT * FROM hours ORDER BY id");
    if (res.rows.length === 0) {
      throw new Error("No hay horas disponibles");
    }
    return res.rows;
  } catch (error) {
    console.error("Error en funcion GetHours:", error);
    throw error;
  }
}
export async function deleteHour(id) {
  try {
    const res = await pool.query("DELETE FROM hours WHERE id=$1 RETURNING *", [
      id,
    ]);
    if (res.rows.length === 0) {
      throw new Error("No se encontró la hora a eliminar");
    }
    return res.rows[0];
  } catch (error) {
    console.error("Error en deleteHour:", error);
    throw error;
  }
}
export async function NewHour(hora) {
  try {
    const res = await pool.query("SELECT * FROM hours WHERE hour = $1", [hora]);
    if (res.rows.length === 0) {
      const create = await pool.query("INSERT INTO hours (hour) VALUES ($1)", [
        hora,
      ]);
    } else {
      console.log("la hora ya existe");
    }
  } catch (error) {
    console.error("Error en deleteHour:", error);
    throw error;
  }
}
export async function ChangeStatusHour(id, hour) {
  try {
    const res = await pool.query("SELECT * FROM hours WHERE hour = $1", [hour]);

    if (res.rows.length > 0) {
      return {
        status: 400,
        error: "Esta hora ya está creada",
      };
    }

    const update = await pool.query(
      "UPDATE hours SET hour=$1 WHERE id=$2 RETURNING *",
      [hour, id]
    );

    return {
      status: 200,
      data: update.rows[0],
    };
  } catch (error) {
    console.error("Error en ChangeStatusHour:", error);
    return {
      status: 500,
      error: "Error interno del servidor",
    };
  }
}
