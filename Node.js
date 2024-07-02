const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const ejs = require("ejs");
const fs = require("fs");
const session = require('express-session');
const path = require('path');

const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'views')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Note: secure should be true in production with HTTPS
}));

app.get("/", (req, res) => {
    res.render("mainPage", { isLoggedIn: !!req.session.username });
});

app.get("/HomePage", (req, res) => {
    res.render("HomePage", { isLoggedIn: !!req.session.username });
});

app.get("/contactUs", (req, res) => {
    res.render("contactUs", { isLoggedIn: !!req.session.username });
});

app.get("/catCare", (req, res) => {
    res.render("catCare", { isLoggedIn: !!req.session.username });
});

app.get("/DogCare", (req, res) => {
    res.render("DogCare", { isLoggedIn: !!req.session.username });
});

app.get("/findAnimal", (req, res) => {
    res.render("findAnimal", { isLoggedIn: !!req.session.username });
});

app.get("/loginPage", (req, res) => {
    res.render("loginPage", { isLoggedIn: !!req.session.username });
});

app.post("/loginPageValidator", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const credentials = `${username}:${password}\n`;

    fs.readFile('credentials.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }

        if (data.includes(credentials)) {
            req.session.username = username;
            res.redirect("/givePet");
        } else {
            const errorMessage = "Make sure to enter the correct Login information or create an account if you do not have one.";
            res.send(`
                <script>
                    alert("${errorMessage}");
                    window.location.href = "/loginPage";
                </script>
            `);
        }
    });
});

app.get("/givePet", (req, res) => {
    if (!req.session.username) {
        return res.redirect("/loginPage");
    }
    res.render("givePet", { isLoggedIn: !!req.session.username });
});

app.post("/giveAPet", (req, res) => {
    if (!req.session.username) {
        return res.redirect("/loginPage");
    }

    const { pet, breed, age, gender, getsAlongWithCats, getsAlongWithDogs, suitable, comment, givenName, familyName, email } = req.body;
    const petInfo = `${req.session.username}:${pet}:${breed}:${age}:${gender}:${getsAlongWithCats}:${getsAlongWithDogs}:${suitable}:${comment}:${givenName}:${familyName}:${email}\n`;

    fs.appendFile('availablePetInformationFile.txt', petInfo, (err) => {
        if (err) {
            res.status(500).send('Error storing information');
            return;
        }
        res.send("<h1>Your pet has been successfully added to the list of pets for adoption</h1>");
    });
});

app.get("/createAccount", (req, res) => {
    res.render("createAccount", { isLoggedIn: !!req.session.username });
});

app.post('/getUserInfo', (req, res) => {
    const { username, password } = req.body;
    const credentials = `${username}:${password}\n`;

    fs.readFile('credentials.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }

        if (data.includes(credentials)) {
            res.send('User already has an account');
        } else {
            fs.appendFile('credentials.txt', credentials, (err) => {
                if (err) {
                    res.status(500).send('Error storing credentials');
                    return;
                }
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

app.get("/logout", (req, res) => {
    if (!req.session.username) {
        return res.redirect("/loginPage");
    }
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.send(`
            <script>
                alert("Logged Out Successfully");
                window.location.href = "/HomePage";
            </script>
        `);
    });
});

app.get("/privacy", (req, res) => {
    res.render("privacy", { isLoggedIn: !!req.session.username });
});

app.post('/submitFindAnimal', (req, res) => {
    const { pet, breed, age, gender, getsAlongWithCats, getsAlongWithDogs, suitable } = req.body;

    fs.readFile('availablePetInformationFile.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading available animals.');
        }

        const animals = data.split('\n').map(line => line.split(':'));
        const matchedAnimals = animals.filter(animal => (
            (!pet || animal[1]?.toLowerCase() === pet.toLowerCase()) &&
            (!breed || animal[2]?.toLowerCase() === breed.toLowerCase()) &&
            (!age || animal[3]?.toLowerCase() === age.toLowerCase()) &&
            (!gender || animal[4]?.toLowerCase() === gender.toLowerCase()) &&
            (!getsAlongWithCats || animal[5]?.toLowerCase() === getsAlongWithCats.toLowerCase()) &&
            (!getsAlongWithDogs || animal[6]?.toLowerCase() === getsAlongWithDogs.toLowerCase()) &&
            (!suitable || animal[7]?.toLowerCase() === suitable.toLowerCase())
        ));

        if (matchedAnimals.length > 0) {
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

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
