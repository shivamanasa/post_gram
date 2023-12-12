import express from 'express'
import bodyParser from 'body-parser'
import hbs from 'hbs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

import { readPosts, readUser, insertUser, insertPost, likeFun, shareFun, deleteFun } from './operations.js'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(cookieParser())

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    res.render("login")
})

app.post('/login', async (req, res) => {
    // console.log(req.body.profile)
    // console.log(req.body.password)
    const output = await readUser(req.body.profile)
    const password = output[0].password
    if(password === req.body.password){

         const payload = {"profile":output[0].profile, "name":output[0].name, "headline":output[0].headline}
         const secret ="af8c5011c31386d02760b5a86bb1151b18345b68e87873617a65cc5a786b179098989a51ed633290d0570a0076762ececaaaca54e553f4ba5ee6f34ef4398681"

         const token = jwt.sign(payload,secret)
         res.cookie("token",token)
         res.redirect("/posts")
     }
     else{
         res.send("Incorrect Username or Password")
     }
     console.log(output)
})

app.get('/posts',verifyLogin,async(req,res)=>{
    const output = await readPosts()
    res.render("posts",{
        data:output,
        userInfo:req.payload
    })
})

app.post('/likes',async(req,res)=>{
    await likeFun(req.body.content)
    res.redirect('/posts')
})
app.post('/shares',async(req,res)=>{
    await shareFun(req.body.content)
    res.redirect('/posts')
})

app.post('/delete',async(req,res)=>{
    await deleteFun(req.body.content)
    res.redirect('/posts')
})

app.post('/addposts',async(req,res)=>{
    await insertPost(req.body.profile,req.body.content)
    res.redirect('/posts')
})

function verifyLogin(req,res,next){
    const secret ="af8c5011c31386d02760b5a86bb1151b18345b68e87873617a65cc5a786b179098989a51ed633290d0570a0076762ececaaaca54e553f4ba5ee6f34ef4398681"
    const token = req.cookies.token
    jwt.verify(token,secret,(err,payload)=>{
        if(err) return res.sendStatus(403)
        req.payload = payload
    })
    next()
}

app.post('/addusers',async(req,res)=>{
    if(req.body.password === req.body.cnfpassword){

        await insertUser(req.body.name, req.body.profile, req.body.password, req.body.headline)
        res.redirect('/')
    }
    else{
        res.send("password and Confirm password did not match")
    }
    
})

app.get('/signup',(req,res)=>{
    res.render("signup")
})

app.listen(3000, () => {

    console.log("Listening...")
})