import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";

const users = []; // temporary in-memory store

export const registerUser = async ({ email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now(),
    email,
    password: hashedPassword,
  };

  users.push(user);

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = signToken({ id: user.id, email: user.email });

  return { token };
};

