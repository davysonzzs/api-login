import express from 'express'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
const supabaseUrl = 'https://wwyjhkhfusrutqcpkfcc.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eWpoa2hmdXNydXRxY3BrZmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDI1MzEsImV4cCI6MjA3NTcxODUzMX0.9FxnIV0qxqfLhmQoWsaEqDtDDHWjT2ZEKhqK069tOww"
export const supabase = createClient(supabaseUrl, supabaseKey)
const app = express()
const porta = 9090
const JWT_SECRET = 'd!iY.,2xRUH}wdwx8K51!$#IaTBUJVGPWb_ZHsO2H2l9'
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

function verificarToken(req, res, next) {
  const authHeader = req.headers?.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const partes = authHeader.split(' ')
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato do token inválido' })
  }

  const token = partes[1]

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' })
    }

    req.user = user
    next()
  })
}

app.post('/login', async (req, res) =>{
    const gmail = req.body.gmail
    const se = req.body.se

    const { data, error } = await supabase
    .from('usuarios')
    .select('email, senha')
    .eq('email', gmail)
    .maybeSingle()

    if(error){
        console.error('erro na buscar' + error)
        return
    }

    if(!data){
        console.log("não encontrado")
        res.json({mensage: "usuario não cadastrado!"})
        return
    }

    if(data.senha === se){
        const token = jwt.sign(
        { id: data.id, email: data.email },
        JWT_SECRET,
        {expiresIn: '10h'}
        )
        console.log("login bem sucedido!")
        res.json({mensage: "login bem sucedido!", token})
    } else {
        console.log("Senha errada!")
        res.json({mensage: "senha incorreta!"})
    }
})

app.post('/cadastro', async (req, res) =>{
    const gmail = req.body.gmail
    const se = req.body.se
    const { data, error} = await supabase
    .from('usuarios')
    .insert([{email: gmail, senha: se}])
    .select('id, email')
    .single()

    const token = jwt.sign(
        { id: data.id, email: data.email },
        JWT_SECRET,
        {expiresIn: '10h'}
    )
      
    if(error){
        console.error(error)
    } else {
        console.log("usuario adicionado")
        res.json({mensage: "cadastro bem sucedido sucedido", token})
    } 
})


app.get('/catalogo', verificarToken, async (req, res) =>{
    console.log("usuario seguro entrou!", req.usuario)

    const { data, error } = await supabase
    .from('produtos')
    .select('*')
    if(error){
    console.error(error)
   } else {
    res.json({mensage: "loja", produtos: data})
   } 
})

app.listen(porta, () =>{
    console.log("esta no ar")
})