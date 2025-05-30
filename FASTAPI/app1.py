from fastapi import FastAPI, File, UploadFile, HTTPException, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import tempfile
import os
import sys
from io import BytesIO
import numpy as np
import scipy.io.wavfile as wavfile
from dotenv import load_dotenv
from groq import Groq
from elevenlabs.client import ElevenLabs
from elevenlabs import Voice, VoiceSettings
import json
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import uvicorn
import uuid
from datetime import datetime, timedelta
import asyncio
from collections import defaultdict
import base64

# Load environment variables
load_dotenv()

# Initialize Groq and ElevenLabs clients
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

app = FastAPI(title="Fintech Training AI Customer Interaction API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Personas configuration
PERSONAS = {
    "young-professional": {
        "name": "Young Professional",
        "traits": "Tech-savvy, ambitious, values efficiency",
        "behavior": "Direct questions about features, mobile app functionality, and rewards",
        "objections": ["Time constraints", "Already has solutions", "Prefers digital-first approaches"]
    },
    "retiree": {
        "name": "Retiree",
        "traits": "Conservative, values security and stability",
        "behavior": "Concerned about fees, security, and wants detailed explanations",
        "objections": ["Trust issues", "Complexity concerns", "Fixed income constraints"]
    },
    "family-oriented": {
        "name": "Family Person",
        "traits": "Protective, focused on family financial security",
        "behavior": "Asks about family coverage, educational benefits, and cost savings",
        "objections": ["Budget limitations", "Family priorities", "Existing commitments"]
    },
    "skeptical-veteran": {
        "name": "Skeptical Veteran",
        "traits": "Experienced, hard to convince, asks tough questions",
        "behavior": "Challenges claims, asks for proof, compares with competitors",
        "objections": ["Seen it all before", "Prove the value", "Why switch from current provider"]
    }
}

# Products configuration
PRODUCTS = {
    "credit-card": {
        "name": "Platinum Credit Card",
        "features": ["No annual fee", "2% cashback", "Travel insurance", "24/7 support"],
        "target_audience": "All personas",
        "key_benefits": "Reward earning and financial flexibility"
    },
    "health-insurance": {
        "name": "Comprehensive Health Plan",
        "features": ["Full coverage", "Preventive care", "Specialist access", "Prescription coverage"],
        "target_audience": "Family person, retiree",
        "key_benefits": "Health security and cost savings"
    },
    "life-insurance": {
        "name": "Life Protection Plus",
        "features": ["Term and whole life options", "Living benefits", "Cash value", "Flexible premiums"],
        "target_audience": "Family person, young professional",
        "key_benefits": "Financial protection for loved ones"
    },
    "home-loan": {
        "name": "Smart Home Loan",
        "features": ["Low interest rates", "Flexible terms", "Digital application", "Fast approval"],
        "target_audience": "Young professional, family person",
        "key_benefits": "Homeownership made accessible"
    }
}

# Conversation phases
CONVERSATION_PHASES = [
    "greeting",
    "needs_assessment",
    "product_presentation",
    "handle_objections",
    "closing"
]

# Difficulty levels
DIFFICULTY_LEVELS = {
    "beginner": {
        "objection_frequency": 0.3,
        "objection_complexity": "simple",
        "resistance_level": "low"
    },
    "intermediate": {
        "objection_frequency": 0.5,
        "objection_complexity": "moderate",
        "resistance_level": "medium"
    },
    "advanced": {
        "objection_frequency": 0.7,
        "objection_complexity": "complex",
        "resistance_level": "high"
    }
}

# Voice settings
# Voice settings
VOICE_SETTINGS = {
    "male": {
        "en": {"voice_id": "Mgih2jslgx7pUv85yYYU", "name": "Maksud"},
        "hi": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},
        "bn": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},  # Bengali
        "te": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},  # Telugu
        "mr": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},  # Marathi
        "ta": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},  # Tamil
        "ur": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},  # Urdu
        "gu": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},  # Gujarati
        "kn": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},  # Kannada
        "or": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},  # Odia
        "pa": {"voice_id": "1SM7GgM6IMuvQlz2BwM3", "name": "Mark"},  # Punjabi
    },
    "female": {
        "en": {"voice_id": "Ps8lsQuJKZHMxxDU1tff", "name": "Ahana"},
        "hi": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},
        "bn": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},  # Bengali
        "te": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},  # Telugu
        "mr": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},  # Marathi
        "ta": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},  # Tamil
        "ur": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},  # Urdu
        "gu": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},  # Gujarati
        "kn": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},  # Kannada
        "or": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},  # Odia
        "pa": {"voice_id": "OYTbf65OHHFELVut7v2H", "name": "Hope"},  # Punjabi
    }
}


