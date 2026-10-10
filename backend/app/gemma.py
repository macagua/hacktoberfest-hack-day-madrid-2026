"""Síntesis de guion narrativo con Gemma 4 vía API OpenAI-compatible."""

import json

import httpx

from .config import Settings

_SYSTEM_PROMPT = """\
Eres un asistente técnico y locutor experto de desarrollo de software.
Tu misión es redactar un guion en prosa conversacional en español para ser LEÍDO EN VOZ ALTA por un sistema de síntesis de voz (Text-to-Speech).

REGLAS DE ORO:
1. No uses NINGÚN tipo de formato markdown (nada de asteriscos, almohadillas, viñetas, guiones ni URLs). Escribe únicamente párrafos de texto continuo.
2. Escribe todos los números de PR en texto: escribe "el pull request cuarenta y dos" y NUNCA "#42".
3. Pronuncia las siglas en español natural: usa "integración continua" en vez de "CI", "pruebas" en vez de "tests unitarios con error 500", y "pull request" en lugar de "PR".
4. Si hay más de 3 pull requests en los datos, aplica la regla de los 3 principales: explica en detalle los 2 o 3 más críticos (con fallos de integración continua, bloqueos o muchas discusiones) y resume los demás en una frase cuantitativa general.
5. Si no hay pull requests en los datos, explica amablemente que el repositorio está al día sin incidencias.
6. La longitud total debe ser de entre 150 y 250 palabras.\
"""

_USER_TEMPLATE = """\
Pregunta original del usuario:
"{transcription}"

Datos crudos de GitHub:
{github_json}

Por favor, redacta el guion narrativo que responda directamente a la pregunta del usuario basándote en los datos anteriores.\
"""


class GemmaError(Exception):
    pass


async def synthesize_speech_script(
    transcription: str,
    github_data: dict,
    settings: Settings,
) -> str:
    user_prompt = _USER_TEMPLATE.format(
        transcription=transcription,
        github_json=json.dumps(github_data, ensure_ascii=False, indent=2),
    )
    payload = {
        "model": settings.gemma_model_id,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": 512,
        "temperature": 0.7,
    }
    headers = {"Content-Type": "application/json"}
    if settings.gemma_api_key:
        headers["Authorization"] = f"Bearer {settings.gemma_api_key}"

    url = settings.gemma_base_url.rstrip("/") + "/chat/completions"
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                raise GemmaError(f"Gemma API error {response.status_code}: {response.text[:200]}")
            data = response.json()
    except GemmaError:
        raise
    except Exception as exc:
        raise GemmaError(f"Gemma falló: {exc}") from exc

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as exc:
        raise GemmaError(f"Respuesta inesperada de Gemma: {data}") from exc
