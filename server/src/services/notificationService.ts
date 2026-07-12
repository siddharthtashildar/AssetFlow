import { prisma } from "../config/prisma";
import { NotificationType } from "@prisma/client";

export class NotificationService {
  static async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async markAsRead(id: string, userId: string) {
    // Ensure the notification belongs to the user
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }) {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          link: data.link || null,
        },
      });
    } catch (error: any) {
      console.error("Failed to create notification:", error.message);
    }
  }
}
