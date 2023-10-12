#!/bin/bash
#######################################################
# ABOUT THIS SCRIPT
#
# Install and build a base release package
# This should try to include as many constructed
# assets as possible to reduce the work needed
# to deploy Materia. This build will not
# disrupt the current files on disk -
# ex: no need to install node # or npm packages
# to build js - just include the js
#
# EX: ./run_build_github_release_package.sh.sh ghcr.io/ucfopen/private-materia:app-v8.0.0
#######################################################
set -e


die () {
    echo >&2 "$@"
    exit 1
}

# exit without args
if [ $# -lt 1 ]; then
	die "1 required argument: docker-image-name"
fi

DOCKER_IMAGE=$1

# declare files that should have been created
declare -a FILES_THAT_SHOULD_EXIST=(
	"public/js/materia.enginecore.js"
	"public/css/player-page.css"
)

# declare files to omit from zip
declare -a FILES_TO_EXCLUDE=(
	"*.git*"
	"*.gitignore"
	"app.json"
	"nginx_app.conf"
	"Procfile"
	"node_modules*"
	"githooks"
	"phpcs.xml"
	"src*"
	"fuel/app/config/development*"
	"fuel/app/config/heroku*"
	"fuel/app/config/test*"
	"fuel/app/config/production*"
	"public/widget*"
	"githooks*"
	"coverage.xml"
	"coverage*"
)

# combine the files to exclude
EXCLUDE=''
for i in "${FILES_TO_EXCLUDE[@]}"
do
	EXCLUDE="$EXCLUDE -x \"$i\""
done

set -o xtrace

# get rid of any left over package files
rm -rf clean_build_clone || true
rm -rf ../materia-pkg* || true
git clone ../ ./clean_build_clone

# gather build info
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GITUSER=$(git config user.name)
GITEMAIL=$(git config user.email)
GITCOMMIT=$(cd clean_build_clone && git rev-parse HEAD)
GITREMOTE=$(git remote get-url origin)

# remove .git dir for slightly faster copy
rm -rf ./clean_build_clone/.git
rm -rf ./clean_build_clone/public

# copy the clean build clone into the container
docker cp $(docker create --rm $DOCKER_IMAGE):/var/www/html/public ./clean_build_clone/public/

# compile js & css assets into the public/dist directory
docker volume create materia-asset-build-vol
docker run \
	--rm \
	--name materia-asset-build \
	--mount type=bind,source="$(pwd)"/clean_build_clone/,target=/build \
	--mount source=materia-asset-build-vol,target=/build/node_modules \
	node:18.13.0-alpine \
	/bin/ash -c "apk add --no-cache git && cd build && yarn install --frozen-lockfile --non-interactive --pure-lockfile --force && npm run-script build-for-image"

# verify all files we expect to be created exist
for i in "${FILES_THAT_SHOULD_EXIST[@]}"
do
	stat ./clean_build_clone/$i
done

# zip, excluding some files
cd ./clean_build_clone
eval "zip -r ../../materia-pkg.zip ./ $EXCLUDE"

# calulate hashes
MD5=$(md5sum ../../materia-pkg.zip | awk '{ print $1 }')
SHA1=$(sha1sum ../../materia-pkg.zip | awk '{ print $1 }')
SHA256=$(sha256sum ../../materia-pkg.zip | awk '{ print $1 }')

# write build info file
echo "build_date: $DATE" > ../../materia-pkg-build-info.yml
echo "git: $GITREMOTE" >> ../../materia-pkg-build-info.yml
echo "git_version: $GITCOMMIT" >> ../../materia-pkg-build-info.yml
echo "git_user: $GITUSER" >> ../../materia-pkg-build-info.yml
echo "git_user_email: $GITEMAIL" >> ../../materia-pkg-build-info.yml
echo "sha1: $SHA1" >> ../../materia-pkg-build-info.yml
echo "sha256: $SHA256" >> ../../materia-pkg-build-info.yml
echo "md5: $MD5" >> ../../materia-pkg-build-info.yml

cd .. && rm -rf ./clean_build_clone
