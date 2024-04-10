const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const router = require('./src/route/routes')
const multer = require('multer')
const path = require('path');


dotenv.config();
app.use(express.json());
app.use(helmet());
app.use(morgan("common"))

app.use("/images", express.static(path.join(__dirname, "public/images/person")));

const storage = multer.diskStorage({
    destination :(req,file,cb) =>{
        console.log(file)
        // const ext = path.extname(req.body.name);
        cb(null,"public/images");
    },
    filename : (req,file,cb)=>{
        console.log(req.body.name,file.originalname)
        cb(null,file.originalname);
    },
});

// const upload = multer();
// const upload = multer({ dest: 'public/images' })
const upload = multer({ storage: storage });
app.post("/upload",upload.single("file"),(req,res)=>{
    try {
        return res.status(200).json("file uploaded succesfully");
    } catch (error) {
        console.log(error)
    }
})


mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("db connected")
}).catch(err => console.log(err))

app.use(cors())

app.use('/',router)


app.listen(process.env.PORT,()=>{
    console.log('server is on')
})




