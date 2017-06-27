---
title: Como instalar o driver de vídeo nVidia no sistema operacional Ubuntu 10.04
date: 2011-04-23T17:13:08+00:00
author: jpcercal@gmail.com
excerpt: Aprenda a resolver os problemas de desempenho gráfico no Linux instalando o driver de vídeo binário fornecido pela própria nVidia! Vale a pena conferir.
layout: post
permalink: /blog/como-instalar-o-driver-de-video-nvidia-no-sistema-operacional-ubuntu-10-04/
image_path: /wp-content/uploads/2012/11/inauguracao-125x125.jpg
categories:
  - Artigos
---

Considerando que já tenha baixado a versão mais atual do driver diretamente no site do fabricante:

[http://www.nvidia.com.br/Download/index.aspx?lang=br](http://www.nvidia.com.br/Download/index.aspx?lang=br)

Podemos então continuar...

1.  **Removendo outros drivers e instalando a versão recente do driver NVIDIA**

Olá pessoal, como muitos usuários de placas de vídeo _nvidia_ devem ter percebido, o desempenho gráfico do _Compiz_ e reproduções do _OpenGL_ estão muito lentos nessa nova versão do _Ubuntu_. Explicando rapidamente isso é devido dois fatores:

* O **Ubuntu 10.04** acompanha um _driver_ genérico chamado _Nouveau_, então mesmo que você instale o _driver_ da _nvidia_ fornecido pela canonical, o _Nouveau_ vai continuar funcionando.
* O _driver_ da _nvidia_ fornecido pela canonical é muito desatualizado em comparação ao fornecido pela _nvidia_.

Então antes de qualquer coisa, precisamos remover todos os _drivers_ de vídeo instalados no _Ubuntu_, enquanto todos não forem removidos, quando você tentar instalar o _driver_ recente da _nvidia_, se deparará com o seguinte problema:

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

Então vamos começar...

**Todos os comandos deverão ser executados em modo super usuário.**

**Comando:**

```shell
$ sudo su
```

Abra o módulo "_Blacklist_" como super usuário, usando o seu editor de texto preferido:

```shell
# gedit /etc/modprobe.d/blacklist.conf
```

Adicione no final do arquivo as seguintes linhas, depois salve:

```shell
blacklist vga16fb
blacklist nouveau
```

Agora vamos começar a remover todos os _drivers_ de vídeo, para isso recomendo que encerre o _GDM_:

```shell
# service gdm stop
```

Remova todas as instalações da _nvidia_:

```shell
# apt-get purge nvidia-*
# reboot
```

Agora vamos remover o _Noveau_:

```shell
# service gdm stop
# apt-get purge xserver-xorg-video-nouveau
# reboot
```

A partir de agora o _linux_ não possui mais nenhum _driver_ de vídeo e está pronto para instalar a nova versão do _driver_ distribuída pela _nvidia_.

**Instalando o novo driver da nvidia:**

```shell
# service gdm stop
# chmod +x NVIDIA-Linux-x86_64-256.44.run
# sh NVIDIA-Linux-x86_64-256.44.run
```

**Nota:** _NVIDIA-Linux-x86_64-256.44.run_ é o nome do driver que foi baixado do site. Durante a instalação, uma pergunta será feita, responda SIM!

Após terminar a instalação você já poderá iniciar o _GDM_:

```shell
# service gdm start
```

Agora será necessário atualizar as configurações do X.Org, para isso, vá ao terminal e digite:

```shell
# nvidia-xconfig
```

Você precisará colocar as configurações para serem carregadas ao iniciar a seção, caso contrário terá que abrir o _NVIDIA X Server Settings_ para carregar as configurações.

Então vá em "Preferência dos aplicativos de sessão" > Sistema > Preferências > "Aplicativos de seção" > Adicionar > Nome: > Qualquer um > Comando:

```shell
# nvidia-settings-load-config-only
```

Pronto! Agora você está usando o _driver_ mais atualizado do _nvidia_ e poderá usar _Compiz_, reproduzir vídeos em _OpenGL_ sem a presença daquela enorme lentidão gráfica.