# Language settings
LANGUAGE_CODES = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "te": "Telugu",
    "mr": "Marathi",
    "ta": "Tamil",
    "ur": "Urdu",
    "gu": "Gujarati",
    "kn": "Kannada",
    "or": "Odia",
    "pa": "Punjabi"
}

# Global storage (in production, use proper database)
sessions = {}
analytics_data = {
    "total_sessions": 0,
    "average_score": 0,
    "improvement_rate": 0,
    "completion_rate": 0,
    "persona_performance": defaultdict(list),
    "product_performance": defaultdict(list),
    "recent_sessions": [],
    "achievements": []
}

# WebSocket connections
active_connections: Dict[str, WebSocket] = {}

# Pydantic models
class SessionConfig(BaseModel):
    persona: str
    product: str
    difficulty: str
    voiceSettings: dict = {"gender": "female", "language": "en"}
    voice_tone: str = "neutral"
    user_name: str = "Agent"

class ChatMessage(BaseModel):
    text: str
    speaker: str  # "user" or "ai"
    timestamp: datetime
    phase: str

class SessionData(BaseModel):
    session_id: str
    config: SessionConfig
    conversation: List[ChatMessage]
    current_phase: str
    start_time: datetime
    end_time: Optional[datetime]
    score: Optional[int]
    is_active: bool

class CoachingTip(BaseModel):
    phase: str
    tip: str
    priority: str

# Helper functions
def generate_session_id():
    return str(uuid.uuid4())

def get_coaching_tips(phase: str, persona: str) -> List[CoachingTip]:
    tips = {
        "greeting": [
            CoachingTip(phase="greeting", tip="Start with a warm, professional greeting", priority="high"),
            CoachingTip(phase="greeting", tip="Introduce yourself and your company clearly", priority="high"),
            CoachingTip(phase="greeting", tip="Ask permission to discuss financial solutions", priority="medium")
        ],
        "needs_assessment": [
            CoachingTip(phase="needs_assessment", tip="Ask open-ended questions about their current situation", priority="high"),
            CoachingTip(phase="needs_assessment", tip="Listen actively and take notes", priority="high"),
            CoachingTip(phase="needs_assessment", tip="Identify pain points and opportunities", priority="medium")
        ],
        "product_presentation": [
            CoachingTip(phase="product_presentation", tip="Focus on benefits that match their needs", priority="high"),
            CoachingTip(phase="product_presentation", tip="Use specific examples and scenarios", priority="medium"),
            CoachingTip(phase="product_presentation", tip="Avoid overwhelming with too many features", priority="medium")
        ],
        "handle_objections": [
            CoachingTip(phase="handle_objections", tip="Acknowledge their concerns first", priority="high"),
            CoachingTip(phase="handle_objections", tip="Ask clarifying questions to understand the objection", priority="high"),
            CoachingTip(phase="handle_objections", tip="Provide evidence-based responses", priority="medium")
        ],
        "closing": [
            CoachingTip(phase="closing", tip="Summarize the key benefits discussed", priority="high"),
            CoachingTip(phase="closing", tip="Ask for the commitment clearly", priority="high"),
            CoachingTip(phase="closing", tip="Handle final concerns and set next steps", priority="medium")
        ]
    }
    return tips.get(phase, [])

