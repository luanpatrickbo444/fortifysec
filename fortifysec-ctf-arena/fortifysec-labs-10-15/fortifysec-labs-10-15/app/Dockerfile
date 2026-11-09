FROM python:3.12-slim
WORKDIR /app
RUN groupadd -r lab && useradd -r -g lab lab
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
USER lab
EXPOSE 8080
CMD ["python","main.py"]
