#!/usr/bin/env sh
set -e
HELP_CMD='help'
PC='packagecloud'
MIR='US-mirror'

if [ "$1" = "$PC" ]; then
	URL='https://packagecloud.io/shiftkey/desktop/any/'
elif [ "$1" = "$MIR" ]; then
	URL='https://mirror.mwt.me/ghd/deb/'
elif [ "$1" = "$HELP_CMD" ]; then
	echo 'Github Desktop installer.'
	echo 'sub-commands'
	echo "$HELP_CMD: prints this text and exits"
	echo "$PC: uses packagecloud.io repo"
	echo "$MIR: uses mirror.mwt.me repo"
	exit 0
else
	echo "invalid sub-cmd. Run \`$0 $HELP_CMD\` for more info"
	exit 1
fi

wget -qO - https://mirror.mwt.me/ghd/gpgkey | sudo tee /etc/apt/trusted.gpg.d/shiftkey-desktop.asc > /dev/null

sudo sh -c "echo 'deb [arch=amd64] $URL any main' > /etc/apt/sources.list.d/packagecloud-shiftkey-desktop.list"

sudo apt update
sudo apt install github-desktop
