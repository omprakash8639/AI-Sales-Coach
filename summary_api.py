from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
import requests

# Gemini API Key
GEMINI_API_KEY = "AIzaSyCLDofGCx6BNMeMbrF0FiDTPJhzlUMSoBs"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_video_id(youtube_url):
    query = urlparse(youtube_url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    if query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            return parse_qs(query.query)['v'][0]
    return None

def fetch_transcript_text(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        for transcript in transcript_list:
            try:
                data = transcript.fetch()
                return " ".join([entry.text for entry in data])
            except:
                continue
        return None
    except Exception as e:
        return None

def summarize_with_gemini(transcript_text, language):
    prompt = (
        f"The following is a YouTube video transcript, possibly in Hindi or another language. "
        f"Provide a concise summary in {language}:\n\n{transcript_text},Give the summery in points and add additional rellavent information, Dont use any special characters "
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    response = requests.post(GEMINI_URL, json=payload, headers={"Content-Type": "application/json"})

    if response.status_code == 200:
        return response.json()['candidates'][0]['content']['parts'][0]['text']
    else:
        return f"Gemini API error: {response.status_code} - {response.text}"

@app.post("/summarize/")
async def summarize(request: Request):
    data = await request.json()
    video_url = data.get("videoUrl")
    language = data.get("language", "English")

    video_id = video_url
    if not video_id:
        return {"status": "fail", "message": "Invalid video URL."}

    transcript = fetch_transcript_text(video_id)
    if not transcript:
        return {"status": "fail", "message": "No transcript available."}

    summary = summarize_with_gemini(transcript, language)
    return {"status": "success", "summary": summary}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)