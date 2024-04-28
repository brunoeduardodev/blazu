import { createBlazu } from "../../lib/blazu";

const app = createBlazu();

app
  .use((req, res, next) => {
    console.log("Request URL:", req.url);
    next();
  })
  .get("/", (req, res) => {
    res.json({ message: "Hello World!", route: "/" });
  })
  .get("/users", (req, res) => {
    res.json({ message: "Hello World!", route: "/users" });
  })
  .get("/users/:id", (req, res) => {
    res.json({ message: "Hello World!", route: "/users/:id" });
  })
  .get("/users/:id/emails", (req, res) => {
    res.json({ message: "Hello World!", route: "/users/:id/emails" });
  })
  .get("/organization/:orgId/users/:userId/emails", (req, res) => {
    res.json({
      message: "Hello World!",
      route: "/organization/:orgId/users/:userId/emails",
      params: req.params,
    });
  })
  .get("/users/emails", (req, res) => {
    res.json({ message: "Hello World!", route: "/users/emails" });
  })
  .post("/users", (req, res) => {
    res.json({ message: "Hello World!", route: "/users" });
  });

app.listen(3000);
