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

// Routes
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
            res.status(500).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            text-align: center;
                            padding: 50px;
                        }
                        .error-message {
                            background-color: #f2dede;
                            border: 1px solid #ebccd1;
                            color: #a94442;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px auto;
                            max-width: 600px;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-message">
                        <h1>Error</h1>
                        <p>Error reading file. Please try again later.</p>
                    </div>
                </body>
                </html>
            `);
            return;
        }

        if (data.includes(credentials)) {
            req.session.username = username;
            res.redirect("/givePet");
        } else {
            const errorMessage = "Make sure to enter the correct Login information or create an account if you do not have one.";
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Login Error</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            text-align: center;
                            padding: 50px;
                        }
                        .error-message {
                            background-color: #f2dede;
                            border: 1px solid #ebccd1;
                            color: #a94442;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px auto;
                            max-width: 600px;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-message">
                        <h1>Login Error</h1>
                        <p>${errorMessage}</p>
                        <p><a href="/loginPage">Go back to Login Page</a></p>
                    </div>
                </body>
                </html>
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
            res.status(500).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            text-align: center;
                            padding: 50px;
                        }
                        .error-message {
                            background-color: #f2dede;
                            border: 1px solid #ebccd1;
                            color: #a94442;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px auto;
                            max-width: 600px;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-message">
                        <h1>Error</h1>
                        <p>Error storing pet information. Please try again later.</p>
                    </div>
                </body>
                </html>
            `);
            return;
        }
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pet Submission</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f0f0f0;
                        text-align: center;
                        padding: 50px;
                    }
                    .success-message {
                        background-color: #dff0d8;
                        border: 1px solid #d6e9c6;
                        color: #3c763d;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px auto;
                        max-width: 600px;
                    }
                </style>
            </head>
            <body>
                <div class="success-message">
                    <h1>Pet Submitted Successfully</h1>
                    <p>Your pet has been successfully added to the list of pets for adoption.</p>
                </div>
            </body>
            </html>
        `);
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
            res.status(500).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            text-align: center;
                            padding: 50px;
                        }
                        .error-message {
                            background-color: #f2dede;
                            border: 1px solid #ebccd1;
                            color: #a94442;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px auto;
                            max-width: 600px;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-message">
                        <h1>Error</h1>
                        <p>Error reading file. Please try again later.</p>
                    </div>
                </body>
                </html>
            `);
            return;
        }

        if (data.includes(credentials)) {
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Account Creation</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            text-align: center;
                            padding: 50px;
                        }
                        .success-message {
                            background-color: #dff0d8;
                            border: 1px solid #d6e9c6;
                            color: #3c763d;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px auto;
                            max-width: 600px;
                        }
                    </style>
                </head>
                <body>
                    <div class="success-message">
                        <h1>Account Already Exists</h1>
                        <p>User already has an account.</p>
                    </div>
                </body>
                </html>
            `);
        } else {
            fs.appendFile('credentials.txt', credentials, (err) => {
                if (err) {
                    res.status(500).send(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Error</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f0f0f0;
                                    text-align: center;
                                    padding: 50px;
                                }
                                .error-message {
                                    background-color: #f2dede;
                                    border: 1px solid #ebccd1;
                                    color: #a94442;
                                    padding: 20px;
                                    border-radius: 5px;
                                    margin: 20px auto;
                                    max-width: 600px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="error-message">
                                <h1>Error</h1>
                                <p>Error storing credentials. Please try again later.</p>
                            </div>
                        </body>
                        </html>
                    `);
                    return;
                }
                fs.appendFile('users.txt', username + '\n', (err) => {
                    if (err) {
                        console.error('Error storing usernames:', err);
                        res.status(500).send(`
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Error</title>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        background-color: #f0f0f0;
                                        text-align: center;
                                        padding: 50px;
                                    }
                                    .error-message {
                                        background-color: #f2dede;
                                        border: 1px solid #ebccd1;
                                        color: #a94442;
                                        padding: 20px;
                                        border-radius: 5px;
                                        margin: 20px auto;
                                        max-width: 600px;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="error-message">
                                    <h1>Error</h1>
                                    <p>Error storing usernames. Please try again later.</p>
                                </div>
                            </body>
                            </html>
                        `);
                        return;
                    }
                    res.send(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Account Created</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f0f0f0;
                                    text-align: center;
                                    padding: 50px;
                                }
                                .success-message {
                                    background-color: #dff0d8;
                                    border: 1px solid #d6e9c6;
                                    color: #3c763d;
                                    padding: 20px;
                                    border-radius: 5px;
                                    margin: 20px auto;
                                    max-width: 600px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="success-message">
                                <h1>Account Created</h1>
                                <p>Your account has been created successfully.</p>
                            </div>
                        </body>
                        </html>
                    `);
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
            return res.status(500).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            text-align: center;
                            padding: 50px;
                        }
                        .error-message {
                            background-color: #f2dede;
                            border: 1px solid #ebccd1;
                            color: #a94442;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px auto;
                            max-width: 600px;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-message">
                        <h1>Error</h1>
                        <p>Error logging out. Please try again later.</p>
                    </div>
                </body>
                </html>
            `);
        }
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Logout</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f0f0f0;
                        text-align: center;
                        padding: 50px;
                    }
                    .success-message {
                        background-color: #dff0d8;
                        border: 1px solid #d6e9c6;
                        color: #3c763d;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px auto;
                        max-width: 600px;
                    }
                </style>
            </head>
            <body>
                <div class="success-message">
                    <h1>Logged Out Successfully</h1>
                    <p>You have been logged out successfully.</p>
                    <p><a href="/HomePage">Return to Homepage</a></p>
                </div>
            </body>
            </html>
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
            return res.status(500).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Error</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            text-align: center;
                            padding: 50px;
                        }
                        .error-message {
                            background-color: #f2dede;
                            border: 1px solid #ebccd1;
                            color: #a94442;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px auto;
                            max-width: 600px;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-message">
                        <h1>Error</h1>
                        <p>Error reading available animals. Please try again later.</p>
                    </div>
                </body>
                </html>
            `);
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
                        <h2 style="color: black;">Owner: ${animal[0]}</h2>
                        <h2 style="color: black;">Pet: ${animal[1]}</h2>
                        <p>Breed: ${animal[2]}</p>
                        <p>Age: ${animal[3]}</p>
                        <p>Gender: ${animal[4]}</p>
                        <p>Gets Along With Cats: ${animal[5]}</p>
                        <p>Gets Along With Dogs: ${animal[6]}</p>
                        <p>Other Information: ${animal[7]}</p>
                        <p>Contact Details: ${animal[8]} ${animal[9]}</p>
                        <p>Email Address: ${animal[10]}</p>
                    </div>
                `;
            }).join('');

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Find Animal Results</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            text-align: center;
                            padding: 50px;
                        }
                    </style>
                </head>
                <body>
                    <h1>Matching Pets Found</h1>
                    ${formattedAnimals}
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
                    <title>No Matching Pets</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f0f0f0;
                            text-align: center;
                            padding: 50px;
                        }
                        .info-message {
                            background-color: #d9edf7;
                            border: 1px solid #bce8f1;
                            color: #31708f;
                            padding: 20px;
                            border-radius: 5px;
                            margin: 20px auto;
                            max-width: 600px;
                        }
                    </style>
                </head>
                <body>
                    <div class="info-message">
                        <h1>No Matching Pets Found</h1>
                        <p>There are no pets that match your criteria at this time.</p>
                    </div>
                </body>
                </html>
            `);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
