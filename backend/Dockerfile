# backend/Dockerfile
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir gunicorn

COPY . .

RUN mkdir -p /var/lib/weather && \
    useradd -ms /bin/bash appuser && \
    chown -R appuser:appuser /var/lib/weather /app
USER appuser

EXPOSE 5000
CMD ["gunicorn","-w","1","-k","gthread","--threads","4","--timeout","60","-b","0.0.0.0:5000","app:app"]
