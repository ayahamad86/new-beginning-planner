'use server';

import { prisma } from '@/lib/db';

export async function createReflection(
  userId: string,
  data: {
    entry: string;
    emotionalSpent: number;
    triggers: string;
    mood: string;
  }
) {
  try {
    if (!data.entry?.trim()) {
      return { error: 'Entry text is required' };
    }

    const reflection = await prisma.reflection.create({
      data: {
        userId,
        entry: data.entry,
        emotionalSpent: data.emotionalSpent,
        triggers: data.triggers,
        mood: data.mood,
      },
    });

    return { success: true, reflection };
  } catch (error) {
    console.error('Create reflection error:', error);
    return { error: 'Failed to create reflection' };
  }
}

export async function getReflections(userId: string, limit: number = 10) {
  try {
    const reflections = await prisma.reflection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { success: true, reflections };
  } catch (error) {
    console.error('Get reflections error:', error);
    return { error: 'Failed to fetch reflections', reflections: [] };
  }
}

export async function getWeeklyInsights(userId: string) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reflections = await prisma.reflection.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    let totalEmotional = 0;
    const triggerMap: { [key: string]: number } = {};

    reflections.forEach((reflection) => {
      totalEmotional += reflection.emotionalSpent;
      if (reflection.triggers) {
        reflection.triggers.split(',').forEach((trigger) => {
          const trimmed = trigger.trim();
          triggerMap[trimmed] = (triggerMap[trimmed] || 0) + 1;
        });
      }
    });

    const topTriggers = Object.entries(triggerMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    return {
      success: true,
      insights: {
        totalEmotionalSpent: totalEmotional,
        topTriggers,
        entryCount: reflections.length,
      },
    };
  } catch (error) {
    console.error('Get weekly insights error:', error);
    return { error: 'Failed to fetch insights', insights: {} };
  }
}

export async function deleteReflection(reflectionId: string) {
  try {
    await prisma.reflection.delete({
      where: { id: reflectionId },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete reflection error:', error);
    return { error: 'Failed to delete reflection' };
  }
}
