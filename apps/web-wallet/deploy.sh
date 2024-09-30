#!/bin/bash

DEST_DIR=/var/www/pwa

echo Deploy started...

HOST=root@65.108.199.217
PORT=25622

yarn run vite:build &&
cd dist && tar -czvf /tmp/frontend.tar.gz ./* && cd ../ &&
  scp -P $PORT /tmp/frontend.tar.gz "$HOST:/tmp/" &&
  ssh -p $PORT "$HOST" "
rm -rf $DEST_DIR &&
mkdir -p $DEST_DIR &&
tar -xzvf /tmp/frontend.tar.gz -C $DEST_DIR
" &&
  rm /tmp/frontend.tar.gz &&
  exit


                    // sh 'ssh -p $PORT $HOST "cd $HOST_DIR && sudo rm -R * "'
                    // sh 'ssh -p $PORT $HOST "cd $HOST_DIR && sudo rm -R .[!.]* "'