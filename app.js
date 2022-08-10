import dotenv from "dotenv";
dotenv.config()
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:false}));
import bcrypt from 'bcrypt';
const saltRounds = 10;

app.use(cors());
app.use(express.json());

////////CONNECTING TO MONGODB & MONGOOSE
// need to add uri to environment varibales. 
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully!")
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
const PracticeUser = new mongoose.model("PracticeUser", userSchema)

app.get('/', (req,res) => {
    res.render('home')
});

app.get('/login', (req,res) => {
    res.render('login')
})

app.get('/register', (req,res) => {
    res.render('register')
});

app.post("/register", (req, res)=> {
    bcrypt.hash(req.body.password, saltRounds, (err, hash)=> {
        const newUser = new PracticeUser({
            email: req.body.username,
            password: hash
        });
        newUser.save((err)=> {
            if (err) {
                console.log(err)
            } else {
                res.render("secrets")
            }
        })

    })
    ///LEVEL 1 SECURITY: the page doesnt render until valid login!
});

app.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    PracticeUser.findOne({email: username}, (err, foundUser)=> {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, (err,result) => {
                    if (result === true) {
                        res.render("secrets");
                    }

                })
            }
        }
    })
})

app.listen(3000, () => {
    console.log("server is started on port 3000")
})