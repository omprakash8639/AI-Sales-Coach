import React, { useState, useRef, useEffect } from "react";
import './index.css';
import {
  User,
  CreditCard,
  Shield,
  Home,
  Heart,
  Mic,
  MicOff,
  Settings,
  Play,
  BarChart3,
  Sparkles,
  Brain,
  Target,
  Zap,
} from "lucide-react";
import FintechSalesTutorialHub from './FintechSalesTutorialHub'; // Import the new component

const analyticsData = {
  totalSessions: 24,
  averageScore: 78,
  improvementRate: 12,
  totalHours: 18.5,
  weeklyGoal: 20,
  streak: 5,
  recentSessions: [
    {
      date: "Today",
      score: 85,
      product: "Credit Card",
      persona: "Young Professional",
      duration: "12:45",
      objections: 3,
      closingRate: 85,
    },
    {
      date: "Yesterday",
      score: 72,
      product: "Health Insurance",
      persona: "Retiree",
      duration: "15:30",
      objections: 5,
      closingRate: 60,
    },
    {
      date: "2 days ago",
      score: 91,
      product: "Life Insurance",
      persona: "Family Person",
      duration: "11:20",
      objections: 2,
      closingRate: 95,
    },
    {
      date: "3 days ago",
      score: 68,
      product: "Home Loan",
      persona: "Skeptical Veteran",
      duration: "18:15",
      objections: 7,
      closingRate: 45,
    },
  ],
  skillBreakdown: [
    {
      skill: "Opening",
      score: 85,
      improvement: "+8%",
      trend: "up",
      lastWeek: 77,
    },
    {
      skill: "Needs Assessment",
      score: 72,
      improvement: "+15%",
      trend: "up",
      lastWeek: 57,
    },
    {
      skill: "Product Knowledge",
      score: 90,
      improvement: "+5%",
      trend: "up",
      lastWeek: 85,
    },
    {
      skill: "Objection Handling",
      score: 65,
      improvement: "+20%",
      trend: "up",
      lastWeek: 45,
    },
    {
      skill: "Closing",
      score: 80,
      improvement: "+10%",
      trend: "up",
      lastWeek: 70,
    },
  ],
  monthlyProgress: [
    { month: "Oct", score: 65 },
    { month: "Nov", score: 71 },
    { month: "Dec", score: 78 },
    { month: "Jan", score: 82 },
  ],
  personaPerformance: [
    { persona: "Young Professional", sessions: 8, avgScore: 82, winRate: 75 },
    { persona: "Retiree", sessions: 6, avgScore: 74, winRate: 65 },
    { persona: "Family Person", sessions: 5, avgScore: 85, winRate: 80 },
    { persona: "Skeptical Veteran", sessions: 5, avgScore: 68, winRate: 55 },
  ],
  productPerformance: [
    { product: "Credit Card", sessions: 7, avgScore: 79, conversionRate: 71 },
    {
      product: "Health Insurance",
      sessions: 6,
      avgScore: 75,
      conversionRate: 67,
    },
    {
      product: "Life Insurance",
      sessions: 6,
      avgScore: 83,
      conversionRate: 78,
    },
    { product: "Home Loan", sessions: 5, avgScore: 72, conversionRate: 60 },
  ],
  achievements: [
    {
      title: "First Success",
      description: "Completed your first training session",
      unlocked: true,
    },
    {
      title: "Consistent Learner",
      description: "Train for 5 days in a row",
      unlocked: true,
    },
    {
      title: "Objection Master",
      description: "Handle 10 objections successfully",
      unlocked: true,
    },
    {
      title: "Sales Expert",
      description: "Achieve 90+ score in a session",
      unlocked: true,
    },
    {
      title: "Product Specialist",
      description: "Master all 4 products",
      unlocked: false,
    },
    {
      title: "Persona Whisperer",
      description: "Excel with all customer types",
      unlocked: false,
    },
  ],
};

