"""Texto a voz con el SDK oficial de ElevenLabs (cliente asíncrono)."""

from elevenlabs.client import AsyncElevenLabs

from .config import Settings

MIME_BY_PREFIX = {
    "mp3": "audio/mpeg",
    "opus": "audio/ogg",
    "wav": "audio/wav",
    "pcm": "audio/L16",
}


class VoiceError(Exception):
    pass


def mime_for(output_format: str) -> str:
    return MIME_BY_PREFIX.get(output_format.split("_")[0], "application/octet-stream")


async def synthesize(text: str, settings: Settings, lang: str = "es") -> bytes:
    if not settings.elevenlabs_api_key:
        raise VoiceError("Falta ELEVENLABS_API_KEY")
    client = AsyncElevenLabs(api_key=settings.elevenlabs_api_key)
    kwargs = {}
    # Solo algunos modelos aceptan forzar el idioma; multilingual_v2 lo detecta solo.
    if settings.elevenlabs_model_id.startswith(
        ("eleven_flash_v2_5", "eleven_turbo_v2_5")
    ):
        kwargs["language_code"] = lang
    chunks: list[bytes] = []
    try:
        async for chunk in client.text_to_speech.convert(
            voice_id=settings.elevenlabs_voice_id,
            text=text,
            model_id=settings.elevenlabs_model_id,
            output_format=settings.elevenlabs_output_format,
            **kwargs,
        ):
            chunks.append(chunk)
    except Exception as exc:  # el SDK lanza ApiError y errores de red
        raise VoiceError(f"ElevenLabs falló: {exc}") from exc
    return b"".join(chunks)
