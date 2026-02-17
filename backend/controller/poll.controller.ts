import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { nanoid } from 'nanoid';
import { Server } from 'socket.io';

// Socket.io instance will be set from index.ts
let io: Server;

export const setIO = (socketIO: Server) => {
  io = socketIO;
};

// Create a new poll
export const createPoll = async (req: Request, res: Response) => {
  try {
    const { question, options } = req.body;

    // Validation
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'At least 2 options are required' });
    }

    if (options.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 options allowed' });
    }

    // Check all options have text
    const validOptions = options.filter(opt => opt && typeof opt === 'string' && opt.trim().length > 0);
    if (validOptions.length !== options.length) {
      return res.status(400).json({ error: 'All options must have text' });
    }

    // Generate short poll ID
    const pollId = nanoid(8);

    // Create poll with options in transaction
    const poll = await prisma.poll.create({
      data: {
        id: pollId,
        question: question.trim(),
        options: {
          create: validOptions.map((text, index) => ({
            text: text.trim(),
            order: index,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    res.status(201).json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

// Get poll by ID with vote counts
export const getPoll = async (req: Request, res: Response) => {
  try {
    const pollId = req.params.pollId as string;

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Calculate vote counts per option
    const pollWithCounts = {
      ...poll,
      options: poll.options.map((option: any) => ({
        id: option.id,
        text: option.text,
        order: option.order,
        voteCount: option.votes.length,
      })),
      totalVotes: poll.options.reduce((sum: number, opt: any) => sum + opt.votes.length, 0),
    };

    res.json(pollWithCounts);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
};

// Submit or update vote
export const voteOnPoll = async (req: Request, res: Response) => {
  try {
    const pollId = req.params.pollId as string;
    const { optionId, voterFingerprint } = req.body;
    const voterIp = req.voterIp || 'unknown';

    // Validation
    if (!optionId || typeof optionId !== 'number') {
      return res.status(400).json({ error: 'Option ID is required' });
    }

    if (!voterFingerprint || typeof voterFingerprint !== 'string') {
      return res.status(400).json({ error: 'Voter fingerprint is required' });
    }

    // Check if poll exists
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if option exists in this poll
    const optionExists = poll.options.some((opt: any) => opt.id === optionId);
    if (!optionExists) {
      return res.status(400).json({ error: 'Invalid option ID for this poll' });
    }

    // Check if user already voted (by IP or fingerprint)
    const existingVote = await prisma.vote.findFirst({
      where: {
        pollId,
        OR: [
          { voterIp },
          { voterFingerprint },
        ],
      },
    });

    let vote;
    if (existingVote) {
      // Update existing vote
      vote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { optionId },
      });
    } else {
      // Create new vote
      vote = await prisma.vote.create({
        data: {
          pollId,
          optionId,
          voterIp,
          voterFingerprint,
        },
      });
    }

    // Get updated vote counts
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (updatedPoll) {
      const pollData = {
        ...updatedPoll,
        options: updatedPoll.options.map((option: any) => ({
          id: option.id,
          text: option.text,
          order: option.order,
          voteCount: option.votes.length,
        })),
        totalVotes: updatedPoll.options.reduce((sum: number, opt: any) => sum + opt.votes.length, 0),
      };

      // Emit real-time update to all connected clients
      if (io) {
        io.to(`poll:${pollId}`).emit('pollUpdate', pollData);
      }

      res.json({ 
        success: true, 
        vote,
        updated: !!existingVote,
        poll: pollData,
      });
    } else {
      res.json({ success: true, vote, updated: !!existingVote });
    }
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
};
