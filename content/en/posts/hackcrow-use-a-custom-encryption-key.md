{
  "title": "#HackCrow: Use a Custom Encryption Key",
  "date": "2025-08-06T18:27:41",
  "lastmod": "2025-08-06T18:35:38",
  "url": "/en/hackcrow-use-a-custom-encryption-key/",
  "translationKey": "558",
  "source": "https://crowbackup.ch/en/hackcrow-use-a-custom-encryption-key/",
  "sourceId": 561,
  "cover": "/wp-content/uploads/2025/08/Nutzen-einen-eigenen-Verschluesselungsschluessel.jpeg",
  "coverAlt": "Nutzen einen eigenen Verschlüsselungsschlüssel",
  "coverWidth": 1024,
  "coverHeight": 1024,
  "type": "posts",
  "categories": [
    1
  ],
  "tags": [],
  "description": "This article is the first in a new series “Hack Crow”, in which we want to present ways to use Crow Backup in special ways. However, these are not intended as “normal” usage, so th"
}

This article is the first in a new series "Hack Crow", in which we want to present ways to use Crow Backup in special ways. However, these are not intended as "normal" usage, so they are not officially supported — but they should generally work. They are also intended more for advanced users who are familiar with the subject.

## Introduction {#_introduction}

Crow Backup uses an encryption key to encrypt the data and metadata. To prevent it from being lost, it is not only stored locally but also in an encrypted form with all friends and on the Crow Backup server.

## Preparation {#_preparation}

Since the encryption key encrypts all backups, there must be no backups before creating a new encryption key.

1.  Remove all your backups from Crow Backup
    
2.  Exit Crow Backup (also from the tray icon!)
    

A public/private key pair is also linked to the encryption key, which is used to sign messages to friends. At least with this guide, a new public/private key pair will also be generated. **All your friends** must therefore "forget" your public key. For example, they can:

-   Exit Crow Backup (also from the tray icon!)
    
-   Delete the file `~/.crow/public-keys.mv.db`
    

## Creating a New Encryption Key {#_creating_a_new_encryption_key}

The encryption key is stored locally in the file `~/.crow/ciphering-data-YOUR-NAME@YOUR-EMAIL.CH.bin`. This contains the encryption key as well as a public/private key pair for signing your messages. To recreate it, you can use the following Java class as a starting point:

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

3.  Before running the class, you should back up your `~/.crow/ciphering-data-YOUR-NAME@YOUR-EMAIL.CH.bin` and then delete the file
    
4.  Now you can adjust the class as desired and, for example, run it as follows:
    
    ```
    java StandaloneCipheringDataCreator.java "your-name@your-email.ch" "your-password"
    ```
    
5.  Make sure the file was written
    
6.  Now restart Crow Backup and create new backups with your new encryption key 🧑‍💻
