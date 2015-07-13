#!/bin/bash
mongo encounter-react --eval "db.dropDatabase()"
mongorestore db.backup
