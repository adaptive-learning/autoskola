###############################################################################
# reset the application
###############################################################################

if [[ `$GIT_COMMAND diff --name-only $LAST_HEAD $DEPLOY_VERSION` ]]; then
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
	if [[ `$GIT_COMMAND diff --name-only $LAST_HEAD $DEPLOY_VERSION | egrep 'main\/geography\/models\/(knowledge\.py|prior.py|current.py)'` ]]; then
	echo " * derive knowledge data"
	$APP_DIR/manage.py derived_knowledge_data
	fi
	echo " * remove django cache"
	rm -rf $DATA_DIR/.django_cache
fi


###############################################################################
# install requirements
###############################################################################

if [[ `$git_command diff --name-only $last_head $deploy_version` ]]; then
	pip install --upgrade -r $app_dir/requirements.txt
fi


###############################################################################
# ownership and permissions
###############################################################################

chgrp www-data -r $workspace_dir
chgrp www-data -r $workspace_dir/.git
chown www-data -r $workspace_dir
chown www-data -r $workspace_dir/.git
chmod g=rwx -r $workspace_dir
chmod g=rwx -r $workspace_dir/.git

