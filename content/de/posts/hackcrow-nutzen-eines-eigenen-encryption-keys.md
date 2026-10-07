{
  "title": "#HackCrow: Nutzen eines eigenen Encryption Keys",
  "date": "2025-08-06T18:27:41",
  "lastmod": "2025-08-06T18:53:29",
  "url": "/hackcrow-nutzen-eines-eigenen-encryption-keys/",
  "translationKey": "558",
  "source": "https://crowbackup.ch/hackcrow-nutzen-eines-eigenen-encryption-keys/",
  "sourceId": 558,
  "cover": "/wp-content/uploads/2025/08/Nutzen-einen-eigenen-Verschluesselungsschluessel.jpeg",
  "coverAlt": "Nutzen einen eigenen Verschlüsselungsschlüssel",
  "coverWidth": 1024,
  "coverHeight": 1024,
  "type": "posts",
  "categories": [
    9
  ],
  "tags": [],
  "description": "Dieser Artikel ist der erste Artikel einer neuen Serie «Hack Crow», mit welcher wir Möglichkeiten vorstellen wollen, wie man Crow Backup auf eine spezielle Art und Weise nutzen kan"
}

Dieser Artikel ist der erste Artikel einer neuen Serie "Hack Crow", mit welcher wir Möglichkeiten vorstellen wollen, wie man Crow Backup auf eine spezielle Art und Weise nutzen kann. Diese sind jedoch nicht als "normale" Nutzung gedacht, deshalb nicht offiziell unterstützt - sollten aber grundsätzlich funktionieren. Ausserdem sind sie eher für fortgeschrittene Nutzer\*innen gedacht, die sich mit der Materie auskennen.

## Einleitung {#_einleitung}

Crow Backup nutzt einen Verschlüsselungsschlüssel, um die Daten und Metadaten zu verschlüsseln. Damit er nicht verloren geht, wird er nicht nur lokal gespeichert, sondern auch verschlüsselt bei allen Freund\*innen und auf dem Crow Backup Server.

## Vorbereitung {#_vorbereitung}

Da der Verschlüsselungsschlüssel alle Backups verschlüsselt, dürfen vor dem Erstellen eines neuen Verschlüsselungsschlüssels keine Backups existieren.

1.  Entferne alle deine Backups aus Crow Backup
    
2.  Beende Crow Backup (auch im Tray Icon!)
    

Gekoppelt an dem Verschlüsselungsschlüssel ist auch ein Public-/Private-Key-Paar, welches für die Signatur der Nachrichten an Freund\*innen verwendet wird. Zumindest mit dieser Anleitung wird auch ein neues Public-/Private-Key-Paar generiert. **Alle deine Freund\*innen** müssen deshalb deinen Public-Key "vergessen". Sie können deshalb beispielsweise:

-   Crow Backup beenden (auch im Tray Icon!)
    
-   Die Datei `~/.crow/public-keys.mv.db` löschen
    

## Erstellen eines neuen Verschlüsselungsschlüssels {#_erstellen_eines_neuen_verschlüsselungsschlüssels}

Der Verschlüsselungsschlüssel liegt lokal in der Datei `~/.crow/ciphering-data-DEIN-NAME@DEIN-MAIL.CH.bin`. Diese enthält den Verschlüsselungsschlüssel, sowie ein Public-/Private-Key-Paar zur Signatur deiner Nachrichten. Um sie neu zu erstellen, kannst du folgende Java-Klasse als Ausgangspunkt verwenden:

