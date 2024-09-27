const { DisconnectReason, makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const { Boom } = require('@hapi/boom')
const fs = require("fs");

async function connectToWhatsApp () {

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket({
        // can provide additional config here
        auth: state,
        printQRInTerminal: true
    })
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', async m => {
        console.log(JSON.stringify(m, undefined, 2))

        if(!m.messages[0].key.fromMe){

            console.log('replying to', m.messages[0].key.remoteJid)
            await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Hola Soy un BOT!' })
            
            // enviando texto
            const id = m.messages[0].key.remoteJid;
            const sentMsg  = await sock.sendMessage(id, { text: 'Hola Mundo' });

            // const sentMsg2  = await sock.sendMessage(id, { text: 'Respuesta' }, { quoted: "Hola..." })
            // send a mentions message
            const sentMsg3  = await sock.sendMessage(id, { text: '@59173277937', mentions: ['59173277937@s.whatsapp.net'] })

            const sentMsg4  = await sock.sendMessage(
                id, 
                { location: { degreesLatitude: 24.121231, degreesLongitude: 55.1121221 } }
            )

            // send a contact!
                const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
                + 'VERSION:3.0\n' 
                + 'FN:Jeff Singh\n' // full name
                + 'ORG:Ashoka Uni;\n' // the organization of the contact
                + 'TEL;type=CELL;type=VOICE;waid=911234567890:+91 12345 67890\n' // WhatsApp ID + phone number
                + 'END:VCARD'

                const sentMsg5  = await sock.sendMessage(id, { contacts: { displayName: 'Jeff', contacts: [{ vcard }]}})

                const reactionMessage = {
                    react: {
                        text: "💖", // use an empty string to remove the reaction
                        key: "3EB0D2D5893A0672DB2CA0"
                    }
                }
                
                // const sendMsg = await sock.sendMessage(id, reactionMessage)

                await sock.sendMessage(
                    id, 
                    { 
                        video: fs.readFileSync("./Media/ma_gif.mp4"), 
                        caption: "Hola este es un Gif \nAnimado de prueba!",
                        gifPlayback: true
                    }
                )

                await sock.sendMessage(
                    id, 
                    { 
                        video: fs.readFileSync("./Media/ma_gif.mp4"), 
                        caption: "Hola!",
                        gifPlayback: true,
                    ptv: false // if set to true, will send as a `video note`
                    }
                )

                await sock.sendMessage(
                    id, 
                    { audio: { url: "./Media/sonata.mp3" } }
                    // { url: fs.readFileSync("./Media/sonata.mp3") }, // can send mp3, mp4, & ogg
                )

                await sock.sendMessage(
                    id, 
                    { 
                        image: {
                            url: "https://img.freepik.com/vector-gratis/vector-degradado-logotipo-colorido-pajaro_343694-1365.jpg?size=338&ext=jpg&ga=GA1.1.2008272138.1727308800&semt=ais_hybrid"
                        }, 
                        caption: "Hola!"
                    }
                )

        }

    })



    sock.ev.on ('creds.update', saveCreds)
}
// run in main file
connectToWhatsApp()