#!/bin/bash
SELF=$0
SELF_DIR=`dirname $SELF`
if [ $GEOGRAPHY_WORKSPACE_DIR ]; then
	WORKSPACE_DIR=$GEOGRAPHY_WORKSPACE_DIR;
else
	WORKSPACE_DIR=$SELF_DIR/..
fi
WORK_TREE=$WORKSPACE_DIR
APP_DIR="$WORKSPACE_DIR/main"
if [ "$GEOGRAPHY_DATA_DIR" ]; then
	DATA_DIR="$GEOGRAPHY_DATA_DIR"
else
	DATA_DIR="$APP_DIR"
fi
GIT_DIR=$WORK_TREE/.git
GIT_COMMAND="git --git-dir=$GIT_DIR --work-tree=$WORK_TREE"

###############################################################################
# reset the application
###############################################################################

	cd $APP_DIR
	echo " * npm install"
    npm install
	echo " * grunt deploy"
	grunt deploy

	echo " * collect static"
	$APP_DIR/manage.py collectstatic --noinput
	echo "HASHES = $( python $APP_DIR/manage.py static_hashes )" > $APP_DIR/hashes.py

	echo " * update maps"
	$APP_DIR/manage.py update_maps

	echo " * migrate"
	$APP_DIR/manage.py migrate geography --delete-ghost-migrations --traceback
	echo " * load custom SQLs"
	$APP_DIR/manage.py sqlcustom geography | $APP_DIR/manage.py dbshell
	echo " * derive knowledge data"
	$APP_DIR/manage.py derived_knowledge_data
	echo " * remove django cache"
	rm -rf $DATA_DIR/.django_cache


###############################################################################
# install requirements
###############################################################################

if [[ `$git_command diff --name-only $last_head $deploy_version` ]]; then
	pip install --upgrade -r $app_dir/requirements.txt
fi