def generate_ai_prompt(config, phase: str, conversation_history: List[ChatMessage]) -> str:
    # Handle both dict and SessionConfig object
    if isinstance(config, dict):
        persona_key = config["persona"]
        product_key = config["product"]
        difficulty_key = config["difficulty"]
        language = config.get("voiceSettings", {}).get("language", "en")
    else:
        persona_key = config.persona
        product_key = config.product
        difficulty_key = config.difficulty
        language = config.voiceSettings.get("language", "en")

    # Map difficulty values to DIFFICULTY_LEVELS keys
    difficulty_mapping = {
        "easy": "beginner",
        "medium": "intermediate",
        "hard": "advanced",
        "beginner": "beginner",
        "intermediate": "intermediate",
        "advanced": "advanced"
    }

    mapped_difficulty = difficulty_mapping.get(difficulty_key, "intermediate")

    persona = PERSONAS[persona_key]
    product = PRODUCTS[product_key]
    difficulty = DIFFICULTY_LEVELS[mapped_difficulty]

    # Language-specific instructions
    language_instruction = ""
    if language == "hi":
        language_instruction = "Hindi."
    elif language == "bn":
        language_instruction = "Bengali."
    elif language == "te":
        language_instruction = "Telugu."
    elif language == "mr":
        language_instruction = "Marathi."
    elif language == "ta":
        language_instruction = "Tamil."
    elif language == "ur":
        language_instruction = "Urdu."
    elif language == "gu":
        language_instruction = "Gujarati."
    elif language == "kn":
        language_instruction = "Kannada."
    elif language == "or":
        language_instruction = "Odia."
    elif language == "pa":
        language_instruction = "Punjabi."
    else:
        language_instruction = "English."

    base_prompt = f"""You are roleplaying as {persona['name']}, a customer in a financial services training simulation.

PERSONA OVERVIEW:
- Traits: {persona['traits']}
- Behavior: {persona['behavior']}
- Common Objections: {', '.join(persona['objections'])}

PRODUCT: {product['name']}
- Key Features: {', '.join(product['features'])}

SCENARIO:
- Difficulty: {mapped_difficulty.title()} (Objection Rate: {difficulty['objection_frequency']*100}%, Resistance: {difficulty['resistance_level']})
- Phase: {phase.replace('_', ' ').title()}
- Language: {language}

ROLEPLAY GUIDELINES:
1. Stay in character as {persona['name']}
2. Be natural—responses should be 1–2 short sentences
3. Raise objections when relevant
4. Show interest only if benefits fit your needs
5. Ask realistic questions based on your persona
6. Striclty give the response in {language_instruction} only, no translation needed.

Reminder: You are the **customer**, not the agent. React realistically to their approach."""

    if conversation_history:
        # Access 'speaker' and 'text' as dictionary keys, not attributes
        recent_context = "\n".join([f"{msg['speaker']}: {msg['text']}" for msg in conversation_history[-3:]])
        base_prompt += f"\n\nRECENT CONVERSATION:\n{recent_context}"
    return base_prompt


async def transcribe_audio(audio_data: bytes) -> tuple[str, str]:
    """Transcribe audio using Groq Whisper"""
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name

        with open(temp_file_path, 'rb') as audio_file:
            transcription = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3-turbo",
                response_format="verbose_json"
            )

        os.unlink(temp_file_path)

        text = transcription.text.strip()
        language = getattr(transcription, 'language', 'en')

        return text, language

    except Exception as e:
        print(f"Transcription error: {e}")
        return "", "en"

async def generate_ai_response(session_id: str, user_input: str) -> str:
    """Generate AI customer response using Groq"""
    session = sessions.get(session_id)
    if not session:
        return "I'm sorry, I think we got disconnected."

    try:
        prompt = generate_ai_prompt(session['config'], session['current_phase'], session['conversation'])

        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_input}
        ]

        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            max_tokens=100,
            temperature=0.8
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"AI response error: {e}")
        return "I'm having trouble hearing you clearly. Could you repeat that?"

