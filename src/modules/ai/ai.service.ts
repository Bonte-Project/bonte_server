import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../../database';
import { systemPrompts } from '../../database/schema/system_prompts.schema';
import { and, eq, desc } from 'drizzle-orm';
import { AIMessages } from '../../database/schema/ai_messages.schema';
import { users } from '../../database/schema/users.schema';
import { nutritionGoals } from '../../database/schema/nutrition_goals.schema';
import { nutritionLogs } from '../../database/schema/nutrition_logs.schema';
import { activityLogs } from '../../database/schema/activity_logs.schema';
import { sleepLogs } from '../../database/schema/sleep_logs.schema';
import { v4 as uuidv4 } from 'uuid';

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
export const activeChatSessions = new Map();

export const getAllSystemPrompts = async () => {
  const allSystemPrompts = await db.select().from(systemPrompts);
  return allSystemPrompts;
};

export const getDefaultSystemPrompt = async () => {
  try {
    const prompt = await db
      .select()
      .from(systemPrompts)
      .where(and(eq(systemPrompts.isDefault, true)))
      .limit(1);

    if (prompt.length === 0) {
      throw new Error('Default system prompt not found');
    }

    return prompt[0];
  } catch (error: any) {
    console.error('Error fetching default system prompt:', error);
    throw error;
  }
};

const getUserContext = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  const [goals] = await db
    .select()
    .from(nutritionGoals)
    .where(eq(nutritionGoals.userId, userId))
    .limit(1);

  const allNutrition = await db
    .select()
    .from(nutritionLogs)
    .where(eq(nutritionLogs.userId, userId))
    .orderBy(desc(nutritionLogs.eatenAt));

  const allActivity = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.completedAt));

  const allSleep = await db
    .select()
    .from(sleepLogs)
    .where(eq(sleepLogs.userId, userId))
    .orderBy(desc(sleepLogs.endTime));

  const userProfileContext = `
### User Profile:
- Age: ${user.age || 'Unknown'}
- Height: ${user.height ? `${user.height} cm` : 'Unknown'}
- Weight: ${user.weight ? `${user.weight} kg` : 'Unknown'}
- Role: ${user.role}
`;

  const goalsContext = goals
    ? `
### Current Nutrition Targets:
- Calories: ${goals.calories} kcal
- Protein: ${goals.protein}g
- Fats: ${goals.fat}g
- Carbs: ${goals.carbs}g
`
    : '\n### Nutrition Targets:\nNo specific goals set.';

  const nutritionHistory =
    allNutrition.length > 0
      ? `
### Nutrition History (All Time):
${allNutrition
  .map(
    n =>
      `- [${new Date(n.eatenAt).toLocaleDateString()}] ${n.mealType.toUpperCase()}: ${n.name} (${n.calories} kcal, P:${n.protein || 0}g, F:${n.fat || 0}g, C:${n.carbs || 0}g)`
  )
  .join('\n')}
`
      : '\n### Nutrition History:\nNo meals logged yet.';

  const activityHistory =
    allActivity.length > 0
      ? `
### Activity History (All Time):
${allActivity
  .map(
    a =>
      `- [${new Date(a.completedAt).toLocaleDateString()}] ${a.activityType}: ${a.durationMinutes} mins (Intensity: ${a.intensity})`
  )
  .join('\n')}
`
      : '\n### Activity History:\nNo activities logged yet.';

  const sleepHistory =
    allSleep.length > 0
      ? `
### Sleep History (All Time):
${allSleep
  .map(
    s =>
      `- [${new Date(s.endTime).toLocaleDateString()}] Duration: ${((s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60 * 60)).toFixed(1)}h, Quality: ${s.quality || '?'}/10`
  )
  .join('\n')}
`
      : '\n### Sleep History:\nNo sleep logs found.';

  return {
    userProfileContext,
    goalsContext,
    nutritionHistory,
    activityHistory,
    sleepHistory,
    hasLogs: allNutrition.length > 0 || allActivity.length > 0,
  };
};

export const createConversation = async (userId: string, title?: string) => {
  try {
    const existingConversation = await db
      .select()
      .from(AIMessages)
      .where(eq(AIMessages.userId, userId))
      .limit(1);

    if (existingConversation.length > 0) {
      throw new Error('User already has an active conversation');
    }

    const defaultPrompt = await getDefaultSystemPrompt();
    const context = await getUserContext(userId);

    const initialContextMessage = `
${defaultPrompt.content}

${context.userProfileContext}
${context.goalsContext}
${context.nutritionHistory}
${context.activityHistory}
${context.sleepHistory}
`;

    const welcomeContent = context.hasLogs
      ? 'I have analyzed your entire history of meals, workouts, and sleep. I can see your long-term trends. What would you like to review?'
      : 'Hello! I am ready to track and analyze your health history. Start by logging your first meal or workout.';

    const [newMessage] = await db
      .insert(AIMessages)
      .values({
        id: uuidv4(),
        userId: userId,
        systemPromptId: defaultPrompt.id,
        message: welcomeContent,
        toFrom: false,
        sentAt: new Date(),
      })
      .returning();

    const model = genAI.getGenerativeModel({
      model: 'gemini-robotics-er-1.5-preview',
    });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: initialContextMessage }],
        },
        {
          role: 'model',
          parts: [{ text: welcomeContent }],
        },
      ],
    });

    activeChatSessions.set(userId, chat);

    return {
      message: newMessage,
    };
  } catch (error) {
    console.error(`Error creating conversation (userId: ${userId}, title: ${title}):`, error);
    throw error;
  }
};

