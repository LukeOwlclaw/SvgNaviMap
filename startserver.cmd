@echo off
netstat -aon | find "127.0.0.1:8888         0.0.0.0:0" > NUL

IF %ERRORLEVEL% EQU 0 (
  echo Port 8888 seems to be in use. Abort starting server.
  goto end
) ELSE (
  echo Port 8888 is available. Continue...
)

IF %PROCESSOR_ARCHITECTURE%==x86 (
    echo Starting node.js 32 bit...
    start bin/node-x86 webserver.js
) ELSE (
  echo Starting node.js 64 bit...
    start bin/node webserver.js
)

echo Opening webinterface in default browser...
start http://localhost:8888/

:end