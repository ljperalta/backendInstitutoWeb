import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import displayRoutes from 'express-routemap'
import { createPool } from 'mysql2/promise'


const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
}
const pool = createPool(connectionConfig)

const app = express()
const PORT = process.env.PORT || 3001
const API_PREFIX = 'api'

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// pool.query(err => {
//   err ? console.log('Error connecting to database', err) : console.log('Database connection successfully')
// })
const billsQuery = 'SELECT * FROM testing_facturas'
const employeesQuery = 'SELECT * FROM empleados'

app.get(`/${API_PREFIX}/v1/facturas`, async (req, res) => {
  const [rows] = await pool.query(billsQuery)
  try {
    rows.length <= 0
      ? res.status(404).send({ ok: false, message: 'no hay facturas disponibles' })
      : res.status(200).send({ ok: true, facturas: rows })
    console.log(rows)
  } catch (error) {
    console.log('__ERROR__:', error)
    return res.status(500).send({ message: 'algo salio mal' })
  }
})
app.post('/api/v1/facturas', async (req, res) => {
  const nuevaFactura = req.body;
  try {
    const [rowPersona] = await pool.query('select * from personas where dni = ?', nuevaFactura.dni);
    const [rowCurso] = await pool.query('select * from cursos where descripcion = ?', nuevaFactura.curso);
    const insertQueryF = 'INSERT INTO testing_facturas (id_persona, fecha_factura, id_curso, importe) VALUES (?, ?, ?, ?)';
    
    const [resultF] = await pool.query(insertQueryF, [
      rowPersona.id,
      nuevaFactura.fecha,
      rowCurso.id,
      nuevaFactura.importe
    ]);

    if (resultF.affectedRows === 1) {
      res.status(201).send({ message: 'Factura insertada con éxito' });
    } else {
      res.status(500).send({ message: 'No se pudo insertar la factura' });
    }
  }catch(error){
    console.error('Error al insertar la factura:', error);
    res.status(500).send({ message: 'Algo salió mal' });
  }
})
app.get(`/${API_PREFIX}/v1/empleados/`, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM empleados')
  try {
    if (rows.length <= 0) {
      return res.status(404).send({ ok: false, message: 'no hay facturas disponibles' });
    }
    return res.status(200).send({ ok: true, empleadooos: rows });
  } catch (error) {
    console.log('__ERROR__:', error);
    return res.status(500).send({ message: 'algo salio mal' });
  }
})
app.get(`/${API_PREFIX}/v1/empleados/:id`, async (req, res) => {
  try {
    const employeeId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM empleados WHERE id_empleado = ?', employeeId);
    if (rows.length <= 0) {
      return res.status(404).send({ ok: false, message: 'no hay facturas disponibles' });
    }
    else {
      return res.status(200).send({ ok: true, empleado: rows });
    }
  } catch (error) {
    console.log('__ERROR__:', error);
    return res.status(500).send({ message: 'algo salio mal' });
  }
})
app.post('/api/v1/empleados', async (req, res) => {
  const nuevoEmpleado = req.body; // Datos del empleado desde la solicitud POST

  try {
    const insertQuery = 'INSERT INTO empleados (id_persona, sector, cargo) VALUES (?, ?, ?)';
    
    const [result] = await pool.query(insertQuery, [
      nuevoEmpleado.id_persona,
      nuevoEmpleado.sector,
      nuevoEmpleado.cargo
    ]);
    
    //pool.release();

    if (result.affectedRows === 1) {
      res.status(201).send({ message: 'Empleado insertado con éxito' });
    } else {
      res.status(500).send({ message: 'No se pudo insertar el empleado' });
    }
  }catch(error){
    console.error('Error al insertar el empleado:', error);
    res.status(500).send({ message: 'Algo salió mal' });
  }
});
app.delete('/api/v1/empleados/:id', async (req, res) => {
  try {
    const employeeId = req.params.id;
    
    const [result] = await pool.query('DELETE FROM empleados WHERE id_empleado = ?', employeeId);

    if (result.affectedRows === 1) {
      res.status(201).send({ message: 'Empleado eliminado con éxito' });
    } else {
      res.status(500).send({ message: 'No se pudo eliminar el empleado' });
    }
  }catch(error){
    console.error('Error al eliminar el empleado:', error);
    res.status(500).send({ message: 'Algo salió mal' });
  }
});
app.use((req, res, next) => {
  res.status(404).send({ message: 'pagina no encontrada' })
})
app.listen(PORT, () => {
  console.log('app listening on port:', PORT)
  displayRoutes(app)
})
