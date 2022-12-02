// ------ Dependences ------

require("dotenv").config();

const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(process.env.SECRET_KEY);

const store = require("./server/utils/StoreItems");

const app = express();
const port = process.env.PORT || 3001;

// ------ Middlewares ------

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ------ Routes ------

app.get("/success", (req, res) => {
  return res.json({ msg: "Success!!!" });
});
app.get("/cancel", (req, res) => {
  return res.json({ msg: "Canceled." });
});
app.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${process.env.SERVER_URL}/success`,
      cancel_url: `${process.env.SERVER_URL}/cancel`,
      line_items: items.map((item) => {
        const storeItem = store.get(item.id);

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCent,
          },
          quantity: item.quantity,
        };
      }),
      mode: "payment",
    });
    return res.json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// ------ Listen ------

app.listen(port, () => {
  console.log(`Server listening on: http://localhost:${port}`);
});
