{
  "title": "Funktionsweise",
  "date": "2026-11-10T12:00:00",
  "lastmod": "2026-11-10T12:00:00",
  "url": "/funktionsweise/",
  "translationKey": "how-it-works",
  "docs": true,
  "toc": true,
  "description": "So funktioniert Crow Backup: verschlüsselte Backups auf den Computern von Freund*innen, direkte Verbindung oder Briefkasten-Server, Speicherplatz pro Freund*in, Versionen."
}

Crow Backup sichert deine Dateien verschlüsselt auf den Computern von Menschen, denen du vertraust. Diese Seite erklärt, was dabei auf deinem Computer, bei deinen Freund\*innen und dazwischen passiert. Die technischen Details zu Verschlüsselung und Übertragung stehen im [Whitepaper](/whitepaper/).

## Warum bei Freund\*innen statt in der Cloud

Ein Backup in der Cloud liegt auf Servern, die du nicht kennst, bei einem Unternehmen, das seine Bedingungen ändern kann. Bei Crow Backup weisst du immer, wo deine Daten liegen: auf dem Computer deiner Freundin, deines Bruders oder deines Nachbarn. Du entscheidest selbst, wem du deine Backups anvertraust, und du kannst diese Entscheidung jederzeit ändern.

Die Dateien werden auf deinem Computer verschlüsselt, bevor sie ihn verlassen. Weder deine Freund\*innen noch wir können sie lesen. Die Software ist kostenlos, der Speicherplatz kommt von euch. Dein Backup liegt bei einer Person, die du kennst, und ihr sichert euch gegenseitig.

## Du und deine Freund\*innen

Crow Backup funktioniert zwischen zwei Konten. Beide installieren die App auf Windows, macOS oder Linux, fügen sich gegenseitig über die E-Mail-Adresse hinzu und bestätigen die Freundschaft. Eine Freundschaft gilt in beide Richtungen: Du kannst bei deiner Freund\*in sichern, und sie kann bei dir sichern. Jede Seite legt für sich fest, wie viel Speicherplatz sie der anderen gibt. Es ist auch in Ordnung, wenn nur eine Seite Backups anlegt.

Du kannst mehrere Freund\*innen haben und deine Ordner auf sie verteilen. Wer einen Ordner doppelt gesichert haben will, sichert ihn bei zwei Personen.

## Ein Backup, Schritt für Schritt

1. **Ordner wählen.** Du wählst einen Ordner auf deinem Computer und die Freund\*in, bei der er gesichert werden soll.
2. **Lokal verschlüsseln.** Crow Backup verschlüsselt jede Datei auf deinem Computer mit AES-256. Der Schlüssel dafür wird aus deinem Passwort abgeleitet und verlässt deinen Computer nie im Klartext.
3. **Übertragen.** Die verschlüsselten Daten gehen zu deiner Freund\*in, direkt oder über einen Briefkasten-Server. Dort landen sie im Ordner `.crow`, für deine Freund\*in sind es unlesbare Datenblöcke.
4. **Aktuell halten.** Sobald das erste Backup steht, erstellt Crow Backup alle 24 Stunden automatisch ein neues, sofern deine Freund\*in erreichbar ist. Du kannst jederzeit auch von Hand ein Backup starten. Dateien, die sich nicht geändert haben, werden nicht erneut übertragen.

Für das erste Backup lohnt es sich, mit einem kleinen Ordner anzufangen und beide Computer im selben Netzwerk zu lassen. So geht es am schnellsten, und du kannst gleich eine Datei zur Probe wiederherstellen.

## Verbindung zwischen euch

Crow Backup überträgt Daten nur, wenn beide Computer online sind. Wie die Verbindung zustande kommt, hängt davon ab, wo ihr seid. Wähle im Diagramm eine Verbindungsart:

{{< connection-diagram >}}

- **Direkt im selben Netzwerk.** Die Computer finden sich automatisch. Das ist die schnellste Verbindung, ideal für das erste Backup und für Wiederherstellungen.
- **Direkt über das Internet.** Wenn du oder deine Freund\*in auf dem Router eine Portweiterleitung für TCP-Port 58300 eingerichtet hat, verbinden sich die Computer direkt, egal wo ihr seid.
- **Über einen Briefkasten-Server.** Stehen beide Computer hinter einem Router ohne Portweiterleitung, kommt keine direkte Verbindung zustande. Dann legt die eine Seite die verschlüsselten Daten auf einem Briefkasten-Server ab, die andere holt sie dort ab. Das funktioniert in jedem Netzwerk; eine direkte Verbindung ist schneller. Mehr dazu auf der Seite [Briefkasten-Server](/funktionsweise/briefkasten-server/).
- **Nicht erreichbar.** Ist deine Freund\*in offline, wartet das Backup, bis ihr wieder gleichzeitig online seid.

Der farbige Punkt neben jeder Freund\*in in der App zeigt dir, was gerade gilt: Grün für eine schnelle Verbindung, Gelb oder Orange für eine Verbindung, die langsam sein kann, Rot für nicht erreichbar.

## Speicherplatz pro Freund\*in

Du legst für jede Freund\*in einzeln fest, wie viel Platz sie auf deinem Computer bekommt. In der App siehst du, wie viel davon bereits belegt ist und wie viel dir die andere Seite anbietet. Die Grenze kannst du jederzeit ändern. Bereits gespeicherte Backups bleiben erhalten, auch wenn du die Grenze unter den belegten Platz senkst. So behältst du die Kontrolle darüber, wie viel Platz Backups auf deinem Computer belegen.

Die Backups deiner Freund\*innen liegen bei dir im Ordner `.crow` in deinem Benutzerverzeichnis. Den Ort kannst du in den Einstellungen ändern.

## Wiederherstellen und Versionen

Backups sind versioniert. Du kannst einzelne Dateien oder ganze Ordner wiederherstellen und dabei eine bestimmte Version auswählen, zum Beispiel den Stand von letzter Woche. Dafür muss deine Freund\*in erreichbar sein, am schnellsten geht es im selben Netzwerk.

Du kannst Backups auch wieder löschen, ordnerweise oder alle auf einmal, wenn du eine Freundschaft beendest.

Geht dein Computer verloren, installierst du Crow Backup neu, meldest dich mit deiner E-Mail-Adresse und deinem Passwort an und stellst aus dem Backup bei deiner Freund\*in wieder her. Dein Passwort ist der einzige Schlüssel zu deinen Daten, und nur du kennst es.

## Weiterführend

- [Briefkasten-Server](/funktionsweise/briefkasten-server/): warum es ihn braucht und wie du einen eigenen betreibst.
- [Whitepaper](/whitepaper/): Verschlüsselung, Signaturen, Verbindungsaufbau und Datenhaltung im Detail.
- [FAQ](/faq/): kurze Antworten auf häufige Fragen.
- [Herunterladen](/herunterladen/): Crow Backup für Windows, macOS und Linux.