export const getConversationHistory = async (userId: string) => {
  const user = await db.select({ userId: users.id }).from(users).where(eq(users.id, userId));

  if (user.length === 0) {
    throw new Error('User with this id does not exist');
  }

  const messageHistory = await db
    .select({
      id: AIMessages.id,
      message: AIMessages.message,
      sentAt: AIMessages.sentAt,
      toFrom: AIMessages.toFrom,
    })
    .from(AIMessages)
    .where(eq(AIMessages.userId, userId))
    .orderBy(AIMessages.sentAt);

  const indexedHistory = messageHistory.map((message, index) => {
    return {
      ...message,
      sender: message.toFrom ? 'user' : 'ai',
      index: index,
    };
  });

  return { messages: indexedHistory };
};

export const getVisibleConversationHistory = async (userId: string) => {
  const user = await db.select({ userId: users.id }).from(users).where(eq(users.id, userId));

  if (user.length === 0) {
    throw new Error('User with this id does not exist');
  }

  const messageHistory = await db
    .select({
      id: AIMessages.id,
      message: AIMessages.message,
      sentAt: AIMessages.sentAt,
      toFrom: AIMessages.toFrom,
    })
    .from(AIMessages)
    .where(eq(AIMessages.userId, userId))
    .orderBy(AIMessages.sentAt);

  const indexedHistory = messageHistory
    .map((message, index) => {
      return {
        ...message,
        sender: message.toFrom ? 'user' : 'ai',
        index: index,
      };
    })
    .filter((_, index) => index > 0);

  return { messages: indexedHistory };
};

export const sendMessage = async (userId: string, message: string) => {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { messages: messageHistory } = await getConversationHistory(userId);
  const userMessageIndex = messageHistory.length;
  const { id } = await getDefaultSystemPrompt();

  const context = await getUserContext(userId);
  const defaultPrompt = await getDefaultSystemPrompt();

  const updatedContext = `
${defaultPrompt.content}

${context.userProfileContext}
${context.goalsContext}
${context.nutritionHistory}
${context.activityHistory}
${context.sleepHistory}

IMPORTANT: This is the most up-to-date information about the user. Use this data for your analysis.
`;

  const userMessage = {
    id: uuidv4(),
    userId: userId,
    systemPromptId: id,
    message: message,
    sentAt: new Date(),
    toFrom: true,
  };

  await db.insert(AIMessages).values(userMessage);

  let chat = activeChatSessions.get(userId);

  if (!chat) {
    const history = [];

    history.push({
      role: 'user',
      parts: [{ text: updatedContext }],
    });

    if (messageHistory.length > 0 && messageHistory[0].sender === 'ai') {
      history.push({
        role: 'model',
        parts: [{ text: messageHistory[0].message }],
      });
    }

    for (let i = 1; i < messageHistory.length; i++) {
      const msg = messageHistory[i];
      if (msg.sender === 'user') {
        history.push({
          role: 'user',
          parts: [{ text: msg.message }],
        });
      } else if (msg.sender === 'ai') {
        history.push({
          role: 'model',
          parts: [{ text: msg.message }],
        });
      }
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-robotics-er-1.5-preview',
    });

    chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 8192,
      },
    });

    activeChatSessions.set(userId, chat);
  } else {
    const contextUpdateMessage = `
[SYSTEM UPDATE - Latest User Data]
${context.userProfileContext}
${context.goalsContext}
${context.nutritionHistory}
${context.activityHistory}
${context.sleepHistory}
`;

    const combinedMessage = `${contextUpdateMessage}

[USER MESSAGE]
${message}`;

    const result = await chat.sendMessage(combinedMessage);
    const response = await result.response;
    const text = response.text();

    const aiResponseIndex = userMessageIndex + 1;

    const aiResponse = {
      id: uuidv4(),
      userId: userId,
      systemPromptId: id,
      message: text,
      sentAt: new Date(),
      toFrom: false,
    };

    await db.insert(AIMessages).values(aiResponse);

    return {
      userMessage: {
        ...userMessage,
        index: userMessageIndex,
      },
      aiResponse: {
        ...aiResponse,
        index: aiResponseIndex,
      },
    };
  }

  const result = await chat.sendMessage(message);
  const response = await result.response;
  const text = response.text();

  const aiResponseIndex = userMessageIndex + 1;

  const aiResponse = {
    id: uuidv4(),
    userId: userId,
    systemPromptId: id,
    message: text,
    sentAt: new Date(),
    toFrom: false,
  };

  await db.insert(AIMessages).values(aiResponse);

  return {
    userMessage: {
      ...userMessage,
      index: userMessageIndex,
    },
    aiResponse: {
      ...aiResponse,
      index: aiResponseIndex,
    },
  };
};
