import os

from pyannote.audio import Pipeline


# ============================================================
# Speaker Detection
# ============================================================

_pipeline = None


def get_pipeline():
    """
    Load the speaker diarization model only once.
    """

    global _pipeline

    if _pipeline is None:

        hf_token = os.getenv("HF_TOKEN")

        if not hf_token:
            raise RuntimeError(
                "HF_TOKEN environment variable is not configured."
            )

        _pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-community-1",
            token=hf_token,
        )

    return _pipeline


def detect_multiple_speakers(audio_path):
    """
    Detect whether two different speakers are speaking
    simultaneously in the uploaded interview audio.

    Returns:
        True  -> overlapping voices detected
        False -> no overlapping voices detected
    """

    pipeline = get_pipeline()

    # Run speaker diarization
    output = pipeline(audio_path)

    # Community-1 speaker diarization annotation
    annotation = output.speaker_diarization

    # Store all detected speaker segments
    segments = []

    for segment, _, speaker in annotation.itertracks(
        yield_label=True
    ):
        segments.append(
            {
                "start": segment.start,
                "end": segment.end,
                "speaker": speaker,
            }
        )

    print("Detected speaker segments:", segments)

    # --------------------------------------------------------
    # Check whether DIFFERENT speakers overlap
    # --------------------------------------------------------

    overlap_found = False
    overlap_seconds = 0.0

    for i in range(len(segments)):

        current = segments[i]

        for j in range(i + 1, len(segments)):

            other = segments[j]

            # Same speaker is not considered multiple voices
            if current["speaker"] == other["speaker"]:
                continue

            # Calculate overlap between the two segments
            overlap_start = max(
                current["start"],
                other["start"],
            )

            overlap_end = min(
                current["end"],
                other["end"],
            )

            overlap = overlap_end - overlap_start

            # Require at least 0.25 seconds of overlap
            # to avoid tiny diarization boundary errors.
            if overlap >= 0.25:

                overlap_found = True
                overlap_seconds += overlap

                print(
                    "⚠️ Overlapping voices detected:"
                )
                print(
                    "Speaker 1:",
                    current["speaker"],
                    current["start"],
                    current["end"],
                )
                print(
                    "Speaker 2:",
                    other["speaker"],
                    other["start"],
                    other["end"],
                )
                print(
                    "Overlap:",
                    round(overlap, 2),
                    "seconds",
                )

    print(
        "Total overlapping speech:",
        round(overlap_seconds, 2),
        "seconds",
    )

    if overlap_found:
        print("❌ Multiple voices detected.")
    else:
        print("✅ No simultaneous voices detected.")

    return overlap_found
