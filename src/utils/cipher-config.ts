interface CipherConfig {
   strongCiphers: string[];
   weakCiphers: string[];
   minTLSVersion: string;
 }
 
 export const cipherConfig: CipherConfig = {
   strongCiphers: [
     'TLS_AES_256_GCM_SHA384',
     'TLS_CHACHA20_POLY1305_SHA256',
     'TLS_AES_128_GCM_SHA256',
     
     'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
     'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
     'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
     'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
     'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
     'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256'
   ],
   
   weakCiphers: [
     'TLS_RSA_WITH_AES_256_GCM_SHA384',
     'TLS_RSA_WITH_AES_128_GCM_SHA256',
     'TLS_RSA_WITH_AES_256_CBC_SHA256',
     'TLS_RSA_WITH_AES_128_CBC_SHA256',
     'TLS_RSA_WITH_AES_256_CBC_SHA',
     'TLS_RSA_WITH_AES_128_CBC_SHA',
     
     'TLS_RSA_WITH_3DES_EDE_CBC_SHA',
     'TLS_RSA_WITH_RC4_128_SHA',
     'TLS_RSA_WITH_RC4_128_MD5'
   ],
   
   minTLSVersion: 'TLSv1.2'
 };