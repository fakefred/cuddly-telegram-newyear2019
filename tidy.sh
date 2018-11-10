#! /bin/bash
echo "------ BEGIN LOCAL LOG FILE ------" > log.json
# for production only
# echo "PASSWORD HASH" > passwd.json
git add *
git status