import { ExpressHandler } from '../../shared/types/express.type';
import * as aiService from './ai.service';

export const createConversation: ExpressHandler = async (req, res) => {
  try {
    const { title } = req.body;
    await aiService.createConversation(req.user!.userId, title);
    res.status(201).json({
      message: 'Conversation created successfully',
    });
  } catch (error: any) {
    console.error(`Error creating conversation (userId: ${req.user!.userId}):`, error);
    if (error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
    } else if (error.message === 'Default system prompt not found') {
      res.status(404).json({ message: 'Default system prompt not found' });
    } else if (error.message === 'User already has an active conversation') {
      res.status(409).json({ message: 'User already has an active conversation' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getConversationHistory: ExpressHandler = async (req, res) => {
  try {
    const messages = await aiService.getConversationHistory(req.user!.userId);
    res.json(messages);
  } catch (error: any) {
    console.error('Error fetching conversation history:', error);
    if (error.message === 'User with this id does not exist') {
      res.status(404).json({ message: 'User with this id does not exist' });
    } else if (error.message === 'No active conversation found') {
      res.status(404).json({ message: 'No active conversation found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getVisibleConversationHistory: ExpressHandler = async (req, res) => {
  try {
    const messages = await aiService.getVisibleConversationHistory(req.user!.userId);
    res.json(messages);
  } catch (error: any) {
    console.error('Error fetching visible conversation history:', error);
    if (error.message === 'User with this id does not exist') {
      res.status(404).json({ message: 'User with this id does not exist' });
    } else if (error.message === 'No active conversation found') {
      res.status(404).json({ message: 'No active conversation found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const sendMessage: ExpressHandler = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({
        message: 'Missing required field: message',
      });
      return;
    }

    const result = await aiService.sendMessage(req.user!.userId, message);

    res.status(200).json({
      message: 'Message sent successfully',
      userMessage: result.userMessage,
      aiResponse: result.aiResponse,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    if (error.message === 'Unauthorized') {
      res.status(401).json({ message: 'Unauthorized' });
    } else if (error.message === 'No active conversation found') {
      res.status(404).json({ message: 'No active conversation found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
