{
  "title": "Briefkasten-Server",
  "date": "2026-11-10T12:00:00",
  "lastmod": "2026-11-10T12:00:00",
  "url": "/funktionsweise/briefkasten-server/",
  "translationKey": "letterbox-server",
  "docs": true,
  "toc": true,
  "description": "Warum Crow Backup einen Briefkasten-Server braucht, wie er funktioniert, wie du ihn in der App einstellst und wie du mit Podman oder Docker einen eigenen betreibst."
}

Wenn zwischen dir und deiner Freund\*in keine direkte Verbindung möglich ist, tauscht Crow Backup die Daten über einen Briefkasten-Server aus (englisch: Letterbox Server). Diese Seite erklärt, warum es ihn braucht, wie er arbeitet und wie du einen eigenen betreibst.

## Warum es einen Briefkasten braucht

Die meisten Computer stehen hinter einem Router, der Verbindungen von aussen blockiert. Solange ihr im selben Netzwerk seid oder eine Seite eine Portweiterleitung eingerichtet hat, verbindet sich Crow Backup direkt. Stehen aber beide Computer hinter einem Router ohne Portweiterleitung, kommt keine direkte Verbindung zustande, auch wenn beide online sind.

Dafür gibt es den Briefkasten: einen Server, den beide Seiten erreichen. Die sendende Seite legt dort verschlüsselte Nachrichten ab, die empfangende Seite holt sie ab. So funktioniert Crow Backup in jedem Netzwerk, ohne dass ihr etwas am Router ändern müsst.

Ein Briefkasten-Server leitet den ganzen Datenverkehr eines Backups weiter und braucht entsprechend Bandbreite. Die offiziellen Server von Crow Backup stehen in der Schweiz und sind kostenlos. Wer mehr Bandbreite oder einen eigenen Standort möchte, kann einen eigenen Briefkasten-Server betreiben: für die Familie, für den Freundeskreis oder öffentlich für alle Nutzenden. Öffentliche Server tragen das Netzwerk mit und helfen Crow Backup zu wachsen. So bestimmst du auch für den Transportweg, wessen Rechner deine Daten passieren und in welchem Land er steht.

## Wie er funktioniert

1. Deine App stellt fest, dass keine direkte Verbindung zu deiner Freund\*in möglich ist, und bittet den Crow Backup Server um einen Briefkasten.
2. Der Crow Backup Server wählt einen Briefkasten-Server aus, der für euch beide erlaubt ist, und legt dort einen Briefkasten mit zwei getrennten Zugängen an: einem zum Schreiben und einem zum Lesen.
3. Deine App erhält den Schreibzugang, die App deiner Freund\*in den Lesezugang. Kein Zugang erlaubt beides.
4. Deine App legt die verschlüsselten Daten im Briefkasten ab. Die App deiner Freund\*in holt sie ab. Abgeholte Nachrichten werden auf dem Briefkasten-Server gelöscht.

Die Daten sind bereits verschlüsselt, bevor sie deinen Computer verlassen. Ein Briefkasten-Server sieht nur unlesbare Blöcke und kann weder Dateinamen noch Inhalte erkennen. Das gilt für die offiziellen Server genauso wie für selbst betriebene.

Weil Crow Backup nur überträgt, wenn beide Seiten online sind, bleiben Nachrichten nur kurz im Briefkasten. Ein Briefkasten-Server braucht deshalb wenig Speicherplatz, aber genug Bandbreite.

## In der App einstellen

In den Einstellungen der App wählst du unter «Briefkasten-Server», welche Server für dich verwendet werden dürfen:

- **Beliebige Briefkasten-Server (empfohlen).** Offizielle Server von Crow Backup und Server, die andere Nutzende öffentlich betreiben.
- **Nur offizielle Briefkasten-Server.** Nur Server, die Crow Backup selbst betreibt.
- **Nur ein bestimmter Briefkasten-Server.** Nur der Server, dessen Server-URL und Zugriffsschlüssel du einträgst, zum Beispiel dein eigener.
- **Keine Briefkasten-Server.** Daten werden nur über direkte Verbindungen ausgetauscht. Backups laufen dann, sobald eine direkte Verbindung besteht.

Für jede Freundschaft gilt die restriktivere Einstellung von euch beiden. Hat eine Seite einen bestimmten Server eingetragen, wird dieser für die Freundschaft verwendet, auch wenn die andere Seite «Beliebige» oder «Nur offizielle» gewählt hat. Es reicht also, wenn eine Person den eigenen Server einträgt. Hat eine Seite «Keine» gewählt, wird für diese Freundschaft kein Briefkasten verwendet.

Server-URL und Zugriffsschlüssel werden in deinem Konto auf dem Crow Backup Server gespeichert, damit er dort Briefkästen für dich anlegen kann. Andere Nutzende bekommen den Schlüssel nie zu sehen.

## Eigenen Server betreiben

### Was du brauchst

- Einen Rechner, der dauerhaft läuft: ein Raspberry Pi, ein NAS, ein alter Laptop oder ein kleiner Server im Rechenzentrum. Das Image gibt es für x86-64 und ARM64.
- Podman oder Docker.
- Wenig Speicherplatz, da Nachrichten nach dem Abholen gelöscht werden. Ein paar Gigabyte reichen.
- Eine Portweiterleitung auf dem Router, damit der Server aus dem Internet erreichbar ist, im Beispiel unten auf Port 8987.

