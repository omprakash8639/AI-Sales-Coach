import requests
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from urllib.parse import urlparse, parse_qs

# Gemini API key
API_KEY = "AIzaSyCLDofGCx6BNMeMbrF0FiDTPJhzlUMSoBs"  # Replace with your Gemini API key
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

headers = {
    "Content-Type": "application/json"
}

def extract_video_id(youtube_url):
    query = urlparse(youtube_url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    if query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            return parse_qs(query.query)['v'][0]
    return None

def fetch_transcript(video_url):
    video_id = extract_video_id(video_url)
    try:
        # Get list of all transcripts (manual or auto-generated)
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        # Use the first available transcript, even if it's not English
        for transcript in transcript_list:
            try:
                data = transcript.fetch()
                print(f"Using transcript in language: {transcript.language_code}")
                return data
            except Exception as e:
                print(f"Skipping transcript {transcript.language_code}: {e}")
        return None
    except Exception as e:
        print("Transcript error:", e)
        return None

def summarize_transcript(transcript):
    full_text = " ".join([entry.text for entry in transcript])
    prompt = (
        "The following is a YouTube video transcript, possibly in Hindi. "
        "Please translate and summarize it in English:\n\n"
        f"{full_text}"
    )

    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    response = requests.post(API_URL, headers=headers, json=body)

    if response.status_code == 200:
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    else:
        print("Gemini API Error:", response.status_code, response.text)
        return "Failed to generate summary."

# --- Main logic ---
video_url = "https://www.youtube.com/watch?v=zTn0EO3dzjs"
transcript = fetch_transcript(video_url)

if transcript:
    summary = summarize_transcript(transcript)
else:
    summary = "No transcript available."

print("Summary:\n", summary)

