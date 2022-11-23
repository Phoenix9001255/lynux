#!/usr/bin/env sh
set -e

# sub-commands
HELP_CMD='help'
PC='packagecloud'
USM='US-mirror'

DISPLAY_NAME='GitHub Desktop'
APP_NAME='shiftkey-desktop'
PACK_NAME='github-desktop'

ROOT='https://mirror.mwt.me/ghd/' # USM root URL

GPG_KEY="${ROOT}gpgkey" # url for the asc gpg key

OK_MSG='DONE!'

if [ "$1" = "$PC" ]; then
	DEB_URL='https://packagecloud.io/shiftkey/desktop/any'
elif [ "$1" = "$USM" ]; then
	DEB_URL="${ROOT}deb"
elif [ "$1" = "$HELP_CMD" ]; then
	echo "\
		$DISPLAY_NAME installer.\
		sub-commands\
		$HELP_CMD: prints this text and exits\
		$PC: uses packagecloud.io repo\
		$USM: uses mirror.mwt.me repo\
	"
	exit 0
else
	echo "invalid sub-cmd. Run \`$0 $HELP_CMD\` for more info"
	exit 1
fi

# string to appear in the .list file
DEB_REPO="$DEB_URL any main"
# string to appear in the .repo file
RPM_REPO="[shiftkey]
name=$DISPLAY_NAME
baseurl=${ROOT}rpm
enabled=1
gpgcheck=0
repo_gpgcheck=1
gpgkey=$GPG_KEY"


if [ -n "$DEB_REPO" ] && command -v apt >/dev/null; then
	GPG_KEY_PATH="/usr/share/keyrings/$APP_NAME.asc"
	APTLIST_PATH="/etc/apt/sources.list.d/$APP_NAME.list"
	echo "APT detected. Installing APT repository."
	if command -v wget >/dev/null; then
		echo 'Wget detected, using it.'
		wget -qO "$GPG_KEY_PATH" "$GPG_KEY"
	elif command -v curl >/dev/null; then
		echo 'cURL detected, using it.'
		curl -s "$GPG_KEY" -o "$GPG_KEY_PATH"
	else
		echo 'FAILED: Neither Wget nor cURL available.'
		exit 1
	fi
	DEBIAN_ARCH=$(dpkg --print-architecture)
	echo "deb [arch=$DEBIAN_ARCH signed-by=$GPG_KEY_PATH by-hash=force] $DEB_REPO" > "$APTLIST_PATH"
	apt update
	apt install "$PACK_NAME"
	echo "$OK_MSG"
	exit 0
elif [ -n "$RPM_REPO" ]; then
	if command -v dnf >/dev/null || command -v yum >/dev/null; then
		echo 'YUM/DNF detected. Installing YUM repository.'
		RPMLIST_PATH="/etc/yum.repos.d/$APP_NAME.repo"
	elif command -v zypper >/dev/null; then
		echo 'Zypper detected. Installing zypper repository.'
		RPMLIST_PATH="/etc/zypp/repos.d/$APP_NAME.repo"
	else
		echo 'FAILED: No supported package manager found (apt, yum, dnf, zypper).'
		exit 1
	fi
	rpm --import "$GPG_KEY"
	echo "$RPM_REPO" > "$RPMLIST_PATH"
	echo "$OK_MSG"
	exit 0
else
	echo 'FAILED: No supported package manager found.'
	exit 1
fi
