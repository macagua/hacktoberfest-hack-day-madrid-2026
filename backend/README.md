# TTS API — FastAPI + ElevenLabs

## Instalar

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

# Actualiza el archivo .env

Actualiza el archivo .env y pon tu ELEVENLABS_API_KEY

```bash
nano .env
```

## Ejecutar

```bash
uvicorn main:app --reload
```

## Probar

```bash
# health check
curl localhost:8000/health

# texto a voz (guarda audio)
curl -X POST localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hola, esto es una prueba."}' \
  -o salida.mp3
```

## Probar health check

```bash
curl localhost:8000/health
```

## Probar de texto a voz (guarda audio)

```bash
curl -X POST localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hola, esto es una prueba."}' \
  -o salida.mp3
```

## Probar de voz a texto (genera texto)

```bash
curl -X POST localhost:8000/stt \
  -F "file=@salida.mp3;type=audio/mpeg" \
  -s | python3 -m json.tool
```

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `ELEVENLABS_API_KEY` | API key de ElevenLabs (obligatoria) | — |
| `ELEVENLABS_VOICE_ID` | ID de voz | `JBFqnCBsd6RMkjVDRZzb` |
| `ELEVENLABS_MODEL_ID` | Modelo | `eleven_v4` |
