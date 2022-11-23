#!/usr/bin/env sh
set -e

# sub-commands
HELP_CMD='help'
PC='pc'
USM='usm'

DISPLAY_NAME='GitHub Desktop'
APP_NAME='shiftkey-desktop'
PACK_NAME='github-desktop'

PC_ROOT='https://packagecloud.io/shiftkey/desktop/'
USM_ROOT='https://mirror.mwt.me/ghd/'

GPG_KEY="${USM_ROOT}gpgkey"

HELP_MSG="$DISPLAY_NAME installer.
sub-commands:
	$HELP_CMD: prints this text and exits
	$PC: install from packagecloud.io repo
	$USM: install from mirror.mwt.me repo (US mirror)"

OK_MSG='DONE!'

if [ "$1" = "$PC" ]; then
	DEB_URL="${PC_ROOT}any"
	RPM_URL="${PC_ROOT}el/7/\$basearch"
elif [ "$1" = "$USM" ]; then
	DEB_URL="${USM_ROOT}deb"
	RPM_URL="${USM_ROOT}rpm"
elif [ "$1" = "$HELP_CMD" ]; then
	echo "$HELP_MSG"
	exit 0
else
	echo "Invalid sub-cmd. Run \`$0 $HELP_CMD\` for more info."
	exit 1
fi

DEB_REPO="$DEB_URL any main"
RPM_REPO="[shiftkey]
name=$DISPLAY_NAME
baseurl=$RPM_URL
enabled=1
gpgcheck=0
repo_gpgcheck=1
gpgkey=$GPG_KEY"


if command -v apt >/dev/null; then
	GPG_KEY_PATH="/usr/share/keyrings/$APP_NAME.asc"
	APTLIST_PATH="/etc/apt/sources.list.d/$APP_NAME.list"

	echo 'APT detected. Installing APT repository.'

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

else

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

	if command -v yum >/dev/null; then
		yum install "$PACK_NAME"

	elif command -v dnf >/dev/null; then
		dnf install "$PACK_NAME"

	else
		zypper ref
		zypper in "$PACK_NAME"

	fi

	echo "$OK_MSG"
	exit 0

fi
