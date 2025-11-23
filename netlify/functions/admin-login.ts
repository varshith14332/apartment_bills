import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const { email, password } = JSON.parse(event.body || "{}");

  if (email === "ramanjaneyulucherala@gmail.com" && password === "bnr@2025") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        token: "dummy-token",
        admin: { email },
      }),
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ message: "Invalid email or password" }),
  };
};
