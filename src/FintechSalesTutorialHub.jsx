import React, { useState, useEffect } from 'react';
import { Play, Clock, TrendingUp, Star, ChevronRight, Target, DollarSign, Users, Award, BarChart3, Briefcase, Trophy, Zap, FileText, Globe, ChevronDown } from 'lucide-react';
import YouTube from 'react-youtube';

const fetchVideoSummary = async (videoUrl, selectedLanguage, setLoading, setSummary) => {
  try {
    setLoading(true);

    const response = await fetch("http://localhost:8000/summarize/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoUrl, language: selectedLanguage }),
    });

    const data = await response.json();

    if (data.status === "success") {
      setSummary(data.summary);
    } else {
      setSummary(data.message || "Failed to generate summary.");
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
    setSummary("Failed to generate summary.");
  } finally {
    setLoading(false);
  }
};


const FintechSalesTutorialHub = () => {
  const [selectedVideo, setSelectedVideo] = useState({
    id: 1,
    title: "Credit Card Vs Debit Card",
    videoUrl: "zTn0EO3dzjs",
    duration: "18:45",
    completions: "847",
    rating: 4.9,
    roi: "+32%"
  });

  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [showSummary, setShowSummary] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'tamil', name: 'Tamil', flag: '🇮🇳' },
    { code: 'telugu', name: 'Telugu', flag: '🇮🇳' },
    { code: 'bengali', name: 'Bengali', flag: '🇮🇳' },
    { code: 'marathi', name: 'Marathi', flag: '🇮🇳' }
  ];

  useEffect(() => {
    const fetchSummary = async () => {
      await fetchVideoSummary(selectedVideo.videoUrl, selectedLanguage, setLoading, setSummary);
    };

    if (showSummary) {
      fetchSummary();
    }
  }, [selectedVideo.videoUrl, selectedLanguage, showSummary]);

  const tutorials = [
    {
      id: 1,
      title: "Credit Card Vs Debit Card",
      thumbnail: "https://img.youtube.com/vi/zTn0EO3dzjs/0.jpg",
      description: "Master sophisticated sales techniques specifically designed for fintech products and enterprise clients.",
      videoUrl: "zTn0EO3dzjs",
      duration: "18:45",
      completions: "847",
      rating: 4.9,
      level: "Expert",
      category: "Strategy",
      roi: "+32%",
      featured: true
    },
    {
      id: 2,
      title: "Advantages and Disadvantages of Credit Card",
      thumbnail: "https://img.youtube.com/vi/3ApIk3wDHa4/0.jpg",
      description: "Navigate complex financial regulations while maximizing sales opportunities and maintaining compliance.",
      videoUrl: "3ApIk3wDHa4",
      duration: "22:30",
      completions: "652",
      rating: 4.8,
      level: "Advanced",
      category: "Compliance",
      roi: "+28%"
    },
    {
      id: 3,
      title: "Know Your Credit Card",
      thumbnail: "https://img.youtube.com/vi/ihkggPfRkz0/0.jpg",
      description: "Proven methodologies for securing high-value enterprise contracts in the financial technology sector.",
      videoUrl: "ihkggPfRkz0",
      duration: "25:15",
      completions: "723",
      rating: 4.9,
      level: "Expert",
      category: "Enterprise",
      roi: "+45%"
    },
    {
      id: 4,
      title: "Various Charges on Your Credit Card",
      thumbnail: "https://img.youtube.com/vi/8xGNDyw9FGs/0.jpg",
      description: "Present complex fintech solutions with confidence using technical demonstrations that close deals.",
      videoUrl: "8xGNDyw9FGs",
      duration: "20:12",
      completions: "534",
      rating: 4.7,
      level: "Advanced",
      category: "Technical",
      roi: "+38%"
    },
    {
      id: 5,
      title: "Tips for Smart Use of Credit Card",
      thumbnail: "https://img.youtube.com/vi/5AmZfRbBlqI/0.jpg",
      description: "Turn risk concerns into competitive advantages when selling financial technology solutions.",
      videoUrl: "5AmZfRbBlqI",
      duration: "16:40",
      completions: "612",
      rating: 4.8,
      level: "Advanced",
      category: "Risk Management",
      roi: "+25%"
    }
  ];

  const performanceMetrics = [
    { icon: DollarSign, label: "Avg. Deal Size", value: "Rs.247K", trend: "+18%" },
    { icon: Target, label: "Close Rate", value: "68%", trend: "+12%" },
    { icon: TrendingUp, label: "Revenue Growth", value: "+127%", trend: "+8%" },
    { icon: Users, label: "Active Agents", value: "2,847", trend: "+24%" }
  ];

  const certifications = [
    { name: "Fintech Sales Professional", progress: 85, color: "from-emerald-500 to-teal-600" },
    { name: "Enterprise Solutions Expert", progress: 72, color: "from-blue-500 to-indigo-600" },
    { name: "Regulatory Compliance", progress: 94, color: "from-purple-500 to-violet-600" }
  ];

  const getLevelColor = (level) => {
    switch(level) {
      case 'Advanced': return { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' };
      case 'Expert': return { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' };
      default: return { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' };
    }
  };

  const getCurrentLanguageData = () => {
    return languages.find(lang => lang.code === selectedLanguage);
  };

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #0F172A, #1E293B, #000000)' }}>
      {/* Premium Header */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1), rgba(16, 185, 129, 0.1))' }}></div>
        <div style={{ position: 'relative', padding: '2rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '4rem', height: '4rem', background: 'linear-gradient(to right, #3B82F6, #A855F7, #10B981)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)' }}>
                    <Briefcase size={24} style={{ color: 'white' }} />
                  </div>
                  <div style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', width: '1.25rem', height: '1.25rem', backgroundColor: '#10B981', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={10} style={{ color: 'white' }} />
                  </div>
                </div>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, white, #D1D5DB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
                    Sales Mastery Hub
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#D1D5DB' }}>Elite training for financial technology sales professionals</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>Level 7</div>
                  <div style={{ fontSize: '0.75rem', color: '#34D399' }}>Sales Expert</div>
                </div>
                <div style={{ width: '3rem', height: '3rem', background: 'linear-gradient(to right, #10B981, #14B8A6)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={18} style={{ color: 'white' }} />
                </div>
              </div>
            </div>

            {/* Performance Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {performanceMetrics.map((metric, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2))', borderRadius: '0.75rem', filter: 'blur(8px)', opacity: 0 }} className="group-hover:opacity-100"></div>
                  <div style={{ position: 'relative', backgroundColor: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid rgba(51, 65, 85, 0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ width: '2rem', height: '2rem', background: 'linear-gradient(to right, #3B82F6, #A855F7)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <metric.icon size={16} style={{ color: 'white' }} />
                      </div>
                      <div style={{ color: '#34D399', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <TrendingUp size={10} />
                        {metric.trend}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>{metric.value}</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{metric.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Main Video Player */}
          <div>
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)', backdropFilter: 'blur(16px)', borderRadius: '1.5rem', padding: '2rem', border: '1px solid rgba(51, 65, 85, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <div style={{ aspectRatio: '16 / 9', backgroundColor: 'black', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(71, 85, 105, 0.2)' }}>
                  <YouTube videoId={selectedVideo.videoUrl} opts={opts} />
                </div>
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)', borderRadius: '0.75rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} style={{ color: 'white' }} />
                    <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>{selectedVideo.duration}</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.9)', backdropFilter: 'blur(4px)', borderRadius: '0.75rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={16} style={{ color: 'white' }} />
                    <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 'bold' }}>{selectedVideo.roi} ROI</span>
                  </div>
                </div>
              </div>

              {/* Language and Summary Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Language Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      backgroundColor: 'rgba(51, 65, 85, 0.4)',
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      transition: 'all 200ms',
                      color: 'white'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.5)';
                      e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.7)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.4)';
                      e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                    }}
                  >
                    <Globe size={18} style={{ color: '#818CF8' }} />
                    <span style={{ fontSize: '1.125rem' }}>{getCurrentLanguageData()?.flag}</span>
                    <span style={{ fontWeight: '500' }}>{getCurrentLanguageData()?.name}</span>
                    <ChevronDown size={16} style={{ color: '#94A3B8', transition: 'transform 200ms', transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>

                  {showLanguageDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '0.5rem',
                      width: '12rem',
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(71, 85, 105, 0.5)',
                      borderRadius: '0.75rem',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      zIndex: 50
                    }}>
                      {languages.map((language, index) => (
                        <button
                          key={language.code}
                          onClick={() => {
                            setSelectedLanguage(language.code);
                            setShowLanguageDropdown(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            textAlign: 'left',
                            transition: 'background-color 150ms, color 150ms',
                            borderTopLeftRadius: index === 0 ? '0.75rem' : '',
                            borderTopRightRadius: index === 0 ? '0.75rem' : '',
                            borderBottomLeftRadius: index === languages.length - 1 ? '0.75rem' : '',
                            borderBottomRightRadius: index === languages.length - 1 ? '0.75rem' : '',
                            backgroundColor: selectedLanguage === language.code ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            color: 'white'
                          }}
                          onMouseOver={(e) => {
                            if (selectedLanguage !== language.code) {
                              e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (selectedLanguage !== language.code) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <span style={{ fontSize: '1.125rem' }}>{language.flag}</span>
                          <span style={{ fontWeight: '500' }}>{language.name}</span>
                          {selectedLanguage === language.code && (
                            <div style={{ marginLeft: 'auto', width: '0.5rem', height: '0.5rem', backgroundColor: '#818CF8', borderRadius: '9999px' }}></div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Toggle Button */}
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(51, 65, 85, 0.4)', border: '1px solid rgba(71, 85, 105, 0.5)', borderRadius: '0.75rem', padding: '0.75rem 1rem', transition: 'all 200ms' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.5)'; e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.7)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.4)'; e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)'; }}
                >
                  <FileText size={18} style={{ color: '#818CF8' }} />
                  <span style={{ color: 'white', fontWeight: '500' }}>
                    {showSummary ? 'Hide Summary' : 'Show Summary'}
                  </span>
                  <ChevronDown size={16} style={{ color: '#94A3B8', transition: 'transform 200ms', transform: showSummary ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
              </div>

              {/* Expandable Summary */}
              {showSummary && (
                <div style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(51, 65, 85, 0.2)', backdropFilter: 'blur(4px)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(71, 85, 105, 0.3)', animation: 'slideInFromTop 0.3s ease-out' }}>
                  <style>
                    {`
                      @keyframes slideInFromTop {
                        0% {
                          transform: translateY(-0.5rem);
                          opacity: 0;
                        }
                        100% {
                          transform: translateY(0);
                          opacity: 1;
                        }
                      }
                    `}
                  </style>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '2rem', height: '2rem', background: 'linear-gradient(to right, #6366F1, #A855F7)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={16} style={{ color: 'white' }} />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white' }}>Video Summary</h3>
                    <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>({getCurrentLanguageData()?.name})</div>
                  </div>
                  <p style={{ color: '#D1D5DB', lineHeight: '1.625', fontSize: '0.875rem' }}>
                    {loading ? "Loading summary..." : summary || "No summary available."}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>{selectedVideo.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', color: '#94A3B8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} />
                    <span style={{ fontWeight: '500' }}>{selectedVideo.completions} completions</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={18} style={{ color: '#FBBF24', fill: '#FBBF24' }} />
                    <span style={{ fontWeight: '500' }}>{selectedVideo.rating}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={18} style={{ color: '#34D399' }} />
                    <span style={{ fontWeight: '500', color: '#34D399' }}>High Impact</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracking */}
              <div style={{ backgroundColor: 'rgba(51, 65, 85, 0.3)', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} style={{ color: '#FBBF24' }} />
                  Your Certifications Progress
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {certifications.map((cert, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'white', fontWeight: '500' }}>{cert.name}</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>{cert.progress}%</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: 'rgba(71, 85, 105, 0.3)', borderRadius: '9999px', height: '0.5rem' }}>
                        <div style={{ height: '0.5rem', borderRadius: '9999px', background: `linear-gradient(to right, #10B981, #06B6D4)`, width: `${cert.progress}%`, transition: 'width 1000ms ease-out' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Training Modules */}
            <div style={{ backgroundColor: 'rgba(51, 65, 85, 0.3)', backdropFilter: 'blur(16px)', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Target size={22} style={{ color: '#818CF8' }} />
                Elite Training Modules
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    onClick={() => setSelectedVideo(tutorial)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '1rem',
                      padding: '1rem',
                      transition: 'all 300ms',
                      border: selectedVideo.id === tutorial.id ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(71, 85, 105, 0.3)',
                      backgroundColor: selectedVideo.id === tutorial.id ? 'rgba(168, 85, 247, 0.1)' : 'rgba(51, 65, 85, 0.2)'
                    }}
                    onMouseOver={(e) => {
                      if (selectedVideo.id !== tutorial.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.3)';
                        e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedVideo.id !== tutorial.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={tutorial.thumbnail}
                          alt={tutorial.title}
                          style={{ width: '6rem', height: '4rem', objectFit: 'cover', borderRadius: '0.75rem' }}
                        />
                        {tutorial.featured && (
                          <div style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', width: '1.5rem', height: '1.5rem', background: 'linear-gradient(to right, #FBBF24, #F59E0B)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={12} style={{ color: 'white', fill: 'white' }} />
                          </div>
                        )}
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }} className="group-hover:opacity-100 transition-opacity">
                          <Play size={20} style={{ color: 'white' }} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white', fontSize: '0.625rem', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontWeight: '500' }}>
                          {tutorial.duration}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: selectedVideo.id === tutorial.id ? '#A855F7' : 'white' }}>
                            {tutorial.title}
                          </h4>
                          <ChevronRight size={16} style={{ color: selectedVideo.id === tutorial.id ? '#A855F7' : '#94A3B8' }} />
                        </div>

                        <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {tutorial.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.625rem', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontWeight: '500', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                              {tutorial.level}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#34D399', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              <TrendingUp size={12} />
                              {tutorial.roi}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#94A3B8', fontSize: '0.75rem' }}>
                              <Users size={12} />
                              {tutorial.completions}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Access Categories */}
            <div style={{ backgroundColor: 'rgba(51, 65, 85, 0.3)', backdropFilter: 'blur(16px)', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} style={{ color: '#C084FC' }} />
                Specializations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'Enterprise Sales', count: 12, color: 'from-blue-500 to-indigo-600' },
                  { name: 'Compliance & Risk', count: 8, color: 'from-purple-500 to-violet-600' },
                  { name: 'Technical Demos', count: 6, color: 'from-emerald-500 to-teal-600' },
                  { name: 'Client Relations', count: 10, color: 'from-orange-500 to-red-600' }
                ].map((category, index) => (
                  <button
                    key={index}
                    style={{
                      width: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(51, 65, 85, 0.2)',
                      border: '1px solid rgba(71, 85, 105, 0.3)',
                      transition: 'all 300ms'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${category.color.split(' ').join(',')})`, opacity: 0, transition: 'opacity 300ms' }} className="group-hover:opacity-10"></div>
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', background: `linear-gradient(to right, ${category.color.split(' ').join(',')})` }}></div>
                        <span style={{ color: 'white', fontWeight: '500' }}>{category.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>{category.count}</span>
                        <ChevronRight size={14} style={{ color: '#94A3B8' }} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FintechSalesTutorialHub;