async def text_to_speech(text: str, voice_gender: str = "female", language: str = "en") -> bytes:
    """Convert text to speech using ElevenLabs"""
    try:
        actual_voice_gender = voice_gender if voice_gender in VOICE_SETTINGS else "female"
        voice_config = VOICE_SETTINGS[actual_voice_gender].get(language, VOICE_SETTINGS[actual_voice_gender]["en"])

        audio_stream = elevenlabs_client.generate(
            text=text,
            voice=Voice(
                voice_id=voice_config["voice_id"],
                settings=VoiceSettings(
                    stability=0.32,
                    similarity_boost=0.46,
                    style=0.85,
                    speed=1.5
                )
            ),
            model="eleven_multilingual_v2",
            stream=True
        )

        audio_buffer = BytesIO()
        for chunk in audio_stream:
            if chunk:
                audio_buffer.write(chunk)

        return audio_buffer.getvalue()

    except Exception as e:
        print(f"TTS error: {e}")
        return b""


def update_analytics(session: Dict[str, Any]):
    """Update analytics after session completion"""
    global analytics_data

    analytics_data["total_sessions"] += 1

    if session.get("score"):
        # Update average score
        current_avg = analytics_data["average_score"]
        total_sessions = analytics_data["total_sessions"]
        analytics_data["average_score"] = ((current_avg * (total_sessions - 1)) + session["score"]) / total_sessions

    # Update persona and product performance
    config = session["config"]
    analytics_data["persona_performance"][config["persona"]].append(session.get("score", 0))
    analytics_data["product_performance"][config["product"]].append(session.get("score", 0))

    # Add to recent sessions
    analytics_data["recent_sessions"].insert(0, {
        "session_id": session["session_id"],
        "persona": config["persona"],
        "product": config["product"],
        "score": session.get("score", 0),
        "date": session["start_time"].isoformat()
    })

    # Keep only last 10 sessions
    analytics_data["recent_sessions"] = analytics_data["recent_sessions"][:10]

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Fintech Training AI Customer Interaction API",
        "version": "1.0.0",
        "endpoints": {
            "session": "/session",
            "websocket": "/ws/{session_id}",
            "analytics": "/analytics"
        }
    }

@app.post("/session")
async def start_session(config: SessionConfig):
    """Start a new training session"""
    session_id = generate_session_id()

    # Generate initial AI response
    persona = PERSONAS[config.persona]
    product = PRODUCTS[config.product]
    language = config.voiceSettings.get("language", "en")

    # Language-specific instructions
    language_instruction = ""
    if language == "hi":
        language_instruction = "Hindi"
    elif language == "bn":
        language_instruction = "Bengali"
    elif language == "te":
        language_instruction = "Telugu"
    elif language == "mr":
        language_instruction = "Marathi"
    elif language == "ta":
        language_instruction = "Tamil"
    elif language == "ur":
        language_instruction = "Urdu"
    elif language == "gu":
        language_instruction = "Gujarati"
    elif language == "kn":
        language_instruction = "Kannada"
    elif language == "or":
        language_instruction = "Odia"
    elif language == "pa":
        language_instruction = "Punjabi"
    else:
        language_instruction = "English"

    initial_prompt = f"""Generate an opening statement as a {persona['name']} customer who just answered a sales call about {product['name']}.
    Be realistic to the persona - show the appropriate level of interest/skepticism. Keep it to 1-2 sentences. Strictly Give the response in {language_instruction} only, No translation needed."""

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": initial_prompt}],
            max_tokens=100,
            temperature=0.8
        )
        initial_response = response.choices[0].message.content
    except:
        initial_response = "Hello, I got your call about some financial products. What exactly are you offering?"

    session_data = {
        "session_id": session_id,
        "config": config.model_dump(),
        "conversation": [],
        "current_phase": "greeting",
        "start_time": datetime.now(),
        "end_time": None,
        "score": None,
        "is_active": True
    }

    sessions[session_id] = session_data

    return {
        "success": True,
        "sessionId": session_id,
        "initialResponse": initial_response,
        "coaching_tips": [tip.model_dump() for tip in get_coaching_tips("greeting", config.persona)]
    }