const FintechTrainingApp = () => {
  const [activeTab, setActiveTab] = useState("configure");
  const [selectedPersona, setSelectedPersona] = useState("young-professional");
  const [selectedProduct, setSelectedProduct] = useState("credit-card");
  const [voiceGender, setVoiceGender] = useState("female");
  const [voiceTone, setVoiceTone] = useState("neutral");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState("medium");
  const [isTraining, setIsTraining] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("greeting");
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const websocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isConnected, setIsConnected] = useState(false);
  const [aiResponse, setAiResponse] = useState(
    "Hello, I received a call about some financial products. To be honest, I'm quite busy and not really interested in another sales pitch. What makes your offering different?"
  );
  const [realAnalytics, setRealAnalytics] = useState(analyticsData);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("female");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const audioRef = useRef(null);

  const personas = [
    {
      id: "young-professional",
      name: "Young Professional",
      age: "25-35",
      income: "Mid-High",
      icon: User,
      color: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      description: "Tech-savvy, ambitious, values efficiency",
    },
    {
      id: "retiree",
      name: "Retiree",
      age: "60+",
      income: "Fixed",
      icon: Heart,
      color: "linear-gradient(135deg, #10b981, #0d9488)",
      description: "Conservative, values security and stability",
    },
    {
      id: "family-oriented",
      name: "Family Person",
      age: "35-50",
      income: "Stable",
      icon: Home,
      color: "linear-gradient(135deg, #f97316, #dc2626)",
      description: "Protective, focused on family financial security",
    },
    {
      id: "skeptical-veteran",
      name: "Skeptical Veteran",
      age: "45-65",
      income: "High",
      icon: Shield,
      color: "linear-gradient(135deg, #64748b, #374151)",
      description: "Experienced, hard to convince, asks tough questions",
    },
  ];

  const products = [
    {
      id: "credit-card",
      name: "Platinum Credit Card",
      category: "Premium Cards",
      details: "2.5% cashback • No foreign fees • Premium rewards",
      icon: CreditCard,
      color: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      features: ["Cashback Rewards", "Travel Benefits", "Purchase Protection"],
    },
    {
      id: "health-insurance",
      name: "Comprehensive Health Plan",
      category: "Health Coverage",
      details: "Full coverage • Wellness programs • Digital consultations",
      icon: Shield,
      color: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      features: ["100% Coverage", "Preventive Care", "Mental Health"],
    },
    {
      id: "life-insurance",
      name: "Life Protection Plus",
      category: "Life Insurance",
      details: "Term & whole life • Investment component • Family protection",
      icon: Heart,
      color: "linear-gradient(135deg, #f43f5e, #ec4899)",
      features: ["Flexible Terms", "Investment Options", "Family Benefits"],
    },
    {
      id: "home-loan",
      name: "Smart Home Loan",
      category: "Property Finance",
      details: "Competitive rates • Fast approval • Digital process",
      icon: Home,
      color: "linear-gradient(135deg, #22c55e, #059669)",
      features: ["Low Interest", "Quick Processing", "Flexible EMI"],
    },
  ];

  const voiceOptions = {
    gender: [
      { id: "male", name: "Male", icon: "👨" },
      { id: "female", name: "Female", icon: "👩" },
      { id: "neutral", name: "Neutral", icon: "🤖" },
    ],
    tone: [
      { id: "neutral", name: "Neutral", emoji: "😐" },
      { id: "enthusiastic", name: "Enthusiastic", emoji: "😊" },
      { id: "skeptical", name: "Skeptical", emoji: "🤔" },
      { id: "friendly", name: "Friendly", emoji: "😄" },
      { id: "professional", name: "Professional", emoji: "💼" },
    ],
  };

  const difficultyLevels = [
    {
      id: "easy",
      name: "Beginner",
      color: "#22c55e",
      description: "Cooperative customer, basic objections",
    },
    {
      id: "medium",
      name: "Intermediate",
      color: "#eab308",
      description: "Moderate resistance, common objections",
    },
    {
      id: "hard",
      name: "Advanced",
      color: "#ef4444",
      description: "Challenging customer, complex objections",
    },
  ];

  const languages = [
    { id: "en", name: "English" },
    { id: "hi", name: "Hindi" },
    { id: "bn", name: "Bengali" },
    { id: "te", name: "Telugu" },
    { id: "mr", name: "Marathi" },
    { id: "ta", name: "Tamil" },
    { id: "ur", name: "Urdu" },
    { id: "gu", name: "Gujarati" },
    { id: "kn", name: "Kannada" },
    { id: "or", name: "Odia" },
    { id: "pa", name: "Punjabi" },
  ];

  const connectWebSocket = (sessionId) => {
    if (!sessionId) {
      console.error("Cannot connect WebSocket: sessionId is null");
      return;
    }

    const wsUrl = `wss://bfce-2409-408c-1ec9-75e9-e121-c068-bf1b-c95b.ngrok-free.app/ws/${sessionId}`;
    console.log("Connecting to WebSocket:", wsUrl);
    websocketRef.current = new WebSocket(wsUrl);

    websocketRef.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    websocketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        if (data.type === "listening_started") {
          console.log("Backend started listening");
        } else if (data.type === "listening_stopped") {
          console.log("Backend stopped listening");
        } else if (data.type === "transcription") {
          setConversation((prev) => [
            ...prev,
            { role: "user", content: data.text, timestamp: new Date() },
          ]);
        } else if (data.type === "ai_response") {
          if (data.transcript) {
            setConversation((prev) => [
              ...prev,
              { role: "user", content: data.transcript, timestamp: new Date() },
            ]);
          }

          setConversation((prev) => [
            ...prev,
            { role: "assistant", content: data.text, timestamp: new Date() },
          ]);

          generateAudioResponse(data.text);
        } else if (data.type === "error") {
          console.error("WebSocket error:", data.message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    websocketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const handleStartSession = async () => {
    try {
      const baseUrl =
        "https://bfce-2409-408c-1ec9-75e9-e121-c068-bf1b-c95b.ngrok-free.app";

      const payload = {
        persona: selectedPersona || "young-professional",
        product: selectedProduct || "credit-card",
        difficulty: difficulty || "easy",
        voiceSettings: {
          gender: voiceGender || "female",
          language: selectedLanguage || "en",
        },
      };

      console.log("📡 Sending POST to:", `${baseUrl}/session`);
      console.log("📦 Payload:", payload);

      const response = await fetch(`${baseUrl}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Session started:", data);

      if (data.success) {
        const newSessionId = data.sessionId;
        setSessionId(newSessionId);
        setConversation([
          {
            role: "assistant",
            content: data.initialResponse,
            timestamp: new Date(),
          },
        ]);
        setIsSessionActive(true);
        setActiveTab("practice");

        setTimeout(() => {
          connectWebSocket(newSessionId);
        }, 500);

        generateAudioResponse(data.initialResponse);
      } else {
        console.error("API returned success: false", data);
        alert("Backend failed to start session.");
      }
    } catch (error) {
      console.error("Failed to start session:", error.message);
      alert("Failed to start session. Check backend or network.");
    }
  };

  const initializeMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      streamRef.current = stream;

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("MediaRecorder stopped, processing audio...");
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          console.log("Audio blob created, size:", audioBlob.size);
          processAudioBlob(audioBlob);
          audioChunksRef.current = [];
        }
      };

      return mediaRecorderRef.current;
    } catch (error) {
      console.error("Failed to initialize media recorder:", error);
      alert(
        "Microphone access is required for voice training. Please allow microphone access and try again."
      );
    }
  };

  const processAudioBlob = async (audioBlob) => {
    if (
      !websocketRef.current ||
      websocketRef.current.readyState !== WebSocket.OPEN
    ) {
      console.error("WebSocket not connected");
      return;
    }

    console.log("Processing audio blob, size:", audioBlob.size);

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64data = reader.result.split(",")[1];

      try {
        websocketRef.current.send(
          JSON.stringify({
            type: "audio_chunk",
            audio: base64data,
            sessionId: sessionId,
          })
        );
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    };
  };

  const handleRecord = async () => {
    console.log("Handle record clicked, isRecording:", isRecording);
    console.log("WebSocket state:", websocketRef.current?.readyState);
    console.log("MediaRecorder state:", mediaRecorderRef.current?.state);

    if (!isRecording) {
      let currentRecorder = mediaRecorderRef.current;

      if (!currentRecorder || currentRecorder.state === "inactive") {
        console.log("Initializing media recorder...");
        currentRecorder = await initializeMediaRecorder();
        if (!currentRecorder) return;
      }

      setIsRecording(true);

      stopAudio();

      if (
        websocketRef.current &&
        websocketRef.current.readyState === WebSocket.OPEN
      ) {
        console.log("Sending start_listening to WebSocket");
        websocketRef.current.send(
          JSON.stringify({
            type: "start_listening",
            sessionId: sessionId,
          })
        );
      } else {
        console.log("WebSocket not ready for start_listening");
      }

      if (currentRecorder && currentRecorder.state === "inactive") {
        console.log("Starting recording...");
        audioChunksRef.current = [];
        currentRecorder.start(1000);
      }
    } else {
      console.log("Stopping recording...");
      setIsRecording(false);

      stopAudio();

      if (
        websocketRef.current &&
        websocketRef.current.readyState === WebSocket.OPEN
      ) {
        console.log("Sending stop_listening to WebSocket");
        websocketRef.current.send(
          JSON.stringify({
            type: "stop_listening",
            sessionId: sessionId,
          })
        );
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        console.log("Stopping media recorder...");
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const generateAudioResponse = async (text) => {
    try {
      const baseUrl =
        "https://bfce-2409-408c-1ec9-75e9-e121-c068-bf1b-c95b.ngrok-free.app";

      const response = await fetch(`${baseUrl}/generate-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceSettings: { gender: selectedVoice, language: selectedLanguage },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          playAudio(data.audio);
        }
      }
    } catch (error) {
      console.error("Failed to generate audio:", error);
    }
  };

  const playAudio = (base64Audio) => {
    try {
      stopAudio();
      const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
      audioRef.current = audio;
      audio.play().catch((error) => {
        console.error("Failed to play audio:", error);
      });
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  };

  const practicePhases = [
    { id: "greeting", name: "Opening & Greeting", status: "completed" },
    { id: "needs", name: "Needs Assessment", status: "current" },
    { id: "presentation", name: "Product Presentation", status: "pending" },
    { id: "objections", name: "Handle Objections", status: "pending" },
    { id: "closing", name: "Closing & Follow-up", status: "pending" },
  ];

  const renderConfigureTab = () => (
    <>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            }}
          >
            <User size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Virtual Customer</h2>
            <p style={styles.subtitle}>Choose your challenge</p>
          </div>
        </div>
        {personas.map((persona) => {
          const IconComponent = persona.icon;
          const isSelected = selectedPersona === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona.id)}
              style={{
                ...styles.optionButton,
                ...(isSelected ? styles.selectedButton : {}),
              }}
            >
              <div style={{ ...styles.personaIcon, background: persona.color }}>
                <IconComponent size={28} color="white" />
              </div>
              <div style={styles.personaContent}>
                <div style={styles.personaName}>{persona.name}</div>
                <div style={styles.personaDescription}>
                  {persona.description}
                </div>
                <div style={styles.tags}>
                  <span style={styles.tag}>{persona.age}</span>
                  <span style={styles.tag}>{persona.income}</span>
                </div>
              </div>
              {isSelected && (
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    background: "#4ade80",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "white",
                      borderRadius: "50%",
                    }}
                  ></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #10b981, #0d9488)",
            }}
          >
            <Target size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Product Focus</h2>
            <p style={styles.subtitle}>Select what to pitch</p>
          </div>
        </div>
        {products.map((product) => {
          const IconComponent = product.icon;
          const isSelected = selectedProduct === product.id;
          return (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              style={{
                ...styles.optionButton,
                ...(isSelected ? styles.selectedButton : {}),
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  width: "100%",
                  marginBottom: isSelected ? "12px" : 0,
                }}
              >
                <div style={{ ...styles.personaIcon, background: product.color }}>
                  <IconComponent size={28} color="white" />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={styles.personaName}>{product.name}</div>
                  <div style={styles.personaDescription}>{product.details}</div>
                  <span
                    style={{
                      ...styles.tag,
                      background: isSelected
                        ? "rgba(255, 255, 255, 0.3)"
                        : "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {product.category}
                  </span>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      background: "#4ade80",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "white",
                        borderRadius: "50%",
                      }}
                    ></div>
                  </div>
                )}
              </div>
              {isSelected && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {product.features.map((feature, index) => (
                    <span
                      key={index}
                      style={{
                        ...styles.tag,
                        background: "rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #f97316, #ef4444)",
            }}
          >
            <Zap size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Challenge Level</h2>
            <p style={styles.subtitle}>Adjust difficulty</p>
          </div>
        </div>
        <div style={styles.difficultyGrid}>
          {difficultyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setDifficulty(level.id)}
              style={{
                ...styles.difficultyButton,
                ...(difficulty === level.id ? styles.selectedButton : {}),
              }}
            >
              <div style={{ ...styles.difficultyDot, background: level.color }}></div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                {level.name}
              </div>
              <div style={{ fontSize: "12px", color: "#c4b5fd" }}>
                {level.description}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.voiceToggle}>
          <div style={styles.cardHeader}>
            <div
              style={{
                ...styles.iconContainer,
                background: "linear-gradient(135deg, #ec4899, #f43f5e)",
              }}
            >
              {isVoiceEnabled ? (
                <Mic size={24} color="white" />
              ) : (
                <MicOff size={24} color="white" />
              )}
            </div>
            <div>
              <h2 style={styles.cardTitle}>Voice Experience</h2>
              <p style={styles.subtitle}>Customize AI personality</p>
            </div>
          </div>
          <div
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            style={{
              ...styles.toggleSwitch,
              background: isVoiceEnabled ? "#22c55e" : "#6b7280",
            }}
          >
            <div
              style={{
                ...styles.toggleHandle,
                transform: isVoiceEnabled ? "translateX(32px)" : "translateX(0)",
              }}
            ></div>
          </div>
        </div>
        {isVoiceEnabled && (
          <div>
            <h3
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              Voice Gender
            </h3>
            <div style={styles.voiceGrid}>
              {voiceOptions.gender.map((gender) => (
                <button
                  key={gender.id}
                  onClick={() => {
                    setVoiceGender(gender.id);
                    setSelectedVoice(gender.id);
                  }}
                  style={{
                    ...styles.voiceButton,
                    ...(voiceGender === gender.id ? styles.selectedButton : {}),
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    {gender.icon}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {gender.name}
                  </div>
                </button>
              ))}
            </div>
            <h3
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: "600",
                margin: "24px 0 12px",
              }}
            >
              Personality Tone
            </h3>
            <div style={styles.toneGrid}>
              {voiceOptions.tone.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setVoiceTone(tone.id)}
                  style={{
                    ...styles.voiceButton,
                    ...(voiceTone === tone.id ? styles.selectedButton : {}),
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>
                    {tone.emoji}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {tone.name}
                  </div>
                </button>
              ))}
            </div>
            <h3
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: "600",
                margin: "24px 0 12px",
              }}
            >
              Language
            </h3>
            <div style={styles.voiceGrid}>
              {languages.map((language) => (
                <button
                  key={language.id}
                  onClick={() => setSelectedLanguage(language.id)}
                  style={{
                    ...styles.voiceButton,
                    ...(selectedLanguage === language.id ? styles.selectedButton : {}),
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {language.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <button style={styles.startButton} onClick={handleStartSession}>
        <Play size={32} color="white" />
        <span>Start AI Training Session</span>
        <Sparkles size={24} color="white" />
      </button>
    </>
  );

  const renderPracticeTab = () => (
    <>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #22c55e, #059669)",
            }}
          >
            <Play size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Training Session</h2>
            <p style={styles.subtitle}>
              {personas.find((p) => p.id === selectedPersona)?.name} •{" "}
              {products.find((p) => p.id === selectedProduct)?.name}
            </p>
          </div>
        </div>
        <div style={{ marginBottom: "24px" }}>
          {practicePhases.map((phase, index) => (
            <div
              key={phase.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                marginBottom: "12px",
                borderRadius: "12px",
                background:
                  phase.status === "current"
                    ? "rgba(34, 197, 94, 0.2)"
                    : phase.status === "completed"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.05)",
                border:
                  phase.status === "current"
                    ? "2px solid #22c55e"
                    : "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background:
                    phase.status === "completed"
                      ? "#22c55e"
                      : phase.status === "current"
                      ? "#3b82f6"
                      : "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {phase.status === "completed" ? "✓" : index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: "16px",
                    marginBottom: "4px",
                  }}
                >
                  {phase.name}
                </div>
                <div
                  style={{
                    color:
                      phase.status === "current" ? "#4ade80" : "#9ca3af",
                    fontSize: "14px",
                    textTransform: "capitalize",
                  }}
                >
                  {phase.status === "current"
                    ? "In Progress"
                    : phase.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            }}
          >
            <Brain size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>AI Customer Interaction</h2>
            <p style={styles.subtitle}>Practice your pitch in real-time</p>
          </div>
        </div>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            minHeight: "200px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: personas.find((p) => p.id === selectedPersona)
                  ?.color,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={20} color="white" />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: "600" }}>
                {personas.find((p) => p.id === selectedPersona)?.name}
              </div>
              <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                Virtual Customer
              </div>
            </div>
          </div>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {conversation.length === 0 ? (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  padding: "16px",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "16px",
                  lineHeight: "1.5",
                }}
              >
                {aiResponse}
              </div>
            ) : (
              conversation.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    background:
                      msg.role === "user"
                        ? "rgba(59, 130, 246, 0.2)"
                        : "rgba(255, 255, 255, 0.1)",
                    padding: "16px",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "16px",
                    lineHeight: "1.5",
                    alignSelf:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginBottom: "4px",
                    }}
                  >
                    {msg.role === "user" ? "You" : "AI Customer"}
                  </div>
                  {msg.content}
                </div>
              ))
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => {
              setIsSessionActive(false);
              setActiveTab("configure");
              if (websocketRef.current) {
                websocketRef.current.close();
              }
            }}
            style={{
              flex: 1,
              padding: "16px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <MicOff size={20} />
            End Session
          </button>
          <button
            onClick={handleRecord}
            disabled={!isSessionActive}
            style={{
              flex: 2,
              padding: "16px",
              background: isRecording
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "linear-gradient(135deg, #22c55e, #059669)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: !isSessionActive ? 0.5 : 1,
            }}
          >
            <Mic size={20} />
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #eab308, #ca8a04)",
            }}
          >
            <Sparkles size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>AI Coaching Tips</h2>
            <p style={styles.subtitle}>Real-time guidance</p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {[
            "Acknowledge their time concern first",
            "Ask about their current financial goals",
            "Focus on value, not features",
            "Use their name if provided",
          ].map((tip, index) => (
            <div
              key={index}
              style={{
                padding: "12px 16px",
                background: "rgba(234, 179, 8, 0.2)",
                borderRadius: "12px",
                color: "#fbbf24",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#fbbf24",
                  borderRadius: "50%",
                }}
              ></div>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderVideoTutorialsTab = () => <FintechSalesTutorialHub />;

  const renderAnalyticsTab = () => (
    <>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
            }}
          >
            <BarChart3 size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Performance Dashboard</h2>
            <p style={styles.subtitle}>Your comprehensive training analytics</p>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "rgba(34, 197, 94, 0.2)",
              padding: "20px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#22c55e",
                marginBottom: "8px",
              }}
            >
              {realAnalytics.totalSessions}
            </div>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>
              Total Sessions
            </div>
          </div>
          <div
            style={{
              background: "rgba(59, 130, 246, 0.2)",
              padding: "20px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#3b82f6",
                marginBottom: "8px",
              }}
            >
              {analyticsData.averageScore}%
            </div>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>
              Average Score
            </div>
          </div>
          <div
            style={{
              background: "rgba(139, 92, 246, 0.2)",
              padding: "20px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#8b5cf6",
                marginBottom: "8px",
              }}
            >
              {analyticsData.totalHours}h
            </div>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>
              Training Hours
            </div>
          </div>
          <div
            style={{
              background: "rgba(244, 63, 94, 0.2)",
              padding: "20px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#f43f5e",
                marginBottom: "8px",
              }}
            >
              {analyticsData.streak}
            </div>
            <div style={{ color: "#9ca3af", fontSize: "14px" }}>Day Streak</div>
          </div>
        </div>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            Monthly Progress Trend
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "end",
              gap: "12px",
              height: "120px",
            }}
          >
            {analyticsData.monthlyProgress.map((month, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    background: `linear-gradient(to top, #3b82f6, #8b5cf6)`,
                    borderRadius: "8px 8px 4px 4px",
                    height: `${month.score}%`,
                    minHeight: "20px",
                    marginBottom: "8px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-25px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {month.score}%
                  </div>
                </div>
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {month.month}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #f97316, #ea5804)",
            }}
          >
            <Target size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Skill Analysis</h2>
            <p style={styles.subtitle}>Detailed performance breakdown</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {realAnalytics.skillBreakdown.map((skill, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      color: "white",
                      fontWeight: "600",
                      fontSize: "16px",
                    }}
                  >
                    {skill.skill}
                  </div>
                  <div
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background:
                        skill.trend === "up"
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(239, 68, 68, 0.2)",
                      color:
                        skill.trend === "up" ? "#22c55e" : "#ef4444",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {skill.improvement}
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "12px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${skill.lastWeek}%`,
                      height: "100%",
                      background: "rgba(255, 255, 255, 0.3)",
                      position: "absolute",
                    }}
                  ></div>
                  <div
                    style={{
                      width: `${skill.score}%`,
                      height: "100%",
                      background:
                        skill.score >= 80
                          ? "linear-gradient(90deg, #22c55e, #059669)"
                          : skill.score >= 60
                          ? "linear-gradient(90deg, #eab308, #ca8a04)"
                          : "linear-gradient(90deg, #ef4444, #dc2626)",
                      transition: "width 0.5s ease",
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "4px",
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  <span>Last week: {skill.lastWeek}%</span>
                  <span>Current: {skill.score}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #ec4899, #db2777)",
            }}
          >
            <User size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Customer Persona Analysis</h2>
            <p style={styles.subtitle}>Performance by customer type</p>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          {analyticsData.personaPerformance.map((persona, index) => (
            <div
              key={index}
              style={{
                padding: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  color: "white",
                  fontWeight: "600",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                {persona.persona}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                  {persona.sessions} sessions
                </span>
                <span
                  style={{
                    color:
                      persona.avgScore >= 80
                        ? "#22c55e"
                        : persona.avgScore >= 60
                        ? "#eab308"
                        : "#ef4444",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {persona.avgScore}%
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${persona.winRate}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                  }}
                ></div>
              </div>
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                {persona.winRate}% success rate
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #10b981, #059669)",
            }}
          >
            <CreditCard size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Product Performance</h2>
            <p style={styles.subtitle}>Success rates by product type</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {analyticsData.productPerformance.map((product, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "white",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  {product.product}
                </div>
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  {product.sessions} sessions • Avg score: {product.avgScore}%
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${product.conversionRate}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #22c55e, #059669)",
                    }}
                  ></div>
                </div>
              </div>
              <div style={{ marginLeft: "16px", textAlign: "right" }}>
                <div
                  style={{
                    color: "#22c55e",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  {product.conversionRate}%
                </div>
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "12px",
                  }}
                >
                  conversion
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            }}
          >
            <BarChart3 size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Recent Session Details</h2>
            <p style={styles.subtitle}>Comprehensive session breakdown</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {analyticsData.recentSessions.map((session, index) => (
            <div
              key={index}
              style={{
                padding: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                border:
                  index === 0
                    ? "2px solid rgba(34, 197, 94, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "white",
                      fontWeight: "600",
                      fontSize: "16px",
                      marginBottom: "4px",
                    }}
                  >
                    {session.product}
                  </div>
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "14px",
                    }}
                  >
                    {session.persona} • {session.date}
                  </div>
                </div>
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    background:
                      session.score >= 80
                        ? "rgba(34, 197, 94, 0.2)"
                        : session.score >= 60
                        ? "rgba(234, 179, 8, 0.2)"
                        : "rgba(239, 68, 68, 0.2)",
                    color:
                      session.score >= 80
                        ? "#22c55e"
                        : session.score >= 60
                        ? "#eab308"
                        : "#ef4444",
                    fontWeight: "bold",
                  }}
                >
                  {session.score}%
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "12px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#3b82f6",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {session.duration}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                    Duration
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "12px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#f97316",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {session.objections}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                    Objections
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "12px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color:
                        session.closingRate >= 70
                          ? "#22c55e"
                          : session.closingRate >= 50
                          ? "#eab308"
                          : "#ef4444",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {session.closingRate}%
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                    Closing Rate
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div
            style={{
              ...styles.iconContainer,
              background: "linear-gradient(135deg, #eab308, #ca8a04)",
            }}
          >
            <Sparkles size={24} color="white" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Achievements</h2>
            <p style={styles.subtitle}>Your training milestones</p>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}
        >
          {analyticsData.achievements.map((achievement, index) => (
            <div
              key={index}
              style={{
                padding: "16px",
                background: achievement.unlocked
                  ? "rgba(234, 179, 8, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                border: achievement.unlocked
                  ? "1px solid rgba(234, 179, 8, 0.3)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                opacity: achievement.unlocked ? 1 : 0.6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: achievement.unlocked ? "#eab308" : "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                  }}
                >
                  {achievement.unlocked ? "🏆" : "🔒"}
                </div>
                <div
                  style={{
                    color: achievement.unlocked ? "#fbbf24" : "#9ca3af",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  {achievement.title}
                </div>
              </div>
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "12px",
                }}
              >
                {achievement.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const styles = {
    container: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)",
      position: "relative",
      overflow: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    backgroundBlob1: {
      position: "absolute",
      top: "-160px",
      right: "-160px",
      width: "320px",
      height: "320px",
      background: "#8b5cf6",
      borderRadius: "50%",
      filter: "blur(60px)",
      opacity: 0.2,
      animation: "pulse 3s infinite",
    },
    backgroundBlob2: {
      position: "absolute",
      bottom: "-160px",
      left: "-160px",
      width: "320px",
      height: "320px",
      background: "#3b82f6",
      borderRadius: "50%",
      filter: "blur(60px)",
      opacity: 0.2,
      animation: "pulse 3s infinite 2s",
    },
    header: {
      position: "relative",
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    iconContainer: {
      width: "48px",
      height: "48px",
      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "white",
      margin: 0,
    },
    subtitle: {
      fontSize: "14px",
      color: "#c4b5fd",
      margin: 0,
    },
    statusIndicator: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    statusDot: {
      width: "12px",
      height: "12px",
      background: "#4ade80",
      borderRadius: "50%",
      animation: "pulse 2s infinite",
    },
    content: {
      position: "relative",
      padding: "24px",
      paddingBottom: "120px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    card: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "24px",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "24px",
    },
    cardTitle: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "white",
      margin: 0,
    },
    optionButton: {
      width: "100%",
      padding: "20px",
      borderRadius: "16px",
      border: "2px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(255, 255, 255, 0.05)",
      color: "white",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      textAlign: "left",
    },
    selectedButton: {
      border: "2px solid rgba(255, 255, 255, 0.4)",
      background: "rgba(255, 255, 255, 0.2)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      transform: "scale(1.02)",
    },
    personaIcon: {
      width: "56px",
      height: "56px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    },
    personaContent: {
      flex: 1,
    },
    personaName: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "4px",
    },
    personaDescription: {
      fontSize: "14px",
      color: "#c4b5fd",
      marginBottom: "8px",
    },
    tags: {
      display: "flex",
      gap: "8px",
    },
    tag: {
      background: "rgba(255, 255, 255, 0.2)",
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      color: "#e9d5ff",
    },
    difficultyGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
    },
    difficultyButton: {
      padding: "16px",
      borderRadius: "16px",
      border: "2px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(255, 255, 255, 0.05)",
      color: "white",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textAlign: "center",
    },
    difficultyDot: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      margin: "0 auto 8px",
    },
    voiceToggle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "24px",
    },
    toggleSwitch: {
      position: "relative",
      width: "64px",
      height: "32px",
      borderRadius: "20px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    toggleHandle: {
      position: "absolute",
      width: "24px",
      height: "24px",
      background: "white",
      borderRadius: "50%",
      top: "4px",
      transition: "transform 0.3s ease",
    },
    voiceGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
      marginBottom: "24px",
    },
    toneGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "12px",
    },
    voiceButton: {
      padding: "16px",
      borderRadius: "16px",
      border: "2px solid rgba(255, 255, 255, 0.1)",
      background: "rgba(255, 255, 255, 0.05)",
      color: "white",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textAlign: "center",
    },
    startButton: {
      width: "100%",
      background: "linear-gradient(135deg, #2563eb, #8b5cf6, #06b6d4)",
      color: "white",
      padding: "24px",
      borderRadius: "24px",
      border: "none",
      fontSize: "20px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      boxShadow: "0 25px 50px rgba(139, 92, 246, 0.3)",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    },
    bottomNav: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-around",
    },
    navButton: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      padding: "12px",
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.2)",
      color: "#60a5fa",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.4; }
          }
          button:hover {
            transform: translateY(-2px);
          }
        `}
      </style>
      <div style={styles.backgroundBlob1}></div>
      <div style={styles.backgroundBlob2}></div>
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <div style={styles.iconContainer}>
            <Brain size={24} color="white" />
          </div>
          <div>
            <h1 style={styles.title}>AI Sales Trainer</h1>
            <p style={styles.subtitle}>Master your pitch with virtual customers</p>
          </div>
        </div>
        <div style={styles.statusIndicator}>
          <div style={styles.statusDot}></div>
          <span
            style={{ color: "#4ade80", fontSize: "14px", fontWeight: "500" }}
          >
            AI Ready
          </span>
        </div>
      </div>
      <div style={styles.content}>
        {activeTab === "configure" && renderConfigureTab()}
        {activeTab === "practice" && renderPracticeTab()}
        {activeTab === "videoTutorials" && renderVideoTutorialsTab()}
        {activeTab === "analytics" && renderAnalyticsTab()}
      </div>
      <div style={styles.bottomNav}>
        <button
          onClick={() => setActiveTab("configure")}
          style={{
            ...styles.navButton,
            background:
              activeTab === "configure"
                ? "rgba(255, 255, 255, 0.2)"
                : "transparent",
            color:
              activeTab === "configure"
                ? "#60a5fa"
                : "rgba(255, 255, 255, 0.6)",
          }}
        >
          <Settings size={24} />
          <span>Configure</span>
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          style={{
            ...styles.navButton,
            background:
              activeTab === "practice"
                ? "rgba(255, 255, 255, 0.2)"
                : "transparent",
            color:
              activeTab === "practice"
                ? "#60a5fa"
                : "rgba(255, 255, 255, 0.6)",
          }}
        >
          <Play size={24} />
          <span>Practice</span>
        </button>
        <button
          onClick={() => setActiveTab("videoTutorials")}
          style={{
            ...styles.navButton,
            background:
              activeTab === "videoTutorials"
                ? "rgba(255, 255, 255, 0.2)"
                : "transparent",
            color:
              activeTab === "videoTutorials"
                ? "#60a5fa"
                : "rgba(255, 255, 255, 0.6)",
          }}
        >
          <Zap size={24} />
          <span>Video Tutorials</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          style={{
            ...styles.navButton,
            background:
              activeTab === "analytics"
                ? "rgba(255, 255, 255, 0.2)"
                : "transparent",
            color:
              activeTab === "analytics"
                ? "#60a5fa"
                : "rgba(255, 255, 255, 0.6)",
          }}
        >
          <BarChart3 size={24} />
          <span>Analytics</span>
        </button>
      </div>
    </div>
  );
};

export default FintechTrainingApp;
