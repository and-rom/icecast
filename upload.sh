#!/bin/bash
HOST=$1
USER=$2
PASS=$3
BASEFOLDER='/public_html'
TARGETFOLDER='/icecast'
SOURCEFOLDER=`pwd`
echo $USER
echo $PASS
echo "ftp://"$HOST$BASEFOLDER$TARGETFOLDER
echo $SOURCEFOLDER
read
lftp -e "
open $HOST
user $USER $PASS
lcd $SOURCEFOLDER
mirror --exclude config_db.php --exclude upload.sh --exclude .git/ --exclude .git --exclude .gitignore --exclude README.md --reverse --delete --verbose $SOURCEFOLDER $BASEFOLDER$TARGETFOLDER
bye
"
