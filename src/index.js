import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// ================= PIZZA DATA =================

const pizzaData = [
  {
    name: "Focaccia",
    ingredients: "Bread with italian olive oil and rosemary",
    price: 6,
    photoName: "/pizzas/focaccia.jpg",
    soldOut: false,
    category: "Sides",
  },
  {
    name: "Pizza Margherita",
    ingredients: "Tomato and mozarella",
    price: 10,
    photoName: "/pizzas/margherita.jpg",
    soldOut: false,
    category: "Classic",
  },
  {
    name: "Pizza Spinaci",
    ingredients: "Tomato, mozarella, spinach, and ricotta cheese",
    price: 12,
    photoName: "/pizzas/spinaci.jpg",
    soldOut: false,
    category: "Veggie",
  },
  {
    name: "Pizza Funghi",
    ingredients: "Tomato, mozarella, mushrooms, and onion",
    price: 12,
    photoName: "/pizzas/funghi.jpg",
    soldOut: false,
    category: "Veggie",
  },
  {
    name: "Pizza Salamino",
    ingredients: "Tomato, mozarella, and pepperoni",
    price: 15,
    photoName: "/pizzas/salamino.jpg",
    soldOut: true,
    category: "Meat",
  },
  {
    name: "Pizza Prosciutto",
    ingredients: "Tomato, mozarella, ham, aragula, and burrata cheese",
    price: 18,
    photoName: "/pizzas/prosciutto.jpg",
    soldOut: false,
    category: "Meat",
  },
];

const categories = ["All", "Classic", "Veggie", "Meat", "Sides"];

// shop opens 10am, closes 10pm
const OPEN_HOUR = 10;
const CLOSE_HOUR = 22;

// ================= APP =================

function App() {
  const hour = new Date().getHours();
  const isOpen = hour >= OPEN_HOUR && hour < CLOSE_HOUR;

  // load the saved order if there is one
  const savedCart = localStorage.getItem("cart");
  const [cart, setCart] = useState(savedCart ? JSON.parse(savedCart) : []);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  // count the items and add up the total
  let cartCount = 0;
  let cartTotal = 0;
  for (const item of cart) {
    cartCount += item.qty;
    cartTotal += item.qty * item.price;
  }

  function addToCart(pizza) {
    const newCart = [...cart];
    const item = newCart.find((item) => item.name === pizza.name);

    if (item) {
      item.qty = item.qty + 1;
    } else {
      newCart.push({ name: pizza.name, price: pizza.price, photoName: pizza.photoName, qty: 1 });
    }

    setCart(newCart);
    setToast(pizza.name + " added to your order");
  }

  // amount is 1 or -1
  function changeQty(name, amount) {
    const newCart = [...cart];
    const item = newCart.find((item) => item.name === name);
    item.qty = item.qty + amount;

    // take it out of the order when it hits 0
    setCart(newCart.filter((item) => item.qty > 0));
  }

  // save the order every time it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // hide the popup after 2.5 seconds
  useEffect(() => {
    if (toast === "") return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="container">
      <Header isOpen={isOpen} cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <Menu isOpen={isOpen} cart={cart} onAdd={addToCart} onChangeQty={changeQty} />
      <Footer isOpen={isOpen} onOrder={() => setCartOpen(true)} />

      {/* bar at the bottom once something is in the order */}
      {cartCount > 0 && !cartOpen && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span>View order ({cartCount})</span>
          <strong>${cartTotal}</strong>
        </button>
      )}

      <Cart
        open={cartOpen}
        cart={cart}
        total={cartTotal}
        isOpen={isOpen}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onClear={() => setCart([])}
      />

      <div className={toast ? "toast show" : "toast"}>{toast}</div>
    </div>
  );
}

// ================= HEADER =================

function Header({ isOpen, cartCount, onCartClick }) {
  return (
    <header className="header">
      <div className="topbar">
        {isOpen ? (
          <span className="status open">Open now, closes at 10pm</span>
        ) : (
          <span className="status">Closed, opens at 10am</span>
        )}

        <button className="cart-btn" onClick={onCartClick}>
          Your order
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>

      <h1>Angelo's Pizza Co.</h1>
      <p className="tagline">Wood-fired pizza, made to order. Pick up in 30 minutes.</p>
    </header>
  );
}

// ================= MENU =================

