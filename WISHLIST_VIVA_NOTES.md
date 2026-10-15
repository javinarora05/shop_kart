# Wishlist Feature: Viva Notes (ShopKart MERN, Lab 04)

> How to use these notes: read Part 1 (the big picture) first. Then go file by file (Parts 2–4). Every piece of code is explained under **What**, **Why**, **How** and **What if it wasn't there**. The **examiner questions** are answered in Part 5. Part 6 lists the **bugs we found and fixed**. Examiners like hearing how you debugged.

---

## Part 1: The Big Picture

### What is the wishlist feature?
A logged-in customer can save products they like, see them later on a "My Wishlist" page, remove them, and see a count in the navbar. The wishlist is stored **in MongoDB** on the customer's document, so it survives refreshes, logouts and a change of device.

### Files involved

| Layer | File | Role |
|---|---|---|
| Database | `backend/models/customer.model.js` | `wishlist` field: an array of Product ObjectIds |
| Auth | `backend/middlewares/auth.middleware.js` | Verifies the JWT cookie and sets `req.user` |
| Backend | `backend/controllers/wishlist.controller.js` | 5 functions: add, get, remove, toggle, count |
| Backend | `backend/routes/wishlist.routes.js` | Maps URLs to the controller functions and protects them with the auth middleware |
| Backend | `backend/index.js` | Mounts the router at `/wishlist` |
| Tests | `backend/tests/wishlist.test.js` | Jest + Supertest API tests |
| Frontend | `frontend/src/services/api.js` | Axios functions that call the wishlist APIs |
| Frontend | `frontend/src/context/AuthContext.jsx` | Global `wishlistCount` for the navbar |
| Frontend | `frontend/src/pages/Wishlist.jsx` | The "My Wishlist" page (loading, error and empty states) |
| Frontend | `frontend/src/components/WishlistCard.jsx` | One product card on the wishlist page |
| Frontend | `frontend/src/components/ProductCard.jsx` | Heart button on the products page |
| Frontend | `frontend/src/pages/Products.jsx` | Loads the wishlist IDs so hearts show as filled |
| Frontend | `frontend/src/components/Navbar.jsx` | "Wishlist (count)" link |
| Frontend | `frontend/src/App.jsx` | `/wishlist` route |

### Request flow (explain this with a diagram on the board)

```
[User clicks ♥ on ProductCard]
        │
        ▼
api.js → axios PATCH /wishlist/:productId/toggle   (withCredentials: true → cookie "token" sent)
        │
        ▼
index.js → app.use("/wishlist", wishlistRoutes)
        │
        ▼
wishlist.routes.js → authMiddleware → toggleWishlist
        │
        ├─ authMiddleware: read req.cookies.token → jwt.verify → Customer.findById(decoded.id) → req.user
        │
        ▼
controller: validate ObjectId → product exists? → find customer by req.user._id
            → already in wishlist? remove : add → customer.save()
        │
        ▼
JSON { success, saved, count } → React updates the heart (liked) + navbar count (setWishlistCount)
```

### API summary

| Method | URL | Controller | Success | Errors |
|---|---|---|---|---|
| POST | `/wishlist/:productId` | `addToWishlist` | **201** Created | 400 invalid ID, 404 product not found, **409 duplicate**, 401 not logged in |
| GET | `/wishlist` | `getWishlist` | 200 + populated products | 401, 404 customer |
| GET | `/wishlist/count` | `getWishlistCount` | 200 `{count}` | 401 |
| DELETE | `/wishlist/:productId` | `removeFromWishlist` | 200 | 400, 404 not in wishlist |
| PATCH | `/wishlist/:productId/toggle` | `toggleWishlist` (bonus) | 200 `{saved, count}` | 400, 404 |

Why these HTTP methods?
- **POST** adds a new resource (an item in the wishlist), so it returns **201 Created**.
- **GET** only reads. It is safe and has no side effects.
- **DELETE** removes the resource.
- **PATCH** partially modifies the customer's wishlist (flips one item on or off).

---

## Part 2: Database Layer (`customer.model.js`)

```js
wishlist: {
  type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  default: [],
},
```

