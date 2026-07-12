import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { z } from "zod";

const createDepartmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  headId: z.string().optional().nullable(),
  parentDepartmentId: z.string().optional().nullable(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  headId: z.string().optional().nullable(),
  parentDepartmentId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        head: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { users: true, assets: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch departments", details: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const data = createDepartmentSchema.parse(req.body);
    
    const existing = await prisma.department.findFirst({
      where: {
        OR: [{ name: data.name }, { code: data.code }],
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Department with this name or code already exists" });
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        headId: data.headId || null,
        parentDepartmentId: data.parentDepartmentId || null,
      },
      include: {
        head: { select: { id: true, name: true } },
        _count: { select: { users: true, assets: true } },
      },
    });

    res.status(201).json(department);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: (error as any).errors });
    } else {
      res.status(500).json({ error: "Failed to create department", details: error.message });
    }
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = updateDepartmentSchema.parse(req.body);

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(data as any),
      },
      include: {
        head: { select: { id: true, name: true } },
        _count: { select: { users: true, assets: true } },
      },
    });

    res.json(department);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: (error as any).errors });
    } else {
      res.status(500).json({ error: "Failed to update department", details: error.message });
    }
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const dept = (await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { users: true, assets: true } } },
    })) as any;

    if (!dept) {
      return res.status(404).json({ error: "Department not found" });
    }

    if (dept._count.users > 0 || dept._count.assets > 0) {
      return res.status(400).json({ 
        error: "Cannot delete department that has users or assets assigned. Reassign them first." 
      });
    }

    await prisma.department.delete({ where: { id } });
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete department", details: error.message });
  }
};
