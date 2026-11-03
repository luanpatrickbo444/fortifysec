ARG CTFD_IMAGE=ctfd/ctfd:latest
FROM ${CTFD_IMAGE}

USER root

COPY branding/fortifysec.css /tmp/fortifysec.css
COPY branding/fortifysec.js /tmp/fortifysec.js
COPY branding/install_theme.py /tmp/install_theme.py

RUN python /tmp/install_theme.py && \
    rm -f /tmp/install_theme.py \
          /tmp/fortifysec.css \
          /tmp/fortifysec.js

# FortifySec Challenges V4 — preserves CTFd's original challenge handlers
USER root
COPY branding/challenges-v4.css /tmp/challenges-v4.css
COPY branding/challenges-v4.js /tmp/challenges-v4.js
COPY branding/install_challenges.py /tmp/install_challenges.py
RUN python /tmp/install_challenges.py && rm -f /tmp/challenges-v4.css /tmp/challenges-v4.js /tmp/install_challenges.py
USER ctfd

# FortifySec Challenges V5 - load after prior theme customizations
USER root
COPY branding/challenges-v5.css /tmp/challenges-v5.css
COPY branding/challenges-v5.js /tmp/challenges-v5.js
COPY branding/install_v5.py /tmp/install_v5.py
RUN python /tmp/install_v5.py && rm -f /tmp/challenges-v5.css /tmp/challenges-v5.js /tmp/install_v5.py
USER ctfd

# FortifySec Challenges V6 — after existing theme customizations
USER root
COPY branding/challenges-v6.css /tmp/challenges-v6.css
COPY branding/challenges-v6.js /tmp/challenges-v6.js
COPY branding/install_v6.py /tmp/install_v6.py
RUN python /tmp/install_v6.py && rm -f /tmp/challenges-v6.css /tmp/challenges-v6.js /tmp/install_v6.py
USER ctfd

# FORTIFYSEC-RANKING-V7-DOCKER
USER root
COPY branding/scoreboard-v7.css /tmp/fs-ranking-v7.css
COPY branding/scoreboard-v7.js /tmp/fs-ranking-v7.js
COPY branding/apply_ranking_v7.py /tmp/fs-apply-ranking-v7.py
RUN python /tmp/fs-apply-ranking-v7.py && rm -f /tmp/fs-ranking-v7.css /tmp/fs-ranking-v7.js /tmp/fs-apply-ranking-v7.py
USER ctfd