@app.post("/session/{session_id}/end")
async def end_session(session_id: str, score: Optional[int] = None):
    """End a training session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[session_id]
    session["end_time"] = datetime.now()
    session["is_active"] = False
    session["score"] = score

    update_analytics(session)

    return {
        "success": True,
        "session_duration": (session["end_time"] - session["start_time"]).total_seconds(),
        "final_score": score
    }

@app.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    return sessions[session_id]

@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear session history"""
    if session_id in sessions:
        del sessions[session_id]
        if session_id in active_connections:
            del active_connections[session_id]

    return {"success": True, "message": f"Session {session_id} cleared"}

@app.get("/analytics")
async def get_analytics():
    """Get training analytics"""
    return analytics_data

@app.get("/personas")
async def get_personas():
    """Get available customer personas"""
    return PERSONAS

@app.get("/products")
async def get_products():
    """Get available products"""
    return PRODUCTS

@app.get("/coaching-tips/{phase}")
async def get_coaching_tips_endpoint(phase: str, persona: str = "young-professional"):
    """Get coaching tips for a specific phase"""
    return get_coaching_tips(phase, persona)

@app.get("/languages")
async def get_languages():
    """Get available languages"""
    return LANGUAGE_CODES

# WebSocket endpoint for real-time communication
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    active_connections[session_id] = websocket
    print(f"INFO:     WebSocket connection opened for session {session_id}")

    try:
        while True:
            # Try to receive a JSON message
            try:
                message = await websocket.receive_json()

                # Handle different message types
                if message.get("type") == "start_listening":
                    print("INFO:     Received start_listening message.")
                    await websocket.send_json({"type": "listening_started"})
                    continue
                elif message.get("type") == "stop_listening":
                    print("INFO:     Received stop_listening message.")
                    await websocket.send_json({"type": "listening_stopped"})
                    continue
                elif message.get("type") == "audio_chunk":
                    # For demo purposes, use the transcript from the message
                    audio_data = base64.b64decode(message.get("audio", ""))
                    transcript, language = await transcribe_audio(audio_data)

                    if not transcript.strip():
                        await websocket.send_json({
                            "type": "error",
                            "message": "No speech detected. Please try speaking clearly."
                        })
                        continue


                    # Update session conversation
                    if session_id in sessions:
                        session = sessions[session_id]

                        # Add user message
                        user_message = ChatMessage(
                            text=transcript,
                            speaker="user",
                            timestamp=datetime.now(),
                            phase=session["current_phase"]
                        )
                        session["conversation"].append(user_message.model_dump())

                        # Generate AI response
                        ai_response_text = await generate_ai_response(session_id, transcript)

                        # Add AI message
                        ai_message = ChatMessage(
                            text=ai_response_text,
                            speaker="ai",
                            timestamp=datetime.now(),
                            phase=session["current_phase"]
                        )
                        session["conversation"].append(ai_message.model_dump())

                        # Send response back
                        response_data = {
                            "type": "ai_response",
                            "text": ai_response_text,
                            "transcript": transcript,
                            "current_phase": session["current_phase"],
                            "coaching_tips": [tip.model_dump() for tip in get_coaching_tips(session["current_phase"], session["config"]["persona"])]
                        }

                        await websocket.send_json(response_data)
                        print(f"INFO:     Sent AI response for session {session_id}.")

            except json.JSONDecodeError:
                # If JSON parsing fails, it might be a binary message (like raw audio)
                # Try to receive as bytes
                try:
                    audio_data = await websocket.receive_bytes()
                    print(f"INFO:     Received binary data (length: {len(audio_data)} bytes). Attempting transcription.")

                    transcript, language = await transcribe_audio(audio_data)

                    if transcript.strip() and session_id in sessions:
                        session = sessions[session_id]

                        # Add user message
                        user_message = ChatMessage(
                            text=transcript,
                            speaker="user",
                            timestamp=datetime.now(),
                            phase=session["current_phase"]
                        )
                        session["conversation"].append(user_message.model_dump())

                        # Generate AI response
                        ai_response_text = await generate_ai_response(session_id, transcript)

                        # Add AI message
                        ai_message = ChatMessage(
                            text=ai_response_text,
                            speaker="ai",
                            timestamp=datetime.now(),
                            phase=session["current_phase"]
                        )
                        session["conversation"].append(ai_message.model_dump())

                        # Send response back
                        response_data = {
                            "type": "ai_response",
                            "text": ai_response_text,
                            "transcript": transcript,
                            "current_phase": session["current_phase"],
                            "coaching_tips": [tip.model_dump() for tip in get_coaching_tips(session["current_phase"], session["config"]["persona"])]
                        }

                        await websocket.send_json(response_data)
                        print(f"INFO:     Transcribed and sent AI response for session {session_id}.")

                except Exception as e:
                    print(f"ERROR:    Failed to process binary WebSocket message for session {session_id}: {e}")
                    # Optionally, send an error back to the client
                    await websocket.send_json({"type": "error", "message": "Failed to process audio message."})
                    break # Break the loop on critical errors
            except Exception as e:
                print(f"ERROR:    Unexpected error in WebSocket receive loop for session {session_id}: {e}")
                # Optionally, send an error back to the client
                await websocket.send_json({"type": "error", "message": "An unexpected error occurred."})
                break # Break the loop on unexpected errors

    except WebSocketDisconnect:
        print(f"INFO:     WebSocket connection closed for session {session_id}")
        if session_id in active_connections:
            del active_connections[session_id]
    except Exception as e:
        print(f"CRITICAL ERROR: Unhandled exception in websocket_endpoint for session {session_id}: {e}")
        if session_id in active_connections:
            # Attempt to gracefully close the connection if still open
            try:
                await active_connections[session_id].close(code=1011) # 1011: Internal Error
            except RuntimeError:
                pass # Already closed
            del active_connections[session_id]