### Line by line
- `type: [ ... ]`: the square brackets mean **an array**. One customer has many wishlist items (a one-to-many relationship).
- `mongoose.Schema.Types.ObjectId`: each element is a MongoDB `_id` (a 12-byte identifier), **not** a full product.
- `ref: "Product"`: tells Mongoose which model these IDs point to. `populate()` needs this.
- `default: []`: a new customer starts with an empty array.

### What if…
| Removed | Consequence |
|---|---|
| `ref: "Product"` | `populate("wishlist")` fails with a *MissingSchemaError* / "Schema hasn't been registered", or it simply can't resolve the IDs. The GET wishlist would return bare IDs or crash. |
| `default: []` | Old customers created before this field existed could have `wishlist` as `undefined`. Then `customer.wishlist.some(...)` or `.push(...)` would crash with *"Cannot read properties of undefined"*. (Mongoose arrays usually default to `[]` anyway, but writing it explicitly documents the intent and makes it safe.) |
| Use `type: Object` instead of ObjectId | Full product copies are stored, which causes stale data and duplication (see Q1 below). |
| Array → single ObjectId | The customer could only save **one** product. |

### Why is the wishlist inside Customer and not a separate `Wishlist` collection?
- A wishlist **belongs to exactly one customer** and is always loaded with that customer, so keeping it on the customer document is simple and needs only one query.
- It is small (tens of items). MongoDB's 16 MB document limit is not a concern.
- **Alternative:** a separate `Wishlist` collection `{ customer, product, addedAt }` with a unique compound index `{customer:1, product:1}`. That would be better if the wishlist grew huge, or if we needed extra data per item (e.g. `addedAt`, notes). Mention this to show you understand the trade-off.

---

## Part 3: Backend

### 3.1 Mounting the router (`index.js`)

```js
const wishlistRoutes = require("./routes/wishlist.routes");
app.use(express.json());
app.use(cookieParser());
app.use("/wishlist", wishlistRoutes);
```
- `app.use("/wishlist", ...)`: every route inside the router is **prefixed** with `/wishlist`. So `router.get("/")` becomes `GET /wishlist`.
- `cookieParser()` **must** run before the routes. Otherwise `req.cookies` is `undefined`, the auth middleware never finds the token, and every wishlist request returns **401**.
- `cors({ credentials: true, origin: [...] })` is needed because the frontend (port 5173) and backend (port 5000) are **different origins**. Without `credentials: true` the browser would not send or accept the auth cookie.
- `if (process.env.NODE_ENV !== "test")`: the app does not start listening during Jest tests. `module.exports = app` lets Supertest use the app directly.

### 3.2 Routes (`wishlist.routes.js`)

```js
router.post("/:productId", authMiddleware, addToWishlist)
router.get("/count", authMiddleware, getWishlistCount)
router.get("/", authMiddleware, getWishlist)
router.delete("/:productId", authMiddleware, removeFromWishlist)
router.patch("/:productId/toggle", authMiddleware, toggleWishlist);
```

- **`:productId`** is a *route parameter*. Express puts it in `req.params.productId`.
- **`authMiddleware` sits between the path and the controller.** Express runs the handlers left to right. The middleware either calls `next()` (the user is authenticated) or sends a 401 and stops. That is how **every** wishlist route is protected.
- **Why is `/count` declared before other GET routes?** Order matters in Express. If there were a `GET /:productId` route above it, the string `"count"` would be treated as a productId. Putting specific routes before generic ones is the safe habit.
- **What if `authMiddleware` was removed?** `req.user` would be `undefined`, so `req.user._id` would throw a TypeError and cause a 500. Worse, there would be no security at all.

### 3.3 Auth middleware (`auth.middleware.js`)

