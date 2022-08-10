import dotenv from "dotenv";
dotenv.config()
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
const app = express();
//passport
import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose'
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:false}));
const saltRounds = 10;

app.use(cors());
app.use(express.json());

app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

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

userSchema.plugin(passportLocalMongoose);
const PracticeUser = new mongoose.model("PracticeUser", userSchema)

passport.use(PracticeUser.createStrategy())
passport.serializeUser(PracticeUser.serializeUser());
passport.deserializeUser(PracticeUser.deserializeUser());
app.get('/', (req,res) => {
    res.render('home')
});

app.get('/login', (req,res) => {
    res.render('login')
})

app.get('/register', (req,res) => {
    res.render('register')
});

app.get("/secrets", (req,res)=> {
    if(req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.redirect("/login")
    }
});

app.get("/logout", (req,res)=> {
    req.logout((err) => {
        if(err) {
            return next(err)
        }
    });
    res.redirect("/")
})

app.post("/register", (req, res)=> {

    PracticeUser.register({username: req.body.username}, req.body.password, (err, user)=> {
        if (err) {
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, () =>{
                res.redirect("secrets")
            })
        }
    })
    
});

app.post("/login", (req,res) => {
    const user = new PracticeUser({
        username: req.body.username,
        password: req.body.password

    });
    req.login(user, (err)=> {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req,res, ()=> {
                res.redirect("/secrets");
            })
        }
    })

})

app.listen(3000, () => {
    console.log("server is started on port 3000")
})