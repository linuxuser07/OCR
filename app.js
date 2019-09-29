//declared imports
const express = require('express');
const app = express();
//File inputs 
const fs = require("fs");
//allow to upload to server 
const multer = require('multer');
//Used to analize the images
const {TesseractWorker } = require('tesseract.js');
const worker = new TesseractWorker();
//declared storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage}).single('avatar');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/upload', (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) return console.log('This is your error', err);

            worker
            .recognize(data, 'eng', {tessjs_create_pdf: '1'})
            .progress(progress => {
                console.log(progress);
            })
            .then(result => {
                //output as a text
                //res.send(result.text);
                res.redirect('/download')
            })
            .finally(() => worker.terminate());
        });
    });
});

app.get('/download', (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
})

//Start up the server 
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Hey Im running on Port ${PORT}`));