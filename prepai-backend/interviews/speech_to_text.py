import whisper


# Load the model only once
model = whisper.load_model("tiny")


def transcribe_audio(audio_path):
    result = model.transcribe(audio_path)
    return result["text"]
