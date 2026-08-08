#!/usr/bin/env python3
"""Transcribe one audio file with faster-whisper. Prints JSON to stdout."""

from __future__ import annotations

import argparse
import json
import sys


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser()
    parser.add_argument("audio_path")
    parser.add_argument("--language", default="sk")
    parser.add_argument("--model", default="small", help="tiny|base|small|medium|…")
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--compute-type", default="int8")
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(
            json.dumps(
                {
                    "error": "faster-whisper not installed. Run: py -3 -m pip install faster-whisper"
                }
            ),
            file=sys.stderr,
        )
        return 2

    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)
    segments, info = model.transcribe(args.audio_path, language=args.language, beam_size=5)
    text = "".join(segment.text for segment in segments).strip()
    print(
        json.dumps(
            {
                "text": text,
                "language": info.language,
                "language_probability": info.language_probability,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
