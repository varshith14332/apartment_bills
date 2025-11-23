import { Handler } from "@netlify/functions";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "b252958fa98b6971299ca334e79204238517df22f1c210a4ad36751163c83707072116929eafe7e1258a6e8e3c4c3f7831da9938783a1f9830ae76eef9be824c";

const generateToken = (payload: {
  id: string;
  email: string;
  name: string;
}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const handler: Handler = async (event) => {
  const { email, password } = JSON.parse(event.body || "{}");

  if (email === "ramanjaneyulucherala@gmail.com" && password === "bnr@2025") {
    const token = generateToken({
      id: "admin-1",
      email: email,
      name: "Apartment Treasurer",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        admin: {
          id: "admin-1",
          email: email,
          name: "Apartment Treasurer",
        },
      }),
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ message: "Invalid email or password" }),
  };
};
