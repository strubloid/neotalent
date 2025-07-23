#!/bin/sh

echo "Starting SSH daemon..."
/usr/sbin/sshd -D &

echo "Starting Node.js application..."
exec su-exec nextjs:nodejs node dist/server.js