### Beispiel mit Podman oder Docker Compose

Speichere die folgende Datei als `compose.yaml`. Ersetze den Zugriffsschlüssel durch eine lange, zufällige Zeichenfolge, zum Beispiel aus `openssl rand -base64 32`, trage deine E-Mail-Adresse ein und passe den Speicherpfad an.

```yaml
services:
  crow-letterbox:
    container_name: crow-letterbox
    image: registry.gitlab.com/crow-backup/crow-base/letterbox-server
    ports:
      - "8987:8080"
    pull_policy: always
    command: >-
      -Dch.crowbackup.server.letterbox.storage-auth-key=DEIN-GEHEIMER-SCHLUESSEL
      -Dch.crowbackup.server.letterbox.admin-contact=admin@example.com
      -Dch.crowbackup.server.letterbox.country=CH
      -Ddatabase.path=/storage
    mem_limit: 500m
    mem_reservation: 100m
    cpus: 2.0
    volumes:
      - /media/usb-drive/letterbox:/storage
    labels:
      # Nur Podman: erlaubt Updates über «podman auto-update».
      io.containers.autoupdate: registry
```

Starte den Server im selben Ordner:

```bash
podman compose up -d
```

Mit Docker lautet der Befehl `docker compose up -d`. Danach ist der Server unter `http://<adresse-deines-rechners>:8987` erreichbar.

### Parameter

| Parameter | Pflicht | Pflicht für öffentliche Server | Bedeutung |
| --- | --- | --- | --- |
| `ports: "8987:8080"` | Ja | Ja | Im Container lauscht der Server auf Port 8080. Die linke Zahl ist der Port, unter dem er von aussen erreichbar ist. |
| `-Dch.crowbackup.server.letterbox.storage-auth-key` | Ja | Ja | Zugriffsschlüssel, mit dem neue Briefkästen angelegt werden. Nur der Crow Backup Server verwendet ihn. Gib ihn nur der Person weiter, die den Server in ihrer App einträgt. |
| `-Ddatabase.path` | Nein | Nein | Pfad, unter dem Nachrichten zwischengespeichert werden. Mit `volumes` auf einen Ordner deines Rechners legen, damit sie Updates des Containers überstehen. |
| `-Dch.crowbackup.server.letterbox.max-kbps-per-user` | Nein | Nein | Bandbreitenlimite pro Nutzer\*in in Kilobit pro Sekunde, zum Beispiel `30000`. |
| `-Dch.crowbackup.server.letterbox.url` | Nein | Ja | Adresse, unter der der Server aus dem Internet erreichbar ist, zum Beispiel `https://briefkasten.example.com`. **Sobald sie gesetzt ist, gilt der Server als öffentlich.** |
| `-Dch.crowbackup.server.letterbox.admin-contact` | Nein | Ja | E-Mail-Adresse, über die Crow Backup dich zu wichtigen Themen rund um den Betrieb erreicht. |
| `-Dch.crowbackup.server.letterbox.country` | Nein | Ja | Land, in dem der Server steht, als Zweibuchstaben-Code nach ISO 3166-1, zum Beispiel `CH` oder `DE`. |

### Verschlüsselung der Verbindung

Der Server spricht HTTP ohne TLS. Für die Backup-Daten reicht das, weil sie bereits auf deinem Computer verschlüsselt werden. Wer den Server über das Internet anbietet, kann trotzdem einen Reverse Proxy mit TLS davorschalten, etwa Caddy oder nginx. Das schützt zusätzlich die Verwaltungszugriffe des Crow Backup Servers auf deinen Briefkasten-Server. In der App und in `letterbox.url` kannst du dann eine `https://`-Adresse eintragen.

### In der App eintragen

Wähle in den Einstellungen «Nur ein bestimmter Briefkasten-Server». Trage als Server-URL die Adresse deines Servers ein, zum Beispiel `http://203.0.113.10:8987` oder `https://briefkasten.example.com`, und als Zugriffsschlüssel den Wert aus `storage-auth-key`. Deine Freund\*innen müssen nichts eintragen, für sie gilt dein Server automatisch.

### Updates

Mit `pull_policy: always` holt Compose bei jedem Start das aktuelle Image. Unter Podman sorgt das Label `io.containers.autoupdate: registry` zusammen mit `podman auto-update` dafür, dass ein als systemd-Dienst laufender Container auch im Betrieb aktualisiert wird.

## Server öffentlich machen

Wenn du Bandbreite übrig hast, kannst du deinen Server allen Nutzenden anbieten. Jeder öffentliche Briefkasten-Server macht das Netzwerk schneller und unabhängiger: Backups zwischen Freund\*innen laufen über mehr Wege, und Crow Backup kann wachsen, ohne von wenigen zentralen Servern abzuhängen. Damit hilfst du Crow Backup direkt, grösser zu werden. Setze dafür `letterbox.url`, `admin-contact` und `country`; für einen öffentlichen Server sind alle drei Angaben nötig. Beim Start meldet sich der Server automatisch beim Crow Backup Server an und wird allen angeboten, die «Beliebige Briefkasten-Server» gewählt haben. Der Crow Backup Server prüft ihn regelmässig und nimmt ihn aus der Auswahl, wenn er nicht mehr erreichbar ist.

Auch als öffentlicher Server sieht dein Rechner nur verschlüsselte Blöcke. Mit `max-kbps-per-user` begrenzt du, wie viel Bandbreite eine einzelne Person belegen kann.
