require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");


const app = express();

const session = require("express-session");
const flash = require("connect-flash");
const { error } = require("console");

app.use(session({
    secret: process.env.SESSION_SECRET || process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 60 * 1000
    }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success");
    res.locals.error_msg = req.flash("error");
    next();
});



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("index");
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});



app.post("/enquiry", async (req, res) => {
    try {
        const { name, phone, email, message } = req.body;

        if (
            typeof name !== "string" ||
            typeof phone !== "string" ||
            typeof email !== "string" ||
            typeof message !== "string" ||
            !name.trim() ||
            !phone.trim() ||
            !email.trim() ||
            !message.trim()
        ) {
            return res.status(400).send("Please fill all fields.");
        }

        await transporter.sendMail({
            from: {
                name: "Organic Vedic Nursery Website",
                address:email.trim()
            },
            to: process.env.OWNER_EMAIL,
            replyTo: email.trim(),
            subject: `New enquiry from ${name.trim()}`,
            text: `
                    New customer enquiry
                    Name: ${name.trim()}
                    Phone: ${phone.trim()}
                    Email: ${email.trim()}

                    Customer query:
                    ${message.trim()}
                                `
                            });

        req.flash(
                "success",
                "Your query has been sent successfully! We will contact you soon."
                );

                return req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).send("Session save failed");
                }

                return res.redirect("/#contact");
        });
        } catch (error) {
            return res.status(500).send(
                "Unable to send your query. Please try again."
            );
        }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running at Port:${PORT}`);
});