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
app.get(`/${API_PREFIX}/v1/empleados/:id`, async (req, res) => {
  const [rows] = await pool.query(employeesQuery)
  try {
    if (rows.length <= 0) {
      return res.status(404).send({ ok: false, message: 'no hay facturas disponibles' });
    }
    if (req.query.id) {
      const employeeId = req.query.id;
      const employee = rows.find(row => row.id === employeeId);

      if (employee) {
        return res.status(200).send({ ok: true, empleado: employee });
      } else {
        return res.status(404).send({ ok: false, message: 'empleado no encontrado' });
      }
    }
    return res.status(200).send({ ok: true, facturas: rows });
  } catch (error) {
    console.log('__ERROR__:', error);
    return res.status(500).send({ message: 'algo salio mal' });
  }
  // try {
  //   rows.length <= 0
  //     ? res.status(404).send({ ok: false, message: 'no hay facturas disponibles' })
  //     : res.status(200).send({ ok: true, facturas: rows })
  //   console.log(rows)
  // } catch (error) {
  //   console.log('__ERROR__:', error)
  //   return res.status(500).send({ message: 'algo salio mal' })
  // }
})
app.use((req, res, next) => {
  res.status(404).send({ message: 'pagina no encontrada' })
})
app.listen(PORT, () => {
  console.log('app listening on port:', PORT)
  displayRoutes(app)
})
