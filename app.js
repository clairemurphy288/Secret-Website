import express from 'express';
import ejs from 'ejs';
import mongoose from 'mongoose';
import cors from 'cors';
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:false}));

app.use(cors());
app.use(express.json());

////////CONNECTING TO MONGODB & MONGOOSE
// need to add uri to environment varibales. 
const uri = "mongodb+srv://admin-claire-murphy:DRo4pOC5XjBUWYXh@cluster0.1knex.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully!")
});

const userSchema = {
    email: String,
    password: String
}
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
    const newUser = new PracticeUser({
        email: req.body.username,
        password: req.body.password
    });
    ///LEVEL 1 SECURITY: the page doesnt render until valid login!
    newUser.save((err)=> {
        if (err) {
            console.log(err)
        } else {
            res.render("secrets")
        }
    })
});

app.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    PracticeUser.findOne({email: username}, (err, foundUser)=> {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    })
})

app.listen(3000, () => {
    console.log("server is started on port 3000")
})