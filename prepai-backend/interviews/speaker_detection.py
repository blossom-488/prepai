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
            token=hf_token
        )

    return _pipeline


def detect_multiple_speakers(audio_path):
    """
    Detect whether more than one person is speaking
    in the uploaded interview audio.

    Returns:
        True  -> multiple speakers detected
        False -> only one speaker detected
    """

    pipeline = get_pipeline()

    # Run speaker diarization
    output = pipeline(audio_path)

    # Store unique speaker labels
    speakers = set()

    # Community-1 returns speaker annotations
    annotation = output.speaker_diarization

    for segment, _, speaker in annotation.itertracks(
        yield_label=True
    ):
        speakers.add(speaker)

    print("Detected speakers:", speakers)
    print("Number of speakers:", len(speakers))

    return len(speakers) > 1