function Menu({ isOpen, cart, onAdd, onChangeQty }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // keep a pizza if the name matches the search AND it's in the picked category
  const filteredPizzas = pizzaData.filter((pizza) => {
    const matchesSearch = pizza.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || pizza.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="menu">
      <h2>Our Menu</h2>

      {isOpen && <p>Authentic Italian Cuisine, all from our stone oven</p>}

      <input
        className="search"
        type="text"
        placeholder="Search pizza..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="tabs">
        {categories.map((name) => (
          <button
            key={name}
            className={category === name ? "tab active" : "tab"}
            onClick={() => setCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {filteredPizzas.length > 0 ? (
        <ul className="pizzas">
          {filteredPizzas.map((pizza) => {
            // how many of this pizza are already in the order
            const item = cart.find((item) => item.name === pizza.name);
            const qty = item ? item.qty : 0;

            return (
              <Pizza
                key={pizza.name}
                pizza={pizza}
                qty={qty}
                onAdd={onAdd}
                onChangeQty={onChangeQty}
              />
            );
          })}
        </ul>
      ) : (
        <p>No pizzas found.</p>
      )}
    </main>
  );
}

// ================= PIZZA =================

function Pizza({ pizza, qty, onAdd, onChangeQty }) {
  return (
    <li className={pizza.soldOut ? "pizza sold-out" : "pizza"}>
      <img src={pizza.photoName} alt={pizza.name} />
      <div>
        <h3>{pizza.name}</h3>
        <p>{pizza.ingredients}</p>
        <span>{pizza.soldOut ? "SOLD OUT" : "$" + pizza.price}</span>

        {/* not in the order yet: show the Add button */}
        {!pizza.soldOut && qty === 0 && (
          <button className="add-btn" onClick={() => onAdd(pizza)}>
            + Add
          </button>
        )}

        {/* already in the order: show - qty + */}
        {!pizza.soldOut && qty > 0 && (
          <div className="card-qty">
            <button onClick={() => onChangeQty(pizza.name, -1)}>−</button>
            <span>{qty} in order</span>
            <button onClick={() => onChangeQty(pizza.name, 1)}>+</button>
          </div>
        )}
      </div>
    </li>
  );
}

// ================= CART =================

function Cart({ open, cart, total, isOpen, onClose, onChangeQty, onClear }) {
  // which screen the panel shows: "cart", "details" or "done"
  const [step, setStep] = useState("cart");

  // checkout form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null);

  // pickup times on the hour, from the next hour until closing
  const hour = new Date().getHours();
  const pickupTimes = [];
  for (let h = hour + 1; h < CLOSE_HOUR; h++) {
    if (h < 12) pickupTimes.push(h + ":00am");
    else if (h === 12) pickupTimes.push("12:00pm");
    else pickupTimes.push(h - 12 + ":00pm");
  }

  function closeCart() {
    // after an order is done, start fresh next time
    if (step === "done") setStep("cart");
    onClose();
  }

  function placeOrder(e) {
    e.preventDefault();

    // check the form
    const newErrors = {};
    if (name.trim() === "") {
      newErrors.name = "Please enter your name";
    }
    if (phone.length !== 8 || !(phone.startsWith("8") || phone.startsWith("9"))) {
      newErrors.phone = "Enter an 8 digit number starting with 8 or 9";
    }
    if (time === "") {
      newErrors.time = "Pick a pickup time";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return; // stop if anything is wrong

    // save the order details for the confirmation screen
    setOrder({
      number: Math.floor(Math.random() * 9000) + 1000,
      name: name,
      time: time,
      total: total,
    });

    // clear everything for next time
    onClear();
    setName("");
    setPhone("");
    setTime("");
    setStep("done");
  }

  return (
    <>
      <div className={open ? "cart-overlay show" : "cart-overlay"} onClick={closeCart}></div>

      <aside className={open ? "cart open" : "cart"}>
        <div className="cart-head">
          {step === "cart" && <h2>Your order</h2>}
          {step === "details" && <h2>Your details</h2>}
          {step === "done" && <h2>Order placed</h2>}
          <button className="close-btn" onClick={closeCart}>
            ✕
          </button>
        </div>

        {/* ---------- 1. the order ---------- */}
        {step === "cart" && (
          <>
            {cart.length === 0 ? (
              <p className="cart-empty">Nothing here yet. Add a pizza from the menu.</p>
            ) : (
              <ul className="cart-items">
                {cart.map((item) => (
                  <li key={item.name} className="cart-item">
                    <img src={item.photoName} alt="" />
                    <div>
                      <h3>{item.name}</h3>
                      <span>${item.price * item.qty}</span>
                    </div>
                    <div className="qty">
                      <button onClick={() => onChangeQty(item.name, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => onChangeQty(item.name, 1)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="cart-foot">
              <div className="cart-total">
                <span>Total</span>
                <strong>${total}</strong>
              </div>
              <button
                className="btn"
                disabled={cart.length === 0 || !isOpen}
                onClick={() => setStep("details")}
              >
                {isOpen ? "Checkout" : "We're closed right now"}
              </button>
            </div>
          </>
        )}

        {/* ---------- 2. name, phone, pickup time ---------- */}
        {step === "details" && (
          <form className="checkout" onSubmit={placeOrder} noValidate>
            <label>
              Name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <small>{errors.name}</small>}
            </label>

            <label>
              Phone number
              <input
                type="tel"
                maxLength={8}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <small>{errors.phone}</small>}
            </label>

            <label>
              Pickup time
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                <option value="">Choose a time</option>
                {pickupTimes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.time && <small>{errors.time}</small>}
            </label>

            <div className="cart-foot">
              <div className="cart-total">
                <span>Total</span>
                <strong>${total}</strong>
              </div>
              <button className="btn" type="submit">
                Place order
              </button>
              <button className="back-btn" type="button" onClick={() => setStep("cart")}>
                Back to order
              </button>
            </div>
          </form>
        )}

        {/* ---------- 3. confirmed ---------- */}
        {step === "done" && order && (
          <div className="confirmed">
            <span className="order-no">Order #{order.number}</span>
            <h3>Thanks, {order.name}!</h3>
            <p>
              Your pizza will be ready for pickup at <strong>{order.time}</strong>. You'll pay $
              {order.total} at the counter.
            </p>
            <button className="btn" onClick={closeCart}>
              Back to menu
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// ================= FOOTER =================

function Footer({ isOpen, onOrder }) {
  return (
    <footer className="footer">
      {isOpen ? (
        <div className="order">
          <p>We're currently open</p>
          <button className="btn" onClick={onOrder}>
            Order
          </button>
        </div>
      ) : (
        <p>Sorry, we're closed</p>
      )}
    </footer>
  );
}

// ================= RENDER =================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);