import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import displayRoutes from 'express-routemap'
import mysql from 'mysql2'

const dbConnection = mysql.createConnection({
  host: 'www.cursotesting.com.ar',
  user: 'testing3',
  password: 'institutoweb',
  database: 'lmonteTest',
  port: 3306
})

const app = express()
const PORT = process.env.PORT || 3000
const API_PREFIX = 'api'

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

dbConnection.connect(err => {
  err ? console.log('Error connecting to database', err) : console.log('Database connection successfully')
})

const basicQuery = 'SELECT * FROM testing_facturas'

dbConnection.query(basicQuery, (err, result) => {
  err ? console.log('Error executing basic query', err) : console.table(result)
})

app.get(`/${API_PREFIX}/v1/`, (req, res) => {
  res.status(200)
    .json({ ok: true, status: 200, message: 'alive' })
})

app.listen(PORT, () => {
  console.log('app listening on port:', PORT)
  displayRoutes(app)
})
