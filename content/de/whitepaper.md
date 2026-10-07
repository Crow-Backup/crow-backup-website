{
  "title": "White Paper",
  "date": "2016-05-10T03:48:21",
  "lastmod": "2025-05-04T10:00:01",
  "url": "/whitepaper/",
  "translationKey": "2",
  "source": "https://crowbackup.ch/whitepaper/",
  "sourceId": 2,
  "description": "Crow Backup ist eine Software, mit welcher auf eine einfache und sichere Weise Backups auf den Computer von Freund*innen erstellt werden kann."
}

Crow Backup ist eine Software, mit welcher auf eine einfache und sichere Weise Backups auf den Computer von Freund\*innen erstellt werden kann.

Dazu installieren beide die [Crow Backup Client Anwendung](/herunterladen/), fügen sich gegenseitig als Freund\*in hinzu, geben sich Speicherplatz frei und können dann gegenseitig verschlüsselte Backups erstellen.

## Verschlüsselung {#_verschlüsselung}

Alle Backup-Daten werden lokal verschlüsselt und erst dann zu Freund\*innen übertragen. Die Verschlüsselung erfolgt zweistufig, aus dem Passwort wird eine "Ciphering Data" erstellt und damit dann die Dateien verschlüsselt. Die Implementierung der Algorithmen entspricht jeweils der Standard-Implementierung im [JDK von Adoptium](https://adoptium.net/), wenn nicht anders vermerkt.

### Algorithmus für die Dateien und Metadaten {#_algorithmus_für_die_dateien_und_metadaten}

Als Verschlüsselungs-Algorithmus für die Dateien und Metadaten wird `AES/CBC/PKCS5Padding` mit einer Schlüssellänge von 256 Bit verwendet. Der Schlüssel für die Verschlüsselung der Daten ist die "Ciphering Data". Damit gleiche Dateien nicht mehrmals gespeichert werden müssen, wird ein "Synthetischer Initialisierungsvektor" verwendet

#### Ciphering Data {#_ciphering_data}

Die Ciphering Data ist ein durch die offizielle Java-Klasse `javax.crypto.KeyGenerator` zufällig erstelltes Passwort. Sie ist dazu da, die Verschlüsselung der Dateien vom Passwort einer Benutzer\*in zu entkoppeln. Dieses zufällig erstellte Passwort wird bei der Registrierung generiert und danach auf der Festplatte gespeichert sowie für den Fall eines Datenverlusts auch auf einem Crow Backup Server sowie bei allen Freund\*innen verschlüsselt gespeichert.

Der Verschlüsselungs-Algorithmus der Ciphering Data ist der gleiche wie jener der Dateien, hier wird jedoch offensichtlich ein anderer Schlüssel verwendet. Der Schlüssel für die Ciphering Data ist ein `PBKDF2WithHmacSHA512`\-Hash basierend auf dem Passwort der Benutzer\*in sowie einem Salt bestehend aus dem `SHA-256`\-Hash der E-Mail-Adresse der Benutzer\*in.

#### Synthetischer Initialisierungsvektor (SIV) {#_synthetischer_initialisierungsvektor_siv}

Angelehnt an [RFC 5297](https://www.rfc-editor.org/rfc/rfc5297) wird zur Initialisierung der Verschlüsselung pro Objekt (Datei oder Metadata) ein Initialisierungsvektor generiert. Dieser SIV sollte für jedes unterschiedliche Objekt selbst unterschiedlich sein, für gleiche Objekte sollte er gleich sein. Der verwendete SIV wird folgendermassen berechnet:

-   Es wird ein `SHA-256`\-Hash der zu verschlüsselten Daten berechnet.
    
-   Dieser wird analog dem Algorithmus für die Dateien verschlüsselt, jedoch mit einem Initialisierungsvektor, welcher nur aus `0000…` besteht.
    
-   Und um "Known Plaintext" Angriffe auf den Initialisierungsvektor zu erschweren, wird von diesem verschlüsseltem Artefakt nochmals ein `SHA-256` hash gebildet
    
-   Für den endgültigen Initialisierungsvektor werden davon die ersten 16 Bytes verwendet (so viel wird benötigt).
    

Ein Nachteil dieser Methode ist, dass die Daten zweimal von der Festplatte gelesen werden müssen oder im Arbeitsspeicher zwischengespeichert. Dies ist nicht sehr performant. Die Vorteile dieser Methode überwiegen jedoch deutlich, deshalb wird dies bewusst in Kauf genommen.

### Integritätsschutz {#_integritätsschutz}

Die verschlüsselten Metadaten sowie die verschlüsselte Ciphering Data werden zusätzlich mittels Encrypt-then-MAC authentifiziert: Über Initialisierungsvektor und Chiffrat wird ein `HMAC-SHA256` gebildet, angehängt und vor der Entschlüsselung in konstanter Zeit geprüft. Der MAC-Schlüssel wird deterministisch aus dem Verschlüsselungsschlüssel abgeleitet, sodass kein zusätzliches Geheimnis gespeichert werden muss. Stimmt der MAC nicht – weil eine speichernde Person die Daten verändert hat oder der Schlüssel falsch ist – schlägt die Entschlüsselung wie bei einem falschen Passwort fehl.

Die Datei-Inhaltsblöcke werden nicht von diesem MAC abgedeckt. Stattdessen wird jeder Block über den `SHA-256`\-Hash seines verschlüsselten Inhalts adressiert, und dieser Hash wird beim Wiederherstellen des Blocks erneut überprüft. Da diese Hashes selbst Teil der authentifizierten Metadaten sind, ergibt sich daraus eine authentifizierte Wurzel mit verifizierten Blättern über alle gespeicherten Backup-Daten.

### Nachrichten Signatur {#_nachrichten_signatur}

Um sichergehen zu können, dass Nachrichten wirklich von der Freund\*in kommen (z.B. bei Nachrichten zum Löschen von Backups sehr relevant), werden die Nachrichten signiert. Die Signatur geschieht mit `SHA3-512withDSA` mit 3072 Bits. Der Private Key wird zusammen mit der Ciphering Data verschlüsselt gespeichert. Der Public Key wird zur Überprüfung der Signatur an alle Freund\*innen übertragen, sowie auch zum Server.

## Client-Server-Anmeldung {#_client_server_anmeldung}

Ausserdem meldet sich der Client auch bei einem Crow Backup Server an, um darüber die Freundschaften zu verwalten und Verbindungen zu den Freund\*innen zu finden.

Dafür wird das Passwort zweimal gehasht. Zuerst auf dem Client, daraus ergibt sich das Server-Login. Um immer das gleiche Server-Login zu erhalten, wird auf dem Client ein konstantes Salt wiederum bestehend aus dem `SHA-256`\-Hash der E-Mail-Adresse verwendet. Danach wird das Server-Login auch noch auf dem Server gehasht, um es auch dort sicher speichern zu können. Dieses Mal wird jedoch ein zufälliger Salt verwendet. Für diese beiden Hashes wird `Argon2` mit einer Implementierung von [Spring Security](https://spring.io/projects/spring-security) verwendet.

## Übertragung {#_übertragung}

Crow Backup unterstützt verschieden Arten, wie Freund\*innen Daten zueinander übertragen können. Da alle Daten komplett lokal verschlüsselt werden, muss die Übertragung nicht zusätzlich verschlüsselt werden.

### Verbindungsaufbau {#_verbindungsaufbau}

Im lokalen Netzwerk finden sich die Computer automatisch gegenseitig mit einem UDP-Broadcast. Falls das nicht klappt, werden die bekannten IP-Adressen an den Crow Backup Server geschickt und die Freund\*innen können sie von da abrufen. Danach kann Crow Backup sich mit diesen IP-Adressen verbinden, sofern die entsprechende Adresse erreichbar ist und sich nicht beispielsweise in einem anderen Netzwerk oder hinter einer Firewall befindet.

### Übertragung der Daten {#_übertragung_der_daten}

Sofern die Freund\*innen direkt erreichbar sind, werden die Daten auf TCP Port 58300 übertragen. Falls das nicht möglich ist, können die Daten auch analog einem Briefkasten auf einem Crow Backup Server in der Schweiz zwischengespeichert und von da durch Freund\*innen wieder heruntergeladen werden. Dies ist jedoch aufgrund begrenzter Ressourcen eine langsamere Variante. Es ist deshalb empfohlen, auf dem lokalen Router eine Portweiterleitung für TCP Port 58300 einzurichten.

## Datenhaltung {#_datenhaltung}

Bei der Nutzung von Crow Backup fallen verschiedene Daten an. Lokal werden diese im Benutzerverzeichnis im Unterordner `.crow` gespeichert. Primär sind dies die gespeicherten (verschlüsselten) Backups von den Freund\*innen. Ergänzend dazu fallen Metadaten von der Benutzer\*in sowie Analysedaten von Crow Backup an.

Zudem fallen auch auf den Crow Backup Servern Daten an. Falls keine direkte Verbindung zwischen den Nutzenden hergestellt werden kann, werden die verschlüsselten Backups temporär für die Übertragung auf diesen Servern gespeichert. Zudem werden auch noch weitere Metadaten, welche für den Betrieb notwendig sind, da gespeichert - wie beispielsweise die im Kapitel "Client-Server-Anmeldung" erwähnten Daten. Das Ziel ist jedoch immer so wenig Daten wie möglich, und nur so viel wie nötig zu speichern. Crow Backup nimmt den Datenschutz der Nutzenden sehr ernst. Die Crow Backup Server befinden sich daher alle in der Schweiz und die Daten werden mindestens nach Schweizer Datenschutzgesetzen verarbeitet.

## Glossar {#_glossar}

-   Argon2: Einer der modernsten Passwort-Hashing-Algorithmen.
    
-   AES: "Advanced Encryption Standard", eines der heute meistverwendeten symmetrischen Verschlüsselungsverfahren.
    
-   CBC: "Cipher Block Chaining", eine Methode zur Verknüpfung von Blöcken in einer Verschlüsselung.
    
-   DSA: DSAs sind standardisierte Verfahren zur asynchronen Signatur von Daten mittels einem öffentlichen sowie einem privaten Schlüssel (siehe Public-/Private-Key).
    
-   Freund\*in: Vertrauenswürdige Person, bei welcher ein\*e Benutzer\*in die Backups speichern kann.
    
-   Hash: Algorithmus, welcher zum Verschlüsseln von Passwörtern verwendet werden kann und im Prinzip nicht rückgängig gemacht werden kann.
    
-   Java: Eine der heute meistverwendeten Programmiersprachen.
    
-   MAC: "Message Authentication Code", eine kurze Prüfsumme, welche Daten authentifiziert, sodass Manipulationen erkannt werden; HMAC ist ein Hash-basierter MAC.
    
-   PBKDF2: "Password-Based Key Derivation Function 2", eine der heute meistverwendeten Verfahren, um aus einem Passwort einen Schlüssel für symmetrische Verschlüsselung abzuleiten.
    
-   Private Key: Dies ist der geheime Teil des Public-/Private-Key Schlüsselpaars und wird zur Signatur von Daten verwendet.
    
-   Public Key: Dies ist der öffentliche Teil des Public-/Private-Key Schlüsselpaars und wird zur Überprüfung von Signaturen verwendet.
    
-   Salt: Meist zufällige Zeichenfolge, welche einem Passwort angehängt wird, um es schwieriger knackbar zu machen.
    
-   SHA: "Secure Hash Algorithm", einer der heute meistverwendeten Hashing-Algorithmen.
    
-   TCP: "Transmission Control Protocol", ein verbindungsorientiertes Netzwerkprotokoll.
    
-   UDP: "User Datagram Protocol", ein verbindungsloses Netzwerkprotokoll.
