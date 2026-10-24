---
draft: false
author: jpcercal@gmail.com
slug: how-to-install-the-nvidia-video-driver-on-ubuntu-10-04
title: How to install the nVidia video driver on Ubuntu 10.04
date: 2011-04-23T17:13:08+00:00
description: Learn to solve graphics performance problems on Linux by installing the binary video driver provided by nVidia itself! Worth checking out.
categories:
  - engineering
tags:
  - linux
  - hardware
  - tutorial
---

Assuming you've already downloaded the latest driver version directly from the manufacturer's website:

[http://www.nvidia.com.br/Download/index.aspx?lang=br](http://www.nvidia.com.br/Download/index.aspx?lang=br)

We can continue then...

1.  **Removing other drivers and installing the recent NVIDIA driver version**

Hello folks, as many _nvidia_ graphics card users may have noticed, _Compiz_ graphics performance and
_OpenGL_ playback are very slow in this new version of _Ubuntu_. To explain quickly, this is due to two
factors:

* **Ubuntu 10.04** comes with a generic _driver_ called _Nouveau_, so even if you install the
_nvidia_ _driver_ provided by canonical, _Nouveau_ will keep running.
* The _nvidia_ _driver_ provided by canonical is very outdated compared to the one provided by _nvidia_.

So before anything else, we need to remove all video _drivers_ installed on _Ubuntu_, until all of them
are removed, when you try to install the recent _nvidia_ _driver_, you'll encounter the following problem:

```shell
ERROR: Unable to load the kernel module 'nvidia.ko'.
This happens most frequently when this kernel module was built against
the wrong or improperly configured kernel sources, with a version of gcc
that differs from the one used to build the target kernel, or if a driver
such as rivafb/nvidiafb is present and prevents the NVIDIA kernel module
from obtaining ownership of the NVIDIA graphics device(s), or NVIDIA GPU
installed in this system is not supported by this NVIDIA Linux graphics
driver release.
```

So let's begin...

**All commands should be run in superuser mode.**

**Command:**

```shell
$ sudo su
```

Open the "_Blacklist_" module as superuser, using your favorite text editor:

```shell
# gedit /etc/modprobe.d/blacklist.conf
```

Add the following lines at the end of the file, then save:

```shell
blacklist vga16fb
blacklist nouveau
```

Now let's start removing all video _drivers_, for this I recommend that you stop _GDM_:

```shell
# service gdm stop
```

Remove all _nvidia_ installations:

```shell
# apt-get purge nvidia-*
# reboot
```

Now let's remove _Noveau_:

```shell
# service gdm stop
# apt-get purge xserver-xorg-video-nouveau
# reboot
```

From now on, _linux_ no longer has any video _driver_ and is ready to install the new version of the
_driver_ distributed by _nvidia_.

**Installing the new nvidia driver:**

```shell
# service gdm stop
# chmod +x NVIDIA-Linux-x86_64-256.44.run
# sh NVIDIA-Linux-x86_64-256.44.run
```

**Note:** _NVIDIA-Linux-x86_64-256.44.run_ is the name of the driver downloaded from the website. During installation,
you'll be asked a question, answer YES!

Once installation is finished, you can start _GDM_:

```shell
# service gdm start
```

Now you'll need to update the X.Org settings, to do this, go to the terminal and type:

```shell
# nvidia-xconfig
```

You'll need to set the configuration to load when the session starts, otherwise you'll have to open
_NVIDIA X Server Settings_ to load the settings.

So go to "Startup Applications Preferences" > System > Preferences > "Startup Applications" > Add > Name: > Any name > Command:

```shell
# nvidia-settings-load-config-only
```

Done! Now you're using the latest _nvidia_ _driver_ and can use _Compiz_, play videos in
_OpenGL_ without that enormous graphics slowdown.
