import { prisma } from "../config/prisma";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";
import { Role } from "@prisma/client";

export class UserService {
  static async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        department: {
          select: { name: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async getDepartments() {
    return prisma.department.findMany({
      orderBy: { name: "asc" },
    });
  }

  static async signup(data: any, requesterRole?: Role) {
    const { name, email, password, role } = data;

    if (!name || !email || !password) {
      throw new Error("Missing required fields: name, email, password");
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (existingUser) {
      throw new Error("A user with this email address already exists");
    }

    const userCount = await prisma.user.count();
    let resolvedRole: Role = Role.EMPLOYEE;

    if (userCount === 0) {
      // Bootstrap first user as ADMIN
      resolvedRole = Role.ADMIN;
    } else {
      // Must be created by an Admin
      if (requesterRole !== Role.ADMIN) {
        throw new Error("Unauthorized: Only Admins can register new employees.");
      }

      // Allow setting custom roles
      if (role) {
        const roleUpper = role.toUpperCase().trim();
        const validRoles = Object.values(Role) as string[];
        if (validRoles.includes(roleUpper)) {
          resolvedRole = roleUpper as Role;
        } else {
          throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
        }
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with resolved role
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        password: hashedPassword,
        role: resolvedRole,
      },
    });

    const token = generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  static async login(data: any) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error("Missing required fields: email, password");
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Compare passwords
    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive. Please contact an administrator.");
    }

    const token = generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  static async promoteUser(targetUserId: string, newRole: Role) {
    if (!targetUserId || !newRole) {
      throw new Error("Missing target user ID or new role");
    }

    // Verify role is valid
    if (!Object.values(Role).includes(newRole)) {
      throw new Error("Invalid role specified");
    }

    // Find target user
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updatedUser;
  }
}
