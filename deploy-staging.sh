#!/bin/bash

echo "TRAVIS_TAG: $TRAVIS_TAG"

if [ ! -z "$TRAVIS_TAG" ]; then

    echo "This will push to docker"

    # Lulz
    # Decrypt and unzip secrets.zip.enc (contains config-stating.json + cert. for ssh)
    openssl aes-256-cbc -K $encrypted_c2aec72b3ee3_key -iv $encrypted_c2aec72b3ee3_iv -in secrets.zip.enc -out secrets.zip -d
    unzip secrets.zip

    # Login at docker registry
    docker login --username=$DOCKER_USER --password=$DOCKER_PASS $DOCKER_URL

    # Build docker image
    docker build -f Dockerfile -t $DOCKER_REPO .

    # Add tags and push to docker registry
    docker tag $DOCKER_REPO $DOCKER_URL/$DOCKER_REPO:$TRAVIS_TAG
    docker push $DOCKER_URL/$DOCKER_REPO:$TRAVIS_TAG
    rm "/home/${USER}/.docker/config.json"

    # If tag matches *stage deploy to staging
    if [[ $TRAVIS_TAG == *stage ]]; then
        echo "This will deploy to stage"
        chmod 600 id_rsa_breakout_deploy
        eval "$(ssh-agent -s)"
        ssh-add id_rsa_breakout_deploy
        ssh -o StrictHostKeyChecking=no $STAGE_LOGIN "docker-compose stop;"
        ssh -o StrictHostKeyChecking=no $STAGE_LOGIN "BACKEND_VERSION=latest BACKEND_PROFILE=staging FRONTEND_VERSION=$TRAVIS_TAG docker-compose pull"
        ssh -o StrictHostKeyChecking=no $STAGE_LOGIN "BACKEND_VERSION=latest BACKEND_PROFILE=staging FRONTEND_VERSION=$TRAVIS_TAG docker-compose up -d"
    else
        echo "This will not deploy to stage, this is not with stage tag"
    fi

else
    echo "This will not be pushed to docker, there is no tag"
fi