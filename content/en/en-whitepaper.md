{
  "title": "White Paper",
  "date": "2016-05-10T03:48:21",
  "lastmod": "2025-05-04T10:05:02",
  "url": "/en/en-whitepaper/",
  "translationKey": "2",
  "source": "https://crowbackup.ch/en/en-whitepaper/",
  "sourceId": 184,
  "description": "Crow Backup is software that enables simple and secure backup creation on friends' computers."
}

Crow Backup is software that enables simple and secure backup creation on friends' computers.

Both parties install the [Crow Backup Client application](/en/download/), add each other as friends, allocate storage space, and can then create encrypted backups reciprocally.

## Encryption {#_encryption}

All backup data is encrypted locally before being transferred to friends. Encryption occurs in two stages: from the password, "Ciphering Data" is created and then used to encrypt the files. Algorithm implementations correspond to the standard implementation in [Adoptium JDK](https://adoptium.net/) unless otherwise noted.

### Algorithm for Files and Metadata {#_algorithm_for_files_and_metadata}

The encryption algorithm for files and metadata uses `AES/CBC/PKCS5Padding` with a 256-bit key length. The encryption key is the "Ciphering Data". A "Synthetic Initialization Vector" is used to prevent duplicate storage of identical files.

#### Ciphering Data {#_ciphering_data}

The Ciphering Data is a randomly generated password created using Java’s official `javax.crypto.KeyGenerator` class. It serves to decouple file encryption from a user’s password. This randomly generated password is created during registration and stored on disk, plus for the case of data loss, encrypted and stored on a Crow Backup Server and with all friends.

The encryption algorithm for Ciphering Data is the same as for files, but obviously uses a different key. The Ciphering Data key is a `PBKDF2WithHmacSHA512` hash based on the user’s password and a salt consisting of the `SHA-256` hash of the user’s email address.

#### Synthetic Initialization Vector (SIV) {#_synthetic_initialization_vector_siv}

Following [RFC 5297](https://www.rfc-editor.org/rfc/rfc5297), an initialisation vector is generated for each object (file or metadata). This SIV should be different for different objects and identical for identical objects. The SIV is calculated as follows:

-   An `SHA-256` hash of the data to be encrypted is calculated.
    
-   This is encrypted according to the file encryption algorithm but with an IV consisting entirely of `0000…`.
    
-   To prevent "Known Plaintext" attacks on the initialisation vector, another `SHA-256` hash is formed
    
-   The final initialisation vector uses the first 16 bytes (as required).
    

One drawback of this method is that the data must be read twice from disk or cached in memory. This is not very performant. However, the advantages outweigh this limitation, so it is deliberately accepted.

### Integrity Protection {#_integrity_protection}

The encrypted metadata and the encrypted Ciphering Data are additionally authenticated using Encrypt-then-MAC: an `HMAC-SHA256` over the initialisation vector and the ciphertext is appended and verified in constant time before decryption. The MAC key is derived deterministically from the encryption key, so no additional secret needs to be stored. If the MAC does not match – because a storer tampered with the data or the key is wrong – decryption fails just like with a wrong password.

File content blocks are not covered by this MAC. Instead, each block is content-addressed by the `SHA-256` hash of its encrypted content, and this hash is re-checked when the block is restored. Because those hashes are themselves part of the authenticated metadata, this yields an authenticated root with verified leaves over all stored backup data.

### Message Signature {#_message_signature}

Messages are signed to ensure they genuinely come from friends (especially important for backup deletion messages). Signatures use `SHA3-512withDSA` with 3072 bits. The Private Key is stored encrypted along with the Ciphering Data. The Public Key is transmitted to all friends and the server so they can validate the messages.

## Client-Server Login {#_client_server_login}

Additionally, the client logs into a Crow Backup Server to manage friendships and find connections to friends.

For this purpose, the password is hashed twice. First on the client, resulting in the server login. To always get the same server login, a constant salt consisting of the `SHA-256` hash of the email address is used on the client. Afterwards, the server login is also hashed on the server to securely store it there. This time, however, a random salt is used. Both hashes use `Argon2` with [Spring Security](https://spring.io/projects/spring-security) implementation.

## Transfer {#_transfer}

Crow Backup supports various ways friends can transfer data to each other. Since all data is completely encrypted locally, transmission does not require additional encryption.

### Connection Establishment {#_connection_establishment}

Computers automatically discover each other in local networks using UDP broadcast. If this fails, the known IP addresses are sent to the Crow Backup Server and friends can retrieve them from there. Crow Backup can then connect using these IP addresses, provided the address is accessible and not, for example, located behind a firewall or in a different network.

### Data Transfer {#_data_transfer}

If friends are directly reachable, data is transferred on TCP port 58300. If this is not possible, data can be temporarily stored on a Crow Backup Server in Switzerland and downloaded by friends from there. But this is slower due to limited resources. Therefore, it is recommended to set up port forwarding for TCP port 58300 on the local router.

## Data Storage {#_data_storage}

Various data is generated during Crow Backup usage. Locally, this is stored in the user directory in the `.crow` subfolder. Primarily, these are the stored (encrypted) backups from friends. Additionally, user metadata and Crow Backup analysis data accumulate.

Data also accumulates on Crow Backup servers. If direct connection between users cannot be established, encrypted backups are temporarily stored on these servers for transfer. Additional metadata necessary for operation are also stored there - such as the data mentioned in the "Client-Server Login" chapter. The goal is to store as little data as possible, only what is necessary. Crow Backup takes user data protection very seriously. Therefore, all Crow Backup servers are located in Switzerland and data is processed according to Swiss data protection laws.

## Glossary {#_glossary}

-   Argon2: One of the most modern password hashing algorithms.
    
-   AES: "Advanced Encryption Standard", one of today’s most widely used symmetric encryption methods.
    
-   CBC: "Cipher Block Chaining", a method for linking blocks in encryption.
    
-   DSA: DSAs are standardised procedures for asynchronous data signing using public and private keys (see Public-/Private-Key).
    
-   Friend: A trusted person where a user can store backups.
    
-   Hash: Algorithm used for password encryption that cannot be reversed in principle.
    
-   Java: One of today’s most widely used programming languages.
    
-   MAC: "Message Authentication Code", a short tag that authenticates data so that tampering is detected; HMAC is a hash-based MAC.
    
-   PBKDF2: "Password-Based Key Derivation Function 2", one of today’s most widely used methods for deriving symmetric encryption keys from passwords.
    
-   Private Key: This is the secret part of the Public-/Private-Key key pair and is used for signing data.
    
-   Public Key: This is the public part of the Public-/Private-Key key pair and is used for verifying signatures.
    
-   Salt: Usually random character string added to passwords to make them harder to crack.
    
-   SHA: "Secure Hash Algorithm", one of today’s most widely used hashing algorithms.
    
-   TCP: "Transmission Control Protocol", a connection-oriented network protocol.
    
-   UDP: "User Datagram Protocol", a connectionless network protocol.
