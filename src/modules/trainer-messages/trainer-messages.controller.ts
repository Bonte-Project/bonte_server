import { ExpressHandler } from '../../shared/types/express.type';
import {
  createTrainerMessage,
  getTrainerMessages,
  getUserRole,
  getTrainerIdByUserId,
  getUserChatList,
  getTrainerChatList,
} from './trainer-messages.service';
import { CreateTrainerMessageDto } from './types/trainer-messages.type';

export const createTrainerMessageHandler: ExpressHandler = async (req, res) => {
  try {
    const senderId = req.user?.userId;
    if (!senderId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const recipientId = req.params.id;
    if (!recipientId) {
      res.status(400).json({ message: 'Recipient ID is required' });
      return;
    }

    const { message, to_from } = req.body as CreateTrainerMessageDto;

    const sender = await getUserRole(senderId);
    if (!sender) {
      res.status(404).json({ message: 'Sender not found' });
      return;
    }

    let user_id: string;
    let trainer_id: string;

    if (to_from) {
      // User to Trainer
      if (sender.role !== 'user') {
        res.status(403).json({ message: 'Forbidden: Only users can send messages to trainers.' });
        return;
      }
      user_id = senderId;
      trainer_id = recipientId;
    } else {
      // Trainer to User
      if (sender.role !== 'trainer') {
        res.status(403).json({ message: 'Forbidden: Only trainers can send messages to users.' });
        return;
      }
      const trainer = await getTrainerIdByUserId(senderId);
      if (!trainer) {
        res.status(404).json({ message: 'Trainer profile not found for the sender' });
        return;
      }
      trainer_id = trainer.id;
      user_id = recipientId;
    }

    const newMessage = await createTrainerMessage({
      user_id,
      trainer_id,
      message,
      to_from,
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error in createTrainerMessageHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrainerMessagesHandler: ExpressHandler = async (req, res) => {
  try {
    const requesterId = req.user?.userId;
    if (!requesterId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const otherPartyId = req.params.id;
    if (!otherPartyId) {
      res.status(400).json({ message: 'Other party ID is required' });
      return;
    }

    const requester = await getUserRole(requesterId);
    if (!requester) {
      res.status(404).json({ message: 'Requester not found' });
      return;
    }

    let user_id: string;
    let trainer_id: string;

    if (requester.role === 'user') {
      user_id = requesterId;
      trainer_id = otherPartyId;
    } else if (requester.role === 'trainer') {
      const trainer = await getTrainerIdByUserId(requesterId);
      if (!trainer) {
        res.status(404).json({ message: 'Trainer profile not found for the requester' });
        return;
      }
      trainer_id = trainer.id;
      user_id = otherPartyId;
    } else {
      res.status(403).json({ message: 'Forbidden: Role not allowed to access messages.' });
      return;
    }

    const messages = await getTrainerMessages(user_id, trainer_id);

    res.status(200).json({
      message: 'Messages fetched successfully',
      data: messages,
    });
  } catch (error) {
    console.error('Error in getTrainerMessagesHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getChatListHandler: ExpressHandler = async (req, res) => {
  try {
    const requesterId = req.user?.userId;
    if (!requesterId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found' });
      return;
    }

    const requester = await getUserRole(requesterId);
    if (!requester) {
      res.status(404).json({ message: 'Requester not found' });
      return;
    }

    let chatList;
    if (requester.role === 'user') {
      chatList = await getUserChatList(requesterId);
    } else if (requester.role === 'trainer') {
      const trainer = await getTrainerIdByUserId(requesterId);
      if (!trainer) {
        res.status(404).json({ message: 'Trainer profile not found for the requester' });
        return;
      }
      chatList = await getTrainerChatList(trainer.id);
    } else {
      res.status(403).json({ message: 'Forbidden: Role not allowed.' });
      return;
    }

    res.status(200).json({
      message: 'Chat list fetched successfully',
      data: chatList,
    });
  } catch (error) {
    console.error('Error in getChatListHandler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
