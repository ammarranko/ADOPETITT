// reuqire express
const express= require("express");
const app = express();
// require body perser
const bodyParser = require('body-parser');
//require ejs foe ejs files ( for footer and header purposes)
const ejs=require("ejs");
// require fs ( for file writing and reading)
const fs= require("fs");
// to be able to get the query from a Post method
app.use(bodyParser.urlencoded({ extended: true }));
// to use the ejs 
app.set("view engine", "ejs")
// to apply css stylesheet that is found in the folder
app.use(express.static('views'));

app.use(
	express.json(),
	express.urlencoded({
		extended: true,
  }));


const path = require('path');
const port = process.env.PORT||5000;



// Load main page when opening the website
app.get("/",(req,res)=>{
    // since this is not an html file anymore, we dont use this but we use the render function
//res.sendFile("./projectEJS/HomePage.html",{root: __dirname});
res.render("mainPage");
});


// Load home page upon request
app.get("/HomePage",(req,res)=>{
res.render("HomePage");
});


// load contact us upon request
app.get("/contactUs",(req,res)=>{
res.render("contactUs");
});



// laod cat care upon request

app.get("/catCare",(req,res)=>{

res.render("catCare");
});

//Load Dog care upon request

app.get("/DogCare",(req,res)=>{
res.render("DogCare");
});


// Load find animal upon request
app.get("/findAnimal",(req,res)=>{
res.render("findAnimal");
});


// Load login page upon request
app.get("/loginPage", (req, res) => {
    res.render("loginPage");
});


// This  validates if the user already existed, if yes, then we laod the give pet page, reads the entries of the user and append them to the available pets information text file
// if the user does not exist, then we ask him to create an account.
app.get("/loginPageValidator", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const credentials = `${username}:${password}\n`;


    // Read contents of the file
    fs.readFile('credentials.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }

        // Check if username already exists in the file
        if (data.includes(credentials)) {
            res.render("givePet");

            // Define the giveAPet route here so it can access the username
            app.get("/giveAPet", (req, res) => {
                const pet = req.query.pet;
                const breed = req.query.breed;
                const age = req.query.age;
                const gender = req.query.gender;
                const getsAlongCats = req.query.getsAlongWithCats;
                const getsAlongWithDogs = req.query.getsAlongWithDogs;
                const suitable = req.query.suitable;
                const comment=req.query.comment
                const givenName = req.query.givenName;
                const familyName = req.query.familyName;
                const email = req.query.email;
            
                const petInfo = `${username}:${pet}:${breed}:${age}:${gender}:${getsAlongCats}:${getsAlongWithDogs}:${suitable}:${comment}:${givenName}:${familyName}:${email}\n`;
                
                res.send("<h1> Your pet has been successfully added to the list of pet for adoption</h1>");

   //available pet information file

                fs.appendFile('availablePetInformationFile.txt', petInfo, (err) => {
                    if (err) {
                        res.status(500).send('Error storing information');
                        return;
                    }
             
                });

                
                     
            }
        
        );
        } else {
            // User not found
            const errorMessage = "Make sure to enter the correct Login information or create an account if you do not have one.";
            res.send(`
                <script>
                    alert("${errorMessage}");
                </script>
            `);        }
    });
});






// loads create account page upon request
app.get("/createAccount",(req,res)=>{
res.render("createAccount");
});

// loads the log out page
// Note : This assignment was designes without the use of the session.I asked Dr.Yuhong in the class and she said I do not need
// to use Session in order to be able to build this current version of the website.

app.get("/logout", (req, res) => {
    const message = "Logged Out Successfully";
    res.send(`
        <script>
            alert("${message}");
            window.location.href = "/HomePage";
        </script>
    `);
});










// here, ww create  the account and add the user to the credentials text file
app.get('/getUserInfo', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    const credentials = `${username}:${password}\n`;

    // Read contents of the file
    fs.readFile('credentials.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }

        // Check if credentials already exist in the file
        if (data.includes(credentials)) {
            res.send('User already has an account');
        } else {
            // Append credentials to the file
            fs.appendFile('credentials.txt', credentials, (err) => {
                if (err) {
                    res.status(500).send('Error storing credentials');
                    return;
                }
                // Append username to the file
                fs.appendFile('users.txt', username + '\n', (err) => {
                    if (err) {
                        console.error('Error storing usernames:', err);
                        res.status(500).send('Error storing usernames');
                        return;
                    }
                    res.send('Credentials stored successfully');
                });
            });
        }
    });
});








// Load the privacy page upon request


app.get("/privacy",(req,res)=>{
res.render("privacy");
});






// laod the find animal page

app.get('/findAnimal', (req, res) => {
    res.send("findAnimal")
});

// Handle the submission if the form to find animal. 

// read the query
app.post('/submitFindAnimal', (req, res) => {
    // Parse form data
    const { pet, breed, age, gender, getsAlongWithCats, getsAlongWithDogs, suitable } = req.body;


    // Read available animals file to check if there exists an animal that matches what the user os looking for 
    fs.readFile('availablePetInformationFile.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading available animals.');
        }

        // Parse available animals
        const animals = data.split('\n').map(line => line.split(':'));

        // Filter animals based on user's criteria
        //https://www.w3schools.com/jsref/jsref_filter.asp
        const matchedAnimals = animals.filter(animal => (
            // Check if each attribute exists before accessing its value and then cheque if we find a matched animal
            // start from index one of the array since index 0 is representing the username and we do not ask for it in the find animal form
            (!pet || animal[1]?.toLowerCase() === pet.toLowerCase()) &&
            (!breed || animal[2]?.toLowerCase() === breed.toLowerCase()) &&
            (!age || animal[3]?.toLowerCase() === age.toLowerCase()) &&
            (!gender || animal[4]?.toLowerCase() === gender.toLowerCase()) &&
            (!getsAlongWithCats || animal[5]?.toLowerCase() === getsAlongWithCats.toLowerCase()) &&
            (!getsAlongWithDogs || animal[6]?.toLowerCase() === getsAlongWithDogs.toLowerCase()) &&
            (!suitable || animal[7]?.toLowerCase() === suitable.toLowerCase())
        ));

        if (matchedAnimals.length > 0) {
            // Return animals with style and colors
            //https://www.w3schools.com/jsref/jsref_map.asp
            //  retue nan html file containns the inforamtion of the matched pet.
            const formattedAnimals = matchedAnimals.map(animal => {
                return `
                    <div style="background-color: #f2f2f2; padding: 10px; margin-bottom: 10px;">
                    <h2 style="color: black;"> The Owner: ${animal[0]}</h2>
                        <h2 style="color: blue;"> Type of pet : ${animal[1]}</h2>
                        <p style="color: purple;">Breed: ${animal[2]}</p>
                        <p style="color: purple;">Age: ${animal[3]}</p>
                        <p style="color: purple;">Gender: ${animal[4]}</p>
                        <p style="color: purple;">Gets Along With Cats: ${animal[5]}</p>
                        <p style="color: purple;">Gets Along With Dogs: ${animal[6]}</p>
                        <p style="color: purple;">Suitable: ${animal[7]}</p>
                    </div>
                `;
            });
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Matching Animals</title>
                </head>
                <body>
                    ${formattedAnimals.join('')}
                </body>
                </html>
            `);
        } else {
            // Indicate if no animals were found
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>No Animals Found</title>
                </head>
                <body>
                    <p style="color: red; font-weight: bold;">No animals found matching the criteria.</p>
                </body>
                </html>
            `);
        }
    });
});


// 

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });