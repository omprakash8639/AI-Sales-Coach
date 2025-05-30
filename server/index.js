import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { ElevenLabsClient } from 'elevenlabs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SDK clients
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// WebRTC configuration
const webRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.stunprotocol.org:3478' }
  ]
};

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server for WebRTC signaling
const wss = new WebSocketServer({ server });

// Store active sessions and WebRTC peer connections
const sessions = new Map();
const webRTCConnections = new Map();
const audioStreams = new Map();

// Generate AI response using GROQ SDK
async function generateAIResponse(transcript, sessionId) {
  try {
    const session = sessions.get(sessionId);
    const persona = session?.persona || 'young-professional';
    const product = session?.product || 'credit-card';

    const personaPrompts = {
      'young-professional': 'You are a busy, tech-savvy professional aged 25-35. You value efficiency and are somewhat skeptical but open to good offers.',
      'retiree': 'You are a retiree on a fixed income. You are very cautious about financial products and ask many questions about security.',
      'family-oriented': 'You are a family person aged 35-50. Your primary concern is protecting your family\'s financial future.',
      'skeptical-veteran': 'You are an experienced person aged 45-65 who has seen many sales pitches. You are very hard to convince.'
    };

    const personaPrompt = personaPrompts[persona] || personaPrompts['young-professional'];

    console.log("Sending to GROQ:", {
      system: personaPrompt,
      user: `The salesperson just said: "${transcript}". Respond as the customer.`,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: personaPrompt },
        { role: 'user', content: `The salesperson just said: "${transcript}". Respond as the customer.` }
      ],
      model: 'llama3-8b-8192',
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log("GROQ Response:", chatCompletion);

    const aiResponse = chatCompletion.choices[0]?.message?.content?.trim() || "I see, tell me more.";
    
    // Generate audio for AI response and send via WebRTC
    await generateAndStreamAudio(aiResponse, sessionId);
    
    return aiResponse;
  } catch (error) {
    console.error('AI response error:', error.message);
    const fallbackResponse = "I understand your concern. Let me explain how this product can specifically benefit you.";
    await generateAndStreamAudio(fallbackResponse, sessionId);
    return fallbackResponse;
  }
}

// Generate audio and stream via WebRTC
async function generateAndStreamAudio(text, sessionId) {
  try {
    const session = sessions.get(sessionId);
    const webRTCData = webRTCConnections.get(sessionId);
    
    if (!webRTCData || !webRTCData.ws) {
      console.error('No WebRTC connection found for session:', sessionId);
      return;
    }

    console.log(`Generating audio for: "${text}"`);

    // Generate audio using ElevenLabs SDK
    const audio = await elevenlabs.generate({
      voice: "Rachel",
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: session?.voiceSettings?.stability || 0.5,
        similarity_boost: session?.voiceSettings?.clarity || 0.5,
        style: session?.voiceSettings?.style || 0.0,
        use_speaker_boost: true
      }
    });

    // Convert audio stream to base64 chunks for WebRTC transmission
    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    
    // Split audio into smaller chunks for streaming
    const chunkSize = 1024; // 1KB chunks
    const totalChunks = Math.ceil(audioBuffer.length / chunkSize);
    
    // Send audio metadata first
    webRTCData.ws.send(JSON.stringify({
      type: 'audio_stream_start',
      sessionId: sessionId,
      totalChunks: totalChunks,
      audioLength: audioBuffer.length
    }));
    
    // Send audio chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, audioBuffer.length);
      const chunk = audioBuffer.slice(start, end);
      
      webRTCData.ws.send(JSON.stringify({
        type: 'audio_chunk',
        sessionId: sessionId,
        chunkIndex: i,
        chunk: chunk.toString('base64'),
        isLast: i === totalChunks - 1
      }));
      
      // Small delay to prevent overwhelming the connection
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Signal end of audio stream
    webRTCData.ws.send(JSON.stringify({
      type: 'audio_stream_end',
      sessionId: sessionId
    }));
    
  } catch (error) {
    console.error('Audio generation error:', error.message);
  }
}

// WebSocket connection handling for WebRTC signaling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected for WebRTC signaling');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join_session':
          ws.sessionId = data.sessionId;
          console.log(`Client joined session: ${data.sessionId}`);
          
          // Store WebRTC connection data for this session
          webRTCConnections.set(data.sessionId, {
            ws: ws,
            connected: false,
            audioEnabled: false,
            dataChannelOpen: false
          });
          
          ws.send(JSON.stringify({
            type: 'session_joined',
            sessionId: data.sessionId,
            webRTCConfig: webRTCConfig
          }));
          break;

        case 'webrtc_offer':
          console.log(`Received WebRTC offer for session: ${ws.sessionId}`);
          // Forward offer to other peers if needed (for peer-to-peer)
          // For server-client architecture, we'll handle this differently
          const offerData = webRTCConnections.get(ws.sessionId);
          if (offerData) {
            offerData.offer = data.offer;
            // In a real implementation, you'd create an answer here
            // For now, we'll simulate accepting the connection
            ws.send(JSON.stringify({
              type: 'webrtc_answer',
              answer: data.offer, // Simplified - in reality you'd generate a proper answer
              sessionId: ws.sessionId
            }));
          }
          break;

        case 'webrtc_answer':
          console.log(`Received WebRTC answer for session: ${ws.sessionId}`);
          const answerData = webRTCConnections.get(ws.sessionId);
          if (answerData) {
            answerData.answer = data.answer;
            answerData.connected = true;
            console.log(`WebRTC connected for session: ${ws.sessionId}`);
            
            ws.send(JSON.stringify({
              type: 'webrtc_connected',
              sessionId: ws.sessionId
            }));
          }
          break;

        case 'ice_candidate':
          console.log(`Received ICE candidate for session: ${ws.sessionId}`);
          // In a real WebRTC implementation, you'd exchange ICE candidates
          // For server-based approach, we'll acknowledge receipt
          ws.send(JSON.stringify({
            type: 'ice_candidate_received',
            sessionId: ws.sessionId
          }));
          break;

        case 'webrtc_connected':
          const connData = webRTCConnections.get(ws.sessionId);
          if (connData) {
            connData.connected = true;
            console.log(`WebRTC connection established for session: ${ws.sessionId}`);
          }
          break;

        case 'data_channel_open':
          const dcData = webRTCConnections.get(ws.sessionId);
          if (dcData) {
            dcData.dataChannelOpen = true;
            console.log(`Data channel opened for session: ${ws.sessionId}`);
          }
          break;

        case 'audio_data':
          console.log('Audio data received via WebRTC signaling');
          // Process audio data (would typically be from WebRTC data channel)
          if (ws.sessionId && data.audioData) {
            // In a real implementation, you'd process the audio buffer
            // For now, we'll simulate with the provided transcript or generate one
            const transcript = data.transcript || "This is simulated transcript from WebRTC audio";
            const response = await generateAIResponse(transcript, ws.sessionId);
            
            ws.send(JSON.stringify({
              type: 'ai_response',
              transcript: transcript,
              response: response,
              sessionId: ws.sessionId
            }));
          }
          break;

        case 'start_listening':
          console.log('Started listening for audio via WebRTC');
          const listenData = webRTCConnections.get(ws.sessionId);
          if (listenData) {
            listenData.audioEnabled = true;
          }
          ws.send(JSON.stringify({
            type: 'listening_started',
            sessionId: ws.sessionId
          }));
          break;

        case 'stop_listening':
          console.log('Stopped listening for audio via WebRTC');
          const stopData = webRTCConnections.get(ws.sessionId);
          if (stopData) {
            stopData.audioEnabled = false;
          }
          ws.send(JSON.stringify({
            type: 'listening_stopped',
            sessionId: ws.sessionId
          }));
          break;

        case 'send_data':
          // Handle data channel messages
          console.log('Data received via WebRTC:', data.payload);
          ws.send(JSON.stringify({
            type: 'webrtc_data_received',
            data: data.payload,
            sessionId: ws.sessionId
          }));
          break;

        case 'text_input':
          // Fallback for text input when WebRTC audio isn't available
          if (ws.sessionId && data.transcript) {
            const response = await generateAIResponse(data.transcript, ws.sessionId);
            ws.send(JSON.stringify({
              type: 'ai_response',
              transcript: data.transcript,
              response: response,
              sessionId: ws.sessionId
            }));
          }
          break;

        case 'ping':
          // Keep-alive ping
          ws.send(JSON.stringify({
            type: 'pong',
            sessionId: ws.sessionId
          }));
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message',
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    if (ws.sessionId) {
      // Clean up WebRTC connection data
      webRTCConnections.delete(ws.sessionId);
      
      // Clean up audio streams
      if (audioStreams.has(ws.sessionId)) {
        audioStreams.delete(ws.sessionId);
      }
      
      console.log(`Cleaned up session: ${ws.sessionId}`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// API Routes
app.post('/api/start-session', async (req, res) => {
  try {
    const { persona, product, difficulty, voiceSettings } = req.body;

    // Generate session ID
    const sessionId = Date.now().toString();

    // Store session data
    sessions.set(sessionId, {
      persona,
      product,
      difficulty,
      voiceSettings,
      startTime: new Date(),
      conversation: []
    });

    // Generate initial AI response based on persona
    const initialResponses = {
      'young-professional': "Hi there! I'm quite busy with work, but I have a few minutes. What's this about?",
      'retiree': "Hello. I have to say, I'm quite skeptical about financial products these days. What are you offering?",
      'family-oriented': "Hi, I'm interested but I need to make sure this is right for my family. What can you tell me?",
      'skeptical-veteran': "I've heard it all before. What makes your offer any different from the others?"
    };

    const initialResponse = initialResponses[persona] || initialResponses['young-professional'];

    res.json({
      success: true,
      sessionId,
      initialResponse,
      webRTCConfig: webRTCConfig
    });

    console.log(`Session started: ${sessionId} for persona: ${persona}, product: ${product}`);

  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start session'
    });
  }
});

// WebRTC connection status
app.get('/api/webrtc-status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const webRTCData = webRTCConnections.get(sessionId);
  
  res.json({
    sessionId,
    webRTCConnected: webRTCData?.connected || false,
    audioEnabled: webRTCData?.audioEnabled || false,
    dataChannelOpen: webRTCData?.dataChannelOpen || false,
    connectionExists: !!webRTCData
  });
});

// Send message via WebRTC (through WebSocket signaling)
app.post('/api/send-webrtc-data', (req, res) => {
  try {
    const { sessionId, data } = req.body;
    const webRTCData = webRTCConnections.get(sessionId);
    
    if (!webRTCData || !webRTCData.ws) {
      return res.status(404).json({
        success: false,
        error: 'No WebRTC connection found for session'
      });
    }

    webRTCData.ws.send(JSON.stringify({
      type: 'server_data',
      data: data,
      sessionId: sessionId
    }));
    
    res.json({
      success: true,
      message: 'Data sent via WebRTC signaling'
    });
  } catch (error) {
    console.error('Send WebRTC data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send data via WebRTC'
    });
  }
});

// Fallback API for direct audio generation (when WebRTC is not available)
app.post('/api/generate-audio', async (req, res) => {
  try {
    const { text, voiceSettings } = req.body;

    console.log(`Generating audio for: "${text}" with voice settings:`, voiceSettings);

    const audio = await elevenlabs.generate({
      voice: "Rachel",
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: voiceSettings?.stability || 0.5,
        similarity_boost: voiceSettings?.clarity || 0.5,
        style: voiceSettings?.style || 0.0,
        use_speaker_boost: true
      }
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    const base64Audio = audioBuffer.toString('base64');

    res.json({
      success: true,
      audio: base64Audio,
      message: 'Audio generated successfully'
    });

  } catch (error) {
    console.error('Audio generation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate audio: ' + error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size,
    activeWebRTCConnections: webRTCConnections.size,
    activeAudioStreams: audioStreams.size
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`WebSocket server ready for WebRTC signaling`);
  console.log(`WebRTC configured for real-time communication`);
});