```
import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.InvalidParameterSpecException;
import java.security.spec.KeySpec;
import java.text.MessageFormat;
import java.util.Base64;
import java.util.zip.Deflater;
import java.util.zip.DeflaterInputStream;

public class StandaloneCipheringDataCreator {

    private final String mail;
    private final char[] password;

    static void main(String[] args) throws Exception {
        String mail = args[0];
        var cipheringDataCreator = new StandaloneCipheringDataCreator(mail, args[1].toCharArray());
        byte[] cipheringData = cipheringDataCreator.createCipheringData(
            StandaloneCipheringDataCreator.generateRandomKey(),
            StandaloneCipheringDataCreator.generateRandomPublicPrivateKeyPair()
        );
        Files.write(Path.of(System.getProperty("user.home"), ".crow", "ciphering-data-" + mail + ".bin"), cipheringData);
    }

    public StandaloneCipheringDataCreator(String mail, char[] password) {
        this.mail = mail;
        this.password = password;
    }

    public static KeyPair generateRandomPublicPrivateKeyPair() throws NoSuchAlgorithmException {
        SecureRandom secureRandom = SecureRandom.getInstanceStrong();
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("DSA");
        keyGen.initialize(3072, secureRandom);
        return keyGen.generateKeyPair();
    }

    public static SecretKey generateRandomKey() throws NoSuchAlgorithmException {
        KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
        keyGenerator.init(256);
        return keyGenerator.generateKey();
    }

    public byte[] createCipheringData(SecretKey encryptionKey, KeyPair publicAndPrivateKey) throws Exception {
        byte[] unencrypted = MessageFormat.format("""
                '{'
                  "encryptionKey" : "{0}",
                  "encryptionKeyAlgorithm" : "AES",
                  "signingPublicKey" : "{1}",
                  "signingPrivateKey" : "{2}",
                  "signingStrategy" : 116
                '}'""",
            encodeBase64(encryptionKey.getEncoded()),
            encodeBase64(publicAndPrivateKey.getPublic().getEncoded()),
            encodeBase64(publicAndPrivateKey.getPrivate().getEncoded())).getBytes();

        byte[] encryptedData = encrypt(unencrypted);

        return MessageFormat.format("""
            '{'
              "data" : "{0}",
              "encryptionType" : 100
            '}'""", encodeBase64(encryptedData)).getBytes();
    }

    private byte[] encrypt(byte[] unencrypted) throws IOException, InvalidParameterSpecException, NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, InvalidKeySpecException {
        SecretKey key = createKey();
        byte[] data = new DeflaterInputStream(new ByteArrayInputStream(unencrypted), new Deflater(Deflater.BEST_COMPRESSION)).readAllBytes();
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);

        byte[] iv = cipher.getParameters().getParameterSpec(IvParameterSpec.class).getIV();
        byte[] encryptedData = new CipherInputStream(new ByteArrayInputStream(data), cipher).readAllBytes();
        byte[] joined = new byte[iv.length + encryptedData.length];
        System.arraycopy(iv, 0, joined, 0, iv.length);
        System.arraycopy(encryptedData, 0, joined, iv.length, encryptedData.length);
        return joined;
    }

    private SecretKey createKey() throws NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] salt = MessageDigest.getInstance("SHA-256").digest(mail.getBytes(StandardCharsets.UTF_8));

        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
        KeySpec spec = new PBEKeySpec(password, salt, 65536, 256);
        SecretKey secretKey = factory.generateSecret(spec);
        return new SecretKeySpec(secretKey.getEncoded(), "AES");
    }

    static String encodeBase64(byte[] raw) {
        return Base64.getEncoder().encodeToString(raw);
    }
}
```

3.  Bevor du die Klasse ausführst, solltest du ein Backup deiner `~/.crow/ciphering-data-DEIN-NAME@DEIN-MAIL.CH.bin` machen und die Datei danach löschen
    
4.  Nun kannst du die Klasse nach Belieben anpassen und beispielsweise folgendermassen ausführen:
    
    ```
    java StandaloneCipheringDataCreator.java "dein-name@dein-mail.ch" "dein-passwort"
    ```
    
5.  Stelle sicher, dass die Datei geschrieben wurde
    
6.  Starte nun Crow Backup wieder und erstelle neue Backups mit deinem neuen Verschlüsselungsschlüssel 🧑‍💻
