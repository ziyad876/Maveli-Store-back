import express from "express";
import bodyParser from "body-parser";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors"
import { redirect } from "react-router-dom";

const app = express();
const port = 4000;

app.use(cors());


const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
let postsCollection;
let userCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("mavelistore"); // Replace 'notepad' with your database name
    postsCollection = db.collection("items");
    userCollection = db.collection("users"); // Replace 'posts' with your collection name
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Connect to MongoDB when the app starts
connectDB();
// In-memory data store

let lastId = 3;
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


  //CHALLENGE 1: GET All posts
  app.get("/posts", async(req, res) => {
    const result = await postsCollection.find().toArray()
    const data = result.map((data)=>({
        img: data.img,
        name:data.name,
        offer: data.offer,
        name:data.name,
        mrp:data.mrp,
        price: data.price,
        type: data.type,
    }))
    res.json(data);
  });

  app.get("/users/id", async(req, res) => {
    const lastPost = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
    res.json(lastPost);
  });

  app.get("/filter/:id", async(req, res) => {
    try{
      const id = req.params.id;
      const result = await userCollection.findOne({id: id})
      if (result) {
        res.status(200).json(result); // Send the result as JSON
      } else {
        res.status(404).json({ message: "User not found" }); // Handle case where no user is found
      }
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ message: "Internal server error" }); // Handle server errors
    }
});



  app.post("/post/submit", async(req, res) => {
    // const lastPost = await postsCollection.find().sort({ id: -1 }).limit(1).toArray();
    // const id = lastPost.length > 0 ? lastPost[0].id + 1 : 1;
    const img = req.body.img;
    const name = req.body.name;
    const offer = req.body.offer;
    const type = req.body.type;
    const mrp = req.body.mrp;
    const price = mrp-(mrp*(offer/100));
    await console.log("working")
    try{
      await postsCollection.insertOne({
        img: img,
        name: name,
        offer: offer,
        type: type,
        mrp: mrp,
        price: price,
      });
      res.redirect("http://localhost:3000")
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Error creating post" });
    }
  });

  app.post("/user/register", async(req, res) => {
    const lastPost = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
    const id = lastPost.length > 0 ? lastPost[0].id + 1 : 1;
    const mail = req.body.mail;
    const user = req.body.username;
    const pass = req.body.fpassword;
    const cpass = req.body.cpassword;
    console.log(req.body)
    if (!user || !mail || !pass || !cpass) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
  
    if (pass !== cpass) {
      // Return a JSON response for password mismatch
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }
    try{
      await userCollection.insertOne({
        id: id,
        username: user,
        email: mail,
        password: pass,
        cpassword: cpass
      })
      res.redirect("http://localhost:3000");
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ success: false, message: "Error creating user." });
    }
  });

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
