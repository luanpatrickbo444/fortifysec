FROM python:3.12-slim
WORKDIR /app
COPY app.py manifest.json ./
RUN useradd -u 10001 -m lab
USER lab
EXPOSE 8080
CMD ["python","app.py"]
