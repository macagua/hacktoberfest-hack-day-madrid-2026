"""Configuración leída de variables de entorno (ver .env.example)."""

import os
from dataclasses import dataclass, field


def _load_dotenv(path: str = ".env") -> None:
    """Carga un .env sencillo sin dependencias extra (KEY=VALUE por línea)."""
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()


@dataclass(frozen=True)
class Settings:
    github_token: str | None = field(default_factory=lambda: os.getenv("GITHUB_TOKEN") or None)
    github_api_url: str = field(default_factory=lambda: os.getenv("GITHUB_API_URL", "https://api.github.com"))

    elevenlabs_api_key: str | None = field(default_factory=lambda: os.getenv("ELEVENLABS_API_KEY") or None)
    # "George", voz prediseñada multilingüe de ElevenLabs. Cámbiala por la que queráis.
    elevenlabs_voice_id: str = field(default_factory=lambda: os.getenv("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb"))
    # Voz específica por estilo (opcional). Si no se define, se usa ELEVENLABS_VOICE_ID.
    elevenlabs_voice_by_style: dict[str, str] = field(
        default_factory=lambda: {
            style: v
            for style in ("radio", "futbol", "documental", "neutro")
            if (v := os.getenv(f"ELEVENLABS_VOICE_ID_{style.upper()}"))
        }
    )
    elevenlabs_model_id: str = field(default_factory=lambda: os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2"))
    elevenlabs_output_format: str = field(default_factory=lambda: os.getenv("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128"))

    cors_origins: list[str] = field(
        default_factory=lambda: [
            o.strip()
            for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
            if o.strip()
        ]
    )

    def voice_for(self, style: str) -> str:
        return self.elevenlabs_voice_by_style.get(style, self.elevenlabs_voice_id)


def get_settings() -> Settings:
    return Settings()
