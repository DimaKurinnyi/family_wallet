import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function getCurrentUser(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No token provided");
  }

  const token = authHeader.replace("Bearer ", "");

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    throw new Error("Unauthorized: Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new Error("Unauthorized: User not found");
  }

  return user;
}
