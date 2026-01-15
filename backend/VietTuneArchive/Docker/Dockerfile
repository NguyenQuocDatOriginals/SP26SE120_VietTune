FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libaudiofile-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN python -m pip install --upgrade pip

RUN pip install --no-cache-dir essentia

RUN pip install --no-cache-dir \
    flask \
    librosa \
    scikit-learn

COPY essentia_api.py /app/

EXPOSE 5000

CMD ["python", "essentia_api.py"]
