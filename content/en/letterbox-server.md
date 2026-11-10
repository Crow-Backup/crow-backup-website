{
  "title": "Letterbox server",
  "date": "2026-11-10T12:00:00",
  "lastmod": "2026-11-10T12:00:00",
  "url": "/en/how-it-works/letterbox-server/",
  "translationKey": "letterbox-server",
  "docs": true,
  "toc": true,
  "description": "Why Crow Backup needs a letterbox server, how it works, how to configure it in the app and how to run your own with Podman or Docker."
}

When no direct connection between you and a friend is possible, Crow Backup exchanges data through a letterbox server. This page explains why it is needed, how it works and how to run your own.

## Why a letterbox is needed

Most computers sit behind a router that blocks incoming connections. As long as you are in the same network or one side has set up port forwarding, Crow Backup connects directly. But if both computers sit behind a router without port forwarding, no direct connection is possible, even when both are online.

That is what the letterbox is for: a server both sides can reach. The sending side deposits encrypted messages there, the receiving side picks them up. This way Crow Backup works in any network without changes to your router.

A letterbox server relays the entire traffic of a backup and needs bandwidth accordingly. The official Crow Backup servers are located in Switzerland and are free. If you want more bandwidth or a location of your own, you can run your own letterbox server: for the family, for a circle of friends or publicly for all users. Public servers carry the network and help Crow Backup grow. This way you also decide, for the transfer path, whose machine your data passes through and in which country it stands.

## How it works

1. Your app detects that no direct connection to your friend is possible and asks the Crow Backup server for a letterbox.
2. The Crow Backup server picks a letterbox server that is allowed for both of you and creates a letterbox there with two separate credentials: one for writing and one for reading.
3. Your app receives the write credential, your friend's app the read credential. Neither allows both.
4. Your app deposits the encrypted data in the letterbox. Your friend's app picks it up. Collected messages are deleted on the letterbox server.

The data is encrypted before it leaves your computer. A letterbox server only sees unreadable blocks and can recognise neither file names nor contents. This applies to the official servers and to self-hosted ones alike.

Because Crow Backup only transfers while both sides are online, messages stay in the letterbox only briefly. A letterbox server therefore needs little storage but enough bandwidth.

## Configuring it in the app

In the app settings, under "Letterbox servers", you choose which servers may be used for you:

- **Any letterbox server (recommended).** Official Crow Backup servers and servers that other users run publicly.
- **Only official letterbox servers.** Only servers operated by Crow Backup itself.
- **Only one specific letterbox server.** Only the server whose URL and access key you enter, for example your own.
- **No letterbox servers.** Data is exchanged over direct connections only. Backups run as soon as a direct connection is available.

For each friendship, the more restrictive setting of the two of you applies. If one side has entered a specific server, that server is used for the friendship, even if the other side chose "Any" or "Only official". So it is enough if one person enters their own server. If one side chose "None", no letterbox is used for that friendship.

The server URL and access key are stored in your account on the Crow Backup server so that it can create letterboxes for you there. Other users never see the key.

## Running your own server

### What you need

- A machine that runs permanently: a Raspberry Pi, a NAS, an old laptop or a small server in a data centre. The image is available for x86-64 and ARM64.
- Podman or Docker.
- Little storage, since messages are deleted once collected. A few gigabytes are enough.
- Port forwarding on your router so the server is reachable from the internet, on port 8987 in the example below.

### Example with Podman or Docker Compose

Save the following file as `compose.yaml`. Replace the access key with a long random string, for example from `openssl rand -base64 32`, enter your email address and adjust the storage path.

```yaml
services:
  crow-letterbox:
    container_name: crow-letterbox
    image: registry.gitlab.com/crow-backup/crow-base/letterbox-server
    ports:
      - "8987:8080"
    pull_policy: always
    command: >-
      -Dch.crowbackup.server.letterbox.storage-auth-key=YOUR-SECRET-KEY
      -Dch.crowbackup.server.letterbox.admin-contact=admin@example.com
      -Dch.crowbackup.server.letterbox.country=CH
      -Ddatabase.path=/storage
    mem_limit: 500m
    mem_reservation: 100m
    cpus: 2.0
    volumes:
      - /media/usb-drive/letterbox:/storage
    labels:
      # Podman only: allows updates through "podman auto-update".
      io.containers.autoupdate: registry
```

Start the server from the same folder:

```bash
podman compose up -d
```

With Docker the command is `docker compose up -d`. The server is then reachable at `http://<address-of-your-machine>:8987`.

### Parameters

| Parameter | Required | Required for public servers | Meaning |
| --- | --- | --- | --- |
| `ports: "8987:8080"` | Yes | Yes | Inside the container the server listens on port 8080. The left number is the port it is reachable on from outside. |
| `-Dch.crowbackup.server.letterbox.storage-auth-key` | Yes | Yes | Access key used to create new letterboxes. Only the Crow Backup server uses it. Give it only to the person who enters the server in their app. |
| `-Ddatabase.path` | No | No | Path where messages are stored temporarily. Map it to a folder on your machine with `volumes` so they survive container updates. |
| `-Dch.crowbackup.server.letterbox.max-kbps-per-user` | No | No | Bandwidth limit per user in kilobits per second, for example `30000`. |
| `-Dch.crowbackup.server.letterbox.url` | No | Yes | Address under which the server is reachable from the internet, for example `https://letterbox.example.com`. **Once set, the server counts as public.** |
| `-Dch.crowbackup.server.letterbox.admin-contact` | No | Yes | Email address through which Crow Backup can reach you about important operational matters. |
| `-Dch.crowbackup.server.letterbox.country` | No | Yes | Country the server is located in, as a two-letter ISO 3166-1 code, for example `CH` or `DE`. |

### Transport encryption

The server speaks HTTP without TLS. For the backup data that is enough, because it is already encrypted on your computer. If you offer the server over the internet, you can still put a reverse proxy with TLS in front of it, such as Caddy or nginx. That additionally protects the management calls the Crow Backup server makes to your letterbox server. You can then enter an `https://` address in the app and in `letterbox.url`.

### Entering it in the app

In the settings, choose "Only one specific letterbox server". Enter the address of your server as the server URL, for example `http://203.0.113.10:8987` or `https://letterbox.example.com`, and the value of `storage-auth-key` as the access key. Your friends do not need to enter anything; your server applies to them automatically.

### Updates

With `pull_policy: always`, Compose fetches the current image on every start. Under Podman, the label `io.containers.autoupdate: registry` together with `podman auto-update` keeps a container that runs as a systemd service up to date while it is running.

## Making the server public

If you have bandwidth to spare, you can offer your server to all users. Every public letterbox server makes the network faster and more independent: backups between friends travel over more paths, and Crow Backup can grow without depending on a few central servers. This is a direct way to help Crow Backup grow. Set `letterbox.url`, `admin-contact` and `country`; a public server needs all three. On start-up the server registers automatically with the Crow Backup server and is offered to everyone who chose "Any letterbox server". The Crow Backup server checks it regularly and removes it from the selection when it is no longer reachable.

Even as a public server, your machine only sees encrypted blocks. With `max-kbps-per-user` you limit how much bandwidth a single person can occupy.