# Traditional HTTP endpoints for testing
@app.post("/transcribe")
async def transcribe_endpoint(file: UploadFile = File(...)):
    """Transcribe audio file"""
    if not file.filename.lower().endswith(('.wav', '.mp3', '.m4a', '.ogg')):
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    audio_data = await file.read()
    transcript, language = await transcribe_audio(audio_data)

    return {
        "transcript": transcript,
        "language": language
    }

@app.post("/chat/{session_id}")
async def chat_endpoint(session_id: str, text: str = Form(...)):
    """Chat with text input"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    ai_response = await generate_ai_response(session_id, text)

    return {
        "user_input": text,
        "ai_response": ai_response
    }

@app.post("/generate-audio")
async def generate_audio_endpoint(request_data: dict):
    """Generate audio from text"""
    text = request_data.get("text", "")
    voice_settings = request_data.get("voiceSettings", {"gender": "female", "language": "en"})
    voice_gender = voice_settings.get("gender", "female")
    language = voice_settings.get("language", "en")

    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    audio_data = await text_to_speech(text, voice_gender, language)

    if audio_data:
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        return {"audio": audio_base64}
    else:
        raise HTTPException(status_code=500, detail="Failed to generate audio")

@app.post("/tts")
async def tts_endpoint(text: str = Form(...), voice_gender: str = Form("female"), language: str = Form("en")):
    """Convert text to speech"""
    audio_data = await text_to_speech(text, voice_gender, language)

    return StreamingResponse(
        BytesIO(audio_data),
        media_type="audio/mpeg",
        headers={"Content-Disposition": "attachment; filename=speech.mp3"}
    )

if __name__ == "__main__":
    # Check API keys
    if not os.getenv("GROQ_API_KEY"):
        print("GROQ_API_KEY environment variable not set!")
        sys.exit(1)

    if not os.getenv("ELEVENLABS_API_KEY"):
        print("ELEVENLABS_API_KEY environment variable not set!")
        sys.exit(1)

    print("🚀 Starting Fintech Training API...")
    print("📊 Session management: ✓")
    print("🎭 Persona system: ✓")
    print("📱 Product catalog: ✓")
    print("🎤 Voice processing: ✓")
    print("📈 Analytics: ✓")
    print("🌐 WebSocket support: ✓")

    uvicorn.run(app, host="0.0.0.0", port=5000)
