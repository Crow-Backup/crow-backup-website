{
  "title": "Herunterladen",
  "date": "2024-03-22T20:35:30",
  "lastmod": "2026-09-15T19:11:06",
  "url": "/herunterladen/",
  "translationKey": "226",
  "source": "https://crowbackup.ch/herunterladen/",
  "sourceId": 226,
  "description": "Crow Backup für Windows, macOS und Linux. Kostenlos herunterladen und gemeinsam sichern."
}

{{< grid >}}
{{< card >}}
Für welches Betriebssystem möchtest du Crow Backup runterladen?

{{< downloads >}}
{{< /card >}}

{{< card >}}
![Vorschau Crow Backup Software](/wp-content/uploads/2024/03/Crow-Backup-Backup-Uebersicht.png)
{{< /card >}}
{{< /grid >}}

## Docker

Crow Backup lässt sich auch in einem Docker-Container betreiben. Das ist praktisch, wenn Sie Crow Backup beispielsweise auf einem NAS ohne Desktop-Oberfläche nutzen möchten. Über den Browser greifen Sie dann bequem auf die Anwendung zu.

### **Container starten**

{{< grid >}}
{{< card >}}
**macOS / Linux**

```
docker run --name crow-backup -v $HOME/.crow:/data --restart=always -p 58300:58300 -p 58325:58325   registry.gitlab.com/crow-backup/crow-base/client
```
{{< /card >}}

{{< card >}}
**Windows**

```
docker run --name crow-backup -v %userprofile%/.crow:/data --restart=always -p 58300:58300 -p 58325:58325 registry.gitlab.com/crow-backup/crow-base/client
```
{{< /card >}}
{{< /grid >}}

**Erläuterung der Optionen**

-   `-v <X>/.crow:/data`  
    Verknüpft das versteckte Verzeichnis `.crow` in Ihrem Benutzerordner mit `/data` im Container. So bleiben Ihre Einstellungen und Daten erhalten.
-   `--restart=always`  
    Startet den Container automatisch neu, falls er abstürzt oder der Host neu startet.
-   `-p 58325:58325`  
    Dieser Port dient der Erkennung weiterer Crow-Backup-Instanzen im lokalen Netzwerk.
-   `-p 58300:58300`  
    Hierüber läuft die Web-Oberfläche für die Administration.

**Zugriff**

Öffnen Sie Ihren Browser und rufen Sie folgende Adresse auf:

```
http://localhost:58300
```
