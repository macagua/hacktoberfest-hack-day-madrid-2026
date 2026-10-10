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
    elevenlabs_model_id: str = field(default_factory=lambda: os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2"))
    elevenlabs_output_format: str = field(default_factory=lambda: os.getenv("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128"))

    gemma_base_url: str = field(default_factory=lambda: os.getenv("GEMMA_BASE_URL", "https://bubbly-vermilion.netbird.apps.buildinmadrid.dev/v1"))
    gemma_model_id: str = field(default_factory=lambda: os.getenv("GEMMA_MODEL_ID", "gemma-4-26b-a4b"))
    gemma_api_key: str | None = field(default_factory=lambda: os.getenv("GEMMA_API_KEY") or None)

    cors_origins: list[str] = field(
        default_factory=lambda: [
            o.strip()
            for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
            if o.strip()
        ]
    )


def get_settings() -> Settings:
    return Settings()
