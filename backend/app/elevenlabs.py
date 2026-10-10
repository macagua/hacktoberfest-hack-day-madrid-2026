import os
import sys
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from elevenlabs.client import ElevenLabs

load_dotenv()

api_key = os.getenv("ELEVENLABS_API_KEY")
if not api_key:
    sys.exit("ERROR: ELEVENLABS_API_KEY not set. Add it to .env before starting.")

voice_id_default = os.getenv("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
model_id = os.getenv("ELEVENLABS_MODEL_ID", "eleven_v4")

client = ElevenLabs(api_key=api_key)
app = FastAPI(title="TTS API")


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2500)
    voice_id: str | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/tts")
def tts(req: TTSRequest):
    vid = req.voice_id or voice_id_default
    try:
        audio = client.text_to_speech.convert(
            text=req.text,
            voice_id=vid,
            model_id=model_id,
            output_format="mp3_44100_128",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    return StreamingResponse(audio, media_type="audio/mpeg")

@app.post("/stt")
async def stt(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    try:
        result = client.speech_to_text.convert(
            file=(file.filename or "audio", audio_bytes, file.content_type or "audio/mpeg"),
            model_id="scribe_v1",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    return {"text": result.text}
