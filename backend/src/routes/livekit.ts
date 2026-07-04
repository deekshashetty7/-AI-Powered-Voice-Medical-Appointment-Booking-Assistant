import { Router, Request, Response } from 'express';
import { AccessToken, RoomServiceClient, AgentDispatchClient } from 'livekit-server-sdk';
import { randomBytes } from 'crypto';

const router = Router();

router.post('/token', async (req: Request, res: Response) => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return res.status(500).json({
      error: 'LiveKit is not configured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL.',
    });
  }

  try {
    const {
      language = 'en',
      sttProvider = 'deepgram',
      patientName,
    } = req.body as {
      language?: string;
      sttProvider?: string;
      patientName?: string;
    };

    const roomName = `appointment-${randomBytes(8).toString('hex')}`;
    const participantName = patientName || `patient-${randomBytes(4).toString('hex')}`;
    const metadata = JSON.stringify({ language, sttProvider, patientName: participantName });

    const httpUrl = livekitUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    const roomService = new RoomServiceClient(httpUrl, apiKey, apiSecret);

    await roomService.createRoom({
      name: roomName,
      emptyTimeout: 300,
      maxParticipants: 2,
      metadata,
    });

    try {
      const dispatchClient = new AgentDispatchClient(httpUrl, apiKey, apiSecret);
      await dispatchClient.createDispatch(roomName, 'medivoice-agent', { metadata });
    } catch (dispatchErr) {
      console.warn('Agent dispatch failed (is agent running?):', dispatchErr);
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '1h',
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    res.json({
      token: jwt,
      roomName,
      livekitUrl,
      language,
      sttProvider,
    });
  } catch (err) {
    console.error('LiveKit token error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to create voice session',
    });
  }
});

export default router;
