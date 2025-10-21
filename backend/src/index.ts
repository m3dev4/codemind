import expess, { type Request, type Response } from "express";

const app = expess();

const PORT = process.env.PORT || 5000;

app.use(expess.json());
app.use(expess.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
