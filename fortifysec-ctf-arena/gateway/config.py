import os

GATEWAY_HOST = "127.0.0.1"
GATEWAY_PORT = 19090

MANAGER_SOCKET = "/run/fortifysec-labs/manager.sock"
GATEWAY_KEY_FILE = "/etc/fortifysec-labs/gateway.key"

REQUEST_TIMEOUT = 10
MAX_RESPONSE_SIZE = 10 * 1024 * 1024

DEBUG = False

# Comunicação interna com o CTFd
GATEWAY_SOCKET = "/run/fortifysec-labs/gateway.sock"
