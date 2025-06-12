// src/services/registerUser.ts

export const registerUser = async ({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/register-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      username: email, // usa el mismo email como username
      password,
      firstName,
      lastName
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error al registrar usuario en API Gateway:", errorText);
    throw new Error("Registration failed at gateway.");
  }

  return true;
};