```js
const token = req.cookies?.token;
if (!token) return 401 "Token missing";
decoded = jwt.verify(token, process.env.JWT_SECRET || "default_shopkart_jwt_secret");  // invalid/expired → 401
const customer = await Customer.findById(decoded.id).select("-password");
if (!customer) return 401;
req.user = customer;
next();
```
- **The token lives in an HttpOnly cookie.** JavaScript in the browser cannot read it, so XSS cannot steal it. The browser sends it automatically.
- **`jwt.verify`** checks the **signature** (the token was issued by our server with our secret and hasn't been modified) and the **expiry**.
- **`decoded.id`** is the customer ID that we put into the token when the user logged in. That is the **trusted** identity.
- `.select("-password")` keeps the password hash out of `req.user`.
- It checks that the customer still exists in the DB, in case the account was deleted after the token was issued.
- It sets `req.user` so every controller knows *who* is calling.

### 3.4 Controller: `addToWishlist`

```js
const { productId } = req.params;

if (!mongoose.Types.ObjectId.isValid(productId)) return 400 "Invalid product ID";

const product = await Product.findById(productId);
if (!product) return 404 "Product not found";

const customer = await Customer.findById(req.user._id);
if (!customer) return 404 "Customer not found";

const alreadyExists = customer.wishlist.some((id) => id.toString() === productId);
if (alreadyExists) return 409 "Product already exists in wishlist";

customer.wishlist.push(product._id);
await customer.save();
return 201 "Product added to wishlist";
```

| Step | Why | What if it was missing |
|---|---|---|
| `ObjectId.isValid` | Rejects garbage like `/wishlist/abc` early with a clear **400** | `findById("abc")` throws a **CastError**, which the catch turns into a 500. A 500 means "server bug", but this is really a client mistake. |
| `Product.findById` + 404 | Only real products can be saved | Anyone could save a random valid-looking ID of a product that doesn't exist. `populate` would later return `null` entries, and the frontend would crash on `product.name`. |
| `Customer.findById(req.user._id)` | Gets a **full Mongoose document** we can modify and `.save()`. ID comes from the JWT, not the client | — |
| `.some(id => id.toString() === productId)` | **Duplicate check.** ObjectIds are *objects*, so `===` compares references and would always be false. `.toString()` turns them into strings for comparison (or use `id.equals(productId)`) | The same product could be added many times, and the wishlist page would show duplicates |
| **409 Conflict** | The request conflicts with the current state of the resource | — |
| `push(product._id)` | Stores only the **ID** (a reference) | — |
| `await customer.save()` | Persists to MongoDB and runs schema validation | Without it the change exists only in memory, and **nothing is saved** |
| **201 Created** | A new item was created in the wishlist | 200 also works, but 201 is more precise |
| `try/catch` → 500 | Unexpected errors (e.g. DB down) return JSON instead of crashing the server or hanging the request | Unhandled promise rejection. The client waits forever or the process crashes |

### 3.5 Controller: `getWishlist`

```js
const customer = await Customer.findById(req.user._id).populate({
  path: "wishlist",
  select: "name description price category image stock",
});
return 200 { success: true, count: customer.wishlist.length, wishlist: customer.wishlist };
```
- **`populate`** replaces each ObjectId in `wishlist` with the actual Product document. Mongoose runs a second query, `Product.find({ _id: { $in: [...ids] } })`, behind the scenes.
- **`select`** returns only the fields the UI needs. Smaller response, and no internal fields leak out.
- **Without populate**, the frontend would receive `["665f...", "6660..."]` and could not show name, price or image. It would need one extra request per product (the **N+1 problem**).
- `count` lets the UI show "3 products saved" without calculating it.

### 3.6 Controller: `removeFromWishlist`
- Validates the ID (400) and finds the customer.
- `findIndex(id => id.toString() === productId)` locates the item. If the result is `-1`, it returns **404 "Product not found in wishlist"**, because you can't delete what isn't there.
- `splice(index, 1)` removes exactly one element, then `save()`, then **200**.
- It does **not** check that the product exists in the Product collection. This is deliberate: if a product was deleted from the store, the user must still be able to remove its dangling ID from the wishlist.
- *Alternative:* `customer.wishlist.pull(productId)` (a Mongoose array helper), or the atomic `Customer.updateOne({_id}, {$pull: {wishlist: productId}})`.

### 3.7 Controller: `toggleWishlist` (bonus +10)
- One endpoint does both jobs. If the product is present it is removed, and if it is absent it is added.
- Returns `saved: true/false` and the new `count`. The frontend doesn't have to guess. **The server is the source of truth.**
- **Why is it useful?** The heart button needs only one API call and one handler, and it can't send a "wrong" request, such as trying to add something that's already there (which would get a 409).
- Returns 200 in both cases, because it's an update (PATCH) of the existing wishlist.

### 3.8 Controller: `getWishlistCount` (bonus +5)
```js
Customer.findById(req.user._id).select("wishlist")
```
- `.select("wishlist")` fetches only that field, without populating. It is very cheap and runs on every page load for the navbar badge.
- **Why a separate endpoint?** It avoids downloading full product data just to show a number.

### 3.9 Tests (`wishlist.test.js`)
- **Jest** is the test runner. **Supertest** sends HTTP requests to the Express `app` without starting a real server.
- `beforeEach` clears the collections, creates a product, registers and logs in, then stores `set-cookie` as `authCookie`. Every test starts from a **clean, known state** (test isolation).
- 7 tests cover: **401** without a cookie, **201** add, **409** duplicate, **200 populated** get (checks `wishlist[0].name`), **200** remove, **toggle** (saved true→false, count 1→0) and **count**.
- A separate DB, `shopkart_test`, is used so real data isn't wiped.

---

## Part 4: Frontend

### 4.1 `api.js` (Axios service layer)
```js
const API = axios.create({ baseURL: ..., withCredentials: true, headers: {...} });
export const addToWishlist      = (id) => API.post(`/wishlist/${id}`)
export const getWishlist        = ()   => API.get("/wishlist")
export const removeFromWishlist = (id) => API.delete(`/wishlist/${id}`)
export const toggleWishlist     = (id) => API.patch(`/wishlist/${id}/toggle`)
export const getWishlistCount   = ()   => API.get("/wishlist/count")
```
- **`withCredentials: true`** is the most important line. Without it, the browser **does not send the HttpOnly JWT cookie** on cross-origin requests, so every wishlist call returns 401.
- Notice that **no userId is sent anywhere.** Only the productId goes in the URL. The server finds out who the user is from the cookie.
- **Why a service layer?** All URLs live in one place, components stay clean, and a URL change means editing one file.

### 4.2 `AuthContext.jsx` (global wishlist count)
- `wishlistCount` is kept in **Context** because both the Navbar and every ProductCard need it. Passing it through props from component to component would be "prop drilling".
- `fetchProfile()` runs on app start. If `/customers/me` succeeds, it also calls `getWishlistCount()`, so **the count is correct after a refresh**.
- The count call has its **own inner try/catch**. If only the count fails, the user still stays logged in (the failure is isolated).
- `logout()` resets `wishlistCount` to 0, so the next user doesn't see the old count.
- `setWishlistCount` is exposed so ProductCard can update the badge instantly from the toggle response.

### 4.3 `Wishlist.jsx` page

**State:**
```js
const [wishlist, setWishlist] = useState([]);
const [loading, setLoading]   = useState(true);   // true initially → no "empty" flash
const [error, setError]       = useState("");
const [removingId, setRemovingId] = useState(null);
```

**Fetching:**
```js
useEffect(() => {
  if (authLoading) return;            // wait until we know if the user is logged in
  if (!user) { navigate("/login"); return; }
  fetchWishlist();
}, [user, authLoading, navigate]);
```
- **`if (authLoading) return`:** on refresh, `user` is `null` for a moment while `/customers/me` is still loading. Without this check, a logged-in user would be **wrongly redirected to /login** on every refresh.
- **Redirect when there is no user.** This is a frontend guard for UX only. The *real* security is the backend 401.
- `fetchWishlist` uses `try/catch/finally`. `finally` always turns `loading` off, whether the call succeeded or failed.
- `err.response?.data?.message` shows the backend's message. Optional chaining avoids a crash when there is no response (a network error).

**Removing:**
```js
await removeFromWishlist(productId);
setWishlist(current => current.filter(p => p._id !== productId));
```
- The server call happens **first**, and the UI updates **only after it succeeds**. The UI never shows something that isn't true in the DB.
- The **functional update** `current => ...` always uses the latest state, which avoids stale-state bugs.
- `removingId` disables only **that** card's button and shows "Removing…". This stops double clicks, which would otherwise make a second DELETE return 404.

**Rendering, three UI states plus data:**
1. `authLoading || loading` → spinner "Loading your wishlist…"
2. `error` → red box + **Try Again** button (calls `fetchWishlist` again)
3. `!error && wishlist.length === 0` → "Your wishlist is empty" + **Browse Products** link
4. `!error && wishlist.length > 0` → grid of `WishlistCard`s, `key={product._id}`

**Why `key={product._id}`?** React uses keys to track list items between renders. A stable unique ID means that removing one card doesn't re-render or mix up the others. Using the array index as the key breaks when items are removed.

### 4.4 `WishlistCard.jsx`
- A **presentational component**. It receives `product`, `onRemove` and `removing` as props and holds no state of its own. The parent (`Wishlist.jsx`) owns the data. This is called "lifting state up".
- `onError` on `<img>` swaps in a fallback image if the product image URL is broken.
- `isOutOfStock = product.stock <= 0` shows stock status. Stock is fetched **live via populate**, so it is always current. That is one benefit of referencing.
- `toLocaleString("en-IN")` formats prices as ₹1,23,456.

### 4.5 `ProductCard.jsx` (heart button)
```js
const [liked, setLiked] = useState(isWishlisted);
const [savingWishlist, setSavingWishlist] = useState(false);

const handleWishlistToggle = async (e) => {
  e.preventDefault();  e.stopPropagation();
  if (savingWishlist) return;
  setSavingWishlist(true);
  const data = await toggleWishlist(product._id);
  setLiked(data.saved);
  if (typeof data.count === "number") setWishlistCount(data.count);
  ...
};
```
- **`e.preventDefault()` / `e.stopPropagation()`:** the heart sits inside a card that links to the product page. Without these, clicking the heart would **also navigate** to the product details page.
- **`if (savingWishlist) return` + `disabled`:** double-click protection. Two rapid toggles would add and then immediately remove.
- **`setLiked(data.saved)`:** trust the **server's** answer, not a local `!liked` guess.
- **`setWishlistCount(data.count)`:** the navbar badge updates instantly without another request.
- `useEffect(() => setLiked(isWishlisted), [isWishlisted])` keeps the heart in sync. The saved IDs arrive *after* the first render, and `useState(initial)` only reads the prop once.

### 4.6 `Products.jsx` (pre-filled hearts)
```js
useEffect(() => {
  if (!user) { setWishlistIds([]); return; }
  const data = await getWishlist();
  setWishlistIds(data.wishlist.map(p => p._id));
}, [user]);
...
<ProductCard isWishlisted={wishlistIds.includes(product._id)} />
```
- It loads the user's saved IDs so that hearts on already-saved products appear **filled** after a refresh.
- It re-runs when `user` changes (login/logout).

### 4.7 `Navbar.jsx` and `App.jsx`
- The Navbar reads `wishlistCount` from context and shows `Wishlist (3)`. It shows the link only when `user` exists.
- `App.jsx`: `<Route path="/wishlist" element={<Wishlist />} />`.

---

## Part 5: Examiner Questions and Model Answers

### Database

**Q1. Why are we storing ObjectIds instead of Product objects?**
> "Because a product's details (price, stock, image, name) change over time. If we copied the whole product into every customer's wishlist, then every price change would leave **stale copies** in thousands of customer documents, and we'd have to update all of them. By storing only the ObjectId we keep **a single source of truth** in the Product collection. We also save storage (12 bytes per ID instead of a whole document), and the customer document stays small. When we need the details we use `populate()` to fetch the latest version. For example, if stock drops to 0, the wishlist page shows 'Out of stock' immediately."

Extra points: avoids **data duplication / update anomalies**, it is the **normalised** approach, and a deleted product won't linger as a fake full object.

**Q2. What does `ref: "Product"` do?**
> "It tells Mongoose which **model** the ObjectIds in this array belong to. The string must match the name used in `mongoose.model("Product", productSchema)`. MongoDB itself doesn't enforce it. It's not a foreign-key constraint. But Mongoose uses it in `populate()` to know which collection to query. Without `ref`, `populate("wishlist")` wouldn't know where to look up the IDs."

Key point: `ref` **does not validate** that the product exists. That's why the controller checks `Product.findById` itself.

**Q3. What is the difference between embedding and referencing?**

| | Embedding | Referencing |
|---|---|---|
| What's stored | The full sub-document inside the parent: `wishlist: [{name, price, ...}]` | Only the `_id`: `wishlist: [ObjectId]` |
| Reads | One query, very fast | Needs `populate()` (an extra query) |
| Data consistency | Copies go **stale** when the original changes | Always up to date (single source of truth) |
| Duplication | High | None |
| Size | Can grow large (16 MB doc limit) | Small |
| Best for | Data that **belongs only to the parent** and rarely changes independently (e.g. a customer's address, order line items with the *price at the time of purchase*) | Data that is **shared** and changes independently (e.g. products shared by many customers' wishlists) |

> "A wishlist points to products that are shared by all customers and change often, so **referencing** is correct here. Interesting contrast: an *order* should **embed** the price at purchase time, because it must *not* change later."

**Q4. Why do we use `populate()`?**
> "Because the wishlist stores only IDs, but the frontend needs the name, price, image and stock. `populate()` replaces each ObjectId with the actual Product document in **one extra query** (`Product.find({_id: {$in: ids}})`) instead of one query per product. It works like a JOIN in SQL. We also pass `select` so only the fields the UI needs are returned, which keeps the response small. Without populate the client would receive a list of meaningless IDs and would have to make N extra requests (the N+1 problem)."

### Backend

**Q5. Why should wishlist endpoints be protected?**
> "A wishlist is **personal data** that belongs to a specific customer. Without protection: (1) the server doesn't know *whose* wishlist to read or modify, since `req.user` would be undefined; (2) anyone could read or change other people's wishlists; (3) bots could spam the database. `authMiddleware` guarantees that only a user with a valid, unexpired, correctly signed JWT reaches the controller, and it tells us exactly who that user is. Our test `should reject unauthenticated wishlist requests` verifies that a request without a cookie gets **401**."

**Q6. Why should the server get the user ID from the JWT?**
> "The JWT is **signed with our secret key** (`JWT_SECRET`). When we log the user in, we put their `id` inside the token and sign it. If anyone changes even one character, `jwt.verify` fails. So `decoded.id` is information the **server itself** issued and can trust. It proves *who* the user is (authentication). The token is also stored in an **HttpOnly cookie**, so JavaScript cannot read or steal it."

**Q7. Why should we not accept userId from the client?**
> "Anything the client sends in the body, query or URL can be **freely changed** using DevTools, Postman or curl. If the API were `POST /wishlist { userId, productId }`, I could log in as myself, put *your* userId in the request, and add or remove items in *your* wishlist, or read it. This vulnerability is called **IDOR (Insecure Direct Object Reference)**, or broken access control. It's #1 in the OWASP Top 10. By ignoring any client-supplied userId and always using `req.user._id` from the verified token, a user can only ever act on **their own** wishlist."

**Q8. How are duplicate wishlist entries prevented?**
> "In `addToWishlist`, before pushing, we check:
> ```js
> const alreadyExists = customer.wishlist.some(id => id.toString() === productId);
> if (alreadyExists) return res.status(409)...
> ```
> We convert each ObjectId to a string because ObjectIds are objects, and `===` on objects compares references, so it would never match. On the frontend, the heart button is disabled while a request is in flight, and the toggle endpoint removes instead of adding when the item already exists."

Bonus answer (impresses examiners): "The check-then-push approach has a small **race condition**. Two simultaneous requests could both pass the check. A fully atomic alternative is MongoDB's **`$addToSet`** operator:
```js
await Customer.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } });
```
`$addToSet` only adds the value if it isn't already in the array, and it does so atomically inside the database."

**Q9. What HTTP status should be returned for a duplicate wishlist request?**
> "**409 Conflict**. The request is valid and the user is authorised, but it **conflicts with the current state** of the resource, because the product is already there. It's not 400 (the request isn't malformed), not 404 (everything exists) and not 500 (the server didn't fail). Our test `should prevent duplicate wishlist products` expects 409 and `success: false`."

Some APIs instead return **200** with "already in wishlist" to make the operation *idempotent*. That design is valid too, but our lab spec uses 409 so the client knows explicitly.

### Frontend

**Q10. Why should the Wishlist page fetch from the backend?**
> "Because **the database is the single source of truth**. If we kept the wishlist only in React state or localStorage: (1) it would be lost on refresh or when switching browsers or devices; (2) it could get out of sync with the server (e.g. a product was deleted, or the price or stock changed); (3) we'd have no product details, only IDs. Fetching `GET /wishlist` gives the latest, populated data for the logged-in user, the same list on every device."

**Q11. Why do we need loading, error and empty states?**
> "A network request isn't instant and it can fail, so the UI has to handle every possible outcome:
> - **Loading:** without it the user would see a blank screen or, worse, flash 'Your wishlist is empty' for a moment before the data arrives. That's why `loading` starts as `true`.
> - **Error:** if the server is down or the session expired, we show a clear message plus a **Try Again** button instead of failing silently or crashing.
> - **Empty:** a new user with no items sees a friendly message and a 'Browse Products' link instead of a confusing blank grid.
>
> Handling these states is good UX, and it also prevents bugs like calling `.map` on undefined."

**Q12. Why should the wishlist survive a page refresh?**
> "Users expect saved items to stay saved. That's the whole point of a wishlist. React state lives in memory and is **wiped on refresh**. Our wishlist is stored in MongoDB, and on refresh: (1) `AuthContext` calls `/customers/me` (the cookie is still there) and restores the user, then calls `/wishlist/count` to restore the navbar count; (2) the Wishlist page waits for `authLoading` to finish and then fetches `GET /wishlist`; (3) the Products page fetches wishlist IDs so the hearts stay filled. So persistence comes from the **backend + cookie**, not the browser."

---

## Part 6: Bugs We Found and Fixed (good "how did you debug it?" material)

All fixed. Verified by `vite build` succeeding and 32/32 backend tests passing:

1. **Toggle route typo.** `wishlist.routes.js:26`
   `router.patch("/.productId/toggle", ...)` uses a **dot** instead of a **colon**. It only matches the literal URL `/wishlist/.productId/toggle`, so the heart button gets **404**.
   Fix: `router.patch("/:productId/toggle", authMiddleware, toggleWishlist);`

2. **Function name mismatch.** `api.js:70` exports `toggleWithList`, but `ProductCard.jsx:4` imports `toggleWishlist`. Vite will fail with *"does not provide an export named 'toggleWishlist'"*.
   Fix: rename it to `export const toggleWishlist = ...` in `api.js`.

3. **Invalid import.** `api.js:2` has `import { response } from "../../../backend";`. The frontend is importing backend (Node) code. This breaks the Vite build. **Delete this line.**

4. **Hearts don't fill after the wishlist loads.** `ProductCard.jsx:16` has `useState(isWishlisted)`, which uses the prop **only on the first render**. `wishlistIds` arrives *later* (async), so the hearts stay empty. Fix:
   ```js
   useEffect(() => { setLiked(isWishlisted); }, [isWishlisted]);
   ```

5. **Navbar count doesn't update when removing from the Wishlist page.** `Wishlist.jsx` `handleRemove` doesn't update the context. Fix: get `setWishlistCount` (or `refreshWishlistCount`) from `useAuth()` and call `setWishlistCount(c => c - 1)` after a successful remove.

6. **Duplicate Wishlist link in the Navbar.** `Navbar.jsx:94-111` renders two "Wishlist" links. Keep only the one with the count.

7. **(Minor)** `handleWishlist` and the `addToWishlist` import in `ProductCard.jsx` are unused dead code.

If asked "what would you improve?": use `$addToSet`/`$pull` for atomic updates, add a unique index if moving to a separate Wishlist collection, add optimistic UI updates with rollback on error, and filter out `null` entries after populate if a product gets deleted.

---

## Part 7: Rapid-Fire Revision (last-minute cheat sheet)

- **Schema:** `wishlist: [{ type: ObjectId, ref: "Product" }]`, default `[]`
- **Referencing > embedding** because products are shared and change often
- **populate** = Mongoose "JOIN". `select` limits the fields
- **Auth:** HttpOnly cookie `token` → `jwt.verify` → `req.user`. **Never trust a client userId** (IDOR)
- **Status codes:** 201 add · 200 get/remove/toggle · 400 bad ID · 401 no/invalid token · 404 product/customer/item not found · **409 duplicate** · 500 server error
- **Duplicate check:** `.some(id => id.toString() === productId)`. Atomic alternative: `$addToSet`
- **`ObjectId.isValid`** avoids CastError → 500
- **`withCredentials: true`** is required to send the cookie cross-origin. The backend needs `cors({credentials: true})` + `cookieParser()`
- **Frontend states:** loading → error (Try Again) → empty (Browse Products) → grid
- **`authLoading` guard** prevents a false redirect to /login on refresh
- **Context** holds `wishlistCount` for the Navbar and ProductCard (no prop drilling)
- **Toggle** returns `{saved, count}`. The server is the source of truth
- **Tests:** Jest + Supertest. 401, 201, 409, populated 200, remove 200, toggle, count
