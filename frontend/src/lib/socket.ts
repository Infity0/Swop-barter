import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(): Socket {
  const token = localStorage.getItem('accessToken')
  if (socket) {
    if (socket.connected) return socket
    socket.disconnect()
  }
  socket = io('/chat', {
    auth: { token },
    transports: ['websocket'],
  })
  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
