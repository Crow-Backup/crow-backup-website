{
  "title": "How it works",
  "date": "2026-11-10T12:00:00",
  "lastmod": "2026-11-10T12:00:00",
  "url": "/en/how-it-works/",
  "translationKey": "how-it-works",
  "docs": true,
  "toc": true,
  "description": "How Crow Backup works: encrypted backups on your friends' computers, direct connections or a letterbox server, storage limits per friend, restoring with versions."
}

Crow Backup stores your files, encrypted, on the computers of people you trust. This page explains what happens on your computer, on your friends' computers and in between. The technical details of encryption and transfer are in the [whitepaper](/en/en-whitepaper/).

## Why friends instead of the cloud

A cloud backup sits on servers you do not know, run by a company that can change its terms. With Crow Backup you always know where your data is: on the computer of your friend, your brother or your neighbour. You decide whom you trust with your backups, and you can change that decision at any time.

Files are encrypted on your computer before they leave it. Neither your friends nor we can read them. The software is free, and the storage comes from the two of you. Your backup is kept by someone you know, and you back each other up.

## You and your friends

Crow Backup works between two accounts. Both of you install the app on Windows, macOS or Linux, add each other by email address and confirm the friendship. A friendship works in both directions: you can back up to your friend, and they can back up to you. Each side decides for itself how much storage it gives the other. It is also fine if only one side creates backups.

You can have several friends and spread your folders across them. If you want a folder stored twice, back it up to two people.

## A backup, step by step

1. **Choose a folder.** You pick a folder on your computer and the friend it should be backed up to.
2. **Encrypt locally.** Crow Backup encrypts every file on your computer with AES-256. The key is derived from your password and never leaves your computer in plain text.
3. **Transfer.** The encrypted data travels to your friend, directly or through a letterbox server. There it lands in the `.crow` folder as data blocks your friend cannot read.
4. **Keep it current.** Once the first backup is complete, Crow Backup creates a new one automatically every 24 hours, as long as your friend is reachable. You can also start a backup by hand at any time. Files that have not changed are not transferred again.

For the first backup it pays to start with a small folder and keep both computers in the same network. That is the fastest way, and you can restore a file right away to try it out.

## The connection between you

Crow Backup only transfers data while both computers are online. How the connection is made depends on where you are. Pick a connection type in the diagram:

{{< connection-diagram >}}

- **Directly in the same network.** The computers find each other automatically. This is the fastest connection, ideal for the first backup and for restores.
- **Directly over the internet.** If you or your friend set up port forwarding for TCP port 58300 on the router, the computers connect directly, wherever you are.
- **Through a letterbox server.** If both computers sit behind a router without port forwarding, no direct connection is possible. One side then deposits the encrypted data on a letterbox server and the other picks it up there. This works in any network; a direct connection is faster. Read more on the [letterbox server](/en/how-it-works/letterbox-server/) page.
- **Not reachable.** If your friend is offline, the backup waits until you are both online again.

The coloured dot next to each friend in the app shows the current state: green for a fast connection, yellow or orange for a connection that may be slow, red for not reachable.

## Storage per friend

You set individually how much space each friend gets on your computer. The app shows how much of it is already used and how much the other side offers you. You can change the limit at any time. Backups that are already stored stay, even if you lower the limit below the space in use. This keeps you in control of how much space backups take on your computer.

Your friends' backups are stored in the `.crow` folder in your home directory. You can change this location in the settings.

## Restoring and versions

Backups are versioned. You can restore single files or whole folders and pick a specific version, for example last week's state. Your friend needs to be reachable for this; the same network is fastest.

You can also delete backups, folder by folder or all at once when you end a friendship.

If your computer is lost, you install Crow Backup again, sign in with your email address and password and restore from the backup at your friend's. Your password is the only key to your data, and only you know it.

## Further reading

- [Letterbox server](/en/how-it-works/letterbox-server/): why it is needed and how to run your own.
- [Whitepaper](/en/en-whitepaper/): encryption, signatures, connection setup and data storage in detail.
- [FAQ](/en/en-faq/): short answers to common questions.
- [Download](/en/download/): Crow Backup for Windows, macOS and Linux.
