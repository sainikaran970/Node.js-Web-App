import express from "express"
import path from "path"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


mongoose.connect("mongodb://127.0.0.1:27017" , {
    dbName:"back_end",
})
.then( () => console.log("Database Connected"))
.catch( () => {console.log("Error")
})

// Creating Schema to store data
const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
})

// Creating Model to make a Collection
const User = mongoose.model("User" , userSchema)


const app = express()
const users = []

// Using Middlewares
app.use(express.static(path.join(path.resolve() , "public")))    // <- Taking "use" keyword to pass the handler
app.use(express.urlencoded({extended : true}));  // <- By using this middlewares we access the data of form
app.use(cookieParser())

// app.get("/" , (req , res) => {
//     res.send("<h2>Hey Buddy</h2>")
// })

// app.get("/" , (req , res) => {
//     res.sendStatus(500)
// })

// app.get("/getproducts" , (req , res) => {
//     res.json({
//         success : true,
//         products : [{
//             name : "karan",
//         }],
//     })
// })

// app.get("/getproducts" , (req , res) => {
//     res.status(500).send("it's working")
// })

// app.get("/" , (req , res) => {
//     const pathLocation = path.resolve()
//     // console.log(pathLocation)      // <-  Used to know path in console for understanding purpose 
//     // console.log(path.join(pathLocation , "./index.html"))  // <- Used to add "index.html" in path
//     res.sendFile(path.join(pathLocation , "./index.html"))    // <- sendFile function needs path
// })

app.set("view engine" , "ejs")      // <- Setting up View Engine and after writing this , we do not need to write extension repeatedly

const isAuthenticated = async(req , res , next) => {
    const {token} = req.cookies   // <- Destructuring of token

    if(token){
        const decoded = jwt.verify(token , "sfnasofwnuwcanoweihg")
        // console.log(decoded)
        req.user = await User.findById(decoded._id)

        next()   
    }
    else{
        res.redirect("/login")      
    }
}

app.get("/" ,isAuthenticated ,  (req , res) => {
    // console.log(req.cookies)    // <- Output the cookie key value pair
    // console.log(req.cookies.token)
    // console.log(req.user)
    res.render("logout" , {name : req.user.name})
})


app.get("/login" , (req , res) => {
    res.render("login")
})


app.get("/register" , (req , res) => {
    res.render("register")
})


app.post("/login" , async(req , res) => {
    const {email , password} = req.body

    let user = await User.findOne({email})

    if(!user){
        res.redirect("/register")
    }
    const isMatch = await bcrypt.compare(password , user.password)
    if(!isMatch){
        return res.render("login" , {email , message : "Incorrect Password"})
    }

    const token = jwt.sign({_id : user._id} , "sfnasofwnuwcanoweihg")
    res.cookie("token" , token , {
        httpOnly:true , expires : new Date(Date.now() + 60*1000) 
    })
    res.redirect("/")
})


app.post("/register" , async(req , res) => {
    // console.log(req.body)
    const {name,email,password} = req.body

    let user = await User.findOne({email})
    if(user){
        return res.redirect("/login")
    }

    const hashedPassword = await bcrypt.hash(password , 10)
    user = await User.create({
        name,
        email,
        password : hashedPassword
    })

    const token = jwt.sign({_id : user._id} , "sfnasofwnuwcanoweihg")
    res.cookie("token" , token , {
        httpOnly:true , expires : new Date(Date.now() + 60*1000) // <- In httpOnly cookie has been access only in backend not in frontend 
    })
    res.redirect("/")
})



app.get("/logout" , (req , res) => {
    res.cookie("token" , null, {
        httpOnly:true , expires : new Date(Date.now()) // <- In httpOnly cookie has been access only in backend not in frontend 
    })
    res.redirect("/")
})



// app.get("/success" , (req , res) => {
//     res.render("success")         
// })

// app.post("/contact" , async (req , res) => {
//     // console.log(req.body)
//     // console.log(req.body.name)
//     // const messageData = {userName: req.body.name , email: req.body.email}
//     // console.log(messageData)

//     const {name , email} = req.body;     // <- Destructuring name and email to avoid repetition 

//     // await Message.create({name : req.body.name , email: req.body.email})
//     // await Message.create({name , email}) // <- If Key and Value Pair are same , then we write it as this also
//     await Message.create({name : name , email: email})
//     res.redirect("/success")
// })

// app.get("/users" , (req , res) => {
//     res.json({
//         users,
//     })
// })

// app.get("/add" , (req , res) => {
//     Message.create({name : "Kevin" , email : "kevin229@gmail.com"}).then( () => {
//         res.send("Message Added")
//     })
// })

app.listen(5000 , () => {
    console.log("Server is working")
})