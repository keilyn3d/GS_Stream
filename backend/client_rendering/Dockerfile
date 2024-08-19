FROM python:3.7.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc

COPY requirements.txt requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV GS_HOST=0.0.0.0
ENV GS_DEBUG=true

CMD ["python", "run.py"]
